import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import Icon from "@src/werkzeug/assets";
import { Slider, FoldView, TextSkeleton } from "@src/werkzeug/components/atoms";
import useLoading from "@src/werkzeug/hooks/common/useLoading";
import { adjustmentAtom } from "@src/werkzeug/stores/paintStore";

import classNames from "classnames/bind";
import styles from "./Adjustment.module.scss";

const cx = classNames.bind(styles);
const { ResetIcon } = Icon;

function Adjustment() {
  const { t } = useT();

  const setAdjustment = useSetRecoilState(adjustmentAtom);
  const { isPaintLoading } = useLoading();

  const brightness = useState(100);
  const contrast = useState(100);
  const saturation = useState(100);

  const onClickReset = () => {
    brightness[1](100);
    contrast[1](100);
    saturation[1](100);
  }

  useEffect(() => {
    setAdjustment(curVal => ({
      ...curVal,
      brightness: brightness[0]
    }))
  }, [brightness])

  useEffect(() => {
    setAdjustment(curVal => ({
      ...curVal,
      contrast: contrast[0]
    }))
  }, [contrast])

  useEffect(() => {
    setAdjustment(curVal => ({
      ...curVal,
      saturation: saturation[0]
    }))
  }, [saturation])

  if(!isPaintLoading) {
    return (
      <div className={ cx("Adjustment") }>
        <FoldView
          head={
            <div className={ cx("header") }>
              <Sypo type='h4' weight={500}>{t(`page.annotation.adjustment`)}</Sypo>
              <div className={ cx("reset") } onClick={onClickReset}>
                <ResetIcon />
              </div>
            </div>
          }
          body={
            <div className={ cx("optslist") }>
              <Slider state={brightness}
                      label={<Sypo type="p1" weight={400}>{t(`component.adjustment.brightness`)}</Sypo>}
              />
              <Slider state={contrast} label={<Sypo type="p1" weight={400}>{t(`component.adjustment.contrast`)}</Sypo>} />
              <Slider state={saturation} label={<Sypo type="p1" weight={400}>{t(`component.adjustment.saturation`)}</Sypo>} />
            </div>
          }
        />
      </div>
    )
  }
  else {
    return (
      <div className={ cx("Adjustment") }>
        <FoldView
          head={ <TextSkeleton width='100px' /> }
          body={ null }
        />
      </div>
    )
  }
}

export default Adjustment;