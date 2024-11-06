import { Color } from '@amcharts/amcharts5';

type DoubleLineChartDataType = {
  categoryKey: string;
  valueKey1: string;
  valueKey2: string;
  valueName1: string;
  valueName2: string;
  value1: Array<{
    [key: string]: string | number;
  }>;
  value2: Array<{
    [key: string]: string | number;
  }>;
  color1: Color;
  color2: Color;
};

export type { DoubleLineChartDataType };
