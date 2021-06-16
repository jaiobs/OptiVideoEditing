import React, { Component } from 'react';
import {
  View,
  requireNativeComponent,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const Trimming_Video = requireNativeComponent('Trimming_Video');
const Trimming_VideoManager = NativeModules.Trimming_VideoModule;

export default class TrimmingVideo extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(Trimming_VideoManager);

    this.videPickerListener = eventEmitter.addListener('PickVideo', (event) => {
      console.log('pickVideoz');
      this.props.pickVideoFromGallery();
    });

    this.eventSeekTo = eventEmitter.addListener('EventSeekToVideo', (event) => {
      this.props.seekTo(event.seekTo);
    });

    this.eventChangeVideo = eventEmitter.addListener('EventChangeVideo', (event) => {
      this.props.updateCurrentVideo(event);
    });
  }

  changeFilter(filterVal) {
    console.log("change Filter ",filterVal);
    Trimming_VideoManager.applyFilter(this._trimmingVideoHandle, filterVal);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._trimmingVideoRef = ref;
      this._trimmingVideoHandle = findNodeHandle(ref);
    } else {
      this._trimmingVideoRef = null;
      this._trimmingVideoHandle = null;
    }
  };

  trimVideo(callback) {
    Trimming_VideoManager.trimVideo(this._trimmingVideoHandle, callback);
  }

  showGalleryPicker() {
    this.props.getVideoFromGallery();
  }

  addVideosToTrimmer(videos) {
    Trimming_VideoManager.addVideoToTrimmer(this._trimmingVideoHandle, videos);
  }
  

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Trimming_Video ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
