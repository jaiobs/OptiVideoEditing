import {
  Animated,
  Easing,
  Image,
  NativeModules,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Images } from "../../../res/";
import React, { Component } from "react";

const circleSize = 100;

var isPressIn = false;

const CameraManager = NativeModules.RNCameraManager;

export default class CameraCaptureAnimator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressInValue: 0.8,
      pressDuration: 10,
      pressInEasing: Easing.in,
      delayDuration: 400,
      pressOutEasing: Easing.out,
      isPressed: false,
      isInAutoMode: false,
    };
    this.anim = new Animated.Value(1);
  }

  componentDidMount() {
    Animated.timing(this.anim, {
      toValue: this.state.pressInValue,
      duration: this.state.pressDuration,
      easing: this.state.pressInEasing,
      useNativeDriver: true,
    }).start();
  }

  onPressOut = () => {
    isPressIn = false;
    Animated.timing(this.anim, {
      toValue: this.state.pressInValue,
      duration: this.state.pressDuration,
      easing: this.state.pressInEasing,
      useNativeDriver: true,
    }).start(this.onCapturePressOut());
  };

  onPressIn = () => {
    console.log("onPressIN");
    if (this.state.isInAutoMode) {
      this.onPressOut();
    } else {
      isPressIn = true;
      Animated.timing(this.anim, {
        toValue: 1,
        duration: this.state.pressDuration,
        easing: this.state.pressInEasing,
        useNativeDriver: true,
      }).start(this.onCapturePressIn());
    }
  };

  onSinglePress = () => {
    if (!this.state.isInAutoMode && !isPressIn) {
      this.props.capturePhoto();
    }
  };

  onCapturePressIn() {
    //set capture is in active
    setTimeout(() => {
      if (!isPressIn) {
        return;
      } else {
        this.setState({ isPressed: true }, () => {
          this.props.capturePressed();
          this.startLoopingAnimation();
        });
      }
    }, 100);
  }

  onCapturePressOut() {
    isPressIn = false;
    if (!this.state.isPressed) return;
    this.setState({ isPressed: false, isInAutoMode: false });
    this.props.captureReleased();
    this.onVideoFlashOnOff() 
  }

  onVideoFlashOnOff() { 
     if (this.props.type == "back" && this.props.flash == "torch") {
        CameraManager.BackFlashActivate();
      }
      else if (this.props.type == "front" && this.props.flash == "torch") {
        CameraManager.BrightnessOnOff();
      }
  }


  startLoopingAnimation() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.anim, {
          toValue: this.state.pressInValue,
          duration: this.state.delayDuration,
          easing: this.state.pressInEasing,
          useNativeDriver: true,
        }),
        Animated.timing(this.anim, {
          toValue: 1,
          duration: this.state.delayDuration,
          easing: this.state.pressInEasing,
          useNativeDriver: true,
        }),
      ])
    ).start();

   this.onVideoFlashOnOff() 

  }

  renderCameraTouchable = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        // onPress={this.onSinglePress}
        // onLongPress={this.onPressIn}
        // onPressOut={this.onPressOut}
        onPress={() => this.onSinglePress()}
        onLongPress={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        style={{
          transform: [
            {
              scale: this.anim,
            },
          ],
          zIndex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={
            this.state.isPressed
              ? styles.captureCircleActive
              : styles.captureCircle
          }
        >
          {!this.state.isPressed && (
            <Image
              style={styles.captureIcon}
              source={Images.cam_capture_icon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  renderAndroid = () => {
    return <View style={styles.container}>{this.renderCameraTouchable()}</View>;
  };

  renderIOS = () => {
    return (
      <View style={styles.container}>
        {this.props.isVisible && this.renderCameraTouchable()}
      </View>
    );
  };

  render() {
    if (Platform.OS === 'android') {
      return this.renderAndroid();
    } else {
      return this.renderIOS();
    }
  }
}

const styles = StyleSheet.create({
  container: {},
  captureCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderColor: Colors.white,
    borderWidth: 4,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  captureCircleActive: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderColor: Colors.primaryAccent,
    borderWidth: 12,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  captureIcon: {
    top: 8,
    left: 2,
    height: 120,
    width: 120,
    alignSelf: "center",
  },
});
