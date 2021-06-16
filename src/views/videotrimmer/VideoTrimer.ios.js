/**
 * Video trimmer screen
 * created by vigneshwaran.n@optisolbusiness.com
 * last edited: 24/12/19
 */

import { Colors, Images } from "../../res";
import {
  Dimensions,
  Image,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  requireNativeComponent
} from "react-native";
import React, { Component } from "react";

import FilterTypes from "../../libs/livefilter/FilterTypes";
import { Loader } from "../../components/ViewComponents/Loader";
import MainView from '../../components/MainContainer';
import TouchableFilterChanger from "../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger";
import { connect } from 'react-redux';
import { orientation } from '../../actions/cameraPreviewAction'

const TrimmerView = requireNativeComponent('VideoTrimmer', null);
var stickerActions = NativeModules.TextEmbedder;

class VideoTrimer extends Component {
 VideoTrimmer = NativeModules.VideoTrimmer;
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      filterConfig: FilterTypes.Normal,
      videoArray: props.navigation.getParam("videos", null),
      videoDetails: props.navigation.getParam("videoDetails", null),
      isCanMoveNext: true,
      currentVideoPosition: 0,
      isPlaying: true,
      trimmingTime: null,
      isProcessing: false,
      filter: FilterTypes.Normal,
      refresh:false,
      isVideoProcessing:false
      

    };
  }



  changeFilterValues(filterValues) {
    const { currentFilter, filter, filterConfig } = filterValues;
    this.setState({ currentFilter, filter, filterConfig });
  }

  onClosePressed() {
    stickerActions.UnLockOrientationInPhotoView(resp => {
      console.log("Unlocked all orientation")
    })
    this.VideoTrimmer.stopVideo()
  

    this.props.navigation.navigate("CameraPreview");
  }


  onNext() {

    this.setState({
      isVideoProcessing:true
    })
    this.VideoTrimmer.getTrimVideo(0, (response) => {
      this.setState({ isProcessing: false,  isVideoProcessing:false }, () => {
        console.log("response",response)
          this.props.navigation.navigate("PhotoEditor", {
            // fromCameraView:false,
          IsVideoFromCamera:false,
          videoPath: response.mergedVideo,
          imagePath:"",
          responseData: response.video[0],
          videoCollection:response.video,
          filterConfig: this.state.filterConfig,
          isPhotoToVideo:false,
          canMoveNext: true,
          finalPlayer: true,
          orientationLockValue: !response.IsPortraitVideo
        });
      });
    });
  }

  UNSAFE_componentWillReceiveProps(nextprops) {
    if (nextprops.orientationCheck !== this.props.orientationCheck) {
      this.setState({ refresh: !this.state.refresh });
    }
  }


  render() {


    var customStyles =   this.props.orientationCheck === "portrait" ? {
      flex: 1,
      width: '100%',
      height: Dimensions.get('window').height - 300,
      position: "absolute",
      right: 0,
      alignItems: "center",
    } : {
      flex: 1,
      width: '65%',
      height: '100%',
      position: "absolute",
      left: 0,
      alignItems: "center",
    }



    return (
      <View style={styles.container}>

<MainView />


        <TrimmerView
          filter={this.state.filter}
          videos={this.state.videoArray} style={{ flex: 1 }}>
        </TrimmerView>

        <View
          style={customStyles}
        >



          <View style={{ flex: 1,  maxHeight: 50, flexDirection: 'row' }}>
            <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', }} >
              <TouchableOpacity
                style={styles.closeBtnContainer}
                onPress={() => this.onClosePressed()}>
                <Image style={styles.video_next} source={Images.close_icon} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
              <Text style={
                 styles.TextTapStyles 
              }>
                   tap screen for filters
            </Text>
              <Text style={
                styles.TextFilterStyles
              }>
                {this.state.filter.name == "NORMAL" ? "" : this.state.filter.name}
              </Text>
            </View>
            <View style={{ width: 50, height: 50 }} />
          </View>

            <TouchableFilterChanger
              IsGallery = {true}
              styleContainer={{bottom:0,width:"80%"}}
              orientation = {this.props.orientationCheck}
              interval={this.state.currentDuration}
              onFilterValuesChanged={filterValues =>
                this.changeFilterValues(filterValues)
              }
            />



<Loader visibility={this.state.isVideoProcessing} />



          {/* <View style={styles.bottomView}>
          {this.state.isCanMoveNext && (
            <TouchableOpacity
              style={styles.nextBtnContainer}
              onPress={() => this.onNext()}
            >
              <Image
                style={styles.video_next}
                source={Images.next_video_icon}
              />
            </TouchableOpacity>
          )}
        </View>
 */}




        </View>


        <View style={styles.bottomView}>
          <TouchableOpacity
            testID="nextBtn_on_Trimmer"
            style={styles.nextBtnContainer}
            onPress={() => this.onNext()}
          >
            <Image
              style={{height:32,width:32,resizeMode:"contain"}}
              source={Images.next_video_icon}
            />
          </TouchableOpacity>
        </View>


      </View>
    );
  }
}



const mapStateToProps = state => {
  const { orientationCheck } = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(mapStateToProps, {
  orientation,
})(VideoTrimer);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.black,
  },

  portraitTrimmer: {
    flex: 1,
    position:'absolute',
    backgroundColor: 'green'
  },
  landscapeTrimmer: {
    flex: 1,
    width: '65%',
    position:'absolute',
  },
  playerStyle: {
    flex: 1,
    width: "98%",
    height: "100%",
    alignSelf: "center",
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 20
  },
  headerContainer: {
    width: 50,
    height: 50,
  },
  footerContainer: {
    position: 'absolute',
    backgroundColor: 'green',
    width: 100,
    height: 100
  },
  nextBtnContainer: {
    height: 32,
    width: 32,
    margin: 10, 
    marginBottom:0,
    marginLeft:0,
    marginRight:13,
    alignSelf:"flex-end"
  },
  closeBtnContainer: {
    position: 'absolute',
    left: 15,
    top:10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  video_next: {
    height: 24,
    width: 24,
    resizeMode:'contain'
},
  play_icon: {
    height: 48,
    width: 48
  },
  bottomView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 18, //Here is the trick
    right: 0
  },
  textStyle: {
    color: '#fff',
    fontSize: 18,
  },

   TextTapStyles: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    fontSize: 15,
  },
   
   TextFilterStyles: {  
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,         
  },

});
