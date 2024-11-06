type DataType = {
  category: string;
  value: string;
  name: string;
  blockKey: string;
  xText: string;
  data: Array<{
    [key: string]: string | number;
    xText: string;
    color: string;
  }>;
};

export type { DataType };
