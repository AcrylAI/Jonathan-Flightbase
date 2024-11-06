import { theme } from '@src/utils';

import './Textarea.scss';

function Textarea({ type, theme: t }) {
  if (t === theme.DARK_THEME) {
    return '';
  }

  if (type === 'size') {
    return `
      <div class="jp textarea large"><textarea placeholder="placeholder"></textarea></div>
      <div class="jp textarea medium"><textarea placeholder="placeholder"></textarea></div>
      <div class="jp textarea small"><textarea placeholder="placeholder"></textarea></div>
      <div class="jp textarea x-small"><textarea placeholder="placeholder"></textarea></div>
    `;
  }

  return `
    <div class="jp textarea medium"><textarea placeholder="placeholder"></textarea></div>
    <div class="jp textarea medium error"><textarea placeholder="placeholder"></textarea></div>
    <div class="jp textarea medium"><textarea readonly="true">readonly</textarea></div>
    <div class="jp textarea medium"><textarea disabled="true">disabled</textarea></div>
  `;
}

export default Textarea;
