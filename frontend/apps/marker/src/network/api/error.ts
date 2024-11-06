import { COMMON_URL } from '@src/utils/pageUrls';

type ErrorType = {
  code: string;
  message: string;
  fallback?: () => void;
};

export const BackendError: Array<ErrorType> = [
  {
    code: 'ME.01.01',
    message: 'Invalid User',
    fallback: () => {
      // window.location.href = COMMON_URL.ERROR_403;
    },
  },
  {
    code: 'ME.01.02',
    message: 'Invalid token',
    fallback: () => {
      window.location.href = COMMON_URL.TOKEN_ERROR_PAGE;
    },
  },
  {
    code: 'ME.01.03',
    message: 'Duplicate User Name',
  },
  {
    code: 'ME.01.04',
    message: 'Create User Error',
  },
  {
    code: 'ME.01.05',
    message: 'permission Error',
  },
  {
    code: 'ME.01.06',
    message: 'Update User Error',
  },
  {
    code: 'ME.01.07',
    message: 'Incorrect ID or Password',
  },
  {
    code: 'ME.01.08',
    message: 'already login',
  },
  {
    code: 'ME.01.09',
    message: 'non-existent workspace',
  },
  {
    code: 'ME.01.10',
    message: 'non-existent a user',
  },
  {
    code: 'ME.01.11',
    message: 'login failed',
  },
  {
    code: 'ME.01.12',
    message: 'flightbase logout API access failed',
  },

  {
    code: 'ME.03.01',
    message: 'Not Found Project',
  },
  {
    code: 'ME.03.02',
    message: 'Owner does not match',
  },
  {
    code: 'ME.03.03',
    message: 'Not Found Guide',
  },
  {
    code: 'ME.03.04',
    message: 'user grade error',
  },
  {
    code: 'ME.03.05',
    message: 'exists project name',
  },
  {
    code: 'ME.03.01',
    message: 'Not Found Project',
  },
  {
    code: 'ME.03.01',
    message: 'Not Found Project',
  },
  {
    code: 'ME.04.01',
    message: 'Non-Existent Class List',
  },
  {
    code: 'ME.04.02',
    message: 'Get Class List Error',
  },
  {
    code: 'ME.04.03',
    message: 'Failed to create class',
  },
  {
    code: 'ME.04.04',
    message: 'Class Modification Failed',
  },
  {
    code: 'ME.07.01',
    message: 'Invalid workspace id',
  },
  {
    code: 'ME.07.02',
    message: 'This requests is inaccessible',
  },
  {
    code: 'ME.07.03',
    message: 'flightbase model list emtpy',
  },
  {
    code: 'ME.08.01',
    message: 'model url does not exist',
  },
];
