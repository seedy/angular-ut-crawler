const stdError = (err) => {
  let msg = err;
  if (err.code) {
    msg += ' - ' + err.code;
  }
  console.error(msg);
};
const noAccessError = (path) => console.error('Try changing permissions on file ' + path);
const notAcceptedError = () => console.error('Type is not accepted');
const pathNotAbsError = (path) => console.error('Path is not absolute: ' + path);
const notFileError = (path) => console.error('Path is not a file ' + path);
module.exports = {
  stdError: stdError,
  noAccessError: noAccessError,
  notAcceptedError: notAcceptedError,
  pathNotAbsError: pathNotAbsError,
  notFileError: notFileError
};