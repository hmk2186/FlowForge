import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Heart } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100 dark:border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Flow<span className="text-indigo-600 dark:text-indigo-400">Forge</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed text-[11px]">
              Visual workflow automation platform. Build, validate, and execute complex pipelines with an intuitive drag-and-drop canvas powered by React Flow and a robust execution engine.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">React 18</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Node.js</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">MongoDB</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">React Flow</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/builder" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Guest Canvas Builder
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Features & Nodes
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Workflow Templates
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Demo Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Account
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} FlowForge. Built with clean, modern full-stack JavaScript.</p>
          <p className="flex items-center gap-1">
            <span>Portfolio Project</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
