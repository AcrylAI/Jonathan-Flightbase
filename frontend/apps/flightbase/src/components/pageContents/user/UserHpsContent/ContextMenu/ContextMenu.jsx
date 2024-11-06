import { Fragment, PureComponent } from 'react';

// i18n
import { withTranslation } from 'react-i18next';

// CSS module
import style from './ContextMenu.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

class ContextMenu extends PureComponent {
  componentDidMount() {
    document.addEventListener('click', this.handleClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, true);
  }

  handleClick = (e) => {
    if (!e.target.closest(`.${cx('menu_ul')}`)) {
      this.props.contextMenuHandler();
    }
  };

  render() {
    const {
      status,
      onCreate,
      onStop,
      openDeleteConfirmPopup,
      openCheckPointPopup,
      t,
    } = this.props;
    return (
      <ul id='ContextMenu' className={cx('menu_ul')}>
        {onCreate && (
          <li className={cx('menu_li')} onClick={() => onCreate()}>
            <img
              className={cx('icon')}
              src='/images/icon/00-ic-basic-plus.svg'
              alt='add'
            />
            {t('add.label')}
          </li>
        )}
        <li className={cx('menu_li')} onClick={() => openDeleteConfirmPopup()}>
          <img
            className={cx('icon')}
            src='/images/icon/00-ic-basic-delete.svg'
            alt='delete'
          />
          {t('delete.label')}
        </li>
        {status === 'running' && (
          <li className={cx('menu_li')} onClick={() => onStop()}>
            <img
              className={cx('icon')}
              src='/images/icon/00-ic-basic-stop-o.svg'
              alt='stop'
            />
            {t('stop.label')}
          </li>
        )}
        {openCheckPointPopup && (
          <Fragment>
            <hr className={cx('border')} />
            <li className={cx('menu_li')} onClick={() => openCheckPointPopup()}>
              <img
                className={cx('icon')}
                src='/images/icon/00-ic-alert-success-o.svg'
                alt='checkpoint'
              />
              {t('checkpoint.label')}
            </li>
          </Fragment>
        )}
      </ul>
    );
  }
}

export default withTranslation()(ContextMenu);
