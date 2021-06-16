import React, {Component} from 'react';
import {View, requireNativeComponent,   UIManager,
  findNodeHandle,  NativeModules,
  NativeEventEmitter,
  Text} from 'react-native';

const VideoTimeLinePreview = requireNativeComponent('VideoTimeLineView');
const VideoTimeLineManager = NativeModules.VideoTimeLineViewModule;

export default class VideoTimeLineView extends Component {
  constructor(props) {
    super(props);
  }

  saveVideo(){
    this.executeCommand("save_video",[]);
  }

  onNext(previewPlaybackParams){
    this.executeCommand("onNextClicked",[previewPlaybackParams]);
  }l̥

  componentWillUnmount() {
    this.landscapeListener.remove();
    this.previewUpdateListener.remove();
    this.loaderVisibilityListener.remove();
    this.videoPlaybackListener.remove();
    this.exportVideoListener.remove();
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(VideoTimeLineManager);
    this.landscapeListener = eventEmitter.addListener(
      'EventVideoSelectionRangeChanged',
      event => {
        console.log(event);
        this.props.seekTo(event);
      },
    );
    this.previewUpdateListener = eventEmitter.addListener(
      'UpdateVideoPreview',
      event => {
        console.log(event);
        this.props.updatePreview(event);
      },
    );

    this.loaderVisibilityListener = eventEmitter.addListener(
      'EventShowOrHideLoader',
      loaderMap =>{
        this.props.showOrHideLoader(loaderMap.showLoader);
      },
    );
    
    this.videoPlaybackListener = eventEmitter.addListener(
      'EventUpdateVideoPlayBack',
      event =>{
        console.log(event);
        this.props.updateVideoPlayback(event);
      }
    );

    this.exportVideoListener = eventEmitter.addListener(
      'EventExportVideo',
      event =>{
        this.props.exportVideo(event);
      });
  
  }

  executeCommand(command, params) {
    UIManager.dispatchViewManagerCommand(
      this._videoTimeLineViewHandle,
      command,
      params,
    );
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._videoTimeLineViewRef = ref;
      this._videoTimeLineViewHandle = findNodeHandle(ref);
    } else {
      this._videoTimeLineViewRef = null;
      this._videoTimeLineViewHandle = null;
    }
  };

  render() {
    return (
      <View style={{position: 'absolute', flex: 1, bottom: 0, left: 4,right:4,zIndex:10}}>
        <VideoTimeLinePreview ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
