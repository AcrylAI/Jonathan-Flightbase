import ModalTemplate from '..';
import { ModalTemplateArgs } from '../../types';
import ModalUnderBar from '../ModalUnderBar';
export interface ModalRenderProps {
  modalList: ModalTemplateArgs[];
}
export default function ModalRender({ modalList }: ModalRenderProps) {
  return (
    <>
      {/* 기본 상태 렌더링 */}
      {modalList.map((modal, idx) => {
        return <ModalTemplate key={`${modal.modalKey}${idx}`} {...modal} />;
      })}
      {/* 최소화 상태 렌더링 */}
      <ModalUnderBar modalList={modalList} />
    </>
  );
}
