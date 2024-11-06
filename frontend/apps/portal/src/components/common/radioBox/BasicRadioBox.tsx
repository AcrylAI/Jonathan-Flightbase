// Style
import styles from './BasicRadioBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type BasicRadioBoxProps = {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

BasicRadioBox.defaultProps = {
  onChange: () => {},
};

function BasicRadioBox({
  id,
  name,
  label,
  checked,
  onChange = () => {},
}: BasicRadioBoxProps) {
  return (
    <>
      <input
        className={cx('radio-button')}
        id={id}
        name={name}
        type='radio'
        checked={checked}
        onChange={(e) => {
          onChange(e);
        }}
      ></input>
      <label className={cx('radio-label')} htmlFor={id}>
        {label}
      </label>
    </>
  );
}

export default BasicRadioBox;
