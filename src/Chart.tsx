import {Component, h} from 'preact'
import chart from './models/chart'
import {ChartProps} from './models/types'

export default class Chart extends Component<ChartProps> {
  appliedTransform: any
  transformZ = 1
  transformX = 0

  state = {
    initialized: false
  }

  componentWillMount() {
    chart.init(this.props)
  }

  componentWillReceiveProps(nextProps: ChartProps) {
    if (this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
      chart.init(nextProps)
    }
    if (this.props.domainX !== nextProps.domainX) {
      chart.setDomainX(nextProps.domainX)
    }

    if (this.props.domainY !== nextProps.domainY) {
      chart.setDomainY(nextProps.domainY)
    }
  }

  clear = () => {
    chart.canvasContext.clearRect(0, 0, this.props.width, this.props.height)
  }

  isOutOfBounds = domain => {
    return (
      (this.props.domainXBounds && domain[0] > this.props.domainXBounds[1]) ||
      domain[1] < this.props.domainXBounds[0]
    )
  }

  onCanvasRef = canvas => {
    chart.setCanvas(canvas)

    chart.canvas.addEventListener('wheel', (event: WheelEvent) => {
      const {deltaY, deltaX} = event
      const transformZ = Math.min(3, Math.max(0.2, this.transformZ - deltaY / 100))
      const transformX = Math.min(1000, Math.max(-1000, this.transformX + deltaX * 10))
      const domain = chart.scaleX2
        .copy()
        .domain(
          chart.scaleX2
            .range()
            .map(x => (x + transformX) / transformZ)
            .map(chart.scaleX2.invert, chart.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      this.transformX = transformX
      this.transformZ = transformZ
      chart.setDomainX(domain)
    })

    let mouseDownPoint
    chart.canvas.addEventListener('mousedown', (event: MouseEvent) => {
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
      const domain = chart.scaleX2
        .copy()
        .domain(
          chart.scaleX2
            .range()
            .map(x => (x + transformX) / this.transformZ)
            .map(chart.scaleX2.invert, chart.scaleX2)
        )
        .domain()

      if (this.isOutOfBounds(domain)) {
        return
      }

      this.transformX = transformX
      chart.setDomainX(domain)
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
