import {Component, h} from 'preact'
import chartModel from './chartModel'

export default class Candlesticks extends Component<{
  data: any[]
  onDraw: (plotData) => any
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  wickWidth = 2

  componentWillReceiveProps(nextProps) {
    this.draw(nextProps)
  }

  init = () => {
    chartModel.on('domainChange', this.onDomainChange)
    this.draw(this.props)
  }

  onDomainChange = () => {
    this.draw(this.props)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, chartModel.width, chartModel.height)
  }

  draw = props => {
    this.clear()
    const plotData = this.calculatePlotData(props.data)
    plotData.forEach(this.drawCandlestick(props))
    this.props.onDraw(plotData)
  }

  drawCandlestick = props => item => {
    this.canvasContext.beginPath()
    const x = chartModel.scaleX(item.date)
    const low = chartModel.scaleY(item.low)
    const high = chartModel.scaleY(item.high)
    const open = chartModel.scaleY(item.open)
    const close = chartModel.scaleY(item.close)
    this.canvasContext.fillStyle = item.close >= item.open ? 'green' : 'red'
    const wickX = x - this.wickWidth / 2
    const candlestickWidth = this.getCandlestickWidth(props)
    this.canvasContext.rect(x - candlestickWidth / 2, open, candlestickWidth, close - open)
    const wickWidth = Math.min(
      this.wickWidth,
      this.wickWidth / 2 + chartModel.width - chartModel.margin.right - x
    )
    this.canvasContext.rect(wickX, low, wickWidth, Math.max(open, close) - low)
    this.canvasContext.rect(wickX, high, wickWidth, Math.min(open, close) - high)
    this.canvasContext.fill()
  }

  getCandlestickWidth(props) {
    const x00 = chartModel.scaleX(props.data[0].date)
    const x11 = chartModel.scaleX(props.data[props.data.length - 1].date)
    const width = (x11 - x00) / props.data.length

    return width * 0.8
  }

  calculatePlotData = data => {
    return data.filter(item => {
      const x = chartModel.scaleX(item.date)
      return x >= chartModel.scaleX.range()[0] && x <= chartModel.scaleX.range()[1]
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
