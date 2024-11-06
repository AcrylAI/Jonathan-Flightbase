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
    <path fill='#fff' stroke='#fff' strokeLinejoin='round' d='M3 4h18v13H3z' />
    <path d='M12 17v3m-5 1h10' stroke='#fff' strokeLinecap='square' />
    <path d='M7 8h10M7 12h10' stroke='#2D76F8' strokeLinecap='round' />
  </svg>
);
export default SvgComponent;

