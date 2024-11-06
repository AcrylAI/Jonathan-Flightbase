import { useDocument } from '@react';

import { theme } from '@src/utils';

import './Radio.scss';

function Radio({ theme: t }) {
  useDocument(() => {
    const radioFirst = document.getElementById('input-radio1');
    const radioSecond = document.getElementById('input-radio2');

    radioFirst.checked = false;
    radioSecond.checked = true;

    const onClickFirst = () => {
      radioFirst.checked = !radioFirst.checked;
    };

    const onClickSecond = () => {
      radioSecond.checked = !radioSecond.checked;
    };

    radioFirst.addEventListener('RadioStateChange', onClickFirst);
    radioSecond.addEventListener('RadioStateChange', onClickSecond);

    return () => {
      radioFirst.removeEventListener('RadioStateChange', onClickFirst);
      radioSecond.removeEventListener('RadioStateChange', onClickSecond);
    };
  });

  if (t === theme.DARK_THEME) {
    return `
      <div class="jp radio">
        <ul>
          <li><input class="${theme.DARK_THEME}" type="radio" name="dark-radio" id="input-radio1"></input></li>
          <li><input class="${theme.DARK_THEME}" type="radio" name="dark-radio" checked id="input-radio2"></input></li>
          <li><input class="${theme.DARK_THEME}" type="radio" disabled></input></li>
          <li><input class="${theme.DARK_THEME}" type="radio" checked disabled></input></li>
        </ul>
      </div>
    `;
  }

  return `
    <div class="jp radio">
      <ul>
        <li><input type="radio" name="radio" id="input-radio1"></input></li>
        <li><input type="radio" name="radio" id="input-radio2" checked></input></li>
        <li><input type="radio" disabled></input></li>
        <li><input type="radio" checked disabled></input></li>
      </ul>
    </div>
  `;
}

export default Radio;
