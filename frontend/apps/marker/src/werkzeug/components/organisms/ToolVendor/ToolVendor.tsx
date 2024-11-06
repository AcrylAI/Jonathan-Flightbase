import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { selectedClassAtom, selectedToolAtom } from "@src/werkzeug/stores/contextStore";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import useLoading from "@src/werkzeug/hooks/common/useLoading";
import { CommonTools, LabelTools } from "@src/werkzeug/components/molecules";
import { ToolSkeleton } from "@src/werkzeug/components/atoms";

import classNames from "classnames/bind";
import styles from "./ToolVendor.module.scss";
const cx = classNames.bind(styles);

function ToolVendor() {
  const selectedClass = useRecoilValue(selectedClassAtom);
  const setSelectedTool = useSetRecoilState(selectedToolAtom);
  const { canIUse, isViewer } = useFileStatus();
  const { isPaintLoading } = useLoading();

  useEffect(() => {
    if(!canIUse) return;

    if(!selectedClass) {
      setSelectedTool(0);
      return;
    }

    switch (selectedClass.tool) {
      case 1: // bbox
        setSelectedTool(3);
        return;
      case 2: // polygon
        setSelectedTool(4);
        return;
      case 3: // ner
        setSelectedTool(6);
        return;
      default:
        return;
    }
  }, [selectedClass, canIUse])



  /* RENDERING AREA ------------------------------------------------------------------------------------------------- */
  if(!isPaintLoading) {
    return (
      <div className={ cx("ToolVendor") }>
        <CommonTools />
        {
          !isViewer
          ? ( <><div className={ cx("line") } /><LabelTools /></> )
          : null
        }
      </div>
    )
  }
  else {
    return (
      <ToolSkeleton />
    )
  }
}

export default ToolVendor;