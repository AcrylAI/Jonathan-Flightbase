import Icon from "@src/werkzeug/assets";
import { Sypo } from "@src/components/atoms";
import classNames from "classnames/bind";
import styles from "./Skeleton.module.scss";
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

type Props = {
  error?: boolean;
}

function PaintSkeleton({ error=false }:Props) {
  const { t } = useT();

  if(!error) {
    return (
      <div className={ cx("Skeleton", "PaintSkeleton") }>
        <div className={ cx("content") } />
      </div>
    )
  }
  else {
    return (
      <div className={ cx("Skeleton", "PaintSkeleton") }>
        <div className={ cx("content") }>
          <Icon.ErrorImgIcon />
          <Sypo type='h3' weight={500}>{t(`component.skeleton.paint`)}</Sypo>
        </div>
      </div>
    )
  }
}

export default PaintSkeleton;