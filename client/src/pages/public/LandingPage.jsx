import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Zap,
  GitBranch,
  Clock,
  Webhook,
  CheckCircle2,
  Play,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Database,
  Shuffle,
  FileCheck2,
} from 'lucide-react';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import { STARTER_TEMPLATES } from '../../features/builder/utils/starterTemplates';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* 1. HERO SECTION */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Subtle background ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Full-Stack Visual Workflow Automation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
              Build & Automate Powerful Workflows{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500">
                Visually
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              FlowForge is a node-based workflow automation platform. Drag and connect custom nodes, configure conditional branches, validate execution graphs, and execute pipelines backed by a real server engine.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/builder')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Try Builder (No Login Needed)</span>
              </button>

              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all shadow-sm"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Mock Canvas Preview Graphic */}
            <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-3 sm:p-5 shadow-2xl">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 sm:p-8 relative overflow-hidden text-left">
                {/* Dot background pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Mock Canvas Toolbar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 relative z-10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 font-mono text-slate-400">flowforge-canvas://demo-pipeline</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Engine Ready
                  </span>
                </div>

                {/* Nodes Display in Graphic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Trigger Node */}
                  <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500 text-white">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-cyan-400">Trigger Node</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">Manual Trigger: {"{ orderId: 8092 }"}</p>
                  </div>

                  {/* Condition Node */}
                  <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-950 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-amber-400">Condition Node</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">Rule: amount &gt; 1000</p>
                    <div className="mt-2 flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-400">✓ True branch</span>
                      <span className="text-rose-400">✕ False branch</span>
                    </div>
                  </div>

                  {/* Action Node */}
                  <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-950 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-400">Action Node</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">Create TaskRecord (MongoDB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. CORE FEATURES SECTION */}
        {/* ======================================================== */}
        <section id="features" className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                Core Capabilities
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Everything You Need to Automate Logic
              </p>
              <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Designed with beginner-friendly simplicity and production-grade execution integrity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Visual Drag-and-Drop Builder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Interactive canvas powered by React Flow with smooth multi-handle connections, snapping grid, MiniMap, and real-time node property editing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Five Core Workflow Nodes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Connect Trigger, Action, Condition, Delay, and Webhook nodes to construct linear workflows or complex multi-branch pipelines.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Strict Graph Validation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Verifies single trigger existence, handle references, condition outlets, and uses Depth-First Search (DFS) to prevent cyclical loops before execution.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Real Execution Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Topological graph traversal passes context variables downstream, routes conditional branches, pauses for delays, and tracks node latencies in milliseconds.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Execution History & Audit Logs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Node-by-node inspector allows reviewing exact input payloads, output JSON results, timestamped console logs, and stack traces for every past run.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  SSRF Protection & Safe Execution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Webhook requests automatically validate URLs against internal private subnets (`127.0.0.1`, `10.x.x.x`, metadata IPs) and enforce strict 10s request timeouts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. HOW IT WORKS SECTION */}
        {/* ======================================================== */}
        <section id="how-it-works" className="py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                Simple Workflow
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                How FlowForge Operates in 4 Steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Create a Workflow
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Start from a blank canvas or pick one of the verified templates to kickstart your pipeline.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Connect & Configure
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Drag Action, Condition, Delay, or Webhook nodes. Edit fields and comparison rules in the side drawer.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Validate Graph
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Click Validate to verify single trigger rules, loop-free paths, and complete branch connections.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-4">
                  4
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Execute & Inspect
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Execute with test JSON payloads and inspect live step outputs and logs in the execution modal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. NODE INTRODUCTION SECTION */}
        {/* ======================================================== */}
        <section id="nodes" className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                Supported Node Types
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                The 5 Building Blocks of FlowForge
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Each node is purposefully designed with specific handles, custom styling, and dedicated backend handlers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Node 1: Trigger */}
              <div className="p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Trigger Node
                    </h3>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                      Manual Start
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Acts as the mandatory entry point of every workflow. Receives the initial execution payload and standardizes variables for downstream nodes.
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  Handles: 1 Output (Bottom)
                </div>
              </div>

              {/* Node 2: Action */}
              <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Action Node
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      Multi-Task Logic
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Executes four built-in operations: Log Message (with template variables), Create Task / Record (persisted in MongoDB), HTTP Request, and Data Transformation.
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  Handles: 1 Input (Top), 1 Output (Bottom)
                </div>
              </div>

              {/* Node 3: Condition */}
              <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Condition Node
                    </h3>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                      IF / ELSE Decision
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Evaluates variables against operators (equals, not_equals, greater_than, less_than, contains). Dispatches flow along distinct True or False branches.
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  Handles: 1 Input (Top), 2 Outputs (True & False)
                </div>
              </div>

              {/* Node 4: Delay */}
              <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Delay Node
                    </h3>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                      Timer Delay
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pauses the workflow for seconds or minutes before executing subsequent nodes. Implements responsive cancellation checks during waiting intervals.
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  Handles: 1 Input (Top), 1 Output (Bottom)
                </div>
              </div>

              {/* Node 5: Webhook */}
              <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Webhook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Webhook Node
                    </h3>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                      External HTTP
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Calls external APIs via HTTP (GET, POST, PUT, DELETE) with custom headers, JSON body payloads, and strict server-side request forgery (SSRF) security.
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  Handles: 1 Input (Top), 1 Output (Bottom)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. SEEDED TEMPLATES SECTION */}
        {/* ======================================================== */}
        <section id="templates" className="py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                Pre-Built Templates
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Verified Automation Templates
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Click any template below to test and tweak it immediately in the visual builder with no signup required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STARTER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tmpl.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {tmpl.nodes.length} nodes
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {tmpl.description}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/builder?template=${tmpl.id}`)}
                    className="w-full py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open in Guest Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. FINAL CALL TO ACTION */}
        {/* ======================================================== */}
        <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-transparent to-indigo-50/40 dark:to-indigo-950/20">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Ready to Design Your First Automated Pipeline?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Explore the drag-and-drop canvas right now as a guest, or create a free account to execute live workflows and save them permanently to the cloud.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/builder')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                Launch Guest Builder
              </button>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
