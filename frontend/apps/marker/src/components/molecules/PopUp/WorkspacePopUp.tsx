import styled from 'styled-components';

import { PopUpContainer } from '@src/components/atoms';

const WorkspacePopUp = () => {
  return (
    <PopUpContainer width={400} height={285} left={230}>
      <Test>WS 아아아아직입니다</Test>
    </PopUpContainer>
  );
};

const Test = styled.p``;

export default WorkspacePopUp;
