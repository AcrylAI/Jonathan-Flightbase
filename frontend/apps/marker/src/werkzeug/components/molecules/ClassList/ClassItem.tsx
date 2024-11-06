import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { DraggableProvided } from "react-beautiful-dnd";
import { Sypo } from "@src/components/atoms";
import { Classes } from "@src/werkzeug/defs/classes";
import { selectedClassAtom } from "@src/werkzeug/stores/contextStore";
import { Porcelain, Plaque } from "@src/werkzeug/components/atoms";
import Icon from "@src/werkzeug/assets";

import classNames from "classnames/bind";
import styles from "./ClassList.module.scss";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import { isFocus } from "@src/werkzeug/lib/Util";
const cx = classNames.bind(styles);

const { BBoxIcon, PolygonIcon, DragIcon } = Icon;

type Props = {
  data: Classes;
  index: number;
  provided: DraggableProvided;
}

function ClassItem({ data, index, provided }:Props) {
  const [selectedClass, setSelectedClass] = useRecoilState(selectedClassAtom);
  const { isViewer } = useFileStatus();

  const isActive = (() => {
    return (selectedClass?.id === data.id)
  })()

  const onClickClass = () => {
    if(data.id !== selectedClass?.id) {
      setSelectedClass(data);
    }
    else {
      setSelectedClass(undefined);
    }
  }

  const renderType = () => {
    switch (data.tool) {
      case 1: return <BBoxIcon />;
      case 2: return <PolygonIcon />;
      case 3: return undefined;
      default:
        return undefined;
    }
  }

  useEffect(() => {
    if(isViewer === true) return;

    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;

      const { ctrlKey, metaKey, key } = e;

      if(
        !(ctrlKey || metaKey)
        && index < 11
        && String(index%10) === key
      ) {
        e.preventDefault();
        onClickClass()
      }
    }

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isViewer, index, onClickClass])

  return (
    <div className={ cx("drag-container") }
         {...provided.draggableProps}
         {...provided.dragHandleProps}
         ref={provided.innerRef} >
      <Porcelain>
        <div className={ cx("ClassItem", (isActive) && 'active') }
             onClick={onClickClass} >
          <div className={ cx("colorTip") } style={{ backgroundColor: data.color }} />
          { renderType() }
          <div className={ cx("text") }>
            <Sypo type="p1" weight={400} ellipsis title={data.name}>{data.name}</Sypo>
          </div>
          {
            index < 11 &&
		      <Plaque size={22}
		              style={{ backgroundColor: isActive ? 'transparent':undefined }}>
                {(index) % 10}
		      </Plaque>
          }
          <div className={ cx("drag") }>
            <DragIcon />
          </div>
        </div>
      </Porcelain>
    </div>
  )
}

export default ClassItem;