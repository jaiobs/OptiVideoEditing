import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated
} from "react-native";
import { calculateCornerResult } from "../../utils/utils";
import {Colors} from "../../res/"

import {
  getThumbnailImagesFromVideo,
  addThumbnailListener
} from "../../libs/ffmpeg/";

const { width } = Dimensions.get("window");

export default class Trimmer extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    onChange: PropTypes.func
  };
  static defaultProps = {
    onChange: () => null
  };

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      duration: -1,
      leftCorner: new Animated.Value(0),
      rightCorner: new Animated.Value(0),
      layoutWidth: width,
      timeLineImages: []
    };

    this.leftResponder = null;
    this.rigthResponder = null;

    this._startTime = 0;
    this._endTime = 0;
    this._handleRightCornerMove = this._handleRightCornerMove.bind(this);
    this._handleLeftCornerMove = this._handleLeftCornerMove.bind(this);
    this._handleRightCornerRelease = this._handleRightCornerRelease.bind(this);
    this._handleLeftCornerRelease = this._handleLeftCornerRelease.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.state.leftCorner.addListener(
      ({ value }) => (this._leftCornerPos = value)
    );
    this.state.rightCorner.addListener(
      ({ value }) => (this._rightCornerPos = value)
    );

    this.leftResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) =>
        Math.abs(gestureState.dx) > 0,
      onMoveShouldSetPanResponderCapture: (e, gestureState) =>
        Math.abs(gestureState.dx) > 0,
      onPanResponderMove: this._handleLeftCornerMove,
      onPanResponderRelease: this._handleLeftCornerRelease
    });

    this.rightResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) =>
        Math.abs(gestureState.dx) > 0,
      onMoveShouldSetPanResponderCapture: (e, gestureState) =>
        Math.abs(gestureState.dx) > 0,
      onPanResponderMove: this._handleRightCornerMove,
      onPanResponderRelease: this._handleRightCornerRelease
    });
    const { source = "" } = this.props;
    if (!source.trim()) {
      throw new Error("source should be valid string");
    }
  }

  async componentDidMount() {
    /**
     * binding emitter for ffmpeg  response
     */
    this.setState({ timeLineImages: [], duration: this.props.duration });

    this._endTime = this.props.duration;

    addThumbnailListener(resp => {
      if (resp.videopath) {
        var joined = [];

        for (var i = 0; i < resp.videopath.length; i++) {
          var imageName = { img: resp.videopath[i] };
          joined.push(imageName);
        }

        this.setState({ timeLineImages: joined });
      }
    });

    setTimeout(() => {
      this.getTimelineImage();
    }, 500);
  }

  async getTimelineImage() {
    //Get images from the video as per the time
    getThumbnailImagesFromVideo(this.props.source);
  }

  componentWillUnmount() {
    this.state.leftCorner.removeAllListeners();
    this.state.rightCorner.removeAllListeners();
  }

  _handleLeftCornerRelease() {
    this.state.leftCorner.setOffset(this._leftCornerPos);
    this.state.leftCorner.setValue(0);
  }

  _handleRightCornerRelease() {
    this.state.rightCorner.setOffset(this._rightCornerPos);
    this.state.rightCorner.setValue(0);
  }

  _handleRightCornerMove(e, gestureState) {
    const { duration, layoutWidth } = this.state;
    const leftPos = this._leftCornerPos;
    const rightPos = layoutWidth - Math.abs(this._rightCornerPos);
    const moveLeft = gestureState.dx < 0;
    if (rightPos - leftPos <= 50 && moveLeft) {
      return;
    }
    this._endTime = calculateCornerResult(
      duration,
      this._rightCornerPos,
      layoutWidth,
      true
    );

    this._callOnChange();
    Animated.event([null, { dx: this.state.rightCorner }])(e, gestureState);
  }

  _handleLeftCornerMove(e, gestureState) {
    const { duration, layoutWidth } = this.state;
    const leftPos = this._leftCornerPos;
    const rightPos = layoutWidth - Math.abs(this._rightCornerPos);
    const moveRight = gestureState.dx > 0;

    if (rightPos - leftPos <= 50 && moveRight) {
      return;
    }

    this._startTime = calculateCornerResult(
      duration,
      this._leftCornerPos,
      layoutWidth
    );
    this._callOnChange();

    Animated.event([null, { dx: this.state.leftCorner }])(e, gestureState);
  }

  _callOnChange() {
    this.props.onChange({
      startTime: this._startTime,
      endTime: this._endTime
    });
  }

  renderLeftSection() {
    const { leftCorner, layoutWidth } = this.state;
    return (
      <Animated.View
        style={[
          styles.container,
          styles.leftCorner,
          {
            left: -layoutWidth,
            transform: [
              {
                translateX: leftCorner
              }
            ]
          }
        ]}
        {...this.leftResponder.panHandlers}
      >
        <View style={styles.row}>
          <View style={styles.bgBlack} />
          <View style={styles.cornerItem} />
        </View>
      </Animated.View>
    );
  }

  renderRightSection() {
    const { rightCorner, layoutWidth } = this.state;
    return (
      <Animated.View
        style={[
          styles.container,
          styles.rightCorner,
          { right: -layoutWidth + 20 },
          {
            transform: [
              {
                translateX: rightCorner
              }
            ]
          }
        ]}
        {...this.rightResponder.panHandlers}
      >
        <View style={styles.row}>
          <View style={styles.cornerItem} />
          <View style={styles.bgBlack} />
        </View>
      </Animated.View>
    );
  }

  render() {
    const { images } = this.state;
    return (
      <View
        style={styles.container}
        onLayout={({ nativeEvent }) => {
          this.setState({
            layoutWidth: nativeEvent.layout.width
          });
        }}
      >
        {this.state.timeLineImages.map((item, index) => (
          <Image
            key={`preview-source-${item.img}-${index}`}
            source={{ uri: item.img }}
            style={styles.imageItem}
          />
        ))}
        <View style={styles.corners}>
          {this.renderLeftSection()}
          {this.renderRightSection()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  },
  row: {
    flexDirection: "row"
  },
  imageItem: {
    flex: 1,
    width: 50,
    height: 50,
    resizeMode: "cover"
  },
  corners: {
    position: "absolute",
    height: 50,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rightCorner: {
    position: "absolute",
    flex: 1
  },
  leftCorner: {
    left: 0
  },
  bgBlack: {
    backgroundColor: "rgba(249, 8, 155, 0.5)",
    width
  },
  cornerItem: {
    backgroundColor: Colors.primaryAccent,
    width: 20,
    height: 50
  }
});
