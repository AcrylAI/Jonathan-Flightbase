const fs = require('fs'); //
const shell = require('shelljs'); // 외부 명령어 실행하도록 도와주는 모듈
const { pascalCase } = require('pascal-case');

const svgPath = `${__dirname}/src`;
const outputPath = `${__dirname}/../../packages/ui/ui-react/src/components/atoms/icon`;

fs.readdir(svgPath, (_, list) => {
  list.forEach((filename) => {
    const target = `${svgPath}/${filename}`;
    const { stdout: result } = shell.exec(
      // `npx @svgr/cli --svg-props width=100% --svg-props height=100% --svg-props viewBox='0 0 24 24'  --typescript < ${target}`,
      // `npx @svgr/cli --svg-props width=24 --svg-props height=24 --svg-props viewBox='0 0 24 24'  --typescript < ${target}`,
      // `npx @svgr/cli --svg-props viewBox='0 0 24 24'  --typescript < ${target}`,
      `npx @svgr/cli --typescript < ${target}`,
    );
    const createFileName = `${outputPath}/${pascalCase(
      filename.replace('.svg', ''),
    )}.tsx`;

    fs.exists(createFileName, (exists) => {
      fs.writeFileSync(createFileName, result);
      // if (!exists) {
      //   fs.writeFileSync(createFileName, result);
      //   console.log(`create ${createFileName} success`);
      // } else {
      //   console.log(`${createFileName} is already exists`);
      // }
    });
  });
});
