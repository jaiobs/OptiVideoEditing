import React, { Component } from 'react';
import { View, requireNativeComponent, NativeEventEmitter, findNodeHandle, NativeModules, UIManager } from 'react-native';

const ImageCropperViewComponent = requireNativeComponent('ImageFilterEditor');
const ImageCropperViewManager = NativeModules.ImageFilterEditorModule;

export default class ImageCropperView extends Component {
  constructor(props) {
    super(props);
    const eventEmitter = new NativeEventEmitter(ImageCropperViewManager);
    this.eventListener = eventEmitter.addListener(
      'EventLandscapeImageCropping',
      event => {
        console.log(event);
        this.props.cropPosition(event.xPosition);
      },
    );
    this.eventOnNext = eventEmitter.addListener(
      'EventNextClicked',
      event => {
        this.props.onNext(event);
      }
    );
    this.loaderVisibilityListener = eventEmitter.addListener(
      'EventShowOrHideLoader',
      (loaderMap) => {
        this.props.showOrHideLoader(loaderMap.showLoader);
      },
    );
  }

  changeFilter(filterValues) {
    this.executeCommand("switchFilter", [filterValues]);
  }

  onNextClicked() {
    this.executeCommand("onNextClicked", []);
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(
      this._imagePreviewHandle,
      command,
      params,
    );
  }

  componentWillUnmount() {
    this.eventListener.remove();
    this.eventOnNext.remove();
    this.loaderVisibilityListener.remove();
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._ImagePreviewRef = ref;
      this._imagePreviewHandle = findNodeHandle(ref);
    } else {
      this._ImagePreviewRef = null;
      this._imagePreviewHandle = null;
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageCropperViewComponent ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
