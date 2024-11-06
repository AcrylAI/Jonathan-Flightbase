import i18n from 'react-i18next';

import { Properties as CSSProperties } from 'csstype';

import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './Emptybox.module.scss';
const cx = classNames.bind(style);

type Props = {
  isBox?: boolean;
  customStyle?: CSSProperties;
  text?: string;
  theme?: ThemeType;
  t?: i18n.TFunction<'translation'>;
};

function Emptybox({ isBox, customStyle, theme, text = 'No Data', t }: Props) {
  return (
    <div className={cx('no-data', isBox && 'box', theme)} style={customStyle}>
      {t ? t(text) : text}
    </div>
  );
}

Emptybox.defaultProps = {
  isBox: false,
  customStyle: undefined,
  text: '',
  theme: theme.PRIMARY_THEME,
  t: undefined,
};

export default Emptybox;
