import { useState } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

// Store
import { MembersPageAtom } from '@src/stores/components/pageContents/MembersPageAtom';

import type { GetUserGraphResponseModel } from '@src/pages/MembersPage/hooks/useGetUserGraph';
// network hooks
import useGetUserGraph from '@src/pages/MembersPage/hooks/useGetUserGraph';

import ToggleButton from '@src/components/atoms/ToggleButton';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

// Types
import MultiBarLineChart from './MultiBarLineChart';

import style from './ExpandedRow.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  id: number;
};

function ExpandedRow({ id }: Props) {
  const { t } = useT();

  const {
    userSession: { workspaceId },
  } = useUserSession();

  const [pageState, setPageState] =
    useRecoilState<MembersPageAtom.MembersPageAtomModel>(
      MembersPageAtom.membersPageAtom,
    );
  const [date, setDate] = useState<'daily' | 'monthly'>('daily');

  useGetUserGraph(
    {
      workspaceId,
      type: date === 'daily' ? 0 : 1,
      id,
    },
    {
      getData: (userGraphData: Array<GetUserGraphResponseModel>) => {
        const newState = _.cloneDeep(pageState);
        let data: Array<GetUserGraphResponseModel> = [];

        if (date === 'daily') {
          data = userGraphData.map((d) => {
            const date = `20${d.date.substring(0, 2)}-${d.date.substring(
              2,
              4,
            )}-${d.date.substring(4)}`;
            return {
              ...d,
              date,
            };
          });
        } else {
          data = userGraphData.map((d) => {
            const date = `20${d.date.substring(0, 2)}-${d.date.substring(
              2,
              4,
            )}`;
            return {
              ...d,
              date,
            };
          });
        }

        newState.membersGraph[id] = {
          graphData: {
            category: {
              dataKey: 'date',
            },
            bar1: {
              name: 'Submitted Labeling',
              dataKey: 'submittedLabeling',
            },
            bar2: {
              name: 'Approved Review',
              dataKey: 'approvedReview',
            },
            line: {
              name: 'Issued',
              dataKey: 'issued',
            },
            data,
          },
        };
        setPageState(newState);
      },
    },
  );

  const onClickGraphDate = (date: 'daily' | 'monthly') => {
    setDate(date);
  };

  return (
    <div className={cx('chart-area')}>
      {pageState.membersGraph[id] ? (
        <>
          <ToggleButton
            select={date === 'daily' ? 'left' : 'right'}
            buttonStyle='blue-white'
            left={{
              label: t(`component.toggleBtn.daily`),
            }}
            right={{
              label: t(`component.toggleBtn.monthly`),
            }}
            customStyle={{
              position: 'absolute',
              top: '46px',
              zIndex: '50',
              left: '16px',
            }}
            onClickLeft={() => onClickGraphDate('daily')}
            onClickRight={() => onClickGraphDate('monthly')}
          />
          {pageState.membersGraph[id] && (
            <MultiBarLineChart
              tagId={`member-graph-${id}`}
              data={
                pageState.membersGraph[id] &&
                pageState.membersGraph[id].graphData
                  ? {
                      bar1: {
                        ...pageState.membersGraph[id].graphData.bar1,
                        name: t('page.members.submittedLabelingData'),
                      },
                      bar2: {
                        ...pageState.membersGraph[id].graphData.bar2,
                        name: t('page.members.approvedReviewData'),
                      },
                      line: {
                        ...pageState.membersGraph[id].graphData.line,
                        name: t('page.members.IssuedData'),
                      },
                      category: pageState.membersGraph[id].graphData.category,
                      data: pageState.membersGraph[id].graphData.data,
                    }
                  : {
                      bar1: {
                        ...pageState.membersGraph[id].graphData.bar1,
                        name: t('page.members.submittedLabelingData'),
                      },
                      bar2: {
                        ...pageState.membersGraph[id].graphData.bar2,
                        name: t('page.members.approvedReviewData'),
                      },
                      line: {
                        ...pageState.membersGraph[id].graphData.line,
                        name: t('page.members.IssuedData'),
                      },
                      category: pageState.membersGraph[id].graphData.category,
                      data: [],
                    }
              }
            />
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ExpandedRow;
