const fs = require('fs');
const util = require('util');
const path = require('path');

const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

(async function () {
  try {
    const svgsPath = path.join(__dirname, 'svg');
    const indexPath = path.join(__dirname, 'index.ts');
    const svgs = await getSvgsInDir(svgsPath);
    const fileNames = getNames(svgs);
    const strings = getExportString(fileNames);
    await writeFile(indexPath, strings);
    console.log('index.ts created!');
  } catch (error) {
    console.log(error);
  }
})();

async function getSvgsInDir(dirPath) {
  const files = await readDir(dirPath);
  return files.filter(file => /\.svg$/i.test(file));
}

function getNames(files) {
  return files.map(file => {
    const fileName = file
      .replace(/\.svg$/i, '')
      .replace(/[^A-Z0-9]/gi, ' ')
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase())
      .replace(/\s/g, '');
    return { import: fileName + 'Svg', export: fileName, file: file };
  });
}

function getExportString(infos) {
  const comment = '// This file is auto generated by generateIndex.js\n\n';
  let importsString = comment + "import { withStyle } from './withStyle';\n\n";
  let exportsString = '\n';

  infos.forEach(name => {
    importsString += `import { ReactComponent as ${name.import} } from './svg/${name.file}';\n`;
    exportsString += `export const ${name.export} = withStyle(${name.import});\n`;
  });

  return importsString + exportsString;
}
