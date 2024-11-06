// Style
import styles from './TermCheckbox.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type TermCheckboxProps = {
  id: string;
  text: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

TermCheckbox.defaultProps = {
  checked: false,
};

function TermCheckbox({
  id,
  text,
  checked = false,
  onChange,
}: TermCheckboxProps) {
  return (
    <div className={cx('basic-check-box')}>
      <input
        id={id}
        type='checkbox'
        checked={checked}
        onChange={onChange}
      ></input>
      <label htmlFor={id}>{text}</label>
    </div>
  );
}

export default TermCheckbox;
