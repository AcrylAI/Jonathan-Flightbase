import { Properties as CSSProperties } from 'csstype';

interface OptionType {
  label: string;
  value: string | number;
  disabled: boolean;
  icon?: string;
  labelStyle?: CSSProperties;
  customStyle?: CSSProperties;
}

interface RadioArgs {
  options: OptionType[];
  name?: string;
  customStyle?: CSSProperties;
  isReadonly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const mockData: OptionType[] = [
  {
    label: 'radio1',
    value: 0,
    disabled: false,
    // icon: test,
  },
  {
    label: 'radio2',
    value: 1,
    disabled: false,
  },
  {
    label: 'radio3',
    value: 2,
    disabled: false,
  },
];

export { RadioArgs, OptionType, mockData };
