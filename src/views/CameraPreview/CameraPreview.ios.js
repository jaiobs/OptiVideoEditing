/**
 * CAMERA PREVIEW CLASS
 */

import {
  AppState,
  DeviceEventEmitter,
  Dimensions,
  NativeModules,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { Component } from "react";
import {
  onPictureTaken,
  orientation,
  saveVideoSegments,
} from "../../actions/cameraPreviewAction";

import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioTrimmer from "../../components/AudioTrimmer/AudioTrimmer";
import CameraActionContainer from "../../components/ViewComponents/CameraActionContainer/CameraActionContainer";
import CameraControls from "../../components/CameraControls/CameraControls";
import CameraSpeedControls from "../../components/CameraSpeedControls/CameraSpeedControls";
import FilterTypes from "../../libs/livefilter/FilterTypes";
import FilterValueAdjuster from "../../components/ViewComponents/FilterValueAdjuster/FilterValueAdjuster";
import GalleryPicker from "../../components/ViewComponents/GalleryPicker/";
import { LitCamPreview } from "../../libs/camerapreview/src/index.ios";
import { Loader } from "../../components/ViewComponents/Loader";
import MainView from "../../components/MainContainer";
import MusicPicker from "../../components/MusicPicker/MusicPicker";
import { Strings } from "../../res";
import TimerComponent from "../../components/ViewComponents/Timer/TimerComponent";
import TimerModalComponent from "../../components/ViewComponents/Timer/TimerModalComponent";
import TouchableFilterChanger from "../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger";
import VideoTimeLineBar from "../../components/VideoTimeLineBar/VideoTimeLineBar";
import { client_id } from "../../actions/MusicActions";
import { connect } from "react-redux";

var stickerActions = NativeModules.TextEmbedder;
var VideoTrimmer = NativeModules.LPPhotoEdit;

var isProcessing = false;

const CameraManager = NativeModules.RNCameraManager;

const flashModeOrder = {
  off: "torch",
  torch: "off",
};

class CameraPreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: "front",
      flash: "off",
      autoFocus: "on",
      whiteBalance: "auto",
      zoom: 0,
      ratio: "16:9",
      depth: 0,
      faces: [],
      progressStatus: 0,
      originValues: [],
      finalValues: [],
      released: true,
      stopAnimation: false,
      interval: 0.0,
      currentFilter: 1,
      width: Dimensions.get("window").width,
      widthAnimation: 0,
      filter: FilterTypes.Normal,
      contrast: 0,
      saturation: 0,
      brightness: 0,
      isShowSlider: false,
      range: 0,
      photoOrientation: "portrait",
      filterRange: 0,
      recordingOptions: {
        mute: false,
        maxDuration: 30,
      },
      isShowVideoPlayer: false,
      filterConfig: {},
      isRecording: false,
      videoPath: "",
      exposure: -1,
      showGalleryPicker: false,
      videoArray: [],
      isVideoProcessing: false,
      progressKey: 0,

      IsShowTrimmerView: false,
      IsPortraitVideo: false,
      IsGalleryMode: false,
      galleryVideoPath: "",
      cropVideoPath: "",
      showSpeedView: false,
      showTimer: false,
      timerCount: null,
      startTimer: false,
      timerType: "photo",
      videoRecorderDuration: 27,
      timerStarted: false,
      showMusicPicker: false,
      intervalExceeded: false,
      selectedTrack: {
        stream_url: "",
        duration: 0,
      },
      showAudioTrimmer: false,
      stopCalled: false,
      isMusicSyncOn: false,
      videoSavedPathsArray: [],
      recordedUrls: [],
      recordedMusicUrls: [],
      isEditMode: false,
      isLiveRecording: false,
      track: null,
      appState: AppState.currentState,
      showBeautyPicker: false,
      beautificationOn: false,
      selectedMusicArray: [],
      refresh: false,
      silhoutteSelected: false,
      silhoutteImage: false,
      IsCameraButtonVisible:false,
      cameraAction:true
    };
    const { navigation } = this.props;
      this.focusListener = navigation.addListener("didFocus", () => {
      this.setState({ isVideoProcessing: false });
      this.HidesCameraButton();
    });
    this.handleLayoutChange = this.handleLayoutChange.bind(this);
    this.toggleFacing = this.toggleFacing.bind(this);
  }

  componentWillMount() {
    console.disableYellowBox = true;
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  HidesCameraButton() {
    AsyncStorage.getItem('HIDE_CAMERA_BUTTON').then((value) => {
      this.setState({
            IsCameraButtonVisible: value === 'true' ? true : false
      });
    });
  }

  unMuteVideoLooper() {
    VideoTrimmer.changeMuteStatus(false, false, (resp) => {
      console.log("Resp",resp)
    });
  }

  muteVideoLooper() {
    VideoTrimmer.changeMuteStatus(true,false,(resp)=>{
            console.log("Resp",resp)
    });
  }

  // changed
  fetchData() {
    const FinalEndData = this.props.navigation.getParam("FinalEndData");
    if (FinalEndData === undefined) {
      this.state.type = "front";
      this.setState({
        type: this.state.type,
      });
    } else {
      this.state.type = FinalEndData;

      this.setState({
        type: this.state.type,
      });
    }
  }

    componentDidMount() {
    this.HidesCameraButton();

    stickerActions.UnLockOrientationInPhotoView((resp) => {
      console.log("Unlocked all orientation");
    });

    this.startCaptureListener = DeviceEventEmitter.addListener(
      "startVideoCapture",
      this.startCaptureEvent
    );
    this.stopCaptureListener = DeviceEventEmitter.addListener(
      "stopVideoCapture",
      this.stopCaptureEvent
    );
    this.doneCaptureListener = DeviceEventEmitter.addListener(
      "doneVideoCapture",
      this.doneCaptureEvent
    );
    this.takePhotoListener = DeviceEventEmitter.addListener(
      "takePhoto",
      this.takePhotoEvent
    );

    this.unmuteVideoPlayerListener = DeviceEventEmitter.addListener(
      "unmuteVideoPlayer",
      this.unmuteEvent
    )

    this.muteVideoPlayerListener = DeviceEventEmitter.addListener(
      "muteVideoPlayer",
      this.muteEvent
    )

    this.onCameraActionListener = DeviceEventEmitter.addListener(
      'onCameraActive',
      this.onCameraActiveEvent,
    );

    AppState.addEventListener("change", this._handleAppStateChange);
    //emit camera preview mount event
    DeviceEventEmitter.emit("onCameraPreviewMount", {});

    //retain the saved video segments on back
    if (this.props.retainVideoSegments.length != 0) {
      let retainData = this.props.retainVideoSegments[0];
      if (retainData.finalValues.length != 0) {
        let lastIntervalValue =
          retainData.finalValues[retainData.finalValues.length - 1];
        this.setState(
          {
            interval: lastIntervalValue.width,
            finalValues: retainData.finalValues,
            videoArray: retainData.videoArray,
            recordedUrls: retainData.recordedUrls,
            recordedMusicUrls: retainData.recordedMusicUrls,
          });
      }
    } else if (this.props.retainVideoSegments.length == 0) {
      this.muteVideoLooper()
      let retainData = this.props.retainVideoSegments[0];
      if (this.isEmpty(retainData)) {
        CameraManager.deleteAllDirectoryUrls();
      }
    }

    this.fetchData();
  }

  startCaptureEvent = (event) => {
    this.startCapture();
  };

  stopCaptureEvent = (event) => {
    this.stopCapture();
  };

  doneCaptureEvent = (event) => {
    this.doneCapture(false);
  };

  takePhotoEvent = (event) => {
    this.takePhoto();
  };

  unmuteEvent = (event) => {
    this.unMuteVideoLooper();
  };

  muteEvent = (event) => {
    this.muteVideoLooper();
  };

  componentWillUnmount() {
    //remove listener
    this.startCaptureListener.remove();
    this.stopCaptureListener.remove();
    this.doneCaptureListener.remove();
    this.takePhotoListener.remove();
    this.focusListener.remove();
    this.onCameraActionListener.remove();
    AppState.removeEventListener("change", this._handleAppStateChange);
    //emit camera preview unmount event
    DeviceEventEmitter.emit("onCameraPreviewUnMount", {});
  }

  onCameraActiveEvent = (cameraAction) => {
    this.setState({cameraAction: cameraAction});
  };

  _handleAppStateChange = (nextAppState) => {
    this.setState({ appState: nextAppState });
  };

  onCompletingCaptureVideo() {
    //check it have more than one video
    var cameraPosition = this.state.type;
    this.setState({ isVideoProcessing: true, isEditMode: false });
    this.setState(
      {
        type: cameraPosition,
        beautificationOn: false,
      },
      () => {
        if (this.state.recordedUrls.length != 0) {
          CameraManager.setAlreadyRecordedVideos(
            this.state.recordedUrls,
            this.state.recordedMusicUrls
          );
        }
        this.camera.mergeVideos((videoData) => {
          this.setState({
            isVideoProcessing: false,
            intervalExceeded: false,
            isLiveRecording: false,
          });
          let width = Number(videoData.videoData.width);
          let height = Number(videoData.videoData.height);
          videoData.Audio = this.state.track;
          let videoRetainDict = {
            videoArray: this.state.videoArray,
            finalValues: this.state.finalValues,
            responseData: videoData,
            recordedUrls: videoData.videoData.recordedUrls,
            recordedMusicUrls: videoData.videoData.recordedMusicUrls,
          };
          if (width < height) {
            this.props.navigation.navigate('PhotoEditor', {
              IsVideoFromCamera:true,
              videoPath: "file://" + videoData.videoData.path,
              responseData: videoData,
              pickedFromGallery: false,
              canMoveNext: false,
              finalPlayer: true,
              orientationLockValue: videoData.videoData.isLandscape,
              onBack: this.onBackCalled,
              isPhotoToVideo: false,
              videoRetainDict: [videoRetainDict],
              cameraType: this.state.type,
            })
           
          } else {
            this.props.navigation.navigate('PhotoEditor', {
              IsVideoFromCamera:true,
              videoPath: "file://" + videoData.videoData.path,
              responseData: videoData,
              pickedFromGallery: false,
              canMoveNext: false,
              finalPlayer: true,
              orientationLockValue: videoData.videoData.isLandscape,
              onBack: this.onBackCalled,
              needCrop: true,
              filterConfig: this.state.filterConfig,
              isPhotoToVideo: false,
              fromCameraView: true,
              videoRetainDict: [videoRetainDict],
              musicArray: videoData.videoData.recordedMusicUrls,
              cameraType: this.state.type,
            })
          }
        });
      }
    );
  }

  onBackCalled = (savedDict, isLandscape, ) => {
    this.props.saveVideoSegments(savedDict);
    this.setState({
      isEditMode: true,
    });
    if (isLandscape) {
      stickerActions.lockOrientationInPhotoView("landscape", (resp) => {
              console.log("landscape")
      });
    } else {
      stickerActions.lockOrientationInPhotoView("portrait", (resp) => {
              console.log("portrait")
      });
    }
  };

  resetState(path) {
    this.setState(
      (prev) => ({
        type: "front",
        flash: "off",
        autoFocus: "on",
        whiteBalance: "auto",
        zoom: 0,
        ratio: "16:9",
        depth: 0,
        faces: [],
        showTimer: false,
        progressStatus: 0,
        originValues: [],
        finalValues: [],
        released: true,
        stopAnimation: false,
        interval: 0,
        currentFilter: 1,
        width: Dimensions.get("window").width,
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
        videoPath: "",
        exposure: -1,
        showGalleryPicker: false,
        videoArray: [],
        isVideoProcessing: false,
        progressKey: prev.progressKey + 1,
        doneCapture: false,
        showSpeedView: false,
        startTimer: false,
        speedModeIndex: 3, // normal speed,
        videoRecorderDuration: 27,
        timerStarted: false,
      }),
  
    );
  }

 

  UNSAFE_componentWillReceiveProps(nextprops) {
    if (nextprops.orientationCheck !== this.props.orientationCheck) {
      this.setState({ width: Dimensions.get("window").width });
    }
  }

  doneCapture(isNeedUpdateVideoArray) {
    if (!isProcessing) {
      this.stopCapture(isNeedUpdateVideoArray);
    }
  }

  startCapture() {
    clearTimeout(this.interval);
    this.interval = setInterval(() => {
      if (this.state.silhoutteSelected) {
        this.setState({
          silhoutteSelected: false,
          silhoutteImage: false,
        });
      }
      var addValue = 0.1
      if (this.state.speedModeIndex == 1) {
        addValue = 0.1 * 3;
      } else if (this.state.speedModeIndex == 2) {
        addValue = 0.1 * 2;
      } else if (
        this.state.speedModeIndex == 3 ||
        this.state.speedModeIndex == undefined
      ) {
        addValue = 0.1;
      } else if (this.state.speedModeIndex == 4) {
        addValue = 0.1 / 2;
      } else if (this.state.speedModeIndex == 5) {
        addValue = 0.1 / 3;
      } else {
        addValue = 0.1;
      }

      this.setState(
        {
          interval: this.state.interval + addValue, //0.36 makes 30 seconds
          released: true,
          stopAnimation: false,
          isRecording: true,
          isLiveRecording: true,
        },
        () => {
          if (this.state.timerStarted) {
            if (
              this.state.interval >= this.state.videoRecorderDuration ||
              this.state.interval >= 27.0
            ) {
              this.setState(
                {
                  timerStarted: false,
                },
                () => {
                  this.cameraActioncontainer.stopToRecordVideo();
                }
              );
            }
          } else {
            console.log(
              "\n -------------------------------------",
              this.state.interval,
              this.state.interval >= 27.0
            );
            if (this.state.interval >= 27.0) {
              this.doneCapture(true);
            }
          }
        }
      );
    }, 100);

    //START CAPTURE VIDEO NATIVE CALL BACK
    if (this.camera) {
      this.camera.startRecording();
      const videoInfo = {
        uri: "video-start",
        startDuration: this.state.interval,
        stopDuration: 0,
      };
      this.setState({
        videoArray: this.state.videoArray.concat(videoInfo),
        stopCalled: false,
      });
    }
  }

  finishVideo() {
    this.setState({
      released: false,
      finalValues: finalValues,
      stopAnimation: true,
      isRecording: false,
    });
  }

  stopCapture(updateVideoArray = true) {
    if (!this.camera) return;

    let finalValues = this.state.finalValues;
    finalValues.push({ width: this.state.interval });

    this.setState({
      released: false,
      finalValues: finalValues,
      stopAnimation: true,
      isRecording: false,
      speedModeIndex: 3,
    });

    if (
      (this.state.interval >= 27.0 && !this.state.intervalExceeded) ||
      (!updateVideoArray && !this.state.intervalExceeded)
    ) {
      this.setState(
        {
          intervalExceeded: true,
        },
        () => {

          this.camera.stopRecording();
          setTimeout(() => {
            this.onCompletingCaptureVideo();
          }, 500);
        }
      );
    } else if (
      this.state.interval < 27 &&
      this.state.interval != 0 &&
      !this.state.stopCalled
    ) {
     
      this.setState(
        {
          stopCalled: true,
        },
        () => {
          this.camera.stopRecording();
        }
      );
    }

    clearInterval(this.interval);
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
        });
    }
  }

  //Toggle Flash Mode
  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
    

    console.log("flash................", this.state.flash);
  }

  //Toggle Camera Facing To Front Or Back
  toggleFacing() {
    this.setState({
      type: this.state.type === "back" ? "front" : "back",
    });
  }

  toggleSpeedView() {
    this.setState({
      showSpeedView: !this.state.showSpeedView,
    });
  }

  toggleTimer() {
    this.setState({
      showTimer: !this.state.showTimer,
      videoRecorderDuration: 27,
    });
  }

  toggleBeautyPicker() {
    setTimeout(() => {
      this.setState(
        {
          showBeautyPicker: !this.state.beautificationOn,
          beautificationOn: !this.state.beautificationOn,
        }
      );
    }, 100);
  }

  /**
   * On video picked from the gallery
   */
  onVideoPickedFromTheGallery(item) {
    this.setState({ showGalleryPicker: false }, () => {
      this.props.navigation.navigate("VideoTrimmer", {
        videos: item,
        filterConfig: {},
      });
    });
  }

  /**
   * on image picked from the gallery
   * @param {*} image
   */
  onImagePickedFromTheGallery(image) {
    if (image.length == 1) {
      this.setState({ showGalleryPicker: false }, () => {
        this.props.navigation.navigate("VideoEditor", {
          videoPath: image[0].node.image.localPath,
          imageDetails: image[0].node.image,
          IsImageMode: true,
        });
      });
    } else {
      this.setState({
        isVideoProcessing: true,
      });
      console.log("collection of photos");
      let imagesArray = Array();

       image.forEach((element) =>{ 
              imagesArray.push(element.node.image.localPath)
        });
      
      CameraManager.multiplePhotoToVideo(imagesArray, (videoData) => {
        this.setState(
          {
            isVideoProcessing: false,
          },
          () => {
            this.setState({ showGalleryPicker: false }, () => {
              this.props.navigation.navigate('PhotoEditor', {
                IsVideoFromCamera:false,
                videoPath: "file://" + videoData.videoData.path,
                responseData: videoData,
                pickedFromGallery: true,
                canMoveNext: false,
                finalPlayer: true,
                orientationLockValue: videoData.videoData.isLandscape,
                onBack: this.onBackCalled,
                isPhotoToVideo: true,
                cameraType: this.state.type,
              })
            
            });
          }
        );
      });
    }
  }

  /**
   * Change filter values
   */
  changeFilterValues(filterValues) {
    const { currentFilter, filter, filterConfig } = filterValues;
    this.setState({ currentFilter, filter, filterConfig });
  }

  /**
   * delete last taken video in the segment
   */
  deleteLastVideo() {
    if (this.state.videoArray.length > 0) {
      if (this.state.isLiveRecording) {
        CameraManager.deleteLastVideoWithURL();
      }
      CameraManager.deleteLastVideo();
      CameraManager.updateSilhoutteMode(false);
      this.setState({
        silhoutteSelected: false,
        silhoutteImage: false,
      });

      const removedItem = this.state.videoArray.pop();
      this.state.finalValues.pop();
      var interval =
        this.state.videoArray.length == 0 ? 0 : removedItem.startDuration;
      this.setState({
        interval: interval,
      });

      if (this.state.videoArray.length == 0) {
        stickerActions.UnLockOrientationInPhotoView((resp) => {
          console.log("Unlocked all orientation after delete");
        });
      }

      if (this.state.recordedUrls.length != 0 && !this.state.isLiveRecording) {
        let currentfile = this.state.recordedUrls.length - 1;
        let videoUrlToDelete = this.state.recordedUrls[0];
        console.log("VIDEO TO DELETE", videoUrlToDelete);
        CameraManager.clearParticularDirectoryURL(
          videoUrlToDelete.videoUrl,
          currentfile
        );
        var array = [...this.state.recordedUrls];
        var array1 = [...this.state.recordedMusicUrls];
        array.splice(0, 1);
        array1.splice(0, 1);
        this.setState(
          {
            recordedUrls: array,
            recordedMusicUrls: array1,
          },
          () => {
            if (this.state.recordedUrls.length == 0) {
              this.props.saveVideoSegments([]);
              stickerActions.UnLockOrientationInPhotoView((resp) => {
                console.log("Unlocked all orientation after delete");
              });
            }
          }
        );
      }
    }
  }

  /**
   * take photo
   */
  takePhoto() {
    if (this.state.videoArray.length > 0) {
      console.log("this is video segment");
    } else {
      console.log("state check beauty", this.state.beautificationOn);
      if (this.state.beautificationOn) {
        // Take photo when the beautification is on
        // capturePhotoWithBeautification
        CameraManager.capturePhotoBeautification((resp) => {
          console.log("photo response entered With beauty", resp);
          this.setState({
            photoOrientation: this.props.orientationCheck,
          });
          let respData = resp;
          respData.tagData = [];
          this.props.onPictureTaken(respData);
          this.props.saveVideoSegments([]);
          this.props.navigation.navigate('PhotoEditor', {
            responseData: respData,
            pickedFromGallery: false,
            imagePath: "file://" + resp.imageData.path,
            videoPath:"",
            orientationLockValue: resp.imageData.isLandscape,
            CameraTypeDataPass: this.state.type, 
            cameraType: this.state.type
        });
        });
      } else {
        this.camera.capturePhoto((resp) => {
          console.log("photo response entered", resp);
          this.setState({
            photoOrientation: this.props.orientationCheck,
          });
          let respData = resp;
          respData.tagData = [];
          this.props.onPictureTaken(respData);
          this.props.saveVideoSegments([]);
          this.props.navigation.navigate('PhotoEditor', {
            responseData: respData,
            pickedFromGallery: false,
            imagePath: "file://" + resp.imageData.path,
            videoPath:"",
            orientationLockValue: resp.imageData.isLandscape,
            CameraTypeDataPass: this.state.type, 
            cameraType: this.state.type
        });

        });
      }
    }
  }


  onTimerFinished() {
    if (this.state.startTimer) {
      if (this.state.timerType == "photo") {
        setTimeout(() => {
          this.setState({ startTimer: false }, () => {
            this.takePhoto();
          });
        }, 100);
      } else {
        setTimeout(() => {
          this.setState(
            {
              startTimer: false,
              timerStarted: true,
            },
            () => {
              this.cameraActioncontainer.timerToRecordVideo();
              this.cameraActioncontainer.props.capturePressed();
            }
          );
        }, 100);
      }
    }
  }

  startingTimer(val, type) {
    this.setState(
      {
        timerCount: 6,
        showTimer: false,
        timerType: type,
      },
      () => {
        if (this.state.timerType == "photo") {
          setTimeout(() => {
            this.setState({
              startTimer: true,
            });
          }, 300);
        } else {
          this.setState(
            {
              timerCount: 6,
              videoRecorderDuration: parseInt(this.state.interval) + val,
            },
            () => {
              setTimeout(() => {
                this.setState({
                  startTimer: true,
                });
              }, 300);
            }
          );
        }
      }
    );
  }

  returnSpeedTypeIOS = (speed) => {
    if (speed == 1) {
      return "Slow 2x";
    } else if (speed == 2) {
      return "Slow 1x";
    } else if (speed == 4) {
      return "Fast 1x";
    } else if (speed == 5) {
      return "Fast 2x";
    } else if (speed == 0) {
      return "Reverse";
    }
  };

  // MUSIC MERGE FUCNTIONALITIES
  toggleMusicPicker = () => {
    setTimeout(() => {
      this.setState({
        showMusicPicker: !this.state.showMusicPicker,
      });
    }, 100);
  };

  onSongSelected = (track) => {
    this.setState(
      {
        showMusicPicker: false,
        track: track,
      },
      () => {
        this.camera.pauseMusicStreaming();
        setTimeout(() => {
          this.setState(
            {
              selectedTrack: track,
            },
            () => {
              setTimeout(() => {
                this.setState({
                  isVideoProcessing: true,
                });
              }, 100);
              this.camera.syncAndDownloadMusicToTrim(
                track.stream_url + "?client_id=" + client_id,
                `${track.id}`,
                track,
                (respData) => {
                  console.log(
                    "RESPONSE OF DOWNLOADED SONG",
                    respData,
                    this.state.showAudioTrimmer
                  );
                  this.setState(
                    {
                      isVideoProcessing: false,
                    },
                    () => {
                      if (this.state.showAudioTrimmer == false) {
                        setTimeout(() => {
                          this.setState({
                            showAudioTrimmer: true,
                            isMusicSyncOn: true,
                          });
                        }, 100);
                      }
                    }
                  );
                }
              );
            }
          );
        }, 300);
      }
    );
  };

  playMusic = (track) => {
    this.camera.playMusicStreaming(
      track.stream_url + "?client_id=" + client_id
    );
  };

  pauseMusic = () => {
    this.camera.pauseMusicStreaming();
  };

  cancelSync = () => {
    this.setState(
      {
        showMusicPicker: false,
        isMusicSyncOn: false,
      },
      () => {
        this.camera.cancelSyncMusic();
      }
    );
  };

    render() {
    return (
      <View style={styles.container}>
        <MainView />
        <GalleryPicker
          width={this.state.width}
          visibility={this.state.showGalleryPicker}
          rowItems={this.props.orientationCheck === "landscape" ? 5 : 3}
          orientation={this.props.orientationCheck}
          onVideoSelected={(item) => {
            this.onVideoPickedFromTheGallery(item);
          }}
          onPictureSelected={(image) => {
            this.onImagePickedFromTheGallery(image);
          }}
          onClosePressed={() => this.setState({ showGalleryPicker: false })}
        />

        {!this.state.IsGalleryMode &&
          this.props.orientationCheck == "landscape" && (
            <VideoTimeLineBar
              orientation={this.props.orientationCheck}
              width={this.state.width}
              height={5}
              value={this.state.interval}
              maxValue={27}
              interval={this.state.finalValues}
            />
          )}

        <LitCamPreview
          style={
            this.props.orientationCheck === "landscape"
              ? LandscapeStyles.cameraStyle
              : styles.cameraStyle
          }
          ref={(ref) => (this.camera = ref)}
          type={this.state.type}
          flashMode={this.state.flash}
          zoom={this.state.zoom}
          isEditMode={this.state.isEditMode}
          isMusicAdded={this.state.isMusicSyncOn}
          musicURL={
            this.state.selectedTrack.stream_url + "?client_id=" + client_id
          }
          filterConfig={this.state.filterConfig}
          whiteBalance={this.state.whiteBalance}
          ratio={this.state.ratio}
          focusDepth={this.state.depth}
          filter={this.state.filter}
          cameraAction={this.state.cameraAction}
          silHoutteMode={this.state.silhoutteImage}
          orientation={this.props.orientationCheck}
          androidCameraPermissionOptions={Strings.android_camera_permission}
          androidRecordAudioPermissionOptions={Strings.android_audio_permission}
        />

        {!this.state.IsGalleryMode &&
          this.props.orientationCheck == "portrait" && (
            <VideoTimeLineBar
              orientation={this.props.orientationCheck}
              width={this.state.width}
              height={5}
              value={this.state.interval}
              maxValue={27}
              interval={this.state.finalValues}
            />
          )}

        {!this.state.isRecording &&
          !this.state.isShowVideoPlayer &&
          !this.state.showMusicPicker && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                alignItems: "center",
                marginTop: this.props.orientationCheck === "portrait" ? 20 : 15,
                backgroundColor: "transparent",
              }}
            >
            <Text style={
                styles.TextTapStyles    
            }>
              tap screen for filters
              </Text>
            
              <Text
              style={
                styles.TextFilterStyles
              }>
                {this.state.filter.name == "NORMAL"
                  ? ""
                  : this.state.filter.name}
            </Text>
            
            </View>
          )}

        {this.props.orientationCheck == "landscape" &&
          !this.state.showMusicPicker && (
            <View
              style={{
                alignSelf: "center",
                position: "absolute",
                zIndex: 999,
                bottom: 5,
                height: 100,
              }}
            >
              <CameraSpeedControls
                visibility={!this.state.isRecording}
                orientation={this.props.orientationCheck}
                speedMode={this.state.speedModeIndex}
                showSpeedView={this.state.showSpeedView}
                speedDidChange={(speed) => {
                  console.log(speed);
                  this.setState({
                    showSpeedView: false,
                    speedModeIndex: speed,
                  });
                  CameraManager.speedLevel(speed);
                }}
              />
            </View>
          )}
        {this.props.orientationCheck == "portrait" && (
          <View
            style={{
              position: "absolute",
              bottom: 160,
              width: "100%",
              alignItems: "center",
              marginTop: this.props.orientationCheck === "portrait" ? 40 : 15,
            }}
          >
            {this.state.speedModeIndex != 3 &&
              this.state.showSpeedView == false && (
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 12 }}
                >
                  {this.returnSpeedTypeIOS(this.state.speedModeIndex)}
                </Text>
              )}
          </View>
        )}
        {!this.state.isRecording &&
          !this.state.isShowVideoPlayer &&
          !this.state.showMusicPicker && (
            <CameraControls
              preVideo={this.state.IsGalleryMode}
              orientation={this.props.orientationCheck}
              showCross={this.state.isShowVideoPlayer}
              canShowAdjustmentIcon={this.state.currentFilter != 1}
              showAdjustments={() =>
                this.setState((p) => ({ isShowSlider: !p.isShowSlider }))
              }
              isBeautyApplied={this.state.beautificationOn}
              enableBeautyOption={
                this.state.filter.type == "NORMAL" ||
                this.state.filter.type == "BEAUTY"
              }
              toggleFlash={() => this.toggleFlash()}
              toggleFacing={() => this.toggleFacing()}
              toggleBeautyMode={() => this.toggleBeautyPicker()}
              flash={this.state.flash != "off"}
            />
          )}

        <TouchableFilterChanger
          orientation={this.props.orientationCheck}
          interval={this.state.interval}
          onFilterValuesChanged={(filterValues) =>
            this.changeFilterValues(filterValues)
          }
        />

        {!this.state.IsGalleryMode && !this.state.showMusicPicker && (
          <CameraActionContainer
            isVisible={this.state.IsCameraButtonVisible}
            ref={(refs) => (this.cameraActioncontainer = refs)}
            flash={this.state.flash}
            type={this.state.type}
            controlVisibility={!this.state.isRecording}
            disableButton={this.state.timerStarted}
            galleryPickerVisibility={this.state.interval == 0}
            isRecording={this.state.isRecording}
            orientation={this.props.orientationCheck}
            showSpeedView={this.state.showSpeedView}
            speedMode={this.state.speedModeIndex}
            silhoutteSelected={this.state.silhoutteSelected}
            onPressSilhoutteMode={() => {
              this.setState(
                {
                  silhoutteSelected: !this.state.silhoutteSelected,
                },
                () => {
                  console.log(
                    "RECORDED URLS >>>",
                    this.state.recordedUrls,
                    this.state.selectedTrack.id
                  );
                  if (this.state.silhoutteSelected) {
                    CameraManager.embedSilhoutte(
                      this.state.recordedUrls,
                      (respImg) => {
                        console.log("SILHOUTE LAST FRAME IMAGE", respImg);
                        this.setState({
                          silhoutteImage: true,
                        });
                      }
                    );
                  }
                }
              );
            }}
            capturePressed={() => {
              this.startCapture();
            }}
            captureReleased={() => {
              this.stopCapture();
            }}
            capturePhoto={() => {
              if (this.state.videoArray.length > 0) {
                console.log("CapturePhoto")
              } else {
                this.takePhoto();
              }
            }}
            onVideoFinishPressed={() => {
              this.onCompletingCaptureVideo();
            }}
            onDeleteLastVideoPressed={() => {
              this.deleteLastVideo();
            }}
            onGalleryPickerPressed={() => {
              this.setState({ showGalleryPicker: true });
            }}
            onVideoModeChanged={(speed) => {
              console.log(speed);
              this.setState({
                showSpeedView: false,
                speedModeIndex: speed,
              });
              CameraManager.speedLevel(speed);
            }}
          />
        )}

        <TouchableFilterChanger
          orientation={this.props.orientationCheck}
          interval={this.state.interval}
          onFilterValuesChanged={(filterValues) =>
            this.changeFilterValues(filterValues)
          }
        />
        {!this.state.isRecording &&
          !this.state.isShowVideoPlayer &&
          !this.state.showMusicPicker && (
            <CameraControls
              preVideo={this.state.IsGalleryMode}
              orientation={this.props.orientationCheck}
              showCross={this.state.isShowVideoPlayer}
              canShowAdjustmentIcon={this.state.currentFilter != 1}
              showAdjustments={() =>
                this.setState((p) => ({ isShowSlider: !p.isShowSlider }))
              }
              isBeautyApplied={this.state.beautificationOn}
              enableBeautyOption={
                this.state.filter.type == "NORMAL" ||
                this.state.filter.type == "BEAUTY"
              }
              showTimer={() => this.toggleTimer()}
              toggleFlash={() => this.toggleFlash()}
              toggleFacing={() => this.toggleFacing()}
              toggleSpeedView={() => {
                this.toggleSpeedView();
              }}
              isShowSpeedView={this.state.showSpeedView}
              toggleBeautyMode={() => this.toggleBeautyPicker()}
              toggleMusicPicker={() => {
                this.toggleMusicPicker();
              }}
              flash={this.state.flash != "off"}
            />
          )}

        {this.state.isRecording &&
          !this.state.isShowVideoPlayer &&
          this.props.orientationCheck == "landscape" && (
            <View
              style={{
                left: 0,
                alignSelf: "flex-start",
                position: "absolute",
                backgroundColor: "black",
                height: "100%",
                width: 90,
                zIndex: 1,
                paddingLeft: 20,
                paddingRight: 4,
                marginTop: 10,
                marginBottom: 10,
              }}
            />
          )}

        <FilterValueAdjuster
          orientation={this.props.orientationCheck}
          isShowSlider={this.state.isShowSlider}
          filter={this.state.filter}
          onClosePressed={() => this.setState({ isShowSlider: false })}
          updateFilterValues={(filterVal) => {
            this.setState({ filter: filterVal });
          }}
        />

        <Loader visibility={this.state.isVideoProcessing} />

        <TimerModalComponent
          visibility={this.state.showTimer}
          orientation={this.props.orientationCheck}
          onTimerFinished={
            this.state.videoRecorderDuration == parseInt(this.state.interval)
          }
          onBackdropPress={() => {
            this.setState({
              showTimer: false,
            });
          }}
          onModalWillHide={(startPressed, val, type) => {
            if (startPressed) {
              this.startingTimer(val, type);
            }
          }}
          onStartTimer={() => {
            this.setState({
              showTimer: false,
            });
          }}
          maxTimerValue={30 - parseInt(this.state.interval)}
        />

        <TimerComponent
          onTimerFinished={() => this.onTimerFinished()}
          visibility={this.state.startTimer}
          orientation={this.props.orientationCheck}
          count={this.state.timerCount}
          onCancel={() => {
            setTimeout(() => {
              this.setState({ startTimer: false, showTimer: false });
            }, 100);
          }}
        />

        <MusicPicker
          visible={this.state.showMusicPicker}
          orientation={this.props.orientationCheck}
          onClosePressed={() => {
            this.pauseMusic();
            this.toggleMusicPicker();
          }}
          onSongSelected={(track) => {
            this.onSongSelected(track);
          }}
          isSyncOn={this.state.isMusicSyncOn}
          onCancelSyncPressed={() => {
            this.pauseMusic();
            this.cancelSync();
          }}
          playMusic={(track) => {
            this.playMusic(track);
          }}
          pauseMusic={() => {
            this.pauseMusic();
          }}
        />

        <AudioTrimmer
          visibility={this.state.showAudioTrimmer}
          dataItem={this.state.selectedTrack}
          orientation={this.props.orientationCheck}
          onBackdropPress={() => {
            this.setState({
              showAudioTrimmer: false,
            });
          }}
          onModalWillHide={(startPressed, endPressed) => {
            if (startPressed) {
              this.setState({
                isVideoProcessing: false,
              });
              this.camera.stopMusic();
            }
            if (endPressed) {
              this.setState({
                isVideoProcessing: false,
              });
              this.cancelSync();
            }
            this.camera.stopMusic();
          }}
          getTrimmedStartValue={(value) => {
            this.setState(
              {
                isMusicSyncOn: true,
              },
              () => {
                this.camera.playAndSeekSong(
                  this.state.selectedTrack.stream_url +
                    "?client_id=" +
                    client_id,
                  value
                );
              }
            );
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { orientationCheck, retainVideoSegments } = state.CameraPreviewReducer;
  return {
    orientationCheck,
    retainVideoSegments,
  };
};

export default connect(mapStateToProps, {
  orientation,
  onPictureTaken,
  saveVideoSegments,
})(CameraPreview);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraStyle: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    marginTop: 10,
    alignSelf: "center",
  },
  control_camera_capture: {
    flexDirection: "row",
    width: "100%",
    flex: 1,
  },
  close_icon: { height: 25, width: 25, margin: 10, marginTop: 5 },
  crop_icon: {
    height: 35,
    width: 35,
    margin: 10,
    marginLeft: 20,
    marginTop: 0,
  },
  TextTapStyles: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    fontSize: 15,
     marginTop: 2, 
  },
   TextFilterStyles: {  
    fontWeight: "bold",
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    marginTop: 2,
  },
   
});

const LandscapeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraStyle: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 10,
    alignSelf: "center",
  },
  control_camera_capture: {
    position: "absolute",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "flex-end",
  },
  imageIcon: { height: 32, width: 32, margin: 10 },
  
  
  shadowTextFilter: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
  },

   TextTapStyles: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    fontSize: 15,
     marginTop: 2, 
   },
   
   TextFilterStyles: {  
    fontWeight: "bold",
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    marginTop: 2,
  },
  
});
