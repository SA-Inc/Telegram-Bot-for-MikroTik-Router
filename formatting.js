module.exports.toDataUnit = (bytes) => {
  if (typeof bytes === 'number') {
    if (bytes == 0) {
      return `0 B`;
    } else {
      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
      let value = Math.floor(Math.log(bytes) / Math.log(1024));

      return `${(bytes / Math.pow(1024, Math.floor(value))).toFixed(1)} ${units[value]}`;
    }
  } else {
    return null;
  }
};