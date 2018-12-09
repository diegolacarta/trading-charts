import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from 'd3'
import EventEmitter from './EventEmitter'
import {ChartProps} from './types'

class Chart extends EventEmitter {
  width: number
  height: number
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  scaleX: ScaleTime<number, number>
  scaleY: ScaleLinear<number, number>
  scaleX2: ScaleTime<number, number>
  scaleY2: ScaleLinear<number, number>
  domainXBounds: Date[]
  domainX: Date[]
  domainY: number[]
  margin = {
    right: 50,
    bottom: 20
  }
  listeners = {}
  transformZ = 1
  transformX = 0
  fontFamily = 'Menlo'

  setCanvas = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
    this.canvasContext = canvas.getContext('2d')
  }

  setDomainX = domain => {
    this.domainX = domain
    this.scaleX.domain(domain)
    this.trigger('domainChange')
  }

  setDomainY = domain => {
    this.domainY = domain
    this.scaleY.domain(domain)
    this.trigger('domainChange')
  }

  setProps = (props: ChartProps) => {
    this.domainXBounds = props.domainXBounds
    if (this.height !== props.height) {
      this.height = props.height
      this.scaleY = scaleLinear()
        .domain(props.domainY)
        .range([props.height - this.margin.bottom - 1, 0])
      this.scaleY2 = this.scaleY.copy()
    }
    if (this.width !== props.width) {
      this.width = props.width
      this.scaleX = scaleTime().domain(props.domainX)
      this.scaleX.range([0, props.width - this.margin.right - 1])
      this.scaleX2 = this.scaleX.copy()
    }
    if (this.domainX !== props.domainX) {
      this.setDomainX(props.domainX)
    }
    if (this.domainY !== props.domainY) {
      this.setDomainY(props.domainY)
    }
  }
}

export default new Chart()
