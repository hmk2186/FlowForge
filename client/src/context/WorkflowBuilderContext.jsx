import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const WorkflowBuilderContext = createContext();

const initialState = {
  workflowId: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  workflowStatus: 'draft',
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  validationErrors: [],
  validationWarnings: [],
  isSaving: false,
  isValidating: false,
  isExecuting: false,
  activeExecution: null,
};

function builderReducer(state, action) {
  switch (action.type) {
    case 'SET_WORKFLOW': {
      const { workflow } = action.payload;
      return {
        ...state,
        workflowId: workflow._id || workflow.id,
        workflowName: workflow.name || 'Untitled Workflow',
        workflowDescription: workflow.description || '',
        workflowStatus: workflow.status || 'draft',
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        selectedNode: null,
        isDirty: false,
        validationErrors: [],
        validationWarnings: [],
      };
    }

    case 'SET_NODES': {
      const updatedNodes = applyNodeChanges(action.payload, state.nodes);
      // If currently selected node was modified, sync selectedNode
      let updatedSelected = state.selectedNode;
      if (state.selectedNode) {
        updatedSelected = updatedNodes.find((n) => n.id === state.selectedNode.id) || null;
      }

      return {
        ...state,
        nodes: updatedNodes,
        selectedNode: updatedSelected,
        isDirty: true,
      };
    }

    case 'SET_EDGES': {
      return {
        ...state,
        edges: applyEdgeChanges(action.payload, state.edges),
        isDirty: true,
      };
    }

    case 'ON_CONNECT': {
      return {
        ...state,
        edges: addEdge({ ...action.payload, animated: true }, state.edges),
        isDirty: true,
      };
    }

    case 'ADD_NODE': {
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        selectedNode: action.payload,
        isDirty: true,
      };
    }

    case 'SELECT_NODE': {
      const node = action.payload
        ? state.nodes.find((n) => n.id === action.payload) || null
        : null;
      return {
        ...state,
        selectedNode: node,
      };
    }

    case 'UPDATE_NODE_DATA': {
      const { nodeId, data } = action.payload;
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      });

      const updatedSelected = updatedNodes.find((n) => n.id === nodeId) || null;

      return {
        ...state,
        nodes: updatedNodes,
        selectedNode: updatedSelected,
        isDirty: true,
      };
    }

    case 'DELETE_NODE': {
      const nodeId = action.payload;
      const updatedNodes = state.nodes.filter((n) => n.id !== nodeId);
      const updatedEdges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

      return {
        ...state,
        nodes: updatedNodes,
        edges: updatedEdges,
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
        isDirty: true,
      };
    }

    case 'SET_WORKFLOW_NAME': {
      return {
        ...state,
        workflowName: action.payload,
        isDirty: true,
      };
    }

    case 'SET_WORKFLOW_DESCRIPTION': {
      return {
        ...state,
        workflowDescription: action.payload,
        isDirty: true,
      };
    }

    case 'SET_WORKFLOW_STATUS': {
      return {
        ...state,
        workflowStatus: action.payload,
        isDirty: true,
      };
    }

    case 'SET_VALIDATION': {
      return {
        ...state,
        validationErrors: action.payload.errors || [],
        validationWarnings: action.payload.warnings || [],
        isValidating: false,
      };
    }

    case 'SET_SAVING': {
      return {
        ...state,
        isSaving: action.payload,
        ...(action.payload === false && { isDirty: false }),
      };
    }

    case 'SET_EXECUTING': {
      return {
        ...state,
        isExecuting: action.payload.isExecuting,
        activeExecution: action.payload.execution || state.activeExecution,
      };
    }

    default:
      return state;
  }
}

export const WorkflowBuilderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const setWorkflow = useCallback((workflow) => {
    dispatch({ type: 'SET_WORKFLOW', payload: { workflow } });
  }, []);

  const onNodesChange = useCallback((changes) => {
    dispatch({ type: 'SET_NODES', payload: changes });
  }, []);

  const onEdgesChange = useCallback((changes) => {
    dispatch({ type: 'SET_EDGES', payload: changes });
  }, []);

  const onConnect = useCallback((connection) => {
    dispatch({ type: 'ON_CONNECT', payload: connection });
  }, []);

  const addNode = useCallback((node) => {
    dispatch({ type: 'ADD_NODE', payload: node });
  }, []);

  const selectNode = useCallback((nodeId) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
  }, []);

  const updateNodeData = useCallback((nodeId, data) => {
    dispatch({ type: 'UPDATE_NODE_DATA', payload: { nodeId, data } });
  }, []);

  const deleteNode = useCallback((nodeId) => {
    dispatch({ type: 'DELETE_NODE', payload: nodeId });
  }, []);

  const setWorkflowName = useCallback((name) => {
    dispatch({ type: 'SET_WORKFLOW_NAME', payload: name });
  }, []);

  const setWorkflowDescription = useCallback((desc) => {
    dispatch({ type: 'SET_WORKFLOW_DESCRIPTION', payload: desc });
  }, []);

  const setWorkflowStatus = useCallback((status) => {
    dispatch({ type: 'SET_WORKFLOW_STATUS', payload: status });
  }, []);

  const setValidation = useCallback((validationResult) => {
    dispatch({ type: 'SET_VALIDATION', payload: validationResult });
  }, []);

  const setSaving = useCallback((isSaving) => {
    dispatch({ type: 'SET_SAVING', payload: isSaving });
  }, []);

  const setExecuting = useCallback((isExecuting, execution = null) => {
    dispatch({ type: 'SET_EXECUTING', payload: { isExecuting, execution } });
  }, []);

  return (
    <WorkflowBuilderContext.Provider
      value={{
        ...state,
        setWorkflow,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        selectNode,
        updateNodeData,
        deleteNode,
        setWorkflowName,
        setWorkflowDescription,
        setWorkflowStatus,
        setValidation,
        setSaving,
        setExecuting,
      }}
    >
      {children}
    </WorkflowBuilderContext.Provider>
  );
};

export const useWorkflowBuilder = () => {
  const context = useContext(WorkflowBuilderContext);
  if (!context) {
    throw new Error('useWorkflowBuilder must be used within a WorkflowBuilderProvider');
  }
  return context;
};
