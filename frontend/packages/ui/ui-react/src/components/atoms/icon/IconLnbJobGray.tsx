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
      d='M12 3 2 7.5 12 12l10-4.5L12 3z'
      fill='#747474'
      stroke='#747474'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='m2 12 10 5 10-5'
      stroke='#747474'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='m2 16 10 5 10-5'
      stroke='#747474'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
export default SvgComponent;

