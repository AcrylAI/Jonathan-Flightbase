// CSS Modules
import React from 'react';

import styled from 'styled-components';

type Props = {
  children: React.ReactNode;
  width?: string;
  height?: string;
  borderRadius?: number;
  backgroundColor?: string;
  margin?: number;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  border?: string;
  hoverBorder?: string;
  hoverBackgroundColor?: string;
  hoverShadow?: string;
  padding?: string;
  cursor?: string;
  boxShadow?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCardClick?: (projectId: number) => void;
  projectId?: number;
};

const CardBox = ({
  children,
  width,
  height,
  borderRadius,
  backgroundColor,
  margin,
  flexDirection,
  justifyContent,
  alignItems,
  border,
  hoverBorder,
  hoverBackgroundColor,
  onClick,
  onCardClick,
  hoverShadow,
  padding,
  cursor,
  boxShadow,
  projectId,
}: Props) => {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick !== undefined) onClick(e);

    if (onCardClick !== undefined) {
      if (projectId !== undefined && projectId > 0) onCardClick(projectId);
    }
  };
  return (
    <CardBoxContainer
      onClick={handleCardClick}
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      margin={margin}
      flexDirection={flexDirection}
      justifyContent={justifyContent}
      alignItems={alignItems}
      border={border}
      hoverBorder={hoverBorder}
      hoverBackgroundColor={hoverBackgroundColor}
      hoverShadow={hoverShadow}
      padding={padding}
      cursor={cursor}
      boxShadow={boxShadow}
    >
      {children}
    </CardBoxContainer>
  );
};

const CardBoxContainer = styled.div<{
  width?: string;
  height?: string;
  borderRadius?: number;
  backgroundColor?: string;
  margin?: number;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  border?: string;
  hoverBorder?: string;
  hoverBackgroundColor?: string;
  hoverShadow?: string;
  padding?: string;
  cursor?: string;
  boxShadow?: string;
}>`
  width: ${({ width }) => (width ? `${width}` : '100%')};
  height: ${({ height }) => (height ? `${height}` : '100%')};
  border-radius: ${({ borderRadius }) =>
    borderRadius ? `${borderRadius}px` : '10px'};
  background-color: ${({ backgroundColor }) =>
    backgroundColor ? `${backgroundColor}` : ''};
  margin: ${({ margin }) => (margin ? `${margin}px` : '0px')};
  display: flex;
  flex-direction: ${({ flexDirection }) =>
    flexDirection ? `${flexDirection}` : 'column'};
  justify-content: ${({ justifyContent }) =>
    justifyContent ? `${justifyContent}` : 'center'};
  align-items: ${({ alignItems }) => (alignItems ? `${alignItems}` : 'center')};
  border: ${({ border }) => (border ? `${border}` : '')};
  &:hover {
    ${({ hoverBorder }) => (hoverBorder ? `border: ${hoverBorder}` : '')};
    ${({ hoverBackgroundColor }) =>
      hoverBackgroundColor ? `background-color: ${hoverBackgroundColor}` : ''};
    ${({ hoverShadow }) => (hoverShadow ? `box-shadow: ${hoverShadow}` : '')};
  }
  padding: ${({ padding }) => (padding ? `${padding}` : '0')};
  cursor: ${({ cursor }) => (cursor ? `${cursor}` : 'pointer')};
  box-shadow: ${({ boxShadow }) => (boxShadow ? `${boxShadow}` : '')};
`;

CardBox.defaultProps = {
  width: '100%',
  height: '100%',
  borderRadius: 10,
  backgroundColor: '#fff',
  margin: 0,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  border: '',
  hoverBorder: '',
  hoverBackgroundColor: '',
  padding: '',
  cursor: '',
  hoverShadow: '',
  boxShadow: '',
  onCardClick: (projectId: number) => {},
  onClick: (e: React.MouseEvent<HTMLDivElement>) => {},
  projectId: '',
};

export default CardBox;
