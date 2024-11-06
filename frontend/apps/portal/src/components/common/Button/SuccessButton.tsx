// Style
import styles from './SuccessButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

export type SuccessButtonProps = {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

SuccessButton.defaultProps = {
  onClick: () => {},
  disabled: false,
};

function SuccessButton({
  text,
  onClick = () => {},
  disabled = false,
}: SuccessButtonProps) {
  return (
    <>
      <button
        className={cx('success-button')}
        onClick={(e) => {
          onClick(e);
        }}
        disabled={disabled}
      >
        {text}
      </button>
    </>
  );
}

export default SuccessButton;
