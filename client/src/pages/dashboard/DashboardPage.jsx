import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitFork,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Layers,
  Loader2,
  Play,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { useTheme } from '../../context/ThemeContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes, chartsRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(),
          dashboardService.getCharts(),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setCharts(chartsRes.data);
      } catch (err) {
        console.error('[Dashboard Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const { workflows = {}, executions = {} } = stats || {};

  const KPI_CARDS = [
    {
      title: 'Total Workflows',
      value: workflows.total ?? 0,
      subtext: `${workflows.active ?? 0} active, ${workflows.draft ?? 0} draft`,
      icon: GitFork,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60',
    },
    {
      title: 'Total Executions',
      value: executions.total ?? 0,
      subtext: `${executions.running ?? 0} in progress`,
      icon: Activity,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/60',
    },
    {
      title: 'Success Rate',
      value: `${executions.successRate ?? 0}%`,
      subtext: `${executions.success ?? 0} successful runs`,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60',
    },
    {
      title: 'Failed Executions',
      value: executions.failed ?? 0,
      subtext: `${executions.cancelled ?? 0} cancelled`,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            FlowForge Automation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Monitor workflow execution activity, analytics, and operational health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition"
          >
            Browse Workflows
          </button>
          <button
            onClick={() => navigate('/workflows?create=true')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPI_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {card.value}
                </span>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Execution Activity Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily volume over the past 7 days
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.executionTrends && charts.executionTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.executionTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                  />
                  <XAxis
                    dataKey="label"
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#execGradient)"
                    name="Executions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No execution trends recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Success vs Failure Donut Chart */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Execution Results Ratio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown of successful vs failed runs
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {charts?.successVsFailure && charts.successVsFailure.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.successVsFailure}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.successVsFailure.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No execution data available</div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div>
              <span className="w-2 h-2 rounded-full inline-block bg-emerald-500 mr-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Success</span>
            </div>
            <div>
              <span className="w-2 h-2 rounded-full inline-block bg-rose-500 mr-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Failed</span>
            </div>
            <div>
              <span className="w-2 h-2 rounded-full inline-block bg-slate-500 mr-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workflows and Recent Executions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Workflows
            </h3>
            <Link
              to="/workflows"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activity?.recentWorkflows?.length > 0 ? (
              activity.recentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => navigate(`/workflows/${wf.id}/builder`)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {wf.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {wf.description || `${wf.nodeCount} nodes configured`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        wf.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : wf.status === 'draft'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {wf.status}
                    </span>
                    <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No workflows created yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Executions
            </h3>
            <Link
              to="/executions"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activity?.recentExecutions?.length > 0 ? (
              activity.recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => navigate(`/executions/${exec.id}`)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="flex-shrink-0">
                      {exec.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {exec.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      {exec.status === 'cancelled' && (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                      {['pending', 'running'].includes(exec.status) && (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {exec.workflowName}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(exec.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {exec.durationMs}ms
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        exec.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : exec.status === 'failed'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {exec.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No executions logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
