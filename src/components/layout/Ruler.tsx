import { useEffect, useRef } from 'react'

export default function Ruler() {
  const numbersRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const firstLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (numbersRef.current) {
      let html = ''
      for (let i = 0; i <= 8; i++) {
        html += `<span style="position: absolute; left: ${i * 72}px; transform: translateX(-50%);">${i}</span>`
      }
      numbersRef.current.innerHTML = html
    }

    function makeIndentDraggable(element: HTMLElement, type: string) {
      let isDragging = false
      let startX = 0

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true
        startX = e.clientX
        e.preventDefault()
      }
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        const deltaX = e.clientX - startX
        const currentLeft = parseInt(element.style.left || getComputedStyle(element).left) || 20
        if (type !== 'right') {
          element.style.left = `${Math.max(0, currentLeft + deltaX)}px`
        } else {
          const currentRight = parseInt(element.style.right || '20')
          element.style.right = `${Math.max(0, currentRight - deltaX)}px`
        }
        startX = e.clientX
      }
      const onMouseUp = () => { isDragging = false }

      element.addEventListener('mousedown', onMouseDown)
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      return () => {
        element.removeEventListener('mousedown', onMouseDown)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }

    const cleanups: (() => void)[] = []
    if (leftRef.current) cleanups.push(makeIndentDraggable(leftRef.current, 'left'))
    if (rightRef.current) cleanups.push(makeIndentDraggable(rightRef.current, 'right'))
    if (firstLineRef.current) cleanups.push(makeIndentDraggable(firstLineRef.current, 'firstLine'))
    return () => cleanups.forEach(c => c())
  }, [])

  return (
    <div className="ruler">
      <div className="ruler-inner">
        <div className="ruler-margin-left" />
        <div className="ruler-content">
          <div className="ruler-numbers" ref={numbersRef} />
          <div className="ruler-ticks" />
        </div>
        <div className="ruler-margin-right" />
        <div className="indent-marker left-indent" ref={leftRef} title="Left Indent" />
        <div className="indent-marker right-indent" ref={rightRef} title="Right Indent" />
        <div className="indent-marker first-line-indent" ref={firstLineRef} title="First Line Indent" />
      </div>
    </div>
  )
}
