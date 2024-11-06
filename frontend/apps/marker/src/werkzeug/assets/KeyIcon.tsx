import classNames from 'classnames/bind';
import styles from './Icon.module.scss';

const cx = classNames.bind(styles);

type Props = {
  type: 'q'|'w'|'e'|'r'|'+'|'-'|'back'|'cmd'|'0'|'1';
  size: 'mx'|'sx';
}

/**
 * 키보드의 자판을 표시하기 위한 아이콘
 */
function Key({ type, size }:Props) {
  switch (type) {
    case 'q': return <Q size={size} />;
    case 'w': return <W size={size} />;
    case 'e': return <E size={size} />;
    case 'r': return <R size={size} />;
    case '+': return <Plus size={size} />;
    case '-': return <Minus size={size} />;
    case 'back': return <Backspace size={size} />;
    case 'cmd': return <Cmd size={size} />;
    case '0': return <Zero size={size} />;
    case '1': return <One size={size} />;
    default: return <Shift size={size} />;
  }
}

type KeyProps = {
  size: 'mx'|'sx';
}

function Q({ size }:KeyProps) {
  const wh = sizing(size, 12)

  return (
    <div className={ cx("IconBox") }>
      <svg width={ wh } height={ wh } viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.75 6.75L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function W({ size }:KeyProps) {
  const wh = sizing(size, 12)

  return (
    <div className={ cx("IconBox") }>
      <svg width={ wh } height={ wh } viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 1.5L3.42857 10.5L6 3.75L8.57143 10.5L10.5 1.5" fill="none"/>
        <path d="M1.5 1.5L3.42857 10.5L6 3.75L8.57143 10.5L10.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function E({ size }:KeyProps) {
  const w = sizing(size, 9)
  const h = sizing(size, 14)

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.54632 7.14941H1.08203" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.45703 12.6141H1.08203V1.68555H7.45703" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function R({ size }:KeyProps) {
  const w = sizing(size, 9)
  const h = sizing(size, 12)

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M1 0.75C0.585786 0.75 0.25 1.08579 0.25 1.5V10.5C0.25 10.9142 0.585786 11.25 1 11.25C1.41421 11.25 1.75 10.9142 1.75 10.5V7.65H4.5832L7.15802 10.9605C7.41232 11.2874 7.88353 11.3464 8.21049 11.092C8.53745 10.8377 8.59635 10.3665 8.34205 10.0396L6.27275 7.37905C6.69287 7.21139 7.08124 6.96847 7.41444 6.65748C8.1027 6.01511 8.5 5.13235 8.5 4.2C8.5 3.26765 8.1027 2.38489 7.41444 1.74252C6.72793 1.10178 5.80723 0.75 4.85714 0.75H1ZM4.85714 6.15H1.75V2.25H4.85714C5.44152 2.25 5.99244 2.46715 6.39096 2.8391C6.78774 3.20943 7 3.70018 7 4.2C7 4.69982 6.78774 5.19058 6.39096 5.5609C5.99244 5.93285 5.44152 6.15 4.85714 6.15Z" fill="currentColor"/>
      </svg>
    </div>
  )
}

function Plus({ size }:KeyProps) {
  const wh = sizing(size, 12);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ wh } height={ wh } viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.84375 6H11.1562" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 0.84375V11.1562" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function Minus({ size }:KeyProps) {
  const w = sizing(size, 12);
  const h = sizing(size, 2);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.84375 1H11.1562" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function Backspace({ size }:KeyProps) {
  const w = sizing(size, 16);
  const h = sizing(size, 14);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.33828 12.3508L1.125 7L4.33828 1.64922C4.38723 1.56586 4.45708 1.49672 4.54093 1.44862C4.62479 1.40053 4.71974 1.37515 4.81641 1.375H15.1875C15.3367 1.375 15.4798 1.43426 15.5852 1.53975C15.6907 1.64524 15.75 1.78832 15.75 1.9375V12.0625C15.75 12.2117 15.6907 12.3548 15.5852 12.4602C15.4798 12.5657 15.3367 12.625 15.1875 12.625H4.81641C4.71974 12.6248 4.62479 12.5995 4.54093 12.5514C4.45708 12.5033 4.38723 12.4341 4.33828 12.3508V12.3508Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.25 5.3125L7.875 8.6875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.25 8.6875L7.875 5.3125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function Cmd({ size }:KeyProps) {
  const wh = sizing(size, 16)

  return (
    <div className={ cx("IconBox") }>
      <svg width={ wh } height={ wh } viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.4375 1.25C7.7856 1.25 8.11944 1.38828 8.36558 1.63442C8.61172 1.88056 8.75 2.2144 8.75 2.5625C8.75 2.9106 8.61172 3.24444 8.36558 3.49058C8.11944 3.73672 7.7856 3.875 7.4375 3.875H6.125V2.5625C6.125 2.2144 6.26328 1.88056 6.50942 1.63442C6.75556 1.38828 7.0894 1.25 7.4375 1.25V1.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.875 3.875H2.5625C2.2144 3.875 1.88056 3.73672 1.63442 3.49058C1.38828 3.24444 1.25 2.9106 1.25 2.5625C1.25 2.2144 1.38828 1.88056 1.63442 1.63442C1.88056 1.38828 2.2144 1.25 2.5625 1.25C2.9106 1.25 3.24444 1.38828 3.49058 1.63442C3.73672 1.88056 3.875 2.2144 3.875 2.5625V3.875Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.125 6.125H7.4375C7.7856 6.125 8.11944 6.26328 8.36558 6.50942C8.61172 6.75556 8.75 7.0894 8.75 7.4375C8.75 7.7856 8.61172 8.11944 8.36558 8.36558C8.11944 8.61172 7.7856 8.75 7.4375 8.75C7.0894 8.75 6.75556 8.61172 6.50942 8.36558C6.26328 8.11944 6.125 7.7856 6.125 7.4375V6.125Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5625 8.75C2.2144 8.75 1.88056 8.61172 1.63442 8.36558C1.38828 8.11944 1.25 7.7856 1.25 7.4375C1.25 7.0894 1.38828 6.75556 1.63442 6.50942C1.88056 6.26328 2.2144 6.125 2.5625 6.125H3.875L3.875 7.4375C3.875 7.7856 3.73672 8.11944 3.49058 8.36558C3.24444 8.61172 2.9106 8.75 2.5625 8.75V8.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.125 3.875H3.875V6.125H6.125V3.875Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function Zero({ size }:KeyProps) {
  const w = sizing(size, 12);
  const h = sizing(size, 16);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 9.0625C5.5533 9.0625 6.8125 7.24366 6.8125 5C6.8125 2.75634 5.5533 0.9375 4 0.9375C2.4467 0.9375 1.1875 2.75634 1.1875 5C1.1875 7.24366 2.4467 9.0625 4 9.0625Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function One({ size }:KeyProps) {
  const w = sizing(size, 16);
  const h = sizing(size, 16);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 4 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.39223 0.809163C3.55481 0.896173 3.6563 1.0656 3.6563 1.25V8.75C3.6563 9.02614 3.43245 9.25 3.1563 9.25C2.88016 9.25 2.6563 9.02614 2.6563 8.75V2.18426L1.55865 2.91603C1.32889 3.0692 1.01845 3.00712 0.865278 2.77735C0.712102 2.54759 0.774189 2.23715 1.00395 2.08398L2.87895 0.833976C3.03238 0.73169 3.22965 0.722154 3.39223 0.809163Z" fill="currentColor"/>
      </svg>
    </div>
  )
}

function Shift({ size }:KeyProps) {
  const w = sizing(size, 10);
  const h = sizing(size, 11);

  return (
    <div className={ cx("IconBox") }>
      <svg width={ w } height={ h } viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 5.625L5 1.125L9.5 5.625H7.25V9.75C7.25 9.84946 7.21049 9.94484 7.14017 10.0152C7.06984 10.0855 6.97446 10.125 6.875 10.125H3.125C3.02554 10.125 2.93016 10.0855 2.85984 10.0152C2.78951 9.94484 2.75 9.84946 2.75 9.75V5.625H0.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function sizing(sz:'mx'|'sx', o:number) {
  if(sz === 'mx') return o;
  else return o * 0.8;
}

export default Key;