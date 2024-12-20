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
      d='M19.2 3H4.8C3.806 3 3 3.784 3 4.75v3.5C3 9.216 3.806 10 4.8 10h14.4c.994 0 1.8-.784 1.8-1.75v-3.5C21 3.784 20.194 3 19.2 3zm0 11H4.8c-.994 0-1.8.784-1.8 1.75v3.5c0 .966.806 1.75 1.8 1.75h14.4c.994 0 1.8-.784 1.8-1.75v-3.5c0-.966-.806-1.75-1.8-1.75z'
      fill='#747474'
    />
    <circle cx={6.5} cy={6.5} r={0.5} fill='#F4F6FA' />
    <circle cx={6.5} cy={17.5} r={0.5} fill='#F4F6FA' />
  </svg>
);
export default SvgComponent;
