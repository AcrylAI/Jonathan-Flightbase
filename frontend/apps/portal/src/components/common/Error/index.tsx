/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';

// Style
import styles from './index.module.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

// Image
const LOGO = '/Images/logo/BI_Jonathan_v.png';

export type ErrorFallbackProps = {
  code: number;
  texts: string[];
  buttons?: ErrorFallbackBtnModel[];
  logo?: string;
};

export type ErrorFallbackBtnModel = {
  text: string;
  backgroundColor?: string;
  color?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

ErrorFallback.defaultProps = {
  buttons: null,
  logo: null,
};

function ErrorFallback(props: ErrorFallbackProps) {
  const router = useRouter();
  return (
    <div className={cx('container')}>
      <div className={cx('logo-container')}>
        {props.logo ? (
          <img src={props.logo} alt={String(props.code)} />
        ) : (
          <img src={LOGO} alt={String(props.code)} />
        )}
      </div>
      <div className={cx('content-container')}>
        <div className={cx('error-code')}>{props.code}</div>
        <div className={cx('text-container')}>
          {props.texts.map((item, idx) => (
            <div key={item + idx} className={cx('content-text')}>
              {item}
            </div>
          ))}
        </div>
        <div className={cx('btn-container')}>
          {props.buttons ? (
            <>
              {props.buttons.map((item, i) => (
                <button
                  key={i}
                  style={{
                    backgroundColor: item.backgroundColor ?? '#f5f7fb',
                    color: item.color ?? '#2d76f8',
                  }}
                  onClick={(e) => {
                    // eslint-disable-next-line no-unused-expressions
                    item.onClick && item.onClick(e);
                  }}
                >
                  {item.text}
                </button>
              ))}
            </>
          ) : (
            <button
              style={{ backgroundColor: '#2d76f8', color: '#f5f7fb' }}
              onClick={() => {
                router.push('/');
              }}
            >
              홈으로 이동하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
