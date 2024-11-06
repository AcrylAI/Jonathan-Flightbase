import classNames from "classnames/bind";
import styles from "./Skeleton.module.scss";

const cx = classNames.bind(styles);

function FileSkeleton() {
  return (
    <div className={ cx("Skeleton", "FileSkeleton") }>
      <div className={ cx("text") } style={{ width:'100%' }} />
      <div className={ cx("text") } style={{ width:'130px' }} />
    </div>
  )
}

export default FileSkeleton;