import {Component, h} from 'preact'
import chartModel from '../models/chart'

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

  init = () => {
    chartModel.on('domainChange', this.onDomainChange)
    this.draw(this.props)
  }

  onDomainChange = () => {
    this.draw(this.props)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw = (props) => {
    this.clear()
    const ticks = chartModel.scaleY.ticks(10)
    const tickFormat = chartModel.scaleY.tickFormat()
    this.canvasContext.beginPath()
    this.canvasContext.fillStyle = 'white'
    this.canvasContext.moveTo(
      chartModel.width - chartModel.margin.right,
      chartModel.height - chartModel.margin.bottom + 1
    )
    this.canvasContext.lineTo(chartModel.width - chartModel.margin.right, 0)
    this.canvasContext.strokeStyle = 'black'
    this.canvasContext.stroke()
    this.canvasContext.fillStyle = props.appearance.textColor
    this.canvasContext.textAlign = 'left'
    this.canvasContext.textBaseline = 'middle'
    ticks.forEach(tick => {
      this.canvasContext.beginPath()
      this.canvasContext.setLineDash([1, 3])
      this.canvasContext.moveTo(0, chartModel.scaleY(tick))
      this.canvasContext.lineTo(
        chartModel.width - chartModel.margin.right + 3,
        chartModel.scaleY(tick)
      )
      this.canvasContext.strokeStyle = 'grey'
      this.canvasContext.stroke()
      this.canvasContext.setLineDash([])
      this.canvasContext.fillText(
        tickFormat(tick),
        chartModel.width - chartModel.margin.right + 5,
        chartModel.scaleY(tick)
      )
    })
  }

  onCanvasRef = canvas => {
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
        width={chartModel.width}
        height={chartModel.height}
        ref={this.onCanvasRef}
        style={{position: 'absolute', pointerEvents: 'none'}}
      />
    )
  }
}
