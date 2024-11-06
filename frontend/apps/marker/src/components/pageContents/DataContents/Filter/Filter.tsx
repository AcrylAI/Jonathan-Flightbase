import { useState } from 'react';
import { useCallback, useEffect } from 'react';
import { useRef } from 'react';

import { Button, Selectbox } from '@jonathan/ui-react';
import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';

import {
  FilterDataType,
  LabelerListType,
  ReviewerListType,
} from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';

import {
  AutoLabeling,
  FileName,
  Labeler,
  Reviewer,
  WorkStatus,
} from './FilterColumnLists';

import styles from './Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  reviewerData: Array<ReviewerListType>;
  labelerData: Array<LabelerListType>;
  filteredData: Array<FilterDataType>;
  setFilteredData: React.Dispatch<any>;
  cancelHandler: () => void;
  filterRef: any;
};

const Filter = (props: Props) => {
  const {
    reviewerData,
    labelerData,
    filteredData,
    setFilteredData,
    cancelHandler,
    filterRef,
  } = props;
  const { t } = useT();
  const [selectedColum, setSelectedColumn] = useState<number>(0);
  const [applyButtonStatus, setApplyButtonStatus] = useState<boolean>(true);
  const [fileNameConditionValue, setFileNameConditionValue] =
    useState<number>(0);
  const [fileNameInputValue, setFileNameInputValue] = useState<string>('');
  const [syncData, setSyncData] = useState<number | undefined>(undefined);
  const [selectedLabeler, setSelectedLabeler] = useState<number[] | undefined>(
    undefined,
  );
  const [selectedLabelerText, setSelectedLabelerText] = useState<string>('');
  const [selectedReviewer, setSelectedReviewer] = useState<Array<number>>([]);
  const [selectedReviewerText, setSelectedReviewerText] = useState<string>('');
  const [autoLabelingData, setAutoLabelingData] = useState<number | undefined>(
    undefined,
  );
  const [workingStatusData, setWorkingStatusData] = useState<
    Array<number> | undefined
  >(undefined);
  const [workingStatusText, setWorkingStatusText] = useState<string>('');
  const TargetColumnList: any = [
    {
      label: t(`page.data.filename`),
      name: 'filename',
      value: 0,
    },
    // {
    //   label: '동기화 상태',
    //   name: 'sync',
    //   value: 1,
    // },
    {
      label: t(`page.data.labeler`),
      name: 'labeler',
      value: 1,
    },
    {
      label: t(`page.data.reviewer`),
      name: 'reviewer',
      value: 2,
    },
    {
      label: t(`page.data.autolabeling`),
      name: 'autoLabeling',
      value: 3,
    },
    {
      label: t(`page.data.workStatus`),
      name: 'workingStatus',
      value: 4,
    },
  ];

  const onApplyHandler = useCallback(() => {
    const filterData: any = {};

    const test = filteredData?.filter((data: FilterDataType) => {
      return data.column === 'filename';
    });
    if (selectedColum === 0) {
      if (test.length > 0) {
        const test = filteredData.map((data: FilterDataType) => {
          if (data.column === 'filename') {
            Object.assign(data, {
              condition: fileNameConditionValue,
              value: fileNameInputValue,
            });
            // data.condition = fileNameConditionValue;
            // data.value = fileNameInputValue;
          }
          return data;
        });
        setFilteredData(test);
      } else {
        filterData.column = 'filename';
        filterData.condition = fileNameConditionValue;
        filterData.value = fileNameInputValue;
        setFilteredData((prev: any) => [...prev, filterData]);
      }
    } else {
      let col: string = '';
      let con: number[] | number | undefined;
      let label: string | number | undefined;

      // if (selectedColum === 1) {
      //   col = 'sync';
      //   con = syncData;
      // }
      if (selectedColum === 1) {
        col = 'labeler';
        con = selectedLabeler?.map((data) => labelerData[data].id);
        label = selectedLabelerText;
      }
      if (selectedColum === 2) {
        col = 'reviewer';
        con = selectedReviewer.map((data) => reviewerData[data].id);
        label = selectedReviewerText;
      }
      if (selectedColum === 3) {
        col = 'autoLabeling';
        con = autoLabelingData;
      }
      if (selectedColum === 4) {
        col = 'workingStatus';
        con = workingStatusData;
        label = workingStatusText;
      }
      const test = filteredData?.filter((data: any) => data.column === col);
      if (test.length > 0) {
        const test = filteredData?.map((data: any) => {
          if (data.column === col) {
            Object.assign(data, {
              condition: con,
            });
            if (label) {
              Object.assign(data, {
                label,
              });
            }
          }
          return data;
        });
        setFilteredData(test);
      } else {
        filterData.column = col;
        filterData.label = label;
        filterData.condition = con;
        setFilteredData((prev: any) => [...prev, filterData]);
      }
    }
    cancelHandler();
  }, [
    filteredData,
    selectedColum,
    setFilteredData,
    fileNameConditionValue,
    fileNameInputValue,
    cancelHandler,
    selectedLabeler,
    selectedLabelerText,
    labelerData,
    selectedReviewer,
    selectedReviewerText,
    reviewerData,
    autoLabelingData,
    workingStatusData,
    workingStatusText,
  ]);

  const selectboxDefaultData = (e: ListType) => {
    const newFilteredData = filteredData?.filter((data: FilterDataType) => {
      return data.column === e.name;
    });

    if (newFilteredData[0]) {
      if (newFilteredData[0].column === 'labeler') {
        const res = labelerData
          .map((data, index) =>
            newFilteredData[0].condition?.includes(data.id) ? index : undefined,
          )
          .filter((x: number | undefined) => x !== undefined) as Array<number>;
        setSelectedLabeler(res);
      }
      if (newFilteredData[0].column === 'reviewer') {
        const res = reviewerData
          .map((data, index) =>
            newFilteredData[0].condition?.includes(data.id) ? index : undefined,
          )
          .filter((x: number | undefined) => x !== undefined) as Array<number>;
        setSelectedReviewer(res);
      }
      if (newFilteredData[0].column === 'sync') {
        setSyncData(newFilteredData[0].condition);
      }
      if (newFilteredData[0].column === 'autoLabeling') {
        setAutoLabelingData(newFilteredData[0].condition);
      }
      if (newFilteredData[0].column === 'workingStatus') {
        setWorkingStatusData(newFilteredData[0].condition);
      }
    } else {
      setApplyButtonStatus(true);
    }
  };

  const onChangeTargetColumHandler = (e: ListType) => {
    setSelectedColumn(e.value as number);
    selectboxDefaultData(e);
  };

  // filter 버튼 활성화/비활성화
  useEffect(() => {
    if (
      (fileNameConditionValue >= 0 && fileNameInputValue) ||
      syncData !== undefined ||
      (selectedLabeler && selectedLabeler?.length > 0) ||
      (selectedReviewer && selectedReviewer?.length > 0) ||
      autoLabelingData !== undefined ||
      workingStatusData !== undefined
    ) {
      setApplyButtonStatus(false);
    } else {
      setApplyButtonStatus(true);
    }
  }, [
    autoLabelingData,
    fileNameConditionValue,
    fileNameInputValue,
    selectedLabeler,
    selectedReviewer,
    setApplyButtonStatus,
    syncData,
    workingStatusData,
  ]);

  return (
    <>
      <div ref={filterRef}>
        <div className={cx('filter-contents')}>
          <p className={cx('filter-title')}>{t(`component.btn.filter`)}</p>
          <div className={cx('font')}>
            <p className={cx('filter-label')}>
              {t(`component.selectBox.targetColumn`)}
            </p>
            <Selectbox
              theme='jp'
              list={TargetColumnList}
              onChange={(e) => onChangeTargetColumHandler(e)}
              selectedItem={TargetColumnList[selectedColum]}
              // type='checkbox'
              customStyle={{
                fontStyle: {
                  selectbox: {
                    fontSize: '13px',
                  },
                  list: {
                    fontSize: '13px',
                  },
                },
              }}
            />
          </div>
          <div>
            {selectedColum === 0 && (
              <FileName
                setFileNameConditionValue={setFileNameConditionValue}
                setFileNameInputValue={setFileNameInputValue}
                fileNameConditionValue={fileNameConditionValue}
              />
            )}
            {/* {selectedColum === 1 && ( // 동기화
              <Sync setSyncData={setSyncData} syncData={syncData} />
            )} */}
            {selectedColum === 1 && ( // 라벨러
              <Labeler
                labelerData={labelerData}
                selectedLabeler={selectedLabeler}
                setSelectedLabeler={setSelectedLabeler}
                setSelectedLabelerText={setSelectedLabelerText}
              />
            )}
            {selectedColum === 2 && ( // 검수자
              <Reviewer
                reviewerData={reviewerData}
                selectedReviewer={selectedReviewer}
                setSelectedReviewer={setSelectedReviewer}
                setSelectedReviewerText={setSelectedReviewerText}
              />
            )}
            {selectedColum === 3 && ( // 오토라벨링
              <AutoLabeling
                setAutoLabelingData={setAutoLabelingData}
                autoLabelingData={autoLabelingData}
              />
            )}
            {selectedColum === 4 && ( // 작업상태
              <WorkStatus
                workingStatusData={workingStatusData}
                setWorkingStatusData={setWorkingStatusData}
                setWorkingStatusText={setWorkingStatusText}
              />
            )}
          </div>
          <div
            style={{
              display: 'flex',
              bottom: '15px',
              justifyContent: 'end',
              marginTop: '10px',
              right: '10px',
            }}
          >
            <Button
              type='primary-reverse'
              customStyle={{
                color: '#747474',
              }}
              onClick={cancelHandler}
            >
              {t(`component.btn.cancel`)}
            </Button>
            <Button
              disabled={applyButtonStatus}
              customStyle={{
                marginLeft: '10px',
              }}
              onClick={onApplyHandler}
            >
              {t(`component.btn.apply`)}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Filter;
