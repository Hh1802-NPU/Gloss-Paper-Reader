    const LIBRARY_CSS = __GLOSS_STYLE_LIBRARY__

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
