import { Fragment } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// component
import {
  InputText,
  Radio,
  Textarea,
  Selectbox,
  Tooltip,
} from '@jonathan/ui-react';
import MultiSelect from '@src/components/molecules/MultiSelect';
import File from '@src/components/molecules/File';

import classNames from 'classnames/bind';
import style from './DockerImageFormModalContent.module.scss';
const cx = classNames.bind(style);

function DockerImageFormModalContent({
  type,
  imageName,
  imageNameError,
  imageDesc,
  imageDescError,
  dockerUrl,
  dockerUrlError,
  dockerTag,
  dockerTagError,
  dockerTagOptions,
  dockerNGC,
  dockerNGCError,
  dockerNGCOptions,
  dockerNGCVersion,
  dockerNGCVersionError,
  dockerNGCVersionOptions,
  uploadTypeOptions,
  uploadType,
  files,
  filesError,
  releaseTypeOptions,
  releaseType,
  textInputHandler,
  multiSelectHandler,
  wsList,
  prevSelectedWsList,
  selectedWsListError,
  fileInputHandler,
  selectInputHandler,
  radioBtnHandler,
  progressRef,
  onRemove,
  commitComment,
  commitCommentError,
  isCommit,
  // setRef,
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={cx('input-wrap')}>
        <label className={cx('label')}>{t('dockerImageName.label')}</label>
        <InputText
          size='large'
          name='imageName'
          status={imageNameError ? 'error' : 'default'}
          value={imageName}
          options={{ maxLength: 50 }}
          placeholder={t('dockerImageName.placeholder')}
          isReadOnly={type === 'EDIT_DOCKER_IMAGE'}
          testId='docker-image-name-input'
          onChange={textInputHandler}
          onClear={() => {
            textInputHandler({ target: { value: '', name: 'imageName' } });
          }}
          disableLeftIcon={true}
          disableClearBtn={false}
          autoFocus
        />
        <span className={cx('error')}>
          {imageNameError && t(imageNameError)}
        </span>
      </div>
      <div className={cx('textarea-wrap')}>
        <label className={cx('label')}>
          {t('dockerImageDescription.label')}
          <span> - {t('optional.label')}</span>
        </label>
        <span className={cx('text-length-box')}>
          <span className={cx('text-length')}>{imageDesc.length}</span>/1000
        </span>
        <Textarea
          placeholder='dockerImageDescription.placeholder'
          status={
            imageDescError === null
              ? ''
              : imageDescError === ''
              ? 'success'
              : 'error'
          }
          value={imageDesc}
          name='imageDesc'
          testId='docker-image-desc-input'
          customStyle={{
            fontSize: '16px',
            height: '86px',
          }}
          onChange={textInputHandler}
          t={t}
        />
        <span className={cx('error')}></span>
      </div>
      <div className={cx('radio-wrap')}>
        <label className={cx('label')}>
          {t('dockerImageCreateType.label')}
        </label>
        <Radio
          options={uploadTypeOptions.map((data) => ({
            ...data,
            disabled:
              data.disabled ||
              type === 'DUPLICATE_DOCKER_IMAGE' ||
              (!isCommit && data.value === 6) ||
              (isCommit && data.value !== 6),
          }))}
          name='uploadType'
          selectedValue={uploadType}
          onChange={(e) => {
            radioBtnHandler('uploadType', e.currentTarget.value);
          }}
          tooltipValue={new Set([2, 3, 5, 6])}
          onTooltipRender={(value) => {
            if (value === 2) {
              return (
                <Tooltip
                  title='Tar'
                  contents={
                    <div>
                      <p className={cx('highlight')}>
                        {t('image.tar.tooltip.message1')}
                      </p>
                      <p>{t('image.tar.tooltip.message2')}</p>
                    </div>
                  }
                  contentsAlign={{ vertical: 'top', horizontal: 'center' }}
                  iconCustomStyle={{
                    width: '24px',
                    marginLeft: '2px',
                  }}
                />
              );
            }
            if (value === 3) {
              return (
                <Tooltip
                  title='Dockerfile build'
                  contents={
                    <div>
                      <p className={cx('highlight')}>
                        {t('image.dockerfileBuild.tooltip.message1')}
                      </p>
                      <p>{t('image.dockerfileBuild.tooltip.message2')}</p>
                      <p className={cx('notice')}>
                        {t('image.dockerfileBuild.tooltip.message3')}
                      </p>
                    </div>
                  }
                  contentsAlign={{ vertical: 'top', horizontal: 'center' }}
                  iconCustomStyle={{
                    width: '24px',
                    marginLeft: '2px',
                  }}
                  contentsCustomStyle={{ minWidth: '380px' }}
                />
              );
            }
            if (value === 5) {
              return (
                <Tooltip
                  title='NGC'
                  contents={t('image.ngc.tooltip.message1')}
                  contentsAlign={{ vertical: 'top', horizontal: 'center' }}
                  iconCustomStyle={{
                    width: '24px',
                    marginLeft: '2px',
                  }}
                />
              );
            }
            if (value === 6) {
              return (
                <Tooltip
                  title='Commit'
                  contents={
                    <div>
                      <p>{t('image.commit.tooltip.message1')}</p>
                      <p className={cx('notice')}>
                        {t('image.commit.tooltip.message2')}
                      </p>
                    </div>
                  }
                  contentsAlign={{ vertical: 'top', horizontal: 'right' }}
                  iconCustomStyle={{
                    width: '24px',
                    marginLeft: '2px',
                  }}
                  contentsCustomStyle={{ minWidth: '280px' }}
                />
              );
            }
          }}
          t={t}
        />
      </div>
      <div className={cx('input-group')}>
        {uploadType === 1 && (
          <>
            <div className={cx('input-wrap')}>
              <label className={cx('label')}>{'Pull URL'}</label>
              <InputText
                size='medium'
                name='dockerUrl'
                status={dockerUrlError ? 'error' : 'default'}
                value={dockerUrl}
                placeholder={t('pull.placeholder')}
                isReadOnly={
                  type === 'EDIT_DOCKER_IMAGE' ||
                  type === 'DUPLICATE_DOCKER_IMAGE'
                }
                onChange={textInputHandler}
                onClear={() => {
                  textInputHandler({
                    target: { value: '', name: 'dockerUrl' },
                  });
                }}
                disableLeftIcon={true}
                disableClearBtn={false}
                testId='dockerimage-pull-input'
              />
              <span className={cx('error')}>
                {dockerUrlError && t(dockerUrlError)}
              </span>
            </div>
          </>
        )}
        {(uploadType === 2 || uploadType === 3) && (
          <File
            label='Docker Image File'
            name='files'
            onChange={fileInputHandler}
            value={files}
            error={filesError}
            btnText='browse.label'
            onRemove={onRemove}
            progressRef={progressRef}
            single
            disabled={
              type === 'EDIT_DOCKER_IMAGE' || type === 'DUPLICATE_DOCKER_IMAGE'
            }
          />
        )}
        {uploadType === 4 && (
          <div className={cx('selectbox-wrap')}>
            <label className={cx('label')}>Tag Name [ID | Node IP]</label>
            {type === 'EDIT_DOCKER_IMAGE' ||
            type === 'DUPLICATE_DOCKER_IMAGE' ? (
              <InputText
                size='medium'
                name='dockerTag'
                value={dockerTag?.label}
                isReadOnly
                disableLeftIcon
              />
            ) : (
              <Selectbox
                type='search'
                size='medium'
                selectedItem={dockerTag}
                list={dockerTagOptions}
                placeholder={t('dockerTag.placeholder')}
                onChange={(value) => {
                  selectInputHandler('dockerTag', value);
                }}
                customStyle={{
                  fontStyle: {
                    selectbox: {
                      color: '#121619',
                      textShadow: 'None',
                    },
                  },
                }}
              />
            )}
            <span className={cx('error')}>{t(dockerTagError)}</span>
          </div>
        )}
        {uploadType === 5 && (
          <Fragment>
            {type === 'CREATE_DOCKER_IMAGE' && (
              <Fragment>
                <div className={cx('selectbox-wrap')}>
                  <label className={cx('label')}>1. NGC [Publisher] Name</label>
                  <Selectbox
                    type='search'
                    size='medium'
                    selectedItem={dockerNGC}
                    list={dockerNGCOptions}
                    placeholder={t('dockerNGC.placeholder')}
                    isReadOnly={dockerNGCOptions.length === 0}
                    customStyle={{
                      fontStyle: {
                        selectbox: {
                          color: '#121619',
                          textShadow: 'None',
                        },
                      },
                    }}
                    onChange={(value) => {
                      selectInputHandler('dockerNGC', value);
                    }}
                    scrollAutoFocus={true}
                  />
                  <span className={cx('error')}>{t(dockerNGCError)}</span>
                </div>
                <div className={cx('selectbox-wrap')}>
                  <label className={cx('label')}>2. Tag Version</label>
                  <Selectbox
                    type='search'
                    size='medium'
                    selectedItem={dockerNGCVersion}
                    list={dockerNGCVersionOptions}
                    placeholder={t('dockerNGCVersion.placeholder')}
                    isReadOnly={
                      !dockerNGC || dockerNGCVersionOptions.length === 0
                    }
                    customStyle={{
                      fontStyle: {
                        selectbox: {
                          color: '#121619',
                          textShadow: 'None',
                        },
                      },
                    }}
                    onChange={(value) => {
                      selectInputHandler('dockerNGCVersion', value);
                    }}
                    scrollAutoFocus={true}
                  />
                  <span className={cx('error')}>
                    {t(dockerNGCVersionError)}
                  </span>
                </div>
              </Fragment>
            )}

            <div className={cx('input-wrap')}>
              <label className={cx('label')}>
                {type === 'CREATE_DOCKER_IMAGE' ? '3. Pull URL' : 'Pull URL'}
              </label>
              <InputText
                size='medium'
                placeholder={
                  type === 'CREATE_DOCKER_IMAGE'
                    ? t('dockerNGCUrl.placeholder')
                    : ''
                }
                status={dockerUrlError ? 'error' : 'default'}
                value={dockerUrl}
                name='dockerUrl'
                disableLeftIcon
                isReadOnly={
                  type === 'DUPLICATE_DOCKER_IMAGE' ||
                  type === 'EDIT_DOCKER_IMAGE'
                }
                disableClearBtn
                onChange={textInputHandler}
              />
              <span className={cx('error')}>
                {dockerUrlError && t(dockerUrlError)}
              </span>
            </div>
          </Fragment>
        )}
        {uploadType === 6 && (
          <>
            <div className={cx('input-wrap')}>
              <label className={cx('label')}>
                {t('addDockerImgComment.label')}
              </label>
              <InputText
                size='medium'
                name='commitComment'
                value={commitComment}
                placeholder={t('commentWrite.label')}
                isReadOnly={
                  type === 'EDIT_DOCKER_IMAGE' ||
                  type === 'DUPLICATE_DOCKER_IMAGE'
                }
                onChange={textInputHandler}
                onClear={() => {
                  textInputHandler({
                    target: { value: '', name: 'commitComment' },
                  });
                }}
                disableLeftIcon={true}
                disableClearBtn={false}
              />
              <span className={cx('error')}>
                {commitCommentError && t(commitCommentError)}
              </span>
            </div>
          </>
        )}
      </div>
      <div className={cx('radio-wrap')}>
        <label className={cx('label')}>{t('releaseType.label')}</label>
        <Radio
          options={releaseTypeOptions}
          name='releaseType'
          selectedValue={releaseType}
          onChange={(e) => {
            radioBtnHandler('releaseType', e.currentTarget.value);
          }}
          t={t}
        />
        <span className={cx('error')}></span>
      </div>
      {/* workspaceId가 undefined이고 ReleaseType으로 Workspace가 선택된 경우에만 설렉트 박스 제공 */}
      {releaseType === 0 && (
        // {(!workspaceId && releaseType === 0) && (
        <MultiSelect
          // innerRef={setRef}
          label='workspaces.label'
          listLabel='availableWorkspaces.label'
          selectedLabel='chosenWorkspaces.label'
          list={wsList} // 초기 목록
          selectedList={prevSelectedWsList} // 초기 선택된 목록
          onChange={multiSelectHandler} // 변경 이벤트
          error={selectedWsListError}
          placeholder={'inputWorkspace.label'}
        />
      )}
    </div>
  );
}

export default DockerImageFormModalContent;
