import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, MessageSquare, Database, Globe, Shuffle } from 'lucide-react';

const ActionNode = ({ data, selected }) => {
  const label = data?.label || 'Action';
  const actionType = data?.actionType || 'log';

  // Subtype icon selection
  const renderIcon = () => {
    switch (actionType) {
      case 'create_task':
        return <Database className="w-4 h-4" />;
      case 'http_request':
        return <Globe className="w-4 h-4" />;
      case 'data_transform':
        return <Shuffle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getActionTypeLabel = () => {
    switch (actionType) {
      case 'create_task':
        return 'Create Task Record';
      case 'http_request':
        return 'HTTP Request';
      case 'data_transform':
        return 'Data Transform';
      default:
        return 'Log Message';
    }
  };

  return (
    <div
      className={`w-64 rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-emerald-500 !w-3 !h-3 !-top-1.5 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-t-lg bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50">
        <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-sm">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
            Action
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </h4>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500">Operation:</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {getActionTypeLabel()}
          </span>
        </div>
        {actionType === 'create_task' && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
            {data?.taskTitle || 'Persistent MongoDB Record'}
          </p>
        )}
        {actionType === 'log' && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">
            {data?.logMessage || 'Outputs message to logs'}
          </p>
        )}
      </div>

      {/* Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-emerald-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(ActionNode);
