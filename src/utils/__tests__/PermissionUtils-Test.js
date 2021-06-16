import { checkAndRequestPermission } from '../PermissionUtils';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';


describe("Permission Utils", () => {
  it("permission status Granted", async() => {
    jest.useFakeTimers();
    checkAndRequestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY).then((data) => {
      expect(data).toBe(Promise.resolve(RESULTS.GRANTED));
    })
  });
  it("permission status Limited", async() => {
    jest.useFakeTimers();
    checkAndRequestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY).then((data) => {
      expect(data).toBe(Promise.resolve(RESULTS.LIMITED));
    })
  });
  it("permission status Denied", async() => {
    jest.useFakeTimers();
    checkAndRequestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY).then((data) => {
      expect(data).toBe(Promise.resolve(RESULTS.DENIED));
    })
  });
});