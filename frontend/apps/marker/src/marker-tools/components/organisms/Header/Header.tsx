import { useLocation } from 'react-router-dom';

import { Sypo } from '@src/components/atoms';

import { useReject, useSubmit } from '@tools/package/NER/hooks';

import styles from './Header.module.scss';
import classNames from 'classnames/bind';

import { Button } from '@tools/components/atoms';
import { FileState, Logo, Pagecontrol } from '@tools/components/molecules';
import { useEventDisable } from '@tools/hooks/utils';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type Props = {
  detail: JobDetailResultType<TextAnnotationType>;
};

function Header({ detail }: Props) {
  const { t } = useT();
  const { pathname } = useLocation();
  const { allowByFileStatus } = useEventDisable(detail);

  const { save, submit } = useSubmit(detail);
  const { saveIssue, reject, approve } = useReject(detail);

  const pageMoveSaving = async () => {
    await save();
    await saveIssue();
  };

  const buttonRender = () => {
    const currentPath = pathname.split('/')[2];

    switch (currentPath) {
      case 'labeling':
        return (
          <div className={cx('submit-area')}>
            <Button
              varient='contain'
              onClick={submit}
              disabled={
                !allowByFileStatus([WORKING_FILESTATE, REJECTION_FILESTATE])
              }
            >
              <Sypo userSelect={false} type='p1' weight='m'>
                {t(`component.processor.submit`)}
              </Sypo>
            </Button>
          </div>
        );
      case 'inspection':
        return (
          <div className={cx('submit-area')}>
            <Button
              varient='contain'
              onClick={reject}
              disabled={!allowByFileStatus(INSPECTION_FILESTATE)}
              color='red'
            >
              <Sypo userSelect={false} type='p1' weight='m'>
                {t(`component.processor.reject`)}
              </Sypo>
            </Button>
            <Button
              varient='contain'
              onClick={approve}
              disabled={!allowByFileStatus(INSPECTION_FILESTATE)}
            >
              <Sypo userSelect={false} type='p1' weight='m'>
                {t(`component.processor.approve`)}
              </Sypo>
            </Button>
          </div>
        );
      case 'view':
        return <div className={cx('submit-area')}></div>;
      default:
        return null;
    }
  };

  return (
    <div className={cx('header-container')}>
      <div className={cx('header-box')}>
        <Logo />
        <div className={cx('header-filestate')}>
          <Sypo userSelect={false} type='p1' weight='r'>
            {detail.fileName}
          </Sypo>
          <FileState type={detail.fileStatus} />
        </div>
      </div>

      <div className={cx('header-box', 'true-center')}>
        <Pagecontrol
          nextId={detail.nextId}
          prevId={detail.prevId}
          total={detail.allWork}
          value={detail.currentCnt}
          onSave={pageMoveSaving}
        />
      </div>

      <div className={cx('header-box')}>{buttonRender()}</div>
    </div>
  );
}

export default Header;
