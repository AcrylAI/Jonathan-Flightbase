import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';
import { debounce } from 'lodash';

import styles from './DeleteContainer.module.scss';
import classNames from 'classnames/bind';

import { issueListAtom, labelListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';

type EventFunction = (e: MouseEvent) => void;

const cx = classNames.bind(styles);

function DeleteContainer() {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [anchorTop, setAnchorTop] = useState(-1);
  const [anchorRight, setAnchorRight] = useState(-1);
  const [targetLabel, setTargetLabel] = useState<TextAnnotationType | null>(
    null,
  );
  const [targetIssue, setTargetIssue] = useState<TextAnnotationType | null>(
    null,
  );

  const [labels, setLabels] =
    useRecoilState<Array<TextAnnotationType>>(labelListAtom);
  const [issues, setIssues] =
    useRecoilState<Array<TextAnnotationType>>(issueListAtom);

  const onClick = () => {
    if (targetLabel) {
      setLabels((prev) => {
        const curr = [...prev];
        const fid = curr.findIndex((v) => v.id === targetLabel.id);
        curr.splice(fid, 1);

        return curr;
      });
      setTargetLabel(null);
    } else if (targetIssue) {
      setIssues((prev) => {
        const curr = [...prev];
        const fid = curr.findIndex((v) => v.id === targetIssue.id);
        curr.splice(fid, 1);

        return curr;
      });
      setTargetIssue(null);
    }
    setShow(false);
  };

  const onHover = useCallback(
    debounce((e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const classList = target?.classList.value;

      if (classList?.includes('ner-span')) {
        const { top, right } = (target as HTMLElement).getBoundingClientRect();

        const labelId =
          classList?.split(' ')[1].replace('labelid_', '') ?? null;
        if (labelId) {
          const label = labels.find((v) => v.id === Number(labelId)) ?? null;
          setTargetLabel(label);
        }
        const issueId =
          classList?.split(' ')[1].replace('issueid_', '') ?? null;
        if (issueId) {
          const issue = issues.find((v) => v.id === Number(issueId)) ?? null;
          setTargetIssue(issue);
        }

        setAnchorTop(top - 10);
        setAnchorRight(right - 11);
        setShow(true);
      } else if (classList?.includes('ner-delete-button')) {
      } else {
        setAnchorTop(-1);
        setAnchorRight(-1);
        setShow(false);
      }
    }, 100) as EventFunction,
    [labels, issues],
  );

  useEffect(() => {
    setRoot(document.querySelector('body'));
  }, []);

  useEffect(() => {
    document.addEventListener('mouseover', onHover);

    return () => {
      document.removeEventListener('mouseover', onHover);
    };
  }, [onHover, labels]);

  return show && root
    ? createPortal(
        <div
          className={cx('ner-delete-button')}
          onClick={onClick}
          style={{ top: anchorTop, left: anchorRight }}
        />,
        root,
      )
    : null;
}

export default DeleteContainer;
