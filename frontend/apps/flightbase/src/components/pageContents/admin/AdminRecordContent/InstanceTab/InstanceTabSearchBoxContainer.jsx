import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';

// i18n
import { useTranslation } from 'react-i18next';

// Containers
import MonthMultiCheckSelectContainer from '@src/containers/MonthMultiCheckSelectContainer';
import TrainingMultiCheckSelectContainer from '@src/containers/TrainingMultiCheckSelectContainer';

// Components
import SearchBox from '../SearchBox';
import { Selectbox } from '@jonathan/ui-react';

const cYear = dayjs().year();

const InstanceTabSearchBoxContainer = ({
  onSearch,
  chipList = [],
  removeChip,
  groupType,
  group,
}) => {
  const { t } = useTranslation();

  const [year, setYear] = useState(null);
  const [yearOptions] = useState(
    new Array(5)
      .fill(null)
      .map((d, i) => ({ label: cYear - i, value: cYear - i })),
  );

  const [monthOption, setMonthOptions] = useState({
    monthOptions: [],
  });

  const [trainingOption, setTrainingOption] = useState({
    trainingOptions: [],
  });

  const onChangeSelectBox = useCallback(
    (target, value) => {
      if (target === 'year') {
        setYear(value);
      }
    },
    [setYear],
  );

  const catchOnSearch = useCallback(() => {
    const { monthOptions } = monthOption;
    const { trainingOptions } = trainingOption;
    const yearOpts = year
      ? [
          {
            label: `Year: ${year.value}`,
            origin: year,
            param: { key: 'year', value: year.value },
          },
        ]
      : [];
    const monthOpts = monthOptions
      .filter(({ checked }) => checked)
      .map((opt) => ({
        label: `Month: ${opt.value}`,
        origin: opt,
        param: { key: 'months', value: opt.value },
      }));
    const trainingOpts = trainingOptions
      .filter(({ checked }) => checked)
      .map((opt) => ({
        label: `Training: ${opt.label}`,
        origin: opt,
        param: { key: 'training', value: opt.value },
      }));
    const newChipList = [...yearOpts, ...monthOpts, ...trainingOpts];
    onSearch(newChipList);
  }, [onSearch, year, monthOption, trainingOption]);

  const multiCheckSubmit = useCallback(
    (target, data) => {
      if (target === 'monthOption') {
        setMonthOptions({
          ...monthOption,
          monthOptions: data,
        });
      } else if (target === 'trainingOption') {
        setTrainingOption({
          ...trainingOption,
          trainingOptions: data,
        });
      }
    },
    [monthOption, setMonthOptions, trainingOption, setTrainingOption],
  );

  useEffect(() => {
    if (chipList.length === 0) {
      setYear(null);
      setMonthOptions({
        ...monthOption,
        monthOptions: [],
      });
      setTrainingOption({
        ...trainingOption,
        training: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipList, setYear, setMonthOptions, setTrainingOption]);

  const syncYearOption = (syncValue) => {
    setYear(syncValue);
  };

  const syncMonthOptions = (syncArray) => {
    const { monthOptions } = monthOption;
    const newOptions = monthOptions.map((v) => {
      let checked = false;
      for (let i = 0; i < syncArray.length; i += 1) {
        if (syncArray[i] === v.value) {
          checked = true;
          break;
        }
      }
      return { ...v, checked };
    });
    setMonthOptions({ ...monthOption, monthOptions: newOptions });
  };

  const syncTrainingOptions = (syncArray) => {
    const { trainingOptions } = trainingOption;
    const newOptions = trainingOptions.map((v) => {
      let checked = false;
      for (let i = 0; i < syncArray.length; i += 1) {
        if (syncArray[i] === v.value) {
          checked = true;
          break;
        }
      }
      return { ...v, checked };
    });
    setTrainingOption({ ...trainingOption, trainingOptions: newOptions });
  };

  useEffect(() => {
    let yearSyncValue = null;
    const monthSyncArray = [];
    const trainingSyncArray = [];

    for (let i = 0; i < chipList.length; i += 1) {
      const {
        param: { key },
        origin,
      } = chipList[i];
      if (key === 'year') {
        const { value: yearValue } = origin;
        yearSyncValue = yearValue;
      } else if (key === 'months') {
        const { value: monthValue } = origin;
        monthSyncArray.push(monthValue);
      } else if (key === 'training') {
        const { value: trainingId } = origin;
        trainingSyncArray.push(trainingId);
      }
    }
    syncYearOption(
      yearSyncValue
        ? { label: yearSyncValue, value: yearSyncValue }
        : yearSyncValue,
    );
    if (yearSyncValue && monthSyncArray.length !== 0)
      syncMonthOptions(monthSyncArray);
    else syncMonthOptions([]);
    syncTrainingOptions(trainingSyncArray);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipList]);

  const { monthOptions } = monthOption;
  const { trainingOptions } = trainingOption;
  return (
    <SearchBox
      onSearch={catchOnSearch}
      selectedList={chipList}
      removeChip={removeChip}
    >
      <Selectbox
        size='medium'
        list={yearOptions}
        selectedItem={year}
        placeholder={t('selectYear.placeholder')}
        onChange={(value) => {
          onChangeSelectBox('year', value);
        }}
        customStyle={{ globalForm: { width: '160px' } }}
      />
      <MonthMultiCheckSelectContainer
        submit={multiCheckSubmit}
        selectedOptions={monthOptions}
        readOnly={!year}
        chipList={chipList}
      />
      <TrainingMultiCheckSelectContainer
        submit={multiCheckSubmit}
        selectedOptions={trainingOptions}
        groupType={groupType}
        group={group}
        chipList={chipList}
        readOnly={!group}
      />
    </SearchBox>
  );
};

export default InstanceTabSearchBoxContainer;
