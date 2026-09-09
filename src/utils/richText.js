const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Wraps @Full Name occurrences that match a known workspace member in a highlight span.
function highlightMentions(escapedText, users = []) {
  const names = users
    .map((user) => user.name)
    .filter(Boolean)
    .map(escapeHtml)
    .sort((a, b) => b.length - a.length);
  if (!names.length) return escapedText;

  const pattern = new RegExp(`@(${names.map(escapeRegExp).join('|')})(?=\\b)`, 'g');
  return escapedText.replace(pattern, '<span class="rt-mention">@$1</span>');
}

// Markdown-lite: **bold**, *italic*, ~~strikethrough~~, `code`, [link](url). Input must already be HTML-escaped.
function applyInlineFormatting(escapedText = '') {
  return escapedText
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="rt-link">$1</a>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
}

/**
 * Renders plain text as safe, rich HTML:
 * Supports bold, italics, strikethrough, inline code, code blocks, headings (H1-H3),
 * bullet lists, numbered lists, checklists (- [ ] / - [x]), blockquotes (>), links, and @mentions.
 */
export function renderRichText(text, users = []) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  const withMentions = highlightMentions(escaped, users);

  const lines = withMentions.split('\n');
  const processedLines = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        processedLines.push(`<pre class="rt-code-block"><code>${codeBuffer.join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Checklists: - [x] or - [ ]
    if (/^-\s*\[x\]\s+(.*)$/i.test(line)) {
      const content = applyInlineFormatting(line.replace(/^-\s*\[x\]\s+/i, ''));
      processedLines.push(`<div class="rt-checklist-item checked"><span class="rt-checkbox">✓</span><span>${content}</span></div>`);
      continue;
    }
    if (/^-\s*\[\s*\]\s+(.*)$/i.test(line)) {
      const content = applyInlineFormatting(line.replace(/^-\s*\[\s*\]\s+/i, ''));
      processedLines.push(`<div class="rt-checklist-item"><span class="rt-checkbox">○</span><span>${content}</span></div>`);
      continue;
    }

    // Bullet lists: - item or * item
    if (/^[-*]\s+(.*)$/.test(line)) {
      const content = applyInlineFormatting(line.replace(/^[-*]\s+/, ''));
      processedLines.push(`<div class="rt-bullet-item"><span class="rt-bullet">•</span><span>${content}</span></div>`);
      continue;
    }

    // Numbered lists: 1. item
    if (/^(\d+)\.\s+(.*)$/.test(line)) {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      const content = applyInlineFormatting(match[2]);
      processedLines.push(`<div class="rt-numbered-item"><span class="rt-num">${match[1]}.</span><span>${content}</span></div>`);
      continue;
    }

    // Blockquote: > text
    if (/^&gt;\s*(.*)$/.test(line)) {
      const content = applyInlineFormatting(line.replace(/^&gt;\s*/, ''));
      processedLines.push(`<blockquote class="rt-blockquote">${content}</blockquote>`);
      continue;
    }

    // Headings: ### H3, ## H2, # H1
    if (/^###\s+(.*)$/.test(line)) {
      const content = applyInlineFormatting(line.replace(/^###\s+/, ''));
      processedLines.push(`<h4 class="rt-heading-3">${content}</h4>`);
      continue;
    }
    if (/^##\s+(.*)$/.test(line)) {
      const content = applyInlineFormatting(line.replace(/^##\s+/, ''));
      processedLines.push(`<h3 class="rt-heading-2">${content}</h3>`);
      continue;
    }
    if (/^#\s+(.*)$/.test(line)) {
      const content = applyInlineFormatting(line.replace(/^#\s+/, ''));
      processedLines.push(`<h2 class="rt-heading-1">${content}</h2>`);
      continue;
    }

    // Normal line with inline markdown
    processedLines.push(applyInlineFormatting(line));
  }

  if (inCodeBlock && codeBuffer.length) {
    processedLines.push(`<pre class="rt-code-block"><code>${codeBuffer.join('\n')}</code></pre>`);
  }

  return processedLines.join('<br/>');
}
