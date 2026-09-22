module.exports = {
  preset: 'react-native',
  
  // 1. THIS FIXES THE LUCIDE ICONS CRASH
  // Tells Jest to transform react-native and lucide-react-native instead of ignoring them
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|lucide-react-native)/',
  ],

  // 2. THIS FIXES THE GLOBAL.CSS CRASH
  // Intercepts any .css file and redirects it to your empty mock file
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
};