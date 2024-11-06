// storybook
import { Button } from '@jonathan/ui-react';

// CSS module
import classNames from 'classnames/bind';
import style from '@src/components/Modal/DockerImageDeleteModal/DockerImageDeleteModal.module.scss';
const cx = classNames.bind(style);

function DockerImageDeleteModalFooter(footerProps) {
  const { close, cancel, submit, t, deleteList } = footerProps;
  return (
    <div className={cx('modal-footer')}>
      <div className={cx('right')}>
        <Button onClick={close} type={'none-border'}>
          {t(cancel)}
        </Button>
        <Button onClick={() => submit.func(deleteList)}>
          {t(submit.text)}
        </Button>
      </div>
    </div>
  );
}

export default DockerImageDeleteModalFooter;
