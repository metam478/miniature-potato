import { Point } from 'highcharts'

export interface ExtendedPoint extends Point {
  point: {
    timestamp: number
  }
}
