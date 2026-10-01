import { useEffect, useId, useRef, useState } from 'react';
import { IconClose, IconSend, IconRepeat } from './icons';
import { streamChatReply, SUGGESTED_PROMPTS } from '../api/chatbot';

const BOT_NAME = 'SafeNex AI';
const THINKING_STEPS = ['Thinking', 'Searching EHS guidelines', 'Composing answer'];

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  status: 'done',
  time: new Date(),
  content: `Hi there! I'm **${BOT_NAME}** — ask me anything about safety procedures, reporting, audits or training.`,
};

let nextId = 0;
const newId = () => `m${(nextId += 1)}`;

const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// AI "sparkles" mark: one large four-point star with two smaller twinkling ones.
export function AiGlyph({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="ai-glyph" fill="currentColor" aria-hidden="true">
      <path className="ai-glyph-main" d="M10 5.5c.8 4.3 3.2 6.7 7.5 7.5-4.3.8-6.7 3.2-7.5 7.5-.8-4.3-3.2-6.7-7.5-7.5 4.3-.8 6.7-3.2 7.5-7.5Z" />
      <path className="ai-glyph-sm" d="M18 2.5c.35 1.9 1.4 2.95 3.3 3.3-1.9.35-2.95 1.4-3.3 3.3-.35-1.9-1.4-2.95-3.3-3.3 1.9-.35 2.95-1.4 3.3-3.3Z" />
      <path className="ai-glyph-xs" d="M19.5 15.5c.25 1.3.95 2 2.25 2.25-1.3.25-2 .95-2.25 2.25-.25-1.3-.95-2-2.25-2.25 1.3-.25 2-.95 2.25-2.25Z" />
    </svg>
  );
}

// ---- tiny markdown subset: **bold**, *italic*, "- " bullets, "1. " lists ----

function renderInline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    // An unclosed marker mid-stream ("**Saf") — hide it until its pair arrives.
    return part.replace(/\*+/g, '');
  });
}

function parseBlocks(content) {
  const blocks = [];
  for (const line of content.split('\n')) {
    const bullet = line.match(/^\s*[-•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    const type = bullet ? 'ul' : numbered ? 'ol' : 'p';
    const text = bullet ? bullet[1] : numbered ? numbered[1] : line;
    const last = blocks[blocks.length - 1];
    if (type !== 'p') {
      if (last?.type === type) last.items.push(text);
      else blocks.push({ type, items: [text] });
    } else if (text.trim()) {
      blocks.push({ type: 'p', text });
    }
  }
  return blocks;
}

function RichText({ content, streaming }) {
  const blocks = parseBlocks(content);
  const cursor = streaming ? <span className="ai-cursor" aria-hidden="true" /> : null;
  if (!blocks.length) return cursor;
  return blocks.map((block, bi) => {
    const isLast = bi === blocks.length - 1;
    if (block.type === 'p') {
      return <p key={bi}>{renderInline(block.text, bi)}{isLast && cursor}</p>;
    }
    const List = block.type;
    return (
      <List key={bi}>
        {block.items.map((item, ii) => (
          <li key={ii}>{renderInline(item, `${bi}-${ii}`)}{isLast && ii === block.items.length - 1 && cursor}</li>
        ))}
      </List>
    );
  });
}

function ThinkingIndicator() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % THINKING_STEPS.length), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ai-thinking" role="status">
      <span className="ai-dots" aria-hidden="true"><i /><i /><i /></span>
      <span key={step} className="ai-thinking-text">{THINKING_STEPS[step]}…</span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/\*+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable — ignore */ }
  };
  return (
    <button type="button" className="ai-msg-action" onClick={copy} aria-label="Copy response">
      {copied ? (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'bot';
  const busy = msg.status === 'thinking' || msg.status === 'streaming';
  return (
    <div className={`ai-msg ai-msg-${msg.role}`}>
      {isBot && (
        <span className={`ai-avatar${busy ? ' is-busy' : ''}`}>
          <AiGlyph size={15} />
        </span>
      )}
      <div className="ai-msg-body">
        <div className="ai-bubble">
          {msg.status === 'thinking'
            ? <ThinkingIndicator />
            : isBot
              ? <RichText content={msg.content} streaming={msg.status === 'streaming'} />
              : <p>{msg.content}</p>}
        </div>
        {!busy && (
          <div className="ai-msg-meta">
            <span>{formatTime(msg.time)}</span>
            {msg.status === 'stopped' && <span className="ai-msg-stopped">· Stopped</span>}
            {msg.status === 'error' && <span className="ai-msg-stopped">· Failed to respond</span>}
            {isBot && msg.id !== 'welcome' && msg.content && <CopyButton text={msg.content} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(1);
  const abortRef = useRef(null);
  const openRef = useRef(open);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickToBottom = useRef(true);
  const panelId = useId();

  openRef.current = open;

  // Cancel any in-flight reply when the chatbot unmounts (e.g. on logout).
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!open) return undefined;
    setUnread(0);
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 220);
    return () => clearTimeout(t);
  }, [open]);

  // Follow the stream, unless the user has scrolled up to read something.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const onScroll = () => {
    const el = listRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  // Auto-grow the textarea up to ~4 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 104)}px`;
  }, [input]);

  const patchMessage = (id, patch) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)));
  };

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || busy) return;

    const botId = newId();
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'user', status: 'done', content: text, time: new Date() },
      { id: botId, role: 'bot', status: 'thinking', content: '', time: new Date() },
    ]);
    setInput('');
    setBusy(true);
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      for await (const chunk of streamChatReply(text, { signal: controller.signal })) {
        patchMessage(botId, (m) => ({ status: 'streaming', content: m.content + chunk }));
      }
      patchMessage(botId, { status: 'done', time: new Date() });
      if (!openRef.current) setUnread((n) => n + 1);
    } catch (err) {
      patchMessage(botId, (m) => (err.name === 'AbortError'
        ? { status: 'stopped', time: new Date(), content: m.content }
        : { status: 'error', time: new Date(), content: m.content || 'Sorry, something went wrong. Please try again.' }));
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const stop = () => abortRef.current?.abort();

  const reset = () => {
    stop();
    setMessages([{ ...WELCOME, time: new Date() }]);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const showSuggestions = messages.length === 1 && !busy;

  return (
    <div className={`ai-chat${open ? ' is-open' : ''}`}>
      <section
        id={panelId}
        className="ai-chat-panel"
        role="dialog"
        aria-label={`${BOT_NAME} assistant`}
        aria-hidden={!open}
        inert={!open}
      >
        <header className="ai-chat-head">
          <span className="ai-head-avatar">
            <AiGlyph size={20} />
          </span>
          <div className="ai-head-text">
            <strong>{BOT_NAME}</strong>
            <span className="ai-head-status">
              <i className={busy ? 'is-busy' : ''} />
              {busy ? 'Typing…' : 'Online · EHS Assistant'}
            </span>
          </div>
          <button type="button" className="ai-head-btn" onClick={reset} aria-label="New chat" title="New chat">
            <IconRepeat size={16} />
          </button>
          <button type="button" className="ai-head-btn" onClick={() => setOpen(false)} aria-label="Close chat" title="Close">
            <IconClose size={16} />
          </button>
        </header>

        <div className="ai-chat-list" ref={listRef} onScroll={onScroll} aria-live="polite">
          {messages.map((m) => <Message key={m.id} msg={m} />)}

          {showSuggestions && (
            <div className="ai-suggestions">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button key={p} type="button" style={{ animationDelay: `${0.15 + i * 0.07}s` }} onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="ai-chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            placeholder="Ask about safety, PPE, audits…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Message"
          />
          {busy ? (
            <button type="button" className="ai-send is-stop" onClick={stop} aria-label="Stop generating" title="Stop">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" /></svg>
            </button>
          ) : (
            <button type="submit" className="ai-send" disabled={!input.trim()} aria-label="Send message" title="Send">
              <IconSend size={17} />
            </button>
          )}
        </form>
        <div className="ai-chat-foot">AI responses may be inaccurate — follow your site&apos;s official EHS procedures.</div>
      </section>

      <button
        type="button"
        className="ai-fab"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Open ${BOT_NAME} assistant`}
        tabIndex={open ? -1 : 0}
      >
        <span className="ai-fab-ring" aria-hidden="true" />
        <AiGlyph size={28} />
        {unread > 0 && <span className="ai-fab-badge">{unread}</span>}
        <span className="ai-fab-tip" aria-hidden="true">Ask {BOT_NAME}</span>
      </button>
    </div>
  );
}
