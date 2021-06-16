import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image, requireNativeComponent } from "react-native";
const VideoTiltPlayerView = requireNativeComponent('VideoTiltPlayer', null);
import { Images, Colors } from "../../res";
import { connect } from "react-redux";

 class ScrollPlayerView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoPath: this.props.videoPath,
      videoFrame: this.props.videoFrame
    }
  }

  render() {

    console.log(this.state);

    return (
      <View style={{ flex: 1 }}>

    {this.state.videoFrame != null &&  <VideoTiltPlayerView cropPosition={this.state.videoFrame} videoPath={this.state.videoPath} style={{ flex: 1 }}></VideoTiltPlayerView> }
      
        <TouchableOpacity
          style={[styles.closeBtnContainer, { paddingLeft: this.props.orientationCheck == "portrait" ? 4 : 10 }]}
          onPress={() => {
            this.props.close()}}
        >
          <Image style={styles.close_icon} source={Images.tick} />
        </TouchableOpacity>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  textButtons: {
    height: 40,
    width: 40,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textImage: {
    height: 30,
    width: 30,
    alignSelf: "center",
    resizeMode: "contain"
  },
  playerStyle: {
    flex: 1,
    width: "98%",
    height: "100%",
    alignSelf: "center",
    marginLeft: 8,
    marginRight: 8
  },
  headerContainer: {
    position: 'absolute',
    margin: 10,
    width: 50,
    height: 50,
  },
  footerContainer: {},
  closeBtnContainer: {
    padding: 4,
    position:'absolute'
  },
  nextBtnContainer: {
    alignSelf: "flex-end",
    margin: 10
  },
  video_next: {
    height: 24,
    width: 24
  },
  actionContainerRight: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingTop: 10,
    paddingLeft: 15,
    width: 80,
    zIndex: 999,
    height: "100%",
    backgroundColor: "black",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  actionContainerLeft: {
    position: "absolute",
    bottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  actionContainerBottom: {
    position: "absolute",
    width: "100%",
    bottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  close_icon: {
    height: 25, width: 25, margin: 10, resizeMode: "contain"
  },
  imageIcon: { height: 32, width: 32, margin: 10, resizeMode: "contain" }
});


export default connect()(ScrollPlayerView);

