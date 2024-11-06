import { ReactNode } from 'react';
import { Range } from "react-range";

import classNames from "classnames/bind";
import styles from "./Slider.module.scss";
const cx = classNames.bind(styles);

type Props = {
  state: [number, (value:number) => void];
  label?: ReactNode;
  min?: number;
  max?: number;
}

function Slider({ state, label, min=0, max=200 }:Props) {
  const [value, setValue] = state;
  const step = (() => {
    return (min + max) / 100;
  })();

  const onChange = (v:number[]) => {
    setValue(v[0]);
  }

  return (
    <div className={ cx("Slider") }>
      {
        label && <div className={ cx("label") }>{ label }</div>
      }
      <div className={ cx("track") }>
        <Range step={step}
               min={min}
               max={max}
               values={[value]}
               onChange={onChange}
               renderThumb={({props}) => (
                 <div {...props} className={ cx("thumb") } />
               )}
               renderTrack={({props, children}) => (
                 <div {...props} className={ cx("rail") }>{children}</div>
               )}
        />
      </div>
    </div>
  )
}

export default Slider