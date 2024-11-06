// Components
import Header from '@components/common/Header/Header';
import Footer from '@components/common/Footer/Footer';
import ErrorFallback from '@components/common/Error';

// Style
import styles from './404.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const fallbackProps = {
  code: 404,
  texts: [
    '존재하지 않는 주소를 입력하셨거나,',
    '요청하신 페이지의 주소가 변경, 삭제되어 찾을수 없습니다.',
    '입력하신 주소가 정확한지 다시 한 번 확인해주세요.',
  ],
};

function Custom404() {
  return (
    <div className={cx('member')}>
      <ErrorFallback {...fallbackProps} />
      <Header />
      <Footer />
    </div>
  );
}
export default Custom404;
