// CSS module
import classNames from 'classnames/bind';
import style from '@src/components/Modal/DockerImageDeleteModal/DockerImageDeleteModal.module.scss';
const cx = classNames.bind(style);

function DockerImageDeleteModalHeader(headerPorps) {
  const { t } = headerPorps;
  return (
    <>
      <h2 className={cx('title')}>{t('deleteDockerImagePopup.title.label')}</h2>
    </>
  );
}

export default DockerImageDeleteModalHeader;
