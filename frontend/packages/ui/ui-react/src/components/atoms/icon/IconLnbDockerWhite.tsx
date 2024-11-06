import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M4 4h14v17H4V4z'
      stroke='#fff'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M7 8h8m-8 4h8m-8 4h5' stroke='#fff' strokeLinecap='round' />
    <path
      d='M18.375 16H21v4c0 .333-.15 1-.75 1H18'
      stroke='#fff'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path fill='#fff' d='M4 4h14v17H4z' />
    <path d='M7 8h8m-8 4h8m-8 4h5' stroke='#2D76F8' strokeLinecap='round' />
    <path d='M18 16h3v5h-3v-5z' fill='#2D76F8' />
    <path
      d='M4 4h14v17H4V4zm14.375 12H21v4c0 .333-.15 1-.75 1H18'
      stroke='#fff'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
export default SvgComponent;
