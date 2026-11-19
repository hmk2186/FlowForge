import React from 'react';
import { X, Trash2, Sliders, AlertCircle, Info } from 'lucide-react';
import { useWorkflowBuilder } from '../../../context/WorkflowBuilderContext';

const NodeConfigDrawer = () => {
  const { selectedNode, selectNode, updateNodeData, deleteNode } = useWorkflowBuilder();

  if (!selectedNode) return null;

  const { id, type, data = {} } = selectedNode;

  const handleChange = (field, value) => {
    updateNodeData(id, { [field]: value });
  };

  const handleDelete = () => {
    deleteNode(id);
  };

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-4rem)] z-10 shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Node Configuration
          </h3>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Common Field: Label */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Node Label
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 1. TRIGGER NODE CONFIG */}
        {type === 'trigger' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trigger Type
              </label>
              <select
                value={data.triggerType || 'manual'}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="manual">Manual Trigger</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial JSON Payload
              </label>
              <textarea
                rows={6}
                value={data.payload || ''}
                onChange={(e) => handleChange('payload', e.target.value)}
                placeholder='{\n  "userId": 123,\n  "status": "pending"\n}'
                className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Variables will be available to downstream nodes.
              </p>
            </div>
          </div>
        )}

        {/* 2. ACTION NODE CONFIG */}
        {type === 'action' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Action Type
              </label>
              <select
                value={data.actionType || 'log'}
                onChange={(e) => handleChange('actionType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="log">Log Message</option>
                <option value="create_task">Create Task / Record (MongoDB)</option>
                <option value="http_request">HTTP Request</option>
                <option value="data_transform">Data Transformation</option>
              </select>
            </div>

            {/* Subtype: Log Message */}
            {data.actionType === 'log' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Log Message Template
                </label>
                <textarea
                  rows={3}
                  value={data.logMessage || ''}
                  onChange={(e) => handleChange('logMessage', e.target.value)}
                  placeholder="Processing record: {{data.id}}"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Use {'{{variable}}'} to interpolate values from execution context.
                </p>
              </div>
            )}

            {/* Subtype: Create Task (Saves in MongoDB TaskRecord) */}
            {data.actionType === 'create_task' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={data.taskTitle || ''}
                    onChange={(e) => handleChange('taskTitle', e.target.value)}
                    placeholder="Audit Review for {{data.ticketId}}"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={data.taskDescription || ''}
                    onChange={(e) => handleChange('taskDescription', e.target.value)}
                    placeholder="Follow up priority: {{data.priority}}"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Saves persistent records directly to the database.</span>
                </div>
              </div>
            )}

            {/* Subtype: HTTP Request */}
            {data.actionType === 'http_request' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-24">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Method
                    </label>
                    <select
                      value={data.method || 'GET'}
                      onChange={(e) => handleChange('method', e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={data.url || ''}
                      onChange={(e) => handleChange('url', e.target.value)}
                      placeholder="https://api.example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subtype: Data Transform */}
            {data.actionType === 'data_transform' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Variable Field
                  </label>
                  <input
                    type="text"
                    value={data.sourceField || 'data.name'}
                    onChange={(e) => handleChange('sourceField', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operation
                  </label>
                  <select
                    value={data.transformType || 'uppercase'}
                    onChange={(e) => handleChange('transformType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="uppercase">Uppercase String</option>
                    <option value="lowercase">Lowercase String</option>
                    <option value="trim">Trim Whitespace</option>
                    <option value="count">Count Array Items</option>
                    <option value="round">Round Number</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Output Key
                  </label>
                  <input
                    type="text"
                    value={data.targetField || 'transformed'}
                    onChange={(e) => handleChange('targetField', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CONDITION NODE CONFIG */}
        {type === 'condition' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Variable to Compare *
              </label>
              <input
                type="text"
                value={data.variable || ''}
                onChange={(e) => handleChange('variable', e.target.value)}
                placeholder="data.status"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Comparison Operator *
              </label>
              <select
                value={data.operator || 'equals'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="equals">Equals (==)</option>
                <option value="not_equals">Not Equals (!=)</option>
                <option value="greater_than">Greater Than (&gt;)</option>
                <option value="less_than">Less Than (&lt;)</option>
                <option value="contains">Contains (substring/array)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Comparison Value
              </label>
              <input
                type="text"
                value={data.value !== undefined ? data.value : ''}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="active or 100"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. DELAY NODE CONFIG */}
        {type === 'delay' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration Number *
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={data.duration !== undefined ? data.duration : 5}
                onChange={(e) => handleChange('duration', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit
              </label>
              <select
                value={data.unit || 'seconds'}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>
          </div>
        )}

        {/* 5. WEBHOOK NODE CONFIG */}
        {type === 'webhook' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-24">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Method
                </label>
                <select
                  value={data.method || 'GET'}
                  onChange={(e) => handleChange('method', e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={data.url || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://httpbin.org/get"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Request Body (JSON)
              </label>
              <textarea
                rows={3}
                value={data.body || ''}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder='{\n  "status": "ready"\n}'
                className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>

        <button
          onClick={() => selectNode(null)}
          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
        >
          Done
        </button>
      </div>
    </aside>
  );
};

export default NodeConfigDrawer;
