import { useSelector } from 'react-redux';

// ui-react
import { Button } from '@jonathan/ui-react';

function RoundModalFooter(footerProps) {
  const { theme } = useSelector(({ theme }) => theme);
  const {
    createdRoundName,
    roundStartButtonDisabled,
    onClickStartRound,
    t
  } = footerProps;
  return (
    <>
      <Button
        theme={theme}
        disabled={roundStartButtonDisabled}
        onClick={() => onClickStartRound()}
        children={t('roundCreate.start.label', { number: createdRoundName })}
      />
    </>
  );
}
export default RoundModalFooter;
