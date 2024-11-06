import { Case, Default, Switch } from '@jonathan/react-utils';

import { Sypo } from '../Typography/Typo';

import { BLUE104, MONO205 } from '@src/utils/color';

import style from './ToggleButton.module.scss';
// CSS Module
import classNames from 'classnames/bind';

import type { Properties as CSSProperties } from 'csstype';
const cx = classNames.bind(style);

type Props = {
  select: 'left' | 'right' | 'none';
  buttonStyle: 'blue-white' | 'blue-red';
  left: {
    label: string;
  };
  right: {
    label: string;
  };
  children?: JSX.Element;
  customStyle?: CSSProperties;
  onClickLeft?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClickRight?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

function ToggleButton({
  children,
  buttonStyle,
  select,
  left,
  right,
  customStyle,
  onClickLeft,
  onClickRight,
}: Props) {
  return (
    <div className={cx('toggle-btn', select)} style={customStyle}>
      <Switch>
        <Case condition={children}>{children}</Case>
        <Default>
          <div className={cx('btn', buttonStyle)}>
            <div
              className={cx('left', select === 'left' && 'select')}
              onClick={onClickLeft}
            >
              <Sypo type='P2' color={select === 'left' ? BLUE104 : MONO205}>
                {left.label}
              </Sypo>
            </div>
            <div className={cx('line', select !== 'none' && 'select')}></div>
            <div
              className={cx('right', select === 'right' && 'select')}
              onClick={onClickRight}
            >
              <Sypo type='P2' color={select === 'right' ? BLUE104 : MONO205}>
                {right.label}
              </Sypo>
            </div>
          </div>
        </Default>
      </Switch>
    </div>
  );
}

ToggleButton.defaultProps = {
  children: undefined,
  customStyle: undefined,
  onClickLeft: undefined,
  onClickRight: undefined,
};

export default ToggleButton;
