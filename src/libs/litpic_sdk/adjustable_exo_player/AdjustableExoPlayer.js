import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const AdjustableExoVideoPlayer = requireNativeComponent('AdjustableExoVideoPlayer');
const AdjustableExoVideoPlayerManager = NativeModules.AdjustableExoVideoPlayerModule;

export default class AdjustableExoPlayer extends Component {
  constructor(props) {
    super(props);
    const eventEmitter = new NativeEventEmitter(AdjustableExoVideoPlayerManager);
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
    AdjustableExoVideoPlayerManager.seekToPosition(this._trimmerHandle, event);
  }

  updatePreview(event){
    console.log("adjustable player update preview ",event);
    AdjustableExoVideoPlayerManager.updatePreviewVideo(this._trimmerHandle, event);
  }

  releaseListeners(){
    AdjustableExoVideoPlayerManager.releaseListeners(this._trimmerHandle);
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
        <AdjustableExoVideoPlayer ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
