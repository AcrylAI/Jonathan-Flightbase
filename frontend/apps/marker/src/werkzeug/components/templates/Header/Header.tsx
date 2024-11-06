import { Logo } from '@src/werkzeug/components/atoms';
import { Processor } from '@src/werkzeug/components/molecules';
import { ToolVendor } from '@src/werkzeug/components/organisms';
import useFileStatus from '@src/werkzeug/hooks/common/useFileStatus';

import classNames from 'classnames/bind';
import styles from './Header.module.scss';
const cx = classNames.bind(styles);

function Header() {
  const { isViewer } = useFileStatus();

  return (
    <header className={cx('Header')}>
      <Logo />
      <ToolVendor />
      {!isViewer ? <Processor /> : null}
    </header>
  );
}

export default Header;
