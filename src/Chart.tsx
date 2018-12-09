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

  componentDidMount() {
    DOMEventListeners.setEvents(this.props.events)
    chart.setProps(this.props)
  }

  componentWillReceiveProps(nextProps: ChartProps) {
    chart.setProps(nextProps)
  }

  clear = () => {
    chart.canvasContext.clearRect(0, 0, this.props.width, this.props.height)
  }

  onCanvasRef = canvas => {
    chart.setCanvas(canvas)
    this.setState({
      initialized: true
    })
  }

  render() {
    const {width, height} = this.props

    return (
      <div
        style={{
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
