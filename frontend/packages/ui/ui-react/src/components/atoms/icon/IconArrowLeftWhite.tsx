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
      d='M16.17 4.455c.44.439.44 1.151 0 1.59L10.216 12l5.955 5.954a1.125 1.125 0 0 1-1.591 1.591l-6.75-6.75a1.125 1.125 0 0 1 0-1.59l6.75-6.75a1.123 1.123 0 0 1 1.59 0z'
      fill='#ffffff'
    />
  </svg>
);

export default SvgComponent;
