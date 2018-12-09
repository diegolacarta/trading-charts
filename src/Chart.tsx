import {Component, h} from 'preact'
import DOMEventListeners from './DOMEventListeners'
import chart from './models/chart'
import {ChartProps} from './models/types'

export default class Chart extends Component<ChartProps> {
  appliedTransform: any
  transformZ = 1
  transformX = 0

  static defaultProps = {
    events: ['wheel', 'drag']
  }

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

  onCanvasRef = canvas => {
    chart.setCanvas(canvas)
    DOMEventListeners.setEvents(this.props.events)
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
