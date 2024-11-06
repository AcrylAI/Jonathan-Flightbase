import { Sypo } from "@src/components/atoms";

import classNames from "classnames/bind";
import styles from "./LabelList.module.scss";
import { Fragment } from "react";
const cx = classNames.bind(styles);

type SingleProps = {
  name: string;
  option: Array<string>;
}
function Single({ name, option }:SingleProps) {
  const STROKE = "─";

  return (
    <section className={ cx("Property", "Single") }>
      <header className={ cx("name") }>
        <Sypo type="p2" weight={400} title={name} ellipsis>{name}</Sypo>
      </header>
      {
        option.map((v, i) => (
          <Fragment key={`Fragment_key_${i}`}>
            <div className={ cx("stroke") }>
              {STROKE}
            </div>
            <article className={ cx("option") }>
              <Sypo type="p2" weight={400} title={v} ellipsis>{v}</Sypo>
            </article>
          </Fragment>
        ))
      }
      {/*<div className={ cx("stroke") }>*/}
      {/*  {STROKE}*/}
      {/*</div>*/}
      {/*<article className={ cx("option") }>*/}
      {/*  {*/}
      {/*    option.map((v, i) => (*/}
      {/*      <Fragment key={`Fragment_key_${i}`}>*/}
      {/*        <Sypo type="p2" weight={400} title={v} ellipsis>{v}</Sypo>*/}
      {/*      </Fragment>*/}
      {/*    ))*/}
      {/*  }*/}
      {/*</article>*/}
    </section>
  )
}

type MultiProps = {
  name: string;
  options: Array<string>;
}
function Multi({ name, options }:MultiProps) {
  const LENGTH = options.length;
  const STROKE = (index:number) => {
    if(LENGTH === 1) {
      return "─";
    }

    switch (index) {
      case 0: return "┬";
      case (LENGTH-1): return "└";
      default: return "├";
    }
  }

  return (
    <section className={ cx("Property", "Multi") }>
      <header className={ cx("name") }>
        <Sypo type="p2" weight={400} title={name} ellipsis>{name}</Sypo>
      </header>
      <div className={ cx("option-tree") }>
        {
          options.map((v, i) => (
            <div className={ cx("option-box") } key={i}>
              <div className={ cx("stroke") }>
                {STROKE(i)}
              </div>
              <article className={ cx("option") }>
                <Sypo type="p2" weight={400} title={v} ellipsis>{v}</Sypo>
              </article>
            </div>
          ))
        }
      </div>
    </section>
  )
}

export {
  Single, Multi
}