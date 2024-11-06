export type DeleteTermDocModel = {
  name: string;
  key: string;
  text: string;
  checked: boolean;
  textEn: string;
  label: string;
};
const TermDoc: DeleteTermDocModel[] = [
  {
    name: 'check-box-1',
    key: 'checkBox1',
    label: 'delete-account-agree-title-notice',
    checked: false,
    text: `탈퇴와 동시에 서비스 내의 모든 권한이 소멸되어 서비스 이용이 중단되며 서비스 이용 내역은 복구가 불가능합니다.
        \n서비스 이용 기록은 탈퇴 요청 즉시 폐기되니, 서비스 이용 관련하여 필요한 정보는 탈퇴 전에 기록해두시기 바랍니다.
        \n탈퇴 후, 동일한 아이디로 재가입이 가능하지만, 해당 아이디는 완전히 새로운 계정으로 인식되며, 이전 기록과 연동되지 않습니다.
        \n위의 내용을 모두 확인하였고 탈퇴를 요청합니다.`,
    textEn: `Upon withdrawal, all rights in the service are terminated, and service usage history cannot be restored.
        \nThe service usage record will be discarded immediately upon request for withdrawal, so please record the information necessary for the service use before withdrawal.
		\nAfter withdrawal, you can re-subscribe with the same ID, but the ID is recognized as a completely new account and is not linked to the previous record.
		\nI checked all of the above and request for withdrawal.`,
  },
];

export default TermDoc;
