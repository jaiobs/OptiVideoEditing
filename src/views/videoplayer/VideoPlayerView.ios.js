/**
 * Video player screen
 * created by vigneshwaran.n@optisolbusiness.com
 * last edited: 24/12/19
 */

import {
  Alert,
  Animated,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  requireNativeComponent,
} from 'react-native';
import {Colors, Images} from '../../res';
import React, {Component} from 'react';

import AudioTrimmer from '../../components/AudioTrimmer/AudioTrimmer';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import ColorPalette from '../../components/ViewComponents/ColorPalleteView/ColorPalleteView';
import DraggableTextView from '../../components/ViewComponents/DraggableTextView/DraggableTextView';
import FastImage from '@stevenmasini/react-native-fast-image';
import FontsList from '../../components/FontsList/FontsList';
import {Loader} from '../../components/ViewComponents/Loader';
import MainView from '../../components/MainContainer';
import MusicPicker from '../../components/MusicPicker/MusicPicker';
import ScrollPlayer from '../ScrollPlayer/ScrollPlayerView';
import SpeedView from '../SpeedView/SpeedView';
import StickerPicker from '../../components/StickerPicker/StickerPicker';
import TagDragView from '../../components/TagUsersList/TagDragView';
import TagUserPicker from '../../components/TagUsersList/TagUserPicker';
import {client_id} from '../../actions/MusicActions';
import {connect} from 'react-redux';
import {createImageProgress} from 'react-native-image-progress';
import {saveVideoSegments} from '../../actions/cameraPreviewAction';

const FImage = createImageProgress(FastImage);
const AnimatedFastImage = Animated.createAnimatedComponent(FImage);

const VideoEditorView = requireNativeComponent('VideoEditor', null);

var VideoTrimmer = NativeModules.VideoEditor;
var stickerActions = NativeModules.TextEmbedder;
const CameraManager = NativeModules.RNCameraManager;
const {width, height} = Dimensions.get('window');

var PORTRAITDATA = [
  {
    icon: Images.save_icon,
    title: 'Save Video',
  },
  {
    icon: Images.text_icon,
    title: 'Text',
  },
  {
    icon: Images.sticker_icon,
    title: 'Sticker',
  },
  {
    icon: Images.tag_icon,
    title: 'Tag',
  },

  {
    icon: Images.slowmotion_icon,
    title: 'Slomo',
  },

  {
    icon: Images.music_icon,
    title: 'Music',
  },
];

const DATA = [
  {
    icon: Images.save_icon,
    title: 'Save Video',
  },
  {
    icon: Images.text_icon,
    title: 'Text',
  },
  {
    icon: Images.sticker_icon,
    title: 'Sticker',
  },
  {
    icon: Images.tag_icon,
    title: 'Tag',
  },

  {
    icon: Images.slowmotion_icon,
    title: 'Slomo',
  },

  {
    icon: Images.music_icon,
    title: 'Music',
  },

  {
    icon: Images.tilt_icon,
    title: 'Tilt',
  },

  {
    icon: Images.tilt_preview,
    title: 'Preview',
  },
];

let txtHeight = 32;
let txtwidth = 32;
let initialTextXPos = 0;
let initialTextYPos = 0;
let showDelete = false;
let textArray = new Array();
let tagArray = new Array();
let textDict = {
  textValue: '',
  textFont: 'Verdana-Bold',
  textBg: 'transparent',
  textColor: 'white',
  textAlign: 'center',
  textSize: 24,
  scale: 0,
  rotation: 0,
  totalTranslateX: 0,
  totalTranslateY: 0,
  width: txtwidth,
  height: txtHeight,
  xcoordinate: initialTextXPos,
  ycoordinate: initialTextYPos,
};
let doneEditingText = false;
let doneStickerEdits = false;
let markerText = '';
let deleteIndex = 0;
let emitResponse = false;

class VideoPlayerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      IsVideoFromCamera: props.navigation.getParam('fromCameraView', false),
      responseData: props.navigation.getParam('responseData', null),
      needCrop: props.navigation.getParam('needCrop', false),
      filter: props.navigation.getParam('filter', {}),
      videoPath: props.navigation.getParam('videoPath', null),
      orientationLock: props.navigation.getParam('orientationLockValue', false),
      isCanMoveNext: props.navigation.getParam('canMoveNext', true),
      finalPlayer: props.navigation.getParam('finalPlayer', false),
      musicArray: props.navigation.getParam('musicArray', []),
      isStickerAdded: false,
      toggleSticker: false,
      isVisibleTextView: false,
      markerText: '',
      backgroundColorText: 'transparent',
      opacityText: 1,
      textAlign: 'center',
      txtColor: 'white',
      isKeyboardDismissed: true,
      shortHeight: 0,
      normalHeight: Dimensions.get('window').height,
      keyboardHeight: 0,
      keyboardOpen: false,
      selectedColor: '#FFFFFF',
      bgLevel: 0,
      textSelectedFont: 'Verdana-Bold',
      alignImageChange: Images.para_centericon,
      doneEditingText: false,
      showDelete: true,
      textImage: Images.text_border_icon,
      opacity: new Animated.Value(1),
      scaledValueText: 0,
      rotatedValueText: 0,
      fontsArray: [
        {
          title: 'Verdana',
          value: 'Verdana-Bold',
        },
        {
          title: 'Palatino',
          value: 'Palatino',
        },
        {
          title: 'Menlo',
          value: 'Menlo-Italic',
        },
        {
          title: 'Snell Roundhand',
          value: 'SnellRoundhand-Bold',
        },
        {
          title: 'ChalkboardSE',
          value: 'ChalkboardSE-Bold',
        },
        {
          title: 'Bradley Han',
          value: 'BradleyHandITCTT-Bold',
        },
        {
          title: 'Helvetica',
          value: 'Helvetica',
        },
      ],
      showMusicPicker: false,
      showTagList: false,
      isTagged: false,
      showTagPicker: false,
      itemDrag: {
        locx: 0,
        locy: 0,
      },
      isfixTags: false,
      isMusicSyncOn: false,
      selectedTrack: '',
      showAudioTrimmer: false,
      startTrimmerTime: 0.0,
      isVideoProcessing: false,
      musicUrlPath: '',
      IsTiltEnable: false,
      IsTiltPreview: false,
      IsSpeedEnable: false,
      deleteOpacity: 0.0,
      isMusicProcessing: false,
      isSavedOrProceeded: false,
      mergedVideoFilePath: '',
      savedTextArrays: [],
      savedPath: null,
      audioData: null,
      isPhotoToVideo: props.navigation.getParam('isPhotoToVideo', false),
    };
    this.scaledValue = 0;
    this.rotatedValue = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.onNext = this.onNext.bind(this);
    this.updateComponent = this.updateComponent.bind(this);
    this.saveVideoLocal = this.saveVideoLocal.bind(this);
    this.optionSelected = this.optionSelected.bind(this);
    this.renderItem = this.renderItem.bind(this);

    console.log(this.state.IsVideoFromCamera);
  }

  componentDidMount() {
    if (this.state.orientationLock) {
      stickerActions.lockOrientationInPhotoView('landscape', (resp) => {
        console.log('OK landscape');
      });
    } else {
      stickerActions.lockOrientationInPhotoView('portrait', (resp) => {
        console.log('OK portrait');
      });
    }
    tagArray = new Array();
    this.setState({
      deleteOpacity: 0,
    });
    if (this.state.isPhotoToVideo) {
      PORTRAITDATA = [
        {
          icon: Images.savearrow_icon,
          title: 'Save Video',
        },
        {
          icon: Images.text_icon,
          title: 'Text',
        },
        {
          icon: Images.sticker_icon,
          title: 'Sticker',
        },
        {
          icon: Images.tag_icon,
          title: 'Tag',
        },
        {
          icon: Images.music_icon,
          title: 'Music',
        },
      ];
    } else {
      PORTRAITDATA = [
        {
          icon: Images.savearrow_icon,
          title: 'Save Video',
        },
        {
          icon: Images.text_icon,
          title: 'Text',
        },
        {
          icon: Images.sticker_icon,
          title: 'Sticker',
        },
        {
          icon: Images.tag_icon,
          title: 'Tag',
        },
        {
          icon: Images.slowmotion_icon,
          title: 'Slomo',
        },
        {
          icon: Images.music_icon,
          title: 'Music',
        },
      ];
    }
    
    const myModuleEvt = new NativeEventEmitter(NativeModules.CommonEmittor);
    myModuleEvt.addListener('CommonEmittorEvent', ({action, videoPath}) => {
      if (action == 'videoMerged') {
        this.setState({
          isMusicProcessing: false,
          mergedVideoFilePath: videoPath,
        });
      }
    });
  }

  componentWillMount() {
    
    this.keyboardWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardWillShow,
    );
    this.keyboardWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide,
    );
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }
  //Keyboard listener function calls
  keyboardWillShow = (e) => {
    this.setState(
      {
        isKeyboardDismissed: false,
        keyboardOpen: true,
        keyboardHeight: e.endCoordinates.height,
        normalHeight: Dimensions.get('window').height,
        shortHeight: Dimensions.get('window').height - e.endCoordinates.height,
      }
    );
   
  };

  keyboardWillHide = (e) => {
    this.setState(
      {
        isKeyboardDismissed: true,
        isVisibleTextView: false,
        keyboardOpen: false,
        keyboardHeight: e.endCoordinates.height,
        normalHeight: Dimensions.get('window').height,
        shortHeight: Dimensions.get('window').height - e.endCoordinates.height,
      }
    );
    doneEditingText = true;

  };

  updateComponent = (response) => {
  
    this.setState({
      videoPath: response.video,
      isCanMoveNext: false,
      finalPlayer: true,
    });
  };

  onNext() {
    let taggedData = new Array();

    tagArray.forEach((element) => {
       if (!element.isDeleted) {
        let dict = {
          userid: element.userData.id,
          image: element.userData.profile_pic,
          image_path: this.state.videoPath[0],
          x: element.xcoordinate + element.totalTranslateX,
          y: element.ycoordinate + element.totalTranslateY,
        };
        taggedData.push(dict);
      }
    });
  
     VideoTrimmer.getCropVideo(0, (response) => {
      console.log('-------------------finalvideo-----------');
      console.log(response);
      response.tagData = taggedData;
      response.audioData = this.state.responseData.Audio;
      VideoTrimmer.isMusicSynced(true)
      if (this.state.savedPath != null) {
        response.videoData.path = this.state.savedPath;
      }

      var filtered = this.state.musicArray.filter(function (el) {
        return el != '';
      });

      if (emitResponse == true) {
        emitResponse = false;
        response.audioData = filtered;
        DeviceEventEmitter.emit('onVideoTaken', response);
        DeviceEventEmitter.emit('onCameraPreviewMount', {});
      } 
    });
  }

  getVideoDetails(videoPath) {
    let taggedData = new Array();
    tagArray.forEach((element) => {
      if (!element.isDeleted) {
        let dict = {
          userid: element.userData.id,
          image: element.userData.profile_pic,
          image_path: this.state.videoPath[0],
          x: element.xcoordinate + element.totalTranslateX,
          y: element.ycoordinate + element.totalTranslateY,
        };
         taggedData.push(dict);
      }
    });

  }

  onClosePressed() {
    stickerActions.UnLockOrientationInPhotoView((resp) => {});
    if (this.state.showAudioTrimmer || this.state.IsTiltEnable) {
      this.setState(
        {
          showAudioTrimmer: false,
          IsTiltEnable: false,
        },
        () => {
          CameraManager.syncExit();
        },
      );
    }
    if (this.state.showTagList) {
      this.setState({
        showTagList: false,
        isTagged: false,
      });

   tagArray.forEach((element) => {
        if (!element.isFixed) {
          tagArray.splice(index, 1);
        }
    });

    } else {
      stickerActions.UnLockOrientationInPhotoView((resp));
      if (this.state.isVisibleTextView) {
        this.setState({
          isVisibleTextView: false,
        });
      } else {
        textArray = new Array();
        this.revertBackEdits();
        if (!this.state.isSavedOrProceeded) {
          if (this.props.navigation.getParam('videoRetainDict') != null) {
            this.props.navigation.state.params.onBack(
              this.props.navigation.getParam('videoRetainDict'),
              this.state.orientationLock,
            );
          }
        }
        this.props.navigation.goBack(null);
        if (this.state.IsVideoFromCamera) {
          DeviceEventEmitter.emit('onCameraPreviewMount', {});
        } else {
          DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
        }
      }
    }
  }

  saveVideoLocal = () => {
    if (doneEditingText || textArray.length != 0) {
      if (this.state.savedTextArrays.length != 0) {
        this.setState({
          savedTextArrays: [...this.state.savedTextArrays, ...textArray],
        });
      } else {
        this.setState({
          savedTextArrays: textArray,
        });
      }
      this.setState({
        isVideoProcessing: true,
      });

      doneEditingText = false;
      VideoTrimmer.saveVideoWithTextStickerOverlay(
        this.state.savedTextArrays,
        (resp) => {
          textArray = new Array();
          this.setState(
            {
              isVideoProcessing: false,
            },
            () => {
              //textArray = new Array()
              if (doneEditingText) {
                doneEditingText = false;
              }
              if (doneStickerEdits) {
                doneStickerEdits = false;
              }
            },
          );
          console.log('RESPONSE OF VIDEO SAVED', resp);
          let stringResp = resp.video;
          stringResp = stringResp.replace('file://', '');
          this.setState({
            savedPath: [stringResp],
          });

          if (emitResponse == true) {
            this.onNext();
          } else {
            Alert.alert(
              'Video Saved Successfully.',
              '',
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          }
        },
      );
    } else {
      this.setState(
        {
          isVideoProcessing: false,
        });
      VideoTrimmer.saveVideo(0, (response) => {
        if (emitResponse == true) {
          this.onNext();
        } else {
          Alert.alert(
            'Video Saved Successfully.',
            '',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        }
      });
    }
  };

  visibleTextView() {
    this.setState(
      {
        isVisibleTextView: true,
        opacity: new Animated.Value(1),
        deleteOpacity: 0,
      },
      () => {
        (doneEditingText = true) && (showDelete = false);
        this.txtInput.focus();
      },
    );
  }

  textBackgroundChange() {
    if (this.state.bgLevel == 0) {
      //changed to 1
      this.setState({
        bgLevel: 1,
        backgroundColorText: this.state.selectedColor,
        opacityText: 1.0,
        textImage: Images.text_withBg_icon,
        txtColor: this.state.selectedColor == '#FFFFFF' ? 'black' : 'white',
      });
    } else if (this.state.bgLevel == 1) {
      // changed to 2
      this.setState({
        bgLevel: 2,
        backgroundColorText: this.state.selectedColor + '85',
        textImage: Images.text_withOpacity_icon,
        opacityText: 1.0,
        txtColor: this.state.selectedColor == '#FFFFFF85' ? 'black' : 'white',
      });
    } else {
      this.setState(
        {
          bgLevel: 0,
          backgroundColorText: 'transparent',
          textImage: Images.text_border_icon,
          opacityText: 1.0,
          txtColor: this.state.selectedColor,
        });
    }
  }

  textAlignChange() {
    if (this.state.textAlign == 'center') {
      this.setState({
        textAlign: 'left',
        alignImageChange: Images.para_lefticon,
      });
    } else if (this.state.textAlign == 'left') {
      this.setState({
        textAlign: 'right',
        alignImageChange: Images.para_righticon,
      });
    } else {
      this.setState({
        textAlign: 'center',
        alignImageChange: Images.para_centericon,
      });
    }
  }

  revertBackEdits = () => {
    this.setState(
      {
        isVisibleTextView: false,
        markerText: '',
        selectedColor: '#FFFFFF',
        bgLevel: 0,
        textImage: Images.text_border_icon,
        alignImageChange: Images.para_centericon,
        backgroundColorText: 'transparent',
        deleteOpacity: 0,
      },
      () => {
        this.txtHeight = 40;
        this.txtwidth = 0;
        initialTextXPos = 0;
        initialTextYPos = 0;
        showDelete = false;
      
      },
    );
  };

  clearData = () => {
    this.setState(
      {
        markerText: '',
        selectedColor: '#FFFFFF',
        bgLevel: 0,
        textAlign: 'center',
        txtColor: 'white',
        textSelectedFont: 'Verdana-Bold',
        textImage: Images.text_border_icon,
        alignImageChange: Images.para_centericon,
        backgroundColorText: 'transparent',
        deleteOpacity: 0.0,
      },
      () => {
        this.txtHeight = 40;
        this.txtwidth = 0;
        initialTextXPos = 0;
        initialTextYPos = 0;
        this.scaledValue = 0;
        this.rotatedValue = 0;
        // this.setState({
        showDelete = false;
        // this.deleteBtn.setOpacityTo(0.0)
        // })
      },
    );
  };

  addTextObjects() {
    console.log('ADDED OBJECTS', this.state.orientationLock);
    textDict = {
      textValue: this.state.markerText,
      textFont: this.state.textSelectedFont,
      textBg: this.state.backgroundColorText,
      textColor:
        this.state.backgroundColorText != 'white' &&
        this.state.backgroundColorText != '#FFFFFF'
          ? this.state.txtColor
          : '#000000',
      textAlign: this.state.textAlign,
      textSize: 24,
      scale: 0,
      rotation: 0,
      isSticker: false,
      width: txtwidth,
      height: txtHeight,
      xcoordinate:
        this.state.orientationLock == false
          ? width < height
            ? width / 2 - txtwidth / 2
            : height / 2 - txtHeight
          : width < height
          ? height / 2 - txtHeight
          : width / 2 - txtwidth / 2,
      ycoordinate:
        this.state.orientationLock == false
          ? width < height
            ? height / 2 - txtHeight
            : width / 2 - txtwidth / 2
          : width < height
          ? width / 2 - txtwidth / 2
          : height / 2 - txtHeight,
      totalTranslateX: 0,
      orientation:
        this.state.orientationLock == false ? 'portrait' : 'landscape',
      totalTranslateY: 0,
      translateX: 0,
      translateY: 0,
      isEdit: false,
      isDeleted: false,
      bgLevel: this.state.bgLevel - 1,
      opacity: new Animated.Value(1),
      shakeAnimation: new Animated.Value(0),
    };
    if (this.state.isEditing) {
      let itemSelectedToEdit = textArray[this.state.selectedIndex];
      textDict.scale = itemSelectedToEdit.scale;
      textDict.isEdit = false;
      textDict.rotation = itemSelectedToEdit.rotation;
      textDict.xcoordinate = itemSelectedToEdit.xcoordinate;
      textDict.ycoordinate = itemSelectedToEdit.ycoordinate;
      textDict.totalTranslateX = itemSelectedToEdit.totalTranslateX;
      textDict.totalTranslateY = itemSelectedToEdit.totalTranslateY;
      textDict.translateX = itemSelectedToEdit.translateX;
      textDict.translateY = itemSelectedToEdit.translateY;
      textArray[this.state.selectedIndex] = textDict;
      this.setState({
        isEditing: false,
        selectedIndex: 0,
      });
    } else {
      textArray.push(textDict);
    }
    this.clearData();
  }

  onSelectingText(txtObject) {
    this.setState(
      {
        markerText: txtObject.textValue,
        textAlign: txtObject.textAlign,
        txtColor: txtObject.textColor,
        textSelectedFont: txtObject.textFont,
        backgroundColorText: txtObject.textBg,
        selectedColor:
          txtObject.textBg.length == 9
            ? txtObject.textBg.substring(0, 5)
            : txtObject.textBg == 'transparent'
            ? txtObject.textColor
            : txtObject.textBg,
        isVisibleTextView: true,
        bgLevel: txtObject.bgLevel,
        deleteOpacity: 0.0,
      },
      () => {
        this.txtHeight = txtObject.height;
        this.txtwidth = txtObject.width;
        initialTextXPos = txtObject.xcoordinate;
        initialTextYPos = txtObject.ycoordinate;
        showDelete = false;
        this.textBackgroundChange();
        
      },
    );
  }

  renderTextDraggable(item, index) {
    if (!item.isDeleted) {
      return (
        <DraggableTextView
          labelStyles={{
            flex: 1,
            minHeight: 30,
            paddingTop: 15,
            padding: 5,
            fontSize: 21,
            fontFamily: item.textFont,
            backgroundColor: item.textBg,
            borderRadius: 10,
            alignSelf: 'center',
            textAlign: item.textAlign,
            color: item.textColor,
          }}
          labelText={item.textValue}
          dataItem={item}
          orientationValue={
            this.state.orientationLock ? 'landscape' : 'portrait'
          }
          textWidth={item.width}
          textHeight={item.height}
          scaleValue={item.scale}
          rotationValue={item.rotation}
          translateXVal={item.translateX}
          translateYVal={item.translateY}
          totalTranslateX={item.totalTranslateX}
          totalTranslateY={item.totalTranslateY}
          xCoordinate={item.xcoordinate}
          yCoordinate={item.ycoordinate}
          isSticker={item.isSticker}
          onRotate={(rotationValue) => {
            let itemSpecific = textArray[index];
            itemSpecific.rotation = rotationValue;
            textArray[index] = itemSpecific;
          }}
          onScale={(scaledValue) => {
            this.scaledValue = scaledValue;
            let itemSpecific = textArray[index];
            itemSpecific.scale = scaledValue;
            textArray[index] = itemSpecific;
          }}
          onOpacityAnimateComplete={() => {
            if (this.deleteBtn) {
              let itemSpecific = textArray[index];
              itemSpecific.isDeleted = true;
              textArray[index] = itemSpecific;
            }
          }}
          onDrag={(offset, totalOffset) => {
            let itemSpecific = textArray[index];
            itemSpecific.translateX = offset.translationX;
            itemSpecific.translateY = offset.translationY;
            itemSpecific.totalTranslateX = totalOffset.x;
            itemSpecific.totalTranslateY = totalOffset.y;
    
            textArray[index] = itemSpecific;
            if (showDelete) {
              showDelete = false;
              this.setState({
                deleteOpacity: 0,
              });
           
            }
          }}
          onDragBeganState={(offset) => {
            if (showDelete == false) {
              showDelete = true;
              this.setState({
                deleteOpacity: 1,
              });
      
            }
          }}
          onLongPress={() => {
            let itemSpecific = textArray[index];
            itemSpecific.isEdit = true;
            textArray[index] = itemSpecific;
            this.onSelectingText(textArray[index]);
            this.setState(
              {
                isEditing: true,
                selectedIndex: index,
              },
              () => {
                this.txtInput.focus();
              },
            );
            doneEditingText = false;
          }}
        />
      );
    }
  }

  renderStickerDraggable(item, index) {
    if (!item.isDeleted) {
      return (
        <DraggableTextView
          dataItem={item}
          orientationValue={
            this.state.orientationLock ? 'landscape' : 'portrait'
          }
          textWidth={item.width}
          textHeight={item.height}
          scaleValue={item.scale}
          rotationValue={item.rotation}
          isSticker={item.isSticker}
          translateXVal={item.translateX}
          translateYVal={item.translateY}
          totalTranslateX={item.totalTranslateX}
          totalTranslateY={item.totalTranslateY}
          xCoordinate={item.xcoordinate}
          yCoordinate={item.ycoordinate}
          onRotate={(rotationValue) => {
            let itemSpecific = textArray[index];
            itemSpecific.rotation = rotationValue;
            textArray[index] = itemSpecific;
          }}
          onScale={(scaledValue) => {
            this.scaledValue = scaledValue;
            let itemSpecific = textArray[index];
            itemSpecific.scale = scaledValue;
            textArray[index] = itemSpecific;
          }}
          onOpacityAnimateComplete={() => {
            if (this.deleteBtn) {
              let itemSpecific = textArray[index];
              itemSpecific.isDeleted = true;
              textArray[index] = itemSpecific;
            }
          }}
          onDrag={(offset, totalOffset) => {
            console.log('onDrag');
            let itemSpecific = textArray[index];
            itemSpecific.translateX = offset.translationX;
            itemSpecific.translateY = offset.translationY;
            itemSpecific.totalTranslateX = totalOffset.x;
            itemSpecific.totalTranslateY = totalOffset.y;
            textArray[index] = itemSpecific;
            if (showDelete) {
              this.setState({
                deleteOpacity: 0,
              });
              showDelete = false;
         
            }
          }}
          onDragBeganState={(offset) => {
            if (showDelete == false) {
              this.setState({
                deleteOpacity: 1,
              });
              showDelete = true;
        
            }
          }}
        />
      );
    }
  }

  renderTagDraggable(item, index) {
    if (!item.isDeleted && !item.isFixed) {
      return (
        <TagDragView
          dataItem={item}
          orientationValue={
            this.state.orientationLock ? 'landscape' : 'portrait'
          }
          translateXVal={item.translateX}
          translateYVal={item.translateY}
          totalTranslateX={item.totalTranslateX}
          totalTranslateY={item.totalTranslateY}
          onOpacityAnimateComplete={() => {
            if (this.deleteBtn) {
              let itemSpecific = tagArray[index];
              itemSpecific.isDeleted = true;
              tagArray[index] = itemSpecific;
            }
          }}
          onDrag={(offset, totalOffset) => {
            console.log('onDrag', offset);
            let itemSpecific = tagArray[index];
            itemSpecific.translateX = offset.translationX;
            itemSpecific.translateY = offset.translationY;
            itemSpecific.totalTranslateX = totalOffset.x;
            itemSpecific.totalTranslateY = totalOffset.y;
            tagArray[index] = itemSpecific;
            if (showDelete) {
              showDelete = false;
              this.setState({
                deleteOpacity: 0.0,
              });
    
            }
          }}
          onDragBeganState={(offset) => {
            if (showDelete == false) {
              showDelete = true;
              this.setState({
                deleteOpacity: 1,
              });
           
            }
          }}
          onTouchRespondView={(itemData) => {
            let itemSpecific = tagArray[index];
            itemSpecific = itemData;
            tagArray[index] = itemSpecific;
          }}
        />
      );
    }
  }

  renderDraggables(item, index) {
    if (
      item.isEdit == false &&
      item.isDeleted == false &&
      item.isSticker == false
    ) {
      return this.renderTextDraggable(item, index);
    } else if (item.isSticker) {
      return this.renderStickerDraggable(item, index);
    }
  }

  toggleStickerModal = () => {
    this.setState({toggleSticker: !this.state.toggleSticker});
  };

  addStickerObject = (stickerUrl) => {
    textDict = {
      scale: 0,
      stickerUrl: stickerUrl,
      rotation: 0,
      width: 100,
      height: 100,
      xcoordinate:
        this.state.orientationLock == false
          ? width < height
            ? width / 2 - 100 / 2
            : height / 2 - 100 / 2
          : width < height
          ? height / 2 - 100 / 2
          : width / 2 - 100 / 2,
      ycoordinate:
        this.state.orientationLock == false
          ? width < height
            ? height / 2 - 100
            : width / 2 - 100 / 2
          : width < height
          ? width / 2 - 100 / 2
          : height / 2 - 100,
      totalTranslateX: 0,
      orientation:
        this.state.orientationLock == false ? 'portrait' : 'landscape',
      totalTranslateY: 0,
      translateX: 0,
      translateY: 0,
      isDeleted: false,
      isSticker: true,
      opacity: new Animated.Value(1),
      shakeAnimation: new Animated.Value(0),
    };
    textArray.push(textDict);
   
  };

  /* TAGGIN USERS */
  onUserSelected = (user) => {
    console.log('USER SELECTED', user);
    this.setState({
      showTagPicker: false,
    });
    let tagDict = {
      imageUrl: user.profile_pic,
      userData: user,
      width: 50,
      height: 50,
      xcoordinate: this.state.itemDrag.locx,
      ycoordinate: this.state.itemDrag.locy,
      totalTranslateX: 0,
      orientation:
        this.state.orientationLock == false ? 'portrait' : 'landscape',
      totalTranslateY: 0,
      translateX: 0,
      translateY: 0,
      isDeleted: false,
      isFixed: false,
      opacity: new Animated.Value(1),
      shakeAnimation: new Animated.Value(0),
    };
    tagArray.push(tagDict);
  };

  handlePress = (evt) => {
    console.log('Coordinates', `x coord = ${evt.nativeEvent.locationX}`);
    console.log('Coordinates', `y coord = ${evt.nativeEvent.locationY}`);
    let dragITem = this.state.itemDrag;
    dragITem.tapped = true;
    dragITem.locx = evt.nativeEvent.locationX;
    dragITem.locy = evt.nativeEvent.locationY;
    this.setState(
      {
        itemDrag: dragITem,
        showTagPicker: true,
        isTagged: true,
      }
    );
  };

  renderFixedTags = (itemDrag, index) => {
    if (!itemDrag.isDeleted && itemDrag.isFixed) {
      return (
        <View
          style={[
            {
              backgroundColor: 'transparent',
              width: 50 + 30,
              height: 50 + 30,
              justifyContent: 'center',
              alignSelf: 'center',
              position: 'absolute',
              left: itemDrag.xcoordinate + itemDrag.totalTranslateX - 25,
              top: itemDrag.ycoordinate + itemDrag.totalTranslateY - 25,
            },
          ]}>
          <FastImage
            style={[
              {
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: 'white',
              },
            ]}
            source={
              itemDrag.imageUrl != null && itemDrag.imageUrl != ''
                ? {
                    uri: itemDrag.imageUrl,
                    priority: FastImage.priority.high,
                  }
                : Images.user_placeholder
            }
          />
        </View>
      );
    }
  };

  // MUSIC MERGE FUCNTIONALITIES
  toggleMusicPicker = () => {
    setTimeout(() => {
      this.setState(
        {
          showMusicPicker: !this.state.showMusicPicker,
        },
        () => {
          VideoTrimmer.isMusicSynced(true);
        },
      );
    }, 100);
  };

  playMusic = (track) => {
    CameraManager.streamMusicURL(track.stream_url + '?client_id=' + client_id);
  };

  pauseMusic = () => {
    CameraManager.streamPauseMusicURL('');
  };

  cancelSync = () => {
    this.setState(
      {
        showMusicPicker: false,
        isMusicSyncOn: false,
      },
      () => {
        CameraManager.syncExit();
        VideoTrimmer.isMusicSynced(false);
      },
    );
  };

  onSongSelected = (track) => {
    this.setState(
      {
        showMusicPicker: false,
      },
      () => {
        CameraManager.streamPauseMusicURL('');
        setTimeout(() => {
          this.setState(
            {
              selectedTrack: track,
            },
            () => {
              setTimeout(() => {
                this.setState({
                  isMusicProcessing: true,
                });
              }, 100);
              CameraManager.setMusicSyncAndDownload(
                track.stream_url + '?client_id=' + client_id,
                `${track.id}`,
                track,
                (respData) => {
                  this.setState(
                    {
                      isMusicProcessing: false,
                      musicUrlPath: respData,
                    },
                    () => {
                      if (this.state.showAudioTrimmer == false) {
                        this.setState(
                          {
                            showAudioTrimmer: true,
                            isMusicSyncOn: true,
                          },
                          () => {
                            VideoTrimmer.isMusicSynced(true);
                          },
                        );
                      }
                    },
                  );
                },
              );
            },
          );
        }, 300);
      },
    );
  };

  onTrimmingChange = (xOffset) => {
   
    this.setState(
      {
        startTrimmerTime: xOffset,
      },
      () => {
        CameraManager.playMusicAndSeekURL(
          this.state.selectedTrack.stream_url + '?client_id=' + client_id,
          xOffset,
        );
      },
    );
  };

  renderItem = ({item}) => {
    return (
      <View style={{width: 50, height: 50, marginRight: 5}}>
        <BouncyView onPress={() => this.optionSelected(item.title)}>
          <Image style={styles.imageIcon} source={item.icon} />
        </BouncyView>
      </View>
    );
  };

  optionSelected = (item) => {
    console.log(item);
    if (item == 'Save Video') {
      this.saveVideoLocal();
    } else if (item == 'Text') {
      this.visibleTextView();
    } else if (item == 'Sticker') {
      this.toggleStickerModal();
    } else if (item == 'Tag') {
      this.setState({showTagList: true});
    } else if (item == 'Music') {
      this.toggleMusicPicker();
    } else if (item == 'Slomo') {
      this.setState({
        IsSpeedEnable: true,
      });
    } else if (item == 'Tilt' && this.state.orientationCheck == 'landscape') {
      this.setState({
        IsTiltEnable: true,
      });
    } else if (
      item == 'Preview' &&
      this.state.orientationCheck == 'landscape'
    ) {
      this.setState({
        IsTiltPreview: true,
      });

    }
  };

  renderFixedStickers = (itemDrag, index) => {
    console.log('ROTATE ITEMDRAG', itemDrag.rotation);
    var _rotate = new Animated.Value(itemDrag.rotation);
    var _rotateStr = _rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    let xValue = itemDrag.xcoordinate + itemDrag.totalTranslateX;
    let yValue = itemDrag.ycoordinate + itemDrag.totalTranslateY;
    if (!itemDrag.isDeleted) {
      return (
        <Animated.View
          style={[
            {
              backgroundColor: 'transparent',
              width: itemDrag.width + 15,
              height: itemDrag.height,
              justifyContent: 'center',
              alignSelf: 'center',
              position: 'absolute',
              left: xValue,
              top: yValue,
            },
          ]}>
          <Animated.View
            style={[
              {
                backgroundColor: 'transparent',
                minWidth: '100%',
                justifyContent: 'center',
                minHeight: itemDrag.height,
                alignSelf: 'center',
              },
              {transform: [{rotate: _rotateStr}]},
            ]}>
            <Animated.View
              style={[
                {
                  backgroundColor: 'transparent',
                  minWidth: '100%',
                  justifyContent: 'center',
                  minHeight: itemDrag.height,
                  alignSelf: 'center',
                },
                {
                  //   transform: [
                  //       {scale: this._scale},
                  //   ],
                },
              ]}
              collapsable={false}>
              {itemDrag.isSticker == false && (
                <Animated.Text
                  numberOfLines={0}
                  style={[
                    {
                      flex: 1,
                      minHeight: 30,
                      paddingTop: 15,
                      padding: 5,
                      fontSize: 21,
                      fontFamily: itemDrag.textFont,
                      backgroundColor: itemDrag.textBg,
                      borderRadius: 10,
                      alignSelf: 'center',
                      textAlign: itemDrag.textAlign,
                      color: itemDrag.textColor,
                    },
                    {
                      borderRadius: 10,
                      overflow: 'hidden',
                      alignSelf: 'flex-start',
                      marginTop: itemDrag.rotation != 0 ? -20 : 0,
                    },
                    {
                      transform: [
                        //{rotate: _rotateStr},
                        {
                          scale: new Animated.Value(
                            itemDrag.scale == 0 ? 1 : itemDrag.scale,
                          ),
                        },
                      ],
                    },
                  ]}>
                  {itemDrag.textValue}
                </Animated.Text>
              )}
              {itemDrag.isSticker && (
                <AnimatedFastImage
                  style={[
                    {
                      width: 100,
                      height: 100,
                      marginLeft: 0,
                      marginTop: itemDrag.rotation != 0 ? -20 : 0,
                    },
                    {
                      transform: [
                        //{rotate: _rotateStr},
                        {
                          scale: new Animated.Value(
                            itemDrag.scale == 0 ? 1 : itemDrag.scale,
                          ),
                        },
                      ],
                    },
                  ]}
                  source={{
                    uri: itemDrag.stickerUrl,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      );
    }
  };

  render() {
    var videoUrl = '';
    var videosArray = [];
    console.log('RENDER vIDEO', this.state.IsVideoFromCamera);
  
    videosArray = this.state.videoPath;
   
    
    if (this.state.IsSpeedEnable == true) {
      return (
        <View style={{flex: 1, backgroundColor: 'brown'}}>
          <View style={styles.container}>
            <SpeedView
              style={{flex: 1, width: '100%', height: '100%'}}
              audio={this.state.audioData}
              processVideo={() => {}}
              close={(data) => {
                this.setState({IsSpeedEnable: false});
              }}></SpeedView>
          </View>
        </View>
      );
    } else if (this.state.IsTiltPreview == true) {
      return (
        <View style={{flex: 1, backgroundColor: 'brown'}}>
          <View style={styles.container}>
            <ScrollPlayer
              style={{flex: 1, width: '100%', height: '100%'}}
              videoPath={this.state.videoPath}
              videoFrame={this.state.tiltAxis}
              close={() => {
                this.setState({IsTiltPreview: false});
              }}></ScrollPlayer>
          </View>
        </View>
      );
    } else {
      return (
        <SafeAreaView style={{flex: 1, zIndex: 0}}>
          <View style={{flex: 1}}>
            <Loader visibility={this.state.isVideoProcessing} />
            <Loader visibility={this.state.isMusicProcessing} />
            <TouchableWithoutFeedback
              onPress={() => {
                if (this.state.keyboardOpen) {
                  this.setState(
                    {
                      isVisibleTextView: false,
                    },
                    () => {
                      if (this.state.markerText != '') {
                        this.addTextObjects();
                      }
                    },
                  );
                  doneEditingText = true;
                  Keyboard.dismiss();
                }
              }}>
              <View style={[styles.container]}>

                <MainView />

                <View
                  style={{
                    width: '100%',
                    height: '80%',
                    backgroundColor: 'transparent',
                  }}>
                  <VideoEditorView
                    style={
                      this.props.orientationCheck == 'portrait'
                        ? { flex: 1 }
                        : [
                          {
                            height: '80%',
                            width: '100%',
                          },
                        ]
                    }

                    IsTilt={this.state.IsTiltEnable}
                    videoUrl={videoUrl}
                    videoUrlArray={videosArray}></VideoEditorView>
                </View>
                {/* TAG VIEWS */}

                {this.state.showTagList && (
                  <View
                    style={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: 'transparent',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1,
                    }}>
                    <TouchableOpacity
                      activeOpacity={1.0}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={(evt) => this.handlePress(evt)}>
                      {!this.state.isTagged && (
                        <View style={styles.tapView}>
                          <Text style={styles.centerText}>
                            tap anywhere to tag friends
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    {!this.state.showTagPicker && (
                      <TouchableOpacity
                        style={[
                          styles.closeBtnContainerTag,
                          {
                            paddingLeft:
                              this.props.orientationCheck == 'portrait'
                                ? 4
                                : 10,
                          },
                        ]}
                        onPress={() => this.onClosePressed()}>
                        <Image
                          style={styles.close_icon}
                          source={Images.close_icon}
                        />
                      </TouchableOpacity>
                    )}
                    <View style={{position: 'absolute', right: 10, bottom: 10}}>
                      <BouncyView
                        onPress={() => {
                          if (this.state.showTagList) {
                            for (
                              let index = 0;
                              index < tagArray.length;
                              index++
                            ) {
                              const element = tagArray[index];
                              element.isFixed = true;
                              tagArray[index] = element;
                            }
                            this.setState({
                              isfixTags: true,
                              showTagList: false,
                              isTagged: false,
                            });
                          }
                        }}>
                        <Image
                          style={[styles.imageIcon, {height: 32, width: 32}]}
                          source={Images.next_video_icon}
                        />
                      </BouncyView>
                    </View>
                  </View>
                )}

                {!this.state.isVideoProcessing &&
                  textArray.map((data, index) => {
                    return this.renderDraggables(data, index);
                  })}

                {this.state.isTagged &&
                  tagArray.map((data, index) => {
                    return this.renderTagDraggable(data, index);
                  })}

                {this.state.isfixTags &&
                  tagArray.map((data, index) => {
                    return this.renderFixedTags(data, index);
                  })}

                {this.state.savedTextArrays.count != 0 &&
                  this.state.savedTextArrays.map((data, index) => {
                    return this.renderFixedStickers(data, index);
                  })}

                {this.state.IsTiltEnable == false &&
                  this.state.finalPlayer &&
                  !this.state.isVisibleTextView &&
                  !this.state.toggleSticker &&
                  !this.state.showTagList &&
                  !this.state.showAudioTrimmer &&
                  this.props.orientationCheck == 'portrait' && (
                    <View style={styles.actionContainerLeft}>
                      <FlatList
                        style={{flex: 1}}
                        horizontal={true}
                        data={
                          this.props.orientationCheck == 'portrait'
                            ? PORTRAITDATA
                            : DATA
                        }
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item.id}
                      />

                      <View style={{width: 50, height: 50, right: 0}}>
                        <BouncyView
                          onPress={() => {
                            emitResponse = true;
                            this.getVideoDetails(this.state.videoPath);
                            if (doneEditingText || textArray.length != 0) {
                              this.saveVideoLocal();
                            } else {
                              this.onNext();
                            }
                          }}>
                          <Image
                            style={[styles.imageIcon, {height: 32, width: 32}]}
                            source={Images.next_video_icon}
                          />
                        </BouncyView>
                      </View>
                    </View>
                  )}

                {this.state.finalPlayer &&
                  !this.state.isVisibleTextView &&
                  !this.state.toggleSticker &&
                  !this.state.showAudioTrimmer &&
                  !this.state.showTagList &&
                  this.props.orientationCheck == 'landscape' && (
                    <View style={styles.actionContainerRight}>
                      <View>
                        <BouncyView
                          onPress={() => {
                            this.visibleTextView();
                          }}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.text_icon}
                          />
                        </BouncyView>

                        <BouncyView
                          onPress={() => {
                            this.toggleStickerModal();
                          }}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.sticker_icon}
                          />
                        </BouncyView>

                        <BouncyView
                          onPress={() => {
                            this.setState({showTagList: true});
                          }}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.tag_icon}
                          />
                        </BouncyView>

                        <BouncyView
                          onPress={() => {
                            this.toggleMusicPicker();
                          }}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.music_icon}
                          />
                        </BouncyView>

                        <BouncyView onPress={() => {}}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.trimming_icon}
                          />
                        </BouncyView>

                        <BouncyView onPress={() => {}}>
                          <Image
                            style={styles.imageIcon}
                            source={Images.scrollable_preview}
                          />
                        </BouncyView>
                      </View>
                      <View>
                        <BouncyView
                          onPress={() => {
                            this.getVideoDetails(this.state.videoPath);
                            // this.onNext()
                          }}>
                          <Image
                            style={[styles.imageIcon, {height: 32, width: 32}]}
                            source={Images.next_video_icon}
                          />
                        </BouncyView>
                      </View>
                    </View>
                  )}

                {this.state.finalPlayer &&
                  !this.state.isVisibleTextView &&
                  !this.state.toggleSticker &&
                  !this.state.showAudioTrimmer &&
                  !this.state.showTagList &&
                  this.props.orientationCheck == 'landscape' && (
                    <View
                      style={{
                        height: '100%',
                        position: 'absolute',
                        paddingRight: 15,
                        left: 0,
                        top: 0,
                        width: 80,
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        backgroundColor: 'black',
                        zIndex: 1,
                      }}>
                      <BouncyView onPress={() => this.saveVideoLocal()}>
                        <Image
                          style={styles.imageIcon}
                          source={Images.savearrow_icon}
                        />
                      </BouncyView>
                    </View>
                  )}

                {this.state.isVisibleTextView && !this.state.toggleSticker && (
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      flex: 1,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                    }}>
                    <Animated.View
                      style={[
                        {
                          flex: 1,
                          backgroundColor: "transparent",
                          borderRadius: 8,
                          alignSelf: 'center',
                          minHeight: 40,
                          position: 'absolute',
                          zIndex: 999,
                          top:
                            this.props.orientationCheck == 'portrait'
                              ? 100
                              : 50,
                        },
                        {opacity: this.state.opacity},
                      ]}>
                      <TextInput
                        ref={(ref) => (this.txtInput = ref)}
                        
                        forceStrutHeight={true}
                        multiline={true}
                        style={{
                          fontSize: 23,
                          fontFamily: this.state.textSelectedFont,
                          backgroundColor: 'transparent',
                          padding: 5,
                          borderRadius: 8,
                          height:10,
                          opacity: this.state.opacityText,
                          textAlign: this.state.textAlign,
                          color: this.state.txtColor,
                        }}
                        onChangeText={(text) => {
                          this.setState({markerText: text});
                        }}
                        value={this.state.markerText}
                        spellCheck={false}
                        autoCorrect={false}
                      />

                      <Text
                        onLayout={(event) => {
                          const layout = event.nativeEvent.layout;
                          txtwidth = layout.width + 20;
                          txtHeight = layout.height + 20;
                          console.log("CHANGES HEIGHT",layout.height)
                        }}
                        style={{
                          fontSize: 23,
                          color: this.state.txtColor,
                          fontFamily: this.state.textSelectedFont,
                          backgroundColor: this.state.backgroundColorText,
                          padding: 5,
                          borderRadius: 8,
                          overflow: 'hidden',
                          opacity: this.state.opacityText,
                          textAlign: this.state.textAlign,
                        }}>
                        {' '}
                        {this.state.markerText}{' '}
                      </Text>
                    </Animated.View>
                  </View>
                )}
                <TouchableHighlight
                  ref={(refs) => (this.deleteBtn = refs)}
                  style={{
                    alignSelf: 'center',
                    position: 'absolute',
                    top: 10,
                    height: 60,
                    width: 60,
                    opacity: this.state.deleteOpacity,
                  }}
                  onPress={() => {
                    this.revertBackEdits();
                  }}>
                  <Image
                    style={[styles.imageIcon]}
                    source={Images.trash_icon}
                  />
                </TouchableHighlight>

                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    position: 'absolute',
                    top: 5,
                    width: '100%',
                    flex: 1,
                    zIndex: 999,
                  }}>
                  {!this.state.toggleSticker && !this.state.showTagList && (
                    <TouchableOpacity
                      style={[
                        styles.closeBtnContainer,
                        {
                          paddingLeft:
                            this.props.orientationCheck == 'portrait' ? 4 : 10,
                        },
                      ]}
                      onPress={() => this.onClosePressed()}>
                      <Image
                        style={styles.close_icon}
                        source={
                          this.state.showAudioTrimmer
                            ? Images.leftArrow
                            : Images.close_icon
                        }
                      />
                    </TouchableOpacity>
                  )}

                  {this.state.isVisibleTextView && !this.state.toggleSticker && (
                    <View style={{position: 'absolute', top: 5, right: 12}}>
                      <BouncyView
                        onPress={() => {
                          doneEditingText = true;
                          this.setState(
                            {
                              isVisibleTextView: false,
                            },
                            () => {
                              if (this.state.markerText != '') {
                                this.addTextObjects();
                              }
                            },
                          );
                        }}>
                        <Image
                          style={[styles.imageIcon, {height: 32, width: 32}]}
                          source={Images.next_video_icon}
                        />
                      </BouncyView>
                    </View>
                  )}
                  {this.state.IsTiltEnable && (
                    <TouchableOpacity
                      style={[
                        styles.rightBtnContainer,
                        {
                          paddingLeft:
                            this.props.orientationCheck == 'portrait' ? 4 : 10,
                        },
                      ]}
                      onPress={() => {
                         VideoTrimmer.getVideoCropFrame(
                          0,
                          (response) => {
                            console.log(response);
                            this.setState({
                              IsTiltEnable: false,
                              tiltAxis: response,
                            });
                          },
                        );
                      }}>
                      <Image
                        style={styles.close_icon}
                        source={Images.rightArrow}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
            {this.state.isVisibleTextView &&
              !this.state.toggleSticker &&
              !this.state.showAudioTrimmer &&
              !this.state.showTagList && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: this.state.keyboardHeight - 15,
                    width: '100%',
                    zIndex: 99999,
                  }}>
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: 'transparent',
                      flexDirection: 'row',
                      height: 50,
                      width: '100%',
                    }}>
                    <TouchableOpacity
                      style={[
                        styles.textButtons,
                        {backgroundColor: 'transparent'},
                      ]}
                      onPress={() => {
                        this.textBackgroundChange();
                      }}>
                      <Image
                        source={this.state.textImage}
                        style={[styles.textImage]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.textButtons}
                      onPress={() => {
                        this.textAlignChange();
                      }}>
                      <Image
                        source={this.state.alignImageChange}
                        style={[
                          styles.textImage,
                          {backgroundColor: 'transparent'},
                        ]}
                      />
                    </TouchableOpacity>
                    <FontsList
                      fontsList={this.state.fontsArray}
                      isSelected={this.state.textSelectedFont}
                      onSelectFont={(font) => {
                        this.setState({
                          textSelectedFont: font.value,
                        });
                      }}
                    />
                  </View>
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: 'transparent',
                      flexDirection: 'row',
                      height: 50,
                      width: '100%',
                    }}>
                    <ColorPalette
                      onChange={(color) => {
                        if (this.state.bgLevel == 0) {
                          this.setState({
                            selectedColor: color,
                            backgroundColorText: 'transparent',
                            txtColor: color,
                          });
                        } else {
                          this.setState({
                            selectedColor: color,
                            backgroundColorText:
                              this.state.bgLevel == 1 ? color : color + '85',
                            txtColor: 'white',
                          });
                        }
                      }}
                      value={this.state.selectedColor}
                      title={''}
                    />
                  </View>
                </View>
              )}
            <StickerPicker
              visibility={this.state.toggleSticker}
              orientationValue={this.props.orientationCheck}
              onClosePressed={(sticker) => {
                this.setState({
                  toggleSticker: false,
                });
                if (sticker != null) {
                  doneStickerEdits = true;
                  this.addStickerObject(sticker);
                }
              }}
              onModalWillHide={(sticker) => {
                console.log('SELECTED STICKR IS>>>>>', sticker);
              }}
            />

            <TagUserPicker
              visible={this.state.showTagPicker}
              onClosePressed={() => {
                this.setState({
                  showTagPicker: false,
                });
                if (tagArray.length == 0) {
                  this.setState({
                    isTagged: false,
                  });
                }
              }}
              onUserSelected={(user) => {
                this.onUserSelected(user);
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
          </View>
          <AudioTrimmer
            visibility={this.state.showAudioTrimmer}
            dataItem={this.state.selectedTrack}
            orientation={
              this.state.orientationLock == false ? 'portrait' : 'landscape'
            }
            onBackdropPress={() => {
              this.setState({
                showAudioTrimmer: false,
              });
            }}
            onModalWillHide={(startPressed, endPressed) => {
              if (startPressed) {
                let videoDict = new Object();
                let videoFile = this.state.videoPath[0];
                if (videoFile.includes('file://')) {
                  videoDict.videoUrl = [videoFile];
                } else {
                  videoDict.videoUrl = ['file://' + videoFile];
                }
                videoDict.musicUrl = this.state.musicUrlPath;
                videoDict.startTime = this.state.startTrimmerTime;

                this.setState(
                  {
                    isMusicProcessing: true,
                    showAudioTrimmer: false,
                    audioData: videoDict,
                  },
                  () => {
                    CameraManager.syncExit();

                    CameraManager.mergeVideosWithSongPreview(
                      videoDict,
                      this.state.isPhotoToVideo,
                      (respData) => {
                        videoUrl = respData.Video.path;
                        let arrVideo = new Array();
                        arrVideo.push(respData.Video.path);
                        this.setState(
                          {
                            videoPath: arrVideo,
                            IsVideoFromCamera: true,
                            isMusicProcessing: false,
                            //savedPath: respData.Video.path,
                          },
                          () => {
                            VideoTrimmer.isMusicSynced(false);
                            let dict = {
                              trackSynced: this.state.selectedTrack,
                            };
                            this.state.musicArray.push(dict);
                          },
                        );
                      },
                    );
                  },
                );
              }
              if (endPressed) {
                this.setState({
                  isMusicProcessing: false,
                });
                console.log('EXIT PRESSED');
                this.cancelSync();
              }
              this.cancelSync();
            }}
            getTrimmedStartValue={(value) => {
              this.onTrimmingChange(value);
            }}
          />
          
        </SafeAreaView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  textButtons: {
    height: 40,
    width: 40,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnContainerTag: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 4,
  },
  textImage: {
    height: 30,
    width: 30,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  playerStyle: {
    flex: 1,
    width: '98%',
    height: '100%',
    alignSelf: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  headerContainer: {
    position: 'absolute',
    margin: 10,
    width: 50,
    height: 50,
  },
  footerContainer: {},
  closeBtnContainer: {
    padding: 4,
  },
  rightBtnContainer: {
    padding: 4,
  },
  nextBtnContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  video_next: {
    height: 24,
    width: 24,
  },
  actionContainerRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingTop: 10,
    paddingLeft: 15,
    width: 80,
    zIndex: 9999,
    height: '100%',
    backgroundColor: 'black',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  actionContainerLeft: {
    position: 'absolute',
    bottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionContainerBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tapView: {
    height: 40,
    width: '80%',
    backgroundColor: '#00000080',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  centerText: {
    color: '#FFFFFF80',
    fontSize: 18,
    textAlign: 'center',
  },
  close_icon: {
    height: 25,
    width: 25,
    margin: 10,
    resizeMode: 'contain',
  },
  imageIcon: {height: 32, width: 32, margin: 10, resizeMode: 'contain'},
});

const mapStateToProps = (state) => {
  const {orientationCheck} = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(mapStateToProps, {
  saveVideoSegments,
})(VideoPlayerView);
