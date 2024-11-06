import { useState } from 'react';

import ClickAwayListener from '@src/components/ClickAwayListener/ClickAwayListener';

const color = ['skyblue', 'red', 'blue', 'gray', 'black', 'green'];

function ClickAwayTestPage() {
  const [colorIdx, setColorIdx] = useState(0);

  return (
    <div
      style={{
        paddingTop: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <h1
        style={{
          userSelect: 'none',
        }}
      >
        ClickAwayTestPage
      </h1>
      <ClickAwayListener
        onClickAway={() => {
          if (colorIdx === 5) {
            setColorIdx(0);
          }
          setColorIdx((colorIdx) => colorIdx + 1);
        }}
      >
        <div
          tabIndex={-1}
          style={{
            width: '300px',
            height: '300px',
            padding: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color[colorIdx]}`,
            userSelect: 'none',
          }}
        >
          Area
        </div>
      </ClickAwayListener>
    </div>
  );
}

export default ClickAwayTestPage;
