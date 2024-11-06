import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ProjectModalCtlAtom,
  ProjectModalCtlAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Mypo, Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import {
  CommonLabeling,
  JonthanLabeling,
  JonthanLabelingGray,
} from '@src/static/images';

import styles from './ProjectModalModeSelector.module.scss';
import classNames from 'classnames/bind';
import { BLUE110, MONO204 } from '@src/utils/color';

const cx = classNames.bind(styles);

type ModeType = 'normal' | 'jonathan';

type BtnBoxType = {
  title: string;
  type: ModeType;
  img: Array<string>;
  desc: Array<string>;
  disabled: boolean;
  onClickBtn: (type: ModeType) => void;
};
const BtnBox = ({
  title,
  img,
  desc,
  type,
  disabled = false,
  onClickBtn,
}: BtnBoxType) => {
  const handleClick = () => {
    if (!disabled) onClickBtn(type);
  };
  return (
    <div className={cx('box', disabled && 'disabled')} onClick={handleClick}>
      <div className={cx('title')}>
        <Sypo type='H4' weight='R'>
          {title}
        </Sypo>
      </div>
      <div className={cx('images')}>
        {img.map((v, idx) => (
          <div className={cx('img')} key={`btn-img ${idx}`}>
            <img src={v} alt={type} />
          </div>
        ))}
      </div>
      <div className={cx('desc')}>
        {desc.map((v, idx) => (
          <div className={cx('btn-desc')} key={`btn-desc ${idx}`}>
            <Mypo type='P1' weight='R'>
              {v}
            </Mypo>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectModalModeSelector = () => {
  const { t } = useT();
  const [modalCtl, setModalCtl] =
    useRecoilState<ProjectModalCtlAtomModel>(ProjectModalCtlAtom);
  const onClickBtn = (type: ModeType) => {
    const temp = _.cloneDeep(modalCtl);
    let mode = 0;
    switch (type) {
      case 'normal':
        mode = 1;
        break;
      case 'jonathan':
        mode = 2;
        break;
      default:
    }
    temp.mode = mode;
    setModalCtl(temp);
  };
  const normalBtn: BtnBoxType = {
    type: 'normal',
    title: `${t(`modal.modeSelect.defaultTitle`)}`,
    img: [CommonLabeling],
    disabled: false,
    desc: [
      `${t(`modal.modeSelect.defaultDesc`)}`,
      `${t(`modal.modeSelect.defaultEx`)}`,
    ],
    onClickBtn,
  };
  const jonathanBtn: BtnBoxType = {
    type: 'jonathan',
    title: `${t(`modal.modeSelect.jonathanTitle`)}`,
    img: [JonthanLabelingGray],
    disabled: true,
    desc: [
      `${t(`modal.modeSelect.jonathanDesc`)}`,
      `${t(`modal.modeSelect.jonathanEx`)}`,
    ],
    onClickBtn,
  };
  return (
    <div className={cx('mode-container')}>
      <div className={cx('header')}>
        <Sypo type='H4' weight='B'>
          {t(`modal.modeSelector.header`)}
        </Sypo>
      </div>
      <div className={cx('btns')}>
        <BtnBox {...normalBtn} />
        <BtnBox {...jonathanBtn} />
      </div>
    </div>
  );
};

export default ProjectModalModeSelector;
