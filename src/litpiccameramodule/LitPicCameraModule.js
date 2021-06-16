import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';
import Navigator from '../navigation/initialRoute';
import {Provider} from 'react-redux';
import {configStore} from '../configs/configStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

var lastImageTaken = {};
var lastVideoTaken = {};

const CameraManager = NativeModules.RNCameraManager;

export default class LitPicCameraModule extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if(prevProps.cameraActive != this.props.cameraActive){
      DeviceEventEmitter.emit('onCameraActive', this.props.cameraActive);
    }
  }

  componentWillMount() {
    //set BASEURL and authToken
    AsyncStorage.setItem('BASE_URL', this.props.baseURL);
    AsyncStorage.setItem('AUTH_TOKEN', this.props.authToken);
    AsyncStorage.setItem(
      'HIDE_CAMERA_BUTTON',
      JSON.stringify(this.props.hideCameraButton),
    );

    //bind image and video taken listener
    configStore.subscribe(() => {
      var state = configStore.getState();
      const {retainVideoSegments} = state.CameraPreviewReducer;
      //   //if (lastImageTaken != onPictureTaken && !this.isEmpty(onPictureTaken)) {
      //     if(onPictureTaken && !this.isEmpty(onPictureTaken)){
      //       console.log('ON_PICTURE_TAKEN', onPictureTaken);
      //       lastImageTaken = onPictureTaken;
      //       this.props.OnPictureComplete(onPictureTaken);
      //     }
      //   //}

      //   if (onVideoTaken && !this.isEmpty(onVideoTaken)) {
      //     console.log('ON_VIDEO_TAKEN', onVideoTaken);
      //     lastVideoTaken = onVideoTaken;
      //     this.props.OnVideoComplete(onVideoTaken);
      //   }

      if (retainVideoSegments && !this.isEmpty(retainVideoSegments)) {
        console.log('RETAIN VIDEO SEGMENTS', retainVideoSegments);
        let retainData = retainVideoSegments[0];
        if (retainData.recordedUrls.length != 0) {
          CameraManager.setCurrentFileIndexForFileSave(
            retainData.recordedUrls.length,
          );
          //CameraManager.setAlreadyRecordedVideos(retainData.recordedUrls,retainData.recordedMusicUrls)
        }
      }
    });
    //bind camera event listener
    this.onImageTakenListener = DeviceEventEmitter.addListener(
      'onPictureTaken',
      this.onImageTaken,
    );

    this.onVideoTakenListener = DeviceEventEmitter.addListener(
      'onVideoTaken',
      this.onVideoTaken,
    );

    this.onCameraMountListener = DeviceEventEmitter.addListener(
      'onCameraPreviewMount',
      this.cameraPrevMount,
    );
    this.onCameraUnMountListener = DeviceEventEmitter.addListener(
      'onCameraPreviewUnMount',
      this.cameraPrevUnMount,
    );
    
  }

  componentWillUnmount() {
    //remove listeners
    this.onCameraMountListener.remove();
    this.onCameraUnMountListener.remove();
    this.onImageTakenListener.remove();
    this.onVideoTakenListener.remove();
  }

  /**
   * return current taken image
   * @param {*} imagedata
   */
  onImageTaken = (imageData) => {
    this.props.OnPictureComplete(imageData);
    console.log(
      'LitpicCamaraModule --> onImageTaken -->onPictureTaken',
      JSON.stringify(imageData),
    );
  };

  /**
   * return current taken video
   * @param {*} videoData
   */
  onVideoTaken = (videData) => {
    this.props.OnVideoComplete(videData);
    console.log(
      'LitpicCamaraModule --> onVideoTaken -->onVideoTaken',
      JSON.stringify(videData),
    );
  };

  /**
   * return last taken image
   * @param {*} callBack
   */
  getLastTakenImage(callBack) {
    callBack(lastImageTaken);
  }

  /**
   * return last taken video
   * @param {*} callBack
   */
  getLastTakenVideo(callBack) {
    callBack(lastVideoTaken);
  }

  /**
   * reset camera preview
   */
  resetCameraPreview() {
    if (this.nav && this.nav._navigation) {
      this.nav._navigation.navigate('CameraPreview');
    }
  }

  /**
   * start camera capture
   */
  startCapture() {
    DeviceEventEmitter.emit('startVideoCapture', {});
  }

  /**
   * stop video capture
   */
  stopCapture() {
    DeviceEventEmitter.emit('stopVideoCapture', {});
  }

  /**
   * done video capture
   */
  doneCapture() {
    DeviceEventEmitter.emit('doneVideoCapture', {});
  }

  /**
   * take picture
   */
  takePhoto() {
    DeviceEventEmitter.emit('takePhoto', {});
  }

  /**
   * UNMUTE VIDEO PLAYER
   */
  unMuteVideoLooper() {
    DeviceEventEmitter.emit('unmuteVideoPlayer', {});
  }

  /**
   * MUTE VIDEO PLAYER
   */
   muteVideoLooper() {
    DeviceEventEmitter.emit('muteVideoPlayer', {});
  }

  /**
   * Open Camera
   */
  openCamera() {
    CameraManager.openCamera()
  }

  /**
   * close Camera
   */
  closeCamera() {
    CameraManager.closeCamera()
  }

  /**
   * emit on camera preview mount
   */
  cameraPrevMount = (event) => {
    this.props.onCameraPreviewMount();
  };

  /**
   * emit on camera preview unmount
   */
  cameraPrevUnMount = (event) => {
    this.props.onCameraPreviewUnMount();
  };

  render() {
    console.log('MODULE HEAD FILE', this.props.baseURL, this.props.authToken);

    return (
      <Provider store={configStore}>
        <SafeAreaView ref="rootView" style={styles.container}>
          <Navigator ref={(ref) => (this.nav = ref)} />
        </SafeAreaView>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
