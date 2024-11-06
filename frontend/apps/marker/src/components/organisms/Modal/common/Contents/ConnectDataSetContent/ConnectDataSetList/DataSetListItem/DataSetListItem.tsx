import React, { useState } from 'react';

import { ProjectModalDatasetPathModel } from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';
import { useGetDataSetListProps } from '../../hooks/useGetDataSetList';

import { toast } from '@src/components/molecules/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';

import {
  DataSetEmptyIcon,
  DataSetExistIcon,
  FolderEmptyIcon,
  FolderFullIcon,
} from '@src/static/images';
import UnFoldIcon from '@src/static/images/icon/Unfold.svg';

import styles from './DataSetListItem.module.scss';
import classNames from 'classnames/bind';

import { fetcher, JSON_HEADER, METHOD } from '@src/network/api/api';
import axios, { AxiosRequestConfig } from 'axios';
import useModal from '@src/hooks/Modal/useModal';

const cx = classNames.bind(styles);
// 재귀 리스트
type SubPathListProps = {
  list: Array<ProjectModalDatasetPathModel>;
  depth: number;
  selected: boolean;
  loading: boolean;
  selectedPath: string;
  getPathList: (path: string) => Promise<ProjectModalDatasetPathModel[]>;
  setSelectedPath: (path: string, viewPath: string, fileCount: number) => void;
};
const SubPathList = ({
  list,
  depth,
  loading,
  selected,
  selectedPath,
  getPathList,
  setSelectedPath,
}: SubPathListProps) => {
  return (
    <div className={cx('sub-path-list-container')}>
      {list.map((v, idx) => (
        <React.Fragment key={`pathList ${v.path} ${idx}`}>
          <SubPathItem
            item={v}
            depth={depth}
            loading={loading}
            selected={selected}
            selectedPath={selectedPath}
            getPathList={getPathList}
            setSelectedPath={setSelectedPath}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

type SubPathItemProps = {
  item: ProjectModalDatasetPathModel;
  depth: number;
  selected: boolean;
  loading: boolean;
  selectedPath: string;
  getPathList: (path: string) => Promise<ProjectModalDatasetPathModel[]>;
  setSelectedPath: (path: string, viewPath: string, fileCount: number) => void;
};

// 재귀 아이템
const SubPathItem = ({
  item,
  depth,
  loading,
  selected,
  selectedPath,
  getPathList,
  setSelectedPath,
}: SubPathItemProps) => {
  const [active, setActive] = useState<boolean>(false);
  const [childList, setChildList] = useState<
    Array<ProjectModalDatasetPathModel>
  >([]);

  const checkSelectedState = () => {
    return selectedPath === item.path;
  };

  const handleExpend = async () => {
    if (childList.length === 0) {
      const list = await getPathList(item.path);
      setChildList(list);
      if (list) {
        setActive(true);
      }
    } else {
      setActive(!active);
    }
  };

  const handleClickList = (e: React.MouseEvent<HTMLDivElement>) => {
    handleExpend();
    setSelectedPath(item.path, item.viewPath, item.fileCnt);
  };

  const handleClickArrow = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleExpend();
  };

  return (
    <>
      <div
        className={cx(
          'sub-path-wrapper',
          checkSelectedState() && 'selected',
          loading && checkSelectedState() && 'loading',
        )}
      >
        <div
          className={cx('req-container')}
          onClick={handleClickList}
          style={{
            marginLeft: `${32 + 24 * depth}px`,
          }}
        >
          <div className={cx('right-side')}>
            <div className={cx('arrow-container')} onClick={handleClickArrow}>
              <div
                className={cx(
                  'arrow',
                  active && 'active',
                  item.subCnt === 0 && 'no-child',
                )}
              >
                <img src={UnFoldIcon} alt='arrow' />
              </div>
            </div>
            <div className={cx('path-name')}>
              <Sypo type='P1'>{item.name}</Sypo>
            </div>
          </div>
          <div className={cx('left-side')}>
            <div className={cx('folder-count')}>
              <div className={cx('icon')}>
                <img
                  src={item.subCnt > 0 ? FolderFullIcon : FolderEmptyIcon}
                  alt={item.subCnt > 0 ? 'exist' : 'empty'}
                />
              </div>
              <div className={cx('count')}>
                <Sypo type='P2'>
                  {item.subCnt > 0 ? item.subCnt.toLocaleString('ko-KR') : 0}
                </Sypo>
              </div>
            </div>
            <div className={cx('file-count')}>
              <div className={cx('icon')}>
                <img
                  src={item.fileCnt > 0 ? DataSetExistIcon : DataSetEmptyIcon}
                  alt={item.fileCnt > 0 ? 'exist' : 'empty'}
                ></img>
              </div>
              <div className={cx('count')}>
                <Sypo type='P2'>
                  {item.fileCnt > 0 ? item.fileCnt.toLocaleString('ko-KR') : 0}
                </Sypo>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('path-list', active && 'active')}>
        <SubPathList
          list={childList}
          depth={depth + 1}
          loading={loading}
          getPathList={getPathList}
          selected={checkSelectedState()}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
        />
      </div>
    </>
  );
};

type DataSetListItemProps = {
  item: ProjectModalDatasetPathModel;
  selectedPath: string;
  setSelectedPath: (path: string, viewPath: string, fileCount: number) => void;
};

const DataSetListItem = ({
  item,
  selectedPath,
  setSelectedPath,
}: DataSetListItemProps) => {
  const {
    userSession: { workspaceId, token },
  } = useUserSession();

  const modal = useModal();
  const [active, setActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [childList, setChildList] = useState<
    Array<ProjectModalDatasetPathModel>
  >([]);

  // UTILS
  const getItemState = () => {
    let className = 'inactive';
    if (item.subCnt > 0) {
      className = 'expendable';
    }
    if (active) {
      className = 'active';
    }
    return className;
  };

  // API FUNCTION
  // 재귀 요소를 리액트쿼리로 제어하기에 어려움이 있어 axios로 호출
  const getPathList = async (
    path: string,
  ): Promise<ProjectModalDatasetPathModel[]> => {
    let resp: Array<ProjectModalDatasetPathModel> = [];

    const params: useGetDataSetListProps = {
      workspaceId: Number(workspaceId),
      path,
    };
    const API_URL = import.meta.env.VITE_REACT_APP_MARKER_API;

    if (!token) {
      toast.api.failed();
      return resp;
    }
    const config: AxiosRequestConfig = {
      url: `${API_URL}data/link`,
      method: METHOD.GET,
      headers: {
        ...JSON_HEADER,
        token,
      },
      params,
    };
    try {
      setLoading(true);
      const { status, result } = await fetcher.query(config)();
      if (status && result) {
        resp = result as Array<ProjectModalDatasetPathModel>;
      }
    } catch (err) {
      toast.api.failed();
    } finally {
      setLoading(false);
    }
    return resp;
  };

  // HANDLE FUNCTION
  const handleClickList = (e: React.MouseEvent<HTMLDivElement>) => {
    handleExpend();
    setSelectedPath(item.path, item.viewPath, item.fileCnt);
  };

  const handleExpend = async () => {
    if (childList.length === 0 && item.subCnt > 0) {
      const list = await getPathList(item.path);
      setChildList(list);
      if (list) {
        setActive(true);
      }
    } else if (item.subCnt > 0) {
      setActive(!active);
    }
  };

  const handleClickArrow = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleExpend();
  };
  const checkSelectedState = () => {
    return selectedPath === item.path;
  };

  return (
    <>
      <div
        className={cx(
          'dataset-container',
          checkSelectedState() && 'selected',
          loading && checkSelectedState() && 'loading',
        )}
        onClick={handleClickList}
      >
        <div className={cx('left-side')}>
          <div className={cx('path')}>
            <Sypo type='P1'>{item.name}</Sypo>
          </div>
          <div className={cx('permission')}>
            <Sypo type='P2'>{item.type}</Sypo>
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('folder-count')}>
            <div className={cx('icon')}>
              <img
                src={item.subCnt > 0 ? FolderFullIcon : FolderEmptyIcon}
                alt={item.subCnt > 0 ? 'exist' : 'empty'}
              />
            </div>
            <div className={cx('count')}>
              <Sypo type='P2'>
                {item.subCnt > 0 ? item.subCnt.toLocaleString('ko-KR') : 0}
              </Sypo>
            </div>
          </div>
          <div className={cx('file-count')}>
            <div className={cx('icon')}>
              <img
                src={item.fileCnt > 0 ? DataSetExistIcon : DataSetEmptyIcon}
                alt={item.fileCnt > 0 ? 'exist' : 'empty'}
              />
            </div>
            <div className={cx('count')}>
              <Sypo type='P2'>
                {item.fileCnt > 0 ? item.fileCnt.toLocaleString('ko-KR') : 0}
              </Sypo>
            </div>
          </div>
          <div
            className={cx('arrow', getItemState())}
            onClick={handleClickArrow}
          >
            <img src={UnFoldIcon} alt='arrow' />
          </div>
        </div>
      </div>
      <div className={cx('sub-path-container', active && 'active')}>
        <SubPathList
          list={childList}
          depth={0}
          loading={loading}
          selected={checkSelectedState()}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          getPathList={getPathList}
        />
      </div>
    </>
  );
};

export default DataSetListItem;
