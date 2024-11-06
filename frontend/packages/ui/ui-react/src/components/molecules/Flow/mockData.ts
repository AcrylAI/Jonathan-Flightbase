import { FlowData } from './types';
export const mockData: FlowData = {
  broadcastingStageStatus: 2,
  aggregationStatus: 3,
  trainingStageStatus: 2,
  stageFailReason: '오류 이유 입니다.',
  // metrics: [
  //   {
  //     key: 'top1_acc',
  //     value: 4.2,
  //     change_direction: 'same',
  //     change_amount: 0.0,
  //   },
  //   {
  //     key: 'top5_acc',
  //     value: 20.44,
  //     change_direction: 'higher',
  //     change_amount: 0.44,
  //   },
  //   {
  //     key: 'top5_acc',
  //     value: 20.44,
  //     change_direction: 'higher',
  //     change_amount: 0.44,
  //   },
  //   {
  //     key: 'top5_acc',
  //     value: 20.44,
  //     change_direction: 'higher',
  //     change_amount: 0.44,
  //   },
  // ],
  data: [
    {
      trainingStatus: 1,
      clientName: 'FL_CLIENT1',
      metrics: null,
      testStatus: 0,
      broadcastingStatus: 2,
    },
    {
      trainingStatus: 2,
      clientName: 'FL_CLIENT2',
      metrics: '39.45',
      testStatus: 2,
      broadcastingStatus: null,
    },
  ],
  // globalModelData: [
  //   {
  //     metric: 'accuracy',
  //     seedModel: 101,
  //     resultModel: 102,
  //     change_direction: 'same',
  //   },
  //   {
  //     metric: 'loss',
  //     seedModel: 101,
  //     resultModel: 102,
  //     change_direction: 'higher',
  //   },
  //   {
  //     metric: 'cc',
  //     seedModel: 101,
  //     resultModel: 102,
  //     change_direction: 'low',
  //   },
  //   {
  //     metric: 'ww',
  //     seedModel: 101,
  //     resultModel: 102,
  //     change_direction: 'low',
  //   },
  //   {
  //     metric: 'xxx',
  //     seedModel: 101,
  //     resultModel: 102,
  //     change_direction: 'low',
  //   },
  // ],
};
