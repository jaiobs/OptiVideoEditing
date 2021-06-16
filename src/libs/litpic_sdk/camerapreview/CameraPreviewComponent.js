import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  requireNativeComponent,
  UIManager,
  PermissionsAndroid,
  findNodeHandle,
  Platform,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';

const CameraPreview = requireNativeComponent('CameraPreviewComponent');
const CameraManager = NativeModules.CameraModuleAndroid;

export const getVideoDetails = (videoPath, callback) => {
  if (CameraManager) {
    CameraManager.getVideoDetails(videoPath, callback);
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

export default class CameraPreviewComponent extends Component {
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
    //add listeners for emitters
    this.initListeners();

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

  componentWillUnmount() {
    this.executeCommand("unMountCamera", []);
    this.onPhotoCapturedListioner.remove();
    this.onVideoCaptureListioner.remove();
    this.onVideoCaptureEndListioner.remove();
  }

  initListeners() {
    this.onPhotoCapturedListioner = DeviceEventEmitter.addListener(
      'onPhotoCaptured',
      (imageData) => {
        this.props.onImageCaptured(imageData);
      },
    );

    this.onVideoCaptureListioner = DeviceEventEmitter.addListener(
      'onVideoCaptureStart',
      (videoData) => {
        this.props.onVideoCaptureStart(videoData);
      },
    );

    this.onVideoStopCaptureListioner = DeviceEventEmitter.addListener(
      'onVideoCaptureStop',
      (videoData) => {
        this.props.onVideoCaptureStop(videoData);
      },
    );

    this.onVideoCaptureEndListioner = DeviceEventEmitter.addListener(
      'onVideoCaptureEnd',
      (videoData) => {
        this.props.onVideoCaptureEnd(videoData);
      },
    );

    this.onEventResetFilterListener = DeviceEventEmitter.addListener(
      'EventResetFiltersValue',
      (data) => {
        this.props.onEventResetFilter();
      },
    );
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

  capturePhoto() {
    this.executeCommand("capturePhoto", []);
  }

  changeFilter(filterValues) {
    this.executeCommand("switchFilter", [filterValues]);
  }

  startRecording() {
    this.executeCommand("startVideo", []);
  }

  stopRecording() {
    this.executeCommand("stopVideo", []);
  }

  lockOrientation(isPortrait) {
    this.executeCommand("lockOrientation", [isPortrait]);
  }

  releaseOrientation() {
    this.executeCommand("releaseOrientation", []);
  }

  toggleMusicIcon() {
    this.executeCommand("toggleMusic", []);
  }

  setAudioPath(audioPath) {
    this.executeCommand("audioPath", [audioPath]);
  }

  setSpeedValue(speedValue) {
    this.executeCommand("speedValue", [speedValue]);
  }

  removeLastSegmentVideo() {
    this.executeCommand("removeLastSegment", []);
  }

  shadowImage(previousVideoPath) {
    this.executeCommand("shadowImage", [previousVideoPath]);
  }

  releaseListeners(){
    this.executeCommand("releaseListeners",[]);
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(this._cameraHandle, command, params);
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
