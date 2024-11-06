import { useRecoilState } from "recoil";
import { issueListAtom, selectedIssueAtom } from "@src/werkzeug/stores/paintStore";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { resetIssue } from "@src/werkzeug/lib/Util";
import { cloneDeep } from "lodash";
import useIssueLog from "@src/werkzeug/hooks/store/useIssueLog";
import usePostJobReject from "@src/werkzeug/hooks/api/usePostJobReject";

function useIssueMaker() {
  const [issueList, setIssueList] = useRecoilState(issueListAtom);
  const [selectedIssue, setSelectedIssue] = useRecoilState(selectedIssueAtom);

  const { addIssueLog, editIssueLog } = useIssueLog();
  const { resolveIssue } = usePostJobReject();

  const textareaRef = useRef(null);
  const [show, setShow] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [alert, setAlert] = useState<boolean>(false);

  const anchorId = (() => {
    if(!selectedIssue) return undefined;
    return `image#issue_${selectedIssue.id}`;
  })()

  const onClickClose = () => {
    if(!selectedIssue) return;
    setShow(false);

    resetIssue(selectedIssue);
    setSelectedIssue(undefined);
  }

  const onClickCreate = () => {
    if(!selectedIssue || comment.length === 0) return;
    setShow(false);

    if(selectedIssue.add !== true) { // 이슈를 수정하는 경우
      const index = issueList.findIndex(v => v.id === selectedIssue.id);
      if(index === -1) return;

      setIssueList(curVal => {
        const newVal = cloneDeep(curVal);
        newVal[index].comment = comment;
        newVal[index].warning = alert ? 1:0;
        return newVal;
      });

      const issue = cloneDeep(selectedIssue);
      issue.comment = comment;
      issue.warning = alert ? 1:0;
      editIssueLog(issue);
    }
    else { // 새로운 이슈를 추가하는 경우
      const issue = cloneDeep(selectedIssue);
      issue.add = false;
      issue.comment = comment;
      issue.warning = alert ? 1:0;

      setIssueList(curVal => {
        const newVal = cloneDeep(curVal);
        newVal.push(issue);
        return newVal;
      })

      addIssueLog(issue);
    }

    setSelectedIssue(undefined);
  }

  const onClickResolve = async () => {
    if(!selectedIssue) return;

    try {
      const res = await resolveIssue(selectedIssue.id);

      if(res.status === 1) {
        setShow(false);

        const _issueList = cloneDeep(issueList);
        const index = _issueList.findIndex(v => v.id === selectedIssue.id);

        if(index === -1) return;
        _issueList[index].status = 1;
        setIssueList(_issueList);
        setSelectedIssue(undefined);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const onChangeTextarea = (e:ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }

  const onFocusTextarea = () => {
    if(!textareaRef || !textareaRef.current) return;
    (textareaRef.current as HTMLTextAreaElement).classList.add('focus');
  }

  const onBlurTextarea = () => {
    if(!textareaRef || !textareaRef.current) return;
    (textareaRef.current as HTMLTextAreaElement).classList.remove('focus');
  }

  const onChangeToggler = (value:boolean) => {
    setAlert(value);
  }

  useEffect(() => {
    if(!selectedIssue) {
      setShow(false);
      setComment('');
      setAlert(false);
    }
    else {
      setComment(selectedIssue.comment);
      setAlert(selectedIssue.warning === 1)
      setShow(true);
    }
  }, [selectedIssue])

  return {
    show, comment, alert,
    textareaRef,
    onClickClose, onClickResolve, onClickCreate,
    onChangeTextarea, onFocusTextarea, onBlurTextarea,
    onChangeToggler,
    selectedIssue,
    anchorId
  }
}

export default useIssueMaker;