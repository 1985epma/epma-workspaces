/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Code,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Loader2,
  Globe,
  Settings
} from 'lucide-react';
import { Block, BlockType, Page } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BlockEditorProps {
  currentPage: Page | null;
  pages: Page[];
  onUpdateBlocks: (blocks: Block[]) => void;
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'json', 'bash'];

const BLOCK_TYPES_OPTIONS: { type: BlockType; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Plain Text', icon: AlignLeft, description: 'Start writing with plain, clean text' },
  { type: 'h1', label: 'Heading 1', icon: Heading1, description: 'Large section header' },
  { type: 'h2', label: 'Heading 2', icon: Heading2, description: 'Medium subsection header' },
  { type: 'h3', label: 'Heading 3', icon: Heading3, description: 'Small section header' },
  { type: 'todo', label: 'To-do List', icon: CheckSquare, description: 'Checkbox task item' },
  { type: 'bullet', label: 'Bulleted List', icon: List, description: 'Simple bulleted point' },
  { type: 'number', label: 'Numbered List', icon: ListOrdered, description: 'Sequential numbered entry' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Capture elegant accent quotes' },
  { type: 'callout', label: 'Callout', icon: AlertCircle, description: 'Visual banner for callout tips' },
  { type: 'code', label: 'Code Block', icon: Code, description: 'Write full syntax-highlighted code' },
];

export default function BlockEditor({
  currentPage,
  pages,
  onUpdateBlocks,
}: BlockEditorProps) {
  const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
  const [slashSearch, setSlashSearch] = useState('');
  const [aiMenuIndex, setAiMenuIndex] = useState<number | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual');
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [markdownCopyStatus, setMarkdownCopyStatus] = useState(false);

  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  // Bidirectional compilation to Markdown code block when switching mode
  useEffect(() => {
    if (editorMode === 'markdown' && currentPage) {
      import('../utils/markdown').then((mod) => {
        setRawMarkdown(mod.compileToMarkdown(currentPage));
      });
    }
  }, [editorMode, currentPage]);

  if (!currentPage) return null;

  const blocks = currentPage.blocks;

  const handleUpdateBlockContent = (id: string, value: string) => {
    // Check for slash commands trigger
    const updated = blocks.map((b, idx) => {
      if (b.id === id) {
        // --- Markdown typing shortcuts transform ---
        if (b.type === 'text') {
          if (value === '# ') return { ...b, type: 'h1' as BlockType, content: '' };
          if (value === '## ') return { ...b, type: 'h2' as BlockType, content: '' };
          if (value === '### ') return { ...b, type: 'h3' as BlockType, content: '' };
          if (value === '- ' || value === '* ') return { ...b, type: 'bullet' as BlockType, content: '' };
          if (value === '1. ') return { ...b, type: 'number' as BlockType, content: '' };
          if (value === '> ') return { ...b, type: 'quote' as BlockType, content: '' };
          if (value === '[] ') return { ...b, type: 'todo' as BlockType, content: '', checked: false };
        }

        // If content has just "/" on an empty line, or ends with "/"
        if (value === '/') {
          setSlashMenuIndex(idx);
          setSlashSearch('');
        } else if (value.includes('/')) {
          const slashPos = value.lastIndexOf('/');
          setSlashMenuIndex(idx);
          setSlashSearch(value.substring(slashPos + 1));
        } else {
          // Close slash menu if user removed "/"
          if (slashMenuIndex === idx) {
            setSlashMenuIndex(null);
          }
        }
        return { ...b, content: value };
      }
      return b;
    });
    onUpdateBlocks(updated);
  };

  const handleApplyBlockType = (index: number, newType: BlockType) => {
    const updated = [...blocks];
    const prevBlock = updated[index];
    
    // Clean up content if changing from slash command
    let cleanContent = prevBlock.content;
    if (cleanContent.endsWith('/')) {
      cleanContent = cleanContent.slice(0, -1);
    } else if (cleanContent.includes('/')) {
      const idx = cleanContent.lastIndexOf('/');
      cleanContent = cleanContent.slice(0, idx);
    }

    updated[index] = {
      ...prevBlock,
      type: newType,
      content: cleanContent,
      checked: newType === 'todo' ? false : undefined,
      language: newType === 'code' ? 'typescript' : undefined,
      calloutIcon: newType === 'callout' ? '💡' : undefined,
    };
    onUpdateBlocks(updated);
    setSlashMenuIndex(null);

    // Refocus this block
    setTimeout(() => {
      blockRefs.current[prevBlock.id]?.focus();
    }, 50);
  };

  const handleToggleTodo = (id: string) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, checked: !b.checked };
      }
      return b;
    });
    onUpdateBlocks(updated);
  };

  const handleUpdateBlockLanguage = (id: string, lang: string) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, language: lang };
      }
      return b;
    });
    onUpdateBlocks(updated);
  };

  const handleAddBlockBelow = (index: number) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'text',
      content: '',
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, newBlock);
    onUpdateBlocks(updated);

    // Wait and focus
    setTimeout(() => {
      blockRefs.current[newBlock.id]?.focus();
    }, 50);
  };

  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // Empty current block instead
      const updated = [{ ...blocks[0], content: '', type: 'text' as BlockType }];
      onUpdateBlocks(updated);
      return;
    }
    const updated = blocks.filter((_, idx) => idx !== index);
    onUpdateBlocks(updated);

    // Focus previous block
    const prevIndex = Math.max(0, index - 1);
    setTimeout(() => {
      blockRefs.current[blocks[prevIndex]?.id]?.focus();
    }, 50);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const updated = [...blocks];
    const item = updated[index];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    updated.splice(index, 1);
    updated.splice(targetIdx, 0, item);
    onUpdateBlocks(updated);

    setTimeout(() => {
      blockRefs.current[item.id]?.focus();
    }, 50);
  };

  // call Gemini AI API server proxy
  const handleAIAssist = async (index: number, promptType: string) => {
    const targetBlock = blocks[index];
    if (!targetBlock.content && promptType !== 'summarize') {
      setAiError('Block content is empty. Type some content first!');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    let systemInstruction = 'You are a professional writing editor and copywriter.';
    let promptText = '';

    if (promptType === 'expand') {
      promptText = `Please expand and complete this thought inside an EPMA editor block list: "${targetBlock.content}". Keep it cohesive and write exactly 1-2 powerful, natural sentences.`;
    } else if (promptType === 'polish') {
      promptText = `Rewrite this draft block with an elevated, pristine, and clear professional style. Sentence output must be smooth and grammatically perfect: "${targetBlock.content}"`;
    } else if (promptType === 'opposite') {
      promptText = `Provide the opposing argument or constructive critical critique of this thought in 1 concise paragraph: "${targetBlock.content}"`;
    } else if (promptType === 'translate_es') {
      promptText = `Translate the following text to clean, natural Spanish: "${targetBlock.content}"`;
    } else if (promptType === 'summarize') {
      const allText = blocks.map(b => `${b.type.toUpperCase()}: ${b.content}`).join('\n');
      promptText = `Provide a concise bulleted summary of this entire workspace document page. Keep it short and elegant:\n\n${allText}`;
    } else if (promptType === 'custom') {
      if (!aiCustomPrompt.trim()) {
        setAiError('Please enter a custom AI instructions prompt.');
        setAiLoading(false);
        return;
      }
      promptText = `Instruction: ${aiCustomPrompt}\n\nContext text from page block: "${targetBlock.content}"`;
    }

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, systemInstruction }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gemini Server error.');
      }

      if (data.result) {
        const updated = [...blocks];
        if (promptType === 'summarize') {
          // Append output as a callout block at the bottom
          const newSummaryBlock: Block = {
            id: Math.random().toString(36).substring(2, 11),
            type: 'callout',
            content: data.result,
            calloutIcon: '✨'
          };
          updated.push(newSummaryBlock);
        } else {
          // Replace current block content
          updated[index] = { ...targetBlock, content: data.result };
        }
        onUpdateBlocks(updated);
        setAiMenuIndex(null);
        setAiCustomPrompt('');
      } else {
        throw new Error('No generated text came back from the page copy writer.');
      }
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || 'Error occurred while contacting Gemini API. Ensure the key is declared.');
    } finally {
      setAiLoading(false);
    }
  };

  // Slash commands inline filtering list
  const filteredBlocksOptions = BLOCK_TYPES_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(slashSearch.toLowerCase()) ||
    o.type.toLowerCase().includes(slashSearch.toLowerCase())
  );

  const handleApplyMarkdownChanges = async () => {
    const mod = await import('../utils/markdown');
    const parsed = mod.parseMarkdownToBlocks(rawMarkdown);
    onUpdateBlocks(parsed);
    setEditorMode('visual');
  };

  const copyMarkdownOnly = async () => {
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      setMarkdownCopyStatus(true);
      setTimeout(() => setMarkdownCopyStatus(false), 2000);
    } catch (e) {
      alert('Failed to copy raw markdown style.');
    }
  };

  return (
    <div id={`blocks-canvas-${currentPage.id}`} className="max-w-4xl mx-auto px-6 md:px-14 py-10 space-y-3.5 relative text-neutral-800 dark:text-neutral-100 transition-colors">
      
      {/* Visual / Markdown Segmented Switching Header Tabs */}
      <div className="no-print flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 mb-6">
        <div className="flex bg-white/80 dark:bg-neutral-900/80 p-1 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
          <button
            id="editor-tab-visual"
            onClick={() => setEditorMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              editorMode === 'visual'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Visual Blocks
          </button>
          <button
            id="editor-tab-markdown"
            onClick={() => setEditorMode('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              editorMode === 'markdown'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Markdown Source Mode
          </button>
        </div>
        
        {editorMode === 'markdown' && (
          <div className="flex items-center gap-2">
            <button
              id="raw-copy-md-btn"
              onClick={copyMarkdownOnly}
              className={`px-2.5 py-1.5 border rounded-full text-[10px] font-medium cursor-pointer transition-all ${
                markdownCopyStatus
                  ? 'bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white border-black/5 dark:border-white/10'
                  : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-800'
              }`}
            >
              {markdownCopyStatus ? 'Copied MD Code!' : 'Copy raw Markdown'}
            </button>
            <button
              id="raw-apply-md-btn"
              onClick={handleApplyMarkdownChanges}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-150 dark:hover:bg-neutral-250 text-white dark:text-neutral-950 rounded-full text-[10px] font-medium shadow-sm cursor-pointer"
            >
              Apply Changes & Sync
            </button>
          </div>
        )}
      </div>

      {editorMode === 'markdown' ? (
        /* Markdown Raw Editor View Canvas */
        <div className="animate-fade-in space-y-4 pb-28 text-neutral-700 dark:text-neutral-200">
          <div className="p-4 bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/10 rounded-2xl leading-relaxed text-xs shadow-sm">
            <span className="font-semibold text-neutral-900 dark:text-white">Markdown synced workspace:</span> Draft, reorganize, or paste structure here, then apply changes to sync back into visual blocks.
          </div>
          <textarea
            id="raw-markdown-editor-box"
            value={rawMarkdown}
            onChange={(e) => setRawMarkdown(e.target.value)}
            placeholder="# Title..."
            rows={22}
            className="w-full font-mono text-sm leading-relaxed p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 text-neutral-800 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-neutral-300 outline-hidden tracking-normal shadow-sm resize-y"
          />
        </div>
      ) : (
        /* Normal Visual Block Editor list view */
        <div className="animate-fade-in">
          {/* Editor Title */}
          <div className="mb-6 group/title relative">
            <input
              id={`page-title-${currentPage.id}`}
              type="text"
              value={currentPage.title}
              onChange={(e) => {
                const updatedPage = { ...currentPage, title: e.target.value };
                // Handled at App container level
                onUpdateBlocks(currentPage.blocks);
                currentPage.title = e.target.value; // Immediate reactive UI reflect
              }}
              className="w-full text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white placeholder-neutral-300 border-0 outline-hidden tracking-tight bg-transparent"
              placeholder="Untitled Page"
            />
          </div>

      {/* List of Blocks */}
      <div className="space-y-2 relative pb-28">
        {blocks.map((block, index) => {
          const isSlashOpen = slashMenuIndex === index;
          const isAiOpen = aiMenuIndex === index;

          return (
            <div
              id={`block-wrapper-${block.id}`}
              key={block.id}
              className="relative group/block flex items-start gap-3 w-full"
            >
              {/* Block Action Controls Side-Hanger */}
              <div
                id={`controls-hanger-${block.id}`}
                className="absolute -left-12 top-1.5 opacity-0 group-hover/block:opacity-100 flex items-center gap-1 shrink-0 bg-white/90 dark:bg-neutral-950/90 border border-black/5 dark:border-white/10 p-0.5 rounded-full shadow-sm z-10 transition-opacity duration-150 backdrop-blur-xl"
              >
                <button
                  id={`block-add-${block.id}`}
                  onClick={() => handleAddBlockBelow(index)}
                  title="Add block below"
                  className="p-1 rounded-full hover:bg-black/5 text-neutral-500 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col">
                  <button
                    id={`block-up-${block.id}`}
                    onClick={() => handleMoveBlock(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 rounded-full hover:bg-black/5 text-neutral-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    id={`block-down-${block.id}`}
                    onClick={() => handleMoveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-0.5 rounded-full hover:bg-black/5 text-neutral-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                {/* Custom AI Assist trigger button */}
                <button
                  id={`block-ai-${block.id}`}
                  onClick={() => {
                    setAiMenuIndex(isAiOpen ? null : index);
                    setSlashMenuIndex(null);
                    setAiError(null);
                  }}
                  title="Ask Gemini assistant (AI)"
                  className="p-1 rounded-full hover:bg-black/5 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </button>
                <button
                  id={`block-delete-${block.id}`}
                  onClick={() => handleDeleteBlock(index)}
                  title="Delete block"
                  className="p-1 rounded-full hover:bg-black/5 text-neutral-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Individual Block Renderings */}
              <div id={`block-content-${block.id}`} className="flex-1 min-w-0">
                {block.type === 'text' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddBlockBelow(index);
                      } else if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        handleDeleteBlock(index);
                      }
                    }}
                    placeholder="Type '/' for block options, or start writing..."
                    rows={Math.max(1, block.content.split('\n').length)}
                    className="w-full text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-200 bg-transparent border-0 ring-0 outline-hidden resize-none placeholder-neutral-300 dark:placeholder-neutral-600 py-1"
                  />
                )}

                {block.type === 'h1' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(index);
                      }
                    }}
                    placeholder="Heading 1"
                    className="w-full text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700 py-2.5 tracking-tight bg-transparent"
                  />
                )}

                {block.type === 'h2' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(index);
                      }
                    }}
                    placeholder="Heading 2"
                    className="w-full text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700 py-2 tracking-tight bg-transparent"
                  />
                )}

                {block.type === 'h3' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(index);
                      }
                    }}
                    placeholder="Heading 3"
                    className="w-full text-lg md:text-xl font-medium text-neutral-700 dark:text-neutral-200 border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700 py-1 tracking-tight bg-transparent"
                  />
                )}

                {block.type === 'todo' && (
                  <div className="flex items-start gap-2.5 py-1">
                    <input
                      id={`check-input-${block.id}`}
                      type="checkbox"
                      checked={!!block.checked}
                      onChange={() => handleToggleTodo(block.id)}
                      className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-500 cursor-pointer mt-1 shrink-0 accent-neutral-800"
                    />
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlockBelow(index);
                        }
                      }}
                      placeholder="To-do Task Description"
                      rows={Math.max(1, block.content.split('\n').length)}
                      className={`w-full text-sm md:text-base leading-relaxed bg-transparent border-0 outline-hidden resize-none placeholder-neutral-300 dark:placeholder-neutral-600 py-0.5 ${
                        block.checked ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    />
                  </div>
                )}

                {block.type === 'bullet' && (
                  <div className="flex items-start gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 mt-2.5 shrink-0 select-none animate-fade-in" />
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlockBelow(index);
                        }
                      }}
                      placeholder="List item point"
                      rows={Math.max(1, block.content.split('\n').length)}
                      className="w-full text-sm md:text-base leading-relaxed bg-transparent text-neutral-700 dark:text-neutral-200 border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700"
                    />
                  </div>
                )}

                {block.type === 'number' && (
                  <div className="flex items-start gap-2 py-1">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono font-medium mt-1 select-none w-5 text-right">
                      {index + 1}.
                    </span>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlockBelow(index);
                        }
                      }}
                      placeholder="Numbered item point"
                      rows={Math.max(1, block.content.split('\n').length)}
                      className="w-full text-sm md:text-base leading-relaxed bg-transparent text-neutral-700 dark:text-neutral-200 border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700"
                    />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="border-l-3 border-neutral-400 dark:border-neutral-600 pl-4 py-1.5 my-1 bg-neutral-50/40 dark:bg-neutral-900/30">
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddBlockBelow(index);
                        }
                      }}
                      placeholder="“Capture wisdom”"
                      rows={Math.max(1, block.content.split('\n').length)}
                      className="w-full text-base md:text-lg italic leading-relaxed bg-transparent text-neutral-600 dark:text-neutral-300 border-0 outline-hidden resize-none placeholder-neutral-200 dark:placeholder-neutral-700"
                    />
                  </div>
                )}

                {block.type === 'callout' && (
                  <div className="flex gap-3 p-4 bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/60 dark:border-neutral-800 rounded-xl my-1.5">
                    <span className="text-xl select-none shrink-0 leading-none">{block.calloutIcon || '💡'}</span>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddBlockBelow(index);
                        }
                      }}
                      placeholder="Important banner tip message"
                      rows={Math.max(1, block.content.split('\n').length)}
                      className="w-full text-sm md:text-base leading-normal bg-transparent text-neutral-700 dark:text-neutral-200 border-0 outline-hidden resize-none placeholder-neutral-300 dark:placeholder-neutral-600"
                    />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden my-2.5">
                    {/* Header */}
                    <div className="h-9 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50">
                      <select
                        id={`code-lang-selector-${block.id}`}
                        value={block.language || 'typescript'}
                        onChange={(e) => handleUpdateBlockLanguage(block.id, e.target.value)}
                        className="text-[11px] font-mono font-medium text-neutral-400 bg-transparent border-0 outline-hidden cursor-pointer"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang} className="bg-neutral-950 text-neutral-300">
                            {lang.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Compiler Sandbox</span>
                    </div>

                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      rows={Math.max(4, block.content.split('\n').length)}
                      placeholder="// Write syntax script code block here"
                      className="w-full p-4 text-xs font-mono text-neutral-200 leading-relaxed bg-neutral-950/70 border-0 outline-hidden resize-none placeholder-neutral-700 scrollbar-thin"
                    />
                  </div>
                )}
              </div>

              {/* Floating Inline Slash Command Popover Drawer */}
              <AnimatePresence>
                {isSlashOpen && (
                  <div className="absolute left-0 top-10 z-[25]">
                    <div className="fixed inset-0" onClick={() => setSlashMenuIndex(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="relative w-72 max-h-64 overflow-y-auto bg-white rounded-xl shadow-2xl border border-neutral-200 p-1.5 scrollbar-thin"
                    >
                      <div className="text-[9px] font-bold text-neutral-400 px-3 py-1.5 uppercase tracking-wider">
                        Convert block element type
                      </div>

                      {filteredBlocksOptions.length === 0 ? (
                        <div className="text-xs text-neutral-400 italic p-3 text-center">No block types match</div>
                      ) : (
                        <div className="space-y-0.5">
                          {filteredBlocksOptions.map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <button
                                id={`slash-choice-${block.id}-${opt.type}`}
                                key={opt.type}
                                onClick={() => handleApplyBlockType(index, opt.type)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 text-left transition"
                              >
                                <div className="w-8 h-8 rounded bg-neutral-50/80 border border-neutral-100 flex items-center justify-center text-neutral-600">
                                  <Icon className="w-4 h-4 shrink-0" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-neutral-800">{opt.label}</div>
                                  <div className="text-[10px] text-neutral-400 truncate">{opt.description}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Circle Sparkle AI Assist Side-Panel Menu */}
              <AnimatePresence>
                {isAiOpen && (
                  <div className="absolute right-0 top-10 z-[25] w-80">
                    <div className="fixed inset-0" onClick={() => setAiMenuIndex(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="relative bg-white rounded-xl shadow-2xl border border-neutral-200/90 overflow-hidden"
                    >
                      {/* Gradient Header */}
                      <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span className="text-xs font-semibold text-neutral-800">Gemini 3.5 AI Assistant</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 bg-white/70 px-1.5 py-0.5 rounded border border-neutral-100">ONLINE</span>
                      </div>

                      {/* Menu Body recipe triggers */}
                      <div className="p-2 space-y-1">
                        <button
                          id={`ai-expand-${block.id}`}
                          onClick={() => handleAIAssist(index, 'expand')}
                          disabled={aiLoading}
                          className="w-full flex items-center gap-2.5 p-2 text-left rounded-lg text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Continue writing / Expand Block text
                        </button>

                        <button
                          id={`ai-polish-${block.id}`}
                          onClick={() => handleAIAssist(index, 'polish')}
                          disabled={aiLoading}
                          className="w-full flex items-center gap-2.5 p-2 text-left rounded-lg text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition font-medium"
                        >
                          <Quote className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Refine Professional Executive Tone
                        </button>

                        <button
                          id={`ai-translate-es-${block.id}`}
                          onClick={() => handleAIAssist(index, 'translate_es')}
                          disabled={aiLoading}
                          className="w-full flex items-center gap-2.5 p-2 text-left rounded-lg text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition font-medium"
                        >
                          <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Translate Block text into Spanish
                        </button>

                        <button
                          id={`ai-opposite-${block.id}`}
                          onClick={() => handleAIAssist(index, 'opposite')}
                          disabled={aiLoading}
                          className="w-full flex items-center gap-2.5 p-2 text-left rounded-lg text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition font-medium"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Critique and opposing perspective
                        </button>

                        <button
                          id={`ai-summary-${block.id}`}
                          onClick={() => handleAIAssist(index, 'summarize')}
                          disabled={aiLoading}
                          className="w-full flex items-center gap-2.5 p-2 text-left rounded-lg text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition font-medium"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Summarize entire page as outline callout
                        </button>

                        <div className="border-t border-neutral-100 my-1 py-1.5 px-2">
                          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Custom Task Prompt</label>
                          <div className="flex gap-1.5">
                            <input
                              id={`custom-prompt-${block.id}`}
                              type="text"
                              value={aiCustomPrompt}
                              onChange={(e) => setAiCustomPrompt(e.target.value)}
                              placeholder="Make it a bullet board, rewrite..."
                              disabled={aiLoading}
                              className="flex-1 text-xs border border-neutral-200 rounded px-2.5 py-1 outline-hidden focus:border-indigo-400 bg-neutral-50 placeholder-neutral-400 text-neutral-800"
                            />
                            <button
                              id={`run-custom-${block.id}`}
                              onClick={() => handleAIAssist(index, 'custom')}
                              disabled={aiLoading}
                              className="bg-neutral-900 text-white rounded p-1 hover:bg-neutral-800 font-medium text-xs shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              Go
                            </button>
                          </div>
                        </div>

                        {/* Error state */}
                        {aiError && (
                          <div className="p-2.5 text-[11px] text-red-600 bg-red-50 border border-red-100/50 rounded-lg max-h-24 overflow-y-auto">
                            {aiError}
                          </div>
                        )}

                        {/* Loading trigger state */}
                        {aiLoading && (
                          <div className="p-3 bg-neutral-50/50 flex items-center justify-center gap-2 rounded-lg">
                            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                            <span className="text-xs font-semibold text-emerald-700 animate-pulse">Gemini summarizing...</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
    )}
    </div>
  );
}
