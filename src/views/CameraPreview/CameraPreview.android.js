/**
 * CAMERA PREVIEW CLASS FOR ANDROID
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  DeviceEventEmitter,
  Modal,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import MainView from '../../components/MainContainer';
import {
  orientation,
  backPressVideo,
  flashAction,
  switchCameraAction,
} from '../../actions/cameraPreviewAction';
import FilterTypes from '../../libs/livefilter/FilterTypes';
import {
  concatVideo,
  convertImagesToVideo,
  applyVideoSpeed,
  compressVideo,
} from '../../libs/ffmpeg';
import TimerComponent from '../../components/ViewComponents/Timer/TimerComponent';
import GalleryPicker from '../../components/ViewComponents/GalleryPicker/';
import FilterValueAdjuster from '../../components/ViewComponents/FilterValueAdjuster/FilterValueAdjuster';
import TouchableFilterChanger from '../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger';
import VideoTimeLineBar from '../../components/VideoTimeLineBar/VideoTimeLineBar';
import CameraActionContainer from '../../components/ViewComponents/CameraActionContainer/CameraActionContainer.android';
import {Loader} from '../../components/ViewComponents/Loader';
import {CameraSpeedControlsLandscape} from '../../components/CameraSpeedControls';
import TimerModalComponent from '../../components/ViewComponents/Timer/TimerModalComponent.android';
import BeautificationComponent from '../../components/ViewComponents/BeautificationComponent/BeautificationComponent';
import {CameraPreviewComponent, AudioTrimmer} from '../../libs/litpic_sdk';
import MusicPicker from '../Music/MusicPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  copyFilesToCache,
  copyImagesToCache,
} from '../../libs/ffmpeg/FFMPEGProcess';

var isProcessing = false;
const timerThreshold = 0.25;
var timerValueUpdater = 0.25;

var IsCameraButtonVisible = false;

class CameraPreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: 'FRONT',
      flash: false,
      autoFocus: 'on',
      zoom: 0,
      ratio: '16:9',
      depth: 0,
      faces: [],
      progressStatus: 0,
      originValues: [],
      finalValues: [],
      released: true,
      stopAnimation: false,
      interval: 0,
      currentFilter: 1,
      width: Dimensions.get('window').width,
      widthAnimation: 0,
      filter: FilterTypes.Normal,
      contrast: 0,
      saturation: 0,
      brightness: 0,
      isShowSlider: false,
      range: 0,
      filterRange: 0,
      recordingOptions: {
        mute: false,
        maxDuration: 30,
      },
      isShowVideoPlayer: false,
      filterConfig: {},
      isRecording: false,
      videoPath: '',
      whiteBalance: 0,
      exposure: -1,
      showGalleryPicker: false,
      videoArray: [],
      isVideoProcessing: false,
      progressKey: 0,
      showTimer: false,
      playBackSpeed: 'normal',
      showCountDown: false,
      timerCount: 5,
      currentSelectedTrack: null,
      currentTrack: null,
      stopTimerValue: 0,
      autoCapture: false,
      previewCance: true,
      autoCaptureStop: 0,
      speedVisible: false,
      compress: {},
      showBeautificationPicker: false,
      reset_filter: false,
      switchCamera: false,
      flashShow: false,
      cameraAction: true,
    };
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.setState({isVideoProcessing: false});
      this.hidesCameraButton();
    });
    this.handleLayoutChange = this.handleLayoutChange.bind(this);
  }

  componentWillMount() {
    console.disableYellowBox = true;
  }

  componentDidMount() {
    this.hidesCameraButton();
    this.updateState();
    this.startCaptureListener = DeviceEventEmitter.addListener(
      'startVideoCapture',
      this.startCaptureEvent,
    );
    this.stopCaptureListener = DeviceEventEmitter.addListener(
      'stopVideoCapture',
      this.stopCaptureEvent,
    );
    this.doneCaptureListener = DeviceEventEmitter.addListener(
      'doneVideoCapture',
      this.doneCaptureEvent,
    );
    this.takePhotoListener = DeviceEventEmitter.addListener(
      'takePhoto',
      this.takePhotoEvent,
    );

    this.onCameraActionListener = DeviceEventEmitter.addListener(
      'onCameraActive',
      this.CameraActiveEvent,
    );

    //emit camera preview mount event
    DeviceEventEmitter.emit('onCameraPreviewMount', {});
  }

  updateState() {
    const {switchCameraDetails, flashDetails} = this.props;
    // update flash status
    if (flashDetails) {
      this.setState({flash: !this.state.flash});
    }
    if (switchCameraDetails) {
      this.setState({switchCamera: !this.state.switchCamera});
    }
    //back press in update video details
    if (
      Object.keys(this.props.backPressVideoDetails).length !== 0 &&
      this.props.backPressVideoDetails.interval < 30
    ) {
      this.setState({
        videoArray: this.props.backPressVideoDetails.videoArray,
        interval: this.props.backPressVideoDetails.interval,
        finalValues: this.props.backPressVideoDetails.finalValues,
      });
    } else {
      this.props.backPressVideo({});
    }
  }

  hidesCameraButton() {
    AsyncStorage.getItem('HIDE_CAMERA_BUTTON').then(function (value) {
      if (value === 'true') {
        IsCameraButtonVisible = false;
      } else {
        IsCameraButtonVisible = true;
      }
    });
  }

  releaseNativeListeners(){
    if(this.cameraPreview){
      this.cameraPreview.releaseListeners();
    }
  }

  startCaptureEvent = () => {
    this.startCapture();
  };

  stopCaptureEvent = () => {
    this.stopCapture();
  };

  doneCaptureEvent = () => {
    this.doneCapture(false);
  };

  takePhotoEvent = () => {
    this.takePhoto();
  };

  componentWillUnmount() {
    //remove listener
    this.startCaptureListener.remove();
    this.stopCaptureListener.remove();
    this.doneCaptureListener.remove();
    this.takePhotoListener.remove();
    this.focusListener.remove();
    this.onCameraActionListener.remove();
    //emit camera preview unmount event
    DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
  }

  onCompletingCaptureVideo() {
    this.setState({isVideoProcessing: true});

    var back_press_video = {
      videoArray: this.state.videoArray,
      interval: this.state.interval,
      finalValues: this.state.finalValues,
    };

    this.props.backPressVideo(back_press_video);

    concatVideo(this.state.videoArray, (resp) => {
      isProcessing = false;
      this.resetState();
      this.moveVideoToPlayer(resp);
    });
  }

  resetState() {
    this.setState((prev) => ({
      type: 'FRONT',
      flash: false,
      autoFocus: 'on',
      zoom: 0,
      ratio: '16:9',
      depth: 0,
      faces: [],
      progressStatus: 0,
      originValues: [],
      finalValues: [],
      released: true,
      stopAnimation: false,
      interval: 0,
      currentFilter: 1,
      width: Dimensions.get('window').width,
      widthAnimation: 0,
      filter: FilterTypes.Normal,
      contrast: 0,
      saturation: 0,
      brightness: 0,
      isShowSlider: false,
      range: 0,
      filterRange: 0,
      recordingOptions: {
        mute: false,
        maxDuration: 30,
      },
      isShowVideoPlayer: false,
      filterConfig: {},
      isRecording: false,
      videoPath: '',
      whiteBalance: 0,
      exposure: -1,
      showGalleryPicker: false,
      videoArray: [],
      isVideoProcessing: false,
      progressKey: prev.progressKey + 1,
      doneCapture: false,
      showTimer: false,
      playBackSpeed: 'normal',
      showMusicPicker: false,
    }));
  }

  // compressing the video
  compress(respVideo) {
    compressVideo(respVideo.videoPath, (resp) => {
      isProcessing = false;
      this.resetState();
      this.moveVideoToPlayer(resp);
    });
  }

  moveVideoToPlayer(resp) {
    this.releaseNativeListeners();
    this.props.navigation.navigate('VideoEditor', {
      videoPath: resp.videoPath,
      videoDetails: {},
      canMoveNext: false,
      finalPlayer: true,
    });
  }

  UNSAFE_componentWillReceiveProps(nextprops) {
    if (nextprops.orientationCheck !== this.props.orientationCheck) {
      this.setState({width: Dimensions.get('window').width});
    }
  }

  CameraActiveEvent = (cameraAction) => {
    this.setState({cameraAction: cameraAction});
  };

  startCapture() {
    //lock orientation
    if (this.state.videoArray.length === 0) {
      this.cameraPreview.lockOrientation(
        this.props.orientationCheck === 'portrait',
      );
    }
    //START CAPTURE VIDEO
    this.cameraPreview.startRecording();
  }

  stopCapture() {
    if (this.state.autoCapture) {
      this.setState(
        {
          released: false,
          stopAnimation: true,
          autoCapture: false,
        },
        () => {
          this.cameraPreview.stopRecording();
        },
      );
    } else {
      this.cameraPreview.stopRecording();

      let finalValues = this.state.finalValues;
      finalValues.push({width: this.state.interval});

      this.setState({
        released: false,
        finalValues: finalValues,
        stopAnimation: true,
        autoCapture: false,
      });

      clearInterval(this.interval);
    }
  }

  handleLayoutChange(event, widthAnimation) {
    if (this.state.released) {
      let values = this.state.originValues;
      values.push(event.nativeEvent.layout);
      this.setState(
        {
          originValues: values,
          released: false,
          widthAnimation: widthAnimation,
        },
        () => {},
      );
    }
  }

  //Toggle Flash Mode
  toggleFlash() {
    if (this.cameraPreview) {
      this.setState({flash: !this.state.flash});
      this.props.flashAction(this.state.flash);
    }
  }

  //Toggle Camera Facing To Front Or Back
  toggleFacing() {
    if (this.cameraPreview) {
      this.setState({switchCamera: !this.state.switchCamera}, () => {
        this.props.switchCameraAction(this.state.switchCamera);
      });
    }
  }

  /**
   * On video picked from the gallery
   */
  onVideoPickedFromTheGallery(files) {
    this.removeVideoBackPress();
    this.releaseNativeListeners();
    if(Platform.Version >= 29){
      this.setState({showGalleryPicker: false, isVideoProcessing: true});
      copyFilesToCache(files, (resp) => {
        this.setState({isVideoProcessing: false}, () => {
          this.props.navigation.navigate('VideoTrimmer', {
            videoFiles: resp,
            filterConfig: {},
          });
        });
      });
    } else {
      this.setState({showGalleryPicker: false}, () => {
        this.props.navigation.navigate('VideoTrimmer', {
          videoFiles: files,
          filterConfig: {},
        });
      });
    }
  }

  /**
   * on image picked from the gallery
   * @param {*} image
   */
  onImagePickedFromTheGallery(image) {
    this.removeVideoBackPress();
    this.releaseNativeListeners();
    this.setState({showGalleryPicker: false, isVideoProcessing: true}, () => {
      this.props.navigation.navigate('PhotoPreview', {
        imagePath: image.node.image.item.imagePath,
        imageDetails: image.node.image.item,
        finalPreview: false,
      });
    });
  }

  onMultipleImageSelectionGallery(multipleImage) {
    this.removeVideoBackPress();
    this.setState({showGalleryPicker: false, isVideoProcessing: true});
    if (Platform.Version >= 29) {
      copyImagesToCache(multipleImage, (resp) => {
        this.convertImagesToVideo(resp);
      });
    } else {
      this.convertImagesToVideo(multipleImage);
    }
  }

  convertImagesToVideo(multipleImages) {
    convertImagesToVideo(multipleImages, (resp) => {
      this.setState({isVideoProcessing: false});
      this.moveVideoToPlayer(resp);
    });
  }

  /**
   * Change filter values
   */
  changeFilterValues(filterValues) {
    const {currentFilter, filter, filterConfig} = filterValues;
    this.setState({currentFilter, filter, filterConfig});
    this.changeFilter(filter);
  }

  // /**
  //  * delete last taken video in the segment
  //  */
  deleteLastVideo() {
    try {
      if (this.state.videoArray.length > 0) {
        var lastVideoItem = this.state.videoArray[
          this.state.videoArray.length - 1
        ];
        this.setState({
          videoArray: this.state.videoArray.filter(
            (item) => item !== lastVideoItem,
          ),
        });
        this.state.finalValues.pop();
        var interval =
          this.state.videoArray.length === 0 ? 0 : lastVideoItem.startDuration;
        this.setState({
          interval: interval,
        });

        //check for releasing orientation
        if (this.state.videoArray.length === 0) {
          this.cameraPreview.releaseOrientation();
          this.removeVideoBackPress();
        }
        this.cameraPreview.removeLastSegmentVideo();
      }
    } catch (e) {
      console.log('cont delete item');
    }
  }

  /**
   * take photo
   */
  takePhoto() {
    if (this.state.videoArray.length === 0 && this.state.interval === 0) {
      if (!this.state.switchCamera && this.state.flash) {
        this.setState({flashShow: true});
      }
      this.cameraPreview.capturePhoto();
    }
  }

  /**
   * enable and disable beauty mode
   */
  toggleBeautyMode() {
    this.setState({
      showBeautificationPicker: !this.state.showBeautificationPicker,
    });
  }

  /**
   * on timer ends
   */
  onTimerFinished() {
    this.setState({showCountDown: false, autoCapture: true}, () => {
      if (this.state.timerMode === 'photo') {
        this.takePhoto();
      } else {
        this.startCapture();
      }
    });
  }

  onCancel() {
    this.setState({showCountDown: false, autoCapture: true});
  }

  /**
   * show countdown timer
   */
  showContDownTimer() {
    this.setState({showTimer: true, stopTimerValue: 0});
  }

  changeFilter(filterVal) {
    this.cameraPreview.changeFilter(filterVal);
    this.setState({filter: filterVal});
  }
  /**
  removing the video in back press to
  gallery picker and photo preview screen
  */
  removeVideoBackPress() {
    this.props.backPressVideo({});
  }

  onVideoFinishNext() {
    isProcessing = true;
    this.onCompletingCaptureVideo();
  }

  onImageCaptured(imageData) {
    this.setState({flashShow: false});
    this.removeVideoBackPress();
    this.releaseNativeListeners();
    this.props.navigation.navigate('PhotoEditorView', {
      imagePath: imageData.imagePath,
      imageDetails: imageData,
      finalPreview: false,
    });
  }

  onVideoCaptureStop(videoData) {
    clearInterval(this.interval);
  }

  onVideoCaptureStart(videoData) {
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.setState(
        {
          interval: this.state.interval + timerValueUpdater,
          released: true,
          stopAnimation: false,
          isRecording: true,
        },
        () => {
          if (
            this.state.interval >= 30 ||
            (this.state.autoCapture &&
              this.state.autoCaptureStop > 0 &&
              this.state.interval >= this.state.stopTimerValue)
          ) {
            this.stopCapture();
          }
        },
      );
    }, 250);
  }

  onVideoCaptureEnd(videoData) {
    applyVideoSpeed(
      this.state.playBackSpeed,
      videoData.videoPath,
      videoData.audioPath,
      videoData.audioStartPosition,
      videoData.audioEndPosition,
    );

    const lastVideoItem = this.state.videoArray[
      this.state.videoArray.length - 1
    ];

    //get last video item
    if (lastVideoItem) {
      const videoInfo = {
        uri: videoData.videoPath,
        startDuration: lastVideoItem.stopDuration,
        stopDuration: this.state.interval,
      };
      this.setState({
        videoArray: this.state.videoArray.concat(videoInfo),
      });
    } else {
      const videoInfo = {
        uri: videoData.videoPath,
        startDuration: 0,
        stopDuration: this.state.interval,
      };
      this.setState({videoArray: this.state.videoArray.concat(videoInfo)});
    }

    if (this.state.interval >= 30) {
      if (!isProcessing) {
        this.onCompletingCaptureVideo();
      }
    } else if (this.state.autoCaptureStop > 0) {
      this.stopVideoCapture();
    }
    if (this.state.videoArray.length > 0) {
      this.cameraPreview.lockOrientation();
    }
    this.updateTimerValue('normal');

    this.setState({isRecording: false});
  }

  onTimerStartPressed(count, mode) {
    this.setState({
      autoCaptureStop: count,
      showTimer: false,
      timerMode: mode,
      showCountDown: true,
      autoCapture: mode === 'video',
      stopTimerValue: this.state.interval + count,
    });
  }

  onShadowImagePressed() {
    const lastVideoItem = this.state.videoArray[
      this.state.videoArray.length - 1
    ];
    if (lastVideoItem) {
      this.cameraPreview.shadowImage(lastVideoItem.uri);
    }
  }

  onMusicPickerOnClosePressed() {
    this.toggleMusicPlayerVisibility();
  }

  toggleMusicPlayerVisibility() {
    this.setState({showMusicPicker: !this.state.showMusicPicker});
  }

  onSongSelected(track) {
    this.setState({currentSelectedTrack: track});
    this.toggleMusicPlayerVisibility();
  }

  onAudioTrimmingCompleted(audioPath) {
    this.setState({isVideoProcessing: false});
    if (this.cameraPreview != null) {
      this.cameraPreview.setAudioPath(audioPath);
    }
    this.setState({
      currentSelectedTrack: null,
      currentTrack: audioPath,
    });
  }

  stopVideoCapture() {
    if (!this.state.isVideoProcessing) {
      this.stopCapture();
    }
  }

  onCancelSyncPress() {
    this.setState({currentSelectedTrack: null, currentTrack: null});
    this.cameraPreview.setAudioPath('');
  }

  updateSpeedValue(speed) {
    console.log('speed is changed', speed);
    this.cameraPreview.setSpeedValue(speed);
    this.setState({playBackSpeed: speed});
    this.updateTimerValue(speed);
  }

  updateTimerValue(speed) {
    if (speed === 'slow1') {
      timerValueUpdater = timerThreshold * 1.5;
    } else if (speed === 'slow2') {
      timerValueUpdater = timerThreshold * 2.0;
    } else if (speed === 'fast1') {
      timerValueUpdater = timerThreshold * 0.75;
    } else if (speed === 'fast2') {
      timerValueUpdater = timerThreshold * 0.5;
    } else {
      timerValueUpdater = timerThreshold * 1;
    }
  }

  showOrHideLoader(showLoader) {
    this.setState({isVideoProcessing: showLoader});
  }

  CameraButtonVisible() {
    DeviceEventEmitter.emit('onCameraPreviewMount', {});
  }

  resetFilter() {
    this.setState({
      currentFilter: 1,
      filter: FilterTypes.Normal,
      filterConfig: {},
      reset_filter: true,
    });
  }
  clearFilter = (item) => {
    this.setState({reset_filter: item});
  };

  render() {
    return (
      <View style={styles.container}>
        <MainView />

        <GalleryPicker
          width={this.state.width}
          visibility={this.state.showGalleryPicker}
          rowItems={this.props.orientationCheck === 'landscape' ? 4 : 3}
          orientation={this.props.orientationCheck}
          onPictureSelected={(image) => {
            this.onImagePickedFromTheGallery(image);
          }}
          onMultiplePictureSelected={(multipleImage) => {
            this.onMultipleImageSelectionGallery(multipleImage);
          }}
          onDonePressed={(videoFiles) => {
            this.onVideoPickedFromTheGallery(videoFiles);
          }}
          onClosePressed={() => this.setState({showGalleryPicker: false})}
        />
        <View>
          <Text
            style={[
              styles.indicator,
              {
                fontSize: this.props.orientationCheck == 'portrait' ? 8 : 7,
                paddingTop: this.props.orientationCheck === 'portrait' ? 10 : 7,
              },
            ]}>
            15s
          </Text>
        </View>
        <VideoTimeLineBar
          orientation={this.props.orientationCheck}
          width={this.state.width}
          height={5}
          value={this.state.interval}
          maxValue={30}
          interval={this.state.finalValues}
        />

        <CameraPreviewComponent
          style={
            this.props.orientationCheck === 'landscape'
              ? LandscapeStyles.cameraStyle
              : styles.cameraStyle
          }
          ref={(ref) => (this.cameraPreview = ref)}
          onImageCaptured={(imageData) => this.onImageCaptured(imageData)}
          onVideoCaptureStart={(videoData) =>
            this.onVideoCaptureStart(videoData)
          }
          onVideoCaptureStop={(videoData) =>
            this.onVideoCaptureStop(videoData)
          }
          onVideoCaptureEnd={(videoData) => this.onVideoCaptureEnd(videoData)}
          onEventResetFilter={() => this.resetFilter()}
          flashOn={this.state.flash}
          switchCamera={this.props.switchCameraDetails}
          cameraAction={this.state.cameraAction}
          loaderState={this.state.isVideoProcessing}
          pickerState={this.state.showMusicPicker || this.state.showGalleryPicker}
        />

        <TouchableFilterChanger
          orientation={this.props.orientationCheck}
          reset_filter={this.state.reset_filter}
          interval={this.state.interval}
          clearFilter={(item) => this.clearFilter(item)}
          onFilterValuesChanged={(filterValues) =>
            this.changeFilterValues(filterValues)
          }
        />

        {!this.state.isRecording && !this.state.isShowVideoPlayer && (
          <View
            style={[
              styles.filter_view,
              {
                marginTop: this.props.orientationCheck === 'portrait' ? 40 : 15,
              },
            ]}>
            <Text style={styles.filter_text}>tap screen for filters</Text>
            <Text style={styles.filter_name}>{this.state.filter.name}</Text>
          </View>
        )}

        <CameraActionContainer
          ref={(ref) => (this.cameraActionContainerRef = ref)}
          controlVisibility={!this.state.isRecording}
          galleryPickerVisibility={this.state.videoArray.length === 0}
          doneCaptureVisibility={this.state.interval > 1}
          isRecording={this.state.isRecording}
          HidesCameraButton={IsCameraButtonVisible}
          orientation={this.props.orientationCheck}
          playBackSpeed={this.state.playBackSpeed}
          hideSilhouteIcon={this.state.videoArray.length === 0}
          capturePressed={() => {
            this.startCapture();
          }}
          captureReleased={() => {
            this.stopVideoCapture();
          }}
          capturePhoto={() => {
            this.takePhoto();
          }}
          onVideoFinishPressed={() => {
            this.onVideoFinishNext();
          }}
          onDeleteLastVideoPressed={() => {
            this.deleteLastVideo();
          }}
          onGalleryPickerPressed={() => {
            this.setState({showGalleryPicker: true});
          }}
          updatePlaybackSpeed={(speed) => {
            this.updateSpeedValue(speed);
          }}
          onShadowImagePressed={() => {
            this.onShadowImagePressed();
          }}
        />

        <FilterValueAdjuster
          orientation={this.props.orientationCheck}
          isShowSlider={this.state.isShowSlider}
          filter={this.state.filter}
          onClosePressed={() => this.setState({isShowSlider: false})}
          updateFilterValues={(filterVal) => {
            this.changeFilter(filterVal);
          }}
        />

        {!this.state.isRecording && !this.state.isShowVideoPlayer && (
          <CameraSpeedControlsLandscape
            updatePlaybackSpeed={(speed) => {
              this.updateSpeedValue(speed);
            }}
            orientation={this.props.orientationCheck}
            showCross={this.state.isShowVideoPlayer}
            canShowAdjustmentIcon={this.state.currentFilter !== 1}
            showAdjustments={() =>
              this.setState((p) => ({isShowSlider: !p.isShowSlider}))
            }
            toggleFlash={() => this.toggleFlash()}
            toggleFacing={() => this.toggleFacing()}
            toggleBeautyMode={() => this.toggleBeautyMode()}
            showTimer={() => this.showContDownTimer()}
            toggleMusic={() => this.toggleMusicPlayerVisibility()}
            flash={this.state.flash}
            speedVisible={this.state.speedVisible}
          />
        )}

        <Loader visibility={this.state.isVideoProcessing} />

        <BeautificationComponent
          visibility={this.state.showBeautificationPicker}
          orientation={this.props.orientationCheck}
          onBackdropPress={() => {
            this.setState({showBeautificationPicker: false});
          }}
          maxTimerValue={this.state.interval}
        />
        <TimerComponent
          onTimerFinished={() => this.onTimerFinished()}
          visibility={this.state.showCountDown}
          count={this.state.timerCount}
          onCancel={() => this.onCancel()}
        />

        <TimerModalComponent
          visibility={this.state.showTimer}
          orientation={this.props.orientationCheck}
          maxTimerValue={this.state.interval}
          onModalWillHide={(count, mode) =>
            this.onTimerStartPressed(count, mode)
          }
          onBackdropPress={() => {
            this.setState({showTimer: false});
          }}
        />

        <MusicPicker
          visible={this.state.showMusicPicker}
          onClosePressed={() => this.onMusicPickerOnClosePressed()}
          onSongSelected={(track) => this.onSongSelected(track)}
          isCancelSyncShow={this.state.currentTrack != null}
          cancelSync={() => {
            this.onCancelSyncPress();
          }}
        />

        {this.state.currentSelectedTrack != null && (
          <AudioTrimmer
            title={this.state.currentSelectedTrack.title}
            avatar={this.state.currentSelectedTrack.artwork_url}
            trackUrl={this.state.currentSelectedTrack.stream_url}
            author={this.state.currentSelectedTrack.user.username}
            style={styles.audio_trimer}
            onStartPressed={(aud) => {
              console.log('STARTED');
              this.setState({currentSelectedTrack: null});
              this.CameraButtonVisible();
            }}
            onExitPressed={(aud) => {
              console.log('EXITPRESSED');
              this.setState({currentSelectedTrack: null});
              this.CameraButtonVisible();
            }}
            onTrimmingCompleted={(aud) => {
              console.log('COMPLETED', aud);
              this.onAudioTrimmingCompleted(aud.audioPath);
              this.CameraButtonVisible();
            }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
          />
        )}

        <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.flashShow}>
          <View style={styles.flashShow} />
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    orientationCheck,
    backPressVideoDetails,
    flashDetails,
    switchCameraDetails,
  } = state.CameraPreviewReducer;
  return {
    orientationCheck,
    backPressVideoDetails,
    flashDetails,
    switchCameraDetails,
  };
};

export default connect(mapStateToProps, {
  orientation,
  backPressVideo,
  flashAction,
  switchCameraAction,
})(CameraPreview);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraStyle: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    marginTop: 30,
    alignSelf: 'center',
  },
  indicator: {
    color: 'white',
    position: 'absolute',
    alignSelf: 'center',

    paddingRight: 5,
    zIndex: 1,
  },
  filter_name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 0},
    textShadowRadius: 10,
  },
  filter_text: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 0},
    textShadowRadius: 10,
  },
  audio_trimer: {
    flex: 1,
    width: '100%',
    height: 280,
  },
  filter_view: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  control_camera_capture: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
});

const LandscapeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginTop: 10,
    alignSelf: 'center',
  },
  control_camera_capture: {
    position: 'absolute',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'flex-end',
  },
  flashShow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});
