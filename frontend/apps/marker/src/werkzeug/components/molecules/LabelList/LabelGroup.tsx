import { MouseEvent, useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { cloneDeep } from "lodash";
import { MONO204, BLUE104 } from "@src/utils/color";
import { Sypo } from "@src/components/atoms";
import Icon from "@src/werkzeug/assets";
import { Label } from "@src/werkzeug/defs/annotation";
import { labelListAtom, selectedAnnotationAtom } from "@src/werkzeug/stores/paintStore";
import { Porcelain, DropView } from "@src/werkzeug/components/atoms";
import { itos } from "@src/werkzeug/lib/Util";
import Item from "./LabelItem";
import classNames from "classnames/bind";
import styles from "./LabelList.module.scss";
const cx = classNames.bind(styles);
const { FoldIcon, BBoxIcon, PolygonIcon, EyeIcon } = Icon;

type Props = {
  label:Label;
}

function LabelGroup({ label }:Props) {
  const selectedAnno = useRecoilValue(selectedAnnotationAtom);
  const [labelList, setLabelList] = useRecoilState(labelListAtom);
  const [isOpen, setIsOpen] = useState(false);

  const onClickFold = () => {
    if(label.classId === selectedAnno?.classId) {
      setIsOpen(true)
    }
    else {
      setIsOpen(!isOpen);
    }
  }

  const onClickVisible = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const currentIdx = labelList.findIndex(v => v.classId === label.classId);

    if(currentIdx !== -1) {
      const _labelList = cloneDeep(labelList);
      _labelList[currentIdx].visibility = !_labelList[currentIdx].visibility;
      setLabelList(_labelList);
    }
  }

  const renderType = () => {
    switch (label.type) {
      case 1: return <BBoxIcon />;
      case 2: return <PolygonIcon />;
      case 3: return undefined;
      default:
        return undefined;
    }
  }

  useEffect(() => {
    const openFlag = (
      !!selectedAnno
      && selectedAnno.add !== true
      && selectedAnno.classId === label.classId
    )

    if(label.visibility) {
      if(openFlag) {
        setIsOpen(true);
      }
    }
  }, [isOpen, selectedAnno, label])

  return (
    <div className={ cx("LabelGroup") }>
      <Porcelain>
        <div className={ cx("container", (!label.visibility) && 'hidden') }>
          <div className={ cx("namearea") } onClick={onClickFold}>
            <div className={ cx("fold", isOpen && "active") }>
              <FoldIcon size="nx" />
            </div>
            <div className={ cx("namebox") }>
              <Sypo type='p1' title={label.className} weight={400} ellipsis>{ label.className }</Sypo>
            </div>
            <Sypo type='p1' color={(label.annotation.length === 0) ? MONO204:BLUE104} weight={400} title={String(label.annotation.length)}>
              ({ itos(label.annotation.length) })
            </Sypo>
          </div>
          <div className={ cx("typearea") }>
            { renderType() }
            <div className={ cx("show") } onClick={onClickVisible}>
              { (label.visibility) ? <EyeIcon /> : <EyeIcon alt /> }
            </div>
          </div>
        </div>
      </Porcelain>

      {
        label.annotation.length > 0 &&
	      <DropView open={isOpen}>
		      <div className={ cx("inventory") }>
            {
              label.annotation.map((v, i) => (
                <Item group={label.className} annotation={v} show={label.visibility} key={i} />
              ))
            }
		      </div>
	      </DropView>
      }
    </div>
  )
}

export default LabelGroup;
