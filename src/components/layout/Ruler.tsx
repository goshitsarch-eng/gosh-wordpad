import { useEffect, useRef } from 'react'

export default function Ruler() {
  const numbersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (numbersRef.current) {
      let html = ''
      for (let i = 0; i <= 8; i++) {
        html += `<span style="position: absolute; left: ${i * 72}px; transform: translateX(-50%);">${i}</span>`
      }
      numbersRef.current.innerHTML = html
    }
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
        <div className="indent-marker left-indent" title="Left Indent" />
        <div className="indent-marker right-indent" title="Right Indent" />
        <div className="indent-marker first-line-indent" title="First Line Indent" />
      </div>
    </div>
  )
}
