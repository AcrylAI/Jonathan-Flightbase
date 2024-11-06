// i18n
import { useTranslation } from 'react-i18next';

// Components
import TermTextBox from '@src/components/Member/Terms/components/TermTextBox';
import { TermDocModel } from '@src/components/common/TermDoc';

type TermPageProps = {
  term: TermDocModel;
};
function TermPage({ term }: TermPageProps) {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t(term.label)}</h1>
      <TermTextBox termDoc={term.text}></TermTextBox>
    </>
  );
}

export default TermPage;
