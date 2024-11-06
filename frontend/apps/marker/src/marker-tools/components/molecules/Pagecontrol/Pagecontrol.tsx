import { useLocation, useNavigate } from 'react-router-dom';

import { Sypo } from '@src/components/atoms';

import styles from './Pagecontrol.module.scss';
import classNames from 'classnames/bind';

import { Button } from '@tools/components/atoms';
import { CommonProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  prevId?: number;
  nextId?: number;
  value?: number;
  total?: number;
  onSave?: () => Promise<void>;
} & Omit<CommonProps, 'onClick' | 'children'>;

function Pagecontrol({
  value,
  total,
  prevId,
  nextId,
  onSave,
  className,
  style,
}: Props) {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();

  const onClickMove = async (pageId: number) => {
    const path = pathname.split('/');
    path.pop();
    path.push(pageId.toString());
    const url = path.join('/');

    if (onSave) {
      await onSave();
    }
    navigate(url, { state });
  };

  return (
    <div className={cx('pagecontrol', className)} style={style}>
      <Button
        disabled={(prevId ?? 0) === 0}
        varient='text'
        onClick={() => onClickMove(prevId ?? 0)}
        color='custom'
        style={{ padding: 0 }}
      >
        <CareLeft />
      </Button>

      {value != undefined && total != undefined && (
        <div className={cx('box')}>
          <Sypo userSelect={false} type='h4'>{`${value} / ${total}`}</Sypo>
        </div>
      )}

      <Button
        disabled={(nextId ?? 0) === 0}
        varient='text'
        color='custom'
        onClick={() => onClickMove(nextId ?? 0)}
        style={{ padding: 0 }}
      >
        <CareRight />
      </Button>
    </div>
  );
}

export type { Props as PagecontrolPropType };

export default Pagecontrol;

function CareRight() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9.80539 6.53735C9.89775 6.50133 9.99841 6.49219 10.0957 6.511C10.1931 6.5298 10.2831 6.57577 10.3554 6.6436L15.3554 11.6436C15.4493 11.7384 15.502 11.8664 15.502 11.9999C15.502 12.1333 15.4493 12.2613 15.3554 12.3561L10.3554 17.3561C10.2594 17.4478 10.1319 17.4993 9.99914 17.4999C9.93278 17.4996 9.86706 17.4868 9.80539 17.4624C9.71439 17.4241 9.63675 17.3598 9.58225 17.2775C9.52775 17.1952 9.49883 17.0986 9.49914 16.9999V6.99985C9.49883 6.90114 9.52775 6.80455 9.58225 6.72224C9.63675 6.63994 9.71439 6.5756 9.80539 6.53735V6.53735Z'
        fill='currentColor'
      />
    </svg>
  );
}

function CareLeft() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M14.1946 6.53735C14.1023 6.50133 14.0016 6.49219 13.9043 6.511C13.8069 6.5298 13.7169 6.57577 13.6446 6.6436L8.64461 11.6436C8.55072 11.7384 8.49805 11.8664 8.49805 11.9999C8.49805 12.1333 8.55072 12.2613 8.64461 12.3561L13.6446 17.3561C13.7406 17.4478 13.8681 17.4993 14.0009 17.4999C14.0672 17.4996 14.1329 17.4868 14.1946 17.4624C14.2856 17.4241 14.3633 17.3598 14.4178 17.2775C14.4723 17.1952 14.5012 17.0986 14.5009 16.9999V6.99985C14.5012 6.90114 14.4723 6.80455 14.4178 6.72224C14.3633 6.63994 14.2856 6.5756 14.1946 6.53735V6.53735Z'
        fill='currentColor'
      />
    </svg>
  );
}
