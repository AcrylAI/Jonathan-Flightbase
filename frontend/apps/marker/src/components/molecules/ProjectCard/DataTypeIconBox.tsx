import { Case, Default, Switch } from '@jonathan/react-utils';

import { AutolabelingIcon } from '@src/components/atoms/Icon';

import { BLUE104, LIME602, MONO205, RED502 } from '@src/utils/color';

import useUserSession from '@src/hooks/auth/useUserSession';

import { ImageIconColor, ImageIconGray } from '@src/static/images';

import style from './ProjectCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  workingStatus: boolean;
  autolabeling: 0 | 1 | 2 | 3;
  isOwner: boolean;
  dataType: string;
};

const DataTypeIconBox = ({
  workingStatus,
  autolabeling,
  isOwner,
  dataType,
}: Props) => {
  const {
    userSession: { isAdmin },
  } = useUserSession();

  if (!isOwner || !isAdmin || autolabeling === 0) {
    return (
      <div className={cx('image-box', workingStatus && 'working')}>
        <Switch>
          <Default>
            <img
              src={workingStatus ? ImageIconColor : ImageIconGray}
              alt=''
              style={{ width: '18px', height: '18px' }}
            />
          </Default>
          <Case condition={dataType === 'Text'}>
            {TextIcon(workingStatus ? BLUE104 : MONO205)}
          </Case>
        </Switch>
      </div>
    );
  }

  return (
    <Switch>
      <Case condition={autolabeling === 1}>
        <div className={cx('image-box-outline')}>
          <div className={cx('image-box', 'autolabeling-working')}>
            <AutolabelingIcon />
          </div>
        </div>
      </Case>
      <Case condition={autolabeling === 2}>
        <div className={cx('image-box', 'autolabeling-success')}>
          <AutolabelingIcon color={LIME602} />
        </div>
      </Case>
      <Case condition={autolabeling === 3}>
        <div className={cx('image-box', 'autolabeling-fail')}>
          <AutolabelingIcon color={RED502} />
        </div>
      </Case>
    </Switch>
  );
};

export default DataTypeIconBox;

const TextIcon = (color: string) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_616_7938)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M4.125 5.25C4.125 4.62868 4.62868 4.125 5.25 4.125H12H18.75C19.3713 4.125 19.875 4.62868 19.875 5.25V8.25C19.875 8.87132 19.3713 9.375 18.75 9.375C18.1287 9.375 17.625 8.87132 17.625 8.25V6.375H13.125V17.625H15C15.6213 17.625 16.125 18.1287 16.125 18.75C16.125 19.3713 15.6213 19.875 15 19.875H12H9C8.37868 19.875 7.875 19.3713 7.875 18.75C7.875 18.1287 8.37868 17.625 9 17.625H10.875V6.375H6.375V8.25C6.375 8.87132 5.87132 9.375 5.25 9.375C4.62868 9.375 4.125 8.87132 4.125 8.25V5.25Z'
          fill={color ?? ''}
        />
      </g>
      <defs>
        <clipPath id='clip0_616_7938'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
};
