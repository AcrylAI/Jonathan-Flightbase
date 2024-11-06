import classNames from 'classnames/bind';
import style from './Icon.module.scss';
const cx = classNames.bind(style);

type Props = {
  IconComponent?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  IconComponentProps?: React.SVGProps<SVGSVGElement>;
  name?: string;
};

function Icon({ IconComponent, IconComponentProps, name }: Props): JSX.Element {
  return (
    <>
      {IconComponent !== undefined && (
        <div className={cx('icon-compo')}>
          <IconComponent {...IconComponentProps} />
          <p>{name && name}</p>
        </div>
      )}
    </>
  );
}

Icon.defaultProps = {
  IconComponent: undefined,
  IconComponentProps: undefined,
  name: undefined,
};

export default Icon;
