import { Properties as CSSProperties } from 'csstype';

// Icons
import loadingIcon from '@src/static/images/icons/spinner-1s-58.svg';

import classNames from 'classnames/bind';
import style from './Loading.module.scss';
const cx = classNames.bind(style);

type Props = {
  type?: 'primary' | 'circle';
  size?: 'small' | 'medium' | 'large';
  customStyle?: CSSProperties;
};

function Loading({ type, size, customStyle }: Props) {
  if (type === 'circle') {
    return (
      <div style={customStyle} className={cx('circle-loading', size)}></div>
    );
  }

  return (
    <div
      style={{
        ...customStyle,
        textAlign: 'center',
      }}
    >
      <img src={loadingIcon} alt='Loading...' />
    </div>
  );
}

Loading.defaultProps = {
  type: 'primary',
  size: 'small',
  customStyle: undefined,
};

export default Loading;
