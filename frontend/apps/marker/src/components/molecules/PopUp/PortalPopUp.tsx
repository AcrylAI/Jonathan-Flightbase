import { ClickAwayListener } from '@jonathan/react-utils';

import { PopUpContainer } from '@src/components/atoms';

type Props = {
  onClickPortal: () => void;
};

const PortalPopUp = ({ onClickPortal }: Props) => {
  return (
    <ClickAwayListener onClickAway={onClickPortal}>
      <PopUpContainer width={390} height={146} right={35}>
        <div>포탈 정보 아직직직직입니다</div>
      </PopUpContainer>
    </ClickAwayListener>
  );
};

export default PortalPopUp;
