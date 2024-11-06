import { Sypo } from '@src/components/atoms';

import DeleteGuideModal from '@src/components/organisms/Modal/DeleteGuideModal/DeleteGuideModal';

import { GuideDataTypes } from '@src/components/pageContents/ProjectInfoContents/ProjectInfoContents';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import { DeleteIcon, DownloadIcon } from '@src/static/images';

import styles from './ProjectInfoForm.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  guideData: Array<GuideDataTypes>;
  refetch: () => void;
};

const GuideListForm = ({ guideData, refetch }: Props) => {
  const { t } = useT();
  const modal = useModal();

  const openDeleteModal = (name: string, id: number) => {
    modal.createModal({
      title: 'Delete Guideline',
      content: <DeleteGuideModal name={name} id={id} refetch={refetch} />,
    });
  };

  const onDownloadClick = (fileName: string, fileUrl: string) => {
    const link = document.createElement('a');
    link.href = fileUrl; // 서버에 파일이름은 항상 동일하게 올리고
    link.download = fileName; // 다운로드 받을 때 업데이트 날짜 들어가게 하기
    link.target = '_blank';
    link.click();
    link.remove();
  };

  return (
    <>
      <div className={cx('guide-list-from-wrapper')}>
        <div className={cx('guide-list-header')}>
          <p className={cx('guideline-name-header')}>
            <Sypo type='P2' weight={400}>
              {t(`page.projectInfo.guidelineName`)}
            </Sypo>
          </p>
          <p className={cx('upload-date-header')}>
            <Sypo type='P2' weight={400}>
              {t(`page.projectInfo.uploadedDate`)}
            </Sypo>
          </p>
          <p className={cx('download-button-header')}>
            <Sypo type='P2' weight={400}>
              {t(`page.projectInfo.download`)}
            </Sypo>
          </p>
          <p className={cx('delete-button-header')}>
            <Sypo type='P2' weight={400}>
              {t(`page.projectInfo.delete`)}
            </Sypo>
          </p>
        </div>
        {guideData.map((data: GuideDataTypes, index: number) => (
          <div
            className={cx('guide-list-item-wrapper')}
            key={`guide-list-item-wrapper-${index}`}
          >
            <p className={cx('guideline-name')}>
              <Sypo type='P1' weight={400}>
                {data.name}
              </Sypo>
            </p>
            <p className={cx('upload-date')}>
              <Sypo type='P1' weight={400}>
                {data.createdDate}
              </Sypo>
            </p>
            <button
              className={cx('download-button')}
              onClick={() => onDownloadClick(data.name, data.url)}
            >
              <img
                className={cx('buttin-icon')}
                src={DownloadIcon}
                alt='download'
              />
            </button>
            <button
              className={cx('delete-button')}
              onClick={() => openDeleteModal(data.name, data.id)}
            >
              <img
                className={cx('buttin-icon')}
                src={DeleteIcon}
                alt='delete'
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default GuideListForm;
