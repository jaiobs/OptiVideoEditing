import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  UIManager,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const PhotoEditorPreview = requireNativeComponent('ImageEditorAndroid');
const ImageEditorViewModule = NativeModules.ImageEditorViewModule;

export default class PhotoEditor extends Component {
  constructor(props) {
    super(props);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._picEditorRef = ref;
      this._picEditorHandle = findNodeHandle(ref);
    } else {
      this._picEditorRef = null;
      this._picEditorHandle = null;
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
  addStickerOverlay(stickerUrl) {
    this.executeCommand("add_image_sticker_overlay", [stickerUrl]);
  }

  addGifOverlay(gifPath) {
    this.executeCommand("add_gif_sticker_overlay", [gifPath]);
  }

  saveImage(selectedTrack) {
    this.executeCommand("save_image", [selectedTrack]);
  }

  onChangeTextBackground(background) {
    this.executeCommand("change_text_background_color", [background]);
  }

  onChangeTextAlignment(alignment) {
    this.executeCommand("change_text_alignment", [alignment]);
  }

  toggleShowCroppingView() {
    this.executeCommand("toggle_show_crop_preview", []);
  }

  setAudioPath(audioPath) {
    this.executeCommand("audioPath", [audioPath]);
  }

  exportImage() {
    this.executeCommand("exportImage", []);
  }

  tagDraggable(tagArrayTemp) {
    this.executeCommand("tagUser", [tagArrayTemp]);
  }

  showTagTransView(showTransView){
    this.executeCommand("showTagTransparentView",[showTransView]);
  }

  onClosePressed(){
    this.executeCommand("onClosePressed",[]);
  }

  releaseNativeListeners(){
    this.executeCommand("releaseListeners",[]);
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(
      this._picEditorHandle,
      command,
      params,
    );
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(ImageEditorViewModule);
    this.landscapeListener = eventEmitter.addListener(
      'EventLandscapeImageCropping',
      (event) => {
        console.log(event);
        this.props.onCropping(event.xPosition);
      },
    );

    this.imageSaveListener = eventEmitter.addListener(
      'onImageSaved',
      (event) => {
        console.log(event);
        this.props.onImageSaved(event.imagePath);
      },
    );

    this.videoSaveListener = eventEmitter.addListener(
      'EventOnVideoSaved',
      (event) => {
        console.log(event);
        this.props.onImageSaved(event.videoPath);
      },
    );

    this.loaderVisibilityListener = eventEmitter.addListener(
      'EventShowOrHideLoader',
      (loaderMap) => {
        this.props.showOrHideLoader(loaderMap.showLoader);
      },
    );

    this.exportVideoListener = eventEmitter.addListener(
      'EventExportImage',
      (imageDetails) => {
        this.props.onNext(imageDetails);
      },
    );

    this.eventMoveVideoForEdit = eventEmitter.addListener(
      'EventMoveVideoForEdit',
      (videoDetails) =>{
        this.props.onMoveVideoToEdit(videoDetails);
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
  }

  componentWillUnmount() {
    this.landscapeListener.remove();
    this.imageSaveListener.remove();
    this.videoSaveListener.remove();
    this.loaderVisibilityListener.remove();
    this.exportVideoListener.remove();
    this.eventMoveVideoForEdit.remove();
    this.eventTagPositionUpdate.remove();
    this.closeEditModeListener.remove();
    this.releaseNativeListeners();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <PhotoEditorPreview ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
