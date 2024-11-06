// Style
import styles from './BasicButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type BasicButtonProps = {
  type: string;
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

BasicButton.defaultProps = {
  onClick: () => {},
};

function BasicButton(props: BasicButtonProps) {
  let icon = '';

  switch (props.type) {
    case 'email':
      icon = 'email';
      break;
    default:
      break;
  }

  return (
    <>
      <button
        onClick={(e) => {
          if (props.onClick) props.onClick(e);
        }}
        className={cx('basic-btn', `${icon}`)}
      >
        {props.text}
      </button>
    </>
  );
}

export default BasicButton;
