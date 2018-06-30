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
  }

  isOutOfBounds = domain => {
    return (
      (this.props.domainXBounds && domain[0] > this.props.domainXBounds[1]) ||
      domain[1] < this.props.domainXBounds[0]
    )
  }

  onCanvasRef = canvas => {
    chartModel.setCanvas(canvas)

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
