/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  File,
  FileText,
  Star,
  Trash2,
  Sparkles,
  Download,
  Upload,
  ChevronLeft,
  X,
  Database,
  LogOut,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Page } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (id: string | null) => void;
  onAddPage: (parentId: string | null, isDatabase?: boolean) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onImportData: (imported: Page[]) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  userEmail?: string;
  onLogout?: () => void;
  onOpenBilling: () => void;
  onOpenAdmin: () => void;
  onViewLandpage?: () => void;
}

export default function Sidebar({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onToggleFavorite,
  onImportData,
  isOpen,
  onToggleSidebar,
  userEmail = 'admin@epma.com',
  onLogout,
  onOpenBilling,
  onOpenAdmin,
  onViewLandpage,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    'welcome-page': true,
    'project-db-page': true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubpage = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Expand parent automatically
    setExpandedPages((prev) => ({ ...prev, [parentId]: true }));
    onAddPage(parentId, false);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(pages, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `epma-workspace-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Export failed: ' + e);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
            onImportData(parsed);
            alert('Workspace imported successfully!');
          } else {
            alert('Invalid export file format.');
          }
        } catch (err) {
          alert('Failed to parse json file for import.');
        }
      };
    }
  };

  // Filter keys
  const favorites = pages.filter((p) => p.isFavorite);
  const topLevelPages = pages.filter((p) => p.parentId === null);

  // Search filter
  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recursive page node rendering
  const renderPageNode = (page: Page, depth: number = 0) => {
    const children = pages.filter((p) => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedPages[page.id];
    const isSelected = currentPageId === page.id;

    return (
      <div key={page.id} className="select-none">
        <div
          id={`sidebar-item-${page.id}`}
          onClick={() => onSelectPage(page.id)}
          className={`group flex items-center justify-between py-2 px-3 mx-2 my-0.5 rounded-2xl cursor-pointer text-sm transition-all duration-150 ${
            isSelected
              ? 'bg-neutral-100 dark:bg-white/10 font-medium text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 14)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              id={`sidebar-expand-${page.id}`}
              onClick={(e) => toggleExpand(page.id, e)}
              className={`p-0.5 rounded-full hover:bg-black/5 text-neutral-400 transition-all ${
                !hasChildren ? 'opacity-0 cursor-default' : ''
              }`}
              disabled={!hasChildren}
            >
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90 text-neutral-600' : ''
                }`}
              />
            </button>
            <span className="text-base shrink-0 select-none leading-none">{page.emoji || '📝'}</span>
            <span className="truncate flex-1">{page.title || 'Untitled'}</span>
            {page.isDatabase && (
              <Database className="w-3.5 h-3.5 text-zinc-400 shrink-0" title="Database structured view" />
            )}
          </div>

          <div id={`actions-${page.id}`} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1 transition-all">
            <button
              id={`sidebar-add-sub-${page.id}`}
              onClick={(e) => handleAddSubpage(page.id, e)}
              title="Add a nested subpage"
              className="p-1 rounded-full hover:bg-black/5 text-neutral-500 hover:text-neutral-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              id={`sidebar-delete-${page.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${page.title}"? This will delete all its nested subpages.`)) {
                  onDeletePage(page.id);
                }
              }}
              title="Delete page"
              className="p-1 rounded-full hover:bg-black/5 text-neutral-500 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-[16px] top-1 bottom-1 w-px bg-neutral-200" style={{ left: `${depth * 14 + 19}px` }} />
            <div>
              {children.map((child) => renderPageNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="workspace-sidebar"
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-r border-black/5 transform transition-transform duration-300 md:relative md:transform-none ${
        isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0 md:hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-semibold text-xs tracking-wider">
            EPMA
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 tracking-tight text-sm">Workspace</span>
        </div>
        <button
          id="sidebar-close-btn"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-full hover:bg-black/5 text-neutral-500 shrink-0 md:hidden"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          id="sidebar-collapse-btn"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-full hover:bg-black/5 text-neutral-400 hover:text-neutral-600 hidden md:block shrink-0"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Toolbar Tools */}
      <div className="p-3 space-y-2">
        {/* Quick Find Search */}
        <button
          id="sidebar-search-trigger"
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-neutral-500 bg-white/80 border border-black/5 rounded-2xl shadow-sm hover:border-black/10 transition"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="flex-1 text-left">Search pages...</span>
          <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded text-[10px]">Ctrl+K</span>
        </button>

        {/* Action Triggers */}
        <div className="flex gap-2">
          <button
            id="sidebar-new-doc-btn"
            onClick={() => onAddPage(null, false)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/80 hover:bg-white border border-black/5 text-xs font-medium text-neutral-700 rounded-2xl shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Page
          </button>
          <button
            id="sidebar-new-db-btn"
            onClick={() => onAddPage(null, true)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/80 hover:bg-white border border-black/5 text-xs font-medium text-neutral-700 rounded-2xl shadow-sm transition"
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            New Table
          </button>
        </div>
      </div>

      {/* Scrollable Page Tree content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Favorites section */}
        {favorites.length > 0 && (
          <div className="mb-4">
            <div className="px-5 py-1 text-[10px] font-semibold text-neutral-400 tracking-wider uppercase flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              Favorites
            </div>
            <div className="mt-1 space-y-0.5">
              {favorites.map((fav) => (
                <div
                  key={`fav-${fav.id}`}
                  onClick={() => onSelectPage(fav.id)}
                  className={`flex items-center gap-2 py-1.5 px-5 mx-2 rounded-2xl cursor-pointer text-sm transition-colors ${
                    currentPageId === fav.id
                      ? 'bg-neutral-100 font-medium text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900'
                  }`}
                >
                  <span className="text-base shrink-0 select-none leading-none">{fav.emoji || '📝'}</span>
                  <span className="truncate flex-1">{fav.title || 'Untitled'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Document Tree */}
        <div>
          <div className="px-5 py-2 text-[10px] font-semibold text-neutral-400 tracking-wider uppercase">
            Private Pages
          </div>
          {topLevelPages.length === 0 ? (
            <div className="px-5 py-3 text-xs text-neutral-400 italic">No pages created yet. Click New Page!</div>
          ) : (
            <div className="space-y-0.5">
              {topLevelPages.map((page) => renderPageNode(page))}
            </div>
          )}
        </div>
      </div>

      {/* Import/Export Backups Panel */}
      <div className="p-3 border-t border-black/5 bg-white/60 space-y-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 px-1">
          Backup Controls
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="workspace-export-btn"
            onClick={handleExport}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white/80 hover:bg-white border border-black/5 rounded-2xl text-xs font-medium text-neutral-600 shadow-sm transition"
          >
            <Download className="w-3 h-3 text-neutral-500" />
            Export
          </button>
          
          <label className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white/80 hover:bg-white border border-black/5 rounded-2xl text-xs font-medium text-neutral-600 shadow-sm cursor-pointer transition">
            <Upload className="w-3 h-3 text-neutral-500" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Workspace Plan Pricing Widget */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 bg-linear-to-b from-white/80 to-neutral-50/20 dark:from-neutral-900 dark:to-neutral-950 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-550">Workspace Tier</span>
          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
            {localStorage.getItem('epma_billing_tier') || 'Free'}
          </span>
        </div>
        
        <button
          id="sidebar-upgrade-widget-btn"
          onClick={onOpenBilling}
          className="w-full flex items-center justify-between text-left p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 border border-black/5 text-neutral-700 dark:text-neutral-300 transition duration-150 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500 shrink-0 group-hover:scale-110 transition" />
            <div className="leading-none">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white mb-0.5">Subscription</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">Manage Stripe & Wallets</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        <button
          id="sidebar-admin-widget-btn"
          onClick={onOpenAdmin}
          className="w-full flex items-center justify-between text-left p-2.5 rounded-2xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white transition duration-150 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition" />
            <div className="leading-none">
              <p className="text-xs font-bold text-neutral-100 mb-0.5">Admin & Accounts Portal</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-400 font-mono">{userEmail.toLowerCase() === 'admin@epma.com' ? 'Superadmin Control' : 'My Tenant Portal'}</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400/80 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        {onViewLandpage && (
          <button
            id="sidebar-view-landpage-btn"
            onClick={onViewLandpage}
            className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm transition duration-150 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-white shrink-0 group-hover:rotate-12 transition" />
              <div className="leading-none">
                <p className="text-xs font-bold text-white mb-0.5">Ver Landpage de Vendas 🌐</p>
                <p className="text-[10px] text-indigo-200 font-mono">Página do Produto & Demos IA</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        )}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-950 border border-neutral-700/50 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate leading-none mb-1">{userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate leading-none" title={userEmail}>{userEmail}</p>
          </div>
        </div>
        {onLogout && (
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-neutral-400 hover:text-red-600 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Search Dialog Popover */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white/95 rounded-[28px] shadow-[0_30px_90px_rgba(17,17,17,0.14)] border border-black/5 overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  id="search-input-box"
                  type="text"
                  placeholder="Type a word to find any page..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-hidden py-1 text-sm text-neutral-800 placeholder-neutral-400"
                  autoFocus
                />
                <button
                  id="close-search-dialog"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredPages.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400 italic">No workspace pages match search term.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredPages.slice(0, 10).map((page) => (
                      <div
                        id={`search-result-item-${page.id}`}
                        key={`search-${page.id}`}
                        onClick={() => {
                          onSelectPage(page.id);
                          setSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-black/[0.03] cursor-pointer transition text-sm text-neutral-700 hover:text-neutral-900"
                      >
                        <span className="text-lg shrink-0 leading-none">{page.emoji || '📝'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{page.title || 'Untitled'}</div>
                          {page.parentId && (
                            <div className="text-[10px] text-neutral-400 truncate">
                              Subpage of {pages.find(p => p.id === page.parentId)?.title || 'another page'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
