import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import styles from './Toast.module.scss';

const cx = classNames.bind(styles);

type Props = {
  // position?:
  //   | 'bottom-right'
  //   | 'bottom-left'
  //   | 'top-right'
  //   | 'top-left'
  //   | 'top-center'
  //   | 'bottom-center';
  // duration?: number;
  // limit?: number;
  containerId?: string;
};

function Toast({ containerId }: Props) {
  return (
    <ToastContainer
      // position={position ?? 'bottom-right'}
      // autoClose={duration ?? 6000}
      hideProgressBar
      // newestOnTop={false}
      closeOnClick={false}
      // rtl={false}
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover={false}
      theme='light'
      className={cx('jonathan-ui-toast-container')}
      containerId={containerId ?? 'jonathan-ui-toast-container'}
      // limit={limit ?? 5}
      enableMultiContainer
      transition={Slide}
    />
  );
}

export default Toast;
