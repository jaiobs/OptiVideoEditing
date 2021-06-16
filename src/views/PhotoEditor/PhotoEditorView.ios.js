
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  requireNativeComponent
 } from 'react-native';
 
 
 var VSVActions = NativeModules.SpeedView;
 import { Colors, Images } from '../../res';
 import React from 'react';
 import AudioTrimmer from '../../components/AudioTrimmer/AudioTrimmer';
 import BouncyView from '../../components/widgets/BouncyView/BouncyView';
 import ColorPalette from '../../components/ViewComponents/ColorPalleteView/ColorPalleteView';
 import FastImage from '@stevenmasini/react-native-fast-image';
 import FontsList from '../../components/FontsList/FontsList';
 import { Loader } from "../../components/ViewComponents/Loader";
 import MainView from '../../components/MainContainer';
 import MusicPicker from '../../components/MusicPicker/MusicPicker';
 import SpeedView from '../SpeedView/SpeedView';
 import StickerPicker from '../../components/StickerPicker/StickerPicker';
 import TagDragView from '../../components/TagUsersList/TagDragView';
 import TagUserPicker from '../../components/TagUsersList/TagUserPicker';
 import {client_id} from '../../actions/MusicActions';
 import {connect} from 'react-redux';
 import {saveVideoSegments} from '../../actions/cameraPreviewAction';
 
 const PhotoEditor = requireNativeComponent('LPPhotoEdit', null);
 const stickerActions = NativeModules.LPPhotoEdit;
 const VideoTrimmer = NativeModules.VideoEditor;
 const CameraManager = NativeModules.RNCameraManager;
 let tagArray = new Array();
 let showDelete = false;
 const TOP_FOR_BOTTOM_BUTTON_CONTAINER = 35
 
 var PORTRAITDATA = [
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
 
   {
     icon: Images.slowmotion_icon,
     title: 'Slomo',
   },
 
   
 ];
 
 const DATA = [
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
 
   {
     icon: Images.slowmotion_icon,
     title: 'Slomo',
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
 let emitResponse = false;
 class PhotoEditorView extends React.PureComponent {
     constructor(props) {
       super(props);
       this.state = {
         DisableTextView:false,
         exampleImageUri:'',
         responseData: props.navigation.getParam('responseData', null),
         photoPath: props.navigation.getParam('imagePath', ""),
         videoPath: props.navigation.getParam('videoPath', ""),
         videoArray: props.navigation.getParam('videoCollection', []),
         imageDetails: props.navigation.getParam('imageDetails', null),
         orientationLock: props.navigation.getParam('orientationLockValue', false),
         musicArray: props.navigation.getParam('musicArray', []),
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
         enableFullScreenEdit:false,
         fontsArray: [
           {
             title: 'Verdana',
             value: 'Verdana-Bold',
           },
           {
             title: 'Palatino',
             value: 'Palatino-Roman',
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
         showMusicPicker: false,
         isMusicSyncOn: false,
         selectedTrack: '',
         showAudioTrimmer: false,
         isMusicProcessing: false,
         startTrimmerTime: 0.0,
         isPhotoToVideo: props.navigation.getParam('isPhotoToVideo', false),
         IsSpeedEnable: false,
  IsSpeedViewShow:false,
       refresh:false,      
   audioData: null,
         isGifAdded:false,
         pickedFromGallery: props.navigation.getParam('pickedFromGallery',false),
         deleteOpacity:0,
         isStickerAdded:false
       };
       this.scaledValue = 0;
       this.rotatedValue = 0;
       this.translateX = 0;
       this.translateY = 0;
       this.paddingInput = new Animated.Value(0);
     }
 
   onPressSendImage() {
        this.state.exampleImageUri = Image.resolveAssetSource(Images.trash_icon).uri
        stickerActions.construct(this.state.exampleImageUri);
      }
 
   onPressNativeModuleEvt() {
     
   this.onPressSendImage()
 
   const myModuleEvt = new NativeEventEmitter(NativeModules.CommonEmittor)
          myModuleEvt.addListener('CommonEmittorEvent', (response) => {
           if (response.action == "keyboardWillShow") {
             let kbData = response.data
             this.setState({
                 isKeyboardDismissed: false,
                 keyboardOpen: true,
                 DisableTextView: true,
                 isVisibleTextView:true,
                 keyboardHeight: kbData.keyboardHeight,
                 normalHeight: Dimensions.get('window').height,
                 shortHeight: Dimensions.get('window').height - kbData.keyboardHeight,
             })
           }
           if (response.action == "keyboardWillHide") {
             let kbData = response.data
             this.setState({
                 isKeyboardDismissed: true,
                 keyboardOpen: true,
                 DisableTextView: false,
                 isVisibleTextView:false,
                 keyboardHeight: kbData.keyboardHeight,
                 normalHeight: Dimensions.get('window').height,
                 shortHeight: Dimensions.get('window').height - kbData.keyboardHeight,
             })
           }
           if (response.action == "FontAction") {
                   let fontData = response.dataFont
                   this.setState({
                        textSelectedFont: fontData.fontValue,

                   })
                   
                   if (this.state.bgLevel == 0) {
                     this.setState({
                       selectedColor: fontData.fontColor,
                       backgroundColorText: 'transparent',
                       txtColor: fontData.fontColor == "#FFFFFF" ? "#000000" : fontData.fontColor,
                     });
                   } else {
                     this.setState({
                       selectedColor: fontData.fontColor,
                       backgroundColorText:
                         this.state.bgLevel == 1 ? fontData.fontColor : fontData.fontColor + '85',
                       txtColor: 'white',
                     });
                   }
                   this.setState({
                        textAlign: fontData.textAlign,
                    })
                   this.textAlignChange()
           }
      })
   
         tagArray = new Array();
         this.setState({
           textOpacity: 0,
         });
 
 }
 
 
   componentDidMount() {
     this.onPressNativeModuleEvt()
    }
 
   /* 
      Function to disable the TextView Background over the Gif
   */
 
    _onPressTextVisibleIcon(){
        if (this.state.DisableTextView === false) {
          this.setState({isVisibleTextView: true,isStickerAdded:true}, ()=> {
               stickerActions.addText();
          });
          this.setState({
                DisableTextView:true,
          })
          
        }else if(this.state.DisableTextView === true){
                this.setState({
                  isVisibleTextView: false,
                })
                this.setState({
                   DisableTextView:false,
               })
       } 
 
   }
 
   saveImageInLocal() {
     stickerActions.SaveInPhotoView((resp) => {
         console.log("SaveInPhotoViewResp",resp)
       });
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
         DeviceEventEmitter.emit('onPictureTaken', this.state.responseData);
       }
     });
   }
 
 
 textBackgroundChange() {
   if (this.state.bgLevel == 0) {
     //changed to 1
     this.setState({
       bgLevel: 1,
       backgroundColorText: this.state.selectedColor,
       opacityText: 1.0,
       textImage: Images.text_withBg_icon,
       txtColor: this.state.selectedColor == '#FFFFFF' ? '#000000' : '#FFFFFF',
     },()=>{
       stickerActions.updateBackgroundColor(this.state.selectedColor,false)
     });
   } else if (this.state.bgLevel == 1) {
     // changed to 2
     this.setState({
       bgLevel: 2,
       backgroundColorText: this.state.selectedColor + '85',
       textImage: Images.text_withOpacity_icon,
       opacityText: 1.0,
       txtColor: this.state.selectedColor == '#FFFFFF85' ? '#000000' : '#FFFFFF',
     },()=>{
       stickerActions.updateBackgroundColor(this.state.selectedColor + '85',false)
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
       () => {
           stickerActions.updateBackgroundColor(this.state.selectedColor,true)
       }
     );
   }
 }
 
    /* 
      Function to Align the Text inside the textView
   */
   textAlignChange() {
       if (this.state.textAlign == 'center') {
         stickerActions.updateAlign(this.state.textAlign)
         this.setState({
           alignImageChange: Images.para_centericon,
           textAlign: 'right',
         });
       } else if (this.state.textAlign == 'right') {
         stickerActions.updateAlign(this.state.textAlign)
         this.setState({
           alignImageChange: Images.para_righticon,
           textAlign: 'left',
         });
       } else if (this.state.textAlign == 'left') {
         stickerActions.updateAlign(this.state.textAlign)
         this.setState({
           alignImageChange: Images.para_lefticon,
           textAlign: 'center',
         });
       }
     }
 
   //TAGGING FUNCTIONALITY
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
         />
       );
     }
   }
 
   /* TAGGIN USERS */
 onUserSelected = (user) => {
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
 
 // MUSIC FUNCTIONALITIES
 toggleMusicPicker = () => {
   setTimeout(() => {
     this.setState(
       {
         showMusicPicker: !this.state.showMusicPicker,
       },
     () => {
         stickerActions.changeMuteStatus(this.state.showMusicPicker,this.state.showMusicPicker,(resp) => {

         });
     }
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
       stickerActions.changeMuteStatus(false,false,(resp)=>{
      });
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
             //showMusicPicker:false,
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
                           stickerActions.changeMuteStatus(true,true,(resp)=>{
                           });
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
 
 postMetadataAppend = (resp) => {
   let taggedData = new Array();
 
     tagArray.forEach((element) => {
                       
     if (!element.isDeleted) {
       let dict = {
         userid: element.userData.id,
         image: element.userData.profile_pic,
         image_path: resp.path,
         x: element.xcoordinate + element.totalTranslateX,
         y: element.ycoordinate + element.totalTranslateY,
       };
       taggedData.push(dict);
     }
 
 
     });
 
   if(this.state.videoPath == ""){
     DeviceEventEmitter.emit('onPictureTaken', resp);
   }else{
     resp.tagData = taggedData;
     resp.audioData = this.state.responseData.Audio;
     var filtered = this.state.musicArray.filter(function (el) {
       return el != '';
     });
     if (emitResponse == true) {
       emitResponse = false;
       resp.audioData = filtered;
       DeviceEventEmitter.emit('onVideoTaken', resp);
       DeviceEventEmitter.emit('onCameraPreviewMount', {});
     } 
     stickerActions.changeMuteStatus(true, false, (response) => {
    });
   }
 }
 
 
   onNext() {
     if(this.state.isStickerAdded){
       this.setState({isMusicProcessing:true})
         stickerActions.getMediaResponse((resp) => {
          this.setState({isMusicProcessing:false},()=>{
            this.postMetadataAppend(resp)
          })
         });
     }else{
       emitResponse = true
       if(this.state.videoPath == ""){
         this.postMetadataAppend(this.state.responseData)
       }else{
         stickerActions.getMediaDetails((resp) => {
           this.postMetadataAppend(resp)
         })
       }
     }
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
 
 revertBackEdits = () => {
   this.setState(
     {
       photoPath:"",
       videoPath:""
     });
 };
 
 
 
 onClosePressed() { 
      const CameraTypeDataPass = this.props.navigation.getParam(
       'cameraType',
     );
     stickerActions.playVideo(true)
     if(this.state.pickedFromGallery){
       this.revertBackEdits()
       if (this.state.videoPath != "" && !this.state.isGifAdded) {
         stickerActions.changeMuteStatus(true,false,(response)=>{
           this.props.navigation.goBack()
         })
       }else if(this.state.isGifAdded){ //Photo with gif
         this.props.navigation.navigate("CameraPreview")
       }else{
         this.props.navigation.goBack()
       } 
     } else {
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
       for (let index = 0; index < tagArray.length; index++) {
         const element = tagArray[index];
         if (!element.isFixed) {
           tagArray.splice(index, 1);
         }
       }
     } else {
           if (this.props.navigation.getParam('videoRetainDict') != null && this.state.videoPath != "") {
             this.props.navigation.state.params.onBack(
               this.props.navigation.getParam('videoRetainDict'),
               this.state.orientationLock,
             );
           }
           this.revertBackEdits()
            this.props.navigation.navigate('CameraPreview', {
              FinalEndData: CameraTypeDataPass,
            });
           
           if(this.state.videoPath != ""){
             stickerActions.changeMuteStatus(true,false,(response)=>{
               this.props.navigation.goBack()
             })
           }else{
           this.props.navigation.goBack()
           }
         if (this.state.IsVideoFromCamera) {
           DeviceEventEmitter.emit('onCameraPreviewMount', {});
         } else {
           DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
         }
       
       }
     }
   }
   
 DismissChild(data) {
      setTimeout(() => {
       this.setState({ toggleSticker: data })
   }, 100);
 }
 
 renderItem = ({item,index}) => {
   return (
     <View style={{width: 50, height: 50, marginRight: 5}}>
       {((this.state.videoPath == "" || this.state.isPhotoToVideo) && index < 4) && <BouncyView onPress={() => this.optionSelected(item.title)}>
           <Image style={styles.imageIcon} source={item.icon} />
         </BouncyView>
       }
       {this.state.videoPath != "" && !this.state.isPhotoToVideo &&
         <BouncyView onPress={() => this.optionSelected(item.title)}>
           <Image style={styles.imageIcon} source={item.icon} />
          </BouncyView>
       }
     </View>
   );
 };
 
 optionSelected = (item) => {
   console.log(item);
   if (item == 'Text') {
     this._onPressTextVisibleIcon()
   } else if (item == 'Sticker') {
     setTimeout(() => {
       this.setState({toggleSticker:true})
     }, 100);
   } else if (item == 'Tag') {
     this.setState({
       showTagList: true,
     });
   } else if (item == 'Music') {
  this.toggleMusicPicker();
 
  } else if (item == 'Slomo' && this.state.videoPath != "" && !this.state.isPhotoToVideo) {
    stickerActions.IsOverlayerAvailable(true, (IsWidgetAvailble) => {
      if (IsWidgetAvailble == true){
        stickerActions.changeMuteStatus(true, this.state.showMusicPicker, (resp) => {
          this.setState({ isMusicProcessing: true })
          stickerActions.getMediaResponse((resp) => {
            this.setState({ isMusicProcessing: false, IsSpeedEnable: true, IsSpeedViewShow:true, isGifAdded:true })
          });
         });
      }else{
        stickerActions.changeMuteStatus(true, this.state.showMusicPicker, (resp) => {
          this.setState({ isMusicProcessing: false, IsSpeedEnable: true, IsSpeedViewShow:true, isGifAdded:false })
        });
      }
    })    
   } else if (item == 'Tilt' && this.state.orientationCheck == 'landscape' && this.state.videoPath != "") {
     this.setState({
       IsTiltEnable: true,
     });
   } else if (
     item == 'Preview' &&
     this.state.orientationCheck == 'landscape' && this.state.videoPath != ""
   ) {
     this.setState({
       IsTiltPreview: true,
     });
   }
 };
 
 //START TRIMMER
 startTrimming = () => {
   setTimeout(() => {
     this.setState({
       showAudioTrimmer: false,
     },()=>{
       this.setState({
         isMusicProcessing: true
       })
     })
   }, 100);
   if(this.state.videoPath == ""){ //Photo with music
     CameraManager.syncExit();
     CameraManager.multiplePhotoToVideo([this.state.photoPath], (videoData) => {
       let videoDict = new Object();
       let videoFile = videoData.videoData.path;
       if (videoFile.includes('file://')) {
         videoDict.videoUrl = [videoFile];
       } else {
         videoDict.videoUrl = ['file://' + videoFile];
       }
       videoDict.musicUrl = this.state.musicUrlPath;
       videoDict.startTime = this.state.startTrimmerTime;
       CameraManager.mergeVideosWithSongPreview(
         videoDict,
         true,
         (respData) => {

           
           let arrVideo = new Array();
           arrVideo.push(respData.Video.path);
           this.setState(
             {
               videoPath: "file://" + respData.Video.path,
               IsVideoFromCamera: true,
               isMusicProcessing: false,
             },
             () => {
               stickerActions.changeMuteStatus(false,true,(resp)=>{
               });
               let dict = {
                 trackSynced: this.state.selectedTrack,
               };
               this.state.musicArray.push(dict);
             },
           );
         })
     });
   }else{//video with music
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
         showAudioTrimmer: false,
         audioData: videoDict,
       },
       () => {
         CameraManager.syncExit();
 
         CameraManager.mergeVideosWithSongPreview(
           videoDict,
           this.state.isPhotoToVideo,
           (respData) => {
             let arrVideo = new Array();
             arrVideo.push(respData.Video.path);
             this.setState(
               {
                 videoPath: "file://" + respData.Video.path,
                 IsVideoFromCamera: true,
                 isMusicProcessing: false,
               },
               () => {
                 stickerActions.changeMuteStatus(false,true,(resp)=>{
                 });
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
 }
 
 
 //RENDER
   render() {
    
         return (
           <SafeAreaView style={{flex: 1}}>
                 <MainView />
                 <Loader visibility={this.state.isMusicProcessing} />
                 <PhotoEditor imageUrl={ this.state.videoPath == "" ? this.state.photoPath : ""} videoUrl={this.state.videoPath} style = {{flex:1}}></PhotoEditor>
 
                 {!this.state.showTagList && !this.state.toggleSticker && !this.state.toggleMusicPicker &&<TouchableOpacity
                     style={[
                       styles.closeBtnContainer,
                       {
                         paddingLeft: 4,
                         zIndex: 999,
                       },
                     ]}
                     onPress={() => {
                         this.onClosePressed()
                     }}>
                     <Image
                       style={styles.close_icon}
                       source={Images.back_icon}
                     />
                   </TouchableOpacity>}
 
            
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
                   onPress={() => {
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
                     }
                   }}>
                   <Image
                     style={styles.close_icon}
                     source={Images.close_icon}
                   />
                 </TouchableOpacity>
               )}
               <View style={{position: 'absolute', right: 0, bottom: 23}}>
                 <TouchableOpacity
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
                      style={[styles.nextIcon]}
                      source={Images.next_video_icon}
                    />
                 </TouchableOpacity>
               </View>
             </View>
           )}
          {this.state.showTagList && <TouchableHighlight
                 ref={(refs) => (this.deleteBtn = refs)}
                 style={{
                   alignSelf: 'center',
                   position: 'absolute',
                   top: 10,
                   height: 60,
                   width: 60,
                   zIndex:2,
                   opacity: this.state.deleteOpacity,
                 }}
                 onPress={() => {
                   this.revertBackEdits();
                 }}>
                 <Image
                   style={[styles.imageIcon]}
                   source={Images.trash_icon}
                 />
               </TouchableHighlight>}
             
             {this.state.isfixTags &&
             tagArray.map((data, index) => {
               return this.renderFixedTags(data, index);
             })}
 
             {this.state.isTagged &&
             tagArray.map((data, index) => {
               return this.renderTagDraggable(data, index);
             })}
             
             {!this.state.showTagList && <View style={[styles.actionContainerLeft]}>
                 <BouncyView onPress={() => this.saveImageInLocal()}>
                   <Image
                     style={styles.imageIcon}
                     source={Images.savearrow_icon}
                   />
                 </BouncyView>
                 {!this.state.enableFullScreenEdit &&
                     <FlatList
                         style={[styles.flatListButtons,{marginLeft: this.state.videoPath == "" ? 13: 0}]}
                         nestedScrollEnabled={true}
                         showsHorizontalScrollIndicator={true}
                         horizontal={true}
                         data={
                           this.props.orientationCheck == 'portrait' 
                             ? PORTRAITDATA
                             : DATA
                         }
                         contentContainerStyle={{paddingRight: this.state.isStickerAdded ? 100 : 0}}
                         renderItem={this.renderItem}
                         keyExtractor={(item) => item.id}
                       />
                 }
                 {(!this.state.enableFullScreenEdit) && <View style={{width: this.state.isStickerAdded ? 80 : 10,height:2}}/>}
               </View>}
 
               <View style={styles.bottomSideView}>
                 {this.state.isStickerAdded && (
                   <TouchableOpacity
                     onPress={() => {
                       this.setState({ enableFullScreenEdit: !this.state.enableFullScreenEdit });
                     }}>
                     <Image
                       style={styles.visibleIcon}
                       source={this.state.enableFullScreenEdit ? Images.rightArrow : Images.leftArrow}
                     />
                   </TouchableOpacity>
               )}
               {!this.state.showTagList &&
                 <TouchableOpacity
                   onPress={() => {
                     emitResponse = true
                     this.onNext()
                   }}>
                   <Image
                     style={styles.nextIcon}
                     source={Images.next_video_icon}
                   />
                 </TouchableOpacity>
               }
                 </View>
 
 
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
                     textSelectedFont:font.value
                   })
                   stickerActions.updateFont(font.value)
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
                     txtColor: color == "#FFFFFF" ? "#000000" : color,
                   });
                 } else {
                   this.setState({
                     selectedColor: color,
                     backgroundColorText:
                       this.state.bgLevel == 1 ? color : color + '85',
                     txtColor: 'white',
                   });
                 }
                 stickerActions.updateColor(color,this.state.bgLevel)
               }}
               value={this.state.selectedColor}
               title={''}
             />
           </View>
         </View>
       )}
 
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
           orientation={
             this.state.orientationLock == false ? 'portrait' : 'landscape'
           }
           onBackdropPress={() => {
             this.setState({
               showAudioTrimmer: false,
             }, () => {
               this.cancelSync();
             })
           }}
           onModalWillHide={(startPressed, endPressed) => {
             if (startPressed) {
               this.startTrimming()
             }
             if (endPressed) {
               this.setState({
                 isMusicProcessing: false,
               });
               this.cancelSync();
             }
             this.cancelSync();
           }}
           getTrimmedStartValue={(value) => {
             this.onTrimmingChange(value);
           }}
         />
 
       <StickerPicker
         backPhotoEditor = { () => this.DismissChild() }
         visibility={this.state.toggleSticker}
         orientationValue={this.props.orientationCheck}
         onClosePressed={(sticker, isGif, width, height) => {
           this.setState({
               toggleSticker: false,
           }, () => {
               if(isGif){
                 this.setState({
                   isGifAdded: true
                 })
               }
               if(sticker == undefined){
                 this.setState({
                   toggleSticker: false
                 })
               }else{
                 this.setState({isStickerAdded:true})
                 stickerActions.addStickerWithImagePath(sticker, (resp) => {
                   this.setState({
                       photoPath:"",
                       videoPath:resp.path,
                   })
                 });
               }
           });
         }}
         onModalWillHide={(sticker) => {
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
   <Modal
           animationType="slide"
           transparent={true}
           visible={this.state.IsSpeedViewShow}
           onRequestClose={() => {
             Alert.alert("Modal has been closed.");
           }}
         >
         <View style={{flex:1}}>
           <SpeedView
            hasGif = {this.state.isGifAdded}
            audioInfo = {this.state.audioData} 
            sticker = {stickerActions}
            onClose ={()=> {
             stickerActions.changeMuteStatus(false, false, (resp) => {
               this.setState({IsSpeedViewShow:false})
             });
           }}
           >
           </SpeedView>
           </View>
         </Modal>
         </SafeAreaView>
       )
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
   modal: {  
       flex:1
  },  
 
 closeBtnContainer: {
     position: 'absolute',
     left: 10,
     top:10,
     paddingTop: 10,
     paddingRight: 10,
     paddingBottom: 10,
     paddingLeft: 10,
   },
   close_icon: {
     height: 24,
     width: 24,
     resizeMode:"contain"
 },
   
   doneBtnContainer: {
       position: 'absolute',
       top: 18,
       right: 12,
       paddingTop: 10,
       paddingRight: 10,
       paddingBottom: 10,  
     },
     done_text: {
       height: 24,
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
     bottom: 0,
     paddingLeft: 10,
     paddingRight: 10,
     flexDirection: 'row',
     minHeight:65,
     //justifyContent: 'space-between',
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
   imageIcon: {
     height: 32, 
     width: 32, 
     margin: 10, 
     marginBottom:0,
     resizeMode: 'contain'
   },
   visibleIcon:{
     height: 32, 
     width: 25, 
     marginTop:10,
     marginLeft:15,
     marginRight:5,
     resizeMode: 'contain'
   },
   bottomSideView:{
     flexDirection:"row", 
     position:"absolute",
     alignContent:"center",
     bottom:13,
     right:0,
     paddingBottom:10,
     zIndex:999,
   },
   flatListButtons:{
     flex: 1,
     height:65, 
   },
   nextIcon:{
     height: 32,
     width: 32,
     margin: 10, 
     marginBottom:0,
     marginLeft:0,
     marginRight:13,
     resizeMode: 'contain'
   }
 });
 
 const mapStateToProps = (state) => {
   const {orientationCheck} = state.CameraPreviewReducer;
   return {
     orientationCheck,
   };
 };
 
 
   export default connect(mapStateToProps, {
     saveVideoSegments,
   })(PhotoEditorView);