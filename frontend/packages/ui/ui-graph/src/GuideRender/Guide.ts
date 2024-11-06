import D3SingleLineChart from '@src/components/D3SingleLineChart';
import D3MultiLineChart from '@src/components/D3MultiLineChart';
import { ContentsType, category } from './types';
import CanvasLineChart from '@src/components/CanvasLineChart';
import CanvasPieChart from '@src/components/CanvasPieChart';
import CanvasBarChart from '@src/components/CanvasBarChart/CanvasBarChart';
import CanvasBarLineChart from '@src/components/CanvasBarLineChart/CanvasBarLineChart';

export const contents: ContentsType[] = [
  {
    title: 'D3 Line Single Line Chart',
    subject: 'D3 Single Line Chart',
    desc: 'D3 싱글 라인 차트',
    tabContent: D3SingleLineChart(),
    category: category.D3_LINE,
    type: 'd3-single-line-chart',
    code: `
      import { LineChart } from '@jonathan/ui-graph';

      const series = [
        {
          align: 'LEFT',
          x: 'x',
          y: 'y1',
          color: '#e57373',
          label: 'y1',
          domain: [0, 100],
        },
      ];
  
      const data = [
        { x: 1, y1: 20, y2: 10 },
        { x: 2, y1: 11, y2: 10 },
        { x: 3, y1: 2, y2: 1 },
        { x: 4, y1: 80, y2: 10 },
        { x: 5, y1: 90, y2: 10 },
        { x: 6, y1: 100, y2: 10 },
      ];
  
      const param = {
        eleId: id,
        width: 1200,
        height: 300,
        isResponsive: true,
        legend: true,
        xAxisMaxTicks: 6,
        tooltip: {
          align: 'right',
        },
      };
  
      const lineChart = new LineChart(param);
      lineChart.init(data);
      lineChart.setSeries(series);
      lineChart.draw();
    `,
  },
  {
    title: 'D3 MultiLine Chart',
    subject: 'D3 MultiLine Chart',
    desc: 'D3 멀티 라인 차트',
    category: category.D3_LINE,
    tabContent: D3MultiLineChart(),
    type: 'd3-multi-line-chart',
    code: `
      import { LineChart } from '@jonathan/ui-graph';

      const series = [
        {
          align: 'LEFT',
          x: 'x',
          y: 'y1',
          color: '#e57373',
          label: 'y1',
          domain: [0, 100],
        },
        {
          align: 'RIGHT',
          x: 'x',
          y: 'y2',
          color: '#7986cb',
          label: 'y2',
          domain: [0, 100],
        },
      ];

      const data = [
        { x: 1, y1: 20, y2: 10 },
        { x: 2, y1: 11, y2: 10 },
        { x: 3, y1: 2, y2: 1 },
        { x: 4, y1: 80, y2: 10 },
        { x: 5, y1: 90, y2: 10 },
        { x: 6, y1: 100, y2: 10 },
      ];

      const param = {
        eleId: id,
        width: 1200,
        height: 300,
        isResponsive: true,
        legend: true,
        xAxisMaxTicks: 6,
        tooltip: {
          align: 'right',
        },
      };

      const lineChart = new LineChart(param);
      lineChart.init(data);
      lineChart.setSeries(series);
      lineChart.draw();
    `,
  },
  {
    title: 'Canvas Line Chart',
    subject: 'Canvas Line Chart',
    desc: '캔버스 라인 차트',
    category: category.CANVAS_LINE,
    tabContent: CanvasLineChart(),
    type: 'canvas-line',
    code: `
      import { CanvasLineChart } from '@jonathan/ui-graph';

      const param = {
        nodeId: 'layer',
        point: 2,
        font: 'normal bold 12px SpoqaM',
        fontHeight: 12,
      };

      const dataParam = {
        series: {
          left: [
            {
              color: 'red',
              name: 'left1',
              lineWidth: 2,
              series: [9, 8, 7, 10, 6, 8, 5, 8, 7, 9],
            },
            {
              color: 'blue',
              name: 'left2',
              lineWidth: 2,
              series: [1, 4, 3, 2, 5, 7, 6, 4, 5, 2],
            },
          ],
          right: [
            {
              series: [30, 23, 38, 31, 21, 22, 25, 22, 33, 42],
              name: 'right1',
              lineWidth: 2,
              color: '#8D3F47',
            },
            {
              name: 'right2',
              series: [18, 22, 25, 43, 53, 54, 49, 42, 32, 22],
              lineWidth: 2,
              color: '#FD3FA7',
            },
          ],
        },
        axis: {
          bottom: {
            unitsPerTick: 1,
            name: 'X axis',
            tickSize: 7,
            lineWidth: 1,
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
          left: {
            name: 'left axis',
            unitsPerTick: 1,
            tickSize: 7,
            lineWidth: 1,
          },
          right: {
            name: 'right axis',
            unitsPerTick: 10,
            tickSize: 7,
            lineWidth: 1,
          },
        },
      };
      const lineChart = new CanvasLineChart(param);
      lineChart.dataInitialize(dataParam);
      lineChart.render();
    `,
  },
  {
    title: 'Canvas Bar Chart',
    subject: 'Canvas Bar Chart',
    desc: '캔버스 바 차트',
    category: category.CANVAS_LINE,
    tabContent: CanvasBarChart(),
    type: 'canvas-bar',
    code: `
      import { CanvasLineChart } from '@jonathan/ui-graph';

      const param = {
        canvas: document.getElementById('bar-chart') as HTMLCanvasElement,
        data: {
          xAxisSelector: 'xAxisData',
          dataSelector: 'barData',
          data: [
            {
              xAxisData: 0,
              barData: [
                {
                  value: 1,
                  color: 'red',
                },
                {
                  value: 3,
                  color: 'yellow',
                },
                {
                  value: 3,
                  color: 'blue',
                },
              ],
            },
            {
              xAxisData: 1,
              barData: [
                {
                  value: 7,
                  color: 'gray',
                },
                {
                  value: 3,
                  color: 'yellow',
                },
              ],
              maxValue: 10,
              minValue: 3,
            },
            {
              xAxisData: 2,
              barData: [
                {
                  value: 2,
                  color: 'gray',
                },
                {
                  value: 4,
                  color: 'black',
                },
                {
                  value: 1,
                  color: 'yellow',
                },
              ],
            },
            {
              xAxisData: 3,
              barData: [
                {
                  value: 3,
                  color: 'gray',
                },
                {
                  value: 3,
                  color: 'yellow',
                },
              ],
            },
            {
              xAxisData: 4,
              barData: 10,
            },
            {
              xAxisData: 5,
              barData: [
                {
                  value: 4,
                  color: 'gray',
                },
                {
                  value: 3,
                  color: 'red',
                },
                {
                  value: 3,
                  color: 'blue',
                },
                {
                  value: 3,
                  color: 'green',
                },
              ],
            },
          ],
        },
        width: 1800,
        height: 470,
        unitsPerTickX: 1,
        unitsPerTickY: 1,
        barWidth: 20,
        isAxisDraw: true,
      };
      const drawParam = {
        drawXAxis: true,
        drawXValue: true,
        drawXTick: true,
        drawYAxis: true,
        drawYValue: true,
        drawYTick: true,
      };
      const barChart = new BarChart(param);
      barChart.draw(drawParam)
    `,
  },
  {
    title: 'Canvas Bar/Line Chart',
    subject: 'Canvas Bar/Line Chart',
    desc: '캔버스 바/라인 차트',
    category: category.CANVAS_LINE,
    tabContent: CanvasBarLineChart(),
    type: 'canvas-bar-line',
    code: `
      import { BarLineChart } from '@jonathan/ui-graph'

      const param: BarLineChartParam = {
        canvas,
        unitsPerTickX: 1,
        unitsPerTickY: 1,
        width: 1000,
        height: 470,
        axisColor: '#555',
        data: {
          xAxisSelector: 'xAxisData',
          lineDataSelector: 'lineData',
          barDataSelector: 'barData',
          data: [
            {
              xAxisData: 0,
              lineData: 0,
              barData: 10,
            },
            {
              xAxisData: 1,
              lineData: 1,
              barData: 3,
            },
            {
              xAxisData: 2,
              lineData: 2,
              barData: 4,
            },
            {
              xAxisData: 3,
              lineData: 4,
              barData: 1,
            },
            {
              xAxisData: 4,
              lineData: 6,
              barData: 10,
            },
            {
              xAxisData: 5,
              lineData: 5,
              barData: 9,
            },
          ]
        },
        barWidth: 20,
        point: 3,
      };

      const drawParam: DrawParam = {
        drawXAxis: true,
        drawXValue: true,
        drawXTick: true,
        drawYAxis: true,
        drawYValue: true,
        drawYTick: true,
        activeTooltip: true,
        tooltipStyle: {
          width: '50px',
          height: 'auto',
          padding: '10px',
          border: '1px solid gray',
          borderRadius: '4px',
        },
      };

      const barLineChart = new BarLineChart(param);
      barLineChart.draw(drawParam);
    `,
  },
  {
    title: 'Canvas Pie Chart',
    subject: 'Canvas Pie Chart',
    desc: '캔버스 파이 차트',
    category: category.CANVAS_PIE,
    tabContent: CanvasPieChart(),
    type: 'canvas-pie',
    code: `
      import { PieChart } from '@jonathan/ui-graph';

      const param: PieChartParam = {
        canvas: document.getElementById('pie-chart') as HTMLCanvasElement,
        data: [
          {
            title: {
              text: 'One',
              color: 'white',
              style: 'normal bold 15px serif',
            },
            value: 2,
            color: '#123534',
            titlePosition: 0.8,
          },
          {
            title: {
              text: 'two',
              color: 'white',
              style: 'normal bold 15px serif',
            },
            value: 1,
            color: '#945938',
            titlePosition: 0.8,
          },
        ],
        chartBolder: {
          custom: 0.5,
        },
        totalValue: 7,
        chartFillColor: 'rgb(230, 230, 230)',
        centerText: {
          text: {
            text: ['One', 'Two', 'Tree'],
            color: 'black',
            style: 'normal bold 17px serif',
          },
        },
      };
      const pieChart = new PieChart(param);
      pieChart.draw();
    `,
  },
];
