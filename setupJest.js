import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter.js', () => {
  const {EventEmitter} = require('events');
  return EventEmitter;
});

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
    const TouchableOpacity = jest.requireActual('react-native/Libraries/Components/Touchable/TouchableOpacity');
    TouchableOpacity.displayName = 'TouchableOpacity';
    return TouchableOpacity;
})
jest.mock('react-native-gesture-handler/jestSetup');
