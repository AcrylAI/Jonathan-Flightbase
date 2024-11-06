import React, { CSSProperties, useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

import { InputText } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { Mypo, Sypo } from '@src/components/atoms';
import ListItemSkeleton from '@src/components/atoms/Skeleton/ListItem/ListItemSkeleton';

import { BLUE110, MONO203, MONO205, RED502, RED503 } from '@src/utils/color';

import { SearchIcon } from '@src/static/images';

import styles from './SetAutolabelingListContainer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
type DimType = {
  title: string;
  desc: Array<string>;
};
type Props = {
  title?: string;
  children?: JSX.Element;
  height?: string | number;
  dim?: DimType;
  search?: boolean;
  loading?: boolean;
  placeholder?: string;
  buttonTitle?: string;
  skeletonCount?: number;
  buttonDisabled?: boolean;
  searchDisabled?: boolean;
  searchValue?: string;
  scrollHidden?: boolean;
  nodataDesc?: string;
  disabledSearchIcon?: boolean;
  childrenStyle?: CSSProperties;
  onClickButton?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onChangeSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SetAutolabelingListContainer = ({
  dim,
  title,
  search,
  loading,
  height,
  children,
  placeholder,
  buttonTitle,
  scrollHidden,
  skeletonCount,
  buttonDisabled,
  searchDisabled,
  disabledSearchIcon,
  childrenStyle,
  searchValue,
  nodataDesc,
  onClickButton,
  onChangeSearch,
}: Props) => {
  const [skeleton, setSkeleton] = useState<Array<number>>([]);
  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeSearch !== undefined && dim === undefined) onChangeSearch(e);
  };
  const handleClickButton = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonDisabled && onClickButton) onClickButton(e);
  };
  const setSkeletonCnt = () => {
    const temp = [];
    const cnt = skeletonCount ?? 5;
    for (let i = 0; i < cnt ?? 0; i++) {
      temp.push(i);
    }
    setSkeleton(temp);
  };
  useEffect(() => {
    setSkeletonCnt();
  }, []);
  return (
    <div className={cx('list-container')} style={height ? { height } : {}}>
      <div className={cx('header')}>
        <Sypo type='P1'>{title}</Sypo>
      </div>
      <div className={cx('list')}>
        {dim && (
          <div className={cx('dim')}>
            <div className={cx('warning')}>
              <div className={cx('title')}>
                <Sypo type='H4' color={RED503} weight='M'>
                  {dim.title}
                </Sypo>
              </div>
              <div className={cx('desc')}>
                {dim.desc.map((v, idx) => (
                  <div className={cx('line')} key={`line ${idx}`}>
                    <Mypo type='P1' weight='R' color={BLUE110}>
                      {v}
                    </Mypo>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {search && (
          <div className={cx('search')}>
            <InputText
              value={searchValue}
              onChange={handleChangeSearch}
              isDisabled={searchDisabled}
              customStyle={{
                border: `1px solid ${MONO203}`,
                fontFamily: 'MarkerFont',
                fontSize: '14px',
                fontWeight: '400',
                lineHeight: '14px',
                height: '36px',
              }}
              placeholder={placeholder}
              leftIconStyle={{
                marginLeft: '4px',
                width: '16px',
                height: '16px',
              }}
              leftIcon={SearchIcon}
              disableLeftIcon={disabledSearchIcon}
            />
          </div>
        )}
        <Switch>
          <Case condition={loading}>
            <div className={cx('children')}>
              {skeleton.map((v, idx) => (
                <ListItemSkeleton key={`skeleton ${idx}`} />
              ))}
            </div>
          </Case>
          <Case condition={nodataDesc && dim === undefined}>
            <div className={cx('nodata')}>
              <Sypo type='H4' weight='R' color={MONO205}>
                {nodataDesc}
              </Sypo>
            </div>
          </Case>
          <Default>
            <div
              className={cx('children', scrollHidden && 'scrollHidden')}
              style={childrenStyle}
            >
              {children}
            </div>
          </Default>
        </Switch>
      </div>
      <div className={cx('footer')}>
        {buttonTitle && (
          <div
            className={cx('button', buttonDisabled && 'disabled')}
            onClick={handleClickButton}
          >
            <Sypo type='H4' weight='M'>
              {buttonTitle}
            </Sypo>
          </div>
        )}
      </div>
    </div>
  );
};

SetAutolabelingListContainer.defaultProps = {
  title: '',
  dim: undefined,
  children: <></>,
  search: false,
  loading: false,
  placeholder: '',
  searchValue: '',
  buttonTitle: '',
  height: '',
  searchDisabled: false,
  skeletonCount: 5,
  nodataDesc: '',
  disabledSearchIcon: false,
  scrollHidden: false,
  childrenStyle: {},
  buttonDisabled: false,
  onClickButton: () => {},
  onChangeSearch: () => {},
};

export default SetAutolabelingListContainer;
