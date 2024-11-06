import { useTranslation } from 'react-i18next';

function useT() {
  const { t } = useTranslation();

  const checkValidation = (
    text: string,
    options?: { [key: string]: string },
  ) => {
    const translatedText = t(text, options);

    if (translatedText === text) {
      // eslint-disable-next-line no-console
      console.warn(`${text} is not valid translation`);
    }
    return translatedText;
  };

  return { t: checkValidation };
}
export default useT;
