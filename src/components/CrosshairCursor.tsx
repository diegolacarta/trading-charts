import {Component, h} from 'preact'
import chartModel from '../models/chart'

export default class CrosshairCursor extends Component<{
  anchorsX: Date[]
}> {
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  fontSize = 11
  textColor = 'white'
  labelBgColor = 'red'
  labelPadding = 2
  labelTextHeight = this.fontSize - 3

  clear = () => {
    this.canvasContext.clearRect(0, 0, chartModel.width, chartModel.height)
  }

  drawCrosshairY = x => {
    this.canvasContext.moveTo(x, chartModel.height - chartModel.margin.bottom)
    this.canvasContext.lineTo(x, 0)
    this.canvasContext.strokeStyle = 'black'
    this.canvasContext.stroke()
  }

  drawCrosshairX = y => {
    this.canvasContext.moveTo(0, y)
    this.canvasContext.lineTo(chartModel.width - chartModel.margin.right, y)
    this.canvasContext.stroke()
  }

  drawCrosshair = (x, y) => {
    this.drawCrosshairX(y)
    this.drawCrosshairY(x)
  }

  drawLabelX = x => {
    this.canvasContext.fillStyle = this.labelBgColor
    const date = chartModel.scaleX.invert(x)
    const labelXText = date.toLocaleString()
    const labelXWidth = this.canvasContext.measureText(labelXText).width + this.labelPadding * 2
    this.canvasContext.fillRect(
      x - labelXWidth / 2,
      chartModel.height - chartModel.margin.bottom + 1,
      labelXWidth,
      this.labelTextHeight + this.labelPadding * 2
    )
    this.canvasContext.fillStyle = this.textColor
    this.canvasContext.textAlign = 'center'
    this.canvasContext.fillText(
      labelXText,
      x,
      chartModel.height - chartModel.margin.bottom + this.labelTextHeight + this.labelPadding + 1
    )
  }

  drawLabelY = y => {
    this.canvasContext.fillStyle = this.labelBgColor
    const labelYText = chartModel.scaleY.invert(y).toFixed(1)
    const labelYWidth = this.canvasContext.measureText(labelYText).width + this.labelPadding * 2
    const labelYHeight = this.labelTextHeight + this.labelPadding * 2
    this.canvasContext.fillRect(
      chartModel.width - chartModel.margin.right + 1,
      y - labelYHeight / 2,
      labelYWidth,
      labelYHeight
    )
    this.canvasContext.fillStyle = this.textColor
    this.canvasContext.textAlign = 'left'
    this.canvasContext.fillText(
      labelYText,
      chartModel.width - chartModel.margin.right + 1 + this.labelPadding,
      y + this.labelTextHeight / 2
    )
  }

  isOutOfBounds = (x, y = 0) => {
    return (
      x < 0 ||
      x > chartModel.width - chartModel.margin.right ||
      y < 0 ||
      y > chartModel.height - chartModel.margin.bottom
    )
  }

  draw = (x, y) => {
    this.canvasContext.beginPath()
    this.drawCrosshair(x, y)
    this.drawLabelX(x)
    this.drawLabelY(y)
  }

  init = () => {
    this.canvasContext.setLineDash([5, 3])
    this.canvasContext.font = `${this.fontSize}px Arial`
    window.addEventListener('mousemove', this.onMouseMove)
  }

  onRef = canvas => {
    if (canvas) {
      this.canvas = canvas
      this.canvasContext = this.canvas.getContext('2d')
      this.init()
    }
  }

  getClosestAnchorX = x => {
    let closestAnchorX
    let distanceToClosestAnchor
    this.props.anchorsX.forEach((anchor) => {
      const anchorX = chartModel.scaleX(anchor)
      const distance = Math.abs(anchorX - x)
      if (!this.isOutOfBounds(anchorX) && (distanceToClosestAnchor === undefined || distance < distanceToClosestAnchor)) {
        closestAnchorX = anchorX
        distanceToClosestAnchor = distance
      }
    })

    return closestAnchorX
  }

  onMouseMove = (event: MouseEvent) => {
    const {pageX, pageY} = event
    this.clear()
    const {left, top} = chartModel.canvas.getBoundingClientRect()
    const x = pageX - left
    const y = pageY - top
    if (this.isOutOfBounds(x, y)) {
      return
    }

    this.draw(this.getClosestAnchorX(x), y)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove)
  }

  render() {
    return (
      <canvas
        width={chartModel.width}
        height={chartModel.height}
        style={{
          position: 'absolute',
          pointerEvents: 'none'
        }}
        ref={this.onRef}
      />
    )
  }
}
