import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from 'd3'
import EventEmitter from './EventEmitter';
import { ChartProps } from './types';

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
  margin = {
    right: 40,
    bottom: 20
  }
  listeners = {}
  transformZ = 1
  transformX = 0

  init = (props: ChartProps) => {
    this.height = props.height
    this.width = props.width
    this.domainXBounds = props.domainXBounds
    this.scaleX = scaleTime().domain(props.domainX)
    this.scaleX.range([0, props.width - this.margin.right - 1])
    this.scaleY = scaleLinear()
      .domain(props.domainY)
      .range([props.height - this.margin.bottom - 1, 0])
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

export default new Chart()
