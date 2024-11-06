import { MouseEventHandler } from 'react';

export interface UiButtonModels {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text: string;
  disable?: boolean;
  type: 'success' | 'success-lg' | 'basic' | 'fail';
}
