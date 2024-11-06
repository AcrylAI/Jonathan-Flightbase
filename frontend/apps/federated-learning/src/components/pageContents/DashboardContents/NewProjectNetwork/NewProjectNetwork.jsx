import { useLayoutEffect } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

function NewProjectNetwork({ networkData }) {
  useLayoutEffect(() => {
    const masterName = networkData?.server?.name || 'Jonathan';
    const clientList = [];
    networkData?.client_list?.forEach((list) => clientList.push(list.name));

    let root = am5.Root.new('chartdiv2');

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create wrapper container
    let container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      }),
    );

    // Create series
    let series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        singleBranchOnly: true,
        downDepth: 10,
        topDepth: 0,
        initialDepth: 1,
        valueField: 'value',
        categoryField: 'name',
        childDataField: 'children',
        linkWithField: 'linkWith',
        configField: 'configLink',
        centerStrength: 0.5,
        minRadius: am5.percent(5),
        maxRadius: am5.percent(7),
        nodePadding: 2,
      }),
    );

    // Generate and set data
    series.circles.template.setAll({
      // 얘를 넣어야 바뀜
      templateField: 'nodeSettings',
    });
    let data = {
      name: `[bold]Master - ${masterName}`,
      fill: '#2D76F8',
      value: 2,
      nodeSettings: {
        fill: '#2D76F8', // 루트 노드 배경색
      },
      children: [],
    };

    series.circles.template.states.create('disabled', {
      fillOpacity: 0.5,
      strokeOpacity: 0,
      stroke: '#53505B',
      fill: '#53505B',
    });

    generateLevel(data);

    series.data.setAll([data]);

    function generateLevel(data) {
      for (let i = 0; i < clientList.length; i++) {
        let nodeName = clientList[i];
        let child;

        child = {
          //  name: nodeName,
          value: 1,
          category: nodeName,
          nodeSettings: {
            fill: '#53505B', // 처음 여러색으로 뜨느거 얘가 막아줌
          },
        };
        data.children.push(child);
      }

      return data;
    }

    // 원 테두리 삭제
    series.outerCircles.template.set('forceHidden', true);

    // 글씨 색, 사이즈
    series.labels.template.setAll({
      fill: '#c2c2c2',
      fontSize: 10,
      textAlign: 'center',
      oversizedBehavior: 'truncate', //  'none' | 'truncate' // 노드랑 텍스트 간 관계 설정
      ellipsis: '...',
    });

    let tooltip = series.set(
      'tooltip',
      am5.Tooltip.new(root, { getFillFromSprite: false, autoTextColor: false }),
    );

    tooltip.label.setAll({
      fill: '#ffffff',
    });

    tooltip.get('background').setAll({
      fill: '#423f4a',
      fillOpacity: 0.6,
      stroke: '#423f4a',
      padding: '5',
    });

    //root.defaultTheme.rule('ColorSet').set('colors', 'red');
    // 툴팁 텍스트

    series.nodes.template.set('tooltipText', '{category}');
    // 선 굵기 색은 안 바뀜
    series.links.template.setAll({
      strokeWidth: 2,
      strokeOpacity: 0.5,
      color: 'red',
      links: 'red',
      link: 'red',
      fill: 'red',
      strokeColor: 'red',
      background: 'red',
      backgroundColor: 'red',
      stroke: am5.color('#ffffff'),
      templateField: 'nodeSettings',
      configField: {
        fill: 'red',
        stroke: 'red',
        strokeColor: 'red',
      },
      strokeLinejoin: 'round',
      distance: 1.5, // 선의 길이
    });

    series.set('selectedDataItem', series.dataItems[0]);
    series.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, [networkData]);

  return (
    <div
      id={'chartdiv2'}
      style={{
        width: '100%',
        height: '100%',
      }}
    ></div>
  );
}

export default NewProjectNetwork;
