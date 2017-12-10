const inquirer = require('inquirer');
const fs = require('fs');
const shared = require('./shared');

let knowsTypeFromPath = (path) => {
  const type = shared.guessTypeFromPath(path);
  if (type === null) {
    return false;
  }
  return shared.isAcceptedType(type);
};

const questions = [
  {
    type: 'input',
    name: 'file',
    message: 'what is the path to the class file you want to crawl',
    validate: (value) => {
      return new Promise((resolve, reject) => {
        fs.stat(value, (err, stats) => {
          let msg;
          if(err) {
            msg = '['+ err.code + '] - ';
            if(err.code === 'EACCES') {
              msg += ('Try changing permissions on file ' + value);
            }
            if(err.code === 'ENOENT' || err.code === 'EISDIR') {
              msg += 'Likely wrong path';
            }
            reject(msg);
          } else if(!stats.isFile()) {
            msg = 'Not a file';
            reject(msg);
          } else {
            resolve(stats.isFile());
          }
        });
      });
    }
  },
  {
    type: 'list',
    name: 'type',
    message: 'what is the type of your class',
    choices: shared.getAcceptedTypes(),
    when: (answers) => {
      return !knowsTypeFromPath(answers.file);
    }
  }
];

const ask = () => {
  return inquirer.prompt(questions).then((answers) => {
    return answers;
  });
};


module.exports = {
  ask: ask
};