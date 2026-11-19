import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Play,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { useWorkflowBuilder } from '../../../context/WorkflowBuilderContext';
import { useToast } from '../../../context/ToastContext';
import { workflowService } from '../../../services/workflowService';

const BuilderToolbar = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onOpenExecutionModal,
  isGuest = false,
  onOpenConversionModal = () => {},
  onSaveLocal = () => {},
}) => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const {
    workflowId,
    workflowName,
    workflowStatus,
    nodes,
    edges,
    isDirty,
    isSaving,
    validationErrors,
    setWorkflowName,
    setWorkflowStatus,
    setValidation,
    setSaving,
  } = useWorkflowBuilder();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(workflowName);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      setWorkflowName(nameInput.trim());
    } else {
      setNameInput(workflowName);
    }
  };

  const handleValidate = async () => {
    // If in guest mode, perform client-side topology validation directly
    if (isGuest) {
      const triggers = nodes.filter((n) => n.type === 'trigger');
      const errs = [];

      if (nodes.length === 0) {
        errs.push({ message: 'The workflow has no nodes. Add a Trigger to begin.' });
      } else if (triggers.length === 0) {
        errs.push({ message: 'Workflow must have exactly one starting Trigger node.' });
      } else if (triggers.length > 1) {
        errs.push({ message: 'Only one Trigger node is permitted.' });
      }

      const valResult = { isValid: errs.length === 0, errors: errs, warnings: [] };
      setValidation(valResult);

      if (valResult.isValid) {
        success('Workflow structure is valid!');
      } else {
        error(errs[0]?.message || 'Validation failed');
      }
      return;
    }

    try {
      const res = await workflowService.validateWorkflow(workflowId, { nodes, edges });
      setValidation(res.data);
      if (res.data.isValid) {
        success('Workflow is valid and ready to execute!');
      } else {
        error(`Validation failed: ${res.data.errors[0]?.message || 'Please fix issues'}`);
      }
    } catch (err) {
      error(`Validation error: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (isGuest) {
      onSaveLocal();
      return;
    }

    setSaving(true);
    try {
      await workflowService.updateWorkflow(workflowId, {
        name: workflowName,
        status: workflowStatus,
        nodes,
        edges,
      });
      success('Workflow saved to cloud successfully!');
    } catch (err) {
      error(`Failed to save workflow: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (isGuest) return;
    const nextStatus = workflowStatus === 'active' ? 'inactive' : 'active';
    try {
      await workflowService.updateStatus(workflowId, nextStatus);
      setWorkflowStatus(nextStatus);
      info(`Workflow status set to ${nextStatus}`);
    } catch (err) {
      error(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between z-20">
      {/* Left section: Back button & Workflow Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isGuest ? '/' : '/workflows')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isGuest ? 'Back to Homepage' : 'Back to Workflows'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className="text-base font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 rounded border border-indigo-400 outline-none"
            />
          ) : (
            <h2
              onClick={() => {
                setNameInput(workflowName);
                setIsEditingName(true);
              }}
              className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate max-w-xs transition-colors"
              title="Click to rename"
            >
              {workflowName}
            </h2>
          )}

          {/* Status Badge */}
          {isGuest ? (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1"
              title="Guest session saved in browser localStorage"
            >
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Guest Mode (Local)</span>
            </span>
          ) : (
            <button
              onClick={handleStatusToggle}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                workflowStatus === 'active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200'
                  : workflowStatus === 'draft'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
              title="Click to toggle status"
            >
              {workflowStatus}
            </button>
          )}

          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* Center section: Canvas controls */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onFitView}
          className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Validate button */}
        <button
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition shadow-sm"
        >
          {validationErrors.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          )}
          Validate
          {validationErrors.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
              {validationErrors.length}
            </span>
          )}
        </button>

        {/* Save button (Local or Cloud) */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm ${
            isDirty
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800'
              : 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isGuest ? 'Save Local' : 'Save'}</span>
        </button>

        {/* Save to Cloud Button (Shown in Guest Mode) */}
        {isGuest && (
          <button
            onClick={() => onOpenConversionModal('cloud_save')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-sm font-semibold transition shadow-sm"
          >
            <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Save to Cloud</span>
          </button>
        )}

        {/* Execute button */}
        <button
          onClick={onOpenExecutionModal}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isGuest ? 'Demo Run' : 'Execute'}</span>
        </button>
      </div>
    </header>
  );
};

export default BuilderToolbar;
