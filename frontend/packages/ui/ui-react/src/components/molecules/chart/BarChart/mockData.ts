import { BarChartData } from './types';

export const mockData: BarChartData = {
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
      maxValue: 7,
      minValue: 3,
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
      maxValue: 7,
      minValue: 3,
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
      maxValue: 6,
      minValue: 3,
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
      maxValue: 13,
      minValue: 3,
    },
    {
      xAxisData: 6,
      barData: [
        {
          value: 2,
          color: 'gray',
        },
        {
          value: 2,
          color: 'red',
        },
        {
          value: 2,
          color: 'blue',
        },
        {
          value: 1,
          color: 'black',
        },
      ],
      maxValue: 7,
      minValue: 3,
    },
    {
      xAxisData: 7,
      barData: [
        {
          value: 2,
          color: 'black',
        },
        {
          value: 2,
          color: 'red',
        },
      ],
      maxValue: 4,
      minValue: 3,
    },
    {
      xAxisData: 8,
      barData: [
        {
          value: 7,
          color: 'rgba(0, 23, 244, .3)',
        },
        {
          value: 3,
          color: 'rgba(200, 23, 124, .3)',
        },
      ],
      maxValue: 10,
      minValue: 3,
    },
    {
      xAxisData: 9,
      barData: [
        {
          value: 3,
          color: 'rgba(10, 123, 14, .3)',
        },
        {
          value: 3,
          color: 'rgba(255, 68, 134, .3)',
        },
      ],
      maxValue: 6,
      minValue: 3,
    },
  ],
};
