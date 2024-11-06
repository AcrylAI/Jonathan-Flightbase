// chart
import PieChart from '@src/components/uiContents/charts/PieChart';
import DonutChart from '@src/components/uiContents/charts/DonutChart';
import ColumnChart from '@src/components/uiContents/charts/ColumnChart';
import StackedColumnChart from '@src/components/uiContents/charts/StackedColumnChart';
// data
import SampleData from '@src/components/uiContents/charts/sampleData';

function ChartTest() {
  return (
    <>
      <StackedColumnChart
        tagId={'stackedColumchartdiv'}
        data={SampleData.stackedColumnChart}
        customStyle={{
          width: '100%',
          height: '360px',
          backgroundColor: 'transparent',
          // backgroundColor: '#25232A',
        }}
      />
      <ColumnChart
        tagId={'columchartdiv'}
        data={SampleData.columnChart}
        average={180}
        customStyle={{
          width: '100%',
          height: '360px',
          backgroundColor: 'transparent',
          // backgroundColor: '#25232A',
        }}
      />
      <PieChart
        tagId={'piechartdiv'}
        data={SampleData.pieChart}
        customStyle={{
          width: '503px',
          minWidth: '503px',
          height: '276px',
        }}
      />
      <DonutChart
        tagId={'donutchartdiv'}
        data={SampleData.donutChart}
        total={600}
        customStyle={{
          width: '503px',
          minWidth: '503px',
          height: '276px',
        }}
      />
    </>
  );
}

export default ChartTest;
