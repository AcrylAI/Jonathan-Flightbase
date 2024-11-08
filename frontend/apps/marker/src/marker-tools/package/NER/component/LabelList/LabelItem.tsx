import { useSetRecoilState } from 'recoil';

import { Sypo } from '@src/components/atoms';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { labelListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { CommonProps, EventProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  label?: TextAnnotationType;
  cursor?: boolean;
  allowByManager?: boolean;
  allowByPath?: boolean;
} & CommonProps &
  Pick<EventProps, 'onClick'>;

function LabelItem({
  label,
  className,
  cursor = false,
  children,
  style,
  onClick,
  allowByManager = false,
  allowByPath = false,
}: Props) {
  const setLabels = useSetRecoilState<Array<TextAnnotationType>>(labelListAtom);

  const onClickDelete = () => {
    if (label && allowByManager && allowByPath) {
      setLabels((prev) => {
        const curr = [...prev];
        const fid = curr.findIndex((v) => v.id === label.id);
        curr.splice(fid, 1);
        return curr;
      });
    }
  };

  if (label) {
    return (
      <div
        className={cx(
          'labelbox-container',
          { 'no-cursor': !cursor },
          className,
        )}
        style={style}
        onClick={onClick}
      >
        <div className={cx('labelitem-wrap')}>
          <Sypo type='p1' weight='r'>
            {label.text}
          </Sypo>
        </div>
        {allowByPath && allowByManager && (
          <div className={cx('labelitem-button')} onClick={onClickDelete}>
            <XIcon />
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={cx('labelbox-container', { 'no-cursor': !cursor }, className)}
      style={style}
      onClick={onClick}
    >
      <Sypo type='p1' weight='r'>
        {children}
      </Sypo>
    </div>
  );
}

export default LabelItem;

function XIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_1026_1572)'>
        <path
          d='M7 1.3125C5.87512 1.3125 4.7755 1.64607 3.8402 2.27102C2.90489 2.89597 2.17591 3.78423 1.74544 4.82349C1.31496 5.86274 1.20233 7.00631 1.42179 8.10958C1.64124 9.21284 2.18292 10.2263 2.97833 11.0217C3.77374 11.8171 4.78716 12.3588 5.89043 12.5782C6.99369 12.7977 8.13726 12.685 9.17651 12.2546C10.2158 11.8241 11.104 11.0951 11.729 10.1598C12.3539 9.2245 12.6875 8.12488 12.6875 7C12.6859 5.49207 12.0862 4.04636 11.0199 2.98009C9.95365 1.91382 8.50793 1.31409 7 1.3125ZM9.05953 8.44047C9.10018 8.48112 9.13243 8.52937 9.15442 8.58248C9.17642 8.63559 9.18775 8.69251 9.18775 8.75C9.18775 8.80749 9.17642 8.86441 9.15442 8.91752C9.13243 8.97063 9.10018 9.01888 9.05953 9.05953C9.01889 9.10018 8.97063 9.13242 8.91752 9.15442C8.86441 9.17642 8.80749 9.18774 8.75 9.18774C8.69252 9.18774 8.63559 9.17642 8.58249 9.15442C8.52938 9.13242 8.48112 9.10018 8.44047 9.05953L7 7.61852L5.55953 9.05953C5.51889 9.10018 5.47063 9.13242 5.41752 9.15442C5.36441 9.17642 5.30749 9.18774 5.25 9.18774C5.19252 9.18774 5.13559 9.17642 5.08249 9.15442C5.02938 9.13242 4.98112 9.10018 4.94047 9.05953C4.89982 9.01888 4.86758 8.97063 4.84558 8.91752C4.82358 8.86441 4.81226 8.80749 4.81226 8.75C4.81226 8.69251 4.82358 8.63559 4.84558 8.58248C4.86758 8.52937 4.89982 8.48112 4.94047 8.44047L6.38149 7L4.94047 5.55953C4.85838 5.47744 4.81226 5.3661 4.81226 5.25C4.81226 5.1339 4.85838 5.02256 4.94047 4.94047C5.02256 4.85838 5.13391 4.81226 5.25 4.81226C5.3661 4.81226 5.47744 4.85838 5.55953 4.94047L7 6.38148L8.44047 4.94047C8.48112 4.89982 8.52938 4.86758 8.58249 4.84558C8.63559 4.82358 8.69252 4.81226 8.75 4.81226C8.80749 4.81226 8.86441 4.82358 8.91752 4.84558C8.97063 4.86758 9.01889 4.89982 9.05953 4.94047C9.10018 4.98112 9.13243 5.02937 9.15442 5.08248C9.17642 5.13559 9.18775 5.19251 9.18775 5.25C9.18775 5.30749 9.17642 5.36441 9.15442 5.41752C9.13243 5.47063 9.10018 5.51888 9.05953 5.55953L7.61852 7L9.05953 8.44047Z'
          fill='#82868E'
        />
      </g>
      <defs>
        <clipPath id='clip0_1026_1572'>
          <rect width='14' height='14' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}
