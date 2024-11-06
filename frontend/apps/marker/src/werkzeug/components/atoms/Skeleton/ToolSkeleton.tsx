import { CSSProperties } from "react";
import classNames from "classnames/bind";
import styles from "./Skeleton.module.scss";

const cx = classNames.bind(styles);

function ToolSkeleton() {
  const lineStyle:CSSProperties = (() => {
    return {
      display: 'flex',
      flexFlow: 'row nowrap',
      minHeight: '24px',
      minWidth: '2px',
      borderRadius: '2px',
      backgroundColor: '#E6EAF2'
    };
  })();

  return (
    <div className={ cx("Skeleton", "ToolSkeleton") }>
      <div className={ cx("content") } />
      <div style={lineStyle} />
      <div className={ cx("content") } />
    </div>
  )
}

export default ToolSkeleton;