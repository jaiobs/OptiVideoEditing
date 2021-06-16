/**
 * Video player screen
 * created by vigneshwaran.n@optisolbusiness.com
 * last edited: 24/12/19
 */

import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {Images, Colors} from '../../res';
import {connect} from 'react-redux';
import {onVideoTaken} from '../../actions/cameraPreviewAction';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import {
  AdjustableVideoPlayer,
  getVideoDetails,
  saveVideoInInternalStorage,
} from '../../libs/litpic_sdk';

class VideoPlayerView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: props.navigation.getParam('filter', {}),
      videoPath: props.navigation.getParam('videoPath', null),
      isCanMoveNext: props.navigation.getParam('canMoveNext', true),
      finalPlayer: props.navigation.getParam('finalPlayer', false),
      videoDetails: props.navigation.getParam('videoDetails', null),
      showCropperView: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.onClosePressed();
    return true;
  }

  //on pressing next
  onNext() {
    if (this.state.finalPlayer) {
      this.props.navigation.navigate('ScrollablePlayer', {
        videoPath: this.state.videoPath,
        filterConfig: this.state.filterConfig,
        isCanMoveNext: false,
        videoDetails: this.state.videoDetails,
        cropPosition: this.state.cropPosition,
      });
    } else {
      this.props.navigation.navigate('VideoEditor', {
        videoPath: this.state.videoPath,
        isCanMoveNext: this.state.isCanMoveNext,
        videoDetails: this.state.videoDetails,
      });
    }
  }

  //toggle cropper view for cropping landscape video

  getVideoDetails(videoPath) {
    getVideoDetails(this.state.videoPath, videoData => {
      this.props.onVideoTaken(videoData);
    });
  }

  onClosePressed() {
    this.props.navigation.navigate('CameraPreview');
  }

  //show video speed editor
  showVideoSpeedEditor() {
    this.props.navigation.navigate('VideoSpeedEditor', {
      videoPath: this.state.videoPath,
      videoDetails: this.state.videoDetails,
    });
  }

  saveVideoLocal() {
    saveVideoInInternalStorage(this.state.videoPath, videoData => {
      ToastAndroid.show(
        'Video saved in storage: ' + videoData.video_path,
        ToastAndroid.SHORT,
      );
      this.getVideoDetails(videoData.video_path);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <AdjustableVideoPlayer
          ref={ref => {
            this.videoPlayer = ref;
          }}
          style={styles.playerStyle}
          videoPath={this.state.videoPath}
          videoDetails={this.state.videoDetails}
          cropPosition={xPosition => this.setState({cropPosition: xPosition})}
        />

        {this.state.finalPlayer && (
          <View style={styles.actionContainerLeft}>
            <TouchableOpacity>
              <Image style={styles.imageIcon} source={Images.text_icon} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image style={styles.imageIcon} source={Images.sticker_icon} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image style={styles.imageIcon} source={Images.tag_icon} />
            </TouchableOpacity>

            <BouncyView onPress={() => this.showVideoSpeedEditor()}>
              <Image style={styles.imageIcon} source={Images.slowmotion_icon} />
            </BouncyView>

            <TouchableOpacity>
              <Image style={styles.imageIcon} source={Images.music_icon} />
            </TouchableOpacity>
          </View>
        )}

        {this.state.finalPlayer && (
          <View style={styles.actionContainerBottom}>
            <TouchableOpacity onPress={() => this.saveVideoLocal()}>
              <Image style={styles.imageIcon} source={Images.savearrow_icon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onNext()}>
              <Image style={styles.imageIcon} source={Images.next_video_icon} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerContainer}>
          {this.state.isCanMoveNext && (
            <TouchableOpacity
              style={styles.nextBtnContainer}
              onPress={() => this.onNext()}>
              <Image
                style={styles.video_next}
                source={Images.next_video_icon}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.closeBtnContainer}
            onPress={() => this.onClosePressed()}>
            <Image style={styles.video_next} source={Images.close_icon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  playerStyle: {
    flex: 1,
    width: '98%',
    height: '100%',
    alignSelf: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  footerContainer: {},
  closeBtnContainer: {
    padding: 4,
  },
  nextBtnContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  video_next: {
    height: 24,
    width: 24,
  },
  actionContainerLeft: {position: 'absolute', right: 0, top: 45},
  actionContainerBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageIcon: {height: 32, width: 32, margin: 10},
});

export default connect(
  null,
  {
    onVideoTaken,
  },
)(VideoPlayerView);
