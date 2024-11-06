import classNames from "classnames/bind";
import styles from "./Skeleton.module.scss";

const cx = classNames.bind(styles);

function ListSkeleton() {
  return (
    <div className={ cx("Skeleton", "ListSkeleton") }>
      <div className={ cx("text") } style={{ width:'100px' }} />
      <div className={ cx("container") }>
        {
          [1,2,3,4,5,6,7,8].map(v => (
            <div key={v} className={ cx("content") } />
          ))
        }
      </div>
    </div>
  )
}

export default ListSkeleton;