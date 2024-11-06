import { Color } from '@amcharts/amcharts5';

type DataType = {
  innerData: Array<{
    name: string;
    category: string;
    value: number;
  }>;
  outerData: Array<{
    name: string;
    category: string;
    value: number;
  }>;
  innerDataColors: Array<Color>;
  outerDataColors: Array<Color>;
};

export type { DataType as RadialBarChartType };
