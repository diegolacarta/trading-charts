import {Component, h} from 'preact'
import chart from '../models/chart'
import {OnDraw} from '../models/types'
import Canvas from '../components/Canvas';

export default class Candlesticks extends Component<{
  data: any[]
  onDraw: OnDraw
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  wickWidth = 2

  componentDidMount() {
    chart.on('domainChange', this.draw)
    this.draw()
  }

  componentWillReceiveProps(nextProps) {
    this.draw(nextProps)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, chart.width, chart.height)
  }

  draw = (props = this.props) => {
    this.clear()
    const plotData = this.calculatePlotData(props.data)
    plotData.forEach(this.drawCandlestick(props))
    const highs = plotData.map(d => d.high)
    const lows = plotData.map(d => d.low)
    this.props.onDraw(plotData, [Math.min(...lows), Math.max(...highs)])
  }

  drawCandlestick = props => item => {
    this.canvasContext.beginPath()
    const x = chart.scaleX(item.date)
    const low = chart.scaleY(item.low)
    const high = chart.scaleY(item.high)
    const open = chart.scaleY(item.open)
    const close = chart.scaleY(item.close)
    this.canvasContext.fillStyle = item.close >= item.open ? 'green' : 'red'
    const wickX = x - this.wickWidth / 2
    const candlestickWidth = this.getCandlestickWidth(props)
    this.canvasContext.rect(x - candlestickWidth / 2, open, candlestickWidth, close - open)
    const wickWidth = Math.min(
      this.wickWidth,
      this.wickWidth / 2 + chart.width - chart.margin.right - x
    )
    this.canvasContext.rect(wickX, low, wickWidth, Math.max(open, close) - low)
    this.canvasContext.rect(wickX, high, wickWidth, Math.min(open, close) - high)
    this.canvasContext.fill()
  }

  getCandlestickWidth(props) {
    const x00 = chart.scaleX(props.data[0].date)
    const x11 = chart.scaleX(props.data[props.data.length - 1].date)
    const width = (x11 - x00) / props.data.length

    return width * 0.8
  }

  calculatePlotData = data => {
    return data.filter(item => {
      const x = chart.scaleX(item.date)
      return x >= chart.scaleX.range()[0] && x <= chart.scaleX.range()[1]
    })
  }

  onRef = canvas => {
    if (canvas) {
      this.canvas = canvas
      this.canvasContext = this.canvas.getContext('2d')
    }
  }

  componentWillUnmount() {
    chart.off('domainChange', this.draw)
  }

  render() {
    return (
      <Canvas
        width={chart.width - chart.margin.right - 1}
        height={chart.height - chart.margin.bottom - 1}
        style={{
          position: 'absolute',
          pointerEvents: 'none'
        }}
        innerRef={this.onRef}
        onResize={this.draw}
      />
    )
  }
}
