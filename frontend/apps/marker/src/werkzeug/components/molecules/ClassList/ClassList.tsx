import { cloneDeep } from "lodash";
import { useRecoilState } from "recoil";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { Classes } from "@src/werkzeug/defs/classes";
import { classListAtom } from "@src/werkzeug/stores/fetchStore";
import ClassItem from "./ClassItem";

import classNames from "classnames/bind";
import styles from "./ClassList.module.scss";
const cx = classNames.bind(styles);

function ClassList() {
  const [classList, setClassList] = useRecoilState(classListAtom);

  const reorder = (list:Array<Classes>, startIndex:number, endIndex:number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  const onDragEnd = (result:DropResult) => {
    if(result.combine) {
      const newList = cloneDeep(classList);
      newList.splice(result.source.index, 1);
      setClassList(newList);
      return;
    }

    if(!result.destination || result.destination.index === result.source.index) return;

    const start = result.source.index;
    const end = result.destination.index;
    const newList = reorder(cloneDeep(classList), start, end);

    setClassList(newList);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={'_mk_ClassList_DroppableId'}>
        {
          (dropprovided) => (
            <div ref={dropprovided.innerRef}
                 className={ cx("ClassList") }
                 {...dropprovided.droppableProps} >
              {
                classList.map((v, i) => (
                  <Draggable key={v.id}
                             draggableId={String(v.id)}
                             index={i}>
                    {
                      (dragProvied) => (
                        <ClassItem key={i} data={v} index={i+1} provided={dragProvied} />
                      )
                    }
                  </Draggable>
                ))
              }
              {dropprovided.placeholder}
            </div>
          )
        }
      </Droppable>
    </DragDropContext>
  )
}

export default ClassList;