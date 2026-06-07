/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { Page, Block, DatabaseProperty, DatabaseRow, TagOption } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PageCover from './PageCover';
import BlockEditor from './BlockEditor';

interface DatabaseViewProps {
  currentPage: Page | null;
  pages: Page[];
  onUpdatePage: (updatedPage: Page) => void;
  onUpdatePagesList: (allPages: Page[]) => void;
}

export default function DatabaseView({
  currentPage,
  pages,
  onUpdatePage,
  onUpdatePagesList,
}: DatabaseViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('none');
  const [activeSubpageId, setActiveSubpageId] = useState<string | null>(null);

  if (!currentPage || !currentPage.isDatabase) return null;

  const dbProperties = currentPage.dbProperties || [];
  const dbRows = currentPage.dbRows || [];

  // Find status property
  const statusProperty = dbProperties.find((p) => p.id === 'prop-status');
  // Find priority property
  const priorityProperty = dbProperties.find((p) => p.id === 'prop-priority');

  // Mutate row cell
  const handleUpdateCell = (rowId: string, propertyId: string, value: any) => {
    const updatedRows = dbRows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [propertyId]: value,
          },
        };
      }
      return row;
    });

    onUpdatePage({
      ...currentPage,
      dbRows: updatedRows,
    });
  };

  // Add Row
  const handleAddRow = () => {
    const newPageId = `subpage-task-${Math.random().toString(36).substring(2, 11)}`;
    const newRowId = `row-${Math.random().toString(36).substring(1, 10)}`;

    const newSubpage: Page = {
      id: newPageId,
      title: 'New Database Entry',
      emoji: '📓',
      coverImage: null,
      parentId: currentPage.id,
      blocks: [
        {
          id: Math.random().toString(36).substring(2, 11),
          type: 'text',
          content: 'Add your custom task details here...',
        },
      ],
      isFavorite: false,
      isDatabase: false,
      dbProperties: [],
      dbRows: [],
    };

    // Pre-populate cells with default select options
    const defaultCells: Record<string, any> = {
      'prop-status': 'opt-ns', // Not Started
      'prop-priority': 'opt-pb', // Medium
      'prop-done': false,
      'prop-date': new Date().toISOString().substring(0, 10),
    };

    const newRow: DatabaseRow = {
      id: newRowId,
      cells: defaultCells,
      linkedPageId: newPageId,
    };

    // Append both the new workspace subpage AND the database row reference
    onUpdatePagesList([...pages, newSubpage]);
    onUpdatePage({
      ...currentPage,
      dbRows: [...dbRows, newRow],
    });

    // Auto-open slider
    setActiveSubpageId(newPageId);
  };

  // Delete Row
  const handleDeleteRow = (rowId: string, linkedPageId: string) => {
    const updatedRows = dbRows.filter((r) => r.id !== rowId);
    const updatedPages = pages.filter((p) => p.id !== linkedPageId);

    onUpdatePagesList(updatedPages);
    onUpdatePage({
      ...currentPage,
      dbRows: updatedRows,
    });
  };

  // Filter rows
  let filteredRows = [...dbRows];
  if (filterStatus !== 'all') {
    filteredRows = filteredRows.filter((row) => {
      if (filterStatus === 'todo') {
        return row.cells['prop-status'] === 'opt-ns';
      } else if (filterStatus === 'inprogress') {
        return row.cells['prop-status'] === 'opt-ip';
      } else if (filterStatus === 'done') {
        return row.cells['prop-status'] === 'opt-co' || row.cells['prop-done'] === true;
      }
      return true;
    });
  }

  // Sort rows based on page title or target dates
  if (sortKey !== 'none') {
    filteredRows.sort((a, b) => {
      const pageA = pages.find((p) => p.id === a.linkedPageId);
      const pageB = pages.find((p) => p.id === b.linkedPageId);
      const nameA = pageA?.title || '';
      const nameB = pageB?.title || '';

      if (sortKey === 'title-asc') {
        return nameA.localeCompare(nameB);
      } else if (sortKey === 'title-desc') {
        return nameB.localeCompare(nameA);
      } else if (sortKey === 'date-asc') {
        const dateA = a.cells['prop-date'] || '';
        const dateB = b.cells['prop-date'] || '';
        return dateA.localeCompare(dateB);
      } else if (sortKey === 'date-desc') {
        const dateA = a.cells['prop-date'] || '';
        const dateB = b.cells['prop-date'] || '';
        return dateB.localeCompare(dateA);
      }
      return 0;
    });
  }

  // Subpage details for Slider Panel
  const activeSubpage = pages.find((p) => p.id === activeSubpageId) || null;

  const handleUpdateSubpageBlocks = (updatedBlocks: Block[]) => {
    if (!activeSubpage) return;
    const updatedPages = pages.map((p) => {
      if (p.id === activeSubpage.id) {
        return { ...p, blocks: updatedBlocks };
      }
      return p;
    });
    onUpdatePagesList(updatedPages);
  };

  const handleUpdateSubpageCover = (cover: string | null) => {
    if (!activeSubpage) return;
    const updatedPages = pages.map((p) => {
      if (p.id === activeSubpage.id) {
        return { ...p, coverImage: cover };
      }
      return p;
    });
    onUpdatePagesList(updatedPages);
  };

  const handleUpdateSubpageEmoji = (emoji: string) => {
    if (!activeSubpage) return;
    const updatedPages = pages.map((p) => {
      if (p.id === activeSubpage.id) {
        return { ...p, emoji };
      }
      return p;
    });
    onUpdatePagesList(updatedPages);
  };

  return (
    <div id={`db-view-canvas-${currentPage.id}`} className="p-8 max-w-5xl mx-auto space-y-6">
      {/* DB controls header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Database Tracker
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Rows sync automatically with subpages. Click the title to edit visual blocks.</p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Status Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg">
            <button
              id="filter-all-btn"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer font-medium ${
                filterStatus === 'all' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500'
              }`}
            >
              All
            </button>
            <button
              id="filter-active-tasks"
              onClick={() => setFilterStatus('inprogress')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer font-medium ${
                filterStatus === 'inprogress' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500'
              }`}
            >
              In Progress
            </button>
            <button
              id="filter-done-tasks"
              onClick={() => setFilterStatus('done')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer font-medium ${
                filterStatus === 'done' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Sort Keys Selector */}
          <div className="relative">
            <select
              id="db-sort-dropdown"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="text-xs font-medium text-neutral-600 bg-white border border-neutral-200 outline-hidden focus:border-neutral-300 py-1.5 px-3.5 rounded-lg cursor-pointer"
            >
              <option value="none">Sort: Custom Default</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="date-asc">Target Date (Oldest)</option>
              <option value="date-desc">Target Date (Newest)</option>
            </select>
          </div>

          <button
            id="db-add-entry-btn"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>

      {/* Grid Database markup Table */}
      <div className="border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 divide-x divide-neutral-200 text-xs font-semibold text-neutral-500">
                <th className="p-3 w-12 text-center select-none">#</th>
                <th className="p-3">ITEM TITLE</th>
                <th className="p-3 w-40">PROGRESS STATUS</th>
                <th className="p-3 w-36">PRIORITY</th>
                <th className="p-3 w-40">TARGET DEADLINE</th>
                <th className="p-3 w-40">TASK COMPLETED</th>
                <th className="p-3 w-16 text-center">DELETE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-neutral-400 italic">
                    No database rows match selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const linkedPage = pages.find((p) => p.id === row.linkedPageId);
                  const title = linkedPage?.title || 'Untitled Subpage';
                  const emoji = linkedPage?.emoji || '📝';

                  return (
                    <tr key={row.id} className="hover:bg-neutral-50/50 transition duration-150 divide-x divide-neutral-100">
                      {/* Row index */}
                      <td className="p-3 text-center text-xs text-neutral-400 font-mono select-none">
                        {index + 1}
                      </td>

                      {/* Linked subpage Title editable / clickable */}
                      <td className="p-3 font-semibold text-neutral-800">
                        <div className="flex items-center gap-2 group/title justify-between">
                          <button
                            id={`opendb-slider-${row.id}`}
                            onClick={() => setActiveSubpageId(row.linkedPageId)}
                            className="flex items-center gap-2 text-left hover:text-indigo-600 transition truncate cursor-pointer flex-1"
                            title="Click to open page editor slider"
                          >
                            <span className="text-base shrink-0 leading-none">{emoji}</span>
                            <span className="truncate">{title}</span>
                          </button>
                          
                          {/* Slide Out open indicator */}
                          <button
                            id={`eye-icon-${row.id}`}
                            onClick={() => setActiveSubpageId(row.linkedPageId)}
                            className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-neutral-200 text-neutral-500 rounded transition cursor-pointer"
                            title="Open full page visualizer slider"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status select options cell */}
                      <td className="p-3">
                        <select
                          id={`status-cell-${row.id}`}
                          value={row.cells['prop-status'] || ''}
                          onChange={(e) => handleUpdateCell(row.id, 'prop-status', e.target.value)}
                          className={`w-full py-1 px-2.5 rounded-md text-xs font-medium border-0 outline-hidden cursor-pointer ${
                            statusProperty?.options.find((o) => o.id === row.cells['prop-status'])?.color || 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {statusProperty?.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Priority tag selector */}
                      <td className="p-3">
                        <select
                          id={`priority-cell-${row.id}`}
                          value={row.cells['prop-priority'] || ''}
                          onChange={(e) => handleUpdateCell(row.id, 'prop-priority', e.target.value)}
                          className={`w-full py-1 px-2.5 rounded-md text-xs font-medium border-0 outline-hidden cursor-pointer ${
                            priorityProperty?.options.find((o) => o.id === row.cells['prop-priority'])?.color || 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {priorityProperty?.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date selection field */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <input
                            id={`date-cell-${row.id}`}
                            type="date"
                            value={row.cells['prop-date'] || ''}
                            onChange={(e) => handleUpdateCell(row.id, 'prop-date', e.target.value)}
                            className="w-full bg-transparent border-0 outline-hidden p-0 text-xs text-neutral-800 font-mono cursor-pointer"
                          />
                        </div>
                      </td>

                      {/* Toggle Boolean Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          id={`checkbox-cell-${row.id}`}
                          type="checkbox"
                          checked={!!row.cells['prop-done']}
                          onChange={(e) => handleUpdateCell(row.id, 'prop-done', e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-500 cursor-pointer accent-neutral-800"
                        />
                      </td>

                      {/* Inner Row Deleter trigger */}
                      <td className="p-3 text-center">
                        <button
                          id={`eraser-cell-${row.id}`}
                          onClick={() => {
                            if (confirm(`Delete database entry row "${title}"? This also purges its subpage blocks.`)) {
                              handleDeleteRow(row.id, row.linkedPageId);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel slider showing nested Subpages details */}
      <AnimatePresence>
        {activeSubpageId && activeSubpage && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop cover blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSubpageId(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            />

            {/* Slide out editor Drawer Card */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-white shadow-2xl relative z-20 flex flex-col overflow-hidden"
            >
              {/* Slider controls header button */}
              <div className="h-14 border-b border-neutral-100 px-6 flex items-center justify-between bg-neutral-50 shrink-0">
                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-150 py-1 px-3 rounded font-medium border border-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  DATABASE ENTRY BLOCK WORKSPACE
                </div>
                <button
                  id="close-db-slider-panel"
                  onClick={() => setActiveSubpageId(null)}
                  className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-500 hover:text-neutral-900 transition flex items-center gap-1 cursor-pointer"
                  title="Close and save"
                >
                  <X className="w-4 h-4" />
                  <span className="text-xs font-semibold">Close</span>
                </button>
              </div>

              {/* Slider visual canvas content (includes Cover and custom page Editor!) */}
              <div className="flex-1 overflow-y-auto pb-10">
                <PageCover
                  currentPage={activeSubpage}
                  onUpdateCover={handleUpdateSubpageCover}
                  onUpdateEmoji={handleUpdateSubpageEmoji}
                />
                
                <div className="pt-24">
                  <BlockEditor
                    currentPage={activeSubpage}
                    pages={pages}
                    onUpdateBlocks={handleUpdateSubpageBlocks}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
