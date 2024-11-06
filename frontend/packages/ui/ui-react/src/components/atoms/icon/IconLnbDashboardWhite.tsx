import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={20}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M5 10.832H1.667c-.5 0-.834.333-.834.833v6.667c0 .5.334.833.834.833H5c.5 0 .833-.333.833-.833v-6.667c0-.5-.333-.833-.833-.833zm13.333-3.333H15c-.5 0-.833.333-.833.833v10c0 .5.333.833.833.833h3.333c.5 0 .834-.333.834-.833v-10c0-.5-.334-.833-.834-.833zM11.667.832H8.333c-.5 0-.833.333-.833.833v16.667c0 .5.333.833.833.833h3.334c.5 0 .833-.333.833-.833V1.665c0-.5-.333-.833-.833-.833z'
      fill='#fff'
    />
  </svg>
);
export default SvgComponent;

