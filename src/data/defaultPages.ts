/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Page, Block, DatabaseProperty } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to create IDs easily
const welcomePageId = 'welcome-page';
const databasePageId = 'project-db-page';
const ideasPageId = 'ideas-page';

const task1PageId = 'task-1-page';
const task2PageId = 'task-2-page';
const task3PageId = 'task-3-page';

const welcomeBlocks: Block[] = [
  {
    id: generateId(),
    type: 'h1',
    content: 'Welcome EPMA Workspace 🚀',
  },
  {
    id: generateId(),
    type: 'text',
    content:
      'This is a clean, hyper-responsive EPMA Workspace designed to bring elegant productivity to your browser. Everything you write is fully persistent on this device, and you can export or import your workspace at any time!',
  },
  {
    id: generateId(),
    type: 'callout',
    content: 'Pro-Tip: Press "/" on a new line to trigger the Slash Commands list, or click the edit icon beside any block to instantly change its visual style!',
    calloutIcon: '💡',
  },
  {
    id: generateId(),
    type: 'h2',
    content: 'Interactive Editor Features',
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Try completing this checklist item by clicking the checkbox',
    checked: true,
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Create a new line and type "/" to explore block types',
    checked: false,
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Select the AI Assist button to prompt Google Gemini for a revision!',
    checked: false,
  },
  {
    id: generateId(),
    type: 'h2',
    content: 'Integrated Coding Support',
  },
  {
    id: generateId(),
    type: 'code',
    content: 'const workspace = {\n  type: "EPMA Workspace",\n  aiPowered: true,\n  persistence: "localStorage",\n  features: ["Subpages", "Tables", "Markdown"]\n};\n\nconsole.log(`Welcome to ${workspace.type}!`);',
    language: 'javascript',
  },
  {
    id: generateId(),
    type: 'quote',
    content: 'Simplicity is the ultimate sophistication. Use the side drawer to nest pages inside pages for infinite organization.',
  },
];

const ideasBlocks: Block[] = [
  {
    id: generateId(),
    type: 'h1',
    content: '💡 Brainstorm Sandbox',
  },
  {
    id: generateId(),
    type: 'text',
    content: 'Use this sandbox to capture wild ideas, outline blog posts, or map system architectural decisions.',
  },
  {
    id: generateId(),
    type: 'h2',
    content: 'My Awesome Newsletter Ideas',
  },
  {
    id: generateId(),
    type: 'bullet',
    content: 'Revisiting the Swiss Modernist design philosophy in digital interfaces',
  },
  {
    id: generateId(),
    type: 'bullet',
    content: 'Why physical notebook journals complement digital workflows',
  },
  {
    id: generateId(),
    type: 'bullet',
    content: 'Optimizing local storage serialization for client-side React apps',
  },
  {
    id: generateId(),
    type: 'callout',
    content: 'Press "AI Assist" in the toolbar to ask Gemini 3.5 to draft an outline for any of those topics!',
    calloutIcon: '✨',
  },
];

// Tasks / Subpages that will be hooked into the Database Rows
const task1Blocks: Block[] = [
  {
    id: generateId(),
    type: 'h1',
    content: 'Core MVP Architecture Definition',
  },
  {
    id: generateId(),
    type: 'text',
    content: 'Write the primary types file, set up the component structure, and configure Express server endpoints.',
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Create workspace schema contracts in src/types.ts',
    checked: true,
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Setup Express with Google GenAI SDK and CORS handling',
    checked: true,
  },
];

const task2Blocks: Block[] = [
  {
    id: generateId(),
    type: 'h1',
    content: 'UI/UX Polish & Theme Pairing',
  },
  {
    id: generateId(),
    type: 'text',
    content: 'Ensure generous negative margins, custom shadows, elegant hover response colors, and native touch support.',
  },
  {
    id: generateId(),
    type: 'todo',
    content: 'Select modern editorial typography (Inter & JetBrains Mono)',
    checked: false,
  },
];

const task3Blocks: Block[] = [
  {
    id: generateId(),
    type: 'h1',
    content: 'Gemini Assistant Playground',
  },
  {
    id: generateId(),
    type: 'text',
    content: 'Construct safe client-to-server proxies to stream smart content edits directly into the visual blocks.',
  },
];

// Columns/Properties for the Project Database
const defaultDbProperties: DatabaseProperty[] = [
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
  {
    id: 'prop-done',
    name: 'Done',
    type: 'checkbox',
    options: [],
  },
  {
    id: 'prop-date',
    name: 'Target Date',
    type: 'date',
    options: [],
  },
];

export const getDefaultPages = (): Page[] => [
  {
    id: welcomePageId,
    title: 'Welcome EPMA Workspace',
    emoji: '🚀',
    coverImage: 'bg-gradient-to-r from-zinc-900 via-neutral-800 to-zinc-900',
    parentId: null,
    blocks: welcomeBlocks,
    isFavorite: true,
    isDatabase: false,
    dbProperties: [],
    dbRows: [],
  },
  {
    id: ideasPageId,
    title: 'Brainstorm Sandbox',
    emoji: '💡',
    coverImage: 'bg-gradient-to-r from-teal-800 to-indigo-900',
    parentId: null,
    blocks: ideasBlocks,
    isFavorite: false,
    isDatabase: false,
    dbProperties: [],
    dbRows: [],
  },
  // The Database Page
  {
    id: databasePageId,
    title: 'Project Roadmap Board',
    emoji: '📋',
    coverImage: 'bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-600',
    parentId: null,
    blocks: [
      {
        id: generateId(),
        type: 'text',
        content:
          'This is an inline workspace database. You can manage rows like standard pages—each row has columns/properties, AND custom blocks inside! Click any item title to edit its subpage blocks or modify properties in real-time.',
      },
    ],
    isFavorite: true,
    isDatabase: true,
    dbProperties: defaultDbProperties,
    dbRows: [
      {
        id: 'row-1',
        cells: {
          'prop-status': 'opt-co',
          'prop-priority': 'opt-pc',
          'prop-done': true,
          'prop-date': '2026-06-01',
        },
        linkedPageId: task1PageId,
      },
      {
        id: 'row-2',
        cells: {
          'prop-status': 'opt-ip',
          'prop-priority': 'opt-pb',
          'prop-done': false,
          'prop-date': '2026-06-15',
        },
        linkedPageId: task2PageId,
      },
      {
        id: 'row-3',
        cells: {
          'prop-status': 'opt-ns',
          'prop-priority': 'prop-pb', // Medium
          'prop-done': false,
          'prop-date': '2026-06-25',
        },
        linkedPageId: task3PageId,
      },
    ],
  },
  // Linked subpages for rows (parentId sets them as children of the Database!)
  {
    id: task1PageId,
    title: 'Core MVP Architecture Definition',
    emoji: '🧱',
    coverImage: null,
    parentId: databasePageId,
    blocks: task1Blocks,
    isFavorite: false,
    isDatabase: false,
    dbProperties: [],
    dbRows: [],
  },
  {
    id: task2PageId,
    title: 'UI/UX Polish & Theme Pairing',
    emoji: '🎨',
    coverImage: null,
    parentId: databasePageId,
    blocks: task2Blocks,
    isFavorite: false,
    isDatabase: false,
    dbProperties: [],
    dbRows: [],
  },
  {
    id: task3PageId,
    title: 'Gemini Assistant Playground',
    emoji: '🤖',
    coverImage: null,
    parentId: databasePageId,
    blocks: task3Blocks,
    isFavorite: false,
    isDatabase: false,
    dbProperties: [],
    dbRows: [],
  },
];
