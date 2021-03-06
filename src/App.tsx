import {Component, h} from 'preact'
import Chart from './Chart'
import Candlesticks from './charts/Candlesticks'
import Line from './charts/Line'
import AxisX from './components/AxisX'
import AxisY from './components/AxisY'
import CrosshairCursor from './components/CrosshairCursor'
import MovingAverage from './indicators/MovingAverage'

function round(d) {
  return Math.round(100 * d) / 100
}
var data = []
var date = new Date(2010, 0, 1)
var high = 1000
var close = high - Math.random()
var low = close - Math.random()
var open = (high - low) * Math.random() + low
data.push({
  date,
  high: round(high),
  low: round(low),
  open: round(open),
  close: round(close)
})
for (var day = 2; day <= 100; day++) {
  date = new Date(2010, 0, day)
  high = open + Math.random() * 2
  close = high - Math.random() * 2
  low = close - Math.random() * 2
  var oldOpen = open
  open = (high - low) * Math.random() + low
  if (low > oldOpen) {
    low = oldOpen
  }
  data.push({
    date,
    high: round(high),
    low: round(low),
    open: round(open),
    close: round(close)
  })
}

const DISPLAY_COUNT = 50

export default class App extends Component {
  chartContainer: HTMLDivElement

  state = {
    data,
    chartType: 'candlesticks',
    domainX: [],
    domainY: [],
    domainXBounds: [data[4].date, data[data.length - 5].date],
    height: 0,
    width: 0
  }

  componentDidMount() {
    this.setDomain(this.state.data)
    this.setDimensions()
    window.addEventListener('resize', () => {
      this.setDimensions()
    })
  }

  setDimensions = () => {
    this.setState({
      height: this.chartContainer.offsetHeight,
      width: this.chartContainer.offsetWidth
    })
  }

  addPoint = () => {
    const last = this.state.data[this.state.data.length - 1]
    high = open + Math.random() * 2
    close = high - Math.random() * 2
    low = close - Math.random() * 2
    var oldOpen = open
    open = (high - low) * Math.random() + low
    if (low > oldOpen) {
      low = oldOpen
    }
    const data = [
      ...this.state.data,
      {
        high: round(high),
        low: round(low),
        open: round(open),
        close: round(close),
        date: new Date(last.date.getTime() + 60 * 60 * 24 * 1000)
      }
    ]
    this.setState({
      data,
      domainXBounds: [data[1].date, data[data.length - 2].date]
    })
  }

  setDomain = data => {
    this.setState({
      domainX: [data[Math.max(0, data.length - DISPLAY_COUNT)].date, data[data.length - 1].date],
      domainY: [Math.min(...data.map(d => d.low)), Math.max(...data.map(d => d.high))]
    })
  }

  setChartType = chartType => event => {
    this.setState({
      chartType
    })
  }

  onDraw = (plotData, domainY) => {
    const low = Math.min(domainY[0], this.state.domainY[0])
    const high = Math.max(domainY[1], this.state.domainY[1])
    if (low === this.state.domainY[0] && high === this.state.domainY[1]) {
      return
    }

    this.setState({
      domainY: [low, high]
    })
  }

  onChartContainer = (chartContainer) => {
    if (chartContainer) {
      this.chartContainer = chartContainer
    }
  }

  render() {
    const {data} = this.state
    return (
      <div className="parent">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .parent {
                height: 100%;
                display: flex;
                flex-direction: column;
              }
              .chartContainer {
                flex: 1;
                margin-bottom: 10px;
              }
            `
          }}
        />
        <div className="chartContainer" ref={this.onChartContainer}>
          <Chart
            appearance={{
              textColor: 'black'
            }}
            domainXBounds={this.state.domainXBounds}
            domainX={this.state.domainX}
            domainY={this.state.domainY}
            height={this.state.height}
            width={this.state.width}
          >
            {this.state.chartType === 'candlesticks' && (
              <Candlesticks data={data.slice()} onDraw={this.onDraw} />
            )}
            <AxisY appearance={{textColor: 'black'}} />
            <AxisX appearance={{textColor: 'black'}} />
            {this.state.chartType === 'line' && (
              <Line data={data.slice()} yAccessor={item => item.close} onDraw={this.onDraw} />
            )}
            <MovingAverage
              data={data.slice()}
              onDraw={this.onDraw}
              appearance={{
                color: 'purple',
                width: 1
              }}
            />
            <CrosshairCursor anchorsX={data.map(d => d.date)} />
          </Chart>
        </div>
        <button onClick={this.addPoint}>Add point</button>
        <button onClick={this.setChartType('candlesticks')}>Candlesticks</button>
        <button onClick={this.setChartType('line')}>Line</button>
      </div>
    )
  }
}
