import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useT from "@src/hooks/Locale/useT";
import icon from "@src/werkzeug/assets";
import { Button } from "@src/werkzeug/components/atoms";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import { isFocus } from "@src/werkzeug/lib/Util";
import { selectedClassAtom, selectedToolAtom } from "@src/werkzeug/stores/contextStore";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";

import classNames from "classnames/bind";
import styles from "./LabelTools.module.scss";

const cx = classNames.bind(styles);
const {
  ToolBboxIcon:BboxIcon, ToolPolyIcon:PolyIcon, ToolIssueIcon:IssueIcon,
} = icon;

function LabelTools() {
  const { t } = useT();

  const jobInfo = useRecoilValue(jobInfoAtom);
  const selectedClass = useRecoilValue(selectedClassAtom);
  const [selectedTool, setSelectedTool] = useRecoilState(selectedToolAtom);
  const { isLabeler, canIUse } = useFileStatus();

  const onClickBbox = () => {
    const flag = (!canIUse || !selectedClass || selectedClass.tool !== 1);
    if(flag) return;

    setSelectedTool(3);
  }

  const onClickPoly = () => {
    const flag = (!canIUse || !selectedClass || selectedClass.tool !== 2);
    if(flag) return;

    setSelectedTool(4);
  }

  const onClickIssue = () => {
    if(!canIUse) return;

    setSelectedTool(5);
  }

  const onPressJunction = () => {
    if(!!selectedClass) {
      switch (selectedClass.tool) {
        case 1: onClickBbox(); break;
        case 2: onClickPoly(); break;
      }
    }
    else if(!isLabeler) {
      onClickIssue();
    }
  }

  useEffect(() => {
    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;
      
      const { key } = e;

      switch (key) {
        case 'p': case 'ㅔ': onClickPoly(); break;
        case 'b': case 'ㅠ': onClickBbox(); break;
        case 'i': case 'ㅑ': onClickIssue(); break;
        case 'r': case 'ㄱ': onPressJunction(); break;
      }
    }

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    }
  }, [onClickPoly, onClickBbox, onClickIssue, onPressJunction])

  return (
    <div className={ cx("LabelTools") }>
      {
        (isLabeler && jobInfo && [2, 4].includes(jobInfo.fileStatus)) &&
        <>
	        <Button.Select onClick={onClickBbox}
                         title={t(`component.tool.bbox`)}
                         active={selectedTool === 3}
                         disable={!canIUse || selectedClass?.tool !== 1}>
		        <BboxIcon />
	        </Button.Select>
	        <Button.Select onClick={onClickPoly}
                         title={t(`component.tool.polygon`)}
                         active={selectedTool === 4}
                         disable={!canIUse || selectedClass?.tool !== 2}>
		        <PolyIcon />
	        </Button.Select>
        </>
      }
      {
        (!isLabeler && jobInfo && [3].includes(jobInfo.fileStatus)) &&
	      <Button.Select onClick={onClickIssue}
                       title={t(`component.tool.issue`)}
                       active={!canIUse || selectedTool === 5}>
		      <IssueIcon />
	      </Button.Select>
      }
    </div>
  )
}

export default LabelTools;