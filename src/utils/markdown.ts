/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Block, BlockType, Page } from '../types';

/**
 * Compiles a rich page blocks list into standard Markdown.
 */
export const compileToMarkdown = (page: Page): string => {
  const lines: string[] = [];
  lines.push(`# ${page.emoji || '📝'} ${page.title}`);
  lines.push('');

  page.blocks.forEach((block, index) => {
    switch (block.type) {
      case 'h1':
        lines.push(`# ${block.content}`);
        break;
      case 'h2':
        lines.push(`## ${block.content}`);
        break;
      case 'h3':
        lines.push(`### ${block.content}`);
        break;
      case 'quote':
        lines.push(`> ${block.content}`);
        break;
      case 'todo':
        lines.push(`- [${block.checked ? 'x' : ' '}] ${block.content}`);
        break;
      case 'bullet':
        lines.push(`- ${block.content}`);
        break;
      case 'number':
        lines.push(`${index + 1}. ${block.content}`);
        break;
      case 'callout':
        lines.push(`> **${block.calloutIcon || '💡'}** ${block.content}`);
        break;
      case 'code':
        lines.push(`\`\`\`${block.language || 'typescript'}\n${block.content}\n\`\`\``);
        break;
      case 'text':
      default:
        lines.push(block.content);
        break;
    }
  });

  return lines.join('\n\n');
};

/**
 * Compiles rich page blocks into inline-styled HTML for maximum compatibility
 * with word processors like Microsoft Word, Google Docs, Apple Pages, and Outlook.
 */
export const compileToWordCompatibleHtml = (page: Page): string => {
  const outerStyle = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.6; color: #2d3748; max-width: 650px; margin: 40px auto; padding: 20px;";
  const h1Style = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 24pt; font-weight: bold; color: #1a202c; margin-top: 0; margin-bottom: 24px; text-rendering: optimizeLegibility; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;";
  const blockH1Style = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 18pt; font-weight: bold; color: #2d3748; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 4px;";
  const blockH2Style = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 14pt; font-weight: bold; color: #4a5568; margin-top: 24px; margin-bottom: 10px;";
  const blockH3Style = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 12pt; font-weight: bold; color: #718096; margin-top: 20px; margin-bottom: 8px;";
  const pStyle = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.6; color: #2d3748; margin-top: 0; margin-bottom: 12px;";
  const blockquoteStyle = "font-family: Georgia, serif; font-size: 11.5pt; font-style: italic; border-left: 4px solid #cbd5e0; padding-left: 16px; margin: 16px 0; color: #4a5568; background-color: #f7fafc; padding-top: 10px; padding-bottom: 10px;";
  const calloutStyle = "font-family: Arial, Helvetica, 'Segoe UI', sans-serif; font-size: 11pt; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0; display: table; width: 100%; border-collapse: separate;";
  const calloutIconTd = "vertical-align: top; font-size: 18pt; padding-right: 14px; width: 30px;";
  const calloutTextTd = "vertical-align: middle; color: #2d3748; line-height: 1.5;";
  const todoCheckedBoxStyle = "font-size: 14pt; color: #4f46e5; font-family: Courier, monospace; font-weight: bold; margin-right: 8px; vertical-align: middle;";
  const todoUncheckedBoxStyle = "font-size: 14pt; color: #a0aec0; font-family: Courier, monospace; font-weight: bold; margin-right: 8px; vertical-align: middle;";
  const codeBlockContainerStyle = "font-family: Consolas, 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #1a202c; border-radius: 6px; padding: 16px; margin: 16px 0; color: #f7fafc; border: 1px solid #2d3748; white-space: pre-wrap; word-wrap: break-word;";

  const htmlParts: string[] = [];
  htmlParts.push(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${page.title}</title></head><body>`);
  htmlParts.push(`<div style="${outerStyle}">`);
  
  // Document Title
  htmlParts.push(`<h1 style="${h1Style}">${page.emoji || '📝'} ${page.title}</h1>`);

  page.blocks.forEach((block, index) => {
    switch (block.type) {
      case 'h1':
        htmlParts.push(`<h2 style="${blockH1Style}">${block.content}</h2>`);
        break;
      case 'h2':
        htmlParts.push(`<h3 style="${blockH2Style}">${block.content}</h3>`);
        break;
      case 'h3':
        htmlParts.push(`<h4 style="${blockH3Style}">${block.content}</h4>`);
        break;
      case 'text':
        htmlParts.push(`<p style="${pStyle}">${block.content || '&nbsp;'}</p>`);
        break;
      case 'quote':
        htmlParts.push(`<blockquote style="${blockquoteStyle}">${block.content}</blockquote>`);
        break;
      case 'bullet':
        htmlParts.push(`<ul style="margin-top: 0; margin-bottom: 12px; padding-left: 24px;"><li style="font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #2d3748; margin-bottom: 4px;">${block.content}</li></ul>`);
        break;
      case 'number':
        htmlParts.push(`<ol style="margin-top: 0; margin-bottom: 12px; padding-left: 24px;"><li style="font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #2d3748; margin-bottom: 4px;">${block.content}</li></ol>`);
        break;
      case 'todo':
        const iconStyle = block.checked ? todoCheckedBoxStyle : todoUncheckedBoxStyle;
        const textDecoration = block.checked ? "text-decoration: line-through; color: #a0aec0;" : "color: #2d3748;";
        htmlParts.push(`<div style="margin-bottom: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 11pt;"><span style="${iconStyle}">${block.checked ? '[X]' : '[ ]'}</span><span style="${textDecoration}">${block.content}</span></div>`);
        break;
      case 'callout':
        htmlParts.push(`<table style="${calloutStyle}"><tr><td style="${calloutIconTd}">${block.calloutIcon || '💡'}</td><td style="${calloutTextTd}">${block.content}</td></tr></table>`);
        break;
      case 'code':
        htmlParts.push(`<div style="${codeBlockContainerStyle}"><div style="color: #a0aec0; border-bottom: 1px solid #2d3748; padding-bottom: 4px; margin-bottom: 8px; font-size: 8pt; font-family: sans-serif;">${(block.language || 'typescript').toUpperCase()}</div><pre style="margin: 0; font-family: inherit;">${block.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>`);
        break;
    }
  });

  htmlParts.push('</div>');
  htmlParts.push('</body></html>');

  return htmlParts.join('\n');
};

/**
 * Splits a raw markdown string into structured Blocks.
 */
export const parseMarkdownToBlocks = (markdown: string): Block[] => {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent: string[] = [];

  const addBlock = (type: BlockType, content: string, extra: Partial<Block> = {}) => {
    blocks.push({
      id: Math.random().toString(36).substring(2, 11),
      type,
      content,
      ...extra,
    });
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Check code blocks boundary
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        addBlock('code', codeBlockContent.join('\n'), { language: codeBlockLanguage || 'typescript' });
        inCodeBlock = false;
        codeBlockLanguage = '';
        codeBlockContent = [];
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      addBlock('h1', trimmed.slice(2).trim());
    } else if (trimmed.startsWith('## ')) {
      addBlock('h2', trimmed.slice(3).trim());
    } else if (trimmed.startsWith('### ')) {
      addBlock('h3', trimmed.slice(4).trim());
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      const quoteBody = trimmed.slice(2).trim();
      // Check if it's a Callout mimicking markdown: > **💡** content or similar
      if (quoteBody.startsWith('**') && quoteBody.includes('**')) {
        const firstIndex = quoteBody.indexOf('**');
        const nextIndex = quoteBody.indexOf('**', firstIndex + 2);
        if (nextIndex > firstIndex) {
          const possibleEmoji = quoteBody.slice(firstIndex + 2, nextIndex).trim();
          // if it looks like an emoji or is a short indicator
          if (possibleEmoji.length <= 4) {
            const bodyText = quoteBody.slice(nextIndex + 2).trim();
            addBlock('callout', bodyText, { calloutIcon: possibleEmoji });
            return;
          }
        }
      }
      addBlock('quote', quoteBody);
    }
    // Todo checkboxes
    else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [  ] ')) {
      const p = trimmed.indexOf(']') + 1;
      addBlock('todo', trimmed.slice(p).trim(), { checked: false });
    } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      const p = trimmed.indexOf(']') + 1;
      addBlock('todo', trimmed.slice(p).trim(), { checked: true });
    }
    // Bullets
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      addBlock('bullet', trimmed.slice(2).trim());
    }
    // Numbered
    else if (/^\d+\.\s/.test(trimmed)) {
      const p = trimmed.indexOf('.') + 1;
      addBlock('number', trimmed.slice(p).trim());
    }
    // Skip empty lines unless needed
    else if (trimmed === '') {
      // Add empty text block if we don't have blocks yet, or skip to prevent spacing clutter
      if (blocks.length === 0) {
        addBlock('text', '');
      }
    }
    // Normal Text
    else {
      addBlock('text', line);
    }
  });

  // Cleanup/ensure there is at least one block
  if (blocks.length === 0) {
    blocks.push({
      id: Math.random().toString(36).substring(2, 11),
      type: 'text',
      content: '',
    });
  }

  return blocks;
};
