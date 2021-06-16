import { check, request, RESULTS, Permission } from 'react-native-permissions';

export function permissionStatusForSettingsRedirection(permissionType) {
  const permissionFlag = permissionType != 'granted' && (permissionType == 'limited' || permissionType == 'denied' || permissionType == 'blocked')
  return permissionFlag
}

export async function checkAndRequestPermission(
  permission: Permission
): Promise<boolean> {
  const cameraPermissionResult = await check(permission);
  switch (cameraPermissionResult) {
    case RESULTS.DENIED:
      console.log(`Permissions DENIED: ${permission},${ RESULTS.GRANTED}`);
     if(await request(permission) === RESULTS.GRANTED){
      return permissionStatusForSettingsRedirection('denied');
     }
    case RESULTS.LIMITED:  
      console.log(`Permissions LIMITED: ${permission}`);
      return permissionStatusForSettingsRedirection('limited');
    case RESULTS.GRANTED:
      console.log(`Permissions GRANTED: ${permission}`);
      return permissionStatusForSettingsRedirection('granted');
    case RESULTS.BLOCKED:
      console.log(`Permissions BLOCKED: ${permission}`);
     if(await request(permission) === RESULTS.GRANTED){
      return permissionStatusForSettingsRedirection('blocked');
     }
  }
  return permissionStatusForSettingsRedirection(cameraPermissionResult);
}