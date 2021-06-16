import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  DeviceEventEmitter,
  UIManager,
  StyleSheet,
} from 'react-native';

const AudioTrimmerPreview = requireNativeComponent('AudioTrimmerDroid');

export default class AudioTrimmer extends Component {
  constructor(props) {
    super(props);
  }

  UNSAFE_componentWillMount() {
    this.initListeners();
  }

  initListeners() {
    this.audioStartPressListener = DeviceEventEmitter.addListener('onAudStartPressed', (audioData) => {
      this.props.onStartPressed(audioData);
    });

    this.onAudExitPressListener = DeviceEventEmitter.addListener('onAudExitPressed', (audioData) => {
      this.props.onExitPressed(audioData);
    });

    this.onAudioTrimmingListener = DeviceEventEmitter.addListener('onAudioTrimmingCompleted', (audioData) => {
      this.props.onTrimmingCompleted(audioData);
    });

    this.loaderVisibilityListener = DeviceEventEmitter.addListener(
      'EventShowOrHideLoader',
      (loaderMap) => {
        this.props.showOrHideLoader(loaderMap.showLoader);
      },
    );
  }

  componentWillUnmount() {
    this.audioStartPressListener.remove();
    this.onAudExitPressListener.remove();
    this.loaderVisibilityListener.remove();
    this.releaseNativeListeners();
  }

  onBackPressed(){
    this.executeCommand("onBackPressed",[]);
  }

  releaseNativeListeners(){
    this.executeCommand("releaseListeners",[]);
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(
      this._audioTrimmerHandle,
      command,
      params,
    );
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._audioTrimmerRef = ref;
      this._audioTrimmerHandle = findNodeHandle(ref);
    } else {
      this._audioTrimmerRef = null;
      this._audioTrimmerHandle = null;
    }
  };

  render() {
    return (
      <View style={styles.audio_trimmer}>
        <AudioTrimmerPreview ref={this._setReference} {...this.props} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  audio_trimmer: {
    position: 'absolute',
    flex: 1,
    bottom: 0,
    left: 4,
    right: 4,
    zIndex: 10,
  },
});
