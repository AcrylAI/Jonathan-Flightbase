import type { CSSProperties, ReactNode } from 'react';

import type {
  NUMERIC_FALSE_TYPE,
  NUMERIC_TRUE_TYPE,
} from '@tools/types/literal';

export type CommonFunction = (...args: never) => void;

/**
 *
 */
export type NumericBooleanType =
  | typeof NUMERIC_FALSE_TYPE
  | typeof NUMERIC_TRUE_TYPE;

/**
 * 각 컴포넌트에서 사용하는 공통 속성 타입
 */
export interface CommonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * 각 컴포넌트에서 사용하는 이벤트 속성 타입
 */
export interface EventProps {
  onClick?: CommonFunction;
  onMouseOver?: CommonFunction;
}

/**
 * 각 컴포넌트에서 사용하는 입력 속성 타입
 */
export interface InputProps<T = unknown> {
  defaultValue?: T;
  value?: T;
  onChange?: (...args: T[]) => void;
  disabled?: boolean;
  selected?: boolean;
  required?: boolean;
  label?: ReactNode;
}

/**
 * setState에 대한 타입 정의
 */
export type SetState<T> = (value: T | ((prev: T) => T)) => void;

/**
 * 4방향을 지칭하는 타입
 */
export type FourCardinalPoints = 'e' | 'w' | 's' | 'n';

/**
 * 기본 지원 컬러에 대한 정의
 */
export type ColorPickSet =
  | '#ffab31'
  | '#00c775'
  | '#3babff'
  | '#ff00d6'
  | '#ad00ff'
  | '#463eb7'
  | '#1aa090'
  | '#dcc13a' // 추가됨
  | '#8a6351' // 추가됨
  | '#6633ff' // 추가됨
  | '#6666cc' // 추가됨
  | '#02c8d5' // 추가됨
  | '#660066' // 추가됨
  | '#660000' // 추가됨
  | '#fa4e57' // 이슈랑 중복됨
  | '#ffea53' // 저시인성
  | '#ffd3e3' // 저시인성
  | '#00ffff' // 저시인성
  | '#00ffc2' // 저시인성
  | '#14ff00' // 저시인성
  | '#ebff00' // 저시인성
  | string;
