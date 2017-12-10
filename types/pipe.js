const shared = require('../shared');
const find = require('../find');
const handle = (text, contentObj) => {
  const className = contentObj.class.name;
  const initCode = `const pipe = new ${className}();`;
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

module.exports = {
  handle: handle
};