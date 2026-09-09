import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Search, FileText, Settings, LogOut,
  BookOpen, Bot, Edit3, Compass, Star, GitPullRequest,
  Briefcase, ChevronUp, ChevronDown, User
} from 'lucide-react';

// ─── Tooltip (visible only when collapsed on desktop) ─────────────────────────
const Tooltip = ({ text, isDark }) => (
  <div className={`
    absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap
    pointer-events-none opacity-0 group-hover:opacity-100
    transition-all duration-200 z-[100] shadow-xl
    ${isDark
      ? 'bg-[#1a1a1a] text-white border border-white/10'
      : 'bg-white text-black border border-gray-200 shadow-lg'}
  `}>
    {text}
    <div className={`absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent
      ${isDark ? 'border-r-[#1a1a1a]' : 'border-r-white'}`} />
  </div>
);

// ─── AppSidebar Component ──────────────────────────────────────────────────────
const AppSidebar = ({ isOpen, activePage, isDark, onClose, onToggle }) => {
  const navigate = useNavigate();

  // Collapsible section states (open by default as in screenshot)
  const [isCareerOpen, setIsCareerOpen] = useState(true);
  const [isResearchOpen, setIsResearchOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Nav Sections
  const careerItems = [
    { id: 'career', icon: Briefcase, text: 'Career', path: '/career' },
    { id: 'contributions', icon: GitPullRequest, text: 'Contributions', path: '/contributions' },
    { id: 'guide', icon: Compass, text: 'Research Guide', path: '/guide' },
  ];

  const researchItems = [
    { id: 'search', icon: Search, text: 'Discover Papers', path: '/search' },
    { id: 'draft', icon: BookOpen, text: 'Paper Drafting', path: '/draft' },
    { id: 'docspace', icon: Edit3, text: 'DocSpace Editor', path: '/docspace' },
    { id: 'workspace', icon: FileText, text: 'Workspace', path: '/workspace' },
    { id: 'library', icon: Star, text: 'My Library', path: '/library' },
    { id: 'ai', icon: Bot, text: 'AI Assistant', path: '/ai' },
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = activePage === item.id;
    return (
      <div
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`
          relative flex items-center gap-3 px-3 py-2.5 rounded-2xl
          cursor-pointer transition-all duration-200 group
          ${isOpen ? '' : 'justify-center'}
          ${active
            ? isDark
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
              : 'bg-[#e0f2fe] text-[#0284c7] border border-[#38bdf8] font-bold'
            : isDark
              ? 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              : 'text-gray-600 border border-transparent hover:bg-gray-100 hover:text-black'
          }
        `}
      >
        <div className={`flex-shrink-0 transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`}>
          <Icon size={18} />
        </div>
        <span className={`
          font-medium text-sm tracking-wide whitespace-nowrap
          transition-all duration-300 overflow-hidden
          ${isOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}
        `}>
          {item.text}
        </span>
        {!isOpen && <Tooltip text={item.text} isDark={isDark} />}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/50 z-40 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col flex-shrink-0
        border-r backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${isDark
          ? 'bg-black/90 border-white/10 text-white'
          : 'bg-white border-gray-200 text-black shadow-lg'}
        ${isOpen
          ? 'w-64 translate-x-0'
          : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}
        lg:relative lg:inset-y-auto lg:left-auto
      `}>

        {/* Brand Header */}
        <div
          onClick={onToggle}
          className={`
            flex items-center border-b h-20 px-5 flex-shrink-0 cursor-pointer
            transition-all duration-200 group
            ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}
            ${isOpen ? 'gap-3' : 'justify-center'}
          `}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <div className={`
            p-2 rounded-xl flex-shrink-0 transition-all duration-200
            ${isDark
              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
              : 'bg-[#e0f2fe] text-[#0284c7] border border-[#38bdf8]/30'}
          `}>
            <LayoutGrid size={22} />
          </div>
          <span className={`
            font-black tracking-tight text-xl whitespace-nowrap overflow-hidden
            transition-all duration-300
            ${isOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}
          `}>
            CLARION
          </span>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {/* Home Nav Item */}
          {renderNavItem({ id: 'home', icon: LayoutGrid, text: 'Home', path: '/home' })}

          {/* CAREER MODULE Section */}
          <div className="pt-2">
            {isOpen && (
              <button
                onClick={() => setIsCareerOpen(!isCareerOpen)}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
                }`}
              >
                <span>CAREER MODULE</span>
                {isCareerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {(isCareerOpen || !isOpen) && (
              <div className="space-y-1 mt-1">
                {careerItems.map(item => renderNavItem(item))}
              </div>
            )}
          </div>

          {/* RESEARCH Section */}
          <div className="pt-2">
            {isOpen && (
              <button
                onClick={() => setIsResearchOpen(!isResearchOpen)}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
                }`}
              >
                <span>RESEARCH</span>
                {isResearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {(isResearchOpen || !isOpen) && (
              <div className="space-y-1 mt-1">
                {researchItems.map(item => renderNavItem(item))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className={`p-3 border-t space-y-1 flex-shrink-0 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {/* Profile / Settings */}
          <div
            onClick={() => navigate('/settings')}
            className={`
              relative flex items-center gap-3 px-3 py-2.5 rounded-2xl
              cursor-pointer transition-all duration-200 group
              ${isOpen ? '' : 'justify-center'}
              ${activePage === 'settings'
                ? isDark ? 'bg-white/10 text-white font-bold' : 'bg-gray-100 text-black font-bold'
                : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
            `}
          >
            <User size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
              Profile
            </span>
            {!isOpen && <Tooltip text="Profile" isDark={isDark} />}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className={`
              relative flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl
              transition-all duration-200 group
              ${isOpen ? '' : 'justify-center'}
              ${isDark
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}
            `}
          >
            <LogOut size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
              Sign Out
            </span>
            {!isOpen && <Tooltip text="Sign Out" isDark={isDark} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
