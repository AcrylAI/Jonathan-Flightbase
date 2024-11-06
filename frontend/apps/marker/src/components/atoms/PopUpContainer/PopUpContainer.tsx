import styled from 'styled-components';

const PopUpContainer = styled.div<{
  width?: number;
  height?: number;
  left?: number;
  right?: number;
}>`
  border-radius: 4px;
  z-index: 4;
  position: absolute;
  top: 58px;
  left: ${({ left }) => (left ? `${left}px` : 'none')};
  right: ${({ right }) => (right ? `${right}px` : 'none')};
  box-shadow: 0 3px 9px 0 rgba(18, 22, 25, 0.08),
    0 2px 4px 1px rgba(18, 22, 25, 0.14);
  background-color: #fff;
  width: ${({ width }) => (width ? `${width}px` : '100px')};
  height: ${({ height }) => (height ? `${height}px` : '70px')};
  padding: 24px 24px 12px;
  box-sizing: border-box;
`;

export default PopUpContainer;
