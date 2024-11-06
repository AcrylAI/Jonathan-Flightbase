/**
 * Typography 컴포넌트에서 사용하기 위한 Typo의 범위를 정의한 타입
 * @author Dawson
 * @version 22-11-02
 */
export type TypoTypes =
  | 'H1'
  | 'h1'
  | 'H2'
  | 'h2'
  | 'H3'
  | 'h3'
  | 'H4'
  | 'h4'
  | 'P1'
  | 'p1'
  | 'P2'
  | 'p2'
  | 'P3'
  | 'p3'
  | 'P4'
  | 'p4'
  | 'GnB'
  | 'gnb';

export type TypoWeight =
  | 'bold'
  | 'medium'
  | 'regular'
  | 'tiny'
  | 700
  | 500
  | 400
  | 200
  | 'b'
  | 'm'
  | 'r'
  | 't'
  | 'B'
  | 'M'
  | 'R'
  | 'T';

export type TypoLine = 'Single' | 'Multi' | 'S' | 'M';
