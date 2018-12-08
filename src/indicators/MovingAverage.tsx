import {Component, h} from 'preact'
import MovingAverageCalculator, {Options} from '../calculators/MovingAverage'
import Line, {Appearance} from '../charts/Line'
import { Data, OnDraw } from '../models/types';

export default class MovingAverage extends Component<{
  options?: Options
  data: Data
  onDraw: OnDraw
  appearance?: Appearance
}> {
  state = {
    data: []
  }

  componentWillMount() {
    this.calculate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.calculate(nextProps)
  }

  calculate = props => {
    const calculator = new MovingAverageCalculator(props.data, props.options)
    this.setState({
      data: calculator.calculate()
    })
  }

  render() {
    return (
      <Line
        data={this.state.data}
        yAccessor={item => item.value}
        onDraw={this.props.onDraw}
        appearance={this.props.appearance}
      />
    )
  }
}
