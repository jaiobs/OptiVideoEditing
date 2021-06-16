import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  requireNativeComponent,
  NativeModules,
  PermissionsAndroid,
  findNodeHandle,
  Platform,
} from 'react-native';

const CameraPreview = requireNativeComponent('CameraPreview');
const CameraManager = NativeModules.CameraModuleAndroid;

export const getVideoDetails = (resp, callback) => {
  if (CameraManager) {
    CameraManager.getVideoDetails(resp.videoPath,resp.videoPathUri, callback);
  }
};

export const getImageDetails = (imagePath, callback) => {
  if (CameraManager) {
    CameraManager.getImageDetails(imagePath, callback);
  }
};

export const saveImageInInternalStorage = (imagePath, callback) => {
  if (CameraManager) {
    CameraManager.saveImageLocal(imagePath, callback);
  }
};

export const saveVideoInInternalStorage = (videoPath, callback) => {
  if (CameraManager) {
    CameraManager.saveVideoLocal(videoPath, callback);
  }
};

const cameraPermissionsConst = {
  androidCameraPermissionOptions: {
    title: 'Permission to use camera',
    message: 'We need your permission to use your camera',
    buttonPositive: 'Ok',
    buttonNegative: 'Cancel',
  },
  androidRecordAudioPermissionOptions: {
    title: 'Permission to use audio recording',
    message: 'We need your permission to use your audio',
    buttonPositive: 'Ok',
    buttonNegative: 'Cancel',
  },
  storageReadPermission: {
    title: 'App Storage Read Permission',
    message: 'App needs access to read your storage ',
    buttonNeutral: 'Ask Me Later',
    buttonNegative: 'Cancel',
    buttonPositive: 'OK',
  },
  storageWritePermission: {
    title: 'App Storage Write Permission',
    message: 'App needs access to write your storage ',
    buttonNeutral: 'Ask Me Later',
    buttonNegative: 'Cancel',
    buttonPositive: 'OK',
  },
};

export type RecordAudioPermissionStatus =
  | 'AUTHORIZED'
  | 'NOT_AUTHORIZED'
  | 'PENDING_AUTHORIZATION';

const RecordAudioPermissionStatusEnum: {
  [key: RecordAudioPermissionStatus]: RecordAudioPermissionStatus,
} = {
  AUTHORIZED: 'AUTHORIZED',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
};

export default class CameraRecorder extends Component {
  _cameraRef: ?Object;
  _cameraHandle: ?number;

  constructor(props) {
    super(props);
    this.state = {
      isCanComponentMount: false,
      isCameraAuthorized: false,
      isAuthorizationChecked: false,
    };
  }

  async componentDidMount() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus,
      hasReadStoragePermissions,
      hasWriteStoragePermissions,
    } = await this.arePermissionsGranted();

    let allPermissionEnabled =
      hasCameraPermissions &&
      recordAudioPermissionStatus &&
      hasReadStoragePermissions &&
      hasWriteStoragePermissions;

    if (!allPermissionEnabled) {
      this.componentDidMount();
    } else {
      this.setState({
        isCameraAuthorized: hasCameraPermissions,
        isAuthorizationChecked: true,
        recordAudioPermissionStatus,
      });
    }
  }

  async arePermissionsGranted() {
    const {
      androidCameraPermissionOptions,
      androidRecordAudioPermissionOptions,
      storageReadPermission,
      storageWritePermission,
    } = cameraPermissionsConst;

    let cameraPermissions = androidCameraPermissionOptions;
    let audioPermissions = androidRecordAudioPermissionOptions;
    let readPermissions = storageReadPermission;
    let writPermissions = storageWritePermission;

    const {
      hasCameraPermissions,
      hasRecordAudioPermissions,
      hasReadStoragePermissions,
      hasWriteStoragePermissions,
    } = await this.requestPermissions(
      cameraPermissions,
      audioPermissions,
      readPermissions,
      writPermissions,
    );

    const recordAudioPermissionStatus = hasRecordAudioPermissions;
    //   ? RecordAudioPermissionStatusEnum.AUTHORIZED
    //   : RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;

    return {
      hasCameraPermissions,
      recordAudioPermissionStatus,
      hasReadStoragePermissions,
      hasWriteStoragePermissions,
    };
  }

  async requestPermissions(
    androidCameraPermissionOptions: Rationale,
    androidRecordAudioPermissionOptions: Rationale,
    androidReadStoragePermissionOptions: Rationale,
    androidWriteStoragePermissionOptions: Rationale,
  ) {
    let hasCameraPermissions = false;
    let hasRecordAudioPermissions = false;
    let hasReadStoragePermissions = false;
    let hasWriteStoragePermissions = false;

    if (Platform.OS === 'android') {
      const cameraPermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        androidCameraPermissionOptions,
      );
      if (typeof cameraPermissionResult === 'boolean') {
        hasCameraPermissions = cameraPermissionResult;
      } else {
        hasCameraPermissions =
          cameraPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    if (Platform.OS === 'android') {
      const audioPermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        androidRecordAudioPermissionOptions,
      );
      if (typeof audioPermissionResult === 'boolean') {
        hasRecordAudioPermissions = audioPermissionResult;
      } else {
        hasRecordAudioPermissions =
          audioPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    if (Platform.OS === 'android') {
      const readPermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        androidReadStoragePermissionOptions,
      );
      if (typeof readPermissionResult === 'boolean') {
        hasReadStoragePermissions = readPermissionResult;
      } else {
        hasReadStoragePermissions =
          readPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    if (Platform.OS === 'android') {
      const writePermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        androidWriteStoragePermissionOptions,
      );
      if (typeof writePermissionResult === 'boolean') {
        hasWriteStoragePermissions = writePermissionResult;
      } else {
        hasWriteStoragePermissions =
          writePermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    return {
      hasCameraPermissions,
      hasRecordAudioPermissions,
      hasReadStoragePermissions,
      hasWriteStoragePermissions,
    };
  }

  async capturePhoto(callback) {
    CameraManager.capturePhoto(this._cameraHandle, callback);
  }

  startRecording(callback) {
    CameraManager.startRecording(this._cameraHandle, callback);
  }

  stopRecording(callback) {
    CameraManager.stopRecording(this._cameraHandle, callback);
  }

  switchFlashMode(callback) {
    CameraManager.switchFlashMode(this._cameraHandle, callback);
  }

  updateFlashMode(callback) {
    CameraManager.getFlashMode(this._cameraHandle, callback);
  }

  resumeCamera() {
    if (this._cameraHandle) {
      CameraManager.mountCamera(this._cameraHandle);
    }
  }

  pauseCamera() {
    if (this._cameraHandle) {
      CameraManager.unMountCamera(this._cameraHandle);
    }
  }

  lockOrientation(isPortrait) {
    CameraManager.lockOrientation(isPortrait);
  }

  releaseOrientation() {
    CameraManager.releaseOrientation();
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._cameraRef = ref;
      this._cameraHandle = findNodeHandle(ref);
    } else {
      this._cameraRef = null;
      this._cameraHandle = null;
    }
  };

  render() {
    return (
      <View style={styles.rootContainer}>
        {!this.state.isAuthorizationChecked && (
          <View style={styles.authorizationContainer}>
            <ActivityIndicator size="small" />
          </View>
        )}

        {!this.state.isCameraAuthorized && this.state.isCameraAuthorized && (
          <View style={styles.authorizationContainer}>
            <Text style={styles.notAuthorizedText}>Camera not authorized</Text>
          </View>
        )}
        {this.state.isCameraAuthorized && (
          <CameraPreview ref={this._setReference} {...this.props} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  authorizationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAuthorizedText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
