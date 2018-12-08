import {Component, h} from 'preact'
import chart from '../models/chart'
import {Data, OnDraw} from '../models/types'

export type Appearance = {
  color?: string
  width?: number
}

export default class Line extends Component<{
  data: Data[]
  onDraw: OnDraw
  yAccessor: (item) => number
  appearance?: Appearance
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D

  init = () => {
    chart.on('domainChange', this.onDomainChange)
    this.draw(this.props)
  }

  onDomainChange = () => {
    this.draw(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.draw(nextProps)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, chart.width, chart.height)
  }

  get appearance() {
    return {
      color: 'blue',
      width: 2,
      ...this.props.appearance
    }
  }

  draw = props => {
    this.clear()
    const plotData = this.calculatePlotData(props.data)

    if (!plotData.length) {
      return
    }

    const firstItem = plotData[0]
    const x = chart.scaleX(firstItem.date)
    const y = chart.scaleY(this.props.yAccessor(firstItem))
    this.canvasContext.beginPath()
    this.canvasContext.strokeStyle = this.appearance.color
    this.canvasContext.lineWidth = this.appearance.width
    this.canvasContext.moveTo(x, y)
    plotData.forEach(item => {
      const x = chart.scaleX(item.date)
      const y = chart.scaleY(this.props.yAccessor(item))
      this.canvasContext.lineTo(x, y)
    })
    this.canvasContext.stroke()
    const values = plotData.map(d => this.props.yAccessor(d))
    this.props.onDraw(plotData, [
      Math.min(...values.filter(Number.isFinite)),
      Math.max(...values.filter(Number.isFinite))
    ])
  }

  inRangeX = item => {
    const x = chart.scaleX(item.date)
    return x >= chart.scaleX.range()[0] && x <= chart.scaleX.range()[1]
  }

  calculatePlotData = data => {
    return data.filter((item, index, items) => {
      const nextItem = items[index + 1]
      const previousItem = items[index - 1]

      return (
        this.inRangeX(item) ||
        (nextItem && this.inRangeX(nextItem)) ||
        (previousItem && this.inRangeX(previousItem))
      )
    })
  }

  onRef = canvas => {
    if (canvas) {
      this.canvas = canvas
      this.canvasContext = this.canvas.getContext('2d')
      this.init()
    }
  }

  componentWillUnmount() {
    chart.off('domainChange', this.onDomainChange)
  }

  render() {
    return (
      <canvas
        width={chart.width - chart.margin.right - 1}
        height={chart.height - chart.margin.bottom - 1}
        style={{
          position: 'absolute',
          pointerEvents: 'none'
        }}
        ref={this.onRef}
      />
    )
  }
}
