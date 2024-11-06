import { forwardRef } from 'react';

import HeaderLeft from './HeaderLeft';
import HeaderRight from './HeaderRight';

import style from './Header.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const Header = forwardRef<HTMLDivElement>((_, sideButtonRef) => {
  return (
    <div className={cx('header-bg')}>
      <HeaderLeft ref={sideButtonRef} />
      <HeaderRight />
    </div>
  );
});

export default Header;
