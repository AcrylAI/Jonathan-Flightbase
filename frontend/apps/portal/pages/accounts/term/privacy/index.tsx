import Link from 'next/link';
import Image from 'next/image';

// Components
import TermDoc from '@components/common/TermDoc';
import TermPage from '@components/Terms/components/TermPage';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Image
const Logo = '/Images/logo/BI_Jonathan.svg';

function AccountTermAccess() {
  return (
    <div className={cx('main')}>
      <div className={cx('main__content')}>
        <Link href='/' passHref>
          <Image src={Logo} alt='Jonathan' width={260} height={50.16} />
        </Link>
        <TermPage term={TermDoc[0]} />
      </div>
    </div>
  );
}
export default AccountTermAccess;
