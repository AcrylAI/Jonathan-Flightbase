type DataInfoType = {
  name: string;
  dataKey: string;
};

type DataType = {
  category: {
    dataKey: string;
  };
  bar1: DataInfoType;
  bar2: DataInfoType;
  line: DataInfoType;
  data: Array<{ [key: string]: string | number }>;
};

export type { DataType };
