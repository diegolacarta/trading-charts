import chart from './models/chart';
import { DOMEvent } from './models/types';

class DOMEventListeners {
  setEvents = (events: DOMEvent[]) => {
    events.forEach(event => this[event]())
  }

  private isOutOfBounds = domain => {
    return (
      (chart.domainXBounds && domain[0] > chart.domainXBounds[1]) ||
      domain[1] < chart.domainXBounds[0]
    )
  }

  private wheel = () => {
    chart.canvas.addEventListener('wheel', (event: WheelEvent) => {
      const {deltaY, deltaX} = event
      const transformZ = Math.min(3, Math.max(0.2, chart.transformZ - deltaY / 100))
      const transformX = Math.min(1000, Math.max(-1000, chart.transformX + deltaX * 10))
      const domain = chart.scaleX2
        .copy()
        .domain(
          chart.scaleX2
            .range()
            .map(x => (x + transformX) / transformZ)
            .map(chart.scaleX2.invert, chart.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      chart.transformX = transformX
      chart.transformZ = transformZ
      chart.setDomainX(domain)
    })
  }

  private drag = () => {
    let mouseDownPoint
    chart.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      const {clientX, clientY} = event
      mouseDownPoint = {clientX: chart.transformX + clientX, clientY}
      window.addEventListener('mousemove', onMouseMove)
    })

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', onMouseMove)
    })

    const onMouseMove = event => {
      const {clientX} = event
      const transformX = -(clientX - mouseDownPoint.clientX)
      const domain = chart.scaleX2
        .copy()
        .domain(
          chart.scaleX2
            .range()
            .map(x => (x + transformX) / chart.transformZ)
            .map(chart.scaleX2.invert, chart.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      chart.transformX = transformX
      chart.setDomainX(domain)
    }
  }
}

export default new DOMEventListeners()
