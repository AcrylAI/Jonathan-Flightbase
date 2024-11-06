import classNames from "classnames/bind";
import styles from "./Skeleton.module.scss";

const cx = classNames.bind(styles);

type Props = {
  width: string;
}

function TextSkeleton({ width }:Props) {
  return (
    <div className={ cx("Skeleton", "TextSkeleton") }>
      <div className={ cx("text") } style={{ width }} />
    </div>
  )
}

export default TextSkeleton;