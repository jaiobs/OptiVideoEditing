import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const GPUFilterVideoPlayer = requireNativeComponent('GPUFilterVideoPlayerManager');
const GPUFilterVideoPlayerManager = NativeModules.GPUFilterVideoPlayerModule;

export default class GPUFilterVideoExoPlayer extends Component {
  constructor(props) {
    super(props);
    const eventEmitter = new NativeEventEmitter(GPUFilterVideoPlayerManager);
    this.eventListener = eventEmitter.addListener(
      'EventLandscapeVideoCropping',
      event => {
        console.log(event);
        this.props.cropPosition(event.xPosition);
      },
    );
  }

  seekTo(event){
    console.log("adjustable player start position- ",event);
    GPUFilterVideoPlayerManager.seekToPosition(this._trimmerHandle, event);
  }

  updatePreview(event){
    console.log("adjustable player update preview ",event);
    GPUFilterVideoPlayerManager.updatePreviewVideo(this._trimmerHandle, event);
  }

  changeFilter(filterVal) {
    GPUFilterVideoPlayerManager.applyFilter(this._trimmerHandle, filterVal);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._trimmerRef = ref;
      this._trimmerHandle = findNodeHandle(ref);
    } else {
      this._trimmerRef = null;
      this._trimmerHandle = null;
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <GPUFilterVideoPlayer ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
