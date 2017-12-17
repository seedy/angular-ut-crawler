const fs = require('fs');
const path = require('path');
const shared = require('./shared');
const inquiries = require('./inquiries');
const errors = require('./errors');
const find = require('./find');
const component = require('./types/component');
const directive = require('./types/directive');
const interceptor = require('./types/interceptor');
const service = require('./types/service');
const pipe = require('./types/pipe');
// args : 1/ file 2/ (optional) type
// type is inferred from file ext or class name
// types : component, service, pipe, interceptor
// for components : @Component can help



// fn parse args
const ensureType = (result) => {
  return new Promise((resolve, reject) => {
    let testType;

    if(result.type) {
      testType = result.type;
    } else {
      testType = shared.guessTypeFromPath(result.file);
    }
    if(!shared.isAcceptedType(testType)) {
      return reject(errors.notAcceptedError());
    }
    result.type = testType;
    return resolve(result);
  });
};

// fn check already exists unit test
const testExists = (pathToFile) => {
  return new Promise((resolve, reject) => {
    const pathToTest = shared.getPathToTest(pathToFile);
    return fs.stat(pathToTest, (err, stats) => {
      if(err) {
        if(err.code === 'EACCES') {
          errors.noAccessError(pathToTest);
          return reject();
        }
        if(err.code === 'ENOENT' || err.code === 'EISDIR') {
          return resolve(false);
        }
      } else {
        return resolve(stats.isFile());
      }
    })
  })

};


const decoratorTypeMatch = (type, decorators) => {
  const matchable = ['component', 'directive', 'pipe'];
  if (matchable.indexOf(type) === -1) {
    return;
  }
  if(decorators.some((decorator) => decorator.name.toLowerCase() === type)) {
    console.log('Found decorator matching expected file type');
  } else {
    console.log('Did not find decorator matching expected file type');
  }
};

// fn read file
const getFileContent = (type, file) => {
  return new Promise((resolve, reject) => {
    const content = {};
    let text = fs.readFileSync(file, {encoding: 'utf8'});
    content.class = find.findClass(text);
    content.inheritance = find.getInheritance(content.class.code);
    content.injectors = find.getInjectDecorators(text);
    if (content.injectors.length > 0) {
      text = find.clearInjectDecorators(text);
    }
    content.functions = find.findFunctions(text);
    if (content.functions.some((fn) => fn.name === 'constructor')) {
      content.constructor = find.findConstructor(text);
      content.deps = find.getConstrDeps(content.constructor.params);
    }
    content.decorators = {
      classes: find.getClassDecorators(text)
    };
    decoratorTypeMatch(type, content.decorators.classes);
    if (type === 'component' || type === 'directive') {
      content.decorators.properties = find.getPropertyDecorators(text);
    }
    return resolve(content);
  });
};

// append content to the test file
const appendTest = (file, type, contentObject) => {
  const test = shared.getPathToTest(file);
  let text = fs.readFileSync(test, {encoding: 'utf8'});
  if (type === 'component') {
    text = component.handle(text, contentObject);
  } else if (type === 'directive') {
    text = directive.handle(text, contentObject);
  } else if (type === 'interceptor') {
    text = interceptor.handle(text, contentObject);
  } else if (type === 'pipe') {
    text = pipe.handle(text, contentObject);
  } else if (type === 'service') {
    text = service.handle(text, contentObject)
  }
  fs.writeFileSync(test, text, {encoding: 'utf8'});
};


// main fn
const main = () => {
  inquiries.ask()
    .then((answer) => ensureType(answer)
      .then((result) => testExists(result.file)
        .then((exists) => {
          if (exists) {
            console.log('Test file already exists, appending to it');
          } else {
            console.log('Test file not found, creating');
            shared.generateCliTest(result.type, result.file)
              .catch((err) => errors.stdError(err));
          }
        })
        .then(() => getFileContent(result.type, result.file)
          .then((content) => appendTest(result.file, result.type, content))
          .catch((err) => errors.stdError(err))
        )
        .catch((err) => errors.stdError(err))
      )
      .catch((err) => errors.stdError(err))
  )
  .catch((err) => errors.stdError(err));
};

main();