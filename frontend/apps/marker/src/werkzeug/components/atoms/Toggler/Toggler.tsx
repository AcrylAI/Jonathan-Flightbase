import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { Switch } from "@jonathan/ui-react";
import classNames from "classnames/bind";
import styles from "./Toggler.module.scss";
const cx = classNames.bind(styles);

type Props = {
  onChange: (value:boolean) => void;
  label?: ReactNode;
  colorSet?: 'blue'|'red';
  defaultValue?: boolean;
}

function Toggler({ onChange, label, colorSet='blue', defaultValue=false }:Props) {
  const [ value, setValue ] = useState<boolean>(defaultValue);

  const onChangeSwitch = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.checked);
  }

  const onClick = () => {
    setValue(!value);
  }

  useEffect(() => {
    onChange(value);
  }, [value])

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return (
    <div className={ cx("Toggler", colorSet) }>
      {
        label && <header className={ cx("label") } onClick={onClick}>{ label }</header>
      }
      <div className={ cx("switch-container") }>
        <Switch checked={value} onChange={onChangeSwitch} size={'small'} />
      </div>
    </div>
  )
}

export default Toggler;