import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';

import type { PopupType } from '@src/stores/components/Popup/Popup';
// Store
import { popupState } from '@src/stores/components/Popup/Popup';

// Components
import { Popup, Sypo } from '@src/components/atoms';

import { MONO206 } from '@src/utils/color';

import engIcon from '@src/static/images/icon/eng-icon.svg';
// Icons
import korIcon from '@src/static/images/icon/kor-icon.svg';

import style from './LangPopup.module.scss';
// CSS Module
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  selectedLng: 'ko' | 'en';
  onChangeLanguage: (lng: 'ko' | 'en') => void;
};

const LangPopup = forwardRef<HTMLDivElement, Props>(
  ({ selectedLng, onChangeLanguage }, ref) => {
    const isOpenPopup = useRecoilValue<PopupType>(popupState);

    return (
      <div ref={ref}>
        <Popup
          align={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          isOpen={isOpenPopup.langSettingPopup?.isOpen ?? false}
          customStyle={{
            padding: '16px 8px',
            transform: 'translateY(8px)',
          }}
        >
          <div className={cx('lang-select-box')}>
            <div
              className={cx(selectedLng === 'ko' && 'selected')}
              onClick={() => {
                onChangeLanguage('ko');
              }}
            >
              <img src={korIcon} alt='ko' />
              <Sypo type='P1' color={MONO206}>
                한국어
              </Sypo>
            </div>
            <div
              className={cx(selectedLng === 'en' && 'selected')}
              onClick={() => {
                onChangeLanguage('en');
              }}
            >
              <img src={engIcon} alt='en' />
              <Sypo type='P1' color={MONO206}>
                English
              </Sypo>
            </div>
          </div>
        </Popup>
      </div>
    );
  },
);

export default LangPopup;
