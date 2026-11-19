import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GitFork,
  Search,
  Plus,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  Layers,
  X,
  Sparkles,
  Download,
} from 'lucide-react';
import { workflowService } from '../../services/workflowService';
import { useToast } from '../../context/ToastContext';

const WorkflowsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error, info } = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Pending Guest Import State
  const [pendingGuestWorkflow, setPendingGuestWorkflow] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Active action menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Check URL query for ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateModalOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Check for preserved guest workflow in localStorage on mount
  useEffect(() => {
    try {
      const savedPending = localStorage.getItem('flowforge_pending_guest_import');
      if (savedPending) {
        setPendingGuestWorkflow(JSON.parse(savedPending));
      }
    } catch (e) {
      console.warn('[Import] Failed to read pending guest workflow:', e);
    }
  }, []);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortBy) params.sort = sortBy;

      const res = await workflowService.getWorkflows(params);
      setWorkflows(res.data.workflows || []);
    } catch (err) {
      error(`Failed to load workflows: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkflows();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchWorkflows]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) {
      error('Please enter a workflow name');
      return;
    }

    setIsCreating(true);
    try {
      const res = await workflowService.createWorkflow({
        name: newWorkflowName.trim(),
        description: newWorkflowDesc.trim(),
      });
      success('Workflow created!');
      setIsCreateModalOpen(false);
      setNewWorkflowName('');
      setNewWorkflowDesc('');
      navigate(`/workflows/${res.data.workflow._id}/builder`);
    } catch (err) {
      error(`Creation failed: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Import Preserved Guest Workflow into User Account
  const handleImportGuestWorkflow = async () => {
    if (!pendingGuestWorkflow) return;
    setIsImporting(true);

    try {
      const res = await workflowService.createWorkflow({
        name: pendingGuestWorkflow.name || 'Imported Guest Workflow',
        description: pendingGuestWorkflow.description || 'Imported from your guest session',
        nodes: pendingGuestWorkflow.nodes || [],
        edges: pendingGuestWorkflow.edges || [],
      });

      // Clear from localStorage upon verified success to prevent duplicate imports
      localStorage.removeItem('flowforge_pending_guest_import');
      setPendingGuestWorkflow(null);

      success('Workflow successfully imported into your account!');
      fetchWorkflows();
      navigate(`/workflows/${res.data.workflow._id}/builder`);
    } catch (err) {
      // Retain local data if import fails so visitor loses nothing
      error(`Import failed: ${err.message}. Your local copy is preserved.`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDiscardGuestWorkflow = () => {
    localStorage.removeItem('flowforge_pending_guest_import');
    setPendingGuestWorkflow(null);
    info('Guest workflow dismissed.');
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      const res = await workflowService.duplicateWorkflow(id);
      success('Workflow duplicated successfully!');
      fetchWorkflows();
    } catch (err) {
      error(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete workflow "${name}"? This will also remove its execution logs.`)) {
      return;
    }

    try {
      await workflowService.deleteWorkflow(id);
      success('Workflow deleted successfully');
      setWorkflows((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      error(`Delete failed: ${err.message}`);
    }
  };

  const STATUS_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Workflows
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, organize, configure and monitor your automation sequences.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Pending Guest Workflow Import Notification Banner */}
      {pendingGuestWorkflow && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                You have a preserved workflow from your guest session: "{pendingGuestWorkflow.name}"
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Contains {pendingGuestWorkflow.nodes?.length || 0} nodes and {pendingGuestWorkflow.edges?.length || 0} connections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDiscardGuestWorkflow}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 transition"
            >
              Discard
            </button>
            <button
              onClick={handleImportGuestWorkflow}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Import to My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((wf) => (
            <div
              key={wf._id}
              onClick={() => navigate(`/workflows/${wf._id}/builder`)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              <div>
                {/* Card Top: Status & Menu */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      wf.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : wf.status === 'draft'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {wf.status}
                  </span>

                  {/* Actions Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === wf._id ? null : wf._id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === wf._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs z-30"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/workflows/${wf._id}`);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(wf._id, e)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(wf._id, wf.name, e)}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {wf.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {wf.description || 'No description provided.'}
                </p>
              </div>

              {/* Card Bottom Meta */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{wf.nodes?.length || 0} nodes</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(wf.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <GitFork className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            No workflows found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {search
              ? 'No workflows match your search query.'
              : 'Create your first automated visual workflow to begin connecting nodes.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workflow</span>
          </button>
        </div>
      )}

      {/* Create Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Create New Workflow
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Qualification Pipeline"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the purpose of this workflow..."
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create & Open Canvas</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsListPage;
