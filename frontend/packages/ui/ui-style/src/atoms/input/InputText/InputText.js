import { theme } from '@src/utils';

import './InputText.scss';

function InputText({ theme: t }) {
  if (t === theme.DARK_THEME) {
    return `
      <div class="jp input medium ${theme.DARK_THEME}"><input type="text" placeholder="placeholder" /></div>
      <div class="jp input medium ${theme.DARK_THEME}"><input type="text" placeholder="placeholder" value="readOnly" readonly /></div>
    `;
  }

  return `
    <div class="jp input medium"><input type="text" placeholder="placeholder" /></div>
    <div class="jp input medium error"><input type="text" placeholder="placeholder" /></div>
    <div class="jp input medium"><input type="text" placeholder="placeholder" value="readOnly" readonly /></div>
    <div class="jp input medium"><input type="text" placeholder="placeholder" value="disabled" disabled /></div>
  `;
}

export default InputText;
