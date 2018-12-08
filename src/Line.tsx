import {Component, h} from 'preact'
import chartModel, {Data, OnDraw} from './chartModel'

export default class Line extends Component<{
  data: Data[]
  onDraw: OnDraw
  yAccessor: (item) => number
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  color = 'blue'
  width = 2

  init = () => {
    chartModel.on('domainChange', this.onDomainChange)
    this.draw(this.props)
  }

  onDomainChange = () => {
    this.draw(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.draw(nextProps)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, chartModel.width, chartModel.height)
  }

  draw = props => {
    this.clear()
    const plotData = this.calculatePlotData(props.data)

    if (!plotData.length) {
      return
    }

    const firstItem = plotData[0]
    const x = chartModel.scaleX(firstItem.date)
    const y = chartModel.scaleY(this.props.yAccessor(firstItem))
    this.canvasContext.beginPath()
    this.canvasContext.strokeStyle = this.color
    this.canvasContext.lineWidth = this.width
    this.canvasContext.moveTo(x, y)
    plotData.forEach(item => {
      const x = chartModel.scaleX(item.date)
      const y = chartModel.scaleY(this.props.yAccessor(item))
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
    const x = chartModel.scaleX(item.date)
    return x >= chartModel.scaleX.range()[0] && x <= chartModel.scaleX.range()[1]
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
    chartModel.off('domainChange', this.onDomainChange)
  }

  render() {
    return (
      <canvas
        width={chartModel.width - chartModel.margin.right - 1}
        height={chartModel.height - chartModel.margin.bottom - 1}
        style={{
          position: 'absolute',
          pointerEvents: 'none'
        }}
        ref={this.onRef}
      />
    )
  }
}
