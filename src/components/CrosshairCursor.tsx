import {Component, h} from 'preact'
import chart from '../models/chart'
import Canvas from './Canvas'

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
  x: number
  y: number

  componentDidMount() {
    window.addEventListener('mousemove', this.onMouseMove)
  }

  clear = () => {
    this.canvasContext.clearRect(0, 0, chart.width, chart.height)
  }

  drawCrosshairY = x => {
    this.canvasContext.moveTo(x, chart.height - chart.margin.bottom)
    this.canvasContext.lineTo(x, 0)
    this.canvasContext.strokeStyle = 'black'
    this.canvasContext.stroke()
  }

  drawCrosshairX = y => {
    this.canvasContext.moveTo(0, y)
    this.canvasContext.lineTo(chart.width - chart.margin.right, y)
    this.canvasContext.stroke()
  }

  drawCrosshair = (x, y) => {
    this.drawCrosshairX(y)
    this.drawCrosshairY(x)
  }

  drawLabelX = x => {
    this.canvasContext.fillStyle = this.labelBgColor
    const date = chart.scaleX.invert(x)
    const labelXText = date.toLocaleString()
    const labelXWidth = this.canvasContext.measureText(labelXText).width + this.labelPadding * 2
    this.canvasContext.fillRect(
      x - labelXWidth / 2,
      chart.height - chart.margin.bottom + 1,
      labelXWidth,
      this.labelTextHeight + this.labelPadding * 2
    )
    this.canvasContext.fillStyle = this.textColor
    this.canvasContext.textAlign = 'center'
    this.canvasContext.fillText(
      labelXText,
      x,
      chart.height - chart.margin.bottom + this.labelTextHeight + this.labelPadding + 1
    )
  }

  drawLabelY = y => {
    this.canvasContext.fillStyle = this.labelBgColor
    const labelYText = chart.scaleY.invert(y).toFixed(1)
    const labelYWidth = this.canvasContext.measureText(labelYText).width + this.labelPadding * 2
    const labelYHeight = this.labelTextHeight + this.labelPadding * 2
    this.canvasContext.fillRect(
      chart.width - chart.margin.right + 1,
      y - labelYHeight / 2,
      labelYWidth,
      labelYHeight
    )
    this.canvasContext.fillStyle = this.textColor
    this.canvasContext.textAlign = 'left'
    this.canvasContext.fillText(
      labelYText,
      chart.width - chart.margin.right + 1 + this.labelPadding,
      y + this.labelTextHeight / 2
    )
  }

  isOutOfBounds = (x, y = 0) => {
    return (
      x < 0 ||
      x > chart.width - chart.margin.right ||
      y < 0 ||
      y > chart.height - chart.margin.bottom
    )
  }

  draw = (x = this.x, y = this.y) => {
    this.x = x
    this.y = y
    this.canvasContext.setLineDash([5, 3])
    this.canvasContext.font = `${this.fontSize}px ${chart.fontFamily}`
    this.canvasContext.beginPath()
    this.drawCrosshair(x, y)
    this.drawLabelX(x)
    this.drawLabelY(y)
  }

  onRef = canvas => {
    if (canvas) {
      this.canvas = canvas
      this.canvasContext = this.canvas.getContext('2d')
    }
  }

  getClosestAnchorX = x => {
    let closestAnchorX
    let distanceToClosestAnchor
    this.props.anchorsX.forEach(anchor => {
      const anchorX = chart.scaleX(anchor)
      const distance = Math.abs(anchorX - x)
      if (
        !this.isOutOfBounds(anchorX) &&
        (distanceToClosestAnchor === undefined || distance < distanceToClosestAnchor)
      ) {
        closestAnchorX = anchorX
        distanceToClosestAnchor = distance
      }
    })

    return closestAnchorX
  }

  onMouseMove = (event: MouseEvent) => {
    const {pageX, pageY} = event
    this.clear()
    const {left, top} = chart.canvas.getBoundingClientRect()
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
      <Canvas
        width={chart.width}
        height={chart.height}
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
