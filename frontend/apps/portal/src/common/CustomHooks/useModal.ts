import { useRecoilState } from 'recoil';
import { ModalModel, modalStateAtom } from '@src/atom/ui/Modal';

interface useModalModel {
  addModal: ({ key, props }: ModalModel) => void;
  removeCurrentModal: () => void;
  removeModalAll: () => void;
}

export default function useModal(): useModalModel {
  const [modalList, setModalList] = useRecoilState(modalStateAtom);

  const addModal = ({ key, props }: ModalModel) => {
    const newModalList = [...modalList];
    newModalList.push({ key, props });
    setModalList(newModalList);
  };

  const removeCurrentModal = () => {
    const newModalList = [...modalList];
    newModalList.pop();
    setModalList(newModalList);
  };

  const removeModalAll = () => {
    setModalList([]);
  };

  return {
    addModal,
    removeCurrentModal,
    removeModalAll,
  };
}
