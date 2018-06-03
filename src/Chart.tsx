import {Component, h} from 'preact'
import chartModel, {ChartProps} from './chartModel'

const MARGIN = {
  right: 30,
  bottom: 20
}

export default class Chart extends Component<ChartProps> {
  appliedTransform: any
  transformZ = 1
  transformX = 0

  state = {
    initialized: false
  }

  componentWillMount() {
    chartModel.init(this.props)
    chartModel.on('domainChange', () => {
      this.draw()
    })
  }

  componentWillReceiveProps(nextProps: ChartProps) {
    if (this.props.domainX !== nextProps.domainX) {
      chartModel.setDomainX(nextProps.domainX)
    }

    if (this.props.domainY !== nextProps.domainY) {
      chartModel.setDomainY(nextProps.domainY)
    }
  }

  clear = () => {
    chartModel.canvasContext.clearRect(0, 0, this.props.width, this.props.height)
    this.drawAxes()
  }

  draw = () => {
    this.clear()
    this.drawAxes()
  }

  drawAxes = () => {
    this.drawYAxes()
    this.drawXAxes()
  }

  drawYAxes = () => {
    const ticks = chartModel.scaleY.ticks(10)
    const tickFormat = chartModel.scaleY.tickFormat()
    chartModel.canvasContext.beginPath()
    chartModel.canvasContext.fillStyle = 'white'
    chartModel.canvasContext.moveTo(
      this.props.width - MARGIN.right,
      this.props.height - MARGIN.bottom
    )
    chartModel.canvasContext.lineTo(this.props.width - MARGIN.right, 0)
    chartModel.canvasContext.strokeStyle = 'black'
    chartModel.canvasContext.stroke()
    chartModel.canvasContext.fillStyle = this.props.appearance.textColor
    chartModel.canvasContext.textAlign = 'left'
    chartModel.canvasContext.textBaseline = 'middle'
    ticks.forEach(tick => {
      chartModel.canvasContext.beginPath()
      chartModel.canvasContext.setLineDash([1, 3])
      chartModel.canvasContext.moveTo(0, chartModel.scaleY(tick))
      chartModel.canvasContext.lineTo(this.props.width - MARGIN.right + 3, chartModel.scaleY(tick))
      chartModel.canvasContext.strokeStyle = 'grey'
      chartModel.canvasContext.stroke()
      chartModel.canvasContext.setLineDash([])
      chartModel.canvasContext.fillText(
        tickFormat(tick),
        this.props.width - MARGIN.right + 5,
        chartModel.scaleY(tick)
      )
    })
  }

  drawXAxes = () => {
    const ticks = chartModel.scaleX.ticks(10)
    const tickFormat = chartModel.scaleX.tickFormat()
    const {canvasContext} = chartModel
    canvasContext.beginPath()
    canvasContext.moveTo(0, this.props.height - MARGIN.bottom)
    canvasContext.lineTo(this.props.width - MARGIN.right, this.props.height - MARGIN.bottom)
    canvasContext.strokeStyle = 'black'
    canvasContext.stroke()
    canvasContext.fillStyle = this.props.appearance.textColor
    canvasContext.textAlign = 'center'
    canvasContext.textBaseline = 'top'
    ticks.forEach(tick => {
      canvasContext.beginPath()
      chartModel.canvasContext.setLineDash([1, 3])
      canvasContext.moveTo(chartModel.scaleX(tick), this.props.height - MARGIN.bottom + 3)
      canvasContext.lineTo(chartModel.scaleX(tick), 0)
      canvasContext.strokeStyle = 'grey'
      canvasContext.stroke()
      chartModel.canvasContext.setLineDash([])
      canvasContext.fillText(
        tickFormat(tick),
        chartModel.scaleX(tick),
        this.props.height - MARGIN.bottom + 5
      )
    })
  }

  isOutOfBounds = domain => {
    return (
      (this.props.domainXBounds && domain[0] > this.props.domainXBounds[1]) ||
      domain[1] < this.props.domainXBounds[0]
    )
  }

  onCanvasRef = canvas => {
    chartModel.setCanvas(canvas)
    this.draw()

    chartModel.canvas.addEventListener('wheel', (event: WheelEvent) => {
      const {deltaY, deltaX} = event
      const transformZ = Math.min(3, Math.max(0.2, this.transformZ - deltaY / 100))
      const transformX = Math.min(1000, Math.max(-1000, this.transformX + deltaX * 10))
      const domain = chartModel.scaleX2
        .copy()
        .domain(
          chartModel.scaleX2
            .range()
            .map(x => (x + transformX) / transformZ)
            .map(chartModel.scaleX2.invert, chartModel.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      this.transformX = transformX
      this.transformZ = transformZ
      chartModel.setDomainX(domain)
    })

    let mouseDownPoint
    chartModel.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      const {clientX, clientY} = event
      mouseDownPoint = {clientX: this.transformX + clientX, clientY}
      window.addEventListener('mousemove', onMouseMove)
    })

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', onMouseMove)
    })

    const onMouseMove = event => {
      const {clientX} = event
      const transformX = -(clientX - mouseDownPoint.clientX)
      const domain = chartModel.scaleX2
        .copy()
        .domain(
          chartModel.scaleX2
            .range()
            .map(x => (x + transformX) / this.transformZ)
            .map(chartModel.scaleX2.invert, chartModel.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      this.transformX = transformX
      chartModel.setDomainX(domain)
    }

    this.setState({
      initialized: true
    })
  }

  render() {
    const {width, height} = this.props

    return (
      <div
        style={{
          position: 'relative',
          height,
          width
        }}
      >
        <canvas
          width={width}
          height={height}
          ref={this.onCanvasRef}
          style={{position: 'absolute'}}
        />
        {this.state.initialized && this.props.children}
      </div>
    )
  }
}
