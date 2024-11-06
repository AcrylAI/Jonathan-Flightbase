import { useState } from 'react';
import { isMobile } from 'react-device-detect';

import { Button, InputText } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import { InfoIcon, MembersIcon, SpinnerIcon } from '@src/static/images';

import style from './PageHeader.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

type ColorTypes = 'blue' | 'white' | 'red';

type PageHeaderProps = {
  leftSection?: 'memberCount' | 'spinner' | 'tooltip';
  rightSection?: 'workButton' | 'inputAndButton' | 'button' | false;
  color?: ColorTypes;
  buttonText?: string;
  onClickAction?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  projectTitle?: boolean;
  projectTitleValue?: string;
  pageTitle?: string;
  loading?: boolean;
  btnDisabled?: boolean;
  btnLoading?: boolean;
  onClickLabeling?: () => void;
  onClickJobReview?: () => void;
  onChangeSearch?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  memberCount?: number;
  value?: string;
  tooltipDesc?: string;
};
const PageHeader = ({
  leftSection,
  rightSection,
  projectTitle,
  projectTitleValue,
  pageTitle,
  color,
  buttonText,
  onClickAction,
  btnDisabled,
  btnLoading,
  loading,
  onClickLabeling,
  onClickJobReview,
  onChangeSearch,
  memberCount,
  value,
  tooltipDesc,
}: PageHeaderProps) => {
  const { t } = useT();

  const [tooltip, setTooltip] = useState<boolean>(false);

  const onTooltipMouseOver = () => {
    setTooltip(true);
  };

  const onTooltipMouseLeave = () => {
    setTooltip(false);
  };

  const buttonColor = (color?: ColorTypes) => {
    let colorValue = '';
    if (color) {
      if (color === 'blue') colorValue = 'primary';
      if (color === 'white') colorValue = 'primary-reverse';
      if (color === 'red') colorValue = 'red';
    }
    return colorValue;
  };

  const defaultButtonStyle = { height: '40px', padding: '12px 20px' };

  const buttonStyle = (color?: ColorTypes, btnDisabled?: boolean) => {
    let buttonStyle = {};

    if (color) {
      if (color === 'blue' || 'white')
        buttonStyle = {
          defaultButtonStyle,
          boxShadow: '0px 3px 12px rgba(45, 118, 248, 0.06)',
        };
      if (color === 'red')
        buttonStyle = {
          defaultButtonStyle,
          background: '#FA4E57',
          borderColor: '#FA4E57',
          boxShadow: '0px 3px 12px rgba(250, 78, 87, 0.06)',
        };
      if (btnDisabled) buttonStyle = defaultButtonStyle;
    }
    return buttonStyle;
  };

  return (
    <div className={cx('page-header-bg')}>
      <div className={cx('page-header-inner')}>
        <div className={cx('page-header-left-section')}>
          {projectTitle && (
            <p className={cx('project-title')}>
              <Sypo type='P1'>{projectTitleValue}</Sypo>
            </p>
          )}
          <div className={cx('page-info-section')}>
            <p className={cx('page-title')}>
              <Sypo type='H2'>{pageTitle}</Sypo>
            </p>
            <Switch>
              <Case condition={leftSection === 'memberCount'}>
                <div className={cx('member-count-area')}>
                  <img src={MembersIcon} alt='' />
                  <p>
                    <Sypo type='P1'>{memberCount}</Sypo>
                  </p>
                </div>
              </Case>
              <Case condition={leftSection === 'spinner'}>
                {loading && (
                  <img
                    src={SpinnerIcon}
                    alt='loading'
                    className={cx('spinner-icon')}
                  />
                )}
              </Case>
              <Case condition={leftSection === 'tooltip'}>
                <div
                  className={cx('tooltip-section')}
                  onMouseOver={onTooltipMouseOver}
                  onMouseLeave={onTooltipMouseLeave}
                >
                  <div className={cx('tool-tip-icon')}>
                    <img src={InfoIcon} alt='' />
                  </div>
                  <div className={cx('tooltip-desc-box', tooltip && 'active')}>
                    <Sypo type='P1' weight={400}>
                      <p>{tooltipDesc}</p>
                    </Sypo>
                  </div>
                </div>
              </Case>
              <Default>
                <></>
              </Default>
            </Switch>
          </div>
        </div>
        <div className={cx('page-header-right-section')}>
          <Switch>
            <Case condition={rightSection === 'workButton' && !isMobile}>
              <Button
                size='medium'
                type='primary'
                theme='jp-primary'
                customStyle={buttonStyle('blue')}
                onClick={onClickLabeling}
              >
                <Sypo type='H4' weight={400}>
                  {t(`component.btn.labeling`)}
                </Sypo>
              </Button>
              {onClickJobReview && (
                <Button
                  size='medium'
                  type='primary-reverse'
                  theme='jp-primary'
                  customStyle={(buttonStyle('blue'), { marginLeft: '16px' })}
                  onClick={onClickJobReview}
                >
                  <Sypo type='H4' weight={400}>
                    {t(`component.btn.review`)}
                  </Sypo>
                </Button>
              )}
            </Case>
            <Case condition={rightSection === 'inputAndButton'}>
              <InputText
                status='default'
                size='meduium'
                theme='jp-primary'
                autoFocus
                placeholder={t(`component.inputBox.search`)}
                disableLeftIcon={false}
                disableClearBtn={!value}
                customStyle={{
                  width: '220px',
                  height: '40px',
                  fontFamily: 'SpoqaR',
                  fontSize: '14px',
                  lineHeight: '14px',
                  marginRight: '8px',
                }}
                onChange={onChangeSearch}
                value={value ?? ''}
                onClear={() => {
                  if (onChangeSearch) {
                    onChangeSearch();
                  }
                }}
              ></InputText>
              <Button
                size='medium'
                type={buttonColor(color)}
                theme='jp-primary'
                customStyle={buttonStyle(color, btnDisabled)}
                onClick={onClickAction}
                disabled={btnDisabled}
                loading={btnLoading}
              >
                <Sypo type='H4' weight={400}>
                  {buttonText}
                </Sypo>
              </Button>
            </Case>
            <Case condition={rightSection === 'button'}>
              <Button
                size='medium'
                type={buttonColor(color)}
                theme='jp-primary'
                customStyle={buttonStyle(color, btnDisabled)}
                onClick={onClickAction}
                disabled={btnDisabled}
                loading={btnLoading}
              >
                <Sypo type='H4' weight={400}>
                  {buttonText}
                </Sypo>
              </Button>
            </Case>
            <Default>
              <></>
            </Default>
          </Switch>
        </div>
      </div>
    </div>
  );
};

PageHeader.defaultProps = {
  leftSection: '',
  rightSection: '',
  projectTitle: false,
  projectTitleValue: '',
  pageTitle: '',
  loading: false,
  color: '',
  buttonText: '',
  onClickAction: (e: React.MouseEvent<HTMLButtonElement>) => {},
  onClickLabeling: undefined,
  onClickJobReview: undefined,
  onChangeSearch: undefined,
  value: '',
  btnLoading: false,
  btnDisabled: false,
  memberCount: undefined,
  tooltipDesc: '',
};

export default PageHeader;
