import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Ban,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useWorkflowBuilder } from '../../../context/WorkflowBuilderContext';
import { executionService } from '../../../services/executionService';
import { useToast } from '../../../context/ToastContext';
import { simulateGuestWorkflow } from '../utils/guestSimulator';

const ExecutionModal = ({ isOpen, onClose, isGuest = false, onOpenConversionModal = () => {} }) => {
  const navigate = useNavigate();
  const { error, success, info } = useToast();
  const { workflowId, workflowName, nodes, edges } = useWorkflowBuilder();

  // Find sample trigger payload from existing Trigger node
  const triggerNode = nodes.find((n) => n.type === 'trigger');
  const defaultPayload = triggerNode?.data?.payload || '{\n  "source": "manual_test_run"\n}';

  const [payloadInput, setPayloadInput] = useState(defaultPayload);
  const [isRunning, setIsRunning] = useState(false);
  const [executionRecord, setExecutionRecord] = useState(null);
  const pollingRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Real backend execution polling for authenticated users
  const startPolling = (execId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await executionService.getExecutionById(execId);
        const exec = res.data.execution;
        setExecutionRecord(exec);

        if (['success', 'failed', 'cancelled'].includes(exec.status)) {
          clearInterval(pollingRef.current);
          setIsRunning(false);
          if (exec.status === 'success') {
            success('Execution finished successfully!');
          } else if (exec.status === 'failed') {
            error(`Execution failed: ${exec.errorDetails?.message || 'Error occurred'}`);
          } else {
            info('Execution was cancelled.');
          }
        }
      } catch (err) {
        clearInterval(pollingRef.current);
        setIsRunning(false);
      }
    }, 1500);
  };

  const handleExecute = async () => {
    let parsedPayload = {};
    if (payloadInput.trim()) {
      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch (e) {
        error(`Invalid JSON in Trigger Payload: ${e.message}`);
        return;
      }
    }

    setIsRunning(true);
    setExecutionRecord(null);
    isCancelledRef.current = false;

    // GUEST DEMO SIMULATION MODE
    if (isGuest) {
      try {
        const simResult = await simulateGuestWorkflow(
          nodes,
          edges,
          parsedPayload,
          (progress) => {
            setExecutionRecord({
              _id: 'guest_sim_active',
              status: progress.status,
              isGuestSimulation: true,
              nodeExecutionResults: progress.nodeExecutionResults,
              logs: progress.logs,
            });
          },
          isCancelledRef
        );

        setExecutionRecord(simResult);
        setIsRunning(false);
        if (simResult.status === 'success') {
          success('Demo simulation completed successfully!');
        } else {
          info('Simulation cancelled.');
        }
      } catch (err) {
        setIsRunning(false);
        error(`Simulation error: ${err.message}`);
      }
      return;
    }

    // AUTHENTICATED REAL BACKEND EXECUTION
    try {
      const res = await executionService.executeWorkflow(workflowId, parsedPayload);
      const { executionId } = res.data;

      setExecutionRecord({
        _id: executionId,
        status: 'running',
        nodeExecutionResults: [],
        logs: [{ message: 'Execution initiated on backend server...', timestamp: new Date() }],
      });

      startPolling(executionId);
    } catch (err) {
      setIsRunning(false);
      error(`Failed to trigger execution: ${err.message}`);
    }
  };

  const handleCancel = async () => {
    if (isGuest) {
      isCancelledRef.current = true;
      info('Simulation cancellation requested...');
      return;
    }

    if (!executionRecord?._id) return;
    try {
      await executionService.cancelExecution(executionRecord._id);
      info('Cancellation requested...');
    } catch (err) {
      error(`Cancel failed: ${err.message}`);
    }
  };

  const handleClose = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    isCancelledRef.current = true;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isGuest ? 'Demo Workflow Simulation' : 'Execute Workflow'}
                </h3>
                {isGuest && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                    Guest Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {workflowName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Disclaimer Banner */}
        {isGuest && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Client-side demo simulation. No external network calls or database writes.</span>
            </div>
            <button
              onClick={() => {
                handleClose();
                onOpenConversionModal('execution');
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 ml-2"
            >
              Sign in for Real Engine →
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Input Payload section */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trigger Input Payload (JSON)
            </label>
            <textarea
              rows={4}
              value={payloadInput}
              disabled={isRunning}
              onChange={(e) => setPayloadInput(e.target.value)}
              className="w-full font-mono text-[11px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
            />
          </div>

          {/* Execution Progress & Status */}
          {executionRecord && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isGuest ? 'Simulation Status' : 'Execution Status'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    executionRecord.status === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : executionRecord.status === 'failed'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : executionRecord.status === 'cancelled'
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 animate-pulse'
                  }`}
                >
                  {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                  {executionRecord.status}
                </span>
              </div>

              {/* Node execution step pills */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Completed Steps ({executionRecord.nodeExecutionResults?.length || 0}):
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {executionRecord.nodeExecutionResults?.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {step.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {step.nodeName || step.nodeId}
                        </span>
                        <span className="text-slate-400 capitalize">({step.nodeType})</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {step.durationMs}ms
                      </span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isGuest ? 'Evaluating simulation steps...' : 'Evaluating graph nodes on server...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error message box if failed */}
              {executionRecord.errorDetails?.message && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-[11px]">
                  <strong>Error:</strong> {executionRecord.errorDetails.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            {!isGuest && executionRecord?._id && (
              <button
                onClick={() => {
                  handleClose();
                  navigate(`/executions/${executionRecord._id}`);
                }}
                className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs"
              >
                <span>View Full Execution Log</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            {isGuest && (
              <span className="text-[11px] text-slate-400">
                Local simulation only
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isRunning && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}

            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isGuest ? 'Simulating...' : 'Running...'}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isGuest ? 'Run Demo Simulation' : 'Run Workflow'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionModal;
