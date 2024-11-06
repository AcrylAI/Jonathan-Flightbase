import { theme } from '@src/utils';

import icon from '@src/static/images/icons/00-ic-basic-filter-white.svg';

import './Button.scss';

function Button({ type, theme: t }) {
  if (type === 'size') {
    if (t === theme.DARK_THEME) {
      return `
        <button class="jp btn primary large ${theme.DARK_THEME}">Large</button>
        <button class="jp btn primary medium ${theme.DARK_THEME}">Medium</button>
        <button class="jp btn primary small ${theme.DARK_THEME}">Small</button>
        <button class="jp btn primary x-small ${theme.DARK_THEME}">XSmall</button>
      `;
    }

    return `
      <button class="jp btn primary large">Large</button>
      <button class="jp btn primary medium">Medium</button>
      <button class="jp btn primary small">Small</button>
      <button class="jp btn primary x-small">XSmall</button>
    `;
  }

  if (type === 'loading') {
    if (t === theme.DARK_THEME) {
      return `
        <button class="jp btn primary medium loading ${theme.DARK_THEME}">Primary</button> 
        <button class="jp btn primary-reverse medium loading ${theme.DARK_THEME}">Primary Reverse</button>
        <button class="jp btn red medium loading ${theme.DARK_THEME}">Red</button>
        <button class="jp btn none-border medium loading ${theme.DARK_THEME}">None Border</button>
      `;
    }

    return `
      <button class="jp btn primary medium loading">Primary</button>
      <button class="jp btn primary-reverse medium loading">Primary Reverse</button>
      <button class="jp btn primary-light medium loading">Primary Light</button>
      <button class="jp btn red medium loading">Red</button>
      <button class="jp btn red-reverse medium loading">Red Reverse</button>
      <button class="jp btn red-light medium loading">Red Light</button>
      <button class="jp btn secondary medium loading">Secondary</button>
      <button class="jp btn gray medium loading">Gray</button>
      <button class="jp btn none-border medium loading">None Border</button>
    `;
  }

  if (type === 'icon') {
    if (t === theme.DARK_THEME) {
      return `
        <button class="jp btn primary medium icon-left ${theme.DARK_THEME}"><img class="icon" src="${icon}" />Left Icon</button>
        <button class="jp btn primary medium icon-right ${theme.DARK_THEME}">Right Icon<img class="icon" src="${icon}" /></button>
        <button class="jp btn primary medium padding-none ${theme.DARK_THEME}"><img class="icon" src="${icon}" /></button>
      `;
    }

    return `
      <button class="jp btn primary medium icon-left"><img class="icon" src="${icon}" />Left Icon</button>
      <button class="jp btn primary medium icon-right">Right Icon<img class="icon" src="${icon}" /></button>
      <button class="jp btn primary medium padding-none"><img class="icon" src="${icon}" /></button>
    `;
  }

  if (t === theme.DARK_THEME) {
    return `
      <button class="jp btn primary medium ${theme.DARK_THEME}">Primary</button> 
      <button class="jp btn primary-reverse medium ${theme.DARK_THEME}">Primary Reverse</button>
      <button class="jp btn red medium ${theme.DARK_THEME}">Red</button>
      <button class="jp btn none-border medium ${theme.DARK_THEME}">None Border</button>
    `;
  }

  return `
    <button class="jp btn primary medium">Primary</button>
    <button class="jp btn primary-reverse medium">Primary Reverse</button>
    <button class="jp btn primary-light medium">Primary Light</button>
    <button class="jp btn red medium">Red</button>
    <button class="jp btn red-reverse medium">Red Reverse</button>
    <button class="jp btn red-light medium">Red Light</button>
    <button class="jp btn secondary medium">Secondary</button>
    <button class="jp btn gray medium">Gray</button>
    <button class="jp btn none-border medium">None Border</button>
  `;
}

export default Button;
