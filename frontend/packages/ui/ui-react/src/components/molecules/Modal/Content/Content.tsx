type Props = {
  testProp1?: number;
  testProp2?: string;
};

function Content({ testProp1, testProp2 }: Props) {
  return (
    <div>
      <div>{testProp1 || '내용1'}</div>
      <div>{testProp2 || '내용2'}</div>
    </div>
  );
}

Content.defaultProps = {
  testProp1: 0,
  testProp2: 'contents',
};

export default Content;
