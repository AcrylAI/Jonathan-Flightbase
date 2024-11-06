import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { Sypo } from "@src/components/atoms";
import { SelectOption } from "@src/werkzeug/defs/classes";
import Check from "./Core/Check";

import classNames from "classnames/bind";
import styles from "./Selection.module.scss";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
const cx = classNames.bind(styles);

type Props = {
  onChange: (value:Array<number>) => void;
  options: Array<SelectOption>;
  defaultValue?: Array<number>;
}

function CheckGroup({ onChange, options, defaultValue=[] }:Props) {
  const { canIUse } = useFileStatus();
  const [select, setSelect] = useState<Array<number>>(defaultValue);

  const onClickOption = (value:number, disabled:boolean=false) => {
    if(disabled || canIUse !== true) return;

    const _select = cloneDeep(select);
    const index = _select.findIndex(v => v === value);

    if(index === -1) _select.push(value);
    else             _select.splice(index, 1);

    setSelect(_select);
  }

  useEffect(() => {
    onChange(select);
  }, [select])

  useEffect(() => {
    setSelect(defaultValue);
  }, [defaultValue])

  return (
    <div className={ cx("Selection", "Check", (options.length < 3) && "twice") }>
      {
        options.map((v, i) => (
          <div className={ cx("option", (v.deleted===1 || canIUse !== true) && "disabled") } key={i}
               onClick={() => onClickOption(v.id, (v.deleted===1))}>
            <Check disabled={(v.deleted===1)} checked={select.includes(v.id)} />
            <Sypo type='p1' weight={400} title={v.name} ellipsis>{ v.name }</Sypo>
          </div>
        ))
      }
    </div>
  )
}

export default CheckGroup;