/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Image, Smile, Trash, RefreshCw } from 'lucide-react';
import { COVER_PRESETS } from '../data/coverPresets';
import { Page } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PageCoverProps {
  currentPage: Page | null;
  onUpdateCover: (cover: string | null) => void;
  onUpdateEmoji: (emoji: string) => void;
}

const EMOJI_PALETTE = [
  '📝', '🚀', '💡', '📋', '🧱', '🎨', '🤖', '✨', '🧠', '🎯',
  '🔥', '💻', '🌈', '🌲', '🌸', '⚡️', '⚙️', '🌸', '🔑', '🌍',
  '📅', '🍔', '💼', '📊', '📌', '🔍', '🎉', '✈️', '🥑', '🍕',
  '🐱', '🐼', '🦊', '🍀', '🍎', '🏆', '🍿', '🎲', '🎺', '🎨'
];

export default function PageCover({
  currentPage,
  onUpdateCover,
  onUpdateEmoji,
}: PageCoverProps) {
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);

  if (!currentPage) return null;

  const currentCoverClass = currentPage.coverImage || 'bg-neutral-100 hover:bg-neutral-200/60';
  const hasCover = !!currentPage.coverImage;

  const handleRandomCover = () => {
    const nextIndex = Math.floor(Math.random() * COVER_PRESETS.length);
    onUpdateCover(COVER_PRESETS[nextIndex].className);
  };

  const handleRemoveCover = () => {
    onUpdateCover(null);
    setCoverMenuOpen(false);
  };

  return (
    <div id={`page-cover-section-${currentPage.id}`} className="relative group/cover w-full">
      {/* Cover Image Banner */}
      <div
        id={`cover-banner-div-${currentPage.id}`}
        className={`h-48 md:h-56 w-full relative transition-all duration-300 ${currentCoverClass} overflow-hidden`}
      >
        {/* Cover Actions Overlay */}
        <div className="absolute right-4 bottom-4 opacity-0 group-hover/cover:opacity-100 flex items-center gap-1.5 transition-all duration-200 z-10 bg-white/90 backdrop-blur-xs p-1 rounded-lg shadow-md border border-neutral-200">
          {!hasCover ? (
            <button
              id="add-cover-banner"
              onClick={handleRandomCover}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 font-medium hover:bg-neutral-100 rounded transition cursor-pointer"
            >
              <Image className="w-3.5 h-3.5" />
              Add Cover
            </button>
          ) : (
            <>
              <button
                id="change-cover-banner"
                onClick={() => {
                  setCoverMenuOpen(!coverMenuOpen);
                  setEmojiMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 font-medium hover:bg-neutral-100 rounded transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Cover
              </button>
              <button
                id="remove-cover-banner"
                onClick={handleRemoveCover}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded transition cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
                Remove
              </button>
            </>
          )}
        </div>

        {/* Cover Chooser Dropdown */}
        <AnimatePresence>
          {coverMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-4 bottom-14 z-25 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 w-72"
            >
              <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider px-1">
                Select Cover Theme
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((p) => (
                  <button
                    id={`cover-preset-btn-${p.id}`}
                    key={p.id}
                    onClick={() => {
                      onUpdateCover(p.className);
                      setCoverMenuOpen(false);
                    }}
                    className="flex flex-col items-stretch text-left group/preset border border-neutral-100 rounded-lg overflow-hidden hover:border-neutral-300 transition shadow-xs"
                  >
                    <div className={`h-12 w-full ${p.className}`} />
                    <div className="p-1 px-2 text-[11px] text-neutral-600 font-medium group-hover/preset:text-neutral-900 truncate">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Emoji Selector Icon */}
      <div className="max-w-4xl mx-auto px-10 md:px-14 relative mr-auto">
        <div className="absolute -top-14 md:-top-16 left-10 md:left-14 z-10 flex">
          <div className="relative group/emoji">
            <button
              id={`emoji-trigger-btn-${currentPage.id}`}
              onClick={() => {
                setEmojiMenuOpen(!emojiMenuOpen);
                setCoverMenuOpen(false);
              }}
              title="Change page icon"
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white border border-neutral-200/80 shadow-lg hover:bg-neutral-50 flex items-center justify-center text-4xl md:text-5xl cursor-pointer select-none transition-transform hover:scale-105"
            >
              {currentPage.emoji || '📝'}
            </button>

            {/* Hover visual label for quick icon changes */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/emoji:opacity-100 text-[10px] font-medium bg-neutral-900 text-white px-2 py-0.5 rounded shadow pointer-events-none transition-all">
              Change Icon
            </div>

            {/* Emoji Selection Dropdown */}
            <AnimatePresence>
              {emojiMenuOpen && (
                <div className="absolute left-0 top-26 z-25">
                  {/* Backdrop toggle */}
                  <div className="fixed inset-0" onClick={() => setEmojiMenuOpen(false)} />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white rounded-xl shadow-2xl border border-neutral-200 p-3.5 w-72"
                  >
                    <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider px-1">
                      Choose Icon Emoji
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                      {EMOJI_PALETTE.map((emoji) => (
                        <button
                          id={`emoji-select-${emoji}`}
                          key={emoji}
                          onClick={() => {
                            onUpdateEmoji(emoji);
                            setEmojiMenuOpen(false);
                          }}
                          className="w-9 h-9 flex items-center justify-center text-xl hover:bg-neutral-100 hover:scale-110 rounded-lg cursor-pointer transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
