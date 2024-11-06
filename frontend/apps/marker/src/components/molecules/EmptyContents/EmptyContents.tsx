import React, { Fragment } from 'react';

import { Sypo } from '@src/components/atoms';

// Color
import { MONO205 } from '@src/utils/color';

// CSS Module
import style from './EmptyContents.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

type Props = {
  contents: string | JSX.Element | Array<string | JSX.Element>;
  icon?: {
    topIcon?: string;
    topIconStyle?: React.CSSProperties;
    bottomIcon?: string;
    bottomIconStyle?: React.CSSProperties;
  };
  customStyle?: React.CSSProperties;
};

function EmptyContents({ contents, icon, customStyle }: Props) {
  const isArr = Array.isArray(contents);

  return (
    <div className={cx('contents-box')} style={customStyle}>
      <>
        {icon && icon.topIcon && (
          <div style={{ marginBottom: '6px' }}>
            <img
              src={icon?.topIcon}
              alt='top-icon'
              style={{ ...icon?.topIconStyle }}
            />
          </div>
        )}
        {isArr &&
          contents.map((content, idx) => {
            if (typeof content === 'string') {
              return (
                <Fragment key={`${content}-${idx}`}>
                  <Sypo type='H4' color={MONO205}>
                    {content}
                  </Sypo>
                </Fragment>
              );
            }
            return <Fragment key={idx}>{content}</Fragment>;
          })}
        {!isArr && typeof contents === 'string' && (
          <Sypo type='H4' color={MONO205}>
            {contents}
          </Sypo>
        )}
        {!isArr && typeof contents !== 'string' && { contents }}
        {icon && icon.bottomIcon && (
          <img
            src={icon?.bottomIcon}
            alt='top-icon'
            style={icon?.bottomIconStyle}
          />
        )}
      </>
    </div>
  );
}

EmptyContents.defaultProps = {
  icon: undefined,
  customStyle: undefined,
};

export default EmptyContents;
