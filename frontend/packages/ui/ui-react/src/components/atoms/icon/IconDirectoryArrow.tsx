import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={48}
    height={48}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <mask
      id='prefix__a'
      style={{
        maskType: 'alpha',
      }}
      maskUnits='userSpaceOnUse'
      x={10}
      y={12}
      width={28}
      height={24}
    >
      <path
        d='M10.68 20.68 19 12.32l8.32 8.36-2.343 2.343-4.297-4.296V32.32h16.64v3.36h-20V18.727l-4.297 4.296-2.343-2.343Z'
        fill='#fff'
      />
    </mask>
    <g mask='url(#prefix__a)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M48 48V0H0v48h48Z'
        fill='#747474'
      />
    </g>
  </svg>
);
export default SvgComponent;

