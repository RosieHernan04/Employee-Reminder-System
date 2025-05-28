// next.config.js
const withTM = require('next-transpile-modules')([
  '@ant-design/icons',
  'antd',
  'rc-pagination',
  'rc-picker',
  'rc-util',
  'rc-select',
  'rc-dialog',
]);

module.exports = withTM({
  reactStrictMode: true,
});
