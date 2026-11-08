window.__ModuleLoader__.load({
  id: '@local/literature-reader',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef } = React
    const useLayoutEffect = React.useLayoutEffect || useEffect
        const LIBRARY_CSS = `.gl-library-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  justify-content: flex-end;
  background: rgba(18, 26, 36, .15);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 240ms ease, visibility 0s 300ms;
}
.gl-library-overlay.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transition-delay: 0s;
}
.gl-library-drawer {
  container: gloss-library / inline-size;
  box-sizing: border-box;
  --gl-bg: var(--dsw-alias-bg-base, #fff);
  --gl-text: var(--dsw-alias-label-primary, #20252c);
  --gl-muted: color-mix(in srgb, var(--gl-text) 70%, var(--gl-bg));
  --gl-line: color-mix(in srgb, var(--gl-text) 12%, var(--gl-bg));
  --gl-fill: color-mix(in srgb, var(--gl-text) 5%, var(--gl-bg));
  --gl-selected: color-mix(in srgb, var(--gl-text) 9%, var(--gl-bg));
  --gl-accent: #285aae;
  --gl-library-content-top: 65px;
  --gl-library-content-bottom: 65px;
  --gl-library-glass-bevel: var(--gloss-thin-bevel, inset 0 1px 0 rgba(255, 255, 255, .54));
  position: relative;
  width: min(1160px, 94%);
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-inline-start: 1px solid var(--gl-line);
  background: var(--gl-bg);
  color: var(--gl-text);
  box-shadow: -9px 0 32px rgba(25, 31, 42, .1);
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(.22,.72,.31,1);
  text-align: start;
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.gl-library-overlay.is-open .gl-library-drawer { transform: translateX(0); }
.gl-library-drawer.is-embedded { width: 100%; border-inline-start: 0; transform: none; transition: none; box-shadow: none; }
.gl-library-visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.gl-library-drawer *, .gl-library-drawer *::before, .gl-library-drawer *::after { box-sizing: border-box; }
.gl-library-drawer :is(h2,h3,p,dl,dd,ul) { margin: 0; }
.gl-library-drawer ul { list-style: none; padding: 0; }
.gl-library-drawer :is(button,input,select) { font: inherit; color: inherit; }
.gl-library-drawer button { cursor: pointer; }
.gl-library-drawer button:disabled { opacity: .55; cursor: default; }
.gl-library-drawer :is(button,input,select,a,summary):focus-visible { outline: 2px solid var(--gl-accent); outline-offset: 2px; }
.gl-library-drawer :is(h2,h3) { line-height: 1.3; color: var(--gl-text); }
.gl-library-drawer :is(input:not([type="checkbox"]),select) {
  display: block;
  min-width: 0;
  width: 100%;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--gl-line);
  border-radius: 10px;
  background: var(--gl-bg);
}
.gl-library-drawer input::placeholder { color: var(--gl-muted); }
.gl-library-inline-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.gl-library-workspace .gl-library-header {
  position: absolute;
  inset: 10px 0 auto;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  pointer-events: none;
}
.gl-library-header h2:focus { outline: none; }
.gl-library-top-glass { position: relative; display: flex; align-items: center; gap: 5px; width: min(100%, 327px); min-width: 0; padding: 3px 4px; pointer-events: auto; }
.gl-library-workspace .gl-library-top-glass .gl-library-nav.lr-tabs {
  flex: 1;
  width: auto;
  min-height: 36px;
  padding: 2px;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.gl-library-top-glass .gl-library-nav.lr-tabs::before { display: none; }
.gl-library-workspace .gl-library-top-glass .lr-tab { min-height: 32px; padding: 2px; }
.gl-library-workspace .gl-library-top-glass .lr-tab-lens { top: 1px; left: 2px; width: calc((100% - 4px) / 3); height: calc(100% - 2px); }
.gl-library-island, .gl-library-button.gl-library-island {
  border: 1px solid color-mix(in srgb, var(--gloss-thin-ink, var(--gl-text)) 10%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloss-thin-surface, var(--gl-bg)) 65%, transparent);
  box-shadow: var(--gl-library-glass-bevel), 0 2px 7px color-mix(in srgb, var(--gloss-thin-ink, var(--gl-text)) 6%, transparent);
  -webkit-backdrop-filter: blur(12px) saturate(1.12);
  backdrop-filter: blur(12px) saturate(1.12);
}
.gl-library-logo-slot { display: block; flex: 0 0 31px; width: 31px; height: 31px; }
.gl-library-logo-slot svg { display: block; width: 100%; height: 100%; }
.gl-library-dock {
  position: absolute;
  inset-inline-end: 14px;
  bottom: 13px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 2px;
  max-width: calc(100% - 28px);
  padding: 2px;
}
.gl-library-dock :is(.gl-library-button, .gl-library-icon-button) { min-height: 36px; padding-block: 5px; border-radius: 999px; background: transparent; white-space: nowrap; font-size: 13px; }
.gl-library-dock .gl-library-icon-button[aria-pressed="true"] { background: var(--gl-selected); }
.gl-library-button, .gl-library-icon-button, .gl-library-folder, .gl-library-document {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: var(--gl-fill);
  text-decoration: none;
  transition: background-color 120ms ease, box-shadow 120ms ease;
}
.gl-library-button:not(:disabled):hover, .gl-library-icon-button:not(:disabled):hover { background: var(--gl-selected); }
.gl-library-button.primary { color: #fff; background: #315d9d; font-weight: 600; }
.gl-library-button.primary:not(:disabled):hover { color: #fff; background: #254d88; }
.gl-library-button.quiet { background: transparent; }
.gl-library-button.danger { color: white; background: #a42d2d; }
.gl-library-button.danger:not(:disabled):hover { background: #892424; }
.gl-library-button.danger-text { color: var(--gl-danger, #a42d2d); }
.gl-library-icon-button { width: 42px; min-width: 42px; padding: 0; }
.gl-library-icon-button[aria-pressed="true"] { background: var(--gl-selected); border-color: var(--gl-line); }
.gl-library-drawer svg { flex: 0 0 auto; vertical-align: middle; }
.gl-library-nav.lr-tabs { width: min(100%, 380px); min-width: 0; }
.gl-library-nav .lr-tab { white-space: nowrap; }
.gl-library-nav.is-settings .lr-tab-lens { visibility: hidden; }
.gl-library-operation { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 23px; border-bottom: 1px solid var(--gl-line); color: var(--gl-muted); overflow-wrap: anywhere; }
.gl-library-workspace > .gl-library-operation { margin-top: var(--gl-library-content-top); }
.gl-library-operation > span { min-width: 0; }
.gl-library-operation .gl-library-operation-close { flex: 0 0 32px; width: 32px; min-width: 32px; min-height: 32px; background: transparent; }
.gl-library-operation.is-error, .gl-library-error { color: var(--gl-danger, #a42d2d); }
.gl-library-saved { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0,.92fr) minmax(0,1.08fr); grid-template-rows: minmax(0,1fr); }
.gl-library-list-panel, .gl-library-details { min-width: 0; min-height: 0; overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; padding: 16px 12px; }
.gl-library-workspace :is(.gl-library-list-panel, .gl-library-details, .gl-library-source-panel) { padding-top: var(--gl-library-content-top); scroll-padding-top: var(--gl-library-content-top); }
.gl-library-workspace :is(.gl-library-details, .gl-library-source-panel, .gl-library-document-list) { padding-bottom: var(--gl-library-content-bottom); scroll-padding-bottom: var(--gl-library-content-bottom); }
.gl-library-workspace .gl-library-list-panel { display: flex; flex-direction: column; overflow: visible; }
.gl-library-workspace .gl-library-document-list { min-height: 0; overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.gl-library-workspace .gl-library-operation ~ :is(.gl-library-saved, .gl-library-source-panel) { --gl-library-content-top: 14px; }
.gl-library-folder-head, .gl-library-list-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 9px; }
.gl-library-folder-head { color: var(--gl-muted); padding-left: 7px; font-size: 13px; }
.gl-library-folder-head .gl-library-icon-button { background: transparent; }
.gl-library-folder { width: 100%; min-width: 0; margin-bottom: 3px; padding-inline: 8px; justify-content: flex-start; background: transparent; }
.gl-library-folder:hover, .gl-library-folder[aria-pressed="true"] { background: var(--gl-selected); }
.gl-library-folder[aria-pressed="true"] { font-weight: 650; }
.gl-library-folder > span:first-of-type { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gl-library-folder-count { margin-inline-start: auto; flex: 0 0 auto; color: var(--gl-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.gl-library-list-panel { --gl-library-row-control-size: 38px; --gl-library-row-control-inset: 8px; padding-inline: 16px; }
.gl-library-list-search {
  --gl-library-row-control-size: 38px;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  width: var(--gl-library-row-control-size);
  min-width: var(--gl-library-row-control-size);
  height: var(--gl-library-row-control-size);
  overflow: hidden;
  color: var(--gl-muted);
  border-radius: 999px;
  background: var(--gl-fill);
  cursor: text;
  transition: width 210ms cubic-bezier(.2,.72,.28,1), box-shadow 120ms ease;
}
.gl-library-search-icon { display: grid; place-items: center; order: 2; width: var(--gl-library-row-control-size); flex: 0 0 auto; align-self: stretch; padding: 0; border: 0; border-radius: 50%; background: transparent; }
.gl-library-drawer .gl-library-search-icon:focus-visible { outline-offset: -3px; }
.gl-library-list-search:is(:focus-within, .has-query) { width: min(248px, 67%); }
.gl-library-list-search:focus-within { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gl-accent) 36%, transparent); }
.gl-library-drawer .gl-library-list-search input { flex: 1 1 0; min-height: var(--gl-library-row-control-size); padding-inline: 12px 0; border: 0; background: transparent; outline: none; color: var(--gl-text); opacity: 0; transition: opacity 140ms ease; }
.gl-library-drawer .gl-library-list-search:not(:is(:hover, :focus-within, .has-query)) input { padding-inline: 0; }
.gl-library-drawer .gl-library-list-search input:focus-visible { outline: none; }
.gl-library-search-submit { display: grid; flex: 0 0 30px; height: 30px; place-items: center; border: 0; border-radius: 50%; background: transparent; }
.gl-library-search-submit:hover { background: var(--gl-selected); }
.gl-library-list-search:is(:focus-within, .has-query) input { opacity: 1; }
@media (hover: hover) {
  .gl-library-list-search:hover { width: min(248px, 67%); }
  .gl-library-list-search:hover input { opacity: 1; }
}
.gl-library-list-heading { flex: 0 0 auto; margin: 0 var(--gl-library-row-control-inset) 8px 0; }
.gl-library-list-title { display: flex; align-items: center; min-width: 0; gap: 10px; }
.gl-library-list-heading h2 { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gl-library-zotero-workspace .gl-library-list-title .gl-library-compact-action { flex: 0 0 34px; min-height: 34px; padding: 0; border-radius: 50%; }
.gl-library-zotero-workspace .gl-library-list-title .gl-library-compact-action > span { display: none; }
.gl-library-folder-float { position: relative; flex: 0 0 auto; }
.gl-library-folder-float > .gl-library-button { min-height: 36px; padding: 5px 10px; border-radius: 999px; font-size: 13px; white-space: nowrap; }
.gl-library-workspace .gl-library-folder-menu {
  position: absolute;
  inset: calc(100% + 7px) auto auto 0;
  z-index: 5;
  display: block;
  width: min(225px, 66cqw);
  max-height: min(315px, 37vh);
  padding: 6px;
  overflow: auto;
  border: 1px solid var(--gl-line);
  border-radius: 16px;
  background: color-mix(in srgb, var(--gl-bg) 94%, transparent);
  box-shadow: var(--gl-library-glass-bevel), 0 5px 18px color-mix(in srgb, var(--gl-text) 9%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-3px) scale(.97);
  transform-origin: top left;
  transition: transform 170ms cubic-bezier(.2,.72,.28,1), opacity 150ms ease, visibility 0s 170ms;
}
.gl-library-folder-float[data-library-folders-open] .gl-library-folder-menu { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.gl-library-list-heading h2, .gl-library-source-panel h2, .gl-library-source-toolbar h2 { font-size: 17px; font-weight: 650; }
.gl-library-document-list > li { margin-bottom: 7px; }
.gl-library-row-frame {
  --gl-library-swipe-width: min(108px, calc(100% - 44px));
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--gl-line);
  border-radius: 16px;
  touch-action: pan-y;
  background: var(--gl-fill);
}
.gl-library-row-frame:has(.gl-library-swipe-action:nth-child(3)) { --gl-library-swipe-width: min(156px, calc(100% - 44px)); }
.gl-library-row-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  min-width: 0;
  min-height: 67px;
  background: color-mix(in srgb, var(--gl-bg) 91%, var(--gl-fill));
  transform: translateX(var(--gl-library-swipe-offset, 0px));
  transition: transform 240ms cubic-bezier(.22,.72,.31,1), background-color 120ms ease;
}
.gl-library-document-list li.is-selected .gl-library-row-main,
.gl-library-row-main:hover { background: color-mix(in srgb, var(--gl-bg) 35%, var(--gl-selected)); }
.gl-library-document-list li[data-actions-open] .gl-library-row-main {
  transform: translateX(var(--gl-library-swipe-offset, calc(-1 * var(--gl-library-swipe-width))));
}
.gl-library-document-list li[data-actions-open][data-actions-side="left"] .gl-library-row-main {
  transform: translateX(var(--gl-library-swipe-offset, var(--gl-library-swipe-width)));
}
.gl-library-row-frame.is-swiping { user-select: none; }
.gl-library-row-frame.is-swiping .gl-library-row-main { transition: none; }
.gl-library-row-tray {
  position: absolute;
  inset: 0 0 0 auto;
  width: var(--gl-library-swipe-width);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  background: linear-gradient(155deg, color-mix(in srgb, var(--gl-bg) 52%, var(--gl-fill)), var(--gl-selected));
}
.gl-library-document-list li[data-actions-side="left"] .gl-library-row-tray {
  inset: 0 auto 0 0;
}
.gl-library-row-tray .gl-library-swipe-action {
  --gl-library-action-fill: color-mix(in srgb, var(--gl-bg) 88%, var(--gl-line));
  --gl-library-action-ink: var(--gl-text);
  display: flex;
  flex: 0 1 46px;
  min-width: 0;
  min-height: 54px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  border-radius: 12px;
  padding: 0;
  background: transparent;
  text-decoration: none;
  white-space: nowrap;
  color: var(--gl-library-action-ink);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.15;
}
.gl-library-swipe-action > svg {
  width: min(100%, 36px);
  height: 36px;
  padding: 9px;
  border-radius: 50%;
  background: var(--gl-library-action-fill);
  box-shadow: var(--gl-library-glass-bevel), 0 1px 5px color-mix(in srgb, var(--gl-text) 9%, transparent);
  transition: scale 160ms cubic-bezier(.22,.72,.31,1), background-color 150ms ease;
}
.gl-library-swipe-action > span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.gl-library-swipe-action:is(.danger,.is-danger,.danger-text,[data-action="delete"]) { --gl-library-action-fill: #d83841; --gl-library-action-ink: var(--gl-danger, #a42d2d); }
.gl-library-swipe-action:is(.danger,.is-danger,.danger-text,[data-action="delete"]) > svg { color: #fff; }
.gl-library-swipe-action:not(:disabled):hover > svg { background: color-mix(in srgb, var(--gl-library-action-fill) 86%, var(--gl-text)); }
.gl-library-swipe-action:not(:disabled):active > svg { scale: .92; }
.gl-library-swipe-action:focus-visible { outline-offset: 0; }
.gl-library-document { flex: 1; min-width: 0; padding: 11px 8px; text-align: start; align-items: flex-start; justify-content: flex-start; background: transparent; }
.gl-library-document svg { margin-top: 2px; color: var(--gl-muted); }
.gl-library-document > span { display: grid; min-width: 0; gap: 4px; }
.gl-library-document strong { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow-wrap: anywhere; line-height: 1.35; font-weight: 630; }
.gl-library-document small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--gl-muted); font-size: 12px; }
.gl-library-excerpt { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow-wrap: anywhere; color: var(--gl-muted); font-size: 12px; }
.gl-library-row-buttons { display: flex; flex: 0 0 auto; padding: 7px calc(var(--gl-library-row-control-inset) - 1px) 7px 0; }
.gl-library-row-frame .gl-library-row-more {
  width: var(--gl-library-row-control-size);
  min-width: var(--gl-library-row-control-size);
  min-height: var(--gl-library-row-control-size);
  border-radius: 50%;
  border-color: color-mix(in srgb, var(--gl-text) 7%, transparent);
  background: color-mix(in srgb, var(--gl-bg) 38%, var(--gl-fill));
  box-shadow: var(--gl-library-glass-bevel);
  color: var(--gl-text);
}
.gl-library-row-more > svg { width: 20px; height: 20px; stroke-width: 2.55; }
.gl-library-row-frame .gl-library-row-more:is(:hover,[aria-expanded="true"]) { background: var(--gl-selected); }
.gl-library-row-frame :is(.gl-library-document, .gl-library-icon-button):focus-visible { outline-offset: -2px; }
.gl-library-row-editor { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 7px; border: 1px solid var(--gl-line); border-radius: 10px; background: var(--gl-fill); }
.gl-library-row-editor.is-confirming { display: grid; color: var(--gl-muted); }
.gl-library-row-editor.is-confirming .gl-library-inline-actions { justify-content: flex-end; }
.gl-library-row-editor button { flex: 0 0 auto; }
.gl-library-details { display: flex; flex-direction: column; align-items: stretch; gap: 12px; border-inline-start: 1px solid var(--gl-line); padding: 17px clamp(12px, 2cqw, 23px); }
.gl-library-details > * { flex-shrink: 0; }
.gl-library-details.is-empty { display: grid; place-items: center; color: var(--gl-muted); }
.gl-library-details h3 { font-size: 19px; font-weight: 650; overflow-wrap: anywhere; }
.gl-library-detail-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.gl-library-muted { color: var(--gl-muted); }
.gl-library-external-description { overflow-wrap: anywhere; }
.gl-library-thumbnail {
  display: grid;
  place-items: center;
  width: 100%;
  margin: 0;
}
.gl-library-thumbnail canvas { display: none; width: 100%; height: auto; }
.gl-library-thumbnail.is-ready canvas { display: block; }
.gl-library-thumbnail-message { display: grid; justify-items: center; gap: 6px; padding: 12px 6px; color: var(--gl-muted); font-size: 13px; text-align: center; }
.gl-library-link { display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; color: var(--gl-accent); text-underline-offset: 3px; }
.gl-library-setting-field, .gl-library-field-label { display: grid; gap: 5px; font-size: 13px; font-weight: 550; }
.gl-library-folder-form, .gl-library-path-form { display: grid; gap: 7px; }
.gl-library-folder-form { margin-top: 12px; }
.gl-library-source-panel { flex: 1; min-height: 0; display: grid; align-content: start; gap: 12px; padding: 18px 23px; overflow: auto; overscroll-behavior: contain; }
.gl-library-source-panel.gl-library-source-external { gap: 10px; }
.gl-library-source-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px 12px; }
.gl-library-source-toolbar h2 { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gl-library-zotero-workspace .gl-library-list-panel > .gl-library-button { flex: 0 0 auto; align-self: flex-start; margin-top: 6px; }
.gl-library-source-external .gl-library-external-actions .gl-library-button,
.gl-library-zotero-workspace .gl-library-list-panel > .gl-library-button {
  min-height: 36px; padding: 4px 10px; border-radius: 999px; border-color: var(--gl-line); background: var(--gl-fill); color: var(--gl-text);
}
.gl-library-source-external .gl-library-external-actions .gl-library-button.primary:not(:disabled) { color: var(--gl-accent); }
.gl-library-source-external .gl-library-external-actions .gl-library-button:not(:disabled):hover { background: var(--gl-selected); }
.gl-library-source-panel > button { justify-self: start; }
.gl-library-external-list { display: grid; gap: 8px; }
.gl-library-external-list li { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid var(--gl-line); padding: 9px 4px; }
.gl-library-external-description { display: grid; gap: 3px; min-width: 0; }
.gl-library-external-description strong { font-weight: 640; }
.gl-library-external-description > span, .gl-library-external-description small { color: var(--gl-muted); }
.gl-library-external-actions { display: grid; flex: 0 0 auto; justify-items: end; gap: 5px; }
.gl-library-empty { display: grid; justify-items: center; gap: 7px; margin: 22px auto; padding: 10px; max-width: 290px; text-align: center; }
.gl-library-empty p { font-weight: 650; }
.gl-library-empty > span { color: var(--gl-muted); font-size: 13px; }
.gl-library-empty button { margin-top: 5px; }
.gl-library-setting-block { display: grid; gap: 9px; padding: 14px; border: 1px solid var(--gl-line); border-radius: 13px; }
.gl-library-setting-block > p { color: var(--gl-muted); }
.gl-library-setting-block > p.gl-library-error { color: var(--gl-danger, #a42d2d); }
.gl-library-path { padding: 9px 11px; border-radius: 9px; background: var(--gl-fill); overflow-wrap: anywhere; }
.gl-library-check { display: flex; align-items: center; gap: 8px; min-height: 34px; }
.gl-library-check input { accent-color: var(--gl-accent); }
.gl-library-directory { display: grid; gap: 6px; align-items: start; justify-items: start; min-width: 0; padding: 10px; border: 1px solid var(--gl-line); border-radius: 11px; }
.gl-library-directory ul { width: 100%; max-height: 215px; overflow: auto; }
.gl-library-directory li button { width: 100%; text-align: start; justify-content: flex-start; overflow-wrap: anywhere; }
@media (prefers-color-scheme: dark) {
  .gl-library-drawer { --gl-bg: var(--dsw-alias-bg-base, #252930); --gl-text: var(--dsw-alias-label-primary, #f0f2f5); --gl-accent: #9bc2ff; --gl-danger: #ffacac; --gl-good: #9cdbb5; }
}
@container gloss-library (max-width: 520px) {
  .gl-library-operation { padding-inline: 10px; }
  .gl-library-saved { display: flex; flex-direction: column; overflow: auto; overscroll-behavior: contain; }
  .gl-library-list-panel { flex: 0 0 auto; max-height: 42vh; }
  .gl-library-details { flex: 0 0 auto; overflow: visible; border-inline-start: 0; border-top: 1px solid var(--gl-line); }
  .gl-library-source-panel { padding-inline: 12px; }
  .gl-library-external-list li { flex-wrap: wrap; }
  .gl-library-external-actions { display: flex; flex-wrap: wrap; align-items: center; }
  .gl-library-workspace .gl-library-details { padding-top: 12px; }
  .gl-library-workspace .gl-library-document-list { padding-bottom: 6px; scroll-padding-bottom: 6px; }
  .gl-library-workspace .gl-library-folder-menu { max-height: 28vh; }
  .gl-library-dock .gl-library-compact-action { width: 42px; padding-inline: 0; }
  .gl-library-dock .gl-library-compact-action > span { display: none; }
}
@container gloss-library (max-width: 310px) {
  .gl-library-workspace .gl-library-top-glass .lr-tab svg { width: 17px; height: 17px; }
  .gl-library-workspace .gl-library-top-glass .lr-tab .lr-tab-label-full,
  .gl-library-workspace .gl-library-top-glass .lr-tab::after { display: none; }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .gl-library-island, .gl-library-button.gl-library-island, .gl-library-workspace .gl-library-folder-menu { background: var(--gl-bg); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .gl-library-overlay, .gl-library-drawer, .gl-library-drawer * { transition: none; }
}
`

    function LibraryIcon({ name }) {
      const paths = {
        close: 'm6 6 12 12M18 6 6 18',
        upload: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',
        home: 'm3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
        folder: 'M3 7h7l2 2h9v11H3z',
        paper: 'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6',
        search: 'M15.5 15.5 21 21M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
        refresh: 'M20 7v5h-5m5 0a8 8 0 1 0-2 5',
        open: 'M14 4h6v6m0-6-8 8m6 1v7H4V6h7',
        plus: 'M12 5v14M5 12h14',
        back: 'm13 6-6 6 6 6m-6-6h13',
        next: 'm9 6 6 6-6 6',
        more: 'M5.1 12h.1m6.8 0h.1m6.8 0h.1',
        trash: 'M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 3v7m4-7v7',
        settings: 'M10 3h4l.6 2.4 1.7 1 2.4-.7 2 3.5-1.8 1.7v2.2l1.8 1.7-2 3.5-2.4-.7-1.7 1L14 21h-4l-.6-2.4-1.7-1-2.4.7-2-3.5 1.8-1.7v-2.2L3.3 9.2l2-3.5 2.4.7 1.7-1L10 3Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
      }
      return h('svg', { viewBox: '0 0 24 24', width: 17, height: 17, fill: 'none', stroke: 'currentColor', strokeWidth: 1.55, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] || paths.paper }))
    }

    function libraryText(value) {
      if (Array.isArray(value)) return value.map(libraryText).filter(Boolean).join('、')
      if (typeof value === 'object' && value) return value.name || [value.firstName, value.lastName].filter(Boolean).join(' ')
      return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
    }

    function libraryInfo(entry) {
      const meta = entry.meta || entry
      return {
        authors: libraryText(meta.authors || meta.creators),
        year: libraryText(meta.year),
        publication: libraryText(meta.publication || meta.journal),
        doi: libraryText(meta.doi),
        url: libraryText(meta.url),
        abstract: libraryText(meta.abstract || meta.abstractNote),
      }
    }

    function libraryLink(value) {
      try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' }
    }

    function LibraryPdfThumbnail({ entry, open, onRender, onZoteroAvailability }) {
      const figure = useRef(null)
      const canvas = useRef(null)
      const [status, setStatus] = useState('loading')
      const [previewWidth, setPreviewWidth] = useState(0)
      const available = entry.hasPdf !== false || Boolean(entry.pdfDirectory)
      useEffect(() => {
        const element = figure.current
        if (!open || !available || !onRender || !element) return
        function measure(width) {
          if (width > 0) setPreviewWidth(Math.max(128, Math.ceil(width / 64) * 64))
        }
        measure(element.clientWidth)
        const Observer = element.ownerDocument.defaultView?.ResizeObserver
        if (!Observer) return
        const observer = new Observer(entries => measure(entries[0]?.contentRect.width))
        observer.observe(element)
        return () => observer.disconnect()
      }, [open, available, onRender])
      useEffect(() => {
        if (!open || !available || !onRender || !canvas.current || !previewWidth) return
        const controller = new AbortController()
        const target = canvas.current
        setStatus(previous => previous === 'ready' ? previous : 'loading')
        Promise.resolve().then(() => {
          if (!controller.signal.aborted) return onRender(entry, target, controller.signal, previewWidth)
        }).then(
          () => {
            if (controller.signal.aborted) return
            setStatus('ready')
            onZoteroAvailability?.(previous => previous === entry.key ? '' : previous)
          },
          error => {
            if (controller.signal.aborted) return
            const missing = error?.code === 'zotero-pdf-missing'
            setStatus(previous => previous === 'ready' ? previous : missing ? 'missing' : 'error')
            if (missing) onZoteroAvailability?.(entry.key)
          },
        )
        return () => controller.abort()
      }, [open, available, entry.id, entry.key, entry.updatedAt, entry.pdfDirectory, entry.attachmentKey, onRender, onZoteroAvailability, previewWidth])
      const ready = available && status === 'ready'
      return h('figure', { ref: figure, className: cls('gl-library-thumbnail', ready && 'is-ready'), 'aria-busy': available && Boolean(onRender) && status === 'loading' },
        available ? h('canvas', { ref: canvas, role: 'img', 'aria-label': '《' + entry.title + '》PDF 首页预览', 'aria-hidden': !ready || undefined }) : null,
        !ready ? h('div', { className: 'gl-library-thumbnail-message', role: 'status' },
          h(LibraryIcon, { name: 'paper' }),
          h('span', null, !available || status === 'missing' ? '暂无原始 PDF' : !onRender || status === 'error' ? '无法预览 PDF 首页' : '正在载入 PDF 首页…')) : null)
    }

    function LibraryRowLabel({ entry }) {
      const info = libraryInfo(entry)
      const excerpt = libraryText(entry.preview || info.abstract).replace(/\s+/g, ' ').trim()
      const meta = [info.authors, info.year].filter(Boolean).join(' · ')
      return h(React.Fragment, null, h(LibraryIcon, { name: 'paper' }),
        h('span', null, h('strong', null, entry.title || '未命名文献'),
          meta ? h('small', null, meta) : null, excerpt ? h('span', { className: 'gl-library-excerpt' }, excerpt) : null))
    }

    function LibraryActionRow({ entry, rowId, detailSelected, actionsOpen, actionSide, bidirectional, onToggleActions, onSelect, onOpen, openTitle, tray, children }) {
      const swipeRef = useRef(null)
      const trayRef = useRef(null)
      const lastSide = useRef('right')
      const suppressClick = useRef(0)
      const suppressDoubleClick = useRef(0)
      const trayId = 'gl-library-row-tray-' + rowId
      if (actionsOpen) lastSide.current = actionSide

      function onPointerDown(event) {
        if (event.button !== 0 || event.isPrimary === false || swipeRef.current || !event.target.closest(actionsOpen ? '.gl-library-row-main, .gl-library-row-tray' : '.gl-library-row-main')) return
        suppressClick.current = 0
        swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, width: trayRef.current.offsetWidth }
      }

      function onPointerMove(event) {
        const swipe = swipeRef.current
        if (!swipe || swipe.id !== event.pointerId) return
        const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y
        const row = event.currentTarget
        if (!swipe.dragging) {
          if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) { swipeRef.current = null; return }
          const movingAwayFromTray = lastSide.current === 'left' ? dx > 0 : dx < 0
          const wrongDirection = actionsOpen ? movingAwayFromTray : dx > 0 && !bidirectional
          if (Math.abs(dx) <= 6 || wrongDirection) return
          swipe.side = actionsOpen ? lastSide.current : dx > 0 ? 'left' : 'right'
          lastSide.current = swipe.side
          row.parentElement.dataset.actionsSide = swipe.side
          swipe.dragging = true
          row.classList.add('is-swiping')
          if (event.isTrusted && row.setPointerCapture && !row.hasPointerCapture(event.pointerId)) row.setPointerCapture(event.pointerId)
        }
        const direction = swipe.side === 'left' ? 1 : -1
        const distance = Math.max(0, Math.min(swipe.width, (actionsOpen ? swipe.width : 0) + dx * direction))
        row.style.setProperty('--gl-library-swipe-offset', distance * direction + 'px')
      }

      function finishPointer(event, cancelled) {
        const swipe = swipeRef.current, row = event.currentTarget
        if (!swipe || swipe.id !== event.pointerId) return
        swipeRef.current = null
        row.classList.remove('is-swiping')
        row.style.removeProperty('--gl-library-swipe-offset')
        if (row.hasPointerCapture?.(event.pointerId)) row.releasePointerCapture(event.pointerId)
        if (!swipe.dragging) return
        suppressClick.current = Date.now() + 120
        suppressDoubleClick.current = Date.now() + 500
        if (cancelled) return
        const distance = (event.clientX - swipe.x) * (swipe.side === 'left' ? 1 : -1)
        const threshold = Math.min(48, swipe.width / 2)
        if (actionsOpen ? distance < -threshold : distance > threshold) onToggleActions(swipe.side)
      }

      return h('li', { className: detailSelected ? 'is-selected' : '', 'data-library-entry': rowId, 'data-actions-open': actionsOpen || undefined,
        'data-actions-side': lastSide.current, 'data-library-bidirectional': bidirectional || undefined },
        h('div', { className: 'gl-library-row-frame',
          onPointerDown, onPointerMove, onPointerUp: event => finishPointer(event, false),
          onPointerCancel: event => finishPointer(event, true),
          onLostPointerCapture: event => finishPointer(event, true),
          onPointerLeave: event => { if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) finishPointer(event, true) },
          onClickCapture: event => {
            if (!event.detail || Date.now() >= suppressClick.current) return
            suppressClick.current = 0
            event.preventDefault()
            event.stopPropagation()
          },
        },
          h('div', { className: 'gl-library-row-main' },
            h('button', { type: 'button', className: 'gl-library-document', 'aria-pressed': detailSelected, title: onOpen ? openTitle : undefined,
              onClick: () => {
                if (actionsOpen) suppressDoubleClick.current = Date.now() + 500
                onSelect()
              },
              onDoubleClick: onOpen ? event => {
                if (event.button !== 0 || actionsOpen || Date.now() < suppressDoubleClick.current) return
                event.preventDefault()
                onOpen()
              } : undefined },
              h(LibraryRowLabel, { entry })),
            h('div', { className: 'gl-library-row-buttons' },
              h('button', { type: 'button', className: 'gl-library-icon-button gl-library-row-more', onClick: () => onToggleActions('right'), title: '文献操作', 'aria-label': '文献操作：' + entry.title, 'aria-expanded': actionsOpen, 'aria-controls': trayId }, h(LibraryIcon, { name: 'more' })))),
          h('div', { id: trayId, className: 'gl-library-row-tray', ref: trayRef, 'aria-hidden': actionsOpen ? undefined : true, inert: actionsOpen ? undefined : '' }, tray)),
        children)
    }

    function LibraryDrawer(props) {
      const {
        open, embedded = false, onClose, documents = [], folders = [], activeId, folderId = '', onFolderChange,
        tab = 'saved', onTabChange, onUpload, onCreateFolder, onMove, onOpen, onDelete,
        onAttachPdf, onHome, onLookupDocument, onRecoverZotero, onRenderPdfThumbnail, onRenderZoteroThumbnail, zotero = {}, onLoadZotero,
        onImportZotero, onSaveZotero, lookup = {}, onLookup, onImportResult, onSaveResult, onFindPdfInZotero, onCopyZoteroIdentifier, operation = {}, onDismissOperation,
        settings = {}, settingsState = {}, onSettingsChange, onChooseDirectory, onCloseDirectory, onResetDirectory,
      } = props
      const dialog = useRef(null)
      const heading = useRef(null)
      const detailsPanel = useRef(null)
      const folderInput = useRef(null)
      const folderFloat = useRef(null)
      const folderTrigger = useRef(null)
      const actionList = useRef(null)
      const directoryInput = useRef(null)
      const rowEditor = useRef(null)
      const handlers = useRef({})
      const returnTab = useRef('saved')
      const [query, setQuery] = useState('')
      const [zoteroQuery, setZoteroQuery] = useState('')
      const [lookupQuery, setLookupQuery] = useState('')
      const [selected, setSelected] = useState('')
      const [selectedZotero, setSelectedZotero] = useState('')
      const [zoteroPreviewMissing, setZoteroPreviewMissing] = useState('')
      const [newFolder, setNewFolder] = useState(null)
      const [foldersOpen, setFoldersOpen] = useState(false)
      const [folderError, setFolderError] = useState('')
      const [rowActions, setRowActions] = useState('')
      const [rowSide, setRowSide] = useState('right')
      const [moveRow, setMoveRow] = useState('')
      const [confirmDelete, setConfirmDelete] = useState('')
      const [manualPath, setManualPath] = useState(null)
      const [pathError, setPathError] = useState('')
      const importing = Boolean(operation.label)
      const allFolders = new Map(folders.map(folder => [folder.id, folder.name]))
      const folderFilter = allFolders.has(folderId) ? folderId : ''
      const filter = query.trim().toLocaleLowerCase()
      const shown = documents.filter(entry => {
        if (folderFilter && entry.folderId !== folderFilter) return false
        const info = libraryInfo(entry)
        return !filter || [entry.title, info.authors, info.doi, info.publication, info.year].some(value => libraryText(value).toLocaleLowerCase().includes(filter))
      })
      const detail = shown.find(entry => entry.id === selected) || shown.find(entry => entry.id === activeId) || shown[0]
      handlers.current = { onClose, onCloseDirectory, closeRowActions, closeFolders, toggleRowActions }

      function closeFolders(restoreFocus = false) {
        setFoldersOpen(false)
        setNewFolder(null)
        if (restoreFocus) folderTrigger.current?.focus({ preventScroll: true })
      }

      function closeRowActions(restoreFocus = false) {
        if (restoreFocus) dialog.current?.querySelector('[data-actions-open] .gl-library-row-more')?.focus({ preventScroll: true })
        setRowActions('')
        setMoveRow('')
        setConfirmDelete('')
      }

      function toggleRowActions(id, side = 'right') {
        if (rowActions === id) { closeRowActions(); return }
        setRowActions(id)
        setRowSide(side)
        setMoveRow('')
        setConfirmDelete('')
      }

      useLayoutEffect(() => {
        if (!open) return
        const node = dialog.current
        const document = node?.ownerDocument
        if (!node || !document) return
        const previous = document.activeElement
        heading.current?.focus({ preventScroll: true })
        function handleKey(event) {
          if (event.key === 'Escape') {
            if (embedded && !node.contains(document.activeElement)) return
            event.preventDefault()
            event.stopImmediatePropagation()
            if (node.querySelector('[data-library-directory-open]')) handlers.current.onCloseDirectory?.()
            else if (node.querySelector('[data-library-folders-open]')) handlers.current.closeFolders(true)
            else if (node.querySelector('[data-actions-open]')) handlers.current.closeRowActions(true)
            else handlers.current.onClose?.()
            return
          }
          if (embedded || event.key !== 'Tab') return
          const options = Array.from(node.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], summary, [tabindex="0"]'))
            .filter(item => item.tabIndex >= 0 && !item.closest('[inert]') && item.getClientRects().length)
          const first = options[0], last = options.at(-1)
          if (!first) { event.preventDefault(); heading.current?.focus(); return }
          const focused = document.activeElement
          if (event.shiftKey && (focused === first || !options.includes(focused))) { event.preventDefault(); last.focus() }
          if (!event.shiftKey && (focused === last || !node.contains(focused))) { event.preventDefault(); first.focus() }
        }
        document.addEventListener('keydown', handleKey, true)
        return () => {
          document.removeEventListener('keydown', handleKey, true)
          const target = previous?.isConnected && previous !== document.body ? previous : document.querySelector('.lr-library-trigger')
          target?.focus({ preventScroll: true })
        }
      }, [open, embedded])

      useEffect(() => { if (newFolder !== null) folderInput.current?.focus() }, [newFolder !== null])
      useEffect(() => { if (manualPath !== null) directoryInput.current?.focus() }, [manualPath !== null])
      useEffect(() => {
        if (!open || tab !== 'saved') { closeRowActions(); closeFolders() }
      }, [open, tab])
      useEffect(() => {
        const node = folderFloat.current
        const owner = node?.ownerDocument
        if (!foldersOpen || !owner) return
        function outsideFolder(event) {
          if (!node.contains(event.target)) closeFolders()
        }
        owner.addEventListener('pointerdown', outsideFolder, true)
        return () => owner.removeEventListener('pointerdown', outsideFolder, true)
      }, [foldersOpen])
      useEffect(() => {
        const list = actionList.current
        if (!open || !list) return
        let gesture = null
        function swipeTrackpad(event) {
          if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.25) return
          const row = event.target.closest('[data-library-entry]')
          if (!row || row.querySelector('.is-swiping')) return
          const time = performance.now()
          if (!gesture || time - gesture.last > 160) gesture = { row, last: time, distance: 0, committed: false }
          gesture.last = time
          if (event.cancelable) event.preventDefault()
          if (gesture.committed || row !== gesture.row) return
          const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? row.clientWidth : 1
          const opened = row.hasAttribute('data-actions-open')
          if (!gesture.side) gesture.side = opened ? row.dataset.actionsSide
            : event.deltaX < 0 && row.hasAttribute('data-library-bidirectional') ? 'left' : 'right'
          const direction = (gesture.side === 'left' ? -1 : 1) * (opened ? -1 : 1)
          gesture.distance = Math.max(0, gesture.distance + event.deltaX * multiplier * direction)
          if (gesture.distance < 54) return
          gesture.committed = true
          handlers.current.toggleRowActions(row.dataset.libraryEntry, gesture.side)
        }
        list.addEventListener('wheel', swipeTrackpad, { passive: false })
        return () => list.removeEventListener('wheel', swipeTrackpad)
      }, [open, tab, Boolean(tab === 'saved' ? shown.length : tab === 'zotero' && zotero.items?.length)])
      useEffect(() => { rowEditor.current?.focus({ preventScroll: true }) }, [moveRow, confirmDelete])
      useEffect(() => { if (typeof lookup.query === 'string') setLookupQuery(lookup.query) }, [lookup.query])
      useEffect(() => { if (typeof zotero.query === 'string') setZoteroQuery(zotero.query) }, [zotero.query])
      useEffect(() => { if (manualPath !== null) { setManualPath(null); setPathError('') } }, [settings.pdfDirectory])

      function action(label, callback, options = {}) {
        if (!callback) return null
        const { icon, variant = '', disabled = false, title, key, compactLabel } = options
        return h('button', { key, type: 'button', className: cls('gl-library-button', variant, compactLabel && 'gl-library-compact-action'),
          'aria-label': compactLabel ? label : undefined, onClick: callback, disabled, title: title || (compactLabel ? label : undefined) },
          icon ? h(LibraryIcon, { name: icon }) : null, compactLabel ? h('span', null, label) : label)
      }

      function swipeAction(label, icon, callback, variant = '') {
        return h('button', { key: icon, type: 'button', className: cls('gl-library-swipe-action', variant), title: label, disabled: importing, onClick: callback },
          h(LibraryIcon, { name: icon }), h('span', null, label))
      }

      function selectTab(next) {
        closeRowActions()
        if (next === 'settings' && tab !== 'settings') returnTab.current = tab
        if (tab === 'settings' && next !== 'settings') { setManualPath(null); setPathError(''); onCloseDirectory?.() }
        onTabChange?.(next)
      }

      function formSearch({ label, value, change, submit, placeholder, loading, id }) {
        const query = value.trim()
        return h('form', { className: cls('gl-library-list-search', query && 'has-query'), role: 'search', 'aria-label': label,
          onSubmit: event => { event.preventDefault(); if (query && !loading) submit?.(query) } },
          h('button', { type: 'button', className: 'gl-library-search-icon', 'aria-label': label, title: label,
            onClick: event => event.currentTarget.form?.elements.namedItem(id)?.focus() }, h(LibraryIcon, { name: 'search' })),
          h('input', { id, type: 'search', value, 'aria-label': label, onChange: event => change(event.target.value), placeholder, autoComplete: 'off', enterKeyHint: 'search' }),
          submit && query ? h('button', { type: 'submit', className: 'gl-library-search-submit', 'aria-label': '查找', title: '查找', disabled: loading }, h(LibraryIcon, { name: 'next' })) : null)
      }

      function empty(title, description, button) {
        return h('div', { className: 'gl-library-empty' },
          h('p', null, title), description ? h('span', null, description) : null, button)
      }

      function savedDetails(entry) {
        if (!entry) return h('aside', { className: 'gl-library-details is-empty', 'aria-label': '文献详情' }, h('span', null, '选择文献查看详情'))
        const hasOriginal = entry.hasPdf === true || Boolean(entry.pdfDirectory)
        return h('aside', { className: 'gl-library-details', 'aria-label': '文献详情', ref: detailsPanel },
          h('h3', null, entry.title),
          h(LibraryPdfThumbnail, { key: entry.id, entry, open: open && tab === 'saved', onRender: onRenderPdfThumbnail }),
          hasOriginal ? null : h('div', { className: 'gl-library-detail-actions' },
            entry.hasPdf === false && entry.hasText === false ? null : action('打开阅读', () => onOpen?.(entry), { icon: 'open', variant: 'primary', disabled: importing }),
            entry.hasPdf === false ? action('添加原始 PDF', onAttachPdf && (() => onAttachPdf(entry)), { icon: 'upload', disabled: importing }) : null,
            entry.hasPdf === false && entry.meta?.zoteroKey ? action('从 Zotero 补齐', onRecoverZotero && (() => onRecoverZotero(entry)), { disabled: importing }) : null,
            entry.hasPdf === false ? action('查找公开 PDF', onLookupDocument && (() => onLookupDocument(entry)), { disabled: importing }) : null))
      }

      function rowActionEditor(entry) {
        if (moveRow === entry.id) {
          const folder = allFolders.has(entry.folderId) ? entry.folderId : ''
          return h('div', { className: 'gl-library-row-editor', role: 'group', 'aria-label': '文献归类' },
            h('select', { ref: rowEditor, 'aria-label': '移动到文件夹', value: folder, onChange: event => {
              onMove?.(entry, event.target.value)
              closeRowActions()
            } }, h('option', { value: '' }, '未分类'), folders.map(item => h('option', { key: item.id, value: item.id }, item.name))),
            action('取消', () => setMoveRow(''), { variant: 'quiet' }))
        }
        if (confirmDelete !== entry.id) return null
        return h('div', { className: 'gl-library-row-editor is-confirming', role: 'group', 'aria-label': '确认删除文献' },
          h('p', null, '删除这篇文献及其 Gloss 阅读记录？原始文件和 Zotero 条目会保留。'),
          h('div', { className: 'gl-library-inline-actions' },
            h('button', { type: 'button', ref: rowEditor, className: 'gl-library-button quiet', onClick: () => setConfirmDelete('') }, '取消'),
            action('确认删除', () => { closeRowActions(); onDelete?.(entry) }, { variant: 'danger' })))
      }

      function savedPanel() {
        function submitFolder(event) {
          event.preventDefault()
          const name = (newFolder || '').trim()
          if (!name) { setFolderError('请输入文件夹名称。'); return }
          if (folders.some(folder => folder.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setFolderError('已有同名文件夹。'); return }
          onCreateFolder?.(name)
          setNewFolder(null)
          setFolderError('')
          setQuery('')
          closeFolders(true)
        }
        function chooseFolder(id) {
          onFolderChange?.(id); setSelected(''); closeRowActions()
          closeFolders(true)
        }
        const folderButton = (id, name, count) => h('button', { key: id || 'all', type: 'button', className: 'gl-library-folder', 'aria-pressed': folderFilter === id, onClick: () => chooseFolder(id), title: name },
          h(LibraryIcon, { name: id ? 'folder' : 'paper' }), h('span', null, name), h('span', { className: 'gl-library-folder-count', 'aria-label': count + ' 篇' }, count))
        const foldersNav = h('nav', { id: 'gl-library-folder-menu', className: 'gl-library-folders gl-library-folder-menu', 'aria-label': '文献文件夹',
          'aria-hidden': !foldersOpen || undefined, inert: !foldersOpen ? '' : undefined },
            h('div', { className: 'gl-library-folder-head' }, h('span', null, '文件夹'),
              h('button', { type: 'button', className: 'gl-library-icon-button', 'aria-label': '新建文件夹', title: '新建文件夹', onClick: () => { setNewFolder(''); setFolderError('') } }, h(LibraryIcon, { name: 'plus' }))),
            folderButton('', '全部文献', documents.length),
            folders.map(folder => folderButton(folder.id, folder.name, documents.filter(entry => entry.folderId === folder.id).length)),
            newFolder !== null ? h('form', { className: 'gl-library-folder-form', onSubmit: submitFolder },
              h('label', { className: 'gl-library-field-label', htmlFor: 'gl-library-new-folder' }, '文件夹名称'),
              h('input', { id: 'gl-library-new-folder', ref: folderInput, value: newFolder, maxLength: 60, onChange: event => { setNewFolder(event.target.value); setFolderError('') }, 'aria-invalid': Boolean(folderError) }),
              folderError ? h('p', { role: 'alert', className: 'gl-library-error' }, folderError) : null,
              h('div', { className: 'gl-library-inline-actions' }, h('button', { type: 'submit', className: 'gl-library-button primary' }, '创建'), action('取消', () => setNewFolder(null)))) : null)
        return h('div', { className: 'gl-library-saved' },
          h('section', { className: 'gl-library-list-panel', 'aria-label': '已保存文献列表' },
            h('div', { className: 'gl-library-list-heading' },
              h('div', { className: 'gl-library-list-title' },
                h('div', { ref: folderFloat, className: 'gl-library-folder-float', 'data-library-folders-open': foldersOpen || undefined },
                  h('button', { type: 'button', ref: folderTrigger, className: 'gl-library-button gl-library-island', 'aria-expanded': foldersOpen, 'aria-controls': 'gl-library-folder-menu',
                    onClick: () => { if (foldersOpen) closeFolders(); else setFoldersOpen(true) } }, h(LibraryIcon, { name: 'folder' }), '文件夹'),
                  foldersNav),
                h('h2', null, allFolders.get(folderFilter) || '全部文献')),
              formSearch({ label: '搜索文献库', value: query, change: value => { setQuery(value); closeRowActions() }, placeholder: '搜索标题、作者、DOI', id: 'gl-library-saved-search' })),
            shown.length ? h('ul', { className: 'gl-library-document-list', ref: actionList }, shown.map(entry =>
              h(LibraryActionRow, { key: entry.id, rowId: entry.id, entry, detailSelected: detail?.id === entry.id, actionsOpen: rowActions === entry.id, actionSide: rowSide,
                onToggleActions: side => toggleRowActions(entry.id, side), openTitle: '双击打开 PDF',
                onOpen: !importing && (entry.hasPdf === true || entry.pdfDirectory) && onOpen ? () => onOpen(entry) : undefined,
                onSelect: () => {
                  setSelected(entry.id)
                  closeRowActions()
                  if (dialog.current?.clientWidth <= 520) detailsPanel.current?.scrollIntoView({ block: 'nearest' })
                },
                tray: [
                  entry.hasPdf === true || entry.pdfDirectory ? swipeAction('打开 PDF', 'open', () => onOpen?.(entry)) : null,
                  swipeAction('归类', 'folder', () => { setMoveRow(entry.id); setConfirmDelete('') }),
                  swipeAction('删除', 'trash', () => { setConfirmDelete(entry.id); setMoveRow('') }, 'danger-text'),
                ],
              }, rowActionEditor(entry)))) : empty(filter ? '没有匹配的文献' : folderFilter ? '这个文件夹还没有文献' : '文献库还没有内容',
              '', filter ? action('清空搜索', () => setQuery('')) : null)),
          savedDetails(detail))
      }

      function lookupRows(items) {
        return h('ul', { className: 'gl-library-external-list' }, items.map((item, index) => {
          const info = libraryInfo(item)
          const key = item.id || item.key || index
          const url = libraryLink(info.url)
          const missing = !item.pdfToken
          const downloadFailed = (lookup.failedDownloads || []).includes(item.id || item.title)
          const saveMetadata = missing || downloadFailed
          const zoteroMatch = lookup.zoteroMatches?.[item.id || item.title]
          const zoteroLink = zoteroMatch?.zoteroUrl
          return h('li', { key },
            h('div', { className: 'gl-library-external-description' }, h('strong', null, item.title || '未命名文献'),
              h('span', null, [info.authors, info.year, info.publication].filter(Boolean).join(' · ')),
              info.doi ? h('small', null, info.doi) : null,
              url ? h('a', { className: 'gl-library-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, '查看来源', h(LibraryIcon, { name: 'open' })) : null),
            h('div', { className: 'gl-library-external-actions' },
              !missing ? action(downloadFailed ? '重试下载' : '下载 PDF', () => onImportResult?.(item), { icon: 'upload', variant: downloadFailed ? '' : 'primary', disabled: importing }) : null,
              saveMetadata ? action('用 Zotero 获取', onFindPdfInZotero && (() => onFindPdfInZotero(item)), { icon: 'folder', variant: 'primary', disabled: importing }) : null,
              zoteroLink && /^zotero:\/\/select\/library\/items\/[A-Z0-9]+$/.test(zoteroLink) ? h('a', { className: 'gl-library-link', href: zoteroLink, target: '_blank', rel: 'noopener noreferrer' }, '在 Zotero 中查看', h(LibraryIcon, { name: 'open' })) : null,
              zoteroMatch === null ? action(item.doi ? '复制 DOI' : '复制题名', onCopyZoteroIdentifier && (() => onCopyZoteroIdentifier(item)), { variant: 'quiet', disabled: importing }) : null,
              saveMetadata ? action('保存条目信息', onSaveResult && (() => onSaveResult(item)), { disabled: importing }) : null,
              missing ? h('small', { className: 'gl-library-muted' }, '暂未找到公开 PDF') : null))
        }))
      }

      function zoteroDetails(item) {
        if (!item) return h('aside', { className: 'gl-library-details is-empty', 'aria-label': 'Zotero 文献预览' }, h('span', null, '选择文献查看 PDF 首页'))
        return h('aside', { className: 'gl-library-details', 'aria-label': 'Zotero 文献预览', ref: detailsPanel },
          h('h3', null, item.title || '未命名文献'),
          h(LibraryPdfThumbnail, { key: item.key, entry: item, open: open && tab === 'zotero',
            onRender: onRenderZoteroThumbnail, onZoteroAvailability: setZoteroPreviewMissing }))
      }

      function zoteroRow(item, chosen) {
        const missing = zotero.missingKey === item.key || zoteroPreviewMissing === item.key || item.hasPdf === false
        const zoteroUrl = /^zotero:\/\/select\/library\/items\/[A-Z0-9]+$/.test(item.zoteroUrl || '') ? item.zoteroUrl : ''
        return h(LibraryActionRow, { key: item.key, rowId: item.key, entry: item, detailSelected: chosen?.key === item.key, actionsOpen: rowActions === item.key, actionSide: rowSide, bidirectional: true,
          openTitle: '双击导入并打开 PDF',
          onOpen: !importing && !missing && onImportZotero ? () => onImportZotero(item, true) : undefined,
          onToggleActions: side => toggleRowActions(item.key, side),
          onSelect: () => {
            setSelectedZotero(item.key)
            closeRowActions()
            if (dialog.current?.clientWidth <= 520) detailsPanel.current?.scrollIntoView({ block: 'nearest' })
          },
          tray: [
            onImportZotero ? swipeAction(missing ? '重试导入' : '导入', 'upload', () => onImportZotero(item)) : null,
            zoteroUrl ? h('a', { key: 'zotero', className: 'gl-library-swipe-action', href: zoteroUrl, target: '_blank', rel: 'noopener noreferrer',
              'aria-label': '在 Zotero 中打开', title: '在 Zotero 中打开' }, h(LibraryIcon, { name: 'open' }), h('span', null, 'Zotero')) : null,
            missing && onSaveZotero ? swipeAction('保存条目', 'paper', () => onSaveZotero(item)) : null,
          ],
        })
      }

      function zoteroPanel() {
        const items = zotero.items || []
        const chosen = items.find(item => item.key === selectedZotero) || items[0]
        return h('div', { className: 'gl-library-saved gl-library-zotero-workspace gl-library-source-external' },
          h('section', { className: 'gl-library-list-panel', 'aria-label': '从 Zotero 导入' },
            h('div', { className: 'gl-library-list-heading' },
              h('div', { className: 'gl-library-list-title' }, h('h2', null, '从 Zotero 导入'),
                action(zoteroQuery || zotero.query ? '查看全部 Zotero 文献' : '刷新列表', () => { setZoteroQuery(''); onLoadZotero?.('', 0) }, { disabled: zotero.loading, icon: 'refresh', compactLabel: true })),
              formSearch({ label: '搜索 Zotero 文献', value: zoteroQuery, change: setZoteroQuery, submit: value => onLoadZotero?.(value, 0), placeholder: '题名、作者或年份', loading: zotero.loading, id: 'gl-library-zotero-search' })),
            zotero.loading ? h('p', { role: 'status', className: 'gl-library-muted' }, '正在读取 Zotero…') : null,
            zotero.error ? h('div', { role: 'alert', className: 'gl-library-error' }, zotero.error,
              zotero.code === 'local-api-disabled' ? h('p', null, '在 Zotero 的「设置 → 高级」中允许本机应用与 Zotero 通信，然后刷新列表。') : null) : null,
            items.length ? h('ul', { className: 'gl-library-document-list', ref: actionList }, items.map(item => zoteroRow(item, chosen))) : !zotero.loading && !zotero.error ? empty('没有找到文献') : null,
            zotero.nextStart != null && items.length ? action('加载更多文献', () => onLoadZotero?.(zotero.query || '', zotero.nextStart), { disabled: zotero.loading }) : null),
          zoteroDetails(chosen))
      }

      function lookupPanel() {
        const items = lookup.items || []
        return h('section', { className: 'gl-library-source-panel gl-library-source-external', 'aria-label': '在线查找文献' },
          h('div', { className: 'gl-library-source-toolbar' },
            h('h2', null, '在线查找文献'),
            formSearch({ label: 'DOI、论文链接或题名', value: lookupQuery, change: setLookupQuery, submit: value => onLookup?.(value), placeholder: '输入 DOI、链接或论文题名', loading: lookup.loading, id: 'gl-library-lookup-search' })),
          lookup.loading ? h('p', { role: 'status', className: 'gl-library-muted' }, '正在查找文献…') : null,
          lookup.error ? h('p', { role: 'alert', className: 'gl-library-error' }, lookup.error) : null,
          items.length ? lookupRows(items) : lookup.query && !lookup.loading && !lookup.error ? empty('没有匹配的结果', '可尝试完整题名、DOI 或来源链接。') : null)
      }

      function settingsPanel() {
        const chooser = settingsState.chooser
        function savePath(event) {
          event.preventDefault()
          const value = (manualPath || '').trim()
          if (!/^(?:\/|[A-Za-z]:[\\/]|\\\\)/.test(value)) { setPathError('请输入文件夹的绝对路径。'); return }
          setPathError('')
          onSettingsChange?.({ pdfDirectory: value })
        }
        return h('section', { className: 'gl-library-source-panel gl-library-settings', 'aria-label': '文献库设置' },
          action('返回文献库', () => selectTab(returnTab.current), { icon: 'back', variant: 'quiet' }),
          h('h2', null, '文献库设置'),
          h('div', { className: 'gl-library-setting-block' },
            h('h3', null, 'PDF 保存位置'),
            h('div', { className: 'gl-library-path', title: settings.pdfDirectory || undefined }, settings.pdfDirectory || '默认保存于 Gloss 本机文献库'),
            h('div', { className: 'gl-library-inline-actions' },
              action('选择文件夹', () => onChooseDirectory?.(), { icon: 'folder', disabled: settingsState.loading }),
              action('输入路径', () => { setManualPath(settings.pdfDirectory || ''); setPathError('') }, { disabled: settingsState.loading }),
              settings.pdfDirectory ? action('恢复默认', onResetDirectory, { variant: 'quiet', disabled: settingsState.loading }) : null),
            manualPath !== null ? h('form', { className: 'gl-library-path-form', onSubmit: savePath },
              h('label', { className: 'gl-library-field-label', htmlFor: 'gl-library-manual-path' }, '文件夹绝对路径'),
              h('input', { id: 'gl-library-manual-path', ref: directoryInput, value: manualPath, onChange: event => { setManualPath(event.target.value); setPathError('') }, 'aria-invalid': Boolean(pathError) }),
              pathError ? h('p', { role: 'alert', className: 'gl-library-error' }, pathError) : null,
              h('div', { className: 'gl-library-inline-actions' }, h('button', { type: 'submit', className: 'gl-library-button primary', disabled: settingsState.loading || !manualPath.trim() }, '保存路径'), action('取消', () => { setManualPath(null); setPathError('') }))) : null,
            chooser ? h('div', { className: 'gl-library-directory', 'data-library-directory-open': true, role: 'group', 'aria-label': '浏览本机文件夹' },
              h('div', { className: 'gl-library-path' }, chooser.path),
              chooser.parent ? action('上一级', () => onChooseDirectory?.(chooser.parent), { icon: 'back', disabled: settingsState.loading }) : null,
              h('ul', null, (chooser.directories || []).map(item => h('li', { key: item.path }, action(item.name, () => onChooseDirectory?.(item.path), { icon: 'folder', title: item.path, disabled: settingsState.loading })))),
              h('div', { className: 'gl-library-inline-actions' },
                action('使用此文件夹', () => onSettingsChange?.({ pdfDirectory: chooser.path }), { variant: 'primary', disabled: settingsState.loading }),
                action('取消', onCloseDirectory))) : null,
            settingsState.loading ? h('p', { role: 'status', className: 'gl-library-muted' }, '正在读取文件夹…') : null,
            settingsState.error ? h('p', { role: 'alert', className: 'gl-library-error' }, settingsState.error) : null,
            settingsState.message ? h('p', { role: 'status' }, settingsState.message) : null),
          h('div', { className: 'gl-library-setting-block' },
            h('h3', null, '导入与浏览'),
            h('label', { className: 'gl-library-setting-field' }, '新文献默认分类',
              h('select', { value: allFolders.has(settings.defaultFolderId) ? settings.defaultFolderId : '', onChange: event => onSettingsChange?.({ defaultFolderId: event.target.value }) },
                h('option', { value: '' }, '未分类'), folders.map(folder => h('option', { key: folder.id, value: folder.id }, folder.name)))),
            h('label', { className: 'gl-library-check' }, h('input', { type: 'checkbox', checked: Boolean(settings.openAfterImport), onChange: event => onSettingsChange?.({ openAfterImport: event.target.checked }) }), '导入完成后打开阅读器'),
            h('label', { className: 'gl-library-check' }, h('input', { type: 'checkbox', checked: Boolean(settings.rememberFolder), onChange: event => onSettingsChange?.({ rememberFolder: event.target.checked }) }), '记住上次浏览的文件夹')))
      }

      const sourceTabs = [['saved', '已收录', 'paper'], ['zotero', 'Zotero', 'folder'], ['lookup', '在线查找', 'search']]
      const sourceIndex = sourceTabs.findIndex(([key]) => key === tab)
      const sourceRail = useGlassTabRail(sourceIndex, sourceTabs.length, index => selectTab(sourceTabs[index][0]), open)
      const tabs = h('div', { ...sourceRail.railProps, className: cls('gl-library-nav', 'lr-tabs', sourceIndex < 0 && 'is-settings'), role: 'tablist', 'aria-label': '文献来源' },
        h('span', { className: 'lr-tab-lens', 'aria-hidden': true }),
        sourceTabs.map(([key, label, icon], index) => h('button', {
          key, type: 'button', role: 'tab', className: cls('lr-tab', tab === key && 'is-active'), 'aria-selected': tab === key,
          'aria-label': label, 'data-short-label': label, tabIndex: index === Math.max(0, sourceIndex) ? 0 : -1,
          onClick: () => selectTab(key), onKeyDown: event => sourceRail.onTabKeyDown(event, index),
        }, h(LibraryIcon, { name: icon }), h('span', { className: 'lr-tab-label-full' }, label))))
      const selectedPdf = tab === 'saved' && detail && (detail.hasPdf === true || detail.pdfDirectory) ? detail : null
      const controls = h('div', { className: 'gl-library-dock gl-library-island', role: 'group', 'aria-label': '文献库操作' },
        selectedPdf ? action('打开 PDF', () => onOpen?.(selectedPdf), { icon: 'open', disabled: importing, compactLabel: true }) : null,
        action('回到主页', onHome, { icon: 'home', compactLabel: true }),
        action('上传 PDF', onUpload, { icon: 'upload', disabled: importing, compactLabel: true }),
        h('button', { type: 'button', className: 'gl-library-icon-button', 'aria-label': '文献库设置', 'aria-pressed': tab === 'settings', title: '文献库设置', onClick: () => selectTab(tab === 'settings' ? returnTab.current : 'settings') }, h(LibraryIcon, { name: 'settings' })),
        !embedded ? h('button', { type: 'button', className: 'gl-library-icon-button', 'aria-label': '关闭文献库', title: '关闭文献库', onClick: onClose }, h(LibraryIcon, { name: 'close' })) : null)
      const drawer = h('section', { id: 'gl-library-drawer', className: cls('gl-library-drawer gl-library-workspace', embedded && 'is-embedded'), role: embedded ? 'region' : 'dialog',
            'aria-modal': open && !embedded ? 'true' : undefined, 'aria-labelledby': 'gl-library-title', ref: dialog,
            'aria-hidden': embedded && !open ? true : undefined, inert: embedded && !open ? '' : undefined },
            h('header', { className: 'gl-library-header' },
              h('div', { className: 'gl-library-top-glass gl-library-island' },
                h('h2', { id: 'gl-library-title', className: 'gl-library-visually-hidden', tabIndex: -1, ref: heading }, '文献库'),
                h('span', { className: 'gl-library-logo-slot', 'aria-hidden': true }, !embedded ? h(PanelIcon, { size: 23 }) : null), tabs)),
            operation.label || operation.message || operation.error ? h('div', { className: 'gl-library-operation' + (operation.error ? ' is-error' : '') },
              h('span', { role: operation.error ? 'alert' : 'status' }, operation.error || operation.message || operation.label + '…'),
              !operation.label ? h('button', { type: 'button', className: 'gl-library-icon-button gl-library-operation-close', 'aria-label': '关闭操作提示', onClick: onDismissOperation }, h(LibraryIcon, { name: 'close' })) : null) : null,
            tab === 'settings' ? settingsPanel() : tab === 'zotero' ? zoteroPanel() : tab === 'lookup' ? lookupPanel() : savedPanel(),
            controls)
      return h(React.Fragment, null, h('style', null, LIBRARY_CSS), embedded ? drawer
        : h('div', { className: cls('gl-library-overlay', open && 'is-open'), 'aria-hidden': open ? undefined : true, inert: open ? undefined : '',
          onPointerDown: event => { if (event.target === event.currentTarget) onClose?.() } }, drawer))
    }
        // Draw the welcome cover only while its pointer response is changing.
    function WelcomeCitations({ active }) {
      const canvasRef = useRef(null)
      useEffect(() => {
        const canvas = canvasRef.current
        const home = canvas?.parentElement
        const view = canvas?.ownerDocument.defaultView
        const context = canvas?.getContext('2d')
        if (!active || !home || !view || !context) return

        const reduceMotion = view.matchMedia('(prefers-reduced-motion: reduce)')
        const reduceGlass = view.matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more)')
        const scheme = view.matchMedia('(prefers-color-scheme: dark)')
        const smooth = t => t * t * (3 - 2 * t)
        const clamp = t => Math.min(1, Math.max(0, t))
        const noise = (x, y) => {
          const n = Math.sin(x * 13.7 + y * 47.6) * 43758.5
          return n - Math.floor(n)
        }
        const blend = (first, second, t) => first.map((channel, i) => channel + (second[i] - channel) * t)
        // A continuous field gives adjacent nodes related colors without discrete zones.
        const colorAt = (x, y) => {
          const across = smooth(clamp(x / width))
          const down = smooth(clamp(y / height))
          const upper = blend([82, 112, 196], [159, 107, 175], across)
          const lower = blend([77, 151, 164], [198, 139, 76], across)
          return blend(upper, lower, down).map(Math.round).join(',')
        }
        const tint = (color, alpha) => `rgba(${color},${alpha})`
        const focus = { x: 0, y: 0, level: 0 }
        const target = { x: 0, y: 0, level: 0 }
        const strength = .5
        let width = 0, height = 0, ink = '', frame = 0, lastTime = 0
        let points = [], edges = []

        function draw() {
          if (!width || !height) return
          const radius = Math.min(190, width * .36)
          const level = focus.level * strength
          const moving = !reduceMotion.matches
          context.clearRect(0, 0, width, height)
          context.lineCap = 'round'
          if (level && !reduceGlass.matches) {
            const { x, y } = focus
            const sheen = context.createRadialGradient(x - 15, y - 21, 3, x, y, radius * .84)
            sheen.addColorStop(0, tint('255,255,255', level * .32))
            sheen.addColorStop(.48, tint(colorAt(x, y), level * .12))
            sheen.addColorStop(1, tint(colorAt(x, y), 0))
            context.fillStyle = sheen
            context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
          }
          for (const point of points) {
            const dx = point.x - focus.x, dy = point.y - focus.y
            point.weight = level ? level * smooth(clamp(1 - Math.hypot(dx, dy) / radius)) : 0
            const stretch = moving ? point.weight * .28 : 0
            point.left = point.x + dx * stretch
            point.top = point.y + dy * stretch
          }

          context.strokeStyle = ink
          context.globalAlpha = .135
          context.lineWidth = .8
          context.beginPath()
          for (const [a, b] of edges) {
            context.moveTo(a.left, a.top)
            context.lineTo(b.left, b.top)
          }
          context.stroke()
          context.globalAlpha = 1
          context.lineWidth = 1.15
          for (const [a, b] of edges) {
            if (Math.max(a.weight, b.weight) < .008) continue
            const gradient = context.createLinearGradient(a.left, a.top, b.left, b.top)
            gradient.addColorStop(0, tint(a.color, a.weight * 1.15))
            gradient.addColorStop(1, tint(b.color, b.weight * 1.15))
            context.strokeStyle = gradient
            context.beginPath()
            context.moveTo(a.left, a.top)
            context.lineTo(b.left, b.top)
            context.stroke()
          }

          context.fillStyle = ink
          context.globalAlpha = .29
          context.beginPath()
          for (const point of points) {
            context.moveTo(point.left + point.radius, point.top)
            context.arc(point.left, point.top, point.radius, 0, Math.PI * 2)
          }
          context.fill()
          context.globalAlpha = 1
          for (const point of points) {
            if (point.weight < .01) continue
            context.fillStyle = tint(point.color, point.weight * 1.4)
            context.beginPath()
            context.arc(point.left, point.top, point.radius + (moving ? point.weight * 2.4 : 0), 0, Math.PI * 2)
            context.fill()
          }
        }

        function measure() {
          const w = home.clientWidth, h = home.clientHeight
          if (!w || !h) return
          ink = view.getComputedStyle(canvas).color
          const ratio = Math.min(view.devicePixelRatio || 1, 1.5)
          const pixelWidth = Math.round(w * ratio), pixelHeight = Math.round(h * ratio)
          if (w !== width || h !== height || pixelWidth !== canvas.width || pixelHeight !== canvas.height) {
            width = w
            height = h
            canvas.width = pixelWidth
            canvas.height = pixelHeight
            context.setTransform(pixelWidth / w, 0, 0, pixelHeight / h, 0, 0)
            const step = w < 500 ? 38 : Math.max(51, w / 32, h / 24)
            const lattice = []
            for (let r = 0; r <= h / step + 1; r++) {
              const row = []
              for (let c = 0; c <= w / step + 1; c++) {
                const x = (c + (noise(c, r) - .3) * .72) * step
                const y = (r + (noise(r, c + 13) - .3) * .72) * step
                const seed = noise(c + 7, r + 5)
                row.push({ x, y, seed, color: colorAt(x, y), radius: 1 + seed * 1.1 })
              }
              lattice.push(row)
            }
            points = lattice.flat()
            edges = []
            for (const [r, row] of lattice.entries()) {
              for (const [c, point] of row.entries()) {
                if (point.seed <= .32) continue
                const next = lattice[r + 1]
                for (const neighbor of [row[c + 1], next?.[c], point.seed > .63 ? next?.[c + 1] : null]) {
                  if (neighbor) edges.push([point, neighbor])
                }
              }
            }
          }
          draw()
        }

        function tick(time) {
          frame = 0
          const elapsed = lastTime ? Math.min(40, time - lastTime) : 16
          lastTime = time
          for (const key of ['x', 'y', 'level']) {
            const pace = key === 'level' && !target.level ? 87 : 46
            focus[key] += (target[key] - focus[key]) * (1 - Math.exp(-elapsed / pace))
            if (Math.abs(target[key] - focus[key]) < (key === 'level' ? .005 : .4)) focus[key] = target[key]
          }
          draw()
          if (focus.level !== target.level || (focus.level && (focus.x !== target.x || focus.y !== target.y))) wake()
          else lastTime = 0
        }

        function wake() {
          if (reduceMotion.matches) {
            view.cancelAnimationFrame(frame)
            frame = lastTime = 0
            Object.assign(focus, target)
            draw()
          } else if (!frame) {
            frame = view.requestAnimationFrame(tick)
          }
        }
        function leave() {
          if (!target.level) return
          target.level = 0
          wake()
        }
        function move(event) {
          if (event.pointerType === 'touch' || event.buttons) { leave(); return }
          const bounds = home.getBoundingClientRect()
          target.x = event.clientX - bounds.left
          target.y = event.clientY - bounds.top
          target.level = 1
          if (!focus.level) { focus.x = target.x; focus.y = target.y }
          wake()
        }

        const observer = view.ResizeObserver ? new view.ResizeObserver(measure) : null
        observer?.observe(home)
        view.addEventListener('resize', measure)
        home.addEventListener('pointermove', move, { passive: true })
        home.addEventListener('pointerleave', leave)
        home.addEventListener('pointercancel', leave)
        home.addEventListener('dragenter', leave)
        reduceMotion.addEventListener('change', wake)
        reduceGlass.addEventListener('change', measure)
        scheme.addEventListener('change', measure)
        measure()
        return () => {
          view.cancelAnimationFrame(frame)
          observer?.disconnect()
          view.removeEventListener('resize', measure)
          home.removeEventListener('pointermove', move)
          home.removeEventListener('pointerleave', leave)
          home.removeEventListener('pointercancel', leave)
          home.removeEventListener('dragenter', leave)
          reduceMotion.removeEventListener('change', wake)
          reduceGlass.removeEventListener('change', measure)
          scheme.removeEventListener('change', measure)
        }
      }, [active])
      return h('canvas', { ref: canvasRef, className: 'lr-welcome-citations', 'aria-hidden': true })
    }

    // BEGIN_GLOSS_SHARED_MATH
    const glossMath = (function createGlossMath(React, environment) {
    const env = environment || {}, host = env.scope || scope, h = React.createElement
    const VERSION = '0.19.1', GLOBAL = '__GlossKaTeX_0_19_1'
    const LIMITS = Object.freeze({ input: 200000, formula: 8192, formulas: 256, cache: 128, maxExpand: 512, maxSize: 12 })
    const assets = '/api/literature/asset/gloss-math/'
    const cache = new Map()
    let loadPromise = null
    function text(value) { return typeof value === 'string' ? value : value == null ? '' : String(value) }
    function escaped(value, at) { let count = 0; while (at > 0 && value[--at] === '\\') count += 1; return count % 2 === 1 }
    function run(value, at, char) { let end = at; while (value[end] === char) end += 1; return end - at }
    function codeEnd(value, at) {
      const char = value[at], count = run(value, at, char)
      const lineStart = value.lastIndexOf('\n', at - 1) + 1
      const fenced = count >= 3 && /^[ ]{0,3}$/.test(value.slice(lineStart, at))
      if (fenced) {
        let line = value.indexOf('\n', at + count)
        while (line >= 0) {
          const start = line + 1, end = value.indexOf('\n', start), boundary = end < 0 ? value.length : end
          const candidate = value.slice(start, boundary), match = candidate.match(/^[ ]{0,3}(`+|~+)[ \t]*$/)
          if (match && match[1][0] === char && match[1].length >= count) return boundary
          line = end
        }
        return value.length
      }
      if (char !== '`') return at + count
      let next = at + count
      while ((next = value.indexOf('`', next)) >= 0) {
        const found = run(value, next, '`')
        if (found === count) return next + found
        next += found
      }
      // An unfinished code span during streaming is opaque, just like a closed span.
      return value.length
    }
    function singleDollarOpen(value, at) {
      if (value[at + 1] === '$' || !value[at + 1] || /\s/.test(value[at + 1])) return false
      if (at > 0 && /[A-Za-z0-9_]/.test(value[at - 1])) return false
      return true
    }
    function findClose(value, start, closer, singleDollar) {
      let at = start
      while ((at = value.indexOf(closer, at)) >= 0) {
        if (singleDollar && value.slice(start, at).includes('\n')) return -1
        if (!escaped(value, at) && (!singleDollar || (value[at - 1] && !/\s/.test(value[at - 1]) && value[at + 1] !== '$' && !/[0-9]/.test(value[at + 1] || '')))) return at
        at += closer.length
      }
      return -1
    }
    function prepare(value) {
      const raw = text(value)
      if (raw.length > LIMITS.input) return { raw, text: raw, tokens: [], reason: 'input-limit' }
      let prefix = '\uE000GLOSSMATH:'
      while (raw.includes(prefix)) prefix = '\uE000' + prefix
      const tokens = [], chunks = []
      let at = 0, last = 0
      while (at < raw.length && tokens.length < LIMITS.formulas) {
        const char = raw[at]
        if ((char === '`' || char === '~') && !escaped(raw, at)) { at = codeEnd(raw, at); continue }
        if (escaped(raw, at)) { at += 1; continue }
        let opener = '', closer = '', display = false
        if (raw.startsWith('$$', at)) { opener = closer = '$$'; display = true }
        else if (raw.startsWith('\\[', at)) { opener = '\\['; closer = '\\]'; display = true }
        else if (raw.startsWith('\\(', at)) { opener = '\\('; closer = '\\)' }
        else if (char === '$' && singleDollarOpen(raw, at)) { opener = closer = '$' }
        if (!opener) { at += 1; continue }
        const start = at + opener.length, end = findClose(raw, start, closer, opener === '$')
        // A numeric dollar without any closing delimiter is ordinary currency, not pending math.
        if (opener === '$' && end < 0 && /^[0-9]/.test(raw[start] || '')) { at += 1; continue }
        const pending = end < 0
        // Inline $...$ may not eat the next paragraph when the response is incomplete.
        const pendingEnd = opener === '$' && raw.indexOf('\n', start) >= 0 ? raw.indexOf('\n', start) : raw.length
        const finish = pending ? pendingEnd : end + closer.length
        const source = raw.slice(start, pending ? finish : end)
        if (!pending && !source.trim()) { at = finish; continue }
        // Reject a currency pair such as "$20 and $30" while retaining $2x$ and $x+1$.
        if (opener === '$' && /^\d[\d,.]*\s+[A-Za-z]/.test(source) && !/[\\^_={}]/.test(source)) { at += 1; continue }
        const marker = prefix + tokens.length + '\uE001'
        tokens.push({ key: 'math:' + at + ':' + opener, marker, source, raw: raw.slice(at, finish), display, pending, overLimit: source.length > LIMITS.formula, start: at, end: finish })
        chunks.push(raw.slice(last, at), marker)
        last = finish; at = finish
      }
      if (!tokens.length) return { raw, text: raw, tokens: [] }
      chunks.push(raw.slice(last))
      return { raw, text: chunks.join(''), tokens, prefix }
    }
    function engine() {
      const value = env.katex || host[GLOBAL]
      return value && value.version === VERSION && typeof value.renderToString === 'function' ? value : null
    }
    function ensure() {
      if (env.katex) return engine() ? Promise.resolve(engine()) : Promise.reject(new Error('Formula renderer version mismatch'))
      if (loadPromise) return loadPromise
      loadPromise = new Promise((resolve, reject) => {
        const doc = env.document || host.document
        if (!doc || !doc.head || !doc.createElement) { reject(new Error('Formula rendering is unavailable')); return }
        const suffix = '?v=' + VERSION
        const style = doc.createElement('link'), script = doc.createElement('script')
        style.rel = 'stylesheet'; style.href = assets + 'katex-' + VERSION + '.min.css' + suffix
        script.async = true; script.src = assets + 'katex-' + VERSION + '.min.js' + suffix
        let cssReady = false, jsReady = false, settled = false
        const done = () => { if (settled || !cssReady || !jsReady) return; const value = engine(); if (!value) { fail(); return }; settled = true; resolve(value) }
        const fail = () => { if (settled) return; settled = true; style.remove(); script.remove(); reject(new Error('Formula rendering is unavailable')) }
        style.onload = () => { cssReady = true; done() }; style.onerror = fail
        script.onload = () => { jsReady = true; done() }; script.onerror = fail
        doc.head.appendChild(style); doc.head.appendChild(script)
      }).catch(error => { loadPromise = null; throw error })
      return loadPromise
    }
    function formulaHTML(token, suppliedEngine) {
      if (token.pending || token.overLimit || token.source.length > LIMITS.formula) return null
      const renderer = suppliedEngine || engine()
      if (!renderer || renderer.version !== VERSION) return null
      const key = (token.display ? 'd:' : 'i:') + token.source
      if (cache.has(key)) { const value = cache.get(key); cache.delete(key); cache.set(key, value); return value }
      let html
      try {
        html = renderer.renderToString(token.source, {
          displayMode: token.display, output: 'htmlAndMathml', throwOnError: true,
          trust: false, strict: 'ignore', maxExpand: LIMITS.maxExpand, maxSize: LIMITS.maxSize,
          macros: Object.create(null), globalGroup: false,
        })
      } catch { return null }
      cache.set(key, html)
      while (cache.size > LIMITS.cache) cache.delete(cache.keys().next().value)
      return html
    }
    function Formula(props) {
      const token = props.token
      const [ready, update] = React.useState(() => Boolean(engine()))
      React.useEffect(() => {
        let active = true
        if (!ready && !token.pending && !token.overLimit) ensure().then(() => { if (active) update(true) }, () => {})
        return () => { active = false }
      }, [ready, token.pending, token.overLimit])
      const html = ready ? formulaHTML(token) : null
      const className = 'lr-math' + (token.display ? ' is-display' : ' is-inline') + (!html ? ' is-source' : '') + (token.pending ? ' is-pending' : '')
      // Raw source always remains a React text child; only trusted KaTeX output is HTML.
      const attributes = { className, 'data-math-key': token.key, 'data-math-state': token.pending ? 'pending' : html ? 'ready' : 'source' }
      return html ? h('span', { ...attributes, dangerouslySetInnerHTML: { __html: html } }) : h('span', attributes, token.raw)
    }
    const opaque = new Set(['a', 'button', 'code', 'pre', 'math', 'svg', 'textarea', 'input', 'select', 'option', 'script', 'style'])
    function restore(nodes, prepared) {
      if (!prepared || !prepared.tokens.length) return nodes
      const byMarker = new Map(prepared.tokens.map(token => [token.marker, token]))
      const pattern = new RegExp(prepared.prefix + '(\\d+)\uE001', 'g')
      function leaf(value) {
        const out = []; let last = 0, match
        pattern.lastIndex = 0
        while ((match = pattern.exec(value))) {
          const token = byMarker.get(match[0]); if (!token) continue
          if (match.index > last) out.push(value.slice(last, match.index))
          out.push(h(Formula, { token, key: token.key })); last = match.index + match[0].length
        }
        if (!out.length) return value
        if (last < value.length) out.push(value.slice(last))
        return out
      }
      function visit(value) {
        if (typeof value === 'string') return leaf(value)
        if (Array.isArray(value)) return value.map(visit)
        if (!React.isValidElement(value) || typeof value.type !== 'string' || opaque.has(value.type) || !value.props || value.props.children == null || value.props.dangerouslySetInnerHTML) return value
        const children = visit(value.props.children)
        return React.cloneElement(value, {}, children)
      }
      return visit(nodes)
    }
    function render(value, existingRenderer) { const prepared = prepare(value); return restore(existingRenderer(prepared.text), prepared) }
    return Object.freeze({ version: VERSION, limits: LIMITS, prepare, restore, render, Formula, ensure, formulaHTML, cacheSize: () => cache.size })
  })(React, { scope: window })
    window.__glossMath = glossMath
    // END_GLOSS_SHARED_MATH

    // BEGIN_GLOSS_REPLY_MOTION
    const replyMotion = (() => {
      /* Independent candidate. No production imports, HTML injection, network, or timers at module load. */
      const REPLY_MOTION = Object.freeze({ durationMs: 90, staggerMs: 30, maxStaggerMs: 150, maxGroups: 12, maxGraphemes: 96, maxCodeUnits: 512, blurPx: 3.5, settlePaddingMs: 24 })
      
      const asText = value => typeof value === 'string' ? value : value == null ? '' : String(value)
      const sameScope = (a, b) => Boolean(a && b && a.ownerId === b.ownerId && a.runId === b.runId)
      const complexFallback = value => /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u200d\ufe00-\ufe0f\ufe20-\ufe2f]|[\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}]/u.test(value)
      const unpairedSurrogate = value => /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)
      const connectingCharacter = value => /[\p{L}\p{N}\p{M}'’]/u.test(value) && !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(value)
      function safeInlineBoundary(value, at) {
        if (at <= 0 || at >= value.length) return true
        const before = Array.from(value.slice(Math.max(0, at - 2), at)).at(-1) || '', after = String.fromCodePoint(value.codePointAt(at))
        return !(connectingCharacter(before) && connectingCharacter(after))
      }
      let cachedSegmenter
      function defaultSegmenter() {
        if (cachedSegmenter !== undefined) return cachedSegmenter
        cachedSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
        return cachedSegmenter
      }
      
      /** UTF-16 offsets are retained so React text is never normalized or reconstructed. */
      function segmentGraphemes(value, segmenter = defaultSegmenter()) {
        const text = asText(value)
        if (segmenter && typeof segmenter.segment === 'function') return Array.from(segmenter.segment(text), item => ({ text: item.segment, start: item.index, end: item.index + item.segment.length }))
        let at = 0
        return Array.from(text, part => { const entry = { text: part, start: at, end: at + part.length }; at = entry.end; return entry })
      }
      
      function staticPlan(input, reason) { return { ownerId: input.ownerId, runId: input.runId, text: input.text, animate: false, reason, fragments: [], groupCount: 0, durationMs: 0, lastDelayMs: 0, totalMs: 0 } }
      
      /**
       * Only appends in the same request can animate. A large append is readable immediately:
       * only its last 96 graphemes / 512 UTF-16 units receive at most 12 reveal wrappers.
       * leafRanges contain eligible prose only, excluding existing interactive/rich source nodes.
       */
      function planTextUpdate(previous, next, options = {}) {
        const input = { ...next, text: asText(next && next.text) }, config = { ...REPLY_MOTION, ...options }
        const stop = reason => staticPlan(input, reason)
        if (!input.ownerId || !input.runId) return stop('unscoped')
        if (!previous) return stop('initial-or-cached-mount')
        if (!sameScope(previous, input)) return stop('scope-change')
        if (!input.streaming || /^(?:error|interrupted|cancelled|complete|ready|done)$/.test(input.status || '')) return stop('not-streaming')
        if (input.disabled || input.reducedMotion || input.reducedTransparency || input.increasedContrast) return stop('accessibility-static')
        const before = asText(previous.text), current = input.text
        if (current === before) return stop('unchanged')
        if (!current.startsWith(before)) return stop('replacement')
        if (!current.length || unpairedSurrogate(current)) return stop('incomplete-unicode')
        const segmenter = options.segmenter === undefined ? defaultSegmenter() : options.segmenter
        if (!segmenter && complexFallback(current.slice(Math.max(0, before.length - 16)))) return stop('fallback-complex-grapheme-static')
        // Probe the append boundary: a combining mark / flag / ZWJ continuation must not
        // animate independently of a grapheme already visible in the settled prefix.
        let probeStart = Math.max(0, before.length - 64)
        if (probeStart && /[\uDC00-\uDFFF]/.test(current[probeStart])) probeStart--
        const probe = segmentGraphemes(current.slice(probeStart, before.length + 64), segmenter)
        if (!probe.some(part => part.start + probeStart === before.length)) return stop('append-extends-existing-grapheme')
        // Segmentation work is bounded for a burst containing thousands of characters.
        let windowStart = Math.max(before.length, current.length - 4096)
        if (windowStart && /[\uDC00-\uDFFF]/.test(current[windowStart])) windowStart--
        let units = segmentGraphemes(current.slice(windowStart), segmenter).map(part => ({ ...part, start: part.start + windowStart, end: part.end + windowStart }))
        if (windowStart > before.length) units = units.slice(1) // never animate a clipped first cluster
        units = units.filter(part => part.start >= before.length && part.start >= current.length - config.maxCodeUnits).slice(-config.maxGraphemes)
        const ranges = Array.isArray(input.leafRanges) ? input.leafRanges : [{ path: 'text', start: 0, end: current.length }]
        const runs = []
        let leafIndex = 0
        for (const unit of units) {
          while (leafIndex < ranges.length && ranges[leafIndex].end <= unit.start) leafIndex++
          const leaf = ranges[leafIndex]
          if (!leaf || unit.start < leaf.start || unit.end > leaf.end) continue // cluster crosses a rich-node boundary
          const previousRun = runs[runs.length - 1]
          if (previousRun && previousRun.path === leaf.path && previousRun.end === unit.start) { previousRun.units.push(unit); previousRun.end = unit.end }
          else runs.push({ path: leaf.path, start: unit.start, end: unit.end, units: [unit], groups: 1 })
        }
        // Many inline emphasis nodes cannot grow the global wrapper budget.
        const activeRuns = runs.slice(-config.maxGroups)
        let groups = activeRuns.length
        while (groups < config.maxGroups) {
          const choices = activeRuns.filter(run => run.groups < run.units.length).sort((a, b) => b.units.length / b.groups - a.units.length / a.groups)
          if (!choices.length) break
          choices[0].groups++; groups++
        }
        const grouped = []
        for (const run of activeRuns) {
          let at = 0
          for (let count = run.groups; count > 0; count--) {
            const size = Math.ceil((run.units.length - at) / count), start = run.units[at].start, end = run.units[at + size - 1].end
            grouped.push({ path: run.path, start, end, text: current.slice(start, end) }); at += size
          }
        }
        // Avoid introducing extra shaping boundaries inside Latin / connected-script words.
        // A partial word already present in the settled prefix stays entirely static.
        const merged = []
        for (const part of grouped) {
          const previousPart = merged[merged.length - 1]
          if (previousPart && previousPart.path === part.path && previousPart.end === part.start && !safeInlineBoundary(current, part.start)) { previousPart.end = part.end; previousPart.text += part.text }
          else merged.push({ ...part })
        }
        const fragments = merged.flatMap(part => {
          if (safeInlineBoundary(current, part.start)) return [part]
          const safe = segmentGraphemes(part.text, segmenter).find(unit => safeInlineBoundary(current, part.start + unit.start))
          if (!safe) return []
          const start = part.start + safe.start
          return [{ ...part, start, text: current.slice(start, part.end) }]
        })
        if (!fragments.length) return stop('no-safe-prose-tail')
        const step = fragments.length < 2 ? 0 : Math.min(config.staggerMs, config.maxStaggerMs / (fragments.length - 1))
        fragments.forEach((part, index) => { part.delayMs = Math.round(index * step * 1000) / 1000 })
        const lastDelayMs = fragments[fragments.length - 1].delayMs
        return { ownerId: input.ownerId, runId: input.runId, text: current, animate: true, reason: 'new-streamed-tail', fragments, groupCount: fragments.length, prefixLength: fragments[0].start, durationMs: config.durationMs, lastDelayMs, totalMs: config.durationMs + lastDelayMs }
      }
      
      const PROTECTED_TAGS = new Set(['a', 'button', 'input', 'textarea', 'select', 'option', 'pre', 'code', 'math', 'svg', 'script', 'style', 'canvas'])
      function protectedElement(React, node) {
        if (!React.isValidElement(node)) return false
        if (node.type === React.Fragment) return false
        if (typeof node.type !== 'string') return true // never inspect unrendered custom components
        const props = node.props || {}
        return PROTECTED_TAGS.has(node.type) || props['data-reveal'] === 'off' || props.contentEditable || /^(button|link|status|alert|note)$/.test(props.role || '') || /(?:source-group|source-link|source-status|chat-context|term-definition|reply-waiting)/.test(props.className || '')
      }
      
      /** Existing protected elements are opaque and returned by reference. */
      function collectProseLeaves(React, children) {
        const leaves = []
        let length = 0
        function visit(node, path) {
          if (typeof node === 'string' || typeof node === 'number') { const text = String(node); leaves.push({ path, start: length, end: length + text.length, text }); length += text.length; return }
          if (Array.isArray(node)) { node.forEach((child, index) => visit(child, path + '.' + index)); return }
          if (!React.isValidElement(node) || protectedElement(React, node)) return
          visit(node.props.children, path + '.c')
        }
        visit(children, 'r')
        return { text: leaves.map(leaf => leaf.text).join(''), leaves }
      }
      
      /** No wrapper around blocks; no innerHTML; only affected text branches are cloned. */
      function decorateProse(React, children, plan, animationKey = 0, forceStatic = false) {
        if (!plan || !plan.fragments.length) return children
        const leaves = collectProseLeaves(React, children), map = new Map(leaves.leaves.map(leaf => [leaf.path, leaf]))
        const fragments = new Map()
        for (const part of plan.fragments) { if (!fragments.has(part.path)) fragments.set(part.path, []); fragments.get(part.path).push(part) }
        function visit(node, path) {
          if (typeof node === 'string' || typeof node === 'number') {
            const leaf = map.get(path), parts = fragments.get(path)
            if (!leaf || !parts) return node
            const value = String(node), out = []; let at = 0
            for (const part of parts) {
              const start = part.start - leaf.start, end = part.end - leaf.start
              if (start < at || end > value.length || value.slice(start, end) !== part.text) continue
              if (start > at) out.push(value.slice(at, start))
              out.push(React.createElement('span', { key: 'reply-tail-' + animationKey + '-' + part.start, className: 'lr-stream-tail' + (forceStatic ? ' is-static' : ''), style: { '--lr-tail-delay': part.delayMs + 'ms' }, 'data-tail-start': part.start }, part.text)); at = end
            }
            if (!out.length) return node
            if (at < value.length) out.push(value.slice(at))
            return out
          }
          if (Array.isArray(node)) { const out = node.map((child, index) => visit(child, path + '.' + index)); return out.every((item, index) => item === node[index]) ? node : out }
          if (!React.isValidElement(node) || protectedElement(React, node)) return node
          const previous = node.props.children, next = visit(previous, path + '.c')
          return next === previous ? node : React.cloneElement(node, undefined, next)
        }
        return visit(children, 'r')
      }
      
      /** Pure lifecycle state, also used by the React factory and offline race tests. */
      function nextRevealState(previous, input, options = {}) {
        const frame = { ...input, text: asText(input.text), sequence: (previous?.sequence || 0) + 1 }
        if (previous && sameScope(previous, frame) && options.selectionActive && previous.plan?.fragments.length && frame.text.startsWith(previous.text)) return { ...frame, animationKey: previous.animationKey, plan: { ...previous.plan, text: frame.text }, holdingSelection: true, settled: false }
        const unchanged = previous && sameScope(previous, frame) && previous.text === frame.text && previous.streaming === frame.streaming && previous.status === frame.status && previous.reducedMotion === frame.reducedMotion && previous.reducedTransparency === frame.reducedTransparency && previous.increasedContrast === frame.increasedContrast && previous.disabled === frame.disabled
        if (unchanged && !previous.settled) return { ...previous, leafRanges: frame.leafRanges }
        const plan = planTextUpdate(previous, frame, options)
        return { ...frame, animationKey: frame.sequence, plan, holdingSelection: false, settled: !plan.animate }
      }
      
      const CSS = `
      .lr-stream-tail{display:inline;opacity:1;filter:none;animation:lr-stream-tail-in 90ms cubic-bezier(.2,.65,.3,1) both;animation-delay:var(--lr-tail-delay,0ms)}
      @keyframes lr-stream-tail-in{from{opacity:.45;filter:blur(3.5px)}to{opacity:1;filter:blur(0)}}
      .lr-stream-tail.is-static{animation:none;opacity:1;filter:none}
      @media(prefers-reduced-motion:reduce),(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-stream-tail{animation:none!important;opacity:1!important;filter:none!important}}
      `
      
      /**
       * Wrap the result of the existing parser, not a <Markdown> component.
       * selectionRoot is the existing prose / transcript / card-scroller ref: it adds no DOM.
       * At most one settle timer, and one temporary selectionchange listener while selected.
       */
      function createReplyReveal(React, environment = {}) {
        const clock = environment.clock || { setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms), clearTimeout: id => globalThis.clearTimeout(id) }
        const doc = environment.document || (typeof document !== 'undefined' ? document : null)
        const media = query => { try { return environment.matchMedia ? environment.matchMedia(query) : typeof matchMedia === 'function' ? matchMedia(query) : null } catch { return null } }
        const reduceMotion = media('(prefers-reduced-motion: reduce)'), reduceTransparency = media('(prefers-reduced-transparency: reduce)'), moreContrast = media('(prefers-contrast: more)')
        function selected(root) {
          const node = root && 'current' in root ? root.current : root
          if (!node || !doc) return false
          const selection = environment.getSelection ? environment.getSelection() : doc.getSelection?.()
          return Boolean(selection && !selection.isCollapsed && selection.rangeCount && (node.contains(selection.anchorNode) || node.contains(selection.focusNode)))
        }
        function ReplyReveal(props) {
          const committed = React.useRef(null), alive = React.useRef(false), timer = React.useRef(null), selectionCleanup = React.useRef(null)
          const [, redraw] = React.useState(0)
          const prose = collectProseLeaves(React, props.children)
          const input = { ownerId: asText(props.ownerId), runId: asText(props.runId), text: prose.text, leafRanges: prose.leaves, streaming: props.streaming === true, status: props.status, disabled: props.disabled === true || doc?.visibilityState === 'hidden', reducedMotion: props.reducedMotion ?? reduceMotion?.matches ?? false, reducedTransparency: props.reducedTransparency ?? reduceTransparency?.matches ?? false, increasedContrast: props.increasedContrast ?? moreContrast?.matches ?? false }
          const selectionActive = selected(props.selectionRoot)
          const frame = nextRevealState(committed.current, input, { selectionActive, ...environment.planOptions })
          function clear() { if (timer.current != null) clock.clearTimeout(timer.current); timer.current = null; selectionCleanup.current?.(); selectionCleanup.current = null }
          React.useLayoutEffect(() => { alive.current = true; return () => { alive.current = false; clear() } }, [])
          React.useLayoutEffect(() => {
            clear(); committed.current = frame
            if (frame.settled || !frame.plan.fragments.length) return undefined
            const owner = frame.ownerId, run = frame.runId, sequence = frame.sequence
            function valid() { return alive.current && committed.current?.ownerId === owner && committed.current?.runId === run && committed.current?.sequence === sequence }
            function flatten() {
              if (!valid()) return
              if (selected(props.selectionRoot)) {
                if (!selectionCleanup.current && doc?.addEventListener) {
                  const change = () => { if (!valid()) return; if (!selected(props.selectionRoot)) { selectionCleanup.current?.(); selectionCleanup.current = null; flatten() } }
                  doc.addEventListener('selectionchange', change)
                  selectionCleanup.current = () => doc.removeEventListener('selectionchange', change)
                }
                return
              }
              committed.current = { ...committed.current, plan: staticPlan(input, 'settled-flattened'), settled: true, holdingSelection: false }
              redraw(value => value + 1)
            }
            if (frame.holdingSelection) flatten()
            else timer.current = clock.setTimeout(() => { timer.current = null; flatten() }, frame.plan.totalMs + REPLY_MOTION.settlePaddingMs)
            return clear
          }, [input.ownerId, input.runId, input.text, input.streaming, input.status, input.disabled, input.reducedMotion, input.reducedTransparency, input.increasedContrast, selectionActive, props.selectionRoot, frame.animationKey, frame.settled])
          return React.createElement(React.Fragment, null, decorateProse(React, props.children, frame.settled ? null : frame.plan, frame.animationKey, !input.streaming || input.disabled || /^(?:error|interrupted|cancelled|complete|ready|done)$/.test(input.status || '') || input.reducedMotion || input.reducedTransparency || input.increasedContrast))
        }
        return { ReplyReveal, CSS }
      }
      
      /** Explicit scope fence for consumers that preprocess asynchronous deltas outside React. */
      const result = createReplyReveal(React)
      result.tokensCSS = "/* Visual timings only: no reader intent, persistence, request, or PDF-position delays. */\n.lr-root{--gloss-motion-micro:60ms;--gloss-motion-tab:120ms;--gloss-motion-basic:200ms;--gloss-motion-panel:300ms;--gloss-motion-material:450ms}\n.lr-root .lr-pop.is-hybrid .lr-micro-ask{transition-duration:var(--gloss-motion-basic)!important}\n.lr-root .lr-tabs .lr-tab{transition:color var(--gloss-motion-tab) ease}\n.lr-root .lr-tab-lens{transition:transform var(--gloss-motion-tab) cubic-bezier(.16,1,.3,1),background var(--gloss-motion-material) ease,box-shadow var(--gloss-motion-material) ease}\n.lr-root .lr-tabs.is-scrubbing .lr-tab-lens{transition:background var(--gloss-motion-tab) ease,box-shadow var(--gloss-motion-tab) ease}\n.lr-root :is(.lr-glass-button,.lr-color-swatch,.lr-ask-btn,.lr-ideas-send){transition:opacity var(--gloss-motion-micro) ease,background-color var(--gloss-motion-basic) ease,box-shadow var(--gloss-motion-basic) ease}\n.lr-root .lr-pop.is-hybrid .lr-pop-stage{transition:height var(--gloss-motion-panel) cubic-bezier(.16,1,.3,1)}\n.lr-root :is(.lr-reader-button,.lr-more-toggle,.lr-stack-pill){transition:background-color var(--gloss-motion-material) ease,box-shadow var(--gloss-motion-material) ease,transform var(--gloss-motion-micro) ease}\n@media(prefers-reduced-motion:reduce){.lr-root :is(.lr-micro-ask,.lr-tab,.lr-tab-lens,.lr-glass-button,.lr-color-swatch,.lr-ask-btn,.lr-ideas-send,.lr-pop-stage,.lr-reader-button,.lr-more-toggle,.lr-stack-pill){transition:none!important;animation:none!important}}\n"
      return result
    })()
    window.__glossReplyMotion = replyMotion
    // END_GLOSS_REPLY_MOTION

    const STORE_KEY = 'dsh-literature-reader/v1'
    const DB_NAME = 'dsh-literature-reader'
    const PDF_ASSET = '/api/literature/asset/pdf.min.js'
    const PDF_WORKER = '/api/literature/asset/pdf.worker.min.js'
    function useGlassTabRail(activeIndex, count, select, enabled = true) {
      const railRef = useRef(null)
      const gestureRef = useRef(null)
      const previousIndex = useRef(activeIndex)
      const glideTimer = useRef(null)
      const suppressClick = useRef(0)

      function clearGesture() {
        const gesture = gestureRef.current
        if (!gesture) return
        gestureRef.current = null
        const { rail, id } = gesture
        rail.classList.remove('is-pressing', 'is-scrubbing')
        rail.style.removeProperty('--lr-tab-position')
        if (rail.hasPointerCapture?.(id)) rail.releasePointerCapture(id)
      }

      useLayoutEffect(() => {
        const rail = railRef.current
        const changed = previousIndex.current !== activeIndex
        previousIndex.current = activeIndex
        clearGesture()
        if (rail && enabled && changed && activeIndex >= 0) {
          rail.classList.add('is-gliding')
          glideTimer.current = setTimeout(() => rail.classList.remove('is-gliding'), 420)
        }
        return () => {
          clearTimeout(glideTimer.current)
          rail?.classList.remove('is-gliding')
          clearGesture()
        }
      }, [activeIndex, count, enabled])

      function focusTab(rail, index) {
        rail.querySelectorAll('[role="tab"]')[index]?.focus({ preventScroll: true })
      }

      function positionAt(gesture, clientX) {
        const tabs = gesture.rail.querySelectorAll('[role="tab"]')
        const first = tabs[0]?.getBoundingClientRect()
        const last = tabs[count - 1]?.getBoundingClientRect()
        if (!first?.width || !last?.width || count < 2) return Math.max(0, activeIndex)
        const center = first.left + first.width / 2
        const step = (last.left + last.width / 2 - center) / (count - 1)
        if (!step) return Math.max(0, activeIndex)
        return Math.max(0, Math.min(count - 1, (clientX - gesture.offset - center) / step))
      }

      function onPointerDown(event) {
        if (!enabled || event.button !== 0 || event.isPrimary === false || gestureRef.current) return
        const rail = event.currentTarget
        const activeTab = rail.querySelectorAll('[role="tab"]')[activeIndex]
        const bounds = activeTab?.contains(event.target) ? activeTab.getBoundingClientRect() : null
        const offset = bounds ? event.clientX - bounds.left - bounds.width / 2 : 0
        suppressClick.current = 0
        gestureRef.current = { rail, id: event.pointerId, x: event.clientX, y: event.clientY, offset, dragging: false }
        rail.classList.add('is-pressing')
      }

      function onPointerMove(event) {
        if (!enabled || event.isPrimary === false) return
        const rail = event.currentTarget
        const box = rail.getBoundingClientRect()
        const light = Math.max(0, Math.min(100, (event.clientX - box.left) / Math.max(1, box.width) * 100))
        rail.style.setProperty('--lr-glass-x', light.toFixed(1) + '%')
        const gesture = gestureRef.current
        if (!gesture || gesture.id !== event.pointerId) return
        if (!gesture.dragging) {
          const dx = Math.abs(event.clientX - gesture.x), dy = Math.abs(event.clientY - gesture.y)
          if (event.pointerType === 'touch' && dy > 6 && dy > dx) { clearGesture(); return }
          if (dx <= 5) return
          gesture.dragging = true
          rail.classList.add('is-scrubbing')
          if (event.isTrusted && rail.setPointerCapture && !rail.hasPointerCapture(event.pointerId)) rail.setPointerCapture(event.pointerId)
        }
        rail.style.setProperty('--lr-tab-position', String(positionAt(gesture, event.clientX)))
      }

      function finishPointer(event, cancelled) {
        const gesture = gestureRef.current
        if (!gesture || gesture.id !== event.pointerId) return
        const index = gesture.dragging && !cancelled ? Math.round(positionAt(gesture, event.clientX)) : -1
        if (gesture.dragging) suppressClick.current = Date.now() + 120
        clearGesture()
        if (index < 0) return
        select(index)
        focusTab(gesture.rail, index)
      }

      return {
        railProps: {
          ref: railRef,
          style: { '--lr-tab-count': count, '--lr-tab-index': Math.max(0, activeIndex) },
          onPointerDown, onPointerMove,
          onPointerUp: event => finishPointer(event, false),
          onPointerCancel: event => finishPointer(event, true),
          onLostPointerCapture: event => finishPointer(event, true),
          onPointerLeave: event => {
            if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) finishPointer(event, true)
          },
          onClickCapture: event => {
            if (!event.detail || Date.now() >= suppressClick.current) return
            suppressClick.current = 0
            event.preventDefault()
            event.stopPropagation()
          },
        },
        onTabKeyDown(event, index) {
          if (!enabled) return
          const next = event.key === 'ArrowRight' ? (index + 1) % count
            : event.key === 'ArrowLeft' ? (index + count - 1) % count
              : event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : -1
          if (next < 0) return
          event.preventDefault()
          select(next)
          focusTab(event.currentTarget.parentElement, next)
        },
      }
    }

    const TABS = [
      { id: 'brief', label: '速览' },
      { id: 'chapters', label: '逐章精读' },
      { id: 'ideas', label: '研究想法' },
      { id: 'citations', label: '参考文献' },
    ]
    const normalizeTab = (value) => TABS.some((item) => item.id === value) ? value : value ? 'chapters' : 'brief'
    const CARD_TYPES = {
      goal: { label: '研究问题', color: '#3B82F6', tint: 'rgba(214,234,252,.96)', ink: '#2b5f86', line: '#8db8d6' },
      method: { label: '方法', color: '#6366F1', tint: 'rgba(228,226,251,.96)', ink: '#4a3f8f', line: '#a9a6d9' },
      result: { label: '发现', color: '#F59E0B', tint: 'rgba(253,236,203,.96)', ink: '#8a5a12', line: '#d8b169' },
      contribution: { label: '贡献', color: '#10B981', tint: 'rgba(217,242,227,.96)', ink: '#1f6b47', line: '#8fbfa4' },
      limitation: { label: '局限', color: '#EF4444', tint: 'rgba(251,222,222,.96)', ink: '#8f3535', line: '#d49a9a' },
    }
    const HIGHLIGHT_COLORS = [
      { name: '黄色', value: '#f2cf4a' }, { name: '珊瑚色', value: '#ed8781' },
      { name: '绿色', value: '#91ba71' }, { name: '蓝色', value: '#70b2db' },
      { name: '紫色', value: '#ae94d7' }, { name: '灰色', value: '#a8acb5' },
    ]

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    const readerModulePromises = new Map()
    const readerModuleVersions = { chapters: 'd00cf2a914e78372', ideas: 'cc185469f93de401', citations: '6940977e36b4f7be' }
    function loadReaderModule(name) {
      const entry = name === 'ideas' ? { file: 'research-ideas.js', global: 'LiteratureReaderIdeas' } : name === 'chapters' ? { file: 'chapter-reader.js', global: 'LiteratureReaderChapters' } : { file: 'citation-nav.js', global: 'LiteratureReaderCitations' }
      const version = readerModuleVersions[name]
      const loaded = window.__literatureReaderModuleVersions || (window.__literatureReaderModuleVersions = {})
      if (!readerModulePromises.has(name)) {
        const promise = new Promise((resolve, reject) => {
          const ready = () => {
            const exported = window[entry.global]
            if (!exported) { reject(new Error('阅读模块未能加载')); return }
            loaded[name] = version
            resolve(name === 'citations' ? exported.create(React) : exported(React))
          }
          if (window[entry.global] && loaded[name] === version) { ready(); return }
          const script = document.createElement('script')
          script.src = '/api/literature/asset/' + entry.file + '?v=' + version
          script.onload = ready
          script.onerror = () => reject(new Error('阅读模块加载失败，请重试'))
          document.head.appendChild(script)
        }).catch((error) => { readerModulePromises.delete(name); throw error })
        readerModulePromises.set(name, promise)
      }
      return readerModulePromises.get(name)
    }

    function ToolIcon(props) {
      const paths = {
        translate: 'M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
        explain: 'M9 18h6M10 21h4M9 15a6 6 0 1 1 6 0v3H9z',
        copy: 'M8 8h11v13H8zM16 8V3H3v13h5',
        dock: 'M4 4h16v16H4zM15 4v16M18 9v6',
        messageSquare: 'M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z',
        ask: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.6-4.2A8.5 8.5 0 1 1 21 11.5ZM10 8a2 2 0 1 1 3.3 1.5c-.9.6-1.3.9-1.3 2M12 14.5v.1',
        back: 'M15 5l-7 7 7 7',
        close: 'M6 6l12 12M18 6L6 18',
        locate: 'M12 3v3M12 18v3M3 12h3M18 12h3M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0',
        check: 'M5 12l4 4L19 6',
        send: 'M12 19V5M6 11l6-6 6 6',
        minus: 'M5 12h14', plus: 'M5 12h14M12 5v14',
        fit: 'M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5',
        upload: 'M12 15V3M7 8l5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
        open: 'M13 5h6v6m0-6-8 8m6 1v5H5V7h6',
        toc: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
        panel: 'M4 4h16v16H4zM10 4v16',
        skim: 'M5 5h14M5 10h9M5 15h14M5 20h9',
        book: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1c3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15',
        references: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6',
        research: 'M13 5H5v15h15v-8M12 12l8-8 3 3-8 8-4 1z',
      }
      return h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }, h('path', { d: paths[props.name] || paths.translate }))
    }

    /* PDF visual appearance only. No DOM, network, PDF bytes, text or anchor mutation.
     * May be embedded unchanged in the client factory; the returned API is local.
     */
    function createPdfAppearance(options) {
      'use strict';
      const settings = options || {};
      const PAPER = [47, 51, 61], INK = [215, 219, 228];
      const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
      const mode = value => value === 'dark' ? 'dark' : 'original';
      const style = value => value === 'underline' ? 'underline' : 'highlight';
      const surface = (analysis, requestedMode, applied) => analysis && analysis.kind === 'dark' || mode(requestedMode) === 'dark' && applied ? 'dark' : analysis && ['light', 'mixed'].includes(analysis.kind) ? 'light' : 'unknown';
      const luminance = (r, g, b) => .2126 * r + .7152 * g + .0722 * b;
      const validFrame = frame => frame && Number.isInteger(frame.width) && Number.isInteger(frame.height) && frame.width > 0 && frame.height > 0 && frame.data && frame.data.length === frame.width * frame.height * 4;
    
      function analyze(frame) {
        if (!validFrame(frame)) return { kind: 'unavailable', reason: 'invalid-frame' };
        const { width, height, data } = frame, stride = Math.max(1, Math.ceil(Math.sqrt(width * height / 4096)));
        let total = 0, edge = 0, dark = 0, white = 0, neutral = 0, edgeDark = 0, edgeWhite = 0;
        const bins = new Uint32Array(16), edgeBins = new Uint32Array(16), sums = Array.from({ length: 16 }, () => [0, 0, 0, 0]);
        for (let y = 0; y < height; y += stride) for (let x = 0; x < width; x += stride) {
          const at = (y * width + x) * 4;
          if (data[at + 3] < 16) continue;
          const r = data[at], g = data[at + 1], b = data[at + 2], light = luminance(r, g, b), chroma = Math.max(r, g, b) - Math.min(r, g, b);
          const bin = Math.min(15, Math.floor(light / 16)), isEdge = x < width * .055 || x > width * .945 || y < height * .035 || y > height * .965;
          total += 1; dark += light < 105; white += light > 225 && chroma < 36; neutral += chroma < 32; bins[bin] += 1;
          if (isEdge) { edge += 1; edgeDark += light < 105; edgeWhite += light > 225 && chroma < 36; edgeBins[bin] += 1; }
          sums[bin][0] += r; sums[bin][1] += g; sums[bin][2] += b; sums[bin][3] += 1;
        }
        if (!total) return { kind: 'unavailable', reason: 'empty-alpha', sampleCount: 0 };
        const histogram = edge ? edgeBins : bins;
        let dominant = 0;
        for (let bin = 1; bin < 16; bin += 1) if (histogram[bin] > histogram[dominant]) dominant = bin;
        const sum = sums[dominant], background = sum[3] ? sum.slice(0, 3).map(value => Math.round(value / sum[3])) : [255, 255, 255];
        const edgeWhiteRatio = edgeWhite / Math.max(edge, 1), edgeDarkRatio = edgeDark / Math.max(edge, 1), darkRatio = dark / total;
        let kind = 'ambiguous';
        if (edgeDarkRatio >= .60 && darkRatio >= .35) kind = 'dark';
        else if (edgeWhiteRatio >= .45 || white / total >= .60) kind = darkRatio > .16 ? 'mixed' : 'light';
        return { kind, background, whitePoint: clamp(luminance(...background), 225, 255), edgeWhiteRatio, edgeDarkRatio,
          darkRatio, whiteRatio: white / total, neutralRatio: neutral / total, sampleCount: total,
          reason: kind === 'dark' ? 'already-dark' : kind === 'ambiguous' ? 'uncertain-background' : '' };
      }
    
      function clippedRegions(regions, width, height) {
        return (regions || []).map(value => Array.isArray(value) ? value : value && value.rect).filter(value => value && value.length === 4 && value.every(Number.isFinite))
          .map(value => [clamp(Math.floor(value[0]), 0, width), clamp(Math.floor(value[1]), 0, height), clamp(Math.ceil(value[2]), 0, width), clamp(Math.ceil(value[3]), 0, height)])
          .filter(value => value[2] > value[0] && value[3] > value[1]);
      }
    
      // Preserve large native dark panels/code blocks. Text alone does not fill a
      // tile, and a solid dark vector bar with no light detail remains remappable.
      function darkRegions(frame) {
        const cols = 32, rows = clamp(Math.round(frame.height / frame.width * cols), 12, 64), cells = new Uint8Array(cols * rows), detail = new Uint8Array(cells.length);
        for (let cy = 0; cy < rows; cy += 1) for (let cx = 0; cx < cols; cx += 1) {
          let dark = 0, light = 0;
          for (let sy = 0; sy < 4; sy += 1) for (let sx = 0; sx < 4; sx += 1) {
            const x = Math.min(frame.width - 1, Math.floor((cx + (sx + .5) / 4) * frame.width / cols)), y = Math.min(frame.height - 1, Math.floor((cy + (sy + .5) / 4) * frame.height / rows)), at = (y * frame.width + x) * 4;
            const value = luminance(frame.data[at], frame.data[at + 1], frame.data[at + 2]);
            dark += value < 105; light += value > 160;
          }
          cells[cy * cols + cx] = dark >= 12 ? 1 : 0;
          detail[cy * cols + cx] = light;
        }
        const regions = [];
        for (let start = 0; start < cells.length; start += 1) {
          if (cells[start] !== 1) continue;
          const queue = [start]; cells[start] = 2;
          let left = cols, top = rows, right = 0, bottom = 0, light = 0;
          for (let index = 0; index < queue.length; index += 1) {
            const cell = queue[index], x = cell % cols, y = Math.floor(cell / cols);
            left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); light += detail[cell];
            for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && cells[ny * cols + nx] === 1) { cells[ny * cols + nx] = 2; queue.push(ny * cols + nx); }
          }
          if (queue.length < Math.max(8, cells.length * .02) || light < Math.max(2, queue.length * .1)) continue;
          regions.push([left * frame.width / cols, top * frame.height / rows, right * frame.width / cols, bottom * frame.height / rows]);
        }
        return regions;
      }
    
      function remap(frame, requestedMode, params) {
        const config = params || {}, appearance = mode(requestedMode), analysis = config.analysis || analyze(frame);
        if (!validFrame(frame)) return { frame, analysis, applied: false, reason: 'invalid-frame' };
        if (appearance !== 'dark') return { frame, analysis, applied: false, reason: 'original-mode' };
        if (analysis.kind === 'dark' || analysis.kind === 'ambiguous' || analysis.kind === 'unavailable') return { frame, analysis, applied: false, reason: analysis.reason || analysis.kind };
        if (config.regionsComplete === false) return { frame, analysis, applied: false, reason: 'image-regions-incomplete' };
        const { width, height } = frame, input = frame.data, output = new Uint8ClampedArray(input), rows = Array.from({ length: height }, () => []);
        const protectedRects = clippedRegions([...(config.imageRegions || []), ...(config.preserveDarkPanels === false ? [] : darkRegions(frame))], width, height);
        for (const rect of protectedRects) for (let y = rect[1]; y < rect[3]; y += 1) rows[y].push([rect[0], rect[2]]);
        let changed = 0, protectedPixels = 0;
        const whitePoint = analysis.whitePoint || 255;
        const neutralLookup = new Uint8ClampedArray(256 * 3);
        for (let light = 0; light < 256; light += 1) {
          const amount = Math.pow(1 - clamp(light / whitePoint, 0, 1), .88);
          for (let channel = 0; channel < 3; channel += 1) neutralLookup[light * 3 + channel] = Math.round(PAPER[channel] + (INK[channel] - PAPER[channel]) * amount);
        }
        for (let y = 0; y < height; y += 1) {
          const intervals = rows[y].sort((a, b) => a[0] - b[0]);
          const merged = [];
          for (const interval of intervals) { const last = merged[merged.length - 1]; if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]); else merged.push(interval.slice()); }
          let region = 0;
          for (let x = 0; x < width; x += 1) {
            while (region < merged.length && x >= merged[region][1]) region += 1;
            if (region < merged.length && x >= merged[region][0]) { protectedPixels += 1; continue; }
            const at = (y * width + x) * 4;
            if (!input[at + 3]) continue;
            const r = input[at], g = input[at + 1], b = input[at + 2], light = luminance(r, g, b), chroma = Math.max(r, g, b) - Math.min(r, g, b);
            if (chroma === 0) {
              output[at] = neutralLookup[r * 3]; output[at + 1] = neutralLookup[r * 3 + 1]; output[at + 2] = neutralLookup[r * 3 + 2];
              changed += 1;
            } else if (chroma <= 32) {
              const amount = Math.pow(1 - clamp(light / whitePoint, 0, 1), .88), neutral = clamp((32 - chroma) / 12, 0, 1);
              for (let channel = 0; channel < 3; channel += 1) output[at + channel] = Math.round(input[at + channel] * (1 - neutral) + (PAPER[channel] + (INK[channel] - PAPER[channel]) * amount) * neutral);
              changed += 1;
            } else if (light < 118 && config.liftDarkVectors !== false) {
              // Hue-preserving lightening for dark colored vector links/curves;
              // actual bitmap figures are protected byte-for-byte above.
              const lift = clamp((118 - light) / Math.max(1, 255 - light), 0, .55);
              for (let channel = 0; channel < 3; channel += 1) output[at + channel] = Math.round(input[at + channel] + (255 - input[at + channel]) * lift);
              changed += 1;
            }
          }
        }
        return { frame: { width, height, data: output }, analysis, applied: changed > 0, reason: changed ? 'neutral-paper-remap' : 'image-only-page-preserved', protectedRects,
          changedPixels: changed, protectedPixels, paper: PAPER.slice(), ink: INK.slice() };
      }
    
      async function remapAsync(frame, requestedMode, params) {
        const config = params || {}, analysis = config.analysis || analyze(frame);
        if (!validFrame(frame) || mode(requestedMode) !== 'dark' || !['light', 'mixed'].includes(analysis.kind) || config.regionsComplete === false) return remap(frame, requestedMode, { ...config, analysis });
        const isCurrent = config.isCurrent || (() => true), yieldControl = config.yieldControl || (() => new Promise(resolve => setTimeout(resolve, 0)));
        const protectedRects = clippedRegions([...(config.imageRegions || []), ...(config.preserveDarkPanels === false ? [] : darkRegions(frame))], frame.width, frame.height);
        const output = new Uint8ClampedArray(frame.data.length), rows = Math.max(8, Math.floor(100000 / frame.width));
        let changedPixels = 0, protectedPixels = 0;
        for (let top = 0; top < frame.height; top += rows) {
          if (!isCurrent()) return { frame, analysis, applied: false, reason: 'cancelled' };
          const bottom = Math.min(frame.height, top + rows), offset = top * frame.width * 4;
          const part = { width: frame.width, height: bottom - top, data: frame.data.subarray(offset, bottom * frame.width * 4) };
          const result = remap(part, requestedMode, { ...config, analysis, preserveDarkPanels: false,
            imageRegions: protectedRects.map(rect => [rect[0], rect[1] - top, rect[2], rect[3] - top]) });
          output.set(result.frame.data, offset); changedPixels += result.changedPixels || 0; protectedPixels += result.protectedPixels || 0;
          if (bottom < frame.height) await yieldControl();
        }
        if (!isCurrent()) return { frame, analysis, applied: false, reason: 'cancelled' };
        return { frame: { width: frame.width, height: frame.height, data: output }, analysis, applied: changedPixels > 0,
          reason: changedPixels ? 'neutral-paper-remap' : 'image-only-page-preserved', protectedRects, changedPixels, protectedPixels, paper: PAPER.slice(), ink: INK.slice() };
      }
    
      function createQueue(concurrency = 2) {
        const pending = []; let active = 0;
        function pump() {
          while (pending.length && active < Math.max(1, concurrency)) {
            const item = pending.shift();
            if (!item.isCurrent()) { item.resolve(null); continue; }
            active += 1;
            Promise.resolve().then(item.task).then(item.resolve, item.reject).finally(() => { active -= 1; pump(); });
          }
        }
        return {
          run(task, isCurrent = () => true) { return new Promise((resolve, reject) => { pending.push({ task, isCurrent, resolve, reject }); pump(); }); },
          stats() { return { active, pending: pending.length, concurrency: Math.max(1, concurrency) }; }
        };
      }
    
      const multiply = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
      function imageRegions(operatorList, viewport, OPS, config) {
        const regions = [], warnings = [], stack = [], limit = config && config.maxRegions || 128;
        let matrix = viewport.transform.slice(), complete = true;
        const add = (transform, label) => {
          const points = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [transform[0] * x + transform[2] * y + transform[4], transform[1] * x + transform[3] * y + transform[5]]);
          const rect = [Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1])), Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1]))];
          if (rect[2] - rect[0] < 3 || rect[3] - rect[1] < 3) return;
          if (regions.length >= limit) { complete = false; return; }
          regions.push({ rect, kind: label, source: 'pdfjs-image-operator' });
        };
        for (let index = 0; index < operatorList.fnArray.length; index += 1) {
          const op = operatorList.fnArray[index], args = operatorList.argsArray[index] || [];
          if (op === OPS.save || op === OPS.paintFormXObjectBegin || op === OPS.beginGroup) {
            stack.push(matrix.slice());
            const transform = op === OPS.paintFormXObjectBegin ? args[0] : op === OPS.beginGroup && args[0] && args[0].matrix;
            if (transform && transform.length === 6) matrix = multiply(matrix, transform);
          } else if (op === OPS.restore || op === OPS.paintFormXObjectEnd || op === OPS.endGroup) {
            if (stack.length) matrix = stack.pop(); else { complete = false; warnings.push('unbalanced-graphics-state'); }
          } else if (op === OPS.transform) matrix = multiply(matrix, args);
          else if (op === OPS.paintImageXObject || op === OPS.paintInlineImageXObject) add(matrix, 'image');
          else if (op === OPS.paintImageXObjectRepeat) {
            const points = args[3] || [];
            for (let at = 0; at < points.length; at += 2) add(multiply(matrix, [args[1], 0, 0, args[2], points[at], points[at + 1]]), 'repeated-image');
          } else if (op === OPS.paintInlineImageXObjectGroup) {
            for (const image of args[1] || []) if (image.transform && image.transform.length === 6) add(multiply(matrix, image.transform), 'image-group');
          }
        }
        if (stack.length) { complete = false; warnings.push('unclosed-graphics-state'); }
        return { regions, complete, warnings, coordinateSystem: 'pdfjs-viewport-css-px' };
      }
    
      function pixelRegions(regions, viewport, width, height) {
        return clippedRegions((regions || []).map(region => { const box = Array.isArray(region) ? region : region.rect; return [box[0] * width / viewport.width, box[1] * height / viewport.height, box[2] * width / viewport.width, box[3] * height / viewport.height]; }), width, height);
      }
    
      function createCache(config) {
        const maxBytes = config && config.maxBytes || settings.maxBytes || 24 * 1024 * 1024, maxEntries = config && config.maxEntries || 4;
        const entries = new Map(); let bytes = 0;
        const key = metadata => metadata && metadata.documentId && Number.isInteger(metadata.page) && metadata.page > 0 && metadata.width > 0 && metadata.height > 0 ? JSON.stringify([metadata.documentId, metadata.page, metadata.width, metadata.height, metadata.scale || 1, metadata.rotation || 0, 'original']) : null;
        const remove = value => { const record = entries.get(value); if (record) { bytes -= record.frame.data.byteLength; entries.delete(value); } };
        return {
          key,
          get(metadata) { const value = key(metadata), record = value && entries.get(value); if (record) { entries.delete(value); entries.set(value, record); } return record || null; },
          put(metadata, frame, extra) {
            const value = key(metadata); if (!value || !validFrame(frame)) return false;
            remove(value); if (frame.data.byteLength > maxBytes) return false;
            entries.set(value, { ...(extra || {}), metadata: { ...metadata }, frame }); bytes += frame.data.byteLength;
            while (bytes > maxBytes || entries.size > maxEntries) remove(entries.keys().next().value);
            return true;
          },
          clearDocument(documentId) { for (const [value, record] of entries) if (record.metadata.documentId === documentId) remove(value); },
          clear() { entries.clear(); bytes = 0; },
          stats() { return { entries: entries.size, bytes, maxBytes, maxEntries }; }
        };
      }
    
      function paint(context, frame) {
        const image = context.createImageData(frame.width, frame.height);
        image.data.set(frame.data); context.putImageData(image, 0, 0);
      }
    
      function annotationPaint(rect, requestedStyle, color) {
        const value = /^#[\da-f]{6}$/i.test(color || '') ? color : '#f2cf4a', requested = style(requestedStyle);
        const line = Math.min(1.8, Math.max(1, rect.bottom - rect.top));
        return { left: rect.left, top: requested === 'underline' ? Math.max(rect.top, rect.bottom - line) : rect.top,
          width: Math.max(0, rect.right - rect.left), height: requested === 'underline' ? line : Math.max(0, rect.bottom - rect.top),
          style: requested, color: value, alpha: requested === 'underline' ? .94 : .34 };
      }
    
      function updateAnnotations(previous, request) {
        const items = previous || [], anchors = request.anchors || [], identity = JSON.stringify(anchors), requested = style(request.style);
        const existing = items.find(item => JSON.stringify(item.anchors || []) === identity), same = existing && existing.color === request.color && style(existing.style) === requested;
        const removed = Boolean(same && request.toggle !== false), remaining = items.filter(item => JSON.stringify(item.anchors || []) !== identity);
        const record = removed ? null : { ...(existing || {}), id: existing && existing.id || request.id, quote: request.quote, color: request.color, style: requested, anchors,
          createdAt: existing && existing.createdAt || request.createdAt };
        return { annotations: record ? [...remaining, record] : remaining, record, removed };
      }
    
      return { version: 'pdf-appearance/1.0', mode, style, surface, analyze, remap, remapAsync, createQueue, darkRegions, imageRegions, pixelRegions, createCache, paint, annotationPaint, updateAnnotations, PAPER: PAPER.slice(), INK: INK.slice() };
    }
    const pdfAppearance = createPdfAppearance()
    const pdfAppearanceCache = pdfAppearance.createCache()
    const pdfAppearanceQueue = pdfAppearance.createQueue(2)
    const pdfImageOperatorCache = new WeakMap()
    const pdfCanvasMeta = new WeakMap()

    function annotationKey(anchors) { return JSON.stringify(anchors || []) }

    function citationMarker(value) {
      return /^\[?\s*\d{1,3}(?:\s*[,，;；–-]\s*\d{1,3})*\s*\]?$/.test(String(value || '').trim().replace(/［/g, '[').replace(/］/g, ']').replace(/[.。,:：;；]+$/, '').trim())
    }

    function validStructure(value, id) {
      return Boolean(value && value.schemaVersion === 2 && value.parserVersion === 6 && value.documentId === id && value.coordinateSystem && value.coordinateSystem.id === 'mupdf-unrotated-crop-pt-v1' && Array.isArray(value.sections) && Array.isArray(value.references) && Array.isArray(value.pageGeometry))
    }

    /* Integration helper only. Root must wire this inside the task/document guard.
     * No I/O: persist the full pre-upgrade snapshot separately before committing.
     */
    function migrateReadingStateForStructure({ readingState, oldStructure, newStructure, paperId, position, helpers } = {}) {
      if (!paperId || !newStructure || newStructure.documentId !== paperId || newStructure.schemaVersion !== 2 || newStructure.parserVersion !== 6 || !Array.isArray(newStructure.sections)) throw Error('不能迁移到未绑定当前 PDF 的 v6 结构')
      if (!helpers || ['sectionsOf', 'chaptersOf', 'positionForReading', 'normalizedPosition'].some(name => typeof helpers[name] !== 'function')) throw Error('逐章位置模块尚未就绪')
      const saved = readingState && (!readingState.paperId || readingState.paperId === paperId) ? readingState : {}
      const old = oldStructure && oldStructure.documentId === paperId ? oldStructure : null
      const normalize = value => String(value || '').normalize('NFKC').replace(/[\s\u00ad]/g, '').toLowerCase()
      const pageOf = node => node && node.anchor && Number.isInteger(node.anchor.page) ? node.anchor.page : node && Number.isInteger(node.page) ? node.page : null
      const geometry = node => {
        const anchor = node && node.anchor
        if (!anchor || anchor.documentId !== paperId || anchor.status !== 'located' || anchor.quoteVerified !== true) return ''
        const segments = Array.isArray(anchor.segments) && anchor.segments.length ? anchor.segments : [{ page: pageOf(node), pdfBBox: anchor.pdfBBox, bbox: anchor.bbox }]
        const valid = segments.every(segment => Number.isInteger(segment.page) && (Array.isArray(segment.pdfBBox) || Array.isArray(segment.bbox)))
        return valid ? JSON.stringify(segments.map(segment => [segment.page, (segment.pdfBBox || segment.bbox).map(value => Math.round(Number(value) * 100) / 100)])) : ''
      }
      const matches = (a, b) => normalize(a.heading) && normalize(a.heading) === normalize(b.heading) && pageOf(a) === pageOf(b) && pageOf(a) != null
        && normalize(a.anchor && a.anchor.quote) && normalize(a.anchor && a.anchor.quote) === normalize(b.anchor && b.anchor.quote) && geometry(a) && geometry(a) === geometry(b)
      const oldNodes = old ? helpers.sectionsOf(old, paperId) : []
      const newNodes = helpers.sectionsOf(newStructure, paperId), chapters = helpers.chaptersOf(newStructure, paperId)
      const oldMains = old ? helpers.chaptersOf(old, paperId) : []
      const same = oldMains.length && helpers.normalizeState ? helpers.normalizeState(saved, paperId, oldMains) : saved
      const oldById = id => oldNodes.filter(node => [node.id, node.sourceId, node.anchorId].includes(id))
      const mappings = new Map(), stableContent = new Set()
      const body = node => (node.paragraphs || []).map(paragraph => normalize(paragraph.text)).join('|')
      for (const node of oldNodes) {
        const candidates = newNodes.filter(target => matches(node, target))
        if (candidates.length !== 1) continue
        const target = candidates[0]
        for (const id of [node.id, node.sourceId, node.anchorId].filter(Boolean)) {
          // An old identifier with multiple real nodes is ambiguous, even if one
          // candidate happens to match the new heading.
          if (oldById(id).length !== 1) continue
          mappings.set(id, target.id)
          if (body(node) === body(target)) stableContent.add(id)
        }
      }
      const completed = []
      for (const id of Array.isArray(same.completed) ? same.completed : []) {
        const oldCandidates = oldMains.filter(node => [node.id, node.sourceId, node.anchorId].includes(id))
        const target = mappings.get(id)
        if (oldCandidates.length === 1 && target && chapters.some(node => node.id === target)) completed.push(target)
      }
      const scrollPositions = {}, sectionPositions = {}
      for (const [id, value] of Object.entries(same.scrollPositions || {})) {
        const target = mappings.get(id)
        if (target && stableContent.has(id) && Number.isFinite(Number(value))) scrollPositions[target] = Math.max(0, Number(value))
      }
      for (const [id, child] of Object.entries(same.sectionPositions || {})) {
        const target = mappings.get(id), subsection = mappings.get(child)
        if (target && subsection && stableContent.has(id) && chapters.some(node => node.id === target && node.sections.some(section => section.id === subsection))) sectionPositions[target] = subsection
      }
      // The actual same-document PDF position wins. Stored position is only a
      // fallback and is still document-bound; no raw sN position is reused.
      const point = helpers.normalizedPosition(position, paperId) || helpers.normalizedPosition(same.lastSeenPdfPosition, paperId) || helpers.normalizedPosition(same.entryPdfPosition, paperId)
      const mapped = point && helpers.positionForReading(newStructure, paperId, point)
      const first = chapters[0], currentSection = mapped && mapped.chapterId || first && first.id || ''
      const currentSubsection = mapped && mapped.sectionId || currentSection
      if (currentSection && !Object.hasOwn(scrollPositions, currentSection)) scrollPositions[currentSection] = 0
      if (currentSection) sectionPositions[currentSection] = currentSubsection
      const next = { ...same, version: 2, mode: 'direct', paperId, currentSection, currentSubsection,
        completed: [...new Set(completed)], chapterCache: same.chapterCache || {}, translations: same.translations || {},
        scrollPositions, sectionPositions, entryPdfPosition: point, lastSeenPdfPosition: point, railPdfPosition: point,
        pdfMovedSinceEntry: false,
        activeTerm: '', ended: false }
      return { readingState: next, migrated: true, fromParserVersion: old && old.parserVersion || null, toParserVersion: 6,
        remappedPosition: mapped || null, mappings: Object.fromEntries(mappings),
        contentStableMappings: Object.fromEntries([...mappings].filter(([id]) => stableContent.has(id))),
        preserved: { chapterCache: Object.keys(same.chapterCache || {}).length, translations: Object.keys(same.translations || {}).length },
        unmappedCompleted: (Array.isArray(same.completed) ? same.completed : []).filter(id => !completed.includes(mappings.get(id))) }
    }

    function outlineChapterTarget(section, structure, documentId, helpers) {
      if (!section || !validStructure(structure, documentId) || !helpers || typeof helpers.sectionsOf !== 'function' || typeof helpers.chaptersOf !== 'function' || section.anchor && section.anchor.documentId && section.anchor.documentId !== documentId) return null
      const sections = helpers.sectionsOf(structure, documentId), chapters = helpers.chaptersOf(structure, documentId)
      const identifiers = [section.anchorId, section.id, section.anchor && section.anchor.id].filter(Boolean)
      let matches = sections.filter((node) => [node.id, node.sourceId, node.anchorId].some((id) => id && identifiers.includes(id)))
      if (!matches.length && section.heading) matches = sections.filter((node) => node.heading === section.heading.trim() && node.page === section.page)
      if (matches.length !== 1) return null
      const node = matches[0], chapter = chapters.find((item) => item.sections.some((child) => child.id === node.id))
      return chapter ? { chapterId: chapter.id, sectionId: node.id, heading: node.heading } : null
    }

    function outlinePdfPosition(host, documentId, previous) {
      if (!host || !documentId) return null
      const top = host.getBoundingClientRect().top
      const page = Array.from(host.querySelectorAll('.lr-page')).find((node) => node.getBoundingClientRect().bottom > top + 24)
      if (!page || !Number.isInteger(Number(page.dataset.page)) || Number(page.dataset.page) < 1) return null
      const box = page.getBoundingClientRect()
      return { documentId, page: Number(page.dataset.page), fraction: Math.max(0, Math.min(1, (top - box.top) / Math.max(box.height, 1))), intent: 'programmatic', userScrollId: previous && previous.documentId === documentId ? Math.max(0, Number(previous.userScrollId) || 0) : 0 }
    }

    function popupEditingTarget(node) {
      return Boolean(node && (node.isContentEditable || node.closest && node.closest('input,textarea,select,[contenteditable=true],[contenteditable=""]')))
    }

    function popupPointInside(rect, point) {
      return Boolean(rect && point && Number.isFinite(point.x) && Number.isFinite(point.y) && rect.width > 0 && rect.height > 0 && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom)
    }

    function replyWaiting(label, large) {
      return h('span', { className: cls('lr-reply-waiting', large && 'is-large'), role: 'status', 'aria-label': '等待回答', 'aria-live': 'polite', 'data-wait-context': label }, h('span', { className: 'lr-reply-waiting-dots', 'aria-hidden': true }, h('span', { className: 'lr-reply-waiting-dot' }), h('span', { className: 'lr-reply-waiting-dot' }), h('span', { className: 'lr-reply-waiting-dot' })))
    }

    function chatTurnTop(container, target, padding) {
      if (!container || !target || !container.getBoundingClientRect || !target.getBoundingClientRect) return null
      const a = container.getBoundingClientRect(), b = target.getBoundingClientRect()
      if (![a.top, b.top, Number(container.scrollTop)].every(Number.isFinite)) return null
      return Math.max(0, Number(container.scrollTop) + b.top - a.top - (Number(padding) || 0))
    }

    function popupHeaderStackGeometry(input) {
      const title = input.title, width = input.width, height = input.height
      if (!title || ![title.left, title.top, title.width, title.height, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null
      const controls = (input.controls || []).filter((box) => box && [box.left, box.top, box.width, box.height].every(Number.isFinite))
      const minLeft = Number.isFinite(input.minLeft) ? input.minLeft : -Infinity, maxLeft = Number.isFinite(input.maxLeft) ? input.maxLeft : Infinity
      const right = Number.isFinite(input.right) ? input.right : Number.isFinite(maxLeft) ? maxLeft + width : null
      if (right == null) return null
      const left = Math.max(minLeft, Math.min(right - width, maxLeft))
      // Both grid layouts reserve the taller of the expanded36px title and chip.
      // Normalize lower rows, which move when that grid row changes36<->32/48.
      const titleFloor = Math.ceil(Math.max(36, height)), correction = Math.max(0, titleFloor - title.height)
      const expandedBottom = Math.max(title.top + titleFloor, ...controls.map((box) => box.top + box.height + (box.top >= title.top + title.height - .5 ? correction : 0)))
      const top = input.collapsed ? height + 6 : expandedBottom + 6
      return { left, top, width, height, titleFloor, paddingTop: Math.ceil(Math.max(0, Number(input.toolbarTop) || 0) + expandedBottom + height + 18) }
    }

    function popupThreadHasConversation(thread) {
      return Boolean(thread && Array.isArray(thread.turns) && thread.turns.some((turn) => turn && typeof turn.question === 'string' && turn.question.trim()))
    }

    function popupThreadForPaper(thread, owner) {
      return Boolean(thread && thread.documentId === owner && typeof thread.key === 'string' && thread.key && (!thread.anchor || !thread.anchor.documentId || thread.anchor.documentId === owner) && (!thread.selection || !thread.selection.anchor || !thread.selection.anchor.documentId || thread.selection.anchor.documentId === owner) && (!thread.origin || !thread.origin.documentId || thread.origin.documentId === owner) && (!thread.capsuleOrigin || !thread.capsuleOrigin.documentId || thread.capsuleOrigin.documentId === owner))
    }

    function mergePopupThread(items, patch, owner, now) {
      if (!popupThreadForPaper(patch, owner)) return items
      const previous = items.find((item) => item.documentId === owner && item.key === patch.key) || {}
      if (!popupThreadHasConversation(patch) && !popupThreadHasConversation(previous)) return items
      const next = { ...previous, ...patch, documentId: owner, updatedAt: now == null ? Date.now() : now }
      next.turns = (Array.isArray(patch.turns) ? patch.turns : previous.turns || []).filter((turn) => turn && typeof turn.question === 'string' && turn.question.trim()).map((turn) => ({ ...turn, question: String(turn.question), answer: String(turn.answer || '') }))
      if (typeof patch.shortcutHidden !== 'boolean') next.shortcutHidden = Boolean(previous.shortcutHidden)
      next.enteredAsk = Boolean(previous.enteredAsk || patch.enteredAsk || next.turns.length)
      return [...items.filter((item) => item.documentId !== owner || item.key !== patch.key), next]
    }

    function popupRectFromOrigin(host, origin) {
      if (!host || !origin || !Number.isInteger(Number(origin.page)) || Number(origin.page) < 1) return null
      if (![origin.x, origin.y, origin.width, origin.height].every(Number.isFinite) || origin.width <= 0 || origin.height <= 0 || origin.x < -.05 || origin.y < -.05 || origin.x > 1.05 || origin.y > 1.05 || origin.width > 2 || origin.height > 1.25) return null
      const page = host.querySelector('.lr-page[data-page="' + Number(origin.page) + '"]')
      if (!page) return null
      const box = page.getBoundingClientRect()
      if (!(box.width > 0 && box.height > 0)) return null
      return {
        left: box.left + origin.x * box.width, right: box.left + (origin.x + origin.width) * box.width,
        top: box.top + origin.y * box.height, bottom: box.top + (origin.y + origin.height) * box.height,
        pointer: origin.pointer ? { x: box.left + origin.pointer.x * box.width, y: box.top + origin.pointer.y * box.height } : null,
        textEdges: origin.textEdges ? { left: box.left + origin.textEdges.left * box.width, right: box.left + origin.textEdges.right * box.width } : null,
      }
    }

    function popupRectOverlaps(a, b, pad) {
      pad = pad || 0
      return a.right + pad > b.left && a.left - pad < b.right && a.bottom + pad > b.top && a.top - pad < b.bottom
    }


    function popupCapsulePlacement(input) {
      const view = input && input.view, page = input && input.page, source = input && input.source
      if (!view || !page || !source || !(view.width > 0 && page.width > 0)) return null
      const sx = input.sx || 1, sy = input.sy || 1, pad = 3 * Math.max(sx, sy)
      const left = Math.max(view.left + 6 * sx, page.left + 4 * sx), right = Math.min(view.right - 6 * sx, page.right - 4 * sx)
      const top = Math.max(view.top + 8 * sy, Number(input.safeTop) || 0, page.top + 4 * sy), bottom = Math.min(view.bottom - 8 * sy, page.bottom - 4 * sy)
      if (source.bottom < view.top - 32 * sy || source.top > view.bottom + 32 * sy || right <= left || bottom <= top) return null
      const obstacles = (input.obstacles || []).concat(input.reserved || []), edges = source.textEdges || source
      for (const [size, rowHeight, mode] of input.iconOnly ? [[36, 28, 'icon']] : [[88, 30, 'mini'], [36, 28, 'icon']]) {
        const width = size * sx, height = rowHeight * sy
        if (width > right - left || height > bottom - top) continue
        const desired = Math.max(top, Math.min(source.bottom + 8 * sy, bottom - height)), candidates = []
        if (input.preferred) candidates.push({ left: input.preferred.left, top: input.preferred.top, preferred: true })
        for (const shift of [0, -54, 54, -108, 108, -170, 170, -230, 230]) for (const x of [edges.right + 7 * sx, edges.left - width - 7 * sx, right - width, left]) candidates.push({ left: x, top: desired + shift * sy })
        let best = null
        for (const candidate of candidates) {
          const x = Math.max(left, Math.min(candidate.left, right - width)), y = Math.max(top, Math.min(candidate.top, bottom - height))
          const rect = { left: x, right: x + width, top: y, bottom: y + height, width, height }
          if (obstacles.some((box) => popupRectOverlaps(rect, box, pad))) continue
          const score = candidate.preferred ? -1000 : Math.abs(y - desired) / sy + Math.min(Math.abs(x - edges.right), Math.abs(edges.left - rect.right)) / sx * .3
          if (!best || score < best.score) best = { ...rect, score, mode, fallback: false }
        }
        if (best) return best
      }
      return null
    }

    function popupCapsuleFallback(input) {
      const view = input && input.view
      if (!view || !(view.width > 12 && view.height > 12)) return null
      const sx = input.sx || 1, sy = input.sy || 1, preferred = input.preferred || input.source || { left: view.left + 6 * sx, top: view.top + 8 * sy }, reserved = input.reserved || []
      for (const [size, rowHeight, mode] of input.iconOnly ? [[36, 28, 'icon']] : [[88, 30, 'mini'], [36, 28, 'icon']]) {
        const width = size * sx, height = rowHeight * sy
        if (width > view.width - 12 * sx || height > view.height - 12 * sy) continue
        const left = view.left + 6 * sx, right = view.right - width - 6 * sx, top = Math.min(view.bottom - height - 6 * sy, Math.max(view.top + 6 * sy, Number(input.safeTop) || view.top + 6 * sy)), bottom = view.bottom - height - 6 * sy
        for (const point of [{ left: preferred.left, top: preferred.top }, { left: right, top: preferred.top }, { left, top: preferred.top }, { left: right, top: bottom }, { left, top: bottom }, { left: right, top }]) {
          const x = Math.max(left, Math.min(point.left, right)), y = Math.max(top, Math.min(point.top, bottom)), rect = { left: x, right: x + width, top: y, bottom: y + height, width, height, mode, fallback: true }
          if (!reserved.some((box) => popupRectOverlaps(rect, box, 2 * Math.max(sx, sy)))) return rect
        }
      }
      const width = Math.min(36 * sx, view.width - 8 * sx), height = Math.min(28 * sy, view.height - 8 * sy), x = Math.max(view.left + 4 * sx, Math.min(preferred.left, view.right - width - 4 * sx)), y = Math.max(view.top + 4 * sy, Math.min(preferred.top, view.bottom - height - 4 * sy))
      return { left: x, right: x + width, top: y, bottom: y + height, width, height, mode: 'icon', fallback: true }
    }

    function popupUniformBackground(pixels, background) {
      if (!pixels || pixels.length < 4 || !background || background.length < 3) return false
      let sum = 0, count = 0
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 245) return false
        const difference = Math.max(Math.abs(pixels[index] - background[0]), Math.abs(pixels[index + 1] - background[1]), Math.abs(pixels[index + 2] - background[2]))
        if (difference > 18) return false
        sum += difference; count += 1
      }
      return count > 0 && sum / count <= 7
    }

    function popupCapsuleExpansion(input) {
      const view = input && input.view, capsule = input && input.capsule
      if (!view || !capsule || !(view.width > 0 && view.height > 0 && capsule.width > 0 && capsule.height > 0)) return null
      const sx = input.sx || 1, sy = input.sy || 1, width = Math.min(360 * sx, view.width - 16 * sx), height = Math.min(Number(input.height) || 300 * sy, view.height - 16 * sy)
      const left = Math.max(view.left + 8 * sx, Math.min(capsule.left, view.right - width - 8 * sx)), top = Math.max(view.top + 8 * sy, Math.min(capsule.bottom - height, view.bottom - height - 8 * sy))
      return { left: (left - view.left) / sx + (input.scrollLeft || 0), top: (top - view.top) / sy + (input.scrollTop || 0), width: width / sx, viewportLeft: left, viewportTop: top, viewportHeight: view.height / sy, above: true, tipX: 24, capsuleKey: input.key }
    }

    function popupFlipFrame(from, to, opacity, radius) {
      if (!from || !to || !(from.width > 0 && from.height > 0 && to.width > 0 && to.height > 0)) return null
      return { transform: 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + from.width / to.width + ',' + from.height / to.height + ')', opacity, borderRadius: radius + 'px' }
    }

    function cls() {
      return Array.prototype.slice.call(arguments).filter(Boolean).join(' ')
    }

    function textOf(error) {
      if (!error) return '未知错误'
      if (typeof error === 'string') return error
      return error.message || String(error)
    }

    function isAbort(error) {
      return error && (error.name === 'AbortError' || /aborted/i.test(String(error.message || '')))
    }

    function loadStore() {
      try {
        const raw = localStorage.getItem(STORE_KEY)
        if (!raw) return {}
        const value = JSON.parse(raw)
        if (!value || typeof value !== 'object') return {}
        if (value.version === 2 && (!value.paper || value.paper.id === value.documentId)) return value
        try {
          if (!localStorage.getItem(STORE_KEY + '/legacy-backup')) localStorage.setItem(STORE_KEY + '/legacy-backup', raw)
        } catch { /* source restoration also works when backup storage is full */ }
        // Legacy analyses may already belong to another PDF. Preserve the source,
        // but never migrate unbound generated content into a document namespace.
        return { paper: value.paper || null, mode: value.mode, paneWidth: value.paneWidth, migrated: Boolean(value.paper) }
      } catch {
        return {}
      }
    }

    function identityText(text) {
      return String(text || '').normalize('NFKC').replace(/\s+/g, ' ').trim()
    }

    /* Pure helpers for client insertion. No storage, network, model or UI calls.
     * The caller must verify the old v2 record's extracted PDF text before rebind.
     * This only rebinds identity metadata; it does not certify old coordinates or
     * make an old structure parser version reliable. Keep the old record intact.
     */
    function identityMigrationBytes(value) {
      if (value instanceof Uint8Array) return value
      if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      if (Object.prototype.toString.call(value) === '[object ArrayBuffer]') return new Uint8Array(value)
      if (Array.isArray(value)) return new Uint8Array(value)
      throw new TypeError('SHA-256 input must be bytes')
    }

    function sha256Hex(input) {
      const bytes = identityMigrationBytes(input)
      const constants = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
      ]
      const state = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
      const words = new Uint32Array(64)
      const rotate = (value, count) => value >>> count | value << 32 - count
      const blocks = Math.floor((bytes.length + 8) / 64) + 1
      const highBits = Math.floor(bytes.length / 0x20000000) >>> 0
      const lowBits = bytes.length * 8 >>> 0
      for (let block = 0; block < blocks; block += 1) {
        const offset = block * 64
        words.fill(0, 0, 16)
        if (offset + 64 <= bytes.length) {
          for (let i = 0; i < 16; i += 1) {
            const at = offset + i * 4
            words[i] = bytes[at] << 24 | bytes[at + 1] << 16 | bytes[at + 2] << 8 | bytes[at + 3]
          }
        } else {
          for (let i = 0; i < 64; i += 1) {
            const at = offset + i
            const value = at < bytes.length ? bytes[at] : at === bytes.length ? 0x80 : 0
            words[i >>> 2] |= value << 24 - (i & 3) * 8
          }
        }
        if (block === blocks - 1) { words[14] = highBits; words[15] = lowBits }
        for (let i = 16; i < 64; i += 1) {
          const a = words[i - 15], b = words[i - 2]
          const s0 = rotate(a, 7) ^ rotate(a, 18) ^ a >>> 3
          const s1 = rotate(b, 17) ^ rotate(b, 19) ^ b >>> 10
          words[i] = words[i - 16] + s0 + words[i - 7] + s1 >>> 0
        }
        let a = state[0], b = state[1], c = state[2], d = state[3], e = state[4], f = state[5], g = state[6], h = state[7]
        for (let i = 0; i < 64; i += 1) {
          const sum1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)
          const choice = e & f ^ ~e & g
          const t1 = h + sum1 + choice + constants[i] + words[i] >>> 0
          const sum0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)
          const majority = a & b ^ a & c ^ b & c
          const t2 = sum0 + majority >>> 0
          h = g; g = f; f = e; e = d + t1 >>> 0; d = c; c = b; b = a; a = t1 + t2 >>> 0
        }
        state[0] = state[0] + a >>> 0; state[1] = state[1] + b >>> 0
        state[2] = state[2] + c >>> 0; state[3] = state[3] + d >>> 0
        state[4] = state[4] + e >>> 0; state[5] = state[5] + f >>> 0
        state[6] = state[6] + g >>> 0; state[7] = state[7] + h >>> 0
      }
      return Array.from(state, (value) => value.toString(16).padStart(8, '0')).join('')
    }

    async function canonicalDocumentId(text, bytes, cryptoProvider) {
      const isPdf = bytes !== undefined && bytes !== null
      const value = isPdf ? identityMigrationBytes(bytes) : new TextEncoder().encode(String(text || '').normalize('NFKC').replace(/\s+/g, ' ').trim())
      const provider = cryptoProvider === undefined ? typeof globalThis === 'object' && globalThis.crypto : cryptoProvider
      let hex = ''
      if (provider && provider.subtle && typeof provider.subtle.digest === 'function') {
        try {
          const digest = new Uint8Array(await provider.subtle.digest('SHA-256', value))
          if (digest.length === 32) hex = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')
        } catch { /* Insecure/custom app protocols may reject Web Crypto. */ }
      }
      return (isPdf ? 'pdf-' : 'doc-') + (hex || sha256Hex(value))
    }

    function rebindDocumentSnapshot(snapshot, fromId, toId) {
      if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new TypeError('A document snapshot is required')
      if (typeof fromId !== 'string' || !fromId || !/^(?:pdf|doc)-[a-f0-9]{64}$/.test(toId || '')) throw new Error('The target identity must be canonical SHA-256')
      if (!snapshot.paper || typeof snapshot.paper !== 'object' || ![fromId, toId].includes(snapshot.paper.id) || ![fromId, toId].includes(snapshot.documentId)) throw new Error('The snapshot is not bound to the expected source identity')
      // Only storage-generated IDs in metadata fields are composite identities.
      // User prose containing these strings is copied verbatim.
      const prefixes = ['research-workspace:', 'research-conversation:']
      const references = new Set(['id', 'activeId', 'workspaceId', 'conversationId', 'activeConversationId', 'selectedConversationId', 'sourceConversationId', 'threadId', 'activeThreadId', 'parentId'])
      const own = new WeakMap(), foreign = new WeakMap()
      const composite = (value) => {
        if (typeof value !== 'string') return value
        for (const prefix of prefixes) {
          const old = prefix + fromId
          if (value === old || value.startsWith(old + ':')) return prefix + toId + value.slice(old.length)
        }
        return value
      }
      function walk(value, allowed, path) {
        if (!value || typeof value !== 'object') return value
        const identities = ['paperId', 'documentId'].map((key) => Object.getOwnPropertyDescriptor(value, key)).filter((item) => item && Object.prototype.hasOwnProperty.call(item, 'value')).map((item) => item.value).filter((item) => typeof item === 'string' && item)
        const local = allowed && !identities.some((id) => id !== fromId && id !== toId)
        const memo = local ? own : foreign
        if (memo.has(value)) return memo.get(value)
        if (value instanceof Date) { const result = new Date(value.getTime());memo.set(value, result);return result }
        if (value instanceof RegExp) { const result = new RegExp(value.source, value.flags);result.lastIndex = value.lastIndex;memo.set(value, result);return result }
        if (Object.prototype.toString.call(value) === '[object ArrayBuffer]') { const result = value.slice(0);memo.set(value, result);return result }
        if (ArrayBuffer.isView(value)) {
          const copied = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)
          const result = value instanceof DataView ? new DataView(copied) : new value.constructor(copied)
          memo.set(value, result);return result
        }
        if (value instanceof Map) { const result = new Map();memo.set(value, result);for (const [key, item] of value) result.set(walk(key, local, path), walk(item, local, path));return result }
        if (value instanceof Set) { const result = new Set();memo.set(value, result);for (const item of value) result.add(walk(item, local, path));return result }
        const result = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
        memo.set(value, result)
        for (const key of Reflect.ownKeys(value)) {
          if (Array.isArray(value) && key === 'length') continue
          const descriptor = Object.getOwnPropertyDescriptor(value, key)
          if (Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
            let next = descriptor.value
            if (local && (key === 'paperId' || key === 'documentId') && next === fromId) next = toId
            else if (local && path.length === 1 && path[0] === 'paper' && key === 'id' && next === fromId) next = toId
            else if (local && references.has(key)) next = composite(next)
            descriptor.value = walk(next, local, path.concat(String(key)))
          }
          Object.defineProperty(result, key, descriptor)
        }
        if (Array.isArray(value)) result.length = value.length
        return result
      }
      return walk(snapshot, true, [])
    }

    async function documentId(text, bytes) { return canonicalDocumentId(text, bytes, window.crypto) }

    function writeLocalSnapshot(snapshot) {
      const compact = { ...snapshot, structure: null, paragraphs: [], localIndexFromDatabase: true }
      localStorage.setItem(STORE_KEY, JSON.stringify(compact))
    }

    async function fetchJson(path, init) {
      const response = await fetch(path, init)
      const text = await response.text()
      let payload = null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        throw new Error(text.slice(0, 200) || '请求失败 (' + response.status + ')')
      }
      if (!response.ok || !payload || payload.ok === false) {
        const error = new Error((payload && payload.error) || '请求失败 (' + response.status + ')')
        error.code = payload && payload.code
        throw error
      }
      return payload
    }



    // ------------------------------------------------------------------
    // pdf.js
    // ------------------------------------------------------------------

    let pdfjsPromise = null
    const pdfTextGeometry = new WeakMap()
    const pdfInkCache = new WeakMap()

    function registerTextGeometry(textDivs, content, viewport, pageElement) {
      const items = content.items.filter((item) => typeof item.str === 'string')
      const pageBox = pageElement.getBoundingClientRect()
      const screenScaleX = pageBox.width / parseFloat(pageElement.style.width) || 1
      const screenScaleY = pageBox.height / parseFloat(pageElement.style.height) || 1
      const adjustments = []
      let lineId = 0
      let previous = null
      for (let index = 0; index < textDivs.length; index += 1) {
        const span = textDivs[index]
        const item = items[index]
        if (!item || !item.str || (!item.width && !item.height)) continue
        const style = content.styles[item.fontName]
        const transform = window.pdfjsLib.Util.transform(viewport.transform, item.transform)
        const angle = Math.atan2(transform[1], transform[0]) + (style && style.vertical ? Math.PI / 2 : 0)
        const fontHeight = Math.max(1, Math.hypot(transform[2], transform[3]))
        if (previous && item.str.trim()) {
          const dx = transform[4] - previous.x
          const dy = transform[5] - previous.y
          const across = Math.abs(dx * Math.sin(previous.angle) - dy * Math.cos(previous.angle))
          const along = dx * Math.cos(previous.angle) + dy * Math.sin(previous.angle) - previous.length
          const size = Math.max(fontHeight, previous.fontHeight)
          if (previous.hasEOL || across > size * 0.45 || along > size * 2 || Math.cos(angle - previous.angle) < 0.99) lineId += 1
        }
        if (item.str.trim()) {
          previous = { x: transform[4], y: transform[5], angle, length: item.width * viewport.scale, fontHeight, hasEOL: item.hasEOL }
        } else if (previous && item.hasEOL) previous.hasEOL = true
        pdfTextGeometry.set(span, { angle, lineId })
        const vertical = Math.abs(Math.sin(angle)) > 0.999
        const horizontal = Math.abs(Math.sin(angle)) < 0.001
        if (!vertical && !horizontal) continue
        const length = (style && style.vertical ? item.height : item.width) * viewport.scale
        if (!(length > 0)) continue
        if (!(style && style.vertical)) {
          const origin = vertical ? transform[5] : transform[4]
          const direction = vertical ? Math.sin(angle) : Math.cos(angle)
          pdfTextGeometry.set(span, { start: Math.min(origin, origin + direction * length), length, vertical, angle, lineId })
        }
        const box = span.getBoundingClientRect()
        const measured = vertical ? box.height / screenScaleY : box.width / screenScaleX
        if (measured > 0 && Math.abs(measured - length) > 0.2) {
          adjustments.push({ span, ratio: length / measured })
        }
      }
      // Batch reads before writes to avoid reflow once per text item.
      for (const { span, ratio } of adjustments) {
        span.style.transform += ' scaleX(' + ratio + ')'
      }
    }

    function pageInk(canvas) {
      if (!canvas || !canvas.width || !canvas.height) return null
      const metadata = pdfCanvasMeta.get(canvas), original = metadata && pdfAppearanceCache.get(metadata)
      if (original) return original.frame
      // The rendered dark paper is not a text silhouette. A bounded-cache
      // eviction falls back to exact DOM text geometry instead of dark pixels.
      if (canvas.dataset.pdfAppearance === 'dark') return null
      let pixels = pdfInkCache.get(canvas)
      if (!pixels) {
        try {
          pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
          pdfInkCache.set(canvas, pixels)
        } catch { return null }
      }
      return pixels
    }

    function trimToInk(box, canvasBox, pixels) {
      if (!pixels || !canvasBox.width || !canvasBox.height) return box
      const sx = pixels.width / canvasBox.width
      const sy = pixels.height / canvasBox.height
      const x0 = Math.max(0, Math.floor((box.left - canvasBox.left) * sx))
      const x1 = Math.min(pixels.width, Math.ceil((box.right - canvasBox.left) * sx))
      const y0 = Math.max(0, Math.floor((box.top - canvasBox.top) * sy))
      const y1 = Math.min(pixels.height, Math.ceil((box.bottom - canvasBox.top) * sy))
      if (x1 <= x0 || y1 <= y0) return null
      let first = x1
      let last = x0 - 1
      let firstRow = y1
      let lastRow = y0 - 1
      let ink = 0
      const data = pixels.data
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const offset = (y * pixels.width + x) * 4
          if (data[offset + 3] && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 235) {
            first = Math.min(first, x)
            last = Math.max(last, x)
            firstRow = Math.min(firstRow, y)
            lastRow = Math.max(lastRow, y)
            ink += 1
          }
        }
      }
      if (!ink) return null
      // A dark image/background is not a reliable text silhouette.
      if (ink / ((x1 - x0) * (y1 - y0)) > 0.65) return box
      return {
        ...box,
        left: Math.max(box.left, canvasBox.left + (first - 1) / sx),
        right: Math.min(box.right, canvasBox.left + (last + 2) / sx),
        top: Math.max(box.top, canvasBox.top + (firstRow - 1) / sy),
        bottom: Math.min(box.bottom, canvasBox.top + (lastRow + 2) / sy),
      }
    }

    function loadPdfJs() {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER
        return Promise.resolve(window.pdfjsLib)
      }
      if (!pdfjsPromise) {
        pdfjsPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = PDF_ASSET
          script.async = true
          script.onload = () => {
            if (!window.pdfjsLib) {
              reject(new Error('PDF 渲染器不可用'))
              return
            }
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER
            resolve(window.pdfjsLib)
          }
          script.onerror = () => reject(new Error('PDF 渲染器加载失败'))
          document.head.appendChild(script)
        })
      }
      return pdfjsPromise
    }

    function loadPdfDocument(pdfjs, bytes) {
      // The bundled PDF.js requires the CVE-2024-4367 eval mitigation.
      return pdfjs.getDocument({ data: bytes.slice ? bytes.slice() : bytes, isEvalSupported: false })
    }

    async function paintLibraryPdfPage(bytes, canvas, signal, previewWidth) {
      const pdfjs = await loadPdfJs()
      signal.throwIfAborted()
      const loading = loadPdfDocument(pdfjs, bytes)
      let renderTask, cleanup
      const destroy = () => (cleanup ||= loading.destroy().catch(() => {}))
      const cancel = () => { renderTask?.cancel(); void destroy() }
      signal.addEventListener('abort', cancel, { once: true })
      try {
        const pdf = await loading.promise
        signal.throwIfAborted()
        const page = await pdf.getPage(1)
        signal.throwIfAborted()
        const size = page.getViewport({ scale: 1 })
        const width = previewWidth || canvas.parentElement?.clientWidth || 420
        const dpr = Math.max(1, canvas.ownerDocument.defaultView?.devicePixelRatio || 1)
        const scale = Math.min(width * dpr / size.width, 4096 / Math.max(size.width, size.height), Math.sqrt(5_000_000 / (size.width * size.height)))
        const viewport = page.getViewport({ scale })
        const buffer = canvas.ownerDocument.createElement('canvas')
        const context = buffer.getContext('2d', { alpha: false })
        const display = canvas.getContext('2d', { alpha: false })
        if (!context || !display) throw new Error('无法绘制 PDF 预览')
        buffer.width = Math.ceil(viewport.width)
        buffer.height = Math.ceil(viewport.height)
        renderTask = page.render({ canvasContext: context, viewport, background: '#fff' })
        await renderTask.promise
        signal.throwIfAborted()
        canvas.width = buffer.width
        canvas.height = buffer.height
        display.drawImage(buffer, 0, 0)
      } finally {
        signal.removeEventListener('abort', cancel)
        await destroy()
      }
    }

    function joinText(left, right) {
      if (!left) return right
      if (!right) return left
      if (/[A-Za-z0-9]$/.test(left) && /^[A-Za-z0-9]/.test(right)) return left + ' ' + right
      return left + right
    }

    async function extractPdfPages(doc) {
      const pages = []
      for (let index = 1; index <= doc.numPages; index += 1) {
        const page = await doc.getPage(index)
        const content = await page.getTextContent()
        const lines = []
        let line = ''
        for (const item of content.items) {
          if (!item || typeof item.str !== 'string') continue
          line = joinText(line, item.str)
          if (item.hasEOL) {
            lines.push(line)
            line = ''
          }
        }
        if (line.trim()) lines.push(line)
        pages.push(lines.join('\n'))
      }
      return pages
    }

    async function extractPdfText(doc) {
      return (await extractPdfPages(doc)).join('\n\n').trim()
    }

    const researchPdfPages = new WeakMap()

    function getResearchPdfPages(doc) {
      let pages = researchPdfPages.get(doc)
      if (!pages) {
        pages = extractPdfPages(doc).catch(error => {
          researchPdfPages.delete(doc)
          throw error
        })
        researchPdfPages.set(doc, pages)
      }
      return pages
    }

    function looksLikeFileName(title) {
      const value = String(title || '').trim()
      if (!value || /^(?:未命名文献|untitled|document|paper|download)$/i.test(value)) return true
      if (/\.pdf$/i.test(value) || /^(?:arxiv[:\s]*)?\d{4}\.\d{4,5}(?:v\d+)?$/i.test(value) || /^arxiv\s*:/i.test(value)) return true
      return !/\s|[\u4e00-\u9fff]/.test(value) && (/[._-]/.test(value) || /\d{3,}/.test(value))
    }

    async function extractPdfTitle(doc) {
      try {
        const page = await doc.getPage(1)
        const viewport = page.getViewport({ scale: 1 })
        const content = await page.getTextContent()
        const lines = []
        for (const item of content.items) {
          if (!item || typeof item.str !== 'string' || !item.str.trim()) continue
          if (Math.abs(item.transform[1] || 0) > Math.abs(item.transform[0] || 0) || /arxiv\s*:/i.test(item.str)) continue
          const y = item.transform[5]
          const height = Math.abs(item.height || item.transform[3] || 0)
          if (!height) continue
          if (y > viewport.height * 0.965 || y < viewport.height * 0.03) continue
          let line = null
          for (const candidate of lines) {
            if (Math.abs(candidate.y - y) <= Math.max(1.5, height * 0.45)) {
              line = candidate
              break
            }
          }
          if (!line) {
            line = { y, height: 0, text: '' }
            lines.push(line)
          }
          line.height = Math.max(line.height, height)
          line.text = joinText(line.text, item.str)
        }
        const cleaned = lines
          .map((line) => ({ y: line.y, height: line.height, value: line.text.replace(/\s+/g, ' ').trim() }))
          .filter((line) => line.value.length >= 6 && line.value.length <= 220 && !/^(?:https?:\/\/|doi\b|issn\b|isbn\b|arxiv\b|received\b|accepted\b|published\b|open access\b|research article\b)/i.test(line.value))
        if (!cleaned.length) return ''
        const maxHeight = Math.max.apply(null, cleaned.map((line) => line.height))
        const biggest = cleaned.filter((line) => line.height >= maxHeight * 0.9)
        biggest.sort((a, b) => b.y - a.y)
        // A publisher banner can be taller than the article title. Metadata
        // can locate the title, but only text printed below that banner wins.
        const publisherLines = cleaned.filter((line) => line.y > viewport.height * 0.65
          && /^(?:contents lists available at\b|journal homepage\s*:)/i.test(line.value))
        if (publisherLines.length && typeof doc.getMetadata === 'function') {
          const metadata = await doc.getMetadata().catch(() => null)
          const recorded = String(metadata && metadata.info && metadata.info.Title || '').trim()
          if (recorded.length >= 12 && recorded.length <= 240 && !/:\/\/|\.pdf$|^Microsoft Word\b/i.test(recorded)) {
            const titleKey = (value) => value.normalize('NFKC').replace(/[\s\u00ad\u200b]/g, '').toLowerCase()
            const wanted = titleKey(recorded)
            const bannerBottom = Math.min(...publisherLines.map((line) => line.y))
            const articleLines = biggest.filter((line) => line.y < bannerBottom && line.y > viewport.height * 0.6)
            for (const [index, first] of articleLines.entries()) {
              let printed = first.value
              let prior = first
              for (const next of articleLines.slice(index + 1, index + 4)) {
                if (titleKey(printed) === wanted || !wanted.startsWith(titleKey(printed))
                  || prior.y - next.y > prior.height * 1.8 || Math.abs(next.height - first.height) > 0.75) break
                printed += ' ' + next.value
                prior = next
              }
              if (titleKey(printed) === wanted) return printed
            }
          }
        }
        const parts = []
        let previous = null
        for (const line of biggest) {
          if (/^(https?:\/\/|doi\b|issn\b|isbn\b)/i.test(line.value)) continue
          if (/^[\d\s.,:;()\-/]+$/.test(line.value)) continue
          if (previous && previous.y - line.y > previous.height * 2.4) break
          parts.push(line.value)
          previous = line
          if (parts.length >= 3) break
        }
        const title = parts.join(' ').replace(/\s+/g, ' ').trim()
        return title.length >= 8 ? title.slice(0, 240) : ''
      } catch {
        return ''
      }
    }

    // ------------------------------------------------------------------
    // IndexedDB (remember the current PDF across refreshes)
    // ------------------------------------------------------------------

    function openDb() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('files')) db.createObjectStore('files')
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }

    async function idbPut(key, value) {
      const db = await openDb()
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite')
        tx.objectStore('files').put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    }

    async function idbGet(key) {
      const db = await openDb()
      const value = await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readonly')
        const request = tx.objectStore('files').get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      db.close()
      return value
    }

    async function libraryDbOperation(method, key) {
      const db = await openDb()
      try {
        return await new Promise((resolve, reject) => {
          const tx = db.transaction('files', method === 'delete' ? 'readwrite' : 'readonly')
          const store = tx.objectStore('files')
          const request = key === undefined ? store[method]() : store[method](key)
          tx.oncomplete = () => resolve(request.result)
          tx.onabort = () => reject(tx.error)
          tx.onerror = () => reject(tx.error)
        })
      } finally { db.close() }
    }

    const LIBRARY_STORE = STORE_KEY + '/library'
    const LIBRARY_DEFAULTS = { pdfDirectory: '', defaultFolderId: '', openAfterImport: true, rememberFolder: true }

    function loadLibrary(legacy) {
      try {
        const stored = JSON.parse(localStorage.getItem(LIBRARY_STORE))
        if (stored && Array.isArray(stored.documents)) {
          const settings = { ...LIBRARY_DEFAULTS, ...stored.settings }
          return { ...stored, settings, folderId: settings.rememberFolder ? stored.folderId : '' }
        }
      } catch { /* the previous picker remains a migration source */ }
      return { documents: Array.isArray(legacy) ? legacy : [], folders: [], deleted: [], settings: LIBRARY_DEFAULTS, folderId: '' }
    }

    function libraryResearchPreview(snapshot) {
      const paper = snapshot?.paper
      if (!paper) return ''
      function brief(value) {
        return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280)
      }
      const abstract = brief(paper.meta?.abstract)
      if (abstract) return abstract
      const text = String(paper.text || '').slice(0, 16000)
      const heading = /(?:^|\n)[ \t]*(?:abstract\b|摘[ \t]*要)[ \t]*[:：.\-–—]?[ \t\r\n]*/i.exec(text)
      if (heading) {
        const rest = text.slice(heading.index + heading[0].length)
        const boundary = rest.search(/\n[ \t]*(?:keywords?\b|index terms\b|关键词|(?:1[.．]?[ \t]*)?introduction\b|(?:[一1][、.．]?[ \t]*)?引言)/i)
        const excerpt = brief(boundary >= 0 ? rest.slice(0, boundary) : rest)
        if (excerpt.length >= 36) return excerpt
      }
      const cards = (snapshot.cards || []).filter((item) => item.quote)
      const card = cards.find((item) => ['method', 'result', 'finding', 'contribution'].includes(item.type)) || cards[0]
      if (card) return brief(card.quote)
      const paragraph = (snapshot.paragraphs || []).find((item) => {
        const content = brief(item.text)
        return content.length > 150 && !/\b(?:arxiv|copyright|correspondence)\b|收稿日期|通信作者|@/i.test(content)
      })
      return brief(paragraph?.text)
    }

    function jsonPost(body, signal) {
      return { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal }
    }

    function localLibraryPost(body, signal) {
      const options = jsonPost(body, signal)
      options.headers['x-gloss-local-operation'] = '1'
      return options
    }


    // ------------------------------------------------------------------
    // markdown (small, self-contained)
    // ------------------------------------------------------------------

    function splitRow(line) {
      return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
    }

    function inlineNodes(text, keyBase) {
      const nodes = []
      const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
      let last = 0
      let match
      let index = 0
      while ((match = pattern.exec(text))) {
        if (match.index > last) nodes.push(text.slice(last, match.index))
        const token = match[0]
        if (token.startsWith('**')) nodes.push(h('strong', { key: keyBase + '-b' + index }, token.slice(2, -2)))
        else nodes.push(h('code', { key: keyBase + '-c' + index }, token.slice(1, -1)))
        index += 1
        last = match.index + token.length
      }
      if (last < text.length) nodes.push(text.slice(last))
      return nodes
    }

    function renderMarkdown(text) { return glossMath.render(text, renderMarkdownPlain) }

    function renderMarkdownPlain(text) {
      const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
      const out = []
      let i = 0
      let key = 0
      while (i < lines.length) {
        const line = lines[i]
        if (!line.trim()) {
          i += 1
          continue
        }
        if (/^```/.test(line)) {
          const buffer = []
          i += 1
          while (i < lines.length && !/^```/.test(lines[i])) {
            buffer.push(lines[i])
            i += 1
          }
          i += 1
          out.push(h('pre', { key: 'pre' + key++ }, h('code', null, buffer.join('\n'))))
          continue
        }
        const heading = line.match(/^(#{1,6})\s+(.*)$/)
        if (heading) {
          const level = Math.min(heading[1].length + 2, 6)
          out.push(h('h' + level, { key: 'h' + key++ }, inlineNodes(heading[2], 'h' + key)))
          i += 1
          continue
        }
        if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
          const header = splitRow(line)
          i += 2
          const rows = []
          while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
            rows.push(splitRow(lines[i]))
            i += 1
          }
          out.push(
            h(
              'div',
              { className: 'lr-tablewrap', key: 'table' + key++ },
              h(
                'table',
                null,
                h('thead', null, h('tr', null, header.map((cell, index) => h('th', { key: index }, inlineNodes(cell, 'th' + index))))),
                h(
                  'tbody',
                  null,
                  rows.map((row, rowIndex) =>
                    h('tr', { key: rowIndex }, row.map((cell, cellIndex) => h('td', { key: cellIndex }, inlineNodes(cell, 'td' + rowIndex + '-' + cellIndex)))),
                  ),
                ),
              ),
            ),
          )
          continue
        }
        if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
          const ordered = /^\s*\d+[.)]\s+/.test(line)
          const items = []
          while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''))
            i += 1
          }
          out.push(h(ordered ? 'ol' : 'ul', { key: 'list' + key++ }, items.map((item, index) => h('li', { key: index }, inlineNodes(item, 'li' + index)))))
          continue
        }
        if (/^>\s?/.test(line)) {
          const buffer = []
          while (i < lines.length && /^>\s?/.test(lines[i])) {
            buffer.push(lines[i].replace(/^>\s?/, ''))
            i += 1
          }
          out.push(h('blockquote', { key: 'quote' + key++ }, renderMarkdown(buffer.join('\n'))))
          continue
        }
        if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
          out.push(h('hr', { key: 'hr' + key++ }))
          i += 1
          continue
        }
        const buffer = [line]
        i += 1
        while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\s*([-*+]|\d+[.)])\s+|>|\s*\|)/.test(lines[i])) {
          buffer.push(lines[i])
          i += 1
        }
        out.push(h('p', { key: 'p' + key++ }, inlineNodes(buffer.join(' '), 'p' + key)))
      }
      return out
    }

    // ------------------------------------------------------------------
    // SSE
    // ------------------------------------------------------------------

    function dispatchSse(raw, onEvent) {
      let event = 'message'
      let data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5).trim()
      }
      if (!data) return
      let payload
      try {
        payload = JSON.parse(data)
      } catch {
        return
      }
      onEvent(event, payload)
    }

    async function readSse(body, onEvent) {
      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        for (;;) {
          const step = await reader.read()
          if (step.done) break
          buffer += decoder.decode(step.value, { stream: true })
          let index
          while ((index = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, index)
            buffer = buffer.slice(index + 2)
            dispatchSse(raw, onEvent)
          }
        }
        if (buffer.trim()) dispatchSse(buffer, onEvent)
      } finally {
        try {
          reader.releaseLock()
        } catch {
          /* ignore */
        }
      }
    }

    async function streamPost(path, payload, onEvent, signal) {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      })
      if (!response.ok) {
        let detail = ''
        try {
          detail = await response.text()
        } catch {
          /* ignore */
        }
        let message = detail
        try {
          const parsed = JSON.parse(detail)
          message = parsed.error || detail
        } catch {
          /* keep text */
        }
        throw new Error(message || '请求失败 (' + response.status + ')')
      }
      if (!response.body) throw new Error('浏览器不支持流式响应')
      await readSse(response.body, onEvent)
    }

    // ------------------------------------------------------------------
    // selection translation (cached + shared between prefetch and popup)
    // ------------------------------------------------------------------

    const translationCache = new Map()
    const translationInflight = new Map()

    function trimTranslationCache() {
      while (translationCache.size > 300) {
        const oldest = translationCache.keys().next().value
        translationCache.delete(oldest)
      }
    }

    function emitTranslation(record) {
      for (const listener of record.listeners) {
        try {
          listener(record)
        } catch {
          /* a listener must not break the stream */
        }
      }
      if (record.done) record.listeners.clear()
    }

    function cancelTranslations(scope) {
      for (const [key, record] of translationInflight) {
        if (record.scope !== scope) continue
        record.done = true
        record.error = new DOMException('译文请求已取消', 'AbortError')
        record.controller.abort()
        if (record.timer) clearTimeout(record.timer)
        emitTranslation(record)
        translationInflight.delete(key)
      }
    }

    function ensureTranslation(raw, scope) {
      const source = String(raw || '').replace(/\s+/g, ' ').trim()
      if (!source || !scope) return null
      const key = scope + '\u0000' + source
      if (citationMarker(source)) return { key, cached: '已选中参考文献编号，可提问核对本篇引文。', record: null }
      if (translationCache.has(key)) return { key, cached: translationCache.get(key), record: null }
      let record = translationInflight.get(key)
      if (!record) {
        const controller = new AbortController()
        record = { key, scope, controller, text: '', done: false, error: null, listeners: new Set(), timer: null }
        translationInflight.set(key, record)
        streamPost(
          '/api/literature/translate',
          { text: source },
          (event, data) => {
            if (record.done) return
            if (event === 'delta') {
              const hadText = Boolean(record.text.trim())
              record.text += data.text || ''
              if (!hadText && record.text.trim()) emitTranslation(record)
              else if (!record.timer) {
                record.timer = setTimeout(() => {
                  record.timer = null
                  emitTranslation(record)
                }, 60)
              }
            } else if (event === 'done') {
              record.text = data.text || record.text
              record.done = true
              if (record.timer) {
                clearTimeout(record.timer)
                record.timer = null
              }
              translationCache.set(key, record.text)
              trimTranslationCache()
              translationInflight.delete(key)
              emitTranslation(record)
            } else if (event === 'error') {
              record.error = new Error(data.message || '翻译失败')
              record.done = true
              translationInflight.delete(key)
              emitTranslation(record)
            }
          },
          controller.signal,
        ).catch((error) => {
          if (record.done) return
          record.error = error
          record.done = true
          translationInflight.delete(key)
          emitTranslation(record)
        })
      }
      return { key, cached: undefined, record }
    }

    // ------------------------------------------------------------------
    // components
    // ------------------------------------------------------------------

    function isPdfFile(file) {
      return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    }

    function EmptyState(props) {
      const stageRef = useRef(null)
      const libraryPane = useRef(null)
      const dropFrame = useRef(null)
      const dropModeRef = useRef('')
      const dropTimeout = useRef(0)
      const [dropMode, setDropMode] = useState('')
      const progressRef = useRef(Number(props.libraryOpen))
      const motionFrame = useRef(0)
      const wheelTimer = useRef(0)
      const pointerRef = useRef(null)
      const suppressClick = useRef(0)
      const callbacks = useRef(props)
      callbacks.current = props
      const actions = [
        ['上传 PDF', 'upload', props.onUpload],
        ['从 Zotero 导入', 'book', props.onZotero],
      ]
      const clampProgress = value => Math.max(0, Math.min(1, value))
      const reducedMotion = () => stageRef.current?.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
      const dragDistance = () => Math.max(140, (libraryPane.current?.offsetWidth || 0) * .68)
      const slideSurface = (target, open) => open
        ? target.closest('.gl-library-header') && !target.closest('.lr-tabs, button, a, input, select')
        : target.closest('.lr-welcome-home')

      function showDropMode(next) {
        if (next === dropModeRef.current) return
        dropModeRef.current = next
        setDropMode(next)
      }

      function cancelPdfDrop() {
        clearTimeout(dropTimeout.current)
        if (dropModeRef.current !== 'loading') showDropMode('')
      }

      function containsDropPoint(node, event) {
        const rect = node?.getBoundingClientRect()
        return rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      }

      function hoverPdfDrop(event) {
        const transfer = event.dataTransfer
        if (props.libraryOpen || !Array.from(transfer?.types || []).includes('Files')) return
        const items = Array.from(transfer.items || []).filter(item => item.kind === 'file')
        if (items.length && items.every(item => item.type && !['application/pdf', 'application/octet-stream'].includes(item.type))) return
        event.preventDefault()
        if (dropModeRef.current === 'loading') { transfer.dropEffect = 'none'; return }
        const ready = containsDropPoint(dropFrame.current, event)
        transfer.dropEffect = ready ? 'copy' : 'none'
        showDropMode(ready ? 'ready' : 'armed')
        clearTimeout(dropTimeout.current)
        dropTimeout.current = setTimeout(cancelPdfDrop, 1100)
      }

      function leavePdfDrop(event) {
        const next = event.relatedTarget
        if (next?.nodeType && event.currentTarget.contains(next)) return
        if ((!event.clientX && !event.clientY) || !containsDropPoint(event.currentTarget, event)) cancelPdfDrop()
      }

      async function receivePdfDrop(event) {
        if (props.libraryOpen) return
        const files = Array.from(event.dataTransfer?.files || [])
        if (dropModeRef.current !== 'loading' && !files.some(isPdfFile)) { cancelPdfDrop(); return }
        event.preventDefault()
        event.stopPropagation()
        if (dropModeRef.current === 'loading') return
        const inside = containsDropPoint(dropFrame.current, event)
        cancelPdfDrop()
        if (!inside || files.length !== 1) return
        showDropMode('loading')
        try { await props.onPdfDrop(files[0]) }
        finally { if (stageRef.current) showDropMode('') }
      }

      useEffect(() => () => clearTimeout(dropTimeout.current), [])
      useEffect(() => {
        if (props.libraryOpen) cancelPdfDrop()
      }, [props.libraryOpen])
      useEffect(() => {
        if (dropMode !== 'armed' && dropMode !== 'ready') return
        const doc = stageRef.current?.ownerDocument
        const cancelOnEscape = event => { if (event.key === 'Escape') cancelPdfDrop() }
        doc?.addEventListener('keydown', cancelOnEscape)
        return () => doc?.removeEventListener('keydown', cancelOnEscape)
      }, [dropMode])

      function paint(value) {
        progressRef.current = clampProgress(value)
        stageRef.current?.style.setProperty('--lr-welcome-progress', progressRef.current.toFixed(4))
      }

      function settle(open) {
        cancelAnimationFrame(motionFrame.current)
        motionFrame.current = 0
        const target = Number(open), start = progressRef.current
        if (reducedMotion() || Math.abs(target - start) < .004) { paint(target); return }
        const started = performance.now()
        const duration = 470 * (.52 + .48 * Math.abs(target - start))
        const ramp = .16
        function animate(now) {
          const time = clampProgress((now - started) / duration)
          let distance
          if (time < ramp) distance = time ** 2 / (2 * ramp)
          else if (time > 1 - ramp) distance = 1 - ramp - (1 - time) ** 2 / (2 * ramp)
          else distance = time - ramp / 2
          paint(start + (target - start) * distance / (1 - ramp))
          motionFrame.current = time < 1 ? requestAnimationFrame(animate) : 0
        }
        motionFrame.current = requestAnimationFrame(animate)
      }

      function commit(open) {
        const current = callbacks.current
        if (open === current.libraryOpen) { settle(open); return }
        if (open) current.onLibrary()
        else current.onCloseLibrary()
      }

      useLayoutEffect(() => {
        const stage = stageRef.current, pane = libraryPane.current
        const slot = pane?.querySelector('.gl-library-logo-slot')
        if (!stage || !pane || !slot) return
        function positionLogo() {
          const bounds = pane.getBoundingClientRect(), dock = slot.getBoundingClientRect()
          if (!dock.width || !dock.height) return
          stage.style.setProperty('--lr-welcome-dock-x', (dock.left - bounds.left + dock.width / 2) + 'px')
          stage.style.setProperty('--lr-welcome-dock-y', (dock.top - bounds.top + dock.height / 2) + 'px')
          stage.style.setProperty('--lr-welcome-dock-size', dock.width + 'px')
        }
        positionLogo()
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(positionLogo) : null
        observer?.observe(pane)
        observer?.observe(slot.closest('.gl-library-header') || slot)
        return () => observer?.disconnect()
      }, [])

      useLayoutEffect(() => { settle(props.libraryOpen) }, [props.libraryOpen])
      useEffect(() => {
        const stage = stageRef.current
        if (!stage) return
        function onWheel(event) {
          if (dropModeRef.current || pointerRef.current || event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) || !slideSurface(event.target, callbacks.current.libraryOpen)) return
          const progress = progressRef.current
          if ((progress === 0 && event.deltaX < 0) || (progress === 1 && event.deltaX > 0)) return
          event.preventDefault()
          clearTimeout(wheelTimer.current)
          cancelAnimationFrame(motionFrame.current)
          const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1)
          const next = clampProgress(progress + delta / dragDistance())
          if (reducedMotion()) progressRef.current = next
          else paint(next)
          wheelTimer.current = setTimeout(() => commit(progressRef.current > (callbacks.current.libraryOpen ? .65 : .34)), 125)
        }
        stage.addEventListener('wheel', onWheel, { passive: false })
        return () => {
          stage.removeEventListener('wheel', onWheel)
          clearTimeout(wheelTimer.current)
          cancelAnimationFrame(motionFrame.current)
        }
      }, [])

      function beginPull(event) {
        const button = event.target.closest('button, a')
        if (dropModeRef.current || event.button !== 0 || event.isPrimary === false || pointerRef.current ||
            !slideSurface(event.target, props.libraryOpen) || (button && !button.classList.contains('lr-welcome-library-cue'))) return
        pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, initial: progressRef.current, progress: progressRef.current, dragging: false }
      }

      function movePull(event) {
        const pointer = pointerRef.current
        if (!pointer || pointer.id !== event.pointerId) return
        const distance = pointer.x - event.clientX, vertical = Math.abs(pointer.y - event.clientY)
        if (!pointer.dragging) {
          if (vertical > 8 && vertical > Math.abs(distance)) { pointerRef.current = null; return }
          if (Math.abs(distance) <= 6) return
          pointer.dragging = true
          pointer.initial = progressRef.current
          clearTimeout(wheelTimer.current)
          cancelAnimationFrame(motionFrame.current)
          if (event.isTrusted) event.currentTarget.setPointerCapture?.(event.pointerId)
        }
        pointer.progress = clampProgress(pointer.initial + distance / dragDistance())
        if (!reducedMotion()) paint(pointer.progress)
      }

      function endPull(event, cancelled) {
        const pointer = pointerRef.current
        if (!pointer || pointer.id !== event.pointerId) return
        if (!cancelled && pointer.dragging) movePull(event)
        pointerRef.current = null
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        if (!pointer.dragging) return
        suppressClick.current = Date.now() + 160
        commit(cancelled ? props.libraryOpen : pointer.progress > (props.libraryOpen ? .65 : .34))
      }

      const actionsHidden = props.libraryOpen || Boolean(dropMode)
      return h('section', { className: 'lr-empty lr-welcome', ref: stageRef, 'aria-label': 'Gloss 主页', 'data-library-open': String(props.libraryOpen), 'data-pdf-drop': dropMode || undefined,
        onDragEnter: hoverPdfDrop, onDragOver: hoverPdfDrop, onDragLeave: leavePdfDrop, onDrop: receivePdfDrop,
        onPointerDown: beginPull, onPointerMove: movePull,
        onPointerUp: event => endPull(event, false), onPointerCancel: event => endPull(event, true),
        onLostPointerCapture: event => endPull(event, true),
        onPointerLeave: event => { if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) endPull(event, true) },
      },
        h('div', { className: 'lr-welcome-home' },
          h(WelcomeCitations, { active: !actionsHidden }),
          h('div', { className: 'lr-welcome-intro', 'aria-hidden': actionsHidden || undefined, inert: actionsHidden ? '' : undefined },
            h('h1', null, 'Gloss'),
            h('div', { className: 'lr-empty-actions' }, actions.map(([label, icon, run], index) =>
              h('button', { key: label, type: 'button', className: cls('lr-welcome-action', index === 0 && 'is-primary'), style: { '--lr-welcome-index': index }, onClick: run },
                h(ToolIcon, { name: icon }), h('span', null, label))))),
          h('button', { type: 'button', className: 'lr-welcome-library-cue lr-library-trigger', 'aria-controls': 'gl-library-drawer', 'aria-expanded': props.libraryOpen,
            'aria-hidden': actionsHidden || undefined, inert: actionsHidden ? '' : undefined, tabIndex: actionsHidden ? -1 : 0,
            onClick: event => { if (!event.detail || Date.now() >= suppressClick.current) props.onLibrary() },
          },
          h('svg', { width: 23, height: 23, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: 'm11 6-6 6 6 6m-6-6h14' })),
          h('span', null, '文献库'))),
        h('div', { className: 'lr-welcome-library-pane', ref: libraryPane }, props.library),
        h('div', { className: 'lr-welcome-brand', role: props.libraryOpen ? 'img' : undefined, 'aria-label': props.libraryOpen ? 'Gloss 标志' : undefined },
          h('div', { className: 'lr-empty-mark', ref: dropFrame },
            h(PanelIcon, { size: 46 }),
            h('div', { className: 'lr-welcome-drop-copy', role: 'status', 'aria-atomic': true },
              h('strong', { className: 'lr-welcome-drop-title' }, dropMode === 'loading' ? '正在打开 PDF' : dropMode === 'ready' ? '松手打开 PDF' : dropMode ? '拖放 PDF' : ''),
              h('span', { className: 'lr-welcome-drop-hint' }, dropMode === 'armed' ? '移到接收区内再松手' : ''),
              h('span', { className: 'lr-welcome-drop-meter', 'aria-hidden': true })))))
    }

    function matchKey(value) {
      const map = []
      let key = ''
      for (let i = 0; i < value.length; i += 1) {
        let ch = value[i]
        if (/\s/.test(ch) || ch === '-' || ch === '\u00ad') continue
        if (ch.charCodeAt(0) > 127) ch = ch.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-')
        ch = ch.toLowerCase()
        for (let j = 0; j < ch.length; j += 1) {
          key += ch[j]
          map.push(i)
        }
      }
      return { key, map }
    }

    function matchKeyText(value) {
      return matchKey(String(value || '')).key
    }

    function adjacentPdfQuoteParts(previous, current, key, page) {
      if (!previous || !current || key.length < 2) return null
      const tail = previous.slice(1 - key.length)
      const boundary = tail.length
      const joined = tail + current.slice(0, key.length - 1)
      for (let start = joined.indexOf(key); start >= 0 && start < boundary; start = joined.indexOf(key, start + 1)) {
        const split = boundary - start
        if (split < key.length) return [{ page: page - 1, key: key.slice(0, split), edge: 'end' }, { page, key: key.slice(split), edge: 'start' }]
      }
      return null
    }

    function PdfPage(props) {
      const wrapRef = useRef(null)
      const canvasRef = useRef(null)
      const layerRef = useRef(null)
      const canvasRequestRef = useRef(0)
      const [visible, setVisible] = useState(false)
      const [nearby, setNearby] = useState(false)

      useEffect(() => {
        const element = wrapRef.current
        if (!element || typeof IntersectionObserver === 'undefined') { setVisible(true); setNearby(true); return undefined }
        const observer = new IntersectionObserver((entries) => {
          const near = entries.some((entry) => entry.isIntersecting)
          setNearby(near)
          if (near) setVisible(true)
        }, { rootMargin: '800px 0px' })
        observer.observe(element)
        return () => observer.disconnect()
      }, [])

      // Canvas and text have separate lifecycles. A visual mode change must not
      // recreate text spans, ranges, annotation anchors or PDF page elements.
      useEffect(() => {
        if (!visible || !nearby) return undefined
        let cancelled = false, renderTask = null, staging = null
        const request = ++canvasRequestRef.current
        const alive = () => !cancelled && request === canvasRequestRef.current
        pdfAppearanceQueue.run(async () => {
          try {
            const page = await props.doc.getPage(props.num)
            if (!alive()) return
            const viewport = page.getViewport({ scale: props.scale }), canvas = canvasRef.current
            if (!canvas) return
            const dpr = Math.min(window.devicePixelRatio || 1, 2), appearance = pdfAppearance.mode(props.appearanceMode)
            const metadata = { documentId: props.documentId, page: props.num, scale: props.scale, rotation: viewport.rotation,
              width: Math.ceil(viewport.width * dpr), height: Math.ceil(viewport.height * dpr) }
            let record = pdfAppearanceCache.get(metadata)
            if (!record) {
              staging = document.createElement('canvas')
              staging.width = metadata.width; staging.height = metadata.height
              const context = staging.getContext('2d', { willReadFrequently: true })
              renderTask = page.render({ canvasContext: context, viewport,
                transform: [metadata.width / viewport.width, 0, 0, metadata.height / viewport.height, 0, 0] })
              await renderTask.promise
              if (!alive()) return
              const frame = context.getImageData(0, 0, metadata.width, metadata.height)
              record = { frame, analysis: pdfAppearance.analyze(frame) }
              pdfAppearanceCache.put(metadata, frame, { analysis: record.analysis })
            }
            let protectedImages = { regions: [], complete: true }
            if (appearance === 'dark' && !['dark', 'ambiguous', 'unavailable'].includes(record.analysis.kind)) {
              try {
                let promise = pdfImageOperatorCache.get(page)
                if (!promise) { promise = page.getOperatorList(); pdfImageOperatorCache.set(page, promise) }
                protectedImages = pdfAppearance.imageRegions(await promise, viewport, window.pdfjsLib.OPS)
              } catch {
                protectedImages = { regions: [], complete: false }
              }
            }
            if (!alive()) return
            const result = await pdfAppearance.remapAsync(record.frame, appearance, { analysis: record.analysis, isCurrent: alive,
              imageRegions: pdfAppearance.pixelRegions(protectedImages.regions, viewport, metadata.width, metadata.height), regionsComplete: protectedImages.complete })
            if (!alive()) return
            canvas.width = metadata.width; canvas.height = metadata.height
            pdfAppearance.paint(canvas.getContext('2d'), result.frame)
            pdfInkCache.delete(canvas)
            pdfCanvasMeta.set(canvas, metadata)
            canvas.dataset.pdfAppearance = appearance
            canvas.dataset.pdfAppearanceApplied = String(result.applied)
            canvas.dataset.pdfBackground = result.analysis.kind
            canvas.dataset.pdfSurface = pdfAppearance.surface(result.analysis, appearance, result.applied)
            canvas.dataset.pdfAppearanceReason = result.reason || ''
            if (wrapRef.current) {
              wrapRef.current.dataset.pdfSurface = canvas.dataset.pdfSurface
              wrapRef.current.dispatchEvent(new Event('lr-canvasrendered', { bubbles: true }))
            }
          } catch {
            /* A broken visual page must not remove the source text layer. */
          } finally {
            if (staging) { staging.width = 0; staging.height = 0; staging = null }
          }
        }, alive).catch(() => { /* A cancelled/destroyed document cannot paint. */ })
        return () => { cancelled = true; if (renderTask) renderTask.cancel() }
      }, [visible, nearby, props.doc, props.num, props.scale, props.documentId, props.appearanceMode])

      useEffect(() => {
        if (!visible) return undefined
        let cancelled = false, textTask = null
        ;(async () => {
          try {
            const page = await props.doc.getPage(props.num), content = await page.getTextContent()
            if (cancelled) return
            const viewport = page.getViewport({ scale: props.scale }), layer = layerRef.current
            if (!layer || !window.pdfjsLib) return
            layer.innerHTML = ''
            layer.style.width = viewport.width + 'px'; layer.style.height = viewport.height + 'px'
            layer.style.setProperty('--scale-factor', String(viewport.scale))
            const textDivs = []
            textTask = window.pdfjsLib.renderTextLayer({ textContentSource: content, container: layer, viewport, textDivs })
            await textTask.promise
            if (cancelled) return
            registerTextGeometry(textDivs, content, viewport, wrapRef.current)
            layer.dispatchEvent(new Event('lr-textlayerrendered', { bubbles: true }))
          } catch {
            /* Broken source text must not blank a rendered page. */
          }
        })()
        return () => { cancelled = true; if (textTask) textTask.cancel() }
      }, [visible, props.doc, props.num, props.scale])

      return h('div', { className: 'lr-page', ref: wrapRef, 'data-page': props.num,
        style: { width: props.width + 'px', height: props.height + 'px', '--scale-factor': String(props.scale) } },
        h('canvas', { ref: canvasRef, className: 'lr-page-canvas' }),
        h('div', { className: 'lr-selhl-layer', 'aria-hidden': true }),
        h('div', { className: 'lr-coordinate-layer', 'aria-hidden': true }),
        h('div', { className: 'lr-annotation-layer', 'aria-hidden': true }),
        h('div', { className: 'lr-evidence-layer', 'aria-hidden': true }),
        h('div', { ref: layerRef, className: 'lr-textlayer' }))
    }


    function PdfViewer(props) {
      const hostRef = useRef(null)
      const overlayRef = useRef(null)
      const tagLayerRef = useRef(null)
      const latestPropsRef = useRef(props)
      latestPropsRef.current = props
      const [sizes, setSizes] = useState([])
      const draggingRef = useRef(false)
      const pointerRef = useRef(null)
      const locateVersionRef = useRef(0)
      const evidenceRef = useRef(null)
      const lastRangeRef = useRef(null)
      const coordinateAnchorRef = useRef(null)

      useEffect(() => {
        let cancelled = false
        setSizes([])
        ;(async () => {
          const list = []
          for (let index = 1; index <= props.doc.numPages; index += 1) {
            if (cancelled) return
            const page = await props.doc.getPage(index)
            const viewport = page.getViewport({ scale: 1 })
            list.push({ num: index, width: viewport.width, height: viewport.height })
          }
          if (!cancelled) setSizes(list)
        })().catch(() => { if (!cancelled) setSizes([]) })
        return () => {
          cancelled = true
        }
      }, [props.doc])

      useEffect(() => {
        const host = hostRef.current
        if (!host) return undefined
        let frame = null
        function redraw() {
          frame = null
          if (draggingRef.current) snapBlankEndpoint()
          const range = currentTextRange()
          if (range) drawSelection(range)
          else clearSelectionHighlight()
          drawCardLabels()
          repaintEvidence()
          paintCoordinates()
        }
        function scheduleRedraw() {
          if (frame == null) frame = window.requestAnimationFrame(redraw)
        }
        document.addEventListener('selectionchange', scheduleRedraw)
        function onTextRendered() { scheduleRedraw(); drawSavedHighlights() }
        host.addEventListener('lr-textlayerrendered', onTextRendered)
        host.addEventListener('lr-canvasrendered', onTextRendered)
        return () => {
          document.removeEventListener('selectionchange', scheduleRedraw)
          host.removeEventListener('lr-textlayerrendered', onTextRendered)
          host.removeEventListener('lr-canvasrendered', onTextRendered)
          if (frame != null) window.cancelAnimationFrame(frame)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      useEffect(() => { paintCoordinates() }, [props.doc, props.scale, sizes])

      function layerTextIndex(layer) {
        const nodes = []
        const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const node = walker.currentNode
          if (node.nodeValue) nodes.push(node)
        }
        const starts = []
        let raw = ''
        for (const node of nodes) {
          starts.push(raw.length)
          raw += node.nodeValue
        }
        return { nodes, starts, raw }
      }

      function rangeForQuote(index, needleKey, edge) {
        if (!index.nodes.length || !needleKey) return null
        const norm = matchKey(index.raw)
        const position = edge === 'start' ? 0 : edge === 'end' ? norm.key.length - needleKey.length : norm.key.indexOf(needleKey)
        if (position < 0 || !norm.key.startsWith(needleKey, position)) return null
        const startRaw = norm.map[position]
        const endRaw = norm.map[Math.min(position + needleKey.length - 1, norm.map.length - 1)] + 1
        try { return rangeFromOffsets(index, { start: startRaw, end: endRaw, quote: index.raw.slice(startRaw, endRaw) }) }
        catch { return null }
      }

      function clearCoordinateLayers() {
        const host = hostRef.current
        if (host) host.querySelectorAll('.lr-coordinate-layer').forEach((layer) => { layer.textContent = '' })
      }

      function clearCoordinates() {
        coordinateAnchorRef.current = null
        clearCoordinateLayers()
      }

      // Scroll only the PDF reading viewport. scrollIntoView can also move a
      // clipped PDF page or the outer document and does not prove visibility.
      function scrollPdfTarget(target, fraction) {
        const host = hostRef.current, container = host && host.closest('.lr-source-body')
        if (!container || !container.isConnected || !target || !target.getBoundingClientRect) return false
        const box = container.getBoundingClientRect(), rect = target.getBoundingClientRect()
        if (!(box.height > 0 && container.clientHeight > 0 && rect.height > 0) || !Number.isFinite(rect.top) || !Number.isFinite(rect.bottom)) return false
        const ratio = box.height / container.clientHeight
        const room = rect.height <= box.height ? Math.max(0, 1 - rect.height / box.height) : .8
        const offset = Math.max(0, Math.min(room, .8, Number.isFinite(fraction) ? fraction : .26))
        const desired = container.scrollTop + (rect.top - box.top) / ratio - container.clientHeight * offset
        container.scrollTop = Math.max(0, Math.min(Math.max(0, container.scrollHeight - container.clientHeight), desired))
        const after = target.getBoundingClientRect(), viewport = container.getBoundingClientRect()
        return after.height <= viewport.height
          ? after.top >= viewport.top - 1 && after.bottom <= viewport.bottom + 1
          : after.bottom > viewport.top + 1 && after.top < viewport.bottom - 1
      }

      function locatePage(page) {
        const target = Number.isInteger(page) && page >= 0 && hostRef.current?.querySelector('.lr-page[data-page="' + (page + 1) + '"]')
        if (!target) return false
        clearCoordinates()
        evidenceRef.current = null
        clearEvidence()
        clearSelectionHighlight()
        return scrollPdfTarget(target, .08)
      }

      function paintCoordinates() {
        const record = coordinateAnchorRef.current
        const host = hostRef.current
        if (!record || !host || !host.isConnected || record.doc !== latestPropsRef.current.doc || record.version !== locateVersionRef.current || (record.isCurrent && !record.isCurrent())) return false
        const blocks = []
        for (const segment of record.anchor.segments) {
          const page = record.pages.get(segment.page)
          const element = host.querySelector('.lr-page[data-page="' + (segment.page + 1) + '"]')
          const layer = element && element.querySelector('.lr-coordinate-layer')
          if (!page || !layer) return false
          const viewport = page.getViewport({ scale: latestPropsRef.current.scale })
          if (Math.abs(parseFloat(element.style.width) - viewport.width) > 1 || Math.abs(parseFloat(element.style.height) - viewport.height) > 1) return false
          const transformed = viewport.convertToViewportRectangle(segment.pdfBBox)
          const left = Math.min(transformed[0], transformed[2]), top = Math.min(transformed[1], transformed[3])
          const width = Math.abs(transformed[2] - transformed[0]), height = Math.abs(transformed[3] - transformed[1])
          if (!(width > 0 && height > 0) || left < -2 || top < -2 || left + width > viewport.width + 2 || top + height > viewport.height + 2) return false
          const focus = document.createElement('div')
          focus.className = 'lr-coordinate-focus'
          Object.assign(focus.style, { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px' })
          blocks.push({ layer, focus })
        }
        clearCoordinateLayers()
        blocks.forEach(({ layer, focus }) => layer.appendChild(focus))
        if (record.pendingScroll && blocks.length) {
          if (!scrollPdfTarget(blocks[0].focus, .26)) return false
          record.pendingScroll = false
        }
        return true
      }

      async function locateAnchor(anchor, isCurrent) {
        if (!anchor || anchor.status !== 'located' || anchor.quoteVerified !== true) return false
        const doc = latestPropsRef.current.doc
        const host = hostRef.current
        if (!host) return false
        const version = ++locateVersionRef.current
        const alive = () => version === locateVersionRef.current && doc === latestPropsRef.current.doc && host.isConnected && (!isCurrent || isCurrent())
        const segments = anchor.segments || []
        if (!segments.length || segments.some((part) => !Number.isInteger(part.page) || part.page < 0 || part.page >= doc.numPages || !Array.isArray(part.pdfBBox) || part.pdfBBox.length !== 4 || part.pdfBBox.some((value) => !Number.isFinite(value)))) return false
        clearCoordinates(); clearEvidence(); clearSelectionHighlight()
        evidenceRef.current = null
        const numbers = [...new Set(segments.map((segment) => segment.page))]
        const loaded = await Promise.all(numbers.map((number) => doc.getPage(number + 1).catch(() => null)))
        if (!alive() || loaded.some((page) => !page)) return false
        const record = { anchor, doc, version, isCurrent, pages: new Map(numbers.map((number, index) => [number, loaded[index]])), pendingScroll: true }
        coordinateAnchorRef.current = record
        for (let attempt = 0; attempt < 80; attempt += 1) {
          if (!alive() || coordinateAnchorRef.current !== record) return false
          if (paintCoordinates()) return alive()
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
        if (coordinateAnchorRef.current === record) clearCoordinates()
        return false
      }

      async function locateSelection(anchors, isCurrent, options) {
        const host = hostRef.current
        if (!host || !Array.isArray(anchors) || !anchors.length) return false
        const anchor = anchors[0]
        if (!Number.isInteger(anchor.page) || anchor.page < 1 || anchor.page > latestPropsRef.current.doc.numPages) return false
        const version = ++locateVersionRef.current
        const alive = () => version === locateVersionRef.current && host.isConnected && (!isCurrent || isCurrent())
        clearCoordinates()
        let scrolledPage = null
        for (let attempt = 0; attempt < 80; attempt += 1) {
          if (!alive()) return false
          const page = host.querySelector('.lr-page[data-page="' + anchor.page + '"]')
          if (!(options && options.scroll === false) && page && page !== scrolledPage) {
            if (scrollPdfTarget(page, 0)) scrolledPage = page
          }
          const layer = page && page.querySelector('.lr-textlayer')
          if (layer && layer.childElementCount) {
            const range = rangeFromOffsets(layerTextIndex(layer), anchor)
            if (range && options && options.scroll === false) clearSelectionHighlight()
            return range ? Boolean(showRange(range, { color: '#f2cf4a' }, !(options && options.scroll === false))) : false
          }
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
        return false
      }

      function captureSelection() {
        const range = lastRangeRef.current
        const host = hostRef.current
        if (!range || !host || !range.startContainer.isConnected) return null
        const anchors = []
        for (const layer of host.querySelectorAll('.lr-textlayer')) {
          if (!range.intersectsNode(layer)) continue
          const index = layerTextIndex(layer)
          let start = Infinity
          let end = -1
          index.nodes.forEach((node, i) => {
            if (!range.intersectsNode(node)) return
            const from = node === range.startContainer ? range.startOffset : 0
            const to = node === range.endContainer ? range.endOffset : node.length
            if (to <= from) return
            start = Math.min(start, index.starts[i] + from)
            end = Math.max(end, index.starts[i] + to)
          })
          if (end > start) anchors.push({ page: Number(layer.closest('.lr-page').dataset.page), start, end, quote: index.raw.slice(start, end) })
        }
        return anchors.length ? anchors : null
      }

      function captureContext(anchors) {
        const host = hostRef.current
        if (!host || !anchors || !anchors.length) return null
        const first = anchors[0], last = anchors[anchors.length - 1]
        const raw = (anchor) => { const layer = host.querySelector('.lr-page[data-page="' + anchor.page + '"] .lr-textlayer'); return layer ? layerTextIndex(layer).raw : '' }
        return { before: raw(first).slice(Math.max(0, first.start - 160), first.start), after: raw(last).slice(last.end, last.end + 160), page: first.page }
      }

      function rangeFromOffsets(index, anchor) {
        if (anchor.start < 0 || anchor.end > index.raw.length || anchor.end <= anchor.start || index.raw.slice(anchor.start, anchor.end) !== anchor.quote) return null
        const point = (offset) => {
          for (let i = index.nodes.length - 1; i >= 0; i -= 1) {
            if (offset >= index.starts[i]) return { node: index.nodes[i], offset: Math.min(offset - index.starts[i], index.nodes[i].length) }
          }
          return null
        }
        const a = point(anchor.start), b = point(anchor.end)
        if (!a || !b) return null
        const range = document.createRange()
        range.setStart(a.node, a.offset); range.setEnd(b.node, b.offset)
        return range
      }

      function drawSavedHighlights() {
        const host = hostRef.current
        if (!host) return
        const annotations = latestPropsRef.current.annotations || []
        for (const textLayer of host.querySelectorAll('.lr-textlayer')) {
          const page = textLayer.closest('.lr-page')
          const layer = page.querySelector('.lr-annotation-layer')
          if (!layer) continue
          layer.textContent = ''
          const items = annotations.flatMap((item) => (item.anchors || []).filter((anchor) => anchor.page === Number(page.dataset.page)).map((anchor) => ({ item, anchor })))
          if (!items.length) continue
          const index = layerTextIndex(textLayer)
          const box = page.getBoundingClientRect()
          const sx = box.width / parseFloat(page.style.width) || 1, sy = box.height / parseFloat(page.style.height) || 1
          const canvas = page.querySelector('canvas'), pixels = pageInk(canvas), canvasBox = canvas.getBoundingClientRect()
          for (const { item, anchor } of items) {
            const range = rangeFromOffsets(index, anchor)
            if (!range) continue
            for (const candidate of mergeLineRects(selectionRects(range, textLayer))) {
              const ink = trimToInk(candidate, canvasBox, pixels)
              if (!ink) continue
              const block = document.createElement('div')
              const shape = pdfAppearance.annotationPaint({ left: (ink.left - box.left) / sx, top: (ink.top - box.top) / sy, right: (ink.right - box.left) / sx, bottom: (ink.bottom - box.top) / sy }, item.style, item.color)
              block.className = 'lr-annotation' + (shape.style === 'underline' ? ' is-underline' : '')
              block.dataset.annotationStyle = shape.style
              block.dataset.annotation = item.id
              Object.assign(block.style, { left: shape.left + 'px', top: shape.top + 'px', width: shape.width + 'px', height: shape.height + 'px', background: rgba(shape.color, shape.alpha) })
              layer.appendChild(block)
            }
          }
        }
      }

      useEffect(() => { drawSavedHighlights() }, [props.annotations, props.doc, props.scale, props.appearanceMode])

      function clearEvidence() {
        const host = hostRef.current
        if (!host) return
        for (const layer of host.querySelectorAll('.lr-evidence-layer')) layer.textContent = ''
      }

      function showRange(range, options, scroll) {
        const ranges = Array.isArray(range) ? range : [range]
        const first = ranges[0], last = ranges.at(-1)
        clearCoordinates()
        const host = hostRef.current
        if (!host || !first) return null
        if (scroll && !scrollPdfTarget(first, .26)) return null
        const pages = ranges.map(part => {
          const textLayer = part.startContainer.parentElement.closest('.lr-textlayer')
          const page = textLayer && textLayer.closest('.lr-page')
          const layer = page?.querySelector('.lr-evidence-layer')
          const canvas = page?.querySelector('canvas')
          const rects = textLayer && selectionRects(part, textLayer)
          return layer && canvas && rects?.length ? { page, layer, canvas, rects } : null
        })
        if (pages.some(page => !page)) return null
        clearEvidence()
        for (const { page, layer, canvas, rects } of pages) {
          const pageRect = page.getBoundingClientRect()
          const sx = pageRect.width / parseFloat(page.style.width) || 1
          const sy = pageRect.height / parseFloat(page.style.height) || 1
          const pixels = canvas.dataset.pdfAppearance && canvas.style.width === page.style.width && canvas.style.height === page.style.height ? pageInk(canvas) : null
          const canvasBox = canvas.getBoundingClientRect()
          const merged = mergeLineRects(rects)
          const clipped = merged.map(candidate => trimToInk(candidate, canvasBox, pixels)).filter(Boolean)
          for (const box of clipped.length ? clipped : merged) {
            const block = document.createElement('div')
            block.className = 'lr-evidence'
            Object.assign(block.style, {
              left: (box.left - pageRect.left) / sx + 'px', top: (box.top - pageRect.top) / sy + 'px',
              width: (box.right - box.left) / sx + 'px', height: (box.bottom - box.top) / sy + 'px',
              background: rgba(options.color || '#e2b151', 0.3),
            })
            layer.appendChild(block)
          }
        }
        lastRangeRef.current = first.cloneRange()
        if (last !== first) lastRangeRef.current.setEnd(last.endContainer, last.endOffset)
        return { rect: popupRangeRect(first, first.getBoundingClientRect()), source: ranges.map(part => part.toString()).join(' '), page: Number(pages[0].page.dataset.page) }
      }

      function popupRangeRect(range, rect) {
        const element = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement
        const span = element && element.closest('.lr-textlayer > span')
        const textLayer = span && span.closest('.lr-textlayer')
        let left = rect.left, right = rect.right
        if (span && textLayer) {
          const base = span.getBoundingClientRect()
          left = base.left; right = base.right
          const gap = Math.max(4, base.height * .8)
          const line = Array.from(textLayer.querySelectorAll('span')).filter((item) => item.textContent.trim()).map((item) => item.getBoundingClientRect()).filter((box) => box.width > 0 && Math.abs((box.top + box.bottom - base.top - base.bottom) / 2) < Math.max(2, base.height * .45))
          for (let attempt = 0; attempt < line.length; attempt += 1) {
            const connected = line.filter((box) => box.left <= right + gap && box.right >= left - gap)
            const nextLeft = Math.min(left, ...connected.map((box) => box.left))
            const nextRight = Math.max(right, ...connected.map((box) => box.right))
            if (nextLeft === left && nextRight === right) break
            left = nextLeft; right = nextRight
          }
          const page = span.closest('.lr-page')
          if (page) {
            const bounds = page.getBoundingClientRect()
            const middle = (bounds.left + bounds.right) / 2
            const side = right <= middle + bounds.width * .06 ? 'left' : left >= middle - bounds.width * .06 ? 'right' : null
            if (side) {
              const nearby = Array.from(textLayer.querySelectorAll('span')).filter((item) => item.textContent.trim()).map((item) => item.getBoundingClientRect()).filter((box) => box.width > 20 && box.height >= base.height * .55 && box.height <= base.height * 1.7 && Math.abs(box.top - base.top) <= Math.max(90, base.height * 9) && (side === 'left' ? box.right <= middle + bounds.width * .06 : box.left >= middle - bounds.width * .06))
              if (nearby.length) { left = Math.min(left, ...nearby.map((box) => box.left)); right = Math.max(right, ...nearby.map((box) => box.right)) }
            }
          }
        }
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, textEdges: { left, right } }
      }

      function repaintEvidence() {
        const evidence = evidenceRef.current
        if (!evidence) return
        const ranges = findEvidenceRanges(evidence.parts)
        if (!ranges) return
        const scale = latestPropsRef.current.scale
        const hit = showRange(ranges, evidence, evidence.scale !== scale)
        if (!hit) return
        evidence.scale = scale
        latestPropsRef.current.onEvidenceLayout?.(hit.rect)
      }

      function findEvidenceRanges(parts) {
        const host = hostRef.current
        if (!host) return null
        const ranges = []
        for (const part of parts) {
          const layer = host.querySelector('.lr-page[data-page="' + part.page + '"] .lr-textlayer')
          const range = layer && rangeForQuote(layerTextIndex(layer), part.key, part.edge)
          if (!range) return null
          ranges.push(range)
        }
        return ranges
      }

      async function locate(text, options = {}) {
        const needleKey = matchKeyText(text)
        const host = hostRef.current
        const doc = latestPropsRef.current.doc
        const version = ++locateVersionRef.current
        const alive = () => locateVersionRef.current === version && doc === latestPropsRef.current.doc && host.isConnected && (!options.isCurrent || options.isCurrent())
        if (!needleKey || !host || !doc || !alive()) return false
        clearCoordinates()
        clearEvidence()
        evidenceRef.current = null
        lastRangeRef.current = null

        async function pageKey(num) {
          try {
            const page = await doc.getPage(num)
            const content = await page.getTextContent()
            return matchKeyText(content.items.map(item => item.str || '').join(' '))
          } catch { return '' }
        }
        function paint(parts) {
          if (!alive()) return false
          const ranges = findEvidenceRanges(parts)
          const hit = ranges && showRange(ranges, options, true)
          if (hit) evidenceRef.current = { parts, color: options.color, scale: latestPropsRef.current.scale }
          return hit || false
        }
        async function reveal(parts) {
          const hit = paint(parts)
          if (hit) return hit
          const first = parts[0]
          let scrolledPage = null
          for (let attempt = 0; attempt < 80; attempt += 1) {
            if (!alive()) return false
            const pageElement = host.querySelector('.lr-page[data-page="' + first.page + '"]')
            if (pageElement && pageElement !== scrolledPage) {
              const target = first.edge === 'end' ? { getBoundingClientRect() {
                const { bottom } = pageElement.getBoundingClientRect()
                return { top: bottom - 1, bottom, height: 1 }
              } } : pageElement
              if (scrollPdfTarget(target, first.edge === 'end' ? .55 : 0)) scrolledPage = pageElement
            }
            const found = paint(parts)
            if (found) return found
            await new Promise((resolve) => setTimeout(resolve, 30))
          }
          return false
        }
        const hint = Number(options.page)
        const preferred = Number.isInteger(hint) && hint >= 1 && hint <= doc.numPages ? hint : null
        const samePage = page => [{ page, key: needleKey }]
        let preferredKey = ''
        if (preferred) {
          const hit = paint(samePage(preferred))
          if (hit) return hit
          preferredKey = await pageKey(preferred)
          if (preferredKey.includes(needleKey)) {
            const found = await reveal(samePage(preferred))
            if (found) return found
          }
          if (options.requirePage) return false
        }
        for (const layer of host.querySelectorAll('.lr-textlayer')) {
          const num = Number(layer.closest('.lr-page')?.dataset.page)
          if (!alive()) return false
          if (!num || num === preferred) continue
          const hit = paint(samePage(num))
          if (hit) return hit
        }
        let previous = ''
        for (let num = 1; num <= doc.numPages; num += 1) {
          if (!alive()) return false
          const key = num === preferred ? preferredKey : await pageKey(num)
          if (!alive()) return false
          if (num !== preferred && key.includes(needleKey)) {
            const hit = await reveal(samePage(num))
            if (hit) return hit
          }
          const adjacent = adjacentPdfQuoteParts(previous, key, needleKey, num)
          if (adjacent) {
            const hit = await reveal(adjacent)
            if (hit) return hit
          }
          previous = key
        }
        return false
      }

      function rgba(hex, alpha) {
        const value = String(hex || '#888888').replace('#', '')
        const r = parseInt(value.slice(0, 2), 16)
        const g = parseInt(value.slice(2, 4), 16)
        const b = parseInt(value.slice(4, 6), 16)
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
      }

      function selectionRects(range, scope) {
        const out = []
        if (!scope || !range.intersectsNode(scope)) return out
        const page = scope.closest('.lr-page')
        const pageBox = page.getBoundingClientRect()
        const pageScale = pageBox.width / parseFloat(page.style.width) || 1
        const pageScaleY = pageBox.height / parseFloat(page.style.height) || 1
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const node = walker.currentNode
          const value = node.nodeValue
          if (!value || !range.intersectsNode(node)) continue
          const from = node === range.startContainer ? range.startOffset : 0
          const to = node === range.endContainer ? range.endOffset : value.length
          if (from >= to) continue
          // Measure text runs, never the span's whitespace or an enclosing block.
          // Keeping distant runs separate also preserves a two-column gutter.
          const runs = value.slice(from, to).matchAll(/\S+/gu)
          const bounds = node.parentElement.getBoundingClientRect()
          const geometry = pdfTextGeometry.get(node.parentElement)
          for (const run of runs) {
            const sub = document.createRange()
            sub.setStart(node, from + run.index)
            sub.setEnd(node, from + run.index + run[0].length)
            for (const rect of sub.getClientRects()) {
              const box = {
                left: Math.max(rect.left, bounds.left),
                top: Math.max(rect.top, bounds.top),
                right: Math.min(rect.right, bounds.right),
                bottom: Math.min(rect.bottom, bounds.bottom),
                node,
                from: from + run.index,
                to: from + run.index + run[0].length,
                lineId: geometry && geometry.lineId,
                vertical: Boolean(geometry && Math.abs(Math.sin(geometry.angle)) > 0.7),
              }
              if (geometry && Number.isFinite(geometry.start)) {
                const size = geometry.vertical ? bounds.height : bounds.width
                if (size > 0) {
                  const origin = geometry.vertical ? bounds.top : bounds.left
                  const start = Math.max(0, Math.min(1, ((geometry.vertical ? box.top : box.left) - origin) / size))
                  const end = Math.max(0, Math.min(1, ((geometry.vertical ? box.bottom : box.right) - origin) / size))
                  if (geometry.vertical) {
                    box.top = pageBox.top + (geometry.start + start * geometry.length) * pageScaleY
                    box.bottom = pageBox.top + (geometry.start + end * geometry.length) * pageScaleY
                  } else {
                    box.left = pageBox.left + (geometry.start + start * geometry.length) * pageScale
                    box.right = pageBox.left + (geometry.start + end * geometry.length) * pageScale
                  }
                }
              }
              box.width = box.right - box.left
              box.height = box.bottom - box.top
              if (box.right - box.left > 0.1 && box.bottom - box.top > 1) out.push(box)
            }
          }
        }
        return out
      }

      function drawSelection(range) {
        const host = hostRef.current
        if (!host) return
        clearSelectionHighlight()
        for (const textLayer of host.querySelectorAll('.lr-textlayer')) {
          const page = textLayer.closest('.lr-page')
          const layer = page && page.querySelector('.lr-selhl-layer')
          if (!layer) continue
          const rects = selectionRects(range, textLayer)
          if (!rects.length) continue
          const pageRect = page.getBoundingClientRect()
          const screenScaleX = pageRect.width / parseFloat(page.style.width) || 1
          const screenScaleY = pageRect.height / parseFloat(page.style.height) || 1
          const canvas = page.querySelector('canvas')
          const pixels = pageInk(canvas)
          const canvasBox = canvas.getBoundingClientRect()
          const fragment = document.createDocumentFragment()
          for (const candidate of mergeLineRects(rects)) {
            const box = trimToInk(candidate, canvasBox, pixels)
            if (!box) continue
            const block = document.createElement('div')
            block.className = 'lr-selhl'
            block.style.left = (box.left - pageRect.left) / screenScaleX + 'px'
            block.style.top = (box.top - pageRect.top) / screenScaleY + 'px'
            block.style.width = (box.right - box.left) / screenScaleX + 'px'
            block.style.height = (box.bottom - box.top) / screenScaleY + 'px'
            fragment.appendChild(block)
          }
          layer.appendChild(fragment)
        }
      }

      function clearSelectionHighlight() {
        const host = hostRef.current
        if (!host) return
        for (const layer of host.querySelectorAll('.lr-selhl-layer')) {
          if (layer.childElementCount) layer.textContent = ''
        }
      }

      function currentTextRange() {
        const selection = window.getSelection()
        const host = hostRef.current
        if (!host || !selection || !selection.rangeCount || selection.isCollapsed) return null
        const range = selection.getRangeAt(0)
        // Ignore selections made in the notes, menus or another reader.
        for (const node of [range.startContainer, range.endContainer]) {
          const element = node.nodeType === 1 ? node : node.parentElement
          if (element && host.contains(element) && element.closest('.lr-textlayer')) return range
        }
        return null
      }

      function snapBlankEndpoint() {
        const pointer = pointerRef.current
        const host = hostRef.current
        const selection = window.getSelection()
        if (!pointer || pointer.overText || !host || !selection || selection.isCollapsed || !currentTextRange()) return
        // Absolutely positioned text can make the browser jump down the DOM
        // when the pointer enters a gutter. Find the nearby visual line instead
        // of snapping back to the last mousemove that happened to hit a span.
        let nearest = null
        let bestScore = Infinity
        for (const span of host.querySelectorAll('.lr-textlayer span')) {
          if (!span.textContent.trim() || span.classList.contains('markedContent')) continue
          const box = span.getBoundingClientRect()
          if (box.width < 0.1 || box.height < 1) continue
          const geometry = pdfTextGeometry.get(span)
          const angle = geometry ? geometry.angle : 0
          const vertical = Math.abs(Math.sin(angle)) > 0.7
          const dy = Math.max(box.top - pointer.y, 0, pointer.y - box.bottom)
          const dx = Math.max(box.left - pointer.x, 0, pointer.x - box.right)
          if ((vertical ? dx : dy) > Math.max(4, (vertical ? box.width : box.height) * 0.6)) continue
          const score = vertical ? dx * 1000 + dy : dy * 1000 + dx
          if (score < bestScore) {
            nearest = { span, box, angle, vertical }
            bestScore = score
          }
        }
        if (!nearest) return
        const nodes = []
        const walker = document.createTreeWalker(nearest.span, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) nodes.push(walker.currentNode)
        if (!nodes.length) return
        let node = null
        let offset = 0
        const axis = nearest.vertical ? pointer.y : pointer.x
        const start = nearest.vertical ? nearest.box.top : nearest.box.left
        const end = nearest.vertical ? nearest.box.bottom : nearest.box.right
        if (axis <= start || axis >= end) {
          const forward = (nearest.vertical ? Math.sin(nearest.angle) : Math.cos(nearest.angle)) >= 0
          const atEnd = ((axis >= end) === forward) !== (nearest.span.dir === 'rtl')
          node = atEnd ? nodes[nodes.length - 1] : nodes[0]
          offset = atEnd ? node.length : 0
        } else {
          const x = nearest.vertical ? (nearest.box.left + nearest.box.right) / 2 : pointer.x
          const y = nearest.vertical ? pointer.y : (nearest.box.top + nearest.box.bottom) / 2
          const caret = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null
          if (caret && nodes.includes(caret.startContainer)) {
            node = caret.startContainer
            offset = caret.startOffset
          } else if (document.caretPositionFromPoint) {
            const position = document.caretPositionFromPoint(x, y)
            if (position && nodes.includes(position.offsetNode)) {
              node = position.offsetNode
              offset = position.offset
            }
          }
        }
        if (!node || (selection.focusNode === node && selection.focusOffset === offset)) return
        selection.setBaseAndExtent(selection.anchorNode, selection.anchorOffset, node, offset)
      }

      function rectsFromRange(range) {
        const out = []
        let scope = null
        try {
          const node = range.commonAncestorContainer
          const element = node && node.nodeType === 1 ? node : node && node.parentElement
          scope = element && element.closest ? element.closest('.lr-textlayer') : null
        } catch {
          scope = null
        }
        if (!scope) return out
        return selectionRects(range, scope)
      }

      function mergeLineRects(rects) {
        const merged = []
        const sorted = rects.slice().sort((a, b) => {
          if (a.vertical !== b.vertical) return Number(a.vertical) - Number(b.vertical)
          return a.vertical ? a.left - b.left || a.top - b.top : a.top - b.top || a.left - b.left
        })
        for (const rect of sorted) {
          let target = null
          for (const candidate of merged) {
            if (candidate.vertical !== rect.vertical) continue
            const vertical = rect.vertical
            const height = vertical
              ? Math.min(candidate.right - candidate.left, rect.right - rect.left)
              : Math.min(candidate.bottom - candidate.top, rect.bottom - rect.top)
            const overlap = vertical
              ? Math.min(candidate.right, rect.right) - Math.max(candidate.left, rect.left)
              : Math.min(candidate.bottom, rect.bottom) - Math.max(candidate.top, rect.top)
            if (overlap < height * 0.7) continue
            const gap = vertical ? rect.top - candidate.bottom : rect.left - candidate.right
            const sameLine = rect.lineId != null && candidate.lineId === rect.lineId
            let ordinarySpace = false
            if (candidate.lastNode === rect.node) {
              const value = rect.node.nodeValue
              const between = rect.from >= candidate.lastTo
                ? value.slice(candidate.lastTo, rect.from)
                : candidate.lastFrom >= rect.to ? value.slice(rect.to, candidate.lastFrom) : ''
              ordinarySpace = /^[ \u00a0\u2000-\u200a\u202f]?$/.test(between)
            }
            // A selected word space belongs to its text run. Wider structural
            // gaps and different PDF lines/columns remain separate.
            const maxGap = ordinarySpace ? Infinity : Math.max(0.5, height * (sameLine ? 0.95 : 0.35))
            const reaches = vertical ? rect.bottom >= candidate.top : rect.right >= candidate.left
            if (gap <= maxGap && reaches) {
              target = candidate
              break
            }
          }
          if (target) {
            target.left = Math.min(target.left, rect.left)
            target.right = Math.max(target.right, rect.right)
            target.top = Math.min(target.top, rect.top)
            target.bottom = Math.max(target.bottom, rect.bottom)
            target.lastNode = rect.node
            target.lastFrom = rect.from
            target.lastTo = rect.to
            continue
          }
          merged.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, vertical: rect.vertical, lineId: rect.lineId, lastNode: rect.node, lastFrom: rect.from, lastTo: rect.to })
        }
        return merged
      }

      function drawCardLabels() {
        const layer = tagLayerRef.current
        const host = hostRef.current
        if (!layer || !host) return
        layer.textContent = ''
        const current = latestPropsRef.current
        if (!current.labelsVisible || !current.labels || !current.labels.length) return
        const hostRect = host.getBoundingClientRect()
        const textLayers = host.querySelectorAll('.lr-textlayer')
        const occupied = new Map()
        for (let index = 0; index < current.labels.length; index += 1) {
          const item = current.labels[index]
          const needleKey = matchKeyText(item.quote)
          if (!needleKey) continue
          let range = null
          for (const textLayer of textLayers) {
            range = rangeForQuote(layerTextIndex(textLayer), needleKey)
            if (range) break
          }
          if (!range) continue
          const rects = rectsFromRange(range)
          if (!rects.length) continue
          const first = rects[0]
          const pageEl =
            range.startContainer && range.startContainer.parentElement
              ? range.startContainer.parentElement.closest('.lr-page')
              : null
          const pageRect = pageEl ? pageEl.getBoundingClientRect() : null
          const pageKey = pageEl ? pageEl.getAttribute('data-page') : 'x'
          let barTop = Infinity
          let barBottom = -Infinity
          let barLeft = Infinity
          for (const rect of rects) {
            barTop = Math.min(barTop, rect.top)
            barBottom = Math.max(barBottom, rect.bottom)
            barLeft = Math.min(barLeft, rect.left)
          }
          const accent = document.createElement('div')
          accent.className = 'lr-accent'
          accent.style.left = (pageRect ? pageRect.left + 2 : barLeft - 8) - hostRect.left + 'px'
          accent.style.top = barTop - hostRect.top + 'px'
          accent.style.height = Math.max(10, barBottom - barTop) + 'px'
          accent.style.background = item.color
          accent.style.opacity = current.activeLabel === index ? '1' : '.3'
          layer.appendChild(accent)
          const rightSide = pageRect && first.left > pageRect.left + pageRect.width * .48
          const anchorX = pageRect ? (rightSide ? pageRect.right - 3 : pageRect.left + 3) : first.left - 8
          let anchorY = first.top + first.height / 2 - hostRect.top
          const used = occupied.get(pageKey) || []
          let guard = 0
          while (used.some((value) => Math.abs(value - anchorY) < 22) && guard < 6) {
            anchorY += 22
            guard += 1
          }
          used.push(anchorY)
          occupied.set(pageKey, used)

          const wrap = document.createElement('div')
          wrap.className = 'lr-tag-wrap' + (rightSide ? ' is-right' : '')
          wrap.style.left = anchorX - hostRect.left + 'px'
          wrap.style.top = anchorY + 'px'
          wrap.style.setProperty('--tag-tint', item.tint || 'rgba(215,235,251,.96)')
          wrap.style.setProperty('--tag-ink', item.ink || '#2b5f86')
          wrap.style.setProperty('--tag-line', item.line || '#8db8d6')

          const pill = document.createElement('button')
          pill.type = 'button'
          pill.className = 'lr-tag' + (current.activeLabel === index ? ' is-active' : '')
          pill.textContent = item.label || ''
          pill.setAttribute('aria-pressed', String(current.activeLabel === index))
          pill.title = (current.activeLabel === index ? '关闭高亮和翻译' : '高亮并翻译') + ' · ' + item.label
          pill.addEventListener('click', (event) => {
            event.stopPropagation()
            if (current.onLabelClick) current.onLabelClick(index, Number(pageKey))
          })
          wrap.appendChild(pill)
          layer.appendChild(wrap)
        }
      }

      useEffect(() => {
        drawCardLabels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [props.labels, props.labelsVisible, props.activeLabel, props.scale, props.doc])

      useEffect(() => {
        const host = hostRef.current
        if (!host) return undefined
        const container = host.closest('.lr-source-body')
        if (!container) return undefined
        let timer = null
        function onScroll() {
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            timer = null
            drawCardLabels()
          }, 320)
        }
        container.addEventListener('scroll', onScroll, { passive: true })
        return () => {
          container.removeEventListener('scroll', onScroll)
          if (timer) clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      useEffect(() => {
        if (!props.locatorRef) return
        const locator = { locate, locateAnchor, locatePage, locateSelection, captureSelection, captureContext, clearTransient: () => { clearCoordinates(); evidenceRef.current = null; clearEvidence(); clearSelectionHighlight(); const selection = window.getSelection(); if (selection) selection.removeAllRanges() }, clear: () => { clearCoordinates(); lastRangeRef.current = null; locateVersionRef.current += 1; evidenceRef.current = null; clearEvidence(); const layer = overlayRef.current; if (layer) layer.textContent = ''; clearSelectionHighlight(); const selection = window.getSelection(); if (selection) selection.removeAllRanges() } }
        props.locatorRef.current = locator
        return () => { if (props.locatorRef.current === locator) props.locatorRef.current = null }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [props.doc, props.scale])

      function handleMouseDown(event) {
        if (event.target.closest('.lr-tag')) return
        const before = currentTextRange()
        draggingRef.current = event.button === 0 ? {
          x: event.clientX, y: event.clientY,
          startedOnText: Boolean(event.target.closest('.lr-textlayer span')),
          range: before ? { startContainer: before.startContainer, startOffset: before.startOffset, endContainer: before.endContainer, endOffset: before.endOffset } : null,
        } : null
        rememberPointer(event)
        clearSelectionHighlight()
      }

      function rememberPointer(event) {
        const span = event.target.closest && event.target.closest('.lr-textlayer span')
        pointerRef.current = { x: event.clientX, y: event.clientY, overText: Boolean(span && span.textContent.trim()) }
      }

      function handleMouseUp(event) {
        const gesture = draggingRef.current
        if (!gesture) return
        draggingRef.current = null
        rememberPointer(event)
        const before = gesture.range, selected = currentTextRange()
        if (!selected) return
        const changed = !before || before.startContainer !== selected.startContainer || before.startOffset !== selected.startOffset || before.endContainer !== selected.endContainer || before.endOffset !== selected.endOffset
        const moved = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 3
        // A click outside the card can leave the browser's old PDF selection
        // intact. It is not a new selection and must not move or reopen it.
        if (!changed && !(moved && gesture.startedOnText)) return
        if (moved) snapBlankEndpoint()
        const selection = window.getSelection()
        const range = currentTextRange()
        if (!range) return
        clearCoordinates()
        clearEvidence()
        evidenceRef.current = null
        drawSelection(range)
        lastRangeRef.current = range.cloneRange()
        const value = selection.toString().replace(/\s+/g, ' ').trim()
        if (!value || (value.length < 2 && !/^\d$/.test(value))) return
        const fragments = Array.from(range.getClientRects()).filter((box) => box.width > 0 && box.height > 0 && box.height < 100)
        const rect = fragments[fragments.length - 1] || range.getBoundingClientRect()
        props.onSelect(value.slice(0, 3000), popupRangeRect(range, rect), { x: event.clientX, y: event.clientY })
      }

      function handleCitationClick(event) {
        if (!props.onReference || event.button !== 0 || (window.getSelection() && !window.getSelection().isCollapsed)) return
        const layer = event.target.closest && event.target.closest('.lr-textlayer')
        if (!layer) return
        const caret = document.caretPositionFromPoint ? document.caretPositionFromPoint(event.clientX, event.clientY) : null
        const range = !caret && document.caretRangeFromPoint ? document.caretRangeFromPoint(event.clientX, event.clientY) : null
        const node = caret ? caret.offsetNode : range && range.startContainer
        const offset = caret ? caret.offset : range && range.startOffset
        if (!node || !layer.contains(node)) return
        const index = layerTextIndex(layer)
        const at = index.nodes.indexOf(node)
        if (at < 0) return
        const position = index.starts[at] + offset
        const markers = /\[\s*\d{1,3}(?:\s*[,，;；–—-]\s*\d{1,3})*\s*\]|\([A-Z][^()\n]{1,100}?(?:19|20)\d{2}[a-z]?\)/g
        let match
        while ((match = markers.exec(index.raw))) {
          if (position < match.index || position > match.index + match[0].length) continue
          props.onReference({ quote: match[0], context: index.raw.slice(Math.max(0, match.index - 180), match.index + match[0].length + 180) })
          return
        }
      }

      return h(
        'div',
        { className: 'lr-pdf', ref: hostRef, 'data-pdf-appearance': pdfAppearance.mode(props.appearanceMode), onMouseDown: handleMouseDown, onMouseMove: rememberPointer, onMouseUp: handleMouseUp, onClick: handleCitationClick },
        h('div', { className: 'lr-tag-layer', ref: tagLayerRef }),
        h('div', { className: 'lr-selrect-layer', ref: overlayRef }),
        sizes.length
          ? sizes.map((size) =>
              h(PdfPage, {
                key: props.documentId + ':' + size.num,
                doc: props.doc,
                num: size.num,
                scale: props.scale,
                documentId: props.documentId,
                appearanceMode: props.appearanceMode,
                width: size.width * props.scale,
                height: size.height * props.scale,
              }),
            )
          : h('div', { className: 'lr-thinking' }, h('span', { className: 'lr-dot' }), '正在打开页面…'),
      )
    }

    const MemoPdfViewer = React.memo(function PdfViewerMemo(props) {
      return h(PdfViewer, props)
    }, (previous, next) =>
      previous.doc === next.doc &&
      previous.scale === next.scale &&
      previous.documentId === next.documentId &&
      previous.appearanceMode === next.appearanceMode &&
      previous.labels === next.labels &&
      previous.labelsVisible === next.labelsVisible &&
      previous.activeLabel === next.activeLabel &&
      previous.onReference === next.onReference &&
      previous.annotations === next.annotations,
    )

    function selectionWasTruncated(value) {
      return Boolean(value && (value.errorCode === 'OUTPUT_TRUNCATED' || value.error === '回答达到输出长度限制，内容尚未完成。请缩小范围后重试。'))
    }

    function TranslationCard(props) {
      const popup = props.popup
      const [mode, setMode] = useState('translate'), [text, setText] = useState(''), [loading, setLoading] = useState(false), [error, setError] = useState('')
      const [explain, setExplain] = useState({ text: '', loading: false, error: '' }), [question, setQuestion] = useState(''), [asked, setAsked] = useState('')
      const [answer, setAnswer] = useState({ text: '', loading: false, error: '' }), [history, setHistory] = useState([]), [context, setContext] = useState(null)
      const [folded, setFolded] = useState(false), [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [microOpen, setMicroOpen] = useState(false), [engaged, setEngaged] = useState(false)
      const [readyKey, setReadyKey] = useState('')
      const [bodyHeight, setBodyHeight] = useState(86), [pdfSurface, setPdfSurface] = useState('unknown')
      const turnStartRef = useRef(null), turnScrollRef = useRef(null), turnSequenceRef = useRef(0)
      const revealRunsRef = useRef({ translate: 0, explain: 0, ask: 0 })
      const rootRef = useRef(null), scrollRef = useRef(null), contentRef = useRef(null), microEntryRef = useRef(null), askHoverRef = useRef(false), followupRef = useRef(null), askButtonRef = useRef(null)
      const requests = useRef(new Map()), identityRef = useRef(null), sessionRef = useRef(null), explainStarted = useRef(false), leaveTimerRef = useRef(null), askTimerRef = useRef(null), microCloseTimerRef = useRef(null), focusFrameRef = useRef(null), colorTimerRef = useRef(null), compositionRef = useRef(false)
      const enterGateRef = useRef({ until: 0, moved: false, x: null, y: null }), pointerStateRef = useRef({ x: null, y: null, at: 0 }), liveRef = useRef(null)
      const presentation = popup && popup.presentation || 'shown'
      const hasAnswer = Boolean(engaged || history.length || asked || answer.text || answer.loading || answer.error)
      const hasConversation = Boolean(asked.trim() || history.some((turn) => turn && String(turn.question || '').trim()))
      const modeText = mode === 'translate' ? text : explain.text, modeLoading = mode === 'translate' ? loading : explain.loading, modeError = mode === 'translate' ? error : explain.error
      const maximum = Math.max(72, Math.min(460, window.innerHeight * .56 - 90, (popup && popup.viewportHeight || window.innerHeight) - 112))
      const stageHeight = Math.min(Math.max(bodyHeight + (hasAnswer ? 48 : 0), hasAnswer ? 180 : 48), maximum)
      liveRef.current = { presentation, hasConversation, stageHeight }
      const explainTruncated = mode === 'explain' && selectionWasTruncated(explain)
      const answerTruncated = selectionWasTruncated(answer)
      const currentTurn = asked ? { question: asked, answer: answer.text, context, status: answer.loading ? 'streaming' : answer.error ? 'interrupted' : 'complete', error: answer.error || '', errorCode: answer.errorCode || '' } : null
      const currentSession = identityRef.current
      if (currentSession) sessionRef.current = { ...currentSession, enteredAsk: hasAnswer, turns: [...history, ...(currentTurn ? [currentTurn] : [])], draft: question, mode, translation: text, explanation: explain.text, explanationError: explain.error || (explain.loading && explain.text ? '生成已中断，请重试' : ''), explanationTruncated: selectionWasTruncated(explain), folded, scrollTop: scrollRef.current ? scrollRef.current.scrollTop : 0 }
      function publishSession(extra) {
        const value = sessionRef.current
        if (!value) return
        const snapshot = { ...value, ...(extra || {}) }
        if (props.onPopupSnapshot) props.onPopupSnapshot(snapshot)
        if (props.onThreadChange && popupThreadHasConversation(snapshot)) props.onThreadChange(snapshot)
      }
      function cancelLeave() { clearTimeout(leaveTimerRef.current); leaveTimerRef.current = null }
      function cancelMicro() { clearTimeout(askTimerRef.current); askTimerRef.current = null }
      function cancelMicroClose() { clearTimeout(microCloseTimerRef.current); microCloseTimerRef.current = null }
      function scheduleMicroClose() {
        cancelMicroClose()
        if (editing()) return
        microCloseTimerRef.current = setTimeout(() => { microCloseTimerRef.current = null; const entry = microEntryRef.current; if (!editing() && !(entry && entry.contains(document.activeElement))) setMicroOpen(false) }, 160)
      }
      function editing() { return compositionRef.current || rootRef.current && rootRef.current.contains(document.activeElement) && popupEditingTarget(document.activeElement) }
      function rememberPointer(event) {
        if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) pointerStateRef.current = { x: event.clientX, y: event.clientY, at: Date.now() }
      }
      function pointerIsInside() {
        const root = rootRef.current
        if (!root || !root.getBoundingClientRect) return false
        const local = pointerStateRef.current, source = props.getSourcePointer && props.getSourcePointer()
        const point = source && source.at > local.at ? source : local
        return popupPointInside(root.getBoundingClientRect(), point)
      }
      function protectedFromLeave() {
        const root = rootRef.current
        return Boolean(editing() || root && (root.matches && root.matches(':hover') || root.contains(document.activeElement) || pointerIsInside()))
      }
      function scheduleLeave() {
        if (leaveTimerRef.current != null || !liveRef.current || liveRef.current.hasConversation || liveRef.current.presentation !== 'shown' || protectedFromLeave()) return
        leaveTimerRef.current = setTimeout(() => {
          leaveTimerRef.current = null
          const root = rootRef.current, live = liveRef.current
          if (!root || root.isConnected === false || !live || live.hasConversation || live.presentation !== 'shown' || protectedFromLeave()) return
          setHovered(false); setFocused(false); setMicroOpen(false); cancelMicro()
          publishSession()
          if (props.onPresentationChange) props.onPresentationChange(live.hasConversation ? 'bar' : 'perspective', live.stageHeight)
        }, 1000)
      }
      function leaveCard(event) {
        const root = rootRef.current
        if (event && event.relatedTarget && root && root.contains(event.relatedTarget)) { cancelLeave(); return }
        rememberPointer(event)
        if (protectedFromLeave()) { cancelLeave(); return }
        cancelMicro(); scheduleMicroClose(); setHovered(false); scheduleLeave()
      }
      function armEntry(event) {
        enterGateRef.current = { until: Date.now() + 240, moved: false, x: event && event.clientX, y: event && event.clientY }
      }
      function revealCard(event) {
        rememberPointer(event); cancelLeave(); setHovered(true)
        if (presentation !== 'shown') { armEntry(event); setMicroOpen(false); cancelMicro(); if (props.onPresentationChange) props.onPresentationChange('shown', stageHeight) }
      }
      function revealMicro() {
        cancelMicro(); cancelMicroClose(); cancelLeave()
        setMicroOpen(true)
      }
      function openConversation() {
        cancelMicro(); cancelMicroClose(); cancelLeave()
        setEngaged(true); setMicroOpen(false); setFolded(true); setFocused(true)
        window.cancelAnimationFrame(focusFrameRef.current)
        focusFrameRef.current = window.requestAnimationFrame(() => { if (followupRef.current) followupRef.current.focus({ preventScroll: true }) })
      }
      function queueMicro() {
        cancelMicro()
        const gate = enterGateRef.current
        if (hasAnswer || presentation !== 'shown' || !gate.moved) return
        askTimerRef.current = setTimeout(() => { askTimerRef.current = null; const button = askButtonRef.current; if (button && (askHoverRef.current || button.matches && button.matches(':hover')) && !editing()) revealMicro() }, Math.max(220, gate.until - Date.now()))
      }
      function notePointer(event) {
        rememberPointer(event)
        if (pointerIsInside()) cancelLeave()
        const gate = enterGateRef.current
        if (event.buttons || event.pointerType === 'touch') return
        if (gate.x == null || gate.y == null) { gate.x = event.clientX; gate.y = event.clientY; if (!event.movementX && !event.movementY) return }
        if (Math.hypot(event.movementX || 0, event.movementY || 0) > 0 || Math.hypot(event.clientX - gate.x, event.clientY - gate.y) > 2) { gate.moved = true; if (event.target.closest && event.target.closest('.lr-ask-toggle')) queueMicro() }
      }
      useEffect(() => {
        cancelLeave()
        if (presentation === 'shown') { armEntry(); setMicroOpen(false); cancelMicro() }
        else { askHoverRef.current = false; cancelMicro(); setMicroOpen(false); setHovered(false); setFocused(false) }
      }, [presentation])
      useEffect(() => {
        const saved = popup && props.savedThread && popupThreadForPaper(props.savedThread, popup.documentId) ? props.savedThread : null
        setReadyKey(popup && popup.key || '')
        identityRef.current = popup && { documentId: popup.documentId, key: popup.key, quote: popup.source, anchor: popup.selection && popup.selection.anchor, selection: popup.selection, origin: popup.origin }
        sessionRef.current = null
        for (const request of requests.current.values()) request.controller.abort()
        requests.current.clear(); cancelLeave(); cancelMicro(); cancelMicroClose(); clearTimeout(colorTimerRef.current); compositionRef.current = false; askHoverRef.current = false; turnScrollRef.current = null; turnSequenceRef.current = 0; armEntry()
        setMode(saved && saved.mode === 'explain' ? 'explain' : 'translate'); setQuestion(saved && saved.draft || ''); setEngaged(Boolean(saved && (saved.enteredAsk || String(saved.draft || '').trim() || popupThreadHasConversation(saved)))); setMicroOpen(false)
        const turns = saved ? (saved.turns || []).map((turn) => ({ ...turn, status: turn.status === 'streaming' ? 'interrupted' : turn.status || 'complete', error: turn.status === 'streaming' ? '上次回答已中断，可继续提问。' : turn.error || '' })) : []
        const last = turns.at(-1), retryTurn = last && last.question && selectionWasTruncated(last) ? turns.pop() : null
        setHistory(turns)
        setAsked(retryTurn ? retryTurn.question : ''); setAnswer(retryTurn ? { text: retryTurn.answer || '', loading: false, error: retryTurn.error || '回答未完成。', errorCode: 'OUTPUT_TRUNCATED' } : { text: '', loading: false, error: '' }); setContext(retryTurn && retryTurn.context || null); setError(''); setHovered(Boolean(popup && popup.revealUntilHover)); setFocused(false)
        const restoredTruncation = saved && saved.explanationTruncated === true, restoredExplainError = saved && saved.explanationError || (restoredTruncation ? '回答未完成。' : '')
        setExplain({ text: saved && saved.explanation || '', loading: false, error: restoredExplainError, errorCode: restoredTruncation ? 'OUTPUT_TRUNCATED' : '' }); explainStarted.current = Boolean(saved && (saved.explanation || restoredExplainError)); setFolded(Boolean(saved && (saved.folded || popupThreadHasConversation(saved))))
        if (!popup) return undefined
        revealRunsRef.current.translate += 1
        const record = popup.record
        const update = (value) => { setText(value.text || ''); setLoading(!value.done && !value.error); setError(value.error ? textOf(value.error) : '') }
        if (popup.cached !== undefined) { setText(popup.cached || ''); setLoading(false) }
        else if (saved && saved.translation) { setText(saved.translation); setLoading(false) }
        else if (record) { update(record); if (!record.done) record.listeners.add(update) }
        else { setText(''); setLoading(false) }
        return () => {
          publishSession({ turns: (sessionRef.current && sessionRef.current.turns || []).map((turn) => turn.status === 'streaming' ? { ...turn, status: 'interrupted', error: '回答已中断，可继续提问。' } : turn) })
          identityRef.current = null
          if (record) record.listeners.delete(update)
          for (const request of requests.current.values()) request.controller.abort()
          requests.current.clear(); cancelLeave(); cancelMicro(); cancelMicroClose(); clearTimeout(colorTimerRef.current); window.cancelAnimationFrame(focusFrameRef.current)
        }
      }, [popup && popup.key])
      useEffect(() => { publishSession() }, [question, mode, text, explain.text, explain.loading, explain.error, explain.errorCode, engaged, history, asked, answer.text, answer.loading, answer.error, answer.errorCode, context, folded])
      useEffect(() => {
        const element = contentRef.current
        if (!element) return undefined
        const measure = () => setBodyHeight(element.offsetHeight)
        measure()
        if (typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(measure); observer.observe(element); return () => observer.disconnect()
      }, [])
      useEffect(() => {
        const saved = props.savedThread
        if (!saved || !popup || !popupThreadForPaper(saved, popup.documentId) || !Number.isFinite(saved.scrollTop)) return undefined
        const timer = setTimeout(() => { if (scrollRef.current && identityRef.current && identityRef.current.key === popup.key && !turnScrollRef.current) scrollRef.current.scrollTop = Math.max(0, saved.scrollTop) }, 0)
        return () => clearTimeout(timer)
      }, [popup && popup.key])
      useEffect(() => { if (answer.text) setFolded(true) }, [Boolean(answer.text)])
      useLayoutEffect(() => {
        const pending = turnScrollRef.current, element = scrollRef.current, target = turnStartRef.current
        if (!pending || !pending.active || !popup || pending.key !== popup.key || !element || !target || presentation !== 'shown') return undefined
        let frame = null, timer = null, observer = null, stopped = false
        const current = () => !stopped && turnScrollRef.current === pending && pending.active && identityRef.current && identityRef.current.key === pending.key && identityRef.current.documentId === popup.documentId
        const align = () => {
          frame = null
          if (!current()) return
          const top = chatTurnTop(element, target, 8)
          if (top == null) return
          pending.pending = false
          pending.expectedScrollTop = top
          if (Math.abs(element.scrollTop - top) > .5) element.scrollTop = top
          pending.expectedScrollTop = element.scrollTop
          publishSession({ scrollTop: element.scrollTop })
        }
        const queue = () => { if (current() && frame == null) frame = window.requestAnimationFrame(align) }
        const stop = () => {
          if (stopped) return
          stopped = true; pending.active = false
          window.cancelAnimationFrame(frame); clearTimeout(timer)
          if (observer) observer.disconnect()
          element.removeEventListener('transitionend', queue); element.removeEventListener('animationend', queue)
          if (pending.stop === stop) pending.stop = null
        }
        pending.stop = stop
        // The translation folds above this question while the stage settles. Track that
        // short layout change, then release ownership; streaming never follows the tail.
        align()
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(queue)
          observer.observe(element); observer.observe(target)
          if (contentRef.current) observer.observe(contentRef.current)
        }
        element.addEventListener('transitionend', queue); element.addEventListener('animationend', queue)
        timer = setTimeout(() => { align(); stop() }, 720)
        return stop
      }, [popup && popup.key, asked, turnSequenceRef.current, presentation])
      function releaseTurnAnchor() {
        const pending = turnScrollRef.current
        if (pending && pending.stop) pending.stop()
      }
      function scrollConversation() {
        const pending = turnScrollRef.current, element = scrollRef.current
        if (pending && pending.active && element && Number.isFinite(pending.expectedScrollTop) && Math.abs(element.scrollTop - pending.expectedScrollTop) > 1) releaseTurnAnchor()
        publishSession()
      }
      function conversationScrollKey(event) {
        if (!popupEditingTarget(event.target) && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseTurnAnchor()
      }
      useEffect(() => {
        const root = rootRef.current, host = root && root.closest && root.closest('.lr-source-body')
        if (!host || !popup || !popup.origin) return undefined
        const update = () => { const page = host.querySelector('.lr-page[data-page="' + Number(popup.origin.page) + '"]'), canvas = page && page.querySelector('.lr-page-canvas'), value = page && page.dataset.pdfSurface || canvas && canvas.dataset.pdfSurface; setPdfSurface(value === 'dark' ? 'dark' : value === 'light' ? 'light' : 'unknown') }
        update(); host.addEventListener('lr-canvasrendered', update); host.addEventListener('lr-textlayerrendered', update)
        return () => { host.removeEventListener('lr-canvasrendered', update); host.removeEventListener('lr-textlayerrendered', update) }
      }, [popup && popup.key])
      function revealMarkdown(value, kind, pending, issue) {
        const parsed = renderMarkdown(value), motion = window.__glossReplyMotion
        if (!motion || !motion.ReplyReveal) return parsed
        return h(motion.ReplyReveal, {
          ownerId: popup && popup.documentId, runId: (popup && popup.key || '') + ':' + kind + ':' + (revealRunsRef.current[kind] || 0),
          streaming: Boolean(pending && !issue), status: issue ? 'error' : pending ? 'streaming' : 'complete', selectionRoot: scrollRef,
          disabled: presentation !== 'shown' || kind !== 'ask' && hasAnswer && folded,
        }, parsed)
      }
      function startSelection(kind, questionText, chatHistory, compactAnswer = false) {
        if (!popup) return
        const previous = requests.current.get(kind)
        if (previous) { if (compactAnswer && !previous.terminal) return; previous.controller.abort() }
        revealRunsRef.current[kind] = (revealRunsRef.current[kind] || 0) + 1
        const request = { controller: new AbortController(), key: popup.key }; requests.current.set(kind, request)
        const current = () => requests.current.get(kind) === request && identityRef.current && identityRef.current.key === request.key
        const alive = () => current() && !request.controller.signal.aborted
        const update = (value) => { if (alive()) (kind === 'ask' ? setAnswer : setExplain)(value) }
        const finish = (value) => { if (current()) (kind === 'ask' ? setAnswer : setExplain)(value) }
        let accumulated = '', timer = null, failure = '', errorCode = '', receivedDone = false
        if (kind === 'ask') setContext(null)
        update({ text: '', loading: true, error: '' })
        streamPost('/api/literature/selection', { kind, text: popup.source, selection: popup.selection, question: questionText || '', title: popup.title || '', history: kind === 'ask' ? (chatHistory || history).filter((turn) => turn.answer && !turn.error && turn.status !== 'streaming').slice(-6).map((turn) => ({ question: turn.question, answer: turn.answer })) : undefined, ...(props.getPaperContext ? props.getPaperContext() || {} : {}), ...(compactAnswer ? { compactAnswer: true } : {}) }, (event, data) => {
          if (!alive() || failure) return
          if (event === 'context') { if (kind === 'ask') setContext(data) }
          else if (event === 'delta') { accumulated += data.text || ''; if (!timer) timer = setTimeout(() => { timer = null; update({ text: accumulated, loading: true, error: '' }) }, 65) }
          else if (event === 'done') { receivedDone = true; accumulated = data.text || accumulated }
          else if (event === 'error') {
            failure = data.message || '生成失败，请重试'
            errorCode = selectionWasTruncated({ error: failure, errorCode: data.code }) ? 'OUTPUT_TRUNCATED' : ''
            request.terminal = true
            if (timer) { clearTimeout(timer); timer = null }
            finish({ text: accumulated, loading: false, error: failure, errorCode })
          }
        }, request.controller.signal).then(() => { finish({ text: accumulated, loading: false, error: failure || (request.controller.signal.aborted ? '生成已中断，请重试' : !accumulated.trim() ? '没有收到回答，请重试' : !receivedDone ? '生成已中断，请重试' : ''), errorCode }) })
          .catch((caught) => { finish({ text: accumulated, loading: false, error: failure || (isAbort(caught) ? '生成已中断，请重试' : textOf(caught)), errorCode }) })
          .finally(() => { if (timer) clearTimeout(timer); if (requests.current.get(kind) === request) requests.current.delete(kind) })
      }
      function retryTruncated(kind) {
        if (kind === 'ask') { if (asked && answerTruncated && !answer.loading) startSelection('ask', asked, history, true) }
        else if (explainTruncated && !explain.loading) startSelection('explain', '', null, true)
      }
      function truncationNotice(kind) {
        return h('div', { className: 'lr-chat-context-note', role: 'status' }, '回答达到长度上限，尚未完成。', h('button', { type: 'button', className: 'lr-iconbtn', style: { minHeight: 28 }, onClick: () => retryTruncated(kind) }, '简短重试'))
      }
      function showExplain() { setMode('explain'); setFolded(false); if (!explainStarted.current) { explainStarted.current = true; startSelection('explain') } }
      function submitQuestion(value) {
        if (compositionRef.current) return
        const next = String(value || question).trim(); if (!next || answer.loading) return
        const nextHistory = value === asked && answer.error ? history : currentTurn ? [...history, currentTurn] : history
        releaseTurnAnchor()
        turnScrollRef.current = { key: popup.key, sequence: ++turnSequenceRef.current, pending: true, active: true, expectedScrollTop: null }
        setHistory(nextHistory); setAsked(next); setQuestion(''); setMicroOpen(false); setEngaged(true); setFolded(true); cancelMicro(); cancelLeave()
        if (props.onPresentationChange) props.onPresentationChange('shown', stageHeight)
        window.cancelAnimationFrame(focusFrameRef.current)
        focusFrameRef.current = window.requestAnimationFrame(() => { if (followupRef.current) followupRef.current.focus({ preventScroll: true }) })
        startSelection('ask', next, nextHistory)
      }
      function editQuestion(event) { setQuestion(event.target.value); setEngaged(true); cancelLeave(); const node = event.target; if (node.style) { node.style.height = 'auto'; node.style.height = Math.min(72, Math.max(26, node.scrollHeight || 26)) + 'px' } }
      function questionKey(event) { if (event.key === 'Enter' && !event.shiftKey) { if (event.isComposing || event.nativeEvent && event.nativeEvent.isComposing || compositionRef.current) return; event.preventDefault(); submitQuestion() } }
      function colorClick(event, color) { clearTimeout(colorTimerRef.current); if (event && event.detail >= 2) return; if (event && event.detail === 0) { props.onHighlight && props.onHighlight(color, event.shiftKey ? 'underline' : 'highlight'); return } colorTimerRef.current = setTimeout(() => { colorTimerRef.current = null; props.onHighlight && props.onHighlight(color, 'highlight') }, 230) }
      function colorDouble(event, color) { event.preventDefault(); clearTimeout(colorTimerRef.current); colorTimerRef.current = null; props.onHighlight && props.onHighlight(color, 'underline') }
      function thinking(label) { return replyWaiting(label, false) }
      if (!popup) return null
      const inactive = presentation !== 'shown'
      return h('section', { className: cls('lr-pop is-hybrid', popup.docked && 'is-docked', presentation === 'perspective' && 'is-perspective', presentation === 'bar' && 'is-session-hidden', hasAnswer && 'has-answer', microOpen && !hasAnswer && 'has-micro', hovered && 'is-hovered', focused && 'has-focus', popup.revealUntilHover && 'is-preview', popup.morphing && 'is-morphing', modeLoading && 'is-generating', modeLoading && !modeText && 'is-loading'),
        ref: rootRef, 'aria-label': '选区翻译与追问', 'data-popup-key': popup.key, 'data-ready-key': readyKey, 'data-presentation': presentation, 'data-receiving': presentation === 'shown' ? 'true' : 'false', 'data-conversation': hasConversation ? 'true' : 'false', 'data-material': 'hybrid-thin', 'data-pdf-surface': pdfSurface, 'data-restored': popup.restoredAt ? 'true' : undefined, 'aria-hidden': presentation === 'bar' || undefined,
        style: { height: popup.motion && popup.motion.phase === 'collapse' && popup.expandedHeight ? popup.expandedHeight + 'px' : undefined, maxHeight: popup.viewportHeight ? Math.max(130, popup.viewportHeight - 16) + 'px' : undefined, '--lr-card-width': (popup.anchor.width || 360) + 'px', '--lr-collapse-x': (popup.collapseX || 0) + 'px', '--lr-collapse-y': (popup.collapseY || 0) + 'px', '--lr-collapse-sx': popup.collapseSX || .3, '--lr-collapse-sy': popup.collapseSY || .1 },
        onMouseDown: (event) => event.stopPropagation(), onPointerMove: notePointer,
        onMouseEnter: (event) => { rememberPointer(event); cancelLeave(); if (Date.now() >= enterGateRef.current.until) armEntry(event); revealCard(event) }, onMouseLeave: leaveCard,
        onFocusCapture: () => { cancelLeave(); cancelMicroClose(); setFocused(true); if (presentation !== 'shown' && props.onPresentationChange) props.onPresentationChange('shown', stageHeight) },
        onBlurCapture: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); scheduleLeave() } },
        onKeyDown: (event) => { if (event.key === 'Escape' && !event.isComposing && !compositionRef.current && !popupEditingTarget(event.target)) { event.preventDefault(); event.stopPropagation(); if (props.onDismiss) props.onDismiss('escape'); else props.onClose() } },
      },
        h('div', { className: 'lr-pop-head', role: 'toolbar', 'aria-label': '选区操作', inert: inactive ? '' : undefined, 'aria-hidden': inactive || undefined },
          h('div', { className: 'lr-glass-actions', onMouseEnter: cancelMicroClose, onMouseLeave: scheduleMicroClose },
            h('button', { className: 'lr-glass-button lr-mode-toggle', 'aria-label': mode === 'translate' ? '切换为解释' : '切换为译文', 'aria-pressed': mode === 'explain', title: '译文 / 解释', onClick: () => { setMicroOpen(false); if (mode === 'translate') showExplain(); else { setMode('translate'); setFolded(false) } } }, h(ToolIcon, { name: mode })),
            h('button', { className: cls('lr-glass-button lr-ask-toggle', hasAnswer && 'is-placeholder'), ref: askButtonRef, 'aria-label': '追问选区', 'aria-expanded': microOpen, 'aria-hidden': hasAnswer || undefined, disabled: hasAnswer, tabIndex: hasAnswer ? -1 : 0, title: '移入展开提问入口，点击进入问答', onMouseEnter: () => { askHoverRef.current = true; cancelMicroClose(); queueMicro() }, onMouseLeave: () => { askHoverRef.current = false; cancelMicro() }, onClick: () => { if (!hasAnswer) openConversation() } }, h(ToolIcon, { name: 'ask' })),
            h('div', { className: cls('lr-micro-ask', microOpen && !hasAnswer && 'is-open'), inert: !microOpen || inactive || hasAnswer ? '' : undefined, 'aria-hidden': !microOpen || inactive || hasAnswer, onMouseEnter: () => { cancelLeave(); cancelMicroClose() }, onMouseLeave: scheduleMicroClose },
              h('button', { type: 'button', className: 'lr-micro-entry', ref: microEntryRef, 'aria-label': '进入选区问答', onClick: openConversation }, h('span', null, '提问这段…'))),
            h('button', { className: 'lr-glass-button lr-copy-selection', 'aria-label': mode === 'translate' ? '复制译文' : '复制解释', title: mode === 'translate' ? '复制译文' : '复制解释', disabled: !modeText, onClick: () => props.onCopy(modeText) }, h(ToolIcon, { name: 'copy' }))),
          h('div', { className: 'lr-glass-palette', role: 'group', 'aria-label': '高亮颜色' }, HIGHLIGHT_COLORS.map((color) => h('button', { key: color.value, className: cls('lr-color-swatch', popup.highlightColor === color.value && 'is-active'), style: { '--swatch': color.value }, 'aria-label': (popup.highlightColor === color.value ? '取消或更改' : '设置') + color.name + '高亮', 'aria-pressed': popup.highlightColor === color.value, title: '单击背景高亮；双击下划线；Enter 背景，Shift+Enter 下划线', onClick: (event) => colorClick(event, color.value), onDoubleClick: (event) => colorDouble(event, color.value), onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); clearTimeout(colorTimerRef.current); props.onHighlight && props.onHighlight(color.value, event.shiftKey ? 'underline' : 'highlight') } } }, popup.highlightColor === color.value ? h(ToolIcon, { name: 'check' }) : null)))),
        h('div', { className: 'lr-pop-stage', style: { height: stageHeight + 'px' }, inert: inactive ? '' : undefined, 'aria-hidden': inactive || undefined },
          h('div', { className: 'lr-pop-scroll', ref: scrollRef, onScroll: scrollConversation, onWheel: releaseTurnAnchor, onTouchStart: releaseTurnAnchor, onPointerDown: releaseTurnAnchor, onKeyDown: conversationScrollKey }, h('div', { className: 'lr-pop-content', ref: contentRef },
            hasAnswer && folded ? h('button', { className: 'lr-translation-summary', onClick: () => setFolded(false), 'aria-expanded': false }, h('span', { className: 'lr-summary-kind' }, mode === 'translate' ? '译文' : '解释'), h('span', { className: 'lr-summary-text' }, modeText || '查看原段落译文'), h('span', null, '展开')) : null,
            h('div', { className: cls('lr-translation-region', hasAnswer && folded && 'is-folded') }, h('div', { className: 'lr-translation-inner' }, h(React.Fragment, null, !modeError || mode === 'explain' && modeText ? h('div', { className: 'lr-pop-body' }, revealMarkdown(modeText, mode, modeLoading, modeError), modeLoading && !modeText.trim() ? thinking(mode === 'translate' ? '正在翻译' : '正在解释') : null) : null, explainTruncated ? truncationNotice('explain') : modeError ? h('div', { className: 'lr-pop-error', role: 'alert' }, modeError, mode === 'explain' ? h('button', { className: 'lr-iconbtn', onClick: () => startSelection('explain') }, '重试') : null) : null), hasAnswer && !folded ? h('button', { className: 'lr-iconbtn lr-fold-control', onClick: () => setFolded(true), 'aria-expanded': true }, '收起译文') : null)),
            hasAnswer ? h('div', { className: cls('lr-answer', answer.text && 'is-ready') }, history.map((turn, index) => h('div', { className: cls('lr-chat-turn', !asked && index === history.length - 1 && 'is-current'), key: turn.id || index, style: !asked && index === history.length - 1 ? { minHeight: Math.max(100, stageHeight - 24) + 'px' } : undefined }, h('div', { className: 'lr-chat-message lr-chat-user' }, turn.question), h('div', { className: 'lr-chat-message lr-chat-assistant' }, renderMarkdown(turn.answer), turn.error ? h('div', { className: 'lr-chat-context-note' }, selectionWasTruncated(turn) ? '回答未完成。' : turn.error) : null))), asked ? h('div', { className: 'lr-chat-turn is-current', 'data-turn-sequence': turnSequenceRef.current, style: { minHeight: Math.max(100, stageHeight - 24) + 'px' } }, h('div', { className: 'lr-answer-question lr-chat-message lr-chat-user', ref: turnStartRef }, asked), h('div', { className: 'lr-chat-message lr-chat-assistant' }, h(React.Fragment, null, revealMarkdown(answer.text, 'ask', answer.loading, answer.error), answer.loading && !answer.error && !answer.text.trim() ? thinking('正在组织回答') : null), answerTruncated ? truncationNotice('ask') : answer.error ? h('div', { className: 'lr-pop-error', role: 'alert' }, answer.error, h('button', { className: 'lr-iconbtn', onClick: () => submitQuestion(asked) }, '重试')) : null)) : null) : null)),
          hasAnswer ? h('form', { className: 'lr-followup', onSubmit: (event) => { event.preventDefault(); submitQuestion() } }, h('textarea', { className: 'lr-followup-input', rows: 1, ref: followupRef, value: question, 'aria-label': '继续追问这段原文', placeholder: asked || history.length ? '继续提问…' : '关于这段，想问什么？', onChange: editQuestion, onKeyDown: questionKey, onCompositionStart: () => { compositionRef.current = true; cancelLeave() }, onCompositionEnd: () => { compositionRef.current = false } }), h('button', { type: 'submit', className: 'lr-ask-btn', disabled: answer.loading || !question.trim() }, '发送')) : null),
        h('div', { className: 'lr-pop-perspective-outline', 'aria-hidden': true }), h('span', { className: 'lr-pop-handle', 'aria-hidden': true }))
    }



    function PanelIcon(props = {}) {
      const size = props.size || 20
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true,
        style: { display: 'block', color: props.active ? 'var(--dsw-alias-brand-primary)' : 'currentColor' },
      },
      h('path', { d: 'M19.2 6.7a8.5 8.5 0 1 0 1.2 7.1v-1.6h-6.2', stroke: 'currentColor', strokeWidth: 2.15, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      h('path', { d: 'M8.8 10h3.1M8.8 13.8h2', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', opacity: .54 }),
      )
    }

    /* Track the pointer highlight on the reader's small glass controls. */
    function updateThinMaterialLight(event) {
      if (event.buttons) return
      const surface = event.target && event.target.closest && event.target.closest('.lr-title-pill,.lr-reader-button,.lr-more-toggle,.lr-glass-orb,.lr-reference-return,.lr-pop-head,.lr-pop-stage,.lr-ideas-composer')
      if (!surface || !event.currentTarget || !event.currentTarget.contains(surface)) return
      if (event.type === 'pointerout') {
        if (event.relatedTarget && surface.contains(event.relatedTarget)) return
        surface.style.setProperty('--lr-glass-x', '50%')
        surface.style.setProperty('--gloss-thin-light-y', '0%')
        return
      }
      const box = surface.getBoundingClientRect()
      if (!(box.width > 0 && box.height > 0)) return
      const x = Math.max(5, Math.min(95, (event.clientX - box.left) / box.width * 100))
      const y = Math.max(0, Math.min(100, (event.clientY - box.top) / box.height * 100))
      surface.style.setProperty('--lr-glass-x', x.toFixed(1) + '%')
      surface.style.setProperty('--gloss-thin-light-y', y.toFixed(1) + '%')
    }

    const SELECTED_MATERIAL_CSS = `
/* Gloss · selected material 1, 清透薄缘.
   Append after SHELL_CSS and feature CSS. No event/state/scroll logic changes.
   The reading well adds one 8px concentric inset; source/control geometry stays put.
   The 3px masked rim owns the 8px blur. Reading surfaces remain stable and opaque. */
@property --gloss-thin-edge-x {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 50%;
}

.lr-root {
  --gloss-thin-fill: 1.5%;
  --gloss-thin-band: 3px;
  --gloss-thin-center-blur: 1px;
  --gloss-thin-edge-blur: 8px;
  --gloss-thin-rim-level: 68%;
  --gloss-thin-surface: var(--lr-shell-ground, var(--dsw-alias-bg-base, #fff));
  --gloss-thin-ink: var(--lr-shell-ink, var(--dsw-alias-label-primary, #25272d));
  --gloss-thin-rim: color-mix(in srgb, var(--gloss-thin-surface) 50%, white);
  --gloss-thin-shadow: color-mix(in srgb, var(--gloss-thin-ink) 2.5%, transparent);
  --gloss-thin-radius: 28px;
  --gloss-thin-inset: 8px;
  --gloss-thin-inner-radius: calc(var(--gloss-thin-radius) - var(--gloss-thin-inset));
  --gloss-thin-bevel:
    inset 0 1px 0 color-mix(in srgb, var(--gloss-thin-rim) 64%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--gloss-thin-ink) 2.5%, transparent);
}

/* Keep every existing transform, pointer guard, source anchor and focus behavior. */
.lr-root .lr-reader-chrome > .lr-title-pill,
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle),
.lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle),
.lr-root .lr-tab-lens,
.lr-root .lrcp.is-direct > .lrcp-rail,
.lr-root .lrcp-glass-thumb,
.lr-root .lr-reference-return,
.lr-root .lr-pop.is-compact .lr-glass-orb {
  isolation: isolate;
  border: 1px solid color-mix(in srgb, var(--gloss-thin-rim) var(--gloss-thin-rim-level), transparent);
  background: color-mix(in srgb, var(--gloss-thin-surface) var(--gloss-thin-fill), transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: var(--gloss-thin-bevel), 0 1px 4px var(--gloss-thin-shadow);
  corner-shape: round;
}

/* Controls need their own containing block; the lens/thumb/orb stay absolute. */
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle),
.lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle) {
  position: relative;
}

.lr-root .lr-reader-chrome > .lr-title-pill::before,
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle)::before,
.lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle)::before,
.lr-root .lr-tab-lens::before,
.lr-root .lrcp.is-direct > .lrcp-rail::before,
.lr-root .lrcp-glass-thumb::before,
.lr-root .lr-reference-return::before,
.lr-root .lr-pop.is-compact .lr-glass-orb::before {
  content: '';
  position: absolute;
  z-index: -2;
  inset: var(--gloss-thin-band);
  border-radius: inherit;
  background: transparent;
  backdrop-filter: blur(var(--gloss-thin-center-blur)) saturate(1.04);
  -webkit-backdrop-filter: blur(var(--gloss-thin-center-blur)) saturate(1.04);
  pointer-events: none;
}

.lr-root .lr-reader-chrome > .lr-title-pill::after,
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle)::after,
.lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle)::after,
.lr-root .lr-tab-lens::after,
.lr-root .lrcp.is-direct > .lrcp-rail::after,
.lr-root .lrcp-glass-thumb::after,
.lr-root .lr-reference-return::after,
.lr-root .lr-pop.is-compact .lr-glass-orb::after {
  --gloss-thin-edge-x: var(--lr-glass-x, 50%);
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  box-sizing: border-box;
  border: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  transition: opacity .18s ease, --gloss-thin-edge-x .16s ease;
}

/* Mask support is progressive: no mask means no filled/blurred overlay. */
@supports (mask-composite: exclude) or (-webkit-mask-composite: xor) {
  .lr-root .lr-reader-chrome > .lr-title-pill::after,
  .lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle)::after,
  .lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle)::after,
  .lr-root .lr-tab-lens::after,
  .lr-root .lrcp.is-direct > .lrcp-rail::after,
  .lr-root .lrcp-glass-thumb::after,
  .lr-root .lr-reference-return::after,
  .lr-root .lr-pop.is-compact .lr-glass-orb::after {
    padding: var(--gloss-thin-band);
    background:
      radial-gradient(105% 150% at var(--gloss-thin-edge-x) var(--gloss-thin-light-y, 0%),
        color-mix(in srgb, var(--gloss-thin-rim) 48%, transparent), transparent 70%),
      conic-gradient(from 120deg,
        color-mix(in srgb, var(--gloss-thin-rim) 44%, transparent),
        transparent 21%,
        color-mix(in srgb, var(--gloss-thin-ink) 2.5%, transparent) 49%,
        color-mix(in srgb, var(--gloss-accent, #007aff) 3%, transparent) 56%,
        transparent 74%,
        color-mix(in srgb, var(--gloss-thin-rim) 38%, transparent));
    backdrop-filter: blur(var(--gloss-thin-edge-blur)) saturate(1.18);
    -webkit-backdrop-filter: blur(var(--gloss-thin-edge-blur)) saturate(1.18);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--gloss-thin-rim) 66%, transparent),
      inset 0 -1px 0 color-mix(in srgb, var(--gloss-thin-ink) 2%, transparent);
  }
}

/* The base track is quiet. Its active lens uses the same rim as the header. */
.lr-root .lr-tabs {
  border-color: color-mix(in srgb, var(--gloss-thin-ink) 8%, transparent);
  background: color-mix(in srgb, var(--gloss-thin-surface) 3%, transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gloss-thin-rim) 36%, transparent);
}
.lr-root .lr-tabs::before {
  background: radial-gradient(ellipse at var(--lr-glass-x, 50%) 0%,
    color-mix(in srgb, var(--gloss-thin-rim) 20%, transparent), transparent 65%);
  opacity: .32;
}
.lr-root .lr-tabs.is-pressing { --lr-lens-stretch: 1.012; --lr-lens-height: .998; }
.lr-root .lr-tabs.is-scrubbing { --lr-lens-stretch: 1.025; --lr-lens-height: .995; }
.lr-root .lr-tabs.is-gliding .lr-tab-lens::after { animation: gloss-thin-glide .26s ease-out; }
@keyframes gloss-thin-glide { 0%, 100% { opacity: .62; } 45% { opacity: .88; } }

.lr-root .lrcp-glass-thumb::after { --gloss-thin-edge-x: calc(20% + var(--progress, 0) * 60%); }
.lr-root .lrcp-slider-track { background: color-mix(in srgb, var(--gloss-thin-ink) 8%, transparent); }
.lr-root .lrcp-slider-progress { background: color-mix(in srgb, var(--gloss-accent, #007aff) 38%, transparent); }
.lr-root .is-dragging .lrcp-glass-thumb {
  transform: translate(-50%, -50%) scaleX(1.045) scaleY(.99);
  box-shadow: var(--gloss-thin-bevel), 0 1px 4px var(--gloss-thin-shadow);
}

/* Avoid a second frosted/shadowed shell beneath the compact translation orb. */
.lr-root .lr-pop.is-compact .lr-pop-head {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
.lr-root .lr-pop.is-compact .lr-glass-orb:hover { transform: none; }

/* A stable reading well: outer radius28 minus inset8 gives the inner radius20.
   This is an opaque reading layer, so PDF glyphs cannot double through prose. */
.lr-root .lr-notes {
  position: relative;
  isolation: isolate;
  border-radius: var(--gloss-thin-radius);
  corner-shape: squircle;
  border: 1px solid color-mix(in srgb, var(--gloss-thin-ink) 6%, transparent);
  background: color-mix(in srgb, var(--gloss-thin-surface) 98%, var(--gloss-thin-ink));
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  overflow: hidden;
}
.lr-root .lr-notes > .lr-tabs-wrap {
  padding-inline: 12px;
  background: transparent;
  box-shadow: none;
}
.lr-root .lr-notes > .lr-content {
  margin: 0 var(--gloss-thin-inset) var(--gloss-thin-inset);
  border-radius: var(--gloss-thin-inner-radius);
  corner-shape: squircle;
  background: var(--gloss-thin-surface);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

/* DeepSeek's docked macOS sidebar would otherwise lay out the glass reading
   pane at every intermediate grid width. Commit the grid resize in one frame. */
html[data-platform=darwin] [data-animating]:not([data-sidebar-drawer]):has([data-global-panel] .lr-root .lr-notes:not([hidden])),
html[data-platform=darwin] [data-animating]:not([data-sidebar-drawer]):has([data-global-panel] .lr-root .lr-notes:not([hidden])) > [data-side] {
  transition-duration: 0s;
}
.lr-root.is-pane-resizing .lr-source-body {
  overflow-anchor: none;
}
/* These rails sit on solid backgrounds in the native reader. Keep their
   glass rims and gradients without sampling the translucent Electron window. */
/* The outer frame is decorative. Leave clipping to the scrollport and use a
   circular radius there so a live width change avoids nested clip masks. */
html[data-platform=darwin] .lr-root .lr-body > .lr-notes {
  corner-shape: round;
  overflow: visible;
}
html[data-platform=darwin] .lr-root .lr-notes > .lr-content {
  corner-shape: round;
}
html[data-platform=darwin] .lr-root .lr-body .lr-notes :is(.lr-tabs, .lr-tab-lens, .lrcp-rail),
html[data-platform=darwin] .lr-root .lr-body .lr-notes :is(.lr-tab-lens, .lrcp-rail)::before,
html[data-platform=darwin] .lr-root .lr-body .lr-notes :is(.lr-tab-lens, .lrcp-rail)::after {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.lr-root .lr-notes :is(.lr-card, .lrc-row) {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
.lr-root .lr-notes .lrcp.is-direct > .lrcp-rail {
  corner-shape: squircle;
  border-radius: 20px;
  box-shadow: var(--gloss-thin-bevel);
}

/* Interaction changes the light, never a large scale or a heavier shadow. */
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle):hover,
.lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle):hover,
.lr-root .lr-reference-return:hover {
  background: color-mix(in srgb, var(--gloss-thin-surface) 3%, transparent);
  box-shadow: var(--gloss-thin-bevel), 0 1px 4px var(--gloss-thin-shadow);
}
.lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle):active { transform: scale(.985); }

@media (prefers-reduced-motion: reduce) {
  .lr-root .lr-tabs.is-gliding .lr-tab-lens::after { animation: none; }
  .lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle):active { transform: none; }
  .lr-root .lr-tabs { --lr-lens-stretch: 1; --lr-lens-height: 1; }
  .lr-root .is-dragging .lrcp-glass-thumb { transform: translate(-50%, -50%); }
  .lr-root :is(.lr-title-pill, .lr-reader-button, .lr-more-toggle, .lr-tab-lens, .lrcp-glass-thumb, .lr-reference-return)::after,
  .lr-root .lrcp.is-direct > .lrcp-rail::after,
  .lr-root .lr-pop.is-compact .lr-glass-orb::after { transition: none; }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .lr-root .lr-reader-chrome > .lr-title-pill,
  .lr-root .lr-reader-chrome :is(.lr-reader-button, .lr-more-toggle),
  .lr-root .lr-header-actions :is(.lr-reader-button, .lr-more-toggle),
  .lr-root .lr-tab-lens,
  .lr-root .lrcp.is-direct > .lrcp-rail,
  .lr-root .lrcp-glass-thumb,
  .lr-root .lr-reference-return,
  .lr-root .lr-pop.is-compact .lr-glass-orb {
    background: var(--gloss-thin-surface);
    border-color: var(--lr-shell-control);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
  }
  .lr-root :is(.lr-title-pill, .lr-reader-button, .lr-more-toggle, .lr-tab-lens, .lrcp-glass-thumb, .lr-reference-return)::before,
  .lr-root :is(.lr-title-pill, .lr-reader-button, .lr-more-toggle, .lr-tab-lens, .lrcp-glass-thumb, .lr-reference-return)::after,
  .lr-root .lrcp.is-direct > .lrcp-rail::before,
  .lr-root .lrcp.is-direct > .lrcp-rail::after,
  .lr-root .lr-pop.is-compact .lr-glass-orb::before,
  .lr-root .lr-pop.is-compact .lr-glass-orb::after { display: none; }
}

/* Prepared patch only. Append after the shared material patch; not installed.
   CSS material simulation. No PDF texture capture, WebGL or foreground filter.
   The readable translation center is the user's explicit diffusion exception:
   34% fill / 20px backdrop blur; controls and composer keep the clear thin center.
   Do not apply these rules to compact/orb, header navigation or reading tabs. */

.lr-pop:not(.is-compact),
.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview) {
  --lr-tc-surface: var(--gloss-thin-surface,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)));
  --lr-tc-ink: var(--gloss-thin-ink,var(--dsw-alias-label-primary));
  --lr-tc-rim: var(--gloss-thin-rim,var(--dsw-alias-bg-overlay));
  --lr-tc-band: var(--gloss-thin-band,3px);
  --lr-tc-edge-blur: var(--gloss-thin-edge-blur,8px);
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-color: transparent;
  box-shadow: none;
  /* Root material stays steady; existing opacity/fold interaction owns visibility. */
  transition: border-radius .28s cubic-bezier(.2,.8,.2,1),
    padding .28s cubic-bezier(.2,.8,.2,1),
    max-height .28s cubic-bezier(.2,.8,.2,1);
}

.lr-pop:not(.is-compact) > .lr-pop-stage {
  --lr-tc-fill: 34%;
  --lr-tc-center-blur: 20px;
  position: relative;
  isolation: isolate;
  border-radius: 23px;
  background: color-mix(in srgb,var(--lr-tc-surface) var(--lr-tc-fill),transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 1px 4px var(--gloss-thin-shadow,color-mix(in srgb,var(--lr-tc-ink) 2.5%,transparent));
}

.lr-pop:not(.is-compact) > .lr-pop-head {
  --lr-tc-fill: 4%;
  --lr-tc-center-blur: var(--gloss-thin-center-blur,1px);
  position: relative;
  isolation: isolate;
  border: 1px solid color-mix(in srgb,var(--lr-tc-rim) 54%,transparent);
  border-radius: 999px;
  background: color-mix(in srgb,var(--lr-tc-surface) var(--lr-tc-fill),transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.lr-pop:not(.is-compact) > :is(.lr-pop-head,.lr-pop-stage)::before {
  content: '';
  display: block;
  position: absolute;
  z-index: -2;
  inset: var(--lr-tc-band);
  border-radius: inherit;
  background: transparent;
  backdrop-filter: blur(var(--lr-tc-center-blur)) saturate(1.06);
  -webkit-backdrop-filter: blur(var(--lr-tc-center-blur)) saturate(1.06);
  pointer-events: none;
}

.lr-pop:not(.is-compact) > :is(.lr-pop-head,.lr-pop-stage)::after {
  content: '';
  position: absolute;
  z-index: -1;
  box-sizing: border-box;
  inset: 0;
  padding: var(--lr-tc-band);
  border-radius: inherit;
  background: radial-gradient(110% 170% at var(--lr-glass-x,50%) 0%,
      color-mix(in srgb,var(--lr-tc-rim) 62%,transparent),transparent 75%),
    linear-gradient(180deg,color-mix(in srgb,var(--lr-tc-rim) 14%,transparent),
      transparent 48%,color-mix(in srgb,var(--lr-tc-ink) 2%,transparent));
  backdrop-filter: blur(var(--lr-tc-edge-blur)) saturate(1.12);
  -webkit-backdrop-filter: blur(var(--lr-tc-edge-blur)) saturate(1.12);
  mask: linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.lr-pop:not(.is-compact) :is(.lr-pop-body,.lr-chat-assistant,.lr-ask,.lr-followup) {
  filter: none;
  text-shadow: none;
  box-shadow: none;
}
.lr-pop:not(.is-compact) .lr-chat-assistant,
.lr-pop:not(.is-compact) .lr-followup {
  background: transparent;
}
.lr-pop:not(.is-compact) .lr-glass-button {
  background: color-mix(in srgb,var(--lr-tc-surface) 3%,transparent);
  box-shadow: none;
  transition: background .18s ease,opacity .18s ease;
}
.lr-pop:not(.is-compact) .lr-glass-button:hover {
  background: color-mix(in srgb,var(--lr-tc-surface) 6%,transparent);
  box-shadow: none;
  transform: none;
}

/* Extra section/form specificity beats the incumbent module CSS without !important. */
.lr-root section.lr-research-conversation form.lr-ideas-composer,
.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within {
  --lr-tc-surface: var(--gloss-thin-surface,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)));
  --lr-tc-ink: var(--gloss-thin-ink,var(--dsw-alias-label-primary));
  --lr-tc-rim: var(--gloss-thin-rim,var(--dsw-alias-bg-overlay));
  --lr-tc-band: var(--gloss-thin-band,3px);
  position: relative;
  isolation: isolate;
  border-radius: 24px;
  border-color: color-mix(in srgb,var(--lr-tc-rim) 54%,transparent);
  background: color-mix(in srgb,var(--lr-tc-surface) var(--gloss-thin-fill,1.5%),transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 1px 4px var(--gloss-thin-shadow,color-mix(in srgb,var(--lr-tc-ink) 2.5%,transparent));
  transform: none;
  transition: border-color .22s ease,background .22s ease;
}
.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within {
  border-color: color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,var(--lr-tc-rim));
  /* Retain the module's keyboard-only focus ring; no focus elevation. */
}
.lr-root section.lr-research-conversation form.lr-ideas-composer::before {
  content: '';
  display: block;
  position: absolute;
  z-index: -2;
  inset: var(--lr-tc-band);
  height: auto;
  border-radius: inherit;
  background: transparent;
  backdrop-filter: blur(var(--gloss-thin-center-blur,1px)) saturate(1.06);
  -webkit-backdrop-filter: blur(var(--gloss-thin-center-blur,1px)) saturate(1.06);
  pointer-events: none;
}
.lr-root section.lr-research-conversation form.lr-ideas-composer::after {
  content: '';
  position: absolute;
  z-index: -1;
  box-sizing: border-box;
  inset: 0;
  padding: var(--lr-tc-band);
  border-radius: inherit;
  background: radial-gradient(110% 170% at var(--lr-glass-x,50%) 0%,
    color-mix(in srgb,var(--lr-tc-rim) 62%,transparent),transparent 75%);
  backdrop-filter: blur(var(--gloss-thin-edge-blur,8px)) saturate(1.12);
  -webkit-backdrop-filter: blur(var(--gloss-thin-edge-blur,8px)) saturate(1.12);
  mask: linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.lr-root section.lr-research-conversation form.lr-ideas-composer .lr-ideas-conversation-input {
  background: transparent;
  border: 0;
  box-shadow: none;
  filter: none;
  resize: none;
}

@media (prefers-reduced-transparency:reduce),(prefers-contrast:more) {
  .lr-pop:not(.is-compact) > :is(.lr-pop-head,.lr-pop-stage),
  .lr-root section.lr-research-conversation form.lr-ideas-composer,
  .lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within {
    background: var(--lr-shell-ground,var(--dsw-alias-bg-overlay));
    box-shadow: none;
  }
  .lr-pop:not(.is-compact) > :is(.lr-pop-head,.lr-pop-stage)::before,
  .lr-pop:not(.is-compact) > :is(.lr-pop-head,.lr-pop-stage)::after,
  .lr-root section.lr-research-conversation form.lr-ideas-composer::before,
  .lr-root section.lr-research-conversation form.lr-ideas-composer::after {
    display: none;
  }
}
@media (prefers-reduced-motion:reduce) {
  .lr-pop:not(.is-compact),
  .lr-pop:not(.is-compact) .lr-glass-button,
  .lr-root section.lr-research-conversation form.lr-ideas-composer {
    transition: none;
  }
}

/* Append after the selected material patches. Reading exceptions only.
   Circles/book chip keep the thin1px center,3px rim and8px edge blur. */
.lr-root .lr-reader-chrome > .lr-title-pill:not(.is-collapsed) {
  --gloss-thin-fill: 4%;
  --gloss-thin-center-blur: 6px;
  background: color-mix(in srgb, var(--gloss-thin-surface) 4%, transparent);
}
.lr-root .lr-reader-chrome > .lr-title-pill:not(.is-collapsed)::before {
  backdrop-filter: blur(6px) saturate(1.04);
  -webkit-backdrop-filter: blur(6px) saturate(1.04);
}

/* Light translation remains34%/20px. Dark text surfaces need more shielding
   against the white PDF beneath; the floating toolbar remains much clearer. */
.lr-pop[data-surface=dark]:not(.is-compact) > .lr-pop-stage {
  --lr-tc-fill: 72%;
}
.lr-pop[data-surface=dark]:not(.is-compact) > .lr-pop-head {
  --lr-tc-fill: 10%;
}

/* Unsupported composite masks must never turn a rim into a full overlay. */
.lr-pop:not(.is-compact) > :is(.lr-pop-head, .lr-pop-stage)::after,
.lr-root section.lr-research-conversation form.lr-ideas-composer::after {
  display: none;
}
@supports (mask-composite: exclude) or (-webkit-mask-composite: xor) {
  .lr-pop:not(.is-compact) > :is(.lr-pop-head, .lr-pop-stage)::after,
  .lr-root section.lr-research-conversation form.lr-ideas-composer::after {
    display: block;
  }
}

@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .lr-root .lr-reader-chrome > .lr-title-pill:not(.is-collapsed) {
    background: var(--gloss-thin-surface);
  }
  .lr-root .lr-reader-chrome > .lr-title-pill:not(.is-collapsed)::before,
  .lr-pop:not(.is-compact) > :is(.lr-pop-head, .lr-pop-stage)::after,
  .lr-root section.lr-research-conversation form.lr-ideas-composer::after {
    display: none;
  }
}

/* Screenshot feedback polish. Append after readability-fallback.css.
   CSS only; reference-list styling and all interaction/state logic stay owned
   by their existing modules. */

/* Concentric translation well: outer30 - inset8 = stage22.
   Put the reading inset on the measured content, so height/scroll calculations
   include it rather than clipping the last lines inside an absolute scroller. */
.lr-root .lr-pop:not(.is-compact) {
  padding: 8px;
}
.lr-root .lr-pop:not(.is-compact) > .lr-pop-head {
  margin: 0 0 10px;
}
.lr-root .lr-pop:not(.is-compact) > .lr-pop-stage {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 22px;
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-scroll {
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-content {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 17px 18px;
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-body,
.lr-root .lr-pop:not(.is-compact) .lr-answer,
.lr-root .lr-pop:not(.is-compact) .lr-chat-assistant {
  font-size: 14px;
  line-height: 1.8;
  color: var(--dsw-alias-label-primary);
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-body {
  padding: 0;
}
.lr-root .lr-pop:not(.is-compact) .lr-chat-assistant {
  padding: 2px 0;
  max-width: 100%;
}
.lr-root .lr-pop:not(.is-compact) :is(.lr-pop-body, .lr-chat-assistant) :is(p, li) {
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-content pre,
.lr-root .lr-pop:not(.is-compact) .lr-pop-content table {
  max-width: 100%;
  overflow-x: auto;
}
.lr-root .lr-pop:not(.is-compact) .lr-pop-content table {
  display: block;
}

/* A visible selected lens, still the same thin-rim material. The track stays
   clear; only the selected state gains a mild blue center and a readable edge. */
.lr-root .lr-tabs {
  background: color-mix(in srgb, var(--gloss-thin-surface) 5%, transparent);
  border-color: color-mix(in srgb, var(--gloss-thin-ink) 10%, transparent);
}
.lr-root .lr-tabs .lr-tab-lens {
  --gloss-thin-fill: 32%;
  background: color-mix(in srgb,
    color-mix(in srgb, var(--gloss-thin-surface) 76%, var(--gloss-accent, #007aff))
      var(--gloss-thin-fill), transparent);
  border-color: color-mix(in srgb, var(--gloss-accent, #007aff) 22%, var(--gloss-thin-rim));
  box-shadow: var(--gloss-thin-bevel), 0 1px 4px var(--gloss-thin-shadow);
}
.lr-root .lr-tabs .lr-tab[aria-selected=true] {
  color: var(--gloss-accent, #007aff);
  font-weight: 550;
}
.lr-root .lr-card.is-active {
  border: 1px solid color-mix(in srgb, var(--card-line) 68%, var(--gloss-thin-surface));
  background: color-mix(in srgb, var(--card-tint) 34%, var(--gloss-thin-surface));
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* Beat the module's focus-within/:has rules locally. Pointer focus gets a
   gentle lift, while textarea focus-visible receives a deliberate blue ring
   on the whole composer, never the browser's dark inner input rectangle. */
.lr-root section.lr-research-conversation form.lr-ideas-composer {
  outline: none;
  transition: transform .2s cubic-bezier(.2, .8, .2, 1),
    box-shadow .2s ease, border-color .18s ease, background .2s ease;
}
.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within {
  outline: none;
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--gloss-accent, #007aff) 14%, var(--gloss-thin-rim));
  box-shadow: 0 2px 7px color-mix(in srgb, var(--gloss-thin-ink) 3.5%, transparent);
}
.lr-root section.lr-research-conversation form.lr-ideas-composer
  textarea.lr-ideas-conversation-input:focus {
  border: 0;
  outline: none;
  box-shadow: none;
  background-image: none;
  -webkit-appearance: none;
  caret-color: var(--dsw-alias-brand-primary);
}
.lr-root section.lr-research-conversation form.lr-ideas-composer
  textarea.lr-ideas-conversation-input:focus:not(:focus-visible) {
  outline: none;
}
.lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--gloss-accent, #007aff) 62%, transparent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .lr-root section.lr-research-conversation form.lr-ideas-composer {
    transition: none;
  }
  .lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within {
    transform: none;
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .lr-root .lr-tabs .lr-tab-lens {
    background: color-mix(in srgb, var(--gloss-accent, #007aff) 12%, var(--gloss-thin-surface));
  }
  .lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible) {
    outline-color: var(--gloss-accent, #007aff);
  }
}

/* Match the accepted preview: neutral convex glass, no blue selected frame. */
.lr-root .lr-tabs {
  border-radius:999px;
  border-color:color-mix(in srgb,var(--gloss-thin-ink) 8%,transparent);
  background:color-mix(in srgb,var(--gloss-thin-surface) 4%,transparent);
}
.lr-root .lr-tabs .lr-tab-lens {
  --gloss-thin-fill:18%;
  top:-3px;
  height:calc(100% + 6px);
  border-radius:999px;
  border-color:color-mix(in srgb,var(--gloss-thin-rim) 78%,transparent);
  background:color-mix(in srgb,var(--gloss-thin-surface) 18%,transparent);
  box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim) 86%,transparent),
    inset 0 -1px 1px color-mix(in srgb,var(--gloss-thin-ink) 3%,transparent),
    0 2px 7px color-mix(in srgb,var(--gloss-thin-ink) 4%,transparent);
}
.lr-root .lr-tabs .lr-tab {
  gap:6px;
  font-weight:500;
}
.lr-root .lr-tabs .lr-tab svg {width:17px;height:17px;stroke-width:1.8}
.lr-root .lr-tabs .lr-tab .lr-tab-label-full {display:none}
.lr-root .lr-tabs .lr-tab::after {content:attr(data-short-label);display:inline}
@container gloss-reader (max-width:350px) {
  .lr-root .lr-tabs .lr-tab::after {display:none}
}

/* One transparent composer, with concentric rim and no nested input box. */
.lr-root section.lr-research-conversation form.lr-ideas-composer {
  border-radius:24px;
  border-color:color-mix(in srgb,var(--gloss-thin-rim) 68%,transparent);
  background:color-mix(in srgb,var(--gloss-thin-surface) 8%,transparent);
  box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim) 72%,transparent),
    0 2px 7px color-mix(in srgb,var(--gloss-thin-ink) 3.5%,transparent);
}
.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within,
.lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible) {
  outline:none;
  border-color:color-mix(in srgb,var(--gloss-thin-rim) 86%,transparent);
  box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim) 82%,transparent),
    0 4px 12px color-mix(in srgb,var(--gloss-thin-ink) 6%,transparent);
}

/* Menu content receives stronger diffusion; the outer rim stays quiet. */
.lr-root :is(.lr-head-toc .lr-toc-body,.lr-import-options,.lrc-detail) {
  border-radius:24px;
  border-color:color-mix(in srgb,var(--gloss-thin-rim) 58%,transparent);
  background:linear-gradient(150deg,
    color-mix(in srgb,var(--gloss-thin-surface) 42%,transparent),
    color-mix(in srgb,var(--gloss-thin-surface) 32%,transparent));
  backdrop-filter:blur(20px) saturate(1.06);
  -webkit-backdrop-filter:blur(20px) saturate(1.06);
  box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim) 72%,transparent),
    0 3px 12px color-mix(in srgb,var(--gloss-thin-ink) 4%,transparent);
}
.lr-root :is(.lr-head-toc .lr-toc-body,.lr-import-options) {padding:10px}
.lr-root :is(.lr-head-toc .lr-toc-body button,.lr-import-options>.lr-btn) {
  border-radius:14px;
}
@media (prefers-reduced-transparency:reduce),(prefers-contrast:more) {
  .lr-root .lr-tabs .lr-tab-lens,
  .lr-root section.lr-research-conversation form.lr-ideas-composer,
  .lr-root :is(.lr-head-toc .lr-toc-body,.lr-import-options,.lrc-detail) {
    background:var(--gloss-thin-surface);
    backdrop-filter:none;
    -webkit-backdrop-filter:none;
  }
  .lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible) {
    outline:1px solid var(--gloss-thin-ink);
    outline-offset:3px;
  }
}

`

    const CSS = `
.lr-root{display:flex;flex-direction:column;width:100%;height:100%;min-height:480px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.7;overflow:hidden}
.lr-root *{box-sizing:border-box}
.lr-paper-heading{font:inherit;margin:0;min-width:0}
.lr-head{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:16px 22px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}
.lr-btn{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 12px;cursor:pointer;transition:background .12s ease,border-color .12s ease}
.lr-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.lr-btn:disabled{opacity:.5;cursor:not-allowed}
.lr-btn.primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.lr-btn.primary:hover{filter:brightness(1.05)}
.lr-btn.danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.lr-progress{display:flex;align-items:center;gap:10px;padding:8px 22px;font-size:12px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}
.lr-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-brand-primary);display:inline-block;animation:lr-pulse 1.1s ease-in-out infinite}
@keyframes lr-pulse{0%,100%{opacity:.35}50%{opacity:1}}
.lr-banner{margin:10px 22px 0;padding:9px 12px;border-radius:8px;font-size:13px;display:flex;gap:10px;align-items:flex-start;justify-content:space-between}
.lr-banner.error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,transparent)}
.lr-banner button{background:none;border:none;color:inherit;cursor:pointer;font:inherit;opacity:.7}
.lr-body{display:flex;flex:1;min-height:0}
.lr-source{position:relative;flex:none;min-width:260px;max-width:78%;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;min-height:0}
.lr-splitter{flex:none;width:7px;margin:0 -3px;cursor:col-resize;touch-action:none;position:relative;z-index:2;background:transparent}
.lr-splitter::after{content:'';position:absolute;top:0;bottom:0;left:3px;width:1px;background:var(--dsw-alias-border-l1);transition:background .12s ease,width .12s ease}
.lr-splitter:hover::after,.lr-splitter:active::after{width:2px;background:var(--dsw-alias-brand-primary)}
@keyframes lr-shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
.lr-iconbtn{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);background:none;border:1px solid transparent;border-radius:6px;padding:2px 7px;cursor:pointer;line-height:1.4}
.lr-iconbtn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.lr-zoom{font-size:11px;min-width:36px;text-align:center;color:var(--dsw-alias-label-secondary)}
.lr-source-body{position:relative;flex:1;overflow:auto;padding:12px 14px 60px;min-height:0}
.lr-source-body.is-pdf{padding:12px 8px 60px;background:var(--dsw-alias-bg-layer-2)}
.lr-pdf{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px}
.lr-page{position:relative;isolation:isolate;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.22);border-radius:2px;overflow:hidden;flex:none}
.lr-page-canvas{display:block;position:relative;z-index:0;width:100%;height:100%}
.lr-textlayer{position:absolute;inset:0;overflow:hidden;text-align:initial;line-height:1;letter-spacing:normal;word-spacing:normal;font-weight:normal;font-style:normal;font-variant:normal;text-shadow:none;text-size-adjust:none;forced-color-adjust:none;transform-origin:0 0;z-index:2;user-select:text;-webkit-user-select:text}
.lr-textlayer :is(span,br){color:transparent;-webkit-text-fill-color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0% 0%;text-shadow:none}
.lr-textlayer span.markedContent{top:0;height:0}
.lr-textlayer[data-main-rotation="90"]{transform:rotate(90deg) translateY(-100%)}
.lr-textlayer[data-main-rotation="180"]{transform:rotate(180deg) translate(-100%,-100%)}
.lr-textlayer[data-main-rotation="270"]{transform:rotate(270deg) translateX(-100%)}
.lr-textlayer::selection,.lr-textlayer *::selection{background:transparent;color:transparent;text-shadow:none}
.lr-pdf{position:relative}
.lr-selrect-layer{position:absolute;inset:0;pointer-events:none;z-index:5}
.lr-tag-layer{position:absolute;inset:0;pointer-events:none;z-index:4}
.lr-selhl-layer{position:absolute;inset:0;pointer-events:none;z-index:1;mix-blend-mode:multiply}
.lr-selhl{position:absolute;background:rgb(255 215 70 / .34);border-radius:2px;pointer-events:none}
.lr-accent{position:absolute;width:5px;border-radius:3px;pointer-events:none;opacity:1;box-shadow:0 0 0 1px rgba(255,255,255,.5)}
.lr-accent.is-focus{width:6px;border-radius:3px;background:rgba(230,160,20,.95)}
.lr-tag-wrap{position:absolute;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-start;pointer-events:auto;z-index:6}
.lr-tag-wrap.is-right{transform:translate(-100%,-50%)}
.lr-tag-wrap::after{content:'';margin-left:7px;width:1px;height:8px;border-radius:1px;background:linear-gradient(var(--tag-line,#8db8d6),transparent);pointer-events:none}
.lr-tag-wrap.is-right::after{align-self:flex-end;margin-right:7px}
.lr-tag{
  --tag-fill:color-mix(in srgb,var(--tag-tint,rgba(215,235,251,.96)) 74%,transparent);
  --tag-rim:color-mix(in srgb,var(--tag-line,#8db8d6) 58%,transparent);
  --tag-sheen:rgb(255 255 255 / .72);
  --tag-shadow:rgb(24 31 46 / .09);
  --tag-text:color-mix(in srgb,var(--tag-ink,#2b5f86) 72%,#181b23);
  position:relative;min-height:22px;padding:4px 14px 4px 8px;
  font:inherit;font-size:10.5px;font-weight:650;line-height:1.1;white-space:nowrap;cursor:pointer;
  color:var(--tag-text);border:1px solid var(--tag-rim);border-radius:999px;
  background:var(--tag-tint,rgba(215,235,251,.96));
  background:linear-gradient(165deg,var(--tag-sheen),transparent 68%),var(--tag-fill);
  backdrop-filter:blur(8px) saturate(1.28);-webkit-backdrop-filter:blur(8px) saturate(1.28);
  box-shadow:inset 0 .7px 0 var(--tag-sheen),0 1px 4px var(--tag-shadow);
  transition:background-color .16s ease,box-shadow .16s ease;
}
.lr-tag::after{content:'';position:absolute;top:50%;right:5px;width:4px;height:4px;border:solid currentColor;border-width:1px 1px 0 0;border-radius:0 1px 0 0;opacity:.65;transform:translateY(-50%) rotate(45deg);pointer-events:none}
.lr-tag-wrap.is-right .lr-tag{padding-right:8px;padding-left:14px}
.lr-tag-wrap.is-right .lr-tag::after{right:auto;left:5px;transform:translateY(-50%) rotate(-135deg)}
.lr-tag:is(:hover,.is-active){background-color:color-mix(in srgb,var(--tag-fill) 88%,var(--tag-line,#8db8d6));box-shadow:inset 0 1px 0 var(--tag-sheen),0 2px 6px var(--tag-shadow)}
.lr-tag.is-active{text-decoration:underline;text-underline-offset:2px}
.lr-root .lr-tag:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.lr-pdf[data-pdf-appearance="dark"] .lr-tag{
  --tag-fill:color-mix(in srgb,var(--tag-line,#8db8d6) 28%,rgb(32 36 46 / .76));
  --tag-sheen:rgb(255 255 255 / .24);
  --tag-shadow:rgb(0 0 0 / .22);
  --tag-text:color-mix(in srgb,var(--tag-tint,rgba(215,235,251,.96)) 82%,white);
}
@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){
  .lr-tag,.lr-tag:is(:hover,.is-active){background:var(--tag-tint,rgba(215,235,251,.96));backdrop-filter:none;-webkit-backdrop-filter:none}
  .lr-pdf[data-pdf-appearance="dark"] .lr-tag{background:color-mix(in srgb,var(--tag-line,#8db8d6) 20%,#20242e)}
}
.lr-src-p{font-size:13px;line-height:1.75;color:var(--dsw-alias-label-secondary);margin:0 0 12px;padding:2px 4px;border-radius:4px;transition:background .2s ease,color .2s ease}
.lr-src-p.is-flash{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);color:var(--dsw-alias-label-primary)}
.lr-notes{flex:1;min-width:0;display:flex;flex-direction:column}
.lr-tabs{display:flex;gap:2px;padding:8px 18px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.lr-tab{font:inherit;font-size:13px;color:var(--dsw-alias-label-secondary);background:none;border:none;border-bottom:2px solid transparent;padding:8px 12px;cursor:pointer;border-radius:6px 6px 0 0}
.lr-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}
.lr-tab.is-active{color:var(--dsw-alias-brand-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}
.lr-content{flex:1;overflow:auto;padding:18px 26px 80px;min-height:0}
.lr-toc-body{margin-top:6px;max-height:58vh;overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.18);padding:6px;display:flex;flex-direction:column;gap:1px}
.lr-toc-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;font:inherit;font-size:11.5px;color:var(--dsw-alias-label-primary);background:none;border:none;border-radius:6px;padding:3px 8px;cursor:pointer}
.lr-toc-row:hover{background:var(--dsw-alias-bg-layer-2)}
.lr-toc-row.is-active{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.lr-toc-row.lv2{padding-left:18px}
.lr-toc-row.lv3{padding-left:30px}
.lr-toc-row.lv4{padding-left:42px}
.lr-toc-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lr-toc-page{font-size:10px;color:var(--dsw-alias-label-secondary);flex:none}
.lr-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.lr-panel-title{font-size:12px;color:var(--dsw-alias-label-secondary);letter-spacing:.02em}

.lr-tablewrap{overflow:auto;margin:10px 0}
.lr-empty{flex:1;display:flex;align-items:center;justify-content:center;padding:28px;overflow:auto}
.lr-empty-mark{display:flex;justify-content:center;color:var(--dsw-alias-brand-primary);margin-bottom:10px}
.lr-empty h2{font-size:19px;margin:6px 0 8px}
.lr-empty p{margin:6px 0;color:var(--dsw-alias-label-secondary);font-size:13px}
.lr-empty-actions{display:flex;gap:10px;justify-content:center;margin:18px 0 6px;flex-wrap:wrap}
.lr-placeholder{padding:26px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:13px}
.lr-placeholder .lr-btn{margin-top:12px}
.lr-thinking{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:13px;padding:10px 2px}
.lr-root button:focus-visible,.lr-document-select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
.lr-evidence-layer{position:absolute;inset:0;pointer-events:none;z-index:1;mix-blend-mode:multiply}
.lr-evidence{position:absolute;border-radius:2px;pointer-events:none}
.lr-src-p mark{color:var(--dsw-alias-label-primary);border-radius:2px;padding:1px 0}
.lr-accent{width:2px;box-shadow:none;border-radius:1px}
.lr-cards{display:flex;flex-direction:column;gap:0}
.lr-card{display:block;position:relative;text-align:left;width:100%;font:inherit;background:transparent;color:var(--dsw-alias-label-primary);border:0;border-bottom:1px solid var(--dsw-alias-border-l1);border-radius:0;padding:17px 12px;cursor:pointer;transition:background .18s ease}
.lr-card:first-child{padding-top:12px}
.lr-card:hover{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}
.lr-card.is-active{background:color-mix(in srgb,var(--card-tint) 42%,var(--dsw-alias-bg-base));border-color:var(--dsw-alias-border-l1)}
.lr-card-main{display:flex;flex-direction:column;gap:7px;min-width:0}
.lr-card-tagrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.lr-card-tag{
  --card-tag-fill:color-mix(in srgb,var(--card-line) 25%,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)));
  --card-tag-sheen:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)) 70%,white);
  display:inline-flex;align-items:center;align-self:flex-start;padding:2px 9px;white-space:nowrap;
  font-size:11px;font-weight:650;line-height:16px;
  color:color-mix(in srgb,var(--card-ink) 18%,var(--lr-shell-ink,var(--dsw-alias-label-primary,#20242e)));
  background:var(--card-tag-fill);
  background:linear-gradient(160deg,var(--card-tag-sheen),transparent 73%),color-mix(in srgb,var(--card-tag-fill) 81%,transparent);
  border:1px solid color-mix(in srgb,var(--card-line) 45%,transparent);border-radius:999px;
  backdrop-filter:blur(8px) saturate(1.24);-webkit-backdrop-filter:blur(8px) saturate(1.24);
  box-shadow:inset 0 .7px 0 var(--card-tag-sheen),0 1px 3px rgb(24 31 46 / .07);
}
@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){
  .lr-card-tag{background:var(--card-tag-fill);backdrop-filter:none;-webkit-backdrop-filter:none}
}
.lr-card-page{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.lr-card-quote{font-size:13.5px;color:var(--dsw-alias-label-primary);line-height:1.7;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.lr-card.is-active .lr-card-quote{-webkit-line-clamp:unset}
.lr-card-comment{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.7}
.lr-panel-title{font-size:14px;font-weight:650;color:var(--dsw-alias-label-primary);letter-spacing:0}
.lr-pop-anchor{position:absolute;z-index:7;width:min(360px,calc(100% - 12px))}
.lr-pop-anchor.is-above{transform:none}
.lr-pop-anchor.is-morphing{transition:left .32s cubic-bezier(.22,.8,.3,1),top .32s cubic-bezier(.22,.8,.3,1),width .32s cubic-bezier(.22,.8,.3,1)}
.lr-pop-anchor.is-compact::after{display:none}
.lr-pop-anchor::after{content:'';position:absolute;top:-5px;left:var(--lr-tip-x,28px);width:12px;height:12px;background:var(--dsw-alias-bg-overlay);transform:translateX(-50%) rotate(45deg);pointer-events:none}
.lr-pop-anchor.is-above::after{top:auto;bottom:-5px}
.lr-pop-anchor.is-detached::after,.lr-pop-anchor.is-cursor-attached::after{display:none}
.lr-pop-anchor::after{opacity:.08;transition:opacity .28s cubic-bezier(.16,1,.3,1)}
.lr-pop-anchor:has(.lr-pop:hover,.is-hovered,.has-focus,.is-preview)::after{opacity:1}
.lr-pop{position:relative;width:100%;max-height:min(66vh,580px);display:flex;flex-direction:column;overflow:hidden;overscroll-behavior:contain;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 8%,transparent);color:var(--dsw-alias-label-primary);border:1px solid transparent;border-radius:20px;box-shadow:0 3px 16px rgba(12,18,26,0);backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);padding:9px 10px;font-size:13px;line-height:1.65;transition:background .28s cubic-bezier(.16,1,.3,1),border-color .28s ease,box-shadow .28s ease,backdrop-filter .28s ease,padding .32s cubic-bezier(.22,.8,.3,1),max-height .32s cubic-bezier(.22,.8,.3,1),border-radius .32s ease}
.lr-pop-head{display:flex;flex:none;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;opacity:1;transition:background .2s ease}
.lr-pop-stage{position:relative;flex:0 1 auto;min-height:0;width:calc(var(--lr-card-width,360px) - 22px);transition:height .28s cubic-bezier(.16,1,.3,1);overflow:hidden}
.lr-pop-scroll{position:absolute;inset:0;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.lr-pop-content{opacity:.035;transition:opacity .28s cubic-bezier(.16,1,.3,1),transform .24s cubic-bezier(.16,1,.3,1)}
.lr-pop-content.is-covered{opacity:0!important;transform:translateY(-4px);pointer-events:none}
.lr-pop-content p{margin:0 0 8px;line-height:1.72;overflow-wrap:anywhere}
.lr-pop-content p:last-child{margin-bottom:0}
.lr-pop-content ul,.lr-pop-content ol{padding-left:20px;margin:5px 0}
.lr-pop.is-docked{position:fixed;right:24px;top:100px;width:min(360px,calc(100vw - 32px));max-height:calc(100vh - 150px);z-index:70}
.lr-pop-body{font-size:13px;font-weight:400;padding:3px 2px 5px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 92%,var(--dsw-alias-bg-overlay))}
.lr-pop-error{color:var(--dsw-alias-state-error-primary);font-size:12.5px;padding:6px 0}
.lr-translation-region{display:grid;grid-template-rows:1fr;transition:grid-template-rows .24s cubic-bezier(.16,1,.3,1)}
.lr-translation-region.is-folded{grid-template-rows:0fr;visibility:hidden}
.lr-translation-inner{min-height:0;overflow:hidden}
.lr-translation-summary{width:100%;display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:5px 0 8px;font:inherit;font-size:11.5px;color:var(--dsw-alias-label-secondary);cursor:pointer;text-align:left}
.lr-summary-kind{font-weight:600;flex:none}
.lr-summary-text{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.lr-fold-control{margin:4px 0 6px}
.lr-answer{margin-top:5px;padding:10px 0 3px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 55%,transparent);font-size:13px;animation:lr-answer-enter .25s cubic-bezier(.16,1,.3,1)}
.lr-chat-turn{display:flex;flex-direction:column;gap:9px;padding:0 0 15px}
.lr-chat-turn:last-child{padding-bottom:3px}
.lr-chat-message{max-width:94%;overflow-wrap:anywhere}
.lr-chat-user{align-self:flex-end;max-width:86%;padding:7px 11px;border-radius:14px 14px 4px 14px;background:var(--lr-chat-accent,#006fdd);color:#fff;font-size:12.5px;line-height:1.6;box-shadow:inset 0 1px 0 rgb(255 255 255 / .16)}
.lr-chat-assistant{align-self:flex-start;padding:7px 8px;border-radius:4px 14px 14px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 12%,transparent);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.72}
.lr-chat-assistant p:last-child{margin-bottom:0}
.lr-answer-question{margin:0;overflow-wrap:anywhere}
.lr-followup{position:absolute;z-index:1;bottom:0;left:0;right:0;height:42px;display:flex;align-items:center;gap:6px;padding:5px 3px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 10%,transparent)}
.lr-pop.has-answer .lr-pop-scroll{bottom:44px}
.lr-pop.is-asking .lr-followup{opacity:0;visibility:hidden;pointer-events:none}
.lr-chat-context-note{color:var(--dsw-alias-label-secondary)}
.lr-followup-input{flex:1;min-width:0;background:transparent;border:0;outline:none;font:inherit;font-size:12.5px;padding:6px 2px;color:var(--dsw-alias-label-primary);caret-color:var(--dsw-alias-brand-primary)}
.lr-followup-input::placeholder{color:var(--dsw-alias-label-secondary)}
.lr-reply-waiting{display:inline-flex;align-items:center;justify-content:center;flex:none;vertical-align:middle;min-width:56px;min-height:28px;margin:3px 0;padding:8px 12px;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,var(--lr-shell-ground,var(--dsw-alias-bg-base,var(--dsw-alias-bg-overlay))));color:var(--dsw-alias-label-secondary);line-height:1}
.lr-reply-waiting-dots{display:inline-flex;align-items:center;gap:5px;pointer-events:none}.lr-reply-waiting-dot{display:block;width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.5;animation:lr-reply-pulse 1.1s ease-in-out infinite}.lr-reply-waiting-dot:nth-child(2){animation-delay:.13s}.lr-reply-waiting-dot:nth-child(3){animation-delay:.26s}
.lr-pop.is-compact .lr-reply-waiting-dot,.lr-pop-scroll[aria-hidden=true] .lr-reply-waiting-dot{animation-play-state:paused}
@keyframes lr-reply-pulse{0%,72%,100%{opacity:.4;transform:translateY(0)}36%{opacity:.85;transform:translateY(-2px)}}
@media(prefers-reduced-motion:reduce){.lr-reply-waiting-dot{animation:none;opacity:.55;transform:none}}
.lr-ask-btn{font:inherit;font-size:12px;border:0;border-radius:999px;min-height:28px;padding:4px 12px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary);cursor:pointer;white-space:nowrap}
.lr-ask-btn:disabled{opacity:.4;cursor:default}
.lr-pop{--lr-glass-density:12%;--lr-glass-light:rgb(255 255 255 / .52)}
.lr-pop[data-surface=dark]{--lr-glass-density:62%;--lr-glass-light:rgb(255 255 255 / .19)}
.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview){background:color-mix(in srgb,var(--dsw-alias-bg-overlay) var(--lr-glass-density),transparent);border-color:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);border-radius:22px;box-shadow:inset 0 1px 0 var(--lr-glass-light),inset 0 -1px 0 rgb(0 0 0 / .025),0 7px 22px rgb(15 21 30 / .09);backdrop-filter:blur(18px) saturate(1.1);-webkit-backdrop-filter:blur(18px) saturate(1.1)}
.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview) .lr-pop-head,.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview) .lr-pop-content{opacity:1}
.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview).is-generating .lr-pop-content{opacity:.78}
.lr-pop.is-entering{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 8%,transparent)!important;box-shadow:none!important;backdrop-filter:blur(0)!important}
.lr-pop.is-entering .lr-pop-content{opacity:.035!important}
.lr-pop::before{content:'';position:absolute;inset:0;border:1px solid var(--dsw-alias-border-l2);border-radius:inherit;pointer-events:none;opacity:0}
.lr-pop.is-loading::before{animation:lr-frame-grow .65s cubic-bezier(.16,1,.3,1) both}
@keyframes lr-frame-grow{0%{opacity:0;clip-path:inset(0 0 100% 0 round 14px)}15%{opacity:.9}75%{opacity:.7;clip-path:inset(0 round 14px)}100%{opacity:0;clip-path:inset(0 round 14px)}}
@keyframes lr-answer-enter{from{opacity:.35;clip-path:inset(0 0 35% 0)}to{opacity:1;clip-path:inset(0)}}
@media (hover:none){.lr-pop{background:var(--dsw-alias-bg-overlay)}.lr-pop-content,.lr-pop-head,.lr-pop .lr-ask{opacity:1}}
@media (prefers-reduced-motion:reduce){.lr-pop,.lr-pop *,.lr-pop::before,.lr-pop-anchor,.lr-pop-anchor::after,.lr-card,.lr-tag{animation:none!important;transition:none!important}}
@media (max-width:900px){.lr-content{padding:16px 14px 60px}.lr-tabs{padding-left:8px;overflow:auto;flex:none}.lr-tab{white-space:nowrap;padding:8px}.lr-head{padding:12px 16px;gap:8px}}
@media (max-width:660px){.lr-body{flex-direction:column}.lr-source{width:100%!important;max-width:100%;height:54%;min-height:200px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1)}.lr-splitter{display:none}.lr-notes{min-height:150px}.lr-pop.is-docked{right:12px;top:90px}}

.lr-coordinate-layer{position:absolute;inset:0;pointer-events:none;z-index:3}
.lr-coordinate-focus{position:absolute;border:1px solid var(--dsw-alias-brand-primary);border-radius:2px;pointer-events:none}
.lr-annotation-layer{position:absolute;inset:0;pointer-events:none;z-index:1;mix-blend-mode:multiply}
.lr-annotation{position:absolute;border-radius:2px;pointer-events:none}
.lr-pop-head{position:relative;z-index:2;gap:6px;padding:4px 5px;min-height:36px;flex-wrap:nowrap;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 16%,transparent);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 1px 0 rgb(255 255 255 / .30);user-select:none;-webkit-user-select:none;opacity:1!important;transition:padding .32s ease,min-height .32s ease,margin .32s ease}
.lr-glass-actions,.lr-glass-palette{display:flex;align-items:center;gap:4px;transition:opacity .12s ease}
.lr-glass-orb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3;border:0;border-radius:inherit;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease}
.lr-glass-orb svg{width:clamp(10px,calc(var(--lr-orb-size,36px) - 18px),16px);height:clamp(10px,calc(var(--lr-orb-size,36px) - 18px),16px);opacity:.8}
.lr-glass-orb:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-3px}
.lr-pop.is-compact{padding:0;border-color:transparent;border-radius:50%;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none;overflow:visible}
.lr-pop.is-compact .lr-pop-head{width:100%;min-height:var(--lr-orb-size,36px);height:var(--lr-orb-size,36px);padding:0;margin:0;flex:none;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 16%,transparent);backdrop-filter:blur(14px) saturate(1.12);-webkit-backdrop-filter:blur(14px) saturate(1.12);box-shadow:inset 0 1px 0 rgb(255 255 255 / .66),inset 0 -1px 0 rgb(0 0 0 / .035),0 3px 10px rgb(15 21 30 / .10)}
.lr-pop.is-compact .lr-glass-actions,.lr-pop.is-compact .lr-glass-palette{opacity:0;visibility:hidden;pointer-events:none}
.lr-pop.is-compact .lr-glass-orb{opacity:1;visibility:visible;pointer-events:auto}
.lr-pop.is-compact .lr-pop-scroll{height:0!important;pointer-events:none;visibility:hidden}
.lr-pop.is-compact .lr-pop-stage{height:0!important;pointer-events:none;visibility:hidden}
.lr-glass-palette{margin-left:auto;gap:2px}
.lr-glass-palette>.lr-ask-toggle{width:28px;min-width:28px;max-width:28px;height:28px;flex:0 0 28px}.lr-glass-palette>.lr-ask-toggle.is-placeholder{visibility:hidden;pointer-events:none;opacity:0}
.lr-glass-button{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:50%;font:inherit;background:color-mix(in srgb,var(--dsw-alias-bg-base) 20%,transparent);color:var(--dsw-alias-label-primary);cursor:pointer;transition:background .16s ease,color .16s ease}
.lr-glass-button:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base) 78%,transparent)}
.lr-glass-button[aria-pressed=true]{color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent)}
.lr-glass-button:active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 20%,transparent)}
.lr-glass-button:disabled{opacity:.35;cursor:default}
.lr-glass-button:focus-visible,.lr-color-swatch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.lr-color-swatch{position:relative;display:flex;align-items:center;justify-content:center;flex:none;width:20px;height:26px;padding:0;border:0;border-radius:5px;background:transparent;color:#23262d;cursor:pointer;transition:box-shadow .16s ease,filter .16s ease}
.lr-color-swatch::before{content:'';position:absolute;width:14px;height:16px;border:1px solid rgb(0 0 0 / .13);border-radius:4px;background:var(--swatch)}
.lr-color-swatch:hover{filter:brightness(1.08)}
.lr-color-swatch.is-active{outline:1px solid var(--dsw-alias-label-primary);outline-offset:2px}
.lr-color-swatch svg{position:relative;z-index:1;width:12px;height:12px;stroke-width:2.5}
@media (prefers-reduced-transparency:reduce){.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview),.lr-pop-head,.lr-pop.is-compact .lr-pop-head{background:var(--dsw-alias-bg-overlay);backdrop-filter:none;-webkit-backdrop-filter:none}}
@media (prefers-contrast:more){.lr-pop:is(:hover,.is-hovered,.has-focus,.is-preview),.lr-pop-head,.lr-pop.is-compact .lr-pop-head{background:var(--dsw-alias-bg-overlay);outline:1px solid var(--dsw-alias-label-primary)}}

`

    const SHELL_CSS = `
/* Reader shell only. Append after the existing reader and feature styles.
   Desktop frame arithmetic: source's user width + 1px effective splitter +
   flexible notes = the root width. Notes keep >=320px; no source geometry rules.
   Narrow: 58/42 vertical.
   The floating translation toolbar keeps the user's Liquid Glass treatment. */
.lr-root{
  --lr-shell-ground:var(--dsw-alias-bg-base,#ffffff);
  --lr-shell-ink:var(--dsw-alias-label-primary,#25262a);
  --lr-shell-muted:var(--dsw-alias-label-secondary,#666870);
  --lr-shell-raised:color-mix(in srgb,var(--lr-shell-ink) 4%,var(--lr-shell-ground));
  --lr-shell-well:color-mix(in srgb,var(--lr-shell-ink) 7%,var(--lr-shell-ground));
  --lr-shell-rule:color-mix(in srgb,var(--lr-shell-ink) 9%,var(--lr-shell-ground));
  --lr-shell-control:color-mix(in srgb,var(--lr-shell-ink) 17%,var(--lr-shell-ground));
  --lr-shell-active:color-mix(in srgb,var(--lr-shell-ink) 7%,var(--lr-shell-ground));
  --lr-shell-focus:var(--dsw-alias-brand-primary,#4269c5);
  min-height:0;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",sans-serif;
  font-size:14px;
  line-height:1.65;
  background:var(--lr-shell-ground);
  color:var(--lr-shell-ink);
}
.lr-head{
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:nowrap;
  gap:16px;
  min-height:76px;
  padding:12px 20px;
  border:0;
  background:var(--lr-shell-ground);
}
.lr-btn{
  min-height:30px;
  padding:4px 10px;
  font-size:12px;
  line-height:20px;
  font-weight:450;
  border:1px solid transparent;
  border-radius:6px;
  color:var(--lr-shell-ink);
  background:var(--lr-shell-raised);
  box-shadow:none;
  transition:background .16s ease,border-color .16s ease,color .16s ease;
}
.lr-btn:hover{background:var(--lr-shell-active);border-color:var(--lr-shell-control)}
.lr-btn:disabled{opacity:.55;cursor:default}
.lr-btn.primary{background:var(--lr-shell-ink);border-color:transparent;color:var(--lr-shell-ground);font-weight:550}
.lr-btn.primary:hover{background:color-mix(in srgb,var(--lr-shell-ink) 88%,var(--lr-shell-ground));filter:none}
.lr-btn.danger{background:transparent;border-color:transparent}
.lr-body{min-width:0;min-height:0;gap:0}
.lr-source{min-width:280px;max-width:calc(100% - 332px);border-right:0;background:var(--lr-shell-well)}
.lr-zoom{font-size:11.5px;color:var(--lr-shell-muted);font-variant-numeric:tabular-nums;min-width:38px}
.lr-source-body.is-pdf{background:var(--lr-shell-well)}
.lr-source-body:not(.is-pdf){padding:18px 22px 56px;background:var(--lr-shell-ground)}
.lr-src-p{font-size:14px;line-height:1.85;color:var(--lr-shell-ink);margin-bottom:16px}
.lr-splitter::after{background:var(--lr-shell-rule)}
.lr-splitter:hover::after,.lr-splitter:active::after{background:var(--lr-shell-control)}
.lr-notes{min-width:320px;background:var(--lr-shell-ground)}
.lr-tabs{flex:none;min-height:48px;display:flex;align-items:stretch;gap:2px;padding:0 14px;overflow-x:auto;overflow-y:hidden;border-bottom:1px solid var(--lr-shell-rule);scrollbar-width:thin;scrollbar-color:var(--lr-shell-control) transparent}
.lr-tab{flex:none;min-height:47px;padding:12px 9px 10px;border-radius:0;border-bottom:2px solid transparent;color:var(--lr-shell-muted);font-size:12.5px;font-weight:450;line-height:22px;white-space:nowrap}
.lr-tab:hover{color:var(--lr-shell-ink);background:var(--lr-shell-raised)}
.lr-tab.is-active{color:var(--lr-shell-ink);border-bottom-color:var(--lr-shell-ink);font-weight:600;background:transparent}
.lr-tabs>.lr-btn{align-self:center;min-height:28px}
.lr-content{min-width:0;min-height:0;padding:18px 22px 56px;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:var(--lr-shell-control) transparent;overscroll-behavior:contain}
.lr-panel-head{margin-bottom:10px;min-height:30px;align-items:center;gap:12px}
.lr-panel-title{font-size:14px;line-height:22px;letter-spacing:0;font-weight:600;color:var(--lr-shell-ink)}
.lr-cards{gap:0}
.lr-card{padding:17px 10px;border:0;border-bottom:1px solid var(--lr-shell-rule);border-radius:0;background:transparent;box-shadow:none}
.lr-card:first-child{padding-top:12px}
.lr-card:hover{background:var(--lr-shell-raised);border-color:var(--lr-shell-rule)}
.lr-card.is-active{background:color-mix(in srgb,var(--card-tint) 45%,var(--lr-shell-ground));border-color:var(--lr-shell-rule)}
.lr-card-main{gap:8px}
.lr-card-tagrow{gap:12px}
.lr-card-page{font-size:11.5px;color:var(--lr-shell-muted);font-variant-numeric:tabular-nums}
.lr-card-quote{font-size:14px;line-height:1.75;-webkit-line-clamp:4}
.lr-card-comment{font-size:12.5px;line-height:1.75;color:var(--lr-shell-muted)}
.lr-placeholder{padding:19px 18px;border:0;border-radius:8px;background:var(--lr-shell-raised);color:var(--lr-shell-muted);font-size:13px;line-height:1.8}
.lr-placeholder .lr-btn{margin-top:14px}
.lr-thinking{font-size:12.5px;min-height:32px;gap:8px;color:var(--lr-shell-muted)}
.lr-banner{margin:8px 20px 0;padding:8px 11px;font-size:12.5px;line-height:1.65;border-radius:6px}
.lr-banner.error{border:0}
.lr-notice-layer {
  position: relative;
  z-index: 112;
  flex: 0 0 0;
  min-height: 0;
  pointer-events: none;
}
.lr-notice-toast {
  position: absolute;
  inset-block-start: 14px;
  inset-inline-end: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  inline-size: max-content;
  max-inline-size: min(310px, calc(100% - 28px));
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--gloss-thin-rim, var(--lr-shell-ground)) 72%, transparent);
  border-radius: 17px;
  background: color-mix(in srgb, var(--lr-shell-ground) 87%, transparent);
  -webkit-backdrop-filter: blur(14px) saturate(1.15);
  backdrop-filter: blur(14px) saturate(1.15);
  box-shadow: var(--gloss-thin-bevel, inset 0 1px 0 rgba(255, 255, 255, .52)),
    0 4px 16px color-mix(in srgb, var(--lr-shell-ink) 12%, transparent);
  color: var(--lr-shell-ink);
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
  animation: lr-notice-appear 210ms cubic-bezier(.22,.72,.31,1) both,
    lr-notice-leave 150ms ease-in calc(var(--lr-notice-time) - 150ms) forwards;
}
.lr-notice-toast > svg { flex: none; color: var(--lr-shell-muted); }
@keyframes lr-notice-appear {
  from { opacity: 0; transform: translateY(-5px) scale(.985); }
  to { opacity: 1; transform: none; }
}
@keyframes lr-notice-leave { to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .lr-notice-toast { animation: none; } }
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .lr-notice-toast { background: var(--lr-shell-ground); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
.lr-progress{flex:none;min-height:32px;padding:6px 20px;background:var(--lr-shell-raised);border:0;font-size:12px;line-height:20px}
.lr-empty-mark{justify-content:flex-start;color:var(--lr-shell-muted)}
.lr-empty h2{font-size:22px;line-height:1.45;font-weight:600;letter-spacing:-.01em;margin:14px 0 12px}
.lr-empty p{font-size:14px;line-height:1.85;color:var(--lr-shell-muted)}
.lr-empty-actions{justify-content:flex-start;margin:22px 0 8px;gap:8px}
/* P2/P3 share the same reading rail, not a second visual kit. */
.lr-root .lr-ideas input,.lr-root .lr-ideas textarea{border-radius:6px;border-color:var(--lr-shell-control);background:var(--lr-shell-ground);font-size:13px;line-height:1.75}
@media(min-width:1051px){
  
}
@media(min-width:721px) and (max-width:1050px){
  .lr-head{min-height:96px;display:grid;grid-template-columns:minmax(0,1fr);gap:7px;padding:10px 16px}
  
  
  
  .lr-source{min-width:0}
  .lr-notes{min-width:0}
  .lr-tabs{padding:0 10px}
  .lr-content{padding:16px 18px 44px}
  
  
}
@media(max-width:720px){
  .lr-head{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-height:0;padding:10px 12px}
  
  
  
  
  
  
  
  .lr-body{flex-direction:column}
  .lr-source{width:100%!important;max-width:100%;min-width:0;min-height:180px;height:58%;border:0}
  
  .lr-source-body:not(.is-pdf){padding:16px 16px 44px}
  .lr-splitter{display:none}
  .lr-notes{min-width:0;min-height:160px;border-top:1px solid var(--lr-shell-rule)}
  .lr-tabs{min-height:44px;padding:0 8px;gap:1px}
  .lr-tab{min-height:43px;padding:10px 9px 9px;font-size:12.5px;line-height:22px}
  
  
  .lr-content{padding:15px 16px 40px}
  .lr-card{padding:15px 6px}
  .lr-card-tagrow{gap:8px}
  .lr-card-quote{font-size:13.5px;line-height:1.75}
  .lr-card-comment{font-size:12.5px}
  .lr-card-page{font-size:11px}
  .lr-panel-head{gap:8px}
  .lr-banner{margin:6px 12px 0}
  .lr-progress{padding:5px 12px;min-height:30px}
  .lr-empty{padding:18px}
  
  .lr-empty h2{font-size:20px}
  
  
  
  
  
}
@media(max-width:420px){
  
  
  
  
  
  .lr-zoom{min-width:34px}
}
@media(pointer:coarse){
  .lr-head-actions>.lr-btn,.lr-head-actions>.lr-document-select,.lr-tab,.lr-stab,.lr-source-tools>.lr-iconbtn{min-height:44px}
  
}
@media(prefers-reduced-motion:reduce){
  .lr-btn,.lr-tab,.lr-stab{transition:none}
}

/* Compact PDF-only controls, in the document header. */
.lr-reader-controls{display:flex;align-items:center;gap:2px;padding:2px 4px;background:var(--lr-shell-raised);border-radius:10px;flex:none}
.lr-reader-button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:30px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--lr-shell-muted);cursor:pointer;flex:none}
.lr-reader-button:hover,.lr-reader-button.is-active{background:var(--lr-shell-active);color:var(--lr-shell-ink)}
.lr-reader-button:focus-visible{outline:2px solid var(--lr-shell-focus);outline-offset:2px}
.lr-reader-button:disabled{opacity:.4;cursor:default}
.lr-head-toc{position:relative}
.lr-head-toc .lr-toc-body{position:absolute;top:calc(100% + 8px);right:0;z-index:30;width:275px;max-height:60vh;background:var(--dsw-alias-bg-overlay);box-shadow:0 10px 28px rgb(0 0 0 / .14);border:0;border-radius:12px;padding:8px}
.lr-pop-head::after{content:'';position:absolute;inset:0;z-index:1;border-radius:inherit;pointer-events:none}
.lr-glass-actions,.lr-glass-palette{position:relative;z-index:2}
@media(max-width:1050px){}
@media(max-width:720px){.lr-head-toc .lr-toc-body{left:0;right:auto}.lr-source{height:60%}}

/* One continuous navigation material; document content stays quiet beneath it. */
.lr-head{min-height:60px;padding:10px 18px;gap:20px;border-bottom:1px solid var(--lr-shell-rule)}
.lr-paper-heading{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:600;line-height:1.5;letter-spacing:-.015em;color:var(--lr-shell-ink)}
.lr-reader-controls{border-radius:20px;background:color-mix(in srgb,var(--lr-shell-raised) 75%,transparent);padding:2px 5px}
.lr-reader-button{border-radius:50%;width:29px;height:29px}
.lr-tabs-wrap{flex:none;padding:12px 16px 10px;background:var(--lr-shell-ground);z-index:3}
.lr-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--lr-tab-count,4),minmax(0,1fr));align-items:center;gap:0;min-height:44px;padding:4px;overflow:visible;border:1px solid color-mix(in srgb,var(--lr-shell-control) 50%,transparent);border-radius:26px;background:color-mix(in srgb,var(--lr-shell-raised) 76%,transparent);box-shadow:inset 0 1px 1px rgb(255 255 255 / .38),0 2px 8px rgb(0 0 0 / .025);backdrop-filter:blur(18px) saturate(1.25);-webkit-backdrop-filter:blur(18px) saturate(1.25);isolation:isolate}
.lr-tab-lens{position:absolute;z-index:-1;left:4px;top:4px;width:calc((100% - 8px) / var(--lr-tab-count,4));height:calc(100% - 8px);border-radius:23px;border:1px solid color-mix(in srgb,var(--lr-shell-ground) 80%,transparent);background:color-mix(in srgb,var(--lr-shell-ground) 74%,transparent);box-shadow:inset 0 1px 1px rgb(255 255 255 / .55),0 2px 7px rgb(0 0 0 / .09);backdrop-filter:blur(12px) saturate(1.35);-webkit-backdrop-filter:blur(12px) saturate(1.35);transform:translateX(calc(var(--lr-tab-index) * 100%));transition:transform .34s cubic-bezier(.2,.8,.2,1),background .2s ease;pointer-events:none}
.lr-tabs .lr-tab{min-width:0;width:100%;min-height:34px;margin:0;padding:6px 2px;border:0;border-radius:22px;background:transparent;color:var(--lr-shell-muted);font-size:12px;line-height:22px;font-weight:500;transition:color .18s ease}
.lr-tabs .lr-tab:hover{color:var(--lr-shell-ink);background:transparent}
.lr-tabs .lr-tab.is-active{background:transparent;color:var(--lr-shell-ink);font-weight:650;border:0}
.lr-tab:focus-visible{outline:2px solid #007aff;outline-offset:1px}
.lr-content.is-workbench{padding:0;overflow:hidden;display:flex;flex-direction:column;scrollbar-gutter:auto}
.lr-content.is-workbench>section,.lr-content.is-workbench>div:not(.lr-placeholder){flex:1;min-height:0}
.lr-notes{min-width:320px}
.lr-panel-head{padding:0 1px 8px}
.lr-panel-head>.lr-btn{border-radius:15px;background:transparent;color:var(--lr-shell-muted)}
.lr-card{padding:18px 1px;border-radius:0}
.lr-card:hover{background:color-mix(in srgb,var(--lr-shell-raised) 65%,transparent)}
.lr-card-quote{font-size:13px;line-height:1.8;font-weight:450}
.lr-card-comment{font-size:12px;line-height:1.75}
.lr-card.is-active{border-radius:10px;padding-left:10px;padding-right:10px;background:color-mix(in srgb,var(--card-tint) 28%,var(--lr-shell-ground))}
@media(max-width:1050px){.lr-head{display:flex;flex-direction:column;gap:10px;align-items:stretch;flex-wrap:nowrap}.lr-head .lr-paper-heading{font-size:15px}}
@media(max-width:720px){.lr-head{min-height:0;padding:9px 12px;gap:7px}.lr-tabs-wrap{padding:9px 10px}.lr-tabs{min-height:43px;padding:4px;gap:0}.lr-notes{min-width:0}.lr-tabs .lr-tab{font-size:11.5px}}
@media(pointer:coarse){.lr-tabs{min-height:52px}.lr-tabs .lr-tab{min-height:42px}.lr-reader-button,.lr-import-menu summary{min-height:36px}}
@media(prefers-reduced-motion:reduce){.lr-tab-lens{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-tabs,.lr-tab-lens{backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--lr-shell-raised)}.lr-tab-lens{background:var(--lr-shell-ground);border-color:var(--lr-shell-control)}}

/* Glass rim, a translucent lens, and one moving light source share the chrome. */
.lr-root{--lr-chrome-glass:color-mix(in srgb,var(--lr-shell-ground) 44%,transparent)}
.lr-head{position:relative;z-index:10;background:color-mix(in srgb,var(--lr-shell-ground) 82%,transparent);backdrop-filter:blur(24px) saturate(1.35);-webkit-backdrop-filter:blur(24px) saturate(1.35);box-shadow:0 1px 0 rgb(255 255 255 / .25)}
.lr-tabs-wrap{background:linear-gradient(180deg,var(--lr-shell-ground),color-mix(in srgb,var(--lr-shell-raised) 38%,var(--lr-shell-ground)))}
.lr-tabs{border-color:color-mix(in srgb,var(--lr-shell-control) 36%,transparent);background:linear-gradient(155deg,color-mix(in srgb,var(--lr-shell-ground) 56%,transparent),color-mix(in srgb,var(--lr-shell-well) 45%,transparent));box-shadow:inset 0 1px 1px rgb(255 255 255 / .8),inset 0 -1px 2px rgb(10 20 35 / .055),0 3px 12px rgb(10 20 35 / .045);backdrop-filter:blur(22px) saturate(1.6);-webkit-backdrop-filter:blur(22px) saturate(1.6)}
.lr-tabs::before{content:'';position:absolute;inset:0;z-index:-2;border-radius:inherit;background:radial-gradient(ellipse at var(--lr-glass-x,25%) 0%,rgb(255 255 255 / .6),transparent 65%);pointer-events:none}
.lr-tab-lens{background:linear-gradient(160deg,color-mix(in srgb,var(--lr-shell-ground) 64%,transparent),color-mix(in srgb,var(--lr-shell-ground) 24%,transparent));border-color:color-mix(in srgb,var(--lr-shell-ground) 70%,transparent);box-shadow:inset 0 1.2px 1.5px rgb(255 255 255 / .92),inset 1px 0 1px rgb(255 255 255 / .4),inset 0 -1px 1.5px rgb(20 30 50 / .07),0 2px 6px rgb(15 25 45 / .09),0 6px 15px rgb(15 25 45 / .025);backdrop-filter:blur(16px) saturate(1.75);-webkit-backdrop-filter:blur(16px) saturate(1.75);transition:transform .42s cubic-bezier(.18,.88,.25,1),background .24s ease}
.lr-tab-lens::after{content:'';position:absolute;inset:1px;border-radius:inherit;border:1px solid transparent;border-top-color:rgb(255 255 255 / .5);border-left-color:rgb(255 255 255 / .22);pointer-events:none}
.lr-tabs.is-gliding .lr-tab-lens::after{animation:lr-glass-flow .42s ease-out}
@keyframes lr-glass-flow{0%,100%{transform:scaleX(1);opacity:.65}40%{transform:scaleX(1.06) scaleY(.94);opacity:1}}
.lr-content.is-workbench>.lrcp{padding:8px 20px 0}
.lr-content.is-workbench>.lr-ideas{padding:10px 22px 28px;overflow:auto;overscroll-behavior:contain}
.lr-content.is-workbench>.lrc-root{padding:9px 22px 20px}
.lr-content.is-workbench :is(.lrcp-btn,.lr-ideas-btn){border-radius:15px}
.lr-content.is-workbench :is(.lrcp-btn.primary,.lr-ideas-btn.primary){background:#007aff;color:white}
.lr-content.is-workbench :is(.lrcp-link,.lr-ideas-link){color:#007aff!important}
.lr-content.is-workbench :is(input,textarea,select){caret-color:#007aff}
.lr-content.is-workbench :is(.lrcp-rail,.lr-ideas-composer){background:color-mix(in srgb,var(--lr-shell-ground) 62%,transparent);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);border-radius:18px;box-shadow:inset 0 1px 0 rgb(255 255 255 / .65),0 2px 8px rgb(0 0 0 / .035)}
@media(max-width:720px){.lr-content.is-workbench>.lrcp{padding:6px 13px 0}.lr-content.is-workbench>.lr-ideas,.lr-content.is-workbench>.lrc-root{padding-left:14px;padding-right:14px}}
@media(prefers-reduced-motion:reduce){.lr-tab-lens,.lr-tabs.is-gliding .lr-tab-lens::after{transition:none;animation:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-tabs,.lr-tab-lens,.lr-head{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-tabs::before{display:none}}

/* The translation sheet and reading cards belong to the same material family. */
.lr-root{--lr-card-radius:20px;--lr-card-glass:color-mix(in srgb,var(--lr-shell-ground) 44%,transparent);--lr-card-edge:color-mix(in srgb,var(--lr-shell-ground) 78%,transparent)}
.lr-notes{background:color-mix(in srgb,var(--lr-shell-ink) 2.7%,var(--lr-shell-ground))}
.lr-tabs-wrap{background:transparent}
.lr-tabs .lr-tab.is-active{color:#007aff}
.lr-tabs .lr-tab{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.lr-tabs .lr-tab svg{width:15px;height:15px;flex:none;stroke-width:1.75}
.lr-empty .lr-btn{border-radius:18px}
.lr-empty .lr-btn.primary{background:#007aff;color:#fff}
.lr-content:not(.is-workbench){padding:8px 19px 42px}
.lr-cards{display:flex;flex-direction:column;gap:12px}
.lr-root :is(.lr-card,.lrcp-point,.lrcp-route-item,.lr-ideas-zone,.lrc-row){border:1px solid var(--lr-card-edge);border-radius:var(--lr-card-radius);background:var(--lr-card-glass);box-shadow:inset 0 1px 0 rgb(255 255 255 / .58),inset 0 -1px 0 rgb(10 20 35 / .025),0 3px 12px rgb(10 20 35 / .025);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2);transition:background .24s ease,box-shadow .24s ease,border-color .24s ease}
.lr-root .lr-card,.lr-root .lr-card:first-child{padding:15px 16px}
.lr-root .lr-card:hover{background:color-mix(in srgb,var(--lr-shell-ground) 66%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .8),0 4px 16px rgb(10 20 35 / .05)}
.lr-root .lr-card.is-active{border-radius:var(--lr-card-radius);padding:15px 16px;border-color:color-mix(in srgb,var(--card-line) 55%,transparent);background:color-mix(in srgb,var(--card-tint) 30%,var(--lr-card-glass))}
.lr-root .lrc-list{gap:10px;padding-right:4px}
.lr-root :is(.lrcp-goals,.lrc-search,.lr-ideas-picker select){border-radius:16px;background:color-mix(in srgb,var(--lr-shell-ground) 50%,transparent)}
.lr-pop{--lr-glass-density:10%}
.lr-pop[data-surface=dark]{--lr-glass-density:72%}
.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview){border-radius:26px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) var(--lr-glass-density),transparent);backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);box-shadow:inset 0 1px 0 var(--lr-glass-light),inset 1px 0 0 rgb(255 255 255 / .15),0 7px 24px rgb(15 21 30 / .08)}
.lr-pop-head{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 12%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .4)}
@media(max-width:720px){.lr-content:not(.is-workbench){padding:5px 12px 32px}.lr-root .lr-card,.lr-root .lr-card:first-child{padding:13px}.lr-root :is(.lr-ideas-zone,.lr-ideas-zone+.lr-ideas-zone){padding:12px}}
@media(max-width:420px){.lr-tabs .lr-tab{gap:4px;font-size:11px}.lr-tabs .lr-tab svg{width:13px;height:13px}}
@media(max-width:720px){}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root :is(.lr-card,.lrcp-point,.lrcp-route-item,.lr-ideas-zone,.lrc-row),.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview){background:var(--lr-shell-ground,var(--dsw-alias-bg-overlay));backdrop-filter:none;-webkit-backdrop-filter:none}}

/* Gloss: one clear material for navigation, transient sheets and input surfaces. */
.lr-root{--gloss-fill:22%;--gloss-blur:26px;--gloss-accent:#007aff;--gloss-edge:color-mix(in srgb,var(--lr-shell-ground) 68%,transparent);--lr-card-glass:color-mix(in srgb,var(--lr-shell-ground) 20%,transparent);--lr-card-edge:color-mix(in srgb,var(--lr-shell-ground) 54%,transparent)}
.lr-root .lrcp.is-direct{--dsw-alias-brand-primary:var(--gloss-accent)}
.lr-root .lr-ideas-send:not(.is-stop){background:var(--gloss-accent)}
.lr-notes{min-width:280px;container-type:inline-size;container-name:gloss-reader}
.lr-source{max-width:calc(100% - 292px)}
.lr-tabs .lr-tab::after{display:none}
@container gloss-reader (max-width:500px){.lr-tabs-wrap{padding-left:10px;padding-right:10px}.lr-tabs .lr-tab{gap:6px;font-size:12px}.lr-tab-label-full{display:none}.lr-tabs .lr-tab::after{content:attr(data-short-label);display:inline}}
@container gloss-reader (max-width:350px){.lr-tabs .lr-tab{min-height:38px;padding:6px}.lr-tabs .lr-tab>span,.lr-tabs .lr-tab::after{display:none}.lr-tabs .lr-tab svg{width:18px;height:18px}.lr-tabs-wrap{padding-left:10px;padding-right:10px}.lr-tabs{min-height:46px}}
.lr-notes{background:linear-gradient(155deg,color-mix(in srgb,var(--lr-shell-well) 82%,var(--lr-shell-ground)),color-mix(in srgb,var(--lr-shell-well) 94%,var(--lr-shell-control)))}
.lr-head{background:color-mix(in srgb,var(--lr-shell-ground) 30%,transparent);border-bottom-color:transparent;backdrop-filter:blur(var(--gloss-blur)) saturate(1.3);-webkit-backdrop-filter:blur(var(--gloss-blur)) saturate(1.3);box-shadow:inset 0 -1px 0 color-mix(in srgb,var(--lr-shell-ground) 48%,transparent),0 2px 10px rgb(16 28 48 / .025)}
.lr-tabs{background:color-mix(in srgb,var(--lr-shell-ground) 18%,transparent);border-color:var(--gloss-edge);backdrop-filter:blur(var(--gloss-blur)) saturate(1.45);-webkit-backdrop-filter:blur(var(--gloss-blur)) saturate(1.45);box-shadow:inset 0 1px 1px rgb(255 255 255 / .82),inset 0 -1px 1px rgb(18 32 52 / .06),0 5px 18px rgb(18 32 52 / .04);touch-action:pan-y}
.lr-tab-lens{background:linear-gradient(150deg,color-mix(in srgb,var(--lr-shell-ground) 48%,transparent),color-mix(in srgb,var(--lr-shell-ground) 10%,transparent));border-color:color-mix(in srgb,var(--lr-shell-ground) 78%,transparent);backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);transform:translateX(calc(var(--lr-tab-position,var(--lr-tab-index)) * 100%)) scaleX(var(--lr-lens-stretch,1)) scaleY(var(--lr-lens-height,1));transition:transform .44s cubic-bezier(.16,1,.3,1),background .22s ease,box-shadow .22s ease;box-shadow:inset 0 1.5px 1.5px rgb(255 255 255 / .95),inset 1px 0 1px rgb(255 255 255 / .55),inset -1px -1px 2px rgb(18 32 52 / .08),0 3px 8px rgb(18 32 52 / .08)}
.lr-tabs.is-pressing{--lr-lens-stretch:1.035;--lr-lens-height:.96}.lr-tabs.is-scrubbing{user-select:none;--lr-lens-stretch:1.065;--lr-lens-height:.94}.lr-tabs.is-scrubbing .lr-tab-lens{transition:background .15s ease,box-shadow .15s ease}.lr-tabs.is-pressing .lr-tab-lens::after{border-top-color:rgb(255 255 255 / .95);border-left-color:rgb(255 255 255 / .6)}
.lr-tabs .lr-tab{touch-action:pan-y}.lr-tabs .lr-tab:active{background:transparent}
.lr-reader-controls,.lr-import-menu summary,.lr-import-options,.lr-root .lrc-search,.lr-root .lrc-controls select{background:color-mix(in srgb,var(--lr-shell-ground) var(--gloss-fill),transparent);backdrop-filter:blur(20px) saturate(1.25);-webkit-backdrop-filter:blur(20px) saturate(1.25);box-shadow:inset 0 1px 0 rgb(255 255 255 / .68),0 2px 7px rgb(18 32 52 / .025)}
.lr-reader-controls{border-radius:22px}
.lr-root :is(.lr-card,.lrc-row){background:var(--lr-card-glass);backdrop-filter:blur(22px) saturate(1.2);-webkit-backdrop-filter:blur(22px) saturate(1.2);box-shadow:inset 0 1px 0 rgb(255 255 255 / .75),inset 0 -1px 0 rgb(18 32 52 / .03),0 3px 11px rgb(18 32 52 / .025)}
.lr-root .lr-card:hover{background:color-mix(in srgb,var(--lr-shell-ground) 38%,transparent)}
.lr-root .lr-research-conversation .lr-ideas-composer{border-radius:24px;background:color-mix(in srgb,var(--lr-shell-ground) 24%,transparent);backdrop-filter:blur(var(--gloss-blur)) saturate(1.25);-webkit-backdrop-filter:blur(var(--gloss-blur)) saturate(1.25);box-shadow:inset 0 1px 0 rgb(255 255 255 / .8),inset 0 -1px 0 rgb(18 32 52 / .04),0 5px 18px rgb(18 32 52 / .045)}
.lr-root .lr-ideas-message.is-user{border-radius:20px 20px 6px 20px}.lr-root .lr-ideas-conversation-input{background:transparent}
.lr-pop{--lr-glass-density:8%}.lr-pop[data-surface=dark]{--lr-glass-density:66%}.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview){border-radius:28px;backdrop-filter:blur(26px) saturate(1.2);-webkit-backdrop-filter:blur(26px) saturate(1.2)}
.lr-pop-head{border-radius:22px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 8%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .7),inset 0 -1px 0 rgb(18 32 52 / .025)}
.lr-pop.is-compact .lr-glass-orb{background:linear-gradient(145deg,color-mix(in srgb,var(--dsw-alias-bg-overlay) 28%,transparent),color-mix(in srgb,var(--dsw-alias-bg-overlay) 5%,transparent));border:1px solid color-mix(in srgb,var(--dsw-alias-bg-overlay) 70%,transparent);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);box-shadow:inset 0 1px 1px rgb(255 255 255 / .88),inset -1px -1px 2px rgb(18 32 52 / .12),0 4px 13px rgb(18 32 52 / .1);transition:opacity .18s ease,transform .3s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}.lr-pop.is-compact .lr-glass-orb:hover{transform:scale(1.06)}
@media(prefers-reduced-motion:reduce){.lr-tab-lens,.lr-pop.is-compact .lr-glass-orb{transition:none}.lr-tabs{--lr-lens-stretch:1;--lr-lens-height:1}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root :is(.lr-head,.lr-tabs,.lr-tab-lens,.lr-reader-controls,.lr-import-options,.lr-card,.lrc-row,.lrc-search),.lr-root .lr-research-conversation .lr-ideas-composer,.lr-pop-head,.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview),.lr-pop.is-compact .lr-glass-orb{background:var(--lr-shell-ground,var(--dsw-alias-bg-overlay));backdrop-filter:none;-webkit-backdrop-filter:none}.lr-notes{background:var(--lr-shell-well)}}

/* Photos-style document chrome: the app-host corner stays empty and safe. */
.lr-root>.lr-head.lr-chrome-safe{position:relative;z-index:20;display:block;flex:0 0 44px;width:100%;height:44px;min-height:44px;max-height:none;margin:0;padding:0;border:0;background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;pointer-events:none}
.lr-root>.lr-head.lr-chrome-safe.has-fallback-title{height:96px;min-height:96px;flex-basis:96px}.lr-header-actions{position:absolute;top:6px;right:12px;display:flex;align-items:center;gap:8px;pointer-events:none}.lr-header-actions>*{pointer-events:auto}.lr-header-fallback-title{position:absolute;top:52px;left:50%;transform:translateX(-50%);width:min(620px,calc(100% - 28px));display:flex;justify-content:center;pointer-events:none}
.lr-source{container-type:inline-size;container-name:gloss-paper}.lr-reader-chrome{position:absolute;z-index:12;top:56px;left:12px;right:12px;display:grid;grid-template-columns:204px minmax(0,1fr) 162px 34px;align-items:center;column-gap:8px;row-gap:8px;pointer-events:none}.lr-reader-chrome>*,.lr-reader-chrome .lr-head-toc{min-width:0}.lr-reader-chrome button,.lr-reader-chrome .lr-toc-body{pointer-events:auto}.lr-reader-chrome .lr-head-toc{grid-column:1;grid-row:1;position:relative;justify-self:start}.lr-reader-chrome .lr-reader-panel{grid-column:4;grid-row:1;justify-self:end;margin-left:0}.lr-root .lr-source-body.is-pdf{padding-top:112px;scroll-padding-top:120px}
.lr-title-pill{display:flex;align-items:center;justify-self:center;width:100%;max-width:620px;min-width:0;min-height:36px;padding:2px 2px 2px 14px;border:0;border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 24%,transparent);backdrop-filter:blur(24px) saturate(1.35);-webkit-backdrop-filter:blur(24px) saturate(1.35);box-shadow:inset 0 1px 0 rgb(255 255 255 / .8),inset 0 -1px 0 rgb(255 255 255 / .28),0 3px 12px rgb(18 32 52 / .07);pointer-events:none;transition:width .34s cubic-bezier(.16,1,.3,1),padding .34s cubic-bezier(.16,1,.3,1),background .22s ease}
.lr-reader-chrome>.lr-title-pill{grid-column:2;grid-row:1}.lr-title-pill .lr-paper-heading{flex:1;min-width:0;max-width:100%;margin:0;padding:0 7px 0 0;font-size:13.5px;font-weight:550;line-height:1.55;letter-spacing:-.01em;color:var(--lr-shell-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;opacity:1;transition:opacity .2s ease,max-width .34s cubic-bezier(.16,1,.3,1),padding .34s cubic-bezier(.16,1,.3,1)}
.lr-title-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:var(--lr-shell-muted);pointer-events:auto;cursor:pointer}.lr-title-toggle:hover{background:color-mix(in srgb,var(--lr-shell-ground) 32%,transparent);color:var(--lr-shell-ink)}.lr-title-toggle svg{width:17px;height:17px;stroke-width:1.7}.lr-title-pill.is-collapsed{width:36px;padding:2px;border-radius:999px}.lr-title-pill.is-collapsed .lr-paper-heading{max-width:0;padding:0;opacity:0}.lr-title-pill.is-brand{width:auto;padding:7px 20px}.lr-title-pill.is-brand .lr-paper-heading{padding:0;font-size:15px;letter-spacing:-.015em}
.lr-reader-chrome .lr-reader-controls{grid-column:3;grid-row:1;justify-self:end;display:flex;align-items:center;gap:6px;max-width:none;margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;pointer-events:none}.lr-reader-chrome .lr-reader-button,.lr-header-actions .lr-reader-button,.lr-more-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:34px;height:34px;min-width:34px;min-height:34px;margin:0;padding:0;border:0;border-radius:50%;background:color-mix(in srgb,var(--lr-shell-ground) 24%,transparent);color:var(--lr-shell-ink);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);box-shadow:inset 0 1px 0 rgb(255 255 255 / .82),inset 0 -1px 0 rgb(255 255 255 / .25),0 3px 10px rgb(18 32 52 / .065);cursor:pointer;pointer-events:auto;transition:background .18s ease,box-shadow .18s ease,transform .18s cubic-bezier(.16,1,.3,1)}
.lr-reader-chrome .lr-reader-button:hover,.lr-header-actions .lr-reader-button:hover,.lr-more-toggle:hover{background:color-mix(in srgb,var(--lr-shell-ground) 42%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .9),0 4px 13px rgb(18 32 52 / .08)}.lr-reader-chrome .lr-reader-button:active,.lr-more-toggle:active,.lr-title-toggle:active{transform:scale(.95)}.lr-reader-chrome .lr-reader-button.is-active{color:var(--gloss-accent)}.lr-reader-chrome .lr-zoom{width:42px;min-width:42px;text-align:center;font-size:11px;line-height:30px;font-variant-numeric:tabular-nums;color:var(--lr-shell-muted);pointer-events:none}
.lr-reader-chrome .lr-head-toc .lr-toc-body{top:calc(100% + 8px);left:0;right:auto;width:clamp(220px,calc(100cqw - 24px),300px);max-width:calc(100vw - 28px);max-height:min(64vh,560px);padding:8px;overflow:auto;border:0;border-radius:16px;background:color-mix(in srgb,var(--lr-shell-ground) 86%,transparent);backdrop-filter:blur(24px) saturate(1.25);-webkit-backdrop-filter:blur(24px) saturate(1.25);box-shadow:inset 0 1px 0 rgb(255 255 255 / .7),0 8px 26px rgb(18 32 52 / .11)}
.lr-more-toggle::-webkit-details-marker{display:none}.lr-more-toggle>svg{width:18px;height:18px}.lr-more-toggle:focus-visible,.lr-title-toggle:focus-visible{outline:2px solid var(--lr-shell-focus);outline-offset:3px}

@container gloss-paper (max-width:560px){.lr-reader-chrome{grid-template-columns:76px minmax(0,1fr) 76px;align-items:center}.lr-reader-chrome .lr-reader-panel{grid-column:3;grid-row:1;justify-self:end;margin-left:0}.lr-reader-chrome .lr-reader-controls{grid-column:2;grid-row:2;justify-self:center}.lr-root .lr-source-body.is-pdf{padding-top:152px;scroll-padding-top:160px}}
@media(max-width:720px){.lr-root>.lr-head.lr-chrome-safe{height:44px;min-height:44px;flex-basis:44px}.lr-root>.lr-head.lr-chrome-safe.has-fallback-title{height:96px;min-height:96px;flex-basis:96px}.lr-reader-chrome{left:10px;right:10px}.lr-title-pill .lr-paper-heading{font-size:13px}.lr-header-actions{right:10px}}
@media(pointer:coarse){.lr-reader-chrome{grid-template-columns:228px minmax(0,1fr) 180px 40px}.lr-reader-chrome .lr-reader-panel{margin-left:0}.lr-reader-chrome .lr-reader-button,.lr-header-actions .lr-reader-button,.lr-header-actions .lr-more-toggle{width:40px;height:40px;min-width:40px;min-height:40px}.lr-title-pill{min-height:42px}.lr-title-toggle{width:38px;height:38px}.lr-title-pill.is-collapsed{width:42px}.lr-header-actions{top:2px}.lr-root .lr-source-body.is-pdf{padding-top:118px}}
@media(pointer:coarse){@container gloss-paper (max-width:560px){.lr-reader-chrome{grid-template-columns:88px minmax(0,1fr) 88px}.lr-reader-chrome .lr-reader-panel{grid-column:3;grid-row:1;justify-self:end;margin-left:0}.lr-reader-chrome .lr-reader-controls{grid-column:2;grid-row:2}.lr-root .lr-source-body.is-pdf{padding-top:164px;scroll-padding-top:172px}}}
@media(prefers-reduced-motion:reduce){.lr-title-pill,.lr-title-pill .lr-paper-heading,.lr-reader-chrome .lr-reader-button,.lr-header-actions .lr-reader-button,.lr-title-toggle,.lr-more-toggle{transition:none;transform:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-title-pill,.lr-reader-chrome .lr-reader-button,.lr-header-actions .lr-reader-button,.lr-header-actions .lr-more-toggle,.lr-header-actions .lr-import-options,.lr-reader-chrome .lr-head-toc .lr-toc-body{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-title-pill,.lr-reader-chrome .lr-reader-button,.lr-header-actions .lr-more-toggle{box-shadow:inset 0 0 0 1px var(--lr-shell-control),0 2px 6px rgb(18 32 52 / .05)}}
/* Focus keeps the reader and the auxiliary panes mounted in their original document. */
.lr-root>.lr-head.lr-chrome-safe.is-floating{position:absolute;height:0;min-height:0;flex-basis:0;background:transparent;box-shadow:none}
.lr-reader-chrome>.lr-reader-leading{grid-column:1;grid-row:1;justify-self:start;display:flex;align-items:center;gap:8px;min-width:0;pointer-events:none}.lr-reader-chrome .lr-header-actions{position:static;inset:auto;display:flex;align-items:center;gap:0;min-width:0;pointer-events:none}
.lr-reference-return{position:absolute;z-index:14;left:50%;bottom:18px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:5px;min-height:32px;padding:5px 13px 5px 9px;border:0;border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 36%,transparent);color:var(--lr-shell-ink);font:inherit;font-size:12px;font-weight:500;line-height:1.5;white-space:nowrap;backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:inset 0 1px 0 rgb(255 255 255 / .8),0 3px 12px rgb(18 32 52 / .1);cursor:pointer;animation:lr-reference-return-in .2s ease-out}
.lr-reference-return:hover{background:color-mix(in srgb,var(--lr-shell-ground) 60%,transparent)}.lr-reference-return:disabled{cursor:wait;opacity:.65}.lr-reference-return:focus-visible{outline:2px solid var(--lr-shell-focus);outline-offset:3px}.lr-reference-return>svg{width:16px;height:16px}
@keyframes lr-reference-return-in{from{opacity:0;transform:translate(-50%,5px)}to{opacity:1;transform:translate(-50%,0)}}
@media(pointer:coarse){.lr-reference-return{min-height:40px;padding-inline:12px 16px}}@media(prefers-reduced-motion:reduce){.lr-reference-return{animation:none}}@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-reference-return{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 0 0 1px var(--lr-shell-control)}}
.lr-root .lr-body.is-paper-focused>.lr-source{width:100%!important;max-width:none;min-width:0;height:100%!important;flex:1 1 auto;border:0}
.lr-root .lr-body.is-paper-focused>.lr-notes,.lr-root .lr-body.is-paper-focused>.lr-splitter{display:none!important}
/* The book button folds the whole reading toolbar, leaving the PDF layout stable. */
.lr-reader-chrome>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel){opacity:1;visibility:visible;transform:translateY(0) scale(1);transform-origin:50% 0;transition:opacity .22s ease,transform .3s cubic-bezier(.16,1,.3,1),visibility 0s linear 0s}
.lr-reader-chrome.is-collapsed>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel){opacity:0;visibility:hidden;transform:translateY(-4px) scale(.88);pointer-events:none;transition:opacity .2s ease,transform .3s cubic-bezier(.16,1,.3,1),visibility 0s linear .24s}
.lr-reader-chrome.is-collapsed>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel) :is(button,summary,select){pointer-events:none}
@media(prefers-reduced-motion:reduce){.lr-reader-chrome>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel){transition:none;transform:none}}
/* Only resize observers measure the target; CSS moves the toolbar into its quiet reading chip. */
.lr-reader-chrome{top:var(--lr-reader-chrome-top,16px);left:150px;right:12px;grid-template-columns:66px minmax(0,1fr) 138px 30px;column-gap:6px;row-gap:8px}.lr-reader-chrome>.lr-reader-leading{gap:6px}.lr-reader-chrome .lr-reader-controls{gap:4px}.lr-reader-chrome .lr-reader-button,.lr-reader-chrome .lr-more-toggle{width:30px;height:30px;min-width:30px;min-height:30px}.lr-reader-chrome .lr-zoom{width:36px;min-width:36px;font-size:10.5px}.lr-root .lr-source-body.is-pdf{padding-top:68px;scroll-padding-top:76px}
.lr-reader-chrome .lr-head-toc .lr-toc-body{left:clamp(-138px,calc(100cqw - 462px),0px);right:auto;width:min(300px,calc(100cqw - 24px));max-width:calc(100cqw - 24px)}
.lr-reader-chrome>.lr-title-pill{transform:translate(0,0);transform-origin:100% 50%;transition:transform .4s cubic-bezier(.16,1,.3,1),background .2s ease,opacity .2s ease}
.lr-title-pill .lr-paper-heading{overflow-x:auto;overflow-y:hidden;text-overflow:clip;scrollbar-width:none;pointer-events:auto;padding:0;outline-offset:2px;overscroll-behavior-x:contain}.lr-title-pill .lr-paper-heading::-webkit-scrollbar{display:none}.lr-paper-title-text{display:block;width:max-content;min-width:100%;text-align:center}.lr-reader-chrome>.lr-title-pill:not(.is-collapsed){padding:6px 12px}.lr-title-pill.is-collapsed .lr-paper-heading{pointer-events:none}
.lr-reader-chrome>.lr-title-pill.is-collapsed{width:var(--lr-reader-chip-width,96px);min-height:var(--lr-reader-chip-height,36px);height:var(--lr-reader-chip-height,36px);padding:0;transform:translate(var(--lr-reader-chip-x,calc((100cqw - 150px)/2)),var(--lr-reader-chip-y,0px));border-radius:999px;background:linear-gradient(150deg,color-mix(in srgb,var(--lr-shell-ground) 48%,transparent),color-mix(in srgb,var(--lr-shell-ground) 10%,transparent));backdrop-filter:blur(18px) saturate(1.45);-webkit-backdrop-filter:blur(18px) saturate(1.45);box-shadow:inset 0 1.5px 1.5px rgb(255 255 255 / .9),inset -1px -1px 2px rgb(18 32 52 / .07),0 3px 9px rgb(18 32 52 / .065)}
.lr-reader-chrome .lr-title-pill.is-collapsed .lr-title-toggle{width:100%;height:100%;gap:6px;padding:0 11px;color:var(--lr-shell-ink);border-radius:inherit}
.lr-reader-chrome.is-collapsed>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel){transform:translate(var(--lr-chrome-fold-x,32px),var(--lr-chrome-fold-y,-40px)) scale(.28);transform-origin:50% 50%;transition:transform .38s cubic-bezier(.16,1,.3,1),opacity .18s ease,visibility 0s linear .24s}
.lr-tabs .lr-tab{position:relative}
@container gloss-paper (max-width:600px){.lr-reader-chrome{left:12px;grid-template-columns:minmax(0,1fr) 138px 30px}.lr-reader-chrome>.lr-reader-leading{grid-column:1 / 3;grid-row:1;margin-left:138px}.lr-reader-chrome>.lr-title-pill{grid-column:1;grid-row:2}.lr-reader-chrome .lr-reader-controls{grid-column:2 / 4;grid-row:2;justify-self:end}.lr-reader-chrome .lr-reader-panel{grid-column:3;grid-row:1}.lr-root .lr-source-body.is-pdf{padding-top:112px;scroll-padding-top:120px}.lr-reader-chrome>.lr-title-pill.is-collapsed{transform:translate(var(--lr-reader-chip-x,calc(50cqw + 30px)),var(--lr-reader-chip-y,-44px))}}
@media(pointer:coarse){.lr-reader-chrome{grid-template-columns:78px minmax(0,1fr) 156px 36px}.lr-reader-chrome .lr-reader-button,.lr-reader-chrome .lr-more-toggle{width:36px;height:36px;min-width:36px;min-height:36px}.lr-root .lr-source-body.is-pdf{padding-top:74px;scroll-padding-top:82px}@container gloss-paper (max-width:600px){.lr-reader-chrome{grid-template-columns:minmax(0,1fr) 156px 36px}.lr-root .lr-source-body.is-pdf{padding-top:124px;scroll-padding-top:132px}.lr-reader-chrome>.lr-title-pill.is-collapsed{transform:translate(var(--lr-reader-chip-x,calc(50cqw + 36px)),var(--lr-reader-chip-y,-50px))}}}
@media(prefers-reduced-motion:reduce){.lr-reader-chrome>.lr-title-pill{transition:none}.lr-reader-chrome.is-collapsed>:is(.lr-reader-leading,.lr-reader-controls,.lr-reader-panel){transition:none;transform:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-reader-chrome>.lr-title-pill.is-collapsed{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}}
.lr-reference-return{left:2px;top:80px;bottom:auto;min-height:32px;height:32px;transform:none;visibility:hidden;animation:lr-reference-return-side-in .18s ease-out}.lr-reference-return.is-compact{width:32px;min-width:32px;height:32px;min-height:32px;padding:0;gap:0;justify-content:center;border-radius:50%}.lr-reference-return.is-compact>span{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes lr-reference-return-side-in{from{opacity:0;transform:translateX(-3px)}to{opacity:1;transform:translateX(0)}}@media(prefers-reduced-motion:reduce){.lr-reference-return{animation:none}}

/* The body is a clear sheet; the controls are a separate, lighter island. */
.lr-pop.is-compact .lr-glass-orb{min-width:0;min-height:0;width:100%;height:100%;margin:0;box-sizing:border-box;border-radius:50%}
.lr-pop{--lr-glass-density:4%;--lr-glass-top:12%;--lr-glass-bottom:8%;--lr-glass-light:rgb(255 255 255 / .74)}
.lr-pop[data-surface=dark]{--lr-glass-density:54%;--lr-glass-top:68%;--lr-glass-bottom:58%;--lr-glass-light:rgb(255 255 255 / .22)}
.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview){
  border-radius:30px;
  border-color:color-mix(in srgb,var(--dsw-alias-bg-overlay) 44%,transparent);
  background:linear-gradient(145deg,color-mix(in srgb,var(--dsw-alias-bg-overlay) var(--lr-glass-top),transparent),color-mix(in srgb,var(--dsw-alias-bg-overlay) var(--lr-glass-density),transparent) 46%,color-mix(in srgb,var(--dsw-alias-bg-overlay) var(--lr-glass-bottom),transparent));
  backdrop-filter:blur(18px) saturate(1.3);
  -webkit-backdrop-filter:blur(18px) saturate(1.3);
  box-shadow:inset 0 1px 1px var(--lr-glass-light),inset 0 -1px 1px rgb(18 32 52 / .025),0 9px 28px rgb(18 32 52 / .08),0 2px 6px rgb(18 32 52 / .025);
}
.lr-pop:not(.is-compact) .lr-pop-head{margin:1px 0 9px;border-radius:999px;background:linear-gradient(155deg,color-mix(in srgb,var(--dsw-alias-bg-overlay) 24%,transparent),color-mix(in srgb,var(--dsw-alias-bg-overlay) 6%,transparent));backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 1px 0 rgb(255 255 255 / .72),inset 0 -1px 0 rgb(18 32 52 / .025),0 3px 10px rgb(18 32 52 / .025)}
.lr-pop:not(.is-compact) .lr-glass-button{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 8%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .28)}
.lr-pop:not(.is-compact) .lr-glass-button:hover{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 35%,transparent)}
.lr-pop:not(.is-compact) .lr-pop-body{padding:5px 6px 8px;line-height:1.85;color:var(--dsw-alias-label-primary)}
.lr-pop:not(.is-compact) .lr-pop-content p{line-height:1.85}
.lr-pop:not(.is-compact) .lr-followup{border-top-color:color-mix(in srgb,var(--dsw-alias-border-l1) 26%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 4%,transparent)}
.lr-pop-anchor::after{width:10px;height:10px;border-radius:3px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 12%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:inset 1px 1px 0 color-mix(in srgb,var(--dsw-alias-bg-overlay) 48%,transparent)}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview),.lr-pop:not(.is-compact) .lr-pop-head,.lr-pop-anchor::after{background:var(--dsw-alias-bg-overlay);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-pop:not(.is-compact):is(:hover,.is-hovered,.has-focus,.is-preview){border-color:var(--dsw-alias-border-l1)}}

/* Reader menus share a readable, lightly edged sheet without nested surfaces. */
.lr-root .lr-head-toc .lr-toc-body,.lr-root .lr-header-actions .lr-import-options{box-sizing:border-box;z-index:45;max-height:min(560px,calc(100vh - 100px));margin-top:0;padding:12px;border:0;border-radius:20px;background:color-mix(in srgb,var(--lr-shell-ground) 40%,transparent);color:var(--lr-shell-ink);backdrop-filter:blur(18px) saturate(1.18);-webkit-backdrop-filter:blur(18px) saturate(1.18);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--lr-shell-ground) 68%,transparent),0 2px 6px color-mix(in srgb,var(--lr-shell-ink) 2.5%,transparent);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--lr-shell-ink) 20%,transparent) transparent;scroll-padding-block:10px}
.lr-root .lr-toc-body .lr-toc-row,.lr-root .lr-header-actions .lr-import-options>button{box-sizing:border-box;width:100%;min-height:36px;height:auto;margin:0;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:var(--lr-shell-ink);text-align:left;font-size:12px;line-height:1.6;white-space:normal;overflow-wrap:anywhere;transition:background .16s ease-out}
.lr-root .lr-toc-body .lr-toc-row:hover,.lr-root .lr-header-actions .lr-import-options>button:hover{background:color-mix(in srgb,var(--lr-shell-ink) 5%,transparent)}
.lr-root .lr-toc-body .lr-toc-row.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--lr-shell-ink);font-weight:600}
.lr-root .lr-toc-body .lr-toc-row.lv2{padding-left:19px}.lr-root .lr-toc-body .lr-toc-row.lv3{padding-left:28px}.lr-root .lr-toc-body .lr-toc-row.lv4{padding-left:37px}

.lr-root .lr-toc-body button:focus-visible,.lr-root .lr-import-options :is(button,select):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
@media(prefers-reduced-motion:reduce){.lr-root .lr-toc-body .lr-toc-row,.lr-root .lr-header-actions .lr-import-options>button{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-head-toc .lr-toc-body,.lr-root .lr-header-actions .lr-import-options{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 0 0 1px var(--lr-shell-control)}}


/* The library and welcome share one viewport and one transition progress. */
.lr-welcome.lr-empty {
  --lr-welcome-progress:0;
  --lr-welcome-mark-size:86px;
  --lr-welcome-home-mark-y:calc(50% - 104px);
  --lr-welcome-dock-x:calc(50% - 160px);
  --lr-welcome-dock-y:40px;
  --lr-welcome-dock-size:34px;
  --lr-welcome-ease:cubic-bezier(.2,.76,.24,1);
  position:relative;isolation:isolate;flex:1;display:block;min-height:0;min-width:0;padding:0;
  overflow:hidden;overscroll-behavior-x:contain;text-align:start;container-type:inline-size;
}
.lr-welcome-home {
  position:absolute;inset:0;overflow:hidden;touch-action:pan-y;user-select:none;
  background:radial-gradient(ellipse 67% 58% at 50% 39%,color-mix(in srgb,var(--lr-shell-focus) 9%,transparent),transparent),var(--lr-shell-raised);
}
.lr-welcome-citations {
  position:absolute;inset:0;width:100%;height:100%;pointer-events:none;
  color:var(--lr-shell-ink);
  opacity:clamp(0,1 - var(--lr-welcome-progress) * 2,1);
  mask-image:radial-gradient(ellipse 26% 35% at 50% 46%,rgb(0 0 0 / .12) 8%,#000 100%);
}
.lr-welcome[data-pdf-drop] .lr-welcome-citations { opacity:.28 }
@container (max-width:480px) {
  .lr-welcome-citations { mask-image:radial-gradient(ellipse 48% 31% at 50% 46%,rgb(0 0 0 / .12) 8%,#000 100%) }
}
.lr-welcome-brand {
  position:absolute;z-index:2;aspect-ratio:1;pointer-events:none;
  left:calc(50% + (var(--lr-welcome-dock-x) - 50%) * var(--lr-welcome-progress));
  top:calc(var(--lr-welcome-home-mark-y) + (var(--lr-welcome-dock-y) - var(--lr-welcome-home-mark-y)) * var(--lr-welcome-progress));
  width:calc(var(--lr-welcome-mark-size) + (var(--lr-welcome-dock-size) - var(--lr-welcome-mark-size)) * var(--lr-welcome-progress));
  transform:translate(-50%,-50%);
}
.lr-welcome-intro {
  position:absolute;left:calc(50% - 32% * var(--lr-welcome-progress));top:calc(50% - 44px);width:min(480px,calc(100% - 28px));
  transform:translateX(-50%);text-align:center;
  opacity:clamp(0,1 - var(--lr-welcome-progress) * 3,1);
}
.lr-welcome-library-cue {
  position:absolute;left:calc(50% - 32% * var(--lr-welcome-progress));bottom:clamp(16px,11%,100px);transform:translateX(-50%);
  display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:55px;width:clamp(148px,27%,236px);padding:8px 14px;
  border:1px solid color-mix(in srgb,var(--lr-shell-ink) 9%,transparent);border-radius:999px;
  background:color-mix(in srgb,var(--lr-shell-ground) 65%,transparent);
  -webkit-backdrop-filter:blur(16px) saturate(1.12);backdrop-filter:blur(16px) saturate(1.12);
  box-shadow:inset 0 1px 1px rgb(255 255 255 / .78),0 4px 16px color-mix(in srgb,var(--lr-shell-ink) 7%,transparent);
  color:var(--lr-shell-ink);font:inherit;font-size:17px;font-weight:600;line-height:1.35;white-space:nowrap;
  cursor:pointer;touch-action:pan-y;opacity:clamp(0,1 - var(--lr-welcome-progress) * 4,1);
  transition:transform .42s var(--lr-welcome-ease),opacity .25s var(--lr-welcome-ease);
}
.lr-welcome-library-cue:hover {background:color-mix(in srgb,var(--lr-shell-ground) 86%,transparent)}
.lr-welcome-library-cue:focus-visible {outline:2px solid var(--lr-shell-focus);outline-offset:3px}
.lr-welcome-library-cue svg {flex:none}
.lr-welcome-library-pane {
  position:absolute;z-index:1;inset:0;min-width:0;
  transform:translateX(calc((1 - var(--lr-welcome-progress)) * 100%));
}
.lr-welcome[data-library-open="false"] .lr-welcome-library-pane{pointer-events:none}
@media(max-height:480px) {
  .lr-welcome.lr-empty{--lr-welcome-mark-size:66px;--lr-welcome-home-mark-y:calc(50% - 77px)}
  .lr-welcome-intro{top:calc(50% - 36px)}
  .lr-welcome-library-cue{bottom:16px;min-height:48px}
}
.lr-welcome .lr-empty-mark{
  --lr-welcome-tile-opacity:calc(1 - var(--lr-welcome-progress));
  isolation:isolate;position:absolute;top:0;left:50%;translate:-50% 0;
  width:100%;height:100%;margin:0;border-radius:31%;overflow:hidden;
  color:var(--lr-shell-ink);
  background:linear-gradient(150deg,color-mix(in srgb,var(--lr-shell-ground) calc(86% * var(--lr-welcome-tile-opacity)),transparent),
    color-mix(in srgb,var(--lr-shell-ground) calc(56% * var(--lr-welcome-tile-opacity)),transparent));
  border:1px solid color-mix(in srgb,var(--lr-shell-ink) calc(10% * var(--lr-welcome-tile-opacity)),transparent);
  box-shadow:inset 0 1px 2px rgb(255 255 255 / calc(.72 * var(--lr-welcome-tile-opacity))),
    0 8px 24px color-mix(in srgb,var(--lr-shell-ink) calc(9% * var(--lr-welcome-tile-opacity)),transparent);
  -webkit-backdrop-filter:blur(calc(18px * var(--lr-welcome-tile-opacity))) saturate(1.14);
  backdrop-filter:blur(calc(18px * var(--lr-welcome-tile-opacity))) saturate(1.14);
  transition:width .42s var(--lr-welcome-ease),height .42s var(--lr-welcome-ease),border-radius .42s var(--lr-welcome-ease),
    border-color .16s ease,box-shadow .25s ease;
  animation:lr-welcome-mark-in .32s ease-out both;
}
.lr-welcome .lr-empty-mark::before{
  content:"";position:absolute;inset:1px;border-radius:inherit;z-index:-1;pointer-events:none;
  background:radial-gradient(ellipse at 31% 0,rgb(255 255 255 / .30),transparent 72%);
  opacity:var(--lr-welcome-tile-opacity);
}
.lr-welcome .lr-empty-mark svg{
  position:absolute;left:50%;top:50%;translate:-50% -50%;width:min(46px,70%);height:auto;
  transition:left .42s var(--lr-welcome-ease),scale .42s var(--lr-welcome-ease);
}
.lr-welcome h1{
  font-size:clamp(34px,6vw,48px);font-weight:650;line-height:1.1;letter-spacing:-.045em;
  margin:0 0 clamp(11px,3vh,22px);color:var(--lr-shell-ink);
  --lr-welcome-rise:12px;--lr-welcome-rebound:-3px;--lr-welcome-scale:.98;
  animation:lr-welcome-enter .64s .17s backwards;transition:opacity .18s ease,translate .34s var(--lr-welcome-ease);
}
.lr-welcome .lr-empty-actions{display:flex;justify-content:center;gap:8px;margin:0;flex-wrap:wrap}
.lr-welcome .lr-welcome-action{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;
  padding:7px 13px;border:0;border-radius:999px;color:var(--lr-shell-ink);font:inherit;font-size:13px;font-weight:550;
  background:color-mix(in srgb,var(--lr-shell-ground) 76%,var(--lr-shell-raised));
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .72),inset 0 -1px 0 var(--lr-shell-rule),0 3px 9px color-mix(in srgb,var(--lr-shell-ink) 8%,transparent);
  cursor:pointer;transition:transform .16s cubic-bezier(.18,.8,.28,1),background-color .18s ease,box-shadow .18s ease,opacity .28s var(--lr-welcome-ease);
  --lr-welcome-rise:10px;--lr-welcome-rebound:-2px;--lr-welcome-scale:.97;
  animation:lr-welcome-enter .56s calc(320ms + 66ms * var(--lr-welcome-index)) backwards;
}
.lr-welcome .lr-welcome-action.is-primary{background:linear-gradient(155deg,#3971d7,#2255ad);color:#fff}
.lr-welcome .lr-welcome-action:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgb(255 255 255 / .76),0 5px 12px color-mix(in srgb,var(--lr-shell-ink) 14%,transparent)}
.lr-welcome .lr-welcome-action:active{transform:scale(.97)}
.lr-welcome .lr-welcome-action:focus-visible{outline:2px solid var(--lr-shell-focus);outline-offset:3px}
.lr-welcome .lr-welcome-action:focus-visible{animation:none}
.lr-welcome-drop-copy{
  position:absolute;inset:0 10% 0 40%;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:5px;text-align:center;opacity:0;visibility:hidden;transition:opacity .18s ease;
}
.lr-welcome-drop-title{font-size:clamp(16px,3.8cqw,22px);font-weight:650;white-space:nowrap}
.lr-welcome-drop-hint{color:var(--lr-shell-muted);font-size:12px;white-space:nowrap}
.lr-welcome-drop-hint:empty,.lr-welcome-drop-meter{display:none}
.lr-welcome[data-pdf-drop] .lr-empty-mark {
  width:min(560px,calc(100cqw - 34px));height:clamp(128px,38vh,216px);border-radius:36px;
}
.lr-welcome[data-pdf-drop] .lr-empty-mark svg{left:25%;scale:1.16}
.lr-welcome[data-pdf-drop] .lr-welcome-drop-copy{opacity:1;visibility:visible;transition-delay:.12s}
.lr-welcome[data-pdf-drop] .lr-welcome-intro,.lr-welcome[data-pdf-drop] .lr-welcome-library-cue{z-index:3}
.lr-welcome[data-pdf-drop] h1{opacity:0;translate:0 -10px}
.lr-welcome[data-pdf-drop] .lr-welcome-action{
  opacity:0;transition:transform .43s var(--lr-welcome-ease),opacity .32s .05s var(--lr-welcome-ease);
}
.lr-welcome[data-pdf-drop] .lr-welcome-action:first-child{transform:translate(43%,-40px) scale(.73)}
.lr-welcome[data-pdf-drop] .lr-welcome-action:last-child{transform:translate(-43%,-40px) scale(.73)}
.lr-welcome[data-pdf-drop] .lr-welcome-library-cue{opacity:0;transform:translate(-50%,-clamp(78px,22vh,176px)) scale(.73)}
.lr-welcome[data-pdf-drop="ready"] .lr-empty-mark{
  border-color:color-mix(in srgb,var(--lr-shell-focus) 64%,transparent);
  box-shadow:inset 0 1px 2px rgb(255 255 255 / .74),0 0 0 2px color-mix(in srgb,var(--lr-shell-focus) 13%,transparent),0 9px 28px color-mix(in srgb,var(--lr-shell-focus) 12%,transparent);
}
.lr-welcome[data-pdf-drop="loading"] .lr-welcome-drop-meter{
  display:block;width:min(94px,72%);height:3px;margin-top:4px;overflow:hidden;border-radius:999px;
  background:color-mix(in srgb,var(--lr-shell-focus) 14%,transparent);
}
.lr-welcome-drop-meter::before{
  content:"";display:block;width:42%;height:100%;border-radius:inherit;background:var(--lr-shell-focus);
  animation:lr-welcome-drop-load 1.16s ease-in-out infinite alternate;
}
@keyframes lr-welcome-drop-load{from{transform:translateX(-20%)}to{transform:translateX(158%)}}
@keyframes lr-welcome-mark-in{from{opacity:0}to{opacity:1}}
@keyframes lr-welcome-enter{
  0%{opacity:0;transform:translateY(var(--lr-welcome-rise)) scale(var(--lr-welcome-scale));animation-timing-function:cubic-bezier(.19,.74,.29,1)}
  57%{opacity:1;transform:translateY(var(--lr-welcome-rebound)) scale(1.008);animation-timing-function:cubic-bezier(.33,0,.4,1)}
  80%{transform:translateY(1px) scale(.998);animation-timing-function:cubic-bezier(.22,.68,.34,1)}
  100%{opacity:1;transform:translateY(0) scale(1)}
}
@media(prefers-reduced-motion:reduce){
  :is(.lr-welcome,.lr-welcome[data-pdf-drop]) :is(.lr-empty-mark,.lr-empty-mark svg,h1,.lr-welcome-action,.lr-welcome-drop-copy,.lr-welcome-library-cue),.lr-welcome-drop-meter::before{animation:none;transition:none}
}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){
  .lr-welcome :is(.lr-empty-mark,.lr-welcome-action,.lr-welcome-library-cue){-webkit-backdrop-filter:none;backdrop-filter:none}
  .lr-welcome .lr-empty-mark{background:color-mix(in srgb,var(--lr-shell-ground) calc(100% * var(--lr-welcome-tile-opacity)),transparent)}
}
`

    const HYBRID_POPUP_CSS = `
/* Gloss hybrid: original-position perspective and independent passage-session handles. */
.lr-root .lr-pop.is-hybrid.is-docked{position:fixed;right:20px;bottom:20px;top:auto;width:min(360px,calc(100vw - 40px));z-index:100}
.lr-root .lr-pop.is-hybrid{position:relative;display:flex;flex-direction:column;isolation:isolate;container-type:inline-size;container-name:gloss-popup;min-width:0;width:100%;max-width:100%;padding:0;border:0;border-radius:26px;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;filter:none;opacity:1;transform:none;transform-origin:50% 100%;transition:opacity .12s ease-out;pointer-events:auto}
.lr-root .lr-pop.is-hybrid>.lr-pop-head{position:relative;z-index:5;display:block;flex:none;width:100%;height:36px;min-height:36px;margin:0 0 8px;padding:4px 5px;border:0;border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 4%,transparent);backdrop-filter:blur(1px) saturate(1.06);-webkit-backdrop-filter:blur(1px) saturate(1.06);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 65%,transparent);opacity:1!important;transition:opacity .12s ease-out}
.lr-root .lr-pop.is-hybrid>.lr-pop-head::before,.lr-root .lr-pop.is-hybrid>.lr-pop-stage::before{display:none}
.lr-root .lr-pop.is-hybrid>:is(.lr-pop-head,.lr-pop-stage)::after{content:'';position:absolute;z-index:-1;inset:0;box-sizing:border-box;padding:3px;border-radius:inherit;background:linear-gradient(150deg,color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 72%,transparent),transparent 52%,color-mix(in srgb,var(--lr-shell-ground) 30%,transparent));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor;pointer-events:none}
.lr-root .lr-pop.is-hybrid .lr-glass-actions{display:flex;align-items:center;justify-content:flex-start;gap:2px;width:calc(100% - 132px);height:28px;min-width:0;overflow:visible}
.lr-root .lr-pop.is-hybrid .lr-glass-button{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;min-width:28px;min-height:28px;padding:0;border:0;border-radius:50%;background:transparent;box-shadow:none;color:var(--lr-shell-ink);transition:background .18s ease-out}
.lr-root .lr-pop.is-hybrid .lr-glass-button:hover{background:color-mix(in srgb,var(--lr-shell-ground) 24%,transparent)}
.lr-root .lr-pop.is-hybrid .lr-glass-button svg{width:16px;height:16px;stroke-width:1.65}
.lr-root .lr-pop.is-hybrid .lr-glass-palette{position:absolute;right:5px;top:4px;display:grid;grid-template-columns:repeat(6,20px);gap:1px;width:125px;height:28px;min-width:125px;align-items:center;margin:0;padding:0}
.lr-root .lr-pop.is-hybrid .lr-color-swatch{width:20px;height:28px;min-width:20px;min-height:28px;margin:0;padding:4px;border:0;border-radius:6px;background:transparent;outline:0;box-shadow:none;display:flex;align-items:center;justify-content:center;position:relative}
.lr-root .lr-pop.is-hybrid .lr-color-swatch::before{content:'';position:absolute;inset:8px 4px;border-radius:3px;background:var(--swatch)}
.lr-root .lr-pop.is-hybrid .lr-color-swatch.is-active::before{outline:1px solid color-mix(in srgb,var(--lr-shell-ink) 52%,transparent);outline-offset:2px}
.lr-root .lr-pop.is-hybrid :is(button,textarea):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.lr-root .lr-pop.is-hybrid .lr-color-swatch svg{position:relative;z-index:1;width:10px;height:10px;stroke-width:2;color:color-mix(in srgb,var(--lr-shell-ink) 74%,transparent)}
.lr-root .lr-pop.is-hybrid .lr-micro-ask{position:relative;flex:none;display:flex;align-items:center;width:0;min-width:0;max-width:100%;height:28px;margin:0;padding:0;border:0!important;outline:0!important;border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 20%,transparent);box-shadow:none!important;opacity:0;clip-path:none;overflow:hidden;pointer-events:none;transition:width .24s cubic-bezier(.2,.8,.2,1),opacity .18s ease-out}
.lr-root .lr-pop.is-hybrid .lr-micro-ask.is-open{width:96px;opacity:1;pointer-events:auto}
.lr-root .lr-pop.is-hybrid .lr-micro-entry{flex:none;display:flex;align-items:center;justify-content:flex-start;width:96px;max-width:100%;height:28px;min-height:28px;margin:0;padding:4px 9px;border:0!important;border-radius:inherit;background:transparent!important;box-shadow:none!important;color:var(--lr-shell-ink);font:inherit;font-size:12px;line-height:20px;text-align:left;white-space:nowrap;overflow:hidden}
.lr-root .lr-pop.is-hybrid .lr-micro-entry span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.lr-root .lr-pop.is-hybrid .lr-micro-ask::before,.lr-root .lr-pop.is-hybrid .lr-micro-ask::after,.lr-root .lr-pop.is-hybrid .lr-micro-entry::before,.lr-root .lr-pop.is-hybrid .lr-micro-entry::after{content:none!important;display:none!important;border:0!important;box-shadow:none!important;background:transparent!important}
.lr-root .lr-pop.is-hybrid .lr-micro-entry:focus{border:0!important;box-shadow:none!important}
.lr-root .lr-pop.is-hybrid .lr-micro-entry:focus:not(:focus-visible){outline:0!important}
.lr-root .lr-pop.is-hybrid .lr-micro-entry:focus-visible{outline:1.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent);outline-offset:-3px}
.lr-root .lr-pop.is-hybrid .lr-ask-toggle.is-placeholder{visibility:hidden;pointer-events:none}
.lr-root .lr-pop.is-hybrid>.lr-pop-stage{isolation:isolate;position:relative;flex:none;width:100%;min-width:0;border:0;border-radius:24px;background:color-mix(in srgb,var(--lr-shell-ground) 34%,transparent);backdrop-filter:blur(20px) saturate(1.12);-webkit-backdrop-filter:blur(20px) saturate(1.12);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 64%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink) 3%,transparent);opacity:1;overflow:hidden;transition:opacity .12s ease-out}
.lr-root .lr-pop.is-hybrid[data-pdf-surface=dark]>:is(.lr-pop-head,.lr-pop-stage){background:color-mix(in srgb,var(--lr-shell-ground) 64%,transparent)}
.lr-root .lr-pop.is-hybrid .lr-pop-scroll{position:absolute;inset:0;width:100%;height:100%;overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;overscroll-behavior:contain}
.lr-root .lr-pop.is-hybrid .lr-pop-content{padding:17px 18px;opacity:1!important;pointer-events:auto;transform:none;overflow-wrap:anywhere}
.lr-root .lr-pop.is-hybrid :is(.lr-pop-body,.lr-answer,.lr-chat-assistant){font-size:14px;line-height:1.8;color:var(--lr-shell-ink);background:transparent;filter:none}
.lr-root .lr-pop.is-hybrid.has-answer .lr-pop-content{padding-bottom:96px}
.lr-root .lr-pop.is-hybrid .lr-followup{height:auto;min-height:44px;max-height:96px;padding:6px 12px;border-top:1px solid color-mix(in srgb,var(--lr-shell-ink) 7%,transparent);background:color-mix(in srgb,var(--lr-shell-ground) 20%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:1;visibility:visible;pointer-events:auto}
.lr-root .lr-pop.is-hybrid .lr-followup-input{min-height:28px;height:28px;max-height:72px;resize:none!important;background:transparent!important;border:0;box-shadow:none;line-height:20px;overflow-y:auto}
.lr-root .lr-pop.is-hybrid .lr-pop-perspective-outline{position:absolute;inset:0;border:1px solid color-mix(in srgb,var(--lr-shell-ink) 22%,var(--lr-shell-ground));border-radius:26px;opacity:0;pointer-events:none;transition:opacity .12s ease-out}
.lr-root .lr-pop.is-hybrid .lr-pop-handle{position:absolute;left:50%;bottom:-5px;width:120px;height:10px;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--lr-shell-ink) 14%,transparent);border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 35%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 72%,transparent);opacity:.65;pointer-events:none;transition:opacity .12s ease-out}
.lr-root .lr-pop.is-hybrid.is-perspective,.lr-root .lr-pop-anchor.is-hybrid-anchor.is-perspective{pointer-events:none!important}
.lr-root .lr-pop-anchor.is-hybrid-anchor.is-session-hidden{pointer-events:none!important}
.lr-root .lr-pop.is-hybrid.is-perspective>:is(.lr-pop-head,.lr-pop-stage){opacity:0!important;pointer-events:none;transform:none}
.lr-root .lr-pop.is-hybrid.is-perspective .lr-pop-perspective-outline{opacity:.8}
.lr-root .lr-pop.is-hybrid.is-perspective .lr-pop-handle{opacity:1}
.lr-root .lr-pop.is-hybrid.has-answer{transition:opacity .12s ease-out,transform .24s cubic-bezier(.2,.8,.2,1)}
.lr-root .lr-pop.is-hybrid.has-answer>.lr-pop-stage{transition:height .24s cubic-bezier(.2,.8,.2,1),opacity .12s ease-out}
.lr-root .lr-pop.is-hybrid.is-session-hidden{opacity:0;pointer-events:none!important;transform:translate(var(--lr-collapse-x,0px),var(--lr-collapse-y,0px)) scale(var(--lr-collapse-sx,.3),var(--lr-collapse-sy,.1))}
.lr-root .lr-pop.is-hybrid.is-session-hidden:not(.is-morphing),.lr-root .lr-pop-anchor.is-hybrid-anchor.is-session-hidden:not(.is-morphing){display:none}
.lr-root .lr-pop-anchor.is-hybrid-anchor::after{display:none}
.lr-root .lr-pop-anchor.is-hybrid-anchor.is-morphing{transition:left .3s cubic-bezier(.2,.8,.2,1),top .3s cubic-bezier(.2,.8,.2,1)}



.lr-root .lr-session-history{position:absolute;z-index:30;bottom:calc(100% + 5px);left:10px;width:min(350px,calc(100% - 20px));max-height:320px;overflow:auto;padding:10px;border:0;border-radius:20px;background:color-mix(in srgb,var(--lr-shell-ground) 70%,transparent);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--lr-shell-ground) 75%,transparent),0 2px 6px color-mix(in srgb,var(--lr-shell-ink) 3%,transparent);color:var(--lr-shell-ink)}
.lr-root .lr-session-history-title{display:flex;align-items:center;justify-content:space-between;padding:0 5px 8px;font-size:12px;font-weight:600}.lr-root .lr-session-history-title svg{width:14px;height:14px}
.lr-root .lr-session-history-row{display:flex;align-items:center;gap:4px;padding:3px;border-radius:10px}.lr-root .lr-session-history-row:hover{background:color-mix(in srgb,var(--lr-shell-ink) 4%,transparent)}
.lr-root .lr-session-history-open{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;padding:7px 6px;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.lr-root .lr-session-history-question{font-size:12px;line-height:1.6;overflow-wrap:anywhere}.lr-root .lr-session-history-quote{font-size:11px;line-height:1.6;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--lr-shell-muted)}.lr-root .lr-session-history-meta{font-size:11px;line-height:1.5;color:var(--lr-shell-muted)}
@container gloss-popup (max-width:340px){.lr-root .lr-pop.is-hybrid .lr-micro-ask{position:absolute;z-index:8;left:32px;top:40px;max-width:calc(100% - 40px);border-radius:16px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.lr-root .lr-pop.is-hybrid .lr-micro-ask.is-open{width:calc(100% - 40px)}.lr-root .lr-pop.is-hybrid .lr-micro-entry{width:100%}}
.lr-root .lr-pop:is(.is-session-hidden,.is-perspective) .lr-reply-waiting-dot{animation-play-state:paused}
.lr-brief-waiting{display:grid;place-items:center;width:100%;height:100%;min-height:160px}
.lr-reply-waiting.is-large{width:72px;min-width:72px;height:40px;min-height:40px;margin:0;padding:13px 17px}
.lr-reply-waiting.is-large .lr-reply-waiting-dots{gap:6px}
.lr-reply-waiting.is-large .lr-reply-waiting-dot{width:7px;height:7px}
@media(prefers-reduced-motion:reduce){.lr-root .lr-pop.is-hybrid,.lr-root .lr-pop.is-hybrid *,.lr-root .lr-pop-anchor.is-hybrid-anchor{animation:none!important;transition-duration:.08s!important;transform:none!important}.lr-root .lr-pop.is-hybrid .lr-micro-ask{transition:opacity .08s ease-out!important;clip-path:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-pop.is-hybrid>:is(.lr-pop-head,.lr-pop-stage),.lr-root .lr-session-bar,.lr-root .lr-session-history{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-root .lr-pop.is-hybrid>:is(.lr-pop-head,.lr-pop-stage)::after{backdrop-filter:none;-webkit-backdrop-filter:none}}

/* Functional PDF mode control: quiet track, thin active lens; no black frame. */
.lr-root .lr-pdf-mode{display:flex;align-items:center;flex:none;gap:2px;padding:2px;margin-right:4px;border:0;border-radius:999px;background:color-mix(in srgb,var(--lr-shell-ground) 5%,transparent);box-shadow:none;pointer-events:auto}
.lr-root .lr-pdf-mode button{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;min-width:36px;height:26px;padding:0 7px;border:0;border-radius:999px;background:transparent;color:var(--lr-shell-muted);font-size:11px;font-weight:500;line-height:1;cursor:pointer;transition:background .18s ease,color .18s ease,transform .18s ease}
.lr-root .lr-pdf-mode button.is-active{background:color-mix(in srgb,var(--lr-shell-ground) 32%,transparent);color:var(--lr-shell-ink);box-shadow:0 1px 3px rgb(24 38 58 / .025)}
.lr-root .lr-pdf-mode button.is-active::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-2;pointer-events:none;background:transparent;backdrop-filter:blur(1px) saturate(1.12);-webkit-backdrop-filter:blur(1px) saturate(1.12)}
@supports (mask-composite:exclude) or (-webkit-mask-composite:xor){.lr-root .lr-pdf-mode button.is-active::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;padding:3px;background:linear-gradient(140deg,rgb(255 255 255 / .5),rgb(255 255 255 / .1));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:none;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor}}
.lr-root .lr-pdf-mode button:focus-visible{outline:2px solid color-mix(in srgb,var(--gloss-accent) 42%,transparent);outline-offset:2px}
.lr-root .lr-pdf-mode button:active{transform:scale(.98)}
.lr-root .lr-reader-chrome{grid-template-columns:66px minmax(0,1fr) 230px 30px}
.lr-root .lr-pdf[data-pdf-appearance="dark"] .lr-annotation-layer{mix-blend-mode:normal}
.lr-root .lr-page[data-pdf-surface="dark"] .lr-annotation-layer{mix-blend-mode:normal}
.lr-root .lr-pdf[data-pdf-appearance="dark"] .lr-page{background:#2f333d}
.lr-root .lr-annotation.is-underline{border-radius:1px}
@container gloss-paper (max-width:600px){.lr-root .lr-reader-chrome{grid-template-columns:minmax(0,1fr) 230px 30px}}
@container gloss-paper (max-width:440px){.lr-root .lr-reader-chrome{grid-template-columns:minmax(0,1fr) 30px}.lr-root .lr-reader-chrome>.lr-reader-leading{grid-column:1;grid-row:1}.lr-root .lr-reader-chrome>.lr-title-pill{grid-column:1 / 3;grid-row:2}.lr-root .lr-reader-chrome .lr-reader-controls{grid-column:1 / 3;grid-row:3;justify-self:center}.lr-root .lr-reader-chrome .lr-reader-panel{grid-column:2;grid-row:1}.lr-root .lr-source-body.is-pdf{padding-top:150px;scroll-padding-top:158px}}
@media(pointer:coarse){.lr-root .lr-pdf-mode button{height:30px;min-width:39px}.lr-root .lr-reader-chrome{grid-template-columns:78px minmax(0,1fr) 248px 36px}@container gloss-paper (max-width:600px){.lr-root .lr-reader-chrome{grid-template-columns:minmax(0,1fr) 248px 36px}}@container gloss-paper (max-width:440px){.lr-root .lr-reader-chrome{grid-template-columns:minmax(0,1fr) 36px}.lr-root .lr-source-body.is-pdf{padding-top:166px;scroll-padding-top:174px}}}
@media(prefers-reduced-motion:reduce){.lr-root .lr-pdf-mode button{transition:none;transform:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-pdf-mode{background:var(--lr-shell-ground)}.lr-root .lr-pdf-mode button.is-active{background:var(--lr-shell-control);box-shadow:none}.lr-root .lr-pdf-mode button::before,.lr-root .lr-pdf-mode button::after{display:none}}

/* The header is the only persistent local-conversation shortcut. */
.lr-root .lr-reader-chrome>.lr-reader-leading{margin-left:0}
.lr-root .lr-session-header{position:absolute;z-index:24;left:auto;right:0;top:42px;width:var(--lr-reader-chip-width,96px);height:var(--lr-reader-chip-height,36px);min-width:0;pointer-events:auto;transform:none;transition:none}
.lr-root .lr-reader-chrome.is-collapsed>.lr-session-header{transform:none}
.lr-root .lr-session-toggle{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;padding:0 11px;overflow:hidden;border-radius:999px;color:var(--lr-shell-ink);font:inherit;font-size:12px;font-weight:500;line-height:1.4;white-space:nowrap;cursor:pointer;transition:background .18s ease,box-shadow .18s ease}
.lr-root .lr-session-toggle>svg{width:17px;height:17px;flex:none;stroke-width:1.7}
.lr-root .lr-session-toggle:is(:hover,[aria-expanded=true]){filter:brightness(1.015)}
.lr-root .lr-session-toggle:focus-visible{outline:1px solid color-mix(in srgb,var(--lr-shell-ink) 35%,transparent);outline-offset:2px}
.lr-root .lr-session-header>.lr-session-history{top:calc(100% + 8px);bottom:auto;left:0;width:min(300px,calc(100cqw - 24px));max-width:calc(100vw - 24px);max-height:320px;padding:12px;border:0;border-radius:22px;background:color-mix(in srgb,var(--lr-shell-ground) 48%,transparent);backdrop-filter:blur(20px) saturate(1.06);-webkit-backdrop-filter:blur(20px) saturate(1.06);box-shadow:inset 0 1px 1px color-mix(in srgb,var(--lr-shell-ground) 76%,transparent),0 2px 8px color-mix(in srgb,var(--lr-shell-ink) 3%,transparent);overscroll-behavior:contain;scrollbar-width:thin;overflow:auto}
.lr-root .lr-session-history-row{padding:1px;border-radius:14px}.lr-root .lr-session-history-open{width:100%;padding:9px 8px;border-radius:13px;min-height:40px}.lr-root .lr-session-history-open:hover{background:color-mix(in srgb,var(--lr-shell-ground) 20%,transparent)}
.lr-root .lr-session-history-open:focus-visible{outline:1px solid color-mix(in srgb,var(--lr-shell-ink) 36%,transparent);outline-offset:-1px}
.lr-root .lr-session-empty{margin:5px 6px 9px;color:var(--lr-shell-muted);font-size:12px;line-height:1.7}
.lr-root .lr-header-fallback-title{align-items:flex-start}.lr-root .lr-header-fallback-title>.lr-session-header{position:absolute;left:auto;right:0;top:calc(100% + 6px);width:96px;height:36px}.lr-root .lr-header-fallback-title>.lr-title-pill{flex:1;min-width:0}.lr-root>.lr-head.has-fallback-title{height:138px;min-height:138px;flex-basis:138px}
.lr-root .lr-pop.is-hybrid.is-session-hidden:not(.is-morphing){transform:none!important}

/* These two capsules share material, geometry and icon rhythm. */
.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed,.lr-root .lr-session-toggle{isolation:isolate;border:1px solid color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) var(--gloss-thin-rim-level,68%),transparent);border-radius:999px;background:color-mix(in srgb,var(--gloss-thin-surface,var(--lr-shell-ground)) var(--gloss-thin-fill,1.5%),transparent);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 64%,transparent),inset 0 -1px 0 color-mix(in srgb,var(--lr-shell-ink) 2.5%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink) 2.5%,transparent)}
.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed::before,.lr-root .lr-session-toggle::before{content:'';position:absolute;inset:3px;z-index:-2;border-radius:inherit;background:transparent;backdrop-filter:blur(1px) saturate(1.06);-webkit-backdrop-filter:blur(1px) saturate(1.06);pointer-events:none}
.lr-root .lr-session-toggle::after{display:none}
@supports(mask-composite:exclude) or (-webkit-mask-composite:xor){.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed::after,.lr-root .lr-session-toggle::after{content:'';display:block;position:absolute;inset:0;z-index:-1;box-sizing:border-box;padding:3px;border-radius:inherit;background:radial-gradient(110% 170% at var(--lr-glass-x,50%) 0%,color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 62%,transparent),transparent 75%),linear-gradient(180deg,color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 14%,transparent),transparent 48%,color-mix(in srgb,var(--lr-shell-ink) 2%,transparent));backdrop-filter:blur(8px) saturate(1.12);-webkit-backdrop-filter:blur(8px) saturate(1.12);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor;pointer-events:none}}
.lr-root .lr-source-body.is-pdf{padding-top:var(--lr-session-safe-padding,106px)!important;scroll-padding-top:calc(var(--lr-session-safe-padding,106px) + 8px)}
@container gloss-paper (max-width:600px){.lr-root .lr-reader-chrome>.lr-reader-leading{margin-left:138px}.lr-root .lr-reader-chrome>.lr-title-pill{width:100%;justify-self:center}}
@container gloss-paper (max-width:440px){.lr-root .lr-reader-chrome>.lr-title-pill{width:100%}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed,.lr-root .lr-session-toggle{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed::before,.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed::after,.lr-root .lr-session-toggle::before,.lr-root .lr-session-toggle::after{display:none}}
/* Both editors are clear inside a single gently layered glass surface. */
.lr-root .lr-pop.is-hybrid form.lr-followup,.lr-root .lr-pop.is-hybrid form.lr-followup-form{left:8px;right:8px;bottom:8px;width:auto;padding:6px 9px;gap:7px;border:0!important;outline:0!important;border-radius:18px;background:color-mix(in srgb,var(--lr-shell-ground) 20%,transparent);background-image:none;backdrop-filter:blur(14px) saturate(1.12);-webkit-backdrop-filter:blur(14px) saturate(1.12);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 66%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink) 2%,transparent)!important;transform:none;transition:background .22s ease,backdrop-filter .24s ease,box-shadow .24s ease}
.lr-root .lr-pop.is-hybrid form.lr-followup:is(:focus,:focus-visible,:focus-within),.lr-root .lr-pop.is-hybrid form.lr-followup-form:is(:focus,:focus-visible,:focus-within){border:0!important;outline:0!important;background:color-mix(in srgb,var(--lr-shell-ground) 30%,transparent);backdrop-filter:blur(18px) saturate(1.16);-webkit-backdrop-filter:blur(18px) saturate(1.16);box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 90%,transparent),0 2px 6px color-mix(in srgb,var(--lr-shell-ink) 3%,transparent)!important;transform:none}
.lr-root .lr-pop.is-hybrid form :is(textarea.lr-followup-input,textarea.lr-followup-input:focus,textarea.lr-followup-input:focus-visible){border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;background:transparent!important;background-image:none!important;resize:none!important;appearance:none;-webkit-appearance:none;filter:none}
.lr-root .lr-pop.is-hybrid form .lr-followup-input::before,.lr-root .lr-pop.is-hybrid form .lr-followup-input::after{content:none!important;display:none!important}
.lr-root .lr-pop.is-hybrid .lr-followup-input::placeholder{color:var(--lr-shell-muted);opacity:1}
@container gloss-paper (max-width:600px){.lr-root .lr-reader-chrome>.lr-reader-leading{margin-left:138px}.lr-root .lr-reader-chrome>.lr-title-pill{width:100%;justify-self:center}}
@container gloss-paper (max-width:440px){.lr-root .lr-reader-chrome>.lr-reader-leading{margin-left:138px}}
@media(prefers-reduced-motion:reduce){.lr-root .lr-session-header,.lr-root .lr-session-toggle,.lr-root .lr-pop.is-hybrid form.lr-followup{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-session-toggle,.lr-root .lr-session-header>.lr-session-history,.lr-root .lr-pop.is-hybrid form.lr-followup,.lr-root .lr-pop.is-hybrid form.lr-followup:focus-within{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}}

/* Clear editor; focus is a neutral material change, never a native outline. */
.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer{border:0!important;outline:0!important;border-radius:24px;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 16%,transparent);backdrop-filter:blur(18px) saturate(1.12);-webkit-backdrop-filter:blur(18px) saturate(1.12);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground,var(--dsw-alias-bg-overlay))) 66%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 2%,transparent)!important;transform:none;transition:background .22s ease,backdrop-filter .24s ease,box-shadow .24s ease}
.lr-research-conversation form.lr-ideas-composer:is(:focus,:focus-visible,:focus-within),.lr-root section.lr-research-conversation form.lr-ideas-composer:is(:focus,:focus-visible,:focus-within),.lr-root section.lr-research-conversation form.lr-ideas-composer:has(.lr-ideas-conversation-input:focus-visible){border:0!important;outline:0!important;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)) 26%,transparent);backdrop-filter:blur(22px) saturate(1.16);-webkit-backdrop-filter:blur(22px) saturate(1.16);box-shadow:inset 0 1px 1px color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground,var(--dsw-alias-bg-overlay))) 90%,transparent),0 2px 6px color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 3%,transparent)!important;transform:none}
.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input,.lr-root section.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input,.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input:is(:focus,:focus-visible),.lr-root section.lr-research-conversation form.lr-ideas-composer textarea.lr-ideas-conversation-input:is(:focus,:focus-visible){border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;background:transparent!important;background-image:none!important;resize:none!important;appearance:none;-webkit-appearance:none;filter:none}
.lr-research-conversation form.lr-ideas-composer textarea::before,.lr-research-conversation form.lr-ideas-composer textarea::after{content:none!important;display:none!important}
@media(prefers-reduced-motion:reduce){.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-research-conversation form.lr-ideas-composer,.lr-root section.lr-research-conversation form.lr-ideas-composer,.lr-research-conversation form.lr-ideas-composer:focus-within,.lr-root section.lr-research-conversation form.lr-ideas-composer:focus-within{background:var(--lr-shell-ground,var(--dsw-alias-bg-overlay));backdrop-filter:none;-webkit-backdrop-filter:none}}

/* One source-right anchor and two identical button bodies; resizing never morphs them. */
.lr-root .lr-paper-stack{position:absolute;z-index:25;right:12px;top:var(--lr-reader-chrome-top,16px);display:grid;grid-auto-rows:var(--lr-reader-chip-height,36px);gap:6px;width:var(--lr-reader-chip-width,96px);margin:0;padding:0;pointer-events:none;transform:none;transition:none}
.lr-root .lr-paper-stack.is-expanded{top:calc(var(--lr-reader-chrome-top,16px) + var(--lr-stack-expanded-y,42px))}
.lr-root .lr-paper-stack>.lr-session-header{position:relative;inset:auto!important;display:block;width:100%!important;height:var(--lr-reader-chip-height,36px)!important;min-width:0;margin:0;padding:0;transform:none!important;transition:none}
.lr-root .lr-paper-stack>.lr-stack-book[hidden]{display:none!important}
.lr-root .lr-paper-stack .lr-stack-pill{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;flex:none;gap:6px;width:100%;height:var(--lr-reader-chip-height,36px);min-height:0;min-width:0;margin:0;padding:0 11px;box-sizing:border-box;overflow:hidden;border:1px solid color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) var(--gloss-thin-rim-level,68%),transparent);border-radius:999px;background:color-mix(in srgb,var(--gloss-thin-surface,var(--lr-shell-ground)) var(--gloss-thin-fill,1.5%),transparent);color:var(--lr-shell-ink);font:inherit;font-size:12px;font-weight:500;line-height:1.4;white-space:nowrap;backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 64%,transparent),inset 0 -1px 0 color-mix(in srgb,var(--lr-shell-ink) 2.5%,transparent),0 1px 4px color-mix(in srgb,var(--lr-shell-ink) 2.5%,transparent);filter:none;transform:none;transition:background .18s ease,box-shadow .18s ease;pointer-events:auto;cursor:pointer}
.lr-root .lr-paper-stack .lr-stack-pill:is(:hover,[aria-expanded=true]){background:color-mix(in srgb,var(--gloss-thin-surface,var(--lr-shell-ground)) 6%,transparent);filter:none;transform:none}
.lr-root .lr-paper-stack .lr-stack-pill>svg{width:17px;height:17px;flex:none;stroke-width:1.7}
.lr-root .lr-paper-stack .lr-stack-pill::before{content:'';display:block;position:absolute;inset:3px;z-index:-2;border-radius:inherit;background:transparent;backdrop-filter:blur(1px) saturate(1.06);-webkit-backdrop-filter:blur(1px) saturate(1.06);pointer-events:none}
.lr-root .lr-paper-stack .lr-stack-pill::after{display:none}
@supports(mask-composite:exclude) or (-webkit-mask-composite:xor){.lr-root .lr-paper-stack .lr-stack-pill::after{content:'';display:block;position:absolute;inset:0;z-index:-1;box-sizing:border-box;padding:3px;border-radius:inherit;background:radial-gradient(110% 170% at var(--lr-glass-x,50%) 0%,color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 62%,transparent),transparent 75%),linear-gradient(180deg,color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 14%,transparent),transparent 48%,color-mix(in srgb,var(--lr-shell-ink) 2%,transparent));backdrop-filter:blur(8px) saturate(1.12);-webkit-backdrop-filter:blur(8px) saturate(1.12);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor;pointer-events:none}}
.lr-root .lr-paper-stack .lr-stack-pill:focus-visible{outline:1px solid color-mix(in srgb,var(--lr-shell-ink) 35%,transparent);outline-offset:2px}
.lr-root .lr-reader-chrome>.lr-title-pill.is-collapsed{width:100%;height:36px;min-height:36px;padding:6px 12px;opacity:0;visibility:hidden;pointer-events:none;transform:none!important;transition:none}
@media(prefers-reduced-motion:reduce){.lr-root .lr-paper-stack .lr-stack-pill{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-paper-stack .lr-stack-pill{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}.lr-root .lr-paper-stack .lr-stack-pill::before,.lr-root .lr-paper-stack .lr-stack-pill::after{display:none}}

.lr-root .lr-pop.is-hybrid .lr-pop-scroll,.lr-root .lr-pop.is-hybrid .lr-pop-content,.lr-root .lr-pop.is-hybrid .lr-chat-turn{overflow-anchor:none;scroll-behavior:auto}

/* Chosen summary conversation capsule: click-only, no close icon, no hover-open. */
.lr-root .lr-session-capsule{position:absolute;z-index:9;display:flex;align-items:center;justify-content:flex-start;gap:8px;margin:0;padding:7px 12px;border:1px solid color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 58%,transparent);border-radius:19px;background:color-mix(in srgb,var(--lr-shell-ground) 42%,transparent);backdrop-filter:blur(18px) saturate(1.12);-webkit-backdrop-filter:blur(18px) saturate(1.12);box-shadow:inset 0 1px 1px color-mix(in srgb,var(--lr-shell-ground) 76%,transparent),0 2px 7px color-mix(in srgb,var(--lr-shell-ink) 3%,transparent);color:var(--lr-shell-ink);text-align:left;touch-action:none;user-select:none;cursor:pointer;transform-origin:0 0;overflow:hidden;transition:background .18s ease}
.lr-root .lr-session-capsule>svg{width:20px;height:20px;flex:none;stroke-width:1.7}.lr-root .lr-session-capsule>span{display:block;min-width:0;max-width:100%}.lr-root .lr-session-capsule strong{display:block;font-size:12px;line-height:18px;font-weight:500;white-space:nowrap}.lr-root .lr-session-capsule small{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:15px;color:var(--lr-shell-muted)}
.lr-root .lr-session-capsule:hover{background:color-mix(in srgb,var(--lr-shell-ground) 52%,transparent)}.lr-root .lr-session-capsule.is-ghost{opacity:0;pointer-events:none}.lr-root .lr-session-capsule.is-closing-target{pointer-events:auto}.lr-root .lr-session-capsule.is-dragging{z-index:120;transition:none;cursor:grabbing}.lr-root .lr-session-capsule:focus-visible{outline:1px solid color-mix(in srgb,var(--lr-shell-ink) 45%,transparent);outline-offset:2px}
.lr-root .lr-pop-anchor.is-session-hidden.is-morphing{display:block!important}.lr-root .lr-pop.is-hybrid.is-session-hidden.is-morphing{display:flex!important;opacity:1;transform:none;pointer-events:none!important}.lr-root .lr-pop.is-hybrid.is-morphing{transition:none!important}
.lr-root .lr-session-history-collect{flex:none;padding:5px 7px;border:0;border-radius:10px;background:color-mix(in srgb,var(--lr-shell-ground) 18%,transparent);color:var(--lr-shell-muted);font-size:11px;line-height:1.5;cursor:pointer}.lr-root .lr-paper-stack .lr-stack-pill.is-drop-target{background:color-mix(in srgb,var(--lr-shell-ground) 36%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 78%,transparent),0 2px 7px color-mix(in srgb,var(--lr-shell-ink) 4%,transparent)}
@media(prefers-reduced-motion:reduce){.lr-root .lr-session-capsule{transition:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lr-root .lr-session-capsule{background:var(--lr-shell-ground);backdrop-filter:none;-webkit-backdrop-filter:none}}

/* Keep a small local entry even when a verified blank cannot be found. */
.lr-root .lr-session-capsule.is-mini{gap:6px;padding:4px 9px;border-radius:15px}.lr-root .lr-session-capsule:is(.is-mini,.is-icon)>svg{width:16px;height:16px}.lr-root .lr-session-capsule.is-mini strong{font-size:12px;line-height:20px}.lr-root .lr-session-capsule:is(.is-mini,.is-icon) small{display:none}.lr-root .lr-session-capsule.is-icon{padding:0;gap:0;justify-content:center;border-radius:11px}.lr-root .lr-session-capsule.is-icon>span{display:none}
.lr-root .lr-session-capsule.is-fallback{background:color-mix(in srgb,var(--lr-shell-ground) 9%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--gloss-thin-rim,var(--lr-shell-ground)) 60%,transparent),0 1px 3px color-mix(in srgb,var(--lr-shell-ink) 2%,transparent)}.lr-root .lr-session-capsule.is-fallback:hover{background:color-mix(in srgb,var(--lr-shell-ground) 22%,transparent)}

`

    function Panel() {
      const [initial] = useState(loadStore)
      const [paper, setPaper] = useState(initial.paper || null)
      const [identityReady, setIdentityReady] = useState(!initial.paper)
      const paperRef = useRef(paper)
      const [paragraphs, setParagraphs] = useState(initial.paragraphs || [])
      const [outline, setOutline] = useState(initial.outline || '')
      const [overview, setOverview] = useState(initial.overview || '')
      const overviewRef = useRef(overview)
      const [sections, setSections] = useState(initial.sections || [])
      const [critique, setCritique] = useState(initial.critique || '')
      const [terms, setTerms] = useState(initial.terms || '')
      const mode = initial.mode || 'guided'
      const [focus, setFocus] = useState(initial.focus || '')
      const [tab, setTab] = useState(normalizeTab(initial.tab))
      const [structure, setStructure] = useState(initial.structure || null)
      const [structureBusy, setStructureBusy] = useState(false)
      const [cards, setCards] = useState(initial.cards || [])
      const [annotations, setAnnotations] = useState(initial.annotations || [])
      const [ideas, setIdeas] = useState(initial.ideas || [])
      const [selectionThreads, setSelectionThreads] = useState(initial.selectionThreads || [])
      const [readingState, setReadingState] = useState(initial.readingState || {})
      const [pdfPosition, setPdfPosition] = useState(initial.pdfPosition ? { ...initial.pdfPosition, intent: 'programmatic' } : null)
      const [chapterEntryKey, setChapterEntryKey] = useState(0)
      const [outlineChapterKey, setOutlineChapterKey] = useState(0)
      const [citationState, setCitationState] = useState(initial.citationState || {})
      const [tabPositions, setTabPositions] = useState(initial.tabPositions || {})
      const [activeReference, setActiveReference] = useState(null)
      const [selectedQuote, setSelectedQuote] = useState(null)
      const [featureModules, setFeatureModules] = useState({})
      const [featureError, setFeatureError] = useState('')
      const [cardsBusy, setCardsBusy] = useState(false)
      const [activeCard, setActiveCard] = useState(null)
      const [activeSection, setActiveSection] = useState(null)
      const [tocOpen, setTocOpen] = useState(false)
      const [busy, setBusy] = useState(null)
      const [progress, setProgress] = useState(null)
      const [error, setError] = useState('')
      const [notice, setNoticeState] = useState(() => ({
        message: initial.migrated ? '已升级文献隔离。旧版未绑定文献的分析已备份隔离，请重新生成。' : '',
        revision: 0,
      }))
      function setNotice(update) {
        setNoticeState(previous => {
          const functional = typeof update === 'function'
          const message = functional ? update(previous.message) : update
          if ((functional || !message) && message === previous.message) return previous
          return { message, revision: previous.revision + 1 }
        })
      }
      const noticeDuration = Math.min(6400, 3800 + notice.message.length * 24)
      useEffect(() => {
        if (!notice.message) return undefined
        const timeout = setTimeout(() => {
          setNoticeState(current => current === notice ? { ...current, message: '' } : current)
        }, noticeDuration)
        return () => clearTimeout(timeout)
      }, [notice, noticeDuration])
      const [catalog, setCatalog] = useState(() => loadLibrary(initial.library))
      const catalogRef = useRef(catalog)
      const library = catalog.documents
      const [libraryOpen, setLibraryOpen] = useState(false)
      const [libraryTab, setLibraryTab] = useState('saved')
      const [libraryOperation, setLibraryOperation] = useState({})
      useEffect(() => {
        if (!libraryOperation.error && !libraryOperation.message) return
        const timeout = setTimeout(() => setLibraryOperation((current) => current === libraryOperation ? {} : current), libraryOperation.error ? 8500 : 4200)
        return () => clearTimeout(timeout)
      }, [libraryOperation])
      const [lookupState, setLookupState] = useState({ items: [] })
      const [librarySettingsState, setLibrarySettingsState] = useState({})
      const [libraryZoteroSelection, setLibraryZoteroSelection] = useState(null)
      const libraryRecoveryRef = useRef(false)
      const attachTargetRef = useRef(null)
      const lookupTargetRef = useRef(null)
      const [cardLocating, setCardLocating] = useState(false)
      const [zoteroState, setZoteroState] = useState({ loading: false, error: null, code: null, items: [] })
      const [sourceOpen, setSourceOpen] = useState(true)
      const [sourceTab, setSourceTab] = useState('text')
      const [pdfDoc, setPdfDoc] = useState(null)
      const [paneResizing, setPaneResizing] = useState(false)
      const [paneWidth, setPaneWidth] = useState(Number(initial.paneWidth) || Math.min(920, Math.max(500, Math.round((window.innerWidth || 1200) * .56))))
      const [fitWidth, setFitWidth] = useState(true)
      const [zoom, setZoom] = useState(1)
      const [baseWidth, setBaseWidth] = useState(0)
      const [fitScale, setFitScale] = useState(0)
      const [popup, setPopup] = useState(null)
      const [sessionBars, setSessionBars] = useState([])
      const [sessionListOpen, setSessionListOpen] = useState(false)
      const [chromeState, setChromeState] = useState(() => ({ ...initial.chromeState, titleCollapsed: false }))
      useEffect(() => { const owner = paper && paper.id; return () => { if (owner) pdfAppearanceCache.clearDocument(owner) } }, [paper && paper.id])
      const [referenceReturn, setReferenceReturn] = useState(null)
      const fileRef = useRef(null)
      const saveTimer = useRef(null)
      const sourceRef = useRef(null)
      const tocContainerRef = useRef(null)
      const tocOpenRef = useRef(tocOpen)
      const sessionMenuRef = useRef(null)
      const sessionListOpenRef = useRef(sessionListOpen)
      const outlineRequestRef = useRef(0)
      const outlineTargetRef = useRef(null)
      const readerChromeRef = useRef(null)
      const paperStackRef = useRef(null)
      const paneResizeRef = useRef(null)
      const readerChromeFoldRef = useRef({ timer: null, startedAt: 0, userUntil: 0, userScrolled: false, hover: false, focused: false })
      const paperFocusScrollRef = useRef(null)
      const referenceOriginRef = useRef(null)
      const referenceLocateRef = useRef(0)
      const referenceReturnButtonRef = useRef(null)
      const referenceTargetRef = useRef(null)
      const referenceReturnWidthRef = useRef(96)
      const pdfDocRef = useRef(null)
      const pdfBytesRef = useRef(null)
      const locatorRef = useRef(null)
      const epochRef = useRef(0)
      const requestsRef = useRef(new Map())
      const restorationRef = useRef(null)
      const documentCacheRef = useRef(new Map())
      const storageQueueRef = useRef(Promise.resolve())
      const activeCardRef = useRef(null)
      const cardRequestRef = useRef(0)
      const snapshotRef = useRef(null)
      const snapshotBaseRef = useRef(initial)
      const popupRef = useRef(null)
      const popupOriginRef = useRef(null)
      const popupMorphRef = useRef(null)
      const selectionThreadsRef = useRef(selectionThreads)
      const sessionBarsRef = useRef([])
      const capsuleSampleRef = useRef(null)
      const sessionMotionRef = useRef(null), sessionMotionSequence = useRef(0), sessionDragRef = useRef(null), sessionClickSuppress = useRef(null), sessionCollectAnimations = useRef(new Set())
      const recentPopupRef = useRef(null)
      const sessionRestoreRef = useRef(0)
      const sessionHoverRef = useRef(null)
      const popupPointerRef = useRef({ x: null, y: null, at: 0, documentId: null })
      const sessionMountedRef = useRef(true)
      const contentScrollRef = useRef(null)
      const skimAttemptRef = useRef(new Set())
      const pdfPositionRef = useRef(initial.pdfPosition ? { ...initial.pdfPosition, intent: 'programmatic' } : null)
      const pdfScrollTimer = useRef(null)
      const pdfRestoringRef = useRef(false)
      const pdfNavigationRef = useRef(null), pdfRestoreIntentRef = useRef(0), pdfRestoreRunRef = useRef(null)
      popupRef.current = popup
      selectionThreadsRef.current = selectionThreads
      tocOpenRef.current = tocOpen
      sessionListOpenRef.current = sessionListOpen
      snapshotRef.current = { ...snapshotBaseRef.current, version: 2, documentId: paper && paper.id, paper, paragraphs, outline, overview, sections, critique, terms, structure, cards, annotations, ideas, selectionThreads, readingState, pdfPosition: pdfPositionRef.current, citationState, tabPositions, chromeState, mode, focus, tab, paneWidth, library }
      delete snapshotRef.current.migrated
      delete snapshotRef.current.localIndexFromDatabase

      useEffect(() => {
        function dismissChromeMenu(event) {
          const toc = tocContainerRef.current
          if (tocOpenRef.current && (!toc || !toc.contains(event.target))) { tocOpenRef.current = false; setTocOpen(false) }
          const history = sessionMenuRef.current
          if (sessionListOpenRef.current && (!history || !history.contains(event.target))) setPopupHistoryOpen(false)
        }
        function dismissChromeOnEscape(event) {
          if (event.key !== 'Escape') return
          const toc = tocContainerRef.current, hadToc = tocOpenRef.current, hadHistory = sessionListOpenRef.current, history = sessionMenuRef.current
          if (!hadToc && !hadHistory) return
          if (hadHistory && popupEditingTarget(event.target)) return
          event.preventDefault(); event.stopPropagation()
          closeReaderMenus()
          const trigger = hadHistory ? history && history.querySelector('.lr-session-toggle') : toc && toc.querySelector('button')
          if (trigger) trigger.focus()
        }
        document.addEventListener('pointerdown', dismissChromeMenu, true)
        document.addEventListener('keydown', dismissChromeOnEscape, true)
        return () => { document.removeEventListener('pointerdown', dismissChromeMenu, true); document.removeEventListener('keydown', dismissChromeOnEscape, true) }
      }, [])

      function setPopupHistoryOpen(open) {
        sessionListOpenRef.current = Boolean(open)
        setSessionListOpen(Boolean(open))
      }

      function togglePopupHistory() {
        if (!(paperRef.current && paperRef.current.id)) return
        const open = !sessionListOpenRef.current
        if (open) { closeReaderMenus(); cancelReaderChromeFold() }
        setPopupHistoryOpen(open)
        if (!open) queueReaderChromeFold()
      }

      function closeReaderMenus() {
        setPopupHistoryOpen(false)
        tocOpenRef.current = false
        setTocOpen(false)
      }

      function toggleOutlineMenu() {
        const open = !tocOpenRef.current
        if (open) { setPopupHistoryOpen(false); cancelReaderChromeFold() }
        tocOpenRef.current = open; setTocOpen(open)
        if (!open) queueReaderChromeFold()
      }

      function positionReaderMenu(panel) {
        if (!panel) return
        const host = sourceRef.current, view = host ? host.getBoundingClientRect() : { left: 0, right: window.innerWidth, height: window.innerHeight }
        const left = Math.max(12, view.left + 12), right = Math.min(window.innerWidth - 12, view.right - 12)
        panel.style.width = Math.max(140, Math.min(300, right - left)) + 'px'
        panel.style.transform = 'translateX(0px)'
        const box = panel.getBoundingClientRect(), shift = box.left < left ? left - box.left : box.right > right ? right - box.right : 0
        panel.style.transform = 'translateX(' + shift.toFixed(2) + 'px)'
        panel.style.maxHeight = Math.max(40, Math.min(560, view.height - 100, window.innerHeight - box.top - 12)) + 'px'
      }

      useLayoutEffect(() => {
        const toc = tocContainerRef.current
        if (tocOpen && toc) positionReaderMenu(toc.querySelector('.lr-toc-body'))
        if (sessionListOpen && sessionMenuRef.current) positionReaderMenu(sessionMenuRef.current.querySelector('.lr-session-history'))
      }, [tocOpen, sessionListOpen, paneWidth, sourceOpen, pdfDoc, chromeState.titleCollapsed])

      useEffect(() => {
        const resize = () => {
          const toc = tocContainerRef.current
          if (tocOpenRef.current && toc) positionReaderMenu(toc.querySelector('.lr-toc-body'))
          if (sessionListOpenRef.current && sessionMenuRef.current) positionReaderMenu(sessionMenuRef.current.querySelector('.lr-session-history'))
        }
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
      }, [])

      function cancelReaderChromeFold() {
        const motion = readerChromeFoldRef.current
        clearTimeout(motion.timer)
        motion.timer = null
        motion.startedAt = 0
      }

      function readerChromeProtected() {
        const motion = readerChromeFoldRef.current, toolbar = readerChromeRef.current
        return Boolean(libraryOpen || sessionListOpenRef.current || paperStackRef.current && paperStackRef.current.contains(document.activeElement) || motion.hover || motion.focused || toolbar && (toolbar.querySelector && toolbar.querySelector('.lr-toc-body') || toolbar.contains(document.activeElement) || toolbar.matches && toolbar.matches(':hover')))
      }

      function setReaderChromeCollapsed(collapsed, preserveScrollIntent) {
        cancelReaderChromeFold()
        const motion = readerChromeFoldRef.current
        if (!preserveScrollIntent) motion.userUntil = 0
        motion.userScrolled = false
        if (collapsed) {
          closeReaderMenus()
        }
        setChromeState((previous) => ({ ...previous, titleCollapsed: collapsed }))
      }

      function toggleReaderChrome() {
        setReaderChromeCollapsed(!Boolean((snapshotRef.current || {}).chromeState && snapshotRef.current.chromeState.titleCollapsed))
      }

      function queueReaderChromeFold() {
        const motion = readerChromeFoldRef.current, snapshot = snapshotRef.current || {}, host = sourceRef.current
        if (!host || !pdfDocRef.current || !paperRef.current || !motion.userScrolled || motion.timer || snapshot.chromeState && snapshot.chromeState.titleCollapsed || pdfRestoringRef.current || readerChromeProtected()) return
        const owner = paperRef.current.id, epoch = epochRef.current
        motion.startedAt = Date.now()
        motion.timer = setTimeout(() => {
          motion.timer = null
          if (owner !== (paperRef.current && paperRef.current.id) || epoch !== epochRef.current || host !== sourceRef.current || !host.isConnected || pdfRestoringRef.current) return
          if (readerChromeProtected()) { motion.startedAt = 0; return }
          setReaderChromeCollapsed(true, true)
        }, 800)
      }

      function noteReaderScrollIntent(event) {
        const target = event && event.target
        if (target && target.closest && target.closest('input,textarea,button,[contenteditable="true"],.lr-pop,.lr-tag')) return
        if (event && event.type === 'keydown' && !/^(?:ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(event.key)) return
        pdfRestoreIntentRef.current += 1
        pdfNavigationRef.current = null
        pdfRestoreRunRef.current = null
        pdfRestoringRef.current = false
        readerChromeFoldRef.current.userUntil = Date.now() + 1200
      }

      function onPdfReaderScroll() {
        if (paneResizeRef.current) return
        const motion = readerChromeFoldRef.current
        const userDriven = !pdfRestoringRef.current && Date.now() <= motion.userUntil
        rememberPdfPosition(userDriven ? 'user' : 'programmatic')
        if (pdfRestoringRef.current) { motion.userUntil = 0; return }
        if (!userDriven) return
        motion.userUntil = Math.max(motion.userUntil, Date.now() + 600)
        motion.userScrolled = true
        queueReaderChromeFold()
      }

      function enterReaderChrome() { readerChromeFoldRef.current.hover = true; readerChromeFoldRef.current.userUntil = 0; cancelReaderChromeFold() }
      function leaveReaderChrome() { readerChromeFoldRef.current.hover = false; queueReaderChromeFold() }
      function focusReaderChrome() { readerChromeFoldRef.current.focused = true; readerChromeFoldRef.current.userUntil = 0; cancelReaderChromeFold() }
      function blurReaderChrome(event) {
        const toolbar = readerChromeRef.current
        readerChromeFoldRef.current.focused = Boolean(event.relatedTarget && (toolbar && toolbar.contains(event.relatedTarget) || paperStackRef.current && paperStackRef.current.contains(event.relatedTarget)))
        if (!readerChromeFoldRef.current.focused) queueReaderChromeFold()
      }

      useEffect(() => {
        const motion = readerChromeFoldRef.current
        cancelReaderChromeFold()
        motion.userUntil = 0; motion.userScrolled = false; motion.hover = false; motion.focused = false
        function cancelOutsidePdf(event) {
          const host = sourceRef.current, toolbar = readerChromeRef.current
          if (host && !host.contains(event.target) && (!toolbar || !toolbar.contains(event.target))) {
            cancelReaderChromeFold(); motion.userUntil = 0; motion.userScrolled = false
          }
        }
        document.addEventListener('click', cancelOutsidePdf, true)
        return () => { cancelReaderChromeFold(); document.removeEventListener('click', cancelOutsidePdf, true) }
      }, [paper && paper.id, pdfDoc, sourceOpen])

      useEffect(() => {
        const host = sourceRef.current, toolbar = readerChromeRef.current, pane = host && host.closest('.lr-source'), root = host && host.closest('.lr-root')
        if (!host || !toolbar || !pane || !root || paneResizing) return undefined
        let frame = null
        function measure() {
          frame = null
          const lens = root.querySelector('.lr-notes .lr-tab-lens'), lensBox = lens && lens.getBoundingClientRect(), paneBox = pane.getBoundingClientRect()
          // Keep both utility pills compact as the reading split changes.
          // The tab lens supplies vertical alignment, not the controls' size.
          const width = Math.max(80, Math.min(100, 80 + (pane.clientWidth - 280) / 16))
          const height = Math.max(32, Math.min(36, 32 + (width - 80) / 5))
          const relativeTop = lensBox && lensBox.height > 0 ? lensBox.top - paneBox.top : 16
          const top = relativeTop >= 8 && relativeTop <= 44 ? relativeTop : 16
          const title = toolbar.querySelector('.lr-title-pill'), history = sessionMenuRef.current
          if (title && history) {
            const toolbarBox = toolbar.getBoundingClientRect(), sx = toolbarBox.width / toolbar.offsetWidth || 1
            const controls = Array.from(toolbar.querySelectorAll('.lr-reader-leading,.lr-reader-controls,.lr-reader-panel')).map((node) => ({ left: node.offsetLeft, top: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }))
            const geometry = popupHeaderStackGeometry({ title: { left: title.offsetLeft, top: title.offsetTop, width: title.offsetWidth, height: title.offsetHeight }, controls, width, height, right: toolbar.clientWidth, collapsed: false, toolbarTop: top, minLeft: (paneBox.left + 8 - toolbarBox.left) / sx, maxLeft: (paneBox.right - 8 - toolbarBox.left) / sx - width })
            if (geometry) {
              root.style.setProperty('--lr-stack-expanded-y', geometry.top.toFixed(2) + 'px')
              const previous = parseFloat(window.getComputedStyle(host).paddingTop) || 0
              host.style.setProperty('--lr-session-safe-padding', geometry.paddingTop + 'px')
              const next = parseFloat(window.getComputedStyle(host).paddingTop) || geometry.paddingTop
              if (host.scrollTop > 0 && Math.abs(next - previous) > .5) host.scrollTop += next - previous
            }
          }
          const x = toolbar.clientWidth - width / 2 - (title ? title.offsetLeft + title.offsetWidth / 2 : toolbar.clientWidth / 2), y = title ? -title.offsetTop : 0
          root.style.setProperty('--lr-reader-chrome-top', top.toFixed(2) + 'px')
          root.style.setProperty('--lr-reader-chip-width', width.toFixed(2) + 'px')
          root.style.setProperty('--lr-reader-chip-height', height.toFixed(2) + 'px')
          root.style.setProperty('--lr-reader-chip-x', x.toFixed(2) + 'px')
          root.style.setProperty('--lr-reader-chip-y', y.toFixed(2) + 'px')
          for (const group of toolbar.querySelectorAll('.lr-reader-leading,.lr-reader-controls,.lr-reader-panel')) {
            group.style.setProperty('--lr-chrome-fold-x', (toolbar.clientWidth - width / 2 - group.offsetLeft - group.offsetWidth / 2).toFixed(2) + 'px')
            group.style.setProperty('--lr-chrome-fold-y', (height / 2 - group.offsetTop - group.offsetHeight / 2).toFixed(2) + 'px')
          }
        }
        const queue = () => { if (frame == null) frame = requestAnimationFrame(measure) }
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queue)
        if (observer) {
          observer.observe(pane); observer.observe(toolbar)
          const title = toolbar.querySelector('.lr-title-pill')
          if (title) observer.observe(title)
          const tabs = root.querySelector('.lr-notes .lr-tabs'), lens = tabs && tabs.querySelector('.lr-tab-lens')
          if (tabs) observer.observe(tabs)
          if (lens) observer.observe(lens)
        }
        window.addEventListener('resize', queue)
        queue()
        return () => { if (observer) observer.disconnect(); if (frame != null) cancelAnimationFrame(frame); window.removeEventListener('resize', queue) }
      }, [paper && paper.id, pdfDoc, sourceOpen, chromeState.paperFocus, chromeState.titleCollapsed, paneResizing])

      useEffect(() => {
        const origin = referenceOriginRef.current
        if (origin && (origin.documentId !== (paper && paper.id) || origin.epoch !== epochRef.current || origin.doc !== pdfDoc || origin.host !== sourceRef.current || !sourceOpen)) {
          referenceOriginRef.current = null
          referenceLocateRef.current += 1
          setReferenceReturn(null)
        }
      }, [paper && paper.id, pdfDoc, sourceOpen])

      useEffect(() => {
        if (!['chapters', 'ideas', 'citations'].includes(tab)) return undefined
        let alive = true
        setFeatureError('')
        loadReaderModule(tab).then((module) => {
          if (alive) setFeatureModules((previous) => ({ ...previous, [tab]: module }))
        }).catch((caught) => { if (alive) setFeatureError(textOf(caught)) })
        return () => { alive = false }
      }, [tab])

      function startTask(kind) {
        const previous = requestsRef.current.get(kind)
        if (previous) previous.controller.abort()
        const task = { epoch: epochRef.current, controller: new AbortController() }
        requestsRef.current.set(kind, task)
        task.alive = () => epochRef.current === task.epoch && requestsRef.current.get(kind) === task && !task.controller.signal.aborted
        task.finish = () => { if (requestsRef.current.get(kind) === task) requestsRef.current.delete(kind) }
        return task
      }

      function persistSnapshot(snapshot, bytes) {
        if (!snapshot || !snapshot.paper || !snapshot.paper.id) return
        const id = snapshot.paper.id
        const previous = documentCacheRef.current.get(id)
        const record = { snapshot, bytes: bytes || (previous && previous.bytes) || null }
        documentCacheRef.current.set(id, record)
        storageQueueRef.current = storageQueueRef.current.catch(() => {}).then(async () => {
          if ((catalogRef.current.deleted || []).includes(id)) return
          if (!record.bytes) {
            const saved = await idbGet('document:' + id)
            if (saved && saved.bytes) record.bytes = saved.bytes
          }
          await idbPut('document:' + id, record)
        })
        storageQueueRef.current.catch(() => {
          if (paperRef.current && paperRef.current.id === id) setNotice('本机保存失败，请检查可用空间；当前会话仍可继续阅读。')
        })
      }

      function changeCatalog(update) {
        const next = update(catalogRef.current)
        if (next === catalogRef.current) return
        catalogRef.current = next
        setCatalog(next)
        try { localStorage.setItem(LIBRARY_STORE, JSON.stringify(next)) }
        catch { setNotice('文献库设置暂未保存，请检查本机存储空间。') }
      }

      function catalogEntry(next, previous, info = {}) {
        return {
          ...previous, id: next.id, title: next.title, source: next.source || previous?.source, hasText: Boolean(next.text),
          meta: { ...previous?.meta, ...next.meta }, folderId: previous?.folderId ?? catalogRef.current.settings.defaultFolderId,
          preview: libraryResearchPreview({ paper: next }) || previous?.preview || '',
          updatedAt: info.updatedAt || previous?.updatedAt || Date.now(), ...info,
        }
      }

      useEffect(() => {
        if (!paper?.id) return
        const preview = libraryResearchPreview({ paper, cards })
        if (!preview) return
        changeCatalog((current) => {
          const entry = current.documents.find((item) => item.id === paper.id)
          if (!entry || entry.preview === preview) return current
          return { ...current, documents: current.documents.map((item) => item.id === paper.id ? { ...item, preview } : item) }
        })
      }, [paper, cards])

      function rememberDocument(next, info = {}) {
        changeCatalog((previous) => {
          if ((previous.deleted || []).includes(next.id) && !info.updatedAt) return previous
          const current = previous.documents.find((item) => item.id === next.id)
          const entry = catalogEntry(next, current, info)
          return { ...previous, documents: [entry, ...previous.documents.filter((item) => item.id !== next.id)], deleted: (previous.deleted || []).filter((id) => id !== next.id) }
        })
      }

      function applySnapshot(value, nextPaper) {
        snapshotBaseRef.current = value
        applyPaper(nextPaper || value.paper)
        setParagraphs(value.paragraphs || [])
        setOutline(value.outline || '')
        setOverview(value.overview || '')
        overviewRef.current = value.overview || ''
        setSections(value.sections || [])
        setCritique(value.critique || '')
        setTerms(value.terms || '')
        setStructure(value.structure && value.structure.documentId && value.structure.documentId !== (paperRef.current && paperRef.current.id) ? null : value.structure || null)
        setCards(value.cards || [])
        setAnnotations(value.annotations || [])
        setIdeas(value.ideas || [])
        setSelectionThreads(value.selectionThreads || [])
        selectionThreadsRef.current = value.selectionThreads || []
        setReadingState(value.readingState || {})
        setChromeState({ ...value.chromeState, titleCollapsed: false })
        clearTimeout(pdfScrollTimer.current)
        pdfScrollTimer.current = null
        pdfPositionRef.current = value.pdfPosition ? { ...value.pdfPosition, intent: 'programmatic' } : null
        setPdfPosition(pdfPositionRef.current)
        setCitationState(value.citationState || {})
        setTabPositions(value.tabPositions || {})
        setActiveReference(null)
        setSelectedQuote(null)
        setTab(normalizeTab(value.tab))
        setFocus(value.focus || '')
      }

      function beginDocumentChange() {
        cancelSessionDrag(false); cancelPopupMotion(false); for (const animation of sessionCollectAnimations.current) animation.cancel(); sessionCollectAnimations.current.clear()
        stopPaneResize(false)
        cancelReaderChromeFold()
        closeReaderMenus()
        outlineRequestRef.current += 1
        outlineTargetRef.current = null
        readerChromeFoldRef.current.userUntil = 0
        readerChromeFoldRef.current.userScrolled = false
        setIdentityReady(false)
        clearTimeout(saveTimer.current)
        persistSnapshot(snapshotRef.current, pdfBytesRef.current)
        epochRef.current += 1
        for (const task of requestsRef.current.values()) task.controller.abort()
        requestsRef.current.clear()
        if (paperRef.current) cancelTranslations(paperRef.current.id)
        closePopup('document')
        sessionRestoreRef.current += 1
        clearTimeout(sessionHoverRef.current)
        sessionHoverRef.current = null
        sessionBarsRef.current = []
        setSessionBars([])
        setPopupHistoryOpen(false)
        closePdf()
        applySnapshot({})
        setBusy(null)
        setCardsBusy(false)
        setStructureBusy(false)
        setActiveSection(null)
        setTocOpen(false)
        setProgress(null)
        setError('')
        setNotice('')
        setZoom(1)
        setFitWidth(true)
        setFitScale(0)
        return startTask('import')
      }

      async function prepareRestoredRecord(record, task) {
        if (!record || !record.snapshot || !record.snapshot.paper) return record
        const previous = record.snapshot, from = previous.paper.id
        if (!record.bytes) return record
        const canonical = await documentId('', record.bytes)
        if (!task.alive()) return null
        if (from === canonical) return record
        if (/^pdf-[a-f0-9]{64}$/.test(from || '')) throw new Error('保存的 PDF 与文献标识不一致；原记录已保留，请重新导入对应 PDF。')
        const pdfjs = await loadPdfJs()
        const doc = await loadPdfDocument(pdfjs, record.bytes).promise
        let extracted
        try { extracted = await extractPdfText(doc) } finally { await doc.destroy() }
        if (!task.alive()) return null
        if (!identityText(extracted) || identityText(extracted) !== identityText(previous.paper.text)) throw new Error('旧文献正文与保存的 PDF 不一致；原记录已保留，请重新导入对应 PDF。')
        const backupKey = 'migration-backup:' + from + ':' + canonical
        if (!await idbGet(backupKey)) await idbPut(backupKey, record)
        if (!task.alive()) return null
        const existing = documentCacheRef.current.get(canonical) || await idbGet('document:' + canonical)
        if (!task.alive()) return null
        if (existing && existing.snapshot) {
          rememberDocument(existing.snapshot.paper)
          throw new Error('同一 PDF 已有另一份本机记录，旧记录已备份，请从已保存文献中选择。')
        }
        const snapshot = rebindDocumentSnapshot(previous, from, canonical)
        snapshot.structure = null
        snapshot.identityMigration = { from, to: canonical, backupKey, verifiedText: true }
        const next = { ...record, snapshot }
        await idbPut('document:' + canonical, next)
        if (!task.alive()) return null
        documentCacheRef.current.set(canonical, next)
        changeCatalog((previous) => ({ ...previous, documents: previous.documents.filter((item) => item.id !== from), deleted: [...new Set([...(previous.deleted || []), from])] }))
        return next
      }

      async function restoreDocument(id) {
        if (paperRef.current && paperRef.current.id === id) return
        const task = beginDocumentChange()
        setBusy({ kind: 'restore', label: '正在打开文献' })
        const restoration = (async () => {
          try {
            let record = documentCacheRef.current.get(id) || await idbGet('document:' + id)
            if (!task.alive()) return
            if (!record || !record.snapshot || record.snapshot.documentId !== id || !record.snapshot.paper || record.snapshot.paper.id !== id) throw new Error('未找到这篇文献的本机记录，请重新导入。')
            record = await prepareRestoredRecord(await withLibraryPdf(record, task.controller.signal), task)
            if (!task.alive() || !record) return
            documentCacheRef.current.set(record.snapshot.paper.id, record)
            applySnapshot(record.snapshot)
            rememberDocument(record.snapshot.paper, { hasPdf: Boolean(record.bytes) })
            if (record.bytes) {
              await openPdfBytes(record.bytes, record.snapshot.paper.title, task)
              if (task.alive() && !validStructure(record.snapshot.structure, paperRef.current.id)) runStructure(record.bytes)
            }
            if (task.alive()) setIdentityReady(true)
          } catch (caught) {
            if (task.alive() && !isAbort(caught)) setError(textOf(caught))
          } finally {
            if (task.alive()) setBusy(null)
            task.finish()
          }
        })()
        restorationRef.current = restoration
        try { await restoration }
        finally { if (restorationRef.current === restoration) restorationRef.current = null }
      }

      useEffect(() => {
        overviewRef.current = overview
      }, [overview])

      useEffect(() => {
        if (!identityReady || !paper || !paper.id || !paragraphs.length || cards.length || cardsBusy || busy || skimAttemptRef.current.has(paper.id)) return
        skimAttemptRef.current.add(paper.id)
        runCards({ automatic: true })
      }, [identityReady, paper && paper.id, paragraphs.length, cards.length, cardsBusy, busy])

      useEffect(() => {
        const task = startTask('restore')
        const restoration = (async () => {
          const restored = initial.paper
          if (!restored || (catalogRef.current.deleted || []).includes(restored.id)) { if (restored) applySnapshot({}); setIdentityReady(true); return }
          setBusy({ kind: 'restore', label: '正在恢复阅读位置' })
          const id = restored.id || await documentId(restored.text)
          if (!task.alive()) return
          const stored = await idbGet(initial.migrated ? 'current' : 'document:' + id)
          if (!task.alive()) return
          const base = !initial.migrated && stored && stored.snapshot && stored.snapshot.documentId === id ? stored.snapshot : {}
          const snapshot = { ...base, ...initial, version: 2, documentId: id, paper: { ...restored, id },
            structure: initial.localIndexFromDatabase ? base.structure || null : initial.structure || base.structure || null,
            paragraphs: initial.paragraphs && initial.paragraphs.length ? initial.paragraphs : base.paragraphs || [] }
          let record = await prepareRestoredRecord(await withLibraryPdf({ ...(stored || {}), snapshot, bytes: stored && stored.bytes || null }, task.controller.signal), task)
          if (!task.alive() || !record) return
          applySnapshot(record.snapshot)
          rememberDocument(record.snapshot.paper, { hasPdf: Boolean(record.bytes) })
          documentCacheRef.current.set(record.snapshot.paper.id, record)
          if (record.snapshot.paper.text && !(record.snapshot.paragraphs || []).length) {
            const prepared = await fetchJson('/api/literature/prepare', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: record.snapshot.paper.text }), signal: task.controller.signal })
            if (!task.alive()) return
            setParagraphs(prepared.paragraphs || []); setOutline(prepared.outline || '')
          }
          if (record.bytes) {
            await openPdfBytes(record.bytes, record.snapshot.paper.title, task)
            if (task.alive() && !validStructure(record.snapshot.structure, paperRef.current.id)) runStructure(record.bytes)
          }
          if (task.alive()) { setIdentityReady(true); setBusy(null) }
        })().catch((caught) => {
          if (task.alive() && !isAbort(caught)) { setNotice('原文未自动恢复：' + textOf(caught)); setBusy(null) }
        }).finally(() => { if (restorationRef.current === restoration) restorationRef.current = null })
        restorationRef.current = restoration
        return () => {
          clearTimeout(pdfScrollTimer.current)
          pdfScrollTimer.current = null
          clearTimeout(popupMorphRef.current)
          epochRef.current += 1
          for (const pending of requestsRef.current.values()) pending.controller.abort()
          requestsRef.current.clear()
          if (paperRef.current) cancelTranslations(paperRef.current.id)
          const latest = snapshotRef.current
          if (!latest.paper || latest.paper.id) {
            try { writeLocalSnapshot(latest) } catch { /* IndexedDB remains the per-paper fallback */ }
          }
          persistSnapshot(snapshotRef.current, pdfBytesRef.current)
          closePdf()
        }
      }, [])

      useEffect(() => {
        const payload = snapshotRef.current
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          if (payload.paper && !payload.paper.id) return
          persistSnapshot(payload, pdfBytesRef.current)
          try { writeLocalSnapshot(payload) }
          catch { setNotice('本机空间不足，刷新前请保留原文件。') }
        }, 350)
        return () => clearTimeout(saveTimer.current)
      }, [paper, paragraphs, outline, overview, sections, critique, terms, structure, cards, annotations, ideas, selectionThreads, readingState, pdfPosition, citationState, tabPositions, chromeState, mode, focus, tab, paneWidth, library])

      useEffect(() => {
        function saveBeforeLeaving() {
          const payload = snapshotRef.current
          if (payload.paper && !payload.paper.id) return
          try { writeLocalSnapshot(payload) } catch { /* best effort on page close */ }
          persistSnapshot(payload, pdfBytesRef.current)
        }
        window.addEventListener('pagehide', saveBeforeLeaving)
        return () => window.removeEventListener('pagehide', saveBeforeLeaving)
      }, [])

      useEffect(() => {
        if (!pdfDoc) {
          setBaseWidth(0)
          return undefined
        }
        let cancelled = false
        pdfDoc
          .getPage(1)
          .then((page) => {
            if (!cancelled) setBaseWidth(page.getViewport({ scale: 1 }).width)
          })
          .catch(() => {})
        return () => {
          cancelled = true
        }
      }, [pdfDoc])

      useEffect(() => {
        const element = sourceRef.current
        if (!element || !fitWidth || !baseWidth || paneResizing) return undefined
        // Host sidebar motion sends a resize on each frame. Commit only the
        // settled scale so the reader and its notes do not render for every width.
        let timer, measuredWidth = 0
        const measure = () => {
          if (paneResizeRef.current) return
          const width = element.clientWidth
          if (width === measuredWidth) return
          measuredWidth = width
          clearTimeout(timer)
          if (width > 0) timer = setTimeout(() => {
            if (!paneResizeRef.current) setFitScale(Math.max(0.35, Math.min(3, (width - 24) / baseWidth)))
          }, 90)
        }
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
        observer?.observe(element)
        if (!observer) window.addEventListener('resize', measure)
        measure()
        return () => {
          clearTimeout(timer)
          observer?.disconnect()
          if (!observer) window.removeEventListener('resize', measure)
        }
      }, [sourceOpen, sourceTab, pdfDoc, fitWidth, baseWidth, paneResizing])

      const effectiveScale = fitWidth ? fitScale || zoom : zoom

      function rememberPdfPosition(intent) {
        const host = sourceRef.current, owner = paperRef.current && paperRef.current.id
        if (!host || !owner || pdfRestoringRef.current) return
        const top = host.getBoundingClientRect().top
        const page = Array.from(host.querySelectorAll('.lr-page')).find((node) => node.getBoundingClientRect().bottom > top + 24)
        if (!page) return
        const box = page.getBoundingClientRect()
        const previous = pdfPositionRef.current && pdfPositionRef.current.documentId === owner ? pdfPositionRef.current : null
        const value = { documentId: owner, page: Number(page.dataset.page), fraction: Math.max(0, Math.min(1, (top - box.top) / Math.max(box.height, 1))), intent: intent === 'user' ? 'user' : 'programmatic', userScrollId: Math.max(0, Number(previous && previous.userScrollId) || 0) + (intent === 'user' ? 1 : 0) }
        pdfPositionRef.current = value
        if (snapshotRef.current && snapshotRef.current.documentId === owner) snapshotRef.current.pdfPosition = value
        if (pdfScrollTimer.current == null) {
          const epoch = epochRef.current
          const timer = setTimeout(() => {
            if (pdfScrollTimer.current !== timer) return
            pdfScrollTimer.current = null
            const latest = pdfPositionRef.current
            if (epoch === epochRef.current && paperRef.current && paperRef.current.id === owner && latest && latest.documentId === owner) setPdfPosition(latest)
          }, 200)
          pdfScrollTimer.current = timer
        }
      }

      useEffect(() => {
        const saved = pdfPositionRef.current, owner = paperRef.current && paperRef.current.id
        const epoch = epochRef.current
        const navigationActive = () => { const value = pdfNavigationRef.current; return value && value.documentId === owner && value.doc === pdfDoc && value.epoch === epoch }
        if (!pdfDoc || !sourceOpen || !saved || saved.documentId !== owner || navigationActive()) return undefined
        const request = referenceLocateRef.current, intent = pdfRestoreIntentRef.current, token = {}
        let frame = null, attempts = 0, cancelled = false
        pdfRestoreRunRef.current = token
        const alive = () => !cancelled && pdfRestoreRunRef.current === token && epoch === epochRef.current && owner === (paperRef.current && paperRef.current.id) && pdfDoc === pdfDocRef.current && request === referenceLocateRef.current && intent === pdfRestoreIntentRef.current && !navigationActive()
        const release = () => {
          if (pdfRestoreRunRef.current !== token) return
          pdfRestoreRunRef.current = null
          if (epoch === epochRef.current && request === referenceLocateRef.current && !navigationActive()) pdfRestoringRef.current = false
        }
        pdfRestoringRef.current = true
        function restore() {
          if (!alive()) { release(); return }
          const host = sourceRef.current
          const page = host && host.querySelector('.lr-page[data-page="' + saved.page + '"]')
          if (!page && attempts++ < 90) { frame = requestAnimationFrame(restore); return }
          if (page && host.isConnected && alive()) {
            const box = page.getBoundingClientRect()
            host.scrollTop += box.top - host.getBoundingClientRect().top + saved.fraction * box.height
          }
          frame = requestAnimationFrame(release)
        }
        frame = requestAnimationFrame(restore)
        return () => { cancelled = true; if (frame) cancelAnimationFrame(frame); release() }
      }, [pdfDoc, sourceOpen, effectiveScale])

      useEffect(() => {
        let timer = null
        function onSelectionChange() {
            if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            timer = null
            const selection = window.getSelection()
            if (!selection || selection.isCollapsed) return
            const node = selection.anchorNode
            if (!node) return
            const element = node.nodeType === 1 ? node : node.parentElement
            if (!element || typeof element.closest !== 'function' || !element.closest('.lr-textlayer')) return
            const value = selection.toString().replace(/\s+/g, ' ').trim()
            if (value.length < 2 || value.length > 3000) return
            if (paperRef.current && paperRef.current.id) ensureTranslation(value, paperRef.current.id)
          }, 220)
        }
        document.addEventListener('selectionchange', onSelectionChange)
        return () => {
          document.removeEventListener('selectionchange', onSelectionChange)
          if (timer) clearTimeout(timer)
        }
      }, [])

      const labelCacheRef = useRef({ cards: null, labels: [] })
      if (labelCacheRef.current.cards !== cards) {
        labelCacheRef.current = {
          cards,
          labels: cards.map((card) => {
            const meta = CARD_TYPES[card.type] || CARD_TYPES.method
            return { quote: card.quote, label: meta.label, color: meta.color, tint: meta.tint, ink: meta.ink, line: meta.line }
          }),
        }
      }
      const pdfLabels = labelCacheRef.current.labels

      const pageCacheRef = useRef({ cards: null, structure: null, pages: [] })
      if (pageCacheRef.current.cards !== cards || pageCacheRef.current.structure !== structure) {
        const pages = cards.map((card) => {
          if (!structure || !structure.sections) return null
          const key = matchKeyText(card.quote)
          if (!key) return null
          for (const section of structure.sections) {
            for (const paragraph of section.paragraphs || []) {
              if (matchKeyText(paragraph.text).indexOf(key) >= 0) return (paragraph.page != null ? paragraph.page : section.page || 0) + 1
            }
          }
          return null
        })
        pageCacheRef.current = { cards, structure, pages }
      }
      const cardPages = pageCacheRef.current.pages

      function applyPaper(next) {
        paperRef.current = next
        setPaper(next || null)
      }

      useEffect(() => { sessionMountedRef.current = true; return () => { sessionMountedRef.current = false; sessionRestoreRef.current += 1; clearTimeout(sessionHoverRef.current); clearTimeout(popupMorphRef.current); cancelSessionDrag(false); cancelPopupMotion(false); for (const animation of sessionCollectAnimations.current) animation.cancel(); sessionCollectAnimations.current.clear() } }, [])

      function setCurrentPopup(next) {
        const value = typeof next === 'function' ? next(popupRef.current) : next
        popupRef.current = value
        setPopup(value)
      }

      function activePopupThread(value) {
        const current = value || popupRef.current, owner = paperRef.current && paperRef.current.id
        return current && current.documentId === owner ? selectionThreadsRef.current.find((item) => item.key === current.key && item.documentId === owner) : null
      }

      function clearActivePopup(reason) {
        const current = popupRef.current
        cancelPopupMotion(false)
        clearTimeout(popupMorphRef.current)
        if (current && reason === 'escape') { const recent = recentPopupRef.current; recentPopupRef.current = { popup: { ...current, sessionSnapshot: recent && recent.popup.key === current.key ? recent.popup.sessionSnapshot : null }, origin: popupOriginRef.current, documentId: current.documentId } }
        else if (reason === 'document' || (reason === 'outside' || reason === 'distance') && !popupThreadHasConversation(activePopupThread(current))) recentPopupRef.current = null
        cardRequestRef.current += 1
        activeCardRef.current = null; setActiveCard(null); setCardLocating(false)
        popupOriginRef.current = null
        setCurrentPopup(null)
        if (locatorRef.current) locatorRef.current.clear()
        document.querySelectorAll('.lr-src-p.is-evidence').forEach((element) => element.classList.remove('is-evidence'))
      }

      function closePopup(reason) {
        const current = popupRef.current
        if (current && reason !== 'document' && popupThreadHasConversation(activePopupThread(current))) { changePopupPresentation('bar', null, current.key); return }
        clearActivePopup(reason)
      }

      function changePopupPresentation(presentation, bodyHeight, expectedKey) {
        const current = popupRef.current, host = sourceRef.current
        if (!current || expectedKey && current.key !== expectedKey || current.documentId !== (paperRef.current && paperRef.current.id)) return
        const card = host && host.querySelector('.lr-pop[data-popup-key]') || document.querySelector('.lr-pop'), measured = card && card.getBoundingClientRect()
        const expandedHeight = current.presentation === 'shown' && measured && measured.height > 30 ? measured.height : current.expandedHeight || (Number(bodyHeight) || 180) + 48, thread = activePopupThread(current)
        if (presentation === 'bar' && !popupThreadHasConversation(thread)) presentation = 'perspective'
        let anchor = current.anchor, motionFrom = null, motionTo = null
        if (presentation === 'bar' && thread) {
          const capsule = refreshPopupSessionBars(current.key).find((bar) => bar.key === current.key)
          if (capsule && measured) {
            const foreground = card.querySelector && card.querySelector('.lr-pop-content > *'); motionFrom = { left: measured.left, top: measured.top, width: measured.width, height: measured.height, opacity: parseFloat(window.getComputedStyle(card).opacity) || 1, foregroundOpacity: foreground ? parseFloat(window.getComputedStyle(foreground).opacity) : 1 }; motionTo = capsule.rect
            saveSelectionThread({ documentId: current.documentId, key: current.key, capsuleOrigin: capsule.capsuleOrigin })
          }
        } else if (presentation === 'shown' && current.presentation === 'bar' && host) {
          const capsule = sessionCapsuleNode(current.key), box = capsule && capsule.getBoundingClientRect(), view = host.getBoundingClientRect()
          if (box && box.width > 0 && box.height > 0) {
            anchor = popupCapsuleExpansion({ view, capsule: box, sx: view.width / host.offsetWidth || 1, sy: view.height / host.offsetHeight || 1, height: expandedHeight, scrollLeft: host.scrollLeft, scrollTop: host.scrollTop, key: current.key }) || anchor
            const foreground = card && card.querySelector && card.querySelector('.lr-pop-content > *'); motionFrom = current.motion && measured && measured.width > 0 ? { left: measured.left, top: measured.top, width: measured.width, height: measured.height, opacity: parseFloat(window.getComputedStyle(card).opacity) || .1, foregroundOpacity: foreground ? parseFloat(window.getComputedStyle(foreground).opacity) : 0 } : box; motionTo = { left: anchor.viewportLeft, top: anchor.viewportTop, width: anchor.width * (view.width / host.offsetWidth || 1), height: expandedHeight }
          } else anchor = popupPlacement(popupSourceRect(), expandedHeight) || anchor
        }
        clearTimeout(popupMorphRef.current)
        const value = { ...current, compact: false, docked: current.docked, presentation, anchor, expandedHeight, morphing: false, motion: null, revealUntilHover: presentation === 'shown' ? false : current.revealUntilHover, restoredAt: presentation === 'shown' ? Date.now() : current.restoredAt }
        recentPopupRef.current = { popup: value, origin: popupOriginRef.current, documentId: current.documentId }
        setCurrentPopup(beginPopupMotion(value, presentation === 'bar' ? 'collapse' : 'expand', motionFrom, motionTo))
      }


      function sessionCapsuleNode(key) {
        const host = sourceRef.current
        return host && Array.from(host.querySelectorAll('.lr-session-capsule')).find((node) => node.dataset.sessionKey === key) || null
      }

      function cancelPopupMotion(finalize) {
        const motion = sessionMotionRef.current
        sessionMotionRef.current = null
        if (motion && motion.frame != null) window.cancelAnimationFrame(motion.frame)
        if (motion && motion.restore) motion.restore()
        if (motion) for (const animation of motion.animations || []) { try { animation.cancel() } catch { /* already settled */ } }
        if (finalize) setCurrentPopup((value) => value && value.motion ? { ...value, motion: null, morphing: false } : value)
      }

      function beginPopupMotion(value, phase, from, to) {
        const owner = paperRef.current && paperRef.current.id, sequence = ++sessionMotionSequence.current
        cancelPopupMotion(false)
        return { ...value, morphing: Boolean(from && (to || phase === 'expand')), motion: from && (to || phase === 'expand') ? { sequence, owner, epoch: epochRef.current, phase, from, to } : null }
      }

      useLayoutEffect(() => {
        const intent = popup && popup.motion
        if (!intent || !popup || intent.owner !== (paperRef.current && paperRef.current.id)) return undefined
        const host = sourceRef.current, root = host && host.querySelector('.lr-pop[data-popup-key]'), capsule = sessionCapsuleNode(popup.key)
        if (!root) return undefined
        const token = { sequence: intent.sequence, animations: [], frame: null }; sessionMotionRef.current = token
        const foreground = root.querySelectorAll ? Array.from(root.querySelectorAll('.lr-pop-content > *, .lr-followup, .lr-glass-actions, .lr-glass-palette')) : []
        const original = { transform: root.style.transform || '', opacity: root.style.opacity || '', origin: root.style.transformOrigin || '' }, foregroundStyles = foreground.map((node) => node.style && node.style.opacity || '')
        token.restore = () => { root.style.transform = original.transform; root.style.opacity = original.opacity; root.style.transformOrigin = original.origin; foreground.forEach((node, index) => { if (node.style) node.style.opacity = foregroundStyles[index] }) }
        const firstOpacity = Number.isFinite(intent.from.foregroundOpacity) ? intent.from.foregroundOpacity : intent.phase === 'expand' ? 0 : 1
        foreground.forEach((node) => { if (node.style) node.style.opacity = String(firstOpacity) })
        const alive = () => sessionMountedRef.current && sessionMotionRef.current === token && epochRef.current === intent.epoch && (paperRef.current && paperRef.current.id) === intent.owner && popupRef.current && popupRef.current.key === popup.key
        const finish = () => { if (!alive()) return; setCurrentPopup((value) => value && value.motion && value.motion.sequence === intent.sequence ? { ...value, motion: null, morphing: false } : value) }
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced || typeof root.animate !== 'function') { token.restore(); finish(); return () => { token.restore(); if (sessionMotionRef.current === token) sessionMotionRef.current = null } }
        let previous = null, stable = 0, attempts = 0
        const start = () => {
          token.frame = null
          if (!alive()) return
          root.style.transform = 'none'; root.style.opacity = '1'
          const base = root.getBoundingClientRect()
          const hold = popupFlipFrame(intent.from, base, Number.isFinite(intent.from.opacity) ? intent.from.opacity : intent.phase === 'expand' ? .12 : 1, intent.phase === 'expand' ? 19 : 26)
          if (hold) { root.style.transform = hold.transform; root.style.opacity = String(hold.opacity); root.style.transformOrigin = '0 0' }
          const ready = root.dataset.readyKey === popup.key && base.width > 0 && base.height > 0
          stable = ready && previous && Math.abs(previous.width - base.width) < .25 && Math.abs(previous.height - base.height) < .25 ? stable + 1 : 0
          previous = { width: base.width, height: base.height }
          if ((!ready || stable < 1) && ++attempts < 12) { token.frame = window.requestAnimationFrame(start); return }
          if (!ready) { token.restore(); finish(); return }
          const from = popupFlipFrame(intent.from, base, Number.isFinite(intent.from.opacity) ? intent.from.opacity : intent.phase === 'expand' ? .12 : 1, intent.phase === 'expand' ? 19 : 26), to = popupFlipFrame(intent.phase === 'expand' ? base : intent.to || base, base, intent.phase === 'expand' ? 1 : .08, intent.phase === 'expand' ? 26 : 19)
          if (!from || !to) { token.restore(); finish(); return }
          root.style.transformOrigin = '0 0'; root.style.transform = 'none'; root.style.opacity = '1'
          foreground.forEach((node, index) => { if (node.style) node.style.opacity = foregroundStyles[index] })
          const expanding = intent.phase === 'expand', frames = expanding ? [{ ...from, offset: 0 }, { ...from, offset: .16 }, { ...to, offset: .8 }, { ...to, offset: 1 }] : [{ ...from, offset: 0 }, { ...from, offset: .22 }, { ...to, offset: 1 }]
          const animation = root.animate(frames, { duration: 380, easing: 'cubic-bezier(.2,.75,.18,1)', fill: 'forwards' }); token.animations.push(animation)
          if (capsule && typeof capsule.animate === 'function') token.animations.push(capsule.animate(expanding ? [{ opacity: 1 }, { opacity: 0, offset: .2 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: .7 }, { opacity: 1 }], { duration: 380, easing: 'ease-out', fill: 'forwards' }))
          for (const node of foreground) if (typeof node.animate === 'function') token.animations.push(node.animate(expanding ? [{ opacity: firstOpacity }, { opacity: 0, offset: .16 }, { opacity: 0, offset: .8 }, { opacity: 1 }] : [{ opacity: firstOpacity }, { opacity: 0, offset: .18 }, { opacity: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' }))
          animation.finished.then(finish, () => { if (alive()) finish() })
        }
        start()
        return () => { if (token.frame != null) window.cancelAnimationFrame(token.frame); for (const item of token.animations) { try { item.cancel() } catch { /* settled */ } } token.restore(); if (sessionMotionRef.current === token) sessionMotionRef.current = null }
      }, [popup && popup.key, popup && popup.motion && popup.motion.sequence])

      function capsuleCanvasIsBlank(page, pageBox, rect) {
        const canvas = page && page.querySelector('.lr-page-canvas')
        if (!canvas || !(canvas.width > 0 && canvas.height > 0 && pageBox.width > 0 && pageBox.height > 0)) return false
        try {
          let sample = capsuleSampleRef.current
          if (!sample) { sample = document.createElement('canvas'); sample.width = 32; sample.height = 8; capsuleSampleRef.current = sample }
          const context = sample.getContext('2d', { willReadFrequently: true })
          if (!context) return false
          context.clearRect(0, 0, 32, 8)
          const corners = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]]
          corners.forEach(([x, y], index) => context.drawImage(canvas, x, y, 1, 1, index, 0, 1, 1))
          const values = context.getImageData(0, 0, 4, 1).data
          if ([3, 7, 11, 15].some((index) => values[index] < 245)) return false
          const background = [0, 1, 2].map((channel) => { const sorted = [0, 4, 8, 12].map((index) => values[index + channel]).sort((a, b) => a - b); return (sorted[1] + sorted[2]) / 2 })
          if (!popupUniformBackground(values, background)) return false
          const x = (rect.left - pageBox.left) / pageBox.width * canvas.width, y = (rect.top - pageBox.top) / pageBox.height * canvas.height, width = rect.width / pageBox.width * canvas.width, height = rect.height / pageBox.height * canvas.height
          if (x < 0 || y < 0 || x + width > canvas.width + 1 || y + height > canvas.height + 1) return false
          context.clearRect(0, 0, 32, 8); context.drawImage(canvas, x, y, width, height, 0, 0, 32, 8)
          return popupUniformBackground(context.getImageData(0, 0, 32, 8).data, background)
        } catch { return false }
      }

      function refreshPopupSessionBars(includeKey) {
        const host = sourceRef.current, owner = paperRef.current && paperRef.current.id
        if (!host || !owner) { sessionBarsRef.current = []; setSessionBars((previous) => previous.length ? [] : previous); return [] }
        const candidates = selectionThreadsRef.current.filter((thread) => popupThreadForPaper(thread, owner) && popupThreadHasConversation(thread) && !thread.capsuleCollected).sort((a, b) => (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0))
        if (!candidates.length) { sessionBarsRef.current = []; setSessionBars((previous) => previous.length ? [] : previous); return [] }
        const view = host.getBoundingClientRect(), sx = view.width / host.offsetWidth || 1, sy = view.height / host.offsetHeight || 1
        const pageGeometry = new Map(), reserved = [], bars = []
        const tags = [...host.querySelectorAll('.lr-tag'), ...host.querySelectorAll('.lr-reference-return')].map((node) => node.getBoundingClientRect()).filter((box) => box.width > 0 && box.height > 0)
        for (const page of host.querySelectorAll('.lr-page')) {
          const box = page.getBoundingClientRect()
          if (box.bottom <= view.top || box.top >= view.bottom) continue
          pageGeometry.set(Number(page.dataset.page), { page, box, obstacles: Array.from(page.querySelectorAll('.lr-textlayer span')).map((node) => node.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0).concat(tags) })
        }
        if (includeKey) candidates.sort((a, b) => Number(b.key === includeKey) - Number(a.key === includeKey))
        for (const thread of candidates) {
          if (bars.length >= 6) break
          const origin = thread.origin, geometry = origin && pageGeometry.get(Number(origin.page))
          if (!geometry) continue
          const source = popupRectFromOrigin(host, origin)
          if (!source) continue
          // Vertical placement uses the original PDF page, never the scrollport.
          // Clip visibility afterwards so the badge can leave and return with its text.
          const pageView = { left: view.left, right: view.right, width: view.width, top: geometry.box.top, bottom: geometry.box.bottom, height: geometry.box.height }
          const saved = thread.capsuleOrigin
          let preferred = saved && saved.documentId === owner && Number(saved.page) === Number(origin.page) && [saved.x, saved.y].every(Number.isFinite) ? { left: geometry.box.left + saved.x * geometry.box.width, top: geometry.box.top + saved.y * geometry.box.height } : null
          if (!thread.capsuleManual && preferred && (preferred.top < source.top - 246 * sy || preferred.top > source.bottom + 246 * sy)) preferred = null
          let placement = thread.capsuleManual && preferred ? popupCapsuleFallback({ view: pageView, source, preferred, reserved, sx, sy, iconOnly: thread.capsuleMode === 'icon' }) : null
          const rejected = []
          for (let probe = 0; !placement && probe < 4; probe += 1) {
            const candidate = popupCapsulePlacement({ view: pageView, page: geometry.box, source, obstacles: geometry.obstacles.concat(rejected), reserved, preferred, sx, sy, iconOnly: probe >= 2 })
            if (!candidate) break
            if (capsuleCanvasIsBlank(geometry.page, geometry.box, candidate)) { placement = candidate; break }
            rejected.push(candidate)
          }
          if (!placement) {
            const edges = source.textEdges || source
            placement = popupCapsuleFallback({ view: pageView, source, preferred: preferred || { left: edges.right + 7 * sx, top: source.bottom + 8 * sy }, reserved, sx, sy })
          }
          if (!placement) continue
          reserved.push(placement)
          if (!popupRectOverlaps(placement, view)) continue
          bars.push({ key: thread.key, documentId: owner, left: (placement.left - view.left) / sx + host.scrollLeft, top: (placement.top - view.top) / sy + host.scrollTop, width: placement.width / sx, height: placement.height / sy, mode: placement.mode || 'mini', fallback: Boolean(placement.fallback), page: Number(origin && origin.page) || null, quote: thread.quote || '', question: (thread.turns || []).at(-1) && thread.turns.at(-1).question || '', rect: placement, capsuleOrigin: geometry && origin ? { documentId: owner, page: Number(origin.page), x: (placement.left - geometry.box.left) / geometry.box.width, y: (placement.top - geometry.box.top) / geometry.box.height } : thread.capsuleOrigin || null })
        }
        sessionBarsRef.current = bars
        setSessionBars((previous) => previous.length === bars.length && previous.every((bar, index) => bar.key === bars[index].key && Math.abs(bar.left - bars[index].left) < .5 && Math.abs(bar.top - bars[index].top) < .5 && bar.width === bars[index].width && bar.mode === bars[index].mode && bar.fallback === bars[index].fallback && bar.question === bars[index].question) ? previous : bars)
        return bars
      }

      function cancelSessionDrag(animateBack) {
        const drag = sessionDragRef.current
        if (!drag) return
        sessionDragRef.current = null
        const node = drag.node, target = sessionMenuRef.current && sessionMenuRef.current.querySelector('.lr-session-toggle')
        if (target) target.classList.remove('is-drop-target')
        if (node && node.isConnected) {
          const from = node.style.transform; node.style.transform = ''; node.classList.remove('is-dragging')
          if (animateBack && from && typeof node.animate === 'function' && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) node.animate([{ transform: from }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.75,.18,1)' })
          try { if (node.hasPointerCapture && node.hasPointerCapture(drag.pointerId)) node.releasePointerCapture(drag.pointerId) } catch { /* pointer ended */ }
        }
      }

      function beginSessionDrag(event, key) {
        if (event.button != null && event.button !== 0) return
        const node = event.currentTarget, owner = paperRef.current && paperRef.current.id, thread = selectionThreadsRef.current.find((item) => item.key === key && popupThreadForPaper(item, owner))
        if (!node || !thread || !popupThreadHasConversation(thread)) return
        cancelSessionDrag(false)
        sessionDragRef.current = { key, owner, epoch: epochRef.current, pointerId: event.pointerId, node, x: event.clientX, y: event.clientY, rect: node.getBoundingClientRect(), moved: false, drop: false }
        if (event.isTrusted && node.setPointerCapture) { try { node.setPointerCapture(event.pointerId) } catch { /* unsupported capture */ } }
      }

      function moveSessionDrag(event) {
        const drag = sessionDragRef.current, host = sourceRef.current
        if (!drag || event.pointerId !== drag.pointerId || !host) return
        if (drag.owner !== (paperRef.current && paperRef.current.id) || drag.epoch !== epochRef.current) { cancelSessionDrag(false); return }
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y
        if (!drag.moved && Math.hypot(dx, dy) <= 5) return
        event.preventDefault(); drag.moved = true; drag.node.classList.add('is-dragging')
        const view = host.getBoundingClientRect(), left = Math.max(view.left + 4, Math.min(drag.rect.left + dx, view.right - drag.rect.width - 4)), top = Math.max(view.top + 4, Math.min(drag.rect.top + dy, view.bottom - drag.rect.height - 4))
        drag.node.style.transform = 'translate(' + (left - drag.rect.left) + 'px,' + (top - drag.rect.top) + 'px)'
        const target = sessionMenuRef.current && sessionMenuRef.current.querySelector('.lr-session-toggle'), box = target && target.getBoundingClientRect()
        drag.drop = Boolean(box && event.clientX >= box.left - 8 && event.clientX <= box.right + 8 && event.clientY >= box.top - 8 && event.clientY <= box.bottom + 8)
        if (target) target.classList.toggle('is-drop-target', drag.drop)
      }

      function endSessionDrag(event) {
        const drag = sessionDragRef.current
        if (!drag || event.pointerId !== drag.pointerId) return
        if (drag.owner !== (paperRef.current && paperRef.current.id) || drag.epoch !== epochRef.current) { cancelSessionDrag(false); return }
        const moved = drag.moved, drop = drag.drop, key = drag.key, node = drag.node
        if (moved) sessionClickSuppress.current = { key, until: Date.now() + 500 }
        const from = node.getBoundingClientRect()
        cancelSessionDrag(false)
        if (moved && drop) collectPopupSession(key, true, from)
        else if (moved) {
          const host = sourceRef.current, thread = selectionThreadsRef.current.find((item) => item.key === key && popupThreadForPaper(item, drag.owner)), page = host && thread && thread.origin && host.querySelector('.lr-page[data-page="' + Number(thread.origin.page) + '"]')
          if (host && page) {
            const pageBox = page.getBoundingClientRect(), view = host.getBoundingClientRect(), sx = view.width / host.offsetWidth || 1, sy = view.height / host.offsetHeight || 1
            node.style.left = ((from.left - view.left) / sx + host.scrollLeft) + 'px'; node.style.top = ((from.top - view.top) / sy + host.scrollTop) + 'px'
            saveSelectionThread({ documentId: drag.owner, key, capsuleManual: true, capsuleMode: node.dataset.capsuleMode || 'mini', capsuleOrigin: { documentId: drag.owner, page: Number(thread.origin.page), x: (from.left - pageBox.left) / pageBox.width, y: (from.top - pageBox.top) / pageBox.height } })
            refreshPopupSessionBars()
          }
        }
      }

      async function collectPopupSession(key, collect, fromRect) {
        const owner = paperRef.current && paperRef.current.id, epoch = epochRef.current, thread = selectionThreadsRef.current.find((item) => item.key === key && popupThreadForPaper(item, owner))
        if (!thread || !popupThreadHasConversation(thread)) return false
        const alive = () => sessionMountedRef.current && epochRef.current === epoch && owner === (paperRef.current && paperRef.current.id)
        const capsule = sessionCapsuleNode(key), target = sessionMenuRef.current && sessionMenuRef.current.querySelector('.lr-session-toggle')
        if (collect && capsule && target && typeof capsule.animate === 'function' && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
          const base = capsule.getBoundingClientRect(), from = fromRect || base, box = target.getBoundingClientRect(), start = popupFlipFrame(from, base, 1, 19), end = popupFlipFrame(box, base, 0, 19)
          if (start && end) { const animation = capsule.animate([start, end], { duration: 280, easing: 'cubic-bezier(.2,.75,.18,1)' }); animation.lrSessionKey = key; sessionCollectAnimations.current.add(animation); try { await animation.finished } catch { return false } finally { sessionCollectAnimations.current.delete(animation) } }
        }
        if (!alive()) return false
        saveSelectionThread({ documentId: owner, key, capsuleCollected: Boolean(collect) })
        if (collect && popupRef.current && popupRef.current.key === key) { cancelPopupMotion(false); setCurrentPopup((value) => value && value.key === key ? { ...value, presentation: 'bar', motion: null, morphing: false } : value) }
        refreshPopupSessionBars()
        if (collect && target && typeof target.animate === 'function' && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) { const pulse = target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.035)', offset: .5 }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' }); pulse.lrSessionKey = key; sessionCollectAnimations.current.add(pulse); pulse.finished.then(() => sessionCollectAnimations.current.delete(pulse), () => sessionCollectAnimations.current.delete(pulse)) }
        return true
      }

      async function restorePopupSession(key, options) {
        options = options || {}
        const owner = paperRef.current && paperRef.current.id, epoch = epochRef.current, request = ++sessionRestoreRef.current
        for (const animation of sessionCollectAnimations.current) if (animation.lrSessionKey === key) animation.cancel()
        if (!owner) return false
        const thread = selectionThreadsRef.current.find((item) => item.key === key && popupThreadForPaper(item, owner))
        const recent = recentPopupRef.current && recentPopupRef.current.documentId === owner && recentPopupRef.current.popup.key === key ? recentPopupRef.current : null
        if (!thread && !recent) return false
        const alive = () => sessionMountedRef.current && request === sessionRestoreRef.current && epoch === epochRef.current && owner === (paperRef.current && paperRef.current.id)
        let locatedOrigin = null
        const capsuleNode = sessionCapsuleNode(key), capsuleBox = capsuleNode && capsuleNode.getBoundingClientRect()
        if (capsuleBox && thread) {
          const anchor = thread.selection && thread.selection.anchor || thread.anchor, locator = locatorRef.current
          if (anchor && anchor.kind === 'pdf-text-range' && locator && locator.locateSelection) {
            const verified = await locator.locateSelection(anchor.anchors, alive, { scroll: false })
            if (!alive()) return false
            if (!verified) { if (locator.clearTransient) locator.clearTransient(); setNotice('对话已恢复，但原文选区暂未核对，请检查原文。') }
          }
        }
        if (options.restoreSelection && thread && !capsuleBox) {
          let found = false
          try { found = await locateText(thread.quote, thread.anchor || thread.selection && thread.selection.anchor, { reference: false, navigation: 'selection-session' }) } catch (caught) { if (!alive()) return false }
          if (!alive()) return false
          if (found) {
            const host = sourceRef.current, marker = host && host.querySelector('.lr-coordinate-focus,.lr-evidence,.lr-selhl')
            if (marker) locatedOrigin = bindPopupOrigin(marker.getBoundingClientRect())
          } else setNotice('对话记录已保留；这段原文暂未准确定位，请核对选区。')
        }
        const current = popupRef.current
        const currentRect = current && current.key === key && popupRectFromOrigin(sourceRef.current, current.origin || popupOriginRef.current), currentView = sourceRef.current && sourceRef.current.getBoundingClientRect()
        if (current && current.key === key && current.documentId === owner && currentRect && currentView && currentRect.bottom >= currentView.top && currentRect.top <= currentView.bottom) { changePopupPresentation('shown', null, key); setPopupHistoryOpen(false); return true }
        let origin = locatedOrigin || thread && thread.origin || recent && recent.origin
        let source = popupRectFromOrigin(sourceRef.current, origin)
        if (options.hover && !source) return false
        if (!source && !options.hover) {
          if (!thread || !await locateText(thread.quote, thread.anchor || thread.selection && thread.selection.anchor, { reference: false, navigation: 'selection-session' }) || !alive()) { if (alive()) setNotice('这段对话的原文暂未准确定位，记录仍保留在对话列表。'); return false }
          const host = sourceRef.current, marker = host && host.querySelector('.lr-coordinate-focus,.lr-evidence,.lr-selhl')
          if (marker) { const box = marker.getBoundingClientRect(); origin = bindPopupOrigin(box); source = popupRectFromOrigin(host, origin) }
        }
        if (!alive() || !source || !sourceRef.current) return false
        const host = sourceRef.current, view = host.getBoundingClientRect(), sy = view.height / host.offsetHeight || 1
        if (!capsuleBox && (source.bottom < view.top || source.top > view.bottom)) {
          if (options.hover) return false
          cancelReaderChromeFold(); readerChromeFoldRef.current.userUntil = 0
          host.scrollTop += (source.top - view.top - view.height * .27) / sy
          source = popupRectFromOrigin(host, origin)
        }
        if (!alive()) return false
        const savedText = thread && thread.translation || recent && recent.popup.sessionSnapshot && recent.popup.sessionSnapshot.translation
        const translated = savedText ? { cached: savedText, record: null } : recent ? { cached: recent.popup.cached, record: recent.popup.record } : ensureTranslation(thread.quote, owner)
        if (!translated) return false
        popupOriginRef.current = origin
        const placement = capsuleBox ? popupCapsuleExpansion({ view, capsule: capsuleBox, sx: view.width / host.offsetWidth || 1, sy, height: recent && recent.popup.expandedHeight || 300, scrollLeft: host.scrollLeft, scrollTop: host.scrollTop, key }) : popupPlacement(source, recent && recent.popup.expandedHeight || 230)
        if (!placement) return false
        const selection = thread && thread.selection || recent && recent.popup.selection || { text: thread ? thread.quote : recent.popup.source, anchor: thread && thread.anchor || null }
        const highlightAnchors = selection.anchor && selection.anchor.kind === 'pdf-text-range' ? selection.anchor.anchors : recent && recent.popup.highlightAnchors || null
        const annotation = highlightAnchors && (snapshotRef.current && snapshotRef.current.annotations || []).find((item) => annotationKey(item.anchors) === annotationKey(highlightAnchors))
        const value = { ...(recent && recent.popup || {}), highlightAnchors, highlightColor: annotation && annotation.color || null, highlightStyle: annotation && (annotation.style || 'highlight') || null, highlightId: annotation && annotation.id || null, key, documentId: owner, title: paperRef.current.title, source: thread && thread.quote || recent.popup.source, selection, origin, anchor: placement, viewportHeight: placement.viewportHeight, docked: false, compact: false, presentation: 'shown', cached: translated.cached, record: translated.record, expandedHeight: recent && recent.popup.expandedHeight, restoredAt: Date.now(), revealUntilHover: false }
        recentPopupRef.current = { popup: value, origin, documentId: owner }
        const target = capsuleBox && { left: placement.viewportLeft, top: placement.viewportTop, width: placement.width * (view.width / host.offsetWidth || 1), height: value.expandedHeight || 300 }
        setCurrentPopup(beginPopupMotion(value, 'expand', capsuleBox, target)); setPopupHistoryOpen(false)
        if (thread) saveSelectionThread({ documentId: owner, key, origin, shortcutHidden: false, lastUsedAt: Date.now() })
        if (!options.hover) window.requestAnimationFrame(() => { if (alive()) { const control = sourceRef.current && sourceRef.current.querySelector('.lr-pop .lr-mode-toggle'); if (control) control.focus() } })
        return true
      }


      function popupSourcePointer(event) {
        if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) popupPointerRef.current = { x: event.clientX, y: event.clientY, at: Date.now(), documentId: paperRef.current && paperRef.current.id }
        const current = popupRef.current
        if (!current || current.presentation !== 'perspective' || event.buttons || event.pointerType === 'touch' || event.target && event.target.closest && event.target.closest('.lr-session-capsule,.lr-session-header')) return
        const host = sourceRef.current, card = host && host.querySelector('.lr-pop.is-perspective') || document.querySelector('.lr-pop.is-perspective')
        if (!card) return
        const rect = card.getBoundingClientRect()
        if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) changePopupPresentation('shown', null, current.key)
      }

      useEffect(() => {
        function outsidePopup(event) {
          if (event.target.closest && event.target.closest('.lr-pop,.lr-session-header,.lr-session-capsule,.lr-tag,.lr-splitter')) return
          if (popupEditingTarget(document.activeElement) && document.activeElement.closest && document.activeElement.closest('.lr-pop')) return
          const current = popupRef.current
          if (current && current.presentation !== 'bar') closePopup('outside')
          setPopupHistoryOpen(false)
        }
        function popupKeys(event) {
          if (event.isComposing || event.keyCode === 229 || popupEditingTarget(event.target)) return
          const host = sourceRef.current, current = popupRef.current
          const inPdf = host && host.contains(document.activeElement) && !(document.activeElement.closest && document.activeElement.closest('.lr-pop,.lr-session-history'))
          const altT = event.altKey && !event.ctrlKey && !event.metaKey && (event.code === 'KeyT' || String(event.key).toLowerCase() === 't')
          if (altT && inPdf) {
            const owner = paperRef.current && paperRef.current.id, recent = recentPopupRef.current
            const latest = selectionThreadsRef.current.filter((item) => popupThreadForPaper(item, owner) && popupThreadHasConversation(item)).sort((a, b) => (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0))[0]
            const key = current && current.documentId === owner ? current.key : recent && recent.documentId === owner ? recent.popup.key : latest && latest.key
            if (key) { event.preventDefault(); event.stopPropagation(); restorePopupSession(key) }
          } else if (event.key === 'Escape' && (inPdf || event.target.closest && event.target.closest('.lr-pop'))) {
            if (current && current.presentation !== 'bar') { event.preventDefault(); event.stopPropagation(); closePopup('escape') }
            setPopupHistoryOpen(false)
          }
        }
        document.addEventListener('pointerdown', outsidePopup, true); document.addEventListener('keydown', popupKeys, true); document.addEventListener('pointermove', popupSourcePointer, { passive: true })
        return () => { document.removeEventListener('pointerdown', outsidePopup, true); document.removeEventListener('keydown', popupKeys, true); document.removeEventListener('pointermove', popupSourcePointer); clearTimeout(sessionHoverRef.current) }
      }, [])

      async function copyText(value) {
        try {
          await navigator.clipboard.writeText(value)
          return true
        } catch {
          setNotice('复制失败，请重试或手动选择文字复制。')
          return false
        }
      }

      function zoomBy(delta) {
        const current = effectiveScale || 1
        setFitWidth(false)
        setZoom(Math.max(0.4, Math.min(3, Math.round((current + delta) * 100) / 100)))
      }

      function stopPaneResize(commit) {
        const drag = paneResizeRef.current
        if (!drag) return
        paneResizeRef.current = null
        if (drag.frame != null) window.cancelAnimationFrame(drag.frame)
        window.removeEventListener('pointermove', drag.onMove)
        window.removeEventListener('pointerup', drag.onUp)
        window.removeEventListener('pointercancel', drag.onCancel)
        window.removeEventListener('blur', drag.onBlur)
        drag.handle.removeEventListener('lostpointercapture', drag.onCancel)
        if (drag.handle.hasPointerCapture?.(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId)
        document.body.style.cursor = drag.cursor
        document.body.style.userSelect = drag.userSelect
        const accepted = commit && drag.owner === (paperRef.current && paperRef.current.id) && drag.epoch === epochRef.current && drag.latest !== drag.startWidth
        drag.source.style.width = accepted ? drag.latest + 'px' : drag.originalWidth
        if (accepted) setPaneWidth(drag.latest)
        if (sessionMountedRef.current) setPaneResizing(false)
      }

      function startResize(event) {
        if (event.button !== 0 || event.isPrimary === false) return
        const handle = event.currentTarget, body = handle.parentElement, source = handle.previousElementSibling
        if (!body || !source) return
        event.preventDefault()
        stopPaneResize(false)
        cancelSessionDrag(false); cancelPopupMotion(true); for (const animation of sessionCollectAnimations.current) animation.cancel(); sessionCollectAnimations.current.clear()
        cancelReaderChromeFold(); readerChromeFoldRef.current.userUntil = 0; readerChromeFoldRef.current.userScrolled = false
        const owner = paperRef.current && paperRef.current.id, epoch = epochRef.current, startX = event.clientX, startWidth = source.offsetWidth
        const maxWidth = Math.max(300, body.clientWidth - 292)
        const drag = { owner, epoch, handle, source, pointerId: event.pointerId, startWidth, originalWidth: source.style.width, latest: startWidth, frame: null, cursor: document.body.style.cursor, userSelect: document.body.style.userSelect }
        const alive = () => paneResizeRef.current === drag && drag.owner === (paperRef.current && paperRef.current.id) && drag.epoch === epochRef.current
        const widthAt = (x) => Math.max(300, Math.min(maxWidth, Math.round(startWidth + x - startX)))
        drag.onMove = (moveEvent) => {
          if (moveEvent.pointerId !== drag.pointerId) return
          if (!alive()) { if (paneResizeRef.current === drag) stopPaneResize(false); return }
          const width = widthAt(moveEvent.clientX)
          if (width === drag.latest) return
          drag.latest = width
          // Only the source pane owns the live width. A variable on the parent
          // would also invalidate the styles of both reading subtrees.
          if (drag.frame == null) drag.frame = window.requestAnimationFrame(() => {
            drag.frame = null
            if (alive()) source.style.width = drag.latest + 'px'
          })
        }
        drag.onUp = (upEvent) => {
          if (upEvent.pointerId !== drag.pointerId || paneResizeRef.current !== drag) return
          if (drag.latest !== startWidth || Math.abs(upEvent.clientX - startX) > 1) drag.latest = widthAt(upEvent.clientX)
          stopPaneResize(true)
        }
        drag.onCancel = (cancelEvent) => { if (cancelEvent.pointerId === drag.pointerId && paneResizeRef.current === drag) stopPaneResize(false) }
        drag.onBlur = () => { if (paneResizeRef.current === drag) stopPaneResize(false) }
        paneResizeRef.current = drag
        setPaneResizing(true)
        window.addEventListener('pointermove', drag.onMove)
        window.addEventListener('pointerup', drag.onUp)
        window.addEventListener('pointercancel', drag.onCancel)
        window.addEventListener('blur', drag.onBlur)
        handle.addEventListener('lostpointercapture', drag.onCancel)
        if (event.isTrusted) handle.setPointerCapture?.(drag.pointerId)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      }

      useEffect(() => () => stopPaneResize(false), [])

      async function openPdfBytes(bytes, name, task, expectedText) {
        const pdfjs = await loadPdfJs()
        if (task && !task.alive()) return null
        const doc = await loadPdfDocument(pdfjs, bytes).promise
        if (task && !task.alive()) { doc.destroy(); return null }
        if (expectedText && identityText(await extractPdfText(doc)) !== identityText(expectedText)) {
          doc.destroy()
          throw new Error('旧版 PDF 与当前正文不一致，请重新导入 PDF。')
        }
        if (task && !task.alive()) { doc.destroy(); return null }
        if (pdfDocRef.current && pdfDocRef.current !== doc) pdfDocRef.current.destroy()
        pdfBytesRef.current = bytes
        pdfDocRef.current = doc
        setPdfDoc(doc)
        setSourceTab('pdf')
        const current = paperRef.current
        if (current && looksLikeFileName(current.title)) {
          const title = await extractPdfTitle(doc)
          if ((!task || task.alive()) && paperRef.current && paperRef.current.id === current.id && paperRef.current.title === current.title && title) {
            const next = { ...paperRef.current, title }
            applyPaper(next)
            rememberDocument(next)
          }
        }
        return doc
      }

      function closePdf() {
        if (pdfDocRef.current && typeof pdfDocRef.current.destroy === 'function') {
          try { pdfDocRef.current.destroy() } catch { /* already closed */ }
        }
        pdfDocRef.current = null
        pdfBytesRef.current = null
        locatorRef.current = null
        setPdfDoc(null)
        setSourceTab('text')
      }

      function bindPopupOrigin(rect, pointer) {
        const host = sourceRef.current
        if (!host) return null
        for (const page of host.querySelectorAll('.lr-page')) {
          const box = page.getBoundingClientRect()
          if (rect.top < box.top - 2 || rect.top > box.bottom + 2) continue
          return {
            page: page.dataset.page, documentId: paperRef.current && paperRef.current.id,
            orbSide: rect.textEdges && rect.textEdges.right <= box.left + box.width * .56 ? 'left' : rect.textEdges && rect.textEdges.left >= box.left + box.width * .44 ? 'right' : (pointer ? pointer.x : (rect.left + rect.right) / 2) < (rect.textEdges ? (rect.textEdges.left + rect.textEdges.right) / 2 : (box.left + box.right) / 2) ? 'left' : 'right',
            textEdges: rect.textEdges ? { left: (rect.textEdges.left - box.left) / box.width, right: (rect.textEdges.right - box.left) / box.width } : null,
            x: (rect.left - box.left) / box.width,
            y: (rect.top - box.top) / box.height,
            width: rect.width / box.width,
            height: Math.min(rect.height, box.bottom - rect.top) / box.height,
            pointer: pointer ? { x: (pointer.x - box.left) / box.width, y: (pointer.y - box.top) / box.height } : null,
          }
        }
        return null
      }

      function popupSourceRect() {
        const host = sourceRef.current
        return popupRectFromOrigin(host, popupOriginRef.current)
      }

      function popupPlacement(rect, height, edgeAligned) {
        const host = sourceRef.current
        if (!host || !rect) return null
        const box = host.getBoundingClientRect()
        const sx = box.width / host.offsetWidth || 1
        const sy = box.height / host.offsetHeight || 1
        const width = Math.min(360 * sx, box.width - 16 * sx)
        height = Math.min(height || 210 * sy, box.height - 16 * sy)
        const gap = 12 * sy
        const below = box.bottom - rect.bottom - gap
        const above = rect.top - box.top - gap
        const side = below >= height || below >= above ? 'below' : 'above'
        const origin = popupOriginRef.current
        const onRight = origin && origin.orbSide === 'right'
        const textLeft = rect.textEdges ? rect.textEdges.left : rect.left
        const textRight = rect.textEdges ? rect.textEdges.right : rect.right
        const available = onRight ? box.right - textRight : textLeft - box.left
        let orbSize = Math.max(16 * sx, Math.min(36 * sx, available - 4 * sx))
        let orbHeight = orbSize / sx * sy
        let orbLeft = Math.max(box.left + 2 * sx, Math.min(onRight ? textRight + 8 * sx : textLeft - orbSize - 8 * sx, box.right - orbSize - 2 * sx))
        let orbTop = Math.max(box.top + 8 * sy, Math.min(rect.top - 8 * sy, box.bottom - orbHeight - 8 * sy))
        // Ordinary translation placement uses the saved selection/pointer. The
        // former edge orb geometry is only relevant to legacy edge-aligned cards.
        if (edgeAligned) {
          const page = origin && host.querySelector('.lr-page[data-page="' + origin.page + '"]')
          const obstacles = [...(page ? page.querySelectorAll('.lr-textlayer span') : []), ...host.querySelectorAll('.lr-tag')].map((node) => node.getBoundingClientRect()).filter((item) => item.width > 1 && item.height > 1 && item.bottom > box.top && item.top < box.bottom)
          const overlaps = (x, y, w, h) => obstacles.some((item) => item.right > x + .5 * sx && item.left < x + w - .5 * sx && item.bottom > y + .5 * sy && item.top < y + h - .5 * sy)
          if (overlaps(orbLeft, orbTop, orbSize, orbHeight)) {
            let best = null
            for (const shift of [0, -40, 40, -80, 80, -140, 140]) {
              const y = Math.max(box.top + 4 * sy, Math.min(orbTop + shift * sy, box.bottom - orbHeight - 4 * sy))
              let gaps = [[onRight ? textRight + sx : box.left + 2 * sx, onRight ? box.right - 2 * sx : textLeft - sx]]
              for (const item of obstacles.filter((item) => item.bottom > y && item.top < y + orbHeight)) {
                gaps = gaps.flatMap(([a, b]) => item.right + sx <= a || item.left - sx >= b ? [[a, b]] : [[a, Math.min(b, item.left - sx)], [Math.max(a, item.right + sx), b]].filter(([left, right]) => right > left))
              }
              for (const [a, b] of gaps) {
                const size = Math.min(orbSize, b - a)
                if (size < 16 * sx) continue
                const x = onRight ? a : b - size
                const edgeDistance = onRight ? x - textRight : textLeft - x - size
                const score = Math.abs(y - orbTop) / sy + (orbSize - size) / sx * 1.5 + Math.max(0, edgeDistance) / sx * .8
                if (!best || score < best.score) best = { x, y, size, score }
              }
            }
            if (best) { orbLeft = best.x; orbTop = best.y; orbSize = best.size; orbHeight = orbSize / sx * sy }
          }
          const tags = Array.from(host.querySelectorAll('.lr-tag')).map((tag) => tag.getBoundingClientRect()).filter((tag) => tag.right > orbLeft && tag.left < orbLeft + orbSize)
          for (let attempt = 0; attempt < tags.length; attempt += 1) {
            const collision = tags.find((tag) => tag.bottom + 4 * sy > orbTop && tag.top - 4 * sy < orbTop + orbHeight)
            if (!collision) break
            const belowTag = collision.bottom + 8 * sy
            orbTop = belowTag <= box.bottom - orbHeight - 8 * sy ? belowTag : Math.max(box.top + 8 * sy, collision.top - orbHeight - 8 * sy)
          }
        }
        const desiredTop = edgeAligned ? orbTop : rect.pointer ? rect.pointer.y - Math.min(44 * sy, height * .3) : side === 'below' ? rect.bottom + gap : rect.top - height - gap
        const top = Math.max(box.top + 8 * sy, Math.min(desiredTop, box.bottom - height - 8 * sy))
        const desiredLeft = edgeAligned ? onRight ? orbLeft + orbSize - width : orbLeft : rect.pointer ? rect.pointer.x - 28 * sx : rect.left
        const left = Math.max(box.left + 8 * sx, Math.min(desiredLeft, box.right - width - 8 * sx))
        const distance = Math.max(box.top - rect.bottom, rect.top - box.bottom, 0)
        const closeDistance = Math.max(180 * sy, Math.min(420 * sy, box.height * .65))
        return {
          left: (left - box.left) / sx + host.scrollLeft,
          top: (top - box.top) / sy + host.scrollTop,
          orbLeft: (orbLeft - box.left) / sx + host.scrollLeft,
          orbTop: (orbTop - box.top) / sy + host.scrollTop,
          orbSize: orbSize / sx,
          viewportOrbLeft: orbLeft,
          viewportOrbTop: orbTop,
          viewportLeft: left,
          viewportTop: top,
          width: width / sx,
          above: side === 'above',
          tipX: Math.max(18, Math.min(width / sx - 18, (rect.left + Math.min((rect.right - rect.left) / 2, width / 2) - left) / sx)),
          tether: rect.bottom < box.top ? 'above' : rect.top > box.bottom ? 'below' : '',
          viewportHeight: host.clientHeight,
          shouldClose: distance > closeDistance,
          cursorAttached: Boolean(rect.pointer),
        }
      }

      function updatePopupPlacement() {
        if (paneResizeRef.current) return
        refreshPopupSessionBars()
        const current = popupRef.current
        if (!current || current.presentation === 'bar' || current.motion) return
        const rect = popupSourceRect()
        if (!rect) return
        const card = document.querySelector('.lr-pop')
        const capsule = current.anchor && current.anchor.capsuleKey && sessionCapsuleNode(current.anchor.capsuleKey), capsuleBox = capsule && capsule.getBoundingClientRect(), view = sourceRef.current && sourceRef.current.getBoundingClientRect()
        const placement = capsuleBox && view ? popupCapsuleExpansion({ view, capsule: capsuleBox, sx: view.width / sourceRef.current.offsetWidth || 1, sy: view.height / sourceRef.current.offsetHeight || 1, height: card && card.getBoundingClientRect().height || current.expandedHeight, scrollLeft: sourceRef.current.scrollLeft, scrollTop: sourceRef.current.scrollTop, key: current.key }) : popupPlacement(rect, current.compact || current.morphing ? current.expandedHeight : card && card.getBoundingClientRect().height, current.edgeAligned)
        if (!placement) return
        if (placement.shouldClose && !popupThreadHasConversation(activePopupThread(current))) { closePopup('distance'); return }
        if (current.presentation === 'perspective') return
        setCurrentPopup((value) => {
          if (!value || value.key !== current.key) return value
          const anchor = value.docked ? value.anchor : placement
          if (value.tether === placement.tether && value.viewportHeight === placement.viewportHeight && value.anchor.width === placement.width && value.anchor.orbSize === placement.orbSize &&
              Math.abs((value.anchor.orbLeft || 0) - placement.orbLeft) < .5 && Math.abs((value.anchor.orbTop || 0) - placement.orbTop) < .5 &&
              anchor.above === value.anchor.above && Math.abs(anchor.left - value.anchor.left) < .5 &&
              Math.abs(anchor.top - value.anchor.top) < .5 && Math.abs((anchor.tipX || 0) - (value.anchor.tipX || 0)) < .5) return value
          return { ...value, anchor, tether: placement.tether, viewportHeight: placement.viewportHeight }
        })
      }


      function handleSelect(text, rect, pointer, revealUntilHover) {
        if (!revealUntilHover) { cardRequestRef.current += 1; activeCardRef.current = null; setActiveCard(null); setCardLocating(false) }
        const result = paperRef.current && ensureTranslation(text, paperRef.current.id)
        if (!result) return
        popupOriginRef.current = bindPopupOrigin(rect, pointer)
        sessionRestoreRef.current += 1
        setPopupHistoryOpen(false)
        const placement = popupPlacement({ ...rect, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, pointer }) || { left: 12, top: 120, above: false, tipX: 28 }
        const anchors = locatorRef.current && locatorRef.current.captureSelection ? locatorRef.current.captureSelection() : null
        const surrounding = locatorRef.current && locatorRef.current.captureContext ? locatorRef.current.captureContext(anchors) : null
        const saved = anchors && annotations.find((item) => annotationKey(item.anchors) === annotationKey(anchors))
        setCurrentPopup({
          key: result.key + ':' + sha256Hex(new TextEncoder().encode(JSON.stringify(anchors || {}))).slice(0, 16), source: text, highlightColor: saved && saved.color, highlightStyle: saved && (saved.style || 'highlight'), highlightId: saved && saved.id, documentId: paperRef.current.id, title: paperRef.current.title,
          anchor: placement, viewportHeight: placement.viewportHeight, origin: popupOriginRef.current, presentation: 'shown', compact: false,
          docked: !pdfDocRef.current || !sourceRef.current || !sourceRef.current.classList.contains('is-pdf'),
          cached: result.cached, record: result.record,
          revealUntilHover: Boolean(revealUntilHover),
          highlightAnchors: anchors,
          selection: { text, ...(surrounding || {}), context: surrounding ? surrounding.before + text + surrounding.after : text, anchor: anchors ? { kind: 'pdf-text-range', documentId: paperRef.current.id, anchors } : null },
        })
      }

      function setHighlight(color, style, expectedKey) {
        style = style === 'underline' ? 'underline' : 'highlight'
        const current = popupRef.current
        if (!current || !paperRef.current || expectedKey && current.key !== expectedKey || current.documentId !== paperRef.current.id) return
        let anchors = current.documentId === paperRef.current.id ? current.highlightAnchors : null
        if (!anchors) anchors = locatorRef.current && locatorRef.current.captureSelection ? locatorRef.current.captureSelection() : null
        if (!anchors) { setNotice('没有保留到准确选区，请重新选中文字后设置高亮。'); return }
        const key = annotationKey(anchors)
        const existing = annotations.find((item) => annotationKey(item.anchors) === key)
        const remove = existing && existing.color === color && (existing.style === 'underline' ? 'underline' : 'highlight') === style
        const id = existing ? existing.id : 'mark-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
        setAnnotations((previous) => {
          const rest = previous.filter((item) => annotationKey(item.anchors) !== key)
          return remove ? rest : [...rest, { id, quote: current.source, color, style, anchors, createdAt: existing ? existing.createdAt : Date.now() }]
        })
        setCurrentPopup((value) => value ? { ...value, highlightAnchors: anchors, highlightColor: remove ? null : color, highlightStyle: remove ? null : style, highlightId: remove ? null : id } : value)
        if (locatorRef.current && locatorRef.current.clearTransient) locatorRef.current.clearTransient()
      }


      function reanchorPopup(rect) {
        if (!popupRef.current) return
        const previous = popupOriginRef.current
        const next = bindPopupOrigin(rect)
        if (previous && next && previous.page === next.page) { next.pointer = previous.pointer; next.orbSide = previous.orbSide }
        popupOriginRef.current = next
        updatePopupPlacement()
      }

      const capsuleLayoutKey = selectionThreads.map((thread) => [thread.key, thread.capsuleCollected, thread.capsuleManual, thread.capsuleMode, thread.origin && thread.origin.page, thread.origin && thread.origin.x, thread.origin && thread.origin.y, thread.capsuleOrigin && thread.capsuleOrigin.x, thread.capsuleOrigin && thread.capsuleOrigin.y, (thread.turns || []).length].join(':')).join('|')
      useEffect(() => {
        const host = sourceRef.current
        if (!host) return undefined
        let frame = null
        const schedule = () => {
          if (frame == null) frame = window.requestAnimationFrame(() => { frame = null; updatePopupPlacement() })
        }
        host.addEventListener('scroll', schedule, { passive: true })
        host.addEventListener('lr-textlayerrendered', schedule)
        host.addEventListener('lr-canvasrendered', schedule)
        window.addEventListener('resize', schedule)
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
        if (observer) {
          observer.observe(host)
          const card = document.querySelector('.lr-pop')
          if (card) observer.observe(card)
        }
        schedule()
        return () => {
          host.removeEventListener('scroll', schedule)
          host.removeEventListener('lr-textlayerrendered', schedule)
          host.removeEventListener('lr-canvasrendered', schedule)
          window.removeEventListener('resize', schedule)
          if (observer) observer.disconnect()
          if (frame != null) window.cancelAnimationFrame(frame)
        }
      }, [popup && popup.key, popup && popup.presentation, capsuleLayoutKey, paneWidth, pdfDoc, sourceOpen, sourceTab, paneResizing])




      async function withLibraryPdf(record, signal, reportMissing = true) {
        const id = record?.snapshot?.paper?.id
        const directory = catalogRef.current.documents.find((item) => item.id === id)?.pdfDirectory
        if (!record || record.bytes || !directory) return record
        try {
          const response = await fetch('/api/literature/library/local-pdf', localLibraryPost({ path: directory, id }, signal))
          if (!response.ok) throw new Error('原始 PDF 暂时不可用')
          return { ...record, bytes: new Uint8Array(await response.arrayBuffer()) }
        } catch (caught) {
          if (reportMissing && !signal.aborted && !isAbort(caught)) setNotice('无法从保存目录恢复 PDF，可从文献库重新补齐原文。')
          return record
        }
      }

      const renderPdfThumbnail = React.useCallback(async (entry, canvas, signal, previewWidth) => {
        const id = entry.id
        const cached = documentCacheRef.current.get(id) || await idbGet('document:' + id)
        signal.throwIfAborted()
        if (cached?.snapshot?.paper?.id !== id) throw new Error('未找到原始 PDF')
        const record = await withLibraryPdf(cached, signal, false)
        signal.throwIfAborted()
        if (!record.bytes) throw new Error('未找到原始 PDF')
        await paintLibraryPdfPage(record.bytes, canvas, signal, previewWidth)
      }, [])

      const renderZoteroThumbnail = React.useCallback(async (item, canvas, signal, previewWidth) => {
        const { bytes } = await readZoteroLibraryPaper(item, signal, { previewOnly: true })
        await paintLibraryPdfPage(bytes, canvas, signal, previewWidth)
      }, [])

      async function recoverLibrary() {
        if (libraryRecoveryRef.current) return
        libraryRecoveryRef.current = true
        try {
          const keys = (await libraryDbOperation('getAllKeys')).filter((key) => typeof key === 'string' && key.startsWith('document:'))
          const entries = []
          for (const key of keys) {
            const id = key.slice('document:'.length)
            const current = catalogRef.current
            if ((current.deleted || []).includes(id) || current.documents.some((entry) => entry.id === id && typeof entry.hasPdf === 'boolean' && typeof entry.preview === 'string')) continue
            const record = await idbGet(key)
            if (record?.snapshot?.paper?.id === id) entries.push(catalogEntry(record.snapshot.paper, current.documents.find((entry) => entry.id === id), { hasPdf: Boolean(record.bytes), preview: libraryResearchPreview(record.snapshot) }))
          }
          if (entries.length) changeCatalog((previous) => {
            const pending = entries.filter((entry) => !(previous.deleted || []).includes(entry.id))
            const byId = new Map(pending.map((entry) => [entry.id, entry]))
            const merged = previous.documents.map((entry) => byId.has(entry.id) ? { ...byId.get(entry.id), ...entry } : entry)
            return { ...previous, documents: merged.concat(pending.filter((entry) => !previous.documents.some((item) => item.id === entry.id))) }
          })
        } catch { libraryRecoveryRef.current = false }
      }

      function showLibrary(nextTab = 'saved') {
        closeReaderMenus()
        cancelReaderChromeFold()
        if (!libraryOpen && !catalogRef.current.settings.rememberFolder && catalogRef.current.folderId) changeLibraryFolder('')
        setLibraryOpen(true)
        setLibraryTab(nextTab)
        recoverLibrary()
      }

      function closeLibrary(cancelImport = true) {
        if (cancelImport !== false && requestsRef.current.has('library-import')) {
          requestsRef.current.get('library-import').controller.abort()
        }
        if (cancelImport !== false) setLibraryOperation({})
        setLibraryOpen(false)
        queueReaderChromeFold()
      }

      function returnToWelcome() {
        if (paperRef.current) clearPaper()
        closeLibrary()
      }

      async function loadZotero(query = '', start = 0) {
        if (typeof query !== 'string') query = ''
        const task = startTask('zotero-list')
        setZoteroState((old) => ({ ...old, loading: true, error: null, code: null }))
        try {
          const params = new URLSearchParams({ q: query, start: String(start) })
          const value = await fetchJson('/api/literature/zotero?' + params, { signal: task.controller.signal })
          if (task.alive()) setZoteroState((old) => ({ loading: false, error: null, items: (start ? old.items : []).concat(value.items || []), nextStart: value.nextStart, query }))
        } catch (caught) {
          if (task.alive()) setZoteroState({ loading: false, error: textOf(caught), code: caught.code || null, items: [], query })
        } finally { task.finish() }
      }

      function openZotero() {
        showLibrary('zotero')
        loadZotero()
      }

      function changeLibraryTab(nextTab) {
        setLibraryTab(nextTab)
        setLibraryOperation((current) => current.label ? current : {})
        if (nextTab === 'zotero' && !zoteroState.items.length && !zoteroState.loading) loadZotero()
      }

      function changeLibraryFolder(folderId) {
        changeCatalog((old) => ({ ...old, folderId }))
      }

      function createLibraryFolder(value) {
        const name = String(value || '').trim().slice(0, 60)
        if (!name || catalogRef.current.folders.some((folder) => folder.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return
        const id = 'folder-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
        changeCatalog((old) => ({ ...old, folders: [...old.folders, { id, name }], folderId: id }))
      }

      function moveLibraryDocument(entry, folderId) {
        if (folderId && !catalogRef.current.folders.some((folder) => folder.id === folderId)) return
        changeCatalog((old) => ({ ...old, documents: old.documents.map((item) => item.id === entry.id ? { ...item, folderId } : item) }))
      }

      async function deleteLibraryDocument(entry) {
        if (paperRef.current?.id === entry.id) clearPaper()
        const previous = catalogRef.current
        changeCatalog((old) => ({ ...old, documents: old.documents.filter((item) => item.id !== entry.id), deleted: [...new Set([...(old.deleted || []), entry.id])] }))
        try {
          await storageQueueRef.current.catch(() => {})
          await libraryDbOperation('delete', 'document:' + entry.id)
          documentCacheRef.current.delete(entry.id)
        } catch {
          changeCatalog((old) => ({ ...old, documents: [...old.documents, entry], deleted: previous.deleted }))
          setLibraryOperation({ id: entry.id, error: '暂时无法删除本机记录，请重试。' })
        }
      }

      async function changeLibrarySettings(patch) {
        if (!Object.hasOwn(patch, 'pdfDirectory') || !patch.pdfDirectory) {
          changeCatalog((old) => ({ ...old, settings: { ...old.settings, ...patch }, folderId: patch.rememberFolder === false ? '' : old.folderId }))
          setLibrarySettingsState({})
          return
        }
        setLibrarySettingsState({ loading: true })
        try {
          const result = await fetchJson('/api/literature/library/directory', localLibraryPost({ path: patch.pdfDirectory, validate: true }))
          changeCatalog((old) => ({ ...old, settings: { ...old.settings, ...patch, pdfDirectory: result.path } }))
          setLibrarySettingsState({ message: '保存目录已更新。' })
        } catch (caught) { setLibrarySettingsState({ error: textOf(caught) }) }
      }

      async function chooseLibraryDirectory(directory) {
        const task = startTask('library-directory')
        setLibrarySettingsState((old) => ({ ...old, loading: true, error: null, message: null }))
        try {
          const location = typeof directory === 'string' ? directory : catalogRef.current.settings.pdfDirectory
          const result = await fetchJson('/api/literature/library/directory', localLibraryPost({ path: location }, task.controller.signal))
          if (task.alive()) setLibrarySettingsState({ chooser: result })
        } catch (caught) {
          if (task.alive()) setLibrarySettingsState((old) => ({ ...old, loading: false, error: textOf(caught) }))
        } finally { task.finish() }
      }

      function closeLibraryDirectory() {
        requestsRef.current.get('library-directory')?.controller.abort()
        setLibrarySettingsState({})
      }

      async function lookupLibrary(query, target) {
        lookupTargetRef.current = target || null
        const task = startTask('library-lookup')
        setLibraryOperation((current) => current.label ? current : {})
        setLookupState({ loading: true, items: [], query })
        try {
          const result = await fetchJson('/api/literature/library/lookup', jsonPost({ query }, task.controller.signal))
          if (task.alive()) setLookupState({ items: result.items || [], query })
        } catch (caught) {
          if (task.alive()) setLookupState({ items: [], error: textOf(caught), code: caught.code, query })
        } finally { task.finish() }
      }

      async function readLibraryPdf(response) {
        if (!response.ok) {
          const value = await response.json().catch(() => ({}))
          const error = new Error(value.error || '无法取得原始 PDF。')
          error.code = value.code
          throw error
        }
        const bytes = new Uint8Array(await response.arrayBuffer())
        if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes('%PDF-')) throw new Error('来源返回的内容不是 PDF。')
        return bytes
      }

      async function storeLibraryPaper(input, bytes, task, target) {
        const clean = String(input.text || '').trim()
        const text = clean.length > 260000 && bytes ? clean.slice(0, 260000) : clean
        if (text.length > 260000) throw new Error('文本太长（超过 26 万字符），请只保留正文再试')
        if (!text && !bytes && !input.meta) throw new Error('没有读到正文')
        const metaIdentity = input.meta?.doi || input.meta?.zoteroKey || input.meta?.url || input.title
        const id = await documentId(text || '文献条目 ' + metaIdentity, bytes)
        if (!task.alive()) return null
        await storageQueueRef.current.catch(() => {})
        const existing = documentCacheRef.current.get(id) || await idbGet('document:' + id)
        const targetRecord = target && target.id !== id ? documentCacheRef.current.get(target.id) || await idbGet('document:' + target.id) : null
        if (!task.alive()) return null
        const oldPaper = existing?.snapshot?.paper
        const targetSnapshot = targetRecord?.snapshot
        const sameText = targetSnapshot?.paper && identityText(targetSnapshot.paper.text) === identityText(text)
        const disposableStub = targetSnapshot?.paper && !targetRecord.bytes && !targetSnapshot.pdfPosition && !targetSnapshot.readingState?.currentSection && ![
          targetSnapshot.annotations, targetSnapshot.ideas, targetSnapshot.selectionThreads,
          targetSnapshot.readingState?.completed,
        ].some((items) => items?.length)
        const upgrade = Boolean(!existing && sameText || disposableStub)
        const oldEntry = catalogRef.current.documents.find((item) => item.id === id)
        const next = { id, title: input.title || oldPaper?.title || '未命名文献', text: text || oldPaper?.text || '',
          source: oldPaper?.source === 'zotero' && input.source === 'pdf' ? 'zotero' : input.source,
          meta: { ...oldPaper?.meta, ...target?.meta, ...input.meta } }
        let snapshot = { version: 2, documentId: id, paper: next, tab: 'brief' }
        if (existing?.snapshot?.paper) {
          snapshot = { ...existing.snapshot, paper: next }
        } else if (upgrade && sameText) {
          snapshot = { ...rebindDocumentSnapshot(targetSnapshot, target.id, id), paper: next, structure: null }
        }
        if (next.text && !(snapshot.paragraphs || []).length) {
          const prepared = await fetchJson('/api/literature/prepare', jsonPost({ text: next.text }, task.controller.signal))
          if (!task.alive()) return null
          snapshot.paragraphs = prepared.paragraphs || []
          snapshot.outline = prepared.outline || ''
        }
        let pdfDirectory = oldEntry?.pdfDirectory
        let warning = ''
        const selectedDirectory = catalogRef.current.settings.pdfDirectory
        if (bytes && selectedDirectory && selectedDirectory !== pdfDirectory) {
          try {
            const result = await fetchJson('/api/literature/library/local-pdf', {
              method: 'POST', headers: { 'content-type': 'application/pdf', 'x-gloss-local-operation': '1', 'x-gloss-pdf-directory': encodeURIComponent(selectedDirectory), 'x-gloss-document-id': id },
              body: bytes, signal: task.controller.signal,
            })
            pdfDirectory = result.path
          } catch (caught) {
            if (!task.alive() || isAbort(caught)) return null
            warning = '选定目录写入失败，PDF 已保存在 Gloss 本机库。'
          }
        }
        if (!task.alive()) return null
        const record = { snapshot, bytes: bytes || existing?.bytes || null }
        try { await idbPut('document:' + id, record) }
        catch (caught) {
          if (!pdfDirectory || !bytes) throw caught
          await idbPut('document:' + id, { ...record, bytes: null })
        }
        if (!task.alive()) return null
        documentCacheRef.current.set(id, record)
        if (paperRef.current?.id === id) applyPaper(next)
        rememberDocument(next, {
          hasPdf: Boolean(record.bytes), pdfDirectory, updatedAt: Date.now(), preview: libraryResearchPreview(snapshot),
          folderId: oldEntry?.folderId ?? target?.folderId ?? catalogRef.current.settings.defaultFolderId,
        })
        if (upgrade) {
          changeCatalog((old) => ({ ...old, documents: old.documents.filter((item) => item.id !== target.id), deleted: [...new Set([...(old.deleted || []), target.id])] }))
        }
        return { id, warning, folderId: oldEntry?.folderId ?? target?.folderId ?? catalogRef.current.settings.defaultFolderId }
      }

      async function importLibraryOperation(operationId, label, load, target, { onFailure, fromWelcomeDrop = false, openAfterImport = false } = {}) {
        if (!libraryOpen && !fromWelcomeDrop) showLibrary()
        const task = startTask('library-import')
        setLibraryOperation({ id: operationId, label })
        setError('')
        try {
          const input = await load(task)
          if (!task.alive()) return
          const bytes = input.bytes
          if (bytes) {
            const pdfjs = await loadPdfJs()
            if (!task.alive()) return
            const loading = loadPdfDocument(pdfjs, bytes)
            const cancel = () => { loading.destroy().catch(() => {}) }
            task.controller.signal.addEventListener('abort', cancel, { once: true })
            try {
              const doc = await loading.promise
              const [extracted, metadata] = await Promise.all([
                extractPdfText(doc).catch(() => ''),
                doc.getMetadata().catch(() => null),
              ])
              input.text = extracted.replace(/\s+/g, '').length >= 40 ? extracted : ''
              if (!input.title || looksLikeFileName(input.title) || input.meta?.itemType === 'attachment') {
                input.title = (await extractPdfTitle(doc).catch(() => '')) || input.title
              }
              const meta = input.meta || (input.meta = {})
              const author = String(metadata?.info?.Author || '').trim()
              if (!meta.authors && !meta.creators && author && !/^(?:CNKI|Microsoft(?: Word)?|Adobe(?: Acrobat)?|anonymous|unknown)$/i.test(author)) meta.authors = author.slice(0, 500)
              const doi = metadata?.metadata?.get('prism:doi') || metadata?.metadata?.get('dc:identifier')
              if (!meta.doi && typeof doi === 'string' && /^(?:doi:\s*)?10\.\d{4,9}\/\S+$/i.test(doi.trim())) meta.doi = doi.trim().replace(/^doi:\s*/i, '')
            } finally {
              task.controller.signal.removeEventListener('abort', cancel)
              await loading.destroy().catch(() => {})
            }
          }
          if (!task.alive()) return
          if (!input.title) input.title = input.fallbackTitle
          if (!target && input.meta?.zoteroKey) {
            const key = input.meta.zoteroKey
            target = catalogRef.current.documents.find((item) => !item.hasPdf && item.source === 'zotero-text' && (item.meta?.zoteroKey === key || !item.meta?.zoteroKey && item.title === input.title))
          }
          const result = await storeLibraryPaper(input, bytes, task, target)
          if (!task.alive() || !result) return
          setLibraryOperation({})
          setLibraryTab('saved')
          if ((openAfterImport || catalogRef.current.settings.openAfterImport) && (bytes || input.text)) {
            await openLibraryDocument({ id: result.id })
            if (result.warning) setNotice(result.warning)
          } else {
            showLibrary()
            changeLibraryFolder(result.folderId)
            setLibraryOperation({ id: result.id, message: result.warning || '已添加到文献库。' })
          }
        } catch (caught) {
          if (task.alive() && !isAbort(caught)) {
            onFailure?.()
            if (fromWelcomeDrop) {
              setLibraryOperation({})
              setError(textOf(caught))
            } else setLibraryOperation({ id: operationId, error: textOf(caught), code: caught.code })
          }
        } finally { task.finish() }
      }

      function uploadLibraryFile(target) {
        attachTargetRef.current = target?.id ? target : null
        fileRef.current?.click()
      }

      async function handleFile(file, target, fromWelcomeDrop = false) {
        if (!file) return
        const name = String(file.name || '').replace(/\.[^.]+$/, '') || '未命名文献'
        const pdf = isPdfFile(file)
        await importLibraryOperation(target?.id || 'upload', pdf ? '正在读取 PDF' : '正在读取正文', async () => {
          if (pdf) return { bytes: new Uint8Array(await file.arrayBuffer()), title: target?.title || '', source: target?.source === 'zotero-text' ? 'zotero' : 'pdf', meta: { ...target?.meta, fileName: file.name }, fallbackTitle: name }
          if (target) throw new Error('请为这篇文献选择原始 PDF 文件。')
          return { text: await file.text(), title: name, source: 'file' }
        }, target, { fromWelcomeDrop })
      }

      async function readZoteroLibraryPaper(item, signal, { metadataOnly = false, previewOnly = false } = {}) {
        const value = await fetchJson('/api/literature/zotero', jsonPost({ key: item.key, server: item.zoteroServerId, previewOnly }, signal))
        const meta = { ...value.meta, zoteroKey: value.meta?.zoteroKey || item.key, zoteroAttachmentKey: value.attachmentKey || value.meta?.zoteroAttachmentKey }
        if (metadataOnly) return { text: value.text, title: value.title, source: 'zotero-text', meta }
        if (!value.attachmentKey || value.pdfStatus === 'unavailable' || value.pdfStatus === 'none') {
          throw Object.assign(new Error('Zotero 没有可读取的原始 PDF。可先在 Zotero 下载附件，再返回这里导入。'), { code: 'zotero-pdf-missing' })
        }
        const params = new URLSearchParams({ attachment: value.attachmentKey })
        if (meta.zoteroServerId) params.set('server', meta.zoteroServerId)
        const bytes = await readLibraryPdf(await fetch('/api/literature/zotero/file?' + params, { signal }))
        return { bytes, title: value.title, source: 'zotero', meta }
      }

      async function pickZotero(item, metadataOnly = false, target, openAfterImport = false) {
        if (!metadataOnly) setLibraryZoteroSelection(null)
        await importLibraryOperation(item.key, '正在读取 Zotero 附件', async (task) => {
          try {
            return await readZoteroLibraryPaper(item, task.controller.signal, { metadataOnly })
          } catch (caught) {
            if (task.alive() && !metadataOnly) setLibraryZoteroSelection(item.key)
            throw caught
          }
        }, target, { openAfterImport })
      }

      async function findLookupPdfInZotero(item, task) {
        const signal = task.controller.signal
        const { items = [], complete } = await fetchJson('/api/literature/zotero/match', jsonPost({ doi: item.doi, url: item.url, title: item.title }, signal))
        signal.throwIfAborted()
        const key = item.id || item.title
        const match = items[0]
        setLookupState((current) => ({ ...current, zoteroMatches: { ...current.zoteroMatches, [key]: match || null } }))
        if (!match) throw new Error((complete === false ? '在已检索的 Zotero 条目中没有找到匹配。' : 'Zotero 中没有找到匹配的条目。') + '可在 Zotero 按 DOI 或题名添加，再重试。')
        const withPdf = items.find((entry) => entry.hasPdf === true) || items.find((entry) => entry.hasPdf == null)
        if (!withPdf) throw new Error('Zotero 已有该条目。请在 Zotero 使用「查找全文」或「查找可用的 PDF」，然后回来重试。')
        const result = await readZoteroLibraryPaper(withPdf, signal)
        return { ...result, meta: { doi: item.doi, url: item.url, ...result.meta } }
      }

      function importLookupResult(item, metadataOnly = false, zoteroOnly = false) {
        const meta = { doi: item.doi, url: item.url, authors: item.authors, year: item.year, publication: item.publication, abstract: item.abstract }
        const previous = lookupTargetRef.current
        const target = previous && (previous.meta?.doi && item.doi && previous.meta.doi.toLowerCase() === item.doi.toLowerCase() ||
          identityText(previous.title).toLowerCase() === identityText(item.title).toLowerCase()) ? previous : null
        const key = item.id || item.title
        const markFailed = () => setLookupState((current) => current.failedDownloads?.includes(key) ? current : { ...current, failedDownloads: [...(current.failedDownloads || []), key] })
        return importLibraryOperation(key, metadataOnly ? '正在保存条目' : zoteroOnly ? '正在查找 Zotero 附件' : '正在下载公开 PDF', async (task) => {
          if (metadataOnly) return { title: item.title, source: 'online', meta }
          if (zoteroOnly) return findLookupPdfInZotero(item, task)
          try {
            if (!item.pdfToken) throw new Error('暂未找到公开 PDF。')
            const bytes = await readLibraryPdf(await fetch('/api/literature/library/pdf', jsonPost({ token: item.pdfToken }, task.controller.signal)))
            return { bytes, title: item.title, source: 'online', meta }
          } catch (caught) {
            if (!task.alive() || isAbort(caught)) throw caught
            markFailed()
            setLibraryOperation({ id: key, label: '公开下载失败，正在查找 Zotero 附件' })
            try { return await findLookupPdfInZotero(item, task) }
            catch (fallbackError) {
              if (!task.alive() || isAbort(fallbackError)) throw fallbackError
              const failure = textOf(caught).replace(/[。！]$/, '')
              throw new Error(failure + '。可用 Zotero 获取或先保存条目。')
            }
          }
        }, metadataOnly ? null : target, { onFailure: metadataOnly ? undefined : markFailed })
      }

      async function openLibraryDocument(entry) {
        closeLibrary(false)
        setSourceOpen(true)
        await restoreDocument(entry.id)
      }

      function clearPaper() {
        const task = beginDocumentChange()
        task.finish()
      }

      async function runStructure(bytesArg) {
        const bytes = bytesArg || pdfBytesRef.current
        const owner = paperRef.current && paperRef.current.id
        if (!bytes || !owner) return
        const task = startTask('structure')
        const alive = () => task.alive() && paperRef.current && paperRef.current.id === owner
        const sameSnapshot = value => value && value.documentId === owner && value.paper && value.paper.id === owner ? value : null
        const latestSnapshot = () => sameSnapshot(snapshotRef.current) || sameSnapshot(snapshotBaseRef.current)
        const previousIndex = snapshot => snapshot.structure && snapshot.structure.documentId === owner ? snapshot.structure : sameSnapshot(snapshotBaseRef.current) && snapshotBaseRef.current.structure && snapshotBaseRef.current.structure.documentId === owner ? snapshotBaseRef.current.structure : null
        setStructureBusy(true)
        try {
          const value = await fetchJson('/api/literature/structure', {
            method: 'POST', headers: { 'content-type': 'application/pdf' }, body: bytes, signal: task.controller.signal,
          })
          if (!alive()) return
          if (!validStructure(value, owner)) throw new Error(value.documentId !== owner && !/^pdf-[a-f0-9]{64}$/.test(owner || '') ? '这篇文献仍使用旧版文件标识，需要更新本地绑定' : '文献索引与当前 PDF 不一致，或尚未升级到 v6')
          const initialSnapshot = latestSnapshot()
          if (!initialSnapshot) throw new Error('当前文献缓存未绑定本篇 PDF，已保留原状态')
          const oldIndex = previousIndex(initialSnapshot)
          const savedReading = initialSnapshot.readingState || {}
          const hasReading = Boolean(savedReading.currentSection || savedReading.currentSubsection || (savedReading.completed || []).length || Object.keys(savedReading.chapterCache || {}).length)
          const needsMigration = !validStructure(oldIndex, owner) && Boolean(oldIndex || hasReading)
          let next, module = null
          if (needsMigration) {
            module = await loadReaderModule('chapters')
            if (!alive()) return
            const helpers = window.LiteratureReaderChapters && window.LiteratureReaderChapters.helpers
            if (!helpers || typeof helpers.positionForReading !== 'function' || typeof helpers.chaptersOf !== 'function') throw new Error('章节位置模块尚未就绪，未覆盖旧索引')
            clearTimeout(saveTimer.current)
            saveTimer.current = null
            await storageQueueRef.current.catch(() => {})
            if (!alive()) return
            const beforeBackup = latestSnapshot()
            if (!beforeBackup) throw new Error('备份前文献缓存身份变化，已停止升级')
            const backupIndex = previousIndex(beforeBackup)
            const fromVersion = backupIndex && backupIndex.parserVersion || null
            const backupKey = 'index-upgrade-backup:' + owner + ':v' + (fromVersion || 'unknown') + '-to-v6:' + Date.now().toString(36)
            const backupSnapshot = JSON.parse(JSON.stringify({ ...beforeBackup, structure: backupIndex || beforeBackup.structure }))
            await idbPut(backupKey, { kind: 'structure-index-upgrade-backup', documentId: owner, fromParserVersion: fromVersion, toParserVersion: 6, snapshot: backupSnapshot, bytes })
            if (!alive()) return
            const latest = latestSnapshot()
            if (!latest) throw new Error('升级期间文献缓存身份变化，已保留备份')
            const position = outlinePdfPosition(sourceRef.current, owner, pdfPositionRef.current) || pdfPositionRef.current && pdfPositionRef.current.documentId === owner && pdfPositionRef.current || null
            const migrated = migrateReadingStateForStructure({ readingState: latest.readingState, oldStructure: previousIndex(latest), newStructure: value, paperId: owner, position, helpers })
            next = { ...latest, structure: value, readingState: migrated.readingState, structureMigration: { ...(latest.structureMigration || {}), backupKey, fromParserVersion: fromVersion, toParserVersion: 6, migratedAt: Date.now(), unmappedCompleted: migrated.unmappedCompleted } }
            // This is the actual key used by generateChapter -> requestReaderAi.
            const generation = requestsRef.current.get('chapter:content')
            if (generation) { generation.controller.abort(); generation.finish() }
            outlineRequestRef.current += 1
            outlineTargetRef.current = null
            const origin = referenceOriginRef.current
            if (origin && origin.documentId === owner) {
              const chapterId = migrated.mappings[origin.sectionId]
              const chapter = helpers.chaptersOf(value, owner).find(item => item.id === chapterId)
              const mappedSubsection = migrated.mappings[origin.subsectionId]
              const subsectionId = chapter && chapter.sections.some(item => item.id === mappedSubsection) ? mappedSubsection : chapter && chapter.id || ''
              const stable = Boolean(chapter && migrated.contentStableMappings[origin.sectionId] === chapter.id)
              referenceOriginRef.current = { ...origin, sectionId: chapter && chapter.id || '', subsectionId,
                chapterScrollTop: stable ? origin.chapterScrollTop : 0, contentScrollTop: origin.tab === 'chapters' && !stable ? 0 : origin.contentScrollTop,
                nodes: origin.tab === 'chapters' && !stable ? [] : origin.nodes,
                readingStateRestoration: chapter ? stable ? 'verified-after-index-upgrade' : 'heading-after-index-upgrade' : 'pdf-only-after-index-upgrade' }
              referenceLocateRef.current += 1
              setReferenceReturn(previous => previous && previous.documentId === owner ? { ...previous, busy: false } : previous)
            }
            // Refs change before React. Every new snapshot field from another UI
            // module is retained through the spread of the latest live snapshot.
            clearTimeout(saveTimer.current)
            saveTimer.current = null
            snapshotRef.current = next
            snapshotBaseRef.current = next
            setStructure(value)
            setReadingState(migrated.readingState)
            setFeatureModules(previous => ({ ...previous, chapters: module }))
            setOutlineChapterKey(previous => previous + 1)
            setChapterEntryKey(previous => previous + 1)
          } else {
            const latest = latestSnapshot()
            if (!latest) throw new Error('当前文献缓存身份变化，已停止解析')
            next = { ...latest, structure: value }
            clearTimeout(saveTimer.current)
            saveTimer.current = null
            snapshotRef.current = next
            snapshotBaseRef.current = next
            setStructure(value)
          }
          // Queue after any older writes, and retain the original PDF bytes.
          persistSnapshot(next, bytes)
          try { writeLocalSnapshot(next) } catch { /* IndexedDB remains the per-paper fallback. */ }
          setNotice(previous => /^本地索引未升级成功/.test(previous) ? '' : previous)
        } catch (caught) {
          if (alive() && !isAbort(caught)) setNotice('本地索引未升级成功：' + textOf(caught) + '。可在逐章精读中重试解析。')
        } finally {
          if (alive()) setStructureBusy(false)
          task.finish()
        }
      }

      async function runCards(options) {
        const current = paperRef.current
        if (!current || !current.text || !current.id) return
        const task = startTask('cards')
        if (!(options && options.automatic)) closePopup()
        setCardsBusy(true)
        setError('')
        try {
          const value = await fetchJson('/api/literature/highlights', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ paper: { id: current.id, text: current.text, title: current.title } }), signal: task.controller.signal,
          })
          if (!task.alive()) return
          const sourceKey = matchKeyText(current.text)
          const verified = (value.items || []).filter((item) => {
            const key = matchKeyText(item.quote)
            return key.length >= 12 && sourceKey.includes(key)
          })
          setCards(verified)
          if (!(options && options.automatic)) setTab('brief')
          if (!verified.length) setError('没有找到可核对原文的重点句，请重试生成速览。')
        } catch (caught) {
          if (task.alive() && !isAbort(caught)) setError(textOf(caught))
        } finally {
          if (task.alive()) setCardsBusy(false)
          task.finish()
        }
      }

      async function toggleCard(index, labelPage) {
        if (activeCardRef.current === index) { closePopup(); return }
        closePopup()
        const card = cards[index]
        if (!card) return
        activeCardRef.current = index
        setActiveCard(index)
        setCardLocating(true)
        const request = ++cardRequestRef.current
        const epoch = epochRef.current
        const alive = () => request === cardRequestRef.current && epoch === epochRef.current
        const meta = CARD_TYPES[card.type] || CARD_TYPES.method
        if (!pdfDocRef.current && restorationRef.current) await restorationRef.current
        if (!alive()) return
        if (!pdfDocRef.current) { closePopup(); setNotice('这篇文献尚无 PDF 原文，请导入对应 PDF 后定位与翻译。'); return }
        setSourceOpen(true)
        setSourceTab('pdf')
        for (let attempt = 0; attempt < 60 && !locatorRef.current; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 30))
          if (!alive()) return
        }
        const hit = await locatorRef.current?.locate(card.quote, {
          color: meta.color, isCurrent: alive, page: labelPage || cardPages[index], requirePage: Boolean(labelPage),
        })
        if (!alive()) return
        setCardLocating(false)
        if (!hit) { closePopup(); setNotice('这条重点暂未匹配到原文。请重新生成速览或核对 PDF 原文。'); return }
        handleSelect(card.quote, hit.rect, null, true)
      }

      async function navigateToOutlineSection(section, index, expectedOwner) {
        const owner = paperRef.current && paperRef.current.id, epoch = epochRef.current
        if (!owner || expectedOwner && expectedOwner !== owner || !section || section.anchor && section.anchor.documentId && section.anchor.documentId !== owner) return false
        const request = ++outlineRequestRef.current, referenceSequence = referenceLocateRef.current
        outlineTargetRef.current = null
        closeReaderMenus()
        const alive = () => request === outlineRequestRef.current && epoch === epochRef.current && paperRef.current && paperRef.current.id === owner
        let helpers = window.LiteratureReaderChapters && window.LiteratureReaderChapters.helpers, moduleFailure = false
        if (!helpers) {
          try { await loadReaderModule('chapters'); helpers = window.LiteratureReaderChapters && window.LiteratureReaderChapters.helpers }
          catch { moduleFailure = true }
        }
        if (!alive() || referenceLocateRef.current !== referenceSequence) return false
        const indexed = snapshotRef.current && snapshotRef.current.structure
        const target = outlineChapterTarget(section, indexed, owner, helpers)
        const locateSequence = referenceLocateRef.current + 1
        let found = false
        try { found = await locateText(section.heading, section.anchor, { reference: false, navigation: 'outline' }) }
        catch (caught) { if (alive() && referenceLocateRef.current === locateSequence) setNotice('目录定位未完成：' + textOf(caught)); return false }
        if (!alive() || referenceLocateRef.current !== locateSequence) return false
        if (!found) { setNotice('这处章节暂未准确定位，请核对 PDF 原文。'); return false }
        setActiveSection(index)
        if (!target) { if (moduleFailure) setNotice('已定位目录原文，章节工具暂不可用，可稍后重新打开精读。'); return true }
        const position = outlinePdfPosition(sourceRef.current, owner, pdfPositionRef.current)
        if (!position) { setNotice('已定位目录原文，等待页面布局稳定后可重新打开精读。'); return true }
        pdfPositionRef.current = position
        const saved = snapshotRef.current && snapshotRef.current.readingState
        const previous = saved && (!saved.paperId || saved.paperId === owner) ? saved : {}
        const point = { ...position, offset: position.fraction }
        const targetSection = helpers.sectionsOf(indexed, owner).find((item) => item.id === target.sectionId)
        const railPoint = targetSection && Number.isInteger(targetSection.page) ? { ...point, page: targetSection.page + 1, offset: helpers.headingOffset(targetSection, indexed) || 0 } : point
        const next = { ...previous, paperId: owner, started: true, currentSection: target.chapterId, currentSubsection: target.sectionId, entryPdfPosition: point, lastSeenPdfPosition: point, railPdfPosition: railPoint, pdfMovedSinceEntry: false, scrollPositions: { ...(previous.scrollPositions || {}), [target.chapterId]: 0 }, sectionPositions: { ...(previous.sectionPositions || {}), [target.chapterId]: target.sectionId } }
        outlineTargetRef.current = { owner, epoch, request, locateSequence, ...target, userScrollId: position.userScrollId, applied: false }
        if (snapshotRef.current && snapshotRef.current.documentId === owner) { snapshotRef.current.readingState = next; snapshotRef.current.pdfPosition = position }
        setReadingState(next)
        setPdfPosition(position)
        if (previous.currentSection !== target.chapterId) setOutlineChapterKey((value) => value + 1)
        setChapterEntryKey((value) => value + 1)
        return true
      }

      function applyOutlineReadingPosition() {
        const target = outlineTargetRef.current
        if (!target || target.applied) return
        const owner = paperRef.current && paperRef.current.id, position = pdfPositionRef.current
        if (owner !== target.owner || epochRef.current !== target.epoch || outlineRequestRef.current !== target.request || referenceLocateRef.current !== target.locateSequence || position && position.intent === 'user' && position.userScrollId > target.userScrollId) { outlineTargetRef.current = null; return }
        if (tab !== 'chapters' || readingState.currentSection !== target.chapterId) return
        const container = contentScrollRef.current, chapter = container && container.querySelector('.lrcp.is-direct')
        if (!chapter || chapter.dataset.chapterId !== target.chapterId) return
        const scroller = chapter.querySelector('.lrcp-scroll')
        if (!scroller) return
        if (target.sectionId !== target.chapterId) {
          const heading = Array.from(scroller.querySelectorAll('[data-section-heading]')).find((node) => node.dataset.sectionHeading === target.sectionId)
          if (!heading) return
          scroller.scrollTop += heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12
        } else scroller.scrollTop = 0
        target.applied = true
        const top = Math.max(0, Math.round(scroller.scrollTop))
        setReadingState((previous) => previous.paperId === owner && previous.currentSection === target.chapterId ? { ...previous, currentSubsection: target.sectionId, scrollPositions: { ...(previous.scrollPositions || {}), [target.chapterId]: top }, sectionPositions: { ...(previous.sectionPositions || {}), [target.chapterId]: target.sectionId } } : previous)
      }
      useEffect(applyOutlineReadingPosition)

      function selectTab(id) {
        if (id === 'chapters' && id === tab) return
        if (id === 'chapters' && id !== tab) {
          rememberPdfPosition()
          setPdfPosition(pdfPositionRef.current)
          setChapterEntryKey((value) => value + 1)
        }
        if (contentScrollRef.current) setTabPositions((previous) => ({ ...previous, [tab]: contentScrollRef.current.scrollTop }))
        closePopup()
        setTab(normalizeTab(id))
        setActiveCard(null)
        setActiveSection(null)
        if (locatorRef.current) locatorRef.current.clear()
      }

      useEffect(() => {
        const element = contentScrollRef.current
        if (element) element.scrollTop = Number(tabPositions[tab]) || 0
      }, [tab, paper && paper.id])

      function referenceReturnGeometry(viewport, target, textRects, width, height, circle) {
        if (!textRects.length || viewport.right - viewport.left < circle + 4 || viewport.bottom - viewport.top < circle + 60) return null
        const edge = 2, minCenter = viewport.top + 44 + circle / 2 + 6, maxCenter = viewport.bottom - circle / 2 - 6
        if (minCenter > maxCenter) return null
        const center = Math.max(minCenter, Math.min(maxCenter, (target.top + target.bottom) / 2))
        function freeAt(y, h, limit) {
          const left = viewport.left + edge, right = Math.min(viewport.right - edge, limit)
          if (right <= left) return []
          const blocked = textRects.filter((rect) => rect.top < y + h / 2 + 3 && rect.bottom > y - h / 2 - 3).map((rect) => [Math.max(left, rect.left - 4), Math.min(right, rect.right + 4)]).filter((span) => span[1] > span[0]).sort((a, b) => a[0] - b[0])
          const result = []; let start = left
          for (const span of blocked) { if (span[0] > start) result.push([start, span[0]]); start = Math.max(start, span[1]) }
          if (start < right) result.push([start, right])
          return result
        }
        function fit(y, w, h, compact) {
          const intervals = freeAt(y, h, target.left - (compact ? 4 : 8)).filter((span) => span[1] - span[0] >= w - .75 && (!compact || span[0] <= viewport.left + edge + .75 || span[1] - span[0] >= w + 16))
          if (!intervals.length) return null
          const span = intervals[intervals.length - 1], left = Math.max(span[0], span[1] - w)
          return { left, top: y - h / 2, width: w, height: h, compact }
        }
        const full = fit(center, width, height, false)
        if (full) return full
        const compact = fit(center, circle, circle, true)
        if (compact) return compact
        const nearby = [target.top - circle / 2 - 8, target.bottom + circle / 2 + 8].map((y) => Math.max(minCenter, Math.min(maxCenter, y)))
        for (const y of nearby) { const point = fit(y, circle, circle, true); if (point) return point }
        const left = viewport.left + edge, obstacles = textRects.filter((rect) => rect.left < left + circle + 4 && rect.right > left - 4).map((rect) => [Math.max(viewport.top + 44, rect.top - 4), Math.min(viewport.bottom - 4, rect.bottom + 4)]).filter((span) => span[1] > span[0]).sort((a, b) => a[0] - b[0])
        const spaces = []; let start = viewport.top + 44
        for (const span of obstacles) { if (span[0] > start) spaces.push([start, span[0]]); start = Math.max(start, span[1]) }
        if (start < viewport.bottom - 4) spaces.push([start, viewport.bottom - 4])
        const candidates = spaces.filter((span) => span[1] - span[0] >= circle + 8).map((span) => ({ left, top: Math.max(span[0] + 4, Math.min(span[1] - circle - 4, center - circle / 2)), width: circle, height: circle, compact: true }))
        candidates.sort((a, b) => Math.abs(a.top + circle / 2 - center) - Math.abs(b.top + circle / 2 - center))
        return candidates[0] || null
      }

      function placeReferenceReturn() {
        const button = referenceReturnButtonRef.current, origin = referenceOriginRef.current, host = sourceRef.current
        if (!button) return
        const hide = () => { button.style.visibility = 'hidden' }
        if (!referenceReturn || !origin || !origin.committed || origin.documentId !== (paperRef.current && paperRef.current.id) || origin.epoch !== epochRef.current || origin.doc !== pdfDocRef.current || origin.host !== host || !host || !host.isConnected) { hide(); return }
        const pane = host.closest('.lr-source'), paneBox = pane && pane.getBoundingClientRect(), viewport = host.getBoundingClientRect()
        if (!paneBox) { hide(); return }
        let target = referenceTargetRef.current
        if (!target || target.sequence !== referenceReturn.locateSequence) {
          let marks = Array.from(host.querySelectorAll('.lr-coordinate-focus'))
          if (!marks.length) marks = Array.from(host.querySelectorAll('.lr-evidence'))
          const visible = marks.map((node) => ({ node, rect: node.getBoundingClientRect(), page: node.closest('.lr-page') })).filter((item) => item.page && item.rect.width > 0 && item.rect.height > 0 && item.rect.bottom > viewport.top && item.rect.top < viewport.bottom && item.rect.right > viewport.left && item.rect.left < viewport.right).sort((a, b) => a.rect.top - b.rect.top)
          if (!visible.length) { hide(); return }
          const page = visible[0].page, box = page.getBoundingClientRect()
          if (!(box.width > 0 && box.height > 0)) { hide(); return }
          target = { sequence: referenceReturn.locateSequence, page: page.dataset.page, rects: visible.filter((item) => item.page === page).map(({ rect }) => ({ x: (rect.left - box.left) / box.width, y: (rect.top - box.top) / box.height, width: rect.width / box.width, height: rect.height / box.height })) }
          referenceTargetRef.current = target
        }
        const page = host.querySelector('.lr-page[data-page="' + target.page + '"]'), pageBox = page && page.getBoundingClientRect()
        if (!pageBox) { hide(); return }
        const boxes = target.rects.map((rect) => ({ left: pageBox.left + rect.x * pageBox.width, right: pageBox.left + (rect.x + rect.width) * pageBox.width, top: pageBox.top + rect.y * pageBox.height, bottom: pageBox.top + (rect.y + rect.height) * pageBox.height })).filter((rect) => rect.bottom > viewport.top && rect.top < viewport.bottom && rect.right > viewport.left && rect.left < viewport.right)
        if (!boxes.length) { hide(); return }
        boxes.sort((a, b) => a.top - b.top)
        const first = boxes[0], point = { left: Math.min(...boxes.map((rect) => rect.left)), top: first.top, bottom: first.bottom }
        const textRects = Array.from(page.querySelectorAll('.lr-textlayer span')).map((node) => node.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0)
        if (!button.classList.contains('is-compact') && button.offsetWidth > 40) referenceReturnWidthRef.current = button.offsetWidth
        const sx = paneBox.width / pane.offsetWidth || 1, sy = paneBox.height / pane.offsetHeight || 1
        const placement = referenceReturnGeometry(viewport, point, textRects, referenceReturnWidthRef.current * sx, 32 * sy, 32 * sx)
        if (!placement) { hide(); return }
        button.classList.toggle('is-compact', placement.compact)
        button.style.left = (placement.left - paneBox.left) / sx + 'px'
        button.style.top = (placement.top - paneBox.top) / sy + 'px'
        button.style.visibility = 'visible'
        button.dataset.targetPage = target.page
      }

      useEffect(() => {
        if (!referenceReturn) { referenceTargetRef.current = null; return undefined }
        const host = sourceRef.current
        if (!host) return undefined
        let frame = null
        const queue = () => { if (frame == null) frame = requestAnimationFrame(() => { frame = null; placeReferenceReturn() }) }
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queue)
        observer?.observe(host)
        host.addEventListener('lr-textlayerrendered', queue)
        window.addEventListener('resize', queue)
        queue()
        return () => { observer?.disconnect(); if (frame != null) cancelAnimationFrame(frame); host.removeEventListener('lr-textlayerrendered', queue); window.removeEventListener('resize', queue) }
      }, [referenceReturn && referenceReturn.token, referenceReturn && referenceReturn.locateSequence, referenceReturn && referenceReturn.busy, pdfPosition, effectiveScale])

      function captureReferenceOrigin(options) {
        const documentId = paperRef.current && paperRef.current.id, host = sourceRef.current, doc = pdfDocRef.current
        if (!documentId || !host || !host.isConnected || !doc) return null
        rememberPdfPosition()
        const position = pdfPositionRef.current
        if (!position || position.documentId !== documentId || !Number.isInteger(position.page) || position.page < 1) return null
        const snapshot = snapshotRef.current || {}, reading = snapshot.readingState || {}, supplied = options && options.origin
        const origin = supplied && supplied.paperId === documentId ? supplied : {}
        const content = contentScrollRef.current, chapterScroll = content && content.querySelector('.lrcp-scroll')
        const chapterScrollTop = Math.max(0, Number.isFinite(origin.scrollTop) ? origin.scrollTop : chapterScroll ? chapterScroll.scrollTop : 0)
        const nodes = content ? [content, ...content.querySelectorAll('*')].filter((node) => node.scrollTop || node.scrollLeft).map((node) => ({ node, top: snapshot.tab === 'chapters' && node === chapterScroll ? chapterScrollTop : node.scrollTop, left: node.scrollLeft })) : []
        return {
          documentId, epoch: epochRef.current, doc, host, position: { ...position }, scale: Number(effectiveScale || 1), width: host.clientWidth,
          scrollTop: host.scrollTop, scrollLeft: host.scrollLeft, tab: snapshot.tab || tab, nodes,
          contentScrollTop: content ? content.scrollTop : 0, sectionId: origin.sectionId || reading.currentSection || '', subsectionId: origin.subsectionId || reading.currentSubsection || '',
          chapterScrollTop,
          railPdfPosition: reading.railPdfPosition && reading.railPdfPosition.documentId === documentId ? { ...reading.railPdfPosition } : null,
          committed: false, token: documentId + ':' + epochRef.current + ':' + Date.now() + ':' + referenceLocateRef.current,
        }
      }

      async function returnToReferenceOrigin() {
        const origin = referenceOriginRef.current
        const current = () => Boolean(origin && referenceOriginRef.current === origin && origin.committed && origin.documentId === (paperRef.current && paperRef.current.id) && origin.epoch === epochRef.current && origin.doc === pdfDocRef.current && origin.host === sourceRef.current && origin.host.isConnected)
        if (!current()) { referenceOriginRef.current = null; setReferenceReturn(null); return false }
        referenceLocateRef.current += 1
        setReferenceReturn((value) => value && ({ ...value, busy: true }))
        pdfRestoringRef.current = true
        clearTimeout(pdfScrollTimer.current)
        pdfScrollTimer.current = null
        const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
        try {
          let page = null
          for (let attempt = 0; attempt < 90 && current(); attempt += 1) {
            page = origin.host.querySelector('.lr-page[data-page="' + origin.position.page + '"]')
            if (page) break
            await nextFrame()
          }
          if (!current() || !page) return false
          if (Math.abs(Number(effectiveScale || 1) - origin.scale) < .0001 && origin.host.clientWidth === origin.width) origin.host.scrollTop = origin.scrollTop
          else {
            const box = page.getBoundingClientRect()
            origin.host.scrollTop += box.top - origin.host.getBoundingClientRect().top + origin.position.fraction * box.height
          }
          origin.host.scrollLeft = origin.scrollLeft
          const position = { ...origin.position, intent: 'programmatic', userScrollId: Math.max(Number(origin.position.userScrollId) || 0, Number(pdfPositionRef.current && pdfPositionRef.current.userScrollId) || 0) }, chapterPoint = { documentId: origin.documentId, page: position.page, offset: position.fraction }
          pdfPositionRef.current = position
          if (snapshotRef.current && snapshotRef.current.documentId === origin.documentId) snapshotRef.current.pdfPosition = position
          setPdfPosition(position)
          if (origin.tab === 'chapters' && origin.sectionId) setReadingState((previous) => ({
            ...previous, currentSection: origin.sectionId, currentSubsection: origin.subsectionId || origin.sectionId,
            scrollPositions: { ...previous.scrollPositions, [origin.sectionId]: origin.chapterScrollTop },
            sectionPositions: { ...previous.sectionPositions, [origin.sectionId]: origin.subsectionId || origin.sectionId },
            entryPdfPosition: chapterPoint, lastSeenPdfPosition: chapterPoint, railPdfPosition: origin.railPdfPosition && origin.railPdfPosition.documentId === origin.documentId ? { ...origin.railPdfPosition } : chapterPoint, pdfMovedSinceEntry: false,
          }))
          setTabPositions((previous) => ({ ...previous, [origin.tab]: origin.contentScrollTop }))
          setTab(normalizeTab(origin.tab))
          setChapterEntryKey((value) => value + 1)
          let restored = false
          for (let attempt = 0; attempt < 90 && current(); attempt += 1) {
            await nextFrame()
            const content = contentScrollRef.current
            if (!content) continue
            if (origin.tab === 'chapters' && origin.sectionId) {
              const chapter = content.querySelector('.lrcp[data-chapter-id="' + origin.sectionId + '"]'), scroll = chapter && chapter.querySelector('.lrcp-scroll')
              if (!scroll) continue
              scroll.scrollTop = origin.chapterScrollTop
            }
            content.scrollTop = origin.contentScrollTop
            origin.nodes.forEach((saved) => { if (saved.node.isConnected) { saved.node.scrollTop = saved.top; saved.node.scrollLeft = saved.left } })
            restored = true
            break
          }
          if (!current()) return false
          if (!restored) { setNotice('原文已返回，精读区域尚未就绪，请稍后重试。'); return false }
          referenceOriginRef.current = null
          setReferenceReturn(null)
          return true
        } finally {
          if (origin.documentId === (paperRef.current && paperRef.current.id) && origin.epoch === epochRef.current) {
            pdfRestoringRef.current = false
            setReferenceReturn((value) => value && ({ ...value, busy: false }))
          }
        }
      }

      async function locateText(text, anchor, options) {
        const epoch = epochRef.current, documentId = paperRef.current && paperRef.current.id, doc = pdfDocRef.current
        if (!documentId || anchor && anchor.documentId !== documentId) return false
        const needle = String(text || '').replace(/\s+/g, ' ').trim()
        if (!needle && !anchor) return false
        cancelReaderChromeFold()
        readerChromeFoldRef.current.userUntil = 0
        readerChromeFoldRef.current.userScrolled = false
        const request = ++referenceLocateRef.current
        const navigation = { request, documentId, doc, epoch, intent: pdfRestoreIntentRef.current }
        pdfNavigationRef.current = navigation
        pdfRestoreRunRef.current = null
        pdfRestoringRef.current = false
        let origin = referenceOriginRef.current
        if (options && options.reference && !origin) { origin = captureReferenceOrigin(options); referenceOriginRef.current = origin }
        const current = () => epoch === epochRef.current && documentId === (paperRef.current && paperRef.current.id) && doc === pdfDocRef.current && request === referenceLocateRef.current && navigation.intent === pdfRestoreIntentRef.current
        const complete = (found) => {
          if (!current()) return false
          if (found) rememberPdfPosition('programmatic')
          if (options && options.reference && origin && referenceOriginRef.current === origin) {
            if (origin.host !== sourceRef.current || origin.doc !== pdfDocRef.current || !origin.host.isConnected) { referenceOriginRef.current = null; setReferenceReturn(null); return false }
            if (found) { origin.committed = true; setReferenceReturn({ documentId, page: origin.position.page, token: origin.token, locateSequence: request, busy: false }) }
            else if (!origin.committed) { referenceOriginRef.current = null; setReferenceReturn(null) }
          }
          return Boolean(found)
        }
        try {
          setSourceOpen(true)
          if (doc) {
            setSourceTab('pdf')
            for (let attempt = 0; attempt < 70 && !locatorRef.current; attempt += 1) {
              await new Promise((resolve) => setTimeout(resolve, 30))
              if (!current()) return false
            }
            const locator = locatorRef.current
            if (locator && anchor && anchor.kind === 'pdf-text-range' && locator.locateSelection) return complete(await locator.locateSelection(anchor.anchors, current) && current())
            if (locator && anchor?.kind === 'pdf-page') return complete(current() && locator.locatePage(anchor.page))
            if (locator && anchor && anchor.status === 'located' && anchor.quoteVerified === true && locator.locateAnchor) {
              return complete(await locator.locateAnchor(anchor, current) && current())
            }
            if (!current()) return false
            if (locator && needle && await locator.locate(needle, { isCurrent: current })) return complete(true)
            if (!current()) return false
          }
          return complete(false)
        } catch (caught) { complete(false); throw caught }
        finally { if (pdfNavigationRef.current === navigation) pdfNavigationRef.current = null }
      }

      function pairsFromMessages(messages) {
        const pairs = []
        for (const message of messages || []) {
          if (message.role === 'user') pairs.push({ question: message.text || message.content || '', answer: '' })
          else if (message.role === 'assistant' && pairs.length && !['loading','streaming','error','cancelled','interrupted'].includes(message.status)) pairs[pairs.length - 1].answer = message.text || message.content || ''
        }
        return pairs.filter((pair) => pair.question && pair.answer)
      }

      function relatedDiscussion(scope) {
        const owner = paperRef.current && paperRef.current.id
        if (!owner) return null
        const current = snapshotRef.current || {}
        let turns
        if (scope === 'paper-research') {
          const sameIdentity = (value) => !value || (!value.paperId || value.paperId === owner) && (!value.documentId || value.documentId === owner)
          const samePaper = (message) => sameIdentity(message) && sameIdentity(message.anchor) && sameIdentity(message.source) && sameIdentity(message.source && message.source.anchor) && sameIdentity(message.context)
          const messages = ((current.ideas || []).find((item) => item.kind === 'research-conversation' && item.paperId === owner) || {}).messages || []
          const accepted = []
          let round = [], foreign = false
          const finishRound = () => { if (!foreign) accepted.push(...round); round = []; foreign = false }
          for (const message of messages) {
            if (!message || !['user', 'assistant'].includes(message.role)) continue
            if (message.role === 'user') finishRound()
            if (message.role === 'assistant' && !round.length) continue
            round.push(message)
            if (!samePaper(message)) foreign = true
          }
          finishRound()
          turns = pairsFromMessages(accepted).slice(-4)
        } else {
          turns = (current.selectionThreads || []).filter((item) => item.documentId === owner).slice(-2).flatMap((item) => item.turns || []).filter((turn) => turn.answer && !turn.error && turn.status !== 'streaming').slice(-4).map((turn) => ({ question: turn.question, answer: turn.answer }))
        }
        return turns.length ? { documentId: owner, scope, turns } : null
      }

      function currentDocumentContext() {
        const current = paperRef.current
        if (!current) return null
        const bound = (snapshotRef.current || {}).structure
        const index = validStructure(bound, current.id) ? { schemaVersion: bound.schemaVersion, parserVersion: bound.parserVersion, documentId: bound.documentId, coordinateSystem: bound.coordinateSystem, pageGeometry: bound.pageGeometry, sections: bound.sections, references: bound.references, figures: bound.figures, tables: bound.tables, formulas: bound.formulas } : null
        return { paper: { id: current.id, title: current.title, text: current.text }, structure: index }
      }

      async function fullResearchPaper(paper, signal) {
        const pdf = pdfDocRef.current
        const entry = catalogRef.current.documents.find(item => item.id === paper.id)
        const hasPdf = Boolean(pdf || entry?.hasPdf || entry?.pdfDirectory)
        if (!hasPdf && (entry?.source || paperRef.current?.source) === 'zotero-text') {
          return { id: paper.id, title: paper.title, hasPdf: false }
        }
        const fallback = {
          ...paper,
          hasPdf,
          textTruncated: hasPdf || paper.text.length >= 260000,
          expectedPages: pdf?.numPages,
        }
        if (!pdf || pdf.numPages > 2000) return fallback
        try {
          const pages = await getResearchPdfPages(pdf)
          signal.throwIfAborted()
          if (pdf !== pdfDocRef.current) throw new DOMException('文献已切换', 'AbortError')
          const length = pages.reduce((total, page) => total + page.length + 2, 0)
          if (length > 1000000) return fallback
          return { id: paper.id, title: paper.title, pages, hasPdf: true, expectedPages: pdf.numPages, textTruncated: false }
        } catch (error) {
          if (isAbort(error) || signal.aborted) throw error
          return fallback
        }
      }

      function getPaperContext() {
        const current = paperRef.current
        if (!current || !popupRef.current || popupRef.current.documentId !== current.id) return null
        return { ...currentDocumentContext(), relatedDiscussion: relatedDiscussion('paper-research') }
      }

      function saveSelectionThread(thread) {
        const owner = paperRef.current && paperRef.current.id
        if (!sessionMountedRef.current || !owner || !popupThreadForPaper(thread, owner)) return
        const next = mergePopupThread(selectionThreadsRef.current, thread, owner)
        if (next === selectionThreadsRef.current) return
        selectionThreadsRef.current = next
        if (snapshotRef.current && snapshotRef.current.documentId === owner) snapshotRef.current.selectionThreads = next
        setSelectionThreads(next)
      }

      async function requestReaderAi(kind, source, question, history, onDelta, signal, extra) {
        let document = currentDocumentContext()
        if (!document) throw new Error('请先打开论文。')
        const owner = document.paper.id
        const task = startTask(kind)
        const abort = () => task.controller.abort()
        if (signal) { if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true }) }
        let text = '', context = null, failure = ''
        try {
          if (kind === 'research') {
            const paper = await fullResearchPaper(document.paper, task.controller.signal)
            task.controller.signal.throwIfAborted()
            if (!task.alive() || paperRef.current?.id !== owner) throw new DOMException('文献已切换', 'AbortError')
            document = { ...currentDocumentContext(), paper }
          }
          await streamPost('/api/literature/selection', { kind: 'ask', purpose: kind.startsWith('chapter:') ? 'chapter' : 'research', chapter: extra && extra.chapter || undefined, text: String(source || document.paper.title).slice(0, 4000), selection: { text: kind.startsWith('chapter:') ? '' : String(source || '').slice(0, 4000), anchor: extra && extra.anchor || null }, question, history: history || [], relatedDiscussion: kind === 'research' ? relatedDiscussion('selected-passage') : null, ...document }, (event, data) => {
            if (!task.alive() || !paperRef.current || paperRef.current.id !== owner) return
            if (event === 'context') {
              context = data
              if (kind === 'research' && onDelta) onDelta('', context)
            }
            else if (event === 'delta') { text += data.text || ''; if (onDelta) onDelta(data.text || '', context) }
            else if (event === 'done') text = data.text || text
            else if (event === 'error') failure = data.message || '生成未完成，请重试。'
          }, task.controller.signal)
          if (!task.alive() || !paperRef.current || paperRef.current.id !== owner) throw new DOMException('文献已切换', 'AbortError')
          if (failure) throw new Error(failure)
          if (!text.trim()) throw new Error('没有生成内容，请重试。')
          return { text, context }
        } finally { if (signal) signal.removeEventListener('abort', abort); task.finish() }
      }

      function generateChapter(payload, onDelta) {
        const section = payload.section || {}
        const heading = String(section.heading || section.title || '').trim()
        const question = `你正在辅助逐章精读。当前章节：${heading}。直接讲解这一章；先用一句话说明本章解决什么问题，再连续说明作者怎么做、为什么这样做。沿用真实原文小标题组织长章节；方法章说明输入、表示、编码器、处理步骤、输出之间的关系；实验章结合数据、对照、指标说明结果支持什么。不要导读表单、重点卡片、待查问题或操作说明。每段事实在句末附已提供的[C#]出处。`
        return requestReaderAi('chapter:content', heading, question, [], onDelta, payload.signal, { chapter: { id: section.id || section.anchorId } })
      }

      function discussIdea(payload, onDelta) {
        const source = payload.source && (!payload.source.paperId || payload.source.paperId === (paperRef.current && paperRef.current.id)) ? payload.source : null
        return requestReaderAi('research', source && (source.quote || source.text) || '', String(payload.question || '').trim(), pairsFromMessages(payload.history), onDelta, payload.signal, { anchor: source && source.anchor })
      }

      function translatePassage(text, signal) {
        const owner = paperRef.current && paperRef.current.id
        const value = ensureTranslation(String(text || '').slice(0, 3000), owner)
        if (!value) return Promise.reject(new Error('没有可翻译的原文。'))
        if (value.cached !== undefined) return Promise.resolve(value.cached)
        return new Promise((resolve, reject) => {
          const record = value.record
          const clean = () => { record.listeners.delete(update); if (signal) signal.removeEventListener('abort', abort) }
          const abort = () => { clean(); reject(new DOMException('已取消', 'AbortError')) }
          const update = (next) => {
            if (!paperRef.current || paperRef.current.id !== owner) { abort(); return }
            if (next.error) { clean(); reject(next.error) } else if (next.done) { clean(); resolve(next.text) }
          }
          record.listeners.add(update)
          if (signal) { if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true }) }
          update(record)
        })
      }

      function createIdeaFromSource(source) {
        const owner = paperRef.current && paperRef.current.id
        if (!owner || source.paperId && source.paperId !== owner || source.anchor && source.anchor.documentId !== owner) return
        if (source.origin === 'chapter-explanation' && String(source.question || '').trim()) {
          const addition = '围绕这段讲解继续讨论：\n' + String(source.question).trim()
          setIdeas((items) => {
            const previous = items.find((item) => item.kind === 'research-conversation' && item.paperId === owner)
            const record = { ...(previous || {}), id: previous && previous.id || 'research-conversation:' + owner, kind: 'research-conversation', version: 3, paperId: owner, messages: previous && previous.messages || [], draft: [previous && previous.draft, addition].filter(Boolean).join('\n\n'), ...(!source.text && !source.quote ? { pendingSource: null } : {}), updatedAt: Date.now() }
            return previous ? items.map((item) => item === previous ? record : item) : [...items, record]
          })
        }
        if (source.text || source.quote) setSelectedQuote({ text: source.text || source.quote || '', page: Number.isFinite(source.page) ? source.page + 1 : undefined, anchor: source.anchor || null, suggestedIdea: source.question || source.idea || '', fromChapter: true, requestId: 'chapter-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), paperId: owner, sectionId: source.sectionId || null })
        else setSelectedQuote(null)
        selectTab('ideas')
      }

      function openBodyReference(reference) {
        const current = paperRef.current
        if (!current) return
        setActiveReference({ ...reference, documentId: current.id })
        selectTab('citations')
      }

      function onDrop(event) {
        event.preventDefault()
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]
        if (!file) return
        const textFile = !isPdfFile(file) && (/\.(?:txt|md|markdown)$/i.test(file.name) || /^text\/(?:plain|markdown)$/.test(file.type))
        if (showPanel || libraryOpen || textFile) handleFile(file)
      }

      const hasPaper = Boolean(paper && paper.text)
      const showPanel = hasPaper || Boolean(pdfDoc)
      const busyLabel = busy ? busy.label || '处理中' : ''
      const progressLabel =
        progress && progress.total ? '第 ' + Math.max(progress.index, 1) + '/' + progress.total + ' 批' + (progress.title ? ' · ' + progress.title : '') : ''

      const paperFocus = Boolean(pdfDoc && sourceOpen && chromeState.paperFocus)
      const readerTabs = useGlassTabRail(TABS.findIndex(item => item.id === tab), TABS.length, index => selectTab(TABS[index].id), Boolean(paper && identityReady && !paperFocus))
      useEffect(() => {
        if (paperFocus) return undefined
        const saved = paperFocusScrollRef.current
        if (!saved || saved.paperId !== (paper && paper.id)) { paperFocusScrollRef.current = null; return undefined }
        const frame = requestAnimationFrame(() => {
          saved.positions.forEach((position) => {
            if (position.node.isConnected) { position.node.scrollTop = position.top; position.node.scrollLeft = position.left }
          })
          if (paperFocusScrollRef.current === saved) paperFocusScrollRef.current = null
        })
        return () => cancelAnimationFrame(frame)
      }, [paperFocus, paper && paper.id])
      function togglePaperFocus() {
        rememberPdfPosition()
        if (!paperFocus) {
          const notes = contentScrollRef.current && contentScrollRef.current.closest('.lr-notes')
          const positions = notes ? [notes, ...notes.querySelectorAll('*')].filter((node) => node.scrollTop || node.scrollLeft).map((node) => ({ node, top: node.scrollTop, left: node.scrollLeft })) : []
          paperFocusScrollRef.current = { paperId: paper && paper.id, positions }
        }
        setSourceOpen(true)
        setChromeState((value) => ({ ...value, paperFocus: !Boolean(value.paperFocus) }))
      }


      function renderPopupSessions() {
        const owner = paper && paper.id
        return sessionBars.filter((bar) => bar.documentId === owner).map((bar) => {
          const hiddenForOpen = popup && popup.key === bar.key && popup.presentation === 'shown', closingTarget = popup && popup.key === bar.key && popup.motion && popup.motion.phase === 'collapse', ghost = hiddenForOpen || closingTarget
          return h('button', { type: 'button', key: bar.key, className: cls('lr-session-capsule', bar.mode === 'icon' ? 'is-icon' : 'is-mini', bar.fallback && 'is-fallback', ghost && 'is-ghost', closingTarget && 'is-closing-target'), 'data-session-key': bar.key, 'data-capsule-mode': bar.mode || 'mini', 'data-paper-id': owner, 'aria-label': '继续对话：' + bar.question, 'aria-hidden': hiddenForOpen || undefined, tabIndex: hiddenForOpen ? -1 : 0, inert: hiddenForOpen ? '' : undefined, title: (bar.page ? '第 ' + bar.page + ' 页' : '原文位置待核对') + ' · ' + bar.question + '\n点击继续；可拖动避开正文或拖到右上“对话”收录', style: { left: bar.left + 'px', top: bar.top + 'px', width: bar.width + 'px', height: bar.height + 'px' }, onClick: () => { if ((paperRef.current && paperRef.current.id) !== owner) return; const skip = sessionClickSuppress.current; if (skip && skip.key === bar.key && Date.now() <= skip.until) return; restorePopupSession(bar.key, { capsule: true }) }, onPointerDown: (event) => { if ((paperRef.current && paperRef.current.id) === owner) beginSessionDrag(event, bar.key) }, onPointerMove: moveSessionDrag, onPointerUp: endSessionDrag, onPointerCancel: (event) => { const drag = sessionDragRef.current; if (drag && drag.key === bar.key && drag.pointerId === event.pointerId && drag.owner === owner) cancelSessionDrag(true) }, onLostPointerCapture: (event) => { const drag = sessionDragRef.current; if (drag && drag.key === bar.key && drag.pointerId === event.pointerId && drag.owner === owner) cancelSessionDrag(true) } }, h(ToolIcon, { name: 'messageSquare' }), h('span', null, h('strong', null, '继续'), h('small', null, bar.question)))
        })
      }

      function renderPopupHistory(fallback) {
        const owner = paper && paper.id
        if (!owner) return null
        const threads = selectionThreads.filter((item) => popupThreadForPaper(item, owner) && popupThreadHasConversation(item)).sort((a, b) => (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0))
        return h('div', { className: cls('lr-session-header', fallback && 'is-fallback'), ref: sessionMenuRef, 'data-paper-id': owner },
          h('button', { type: 'button', className: 'lr-stack-pill lr-session-toggle', 'aria-label': '本篇划词对话', title: '本篇划词对话 · ' + threads.length + ' 条', 'aria-controls': 'lr-selection-history', 'aria-expanded': sessionListOpen, onClick: togglePopupHistory }, h(ToolIcon, { name: 'ask' }), h('span', null, '对话')),
          sessionListOpen ? h('div', { className: 'lr-session-history', id: 'lr-selection-history', role: 'region', 'aria-label': '本篇划词对话记录', 'data-paper-id': owner },
            h('div', { className: 'lr-session-history-title' }, h('span', null, '本篇划词对话'), h('button', { type: 'button', className: 'lr-iconbtn', 'aria-label': '关闭对话列表', onClick: () => { setPopupHistoryOpen(false); const toggle = sessionMenuRef.current && sessionMenuRef.current.querySelector('.lr-session-toggle'); if (toggle) toggle.focus() } }, h(ToolIcon, { name: 'close' }))),
            threads.length ? threads.map((thread) => h('div', { className: 'lr-session-history-row', key: thread.key, 'data-session-key': thread.key },
              h('button', { type: 'button', className: 'lr-session-history-open', title: thread.quote, onClick: () => { if ((paperRef.current && paperRef.current.id) === owner) restorePopupSession(thread.key, { restoreSelection: true }) } },
                h('span', { className: 'lr-session-history-question' }, (thread.turns || []).at(-1) && thread.turns.at(-1).question || thread.draft || '选区对话'),
                h('span', { className: 'lr-session-history-quote' }, thread.quote || '原文位置待核对'),
                h('span', { className: 'lr-session-history-meta' }, thread.origin && thread.origin.page ? '第 ' + thread.origin.page + ' 页' : '原文待定位', (thread.turns || []).length ? ' · ' + thread.turns.length + ' 轮' : ' · 草稿', thread.capsuleCollected ? ' · 已收录' : sessionBars.some((bar) => bar.key === thread.key) ? ' · 原文对话签' : ' · 从此恢复')),
              h('button', { type: 'button', className: 'lr-session-history-collect', 'aria-label': thread.capsuleCollected ? '在原文显示这段对话签' : '收录这段对话到顶部', onClick: () => { if ((paperRef.current && paperRef.current.id) === owner) collectPopupSession(thread.key, !thread.capsuleCollected) } }, thread.capsuleCollected ? '显示对话签' : '收录'))) : h('p', { className: 'lr-session-empty' }, '选中文字并提问后，对话会保存在这里。')) : null)
      }

      function renderActivePopup() {
        if (!popup) return null
        const owner = paper && paper.id, savedThread = selectionThreads.find((item) => item.documentId === owner && item.key === popup.key) || popup.sessionSnapshot
        return h(TranslationCard, { popup, onClose: closePopup, onDismiss: closePopup, onCopy: copyText, getSourcePointer: () => popupPointerRef.current.documentId === popup.documentId ? popupPointerRef.current : null, onHighlight: (color, style) => setHighlight(color, style, popup.key), onPresentationChange: (value, height) => changePopupPresentation(value, height, popup.key), getPaperContext, onThreadChange: saveSelectionThread, onPopupSnapshot: (snapshot) => { const current = popupRef.current; if (current && current.key === snapshot.key && current.documentId === snapshot.documentId) recentPopupRef.current = { popup: { ...current, sessionSnapshot: snapshot }, origin: popupOriginRef.current, documentId: current.documentId } }, savedThread })
      }

      const pdfAppearanceMode = pdfAppearance.mode(chromeState.pdfAppearance)
      const floatingPaperChrome = Boolean(pdfDoc && sourceOpen)
      const titleCollapsed = Boolean(floatingPaperChrome && paper && chromeState.titleCollapsed)
      const titlePill = h('div', {
        className: cls('lr-title-pill', titleCollapsed && 'is-collapsed', !paper && 'is-brand'),
        'data-title-collapsed': titleCollapsed ? 'true' : 'false',
      },
        h('h1', { className: 'lr-paper-heading', title: paper ? paper.title : 'Gloss', tabIndex: titleCollapsed ? -1 : 0 }, h('span', { className: 'lr-paper-title-text' }, paper ? paper.title : 'Gloss')),
      )
      const documentControls = h('div', { className: 'lr-header-actions' },
          pdfDoc && !sourceOpen ? h('button', { type: 'button', className: 'lr-reader-button lr-header-show-source', 'aria-label': '显示原文', title: '显示原文', onClick: () => setSourceOpen(true) }, h(ToolIcon, { name: 'panel' })) : null,
          h('button', { type: 'button', className: 'lr-more-toggle lr-library-trigger', 'aria-label': '文献库', 'aria-haspopup': 'dialog', 'aria-controls': 'gl-library-drawer', 'aria-expanded': libraryOpen, title: '文献库', tabIndex: floatingPaperChrome && titleCollapsed ? -1 : 0, onClick: () => showLibrary() }, h(ToolIcon, { name: 'book' })),
      )
      const header = h('header', {
        className: cls('lr-head', 'lr-chrome-safe', floatingPaperChrome && 'is-floating', !floatingPaperChrome && 'has-fallback-title', !paper && 'is-start'),
        'data-safe-top': floatingPaperChrome ? '0' : '44',
      },
        !floatingPaperChrome && paper ? h('div', { className: 'lr-header-fallback-title' }, renderPopupHistory(true), titlePill) : null,
        !floatingPaperChrome ? documentControls : null,
      )

      const errorBanner = error ? h('div', null,
        h('div', { className: 'lr-banner error' }, h('span', null, error), h('button', { onClick: () => setError('') }, '关闭'))) : null
      const noticeToast = h('div', { className: 'lr-notice-layer', role: 'status', 'aria-live': 'polite', 'aria-atomic': true },
        notice.message ? h('div', { key: notice.revision, className: 'lr-notice-toast', style: { '--lr-notice-time': noticeDuration + 'ms' } },
          h(PanelIcon, { size: 20 }), h('span', null, notice.message)) : null)

      const progressBar = busy
        ? h(
            'div',
            { className: 'lr-progress' },
            h('span', { className: 'lr-dot' }),
            h('span', null, busyLabel),
            progressLabel ? h('span', null, '· ' + progressLabel) : null,
          )
        : null

      const libraryDrawer = h(LibraryDrawer, {
          open: libraryOpen, embedded: !showPanel, onClose: closeLibrary, documents: library, folders: catalog.folders,
          activeId: paper?.id, folderId: catalog.folderId, onFolderChange: changeLibraryFolder,
          tab: libraryTab, onTabChange: changeLibraryTab, onUpload: () => uploadLibraryFile(),
          onCreateFolder: createLibraryFolder,
          onMove: moveLibraryDocument, onOpen: openLibraryDocument, onDelete: deleteLibraryDocument,
          onRenderPdfThumbnail: renderPdfThumbnail, onRenderZoteroThumbnail: renderZoteroThumbnail,
          onAttachPdf: uploadLibraryFile, onHome: returnToWelcome,
          onLookupDocument: (entry) => { setLibraryTab('lookup'); lookupLibrary(entry.meta?.doi || entry.meta?.url || entry.title, entry) },
          onRecoverZotero: (entry) => pickZotero({ key: entry.meta.zoteroKey }, false, entry),
          zotero: { ...zoteroState, missingKey: libraryZoteroSelection }, onLoadZotero: loadZotero,
          onImportZotero: (item, openAfterImport) => pickZotero(item, false, undefined, openAfterImport), onSaveZotero: (item) => pickZotero(item, true),
          lookup: lookupState, onLookup: lookupLibrary, onImportResult: (item) => importLookupResult(item),
          onSaveResult: (item) => importLookupResult(item, true), onFindPdfInZotero: (item) => importLookupResult(item, false, true),
          onCopyZoteroIdentifier: async (item) => {
            if (await copyText(item.doi || item.title)) setLibraryOperation((current) => current.label ? current : { message: item.doi ? '已复制 DOI，可在 Zotero 通过标识符添加。' : '已复制题名。' })
          },
          operation: libraryOperation, onDismissOperation: () => setLibraryOperation((current) => current.label ? current : {}),
          settings: catalog.settings, settingsState: librarySettingsState, onSettingsChange: changeLibrarySettings,
          onChooseDirectory: chooseLibraryDirectory, onCloseDirectory: closeLibraryDirectory,
          onResetDirectory: () => changeLibrarySettings({ pdfDirectory: '' }),
        })

      let body = null
      if (!showPanel) {
        body = h(EmptyState, {
          onUpload: () => fileRef.current && fileRef.current.click(),
          onZotero: openZotero,
          onLibrary: () => showLibrary(), onCloseLibrary: closeLibrary,
          onPdfDrop: file => handleFile(file, undefined, true),
          libraryOpen, library: libraryDrawer,
        })
      } else {
        const sourcePane = sourceOpen && pdfDoc ? h('aside', { className: 'lr-source', style: { width: paneWidth + 'px' } },
          h('div', { className: cls('lr-reader-chrome', titleCollapsed && 'is-collapsed'), ref: readerChromeRef, 'data-title-collapsed': titleCollapsed ? 'true' : 'false', onMouseEnter: enterReaderChrome, onMouseLeave: leaveReaderChrome, onFocusCapture: focusReaderChrome, onBlurCapture: blurReaderChrome },
            h('div', { className: 'lr-reader-leading', inert: titleCollapsed ? '' : undefined, 'aria-hidden': titleCollapsed || undefined },
            h('div', { className: 'lr-head-toc', ref: tocContainerRef, inert: titleCollapsed ? '' : undefined, 'aria-hidden': titleCollapsed || undefined },
              h('button', { type: 'button', className: 'lr-reader-button', disabled: titleCollapsed, 'aria-label': '目录', 'aria-controls': 'lr-outline-menu', 'aria-expanded': tocOpen, title: '章节目录', onClick: toggleOutlineMenu }, h(ToolIcon, { name: 'toc' })),
              tocOpen ? h('div', { className: 'lr-toc-body', id: 'lr-outline-menu', role: 'navigation', 'aria-label': '论文目录' }, structure && structure.sections && structure.sections.length ? structure.sections.map((section, index) => h('button', {
                key: section.id || index, className: cls('lr-toc-row', 'lv' + Math.min(section.level || 1, 4), (activeSection != null ? activeSection === index : readingState.currentSubsection === (section.anchorId || section.id)) && 'is-active'),
                title: section.heading || '开篇', 'aria-current': (activeSection != null ? activeSection === index : readingState.currentSubsection === (section.anchorId || section.id)) ? 'location' : undefined,
                onClick: () => navigateToOutlineSection(section, index, paper && paper.id),
              }, h('span', { className: 'lr-toc-title' }, section.heading || '开篇'), h('span', { className: 'lr-toc-page' }, 'p' + ((section.page || 0) + 1)))) : h('button', { className: 'lr-btn', disabled: structureBusy, onClick: () => runStructure() }, structureBusy ? '正在解析…' : '解析目录')) : null,
            ),
            documentControls),
            titlePill,
            h('div', { className: 'lr-reader-controls', 'aria-label': '原文阅读控制', inert: titleCollapsed ? '' : undefined, 'aria-hidden': titleCollapsed || undefined },
              h('div', { className: 'lr-pdf-mode', role: 'group', 'aria-label': 'PDF 外观' },
                [{ id: 'original', label: '原始' }, { id: 'dark', label: '深色' }].map((item) => h('button', { key: item.id, type: 'button', className: pdfAppearanceMode === item.id ? 'is-active' : '', disabled: titleCollapsed, 'aria-label': 'PDF ' + item.label + '模式', 'aria-pressed': pdfAppearanceMode === item.id, onClick: () => setChromeState((value) => ({ ...value, pdfAppearance: item.id })) }, item.label))),
              h('button', { type: 'button', className: 'lr-reader-button', disabled: titleCollapsed, 'aria-label': '缩小', title: '缩小', onClick: () => zoomBy(-.1) }, h(ToolIcon, { name: 'minus' })),
              h('span', { className: 'lr-zoom' }, Math.round((effectiveScale || 1) * 100) + '%'),
              h('button', { type: 'button', className: 'lr-reader-button', disabled: titleCollapsed, 'aria-label': '放大', title: '放大', onClick: () => zoomBy(.1) }, h(ToolIcon, { name: 'plus' })),
              h('button', { type: 'button', className: cls('lr-reader-button', fitWidth && 'is-active'), disabled: titleCollapsed, 'aria-label': '适宽', title: '适宽显示', 'aria-pressed': fitWidth, onClick: () => setFitWidth(true) }, h(ToolIcon, { name: 'fit' })),
            ),
            h('button', { type: 'button', className: 'lr-reader-button lr-reader-panel', disabled: titleCollapsed, inert: titleCollapsed ? '' : undefined, 'aria-hidden': titleCollapsed || undefined, 'aria-label': paperFocus ? '退出论文全屏' : '全屏论文', title: paperFocus ? '退出论文全屏' : '全屏论文', 'aria-pressed': paperFocus, onClick: togglePaperFocus }, h(ToolIcon, { name: 'panel' })),
          ),
          h('div', { className: cls('lr-paper-stack', !titleCollapsed && 'is-expanded'), ref: paperStackRef, 'data-title-collapsed': titleCollapsed ? 'true' : 'false', onMouseEnter: enterReaderChrome, onMouseLeave: leaveReaderChrome, onFocusCapture: focusReaderChrome, onBlurCapture: blurReaderChrome },
            h('button', { type: 'button', className: 'lr-stack-pill lr-title-toggle lr-stack-book', hidden: !titleCollapsed, 'aria-hidden': !titleCollapsed || undefined, tabIndex: titleCollapsed ? 0 : -1, 'aria-label': '展开阅读工具栏', 'aria-expanded': !titleCollapsed, title: (paper && paper.title || '') + '\n展开阅读工具栏', onClick: toggleReaderChrome }, h(ToolIcon, { name: 'book' }), h('span', null, '论文')),
            renderPopupHistory(false)),
          referenceReturn && referenceReturn.documentId === (paper && paper.id) ? h('button', {
            type: 'button', className: 'lr-reference-return', ref: referenceReturnButtonRef, 'aria-label': '返回原处', 'aria-busy': referenceReturn.busy,
            'data-return-page': referenceReturn.page, title: '返回第 ' + referenceReturn.page + ' 页的阅读位置',
            disabled: referenceReturn.busy, onClick: returnToReferenceOrigin,
          }, h(ToolIcon, { name: 'back' }), h('span', null, '返回原处')) : null,
          h('div', { className: 'lr-source-body is-pdf', ref: sourceRef, onScroll: onPdfReaderScroll, onWheelCapture: noteReaderScrollIntent, onPointerDownCapture: noteReaderScrollIntent, onTouchMoveCapture: noteReaderScrollIntent, onKeyDownCapture: noteReaderScrollIntent, onPointerMove: popupSourcePointer, tabIndex: 0, 'aria-label': '论文原文' },
            renderPopupSessions(),
            h(MemoPdfViewer, { doc: pdfDoc, documentId: paper && paper.id, appearanceMode: pdfAppearanceMode, scale: effectiveScale || 1, onSelect: handleSelect, onReference: openBodyReference, onEvidenceLayout: reanchorPopup, locatorRef, labels: pdfLabels, annotations, labelsVisible: tab === 'brief', activeLabel: activeCard, onLabelClick: toggleCard }),
            popup ? h('div', {
              className: cls('lr-pop-anchor is-hybrid-anchor', popup.presentation === 'perspective' && 'is-perspective', popup.presentation === 'bar' && 'is-session-hidden', popup.morphing && 'is-morphing', popup.anchor.above && 'is-above', popup.tether && 'is-detached', popup.anchor.cursorAttached && 'is-cursor-attached'),
              style: { left: popup.anchor.left + 'px', top: popup.anchor.top + 'px', width: (popup.anchor.width || 360) + 'px', '--lr-tip-x': (popup.anchor.tipX || 28) + 'px' },
            }, renderActivePopup()) : null),
          ) : null

        let content = null
        if (['chapters', 'ideas', 'citations'].includes(tab)) {
          const module = featureModules[tab]
          const owner = paper && paper.id
          const indexed = validStructure(structure, owner) ? structure : null
          content = owner && module ? h(React.Fragment, null,
            h('style', null, module.CSS || ''),
            h(module.Component, tab === 'chapters' ? {
              key: owner + ':outline:' + outlineChapterKey, paperId: owner, paper, structure: indexed, cards, overview,
              state: readingState, parsing: structureBusy, active: true,
              readingPosition: pdfPositionRef.current && pdfPositionRef.current.documentId === owner ? { ...pdfPositionRef.current, offset: pdfPositionRef.current.fraction || 0 } : { documentId: owner, page: 1, offset: 0 },
              entryPositionKey: owner + ':' + chapterEntryKey,
              onChange: (next, meta) => { if (paperRef.current && paperRef.current.id === owner && (!meta || meta.paperId === owner)) setReadingState(next) },
              onLocate: locateText, onGenerateChapter: generateChapter, onCreateIdea: createIdeaFromSource,
              onTranslate: translatePassage, onParse: () => runStructure(),
            } : tab === 'ideas' ? {
              key: owner, paperId: owner, paper, title: paper.title, ideas, cards, structure: indexed,
              onChange: (next, meta) => { if (paperRef.current && paperRef.current.id === owner && (!meta || meta.paperId === owner)) setIdeas(next) },
              sourceQuote: selectedQuote,
              onClearSource: () => { if (paperRef.current && paperRef.current.id === owner) setSelectedQuote(null) },
              onLocate: (quote, record) => locateText(quote, record && record.anchor, { reference: true }),
              onDiscuss: discussIdea, onTranslate: translatePassage,
            } : {
              key: owner, paperId: owner, paperText: paper.text, structure: indexed,
              onLocate: (quote, record) => locateText(quote, record && record.anchor, { reference: true }),
              activeReference, onCopy: copyText, state: citationState,
              onStateChange: (next, meta) => { if (paperRef.current && paperRef.current.id === owner && (!meta || meta.paperId === owner)) setCitationState(next) },
            })) : h('div', { className: 'lr-placeholder' }, featureError || '正在打开阅读工具…', featureError ? h('button', { className: 'lr-btn', onClick: () => { setFeatureError(''); loadReaderModule(tab).then((value) => setFeatureModules((previous) => ({ ...previous, [tab]: value }))).catch((caught) => setFeatureError(textOf(caught))) } }, '重试') : null)
        } else if (tab === 'brief') {
          if (cardsBusy && !cards.length) {
            content = h('div', { className: 'lr-brief-waiting', 'aria-label': '正在生成论文速览' }, replyWaiting('正在生成论文速览', true))
          } else if (cards.length) {
            content = h(
              'div',
              null,
              h(
                'div',
                { className: 'lr-panel-head' },
                h('span', { className: 'lr-panel-title' }, '速览 · ' + cards.length + ' 条'),
                h('button', { className: 'lr-btn', onClick: runCards, disabled: cardsBusy }, cardsBusy ? '生成中…' : '重新生成'),
              ),
              h(
                'div',
                { className: 'lr-cards' },
                cards.map((card, index) => {
                  const meta = CARD_TYPES[card.type] || CARD_TYPES.method
                  return h(
                    'button',
                    {
                      key: index,
                      className: cls('lr-card', activeCard === index && 'is-active'),
                      onClick: () => toggleCard(index),
                      'aria-pressed': activeCard === index,
                      style: { '--card-tint': meta.tint, '--card-ink': meta.ink, '--card-line': meta.line },
                    },

                    h(
                      'span',
                      { className: 'lr-card-main' },
                      h(
                        'span',
                        { className: 'lr-card-tagrow' },
                        h('span', { className: 'lr-card-tag' }, meta.label),
                        h('span', { className: 'lr-card-page' }, activeCard === index ? (cardLocating ? '定位中…' : '再次点击收起') : (cardPages[index] ? '第 ' + cardPages[index] + ' 页' : '查看原文')), 
                      ),
                      h('span', { className: 'lr-card-quote' }, card.quote),
                      card.comment ? h('span', { className: 'lr-card-comment' }, card.comment) : null,
                    ),
                  )
                }),
              ),
            )
          } else {
            content = h(
              'div',
              { className: 'lr-placeholder' },
              error ? '速览暂未生成，重试后会提取可核对原文的重点。' : '正在准备速览…',
              error ? h('div', null, h('button', { className: 'lr-btn primary', onClick: runCards, disabled: cardsBusy }, '重试生成')) : null,
            )
          }
        }

        body = h(
          'div',
          { className: cls('lr-body', paperFocus && 'is-paper-focused') },
          sourcePane,
          sourcePane ? h('div', { className: 'lr-splitter', hidden: paperFocus, inert: paperFocus ? '' : undefined, 'aria-hidden': paperFocus || undefined, onPointerDown: startResize, title: '拖动调整左右宽度' }) : null,
          h(
            'section',
            { className: 'lr-notes', hidden: paperFocus, 'aria-hidden': paperFocus || undefined, 'aria-busy': !identityReady, inert: paperFocus || !identityReady ? '' : undefined },
            h(
              'div',
              { className: 'lr-tabs-wrap' },
              h('div', { ...readerTabs.railProps, className: 'lr-tabs', role: 'tablist', 'aria-label': '论文阅读工具' },
                h('span', { className: 'lr-tab-lens', 'aria-hidden': true }),
                TABS.map((item, index) => h('button', {
                  key: item.id, id: 'lr-tab-' + item.id, type: 'button', role: 'tab', className: cls('lr-tab', tab === item.id && 'is-active'),
                  'aria-selected': tab === item.id, 'aria-controls': 'lr-reading-panel', 'aria-label': item.label, title: item.label, 'data-short-label': { brief: '速览', chapters: '精读', ideas: '想法', citations: '文献' }[item.id], tabIndex: tab === item.id ? 0 : -1,
                  onClick: () => selectTab(item.id), onKeyDown: event => readerTabs.onTabKeyDown(event, index),
                }, h(ToolIcon, { name: { brief: 'skim', chapters: 'book', ideas: 'explain', citations: 'references' }[item.id] }), h('span', { className: 'lr-tab-label-full' }, item.label)))),
            ),
            h('div', { className: cls('lr-content', tab !== 'brief' && 'is-workbench'), ref: contentScrollRef, id: 'lr-reading-panel', role: 'tabpanel', 'aria-labelledby': 'lr-tab-' + tab }, content),
          ),
        )
      }

      return h(
        'div',
        { className: cls('lr-root', paneResizing && 'is-pane-resizing'), onPointerMove: updateThinMaterialLight, onPointerOut: updateThinMaterialLight, onDragOver: (event) => event.preventDefault(), onDrop },
        h('style', null, CSS),
        h('input', {
          type: 'file',
          accept: '.pdf,.txt,.md,.markdown,text/plain,application/pdf',
          style: { display: 'none' },
          ref: fileRef,
          onChange: (event) => {
            const file = event.target.files && event.target.files[0]
            event.target.value = ''
            const target = attachTargetRef.current
            attachTargetRef.current = null
            if (file) handleFile(file, target)
          },
        }),
        noticeToast,
        showPanel ? header : null,
        progressBar,
        errorBanner,
        body,
        popup && popup.docked && (!sourceOpen || !pdfDoc) ? renderActivePopup() : null,
        showPanel ? libraryDrawer : null,
        h('style', null, SHELL_CSS),
        h('style', null, SELECTED_MATERIAL_CSS),
        h('style', null, replyMotion.CSS + '\n' + replyMotion.tokensCSS),
        h('style', null, HYBRID_POPUP_CSS),
      )
    }

    // ------------------------------------------------------------------
    // plugin
    // ------------------------------------------------------------------

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register({ name: 'sidebar.panellist', id: 'literature', order: 20, label: () => 'Gloss' }, PanelIcon),
        )
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'literature' }, Panel))
      },
    }
  },
})
