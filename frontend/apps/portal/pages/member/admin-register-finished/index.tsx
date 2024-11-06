import { GetServerSideProps } from 'next';

// Components
import Header from '@src/components/common/Header/Header';
import Footer from '@src/components/common/Footer/Footer';
import Logo from '@src/components/Member/common/Logo/Logo';
import AdminRegisterFinished from '@src/components/Member/AdminRegisterFinished';

// Style
import styles from '../member.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MemberRegisterFinished() {
  return (
    <div className={cx('member')}>
      <Header />
      <Logo />
      <div className={cx('member__content')}>
        <AdminRegisterFinished />
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
export default MemberRegisterFinished;
