import React, { useState } from 'react';
import styled from 'styled-components';
import { UserIcon, LockIcon, EyesClose, EyesOpen } from '@src/static/images';

type LeftIcon = 'user' | 'pw';

type Props = {
  value?: string;
  placeholder?: string;
  leftIcon?: LeftIcon;
  width?: number;
  height?: number;
  type?: string;
  iconWidth?: number;
  iconHeight?: number;
  focused?: boolean;
  focusHandler?: (test: any) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputText: React.FC<Props> = ({
  value = '',
  placeholder,
  leftIcon,
  width,
  height,
  type,
  iconWidth = 16,
  iconHeight = 16,
  focused = false,
  focusHandler = () => {},
  onChange,
}) => {
  const [eyesOpen, setEyesOpen] = useState<'open' | 'close'>('close');

  const onClickEyesOpen = () => {
    if (eyesOpen === 'open') setEyesOpen('close');
    else setEyesOpen('open');
  };

  return (
    <InputWrapper
      width={width}
      height={height}
      focused={focused}
      onFocus={focusHandler}
    >
      {leftIcon && (
        <Icon
          src={switchImageSrc(leftIcon)}
          iconWidth={iconWidth}
          iconHeight={iconHeight}
        />
      )}
      <Input
        value={value}
        placeholder={placeholder}
        type={eyesOpen === 'open' ? 'user' : type}
        onChange={onChange}
      />
      {type === 'password' && (
        <Icon
          src={eyesOpen === 'open' ? EyesOpen : EyesClose}
          iconWidth={24}
          iconHeight={24}
          marginRight={12}
          onClick={onClickEyesOpen}
        />
      )}
    </InputWrapper>
  );
};

const switchImageSrc = (type: LeftIcon) => {
  switch (type) {
    case 'user':
      return UserIcon;
    case 'pw':
      return LockIcon;
    default:
      return UserIcon;
  }
};

const InputWrapper = styled.div<{
  width?: number;
  height?: number;
  iconWidth?: number;
  iconHeight?: number;
  focused?: boolean;
}>`
  display: flex;
  border: ${({ focused }) =>
    focused ? `2px solid #2D76F8` : `1px solid #dedfe0`};
  border-radius: 4px;
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  height: ${({ height }) => (height ? `${height}px` : '100%')};
  align-items: center;
  padding: 5px 0 5px 20px;
`;

const Icon = styled.img<{
  iconWidth?: number;
  iconHeight?: number;
  marginRight?: number;
}>`
  width: ${({ iconWidth }) => (iconWidth ? `${iconWidth}px` : '100%')};
  height: ${({ iconHeight }) => (iconHeight ? `${iconHeight}px` : '100%')};
  margin-right: ${({ marginRight }) =>
    marginRight ? `${marginRight}px` : '0'};
`;

const Input = styled.input.attrs(({ type }) => ({
  type: type || 'text',
}))`
  border: none;
  outline: none;
  height: 98%;
  margin-left: 20px;
  flex: 1;
  font-size: 16px;
  font-family: spoqaR;
  ::placeholder {
    color: #c1c1c1;
  }
`;

InputText.defaultProps = {
  value: '',
  placeholder: undefined,
  leftIcon: undefined,
  width: undefined,
  height: undefined,
  type: undefined,
  iconWidth: 16,
  iconHeight: 16,
  focused: false,
  focusHandler: () => {},
  onChange: undefined,
};

export default React.memo(InputText);
