/**
 * Video player component
 */

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules,
} from "react-native";
import React, { Component } from "react";

const LitPicVideoPlayerComponent = requireNativeComponent("LitPicVideoPlayer");
const playerManager = NativeModules.LitPicVideoPlayerModule;

type EventCallbackArgumentsType = {
  nativeEvent: Object
};

export default class LitPicVideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  playVideo = () => {
    playerManager.playVideo(this._playerHandle);
  };

  pauseVideo = () => {
    playerManager.pauseVideo(this._playerHandle);
  };

  setStartingTime(time) {
    playerManager.setStartVideoPosition(this._playerHandle,time);
  }

  setStopTime(time) {
    playerManager.setStopVideoPosition(this._playerHandle,time);
  }

  unMountVideoPlayer(){
    playerManager.unMountVideoPlayer(this._playerHandle)
  }

  componentWillUnmount(){
    this.unMountVideoPlayer()
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._playerRef = ref;
      this._playerHandle = findNodeHandle(ref);
    } else {
      this._playerRef = null;
      this._playerHandle = null;
    }
  };

  render() {
    return (
      <LitPicVideoPlayerComponent ref={this._setReference} {...this.props} />
    );
  }
}
