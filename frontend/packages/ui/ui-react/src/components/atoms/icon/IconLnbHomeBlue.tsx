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
    <path d='m12 2.5-7 7V21h14V9.5l-7-7z' fill='#2D76F8' />
    <path
      d='M2.5 11.5 12 2.499l9.5 9'
      stroke='#2D76F8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5 9.5V21h14V9.5'
      stroke='#2D76F8'
      strokeLinecap='square'
      strokeLinejoin='round'
    />
    <path fill='#FBFCFF' d='M5 17h14v4H5z' />
    <path
      d='M5 9.5V21h14V9.5'
      stroke='#2D76F8'
      strokeLinecap='square'
      strokeLinejoin='round'
    />
    <path d='M5 17h14' stroke='#2D76F8' strokeLinecap='round' />
  </svg>
);
export default SvgComponent;
