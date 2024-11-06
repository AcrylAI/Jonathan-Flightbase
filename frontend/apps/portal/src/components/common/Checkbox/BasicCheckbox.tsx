// Style
import styles from './BasicCheckbox.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

export type BasicCheckboxProps = {
  id: string;
  label: string | JSX.Element;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function BasicCheckbox({
  id,
  label,
  checked = false,
  onChange,
}: BasicCheckboxProps) {
  return (
    <div className={cx('basic-check-box')}>
      <input
        id={id}
        type='checkbox'
        checked={checked}
        onChange={(e) => {
          onChange(e);
        }}
      ></input>
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default BasicCheckbox;
