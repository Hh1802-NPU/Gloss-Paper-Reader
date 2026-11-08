/* One continuous research conversation per paper. Parent owns storage and AI transport. */
(function registerResearchConversation(scope) {
  'use strict'
  const KIND = 'research-conversation'
  const PLACEHOLDER = '写下你的想法……'
  const MAX_INPUT = 16000
  const COMPOSER_MAX_LINES = 6
  const EMPTY = Object.freeze([])
  function text(value) { return typeof value === 'string' ? value : '' }
  function clone(value, fallback) { try { return JSON.parse(JSON.stringify(value)) } catch { return fallback } }
  function now() { return new Date().toISOString() }
  function id() { return scope.crypto && typeof scope.crypto.randomUUID === 'function' ? scope.crypto.randomUUID() : 'research-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) }
  function hash(value) { let n = 2166136261; for (const char of String(value || '')) n = Math.imul(n ^ char.charCodeAt(0), 16777619); return (n >>> 0).toString(36) }
  function owned(value, paperId) { return value && (!value.paperId || value.paperId === paperId) && (!value.documentId || value.documentId === paperId) && (!value.anchor || !value.anchor.documentId || value.anchor.documentId === paperId) }
  function boundAnchor(value, paperId) { return value && value.documentId === paperId ? clone(value, null) : null }
  function sourceFor(value, paperId, pageBase) {
    if (!value || typeof value !== 'object' || !owned(value, paperId)) return null
    const quote = text(value.quote || value.text || value.original).trim()
    if (!quote) return null
    return { ...clone(value, {}), id: text(value.id) || 'source-' + hash(quote), paperId, quote, text: quote, identity: 'author', anchor: boundAnchor(value.anchor, paperId), pageBase: pageBase === 1 ? 1 : 0 }
  }
  function pendingFor(value, paperId) {
    const requestId = value && (typeof value.requestId === 'string' || Number.isFinite(value.requestId)) ? String(value.requestId) : ''
    if (!requestId) return null
    const source = sourceFor(value, paperId, 1)
    return source ? { ...source, requestId } : null
  }
  function boundContext(value, paperId) {
    if (!value || typeof value !== 'object' || !owned(value, paperId)) return null
    const next = clone(value, null)
    if (!next) return null
    next.sources = (Array.isArray(value.sources) ? value.sources : EMPTY).map((source) => sourceFor(source, paperId, 0)).filter(Boolean)
    return next
  }
  function sourcesFor(value, paperId) { return (boundContext(value, paperId) || {}).sources || [] }
  function peerDiscussionLabel(context) {
    const peer = context && context.peerDiscussion
    const count = peer && (Array.isArray(peer.turns) ? peer.turns.length : Number(peer.turns))
    return peer && /^(popup|selection|passage)$/.test(text(peer.scope)) && count > 0 ? '已参考划词讨论背景' : ''
  }
  function sourceLabel(source, compact) {
    const provided = [source.sourceLabel, source.figureLabel, source.tableLabel, source.sectionTitle, source.label, source.section, source.chapter, source.heading].map((value) => text(value).trim()).find(Boolean) || ''
    const label = provided || '原文'
    const page = Number.isFinite(source.page) ? source.page + (source.pageBase === 1 ? 0 : 1) : null
    if (compact && provided) return provided
    const marker = /^[SP]\d+$/.test(text(source.sourceId)) ? '[' + source.sourceId + '] ' : ''
    return (compact ? '' : marker) + label + (page && page > 0 && !/第\s*\d+\s*页/.test(label) ? ' · 第 ' + page + ' 页' : '')
  }
  function normalizeScroll(value) {
    if (Number.isFinite(value)) return { top: Math.max(0, value), atBottom: value === 0 }
    return { top: Math.max(0, Number(value && value.top) || 0), atBottom: !value || value.atBottom !== false }
  }
  function chatTurnTop(container, target, padding) {
      if (!container || !target || !container.getBoundingClientRect || !target.getBoundingClientRect) return null
      const a = container.getBoundingClientRect(), b = target.getBoundingClientRect()
      if (![a.top, b.top, Number(container.scrollTop)].every(Number.isFinite)) return null
      return Math.max(0, Number(container.scrollTop) + b.top - a.top - (Number(padding) || 0))
    }

  function fitComposerInput(node, paperId, draft) {
    if (!node || !node.style || !paperId || !node.dataset || node.dataset.paperId !== paperId || node.value !== draft) return false
    const previousTop = Number(node.scrollTop) || 0, previousLeft = Number(node.scrollLeft) || 0
    const computed = typeof scope.getComputedStyle === 'function' ? scope.getComputedStyle(node) : null
    const lineHeight = Number.parseFloat(computed && computed.lineHeight) || 22.1
    const padding = (Number.parseFloat(computed && computed.paddingTop) || 0) + (Number.parseFloat(computed && computed.paddingBottom) || 0)
    const minimum = Math.ceil(Math.max(34, lineHeight + padding)), maximum = Math.ceil(Math.max(minimum, lineHeight * COMPOSER_MAX_LINES + padding))
    node.style.height = '0px'; node.style.overflowY = 'hidden'
    const natural = Math.ceil(Number(node.scrollHeight) || 0), height = Math.min(maximum, Math.max(minimum, natural))
    node.style.maxHeight = maximum + 'px'; node.style.height = height + 'px'; node.style.overflowY = natural > maximum ? 'auto' : 'hidden'
    node.scrollTop = Math.max(0, Math.min(previousTop, Math.max(0, (Number(node.scrollHeight) || 0) - (Number(node.clientHeight) || height))))
    node.scrollLeft = previousLeft
    return { height, maximum, overflowY: node.style.overflowY }
  }
  function stamp(value) { const n = typeof value === 'number' ? value : Date.parse(value); return Number.isFinite(n) ? n : 0 }
  function validMessage(message, paperId) { return message && owned(message, paperId) && (message.role === 'user' || message.role === 'assistant') }
  function legacyDraft(items, paperId) {
    const workspace = items.find((item) => item && item.kind === 'research-workspace' && owned(item, paperId))?.workspace || {}
    const active = items.find((item) => item && item.id === workspace.activeId && !item.deletedAt && owned(item, paperId))
    if (active && active.draft) {
      if (text(active.draft.question).trim()) return active.draft.question
      if (text(active.draft.idea).trim() && active.draft.idea !== active.idea) return active.draft.idea
    }
    return text(workspace.composer && (workspace.composer.idea || workspace.composer.question))
  }
  function conversationFor(items, paperId, time) {
    const all = Array.isArray(items) ? items : EMPTY
    const previous = all.find((item) => item && item.kind === KIND && item.paperId === paperId)
    const created = time || now()
    const record = { ...(previous || {}), id: previous && previous.id || KIND + ':' + paperId, kind: KIND, version: 3, paperId,
      messages: clone(Array.isArray(previous && previous.messages) ? previous.messages : [], []),
      draft: previous ? text(previous.draft) : legacyDraft(all, paperId),
      pendingSource: previous && owned(previous.pendingSource, paperId) ? clone(previous.pendingSource, null) : null,
      scroll: normalizeScroll(previous && previous.scroll),
      handledSourceIds: Array.isArray(previous && previous.handledSourceIds) ? previous.handledSourceIds.filter((value) => typeof value === 'string') : [],
      legacyImportedKeys: Array.isArray(previous && previous.legacyImportedKeys) ? previous.legacyImportedKeys.filter((value) => typeof value === 'string') : [],
      createdAt: previous && previous.createdAt || created, updatedAt: previous && previous.updatedAt || created }
    const seen = new Set(record.legacyImportedKeys), additions = []
    for (const item of all) {
      if (!item || item === previous || !item.id || item.deletedAt || !owned(item, paperId) || item.kind === 'research-workspace') continue
      const chat = item.kind === KIND ? item.messages : item.chat
      if (!Array.isArray(chat)) continue
      chat.forEach((message, index) => {
        if (!validMessage(message, paperId)) return
        const value = text(message.text || message.content)
        if (!value.trim()) return
        const key = 'legacy:' + item.id + ':' + (text(message.id) || hash(message.role + '|' + value + '|' + index))
        if (seen.has(key)) return
        seen.add(key)
        additions.push({ ...clone(message, {}), id: key, paperId, role: message.role, text: value, legacy: true, legacyRecordId: item.id,
          createdAt: message.createdAt || item.createdAt || item.updatedAt || '', status: message.status === 'streaming' ? 'interrupted' : message.status || 'complete',
          context: boundContext(message.context, paperId), source: sourceFor(message.source, paperId, message.source && message.source.pageBase === 0 ? 0 : 1) })
      })
    }
    if (additions.length) {
      const old = record.messages.filter((message) => message && message.legacy)
      const current = record.messages.filter((message) => !message || !message.legacy)
      record.messages = [...old, ...additions].map((message, index) => ({ message, index })).sort((a, b) => stamp(a.message.createdAt) - stamp(b.message.createdAt) || a.index - b.index).map((entry) => entry.message).concat(current)
      record.legacyImportedKeys = [...seen]
    }
    return { record, changed: !previous || JSON.stringify(previous) !== JSON.stringify(record) }
  }
  function replaceConversation(items, record) {
    const all = Array.isArray(items) ? items : []
    const index = all.findIndex((item) => item && item.kind === KIND && item.paperId === record.paperId && item.id === record.id)
    return index < 0 ? [...all, record] : all.map((item, at) => at === index ? record : item)
  }
  function historyFor(record, paperId) {
    return (Array.isArray(record.messages) ? record.messages : EMPTY).filter((message) => validMessage(message, paperId)).map((message) => ({ ...clone(message, {}), text: text(message.text || message.content), content: text(message.text || message.content),
      context: boundContext(message.context, paperId), status: message.status === 'streaming' ? 'interrupted' : message.status || 'complete' }))
  }
  function sourceReferences(sources) {
    const references = new Map(), ambiguous = new Set()
    for (const source of sources) {
      const key = /^[SP]\d+$/.test(text(source.sourceId)) ? source.sourceId : /^[SP]\d+$/.test(text(source.id)) ? source.id : ''
      if (!key || ambiguous.has(key)) continue
      if (references.has(key)) { references.delete(key); ambiguous.add(key) }
      else references.set(key, source)
    }
    return references
  }
  function sourceText(value, link, path) {
    return text(value).split(/(\[[SP]\d+\])/g).map((part, index) => {
      const marker = part.match(/^\[([SP]\d+)\]$/)
      return marker && link ? link(marker[1], path + ':' + index) || part : part
    })
  }
  function inline(h, value, link, path) {
    return text(value).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).flatMap((part, index) => part.startsWith('**') && part.endsWith('**') ? [h('strong', { key: index }, sourceText(part.slice(2, -2), link, path + ':' + index))] : part.startsWith('`') && part.endsWith('`') ? [h('code', { key: index }, part.slice(1, -1))] : sourceText(part, link, path + ':' + index))
  }
  function messageBody(h, value, link) {
    return scope.__glossMath ? scope.__glossMath.render(value, prepared => messageBodyPlain(h, prepared, link)) : messageBodyPlain(h, value, link)
  }
  function messageBodyPlain(h, value, link) {
    return text(value).split(/\n\s*\n/).map((block, index) => {
      if (/^```/.test(block)) return h('pre', { key: index }, h('code', null, block.replace(/^```[^\n]*\n?/, '').replace(/\n?```\s*$/, '')))
      if (/^#{1,4}\s/.test(block)) return h('h4', { key: index }, inline(h, block.replace(/^#{1,4}\s+/, ''), link, index + ':heading'))
      const lines = block.split('\n')
      if (lines.every((line) => /^\s*[-*]\s+/.test(line))) return h('ul', { key: index }, lines.map((line, at) => h('li', { key: at }, inline(h, line.replace(/^\s*[-*]\s+/, ''), link, index + ':' + at))))
      if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) return h('ol', { key: index }, lines.map((line, at) => h('li', { key: at }, inline(h, line.replace(/^\s*\d+[.)]\s+/, ''), link, index + ':' + at))))
      return h('p', { key: index }, ...lines.flatMap((line, at) => at ? [h('br', { key: 'br' + at }), ...inline(h, line, link, index + ':' + at)] : inline(h, line, link, index + ':' + at)))
    })
  }

  const CSS = `
.lr-ideas.lr-research-conversation{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;position:relative;color:var(--dsw-alias-label-primary);font:13px/1.75 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;overflow:hidden}
.lr-content.is-workbench>.lr-ideas.lr-research-conversation{padding:0;overflow:hidden;overscroll-behavior:contain}
.lr-research-conversation *{box-sizing:border-box}.lr-research-conversation button,.lr-research-conversation textarea{font:inherit;color:inherit}.lr-research-conversation button{cursor:pointer}.lr-research-conversation button:disabled{opacity:.4;cursor:default}
.lr-research-conversation :is(button,textarea,[tabindex]):focus-visible{outline:2px solid var(--lr-shell-focus,var(--dsw-alias-brand-primary));outline-offset:3px}
.lr-ideas-conversation-head{flex:none;padding:15px 22px 9px}.lr-ideas-conversation-head h3{margin:0;font-size:15px;line-height:1.5;font-weight:600;letter-spacing:-.01em}
.lr-ideas-transcript{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:12px 22px 28px;display:flex;flex-direction:column;gap:20px;overflow-anchor:none}.lr-ideas-transcript.is-empty{padding:0}
.lr-ideas-message{max-width:96%;min-width:0;align-self:flex-start;flex:none}.lr-ideas-message.is-user{align-self:flex-end;max-width:86%}.lr-ideas-message-label{font-size:10.5px;color:var(--dsw-alias-label-secondary);line-height:1.5;margin-bottom:5px}.lr-ideas-message.is-user .lr-ideas-message-label{text-align:right}
.lr-ideas-message-body{font-size:13px;line-height:1.85;overflow-wrap:anywhere}.lr-ideas-message-body p{margin:0 0 9px}.lr-ideas-message-body p:last-child{margin-bottom:0}.lr-ideas-message-body h4{font-size:13px;line-height:1.7;font-weight:650;margin:12px 0 5px}.lr-ideas-message-body ul,.lr-ideas-message-body ol{padding-left:20px;margin:7px 0}.lr-ideas-message-body pre{overflow:auto;max-width:100%;padding:10px 12px;margin:9px 0;background:var(--lr-shell-raised,var(--dsw-alias-bg-layer-1));border-radius:10px;font-size:11px;line-height:1.7;white-space:pre-wrap}.lr-ideas-message-body code{font-size:.92em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.lr-ideas-message.is-user .lr-ideas-message-body{padding:9px 12px;border-radius:16px 16px 4px 16px;background:var(--dsw-alias-brand-primary,#007aff);color:#fff;white-space:pre-wrap}.lr-ideas-message.is-user .lr-ideas-message-body p{margin:0}
.lr-ideas-message-sources{display:flex;align-items:center;gap:4px 12px;flex-wrap:wrap;margin-top:8px}.lr-ideas-source-link{min-height:28px;border:0;background:none;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary))!important;padding:3px 0;font-size:10.5px!important;text-align:left;line-height:1.6}.lr-ideas-source-link:hover{text-decoration:underline;text-underline-offset:3px}
.lr-ideas-source-link.lr-ideas-source-inline{display:inline-flex;align-items:center;vertical-align:baseline;min-height:20px;max-width:min(22em,100%);padding:0 5px;margin:0 3px;border-radius:5px;line-height:1.6;background:color-mix(in srgb,var(--lr-shell-raised,var(--dsw-alias-bg-layer-1)) 72%,transparent);overflow-wrap:anywhere}
.lr-ideas-message-state,.lr-ideas-source-state{font-size:11px;line-height:1.65;color:var(--dsw-alias-label-secondary);margin-top:7px}.lr-ideas-message-state.is-error{color:var(--dsw-alias-state-error-primary)}
.lr-reply-waiting{display:inline-flex;align-items:center;justify-content:center;flex:none;vertical-align:middle;min-width:56px;min-height:28px;margin:3px 0;padding:8px 12px;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,var(--lr-shell-ground,var(--dsw-alias-bg-base,var(--dsw-alias-bg-overlay))));color:var(--dsw-alias-label-secondary);line-height:1}
.lr-reply-waiting-dots{display:inline-flex;align-items:center;gap:5px;pointer-events:none}.lr-reply-waiting-dot{display:block;width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.5;animation:lr-reply-pulse 1.1s ease-in-out infinite}.lr-reply-waiting-dot:nth-child(2){animation-delay:.13s}.lr-reply-waiting-dot:nth-child(3){animation-delay:.26s}
@keyframes lr-reply-pulse{0%,72%,100%{opacity:.4;transform:translateY(0)}36%{opacity:.85;transform:translateY(-2px)}}
@media(prefers-reduced-motion:reduce){.lr-reply-waiting-dot{animation:none;opacity:.55;transform:none}}
.lr-research-conversation form.lr-ideas-composer,.lr-root .lr-research-conversation form.lr-ideas-composer{position:relative;flex:none;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;column-gap:8px;row-gap:0;margin:0 16px max(12px,env(safe-area-inset-bottom));padding:8px 9px 8px 12px;border:1px solid color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 46%,transparent);border-radius:22px;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 18%,transparent);backdrop-filter:blur(24px) saturate(1.3);-webkit-backdrop-filter:blur(24px) saturate(1.3);box-shadow:inset 0 1px 1px rgb(255 255 255 / .78),inset 0 -1px 0 rgb(18 32 52 / .035),0 3px 12px rgb(18 32 52 / .035);transition:background .18s ease,box-shadow .18s ease,border-color .18s ease}
.lr-research-conversation form.lr-ideas-composer:focus-within,.lr-root .lr-research-conversation form.lr-ideas-composer:focus-within{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)));background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 23%,transparent);box-shadow:inset 0 1px 1px rgb(255 255 255 / .88),inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 6%,transparent),0 3px 13px rgb(18 32 52 / .045)}
.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible),.lr-root .lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible){outline:2px solid color-mix(in srgb,var(--lr-shell-focus,var(--dsw-alias-brand-primary)) 45%,transparent);outline-offset:2px}
.lr-ideas-composer::before{display:none}
.lr-ideas-composer-row{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;column-gap:8px;min-width:0}
.lr-research-conversation .lr-ideas-composer .lr-ideas-conversation-input,.lr-root .lr-research-conversation .lr-ideas-composer .lr-ideas-conversation-input{grid-column:1;display:block;align-self:stretch;width:100%;min-width:0;resize:none;min-height:34px;max-height:142px;height:auto;overflow-x:hidden;overflow-y:hidden;scrollbar-width:thin;padding:5px 0 4px;border:0;border-radius:0;outline:none;background:transparent;background-image:none;box-shadow:none;-webkit-appearance:none;appearance:none;color:var(--dsw-alias-label-primary);font-size:13px!important;line-height:1.7;caret-color:var(--dsw-alias-brand-primary)}
.lr-ideas-conversation-input::placeholder{color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));opacity:1}.lr-research-conversation .lr-ideas-composer .lr-ideas-conversation-input:focus-visible,.lr-root .lr-research-conversation .lr-ideas-composer .lr-ideas-conversation-input:focus-visible{outline:none}
.lr-ideas-composer-actions{grid-column:2;display:flex;align-self:end;align-items:center;justify-content:flex-end;padding:0 0 1px}.lr-ideas-send{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;min-width:32px;min-height:32px;padding:0;border:0;border-radius:50%;background:var(--dsw-alias-brand-primary,#007aff);color:#fff!important;line-height:1;box-shadow:inset 0 1px 0 rgb(255 255 255 / .18);transition:opacity .16s ease,transform .16s ease}.lr-ideas-send svg{display:block;width:17px;height:17px;flex:none;pointer-events:none}.lr-ideas-send:active{opacity:.8;transform:scale(.96)}.lr-ideas-send.is-stop{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-primary)!important}
.lr-ideas-pending{display:flex;align-items:center;gap:8px;min-width:0;margin:0 0 7px;padding:1px 0 7px}.lr-ideas-pending-source{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;background:transparent;padding:3px 1px;font-size:11px!important;text-align:left;color:var(--dsw-alias-label-secondary)!important;min-height:28px}.lr-ideas-pending-remove{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);font-size:18px!important;line-height:1}.lr-ideas-pending-remove:hover{background:var(--lr-shell-raised,var(--dsw-alias-bg-layer-1))}
.lr-ideas-composer>.lr-ideas-pending,.lr-ideas-composer>.lr-ideas-composer-error,.lr-ideas-composer>.lr-ideas-source-state{grid-column:1/-1}.lr-ideas-composer-error{font-size:11px;line-height:1.6;color:var(--dsw-alias-state-error-primary);margin:0 0 7px}
@media(max-width:720px){.lr-ideas-conversation-head{padding:12px 16px 7px}.lr-ideas-transcript{padding:10px 16px 24px}.lr-ideas-composer{margin-left:12px;margin-right:12px}.lr-ideas-message.is-user{max-width:90%}}
@media(pointer:coarse){.lr-ideas-send{width:44px;height:44px;min-width:44px;min-height:44px}.lr-ideas-pending-remove{width:40px;height:40px}.lr-ideas-source-link,.lr-ideas-pending-source{min-height:40px}}
@media(prefers-reduced-motion:reduce){.lr-research-conversation *{transition:none!important;scroll-behavior:auto!important}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-research-conversation form.lr-ideas-composer,.lr-root .lr-research-conversation form.lr-ideas-composer,.lr-research-conversation form.lr-ideas-composer:focus-within,.lr-root .lr-research-conversation form.lr-ideas-composer:focus-within{background:var(--dsw-alias-bg-overlay);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1)}.lr-ideas-composer::before{display:none}}
/* Clear editor; focus is a neutral material change, never a native outline. */
.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer{border:0!important;outline:0!important;border-radius:24px;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 16%,transparent);backdrop-filter:blur(18px) saturate(1.12);-webkit-backdrop-filter:blur(18px) saturate(1.12);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground,var(--dsw-alias-bg-overlay))) 66%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 2%,transparent)!important;transform:none;transition:background .22s ease,backdrop-filter .24s ease,box-shadow .24s ease}
.lr-research-conversation form.lr-ideas-composer:is(:focus,:focus-visible,:focus-within),.lr-root section.lr-research-conversation form.lr-ideas-composer:is(:focus,:focus-visible,:focus-within),.lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible){border:0!important;outline:0!important;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 26%,transparent);backdrop-filter:blur(22px) saturate(1.16);-webkit-backdrop-filter:blur(22px) saturate(1.16);box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground,var(--dsw-alias-bg-overlay))) 90%,transparent),0 2px 6px color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 3%,transparent)!important;transform:none}
.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input,.lr-root section.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input,.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input:is(:focus,:focus-visible),.lr-root section.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input:is(:focus,:focus-visible){border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;background:transparent!important;background-image:none!important;resize:none!important;appearance:none;-webkit-appearance:none;filter:none}
.lr-research-conversation form.lr-ideas-composer textarea::before,.lr-research-conversation form.lr-ideas-composer textarea::after{content:none!important;display:none!important}
@media(prefers-reduced-motion:reduce){.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer,.lr-research-conversation form.lr-ideas-composer:focus-within,.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within{background:var(--lr-shell-ground,var(--dsw-alias-bg-overlay));backdrop-filter:none;-webkit-backdrop-filter:none}}

.lr-research-conversation .lr-ideas-transcript,.lr-research-conversation .lr-ideas-message{overflow-anchor:none;scroll-behavior:auto}

`

  function createResearchIdeas(React) {
    const h = React.createElement, { useState, useEffect, useRef } = React
    function Component(props) {
      const paperId = text(props.paperId || props.paper && props.paper.id)
      const [, redraw] = useState(0), [error, setError] = useState(null), [location, setLocation] = useState(null)
      const inputRef = useRef(null), transcriptRef = useRef(null), mountedRef = useRef(true), propsRef = useRef(props)
      const sessionRef = useRef({ paperId, generation: 0 }), itemsRef = useRef(Array.isArray(props.ideas) ? props.ideas : []), inputItemsRef = useRef(props.ideas)
      const requestRef = useRef(null), locateRef = useRef(0), restoredRef = useRef(''), scrollRestoreRef = useRef(null), turnScrollRef = useRef(null), currentQuestionRef = useRef(null)
      const instanceRef = useRef(null)
      if (!instanceRef.current) instanceRef.current = id()
      if (sessionRef.current.paperId !== paperId) {
        if (requestRef.current && requestRef.current.controller) requestRef.current.controller.abort()
        requestRef.current = null
        sessionRef.current = { paperId, generation: sessionRef.current.generation + 1 }
        itemsRef.current = Array.isArray(props.ideas) ? props.ideas : []
        inputItemsRef.current = props.ideas; locateRef.current += 1; restoredRef.current = ''; turnScrollRef.current = null
      } else if (inputItemsRef.current !== props.ideas) {
        inputItemsRef.current = props.ideas; itemsRef.current = Array.isArray(props.ideas) ? props.ideas : []
      }
      propsRef.current = props
      const generation = sessionRef.current.generation, editable = Boolean(paperId && typeof props.onChange === 'function')
      const state = conversationFor(itemsRef.current, paperId), record = state.record
      const messages = record.messages.filter((message) => validMessage(message, paperId)).map((message, index) => ({ ...message, id: text(message.id) || 'message-' + hash(message.role + '|' + text(message.text || message.content) + '|' + index), text: text(message.text || message.content) })), busy = Boolean(requestRef.current)
      const pending = record.pendingSource, incoming = pendingFor(props.sourceQuote, paperId), inputId = instanceRef.current + '-research-input'
      const valid = () => mountedRef.current && sessionRef.current.paperId === paperId && sessionRef.current.generation === generation
      function fail(message) { if (valid()) setError({ paperId, text: message }) }
      function emit(next) {
        if (!valid() || !editable) return false
        itemsRef.current = next; redraw((value) => value + 1)
        try {
          const result = propsRef.current.onChange(next, { paperId })
          if (result && typeof result.catch === 'function') result.catch(() => fail('保存未完成，当前内容已保留，请稍后重试。'))
          return true
        } catch { fail('保存未完成，当前内容已保留，请稍后重试。'); return false }
      }
      function update(change) {
        if (!valid()) return false
        const previous = conversationFor(itemsRef.current, paperId).record
        const next = typeof change === 'function' ? change(previous) : { ...previous, ...change }
        return emit(replaceConversation(itemsRef.current, { ...next, kind: KIND, paperId, updatedAt: now() }))
      }
      function acknowledge(source, reason) {
        if (!valid() || typeof propsRef.current.onClearSource !== 'function') return
        try { propsRef.current.onClearSource({ paperId, requestId: source && source.requestId, reason }) } catch { /* Pending state is already preserved locally. */ }
      }
      function changeDraft(value) { update({ draft: value }); if (error && error.paperId === paperId) setError(null) }
      function clearSource() {
        const source = conversationFor(itemsRef.current, paperId).record.pendingSource
        if (update({ pendingSource: null })) acknowledge(source, 'removed')
      }
      function stop() {
        const request = requestRef.current
        if (!request || !valid()) return
        requestRef.current = null
        if (request.controller) request.controller.abort()
        update((previous) => ({ ...previous, messages: previous.messages.map((message) => message && message.id === request.messageId ? { ...message, status: 'interrupted' } : message) }))
        if (inputRef.current) inputRef.current.focus({ preventScroll: true })
      }
      async function send(event) {
        if (event) event.preventDefault()
        if (!valid() || requestRef.current || !editable) return
        const previous = conversationFor(itemsRef.current, paperId).record, question = previous.draft.trim()
        if (!question) return
        if (question.length > MAX_INPUT) { fail('内容请控制在 ' + MAX_INPUT + ' 字符以内，输入已保留。'); return }
        if (typeof propsRef.current.onDiscuss !== 'function') { fail('讨论服务暂未就绪，输入已保留。'); return }
        releaseScrollRestore()
        const source = previous.pendingSource && owned(previous.pendingSource, paperId) ? clone(previous.pendingSource, null) : null
        const history = historyFor(previous, paperId), messageId = id(), roundId = id(), time = now()
        const user = { id: id(), paperId, role: 'user', text: question, createdAt: time, roundId, status: 'complete', source }
        const assistant = { id: messageId, paperId, role: 'assistant', text: '', createdAt: time, roundId, status: 'streaming', context: null, origin: 'ai' }
        const controller = typeof scope.AbortController === 'function' ? new scope.AbortController() : null
        const token = { messageId, controller, generation }; requestRef.current = token
        turnScrollRef.current = { paperId, generation, userId: user.id, assistantId: messageId, pending: true }
        const before = itemsRef.current
        if (!update({ messages: [...previous.messages, user, assistant], draft: '', pendingSource: null, scroll: { ...normalizeScroll(previous.scroll), atBottom: false } })) {
          requestRef.current = null; turnScrollRef.current = null; itemsRef.current = before; redraw((value) => value + 1); return
        }
        if (source) acknowledge(source, 'sent')
        setError(null)
        let accumulated = '', context = null
        const alive = () => valid() && requestRef.current === token
        const onDelta = (part, nextContext) => {
          if (!alive()) return
          accumulated += typeof part === 'string' ? part : text(part && (part.delta || part.text))
          context = boundContext(nextContext || part && typeof part === 'object' && part.context, paperId) || context
          update((current) => ({ ...current, messages: current.messages.map((message) => message && message.id === messageId ? { ...message, text: accumulated, context } : message) }))
        }
        try {
          const result = await propsRef.current.onDiscuss({ idea: { id: previous.id, paperId, kind: KIND, idea: question, text: question, quote: source && source.quote || '' }, mode: 'discussion', question, history, source, evidence: source ? [clone(source, {})] : [], signal: controller && controller.signal }, onDelta)
          if (!alive()) return
          const answer = typeof result === 'string' ? result : text(result && result.text)
          const output = answer || accumulated, complete = Boolean(output.trim())
          context = boundContext(result && result.context, paperId) || context
          update((current) => ({ ...current, messages: current.messages.map((message) => message && message.id === messageId ? { ...message, text: complete ? output : '', context, status: complete ? 'complete' : 'error', error: complete ? null : '本次没有收到回答，可以继续发送问题。' } : message) }))
        } catch (failure) {
          if (alive()) update((current) => ({ ...current, messages: current.messages.map((message) => message && message.id === messageId ? { ...message, text: accumulated, context, status: 'error', error: '回复未完成，已生成内容保留，可以继续提问。' } : message) }))
        } finally {
          if (requestRef.current === token) { requestRef.current = null; if (valid()) redraw((value) => value + 1) }
        }
      }
      function keyDown(event) {
        if (event.key === 'Escape' && requestRef.current) { event.preventDefault(); stop(); return }
        if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
        event.preventDefault(); if (!requestRef.current) send()
      }
      async function locate(source, key) {
        if (!valid() || !source || !owned(source, paperId) || typeof propsRef.current.onLocate !== 'function') return
        const request = ++locateRef.current
        setLocation({ paperId, key, state: 'loading', text: '正在定位…' })
        try {
          const ok = await propsRef.current.onLocate(source.quote || source.text, { ...source, paperId, anchor: boundAnchor(source.anchor, paperId) })
          if (valid() && locateRef.current === request) setLocation({ paperId, key, state: ok === true ? 'found' : 'missing', text: ok === true ? '已定位原文。' : '暂未定位，请核对原文。' })
        } catch { if (valid() && locateRef.current === request) setLocation({ paperId, key, state: 'missing', text: '定位未完成，可稍后重试。' }) }
      }
      function sourceButton(source, key, label, isInline) {
        return h('button', { type: 'button', className: 'lr-ideas-source-link' + (isInline ? ' lr-ideas-source-inline' : ''), key, title: sourceLabel(source) + '\n' + source.quote, 'aria-label': '查看出处：' + (label || sourceLabel(source)), 'data-source-id': source.sourceId || source.id, 'data-source-inline': isInline ? 'true' : undefined, 'data-source-locate-key': key, disabled: !props.onLocate, onClick: () => locate(source, key) }, label || sourceLabel(source))
      }
      function onScroll(event) {
        if (!valid()) return
        const restoring = scrollRestoreRef.current
        if (restoring && restoring.paperId === paperId && restoring.generation === generation) return
        const node = event.currentTarget, current = normalizeScroll(conversationFor(itemsRef.current, paperId).record.scroll)
        const next = { top: Math.max(0, Math.round(node.scrollTop)), atBottom: node.scrollHeight - node.clientHeight - node.scrollTop < 32 }
        if (Math.abs(next.top - current.top) > 1 || next.atBottom !== current.atBottom) update({ scroll: next })
      }
      function releaseScrollRestore() {
        const restoring = scrollRestoreRef.current
        if (!restoring || restoring.paperId !== paperId || restoring.generation !== generation) return
        restoring.stop()
        restoredRef.current = paperId + ':' + generation
      }
      function transcriptScrollKey(event) {
        const target = event.target
        if (!(target && (target.isContentEditable || target.closest && target.closest('input,textarea,select,[contenteditable]'))) && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseScrollRestore()
      }
      useEffect(() => {
        mountedRef.current = true; restoredRef.current = ''; setError(null); setLocation(null)
        return () => { mountedRef.current = false; locateRef.current += 1; if (requestRef.current && requestRef.current.controller) requestRef.current.controller.abort(); requestRef.current = null }
      }, [paperId])
      useEffect(() => {
        if (!valid() || !editable) return
        const current = conversationFor(itemsRef.current, paperId)
        if (current.changed) emit(replaceConversation(itemsRef.current, current.record))
      }, [paperId, props.ideas, editable])
      useEffect(() => {
        if (!valid() || !editable || !incoming) return
        const current = conversationFor(itemsRef.current, paperId).record
        if (current.handledSourceIds.includes(incoming.requestId)) return
        update({ pendingSource: incoming, handledSourceIds: [...current.handledSourceIds, incoming.requestId] })
      }, [paperId, incoming && incoming.requestId, editable])
      useEffect(() => {
        const node = inputRef.current, draft = record.draft
        if (!valid() || !node) return
        const resize = () => {
          if (!valid() || inputRef.current !== node || node.dataset && node.dataset.paperId !== paperId || node.value !== draft) return
          const transcript = transcriptRef.current, previousTop = transcript && transcript.scrollTop
          if (!fitComposerInput(node, paperId, draft) || !valid()) return
          if (transcript) transcript.scrollTop = previousTop
        }
        resize()
        if (typeof scope.ResizeObserver !== 'function') return
        const widthOf = () => node.getBoundingClientRect ? node.getBoundingClientRect().width : Number(node.clientWidth) || 0
        let width = widthOf()
        const observer = new scope.ResizeObserver(() => { const next = widthOf(); if (Math.abs(next - width) > .5) { width = next; resize() } })
        observer.observe(node)
        return () => observer.disconnect()
      }, [paperId, record.draft])
      const last = messages[messages.length - 1]
      useEffect(() => {
        if (!valid() || !transcriptRef.current || restoredRef.current === paperId + ':' + generation || turnScrollRef.current) return undefined
        const node = transcriptRef.current, target = normalizeScroll(conversationFor(itemsRef.current, paperId).record.scroll).top
        let stopped = false, observer = null, frame = null
        const restoration = { paperId, generation, target, stop }
        function current() { return !stopped && valid() && scrollRestoreRef.current === restoration && transcriptRef.current === node }
        function stop() {
          if (stopped) return
          stopped = true
          if (observer) observer.disconnect()
          if (frame != null && typeof scope.cancelAnimationFrame === 'function') scope.cancelAnimationFrame(frame)
          if (scrollRestoreRef.current === restoration) scrollRestoreRef.current = null
        }
        function attempt() {
          frame = null
          if (!current()) return
          node.scrollTop = target
          // An early mount can clamp scrollTop before CSS/layout supplies the full
          // transcript height. Retain the saved target until the DOM accepts it.
          if (Math.abs(node.scrollTop - target) <= 1) { restoredRef.current = paperId + ':' + generation; stop() }
        }
        function queue() {
          if (!current() || frame != null) return
          if (typeof scope.requestAnimationFrame === 'function') frame = scope.requestAnimationFrame(attempt)
          else attempt()
        }
        scrollRestoreRef.current = restoration
        attempt()
        if (!stopped && typeof scope.ResizeObserver === 'function') {
          observer = new scope.ResizeObserver(queue); observer.observe(node)
          if (node.children) Array.from(node.children).forEach((child) => observer.observe(child))
        }
        return stop
      }, [paperId, generation, record.id, messages.length, last && last.id, last && last.text.length, last && last.status])
      useEffect(() => {
        if (!valid() || !transcriptRef.current) return
        const node = transcriptRef.current
        const turn = turnScrollRef.current
        if (turn && turn.paperId === paperId && turn.generation === generation && turn.pending && currentQuestionRef.current) {
          const top = chatTurnTop(node, currentQuestionRef.current, 8)
          if (top != null) { turn.pending = false; node.scrollTop = top; update({ scroll: { top: Math.max(0, Math.round(node.scrollTop)), atBottom: false } }) }
        }
        if (turn) restoredRef.current = paperId + ':' + generation
      }, [paperId, record.id, messages.length, last && last.id, last && last.text.length, last && last.status])

      return h('section', { className: 'lr-ideas lr-research-conversation', 'aria-label': '研究想法', 'data-paper-id': paperId }, h('style', null, CSS),
        h('header', { className: 'lr-ideas-conversation-head' }, h('h3', null, '研究想法')),
        h('div', { className: 'lr-ideas-transcript' + (!messages.length ? ' is-empty' : ''), ref: transcriptRef, role: 'log', 'aria-label': '研究想法对话', tabIndex: 0, onScroll, onWheel: releaseScrollRestore, onTouchStart: releaseScrollRestore, onPointerDown: releaseScrollRestore, onKeyDown: transcriptScrollKey }, messages.map((message) => {
          const user = message.role === 'user', active = !user && requestRef.current && requestRef.current.messageId === message.id
          const visibleText = Boolean(message.text.trim())
          const interrupted = !user && (message.status === 'interrupted' || message.status === 'streaming' && !active)
          const documentScope = !user && message.context?.documentScope
          const scopeMessage = text(documentScope?.message)
          const scopeBlocked = scopeMessage && ['unavailable', 'no-text'].includes(documentScope.mode)
          const sources = user ? [] : sourcesFor(message.context, paperId)
          const references = sourceReferences(sources)
          const body = !user && visibleText ? messageBody(h, message.text, (marker, path) => {
            const source = references.get(marker)
            if (!source) return null
            return sourceButton(source, message.id + ':inline:' + marker + ':' + path, sourceLabel(source, true), true)
          }) : null
          const motion = scope.__glossReplyMotion
          const revealedBody = !user && motion && motion.ReplyReveal ? h(motion.ReplyReveal, { ownerId: paperId, runId: message.id, streaming: Boolean(active && message.status === 'streaming'), status: message.status, selectionRoot: transcriptRef }, body) : body
          const turn = turnScrollRef.current, currentQuestion = user && turn && turn.paperId === paperId && turn.userId === message.id, currentAnswer = !user && turn && turn.paperId === paperId && turn.assistantId === message.id
          return h('article', { key: message.id, className: 'lr-ideas-message' + (user ? ' is-user' : ''), ref: currentQuestion ? currentQuestionRef : undefined, 'data-message-id': message.id, 'data-current-question': currentQuestion ? 'true' : undefined, style: currentAnswer ? { minHeight: Math.max(120, (transcriptRef.current && transcriptRef.current.clientHeight || 300) - 72) + 'px' } : undefined },
            !user || message.legacy ? h('div', { className: 'lr-ideas-message-label' }, (message.legacy ? '旧讨论 · ' : '') + (user ? '我的问题' : 'AI 建议')) : null,
            h('div', { className: 'lr-ideas-message-body' }, user ? message.text : h(React.Fragment, null, revealedBody, !visibleText && active && message.status === 'streaming' ? h('span', { className: 'lr-reply-waiting', role: 'status', 'aria-label': '等待回答', 'aria-live': 'polite' }, h('span', { className: 'lr-reply-waiting-dots', 'aria-hidden': true }, h('span', { className: 'lr-reply-waiting-dot' }), h('span', { className: 'lr-reply-waiting-dot' }), h('span', { className: 'lr-reply-waiting-dot' }))) : null)),
            user && message.source && owned(message.source, paperId) ? h('div', { className: 'lr-ideas-message-sources' }, sourceButton(message.source, message.id + ':attached', '原文引用 · ' + sourceLabel(message.source))) : null,
            scopeMessage && !(scopeBlocked && visibleText) ? h('p', { className: 'lr-ideas-message-state', role: 'status' }, scopeMessage) : null,
            message.status === 'error' && !scopeBlocked ? h('p', { className: 'lr-ideas-message-state is-error', role: 'status' }, message.error || '回复未完成，可以继续提问。') : interrupted ? h('p', { className: 'lr-ideas-message-state', role: 'status' }, '回复已中断，已有内容保留。') : null,
            location && location.paperId === paperId && location.key.startsWith(message.id + ':') ? h('p', { className: 'lr-ideas-source-state', role: 'status', 'data-source-locate-key': location.key, 'data-locate-state': location.state }, location.text) : null)
        })),
        h('form', { className: 'lr-ideas-composer', 'aria-label': '发送研究想法', onSubmit: send },
          pending ? h('div', { className: 'lr-ideas-pending', 'data-source-request-id': pending.requestId }, h('button', { type: 'button', className: 'lr-ideas-pending-source', title: pending.quote, disabled: !props.onLocate, onClick: () => locate(pending, 'pending') }, sourceLabel(pending) + ' · ' + pending.quote.replace(/\s+/g, ' ')), h('button', { type: 'button', className: 'lr-ideas-pending-remove', 'aria-label': '移除待发送的原文引用', title: '移除原文引用', onClick: clearSource }, '×')) : null,
          error && error.paperId === paperId ? h('p', { className: 'lr-ideas-composer-error', role: 'alert' }, error.text) : null,
          location && location.paperId === paperId && location.key === 'pending' ? h('p', { className: 'lr-ideas-source-state', role: 'status', 'data-source-locate-key': location.key, 'data-locate-state': location.state }, location.text) : null,
          h('div', { className: 'lr-ideas-composer-row' },
            h('textarea', { id: inputId, ref: inputRef, className: 'lr-ideas-conversation-input', 'aria-label': '研究想法输入', 'data-paper-id': paperId, rows: 1, value: record.draft, placeholder: PLACEHOLDER, disabled: !editable, onChange: (event) => changeDraft(event.target.value), onKeyDown: keyDown }),
            h('div', { className: 'lr-ideas-composer-actions' }, h('button', { type: busy ? 'button' : 'submit', className: 'lr-ideas-send' + (busy ? ' is-stop' : ''), disabled: !editable || !busy && (!record.draft.trim() || !props.onDiscuss), onClick: busy ? stop : undefined, 'aria-label': busy ? '停止生成' : '发送研究想法', title: busy ? '停止生成（Esc）' : '发送研究想法（Enter）' },
              h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, focusable: false }, busy ? h('rect', { x: 7, y: 7, width: 10, height: 10, rx: 2, fill: 'currentColor' }) : h('path', { d: 'M12 18V6m-5 5 5-5 5 5', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' })))))))
    }
    return { Component, CSS }
  }
  createResearchIdeas.version = 'continuous-conversation/3.6.1'
  createResearchIdeas.helpers = { KIND, PLACEHOLDER, MAX_INPUT, COMPOSER_MAX_LINES, chatTurnTop, fitComposerInput, owned, boundAnchor, sourceFor, pendingFor, boundContext, sourcesFor, peerDiscussionLabel, sourceLabel, sourceReferences, normalizeScroll, legacyDraft, conversationFor, replaceConversation, historyFor, validMessage }
  scope.LiteratureReaderIdeas = createResearchIdeas
})(typeof window !== 'undefined' ? window : globalThis)
