import { MouseEvent } from "react";
import { useRecoilState } from "recoil";
import { cloneDeep } from "lodash";
import useT from "@src/hooks/Locale/useT";
import { Sypo, Mypo } from "@src/components/atoms";
import { Issue } from "@src/werkzeug/defs/annotation";
import { Porcelain } from "@src/werkzeug/components/atoms";
import { issueListAtom, selectedIssueAtom } from "@src/werkzeug/stores/paintStore";
import { resetIssue } from "@src/werkzeug/lib/Util";
import usePostJobReject from "@src/werkzeug/hooks/api/usePostJobReject";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";

import classNames from "classnames/bind";
import styles from "./IssueList.module.scss";

const cx = classNames.bind(styles);

type Props = {
  issue:Issue;
}

function IssueItem({ issue }:Props) {
  const { t } = useT();

  const [issueList, setIssueList] = useRecoilState(issueListAtom);
  const [selectedIssue, setSelectedIssue] = useRecoilState(selectedIssueAtom);
  const { resolveIssue } = usePostJobReject();
  const { canIUse } = useFileStatus();

  const onClickItem = () => {
    if(selectedIssue?.id === issue.id || resetIssue(selectedIssue)) {
      setSelectedIssue(undefined)
    }
    else {
      setSelectedIssue(cloneDeep(issue))
    }
  }

  const onClickResolve = async (e:MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    try {
      const res = await resolveIssue(issue.id);

      if(res.status === 1) {
        const _issueList = cloneDeep(issueList);
        const index = _issueList.findIndex(v => v.id === issue.id);

        if(index === -1) return;
        _issueList[index].status = 1;
        setIssueList(_issueList);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Porcelain color={ (selectedIssue?.id === issue.id) ? '#EEF0F6':undefined }>
      <div className={ cx("IssueItem") } onClick={onClickItem}>
        <div className={ cx("header", (issue.warning === 1) && 'warn') }>
          <Sypo type='p1' weight={500}>Issue #{ issue.id }</Sypo>
          {
            (issue.id >= 0 && canIUse)
              ? <div className={ cx("resolve") } onClick={onClickResolve}>
                  <Sypo type='p2' weight={400}>{t(`component.Issue.resolve`)}</Sypo>
                </div>
              : null
          }
        </div>
        <div className={ cx("body") }>
          <Mypo type='p1' weight={400}>
            { issue.comment }
          </Mypo>
        </div>
      </div>
    </Porcelain>
  )
}

export default IssueItem;