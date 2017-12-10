const { spawn } = require('child_process');
const path = require('path');

const acceptedTypes = [
  'component',
  'directive',
  'service',
  'pipe',
  'interceptor'
];

const getAcceptedTypes = () => acceptedTypes;

const guessTypeFromPath = (path) => {
  const reg = /(?:^|\/)[^\/.]*\.([^\/.]+?)\.ts$/;
  const result = path.match(reg);
  if (result === null || result.length < 2) {
    return null;
  }
  return result[1]
};

const isAcceptedType = (type) => getAcceptedTypes().indexOf(type) !== -1;

const getPathToTest = (pathToFile) => {
  const reg = /(\.ts)$/;
  return pathToFile.replace(reg, '.spec$1');
};

const generateCliTest = (type, file) => {
  return new Promise((resolve, reject) => {
    console.log('file: ' + file);
    const ngPath = path.relative('src/app', file);
    if(ngPath.split(path.sep)[0] === '..') {
      return reject('Path does not respect angular project architecture');
    }
    const ng = spawn(`ng g ${type} ${ngPath} -d --verbose`, [], {
      shell: true

    });
    ng.stdout.pipe(process.stdout);
    ng.stdin.write('n\n');
    ng.on('close', (code) => {
      console.log(`[ng] child process exited with code ${code}`);
      return resolve();
    });
  });
};

const generateIt = (description, code, injections) => {
  if (code === undefined) {
    code = '';
  }
  if (injections === undefined) {
    return `it('${description}', () => {\n${code}\n});\n`;
  }
  const classes = injections.reduce((aggr, injection) => {
    if (aggr.length > 0) {
      aggr += ', ';
    }
    aggr += injection.type;
    return aggr;
  }, '');
  const injector = injections.reduce((aggr, injection) => {
    if (aggr.length > 0) {
      aggr += ', ';
    }
    aggr += injection.param;
    aggr += ': ';
    aggr += injection.type;

    return aggr;
  }, '');
  return `it('${description}', inject([${classes}], (${injector}) => {\n${code}\n}));\n`;
};

module.exports = {
  getAcceptedTypes: getAcceptedTypes,
  guessTypeFromPath: guessTypeFromPath,
  isAcceptedType: isAcceptedType,
  getPathToTest: getPathToTest,
  generateCliTest: generateCliTest,
  generateIt: generateIt
};