import { CareRightIcon } from '@tools/assets/CommonIcon';
import { CommonProps, EventProps } from '@tools/types/components';

type EventIconProps = Pick<CommonProps, 'className'> &
  Pick<EventProps, 'onClick'>;

export function CareRight({ className }: Pick<CommonProps, 'className'>) {
  return (
    <div className={className} style={{ color: '#82868E' }}>
      <CareRightIcon />
    </div>
  );
}

export function Checks({ className, onClick }: EventIconProps) {
  return (
    <div className={className} onClick={onClick} style={{ color: '#009F5E' }}>
      <svg
        width='14'
        height='14'
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_7994_47726)'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M8.6483 4.3819L2.97495 9.95393L0.101562 7.13217L0.867918 6.3518L2.97491 8.42093L7.8819 3.60156L8.6483 4.3819Z'
            fill='currentColor'
          />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M13.8985 4.3819L8.22519 9.95393L6.11523 7.88195L6.88158 7.10156L8.22513 8.42093L13.1321 3.60156L13.8985 4.3819Z'
            fill='currentColor'
          />
        </g>
        <defs>
          <clipPath id='clip0_7994_47726'>
            <rect width='14' height='14' fill='transparent' />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export function Delete({ className, onClick }: EventIconProps) {
  return (
    <div className={className} onClick={onClick} style={{ color: '#ED2E20' }}>
      <svg
        width='14'
        height='14'
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_7994_47730)'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M7.77336 6.99996L11.7109 3.06246L10.9375 2.28906L6.99996 6.22656L3.06246 2.28906L2.28906 3.06246L6.22656 6.99996L2.28906 10.9375L3.06246 11.7109L6.99996 7.77336L10.9375 11.7109L11.7109 10.9375L7.77336 6.99996Z'
            fill='currentColor'
          />
        </g>
        <defs>
          <clipPath id='clip0_7994_47730'>
            <rect width='14' height='14' fill='transparent' />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
