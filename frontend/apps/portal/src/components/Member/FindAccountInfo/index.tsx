import React, { useState } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import FindUsername from './components/FindUsername';
import FindPassword from './components/FindPassword';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

function Index() {
  const [type, setType] = useState('id');
  const { t } = useTranslation();

  const tabs = ['id', 'pw'];

  return (
    <div className={cx('findInfo')}>
      {/* 헤더 */}
      <div className={cx('findInfo__header')}>
        <p className={cx('findInfo__header-title')}>Find ID∙Password</p>
      </div>

      {/* 바디 */}
      <div className={cx('findInfo__main')}>
        <div className={cx('findInfo__main-items')}>
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setType(tab)}
              className={type === tab ? cx('item', 'active') : cx('item')}
            >
              {tab === 'id' ? t('username-find') : t('password-find')}
            </div>
          ))}
        </div>
        {type === 'id' ? <FindUsername /> : <FindPassword />}
      </div>
    </div>
  );
}

export default Index;
