import React, { useEffect, useState } from 'react';
import i18n from 'react-i18next';

// types
import { Properties as CSSProperties } from 'csstype';
import { ListType } from '../types';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';

const cx = classNames.bind(style);

interface Props {
  type: string;
  status: string;
  isOpen: boolean;
  labelIcon: string;
  isReadonly: boolean;
  isDisable: boolean;
  theme: string;
  placeholder: string;
  backgroundColor?: string;
  fontStyle?: CSSProperties;
  placeholderStyle?: CSSProperties;
  onListController: (
    e: React.KeyboardEvent<HTMLDivElement>,
    selectboxType: string,
  ) => void;
  t?: i18n.TFunction<'translation'>;
  label: string;
  checkboxList: any;
  checkboxMultiLang?: string;
}

const CheckboxFormDefault = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      type,
      status,
      isOpen,
      labelIcon,
      isReadonly,
      backgroundColor,
      isDisable,
      theme,
      placeholder,
      placeholderStyle,
      fontStyle,
      onListController,
      t,
      label,
      checkboxList,
      checkboxMultiLang,
    },
    ref,
  ) => {
    const [list, setList] = useState<any[]>([]);

    useEffect(() => {
      setList(Array.from(checkboxList));
    }, [checkboxList]);

    return (
      <div
        className={cx(
          'controller',
          status,
          theme,
          isReadonly && 'readonly',
          isDisable && 'disabled',
        )}
        ref={ref}
        tabIndex={-1}
        onKeyDown={(e) => {
          onListController(e, type);
        }}
        style={{
          backgroundColor,
        }}
      >
        {list.length > 0 ? (
          <span>
            {list[0].name ? list[0].name : list[0].label}
            {list.length > 1 && ` ${checkboxMultiLang} ${list.length - 1}`}
          </span>
        ) : (
          <span style={placeholderStyle} className={cx('placeholder')}>
            {placeholder || ''}
          </span>
        )}

        <img
          src={labelIcon}
          alt='arrow-icon'
          className={cx('arrow-icon', isOpen && 'open')}
        />
      </div>
    );
  },
);

CheckboxFormDefault.defaultProps = {
  fontStyle: undefined,
  placeholderStyle: undefined,
  backgroundColor: undefined,
  t: undefined,
  checkboxMultiLang: undefined,
};

export default CheckboxFormDefault;
