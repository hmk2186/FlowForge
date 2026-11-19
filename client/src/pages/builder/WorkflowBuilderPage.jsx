import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { Loader2 } from 'lucide-react';

import { useWorkflowBuilder } from '../../context/WorkflowBuilderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { workflowService } from '../../services/workflowService';

import TriggerNode from '../../features/builder/nodes/TriggerNode';
import ActionNode from '../../features/builder/nodes/ActionNode';
import ConditionNode from '../../features/builder/nodes/ConditionNode';
import DelayNode from '../../features/builder/nodes/DelayNode';
import WebhookNode from '../../features/builder/nodes/WebhookNode';

import BuilderToolbar from '../../features/builder/components/BuilderToolbar';
import NodeSidebar from '../../features/builder/components/NodeSidebar';
import NodeConfigDrawer from '../../features/builder/components/NodeConfigDrawer';
import ExecutionModal from '../../features/builder/components/ExecutionModal';
import AuthConversionModal from '../../features/builder/components/AuthConversionModal';
import { STARTER_TEMPLATES } from '../../features/builder/utils/starterTemplates';

// Custom node registry for React Flow
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
};

const WorkflowBuilderContent = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { success, error, info } = useToast();
  const reactFlowInstance = useReactFlow();

  // Guest mode determination
  const isGuest = !id || id === 'guest' || location.pathname === '/builder';

  const {
    nodes,
    edges,
    workflowName,
    workflowDescription,
    selectedNode,
    setWorkflow,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    deleteNode,
    setSaving,
  } = useWorkflowBuilder();

  const [loading, setLoading] = useState(true);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionReason, setConversionReason] = useState('cloud_save');
  const reactFlowWrapper = useRef(null);

  // Initialize or Fetch workflow
  useEffect(() => {
    const initializeWorkflow = async () => {
      setLoading(true);

      // GUEST MODE INITIALIZATION
      if (isGuest) {
        const templateId = searchParams.get('template');
        if (templateId) {
          const foundTemplate = STARTER_TEMPLATES.find((t) => t.id === templateId);
          if (foundTemplate) {
            setWorkflow({
              id: 'guest_template',
              name: foundTemplate.name,
              description: foundTemplate.description,
              status: 'draft',
              nodes: foundTemplate.nodes,
              edges: foundTemplate.edges,
            });
            info(`Loaded template: "${foundTemplate.name}"`);
            setLoading(false);
            return;
          }
        }

        // Check if user has an existing saved guest workflow in localStorage
        try {
          const localSaved = localStorage.getItem('flowforge_guest_workflow');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setWorkflow({
              id: 'guest_local',
              name: parsed.name || 'My Guest Workflow',
              description: parsed.description || '',
              status: 'draft',
              nodes: parsed.nodes || [],
              edges: parsed.edges || [],
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[Guest Storage] Failed to restore local workflow:', e);
        }

        // Default blank starter workflow for guest
        setWorkflow({
          id: 'guest_new',
          name: 'My Guest Workflow',
          description: 'Created in guest mode (stored locally in browser)',
          status: 'draft',
          nodes: [
            {
              id: 'node_trigger_guest',
              type: 'trigger',
              position: { x: 250, y: 100 },
              data: {
                label: 'Manual Trigger',
                triggerType: 'manual',
                payload: JSON.stringify(
                  { event: 'guest_demo', sampleData: 'Welcome to FlowForge!' },
                  null,
                  2
                ),
              },
            },
          ],
          edges: [],
        });
        setLoading(false);
        return;
      }

      // AUTHENTICATED MODE INITIALIZATION: Fetch from MongoDB API
      try {
        const res = await workflowService.getWorkflowById(id);
        setWorkflow(res.data.workflow);
      } catch (err) {
        error(`Failed to load workflow: ${err.message}`);
        navigate('/workflows');
      } finally {
        setLoading(false);
      }
    };

    initializeWorkflow();
  }, [id, isGuest, searchParams, setWorkflow, error, info, navigate]);

  // Local Save Handler for Guest Mode
  const handleSaveLocal = useCallback(() => {
    try {
      const guestData = {
        name: workflowName || 'My Guest Workflow',
        description: workflowDescription || '',
        nodes,
        edges,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('flowforge_guest_workflow', JSON.stringify(guestData));
      success('Workflow saved locally in browser!');
    } catch (err) {
      error(`Failed to save locally: ${err.message}`);
    }
  }, [workflowName, workflowDescription, nodes, edges, success, error]);

  // Trigger Conversion Modal
  const openConversionModal = (reason = 'cloud_save') => {
    setConversionReason(reason);
    setIsConversionModalOpen(true);
  };

  // Handle Drag & Drop of new nodes onto canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const rawData = event.dataTransfer.getData('application/reactflow-data');

      if (!type) return;

      let data = {};
      try {
        data = rawData ? JSON.parse(rawData) : {};
      } catch {
        data = {};
      }

      // Project mouse client coordinates into React Flow canvas plane
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${type}_${Date.now()}`,
        type,
        position,
        data,
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  // Handle Node clicks
  const onNodeClick = useCallback(
    (_, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Handle Delete key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          if (selectedNode) {
            deleteNode(selectedNode.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteNode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 select-none">
      {/* Top Toolbar */}
      <BuilderToolbar
        isGuest={isGuest}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.2 })}
        onOpenExecutionModal={() => setIsExecutionModalOpen(true)}
        onOpenConversionModal={openConversionModal}
        onSaveLocal={handleSaveLocal}
      />

      {/* Main Builder Body: Sidebar + Canvas + Config Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Node Sidebar */}
        <NodeSidebar />

        {/* Center Main React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            deleteKeyCode={['Backspace', 'Delete']}
            className="bg-slate-50 dark:bg-slate-950"
          >
            <Controls className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !shadow-lg" />
            <MiniMap
              nodeStrokeColor={isDark ? '#475569' : '#cbd5e1'}
              nodeColor={isDark ? '#1e293b' : '#f8fafc'}
              className="!bg-white/80 dark:!bg-slate-900/80 !border-slate-200 dark:!border-slate-800 rounded-xl"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1.5}
              color={isDark ? '#334155' : '#cbd5e1'}
            />
          </ReactFlow>
        </div>

        {/* Right Node Configuration Slide-Over Drawer */}
        <NodeConfigDrawer />
      </div>

      {/* Live Execution Test Modal (Supports real & demo simulation) */}
      <ExecutionModal
        isOpen={isExecutionModalOpen}
        onClose={() => setIsExecutionModalOpen(false)}
        isGuest={isGuest}
        onOpenConversionModal={openConversionModal}
      />

      {/* Login Conversion Modal */}
      <AuthConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        triggerReason={conversionReason}
      />
    </div>
  );
};

const WorkflowBuilderPage = () => (
  <ReactFlowProvider>
    <WorkflowBuilderContent />
  </ReactFlowProvider>
);

export default WorkflowBuilderPage;
