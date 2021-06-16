const {resolve} = require('path');

module.exports = {
  preset: 'react-native',
  transform: {
    '\\.(js|ts|tsx|.ios.js)$': require.resolve('react-native/jest/preprocessor.js'),
  },
  setupFiles: [
    './setupJest.js',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  coverageThreshold: {
    "global": {
      "branches": 18.79,
      "functions": 15.8,
      "lines": 17.28
      }
  },
  setupFiles: ['./setupJest.js'],
  // this is specific to the Jest repo, not generally needed (the files we ignore will be in node_modules which is ignored by default)
  transformIgnorePatterns: [resolve(__dirname, '../../packages')],
};
