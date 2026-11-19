import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

const ConditionNode = ({ data, selected }) => {
  const label = data?.label || 'Condition';
  const variable = data?.variable || 'variable';
  const operator = data?.operator || 'equals';
  const value = data?.value !== undefined ? String(data.value) : 'value';

  return (
    <div
      className={`w-64 rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md relative ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-amber-500 !w-3 !h-3 !-top-1.5 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-t-lg bg-amber-50/70 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/50">
        <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
          <GitBranch className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            Condition
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </h4>
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 font-mono text-[11px] truncate">
          <span className="text-amber-600 dark:text-amber-400">{variable}</span>{' '}
          <span className="text-slate-500 dark:text-slate-400">{operator}</span>{' '}
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{value}</span>
        </div>
      </div>

      {/* Condition Output Labels & Handles */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-1 text-[11px] font-bold">
        {/* True Branch */}
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span>✓ True</span>
        </div>

        {/* False Branch */}
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <span>✕ False</span>
        </div>
      </div>

      {/* True Branch Handle (Bottom-Left) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        className="!bg-emerald-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />

      {/* False Branch Handle (Bottom-Right) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        className="!bg-rose-500 !w-3 !h-3 !-bottom-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(ConditionNode);
