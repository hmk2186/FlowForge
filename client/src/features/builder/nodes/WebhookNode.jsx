import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';

const WebhookNode = ({ data, selected }) => {
  const label = data?.label || 'Webhook';
  const method = (data?.method || 'GET').toUpperCase();
  const url = data?.url || 'https://api.example.com/endpoint';

  const getMethodBadgeColor = () => {
    switch (method) {
      case 'POST':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      case 'DELETE':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
    }
  };

  return (
    <div
      className={`w-64 rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-indigo-500 !w-3 !h-3 !-top-1.5 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-t-lg bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-sm">
          <Webhook className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
            Webhook
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </h4>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${getMethodBadgeColor()}`}>
            {method}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
            {url}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">
          Dispatches external HTTP request
        </p>
      </div>

      {/* Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-indigo-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(WebhookNode);
