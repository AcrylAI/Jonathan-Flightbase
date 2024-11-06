import { useState, useEffect } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Selectbox } from '@jonathan/ui-react';

// Images
import DirectoryArrowIcon from '@src/static/images/icon/ic-directory-arrow.svg';
import RightArrowIcon from '@src/static/images/icon/ic-right.svg';
import LeftArrowIcon from '@src/static/images/icon/ic-left.svg';

// CSS module
import classNames from 'classnames/bind';
import style from './DatasetFinder.module.scss';
const cx = classNames.bind(style);

const DatasetFinder = ({
  onChange,
  onClick,
  setPath,
  tree,
  value,
  back,
  forward,
}) => {
  const { t } = useTranslation();
  const [dirList, setDirList] = useState([{ label: '/', value: '/' }]);
  const [topDir, setTopDir] = useState('/');

  /**
   * 상위 폴더로 이동할 경로 구하기
   */
  useEffect(() => {
    let dir = '/';
    const dirList = value.split('/');
    if (dirList.length > 2) {
      dirList.pop();
      dir = dirList.join('/');
    }
    setTopDir(dir);
  }, [value]);

  /**
   * 경로 선택 옵션 설정
   */
  useEffect(() => {
    if (tree.length > 0) {
      const treeObj = tree.map((data) => {
        return { label: data, value: data };
      });
      setDirList(treeObj);
    }
  }, [tree]);

  return (
    <div className={cx('finder')}>
      <div className={cx('history-box')}>
        <button onClick={back} name={t('moveBack.label')}>
          <img src={LeftArrowIcon} alt={t('moveBack.label')} />
        </button>
        <button onClick={forward} name={t('moveForward.label')}>
          <img src={RightArrowIcon} alt={t('moveForward.label')} />
        </button>
        <button
          onClick={() => setPath(topDir)}
          name={t('moveToPath.label', { path: topDir })}
        >
          <img
            src={DirectoryArrowIcon}
            alt={t('moveToPath.label', { path: topDir })}
          />
        </button>
      </div>
      <div className={cx('search-box')}>
        <Selectbox
          type='search'
          size='medium'
          list={dirList}
          selectedItem={{ label: value, value }}
          onChange={onChange}
          onClick={onClick}
          customStyle={{
            fontStyle: {
              selectbox: {
                color: '#121619',
                textShadow: 'None',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default DatasetFinder;
