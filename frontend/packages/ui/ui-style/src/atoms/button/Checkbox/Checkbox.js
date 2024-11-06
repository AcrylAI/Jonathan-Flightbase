import { theme } from '@src/utils';

import './Checkbox.scss';

function Checkbox({ theme: t }) {
  if (t === theme.DARK_THEME) {
    return `
      <div class="jp checkbox"><label class='check-container'><input type="checkbox" ></input><span class='checkmark ${theme.DARK_THEME}'></span></label></div>
      <div class="jp checkbox"><label class='check-container'><input type="checkbox" checked ></input><span class='checkmark ${theme.DARK_THEME}'></span></label></div>
      <div class="jp checkbox"><label class='check-container'><input type="checkbox" disabled></input><span class='checkmark ${theme.DARK_THEME}'></span></label></div>
      <div class="jp checkbox"><label class='check-container'><input type="checkbox" checked disabled></input><span class='checkmark ${theme.DARK_THEME}'></span></label></div>
    `;
  }

  return `
    <div class="jp checkbox"><label class='check-container'><input type="checkbox"></input><span class='checkmark'></span></label></div>
    <div class="jp checkbox"><label class='check-container'><input type="checkbox" checked></input><span class='checkmark'></span></label></div>
    <div class="jp checkbox"><label class='check-container'><input type="checkbox" disabled></input><span class='checkmark'></span></label></div>
    <div class="jp checkbox"><label class='check-container'><input type="checkbox" checked disabled></input><span class='checkmark'></span></label></div>
  `;
}

export default Checkbox;
