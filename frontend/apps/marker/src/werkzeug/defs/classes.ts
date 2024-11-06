/** 클래스에 대한 타입 정의 */
export type Classes = {
  id: number;
  name: string;
  color: string;
  tool: 1 | 2 | 3; // 1:bbox, 2:polygon, 3:ner
  status: 0 | 1; // 0:비활성, 1:활성
  property: Array<Property>;
};

/** 클래스의 내부 속성에 대한 타입 정의 */
export type Property = {
  id:number;
  name: string;
  type: 0 | 1; // 0:single, 1:multi
  required: 0 | 1; // 0:false / 1:true
  options: Array<SelectOption>;
};

/** 속성에서 사용할 옵션의 타입 정의 */
export type SelectOption = {
  id: number;
  name: string;
  deleted?: number;
};