import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Ban,
  Layers,
  Terminal,
  Code,
  AlertTriangle,
} from 'lucide-react';
import { executionService } from '../../services/executionService';
import { useToast } from '../../context/ToastContext';

const ExecutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const pollingRef = useRef(null);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const res = await executionService.getExecutionById(id);
        const exec = res.data.execution;
        setExecution(exec);

        // If execution is in progress, poll every 1.5 seconds until terminal status
        if (['pending', 'running'].includes(exec.status)) {
          if (!pollingRef.current) {
            pollingRef.current = setInterval(async () => {
              try {
                const polledRes = await executionService.getExecutionById(id);
                const updated = polledRes.data.execution;
                setExecution(updated);

                if (['success', 'failed', 'cancelled'].includes(updated.status)) {
                  clearInterval(pollingRef.current);
                  pollingRef.current = null;
                }
              } catch (e) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
            }, 1500);
          }
        }
      } catch (err) {
        error(`Failed to load execution details: ${err.message}`);
        navigate('/executions');
      } finally {
        setLoading(false);
      }
    };

    fetchExecution();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, error, navigate]);

  const handleCancel = async () => {
    try {
      await executionService.cancelExecution(id);
      info('Cancellation requested...');
      const res = await executionService.getExecutionById(id);
      setExecution(res.data.execution);
    } catch (err) {
      error(`Cancel failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!execution) return null;

  const isRunning = ['pending', 'running'].includes(execution.status);
  const selectedNode = execution.nodeExecutionResults?.[selectedNodeIndex] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate('/executions')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Executions</span>
      </button>

      {/* Execution Header Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {execution.workflowName}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                execution.status === 'success'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : execution.status === 'failed'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  : execution.status === 'cancelled'
                  ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 animate-pulse'
              }`}
            >
              {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
              {execution.status}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400">ID: {execution._id}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-400">Duration</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
              {execution.durationMs}ms
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-400">Started</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {new Date(execution.startedAt).toLocaleTimeString()}
            </p>
          </div>

          {isRunning && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Details if Failed */}
      {execution.errorDetails?.message && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Execution Failure Details</span>
          </div>
          <p className="text-rose-700 dark:text-rose-400 font-mono">
            {execution.errorDetails.message}
          </p>
          {execution.errorDetails.stack && (
            <pre className="mt-2 p-3 rounded-lg bg-black/80 text-rose-300 text-[11px] overflow-x-auto max-h-40">
              {execution.errorDetails.stack}
            </pre>
          )}
        </div>
      )}

      {/* Main Grid: Steps Timeline & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Step-by-Step Visited Nodes */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Executed Steps ({execution.nodeExecutionResults?.length || 0})
          </h3>

          <div className="space-y-2">
            {execution.nodeExecutionResults?.map((step, idx) => {
              const isSelected = selectedNodeIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {step.nodeName || step.nodeId}
                      </h4>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {step.nodeType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[11px] text-slate-400">
                      {step.durationMs}ms
                    </span>
                    {step.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Node Inspector (Input/Output/Logs) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Node Inspector Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Step Inspector: {selectedNode?.nodeName || 'No step selected'}
                </h3>
              </div>
              {selectedNode && (
                <span className="text-xs font-mono text-slate-400">
                  Latency: {selectedNode.durationMs}ms
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Payload */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Input Data Context
                  </h4>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                    {JSON.stringify(selectedNode.input || {}, null, 2)}
                  </pre>
                </div>

                {/* Output Payload */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Step Output Result
                  </h4>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                    {JSON.stringify(selectedNode.output || (selectedNode.error ? { error: selectedNode.error } : {}), null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select a step on the left to inspect its inputs and outputs.
              </div>
            )}
          </div>

          {/* Console Execution Logs Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Terminal className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Execution Logs ({execution.logs?.length || 0})
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1.5 max-h-64 overflow-y-auto border border-slate-800">
              {execution.logs?.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 flex-shrink-0 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`font-bold uppercase text-[10px] flex-shrink-0 ${
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300 break-words">{log.message}</span>
                </div>
              ))}
              {execution.logs?.length === 0 && (
                <span className="text-slate-500">No logs generated.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetailPage;
