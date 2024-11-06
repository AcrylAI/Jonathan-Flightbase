import { useState } from 'react';
import ModalButtons from '../Buttons/ModalButtons';
import ModalHeader from '../Header/ModalHeader';
import { ModalButtonsArgs, ModalContentArgs } from '../types';
import classnames from 'classnames/bind';
import style from './Content.module.scss';
import ModalContainer from '../Container/ModalContainer';
import InputText from '@src/components/atoms/input/InputText';
import InputDate from '@src/components/atoms/input/InputDate';
import Textarea from '@src/components/atoms/input/Textarea';
import Selectbox from '../../Selectbox';
import { useModal } from '@src/hooks/useModal';
import { Switch, Case, Default } from '@jonathan/react-utils';
import { theme } from '@src/utils';

const cx = classnames.bind(style);
type Props = { pageIndex: number };
const MockupBody = ({ pageIndex }: Props) => {
  return (
    <div className={cx('content-container')}>
      <div className={cx('content-item')}>
        <div className={cx('label')}>{pageIndex} 페이지</div>
        <InputDate></InputDate>
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>InputDate</div>
        <InputDate></InputDate>
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>InputText</div>
        <InputText></InputText>
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>TextArea</div>
        <Textarea />
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>TextArea</div>
        <Textarea />
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>TextArea</div>
        <Textarea />
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>TextArea</div>
        <Textarea />
      </div>
      <div className={cx('content-item')}>
        <div className={cx('label')}>Select</div>
        <Selectbox theme={theme.PRIMARY_THEME} />{' '}
      </div>
    </div>
  );
};

export default function ModalContentMockup({ modalKey }: ModalContentArgs) {
  const { close } = useModal();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const pageLimit = 3;
  const buttons: ModalButtonsArgs = {
    prevButton: {
      title: '이전',
      disabled: pageIndex === 0,
      onClick: () => {
        setPageIndex(pageIndex - 1);
      },
    },
    nextButton: {
      title: '다음',
      disabled: pageIndex + 1 === pageLimit,
      onClick: () => {
        setPageIndex(pageIndex + 1);
      },
    },
    cancelButton: {
      title: '취소',
      onClick: () => {
        close(modalKey);
      },
    },
    okButton: {
      title: '확인',
      onClick: () => {
        close(modalKey);
      },
    },
  };

  return (
    <ModalContainer>
      <ModalHeader title='배포 수정' />
      <Switch>
        <Case condition={pageIndex === 0}>
          <MockupBody pageIndex={pageIndex} />
        </Case>
        <Case condition={pageIndex === 1}>
          <MockupBody pageIndex={pageIndex} />
        </Case>
        <Case condition={pageIndex === 2}>
          <MockupBody pageIndex={pageIndex} />
        </Case>
        <Default>
          <></>
        </Default>
      </Switch>
      <ModalButtons {...buttons} />
    </ModalContainer>
  );
}
