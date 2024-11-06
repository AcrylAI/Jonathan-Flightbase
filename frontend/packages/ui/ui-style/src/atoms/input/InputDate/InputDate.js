import { theme } from '@src/utils';

import './InputDate.scss';

function InputDate({ type, theme: t }) {
  if (t === theme.DARK_THEME) return '';

  if (type === 'size') {
    return `
      <div class="jp input-date large"><input type="date" placeholder="placeholder" /></div>
      <div class="jp input-date medium"><input type="date" placeholder="placeholder" /></div>
      <div class="jp input-date small"><input type="date" placeholder="placeholder" /></div>
      <div class="jp input-date x-small"><input type="date" placeholder="placeholder" /></div>
    `;
  }

  return `
    <div class="jp input-date medium"><input type="date" placeholder="yyyy-mm-dd" /></div>
    <div class="jp input-date medium error"><input type="date" /></div>
    <div class="jp input-date medium"><input type="date" readonly /></div>
    <div class="jp input-date medium"><input type="date" disabled /></div>
  `;
}

export default InputDate;
