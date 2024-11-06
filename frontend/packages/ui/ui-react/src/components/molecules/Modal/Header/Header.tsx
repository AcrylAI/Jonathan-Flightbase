type Props = {
  testProp1?: string;
  testProp2?: string;
};

function Header({ testProp1, testProp2 }: Props) {
  console.log(testProp1, testProp2);
  return <div>Header</div>;
}

Header.defaultProps = {
  testProp1: '',
  testProp2: '',
};

export default Header;
