import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={48}
    height={48}
    {...props}
  >
    <defs>
      <path
        id='prefix__a'
        d='m24 31 10-11.68h-6.68v-10h-6.64v10H14L24 31zm13.32 6.68V31H34v3.32H14V31h-3.32v6.68h26.64z'
      />
    </defs>
    <g fill='none' fillRule='evenodd'>
      <path d='M0 0h48v48H0z' opacity={0.2} />
      <mask id='prefix__b' fill='#fff'>
        <use xlinkHref='#prefix__a' />
      </mask>
      <path fill='#fff' d='M0 0h48v48H0z' mask='url(#prefix__b)' />
    </g>
  </svg>
);
export default SvgComponent;

