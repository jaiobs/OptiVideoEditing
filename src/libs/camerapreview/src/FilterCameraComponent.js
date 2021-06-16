import React, { Component } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  requireNativeComponent,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  findNodeHandle,
  Platform
} from "react-native";

const LiveCameraPreview = requireNativeComponent("CameraPreviewFilter");
const CameraManager = NativeModules.LiveCameraManagerModule 
const eventEmitter = new NativeEventEmitter(CameraManager);

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

export default class FilterCameraComponent extends Component {

  _cameraRef: ?Object;
  _cameraHandle: ?number;
  
  constructor(props) {
    super(props);
    this.state = {
      isCanComponentMount: false,
      isCameraAuthorized: false,
      isAuthorizationChecked: false
    };
  }

  async componentDidMount() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus
    } = await this.arePermissionsGranted();

    this.setState({
      isCameraAuthorized: hasCameraPermissions,
      isAuthorizationChecked: true,
      recordAudioPermissionStatus
    });
  }

  async arePermissionsGranted() {
    const {
      androidCameraPermissionOptions,
      androidRecordAudioPermissionOptions
    } = this.props;

    let cameraPermissions = androidCameraPermissionOptions;
    let audioPermissions = androidRecordAudioPermissionOptions;

    const {
      hasCameraPermissions,
      hasRecordAudioPermissions
    } = await this.requestPermissions(cameraPermissions, audioPermissions);

    const recordAudioPermissionStatus = hasRecordAudioPermissions
      ? RecordAudioPermissionStatusEnum.AUTHORIZED
      : RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;
    return { hasCameraPermissions, recordAudioPermissionStatus };
  }

  startRecording(recordingOptions,callback){
    CameraManager.startRecording(recordingOptions, this._cameraHandle , callback);
  }

  stopRecording(){
    CameraManager.stopRecording(this._cameraHandle);
  }

  pauseRecording(){
    CameraManager.pauseRecording(this._cameraHandle);
  }

  addVideoRecordListener(callback){
    eventEmitter.addListener('EventVideoRecord', (data) => {
      callback(data);
    })
  }

  async requestPermissions(
    androidCameraPermissionOptions: Rationale,
    androidRecordAudioPermissionOptions: Rationale
  ) {
    let hasCameraPermissions = false;
    let hasRecordAudioPermissions = false;

    if (Platform.OS === "android") {
      const cameraPermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        androidCameraPermissionOptions
      );
      if (typeof cameraPermissionResult === "boolean") {
        hasCameraPermissions = cameraPermissionResult;
      } else {
        hasCameraPermissions =
          cameraPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    if (Platform.OS === "android") {
      const audioPermissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        androidRecordAudioPermissionOptions
      );
      if (typeof audioPermissionResult === "boolean") {
        hasRecordAudioPermissions = audioPermissionResult;
      } else {
        hasRecordAudioPermissions =
          audioPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    return {
      hasCameraPermissions,
      hasRecordAudioPermissions
    };
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
        {this.state.isCameraAuthorized && <LiveCameraPreview {...this.props} ref={this._setReference}/>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position:'absolute',
    width:'100%',
    height:'100%'
  },
  authorizationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  notAuthorizedText: {
    textAlign: "center",
    fontSize: 16
  }
});
