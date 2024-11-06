export interface ChartTypes {
  SINGLE: string;
  MULTI: string;
  // FILLED: string;
}

export interface DataType {
  x: number;
  y1: number;
  y2: number;
}

export interface SeriesType {
  align: string;
  x: string;
  y: string;
  color: string;
  label: string;
  domain: number[];
}

export const chartTypes: ChartTypes = {
  SINGLE: 'single',
  MULTI: 'multi',
  // FILLED: 'filled',
};

export const data: DataType[] = [
  { x: 1, y1: 20, y2: 10 },
  { x: 2, y1: 11, y2: 10 },
  { x: 3, y1: 2, y2: 1 },
  { x: 4, y1: 80, y2: 10 },
  { x: 5, y1: 90, y2: 10 },
  { x: 6, y1: 100, y2: 10 },
];

export interface LineChartArgs {
  data: DataType[];
  type?: string;
  id?: string;
  width?: number;
  height?: number;
  isResponsive?: boolean;
  legend?: boolean;
  series?: SeriesType[];
  xTickFormat?: any;
}
