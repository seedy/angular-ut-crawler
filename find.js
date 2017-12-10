const findClass = (content) => {
  const reg = new RegExp("class ([a-zA-Z]+)[^{]*{");
  const exec = reg.exec(content);
  return {
    name: exec[1],
    code: exec[0]
  }
};

const getInheritance = (classContent) => {
  const extend = [];
  const implement = [];
  const extendReg = new RegExp("extends ([a-zA-Z]+)((,[ ]*[a-zA-Z]+)*)");
  const implementReg = new RegExp("implements ([a-zA-Z]+)((,[ ]*[a-zA-Z]+)*)");

  const extendExec = extendReg.exec(classContent);
  const implementExec = implementReg.exec(classContent);

  if (extendExec !== null) {
    extend.push(extendExec[1]);
    if (extendExec[2] !== '') {
      const others = extendExec[2]
        .split(',')
        .slice(1)
        .map((name) => name.trim());
      extend.push(...others);
    }
  }
  if (implementExec !== null) {
    implement.push(implementExec[1]);
    if (implementExec[2] !== '') {
      const others = implementExec[2]
        .split(',')
        .slice(1)
        .map((name) => name.trim());
      implement.push(...others);
    }
  }
  return {
    extend,
    implement
  };
};

const findFunctions = (content) => {
  // ordered. concatenate them in order to get the result. nonsense not together!
  const accessModifier = "^[ \\t]*(?:public )?";
  // capture name
  const name = "([a-zA-Z][\\da-zA-Z]+)";
  const prntsis = "\\([^)]*\\)";
  const rtrntype = "(?::[ ]*[^{;]+";
  const braces = "{|[ ]*{)[^}]*}";
  const flags = "gm";

  const reg = new RegExp(accessModifier + name + prntsis + rtrntype + braces, flags);
  const names = [];
  let exec;
  while( (exec = reg.exec(content)) !== null ) {
    const code = exec[0];
    const name = exec[1];
    names.push({name, code});
  }
  return names;
};

const findConstructor = (content) => {
  const reg = new RegExp("^[ \\t]*constructor\\(([^)]*)\\)[ \\t]*{[^}]*}", 'm');
  const exec = reg.exec(content);
  return {
    params: exec[1],
    code: exec[0]
  };
};

const getConstrDeps = (params) => {
  console.log(params);
  const clearPrivate = new RegExp("\\s*private[^:,]*:[^,]*,?", 'gm');
  const clearProtected = new RegExp("\\s*protected[^:,]*:[^,]*,?", 'gm');
  const clearModifier = new RegExp("public[ ]*", 'gm');
  let text = params.replace(clearPrivate, '');
  text = text.replace(clearProtected, '');
  text = text.replace(clearModifier, '');
  if (text.length === 0) {
    return [];
  }
  return text
    .split(',')
    .map((pkTuple) => {
      const tuple = pkTuple.split(':');
      return {
        param: tuple[0].trim(),
        type: tuple[1].trim()
      };
    });
};

const getClassDecorators = (content) => {
  const classDecorators = ['Component', 'Pipe', 'Directive', 'Injectable'];
  const reg = new RegExp("@([a-zA-Z]+)\\((?:{([^}]*)})?\\)", 'g');
  const decorators = [];
  let exec;
  while( (exec = reg.exec(content)) !== null ) {
    const params = exec[2];
    const name = exec[1];
    if (classDecorators.indexOf(name) !== -1) {
      decorators.push({name, params});
    }
  }
  return decorators;
};

const getInjectDecorators = (content) => {
  const reg = new RegExp("@Inject\\([^)]+\\) ([a-zA-Z]+)[ ]*(?::[ ]*([a-zA-Z]+))?,?", 'g');
  const decorators = [];
  let exec;
  while( (exec = reg.exec(content)) !== null ) {
    const token = exec[1];
    const param = exec[2];
    const type = exec[3];
    decorators.push({token, param, type});
  }
  return decorators;
};

const clearInjectDecorators = (content) => {
  const reg = new RegExp("@Inject\\([^)]+\\) [a-zA-Z]+[ ]*(?::[ ]*[a-zA-Z]+)?,?", 'g');
  return content.replace(reg, '');
};

const getPropertyDecorators = (content) => {
  const reg = new RegExp("@([a-zA-Z]+)\\([^(]*\\)\\s*(?:(get |set )([a-zA-Z]+)\\([^)]*\\)|([a-zA-Z]+)[^;{]*;)", 'g');
  const decorators = [];
  let exec;
  while( (exec = reg.exec(content)) !== null ) {
    const prop = (exec[4] !== undefined)
    ? exec[4]
    : exec[3];
    const type = exec[1];
    const modifier = exec[2];
    decorators.push({type, modifier, prop});
  }
  return decorators;
};

const findDescribe = (content) => {
  let start;
  let code;
  const reg = new RegExp("describe\\([^{]+{[\\s\\S]*}\\)", 'm');
  const exec = reg.exec(content);
  if (exec !== null) {
    start = exec.index;
    code = exec[0];
  } else {
    start = content.length -1;
    code = '';
  }
  return {
    start,
    code
  };
};

const getDescribeAppendIndex = (content) => {
  const describe = findDescribe(content);
  let index = describe.code.lastIndexOf('})');
  index += describe.start;
  return index;
};

module.exports = {
  findClass: findClass,
  getInheritance: getInheritance,
  findFunctions: findFunctions,
  findConstructor: findConstructor,
  getConstrDeps: getConstrDeps,
  getPropertyDecorators: getPropertyDecorators,
  getClassDecorators: getClassDecorators,
  getInjectDecorators: getInjectDecorators,
  clearInjectDecorators: clearInjectDecorators,
  findDescribe: findDescribe,
  getDescribeAppendIndex: getDescribeAppendIndex
};