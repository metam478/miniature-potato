import { type PointOptionsObject } from 'highcharts'

export interface ExtendedPoint extends PointOptionsObject {
  timestamp: number
}
