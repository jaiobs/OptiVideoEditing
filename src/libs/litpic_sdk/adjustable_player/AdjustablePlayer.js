import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const AdjustableVideoPlayer = requireNativeComponent('AdjustableVideoPlayer');
const AdjustableVideoPlayerManager = NativeModules.AdjustableVideoPlayerModule;

export default class AdjustablePlayer extends Component {
  constructor(props) {
    super(props);
    const eventEmitter = new NativeEventEmitter(AdjustableVideoPlayerManager);
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
    AdjustableVideoPlayerManager.seekToPosition(this._trimmerHandle, event);
  }

  updatePreview(event){
    console.log("adjustable player update preview ",event);
    AdjustableVideoPlayerManager.updatePreviewVideo(this._trimmerHandle, event);
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
        <AdjustableVideoPlayer ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
