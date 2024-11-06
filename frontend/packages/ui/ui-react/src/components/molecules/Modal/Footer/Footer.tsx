import { useDispatch } from 'react-redux';

import Button from '@src/components/atoms/button/Button';
import { modalClose } from '@src/store/modules/modal';

import classNames from 'classnames/bind';
import style from './Footer.module.scss';
const cx = classNames.bind(style);

type Props = {
  testProp1?: string;
  testProp2?: string;
};

function Footer({ testProp1, testProp2 }: Props) {
  console.log(testProp1, testProp2);
  const dispatch = useDispatch();

  const ModalClose = () => {
    const action = {
      isOpen: false,
    };
    dispatch(modalClose(action));
  };

  return (
    <div className={cx('footer-button-container')}>
      <Button onClick={ModalClose} type='gray'>
        취소
      </Button>
      <Button onClick={ModalClose}>업로드</Button>
    </div>
  );
}

Footer.defaultProps = {
  testProp1: '',
  testProp2: '',
};

export default Footer;
