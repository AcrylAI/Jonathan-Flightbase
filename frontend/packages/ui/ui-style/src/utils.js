function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const theme = {
  PRIMARY_THEME: 'jp-primary',
  DARK_THEME: 'jp-dark',
};

export { htmlEntities, theme };
