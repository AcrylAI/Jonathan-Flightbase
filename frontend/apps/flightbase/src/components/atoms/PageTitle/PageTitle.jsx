// CSS Module
import classNames from 'classnames/bind';
import style from './PageTitle.module.scss';

const cx = classNames.bind(style);

/**
 * 페이지 타이틀 컴포넌트
 * @component
 * @example
 *
 * return (
 *  <PageTitle>
 *    title
 *  </PageTitle>
 * );
 *
 *
 *
 * -
 */
function PageTitle({ children }) {
  return <h2 className={cx('page-title')}>{children}</h2>;
}

export default PageTitle;
