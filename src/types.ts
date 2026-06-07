/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BlockType =
  | 'text'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'number'
  | 'callout'
  | 'code'
  | 'quote';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  calloutIcon?: string;
}

export type PropertyType = 'text' | 'select' | 'checkbox' | 'date';

export interface TagOption {
  id: string;
  name: string;
  color: string; // Tailwind bg-color class
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options: TagOption[];
}

export interface DatabaseRow {
  id: string;
  cells: Record<string, any>; // propertyId -> value (string, boolean, tagValueId, etc.)
  linkedPageId: string; // Every database row is *also* a linked workspace page!
}

export interface Page {
  id: string;
  title: string;
  emoji: string;
  coverImage: string | null; // CSS background gradient, solid color, or image URL
  parentId: string | null;
  blocks: Block[];
  isFavorite: boolean;
  
  // Database aspects (if the page is configured as a Database View)
  isDatabase: boolean;
  dbProperties: DatabaseProperty[];
  dbRows: DatabaseRow[];
}

export interface AIResponse {
  result: string;
  error?: string;
}
