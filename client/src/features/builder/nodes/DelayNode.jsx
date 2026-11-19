import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

const DelayNode = ({ data, selected }) => {
  const label = data?.label || 'Delay';
  const duration = data?.duration !== undefined ? data.duration : 5;
  const unit = data?.unit || 'seconds';

  return (
    <div
      className={`w-64 rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-purple-500 !w-3 !h-3 !-top-1.5 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-t-lg bg-purple-50/70 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/50">
        <div className="p-1.5 rounded-lg bg-purple-500 text-white shadow-sm">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
            Delay
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </h4>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500">Wait Duration:</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {duration} {unit}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">
          Pauses execution before advancing
        </p>
      </div>

      {/* Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-purple-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(DelayNode);
