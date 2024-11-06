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
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.74 6a1.74 1.74 0 1 0 0 3.478h2.827l-3.69 6.394a1.74 1.74 0 1 0 3.011 1.739l1.181-2.046h9.916l1.181 2.046a1.74 1.74 0 1 0 3.012-1.739l-3.691-6.394h2.774a1.74 1.74 0 1 0 0-3.478H3.739zm9.73 3.478h-2.886l-1.506 2.609h5.899L13.47 9.478z'
      fill='#747474'
    />
  </svg>
);
export default SvgComponent;

