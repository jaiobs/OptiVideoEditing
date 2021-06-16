import React, {Component} from 'react';
import {
  View,
  requireNativeComponent,
  NativeModules,
  findNodeHandle,
  NativeEventEmitter,
} from 'react-native';

const VideoTrimmerPreview = requireNativeComponent('VideoTrimmerPreviewNew');
const VideoTrimmerManager = NativeModules.VideoTrimmerModuleNew;

export default class VideoTrimmer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(VideoTrimmerManager);

    this.videPickerListener = eventEmitter.addListener('PickVideo', event => {
      console.log('pickVideoz');
      this.props.pickVideoFromGallery();
    });
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

  trimVideo(callback) {
    VideoTrimmerManager.trimVideo(this._trimmerHandle, callback);
  }

  showGalleryPicker() {
    this.props.getVideoFromGallery();
  }

  addVideosToTrimmer(videos) {
    VideoTrimmerManager.addVideoToTrimmer(this._trimmerHandle, videos);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <VideoTrimmerPreview ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
