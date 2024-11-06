import { useState, useEffect, SetStateAction, Dispatch } from 'react';

// type useFormInputProps = {
//   val: string | number;
//   placeholder: string;
//   validation: (props: useFormInputValidationArgs) => void;
//   initialValid: boolean;
// };

export type useFormInputValidationArgs = {
  formatValid: boolean;
  setErrMsg: Dispatch<SetStateAction<string>>;
  setIsValid: Dispatch<SetStateAction<boolean>>;
};

const useFormInput = (
  val: string | number,
  placeholder: string,
  validation: (props: useFormInputValidationArgs) => void,
  initialValid?: boolean,
) => {
  const [value, setValue] = useState<string | number>(val);
  const [errMsg, setErrMsg] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleValidation = (formatValid: boolean) => {
    if (validation) {
      validation({ formatValid, setErrMsg, setIsValid });
    }
  };

  useEffect(() => {
    // 사용자 정보 수정 - 이름, 닉네임 초기 valid = true
    if (initialValid) {
      setIsValid(initialValid);
    }
  }, [initialValid]);

  return {
    val: value,
    placeholder,
    errMsg,
    setErrMsg,
    isValid,
    setIsValid,
    showError: !isValid,
    onValidation: handleValidation,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
  };
};

export default useFormInput;
