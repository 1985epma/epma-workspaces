/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu,
  Star,
  Trash2,
  Database,
  FileText,
  ChevronRight,
  Sun,
  Moon,
  Printer,
  ClipboardCheck,
  ClipboardCopy,
  ExternalLink
} from 'lucide-react';
import { Page } from '../types';

interface PageHeaderProps {
  currentPage: Page | null;
  pages: Page[];
  onSelectPage: (id: string | null) => void;
  onToggleFavorite: (id: string) => void;
  onToggleDatabaseMode: (id: string) => void;
  onDeletePage: (id: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function PageHeader({
  currentPage,
  pages,
  onSelectPage,
  onToggleFavorite,
  onToggleDatabaseMode,
  onDeletePage,
  onToggleSidebar,
  sidebarOpen,
  theme,
  onToggleTheme,
}: PageHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showPrintToast, setShowPrintToast] = useState(false);

  if (!currentPage) return null;

  // Build breadcrumbs recursively
  const getBreadcrumbs = (page: Page): Page[] => {
    const list: Page[] = [page];
    let current = page;
    while (current.parentId) {
      const parent = pages.find((p) => p.id === current.parentId);
      if (parent) {
        list.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return list;
  };

  const breadcrumbs = getBreadcrumbs(currentPage);

  const handleCopyToClipboard = async () => {
    try {
      const { compileToMarkdown, compileToWordCompatibleHtml } = await import('../utils/markdown');
      const md = compileToMarkdown(currentPage);
      const html = compileToWordCompatibleHtml(currentPage);

      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([md], { type: 'text/plain' });

      // Create clipboard item to hold both HTML for MS Word pasting and Markdown for text pasting
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });

      await navigator.clipboard.write([item]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy formatted note:', err);
      // Fallback to text matching
      try {
        const { compileToMarkdown } = await import('../utils/markdown');
        const mdText = compileToMarkdown(currentPage);
        await navigator.clipboard.writeText(mdText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        alert('Could not copy page contents to clipboard.');
      }
    }
  };

  const handleExportPdf = () => {
    setShowPrintToast(true);
    setTimeout(() => {
      setShowPrintToast(false);
      window.print();
    }, 1500);
  };

  return (
    <header
      id={`page-header-${currentPage.id}`}
      className="h-14 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 flex items-center justify-between bg-white dark:bg-neutral-900 shrink-0 sticky top-0 z-20 transition-colors"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* Toggle Sidebar menu trigger */}
        {!sidebarOpen && (
          <button
            id="sidebar-open-toggle"
            onClick={onToggleSidebar}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 mr-1 cursor-pointer shrink-0"
            title="Open Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 min-w-0">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0 select-none" />}
                <button
                  id={`breadcrumb-crumb-${crumb.id}`}
                  onClick={() => onSelectPage(crumb.id)}
                  className={`flex items-center gap-1 text-xs px-1.5 py-1 rounded truncate hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shrink-0 ${
                    isLast ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <span className="text-sm">{crumb.emoji || '📝'}</span>
                  <span className="truncate">{crumb.title || 'Untitled'}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Dynamic Action controls */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {/* Print Toast instruction Alert Bubble */}
        {showPrintToast && (
          <span className="text-[10px] bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-full animate-pulse select-none font-sans">
            Opening print window! Set 'Save as PDF' as your dest. 📄
          </span>
        )}

        {/* Word and Markdown styled copying */}
        <button
          id={`copy-word-compatible-${currentPage.id}`}
          onClick={handleCopyToClipboard}
          className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
          title="Copy formatted document (Word & Markdown compatible!)"
        >
          {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-600" /> : <ClipboardCopy className="w-4 h-4" />}
        </button>

        {/* High fidelity print PDF trigger */}
        {!currentPage.isDatabase && (
          <button
            id={`export-pdf-document-${currentPage.id}`}
            onClick={handleExportPdf}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
            title="Export this note as PDF / Exportar para PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Database mode toggle button */}
        <button
          id={`toggle-db-mode-${currentPage.id}`}
          onClick={() => onToggleDatabaseMode(currentPage.id)}
          className={`p-1.5 rounded-lg cursor-pointer border transition-all ${
            currentPage.isDatabase
              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
          title={currentPage.isDatabase ? 'Change to standard document' : 'Change to Database structured Table'}
        >
          {currentPage.isDatabase ? (
            <Database className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </button>

        {/* Light & Dark Visual switcher theme */}
        <button
          id="global-theme-toggle-btn"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={`Switch color theme to ${theme === 'dark' ? 'Light' : 'Dark'}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 fill-amber-300" /> : <Moon className="w-4 h-4 text-zinc-500" />}
        </button>

        {/* Favorite Star action */}
        <button
          id={`favorite-toggle-${currentPage.id}`}
          onClick={() => onToggleFavorite(currentPage.id)}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            currentPage.isFavorite
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              : 'bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:text-neutral-650'
          }`}
          title="Toggle favorites"
        >
          <Star className={`w-4 h-4 ${currentPage.isFavorite ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Delete page action */}
        <button
          id={`delete-page-${currentPage.id}`}
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${currentPage.title}"?`)) {
              onDeletePage(currentPage.id);
            }
          }}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-100 transition-colors cursor-pointer"
          title="Delete current page"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
