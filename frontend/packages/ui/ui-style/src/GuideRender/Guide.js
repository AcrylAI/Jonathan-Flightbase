import Button from '@src/atoms/button/Button';
import Checkbox from '@src/atoms/button/Checkbox';
import Switch from '@src/atoms/button/Switch';
import Radio from '@src/atoms/button/Radio';

import InputDate from '@src/atoms/input/InputDate';
import InputNumber from '@src/atoms/input/InputNumber';
import InputText from '@src/atoms/input/InputText';
import InputPassword from '@src/atoms/input/InputPassword';
import Textarea from '@src/atoms/input/Textarea';

// Ui Conetents 정보
// interface ContentsType {
//   title: string;
//   subject: string;
//   desc: string; // 설명
//   tabContent: string; // 컴포넌트
//   category: string; // 상단 선택 버튼 카테고리
//   type: string; // Preview, Code 탭 구분자 -> unique key
// }

// interface CategoryType {
//   DEFAULT: string;
//   BUTTON: string;
//   INPUT: string;
//   MOCULES: string;
// }

const category = {
  DEFAULT: 'DEFAULT',
  BUTTON: 'BUTTON',
  INPUT: 'INPUT',
};

const contents = (theme) => [
  {
    title: 'Button',
    subject: 'Button Type',
    desc: '타입 별 버튼',
    tabContent: Button({ theme }),
    category: category.BUTTON,
    type: 'button',
  },
  {
    title: 'Button',
    subject: 'Button Size',
    desc: '사이즈 별 버튼',
    tabContent: Button({ type: 'size', theme }),
    category: category.BUTTON,
    type: 'button-size',
  },
  {
    title: 'Button',
    subject: 'Button loading',
    desc: 'Loading 버튼',
    tabContent: Button({ type: 'loading', theme }),
    category: category.BUTTON,
    type: 'button-loading',
  },
  {
    title: 'Button',
    subject: 'Button icon',
    desc: '버튼 아이콘',
    tabContent: Button({ type: 'icon', theme }),
    category: category.BUTTON,
    type: 'button-icon',
  },
  {
    title: 'Input',
    subject: 'Text input status',
    desc: '상태 별 텍스트 인풋 박스',
    tabContent: InputText({ theme }),
    category: category.INPUT,
    type: 'input-text',
  },
  {
    title: 'Input',
    subject: 'Password input status',
    desc: '상태 별 비밀번호 인풋 박스',
    tabContent: InputPassword({ theme }),
    category: category.INPUT,
    type: 'input-password',
  },
  {
    title: 'Input',
    subject: 'Date input status',
    desc: '상태 별 날짜 인풋 박스',
    tabContent: InputDate({ theme }),
    category: category.INPUT,
    type: 'dateInput',
  },
  {
    title: 'Input',
    subject: 'Date input size',
    desc: '사이즈 별 날짜 인풋 박스',
    tabContent: InputDate({ type: 'size', theme }),
    category: category.INPUT,
    type: 'dateInput-size',
  },
  {
    title: 'Input',
    subject: 'Number input status',
    desc: '상태 별 넘버 인풋 박스',
    tabContent: InputNumber({ theme }),
    category: category.INPUT,
    type: 'numberInput',
  },
  {
    title: 'Input',
    subject: 'Number input size',
    desc: '사이즈 별 넘버 인풋 박스',
    tabContent: InputNumber({ type: 'size', theme }),
    category: category.INPUT,
    type: 'numberInput-size',
  },
  {
    title: 'Textarea',
    subject: 'Textarea type',
    desc: '타입 별 텍스트영역',
    tabContent: Textarea({ theme }),
    category: category.INPUT,
    type: 'textarea',
  },
  {
    title: 'Textarea',
    subject: 'Textarea type',
    desc: '사이즈 별 텍스트영역',
    tabContent: Textarea({ type: 'size', theme }),
    category: category.INPUT,
    type: 'testarea-size',
  },
  {
    title: 'Radio',
    subject: 'Radio type',
    desc: '타입 별 라디오 버튼',
    tabContent: Radio({ theme }),
    category: category.INPUT,
    type: 'radio',
  },
  {
    title: 'Checkbox',
    subject: 'Checkbox type',
    desc: '타입 별 체크박스',
    tabContent: Checkbox({ theme }),
    category: category.INPUT,
    type: 'checkbox',
  },
  {
    title: 'Switch',
    subject: 'Switch type',
    desc: '타입 별 스위치 버튼',
    tabContent: Switch({ theme }),
    category: category.BUTTON,
    type: 'switch',
  },
];

export { contents, category };
