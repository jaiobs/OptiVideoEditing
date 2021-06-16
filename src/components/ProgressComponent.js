/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Dimensions
} from "react-native";
import ProgressBar from "./Progress";

class ProgressComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progressStatus: 0,
      originValues: [],
      released: true,
      finalValues: [],
      stopAnimation: false,
      interval: 0,
      width: Dimensions.get("window").width
    };
    this.anim = new Animated.Value(0);
  }

  //PAUSE VIEW
  //This method is to render the view whenever the user release the long press while recording a video
  renderReleaseView = data => {
   
    return data.map((item, index) => {
      return (
        <View
          key={index}
          style={{
            position: "absolute",
            left: parseInt(item.width),
            width: 2,
            height: 5,
            backgroundColor: (index == 0 ? "#0000" : "#fff")
          }}
        ></View>
      );
    });
  };

  render() {
    return (
      <View style={[this.props.containerStyle, { alignSelf: "center" }]}>
        <View>
          <ProgressBar
            onLayout={(event, animWidth) => {
              this.props.handleLayoutChange(event, animWidth);
            }}
            containerStyle={{ alignSelf: "flex-end" }}
            width={this.props.width}
            height={6}
            stopAnimation={this.props.stopAnimation}
            value={this.props.progressStatus}
            barAnimationDuration={1000}
            backgroundAnimationDuration={1000}
            maxValue={this.props.width}
            bgColor={"#fff"}
            borderRadius={0}
            backgroundColor={"#EC008C"}
          />

          <View
            style={{
              position: "absolute",
              backgroundColor: "#fff",
              height: 5,
              marginTop: 3
            }}
          >
            {this.renderReleaseView(this.props.finalValues)}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inner: {
    width: "100%",
    height: 30,
    borderRadius: 15,
    backgroundColor: "green"
  },
  label: {
    fontSize: 23,
    color: "black",
    position: "absolute",
    zIndex: 1,
    alignSelf: "center"
  },
  containerMain: {
    width: "100%",
    height: 40,
    padding: 3,
    borderColor: "#FAA",
    borderWidth: 3,
    borderRadius: 30,
    marginTop: 200,
    justifyContent: "center"
  },
  button: {
    width: "80%",
    height: 40,
    marginTop: 70,
    justifyContent: "center",
    backgroundColor: "#EE5407",
    alignSelf: "center"
  },
  TextStyle: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16
  }
});

export default ProgressComponent;
