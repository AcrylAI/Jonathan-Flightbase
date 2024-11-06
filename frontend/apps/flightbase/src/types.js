export const TRAINING_TOOL_TYPE = {
  0: {
    label: 'Quick Editor',
    type: 'quick-editor',
    explanation: {
      en: 'Use the CPU to make Jupyter launch faster.',
      ko: 'CPU를 사용하여Jupyter Notebook을 더 빠르게 사용할 수 있습니다.',
    },
  },
  1: {
    label: 'Jupyter Notebook',
    type: 'jupyter',
    explanation: {
      en: 'Use Jupyter Notebook on the set environment.',
      ko: '실행 조건에서 JupyterNotebook을 사용합니다.',
    },
  },
  2: {
    label: 'JOB',
    type: 'job',
    explanation: {
      en: 'Train the model by registering a number of parameters in the queue.',
      ko: '여러 개의 파라미터 실험을 대기열에 등록하여 순차적으로 모델을 학습합니다.',
    },
  },
  3: {
    label: 'HPS',
    type: 'hps',
    explanation: {
      en: 'Search for hyperparameters through Bayesian probabilities, randoms, and grid methodologies.',
      ko: 'Bayesian probabilities, randoms, and grid 방법론을 사용하여 최적화된 하이퍼파라미터를 찾습니다.',
    },
  },
  4: {
    label: 'SSH',
    type: 'ssh',
    explanation: {
      en: 'Use Secure Shell on the set environment.',
      ko: '실행 조건에서 Secure Shell을 사용합니다.',
    },
  },
  5: {
    label: 'RStudio',
    type: 'rstudio',
    explanation: {
      en: 'RStudio.',
      ko: 'R스튜디오',
    },
  },
  6: {
    label: 'File Browser',
    type: 'filebrowser',
    explanation: {
      en: 'File Browser.',
      ko: '파일브라우저',
    },
  },
};
