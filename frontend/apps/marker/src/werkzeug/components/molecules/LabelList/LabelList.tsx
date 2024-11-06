import { useRecoilValue } from "recoil";
import { labelListAtom } from "@src/werkzeug/stores/paintStore";
import Group from "./LabelGroup";
import classNames from "classnames/bind";
import styles from "./LabelList.module.scss";
const cx = classNames.bind(styles);

function LabelList() {
  const labelList = useRecoilValue(labelListAtom);

  return (
    <div className={ cx("LabelList") } id={'_mk_label-list'}>
      {
        labelList.map((v, i) => (
          <Group label={v} key={i} />
        ))
      }
    </div>
  )
}

export default LabelList;