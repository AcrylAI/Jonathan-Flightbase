import { Properties as CSSProperties } from 'csstype';

type RunningType =
  | 'running'
  | 'trainingRunning'
  | 'deploymentRunning'
  | 'active'
  | 'serviceActive'
  | 'ready'
  | 'attached'
  | 'connected'
  | 'complete'
  | 'green';
type PendingType =
  | 'pending'
  | 'reserved'
  | 'installing'
  | 'attaching'
  | 'yellow';
type DoneType = 'done' | 'stop' | 'detached' | 'disconnected' | 'gray';
type ErrorType = 'expired' | 'failed' | 'error' | 'red';
type UnknownType = 'unknown' | 'orange';
type InProgressType =
  | 'training'
  | 'aggregation'
  | 'broadcasting'
  | 'idle'
  | 'blue';

interface StatusCardArgs {
  text: string;
  status:
    | RunningType
    | PendingType
    | DoneType
    | ErrorType
    | UnknownType
    | InProgressType;
  size: 'x-small' | 'small' | 'medium' | 'large';
  type: 'help' | 'default';
  theme: ThemeType;
  isTooltip: boolean;
  customStyle?: CSSProperties;
  tooltipData?: {
    title?: string;
    description?: string;
  };
}

export {
  StatusCardArgs,
  RunningType,
  PendingType,
  DoneType,
  ErrorType,
  UnknownType,
  InProgressType,
};
