import { useRecoilValue } from "recoil";
import { Sypo } from "@src/components/atoms";
import { scaleAtom } from "@src/werkzeug/stores/paintStore";
import Icon from "@src/werkzeug/assets";
import useZoom from "./useZoom";

import classNames from "classnames/bind";
import styles from "./ZoomBox.module.scss";

const cx = classNames.bind(styles);
const { Key } = Icon;

function ZoomBox() {

  const { onClickZoomIn, onCLickZoomOut } = useZoom();
  const scale = useRecoilValue(scaleAtom);

  return (
    <div className={ cx("ZoomBox") }>
      <div className={ cx("button") } onClick={onCLickZoomOut}>
        <Key type="-" size={"mx"} />
      </div>
      <div className={ cx("scope") }>
        <Sypo type="p1" weight={400}>
          {
            scale >= 0
              ? `${Math.floor(scale * 1000)/10} %`
              : 'N/A'
          }
        </Sypo>
      </div>
      <div className={ cx("button") } onClick={onClickZoomIn}>
        <Key type="+" size={"mx"} />
      </div>
    </div>
  )
}

export default ZoomBox;