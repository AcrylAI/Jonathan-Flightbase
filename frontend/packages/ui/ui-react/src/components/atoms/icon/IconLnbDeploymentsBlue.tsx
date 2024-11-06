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
      d='M4 3h16v18H4V3z'
      fill='#2D76F8'
      stroke='#2D76F8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 12h10m-3-3 3 3-3 3'
      stroke='#FBFCFF'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
export default SvgComponent;
