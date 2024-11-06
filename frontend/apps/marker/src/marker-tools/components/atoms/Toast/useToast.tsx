import { useEffect, useState } from 'react';
import _ from 'lodash';
import { toast, ToastOptions, ToastItem, Id, Slide } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames/bind';
import styles from './Toast.module.scss';
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

type SnackbarQueueType = {
  id: string;
  fixed: boolean;
};

type SnackbarDataType = {
  duration: number | boolean;
};

type Props = {
  containerId?: string;
  limit?: number;
};

const DEFAULT_PROP = {
  containerId: 'jonathan-ui-toast-container',
  limit: 3,
};

function useSnackbar(props?: Props) {
  const { containerId = DEFAULT_PROP.containerId, limit = DEFAULT_PROP.limit } =
    props ?? DEFAULT_PROP;

  const { t } = useT();
  const [queue, setQueue] = useState<Array<SnackbarQueueType>>([]);

  const dismiss = (toastId?: string) => {
    const _id: Id | undefined = toastId as Id | undefined;
    toast.dismiss(_id);
  };

  const __clearWatingQueue = () => {
    toast.clearWaitingQueue({
      containerId,
    });
  };

  const __onChangeToast = (item: ToastItem) => {
    if (item.status === 'added' || item.status === 'updated') {
      setQueue((prev) => {
        const findIdx = prev.findIndex((value) => value.id === item.id);

        if (findIdx === -1) {
          const curr = _.cloneDeep(prev);
          const fixed =
            (item.data as unknown as SnackbarDataType)?.duration === false;
          curr.push({
            id: item.id as string,
            fixed,
          });

          return curr;
        }

        return prev;
      });
    } else {
      setQueue((prev) => {
        const findIdx = prev.findIndex((value) => value.id === item.id);

        if (findIdx !== -1) {
          const curr = _.cloneDeep(prev);
          curr.splice(findIdx, 1);
          return curr;
        }

        return prev;
      });
    }
  };

  const __fifo = () => {
    // queue state와의 혼선을 막기 위해 cloneDeep
    const curr = _.cloneDeep(queue);

    while (curr.length >= limit) {
      const notFixedId = curr.findIndex((value) => !value.fixed);
      if (notFixedId !== -1) {
        // 가장 먼저 들어온 not fixed 삭제
        const { id } = curr[notFixedId];
        dismiss(id); // dismiss에 의해 state 자동 삭제
        curr.splice(notFixedId, 1);
      } else {
        // not fixed가 없는 경우 가장 먼저 들어온 fixed 삭제
        const fixedId = curr.findIndex((value) => value.fixed);
        const { id } = curr[fixedId];
        dismiss(id); // dismiss에 의해 state 자동 삭제
        if (fixedId !== -1) curr.splice(fixedId, 1);
      }
    }
  };

  const show = (action:() => void): string => {
    __clearWatingQueue();

    if (queue.length >= limit) {
      __fifo();
    }

    const _duration = 4000;

    // noinspection JSUnusedGlobalSymbols
    const toastId = toast(
      (props) => (

        <div className={cx('snackbar-root')}>
          <div className={ cx("snackbar-text", 'text-span') }>{t(`toast.submitbar.submitted`)}</div>
          <div className={ cx("snackbar-action", 'text-button') } onClick={action}>{t(`toast.submitbar.undo`)}</div>
          <div className={ cx("snackbar-cancel", 'text-span') } onClick={props.closeToast}>
            <XIcon />
          </div>
        </div>
      ),
      {
        position: 'bottom-center',
        autoClose: _duration,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: 0,
        theme: 'colored',
        transition: Slide,
        className: cx('root', { action: action !== undefined }),
        bodyClassName: cx('body'),
        containerId: 'snackbar-container-id',
        closeButton: () => null,
        toastId: uuidv4(),
        data: {
          duration: _duration,
        },
      } as unknown as ToastOptions,
    );

    return toastId as string;
  };

  useEffect(() => {
    toast.onChange(__onChangeToast);
  }, []);

  return { show, dismiss };
}

export default useSnackbar;


function XIcon() {
  return (
    <svg
      width='100%'
      height='100%'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12.5 3.5L3.5 12.5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.5 12.5L3.5 3.5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
