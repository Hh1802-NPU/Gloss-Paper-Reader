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
