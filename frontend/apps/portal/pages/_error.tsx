// Components
import Header from '@components/common/Header/Header';
import Footer from '@components/common/Footer/Footer';
import ErrorFallback from '@components/common/Error';

// Style
import styles from './error.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const fallbackProps = {
  code: 500,
  texts: [
    '지금 이 서비스와 연결할 수 없습니다.',
    '문제를 해결하기 위해 열심히 노력하고 있습니다.',
    '잠시 후 다시 확인해주세요.',
  ],
};

function Error() {
  return (
    <div className={cx('member')}>
      <ErrorFallback {...fallbackProps} />
      <Header />
      <Footer />
    </div>
  );
}
export default Error;
