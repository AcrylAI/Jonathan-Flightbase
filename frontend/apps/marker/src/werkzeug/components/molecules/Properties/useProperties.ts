import { useRecoilState, useRecoilValue } from "recoil";
import { classListAtom } from "@src/werkzeug/stores/fetchStore";
import { labelListAtom, selectedAnnotationAtom, shapeModifyModeAtom } from "@src/werkzeug/stores/paintStore";
import { useEffect, useState } from "react";
import { Propertum } from "@src/werkzeug/defs/annotation";
import { Property } from "@src/werkzeug/defs/classes";
import { cloneDeep } from "lodash";
import { checkPropery, resetAnno } from "@src/werkzeug/lib/Util";
import useLabelLog from "@src/werkzeug/hooks/store/useLabelLog";

function useProperties() {
  const classList = useRecoilValue(classListAtom);
  const shapeModify = useRecoilValue(shapeModifyModeAtom);
  const [labelList, setLabelList] = useRecoilState(labelListAtom);
  const [selectedAnno, setSelectAnno] = useRecoilState(selectedAnnotationAtom);

  const { addLabelLog, editLabelLog } = useLabelLog();

  const [show, setShow] = useState<boolean>(false);
  const [opacity, setOpacity] = useState(-1);
  const [selectProperty, setSelectProperty] = useState<Array<Propertum>>([]);
  const [properties, setProperties] = useState<Array<Property>>([]);
  const [isDone, setIsDone] = useState<boolean>(false);

  const anchorId = (() => {
    if(!selectedAnno) return undefined;

    const classes = classList.find(v => v.id === selectedAnno.classId);
    if(!classes || !checkPropery(classes)) { return undefined; }

    if(selectedAnno.type === 1) {
      return `rect#rect_${selectedAnno.id}`;
    }
    else {
      return `polygon#poly_${selectedAnno.id}`;
    }
  })();

  const onClickClose = () => {
    setOpacity(-1);
    setShow(false);

    if(resetAnno(selectedAnno)) {
      setSelectAnno(undefined);
    }
  }

  /** Property를 수정 또는 생성할 때, 저장 버튼을 눌렀을 경우에 대한 이벤트 핸들러 */
  const onClickDone = () => {
    if(!isDone || !selectedAnno) return;
    setOpacity(-1);
    setShow(false);

    // label의 index를 읽어온다
    const lidx = labelList.findIndex(v => v.classId === selectedAnno.classId);
    if(lidx === -1) return;

    if(selectedAnno.add !== true) { // label을 수정하는 경우
      // annotation의 index를 읽어온다
      const aidx = labelList[lidx].annotation.findIndex(v => v.id === selectedAnno.id);
      if(aidx === -1) return;

      setLabelList(curVal => {
        if(curVal.length === 0) return curVal;

        const newVal = cloneDeep(curVal);
        newVal[lidx].annotation[aidx].properties = cloneDeep(selectProperty);
        return newVal;
      });

      const annotation = cloneDeep(selectedAnno);
      annotation.properties = cloneDeep(selectProperty);
      editLabelLog(annotation, 'properties');
    }
    else { // label을 새로 추가하는 경우
      const annotation = cloneDeep(selectedAnno);
      annotation.add = false;
      annotation.properties = cloneDeep(selectProperty);

      setLabelList(curVal => {
        if(curVal.length === 0) return curVal;

        const newVal = cloneDeep(curVal);
        newVal[lidx].annotation.push(annotation);
        return newVal;
      });

      addLabelLog(annotation);
    }

    setSelectAnno(undefined);
  }

  /** 선택된 Annotation이 속성을 가지고 있는 경우, 속성 값을 set하고 컴포넌트를 표시하는 Side-Effect */
  useEffect(() => {
    if(classList.length === 0) return;

    if(selectedAnno === undefined) {
      setShow(false);
      setProperties([]);
      setIsDone(false);
      setOpacity(-1)
    }
    else {
      const classes = classList.find(v => v.id === selectedAnno.classId);
      if(!!classes && checkPropery(classes)) {
        setProperties(cloneDeep(classes.property))
        setShow(true)
      }
      else {
        setShow(false);
        setProperties([]);
        setIsDone(false);
        setOpacity(-1)
      }
    }
  }, [selectedAnno, classList])

  /** required 속성이 모두 선택되었을 때, done을 누를 수 있도록 변경하는 Side-Effect */
  useEffect(() => {
    if(properties.length === 0) return;

    const reqArr = properties.filter(v => v.required === 1).map(v => v.id);

    if(reqArr.length === 0) {
      setIsDone(true);
    }
    else {
      const selReqArr = selectProperty.filter(v => (v.data.length > 0)).map(v => v.id);
      const interSection = selReqArr.filter(v => reqArr.includes(v));

      if(reqArr.length === interSection.length) {
        setIsDone(true);
      }
      else {
        setIsDone(false);
      }
    }
  }, [properties, selectProperty])

  useEffect(() => {
    if(!selectedAnno) {
      setSelectProperty([]);
      return;
    }

    if(selectedAnno.properties.length > 0) {
      setSelectProperty(cloneDeep(selectedAnno.properties));
    }
    // else {
    //   setSelectProperty([]);
    // }
  }, [selectedAnno])

  useEffect(() => {
    if(shapeModify.ready) {
      if(shapeModify.active) setOpacity(0)
      else                   setOpacity(0.75)
    }
    else {
      if(shapeModify.active) setOpacity(0)
      else                   setOpacity(1)
    }
  }, [shapeModify])

  return {
    show, isDone,
    onClickClose, onClickDone,
    properties,
    selectProperty, setSelectProperty,
    anchorId,
    opacity
  }
}

export default useProperties;