const shared = require('../shared');
const find = require('../find');

const getLifecycle = (implement) => {
  const lifecycle = [
    'OnInit',
    'OnChanges',
    'DoCheck',
    'AfterContentInit',
    'AfterContentChecked',
    'AfterViewInit',
    'AfterViewChecked',
    'OnDestroy'
  ];
  let append = '';

  implement.forEach((implement) => {
    if (lifecycle.indexOf(implement) !== -1) {
      append += shared.generateIt('checks lifecycle event ' + implement);
    }
  });
  return append;
};

const handle = (text, contentObj) => {
  if (!contentObj.decorators.classes.some((decorator) => decorator.name === 'Component')) {
    console.log('@Component decorator not found');
  }

  let appendIndex = find.getDescribeAppendIndex(text);

  let append = '';

  if (contentObj.constructor) {
    // inject all deps in constructor test
    append += shared.generateIt('checks public api');
  }
  append += getLifecycle(contentObj.inheritance.implement, append);
  contentObj.decorators.properties.forEach((deco) => {
    if (deco.type === 'Output' || deco.type === 'Input') {
      append += shared.generateIt('checks I/O ' + deco.type + ' property ' + deco.prop);
    } else {
      append += shared.generateIt('checks ' + (deco.modifier || '') + ' decorator ' + deco.type + ' property' + deco.prop);
    }
  });
  contentObj.functions.forEach((fn) => {
    // do not inject deps on every it test, leave responsibility to dev
    append += shared.generateIt('checks method ' + fn.name);
  });
  return text.substr(0, appendIndex) + append + text.substr(appendIndex);

};

module.exports = {
  handle: handle
};