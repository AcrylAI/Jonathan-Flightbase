import { theme } from '@src/utils';

import './InputNumber.scss';

import upIcon from '@src/static/images/icons/up.png';
import downIcon from '@src/static/images/icons/down.png';

function InputNumber({ type, theme: t }) {
  if (type === 'size') {
    if (t === theme.DARK_THEME) {
      return `
        <div class="jp input-number large ${theme.DARK_THEME} disableIcon">
          <input type="number" pattern="[0-9]*" disabled value="100" />
        </div>
        <div class="jp input-number medium ${theme.DARK_THEME} disableIcon">
          <input type="number" pattern="[0-9]*" disabled value="100" />
        </div>
        <div class="jp input-number small ${theme.DARK_THEME} disableIcon">
          <input type="number" pattern="[0-9]*" disabled value="100" />
        </div>
        <div class="jp input-number x-small ${theme.DARK_THEME} disableIcon">
          <input type="number" pattern="[0-9]*" disabled value="100" />
        </div>
      `;
    }

    return `
      <div class="jp input-number large">
        <input type="number" pattern="[0-9]*" placeholder="placeholder" />
        <div class="btn-box">
          <button class="up-btn">
            <img src="${upIcon}" alt="up-icon"></img>
          </button>
          <button class="down-btn">
            <img src="${downIcon}" alt="down-icon"></img>
          </button>
        </div>
      </div>
      <div class="jp input-number medium">
        <input type="number" pattern="[0-9]*" placeholder="placeholder" />
        <div class="btn-box">
          <button class="up-btn">
            <img src="${upIcon}" alt="up-icon"></img>
          </button>
          <button class="down-btn">
            <img src="${downIcon}" alt="down-icon"></img>
          </button>
        </div>
      </div>
      <div class="jp input-number small">
        <input type="number" pattern="[0-9]*" placeholder="placeholder" />
        <div class="btn-box">
          <button class="up-btn">
            <img src="${upIcon}" alt="up-icon"></img>
          </button>
          <button class="down-btn">
            <img src="${downIcon}" alt="down-icon"></img>
          </button>
        </div>
      </div>
      <div class="jp input-number x-small">
        <input type="number" pattern="[0-9]*" placeholder="placeholder" />
        <div class="btn-box">
          <button class="up-btn">
            <img src="${upIcon}" alt="up-icon"></img>
          </button>
          <button class="down-btn">
            <img src="${downIcon}" alt="down-icon"></img>
          </button>
        </div>
      </div>
    `;
  }

  if (t === theme.DARK_THEME) {
    return `
      <div class="jp input-number large ${theme.DARK_THEME} disableIcon">
        <input type="number" pattern="[0-9]*" disabled value="100" />
      </div>
    `;
  }

  return `
    <div class="jp input-number medium">
      <input type="number" pattern="[0-9]*" placeholder="placeholder" />
      <div class="btn-box">
        <button class="up-btn">
          <img src="${upIcon}" alt="up-icon"></img>
        </button>
        <button class="down-btn">
          <img src="${downIcon}" alt="down-icon"></img>
        </button>
      </div>
    </div>
    <div class="jp input-number medium error">
      <input type="number" pattern="[0-9]*" placeholder="placeholder" />
      <div class="btn-box">
        <button class="up-btn">
          <img src="${upIcon}" alt="up-icon"></img>
        </button>
        <button class="down-btn">
          <img src="${downIcon}" alt="down-icon"></img>
        </button>
      </div>
    </div>
    <div class="jp input-number medium">
      <input type="number" pattern="[0-9]*" readonly value="100" />
      <div class="btn-box">
        <button class="up-btn">
          <img src="${upIcon}" alt="up-icon"></img>
        </button>
        <button class="down-btn">
          <img src="${downIcon}" alt="down-icon"></img>
        </button>
      </div>
    </div>
    <div class="jp input-number medium">
      <input type="number" pattern="[0-9]*" disabled value="100" />
      <div class="btn-box">
        <button class="up-btn">
          <img src="${upIcon}" alt="up-icon"></img>
        </button>
        <button class="down-btn">
          <img src="${downIcon}" alt="down-icon"></img>
        </button>
      </div>
    </div>
  `;
}

export default InputNumber;
