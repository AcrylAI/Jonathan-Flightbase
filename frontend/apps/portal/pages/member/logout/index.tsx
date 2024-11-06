import { useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { signOut, useSession } from 'next-auth/react';

// shared
import { removeAccessTokens } from '@src/shared/functions';

// Components
import Footer from '@components/common/Footer/Footer';
import Header from '@components/common/Header/Header';

// Custom hooks
import useMemberLogout, {
  MemberLogoutRequestModel,
} from '@src/common/CustomHooks/Queries/Member/useMemberLogout';

// Style
import styles from '../member.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
export default function Logout() {
  const { data: session } = useSession();
  const memberLogoutMutation = useMemberLogout();

  const logout = useCallback(async () => {
    const body: MemberLogoutRequestModel = {
      user_id: session?.user.id ?? '',
    };
    await memberLogoutMutation.onMutateAsync({ body });
  }, [memberLogoutMutation, session?.user.id]);

  useEffect(() => {
    removeAccessTokens();
    logout();
    signOut({ redirect: true, callbackUrl: '/' });
  }, [logout]);

  return (
    <div className={cx('member')}>
      <Header />
      <div
        className={cx('member__content')}
        style={{ position: 'absolute', transform: 'translate(0,50%)' }}
      >
        로그아웃 중입니다. 자동으로 메인페이지로 이동합니다.
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
