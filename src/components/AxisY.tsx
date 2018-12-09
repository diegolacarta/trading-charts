import {Component, h} from 'preact'
import chart from '../models/chart'
import Canvas from './Canvas'

export default class AxisY extends Component<{
  appearance: {
    textColor: string
  }
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D

  componentWillReceiveProps(nextProps) {
    this.draw(nextProps)
  }

  componentDidMount() {
    chart.on('domainChange', this.draw)
    this.draw()
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw = (props = this.props) => {
    this.clear()
    this.canvasContext.font = `10px ${chart.fontFamily}`
    const ticks = chart.scaleY.ticks(10)
    const tickFormat = chart.scaleY.tickFormat()
    this.canvasContext.beginPath()
    this.canvasContext.fillStyle = 'white'
    this.canvasContext.moveTo(
      chart.width - chart.margin.right,
      chart.height - chart.margin.bottom + 1
    )
    this.canvasContext.lineTo(chart.width - chart.margin.right, 0)
    this.canvasContext.strokeStyle = 'black'
    this.canvasContext.stroke()
    this.canvasContext.fillStyle = props.appearance.textColor
    this.canvasContext.textAlign = 'left'
    this.canvasContext.textBaseline = 'middle'
    ticks.forEach(tick => {
      this.canvasContext.beginPath()
      this.canvasContext.setLineDash([1, 3])
      this.canvasContext.moveTo(0, chart.scaleY(tick))
      this.canvasContext.lineTo(chart.width - chart.margin.right + 3, chart.scaleY(tick))
      this.canvasContext.strokeStyle = 'grey'
      this.canvasContext.stroke()
      this.canvasContext.setLineDash([])
      this.canvasContext.fillText(
        tickFormat(tick),
        chart.width - chart.margin.right + 5,
        chart.scaleY(tick)
      )
    })
  }

  onCanvasRef = canvas => {
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
        width={chart.width}
        height={chart.height}
        innerRef={this.onCanvasRef}
        style={{position: 'absolute', pointerEvents: 'none'}}
        onResize={this.draw}
      />
    )
  }
}
