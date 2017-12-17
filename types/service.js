const shared = require('../shared');
const find = require('../find');

const handleNoInjectable = (text, contentObj) => {
  const className = contentObj.class.name;
  const initCode = `const service = new ${className}();`;
  let appendIndex = find.getDescribeAppendIndex(text);

  let append = '';
  if (contentObj.constructor) {
    append += shared.generateIt('checks constructor and dependencies', initCode, contentObj.deps);
  }
  contentObj.functions.forEach((fn) => {
    append += shared.generateIt('checks method ' + fn.name, initCode);
  });
  return text.substr(0, appendIndex) + append + text.substr(appendIndex);
};

const handle = (text, contentObj) => {
  if (!contentObj.decorators.classes.some((decorator) => decorator.name === 'Injectable')) {
    return handleNoInjectable(text, contentObj);
  }
  let injectableDep = {
    param: 'service',
    type: contentObj.class.name
  };
  const allDeps = (contentObj.deps || []).concat([injectableDep]);
  let appendIndex = find.getDescribeAppendIndex(text);

  let append = '';

  if (contentObj.constructor) {
    // inject all deps in constructor test
    append += shared.generateIt('checks constructor and dependencies', undefined, allDeps);
  }
  contentObj.functions.forEach((fn) => {
    // do not inject deps on every it test, leave responsibility to dev
    append += shared.generateIt('checks method ' + fn.name, undefined, [injectableDep]);
  });
  return text.substr(0, appendIndex) + append + text.substr(appendIndex);

};



module.exports = {
  handle: handle
};