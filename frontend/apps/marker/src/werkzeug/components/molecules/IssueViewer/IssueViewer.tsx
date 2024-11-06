import { useEffect, useState } from 'react';
import { useRecoilState } from "recoil";
import { Mypo, Sypo } from "@src/components/atoms";
import { selectedIssueAtom } from "@src/werkzeug/stores/paintStore";
import { MARKER_PAINT_CONTAINER_ID, MARKER_PAINT_ISSUEVIEWER_ID } from "@src/werkzeug/defs/constance";
import { FloatView } from "@src/werkzeug/components/atoms";

import classNames from "classnames/bind";
import styles from "./IssueViewer.module.scss";
const cx = classNames.bind(styles);

function IssueViewer() {
  const [selectedIssue, setSelectedIssue] = useRecoilState(selectedIssueAtom);

  const [show, setShow] = useState<boolean>(false);

  const anchorId = (() => {
    if(!selectedIssue) return undefined;
    return `image#issue_${selectedIssue.id}`;
  })()

  const onClickFold = () => {
    setShow(false);
    setSelectedIssue(undefined)
  }

  useEffect(() => {
    if(!selectedIssue) {
      setShow(false);
    }
    else {
      setShow(true);
    }
  }, [selectedIssue])

  return (
    <FloatView id={MARKER_PAINT_ISSUEVIEWER_ID} animation show={show}
               parentId={MARKER_PAINT_CONTAINER_ID}
               anchorId={anchorId}
               marginTop={0}
               marginEnd={-36}>
      <div className={ cx("IssueViewer") }>
        <div className={ cx("container") }>
          <div className={ cx("text") }>
            <Mypo type='p2' weight={400}>
              {
                (!!selectedIssue) ? selectedIssue.comment : ''
              }
            </Mypo>
          </div>
        </div>
        <div className={ cx("fold-button") } onClick={onClickFold}>
          <Sypo type='p2'>Fold</Sypo>
        </div>
      </div>
    </FloatView>
  )
}

export default IssueViewer;