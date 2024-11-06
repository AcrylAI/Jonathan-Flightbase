const singleLineChartMockData = {
  series: {
    left: [
      {
        color: 'red',
        name: 'left1',
        lineWidth: 2,
        series: [9, 3, 3, 4, 5, 6],
      },
    ],
  },
  axis: {
    bottom: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'black',
      data: [0, 10, 20, 30, 40, 50],
    },
    left: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'rgba(100, 100, 100, 0.9)',
    },
  },
};

const multiLineChartMockData = {
  series: {
    left: [
      {
        color: 'red',
        name: 'left1',
        lineWidth: 2,
        series: [9, 3, 3, 4, 5, 6],
      },
      {
        color: 'blue',
        name: 'left2',
        lineWidth: 2,
        series: [10, 4, 7, 8, 7, 6],
      },
    ],
  },
  axis: {
    bottom: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'black',
      data: [0, 10, 20, 30, 40, 50],
    },
    left: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'black',
    },
  },
};

const multiAxisChart = {
  series: {
    left: [
      {
        color: 'red',
        name: 'left1',
        lineWidth: 2,
        series: [9, 3, 3, 4, 5, 6],
      },
      {
        color: 'blue',
        name: 'left2',
        lineWidth: 2,
        series: [10, 4, 7, 8, 7, 6],
      },
    ],
    right: [
      {
        series: [42, 32, 41, 32, 47, 50],
        name: 'right1',
        lineWidth: 2,
        color: '#8D3F47',
      },
      {
        name: 'right2',
        series: [32, 25, 23, 29, 10, 43],
        lineWidth: 2,
        color: '#FD3FA7',
      },
    ],
  },
  axis: {
    bottom: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'black',
      data: [0, 10, 20, 30, 40, 50],
    },
    left: {
      unitsPerTick: 1,
      tickSize: 10,
      color: 'black',
    },
    right: {
      unitsPerTick: 5,
      tickSize: 10,
      color: 'black',
    },
  },
};

export { singleLineChartMockData, multiLineChartMockData, multiAxisChart };
