import { theme } from '@src/utils';

import './InputPassword.scss';

function InputPassword({ theme: t }) {
  if (t === theme.DARK_THEME) {
    return `
      <div class="jp input medium ${theme.DARK_THEME}"><input type="password" placeholder="placeholder" /></div>
    `;
  }

  return `
    <div class="jp input medium"><input type="password" placeholder="placeholder" /></div>
    <div class="jp input medium error"><input type="password" placeholder="placeholder" /></div>
    <div class="jp input medium"><input type="password" placeholder="placeholder" value="readOnly" readonly /></div>
    <div class="jp input medium"><input type="password" placeholder="placeholder" value="disabled" disabled /></div>
  `;
}

export default InputPassword;
