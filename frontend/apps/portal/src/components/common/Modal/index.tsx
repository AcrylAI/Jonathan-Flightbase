import { useRecoilState } from 'recoil';

import { ModalModel, modalStateAtom } from '@src/atom/ui/Modal';
import OneBtnModal from './OneBtnModal';

function Modal() {
  const [modalList] = useRecoilState<ModalModel[]>(modalStateAtom);
  return (
    <>
      {modalList.map((modal, idx) => {
        if (modal.key === 'oneBtnModal') {
          return <OneBtnModal {...modal.props} key={modal.key + String(idx)} />;
        }
        return <></>;
      })}
    </>
  );
}
export default Modal;
