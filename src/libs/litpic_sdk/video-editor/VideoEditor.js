import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  UIManager,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const VideoEditorComponent = requireNativeComponent('VideoEditorAndroid');
const VideoEditorViewManager = NativeModules.VideoEditorViewModule;

export default class VideoEditor extends Component {
  constructor(props) {
    super(props);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._videoEditorRef = ref;
      this._videoEditorHandle = findNodeHandle(ref);
    } else {
      this._videoEditorRef = null;
      this._videoEditorHandle = null;
    }
  };

  addTextOverLay() {
    this.executeCommand("add_text_overlay", []);
  }

  onFontSelected(selectedFont) {
    this.executeCommand("change_text_font_overlay", [selectedFont]);
  }
  onTextColorChange(color) {
    this.executeCommand("change_text_color", [color]);
  }
  addStickerOverlay(imagePath) {
    this.executeCommand("add_image_sticker_overlay", [imagePath]);
  }

  addGifOverlay(gifPath) {
    this.executeCommand("add_gif_sticker_overlay", [gifPath]);
  }

  saveVideo() {
    this.executeCommand("save_video", []);
  }

  toggleShowCroppingView() {
    this.executeCommand("toggle_show_crop_preview", []);
  }

  onChangeTextBackground(background) {
    this.executeCommand("change_text_background_color", [background]);
  }

  onChangeTextAlignment(alignment) {
    this.executeCommand("change_text_alignment", [alignment]);
  }

  setAudioPath(audioPath) {
    this.executeCommand("audioPath", [audioPath]);
  }

  setVideoPath(videoPath) {
    this.executeCommand("videoPath", [videoPath]);
  }

  exportVideo() {
    this.executeCommand("exportVideo", []);
  }

  tagDraggable(tagArrayTemp) {
    this.executeCommand("tagUser", [tagArrayTemp]);
  }

  showTagTransView(showTransView){
    this.executeCommand("showTagTransparentView",[showTransView]);
  }

  setPreviousOverlayData(overlayDataList){
    this.executeCommand("restoreOverlay",overlayDataList);
  }

  playVideo(){
    this.executeCommand("playVideo",[]);
  }

  pauseVideo(){
    this.executeCommand("pauseVideo",[]);
  }

  getOverlayDataArray(callback){
    if(VideoEditorViewManager){
      VideoEditorViewManager.getOverlayDataArray(this._videoEditorHandle,callback);
    }
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(
      this._videoEditorHandle,
      command,
      params,
    );
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(VideoEditorViewManager);
    this.landscapeListener = eventEmitter.addListener(
      'EventLandscapeVideoCropping',
      (event) => {
        console.log(event);
        this.props.onCropping(event.xPosition);
      },
    );

    this.videoListener = eventEmitter.addListener(
      'EventGetVideoDetails',
      (videoDetails) => {
        console.log(videoDetails);
        this.props.videoDetails(videoDetails);
      },
    );

    this.videoSaveListener = eventEmitter.addListener(
      'EventOnVideoSaved',
      (videoDetails) => {
        console.log(videoDetails);
        this.props.onVideoSaved(videoDetails.videoPath);
      },
    );

    this.editedVideoPathListener = eventEmitter.addListener(
      'EventUpdateVideoPath',
      (updatedVideoDetails) => {
        this.props.updateVideoPath(updatedVideoDetails.videoPath);
      },
    );

    this.loaderVisibilityListener = eventEmitter.addListener(
      'EventShowOrHideLoader',
      (loaderMap) => {
        this.props.showOrHideLoader(loaderMap.showLoader);
      },
    );
    this.exportVideoListener = eventEmitter.addListener(
      'EventExportVideo',
      (videoDetails) => {
        this.props.onNext(videoDetails);
      },
    );

    this.eventTagPositionUpdate = eventEmitter.addListener(
      'EventUpdateClickedTagPosition',
      (tagPosUpdate) =>{
        this.props.tagUserPosClicked(tagPosUpdate);
      }
    );

    this.closeEditModeListener = eventEmitter.addListener(
      'EventCloseEditMode',
      () =>{
        this.props.closeEditMode();
      }
    );

    this.restoreOverlayListener = eventEmitter.addListener(
      'loadOverlayDataFromCache',
       () =>{
        this.props.restoreOverlay();
      }
    );
  }

  componentWillUnmount() {
    this.landscapeListener.remove();
    this.videoListener.remove();
    this.videoSaveListener.remove();
    this.editedVideoPathListener.remove();
    this.loaderVisibilityListener.remove();
    this.exportVideoListener.remove();
    this.eventTagPositionUpdate.remove();
    this.closeEditModeListener.remove();
    this.restoreOverlayListener.remove();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <VideoEditorComponent ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
