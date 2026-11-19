import React, { useState } from 'react';
import {
  PlayCircle,
  Zap,
  GitBranch,
  Clock,
  Webhook,
  Search,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { useWorkflowBuilder } from '../../../context/WorkflowBuilderContext';

const NODE_CATALOG = [
  {
    type: 'trigger',
    title: 'Trigger',
    category: 'Core',
    description: 'Starting point of workflow execution. Receives initial payload.',
    icon: PlayCircle,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60',
    accent: 'bg-cyan-500',
    defaultData: {
      label: 'Manual Trigger',
      triggerType: 'manual',
      payload: JSON.stringify({ event: 'manual_run', timestamp: new Date().toISOString() }, null, 2),
    },
  },
  {
    type: 'action',
    title: 'Action',
    category: 'Logic',
    description: 'Perform tasks: Log message, Create TaskRecord in DB, HTTP, or Transform.',
    icon: Zap,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    accent: 'bg-emerald-500',
    defaultData: {
      label: 'Log Message',
      actionType: 'log',
      logMessage: 'Processing item {{data.id}}',
    },
  },
  {
    type: 'condition',
    title: 'Condition',
    category: 'Logic',
    description: 'Branch execution paths using IF/ELSE rules (True vs False).',
    icon: GitBranch,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    accent: 'bg-amber-500',
    defaultData: {
      label: 'Check Value',
      variable: 'data.status',
      operator: 'equals',
      value: 'active',
    },
  },
  {
    type: 'delay',
    title: 'Delay',
    category: 'Timing',
    description: 'Pause execution for seconds or minutes before proceeding.',
    icon: Clock,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    accent: 'bg-purple-500',
    defaultData: {
      label: 'Wait 5s',
      duration: 5,
      unit: 'seconds',
    },
  },
  {
    type: 'webhook',
    title: 'Webhook',
    category: 'Integration',
    description: 'Dispatch safe HTTP requests to external APIs with timeout & headers.',
    icon: Webhook,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    accent: 'bg-indigo-500',
    defaultData: {
      label: 'Call External API',
      method: 'GET',
      url: 'https://httpbin.org/get',
      timeout: 10000,
    },
  },
];

const NodeSidebar = () => {
  const [search, setSearch] = useState('');
  const { addNode, nodes } = useWorkflowBuilder();

  const filteredCatalog = NODE_CATALOG.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (event, nodeItem) => {
    event.dataTransfer.setData('application/reactflow', nodeItem.type);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeItem.defaultData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddDirect = (nodeItem) => {
    // Generate distinct coordinate offset
    const count = nodes.length;
    const newNode = {
      id: `node_${nodeItem.type}_${Date.now()}`,
      type: nodeItem.type,
      position: { x: 250 + (count % 4) * 40, y: 150 + count * 60 },
      data: { ...nodeItem.defaultData },
    };
    addNode(newNode);
  };

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-4rem)] z-10 select-none">
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Node Library
        </h3>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[11px] text-slate-400 dark:text-slate-500 px-1 font-medium flex items-center justify-between">
          <span>DRAG OR CLICK TO ADD</span>
          <span>5 NODES</span>
        </div>

        {filteredCatalog.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-grab active:cursor-grabbing transition-all relative overflow-hidden"
            >
              {/* Colored left strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.accent}`} />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${item.bg} ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddDirect(item)}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-400 transition-colors"
                  title="Add to canvas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}

        {filteredCatalog.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            No matching nodes found.
          </div>
        )}
      </div>

      {/* Footer tips */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <span>Connect nodes by dragging between blue/green circles.</span>
      </div>
    </aside>
  );
};

export default NodeSidebar;
