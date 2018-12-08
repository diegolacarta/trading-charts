export type ChartProps = {
  width: number
  height: number
  domainX: Date[]
  domainXBounds: Date[]
  domainY: number[]
  appearance: {
    textColor: string
  }
}

export type Interval = {
  date: Date
  high: number
  low: number
  open: number
  close: number
}

export type Data = Interval[]

export type OnDraw = (plotData: Data, domainY: [number, number]) => any