import { ChangeEvent, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { cloneDeep } from 'lodash';

import styles from './CommentField.module.scss';
import classNames from 'classnames/bind';

import { Button } from '@tools/components/atoms';
import { issueListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { CommonProps } from '@tools/types/components';
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

type Props = Pick<CommonProps, 'style'>;

function CommentField({ style }: Props) {
  const { t } = useT();

  const [comment, setComment] = useState<string>('');
  const setIssues = useSetRecoilState<Array<TextAnnotationType>>(issueListAtom);

  const onClickSave = () => {
    setIssues((prev) => {
      const fIdx = prev.findIndex((v) => v.comment?.length === 0);

      if (fIdx === -1) {
        return prev;
      }
      const curr = cloneDeep(prev);
      curr[fIdx].comment = comment;
      return curr;
    });
  };

  const onClickCancel = () => {
    setIssues((prev) => {
      const fIdx = prev.findIndex((v) => v.comment?.length === 0);

      if (fIdx === -1) {
        return prev;
      }
      const curr = cloneDeep(prev);
      curr.splice(fIdx, 1);
      return curr;
    });
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  return (
    <div className={cx('CommentField-box')} style={style}>
      <textarea className={cx('CommentField-textarea')} onChange={onChange} />
      <div className={cx('CommentField-buttons')}>
        <Button
          varient='text'
          color='custom'
          className={cx('cancel-button')}
          onClick={onClickCancel}
        >
          {t(`component.btn.cancel`)}
        </Button>
        <Button
          varient='text'
          disabled={comment.length === 0}
          className={cx('save-button')}
          onClick={onClickSave}
        >
          {t(`component.btn.save`)}
        </Button>
      </div>
    </div>
  );
}

export default CommentField;
