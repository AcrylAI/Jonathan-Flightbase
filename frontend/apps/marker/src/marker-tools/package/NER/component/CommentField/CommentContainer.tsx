import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilValue } from 'recoil';

import { CommentField } from '@tools/package/NER/component/CommentField/index';
import { issueListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';

function CommentContainer() {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [targetId, setTargetId] = useState(0);

  const [anchorTop, setAnchorTop] = useState<number>(0);
  const [anchorLeft, setAnchorLeft] = useState<number>(0);

  const issues = useRecoilValue<Array<TextAnnotationType>>(issueListAtom);

  useEffect(() => {
    const find = issues.find((v) => v.comment?.length === 0);

    if (find) {
      setShow(true);
      setTargetId(find.id);
    } else {
      setShow(false);
      setTargetId(0);
    }
  }, [issues]);

  useEffect(() => {
    if (targetId !== 0) {
      const target = document.getElementsByClassName(`issueid_${targetId}`);

      if (target.length > 0) {
        const { top, right } = (
          target[0] as HTMLElement
        ).getBoundingClientRect();
        setAnchorTop(top);
        setAnchorLeft(right + 12);
      } else {
        setAnchorTop(0);
        setAnchorLeft(0);
      }
    } else {
      setAnchorTop(0);
      setAnchorLeft(0);
    }
  }, [targetId]);

  useEffect(() => {
    setRoot(document.querySelector('body'));
  }, []);

  return show && root && targetId !== 0 && anchorTop !== 0 && anchorLeft !== 0
    ? createPortal(
        <CommentField style={{ top: anchorTop, left: anchorLeft }} />,
        root,
      )
    : null;
}

export default CommentContainer;
