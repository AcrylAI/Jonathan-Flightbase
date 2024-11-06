import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@jonathan/ui-react';

function BroadcastModelModal({ data, type }) {
  const {
    headerRender,
    contentRender,
    footerRender,
    version,
    clientList,
    onSubmit,
  } = data;

  // 연결된 클라이언트 수
  const connectedClientCount = clientList.filter(
    ({ connection }) => connection.toLowerCase() === 'connected',
  ).length;

  const [newClientList, setNewClientList] = useState(clientList);
  const [selectedClientList, setSelectedClientList] = useState([]);
  const [validate, setValidate] = useState(false);
  const [allChecked, setAllChecked] = useState(true);

  /**
   * 클라이언트 목록 체크박스 변경 이벤트
   */
  const onChangeClientList = useCallback(
    (idx) => {
      newClientList[idx].checked = !newClientList[idx].checked;
      setNewClientList(newClientList);
      makeSelectedClientList(newClientList);
    },
    [newClientList],
  );

  /**
   * 전체 체크박스 선택/해제 이벤트
   * @param {boolean} checked 체크박스 체크여부
   */
  const onChangeAllChecked = (checked) => {
    setAllChecked(!checked);
    if (!checked) {
      for (let i = 0; i < newClientList.length; i++) {
        if (newClientList[i].connection.toLowerCase() === 'connected') {
          newClientList[i].checked = true;
        }
      }
    } else {
      for (let i = 0; i < newClientList.length; i++) {
        if (newClientList[i].connection.toLowerCase() === 'connected') {
          newClientList[i].checked = false;
        }
      }
    }
    setNewClientList(newClientList);
    makeSelectedClientList(newClientList);
  };

  /**
   * 선택된 클라이언트 name/address 리스트 생성
   * @param {Array} newClientList 클라언트
   * newClientList 예시)
   *  [{
   *     "client_name": "XXhospital",
   *     "client_address" :"192.168.X.XX:XXXXX",
   *     "connection": "Connected",
   *     "checked": true
   *   },
   *   ...
   *  ]
   * checkedList 예시)
   *  [{
   *     "client_name": "XXhospital",
   *     "client_address" :"192.168.X.XX:XXXXX",
   *   },
   *   ...
   *  ]
   */
  const makeSelectedClientList = (newClientList) => {
    const checkedList = newClientList
      .filter(({ checked }) => checked)
      .map(({ client_name, client_address }) => {
        return { client_name, client_address };
      });
    setSelectedClientList(checkedList);
  };

  useEffect(() => {
    // 유효성 검사 (선택된 클라이언트가 한개 이상일 때 전송 가능)
    if (selectedClientList.length > 0) {
      setValidate(true);
    } else {
      setValidate(false);
    }

    // 전체 선택 여부 체크
    if (selectedClientList.length === connectedClientCount) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [selectedClientList, connectedClientCount]);

  useEffect(() => {
    makeSelectedClientList(clientList);
  }, [clientList]);

  const props = {
    headerProps: { type },
    contentsProps: {
      version,
      clientList: newClientList,
      onChangeClientList,
      allChecked,
      onChangeAllChecked,
    },
    footerProps: {
      onSubmit: () => {
        onSubmit(selectedClientList);
      },
      validate,
    },
  };

  const styles = {
    windowStyle: {
      display: 'flex',
      flexDirection: 'column',
      width: '520px',
    },
    headerStyle: {
      padding: '0px',
    },
    contentStyle: {
      padding: '0px',
      overflow: 'hidden',
    },
    footerStyle: {
      padding: '40px 32px',
    },
  };

  return (
    <Modal
      theme='jp-dark'
      HeaderRender={headerRender}
      ContentRender={contentRender}
      FooterRender={footerRender}
      headerProps={props.headerProps}
      contentProps={props.contentsProps}
      footerProps={props.footerProps}
      windowStyle={styles.windowStyle}
      headerStyle={styles.headerStyle}
      contentStyle={styles.contentStyle}
      footerStyle={styles.footerStyle}
      topAnimation='100px'
    />
  );
}

export default BroadcastModelModal;
