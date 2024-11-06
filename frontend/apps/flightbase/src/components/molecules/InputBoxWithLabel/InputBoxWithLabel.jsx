// Atoms
import InputLabel from '@src/components/atoms/input/InputLabel';

// CSS Module
import classNames from 'classnames/bind';
import style from './InputBoxWithLabel.module.scss';
const cx = classNames.bind(style);

/**
 * 인풋에 라벨과 에러 메세지 영역을 붙여주는 컴포넌트 (molecules)
 * @param {{
 *    labelText: string,
 *    optionalText: string | undefined,
 *    labelRight: string | JSX.Element | undefined,
 *    labelSize: string | undefined,
 *    optionalSize: string | undefined,
 *    errorMsg: string | undefined | null,
 *    children: JSX.Element,
 *    leftLabel: boolean | undefined,
 *    disableErrorMsg: boolean | undefined,
 *    bgBox: boolean | undefined,
 * }} props
 * @component
 * @example
 *
 *
 * return (
 *  <InputBoxWithLabel
 *    labelText='training name'
 *    optionalText='Optional'
 *    labelRight={<Tooltip contents='' />}
 *    labelSize='small'
 *    optionalSize='small'
 *    errorMsg='empty'
 *    leftLabel={false}
 *    disableErrorMsg={false}
 *    bgBox
 *  >
 *    <input type='text' />
 *  </InputBoxWithLabel>
 * );
 *
 */
function InputBoxWithLabel({
  labelText,
  optionalText,
  labelRight,
  labelSize = 'medium',
  optionalSize = 'medium',
  errorMsg,
  children,
  leftLabel = false,
  disableErrorMsg = false,
  bgBox = false,
}) {
  return (
    <div
      className={cx(
        'wrapper',
        leftLabel ? 'row' : 'column',
        bgBox ? 'bg-box' : '',
      )}
    >
      <InputLabel
        labelText={labelText}
        optionalText={optionalText}
        labelRight={labelRight}
        labelSize={labelSize}
        optionalSize={optionalSize}
      />
      {children}
      {!disableErrorMsg && <span className={cx('error-msg')}>{errorMsg}</span>}
    </div>
  );
}

export default InputBoxWithLabel;
