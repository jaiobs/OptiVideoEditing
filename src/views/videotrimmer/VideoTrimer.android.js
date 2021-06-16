/**
 * Video trimmer screen
 * created by vigneshwaran.n@optisolbusiness.com
 * last edited: 16/6/2020
 */

import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
} from 'react-native';
import {TrimmingVideo, GPUFilterVideoExoPlayer} from '../../libs/litpic_sdk';

import {Images, Colors} from '../../res';
import {Loader} from '../../components/ViewComponents/Loader';
import FilterTypes from '../../libs/livefilter/FilterTypes';
import GalleryPicker from '../../components/ViewComponents/GalleryPicker/';
import {compressVideo} from '../../libs/ffmpeg';
import TouchableFilterChanger from '../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger';
import {connect} from 'react-redux';

class VideoTrimer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterConfig: FilterTypes.Normal,
      videoFiles: props.navigation.getParam('videoFiles', []),
      isCanMoveNext: true,
      currentVideoPosition: 0,
      currentVideoPath: props.navigation.getParam('videoFiles', [])
        ? props.navigation.getParam('videoFiles')[0].videoPath
        : '',
      isPlaying: true,
      trimmingTime: null,
      isProcessing: false,
      showGalleryPicker: false,
      seekToPosition: -1,
      width: Dimensions.get('window').width,
      currentFilter: 1,
      filter: FilterTypes.Normal,
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
    if (!this.state.isProcessing) {
      this.onClosePressed();
    }
    return true;
  }

  onClosePressed() {
    this.props.navigation.navigate('CameraPreview');
  }

  onVideoPickedFromTheGallery(item) {
    this._trimmingVideoRef.addVideosToTrimmer(item);
  }

  toggleViewGalleryPicker() {
    this.setState({showGalleryPicker: true});
  }

  addVideosToTrimmer(videoFiles) {
    this._trimmingVideoRef.addVideosToTrimmer(videoFiles);
    this.setState({showGalleryPicker: false});
  }

  onNext() {
    this.setState({isProcessing: true});
    this._trimmingVideoRef.trimVideo((resp) => {
      if (resp.videoPath && resp.videoPath != '') {
        this.setState({isProcessing: false}, () => {
          this.props.navigation.navigate('VideoEditor', {
            videoPath: resp.videoPath,
            canMoveNext: false,
            finalPlayer: true,
          });
        });
      }
    });
  }

  compress(respVideo) {
    compressVideo(respVideo.videoPath, (resp) => {
      if (resp.videoPath && resp.videoPath != '') {
        this.setState({isProcessing: false}, () => {
          this.props.navigation.navigate('VideoEditor', {
            videoPath: resp.videoPath,
            canMoveNext: false,
            finalPlayer: true,
          });
        });
      }
    });
  }

  clearFilter = (item) => {
    this.setState({reset_filter: item});
  };

  changeFilterValues(filterValues) {
    const {currentFilter, filter, filterConfig} = filterValues;
    this.setState({currentFilter, filter, filterConfig});
    this.changeFilter(filter);
  }

  changeFilter(filterVal) {
    this.videoPlayer.changeFilter(filterVal);
    this._trimmingVideoRef.changeFilter(filterVal);
    this.setState({filter: filterVal});
  }

  render() {
    return (
      <View style={styles.container}>
        <GalleryPicker
          width={this.state.width}
          visibility={this.state.showGalleryPicker}
          rowItems={this.props.orientationCheck === 'landscape' ? 4 : 3}
          orientation={this.props.orientationCheck}
          onPictureSelected={(image) => {
            this.onImagePickedFromTheGallery(image);
          }}
          onDonePressed={(videoFiles) => {
            this.addVideosToTrimmer(videoFiles);
          }}
          onClosePressed={() => this.setState({showGalleryPicker: false})}
        />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.closeBtnContainer}
            onPress={() => this.onClosePressed()}>
            <Image style={styles.video_next} source={Images.close_icon} />
          </TouchableOpacity>
        </View>
        {this.props.orientationCheck === 'portrait' ? (
          <View style={styles.portraitTrimmer}>
            <GPUFilterVideoExoPlayer
              ref={(ref) => (this.videoPlayer = ref)}
              style={styles.playerStyle}
              videoPath={this.state.currentVideoPath}
              videoDetails={
                this.state.videoFiles[this.state.currentVideoPosition]
              }
              seekTo={this.state.seekToPosition}
              cropPosition={(xPosition) =>
                this.setState({cropPosition: xPosition})
              }
              loaderState={this.state.isProcessing}
            />
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}>
              <TouchableFilterChanger
                orientation={'portrait'}
                reset_filter={this.state.reset_filter}
                interval={this.state.interval}
                clearFilter={(item) => this.clearFilter(item)}
                onFilterValuesChanged={(filterValues) =>
                  this.changeFilterValues(filterValues)
                }
              />
              <View
                style={[
                  styles.filter_view,
                  {
                    marginTop:
                      this.props.orientationCheck === 'portrait' ? 40 : 15,
                  },
                ]}>
                <Text style={styles.filter_text}>tap screen for filters</Text>
                <Text style={styles.filter_name}>{this.state.filter.name}</Text>
              </View>
            </View>
            <View style={{height: 230}}>
              <TrimmingVideo
                ref={(ref) => (this._trimmingVideoRef = ref)}
                style={{height: 230, margin: 4}}
                videoPath={this.state.videoFiles[0].videoPath}
                seekTo={(seekToPosition) =>
                  this.setState({seekToPosition: seekToPosition})
                }
                updateCurrentVideo={(videoMap) =>
                  this.setState({
                    currentVideoPath: videoMap.videoPath,
                    currentPosition: videoMap.currentPosition,
                  })
                }
                videoDetails={this.state.videoFiles}
                getVideoFromGallery={() =>
                  this.setState({showGalleryPicker: true})
                }
                pickVideoFromGallery={() => this.toggleViewGalleryPicker()}
              />
            </View>
          </View>
        ) : (
          <View style={styles.landscapeTrimmer}>
            <View style={{flex: 1, margin: 10}}>
              {
                <GPUFilterVideoExoPlayer
                  ref={(ref) => (this.videoPlayer = ref)}
                  style={styles.playerStyle}
                  videoPath={this.state.currentVideoPath}
                  videoDetails={
                    this.state.videoFiles[this.state.currentVideoPosition]
                  }
                  seekTo={this.state.seekToPosition}
                  cropPosition={(xPosition) =>
                    this.setState({cropPosition: xPosition})
                  }
                  loaderState={this.state.isProcessing}
                />
              }
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}>
                <TouchableFilterChanger
                  orientation={'portrait'}
                  reset_filter={this.state.reset_filter}
                  interval={this.state.interval}
                  clearFilter={(item) => this.clearFilter(item)}
                  onFilterValuesChanged={(filterValues) =>
                    this.changeFilterValues(filterValues)
                  }
                />
                <View
                  style={[
                    styles.filter_view,
                    {
                      marginTop:
                        this.props.orientationCheck === 'portrait' ? 40 : 15,
                    },
                  ]}>
                  <Text style={styles.filter_text}>tap screen for filters</Text>
                  <Text style={styles.filter_name}>
                    {this.state.filter.name}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                paddingTop: 20,
                flex: 1,
              }}>
              <TrimmingVideo
                ref={(ref) => (this._trimmingVideoRef = ref)}
                style={{height: 230, margin: 4}}
                videoPath={this.state.videoFiles[0].videoPath}
                seekTo={(seekToPosition) =>
                  this.setState({seekToPosition: seekToPosition})
                }
                updateCurrentVideo={(videoMap) =>
                  this.setState({
                    currentVideoPath: videoMap.videoPath,
                    currentPosition: videoMap.currentPosition,
                  })
                }
                videoDetails={this.state.videoFiles}
                getVideoFromGallery={() =>
                  this.setState({showGalleryPicker: true})
                }
                pickVideoFromGallery={() => this.toggleViewGalleryPicker()}
              />
            </View>
          </View>
        )}

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.nextBtnContainer}
            onPress={() => this.onNext()}>
            <Image style={styles.video_next} source={Images.next_video_icon} />
          </TouchableOpacity>
        </View>

        <Loader visibility={this.state.isProcessing} />
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
export default connect(mapStateToProps, {})(VideoTrimer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.black,
  },
  playerStyle: {
    flex: 1,
    margin: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {},
  footerContainer: {},
  nextBtnContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  closeBtnContainer: {
    alignSelf: 'flex-start',
    margin: 10,
  },

  portraitTrimmer: {
    flex: 1,
  },
  landscapeTrimmer: {
    flex: 1,
    flexDirection: 'row',
  },
  bottomScrollImage: {
    width: 70,
    padding: 10,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageSize: {
    width: '100%',
    height: '100%',
  },
  timerLine: {
    width: '100%',
    height: 250,
  },
  video_next: {
    height: 24,
    width: 24,
  },
  play_icon: {
    height: 48,
    width: 48,
  },
  filter_view: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  filter_name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 0},
    textShadowRadius: 10,
  },
  filter_text: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 0},
    textShadowRadius: 10,
  },
});
