import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  NativeModules,
  findNodeHandle,
} from 'react-native';

const VideoPlayerPreview = requireNativeComponent('VideoPlayerPreview');
const VideoPlayerManager = NativeModules.VideoPlayerModule;

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.unMountPlayer();
  }
  unMountPlayer() {
    if (this._videoPlayerHandle) {
      VideoPlayerManager.unMountPlayer(this._videoPlayerHandle);
    }
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._videoPlayerRef = ref;
      this._videoPlayerHandle = findNodeHandle(ref);
    } else {
      this._videoPlayerRef = null;
      this._videoPlayerHandle = null;
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <VideoPlayerPreview ref={this._setReference}
        //  videoPath = {this.state.videoPath}
        //  videoDetails = {this.state.videoDetails}
         {...this.props} />
      </View>
    );
  }
}
