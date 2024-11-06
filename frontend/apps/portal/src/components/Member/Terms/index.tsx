/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

// Components
import BasicCheckbox from '@components/common/Checkbox/BasicCheckbox';
import SuccessButton from '@components/common/Button/SuccessButton';
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import RegisterProgress from '@components/Member/common/RegisterProgress/RegisterProgress';
import TermDoc, { TermDocModel } from '@src/components/common/TermDoc';
import TermCheckbox from './components/TermCheckbox';
import TermTextBox from './components/TermTextBox';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

function Index() {
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<TermDocModel[]>([]);
  const { t } = useTranslation();

  // 로딩시 약관 정보 Import
  useEffect(() => {
    setCheckedItems(TermDoc);
  }, []);

  // 체크박스
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'checkAll') {
      setCheckAll(!checkAll);
      const curCheckItems = checkedItems.map((item) => {
        item.checked = event.target.checked;
        return item;
      });
      setCheckedItems([...curCheckItems]);
    } else {
      setCheckAll(false);
      const curCheckItems = checkedItems.map((item) => {
        if (item.key === event.target.id) {
          item.checked = event.target.checked;
        }
        return item;
      });
      setCheckedItems([...curCheckItems]);
    }
  };

  // 전체 동의 체크박스
  useEffect(() => {
    for (let i = 0; i < checkedItems.length; i++) {
      if (!checkedItems[i].checked) {
        setCheckAll(false);
        break;
      }
      setCheckAll(true);
    }
  }, [checkedItems]);

  return (
    <div className={cx('terms')}>
      {/* 약관 헤더 */}
      <div className={cx('terms__header')}>
        <div className={cx('terms__header-title')}>
          <BasicTitle text='Sign Up'></BasicTitle>
        </div>
        <div className={cx('terms__header-checkbox')}>
          <BasicSubTitle
            text={['register-term-subtitle1', 'register-term-subtitle2']}
          />
        </div>
      </div>

      <RegisterProgress progress={1} />

      {/* 약관 동의 */}
      <div className={cx('terms__main-body')}>
        {checkedItems.map((item) => (
          <div
            key={item.key}
            className={cx('terms__main-body-box', 'terms-scroll')}
          >
            <span className={cx('term-title')}>{t(item.label)}</span>
            <TermTextBox termDoc={item.text}></TermTextBox>
            <div className={cx('term-checkbox')}>
              <BasicCheckbox
                id={item.key}
                label={t('register-term-agree')}
                checked={item.checked}
                onChange={handleChange}
              ></BasicCheckbox>
              <p>{t('register-term-required')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 약관 전체 동의 */}
      <div className={cx('terms__main-header')}>
        <TermCheckbox
          id='checkAll'
          text={t('register-term-agree-all')}
          checked={checkAll}
          onChange={handleChange}
        ></TermCheckbox>
      </div>

      <div className={cx('terms__btn')}>
        <Link href='/member/register'>
          <SuccessButton text={t('next')} disabled={!checkAll}></SuccessButton>
        </Link>
      </div>
    </div>
  );
}

export default Index;
