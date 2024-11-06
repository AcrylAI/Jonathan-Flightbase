import classNames from 'classnames/bind';
import styles from './Annotation.module.scss';
import {
  Header,
  Nav,
  Aside,
  Contents,
} from '@src/werkzeug/components/templates';
import useWerkzeug from '@src/pages/AnnotationPage/useWerkzeug';
import { Snackbar } from '@src/components/atoms';
import useFileStatus from '@src/werkzeug/hooks/common/useFileStatus';

const cx = classNames.bind(styles);

export default function AnnotationPage() {
  useWerkzeug();

  const { isViewer } = useFileStatus();

  return (
    <section className={cx('annotation-conatiner')}>
      <Header />
      <section className={cx('contents-area')}>
        {isViewer !== true && <Nav />}
        <Contents />
        <Aside />
      </section>
      <Snackbar />
    </section>
  );
}
