import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Sliders,
} from 'lucide-react';
import { workflowService } from '../../services/workflowService';
import { executionService } from '../../services/executionService';
import { useToast } from '../../context/ToastContext';

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [workflow, setWorkflow] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowAndHistory = async () => {
      setLoading(true);
      try {
        const [wfRes, execRes] = await Promise.all([
          workflowService.getWorkflowById(id),
          executionService.getExecutions({ workflowId: id, limit: 10 }),
        ]);
        setWorkflow(wfRes.data.workflow);
        setExecutions(execRes.data.executions || []);
      } catch (err) {
        error(`Failed to load details: ${err.message}`);
        navigate('/workflows');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowAndHistory();
  }, [id, error, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      await workflowService.updateStatus(id, newStatus);
      setWorkflow((prev) => ({ ...prev, status: newStatus }));
      info(`Status updated to ${newStatus}`);
    } catch (err) {
      error(`Update failed: ${err.message}`);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await workflowService.duplicateWorkflow(id);
      success('Workflow duplicated!');
      navigate(`/workflows/${res.data.workflow._id}`);
    } catch (err) {
      error(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workflow and its execution records?')) {
      return;
    }
    try {
      await workflowService.deleteWorkflow(id);
      success('Workflow deleted');
      navigate('/workflows');
    } catch (err) {
      error(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!workflow) return null;

  // Node type distribution
  const nodeCountMap = {};
  workflow.nodes?.forEach((n) => {
    nodeCountMap[n.type] = (nodeCountMap[n.type] || 0) + 1;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/workflows')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Workflows</span>
      </button>

      {/* Main Info Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {workflow.name}
              </h1>
              <select
                value={workflow.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                  workflow.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    : workflow.status === 'draft'
                    ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              {workflow.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(`/workflows/${id}/builder`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Sliders className="w-4 h-4" />
              <span>Open in Canvas</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Node Distribution Stats */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Canvas Composition ({workflow.nodes?.length || 0} Nodes, {workflow.edges?.length || 0} Connections)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['trigger', 'action', 'condition', 'delay', 'webhook'].map((type) => (
              <div
                key={type}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
              >
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {nodeCountMap[type] || 0}
                </span>
                <p className="text-[10px] text-slate-400 capitalize font-medium">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execution History Section */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Executions ({executions.length})
          </h3>
          <Link
            to={`/executions?workflowId=${id}`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Complete History
          </Link>
        </div>

        {executions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Execution ID</th>
                  <th className="pb-3 font-semibold">Started</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {executions.map((exec) => (
                  <tr
                    key={exec._id}
                    onClick={() => navigate(`/executions/${exec._id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          exec.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : exec.status === 'failed'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {exec.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500 truncate max-w-[120px]">
                      {exec._id}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(exec.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {exec.durationMs}ms
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:underline">
                        Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No executions recorded for this workflow yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailPage;
