import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { renderRichText } from '../../utils/richText';
import './RichTextEditor.css';

/**
 * Modern, high-performance Rich Text Editor (Jira / Atlassian / Linear style)
 *
 * Features:
 * - Text styling: Bold, Italic, Strikethrough, Inline Code
 * - Structure: Headings (H2), Blockquotes, Code Blocks, Divider
 * - Lists: Bullet Lists, Numbered Lists, Task Checklists
 * - Insertions: Links, @Mentions autocomplete
 * - Live Preview Tab: "Write" vs "Preview" markdown preview mode
 * - Full Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+E, etc.)
 * - Word & Character Counter + Markdown Helper footer
 */
function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Type here...',
  minRows = 4,
  mentionUsers = null,
  autoFocus = false,
}) {
  const textareaRef = useRef(null);
  const pendingSelectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [mentionQuery, setMentionQuery] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  // Calculate word and character count
  const stats = useMemo(() => {
    const trimmed = (value || '').trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = (value || '').length;
    return { words, chars };
  }, [value]);

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    if (pending && textareaRef.current && activeTab === 'write') {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pending.start, pending.end);
      pendingSelectionRef.current = null;
    }
  }, [value, activeTab]);

  // Auto-grow the textarea
  useLayoutEffect(() => {
    if (activeTab !== 'write') return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
  }, [value, activeTab, minRows]);

  // Wraps selected text with markers e.g. **bold** or `code`
  const wrapSelection = (marker, defaultText = 'text') => {
    if (activeTab !== 'write') setActiveTab('write');
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || defaultText;
    const next = `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`;
    pendingSelectionRef.current = {
      start: start + marker.length,
      end: start + marker.length + selected.length,
    };
    onChange(next);
  };

  // Prefixes the current line(s) e.g. "- ", "1. ", "## ", "> "
  const prefixLine = (prefix, defaultText = 'Item') => {
    if (activeTab !== 'write') setActiveTab('write');
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const before = value.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const after = value.slice(start);
    const lineEndOffset = after.indexOf('\n');
    const lineEnd = lineEndOffset === -1 ? value.length : start + lineEndOffset;
    const currentLine = value.slice(lineStart, lineEnd);

    let nextLine = '';
    if (currentLine.startsWith(prefix)) {
      nextLine = currentLine.slice(prefix.length);
    } else {
      nextLine = `${prefix}${currentLine || defaultText}`;
    }

    const next = `${value.slice(0, lineStart)}${nextLine}${value.slice(lineEnd)}`;
    const newCursor = lineStart + nextLine.length;
    pendingSelectionRef.current = { start: newCursor, end: newCursor };
    onChange(next);
  };

  // Wraps block with e.g. ```code block```
  const wrapBlock = (prefix, suffix, defaultContent = 'code here') => {
    if (activeTab !== 'write') setActiveTab('write');
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || defaultContent;
    const next = `${value.slice(0, start)}\n${prefix}${selected}${suffix}\n${value.slice(end)}`;
    const innerStart = start + prefix.length + 1;
    pendingSelectionRef.current = { start: innerStart, end: innerStart + selected.length };
    onChange(next);
  };

  // Inserts a link [text](url)
  const insertLink = () => {
    if (activeTab !== 'write') setActiveTab('write');
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || 'link title';
    const next = `${value.slice(0, start)}[${selected}](https://example.com)${value.slice(end)}`;
    const urlStart = start + selected.length + 3;
    pendingSelectionRef.current = { start: urlStart, end: urlStart + 19 };
    onChange(next);
  };

  // Inserts @ trigger
  const triggerMention = () => {
    if (activeTab !== 'write') setActiveTab('write');
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const next = `${value.slice(0, start)}@${value.slice(start)}`;
    pendingSelectionRef.current = { start: start + 1, end: start + 1 };
    onChange(next);
    setMentionQuery('');
  };

  const suggestions = useMemo(() => {
    if (mentionQuery === null || !mentionUsers?.length) return [];
    const query = mentionQuery.toLowerCase();
    return mentionUsers.filter((user) => user.name.toLowerCase().includes(query)).slice(0, 6);
  }, [mentionQuery, mentionUsers]);

  const detectMentionQuery = (text, caret) => {
    if (!mentionUsers) return;
    const upToCaret = text.slice(0, caret);
    const match = /(?:^|\s)@([\w][\w .]*)?$/.exec(upToCaret);
    if (match) {
      setMentionQuery(match[1] || '');
      setActiveSuggestion(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleChange = (event) => {
    onChange(event.target.value);
    detectMentionQuery(event.target.value, event.target.selectionStart);
  };

  const handleSelectionEvent = (event) => {
    detectMentionQuery(event.target.value, event.target.selectionStart);
  };

  const applyMention = (user) => {
    const el = textareaRef.current;
    if (!el || !user) return;
    const caret = el.selectionStart;
    const upToCaret = value.slice(0, caret);
    const mentionStart = upToCaret.lastIndexOf('@');
    if (mentionStart === -1) return;
    const next = `${value.slice(0, mentionStart)}@${user.name} ${value.slice(caret)}`;
    const cursor = mentionStart + user.name.length + 2;
    pendingSelectionRef.current = { start: cursor, end: cursor };
    onChange(next);
    setMentionQuery(null);
  };

  const handleKeyDown = (event) => {
    // Autocomplete navigation
    if (mentionQuery !== null && suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestion((index) => (index + 1) % suggestions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        applyMention(suggestions[activeSuggestion]);
        return;
      }
      if (event.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    // Keyboard shortcuts
    const isCmd = event.ctrlKey || event.metaKey;
    if (isCmd && !event.shiftKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      wrapSelection('**');
    } else if (isCmd && !event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      wrapSelection('*');
    } else if (isCmd && !event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      insertLink();
    } else if (isCmd && !event.shiftKey && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      wrapSelection('`');
    } else if (isCmd && event.shiftKey && event.key.toLowerCase() === 'x') {
      event.preventDefault();
      wrapSelection('~~');
    } else if (event.key === 'Tab' && !mentionQuery) {
      event.preventDefault();
      wrapSelection('  ', '');
    }
  };

  return (
    <div className="pro-rich-editor">
      {/* Editor Main Toolbar */}
      <div className="pro-rte-toolbar" role="toolbar" aria-label="Editor formatting tools">
        <div className="pro-rte-tools-left">
          {/* Text Style Group */}
          <div className="pro-rte-btn-group">
            <button
              type="button"
              className="pro-rte-btn"
              title="Bold (Ctrl+B)"
              onClick={() => wrapSelection('**')}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Italic (Ctrl+I)"
              onClick={() => wrapSelection('*')}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Strikethrough (Ctrl+Shift+X)"
              onClick={() => wrapSelection('~~')}
            >
              <del>S</del>
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Inline Code (Ctrl+E)"
              onClick={() => wrapSelection('`')}
            >
              {'</>'}
            </button>
          </div>

          <div className="pro-rte-divider" />

          {/* Heading & Quote Group */}
          <div className="pro-rte-btn-group">
            <button
              type="button"
              className="pro-rte-btn"
              title="Heading (##)"
              onClick={() => prefixLine('## ', 'Heading')}
            >
              <span className="pro-rte-h-icon">H</span>
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Quote (>)"
              onClick={() => prefixLine('> ', 'Quote text')}
            >
              <span className="pro-rte-quote-icon">”</span>
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Code Block (```)"
              onClick={() => wrapBlock('```\n', '\n```')}
            >
              <span className="pro-rte-codeblock-icon">{'{}'}</span>
            </button>
          </div>

          <div className="pro-rte-divider" />

          {/* List Group */}
          <div className="pro-rte-btn-group">
            <button
              type="button"
              className="pro-rte-btn"
              title="Bullet List (-)"
              onClick={() => prefixLine('- ')}
            >
              •≡
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Numbered List (1.)"
              onClick={() => prefixLine('1. ')}
            >
              1≡
            </button>
            <button
              type="button"
              className="pro-rte-btn"
              title="Task Checklist (- [ ])"
              onClick={() => prefixLine('- [ ] ')}
            >
              ☑
            </button>
          </div>

          <div className="pro-rte-divider" />

          {/* Link & Mention Group */}
          <div className="pro-rte-btn-group">
            <button
              type="button"
              className="pro-rte-btn"
              title="Insert Link (Ctrl+K)"
              onClick={insertLink}
            >
              🔗
            </button>
            {mentionUsers && (
              <button
                type="button"
                className="pro-rte-btn"
                title="Mention Teammate (@)"
                onClick={triggerMention}
              >
                @
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle (Write / Preview) */}
        <div className="pro-rte-mode-toggle">
          <button
            type="button"
            className={`pro-rte-tab-btn${activeTab === 'write' ? ' active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            Write
          </button>
          <button
            type="button"
            className={`pro-rte-tab-btn${activeTab === 'preview' ? ' active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="pro-rte-content-wrap">
        {activeTab === 'write' ? (
          <div className="pro-rte-input-area">
            <textarea
              ref={textareaRef}
              className="pro-rte-textarea"
              rows={minRows}
              value={value}
              placeholder={placeholder}
              autoFocus={autoFocus}
              onChange={handleChange}
              onKeyUp={handleSelectionEvent}
              onClick={handleSelectionEvent}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
            />

            {/* Mention Suggestions Popover */}
            {mentionQuery !== null && suggestions.length > 0 && (
              <ul className="pro-rte-mention-menu" role="listbox">
                <li className="pro-rte-mention-header">Mention team member</li>
                {suggestions.map((user, index) => (
                  <li
                    key={user.id}
                    role="option"
                    aria-selected={index === activeSuggestion}
                    className={`pro-rte-mention-item${index === activeSuggestion ? ' active' : ''}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      applyMention(user);
                    }}
                  >
                    <span className={`pro-rte-mention-avatar ${user.avatarColor || 'purple'}`}>
                      {user.initials}
                    </span>
                    <div className="pro-rte-mention-info">
                      <strong className="pro-rte-mention-name">{user.name}</strong>
                      <span className="pro-rte-mention-role">{user.role || 'Member'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          /* Live Markdown Preview */
          <div className="pro-rte-preview-area">
            {value.trim() ? (
              <div
                className="pro-rte-preview-content"
                dangerouslySetInnerHTML={{
                  __html: renderRichText(value, mentionUsers || []),
                }}
              />
            ) : (
              <p className="pro-rte-preview-empty">Nothing to preview yet. Start typing in the Write tab.</p>
            )}
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="pro-rte-footer">
        <span className="pro-rte-footer-hint">
          Markdown & @mentions supported
        </span>
        <span className="pro-rte-footer-stats">
          {stats.words} {stats.words === 1 ? 'word' : 'words'} · {stats.chars} chars
        </span>
      </div>
    </div>
  );
}

export default RichTextEditor;
