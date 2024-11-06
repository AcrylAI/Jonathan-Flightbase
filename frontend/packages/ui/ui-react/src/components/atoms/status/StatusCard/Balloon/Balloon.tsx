import classNames from 'classnames/bind';
import style from './Balloon.module.scss';
const cx = classNames.bind(style);

type Props = {
  title?: string;
  description?: string;
};

function Balloon({ title, description }: Props) {
  return (
    <div className={cx('balloon')}>
      {title && (
        <>
          <div className={cx('title')}>{title}</div>
          <div className={cx('line')}></div>
        </>
      )}
      {description && <div className={cx('desc')}>{description}</div>}
    </div>
  );
}

Balloon.defaultProps = {
  title: undefined,
  description: undefined,
};

export default Balloon;
