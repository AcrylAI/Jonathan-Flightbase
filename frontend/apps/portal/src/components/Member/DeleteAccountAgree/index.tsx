/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

// i18n
import { useTranslation } from 'react-i18next';
import i18n from '@src/common/lang/i18n';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BasicCheckbox from '@components/common/Checkbox/BasicCheckbox';
import SuccessButton from '@components/common/Button/SuccessButton';
import TermTextBox from './components/TermTextBox';
import TermDoc, {
  DeleteTermDocModel,
} from './components/DeleteAccountAgreeDoc';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Index() {
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('ko');
  const [checkedItems, setCheckedItems] = useState<DeleteTermDocModel[]>([]);
  const { t } = useTranslation();
  const { status } = useSession();
  const router = useRouter();

  const checkLanguage = () => {
    const language = localStorage.getItem('language');
    if (language) setLanguage(language);
  };

  // 다음 단계로 라우팅
  const onClickContinue = () => {
    router.push('/member/delete-account-auth');
  };

  // 유저 정보 없는 경우 리다이렉트
  useEffect(() => {
    if (status !== AUTH_STRING) router.push('/');
    checkLanguage();
  }, [router, status]);

  // 로딩시 약관 정보 Import
  useEffect(() => {
    setCheckedItems(TermDoc);
  }, []);

  // 언어 변동 감지
  useEffect(() => {
    if (i18n.language !== language) setLanguage(i18n.language);
  }, [language]);

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
    <div className={cx('agree')}>
      {/* 헤더 */}
      <div className={cx('agree__header')}>
        <div className={cx('agree__header-title')}>
          <BasicTitle text='Delete Account'></BasicTitle>
        </div>
        <div className={cx('agree__header-checkbox')}>
          <BasicSubTitle
            text={[
              'delete-account-agree-subtitle1',
              'delete-account-agree-subtitle2',
            ]}
          />
        </div>
      </div>

      {/* 동의 */}
      <div className={cx('agree__main-body')}>
        {checkedItems.map((item) => (
          <div
            key={item.key}
            className={cx('agree__main-body-box', 'agree-scroll')}
          >
            <span className={cx('term-title')}>{t(item.label)}</span>
            <TermTextBox
              termDoc={language === 'ko' ? item.text : item.textEn}
            ></TermTextBox>
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

      <div className={cx('agree__btn')}>
        <SuccessButton
          onClick={() => {
            onClickContinue();
          }}
          text={t('next')}
          disabled={!checkAll}
        ></SuccessButton>
      </div>
    </div>
  );
}

export default Index;
