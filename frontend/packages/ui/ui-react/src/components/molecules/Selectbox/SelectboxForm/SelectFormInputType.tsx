import { forwardRef, useRef } from 'react';

import i18n from 'react-i18next';

// Icon
import checkIconGray from '@src/static/images/icons/00-ic-basic-check-gray.svg';
import checkIconBlue from '@src/static/images/icons/00-ic-basic-check-blue.svg';

// types
import { Properties as CSSProperties } from 'csstype';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';
const cx = classNames.bind(style);

type Props = {
  type: string;
  status: string;
  isOpen: boolean;
  inputedValue: string;
  labelIcon: string;
  placeholder: string;
  isReadonly: boolean;
  isDisable: boolean;
  checkVisible: boolean;
  fontStyle?: CSSProperties;
  backgroundColor?: string;
  onListController: (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: string,
  ) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t?: i18n.TFunction<'translation'>;
};

const SelectFormInputType = forwardRef<HTMLDivElement, Props>(
  (
    {
      type,
      status,
      inputedValue,
      isOpen,
      labelIcon,
      placeholder,
      isReadonly,
      isDisable,
      checkVisible,
      fontStyle,
      backgroundColor,
      onListController,
      onInputChange,
      t,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onClick = () => {
      const input = inputRef.current;
      if (input) {
        input.focus();
      }
    };

    return (
      <div
        className={cx(
          'controller',
          status,
          isOpen && 'open',
          isReadonly && 'readonly',
          isDisable && 'disabled',
          checkVisible && 'check-box-div',
        )}
        ref={ref}
        style={{
          backgroundColor,
        }}
        onClick={onClick}
      >
        {checkVisible && (
          <img
            className={cx('input-check-icon')}
            src={
              status !== 'error' && inputedValue && inputedValue !== ''
                ? checkIconBlue
                : checkIconGray
            }
            alt='icon'
          />
        )}
        <input
          ref={inputRef}
          className={cx('input-box', checkVisible && 'check-box')}
          value={inputedValue}
          onChange={onInputChange}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            onListController(e, type);
          }}
          placeholder={t ? t(placeholder) : placeholder}
          readOnly={isReadonly}
          disabled={isDisable}
          style={{
            ...fontStyle,
            backgroundColor,
          }}
        />
        <img
          src={labelIcon}
          alt='arrow-icon'
          className={cx('arrow-icon', isOpen && 'open')}
        />
      </div>
    );
  },
);

SelectFormInputType.defaultProps = {
  fontStyle: undefined,
  t: undefined,
  backgroundColor: undefined,
};

export default SelectFormInputType;
