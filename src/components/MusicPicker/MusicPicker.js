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
} from 'react-native';
import {getTrendingSongs, searchSongs} from '../../actions/MusicActions';
import Modal from 'react-native-modal';
import {Images, Colors} from '../../res';

class MusicPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      currentTrackItem: 0,
      isGateWayError:false
    };
  }

  componentDidMount() {
    this.setState({
      currentTrackItem: 0
    })
    //get the trending songs
    this.props.getTrendingSongs();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log("nextProps of MUSIC PICKER",nextProps.trackList.success)
    if(this.state.isGateWayError != !nextProps.trackList.success){
      this.setState({
        isGateWayError: !nextProps.trackList.success
      })
    }
    //getting track
    if (
      nextProps.trackList.tracks !== undefined &&
      nextProps.trackList.tracks.length > 0 &&
      nextProps.trackList.tracks !== this.props.trackList.tracks
    ) {
      this.setState({tracks: nextProps.trackList.tracks});
    }
  }

  componentWillUnmount = () => {
    this.setState({
      currentTrackItem: 0
    })
  }

  onPlayPausePressed(track) {
    if (this.state.currentTrackItem === track.id) {
      // pause music
      this.setState({currentTrackItem: 0});
      this.props.pauseMusic();
    } else {
      this.setState({currentTrackItem: track.id}); //play music
      this.props.playMusic(track);
    }
  }

  renderTrackItem(item,index) {
    return (
      <TouchableOpacity
        key={(this.props.orientation == "portrait" ? 'h' : 'v')}
        style={[styles.trackItemContainer,{width:this.props.orientation == "portrait" ? "100%" : "50%",margin :this.props.orientation == "landscape" ? 0 : 10,backgroundColor:"black"}, index%2==0 && this.props.orientation == "landscape" ? { marginRight: 5 } : { marginLeft: 5 }]}
        onPress={() => this.onPlayPausePressed(item)}>
        <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10, paddingLeft:15}}>
          <Image
            style={{height: 60, width: 60, resizeMode:"contain"}}
            source={item.artwork_url != null ? {uri: item.artwork_url} : Images.song_placeholder}
          />
          <View style={{flexDirection:"column", justifyContent:"center",width:"55%"}}>
            <Text style={[styles.trackTitle,{flex:1}]}>{item.title}</Text>
            <Text style={[styles.trackTitle,{color:"darkgray",flex:1}]}>{item.user.username}</Text>
            </View>

          <TouchableOpacity style={{justifyContent:"center"}} onPress={() => this.onPlayPausePressed(item)}>
            <Image
              style={[styles.playIcon]}
              source={
                this.state.currentTrackItem == item.id
                  ? Images.pause_button
                  : Images.play_button
              }
            />
          </TouchableOpacity>
          {this.state.currentTrackItem == item.id &&
              <TouchableOpacity style={[styles.cancelSync,{marginTop:6,alignSelf:"center"}]} onPress={() => {
                this.setState({
                  currentTrackItem: 0
                })
                  this.props.onSongSelected(item)
                }}>
                <Text style={{fontSize: 15,color:"white",alignSelf:"center"}}>add</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={{backgroundColor: 'rgba(108,108,108,1.0)', height: 1, width: '100%',marginTop:10}} />
      </TouchableOpacity>
    );
  }

  //search songs
  searchSongs(query) {
    this.props.searchSongs(query);
  }

  render() {
    return (
      <Modal
        backdropColor={this.props.orientation == "portrait" ? "black" : "transparent"} 
        isVisible={this.props.visible}
        onRequestClose={() => {
          this.props.onClosePressed();
        }}
        style={[styles.container,{backgroundColor: this.props.orientation == "portrait" ? "black" : "transparent"}]}>
        {/* TITLE */}
        {this.props.orientation == "portrait" && <Text style={[styles.title,{marginBottom:5}]}>Music</Text>}

         {/* CLOSE BUTTON ON LANDSCAPE */}
        {this.props.orientation == "landscape" &&
          <TouchableOpacity
           style={{alignSelf:"flex-start",margin:25}}
            onPress={() => {
              this.props.onClosePressed();
            }}>
            <Image style={styles.closeIcon} source={Images.close_icon} />
          </TouchableOpacity>
        }

        {/* SEARCH INPUT */}
        <View style={[styles.searchContainer,{ 
            marginTop:this.props.orientation == "portrait" ? 0 : -40,
          }]}>
          <View style={[
            styles.searchInputBox,
            {
              borderRadius: this.props.orientation == "portrait" ? 30 : 0,
              backgroundColor:this.props.orientation == "portrait" ? "transparent" : "#FFFFFF80", 
              maxWidth: this.props.orientation == "portrait" ? "90%" : this.props.isSyncOn ? "65%" : "80%",
              alignSelf:"center",
              borderWidth:this.props.orientation == "portrait" ? 1 : 0
              }
            ]}>
          {this.props.orientation == "landscape" && <Image style={{height:25,width:25,resizeMode:"contain",alignSelf:"center",margin:5}} source={Images.search_icon}/>}
            <TextInput
              placeholder={this.props.orientation == "landscape" ? "Search artist or song" : "Search"}
              placeholderTextColor={this.props.orientation == "landscape" ? "white" : "rgba(108,108,108,1.0)"}
              style={[styles.searchInput,{width:this.props.isSyncOn ? "50%": "80%"}]}
              onChangeText={query => {
                this.searchSongs(query);
              }}
            />
            {this.props.orientation == "portrait" && <Image style={{height:25,width:25,resizeMode:"contain",alignSelf:"center",margin:5}} source={Images.search_icon}/>}
          </View>

          {this.props.isSyncOn &&
              <TouchableOpacity
              style={styles.cancelSync}
              onPress={() => {
                this.setState({
                  currentTrackItem: 0
                })
                this.props.onCancelSyncPressed();
              }}>
              <Text style={{fontSize: 15,color:"white",alignSelf:"center",margin:5}}>cancel sync</Text>
            </TouchableOpacity>
          }
      {this.props.orientation == "portrait" &&
          <TouchableOpacity
            onPress={() => {
              this.props.onClosePressed();
            }}>
            <Image style={styles.closeIcon} source={Images.close_icon} />
          </TouchableOpacity>
        }
        </View>

         {/* SEARCH LIST */}
        {!this.state.isGateWayError ?
            <FlatList
              style={[styles.trackListStyle,{marginTop:10,marginBottom:0}]}
              data={this.state.tracks}
              bounces={false}
              numColumns={this.props.orientation == "portrait" ? 1 : 2}
              renderItem={({item,index}) => this.renderTrackItem(item,index)}
              contentContainerStyle={{width:this.props.orientation == "portrait" ? "100%" : "97%", alignSelf:"center"}}
              key={(this.props.orientation == "portrait" ? 'h' : 'v')}
              keyExtractor={item => item.id.toString()}
          /> :
          <TouchableOpacity style={{width:"100%",height:80,alignSelf:"center",justifyContent:"center",flexDirection:"column",alignItems:"center",marginTop:200,padding:10}}>
            <Text style={{fontWeight:"bold",color:"white",fontSize:16,textAlign:"center"}}>
              Network Connection error or Gateway error. Please retry.
            </Text>
            <TouchableOpacity
              style={[styles.cancelSync,{height:35,borderRadius:17.5}]}
              onPress={() => {
                this.setState({
                  isGateWayError:false
                })
                this.props.getTrendingSongs()
              }}>
              <Text style={{fontSize: 15,color:"white",alignSelf:"center",margin:5}}>retry</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        }
        
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
  title: {color: 'white', marginTop: 12, fontSize:18},
  searchInputBox: {
    flex: 1,
    flexDirection:"row",
    borderColor: 'rgba(108,108,108,1.0)',
    borderWidth: 1,
    borderRadius: 30,
    marginLeft: 8,
    marginRight: 8,
  },
  cancelSync:{backgroundColor: Colors.primaryAccent,height:24, margin:10, minWidth: 50, borderRadius:12, justifyContent:"center",alignItems:"center"},
  searchInput: {color: 'white', height: 40,paddingLeft:10,flex:1,borderRadius: 30},
  trackTitle: {color: 'white', marginLeft: 8},
  closeIcon: {height: 24, width: 24},
  trackItemContainer: {flexDirection: 'column', justifyContent:"center", margin:10},
  trackListStyle: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
    marginRight: 30,
  },
  playIcon: {
    marginLeft: 8,
    height: 30,
    width: 30,
  },
});

const mapStateToProps = state => {
  const {trackList} = state.MusicReducers;
  return {
    trackList,
  };
};

export default connect(
  mapStateToProps,
  {getTrendingSongs, searchSongs},
)(MusicPicker);
