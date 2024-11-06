import { useParams } from 'react-router-dom';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { ClassContentsClassModel } from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';

import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';

import ClassPageClassCard from './ClassCard/ClassPageClassCard';
import ClassPageNodata from './Nodata/ClassPageNodata';
import ClassPagePropCard from './PropCard/ClassPagePropCard';
import ToolsPage from './ToolsPage/ToolsPage';

import styles from './ClassPageContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type ClassPageContentsProps = {
  classList: Array<ClassContentsClassModel>;
  openModal: () => void;
  isLoading: boolean;
};

const ClassPageContents = ({
  isLoading,
  classList,
  openModal,
}: ClassPageContentsProps) => {
  const params = useParams();
  const projectId = Number(params?.pid);
  const { data: metaData } = useGetProjectMetaData({ projectId });

  return (
    <div className={cx('class-page-container')}>
      <Switch>
        <Case condition={isLoading}>
          <div className={cx('loading-container')}></div>
        </Case>
        <Case condition={metaData?.result.type !== 1 && classList.length === 0}>
          <ClassPageNodata openModal={openModal} />
        </Case>
        <Case condition={metaData?.result.type === 1}>
          <ToolsPage classList={classList} />
        </Case>
        <Default>
          <div className={cx('class-card-container')}>
            <ClassPageClassCard />
          </div>
          <div className={cx('prop-card-container')}>
            <ClassPagePropCard />
          </div>
        </Default>
      </Switch>
    </div>
  );
};

export default ClassPageContents;
