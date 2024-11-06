import { Range } from 'react-range';

import styles from './Slider.module.scss';
import classNames from 'classnames/bind';

import { SetState } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  state: number;
  setState: SetState<number>;
  min?: number;
  max?: number;
};

function Slider({ state, setState, min = 0, max = 200 }: Props) {
  const step = (() => {
    return (min + max) / 100;
  })();

  const _onChange = (v: number[]) => {
    setState(v[0]);
  };

  return (
    <div className={cx('slider-container')}>
      <Range
        step={step}
        min={min}
        max={max}
        values={[state]}
        onChange={_onChange}
        renderThumb={({ props }) => <div {...props} className={cx('thumb')} />}
        renderTrack={({ props, children }) => (
          <div {...props} className={cx('rail')}>
            {children}
          </div>
        )}
      />
    </div>
  );
}

export type { Props as SliderPropsType };

export default Slider;
