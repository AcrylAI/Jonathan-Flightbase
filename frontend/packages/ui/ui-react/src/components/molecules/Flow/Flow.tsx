import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Controls, Node, Edge } from 'react-flow-renderer';
import MainNode from './MainNode';
import CustomNode from './CustomNode';
import './index.css';
import { NodeDataValue, NodeData } from './types';

const nodeTypes = {
  customNode: CustomNode,
  mainNode: MainNode,
};

const LEFT = 'left';
const RIGHT = 'right';

const DARK_MONO = '#5F5F5F';
const DARK_BLUE = '#2D76F8';
const DARK_LIME = '#27D478';

function Flow({
  data,
  width,
  height,
  metricLabel,
  seedModelLabel,
  resultModelLabel,
}: any): JSX.Element {
  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();
  const {
    broadcastingStageStatus,
    trainingStageStatus,
    globalModelData,
    aggregationStatus,
    metrics,
    stageFailReason,
  } = data;

  const createEdge = useCallback(
    (nodeArray: NodeData[]) => {
      const edgeArray: any[] = [];
      nodeArray.forEach((data: NodeData, index: number) => {
        let nodeLineColor: string = '';
        let animatedState: boolean = false;
        const lineColorCheckData =
          data.sourcePosition === LEFT
            ? trainingStageStatus
            : broadcastingStageStatus;

        if (lineColorCheckData === 0) {
          nodeLineColor = DARK_MONO;
          animatedState = false;
        } else if (lineColorCheckData === 1) {
          nodeLineColor = DARK_BLUE;
          animatedState = true;
        } else if (lineColorCheckData === 2) {
          nodeLineColor = DARK_LIME;
          animatedState = false;
        }
        const edge = {
          id: `edge${index}`,
          source: data.sourcePosition === LEFT ? data.id : 'mainNode',
          target: data.sourcePosition === LEFT ? 'mainNode' : data.id,
          style: { stroke: nodeLineColor, strokeWidth: 3 },
          type: 'smoothstep',
          className: 'smoothstep edge',
          animated: animatedState,
        };
        edgeArray.push(edge);
      });
      setEdges(edgeArray);
    },
    [broadcastingStageStatus, trainingStageStatus],
  );

  const createNode = useCallback(() => {
    const dataValues: any[] = data.data;
    const nodeArray: any[] = [];
    let rightX: number = 610;
    const leftX: number = 0;
    let y: number = 0;
    const SumData: number = 60;
    let mainNodeY = 0;

    // aggregation Node(mainNode) position
    if (data.metrics) {
      mainNodeY = -79;
      if (dataValues.length === 1) mainNodeY = -76.5;
      else if (dataValues.length === 2) mainNodeY = -47;
      else mainNodeY += (dataValues.length - 1) * 31;
    } else if (globalModelData) {
      // round Detail poistion
      rightX = 800;
      mainNodeY = -100;
      if (dataValues.length === 1) mainNodeY = -97;
      else if (dataValues.length === 2) mainNodeY = -65;
      else mainNodeY += (dataValues.length - 1) * 31;
    } else {
      if (dataValues.length === 1) mainNodeY = -14;
      else if (dataValues.length === 2) mainNodeY = 14;
      else mainNodeY = 11 + (dataValues.length - 2) * 30;
    }

    nodeArray.push({
      id: 'mainNode',
      type: 'mainNode',
      data: {
        type: LEFT,
        aggregationStatus,
        metrics,
        globalModelData,
        metricLabel,
        seedModelLabel,
        resultModelLabel,
        stageFailReason,
      },
      position: {
        x: 330,
        y: mainNodeY,
      },
    });
    dataValues.forEach((dataValue: NodeDataValue, index: number) => {
      const {
        trainingStatus,
        testStatus,
        metrics,
        broadcastingStatus,
      }: NodeDataValue = dataValue;
      const leftNode = {
        id: `leftNode${index}`,
        type: 'customNode',
        data: {
          dotPosition: RIGHT,
          clientName: dataValue.clientName,
          trainingStatus,
          testStatus,
          metrics,
        },
        position: { x: leftX, y },
        sourcePosition: LEFT,
      };
      const rightNode = {
        id: `rightNode${index}`,
        type: 'customNode',
        data: {
          dotPosition: LEFT,
          clientName: dataValue.clientName,
          broadcastingStatus,
        },
        position: { x: rightX, y },
        sourcePosition: RIGHT,
      };
      y += SumData;

      nodeArray.push(leftNode, rightNode);
    });

    setNodes(nodeArray);
    createEdge(nodeArray);
  }, [
    aggregationStatus,
    createEdge,
    data,
    globalModelData,
    metricLabel,
    metrics,
    resultModelLabel,
    seedModelLabel,
    stageFailReason,
  ]);

  useEffect(() => {
    createNode();
  }, [createNode]);
  return (
    <div
      style={{
        height,
        width,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        snapToGrid
        nodeTypes={nodeTypes}
        defaultZoom={1.5}
        maxZoom={1.4}
        minZoom={0.8}
        preventScrolling={false}
        fitView
        fitViewOptions={{
          includeHiddenNodes: false,
        }}
        zoomOnScroll={false}
        onlyRenderVisibleElements
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export default Flow;
