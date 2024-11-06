import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { setCookie } from 'cookies-next';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';
import i18n from '@src/common/lang/i18n';

// Components
import { popupStateAtom } from '@src/atom/ui/Popup';
import BasicCheckbox from '@components/common/Checkbox/BasicCheckbox';

// Style
import styles from './index.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

// Image
const Logo = '/Images/logo/ICO_Jonathan.svg';

export type GlobalPopupProps = {
  htmlKo: any;
  htmlEn: any;
};

export const GlobalPopupData: GlobalPopupProps = {
  htmlKo: (
    <div>
      <p>
        인공지능 전문 기업 아크릴의
        <br />
        통합 인공지능 플랫폼 Jonathan을
        <br />
        <span className={cx('strong')}>NVIDIA의 최신 GPU인 Tesla A100</span>과
        함께
        <br />
        사용하실 수 있습니다.
        <br />
        <br />
        회원 가입을 원하시는 경우,
        <br />
        <span className={cx('strong')}>회원 가입 양식 작성</span>을 통해
        요청해주세요.
      </p>
      {/* <a
        href='/manual/Flightbase_User_Guide.pdf'
        target='_blank'
        download='Flightbase_User_Guide_210413.pdf'
      >
        이용 가이드 다운로드 &gt;
      </a> */}
    </div>
  ),
  htmlEn: (
    <div>
      <p>
        Jonathan is provided by <br /> an AI-specialized company Acryl.
        <br />
        You can use{' '}
        <span className={cx('strong')}>
          NVIDIA&apos;s
          <br /> AI supercomputing GPU - Tesla A100
        </span>
        <br />
        in the Jonathan Platform.
        <br />
        <br />
        If you want to try this service,
        <br />
        please <span className={cx('strong')}>fill out the form below.</span>
      </p>
    </div>
  ),
};

function GlobalPopup(props: GlobalPopupProps) {
  const { t } = useTranslation();
  const [show, setShow] = useRecoilState(popupStateAtom);
  const [neverShow, setNeverShow] = useState<boolean>(false);
  const { htmlKo, htmlEn } = props;
  return (
    <div
      className={cx('Modal-wrap')}
      style={{ display: show ? 'flex' : 'none' }}
    >
      <div className={cx('Modal-container')}>
        <div className={cx('Modal-body')}>
          <Image
            src={Logo}
            className={cx('logo')}
            width={48}
            height={42}
            alt='Jonathan'
          />
          <div className={cx('title-box')}>
            <div className={cx('underbg')}></div>
            <p>{t('global-popup-title')}</p>
          </div>
          <div className={cx('text-box')}>
            {i18n.language === 'ko' ? htmlKo : htmlEn}
            <span
              onClick={() => {
                setShow(false);
              }}
            >
              <Link href='/member/join-request'>
                <span className={cx('link')}>
                  {t('global-popup-link-message')} &gt;
                </span>
              </Link>
            </span>
          </div>
        </div>
        <div className={cx('Modal-footer')}>
          <BasicCheckbox
            id='neverShowCheck'
            label={t('no-show-popup-message')}
            checked={neverShow}
            onChange={(e: any) => {
              setNeverShow(e.target.checked);
              setCookie('popupCookie', false, {
                maxAge: 60 * 60 * 24 * 3,
                path: '/',
                domain: process.env.NEXT_PUBLIC_ENV_COOKIE_DOMAIN,
                httpOnly: false,
              });
              setShow(false);
            }}
          />
          <button
            onClick={() => {
              setShow(false);
            }}
          >
            {t('close-button')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GlobalPopup;
