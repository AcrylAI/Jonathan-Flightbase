import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

// i18n
import { withTranslation } from 'react-i18next';

// CSS module
import classNames from 'classnames/bind';
import style from './RecordsNav.module.scss';

const cx = classNames.bind(style);

const RecordsNav = ({ nav: { isExpand }, navList, t }) => {
  return (
    <div className={cx('nav-box', isExpand && 'expand')}>
      <ul className={cx('nav')}>
        {navList.map(({ label, path: pathname }, idx) => (
          <li className={cx('nav-item')} key={idx}>
            <NavLink
              exact
              to={{
                pathname,
              }}
              activeClassName={cx('active')}
            >
              <span className={cx('link-name')}>{t(label)}</span>
              <span className={cx('stick')}></span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default connect(({ nav }) => ({ nav }))(withTranslation()(RecordsNav));
