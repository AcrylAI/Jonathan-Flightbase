import { CSSProperties } from "react";
import { useRecoilState } from "recoil";
import { Icons } from "@src/components/atoms";
import { snackbarAtom } from "@src/stores/components/Snackbar/SnackbarStore";
import classNames from "classnames/bind";
import styles from "./Snackbar.module.scss";

const cx = classNames.bind(styles);
const { CloseIcon } = Icons;

function Snackbar() {
  const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);

  const wait = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay));

  const onClickClose = async () => {
    setSnackbar(cur => ({ ...cur, show:false }));
    await wait(250);
    setSnackbar(cur => ({ ...cur, contents:null }));
  }

  const style:CSSProperties = (() => {
    if(snackbar.contents !== null) return { display: 'flex' };
    else return { display: 'none' };
  })();

  const visible = (() => {
    if(snackbar.show) return 'visible';
    else return 'hidden';
  })();

  return (
    <div className={ cx("Snackbar", visible) } style={style}>
      <div className={ cx("contents") }>
        { snackbar.contents }
      </div>
      <div className={ cx("close") } onClick={onClickClose}>
        <CloseIcon />
      </div>
    </div>
  )
}

export default Snackbar;