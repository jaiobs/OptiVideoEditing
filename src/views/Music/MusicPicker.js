import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';
import {getTrendingSongs, searchSongs} from '../../actions/MusicActions';
import Modal from 'react-native-modal';
import {Loader} from '../../components/ViewComponents/Loader';
import {Images, Colors} from '../../res';

const streamAudio = NativeModules.StreamingAudioPlayerModule;

class MusicPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      currentTrackItem: 0,
      isBuffering: false,
      isProcessing: false,
      isResetList: false,
    };
  }

  componentDidMount() {
    //get the trending songs
    this.setState({isProcessing: true, tracks: []}, () => {
      this.props.getTrendingSongs();
    });
    this.initListener();
  }

  componentWillUnmount(){
    streamAudio.releaseListeners();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    //getting track
    if (
      nextProps.trackList.tracks !== undefined &&
      nextProps.trackList.tracks.length > 0 &&
      nextProps.trackList.tracks !== this.props.trackList.tracks
    ) {
      this.setState({tracks: nextProps.trackList.tracks}, () => {
        this.setState({isProcessing: false});
      });
    }
  }

  initListener() {
    DeviceEventEmitter.addListener('onBufferingUpdate', (onBufferData) => {
      if (this.state.isBuffering) {
        this.setState({isBuffering: false});
      }
    });
  }

  onPlayPausePressed(track) {
    console.log('onPlayPausePressed-->', track);
    let url = track.stream_url;
    if (this.state.currentTrackItem === track.id && !this.state.isBuffering) {
      // pause music
      this.setState({currentTrackItem: 0});
      streamAudio.pauseAudio();
    } else {
      //play music
      this.setState({currentTrackItem: track.id});
      this.setState({isBuffering: true});
      streamAudio.playAudio(url);
    }
  }

  onSongSelected(song) {
    streamAudio.stopAudio();
    this.props.onSongSelected(song);
    this.setState({currentTrackItem: 0});
    DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
  }

  renderTrackItem(item) {
    let songTrack = this.state.currentTrackItem;

    return (
      <TouchableOpacity
        style={styles.trackItemContainer}
        onPress={() => this.onPlayPausePressed(item)}>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 10,
            alignItems: 'center',
          }}>
          <Image
            style={{height: 70, width: 70}}
            source={{uri: item.artwork_url}}
          />
          <View style={styles.trackTextContent}>
            <Text style={styles.trackTitle}>{item.title}</Text>

            <Text style={{color: 'gray', marginTop: 4, fontSize: 10}}>
              {item.user.username}
            </Text>
          </View>

          <TouchableOpacity onPress={() => this.onPlayPausePressed(item)}>
            <Image
              style={styles.playIcon}
              source={
                songTrack == item.id
                  ? Images.audio_pause_icon
                  : Images.audio_play_icon
              }
            />
          </TouchableOpacity>

          {this.state.currentTrackItem == item.id && (
            <TouchableOpacity
              onPress={() => this.onSongSelected(item)}
              style={{
                backgroundColor: !this.state.isBuffering
                  ? Colors.primaryAccent
                  : 'black',
                marginLeft: 10,
                marginRight: 1,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 10,
                  paddingLeft: 25,
                  paddingRight: 25,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                {!this.state.isBuffering ? 'add' : '       '}
              </Text>
            </TouchableOpacity>
          )}

          {this.state.currentTrackItem != item.id && (
            <TouchableOpacity
              style={{
                backgroundColor: 'black',
                marginLeft: 10,
                marginRight: 1,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 10,
                  paddingLeft: 25,
                  paddingRight: 25,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                add
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{backgroundColor: 'white', height: 1, width: '100%'}} />
      </TouchableOpacity>
    );
  }

  //search songs
  searchSongs(query) {
    this.setState({isResetList: true});
    this.props.searchSongs(query);
  }

  closePicker() {
    streamAudio.stopAudio();
    this.props.onClosePressed();
    if (this.state.isResetList) {
      this.props.getTrendingSongs();
      this.setState({isResetList: false});
    }
    this.setState({isBuffering: false, currentTrackItem: 0});
  }

  onCancelSyncPressed() {
    this.props.cancelSync();
    this.closePicker();
  }

  render() {
    return (
      <Modal
        isVisible={this.props.visible}
        onRequestClose={() => {
          this.closePicker();
        }}
        style={styles.container}>
        {/* TITLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Music</Text>
        </View>

        {/* SEARCH INPUT */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputBox}>
            <TextInput
              placeholder="Search"
              placeholderTextColor="white"
              style={styles.searchInput}
              onChangeText={(query) => {
                this.searchSongs(query);
              }}
            />
          </View>

          {this.props.isCancelSyncShow && (
            <TouchableOpacity
              onPress={() => {
                this.onCancelSyncPressed();
              }}>
              <Text style={styles.cancelSyncText}>cancel sync</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              this.closePicker();
            }}>
            <Image style={styles.closeIcon} source={Images.close_icon} />
          </TouchableOpacity>
        </View>

        {/* SEARCH LIST */}
        <FlatList
          style={styles.trackListStyle}
          data={this.state.tracks}
          renderItem={({item}) => this.renderTrackItem(item)}
          keyExtractor={(item) => item.id}
          initialNumToRender={20}
        />
        <Loader visibility={this.state.isProcessing} />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    margin: 0,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 30,
  },
  title: {color: 'white'},
  searchInputBox: {
    flex: 1,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 30,
    marginLeft: 10,
    marginRight: 20,
  },
  searchInput: {color: 'white', height: 40, marginLeft: 10, marginRight: 10},
  trackTitle: {color: 'white', fontSize: 12},
  closeIcon: {height: 24, width: 24},
  trackItemContainer: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackListStyle: {
    width: '100%',
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  playIcon: {
    marginLeft: 8,
    height: 30,
    width: 30,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },
  trackTextContent: {
    flexDirection: 'column',
    marginLeft: 8,
    flex: 1,
  },
  cancelSyncText: {
    backgroundColor: Colors.primaryAccent,
    fontSize: 10,
    color: 'white',
    alignSelf: 'center',
    marginRight: 14,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 10,
  },
});

const mapStateToProps = (state) => {
  const {trackList} = state.MusicReducers;
  return {
    trackList,
  };
};

export default connect(mapStateToProps, {getTrendingSongs, searchSongs})(
  MusicPicker,
);
