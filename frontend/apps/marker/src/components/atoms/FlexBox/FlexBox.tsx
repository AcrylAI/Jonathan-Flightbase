import React from 'react';
import styled from 'styled-components';

type Vector =
  | 'center'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'left'
  | 'revert'
  | 'right'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

type Props = {
  direction?: 'row' | 'column';
  justify?: Vector;
  height?: number;
  width?: number;
  align?: Vector;
  children: React.ReactNode;
};

export default function FlexBox(props: Props) {
  return <Flex {...props}>{props.children}</Flex>;
}

FlexBox.defaultProps = {
  direction: 'row',
  justify: 'space-between',
  height: 0,
  width: 0,
  align: 'center',
};

const Flex = styled.div<Props>`
  display: flex;
  justify-content: ${({ justify }) => justify || 'inherit'};
  flex-direction: ${({ direction }) => direction || 'row'};
  height: ${({ height }) => `${height}px` || '100%'};
  width: ${({ width }) => `${width}px` || '100%'};
  align-items: ${({ align }) => `${align}` || 'inherit'};
`;
