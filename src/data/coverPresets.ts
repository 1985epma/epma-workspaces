/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CoverPreset {
  id: string;
  name: string;
  className: string;
}

export const COVER_PRESETS: CoverPreset[] = [
  {
    id: 'cool-ambient',
    name: 'Cool Ambient',
    className: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    className: 'bg-gradient-to-r from-amber-200 via-red-300 to-rose-400',
  },
  {
    id: 'nordic-forest',
    name: 'Nordic Forest',
    className: 'bg-gradient-to-r from-teal-800 via-emerald-800 to-green-900',
  },
  {
    id: 'cosmic-dark',
    name: 'Cosmic Violet',
    className: 'bg-gradient-to-r from-violet-800 via-purple-900 to-indigo-900',
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Gradient',
    className: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500',
  },
  {
    id: 'cyberpunk-cyberneon',
    name: 'Cyber Neon',
    className: 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500',
  },
  {
    id: 'graphite-clean',
    name: 'Graphite',
    className: 'bg-neutral-800 border-b border-neutral-700',
  },
  {
    id: 'blush-minimal',
    name: 'Blush Pink',
    className: 'bg-rose-100 border-b border-rose-200',
  },
];
