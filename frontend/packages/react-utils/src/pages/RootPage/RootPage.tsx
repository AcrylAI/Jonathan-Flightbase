import { useHistory } from 'react-router-dom';

function RootPage() {
  const history = useHistory();

  return (
    <div>
      <button
        onClick={() => {
          history.push('/test/click-away');
        }}
      >
        click away listener test
      </button>
      <button
        onClick={() => {
          history.push('/test/if-component');
        }}
      >
        if component test
      </button>
    </div>
  );
}

export default RootPage;
