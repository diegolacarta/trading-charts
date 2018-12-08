export type DOMEvent = 'drag' | 'wheel'

export type ChartProps = {
  width: number
  height: number
  domainX: Date[]
  domainXBounds: Date[]
  domainY: number[]
  appearance: {
    textColor: string
  },
  events?: DOMEvent[]
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