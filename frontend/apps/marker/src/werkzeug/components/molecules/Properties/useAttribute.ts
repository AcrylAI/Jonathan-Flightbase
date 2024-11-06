import { cloneDeep } from "lodash";
import { Property, SelectOption } from "@src/werkzeug/defs/classes";
import { Propertum } from "@src/werkzeug/defs/annotation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type Props = {
  property: Property;
  index: number;
  setState: Dispatch<SetStateAction<Propertum[]>>;
  state?: Propertum;
}

export function useAttribute({ property, setState, state=undefined }:Props) {
  const [multiDefVal, setMultiDefVal] = useState<Array<number>>(state?.data.map(v => v.id) || []);

  const singleDefVal = (() => {
    // if(property.type === 1 || !state) return property.options[0]?.id;
    if(property.type === 1 || !state || state.data.length === 0) return undefined;
    else       return state.data[0].id;
  })();

  useEffect(() => {
    if(state === undefined || state.select === 0) return;
    const copy = state?.data.map(v => v.id) || [];

    setMultiDefVal(cur => {
      const _prev = JSON.stringify(cur);
      const _copy = JSON.stringify(copy);

      return (_prev === _copy) ? cur:copy;
    })
  }, [state])

  const pushValue = (value:number|Array<number>) => {
    const data = (() => {
      if(Array.isArray(value)) {
        return (property.options.filter(v => value.includes(v.id)) as Array<SelectOption>);
      }
      else {
        const find = (property.options.find(v => v.id === value) as SelectOption|undefined);
        return (find) ? [find] : [];
      }
    })();

    const input:Propertum = {
      id: property.id,
      name: property.name,
      select: property.type,
      data
    }

    setState(curVal => {
      const newVal = cloneDeep(curVal);
      const idx = newVal.findIndex(v => v.id === input.id);

      if(idx === -1) newVal.push(input);
      else           newVal[idx] = input;

      return newVal;
    })
  }

  const onChangeSingle = (value:number) => {
    pushValue(value)
  }

  const onChangeMulti = (value:Array<number>) => {
    pushValue(value)
  }

  return {
    onChangeSingle, onChangeMulti,
    singleDefVal, multiDefVal
  }
}