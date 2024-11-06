// Style
import styles from './TermTextBox.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type TermTextBoxProps = {
  termDoc: string;
};
function TermTextBox({ termDoc }: TermTextBoxProps) {
  return (
    <div className={cx('term-content-box')}>
      {termDoc && (
        <div>
          <p>{termDoc}</p>
        </div>
      )}
    </div>
  );
}

export default TermTextBox;
