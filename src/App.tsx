/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PageHeader from './components/PageHeader';
import PageCover from './components/PageCover';
import BlockEditor from './components/BlockEditor';
import DatabaseView from './components/DatabaseView';
import ProductsPage from './components/ProductsPage';
import BillingModal from './components/BillingModal';
import AdminBillingCenter from './components/AdminBillingCenter';
import { Page, Block } from './types';
import { getDefaultPages } from './data/defaultPages';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LayoutGrid, Layers, Database, HelpCircle } from 'lucide-react';

export default function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [viewingProductsPage, setViewingProductsPage] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('epma_theme') as 'light' | 'dark') || 'light';
  });

  // Sync Tailwind .dark class in root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('epma_theme', nextTheme);
  };

  // Authentication persistence & session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('epma_auth_logged') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('epma_auth_email') || 'admin@epma.com';
  });

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('epma_auth_logged', 'true');
    localStorage.setItem('epma_auth_email', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    localStorage.removeItem('epma_auth_logged');
    localStorage.removeItem('epma_auth_email');
  };

  // Load pages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('epma_workspace_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Perform title and text block migration as requested by user
          const migrated = parsed.map((page: Page) => {
            if (
              page.title === 'Welcome to EPMA Workspace' ||
              page.title === 'Welcome to your EPMA Workspace!' ||
              page.title === 'Welcome EPMA Workspace'
            ) {
              const updatedBlocks = page.blocks.map((b: Block) => {
                if (
                  b.type === 'h1' &&
                  (b.content === 'Welcome to your EPMA Workspace! 🚀' ||
                    b.content === 'Welcome to EPMA Workspace' ||
                    b.content === 'Welcome EPMA Workspace 🚀' ||
                    b.content === 'Welcome to your EPMA Workspace!')
                ) {
                  return { ...b, content: 'Welcome EPMA Workspace 🚀' };
                }
                return b;
              });
              return { ...page, title: 'Welcome EPMA Workspace', blocks: updatedBlocks };
            }
            return page;
          });
          setPages(migrated);
          setCurrentPageId(migrated[0].id);
          localStorage.setItem('epma_workspace_pages', JSON.stringify(migrated));
          return;
        }
      }
    } catch (e) {
      console.error('Failed to retrieve localized pages from local storage:', e);
    }

    // Default initialization
    const defaults = getDefaultPages();
    setPages(defaults);
    setCurrentPageId(defaults[0].id);
    localStorage.setItem('epma_workspace_pages', JSON.stringify(defaults));
  }, []);

  // Save utility helper
  const savePages = (updatedPages: Page[]) => {
    try {
      localStorage.setItem('epma_workspace_pages', JSON.stringify(updatedPages));
    } catch (e) {
      console.error('Error serializing current pages:', e);
    }
  };

  const handleSelectPage = (id: string | null) => {
    setCurrentPageId(id);
    // Auto-close drawer on narrow screens
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleAddPage = (parentId: string | null = null, isDatabase = false) => {
    const newPageId = `page-${Math.random().toString(36).substring(2, 11)}`;
    const newPage: Page = {
      id: newPageId,
      title: isDatabase ? 'New Database Table' : 'Untitled Document Page',
      emoji: isDatabase ? '📋' : '📄',
      coverImage: null,
      parentId,
      blocks: [
        {
          id: Math.random().toString(36).substring(2, 11),
          type: 'text',
          content: '',
        },
      ],
      isFavorite: false,
      isDatabase,
      dbProperties: isDatabase
        ? [
            {
              id: 'prop-status',
              name: 'Status',
              type: 'select',
              options: [
                { id: 'opt-ns', name: 'Not Started', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
                { id: 'opt-ip', name: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
                { id: 'opt-co', name: 'Completed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
              ],
            },
            {
              id: 'prop-priority',
              name: 'Priority',
              type: 'select',
              options: [
                { id: 'opt-pa', name: 'Low', color: 'bg-green-50 text-green-700 border border-green-200' },
                { id: 'opt-pb', name: 'Medium', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
                { id: 'opt-pc', name: 'High', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
              ],
            },
            { id: 'prop-done', name: 'Done', type: 'checkbox', options: [] },
            { id: 'prop-date', name: 'Target Date', type: 'date', options: [] },
          ]
        : [],
      dbRows: [],
    };

    const updated = [...pages, newPage];
    setPages(updated);
    savePages(updated);
    setCurrentPageId(newPageId);
  };

  const handleDeletePage = (id: string) => {
    // Collect page and recursively collect all children nested under it
    const idsToDelete = new Set<string>([id]);
    let prevSize = 0;
    while (idsToDelete.size !== prevSize) {
      prevSize = idsToDelete.size;
      pages.forEach((p) => {
        if (p.parentId && idsToDelete.has(p.parentId)) {
          idsToDelete.add(p.id);
        }
      });
    }

    const updated = pages.filter((p) => !idsToDelete.has(p.id));
    setPages(updated);
    savePages(updated);

    // If current page deleted, redirect to home page
    if (currentPageId && idsToDelete.has(currentPageId)) {
      const topLevel = updated.filter((p) => p.parentId === null);
      if (topLevel.length > 0) {
        setCurrentPageId(topLevel[0].id);
      } else if (updated.length > 0) {
        setCurrentPageId(updated[0].id);
      } else {
        setCurrentPageId(null);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = pages.map((p) => {
      if (p.id === id) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleToggleDatabaseMode = (id: string) => {
    const updated = pages.map((p) => {
      if (p.id === id) {
        const nextMode = !p.isDatabase;
        return {
          ...p,
          isDatabase: nextMode,
          dbProperties: nextMode && p.dbProperties.length === 0
            ? [
                {
                  id: 'prop-status',
                  name: 'Status',
                  type: 'select',
                  options: [
                    { id: 'opt-ns', name: 'Not Started', color: 'bg-zinc-100 text-zinc-800' },
                    { id: 'opt-ip', name: 'In Progress', color: 'bg-indigo-50 text-indigo-700' },
                    { id: 'opt-co', name: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
                  ],
                },
                {
                  id: 'prop-priority',
                  name: 'Priority',
                  type: 'select',
                  options: [
                    { id: 'opt-pa', name: 'Low', color: 'bg-green-50 text-green-700' },
                    { id: 'opt-pb', name: 'Medium', color: 'bg-amber-50 text-amber-700' },
                    { id: 'opt-pc', name: 'High', color: 'bg-rose-50 text-rose-700' },
                  ],
                },
                { id: 'prop-done', name: 'Done', type: 'checkbox', options: [] },
                { id: 'prop-date', name: 'Deadline', type: 'date', options: [] },
              ]
            : p.dbProperties,
        };
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleUpdatePageBlocks = (blocks: Block[]) => {
    if (!currentPageId) return;
    const updated = pages.map((p) => {
      if (p.id === currentPageId) {
        return { ...p, blocks };
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleUpdatePageCover = (cover: string | null) => {
    if (!currentPageId) return;
    const updated = pages.map((p) => {
      if (p.id === currentPageId) {
        return { ...p, coverImage: cover };
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleUpdatePageEmoji = (emoji: string) => {
    if (!currentPageId) return;
    const updated = pages.map((p) => {
      if (p.id === currentPageId) {
        return { ...p, emoji };
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleUpdateCurrentPage = (updatedPage: Page) => {
    const updated = pages.map((p) => {
      if (p.id === updatedPage.id) {
        return updatedPage;
      }
      return p;
    });
    setPages(updated);
    savePages(updated);
  };

  const handleUpdatePagesList = (allPages: Page[]) => {
    setPages(allPages);
    savePages(allPages);
  };

  const handleImportWorkspace = (imported: Page[]) => {
    setPages(imported);
    savePages(imported);
    if (imported.length > 0) {
      setCurrentPageId(imported[0].id);
    }
  };

  // Keyboard shortcut Ctrl+K search trigger
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchTrigger = document.getElementById('sidebar-search-trigger');
        if (searchTrigger) {
          searchTrigger.click();
        }
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const currentPage = pages.find((p) => p.id === currentPageId) || null;

  if (!isAuthenticated || viewingProductsPage) {
    return (
      <ProductsPage
        onLoginSuccess={(email) => {
          handleLoginSuccess(email);
          setViewingProductsPage(false);
        }}
        onViewWorkspace={isAuthenticated ? () => setViewingProductsPage(false) : undefined}
        showWorkspaceButton={isAuthenticated}
      />
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans antialiased notion-shell text-neutral-800 dark:text-neutral-100 transition-colors ${theme}`}>
      {/* Sidebar workspace drawers */}
      <Sidebar
        pages={pages}
        currentPageId={currentPageId}
        onSelectPage={handleSelectPage}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        onToggleFavorite={handleToggleFavorite}
        onImportData={handleImportWorkspace}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userEmail={userEmail}
        onLogout={handleLogout}
        onOpenBilling={() => setBillingModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onViewLandpage={() => setViewingProductsPage(true)}
      />

      {/* Main viewport canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative transition-colors">
        <AnimatePresence mode="wait">
          {currentPage ? (
            <motion.div
              key={currentPage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-w-0 overflow-y-auto"
            >
              {/* Responsive Page Header */}
              <PageHeader
                currentPage={currentPage}
                pages={pages}
                onSelectPage={handleSelectPage}
                onToggleFavorite={handleToggleFavorite}
                onToggleDatabaseMode={handleToggleDatabaseMode}
                onDeletePage={handleDeletePage}
                onToggleSidebar={() => setSidebarOpen(true)}
                sidebarOpen={sidebarOpen}
                theme={theme}
                onToggleTheme={toggleTheme}
              />

              {/* Cover Banner & Emoji Selector */}
              <PageCover
                currentPage={currentPage}
                onUpdateCover={handleUpdatePageCover}
                onUpdateEmoji={handleUpdatePageEmoji}
              />

              {/* Dynamic rendering: Editor vs Database Tab Table */}
              <div className="flex-1 min-w-0 pt-16">
                {currentPage.isDatabase ? (
                  <DatabaseView
                    currentPage={currentPage}
                    pages={pages}
                    onUpdatePage={handleUpdateCurrentPage}
                    onUpdatePagesList={handleUpdatePagesList}
                  />
                ) : (
                  <BlockEditor
                    currentPage={currentPage}
                    pages={pages}
                    onUpdateBlocks={handleUpdatePageBlocks}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
              <div className="w-16 h-16 rounded-[22px] bg-white/80 border border-black/5 flex items-center justify-center text-neutral-400 mb-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)] backdrop-blur-sm">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">No open documents</h3>
              <p className="text-sm text-neutral-500 max-w-xs mt-1 leading-relaxed">Select a page from the sidebar or create a new note to begin.</p>
              <button
                id="empty-state-add-btn"
                onClick={() => handleAddPage(null, false)}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-neutral-800 shadow-sm transition-all cursor-pointer"
              >
                Create First Page
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Subscription Billing Modal with Stripe, Apple Pay, and Google Pay integrations */}
      <AnimatePresence>
        {billingModalOpen && (
          <BillingModal
            isOpen={billingModalOpen}
            onClose={() => setBillingModalOpen(false)}
            userEmail={userEmail}
          />
        )}
      </AnimatePresence>

      {/* Corporate Admin & Tenant Accounts Console overlay */}
      <AnimatePresence>
        {adminModalOpen && (
          <AdminBillingCenter
            isOpen={adminModalOpen}
            onClose={() => setAdminModalOpen(false)}
            currentUserEmail={userEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
