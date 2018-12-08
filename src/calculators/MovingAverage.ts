import {Data} from '../models/types'

export type Options = {
  window: number
  source: 'close'
}

export default class MovingAverage {
  private data: Data
  private options: Options

  constructor(
    data: Data,
    options: Options = {
      window: 20,
      source: 'close'
    }
  ) {
    this.options = options
    this.data = data
  }

  calculate = () => {
    const {window} = this.options
    if (this.data.length < window) {
      return []
    }
    return this.data.map((interval, index, data) => {
      const startIndex = index - window
      return {
        date: interval.date,
        value: startIndex >= 0 ? this.getAverage(data.slice(startIndex, index)) : undefined
      }
    })
  }

  private getAverage = (data: Data) => {
    return (
      data.reduce((average, interval) => average + interval[this.options.source], 0) / data.length
    )
  }
}
