import { useEffect, useRef, useState } from 'react';

import { TotalClassType } from '@src/pages/ExportResultsPage/ExportResultsPage';

import EChartsReact, { EChartsOption } from 'echarts-for-react';

type graphDataType = {
  nameList: Array<string>;
  colorList: Array<string>;
  dataList: Array<string>;
};

function ClassGraph({ data }: { data: Array<TotalClassType> }) {
  const chartRef = useRef(null);
  const [options, setOptions] = useState<EChartsOption>({});
  const [largeData, setLargeData] = useState<boolean>(false);

  const [graphData, setGraphData] = useState<graphDataType>({
    nameList: [],
    colorList: [],
    dataList: [],
  });

  const settingGraph = () => {
    const nameList: Array<string> = [];
    const colorList: Array<string> = [];
    const dataList: any = [];
    data.forEach((v) => {
      const keys = Object.keys(v);
      let name = '';

      const naming = () => {
        if (keys.includes('name')) {
          name = v.name ?? '';
          return;
        }
        if (keys.includes('lv3')) {
          name = v.lv3 ?? '';
          return;
        }
        if (keys.includes('lv2')) {
          name = v.lv2 ?? '';
        } else name = v.lv1 ?? '';
      };
      naming();

      const newData = {
        value: v.count ?? 0,
        itemStyle: {
          color: v.color,
        },
      };

      nameList.push(name);
      colorList.push(v.color);
      dataList.push(newData);
      setGraphData({
        nameList,
        colorList,
        dataList,
      });
    });

    const graphOption: EChartsOption = {
      grid: {
        top: 10,
        right: 50,
        bottom: dataList.length > 40 ? 120 : 100,
        left: 50,
      },
      xAxis: {
        scrollbar: {
          enabled: true,
        },
        // min: 0,
        max: dataList.length > 40 ? dataList.length : 'auto',
        type: 'category',
        data: nameList ?? [],
        axisTick: {
          show: false,
        },
        axisLabel: {
          rotate: 30,
          margin: 20,
          fontSize: '12px',
          verticalAlign: 'middle',
          padding: [0, -5, 0, 0],
          color: '#1E222A',
          // width: 100,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '',
        },
      },
      series: [
        {
          data: dataList ?? [],
          type: 'bar',
          width: '100%',
          label: {
            distance: 30,
          },
          itemStyle: {
            color: colorList ?? [],
          },
          barWidth: nameList.length < 20 ? '20px' : '40%', // 막대 너비 설정
          // barGap: '16px', // 같은 카테고리의 막대 간격 설정
          // barCategoryGap: '16px', // 다른 카테고리의 막대 간격 설정
          emphasis: {
            disabled: true,
          },
        },
      ],
    };

    setOptions(graphOption);
    if (nameList.length > 40) setLargeData(true);
  };

  useEffect(() => {
    settingGraph();
  }, []);

  return (
    <EChartsReact
      option={options}
      style={{
        height: '100%',
        width: largeData ? `${graphData.nameList.length * 40}px` : '',
      }}
      ref={chartRef}
    ></EChartsReact>
  );
}

export default ClassGraph;
