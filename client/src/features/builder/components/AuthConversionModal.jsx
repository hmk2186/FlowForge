import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Lock, ShieldCheck, Zap, X, ArrowRight } from 'lucide-react';
import { useWorkflowBuilder } from '../../../context/WorkflowBuilderContext';
import { useToast } from '../../../context/ToastContext';

const AuthConversionModal = ({ isOpen, onClose, triggerReason = 'cloud_save' }) => {
  const navigate = useNavigate();
  const { info } = useToast();
  const { workflowName, workflowDescription, nodes, edges } = useWorkflowBuilder();

  if (!isOpen) return null;

  const handleSaveAndRedirect = (targetPath) => {
    // Preserve full guest workflow state in localStorage for 1-click import after auth
    const pendingImport = {
      name: workflowName || 'My Guest Workflow',
      description: workflowDescription || 'Imported from guest session',
      nodes,
      edges,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('flowforge_pending_guest_import', JSON.stringify(pendingImport));
    info('Your workflow is preserved. Sign in or create an account to save it permanently.');
    onClose();
    navigate(targetPath);
  };

  const isExecutionTrigger = triggerReason === 'execution';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Graphic Banner */}
        <div className="p-6 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mb-3">
            {isExecutionTrigger ? <Zap className="w-6 h-6 text-indigo-400" /> : <Cloud className="w-6 h-6 text-indigo-400" />}
          </div>

          <h3 className="text-lg font-extrabold tracking-tight">
            {isExecutionTrigger ? 'Run Full Backend Executions' : 'Save Your Workflow to the Cloud'}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            {isExecutionTrigger
              ? 'Guest mode provides local simulation. Create a free account to execute workflows on real backend infrastructure.'
              : 'Sign in or create a free account to save unlimited workflows permanently to your dashboard.'}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Persistent Cloud Storage
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Access, edit, duplicate, and organize all your workflows from any computer.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Real Webhooks & External APIs
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Dispatch live HTTP requests, save persistent MongoDB records, and test APIs safely.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Step-by-Step Execution Audits
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Inspect past runs, view latency stats, analyze errors, and monitor live dashboard analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow preservation notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
            ✨ <strong>Don't worry:</strong> Your current canvas nodes and settings will be preserved and automatically ready to import once you sign in.
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleSaveAndRedirect('/register')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Create Free Account & Import</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleSaveAndRedirect('/login')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Sign In with Existing Account
            </button>

            <button
              onClick={onClose}
              className="w-full py-1.5 text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium"
            >
              Continue exploring as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthConversionModal;
