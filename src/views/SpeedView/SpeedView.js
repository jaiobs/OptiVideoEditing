import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, NativeModules, Alert, SafeAreaView, NativeEventEmitter } from "react-native";
import { requireNativeComponent } from 'react-native';

import { Loader } from "../../components/ViewComponents/Loader";
const VideoSpeedView = requireNativeComponent('SpeedView', null);
var VSVActions = NativeModules.SpeedView;
import { Images, Colors } from "../../res";

export default class SpeedView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audio: this.props.audioInfo,
      IsSingleVideoSelected: false,
      videoPath: this.props.videoPath,
      IsSlowSpeedTwo: false,
      IsSlowSpeedOne: false,
      IsFastSpeedTwo: false,
      IsFastSpeedOne: false,
      isVideoProcessing: false
    }
  }

  componentDidMount() {
    const myModuleEvt = new NativeEventEmitter(NativeModules.CommonEmittor)
    myModuleEvt.addListener('CommonEmittorEvent', (response) => {
      console.log(response);
      if (response.action == "videoSelected") {
        if (response.speed == 5) {
          this.setState({
            IsSlowSpeedTwo: false,
            IsSlowSpeedOne: false,
            IsFastSpeedTwo: true,
            IsFastSpeedOne: false,
          })
        } else if (response.speed == 4) {
          this.setState({
            IsSlowSpeedTwo: false,
            IsSlowSpeedOne: false,
            IsFastSpeedTwo: false,
            IsFastSpeedOne: true,
          })
        } else if (response.speed == 3) {
          this.setState({
            IsSlowSpeedTwo: false,
            IsSlowSpeedOne: false,
            IsFastSpeedTwo: false,
            IsFastSpeedOne: false,
          })
        } else if (response.speed == 2) {
          this.setState({
            IsSlowSpeedTwo: false,
            IsSlowSpeedOne: true,
            IsFastSpeedTwo: false,
            IsFastSpeedOne: false,
          })
        } else if (response.speed == 1) {
          this.setState({
            IsSlowSpeedTwo: true,
            IsSlowSpeedOne: false,
            IsFastSpeedTwo: false,
            IsFastSpeedOne: false,
          })
        } else {
          this.setState({
            IsSlowSpeedTwo: false,
            IsSlowSpeedOne: false,
            IsFastSpeedTwo: false,
            IsFastSpeedOne: false,
          })
        }
      }
    }
    )
  }


  videoProcessing = () => {
    let value = VSVActions.getVideoTime((responseData) => {

      this.setState({
        isVideoProcessing: false
      })

      if (responseData.video_limit_exit == true) {
        Alert.alert(
          "Warning",
          "Video time greater then 30 seconds please reduce the size",
          { cancelable: true }
        );
      } else {
        this.props.onClose();
      }
    });
  }
  setVideoSpeedLevel = (speed) => {
    if (this.props.hasGif == true){
      let value = VSVActions.updateSpeed(speed, (response) => {
        this.timeoutHandle = setTimeout(() => {
        this.props.sticker.getMediaResponse((resp) => {
          this.timeoutHandle = setTimeout(() => {
                VSVActions.refreshData();
                this.setState({
                  isVideoProcessing: false
                })
              }, 1000);
        });
        }, 1000);

      })
    }else{
      let value = VSVActions.updateSpeed(speed, (response) => {
        this.timeoutHandle = setTimeout(() => {
          VSVActions.refreshData();
          this.setState({
            isVideoProcessing: false
          })
        }, 1000);
      })
    }
  }


  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor:'black' }}>

        <VideoSpeedView videos={this.state.videoPath} audio={this.state.audio} style={{ flex: 1 }}></VideoSpeedView>

        <TouchableOpacity
          style={[styles.closeBtnContainer, { paddingLeft: this.props.orientationCheck == "portrait" ? 4 : 10 }]}
          onPress={() => {
            this.props.onClose();
          }}
        >
          <Image style={styles.close_icon} source={Images.close_icon} />
        </TouchableOpacity>

        <View style={{
          position: 'absolute', bottom: 125, width: '100%', height: 50, flexDirection: 'row',
          justifyContent: 'space-evenly', alignItems: 'center', alignContent: 'center'
        }}>
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: this.state.IsSlowSpeedTwo ? Colors.primaryAccent : "white" }]} onPress={() => {
            this.setState({
              IsSlowSpeedTwo: true,
              IsSlowSpeedOne: false,
              IsFastSpeedOne: false,
              IsFastSpeedTwo: false,
              isVideoProcessing: true
            }, () => { this.setVideoSpeedLevel(5)});
          }}><Text style={{ color: this.state.IsSlowSpeedTwo ? 'white' : 'black', fontSize: 12 }}>{"3x slow"}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: this.state.IsSlowSpeedOne ? Colors.primaryAccent : "white" }]} onPress={() => {
            this.setState({
              IsSlowSpeedTwo: false,
              IsSlowSpeedOne: true,
              IsFastSpeedOne: false,
              IsFastSpeedTwo: false,
              isVideoProcessing: true

            }, () => { this.setVideoSpeedLevel(4)});
          }}><Text style={{ color: this.state.IsSlowSpeedOne ? 'white' : 'black', fontSize: 12 }}>{"2x slow"}</Text></TouchableOpacity>
          <TouchableOpacity style={{
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }} onPress={() => {
            this.setState({
              IsSlowSpeedTwo: false,
              IsSlowSpeedOne: false,
              IsFastSpeedOne: false,
              IsFastSpeedTwo: false,
              isVideoProcessing: true
            }, () => { this.setVideoSpeedLevel(3)});
          }}>
            <Image style={[styles.timerIcon]} source={Images.slowmotion_icon} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: this.state.IsFastSpeedOne ? Colors.primaryAccent : "white" }]} onPress={() => {
            this.setState({
              IsSlowSpeedTwo: false,
              IsSlowSpeedOne: false,
              IsFastSpeedOne: true,
              IsFastSpeedTwo: false,
              isVideoProcessing: true
            }, () => { this.setVideoSpeedLevel(2)});

          }}><Text style={{ color: this.state.IsFastSpeedOne ? 'white' : 'black', fontSize: 12 }}>{"2x fast"}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: this.state.IsFastSpeedTwo ? Colors.primaryAccent : "white" }]} onPress={() => {
            this.setState({
              IsSlowSpeedTwo: false,
              IsSlowSpeedOne: false,
              IsFastSpeedOne: false,
              IsFastSpeedTwo: true,
              isVideoProcessing: true
            }, () => { this.setVideoSpeedLevel(1)});

          }}><Text style={{ color: this.state.IsFastSpeedTwo ? 'white' : 'black', fontSize: 12 }}>{"3x fast"}</Text></TouchableOpacity>
        </View>

      
      
        <View style={{
          position: 'absolute', bottom: 20, right: 0, width: 50, height: 50, maxHeight: 50, flexDirection: 'row',
          justifyContent: 'flex-end', alignItems: 'center', alignContent: 'center'
        }}>
          <TouchableOpacity style={[{ right: 10, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }]} onPress={() => this.videoProcessing()} >
            <Image style={[styles.imageIcon]} source={Images.next_video_icon} />
          </TouchableOpacity>
        </View>
       
       
        <Loader visibility={this.state.isVideoProcessing} />
      </SafeAreaView>
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
  optionButton: {
    width: 65,
    height: 28,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white'
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
    marginTop:34,
    position: 'absolute'
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
  imageIcon: { height: 25, width: 25, margin: 10, resizeMode: "contain" },
  timerIcon: { height: 35, width: 35, margin: 10, resizeMode: "contain" }
});
