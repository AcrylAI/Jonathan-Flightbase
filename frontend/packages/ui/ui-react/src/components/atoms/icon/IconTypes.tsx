import IconLnbDatasetsBlue from './IconLnbDatasetsBlue';
import IconLnbDatasetsWhite from './IconLnbDatasetsWhite';
import IconLnbDeploymentsBlue from './IconLnbDeploymentsBlue';
import IconLnbDeploymentsWhite from './IconLnbDeploymentsWhite';
import IconLnbDockerBlue from './IconLnbDockerBlue';
import IconLnbDockerWhite from './IconLnbDockerWhite';
import IconLnbHomeBlue from './IconLnbHomeBlue';
import IconLnbHomeWhite from './IconLnbHomeWhite';
import IconLnbServicesBlue from './IconLnbServicesBlue';
import IconLnbServicesWhite from './IconLnbServicesWhite';
import IconLnbTrainingsBlue from './IconLnbTrainingsBlue';
import IconLnbTrainingsWhite from './IconLnbTrainingsWhite';
import IconLnbJobBlue from './IconLnbJobBlue';
import IconLnbJobWhite from './IconLnbJobWhite';

export interface IconDataType {
  name: string;
  icon: string;
}

export interface IconArgs {
  IconCompoList?: IconComponentType[];
  IconComponent?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  IconComponentProps?: React.SVGProps<SVGSVGElement>;
  name?: string;
  viewAllIcons?: boolean;
}

export interface IconComponentType {
  Component: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  props?: React.SVGProps<SVGSVGElement>;
  name: string;
}

export const IconCompoList = [
  {
    Component: IconLnbDatasetsBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDatasetsBlue',
  },
  {
    Component: IconLnbDatasetsWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDatasetsWhite',
  },
  {
    Component: IconLnbDeploymentsBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDeploymentsBlue',
  },
  {
    Component: IconLnbDeploymentsWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDeploymentsWhite',
  },
  {
    Component: IconLnbDockerBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDockerBlue',
  },
  {
    Component: IconLnbDockerWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbDockerWhite',
  },
  {
    Component: IconLnbHomeBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbHomeBlue',
  },
  {
    Component: IconLnbHomeWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbHomeWhite',
  },
  {
    Component: IconLnbServicesBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbServicesBlue',
  },
  {
    Component: IconLnbServicesWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbServicesWhite',
  },
  {
    Component: IconLnbTrainingsBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbTrainingsBlue',
  },
  {
    Component: IconLnbTrainingsWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbTrainingsWhite',
  },
  {
    Component: IconLnbJobBlue,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbJobBlue',
  },
  {
    Component: IconLnbJobWhite,
    props: {
      width: 20,
      height: 20,
    },
    name: 'IconLnbJobWhite',
  },
];
