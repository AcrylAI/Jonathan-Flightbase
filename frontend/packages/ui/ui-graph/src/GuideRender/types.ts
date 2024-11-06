interface ContentsType {
  title: string;
  subject: string;
  desc: string; // 설명
  tabContent: string; // 컴포넌트
  category: string; // 상단 선택 버튼 카테고리
  type: string; // Preview, Code 탭 구분자 -> unique key
  code: string;
}

interface CategoryType {
  DEFAULT: string;
  CANVAS_LINE: string;
  CANVAS_PIE: string;
  D3_LINE: string;
}

const category: CategoryType = {
  DEFAULT: 'default',
  CANVAS_LINE: 'CANVAS_LINE',
  CANVAS_PIE: 'CANVAS_PIE',
  D3_LINE: 'D3_LINE',
};

export { ContentsType, CategoryType, category };
