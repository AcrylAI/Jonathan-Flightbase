type DataType = {
  category: string;
  value: string;
  name: string;
  totalDataLabel: string;
  totalData: number;
  data: Array<{ [key: string]: string | number }>;
};

export type { DataType };
