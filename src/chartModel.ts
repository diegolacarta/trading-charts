import * as d3 from 'd3'

export type ChartProps = {
  width: number
  height: number
  domainX: Date[]
  domainXBounds: Date[]
  domainY: number[]
  appearance: {
    textColor: string
  }
}

class EventEmitter {
  listeners = {}

  on = (event, listener) => {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  off = (event, listener) => {
    const listeners = this.listeners[event]
    if (!listeners) {
      return
    }
    listeners.splice(listeners.indexOf(listener), 1)
  }

  trigger = (event, ...args) => {
    const listeners = this.listeners[event]
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }
}

class ChartModel extends EventEmitter {
  width: number
  height: number
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  scaleX: d3.ScaleTime<number, number>
  scaleY: d3.ScaleLinear<number, number>
  scaleX2: d3.ScaleTime<number, number>
  scaleY2: d3.ScaleLinear<number, number>
  domainXBounds: Date[]
  margin = {
    right: 30,
    bottom: 20
  }
  listeners = {}

  init = (props: ChartProps) => {
    this.height = props.height
    this.width = props.width
    this.domainXBounds = props.domainXBounds
    this.scaleX = d3
      .scaleTime()
      .domain(props.domainX)
    this.scaleX.range([0, props.width - this.margin.right])
    this.scaleY = d3
      .scaleLinear()
      .domain(props.domainY)
      .range([props.height - this.margin.bottom, 0])
    this.scaleX2 = this.scaleX.copy()
    this.scaleY2 = this.scaleY.copy()
  }

  setCanvas = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
    this.canvasContext = canvas.getContext('2d')
  }

  setDomainX = domain => {
    this.scaleX.domain(domain)
    this.trigger('domainChange')
  }

  setDomainY = domain => {
    this.scaleY.domain(domain)
    this.trigger('domainChange')
  }
}

export default new ChartModel()
