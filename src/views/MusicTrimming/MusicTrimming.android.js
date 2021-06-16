import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {getTrendingSongs, searchSongs} from '../../actions/MusicActions';
import {Images, Colors} from '../../res';
import {AudioTrimmer, AddMusicToVideo, AdjustableVideoPlayer} from '../../libs/litpic_sdk';
import MusicPicker from '../Music/MusicPicker';

class MusicTrimming extends Component {
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.state = {
      videoPath: props.navigation.getParam('videoPath', null),
      videoDetails: props.navigation.getParam('videoDetails', null),
      showMusicPicker: false,
      currentSelectedTrack: null,
      currentAudioPath: '',
      currentTrack: null,
      songSelection: {},
    };
  }

  componentDidMount() {
    //get the trending songs
    try {
      BackHandler.addEventListener('hardwareBackPress', this.goBack);
    } catch (e) {
      console.log('catch->', e);
    }
  }

  componentWillUnmount() {
    try {
      BackHandler.removeEventListener('hardwareBackPress', this.goBack);
    } catch (e) {
      console.log('catch->', e);
    }
  }

  goBack() {
    try {
      if (this.state.showMusicPicker) {
        this.setState({showMusicPicker: false});
      } else if (!this.state.isVideoProcessing) {
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

  onSongSelected(track) {
    this.setState({
      currentSelectedTrack: track,
      currentTrack: track,
      songSelection: track,
      showMusicPicker: false,
    });
  }

  addMusic() {
    this.setState({showMusicPicker: true});
  }
  onNext() {
    alert('sample');
  }

  onAudioTrimmingCompleted(audioPath) {
    this.setState({isVideoProcessing: false});
    if (audioPath != null) {
      this.setState({
        currentAudioPath: audioPath,
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backIcons}
          onPress={() => this.goBack()}>
          <Image source={Images.close_icon} style={styles.backIcon} />
        </TouchableOpacity>
        {this.props.orientationCheck === 'portrait' ? (
          <View style={styles.container}>
            <AdjustableVideoPlayer
              ref={(ref) => {
                this.videoPlayer = ref;
              }}
              style={styles.playerStyle}
              videoPath={this.state.videoPath}
              videoDetails={this.state.videoDetails}
              cropPosition={(xPosition) =>
                this.setState({cropPosition: xPosition})
              }
            />

            <View style={styles.portraitAddMusic}>
              <AddMusicToVideo
                ref={(ref) => {
                  this.AddMusicToVideo = ref;
                }}
                style={styles.MusicTrimming}
                videoPath={this.state.videoPath}
                currentAudioPath={this.state.currentAudioPath}
              />
            </View>
          </View>
        ) : (
          <View style={styles.landscapeContainer}>
            <View style={styles.landscapePlayer}>
              <AdjustableVideoPlayer
                ref={(ref) => {
                  this.videoPlayer = ref;
                }}
                style={styles.playerStyle}
                videoPath={this.state.videoPath}
                videoDetails={this.state.videoDetails}
                cropPosition={(xPosition) =>
                  this.setState({cropPosition: xPosition})
                }
              />
            </View>
            <View style={styles.landscapeAddMusic}>
              <View style={styles.musicToVideo}>
                <AddMusicToVideo
                  ref={(ref) => {
                    this.AddMusicToVideo = ref;
                  }}
                  style={styles.MusicTrimming}
                  videoPath={this.state.videoPath}
                  currentAudioPath={this.state.currentAudioPath}
                />
              </View>
            </View>
          </View>
        )}
        {this.state.currentTrack != null && (
          <AudioTrimmer
            ref={(ref) => {
              this.audioTrimmer = ref;
            }}
            title={this.state.currentSelectedTrack.title}
            avatar={this.state.currentSelectedTrack.artwork_url}
            trackUrl={this.state.currentSelectedTrack.stream_url}
            author={this.state.currentSelectedTrack.user.username}
            style={styles.audio_trimer}
            onStartPressed={(aud) => {
              console.log('STARTED');
              this.setState({currentTrack: null});
            }}
            onExitPressed={(aud) => {
              console.log('EXITPRESSED');
              this.setState({currentTrack: null});
            }}
            onTrimmingCompleted={(aud) => {
              console.log('COMPLETED', aud);
              this.onAudioTrimmingCompleted(aud.audioPath);
            }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
          />
        )}
        <MusicPicker
          visible={this.state.showMusicPicker}
          onClosePressed={() => this.goBack()}
          onSongSelected={(track) => this.onSongSelected(track)}
          playMusic={(track) => {}}
          pauseMusic={() => {}}
          isCancelSyncShow={this.state.currentSelectedTrack != null}
          cancelSync={() => {
            this.onCancelSyncPress();
          }}
        />
        <View style={styles.addButton}>
          <View style={styles.musicButton}>
            <TouchableOpacity
              onPress={() => this.addMusic()}
              style={styles.add_button}>
              <Text style={styles.music}> Music</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.next}>
            <TouchableOpacity onPress={() => this.onNext()}>
              <Image style={styles.nextIcon} source={Images.next_video_icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  audio_trimer: {
    height: 260,
  },
  landscapePlayer: {
    flex: 1,
    marginTop: 10,
    alignContent: 'center',
    justifyContent: 'center',
  },
  music: {
    color: 'white',
  },
  portraitAddMusic: {
    height: 100,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  add_button: {
    height: 35,
    width: 100,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeAddMusic: {
    flex: 1,
    justifyContent: 'center',
  },
  musicToVideo: {
    height: 200,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  next: {
    width: 40,
    marginRight: 15,
    height: '100%',
    justifyContent: 'flex-end',
  },
  backIcon: {
    height: 20,
    width: 20,
  },
  musicButton: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 60,
  },
  backIcons: {
    zIndex: 1,
    position: 'absolute',
    marginLeft: 10,
    marginTop: 20,
  },
  imageIcon: {
    height: '100%',
    width: '100%',
  },
  nextIcon: {height: 30, width: 30, margin: 10},

  container: {
    flex: 1,
  },
  imageSize: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  addButton: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerStyle: {
    flex: 1,
    marginBottom: 20,
    marginTop: 20,
  },
  MusicTrimming: {
    height: 100,
  },
});

const mapStateToProps = (state) => {
  const {orientationCheck} = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(mapStateToProps, {getTrendingSongs, searchSongs})(
  MusicTrimming,
);
