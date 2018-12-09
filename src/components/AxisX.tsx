import {Component, h} from 'preact'
import chart from '../models/chart'
import Canvas from './Canvas'

export default class AxisX extends Component<{
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
    this.draw(this.props)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw = (props = this.props) => {
    this.clear()
    this.canvasContext.font = `10px ${chart.fontFamily}`
    const ticks = chart.scaleX.ticks(10)
    const tickFormat = chart.scaleX.tickFormat()
    const {canvasContext} = this
    canvasContext.beginPath()
    canvasContext.moveTo(0, chart.height - chart.margin.bottom)
    canvasContext.lineTo(
      chart.width - chart.margin.right,
      chart.height - chart.margin.bottom
    )
    canvasContext.strokeStyle = 'black'
    canvasContext.stroke()
    canvasContext.fillStyle = props.appearance.textColor
    canvasContext.textAlign = 'center'
    canvasContext.textBaseline = 'top'
    ticks.forEach(tick => {
      canvasContext.beginPath()
      canvasContext.setLineDash([1, 3])
      canvasContext.moveTo(
        chart.scaleX(tick),
        chart.height - chart.margin.bottom + 3
      )
      canvasContext.lineTo(chart.scaleX(tick), 0)
      canvasContext.strokeStyle = 'grey'
      canvasContext.stroke()
      canvasContext.setLineDash([])
      canvasContext.fillText(
        tickFormat(tick),
        chart.scaleX(tick),
        chart.height - chart.margin.bottom + 5
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
