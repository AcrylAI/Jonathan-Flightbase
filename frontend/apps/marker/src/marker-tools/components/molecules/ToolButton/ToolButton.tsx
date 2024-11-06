import { ToggleButton, Tooltip } from '@tools/components/atoms';
import { CommonProps, EventProps, InputProps } from '@tools/types/components';

type Props = {
  title?: string;
  shortcut?: string;
} & Pick<CommonProps, 'children'> &
  Pick<InputProps, 'disabled' | 'selected'> &
  Pick<EventProps, 'onClick'>;

function ToolButton({
  title,
  shortcut,
  children,
  selected,
  disabled,
  onClick,
}: Props) {
  if (disabled) {
    return (
      <ToggleButton selected={selected} onClick={onClick} disabled={disabled}>
        {children}
      </ToggleButton>
    );
  }

  return (
    <Tooltip
      contents={<Title text={title ?? ''} shortcut={shortcut ?? ''} />}
      point='e'
    >
      <ToggleButton selected={selected} onClick={onClick} disabled={disabled}>
        {children}
      </ToggleButton>
    </Tooltip>
  );
}

export type { Props as ToolButtonPropType };

export default ToolButton;

type TitleProps = {
  text: string;
  shortcut: string;
};

function Title({ text, shortcut }: TitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily: 'SpoqaR, sans-serif',
          fontSize: 11,
        }}
      >
        {text}
      </span>
      {/*<span*/}
      {/*  style={{*/}
      {/*    fontFamily: 'SpoqaR, sans-serif',*/}
      {/*    fontSize: 11,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {shortcut}*/}
      {/*</span>*/}
    </div>
  );
}
