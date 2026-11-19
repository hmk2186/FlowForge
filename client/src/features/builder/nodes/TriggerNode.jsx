import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';

const TriggerNode = ({ data, selected }) => {
  const label = data?.label || 'Manual Trigger';
  const triggerType = data?.triggerType || 'manual';

  return (
    <div
      className={`w-64 rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        selected
          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-t-lg bg-cyan-50/70 dark:bg-cyan-950/40 border-b border-cyan-100 dark:border-cyan-900/50">
        <div className="p-1.5 rounded-lg bg-cyan-500 text-white shadow-sm">
          <PlayCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-300 uppercase tracking-wider">
            Trigger
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </h4>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500">Type:</span>
          <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
            {triggerType}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">
          Starts workflow execution
        </p>
      </div>

      {/* Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-cyan-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(TriggerNode);
