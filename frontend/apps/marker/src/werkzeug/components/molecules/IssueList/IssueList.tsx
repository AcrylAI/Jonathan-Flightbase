import classNames from "classnames/bind";
import styles from "./IssueList.module.scss";
import { useRecoilValue } from "recoil";
import { issueListAtom } from "@src/werkzeug/stores/paintStore";
import IssueItem from "@src/werkzeug/components/molecules/IssueList/IssueItem";

const cx = classNames.bind(styles);

function IssueList() {
  const issueList = useRecoilValue(issueListAtom);

  return (
    <div className={ cx("IssueList") }>
      {
        issueList.map(v => {
          if(v.status === 0) {
            return <IssueItem issue={v} key={v.id} />;
          }
          else {
            return null;
          }
        })
      }
    </div>
  )
}

export default IssueList;