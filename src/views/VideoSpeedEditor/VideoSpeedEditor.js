import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  Image,
} from 'react-native';
import {AdjustableExoPlayer, VideoTimeLineView} from '../../libs/litpic_sdk';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import {connect} from 'react-redux';
import {orientation} from '../../actions/cameraPreviewAction';
import {Loader} from '../../components/ViewComponents/Loader';
import {Images} from '../../res';

class VideoSpeedEditor extends Component {
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.state = {
      videoPath: props.navigation.getParam('videoPath', null),
      videoDetails: props.navigation.getParam('videoDetails', null),
      editedVideoPath: null,
      isVideoProcessing: false,
      previewPlaybackParams: null,
    };
  }

  componentDidMount() {
    try {
      BackHandler.addEventListener('hardwareBackPress', this.goBack);
    } catch (e) {
      console.log('catch->', e);
    }
  }

  componentWillUnmount() {
    this.releaseNativeListeners();
    try {
      BackHandler.removeEventListener('hardwareBackPress', this.goBack);
    } catch (e) {
      console.log('catch->', e);
    }
  }

  goBack() {
    try {
      if (!this.state.isVideoProcessing) {
        this.props.navigation.navigate('VideoEditor', {
          videoPath: this.state.videoPath,
          videoDetails: this.state.videoDetails,
          canMoveNext: false,
          finalPlayer: true,
        });
      }
      return true;
    } catch (e) {
      console.log('goback->', e);
    }
  }

  saveVideo() {
    console.log('saveVideo');
    this.videoTimeLineView.saveVideo();
  }

  exportVideo(event) {
    this.props.navigation.navigate('VideoEditor', {
      videoPath: event.videoPath,
      videoDetails: {},
      canMoveNext: false,
      finalPlayer: true,
    });
  }

  onNext() {
    if (this.state.previewPlaybackParams) {
      this.videoTimeLineView.onNext(this.state.previewPlaybackParams);
    } else {
      this.props.navigation.navigate('VideoEditor', {
        videoPath: this.state.videoPath,
        videoDetails: {},
        canMoveNext: false,
        finalPlayer: true,
      });
    }
  }

  releaseNativeListeners() {
    if (this.videoPlayer != null) {
      this.videoPlayer.releaseListeners();
    }
  }

  seekTo(event) {
    console.log('seek to ', event);
    if (this.videoPlayer != null) {
      this.videoPlayer.seekTo(event);
    }
  }

  updatePreview(event) {
    console.log('update preview ', event.videoPath);
    this.setState({editedVideoPath: event.videoPath});
    if (this.videoPlayer != null) {
      this.videoPlayer.updatePreview(event);
    }
  }

  updateVideoPlayback(event) {
    if (this.videoPlayer != null) {
      this.setState({previewPlaybackParams: event});
      this.videoPlayer.updatePreview(event);
    }
  }

  showOrHideLoader(showLoader) {
    this.setState({isVideoProcessing: showLoader});
  }

  render() {
    return (
      <View style={styles.container}>
        <BouncyView
          onPress={() => {
            this.goBack();
          }}>
          <View style={styles.backIcons}>
            <Image source={Images.close_icon} style={styles.backIcon} />
          </View>
        </BouncyView>
        <View style={styles.portraitView}>
          <View style={styles.portraitVideo}>
            <AdjustableExoPlayer
              ref={(ref) => (this.videoPlayer = ref)}
              style={styles.playerStyle}
              videoPath={this.state.videoPath}
              videoDetails={this.state.videoDetails}
              cropPosition={(xPosition) =>
                this.setState({cropPosition: xPosition})
              }
              loaderState={this.state.isVideoProcessing}
            />
          </View>
          <View style={styles.portraitTimeLine}>
            <VideoTimeLineView
              ref={(ref) => (this.videoTimeLineView = ref)}
              videoPath={this.state.videoPath}
              seekTo={(event) => this.seekTo(event)}
              updatePreview={(event) => this.updatePreview(event)}
              updateVideoPlayback={(event) => this.updateVideoPlayback(event)}
              exportVideo={(event) => this.exportVideo(event)}
              //videoDuration={this.state.videoDetails.videoDuration}
              style={styles.timerLinePortrait}
              showOrHideLoader={(showLoader) =>
                this.showOrHideLoader(showLoader)
              }
            />
          </View>
        </View>

        <View style={styles.actionContainerSave}>
          <TouchableOpacity onPress={() => this.onNext()}>
            <Image style={styles.imageIcon} source={Images.next_video_icon} />
          </TouchableOpacity>
        </View>
        <Loader visibility={this.state.isVideoProcessing} />
      </View>
    );
  }
}
const mapStateToProps = (state) => {
  const {orientationCheck} = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};
export default connect(mapStateToProps, {
  orientation,
})(VideoSpeedEditor);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backIcon: {
    paddingTop: 10,
    height: 20,
    width: 20,
  },
  playerStyle: {
    width: '100%',
    height: '100%',
  },
  timerLine: {
    width: '100%',
    height: 250,
  },
  timerLinePortrait: {
    width: '100%',
    height: 180,
  },
  portraitTimeLine: {
    marginLeft: 10,
    marginRight: 10,
    height: 200,
  },
  portraitView: {
    flex: 1,
  },
  portraitVideo: {
    flex: 4,
    margin: 20,
  },
  adjustableView: {
    justifyContent: 'center',
    flex: 1,
    margin: 10,
  },
  ViewStyle: {
    flex: 1,
    flexDirection: 'row',
  },
  timerLineView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backIcons: {
    paddingTop: 10,
    paddingLeft: 10,
  },
  actionContainerSave: {
    height: 40,
    alignSelf: 'flex-end',
  },
  imageIcon: {height: 25, width: 25, margin: 10},
});
