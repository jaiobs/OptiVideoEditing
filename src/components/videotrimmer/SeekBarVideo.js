import React, { Component } from "react";
import { View, StyleSheet, PanResponder, Animated, Text } from "react-native";
import { Colors } from "../../res/";

var divisible = 0;

export default class SeekBarVideo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leftPosition: new Animated.ValueXY(),
      rightPosition: new Animated.ValueXY(),
      seekThumbPosition: new Animated.ValueXY(),
      rightThumbXPosition: 0,
      leftThumbXPosition: 0,
      seekWidth: 0,
      startTimeValue: 0,
      endTimeValue: 0,
      totalTimeValue: 0,
      currentPosition: 0
    };

    //set initial value for the right thumb position
    this.state.rightPosition.setValue({ x: 200, y: 0 });
    this.state.leftPosition.setValue({ x: 0, y: 0 });
    this.state.seekThumbPosition.setValue({ x: 0, y: 0 });

    this.leftPanResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        //left x position should less than right x value
        if (
          gesture.moveX > this.props.startPositionX + 1 &&
          gesture.moveX + 20 <= this.state.rightThumbXPosition
        ) {
          this.state.leftPosition.setValue({ x: gesture.dx, y: 0 });
          this.setStartingTimeValue(gesture.moveX);
        }
      },
      onPanResponderRelease: (evt, gesture) => {
        var seekDistance = this.state.rightThumbXPosition - gesture.moveX;
        this.setState({
          leftThumbXPosition: gesture.moveX,
          seekWidth: seekDistance
        });
      },
      onPanResponderGrant: () => {
        this.state.leftPosition.setOffset(this.state.leftPosition.__getValue());
      }
    });

    this.rightPanResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        //Right x position should greater than left x value
        //need to check why it is take 40 :(
        if (
          gesture.moveX < this.props.scrollViewVisibleWidth + 30 &&
          gesture.moveX - 20 >= this.state.leftThumbXPosition
        ) {
          this.state.rightPosition.setValue({ x: gesture.dx, y: 0 });
          this.setStopTimingValue(gesture.moveX);
        }
      },
      onPanResponderRelease: (evt, gesture) => {
        this.setStopTimingValue(gesture.moveX);
        var seekDistance = gesture.moveX - this.state.leftThumbXPosition;
        this.setState({
          rightThumbXPosition: gesture.moveX,
          seekWidth: seekDistance
        });
      },
      onPanResponderGrant: () => {
        this.state.rightPosition.setOffset(
          this.state.rightPosition.__getValue()
        );
      }
    });

    this.seekBarResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        //Right x position should greater than left x value
        if (
          gesture.moveX > this.props.startPositionX + 1 &&
          gesture.moveX < this.props.endPositionX + 40
        ) {
          this.state.seekThumbPosition.setValue({ x: gesture.dx, y: 0 });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        this.props.onSeekBarReleased();
      },
      onPanResponderGrant: () => {
        this.props.onSeekBarTouched();
        this.state.seekThumbPosition.setOffset(
          this.state.seekThumbPosition.__getValue()
        );
      }
    });
  }

  drawIndicator() {
    return (
      <View style={{ flexDirection: "row" }}>
        <View style={styles.indicator} />
        <View style={styles.indicator} />
        <View style={styles.indicator} />
      </View>
    );
  }

  drawSeekThumb() {
    return <View style={styles.seekThumb}>{this.drawIndicator()}</View>;
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (
      this.props.currentVideoPosition != props.currentVideoPosition &&
      props.scrollViewFullWidth > 0
    ) {
      var currSec = props.currentVideoPosition / 1000;
      var currentSeekPositionX = currSec * 60;

      var divider = currentSeekPositionX % props.scrollViewVisibleWidth;

      if (
        divider <= 10 &&
        currentSeekPositionX >= props.scrollViewVisibleWidth
      ) {
        divisible += 1;
        currentSeekPositionX = currentSeekPositionX / divisible;
        this.props.onMoveScrollView(currentSeekPositionX);
      }

      this.setState({ currentPosition: currentSeekPositionX }, () => {
        this.state.seekThumbPosition.setValue({
          x: currentSeekPositionX,
          y: 0
        });
      });
    }
  }

  /**
   * calculate the starting and ending of the video
   */
  setStartingTimeValue(xPosition) {
    var timeVal = (xPosition / 60).toFixed(1);
    this.setState({ startTimeValue: timeVal });
    //pass start values to props
    this.props.onStartRangeAdjusted(timeVal)
  }

  setStopTimingValue(xPosition) {
    var timeVal = (xPosition / 60).toFixed(1);
    this.setState({ endTimeValue: timeVal });
    //pass stop values to props
    this.props.onStopRangeAdjusted(timeVal)
  }

  render() {
    let leftHandles = this.leftPanResponder.panHandlers;
    let rightHandles = this.rightPanResponder.panHandlers;
    let seekHandles = this.seekBarResponder.panHandlers;

    return (
      <View style={styles.container}>
        <Text style={{ position: "absolute", color: "white", top: -90 }}>
          TotalDuration: {this.props.videoDuration}
        </Text>
        <Text style={{ position: "absolute", color: "white", top: -70 }}>
          starting: {this.state.startTimeValue}
        </Text>
        <Text style={{ position: "absolute", color: "white", top: -50 }}>
          ending: {this.state.endTimeValue}
        </Text>
        <Text style={{ position: "absolute", color: "white", top: -30 }}>
          currentPosition: {(this.props.currentVideoPosition / 1000).toFixed(2)}
          {/* currentPosition: {this.state.currentPosition.toFixed(2)} */}
        </Text>

        {/* LEFT SEEK BAR */}
        <Animated.View
          {...leftHandles}
          style={[
            styles.leftSeekContainer,
            this.state.leftPosition.getLayout()
          ]}
        >
          {this.drawSeekThumb()}
        </Animated.View>

        {/* WHITE SEEK POSITION FOR VIDEO */}
        <Animated.View
          {...seekHandles}
          style={[
            styles.whiteThumbPosition,
            this.state.seekThumbPosition.getLayout()
          ]}
        />

        {/* RIGHT SEEK BAR */}
        <Animated.View
          {...rightHandles}
          style={[
            styles.rightSeekContainer,
            this.state.rightPosition.getLayout()
          ]}
        >
          {this.drawSeekThumb()}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 75,
    flexDirection: "row",
    position: "absolute"
  },
  leftSeekContainer: {
    backgroundColor: Colors.primaryAccent,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    zIndex: 1
  },
  rightSeekContainer: {
    backgroundColor: Colors.primaryAccent,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: Colors.primaryAccent,
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    zIndex: 1
  },
  indicator: {
    backgroundColor: "white",
    height: 15,
    width: 1,
    borderRadius: 2,
    margin: 1
  },
  seekThumb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 75
  },
  selectionContainer: {
    height: "100%",
    borderWidth: 2,
    borderColor: Colors.primaryAccent
  },
  whiteThumbPosition: {
    height: "120%",
    backgroundColor: Colors.white,
    width: 4,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    zIndex: 1
  }
});
