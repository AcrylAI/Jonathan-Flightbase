import { MouseEvent, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { cloneDeep } from "lodash";
import { Sypo } from "@src/components/atoms";
import { resetAnno } from "@src/werkzeug/lib/Util";
import { Annotation } from "@src/werkzeug/defs/annotation";
import { labelListAtom, selectedAnnotationAtom } from "@src/werkzeug/stores/paintStore";
import Icon from "@src/werkzeug/assets";
import { Porcelain, DropView } from "@src/werkzeug/components/atoms";
import { Single, Multi } from "./Property";
import classNames from "classnames/bind";
import styles from "./LabelList.module.scss";
const cx = classNames.bind(styles);
const { EyeIcon, FoldIcon } = Icon;

type Props = {
  group: string;
  annotation: Annotation;
  show?: boolean;
}

function LabelItem({ group, annotation, show=true }:Props) {
  const [selectedAnno, setSelectedAnno] = useRecoilState(selectedAnnotationAtom);
  const [labelList, setLabelList] = useRecoilState(labelListAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [isShow, setIsShow] = useState(show);
  // const [isActive, setIsActive] = useState(false);

  const labelName = (() => {
    return `${group}_${annotation.id}`;
  })();

  const onClickItem = () => {
    if(selectedAnno?.id === annotation.id || resetAnno(selectedAnno)) {
      setSelectedAnno(undefined);
    }
    else {
      setSelectedAnno(cloneDeep(annotation));
    }
  }

  const onClickFold = (e:MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  }

  const setLabelVisibleByIsShowState = (visible:boolean) => {
    const lidx = labelList.findIndex(v => v.classId === annotation.classId);
    if(lidx === -1) return;

    const aidx = labelList[lidx].annotation.findIndex(v => v.id === annotation.id);
    if(aidx === -1) return;

    setLabelList(curVal => {
      const newVal = cloneDeep(curVal);
      newVal[lidx].annotation[aidx].visibility = visible;
      return newVal;
    })
  }

  const onClickVisible = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if(!show) return;
    setIsShow(!isShow);

    setLabelVisibleByIsShowState(!isShow);
  }

  useEffect(() => {
    setIsShow(show);
    setLabelVisibleByIsShowState(show);
  }, [show])

  useEffect(() => {
    const flag = (
      !!selectedAnno
      && selectedAnno.add !== true
      && selectedAnno.id === annotation.id
    );

    if(flag) {
      setIsOpen(true);
    }
    else {
      setIsOpen(false);
    }
  }, [selectedAnno, group])

  useEffect(() => {
    /* @optionalBinding */ if(labelList.length === 0 || !selectedAnno) return;
    const lidx = labelList.findIndex(v => v.classId === selectedAnno.classId);
    if(lidx === -1) return;

    const aidx = labelList[lidx].annotation.findIndex(v => v.id === selectedAnno.id);
    if(aidx === -1) return;

    if(!labelList[lidx].annotation[aidx].visibility) {
      setSelectedAnno(undefined);
    }
  }, [labelList, selectedAnno])

  return (
    <Porcelain color={ (selectedAnno?.id === annotation.id) ? '#EEF0F6':undefined }>
      <div className={ cx("LabelItem") } id={`label_${annotation.id}`}>
        <header className={ cx("header", !isShow && 'deactive') } onClick={onClickItem} >
          <div className={ cx("fold", isOpen && "active") } onClick={onClickFold} >
            <FoldIcon size="nx" />
          </div>
          <div className={ cx("text") }>
            <Sypo type='p1' title={labelName} weight={400} ellipsis>{labelName}</Sypo>
          </div>
          <div className={ cx("show") } onClick={onClickVisible}>
            {
              (isShow) ? <EyeIcon /> : <EyeIcon alt />
            }
          </div>
        </header>

        {
          annotation.properties.length > 0 &&
	        <DropView open={isOpen}>
		        <div className={ cx("properties") }>
              {
                annotation.properties.map((v, i) => {
                  if(v.select === 0) {
                    return <Single name={v.name} option={/*v.data[0].name*/ v.data.map(v => v.name)} key={i} />;
                  }
                  else {
                    return <Multi name={v.name} options={v.data.map(v => v.name)} key={i} />;
                  }
                })
              }
		        </div>
	        </DropView>
        }
      </div>
    </Porcelain>
  )
}

export default LabelItem;