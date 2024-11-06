import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={12}
    height={12}
    {...props}
  >
    <defs>
      <path
        id='prefix__a'
        d='m7.531 10 .585-.575-3.553-3.386 3.562-3.387-.584-.566-4.166 3.953z'
      />
    </defs>
    <g fill='none' fillRule='evenodd'>
      <path d='M0 0h12v12H0z' opacity={0.2} />
      <mask id='prefix__b' fill='#fff'>
        <use xlinkHref='#prefix__a' />
      </mask>
      <path fill='#747474' d='M0 0h12v12H0z' mask='url(#prefix__b)' />
    </g>
  </svg>
);
export default SvgComponent;

