export interface CheckboxArgs {
  disabled?: boolean;
  label?: string;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckboxInit: CheckboxArgs = {
  disabled: false,
  label: 'Label',
};
