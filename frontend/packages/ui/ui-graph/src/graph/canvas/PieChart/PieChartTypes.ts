export interface PieChartParam {
  canvas: HTMLCanvasElement;
  data: PieChartDataTypes[];
  chartSize?: number;
  chartFillColor?: string;
  chartBolder?: ChartBolderType;
  centerText?: LabelType;
  totalValue?: number;
}

export interface ChartBolderType {
  designatedBolder?: 'large' | 'medium' | 'small' | 'x-small';
  custom?: number;
}

export interface SizeType {
  width: number;
  height: number;
}

export interface LabelType {
  text: any | any[];
  color?: string;
  style?: string;
}

export interface PieChartDataTypes {
  title?: LabelType;
  value: number;
  color: string;
  titlePosition?: number;
}

export interface PieChartElement extends PieChartDataTypes {
  angleValue: number;
}

export interface EachDataAreaType {
  title?: LabelType;
  titlePosition?: number;
  startEndDegree: number;
}

export const chartBolders = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-samll',
};

export const pieChartPrimaryStyle = {
  CHART_SIZE: 300,
  CHART_COLOR: 'rgb(230, 230, 230)',
  LABEL_COLOR: '#000000',
  LABEL_STYLE: 'normal bold 12px serif',
};
