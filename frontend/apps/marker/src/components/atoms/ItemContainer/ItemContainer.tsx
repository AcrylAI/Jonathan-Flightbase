import React from 'react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { Sypo } from '../Typography/Typo';

import { RED502 } from '@src/utils/color';

import styles from './ItemContainer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  headerTitle: string | JSX.Element;
  itemContents: React.ReactNode;
  type?: 'vertical' | 'horizontal';
  line?: Partial<{
    direction: 'left';
    backgroundColor: string;
  }>;
  headerContents?: React.ReactNode;
  headerHeight?: string;
  headerWidth?: string;
  containerCustomStyle?: React.CSSProperties;
  itemContentsCustomStyle?: React.CSSProperties;
};

const ItemContainer = ({
  containerCustomStyle,
  headerTitle,
  type,
  line,
  headerContents,
  itemContents,
  headerHeight,
  headerWidth,
  itemContentsCustomStyle,
}: Props) => {
  return (
    <div className={cx('item-container', type)} style={containerCustomStyle}>
      <Switch>
        <Case condition={type === 'horizontal'}>
          <div className={cx('item-left')}>
            {line && line.direction === 'left' && (
              <div
                className={cx('error')}
                style={{
                  backgroundColor: line.backgroundColor && line.backgroundColor,
                }}
              ></div>
            )}
            <div
              className={cx('item-header')}
              style={{
                height: headerHeight,
                width: headerWidth,
              }}
            >
              <div className={cx('item-header-title')}>
                <Sypo type='H4' weight={500}>
                  {headerTitle}
                </Sypo>
              </div>
            </div>
          </div>
          {itemContents}
        </Case>
        <Default>
          <div
            className={cx('item-header')}
            style={{
              height: headerHeight,
              width: headerWidth,
            }}
          >
            <div className={cx('item-header-title')}>
              <Sypo type='H4' weight={500}>
                {headerTitle}
              </Sypo>
            </div>
            {headerContents}
          </div>
          <div className={cx('container-line')}></div>
          <div className={cx('item-contents')} style={itemContentsCustomStyle}>
            {itemContents}
          </div>
        </Default>
      </Switch>
    </div>
  );
};

ItemContainer.defaultProps = {
  type: 'vertical',
  line: {
    direction: 'left',
    backgroundColor: RED502,
  },
  containerCustomStyle: undefined,
  headerContents: undefined,
  headerWidth: undefined,
  headerHeight: undefined,
  itemContentsCustomStyle: undefined,
};

export default ItemContainer;
