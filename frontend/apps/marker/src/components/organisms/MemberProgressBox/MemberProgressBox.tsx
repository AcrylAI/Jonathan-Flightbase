import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import {
  ProjectMembersContentsAtom,
  ProjectMembersContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';

// Atoms
import { ItemContainer, Sypo } from '@src/components/atoms';

// API
import useGetProjectUserDetail from '@src/hooks/Api/useGetProjectUserDetail';
// i18n
import useT from '@src/hooks/Locale/useT';

import MemberProgressBoxContents from './MemberProgressBoxContents';

// Icon
import { ClockIcon } from '@src/static/images';

// CSS
import styles from './MemberProgressBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export type LabelingDataTypes = {
  finish: number;
  labelingDenominator: number;
  labelingNumerator: number;
  reject: number;
  rejectDenominator: number;
  rejectNumerator: number;
  wait: number;
  work: number;
};

export type ReviewDataTypes = {
  checkDenominator: number;
  checkNumerator: number;
  finish: number;
  reject: number;
  rejectDenominator: number;
  rejectNumerator: number;
  work: number;
};

export type DataResultTypes = {
  lastLoaded: string;
  labeling: LabelingDataTypes;
  review: ReviewDataTypes;
};

type Props = {
  noReviewProject: boolean;
};

const MemberProgressBox = ({ noReviewProject }: Props) => {
  const { t } = useT();
  const params = useParams();
  const projectId = Number(params?.pid);

  const [pageState, setPageState] =
    useRecoilState<ProjectMembersContentsAtomModel>(ProjectMembersContentsAtom);
  const [reviewBlindState, setReviewBlindState] = useState<boolean>(false);
  const [labelingBlindState, setLabelingBlindState] = useState<boolean>(false);
  const [dataState, setDataState] = useState<DataResultTypes>();

  const { data, refetch } = useGetProjectUserDetail({
    projectId,
    id: pageState.selectedId,
  });

  const refetchData = () => {
    if (pageState.projectId !== 0) refetch();
  };

  // 멤버 이름의 앞글자를 대문자로 바꿔주는 함수
  const selectedMemberName = () => {
    let conversionData = '';

    if (pageState.selectedName !== undefined) {
      const data = pageState.selectedName;
      const firstString = data.charAt(0);
      const others = data.slice(1);

      conversionData = firstString.toUpperCase() + others;
    }

    return conversionData;
  };

  const notAssignedReview = () => {
    const reviewData = data?.result.review;
    let notAssignedReview = false;

    if (reviewData !== undefined) {
      const value = reviewData.finish + reviewData.reject + reviewData.work;

      if (value === 0) {
        notAssignedReview = true;
      }
      if (reviewBlindState !== notAssignedReview) {
        setReviewBlindState(notAssignedReview);
      }
    }
    return notAssignedReview;
  };
  notAssignedReview();

  const notAssignedLabeling = () => {
    const labelingData = data?.result.labeling;
    let notAssignedLabeling = false;

    if (labelingData !== undefined) {
      const value =
        labelingData.finish +
        labelingData.reject +
        labelingData.work +
        labelingData.wait;

      if (value === 0) {
        notAssignedLabeling = true;
      }
      if (labelingBlindState !== notAssignedLabeling) {
        setLabelingBlindState(notAssignedLabeling);
      }
    }
    return notAssignedLabeling;
  };
  notAssignedLabeling();

  useEffect(() => {
    refetchData();
  }, [pageState.selectedId]);

  useEffect(() => {
    if (data !== undefined) {
      setDataState(data.result);
    }
  }, [data?.result]);

  return (
    <>
      <ItemContainer
        headerTitle={
          <div className={cx('selected-title')}>
            {pageState.selectedId === undefined
              ? t(`component.list.projectTotal`)
              : selectedMemberName()}
          </div>
        }
        headerContents={
          <p className={cx('last-change')}>
            <img src={ClockIcon} alt='' />
            <Sypo type='P1' weight={400}>
              {t(`page.dashboardProject.lastChange`)} : {dataState?.lastLoaded}
            </Sypo>
          </p>
        }
        itemContents={
          <MemberProgressBoxContents
            data={
              dataState ?? {
                lastLoaded: '00-00-00 00:00:00',
                labeling: {
                  labelingNumerator: 0,
                  labelingDenominator: 0,
                  rejectNumerator: 0,
                  rejectDenominator: 0,
                  work: 0,
                  wait: 0,
                  reject: 0,
                  finish: 0,
                },
                review: {
                  checkNumerator: 0,
                  checkDenominator: 0,
                  rejectNumerator: 0,
                  rejectDenominator: 0,
                  work: 0,
                  reject: 0,
                  finish: 0,
                },
              }
            }
            noReviewProject={noReviewProject}
            reviewBlindState={reviewBlindState}
            labelingBlindState={labelingBlindState}
          />
        }
      />
    </>
  );
};

export default MemberProgressBox;
