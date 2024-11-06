import { useRecoilState } from "recoil";
import { labelLogAtom } from "@src/werkzeug/stores/historyStore";
import { Annotation } from "@src/werkzeug/defs/annotation";
import { cloneDeep } from "lodash";
import { Addition, Edition, EditOptions } from "@src/werkzeug/defs/history";

/** 수정된 부분에 대한 타입 정의. 좌표만 수정된 경우 또는 속성만 수정된 경우에 해당 */
type EditType = "coordinates"|"properties";

function useLabelLog() {
  const [labelHistory, setLabelHistory] = useRecoilState(labelLogAtom);

  /** 전달받은 annotation에서 property의 optionId만 추출하는 메소드 */
  const getOptionId = (anno:Annotation) => {
    const property = cloneDeep(anno.properties);

    const output:Array<EditOptions> = [];
    for (let i = 0; i < property.length; i++) {
      const datum = property[i].data;

      for (let j = 0; j < datum.length; j++) {
        if(datum[j].id !== undefined) {
          output.push({ optionId:datum[j].id })
        }
      }
    }

    return output;
  }

  /** 인자로 전달받은 Annotation을 add에 추가하는 메소드 */
  const addLabelLog = (anno:Annotation) => {
    const put:Addition = {
      id: anno.id,
      coordinates: cloneDeep(anno.coordinates),
      classId: anno.classId,
      properties: getOptionId(anno)
    };

    const _labelHistory = cloneDeep(labelHistory);
    const index = _labelHistory.add.findIndex(v => v.id === anno.id);

    if(index === -1) _labelHistory.add.push(put);
    else             _labelHistory.add[index] = put;

    setLabelHistory(_labelHistory);
  }

  const editLabelLog = (anno:Annotation, type:EditType) => {
    const _labelHistory = cloneDeep(labelHistory);

    if(anno.id < 0) { // 새로 생성된 것을 수정하는 경우
      const index = _labelHistory.add.findIndex(v => v.id === anno.id);
      if(index === -1) return;

      if(type === "properties") { // properties를 수정하는 경우
        _labelHistory.add[index].properties = getOptionId(anno);
      }
      else { // coordinates를 수정하는 경우
        _labelHistory.add[index].coordinates = cloneDeep(anno.coordinates);
      }
      setLabelHistory(_labelHistory);
    } // END OF if(anno.id < 0)
    else { // 기생성된 것을 수정하는 경우
      const index = _labelHistory.edit.findIndex(v => v.id === anno.id);

      if(type === "properties") { // properties를 수정하는 경우
        if(index === -1) { // 처음 수정하는 경우 => 새로운 값을 추가
          const put:Edition = {
            id: anno.id,
            classId: anno.classId,
            properties: getOptionId(anno),
            coordinates: []
          };
          _labelHistory.edit.push(put);
        }
        else { // 기존에 수정했던 값이 있는 경우 => 기존 값 수정
          _labelHistory.edit[index].properties = getOptionId(anno);
        }
      } // END OF if(type === "properties")
      else { // coordinates를 수정하는 경우
        if(index === -1) { // 처음 수정하는 경우 => 새로운 값을 추가
          const put:Edition = {
            id: anno.id,
            classId: anno.classId,
            coordinates: cloneDeep(anno.coordinates),
            properties: []
          };
          _labelHistory.edit.push(put);
        }
        else { // 기존에 수정했던 값이 있는 경우 => 기존 값 수정
          _labelHistory.edit[index].coordinates = cloneDeep(anno.coordinates);
        }
      } // END OF else(type === "coordinates")
      setLabelHistory(_labelHistory);
    } // END OF else(anno.id >= 0)
  }

  const deleteLabelLog = (annotationId:number) => {
    if(labelHistory.remove.includes(annotationId)) return;

    const _labelHistory = cloneDeep(labelHistory);
    if(annotationId < 0) { // 새로 생성된 것을 삭제하는 경우
      const index = _labelHistory.add.findIndex(v => v.id === annotationId);
      if(index === -1) return;
      _labelHistory.add.splice(index, 1);
    }
    else { // 기존에 생성된 것을 삭제하는 경우
      _labelHistory.remove.push(annotationId);
    }

    setLabelHistory(_labelHistory);
  }

  return {
    addLabelLog,
    editLabelLog,
    deleteLabelLog
  }
}

export default useLabelLog;