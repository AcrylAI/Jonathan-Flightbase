import React from 'react';
import type { FCWithImplicitChildren } from './types';

/**
 * Renders a React component while also checking whether the children are a function or not
 * @param props Props of the component to render
 */
export const render: FCWithImplicitChildren = (props) => {
  if (typeof props.children === 'function') {
    return <>{props.children()}</>;
  }

  return <>{props.children || null}</>;
};
