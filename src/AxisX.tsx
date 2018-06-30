import {Component, h} from 'preact'
import chartModel from './chartModel'

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

  draw = props => {
    this.clear()
    const ticks = chartModel.scaleX.ticks(10)
    const tickFormat = chartModel.scaleX.tickFormat()
    const {canvasContext} = this
    canvasContext.beginPath()
    canvasContext.moveTo(0, chartModel.height - chartModel.margin.bottom)
    canvasContext.lineTo(
      chartModel.width - chartModel.margin.right,
      chartModel.height - chartModel.margin.bottom
    )
    canvasContext.strokeStyle = 'black'
    canvasContext.stroke()
    canvasContext.fillStyle = this.props.appearance.textColor
    canvasContext.textAlign = 'center'
    canvasContext.textBaseline = 'top'
    ticks.forEach(tick => {
      canvasContext.beginPath()
      canvasContext.setLineDash([1, 3])
      canvasContext.moveTo(
        chartModel.scaleX(tick),
        chartModel.height - chartModel.margin.bottom + 3
      )
      canvasContext.lineTo(chartModel.scaleX(tick), 0)
      canvasContext.strokeStyle = 'grey'
      canvasContext.stroke()
      canvasContext.setLineDash([])
      canvasContext.fillText(
        tickFormat(tick),
        chartModel.scaleX(tick),
        chartModel.height - chartModel.margin.bottom + 5
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
