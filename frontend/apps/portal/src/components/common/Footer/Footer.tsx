/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect, RefObject } from 'react';
import Link from 'next/link';
import { setCookie } from 'cookies-next';

// i18n
import { useTranslation } from 'react-i18next';
import i18n from '@src/common/lang/i18n';

// Style
import styles from './Footer.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

// Image
const FooterLogo = '/Images/logo/BI_Jonathan_gray.svg';
const PlusIcon = '/Images/00-ic-basic-plus.svg';
const GlobalIcon = '/Images/00-ic-info-public.svg';
const arrowIcon = '/Images/00-ic-basic-arrow-01-down.svg';

function Footer() {
  function useOutsideAlerter(ref: RefObject<HTMLUListElement>) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          switch (ref.current.className) {
            case cx('family-list'):
              setIsFamilyOpen(false);
              break;
            case cx('locale-list'):
              setIsLocaleOpen(false);
              break;
            default:
              break;
          }
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const [isFamilyOpen, setIsFamilyOpen] = useState<boolean>(false);
  const [isLoacaleOpen, setIsLocaleOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLUListElement>(null);
  const localeRef = useRef<HTMLUListElement>(null);

  useOutsideAlerter(wrapperRef);
  useOutsideAlerter(localeRef);

  // 언어 변경
  const { t } = useTranslation();
  const languageOptions = { ko: '한국어', en: 'English' };
  const selected = i18n.language;
  const changeLanguage = (lng: string) => {
    setCookie('language', lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div className={cx('footer-container')}>
      <div className={cx('footer-left')}>
        <img src={FooterLogo} className={cx('logo')} alt='logo' />
        <div className={cx('copyright-box')}>
          © {new Date().getFullYear()} Acryl inc. All Rights Reserved.
        </div>
      </div>
      <div className={cx('footer-right')}>
        <div className={cx('copyright-box')}>
          <Link className={cx('term')} href='/accounts/term/access'>
            {t('footer-terms')}
          </Link>
          <div className={cx('copyright-dot')}></div>
          <Link className={cx('term')} href='/accounts/term/privacy'>
            {t('footer-privacy')}
          </Link>

          <div
            className={cx('family-container')}
            onClick={() => {
              setIsFamilyOpen(!isFamilyOpen);
            }}
          >
            <span>{t('footer-family')}</span>
            <img src={PlusIcon} alt='+' />

            {isFamilyOpen && (
              <ul className={cx('family-list')} ref={wrapperRef}>
                <li>
                  <a
                    href='https://acryl.ai'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {t('footer-family-acryl')}
                  </a>
                </li>
                <li>
                  <a
                    href='https://jonathan.acryl.ai'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {t('footer-family-jonathan')}
                  </a>
                </li>
                <li>
                  <a
                    href='https://hugbot.acryl.ai'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {t('footer-family-hugbot')}
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div
            className={cx('locale')}
            onClick={() => {
              setIsLocaleOpen(!isLoacaleOpen);
            }}
          >
            <img src={GlobalIcon} alt='language' />
            <span>{languageOptions[i18n.language as 'ko' | 'en']}</span>
            <img
              src={arrowIcon}
              className={cx({
                'locale-opened': isLoacaleOpen,
              })}
              alt='arrow'
            />

            {isLoacaleOpen && (
              <ul className={cx('locale-list')} ref={localeRef}>
                <li
                  className={cx(selected === 'ko' && 'selected')}
                  onClick={() => changeLanguage('ko')}
                >
                  한국어
                </li>
                <li
                  className={cx(selected === 'en' && 'selected')}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
