import { ColorPickSet } from '@tools/types/components';

export function colorContrast(color: ColorPickSet) {
  switch (color) {
    case '#fa4e57': // 이슈와 중복
    case '#ad00ff':
    case '#463eb7':
    case '#8a6351':
    case '#6633ff':
    case '#6666cc':
    case '#660066':
    case '#660000':
      return '#fff';
    case '#ffab31':
    case '#00c775':
    case '#ff00d6':
    case '#1aa090':
    case '#3babff':
    case '#dcc13a':
    case '#02c8d5':
    case '#ffea53': // 저시인성
    case '#00ffff': // 저시인성
    case '#00ffc2': // 저시인성
    case '#14ff00': // 저시인성
    case '#ebff00': // 저시인성
    case '#ffd3e3': // 저시인성
      return '#2A2D3E';
  }
}
