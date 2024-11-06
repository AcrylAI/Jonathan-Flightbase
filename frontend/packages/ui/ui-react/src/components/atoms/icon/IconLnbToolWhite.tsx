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
      d='m21 16-4 4H9V4h12v12zM4.5 20 3 17V4h3v13l-1.5 3z'
      fill='#fff'
      stroke='#fff'
      strokeLinejoin='round'
    />
    <path
      d='M6 7H3V4h3v3zm11 9h4l-4 4v-4z'
      fill='#2D76F8'
      stroke='#fff'
      strokeLinejoin='round'
    />
  </svg>
);
export default SvgComponent;
