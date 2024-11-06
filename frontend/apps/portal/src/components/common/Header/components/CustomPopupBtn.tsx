/* eslint-disable @next/next/no-img-element */

// Style
import className from 'classnames/bind';
import style from './ContextPopupBtn.module.scss';

const cx = className.bind(style);

// Image
const ArrowUpIcon = '/Images/00-ic-basic-arrow-02-up.svg';
const ArrowDownIcon = '/Images/00-ic-basic-arrow-02-down.svg';

export type CustomPopupBtnProps = {
  children: JSX.Element;
  show: boolean;
  customStyle?: Record<string, unknown>;
  disableArrow?: boolean;
  setShow: (show: boolean) => void;
};

CustomPopupBtn.defaultProps = {
  customStyle: {},
  disableArrow: false,
};

function CustomPopupBtn(props: CustomPopupBtnProps) {
  const onClickButton = () => {
    props.setShow(!props.show);
  };
  return (
    <button
      className={cx('name', props.show && 'active')}
      onClick={() => {
        onClickButton();
      }}
      style={props.customStyle ?? {}}
    >
      {props.children}
      {!props.disableArrow && (
        <img
          className={cx('arrow')}
          src={props.show ? ArrowUpIcon : ArrowDownIcon}
          alt='arrow-icon'
        />
      )}
    </button>
  );
}
export default CustomPopupBtn;
