import { forwardRef } from 'react';

import i18n from 'react-i18next';

// types
import { Properties as CSSProperties } from 'csstype';
import { ListType } from '../types';

// Utils
import { arrayToString } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';

const cx = classNames.bind(style);

type Props = {
  type: string;
  status: string;
  isOpen: boolean;
  selectedItem: ListType | null;
  labelIcon: string;
  isReadonly: boolean;
  isDisable: boolean;
  theme: ThemeType;
  placeholder: string;
  backgroundColor?: string;
  fontStyle?: CSSProperties;
  placeholderStyle?: CSSProperties;
  onListController: (
    e: React.KeyboardEvent<HTMLDivElement>,
    selectboxType: string,
  ) => void;
  t?: i18n.TFunction<'translation'>;
};

const SelectFormDefaultType = forwardRef<HTMLDivElement, Props>(
  (
    {
      type,
      status,
      isOpen,
      selectedItem,
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
    },
    ref,
  ) => {
    return (
      <div
        className={cx(
          'controller',
          status,
          isOpen && 'open',
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
        {selectedItem ? (
          <span style={fontStyle} className={cx(selectedItem?.iconAlign)}>
            {selectedItem?.icon && (
              <img
                className={cx('label-icon')}
                src={selectedItem.icon}
                alt='icon'
                style={selectedItem.iconStyle}
              />
            )}
            <label>{arrayToString(selectedItem.label, t)}</label>
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

SelectFormDefaultType.defaultProps = {
  fontStyle: undefined,
  placeholderStyle: undefined,
  backgroundColor: undefined,
  t: undefined,
};

export default SelectFormDefaultType;
