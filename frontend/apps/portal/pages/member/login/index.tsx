import { GetServerSideProps } from 'next';

// Components
import Footer from '@src/components/common/Footer/Footer';
import Header from '@src/components/common/Header/Header';
import Login from '@src/components/Member';
import Logo from '@src/components/Member/common/Logo/Logo';

// Style
import styles from '../member.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MemberLogin() {
  return (
    <div className={cx('member')}>
      <Header />
      <Logo />
      <div className={cx('member__content')}>
        <Login />
      </div>
      <Footer />
    </div>
  );
}
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
export default MemberLogin;
