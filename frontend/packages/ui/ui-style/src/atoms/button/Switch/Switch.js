import { theme } from '@src/utils';

import './Switch.scss';

function Switch({ theme: t }) {
  if (t === theme.DARK_THEME) {
    return '';
  }

  return `
    <div class="jp switch"><label class="switch-container"><input type="checkbox" checked/><span></span></label></div>
    <div class="jp switch"><label class="switch-container"><input type="checkbox"/><span></span></label></div>
    <div class="jp switch"><label class="switch-container"><input type="checkbox" disabled/><span></span></label></div>
    <div class="jp switch"><label class="switch-container"><input type="checkbox" checked disabled/><span></span></label></div>
  `;
}

export default Switch;
