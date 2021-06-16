import {
  Alert,
  Animated,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  Image,
  Keyboard,
  NativeModules,
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
import React from 'react';
import {onPictureTaken, orientation} from '../../actions/cameraPreviewAction';

import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import ColorPalette from '../../components/ViewComponents/ColorPalleteView/ColorPalleteView';
import DraggableTextView from '../../components/ViewComponents/DraggableTextView/DraggableTextView';
import FastImage from '@stevenmasini/react-native-fast-image';
import FontsList from '../../components/FontsList/FontsList';
import {Loader} from '../../components/ViewComponents/Loader';
import StickerPicker from '../../components/StickerPicker/StickerPicker';
import TagDragView from '../../components/TagUsersList/TagDragView';
import TagUserPicker from '../../components/TagUsersList/TagUserPicker';
import {connect} from 'react-redux';
import {createImageProgress} from 'react-native-image-progress';

const FImage = createImageProgress(FastImage);
const AnimatedFastImage = Animated.createAnimatedComponent(FImage);

const VideoSticker = requireNativeComponent('TextEmbedder', null);
var stickerActions = NativeModules.TextEmbedder;
const CameraManager = NativeModules.RNCameraManager;

const {width, height} = Dimensions.get('window');

let txtHeight = 30;
let txtwidth = 32;
let initialTextXPos = 0;
let initialTextYPos = 0;
let showDelete = false;
var textArray = [];
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
let markerText = '';
let deleteIndex = 0;
let emitResponse = false;

class PhotoPreview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      responseData: props.navigation.getParam('responseData', null),
      photoPath: props.navigation.getParam('imagePath', null),
      imageDetails: props.navigation.getParam('imageDetails', null),
      orientationLock: props.navigation.getParam('orientationLockValue', false),
      imageHeight: Dimensions.get('window').height,
      imageWidth: Dimensions.get('window').width,
      isVisibleTextView: false,
      markerText: '',
      backgroundColorText: 'transparent',
      opacityText: 1,
      textAlign: 'center',
      txtColor: 'white',
      isKeyboardDismissed: true,
      selectedColor: '#FFFFFF',
      bgLevel: 0,
      textSelectedFont: 'Verdana-Bold',
      alignImageChange: Images.para_centericon,
      doneEditingText: false,
      showDelete: true,
      updateDraggable: false,
      textImage: Images.text_border_icon,
      opacity: new Animated.Value(1),
      scaledValueText: 0,
      rotatedValueText: 0,
      shortHeight: 0,
      normalHeight: Dimensions.get('window').height,
      keyboardHeight: 0,
      keyboardOpen: false,
      isVideoProcessing: false,
      isEditing: false,
      selectedIndex: 0,
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
      toggleSticker: false,
      showTagList: false,
      isTagged: false,
      showTagPicker: false,
      itemDrag: {
        locx: 0,
        locy: 0,
      },
      isfixTags: false,
      sticksCount: 0,
      savedTextArrays: [],
      savedPath: '',
      textOpacity: 0,
    };
    this.scaledValue = 0;
    this.rotatedValue = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.paddingInput = new Animated.Value(0);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  onClosePressed() {
    const CameraTypeDataPass = this.props.navigation.getParam(
      'CameraTypeDataPass',
    );
    console.log('onClosePressedMoveData', CameraTypeDataPass);

    stickerActions.UnLockOrientationInPhotoView((resp));
    if (this.state.isVisibleTextView) {
      this.setState({
        isVisibleTextView: false,
      });
    }
    if (this.state.showTagList) {
      this.setState({
        showTagList: false,
        isTagged: false,
      });
      for (let index = 0; index < tagArray.length; index++) {
        const element = tagArray[index];
        if (!element.isFixed) {
          tagArray.splice(index, 1);
        }
      }
    } else {
      textArray = new Array();
      this.revertBackEdits();
     
      this.props.navigation.navigate('CameraPreview', {
        FinalEndData: CameraTypeDataPass,
      });

      DeviceEventEmitter.emit('onCameraPreviewMount', {});
    }
  }

  componentDidMount() {
    textArray = Object.assign([], textArray);
    console.log('ORIENTATION', this.state.orientationLock);
    if (this.state.orientationLock) {
      stickerActions.lockOrientationInPhotoView('landscape', (resp));
    } else {
      stickerActions.lockOrientationInPhotoView('portrait', (resp));
    }
    tagArray = new Array();
    this.setState({
      textOpacity: 0,
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

  handleBackButtonClick(){
    this.onClosePressed();
    return true;
  }

  getImageDetails(photoPath) {
    let taggedData = new Array();
    tagArray.forEach((element) => {
      if (!element.isDeleted) {
              let dict = {
                userid: element.userData.id,
                image: element.userData.profile_pic,
                image_path: this.state.photoPath,
                x: element.xcoordinate + element.totalTranslateX,
                y: element.ycoordinate + element.totalTranslateY,
              };
              taggedData.push(dict);
            }
    });
    
    let respData = this.state.responseData;
    if (respData.imageData == undefined){
      const pathObj = {
        'imageData': respData
        }
      respData = pathObj
      respData.imageData.path = photoPath
      this.setState({
        responseData: respData
      })
      console.log("PICTURE PATH",this.state.photoPath,respData.imageData)
    }
    if (this.state.savedPath != '') {
      if (respData.imageData == null){
        const pathObj = {
        'path': photoPath
        }
        respData.imageData = pathObj;
      }else{
        respData.imageData.path = photoPath; 
      }
      if(this.state.savedPath.includes("gifOutputVideo")){
        respData.imageData.type = "video"
        respData.videoData = respData.imageData
        delete respData.imageData
        respData.videoData.fileName = "finalVideo"
        respData.audioData = []
      }
    }
    respData.tagData = taggedData;
    this.setState({
      responseData: respData,
    },()=>{
      if(this.state.savedPath.includes("gifOutputVideo")){
        DeviceEventEmitter.emit('onVideoTaken', this.state.responseData);
      }else{
        console.log("PICTURE RESPONSE",this.state.responseData)
        DeviceEventEmitter.emit('onPictureTaken', this.state.responseData);
      }
    });
    
    
    }

  saveImageInLocal() {
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
      //setTimeout(() => {
      this.setState({
        isVideoProcessing: true,
      });
      //}, 300);

      doneEditingText = false;
      // try{

      stickerActions.getTextStickerWithImage(
        this.state.photoPath,
        this.state.savedTextArrays,
        (resp) => {
          textArray = new Array();
        
          this.setState({
            isVideoProcessing: false,
          });

          let stringResp = resp;
          stringResp = stringResp.replace('file://', '');
          
          this.setState({
            savedPath: stringResp,
          });

          if (emitResponse == true) {
            emitResponse = false;
            this.getImageDetails(this.state.savedPath);
          } else {
            Alert.alert(
              'Image Saved Successfully.',
              '',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    //console.log("SAVED PHOTO PATH",resp)
                  },
                },
              ],
              {cancelable: false},
            );
          }
        },
      );

      // }catch(e){
      //   console.log("catch the photo save",e)
      // }
    } else {
      stickerActions.getTextStickerWithImage(
        this.state.photoPath,
        [],
        (resp) => {
          this.setState({
            isVideoProcessing: false,
          });
          Alert.alert(
            'Image Saved Successfully.',
            '',
            [
              {
                text: 'OK',
                onPress: () => {
                  //console.log("SAVED PHOTO PATH",resp)
                },
              },
            ],
            {cancelable: false},
          );
        },
      );
    }
  }

  visibleTextView() {
    this.setState(
      {
        isVisibleTextView: true,
        opacity: new Animated.Value(1),
      },
      () => {
        (doneEditingText = true) (showDelete = false);
        this.setState({
          textOpacity: 0,
        });
        //   this.deleteBtn.setOpacityTo(0.0)
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
        },
        () => {},
      );
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
      },
      () => {
        this.txtHeight = 40;
        this.txtwidth = 0;
        initialTextXPos = 0;
        initialTextYPos = 0;
        this.setState({
          textOpacity: 0,
        });
        // this.setState({
        showDelete = false;
        // this.deleteBtn.setOpacityTo(0.0)
        // })
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
      isSticker: false,
      opacity: new Animated.Value(1),
      // "shakeAnimation": new Animated.Value(0)
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
      },
      () => {
        this.txtHeight = txtObject.height;
        this.txtwidth = txtObject.width;
        initialTextXPos = txtObject.xcoordinate;
        initialTextYPos = txtObject.ycoordinate;
        // this.setState({
        showDelete = false;
        // this.deleteBtn.setOpacityTo(0.0)
        this.textBackgroundChange();
        // })
      },
    );
  }

  renderTextDraggable(item, index) {
    return (
      <DraggableTextView
        labelStyles={{
          flex: 1,
          minHeight: 30,
          paddingTop: 15,
          padding: 8,
          fontSize: 22,
          fontFamily: item.textFont,
          backgroundColor: item.textBg,
          borderRadius: 10,
          alignSelf: 'center',
          textAlign: item.textAlign,
          color: item.textColor,
        }}
        labelText={item.textValue}
        dataItem={item}
        orientationValue={this.state.orientationLock ? 'landscape' : 'portrait'}
        textWidth={item.width}
        textHeight={item.height}
        scaleValue={item.scale}
        rotationValue={item.rotation}
        translateXVal={item.translateX}
        translateYVal={item.translateY}
        totalTranslateX={item.totalTranslateX}
        totalTranslateY={item.totalTranslateY}
        absoluteX={item.absoluteX}
        absoluteY={item.absoluteY}
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
          let itemSpecific = textArray[index];
          itemSpecific.isDeleted = true;
          textArray[index] = itemSpecific;
        }}
        onDrag={(offset, totalOffset) => {
          let itemSpecific = textArray[index];
          itemSpecific.translateX = offset.translationX;
          itemSpecific.translateY = offset.translationY;
          itemSpecific.totalTranslateX = totalOffset.x;
          itemSpecific.totalTranslateY = totalOffset.y;

          itemSpecific.absoluteX = offset.absoluteX;
          itemSpecific.absoluteY = offset.absoluteY;
          textArray[index] = itemSpecific;
          if (showDelete) {
            showDelete = false;
            this.setState({
              textOpacity: 0,
            });
          
          }
        }}
        onDragBeganState={(offset) => {
          if (showDelete == false) {
            showDelete = true;
            this.setState({
              textOpacity: 1,
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

  renderStickerDraggable(item, index) {
    console.log("RENDER STICKER",item.stickerUrl)
    return (
      <DraggableTextView
        dataItem={item}
        orientationValue={this.state.orientationLock ? 'landscape' : 'portrait'}
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
          let itemSpecific = textArray[index];
          itemSpecific.isDeleted = true;
          textArray[index] = itemSpecific;
          
        }}
        onDrag={(offset, totalOffset) => {
          console.log('onDrag', offset);

          let itemSpecific = textArray[index];
          itemSpecific.translateX = offset.translationX;
          itemSpecific.translateY = offset.translationY;
          itemSpecific.totalTranslateX = totalOffset.x;
          itemSpecific.totalTranslateY = totalOffset.y;
          itemSpecific.absoluteX = offset.absoluteX;
          itemSpecific.absoluteY = offset.absoluteY;

          textArray[index] = itemSpecific;
          if (showDelete) {
            showDelete = false;
            this.setState({
              textOpacity: 0,
            });
          }
        }}
        onDragBeganState={(offset) => {
          if (showDelete == false) {
            showDelete = true;
            this.setState({
              textOpacity: 1,
            });
          }
        }}
      />
    );
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
            let itemSpecific = tagArray[index];
            itemSpecific.isDeleted = true;
            tagArray[index] = itemSpecific;
          }}
          onDrag={(offset, totalOffset) => {
            console.log('onDrag', offset);
            let itemSpecific = tagArray[index];
            itemSpecific.translateX = offset.translationX;
            itemSpecific.translateY = offset.translationY;
            itemSpecific.totalTranslateX = totalOffset.x;
            itemSpecific.totalTranslateY = totalOffset.y;
            itemSpecific.absoluteX = offset.absoluteX;
            itemSpecific.absoluteY = offset.absoluteY;

            tagArray[index] = itemSpecific;
            if (showDelete) {
              showDelete = false;
              this.setState({
                textOpacity: 0,
              });
     
            }
          }}
          onDragBeganState={(offset) => {
            if (showDelete == false) {
              showDelete = true;
              this.setState({
                textOpacity: 1,
              });
            
            }
          }}
        
        />
      );
    }
  }

  renderDraggables(item, index) {
    console.log('RENDER DRAGGABLES');
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
    setTimeout(() => {
      this.setState({toggleSticker: !this.state.toggleSticker});
    }, 100);
  };

  addStickerObject = (stickerUrl, isGif, stickerWidth, stickerHeight) => {
    textDict = {
      scale: 0,
      stickerUrl: stickerUrl,
      rotation: 0,
      width: stickerWidth,
      height: stickerHeight,
      xcoordinate:
        this.state.orientationLock == false
          ? width < height
            ? width / 2 - stickerWidth / 2
            : height / 2 - stickerHeight / 2
          : width < height
          ? height / 2 - stickerHeight / 2
          : width / 2 - stickerWidth / 2,
      ycoordinate:
        this.state.orientationLock == false
          ? width < height
            ? height / 2 - stickerHeight
            : width / 2 - stickerWidth / 2
          : width < height
          ? width / 2 - stickerWidth / 2
          : height / 2 - stickerHeight,
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
      //isTagged: true,
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
      },
      () => {
        //this.props.onTouchRespondView(this.state.itemDrag)
      },
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

  renderFixedStickers = (itemDrag, index) => {
    console.log("RENDER FIXED STICKERS")
    var _rotate = new Animated.Value(itemDrag.rotation);
    var _rotateStr = _rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    let xValue = itemDrag.xcoordinate + itemDrag.totalTranslateX + 5;
    let yValue = itemDrag.ycoordinate + itemDrag.totalTranslateY + 5;
    
    if (!itemDrag.isDeleted) {
      return (
        <Animated.View
          style={[
            {
              backgroundColor: 'transparent',
              width:
                itemDrag.width >= width - 50
                  ? itemDrag.width
                  : itemDrag.width + 10,
              height: itemDrag.height - 10,
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
              {transform: [{rotate: _rotateStr},{scale: itemDrag.scale == 0 ? 1 : itemDrag.scale}]},
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
                      marginTop: itemDrag.rotation != 0 ? -15 : 0,
                    },
                    {
                      transform: [
                        //{rotate: _rotateStr},
                        // {
                        //   scale: new Animated.Value(
                        //     itemDrag.scale == 0 ? 1 : itemDrag.scale,
                        //   ),
                        // },
                      ],
                    },
                  ]}>
                  {itemDrag.textValue}
                </Animated.Text>
              )}
              {itemDrag.isSticker && (
                <FastImage
                  style={[
                    {
                      width: 100,
                      height: 100,
                      marginLeft: itemDrag.rotation != 0 ? 0 : -8,
                      marginTop: itemDrag.rotation != 0 ? -15 : 0,
                    },
                    {
                      transform: [
                        //{rotate: _rotateStr},
                        // {
                        //   scale: new Animated.Value(
                        //     itemDrag.scale == 0 ? 1 : itemDrag.scale,
                        //   ),
                        // },
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
    return (
      <View style={{flex: 1}}>
        {/* <VideoSticker style={{ flex: 1, position:"absolute"}}/> */}
        <Loader visibility={this.state.isVideoProcessing} />
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
          <View style={styles.container}>
            {/* <MainView/> */}
            {this.state.photoPath != null && (
              <Image
                //   style={this.props.orientationCheck == "portrait" ? styles.imagePreview : [{height:"100%",width:"100%",resizeMode:"contain"}]}
                style={{height: '100%', width: '100%'}}
                source={{uri: this.state.photoPath}}
              />
            )}

            {/*TAG VIEWS */}
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
                      styles.closeBtnContainer,
                      {
                        paddingLeft:
                          this.props.orientationCheck == 'portrait' ? 4 : 10,
                        zIndex: 999,
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
                        for (let index = 0; index < tagArray.length; index++) {
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

            {this.state.isfixTags &&
              tagArray.map((data, index) => {
                return this.renderFixedTags(data, index);
              })}

            {this.state.savedTextArrays.count != 0 &&
              this.state.savedTextArrays.map((data, index) => {
                return this.renderFixedStickers(data, index);
              })}

            {!this.state.isVideoProcessing &&
              textArray.map((data, index) => {
                return this.renderDraggables(data, index);
              })}

            {this.state.isTagged &&
              tagArray.map((data, index) => {
                return this.renderTagDraggable(data, index);
              })}

            {!this.state.isVisibleTextView &&
              !this.state.toggleSticker &&
              !this.state.showTagList &&
              this.props.orientationCheck == 'portrait' && (
                <View style={styles.actionContainerLeft}>
                  <BouncyView onPress={() => this.saveImageInLocal()}>
                    <Image
                      style={styles.imageIcon}
                      source={Images.savearrow_icon}
                    />
                  </BouncyView>
                  <View
                    style={{
                      alignSelf: 'center',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <BouncyView></BouncyView>
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
                        this.setState({
                          showTagList: true,
                        });
                      }}>
                      <Image
                        style={styles.imageIcon}
                        source={Images.tag_icon}
                      />
                    </BouncyView>

                    {/* <BouncyView onPress={()=>{
          }}>
            <Image style={styles.imageIcon} source={Images.trimming_icon} />
          </BouncyView>

          <BouncyView onPress={()=>{
          }}>
            <Image style={styles.imageIcon} source={Images.scrollable_preview} />
          </BouncyView> */}

                    {/* <BouncyView>
            <Image style={styles.imageIcon} source={Images.music_icon} />
          </BouncyView> */}
                  </View>
                  <BouncyView
                    onPress={() => {
                      console.log('CLICKED photo res');
                      if (doneEditingText || textArray.length != 0) {
                        emitResponse = true;
                        this.saveImageInLocal();
                      } else {
                        this.getImageDetails(this.state.photoPath);
                      }
                    }}>
                    <Image
                      style={[styles.imageIcon, {height: 32, width: 32}]}
                      source={Images.next_video_icon}
                    />
                  </BouncyView>
                </View>
              )}
            {!this.state.isVisibleTextView &&
              !this.state.toggleSticker &&
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
                        this.setState({
                          showTagList: true,
                        });
                      }}>
                      <Image
                        style={styles.imageIcon}
                        source={Images.tag_icon}
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

                    {/* <BouncyView>
            <Image style={styles.imageIcon} source={Images.music_icon} />
          </BouncyView> */}
                  </View>
                  <View>
                    <BouncyView
                      onPress={() => {
                        console.log('CLICKED photo res');
                        this.getImageDetails(this.state.photoPath);
                      }}>
                      <Image
                        style={[styles.imageIcon, {height: 32, width: 32}]}
                        source={Images.next_video_icon}
                      />
                    </BouncyView>
                  </View>
                </View>
              )}

            {!this.state.isVisibleTextView &&
              !this.state.toggleSticker &&
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
                    zIndex: 999,
                  }}>
                  <BouncyView onPress={() => this.saveImageInLocal()}>
                    <Image
                      style={styles.imageIcon}
                      source={Images.savearrow_icon}
                    />
                  </BouncyView>                
                </View>
              )}

            {this.state.isVisibleTextView && (
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
                      backgroundColor: 'tranparent',
                      borderRadius: 8,
                      alignSelf: 'center',
                      minHeight: 40,
                      position: 'absolute',
                      zIndex: 999,
                      top: this.props.orientationCheck == 'portrait' ? 100 : 50,
                    },
                  ]}>
                  <TextInput
                    ref={(ref) => (this.txtInput = ref)}
                    onLayout={(event) => {
                      const layout = event.nativeEvent.layout;
                      txtwidth = layout.width + 20;
                      txtHeight = layout.height + 20;
                    }}
                    forceStrutHeight={true}
                    multiline={true}
                    style={{
                      fontSize: 23,
                      fontFamily: this.state.textSelectedFont,
                      backgroundColor: 'transparent',
                      padding: 5,
                      borderRadius: 8,
                      opacity: this.state.opacityText,
                      textAlign: this.state.textAlign,
                      color: this.state.txtColor,
                      // opacity: this.state.isVisible ? 1 : 0,
                    }}
                    onChangeText={(text) => {
                      this.setState({markerText: text});
                    }}
                    value={this.state.markerText}
                    spellCheck={false}
                    autoCorrect={false}
                  />

                  <Text
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
                opacity: this.state.textOpacity,
              }}
              onPress={() => {
                this.revertBackEdits();
              }}>
              <Image style={[styles.imageIcon]} source={Images.trash_icon} />
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
                  <Image style={styles.close_icon} source={Images.close_icon} />
                </TouchableOpacity>
              )}
              {this.state.isVisibleTextView && (
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
            </View>
          </View>
        </TouchableWithoutFeedback>
        {this.state.isVisibleTextView && (
          <View
            style={{
              position: 'absolute',
              bottom: this.state.keyboardHeight - 10,
              width: '100%',
              zIndex: 999,
            }}>
            <View
              style={{
                alignSelf: 'flex-end',
                backgroundColor: 'transparent',
                flexDirection: 'row',
                height: 45,
                width: '100%',
              }}>
              <TouchableOpacity
                style={[styles.textButtons, {backgroundColor: 'transparent'}]}
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
                  style={[styles.textImage, {backgroundColor: 'transparent'}]}
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
          onClosePressed={(sticker, isGif) => {
            console.log("GIF>>>>>>>>",sticker)
            setTimeout(() => {
              this.setState({
                toggleSticker: false,
              });
            }, 200);
            
            if (sticker != null) {
              this.addStickerObject(sticker, isGif, 100, 100);
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
      </View>
    );
    //}
  }
}

const styles = StyleSheet.create({
  ColorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtons: {
    height: 40,
    width: 40,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textImage: {
    height: 30,
    width: 30,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    //zIndex:1,
    backgroundColor: Colors.black,
  },
  imagePreview: {
    flex: 1,
  },
  closeBtnContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 4,
  },
  close_icon: {
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
    height: '100%',
    backgroundColor: 'black',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 999,
  },
  actionContainerLeft: {
    position: 'absolute',
    bottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 999,
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
  imageIcon: {height: 32, width: 32, margin: 10, resizeMode: 'contain'},
});

const mapStateToProps = (state) => {
  const {orientationCheck} = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(mapStateToProps, {
  orientation,
  onPictureTaken,
})(PhotoPreview);


