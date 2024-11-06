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
      d='M18 3v9l-3 9H4V3h14z'
      fill='#2D76F8'
      stroke='#2D76F8'
      strokeLinejoin='round'
    />
    <circle cx={15} cy={16} r={5.5} fill='#FBFCFF' stroke='#2D76F8' />
    <path d='M15 15v4m0-6v.5' stroke='#2D76F8' strokeLinecap='round' />
  </svg>
);
export default SvgComponent;
