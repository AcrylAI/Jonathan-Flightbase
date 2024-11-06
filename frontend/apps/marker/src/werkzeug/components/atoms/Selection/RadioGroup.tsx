import { useEffect, useState } from "react";
import { Sypo } from "@src/components/atoms";
import { SelectOption } from "@src/werkzeug/defs/classes";
import Radio from "./Core/Radio";

import classNames from "classnames/bind";
import styles from "./Selection.module.scss";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
const cx = classNames.bind(styles);

type Props = {
  onChange: (value:number) => void;
  options: Array<SelectOption>;
  defaultValue?: number;
}

function RadioGroup({ onChange, options, defaultValue }:Props) {
  const { canIUse } = useFileStatus();
  const [select, setSelect] = useState<number>(defaultValue ?? -1);

  const onClickOption = (id:number, disabled:boolean=false) => {
    if(disabled || canIUse !== true) return;

    if(id === select) {
      setSelect(-1);
    }
    else {
      setSelect(id);
    }
  }

  useEffect(() => {
    onChange(select);
  }, [select])

  useEffect(() => {
    setSelect(defaultValue ?? -1);
  }, [defaultValue])

  return (
    <div className={ cx("Selection", "Radio", (options.length < 3) && "twice") }>
      {
        options.map((v, i) => (
          <div className={ cx("option", (v.deleted===1 || canIUse !== true) && "disabled") } key={i}
               onClick={() => onClickOption(v.id, (v.deleted===1))}>
            <Radio disabled={(v.deleted===1)} checked={select === v.id} />
            <Sypo type='p1' weight={400} title={v.name} ellipsis>{ v.name }</Sypo>
          </div>
        ))
      }
    </div>
  )
}

export default RadioGroup;