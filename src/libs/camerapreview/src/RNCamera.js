// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {
  findNodeHandle,
  Platform,
  NativeModules,
  ViewPropTypes,
  requireNativeComponent,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Image
} from 'react-native';
var RNFS = require('react-native-fs');

const Rationale = PropTypes.shape({
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonPositive: PropTypes.string,
  buttonNegative: PropTypes.string,
  buttonNeutral: PropTypes.string,
});

const requestPermissions = async (
  captureAudio: boolean,
  CameraManager: any,
  androidCameraPermissionOptions: Rationale,
  androidRecordAudioPermissionOptions: Rationale,
): Promise<{
  hasCameraPermissions: boolean,
  hasRecordAudioPermissions: boolean,
}> => {
  let hasCameraPermissions = false;
  let hasRecordAudioPermissions = false;

  if (Platform.OS === 'ios') {
    hasCameraPermissions = await CameraManager.checkVideoAuthorizationStatus();
  } else if (Platform.OS === 'android') {
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

  if (captureAudio) {
    if (Platform.OS === 'ios') {
      hasRecordAudioPermissions = await CameraManager.checkRecordAudioAuthorizationStatus();
    } else if (Platform.OS === 'android') {
      if (await CameraManager.checkIfRecordAudioPermissionsAreDefined()) {
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
      } else if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          `The 'captureAudio' property set on RNCamera instance but 'RECORD_AUDIO' permissions not defined in the applications 'AndroidManifest.xml'. ` +
            `If you want to record audio you will have to add '<uses-permission android:name="android.permission.RECORD_AUDIO"/>' to your 'AndroidManifest.xml'. ` +
            `Otherwise you should set the 'captureAudio' property on the component instance to 'false'.`,
        );
      }
    }
  }

  return {
    hasCameraPermissions,
    hasRecordAudioPermissions,
  };
};

const styles = StyleSheet.create({
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

type Orientation =
  | 'auto'
  | 'landscapeLeft'
  | 'landscapeRight'
  | 'portrait'
  | 'portraitUpsideDown';
type OrientationNumber = 1 | 2 | 3 | 4;

type PictureOptions = {
  quality?: number,
  orientation?: Orientation | OrientationNumber,
  base64?: boolean,
  mirrorImage?: boolean,
  exif?: boolean,
  writeExif?: boolean | {[name: string]: any},
  width?: number,
  fixOrientation?: boolean,
  forceUpOrientation?: boolean,
  pauseAfterCapture?: boolean,
};

type RecordingOptions = {
  maxDuration?: number,
  maxFileSize?: number,
  orientation?: Orientation,
  quality?: number | string,
  codec?: string,
  mute?: boolean,
  path?: string,
  videoBitrate?: number,
};

type EventCallbackArgumentsType = {
  nativeEvent: Object,
};

type Rect = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type PropsType = typeof View.props & {
  zoom?: number,
  ratio?: string,
  focusDepth?: number,
  type?: number | string,
  onCameraReady?: Function,
  onStatusChange?: Function,
  onPictureSaved?: Function,
  onVideoEnded?: Function,
  flashMode?: number | string,
  exposure?: number,
  whiteBalance?: number | string,
  autoFocus?: string | boolean | number,
  autoFocusPointOfInterest?: {x: number, y: number},
  captureAudio?: boolean,
  useCamera2Api?: boolean,
  playSoundOnCapture?: boolean,
  videoStabilizationMode?: number | string,
  pictureSize?: string,
  rectOfInterest: Rect,
  silHoutteMode: boolean
};

type StateType = {
  isAuthorized: boolean,
  isAuthorizationChecked: boolean,
  recordAudioPermissionStatus: RecordAudioPermissionStatus,
};

export type Status = 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';

const CameraStatus: {[key: Status]: Status} = {
  READY: 'READY',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
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

const CameraManager: Object = NativeModules.RNCameraManager ||
  NativeModules.RNCameraModule || {
    stubbed: true,
    Type: {
      back: 1,
    },
    AutoFocus: {
      on: 1,
    },
    FlashMode: {
      off: 1,
    },
    WhiteBalance: {},
  };

const EventThrottleMs = 500;

const mapValues = (input, mapper) => {
  const result = {};
  Object.entries(input).forEach(([key, value]) => {
    result[key] = mapper(value, key);
    return null;
  });
  return result;
};

export default class Camera extends React.Component<PropsType, StateType> {
  static Constants = {
    Type: CameraManager.Type,
    FlashMode: CameraManager.FlashMode,
    AutoFocus: CameraManager.AutoFocus,
    WhiteBalance: CameraManager.WhiteBalance,
    VideoQuality: CameraManager.VideoQuality,
    VideoCodec: CameraManager.VideoCodec,
    CameraStatus,
    RecordAudioPermissionStatus: RecordAudioPermissionStatusEnum,
    VideoStabilization: CameraManager.VideoStabilization,
    Orientation: {
      auto: 'auto',
      landscapeLeft: 'landscapeLeft',
      landscapeRight: 'landscapeRight',
      portrait: 'portrait',
      portraitUpsideDown: 'portraitUpsideDown',
    },
  };

  // Values under keys from this object will be transformed to native options
  static ConversionTables = {
    type: CameraManager.Type,
    flashMode: CameraManager.FlashMode,
    exposure: CameraManager.Exposure,
    autoFocus: CameraManager.AutoFocus,
    whiteBalance: CameraManager.WhiteBalance,
    videoStabilizationMode: CameraManager.VideoStabilization || {},
  };

  static propTypes = {
    ...ViewPropTypes,
    zoom: PropTypes.number,
    ratio: PropTypes.string,
    focusDepth: PropTypes.number,
    onMountError: PropTypes.func,
    onCameraReady: PropTypes.func,
    onStatusChange: PropTypes.func,
    onBarCodeRead: PropTypes.func,
    onPictureSaved: PropTypes.func,
    onVideoEnded: PropTypes.func,
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    flashMode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    exposure: PropTypes.number,
    whiteBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    autoFocus: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
    ]),
    autoFocusPointOfInterest: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    permissionDialogTitle: PropTypes.string,
    permissionDialogMessage: PropTypes.string,
    androidCameraPermissionOptions: Rationale,
    androidRecordAudioPermissionOptions: Rationale,
    notAuthorizedView: PropTypes.element,
    pendingAuthorizationView: PropTypes.element,
    captureAudio: PropTypes.bool,
    useCamera2Api: PropTypes.bool,
    playSoundOnCapture: PropTypes.bool,
    videoStabilizationMode: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    pictureSize: PropTypes.string,
    mirrorVideo: PropTypes.bool,
    setVideoLayer: PropTypes.bool,
    rectOfInterest: PropTypes.any,
    defaultVideoQuality: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    isMusicAdded: PropTypes.bool,
    musicURL: PropTypes.string,
    silHoutteMode: PropTypes.bool
  };

  static defaultProps: Object = {
    zoom: 0,
    ratio: '4:3',
    focusDepth: 0,
    type: CameraManager.Type.back,
    autoFocus: CameraManager.AutoFocus.on,
    flashMode: CameraManager.FlashMode.off,
    exposure: -1,
    whiteBalance: CameraManager.WhiteBalance.auto,
    permissionDialogTitle: '',
    permissionDialogMessage: '',
    androidCameraPermissionOptions: {
      title: '',
      message: '',
    },
    androidRecordAudioPermissionOptions: {
      title: '',
      message: '',
    },
    notAuthorizedView: (
      <View style={styles.authorizationContainer}>
        <Text style={styles.notAuthorizedText}>Camera not authorized</Text>
      </View>
    ),
    pendingAuthorizationView: (
      <View style={styles.authorizationContainer}>
        <ActivityIndicator size="small" />
      </View>
    ),
    captureAudio: true,
    useCamera2Api: false,
    playSoundOnCapture: false,
    pictureSize: 'None',
    videoStabilizationMode: 0,
    mirrorVideo: false,
    setVideoLayer: false,
    isMusicAdded: false,
    musicURL: '',
    silHoutteMode: false
  };

  _cameraRef: ?Object;
  _cameraHandle: ?number;
  _lastEvents: {[string]: string};
  _lastEventsTimes: {[string]: Date};
  _isMounted: boolean;

  constructor(props: PropsType) {
    super(props);
    this._lastEvents = {};
    this._lastEventsTimes = {};
    this._isMounted = true;
    this.state = {
      isAuthorized: false,
      isAuthorizationChecked: false,
      recordAudioPermissionStatus:
        RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION,
    };
  }

  async takePictureAsync(options?: PictureOptions) {
    if (!options) {
      options = {};
    }
    if (!options.quality) {
      options.quality = 1;
    }

    if (options.orientation) {
      if (typeof options.orientation !== 'number') {
        const {orientation} = options;
        options.orientation = CameraManager.Orientation[orientation];
        if (__DEV__) {
          if (typeof options.orientation !== 'number') {
            // eslint-disable-next-line no-console
            console.warn(`Orientation '${orientation}' is invalid.`);
          }
        }
      }
    }

    if (options.pauseAfterCapture === undefined) {
      options.pauseAfterCapture = false;
    }

    if (!this._cameraHandle) {
      throw 'Camera handle cannot be null';
    }

    return await CameraManager.takePicture(options, this._cameraHandle);
  }

  async getSupportedRatiosAsync() {
    if (Platform.OS === 'android') {
      return await CameraManager.getSupportedRatios(this._cameraHandle);
    } else {
      throw new Error('Ratio is not supported on iOS');
    }
  }

  getAvailablePictureSizes = async (): string[] => {
    //$FlowFixMe
    return await CameraManager.getAvailablePictureSizes(
      this.props.ratio,
      this._cameraHandle,
    );
  };

  async recordAsync(options?: RecordingOptions) {
    if (!options || typeof options !== 'object') {
      options = {};
    } else if (typeof options.quality === 'string') {
      options.quality = Camera.Constants.VideoQuality[options.quality];
    }
    if (options.orientation) {
      if (typeof options.orientation !== 'number') {
        const {orientation} = options;
        options.orientation = CameraManager.Orientation[orientation];
        if (__DEV__) {
          if (typeof options.orientation !== 'number') {
            // eslint-disable-next-line no-console
            console.warn(`Orientation '${orientation}' is invalid.`);
          }
        }
      }
    }

    if (__DEV__) {
      if (options.videoBitrate && typeof options.videoBitrate !== 'number') {
        // eslint-disable-next-line no-console
        console.warn('Video Bitrate should be a positive integer');
      }
    }

    const {recordAudioPermissionStatus} = this.state;
    const {captureAudio} = this.props;

    if (
      !captureAudio ||
      recordAudioPermissionStatus !== RecordAudioPermissionStatusEnum.AUTHORIZED
    ) {
      options.mute = true;
    }

    if (__DEV__) {
      if (
        (!options.mute || captureAudio) &&
        recordAudioPermissionStatus !==
          RecordAudioPermissionStatusEnum.AUTHORIZED
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          'Recording with audio not possible. Permissions are missing.',
        );
      }
    }

    return await CameraManager.record(options, this._cameraHandle);
  }

  capturePhoto(callback) {
    CameraManager.capturePhotoFromVideo(this._cameraHandle, callback);
  }
  startRecording() {
    CameraManager.startVideoRecording(this._cameraHandle);
  }
  pauseRecording() {
    CameraManager.pauseVideoRecording(this._cameraHandle);
  }

  resumeRecording() {
    CameraManager.resumeVideoRecording(this._cameraHandle);
  }

  stopRecording() {
    CameraManager.stopRecording(this._cameraHandle);
  }

  pausePreview() {
    CameraManager.pausePreview(this._cameraHandle);
  }

  isRecording() {
    return CameraManager.isRecording(this._cameraHandle);
  }

  resumePreview() {
    CameraManager.resumePreview(this._cameraHandle);
  }

  // Music play and pause streaming
  playMusicStreaming(urlString) {
    CameraManager.streamMusicURL(urlString);
  }

  pauseMusicStreaming() {
    CameraManager.streamPauseMusicURL('');
  }

  playAndSeekSong(urlString, seekTime) {
    CameraManager.playMusicAndSeekURL(urlString, seekTime);
  }

  stopMusic() {
    CameraManager.stopMusicAfterTrimming(0.0);
  }

  syncAndDownloadMusicToTrim(urlString,trackID,trackDetails,callback){
    CameraManager.setMusicSyncAndDownload(urlString,trackID,trackDetails,callback)
  }

  playBackOnRecord(value) {
    CameraManager.playMusicWhileRecording(value);
  }

  cancelSyncMusic() {
    CameraManager.syncExit();
  }

  async mergeVideos(callback) {
    return await CameraManager.mergeVideos(this._cameraHandle, callback);
  }

  _onMountError = ({nativeEvent}: EventCallbackArgumentsType) => {
    if (this.props.onMountError) {
      this.props.onMountError(nativeEvent);
    }
  };

  _onCameraReady = () => {
    if (this.props.onCameraReady) {
      this.props.onCameraReady();
    }
  };

  _onStatusChange = () => {
    if (this.props.onStatusChange) {
      this.props.onStatusChange({
        cameraStatus: this.getStatus(),
        recordAudioPermissionStatus: this.state.recordAudioPermissionStatus,
      });
    }
  };

  _onPictureSaved = ({nativeEvent}: EventCallbackArgumentsType) => {
    if (this.props.onPictureSaved) {
      this.props.onPictureSaved(nativeEvent);
    }
  };

  _onVideoEnded = ({nativeEvent}: EventCallbackArgumentsType) => {
    if (this.props.onVideoEnded) {
      this.props.onVideoEnded(nativeEvent);
    }
  };

  _onObjectDetected = (callback: ?Function) => ({
    nativeEvent,
  }: EventCallbackArgumentsType) => {
    const {type} = nativeEvent;
    if (
      this._lastEvents[type] &&
      this._lastEventsTimes[type] &&
      JSON.stringify(nativeEvent) === this._lastEvents[type] &&
      new Date() - this._lastEventsTimes[type] < EventThrottleMs
    ) {
      return;
    }

    if (callback) {
      callback(nativeEvent);
      this._lastEventsTimes[type] = new Date();
      this._lastEvents[type] = JSON.stringify(nativeEvent);
    }
  };

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._cameraRef = ref;
      this._cameraHandle = findNodeHandle(ref);
    } else {
      this._cameraRef = null;
      this._cameraHandle = null;
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  async arePermissionsGranted() {
    const {
      permissionDialogTitle,
      permissionDialogMessage,
      androidCameraPermissionOptions,
      androidRecordAudioPermissionOptions,
    } = this.props;

    let cameraPermissions = androidCameraPermissionOptions;
    let audioPermissions = androidRecordAudioPermissionOptions;
    if (permissionDialogTitle || permissionDialogMessage) {
      // eslint-disable-next-line no-console
      console.warn(
        'permissionDialogTitle and permissionDialogMessage are deprecated. Please use androidCameraPermissionOptions instead.',
      );
      cameraPermissions = {
        ...cameraPermissions,
        title: permissionDialogTitle,
        message: permissionDialogMessage,
      };
      audioPermissions = {
        ...audioPermissions,
        title: permissionDialogTitle,
        message: permissionDialogMessage,
      };
    }

    const {
      hasCameraPermissions,
      hasRecordAudioPermissions,
    } = await requestPermissions(
      this.props.captureAudio,
      CameraManager,
      cameraPermissions,
      audioPermissions,
    );

    const recordAudioPermissionStatus = hasRecordAudioPermissions
      ? RecordAudioPermissionStatusEnum.AUTHORIZED
      : RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;
    return {hasCameraPermissions, recordAudioPermissionStatus};
  }

  async refreshAuthorizationStatus() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus,
    } = await this.arePermissionsGranted();
    if (this._isMounted === false) {
      return;
    }

    this.setState({
      isAuthorized: hasCameraPermissions,
      isAuthorizationChecked: true,
      recordAudioPermissionStatus,
    });
  }

  async componentDidMount() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus,
    } = await this.arePermissionsGranted();
    if (this._isMounted === false) {
      return;
    }

    this.setState(
      {
        isAuthorized: hasCameraPermissions,
        isAuthorizationChecked: true,
        recordAudioPermissionStatus,
      },
      this._onStatusChange,
    );
  }

  getStatus = (): Status => {
    const {isAuthorized, isAuthorizationChecked} = this.state;
    if (isAuthorizationChecked === false) {
      return CameraStatus.PENDING_AUTHORIZATION;
    }
    return isAuthorized ? CameraStatus.READY : CameraStatus.NOT_AUTHORIZED;
  };

  // FaCC = Function as Child Component;
  hasFaCC = (): * => typeof this.props.children === 'function';

  renderChildren = (): * => {
    if (this.hasFaCC()) {
      return this.props.children({
        camera: this,
        status: this.getStatus(),
        recordAudioPermissionStatus: this.state.recordAudioPermissionStatus,
      });
    }
    return this.props.children;
  };

  render() {
    const {style, ...nativeProps} = this._convertNativeProps(this.props);
    if (this.state.isAuthorized || this.hasFaCC()) {
      return (
        <View style={style}>
          <RNCamera
            {...nativeProps}
            style={StyleSheet.absoluteFill}
            ref={this._setReference}
            onMountError={this._onMountError}
            onCameraReady={this._onCameraReady}
            onPictureSaved={this._onPictureSaved}
            onVideoEnded={this._onVideoEnded}
          />
          {this.props.silHoutteMode && Platform.OS == "ios" && 
            <Image style={{width:"100%",height:"100%",opacity:0.5}} 
                source={{uri: 'file://' + RNFS.DocumentDirectoryPath + '/LastFrame.jpg'}}
              />
           } 
          {this.renderChildren()}
        </View>
      );
    } else if (!this.state.isAuthorizationChecked) {
      return this.props.pendingAuthorizationView;
    } else {
      return this.props.notAuthorizedView;
    }
  }

  _convertNativeProps({children, ...props}: PropsType) {
    const newProps = mapValues(props, this._convertProp);

    if (props.onBarCodeRead) {
      newProps.barCodeScannerEnabled = true;
    }

    if (props.onGoogleVisionBarcodesDetected) {
      newProps.googleVisionBarcodeDetectorEnabled = true;
    }

    if (props.onFacesDetected) {
      newProps.faceDetectorEnabled = true;
    }

    if (props.onTextRecognized) {
      newProps.textRecognizerEnabled = true;
    }

    if (Platform.OS === 'ios') {
      delete newProps.googleVisionBarcodeMode;
      delete newProps.ratio;
    }

    return newProps;
  }

  _convertProp(value: *, key: string): * {
    if (typeof value === 'string' && Camera.ConversionTables[key]) {
      return Camera.ConversionTables[key][value];
    }

    return value;
  }
}

export const Constants = Camera.Constants;

const RNCamera = requireNativeComponent('RNCamera', Camera, {
  nativeOnly: {
    accessibilityComponentType: true,
    accessibilityLabel: true,
    accessibilityLiveRegion: true,
    barCodeScannerEnabled: true,
    googleVisionBarcodeDetectorEnabled: true,
    faceDetectorEnabled: true,
    textRecognizerEnabled: true,
    importantForAccessibility: true,
    onBarCodeRead: true,
    onGoogleVisionBarcodesDetected: true,
    onCameraReady: true,
    onPictureSaved: true,
    onVideoEnded: true,
    onFaceDetected: true,
    onLayout: true,
    onMountError: true,
    renderToHardwareTextureAndroid: true,
    testID: true,
  },
});