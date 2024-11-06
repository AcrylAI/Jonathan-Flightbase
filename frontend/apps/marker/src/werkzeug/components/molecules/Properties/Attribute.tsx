import { Sypo } from "@src/components/atoms";
import { Select } from "@src/werkzeug/components/atoms";
import { Props, useAttribute } from "./useAttribute";

import classNames from "classnames/bind";
import styles from "./Properties.module.scss";
const cx = classNames.bind(styles);

const { Single, Multi } = Select;

function Attribute({ property, index, setState, state=undefined }:Props) {
  const {
    singleDefVal,
    multiDefVal,
    onChangeSingle,
    onChangeMulti
  } = useAttribute({ property, index, setState, state });

  return (
    <section className={ cx("Attribute") }>
      <aside className={ cx("attr-side") }>
        <div className={ cx("badge") }>{index}</div>
        <div className={ cx("stroke") } />
      </aside>
      <article className={ cx("attr-body") }>
        <header className={ cx("attr-header") }>
          <Sypo type='p1' weight={500} ellipsis title={property.name}>{property.name}</Sypo>
          {
            (property.required) ? <Sypo type='p1' weight={500} color='red'>*</Sypo> : null
          }
        </header>
        {
          property.type === 0
          ? <Single onChange={onChangeSingle} options={property.options} defaultValue={singleDefVal} />
          : <Multi onChange={onChangeMulti} options={property.options} defaultValue={multiDefVal} />
        }
      </article>
    </section>
  )
}

export default Attribute;