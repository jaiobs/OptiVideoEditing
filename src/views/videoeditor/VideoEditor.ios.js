import { BackHandler, Image, NativeModules, StyleSheet, Text, TouchableOpacity, View, requireNativeComponent } from "react-native";
import { Colors, Images } from "../../res";
import React, { Component } from "react";

import FilterTypes from "../../libs/livefilter/FilterTypes";
import TouchableFilterChanger from "../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger";

const VideoPlayerView = requireNativeComponent('PreviewFilter', null); 
var stickerActions = NativeModules.TextEmbedder;

export default class VideoEditor extends Component {
  VPActions = NativeModules.PreviewFilter;
  constructor(props) {
    super(props);
    this.state = {
      currentDuration: 0,
      filterRange: 1.0,
      filter: FilterTypes.Normal,
      videoPath: props.navigation.getParam("videoPath", null),
      IsImageMode: props.navigation.getParam("IsImageMode", false),
      imageDetails: props.navigation.getParam("imageDetails", null),
    };
  }

  componentDidMount() {
    if (this.state.IsImageMode == false){
        if(this.state.imageDetails.width > this.state.imageDetails.height){
            stickerActions.lockOrientationInPhotoView("landscape",(resp))
          }else{
            stickerActions.lockOrientationInPhotoView("portrait",(resp))
          }
    }
  }

  componentWillMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  onClosePressed() {
    stickerActions.UnLockOrientationInPhotoView(resp => {
      console.log("Unlocked all orientation")
    })
    this.props.navigation.navigate("CameraPreview");
  }

  /**
   * on press next btn
   */
  onNext() {

    this.VPActions.getPhotoDetail(0, (responseData) => {
        this.props.navigation.navigate('PhotoEditor', {
            responseData: responseData,
            pickedFromGallery: true,
            imagePath: responseData.imagePath,
            videoPath:"",
            orientationLockValue: !responseData.IsPortrait 
    });
  });
  }

  /**
   * Change filter values
   */
  changeFilterValues(filterValues) {
    const { currentFilter, filter, filterConfig } = filterValues;
    // VPActions.updateFilter(filter)
    this.setState({ currentFilter, filter, filterConfig });
  }

  render() {
    this.VPActions.updateVideoUrl(this.state.videoPath);

    return (
      <View style={styles.container}>

        <View style={{ flex: 1 }}>

          <VideoPlayerView style={{ flex: 1 }}
            filter={this.state.filter}
            ImageMode = {this.state.IsImageMode}
          ></VideoPlayerView>

          <TouchableFilterChanger
            interval={this.state.currentDuration}
            onFilterValuesChanged={filterValues =>
              this.changeFilterValues(filterValues)
            }
          />

          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100%",
              alignItems: "center",
              marginTop: this.props.orientationCheck === "portrait" ? 40 : 15
            }}
          >
            <Text style={
                styles.TextTapStyles
            }>
              tap screen for filters
            </Text>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              {this.state.filter.name}
            </Text>
          </View>
        </View>



        <View style={styles.nextIconStyle}>
        <TouchableOpacity
            onPress={() => this.onNext()}
          >
             <Image
                     style={[styles.nextIcon]}
                     source={Images.next_video_icon}
                   />
          </TouchableOpacity>
        </View>



        <View style={{ position: 'absolute', width: 50, height: 50 }}>
          <TouchableOpacity
            style={styles.closeBtnContainer}
            onPress={() => this.onClosePressed()}
          >
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
    backgroundColor: Colors.black
  },
  editorStyle: {
    flex: 1,
    width: "98%",
    height: "100%",
    alignSelf: "center",
    marginLeft: 8,
    marginRight: 8
  },
  headerContainer: {},
  footerContainer: {

  },
  closeBtnContainer: {
    position: 'absolute',
    left: 10,
    top:10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10
  },
  
  nextBtnContainer: {
    alignSelf: "flex-end",
    margin: 10
  },
  video_next: {
    height: 24,
    width: 24,
    resizeMode:'contain'
  },
  nextIcon:{
    height: 32,
    width: 32,
    margin: 10, 
    marginBottom:0,
    marginLeft:0,
    marginRight:13,
    resizeMode: 'contain'
  },

  TextTapStyles: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    fontSize: 15,
  },
  imageIcon: {
    height: 32, 
    width: 32, 
    margin: 10, 
    resizeMode: 'contain'
  },
  nextIconStyle:{
    position: 'absolute', 
    width: 50, 
    height: 32, 
    bottom:28, 
    right:0,
    alignItems:'center', 
    justifyContent:'center',
    zIndex:999, 
    marginLeft:3
  }
})
