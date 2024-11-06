// i18n
import React from 'react';

import { CardBox, Sypo } from '@src/components/atoms';

import ProjectModal from '@src/components/organisms/Modal/ProjectModal/ProjectModal';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import { NewCardIcon } from '@src/static/images';

type NewProjectCardProps = {
  refetch: () => void;
};

// CSS Modules
import style from './ProjectCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const NewProjectCard = ({ refetch }: NewProjectCardProps) => {
  const { t } = useT();
  const modal = useModal();

  const openModal = () => {
    modal.createModal({
      title: '프로젝트 생성',
      content: <ProjectModal refetch={refetch} />,
    });
  };

  return (
    <CardBox
      width='100%'
      height='342px'
      borderRadius={12}
      border='dashed 1px #2D76F8'
      hoverBackgroundColor='#DEE9FF'
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        openModal();
      }}
    >
      <img src={NewCardIcon} alt='NewCardIcon' />
      <p className={cx('new-project-text')}>
        <Sypo type='H4' weight={500}>
          {t(`component.btn.newProject`)}
        </Sypo>
      </p>
    </CardBox>
  );
};

export default NewProjectCard;
