import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import React from 'react';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const MINIMUM_TRIM_DURATION = 1000;
const MAXIMUM_TRIM_DURATION = 60000;
const MAXIMUM_SCALE_VALUE = 50;
const ZOOM_MULTIPLIER = 5;
const INITIAL_ZOOM = 2;
const SCALE_ON_INIT_TYPE = 'trim-duration';
const SHOW_SCROLL_INDICATOR = true;
const CENTER_ON_LAYOUT = true;

const TRACK_PADDING_OFFSET = 1;
const HANDLE_WIDTHS = 30;

const MARKER_INCREMENT = 5000;
const SPECIAL_MARKER_INCREMEMNT = 5;

const TRACK_BACKGROUND_COLOR = '#f2f6f5';
const TRACK_BORDER_COLOR = '#c8dad3';
const MARKER_COLOR = '#c8dad3';
const TINT_COLOR = '#93b5b3';
const SCRUBBER_COLOR = '#63707e';

export default class TrimmerSlider extends React.PureComponent {
  scrollX = new Animated.Value(0);
  trackProgress = new Animated.Value(0);
  contentWidth = new Animated.Value(0);
  trimmerWidth = new Animated.Value(0);
  adjustedScrollValue = new Animated.Value(0);
  animatedTextRef = React.createRef();
  sliderRef = React.createRef();
  scrollViewRef = React.createRef();

  constructor(props) {
    super(props);

    let trackScale = props.initialZoomValue || INITIAL_ZOOM;
    if (props.scaleInOnInit) {
      const {
        maxTrimDuration = MAXIMUM_TRIM_DURATION,
        scaleInOnInitType = SCALE_ON_INIT_TYPE,
        trimmerRightHandlePosition,
        trimmerLeftHandlePosition,
      } = this.props;
      const isMaxDuration = scaleInOnInitType === 'max-duration';
      const trimDuration = isMaxDuration
        ? maxTrimDuration
        : trimmerRightHandlePosition - trimmerLeftHandlePosition;
      const smartScaleDivider = isMaxDuration ? 3 : 5; // Based on testing, 3 works better when the goal is to have the entire trimmer fit in the visible area
      const percentTrimmed = trimDuration / props.totalDuration;
      const smartScaleValue = 2 / percentTrimmed / smartScaleDivider;
      trackScale = this.clamp({
        value: smartScaleValue,
        min: 1,
        max: props.maximumZoomLevel || MAXIMUM_SCALE_VALUE,
      });
    }

    this.initiateAnimator();
    this.state = {
      markerMargin: 0,
      contentWidth: 0,
      scrubberPosition: 1,
      scrubbing: false, // this value means scrubbing is currently happening
      trimming: false, // this value means the handles are being moved
      trackScale,
      initialTrackPosition: 0, // the scale factor for the track
      trimmingLeftHandleValue: 0,
      trimmingRightHandleValue: 0,
      internalScrubbingPosition: 0,
      offSet:screenWidth/2
    };
  }

  round = (num) => Math.round(num).toFixed(0);

  clamp = ({value, min, max}) => Math.min(Math.max(value, min), max);

  initiateAnimator = () => {
    this.scaleTrackValue = new Animated.Value(0);
    this.lastDy = 0;
    this.trackPanResponder = this.createTrackPanResponder();
    this.leftHandlePanResponder = this.createLeftHandlePanResponder();
    this.rightHandlePanResponder = this.createRightHandlePanResponder();
    this.scrubHandlePanResponder = this.createScrubHandlePanResponder();
  };

  componentDidMount = () => {
    this.scrollX = new Animated.Value(0);
    this.trackProgress = new Animated.Value(0);
    this.lastStartPosition = 0;
  };

  componentWillUnMount() {
    clearInterval(this.scrubberInterval);
  }

  createScrubHandlePanResponder = () =>
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.setState({
          scrubbing: true,
          internalScrubbingPosition: this.props.scrubberPosition,
        });
        this.handleScrubberPressIn();
      },
      onPanResponderMove: (evt, gestureState) => {
        const {trackScale} = this.state;
        const {
          scrubberPosition,
          trimmerLeftHandlePosition,
          trimmerRightHandlePosition,
          totalDuration,
        } = this.props;

        const trackWidth = screenWidth * trackScale;
        const calculatedScrubberPosition =
          (scrubberPosition / totalDuration) * trackWidth;

        const newScrubberPosition =
          ((calculatedScrubberPosition + gestureState.dx) / trackWidth) *
          totalDuration;

        const lowerBound = Math.max(0, trimmerLeftHandlePosition);
        const upperBound = trimmerRightHandlePosition;

        const newBoundedScrubberPosition = this.clamp({
          value: newScrubberPosition,
          min: lowerBound,
          max: upperBound,
        });

        this.setState({
          internalScrubbingPosition: newBoundedScrubberPosition,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.handleScrubbingValueChange(this.state.internalScrubbingPosition);
        this.setState({scrubbing: false});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });

  createRightHandlePanResponder = () =>
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.setState({
          trimming: true,
          trimmingRightHandleValue: this.props.trimmerRightHandlePosition,
          trimmingLeftHandleValue: this.props.trimmerLeftHandlePosition,
        });
        this.handleRightHandlePressIn();
      },
      onPanResponderMove: (evt, gestureState) => {
        const {trackScale} = this.state;
        const {
          trimmerRightHandlePosition,
          totalDuration,
          minimumTrimDuration = MINIMUM_TRIM_DURATION,
          maxTrimDuration = MAXIMUM_TRIM_DURATION,
        } = this.props;

        const trackWidth = screenWidth * trackScale;
        const calculatedTrimmerRightHandlePosition =
          (trimmerRightHandlePosition / totalDuration) * trackWidth;

        const newTrimmerRightHandlePosition =
          ((calculatedTrimmerRightHandlePosition + gestureState.dx) /
            trackWidth) *
          totalDuration;

        const lowerBound = minimumTrimDuration;
        const upperBound = totalDuration;

        const newBoundedTrimmerRightHandlePosition = this.clamp({
          value: newTrimmerRightHandlePosition,
          min: lowerBound,
          max: upperBound,
        });

        if (
          newBoundedTrimmerRightHandlePosition -
            this.state.trimmingLeftHandleValue >=
          maxTrimDuration
        ) {
          this.setState({
            trimmingRightHandleValue: newBoundedTrimmerRightHandlePosition,
            trimmingLeftHandleValue:
              newBoundedTrimmerRightHandlePosition - maxTrimDuration,
          });
        } else if (
          newBoundedTrimmerRightHandlePosition -
            this.state.trimmingLeftHandleValue <=
          minimumTrimDuration
        ) {
          this.setState({
            trimmingRightHandleValue: newBoundedTrimmerRightHandlePosition,
            trimmingLeftHandleValue:
              newBoundedTrimmerRightHandlePosition - minimumTrimDuration,
          });
        } else {
          this.setState({
            trimmingRightHandleValue: newBoundedTrimmerRightHandlePosition,
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.handleHandleSizeChange();
        this.setState({trimming: false});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });

  createLeftHandlePanResponder = () =>
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.setState({
          trimming: true,
          trimmingRightHandleValue: this.props.trimmerRightHandlePosition,
          trimmingLeftHandleValue: this.props.trimmerLeftHandlePosition,
        });
        this.handleLeftHandlePressIn();
      },
      onPanResponderMove: (evt, gestureState) => {
        const {trackScale} = this.state;
        const {
          trimmerLeftHandlePosition,
          totalDuration,
          minimumTrimDuration = MINIMUM_TRIM_DURATION,
          maxTrimDuration = MAXIMUM_TRIM_DURATION,
        } = this.props;

        const trackWidth = screenWidth * trackScale;
        const calculatedTrimmerLeftHandlePosition =
          (trimmerLeftHandlePosition / totalDuration) * trackWidth;

        const newTrimmerLeftHandlePosition =
          ((calculatedTrimmerLeftHandlePosition + gestureState.dx) /
            trackWidth) *
          totalDuration;

        const lowerBound = 0;
        const upperBound = totalDuration - minimumTrimDuration;

        const newBoundedTrimmerLeftHandlePosition = this.clamp({
          value: newTrimmerLeftHandlePosition,
          min: lowerBound,
          max: upperBound,
        });

        if (
          this.state.trimmingRightHandleValue -
            newBoundedTrimmerLeftHandlePosition >=
          maxTrimDuration
        ) {
          this.setState({
            trimmingRightHandleValue:
              newBoundedTrimmerLeftHandlePosition + maxTrimDuration,
            trimmingLeftHandleValue: newBoundedTrimmerLeftHandlePosition,
          });
        } else if (
          this.state.trimmingRightHandleValue -
            newBoundedTrimmerLeftHandlePosition <=
          minimumTrimDuration
        ) {
          this.setState({
            trimmingRightHandleValue: newBoundedTrimmerLeftHandlePosition,
            trimmingLeftHandleValue:
              newBoundedTrimmerLeftHandlePosition - minimumTrimDuration,
          });
        } else {
          this.setState({
            trimmingLeftHandleValue: newBoundedTrimmerLeftHandlePosition,
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.handleHandleSizeChange();
        this.setState({trimming: false});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });

  calculatePinchDistance = (x1, y1, x2, y2) => {
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  };

  createTrackPanResponder = () =>
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) =>
        !this.state.scrubbing && !this.state.trimming,
      onStartShouldSetPanResponderCapture: (evt, gestureState) =>
        !this.state.scrubbing && !this.state.trimming,
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        !this.state.scrubbing && !this.state.trimming,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        !this.state.scrubbing && !this.state.trimming,
      onPanResponderGrant: (evt, gestureState) => {
        this.lastScaleDy = 0;
        const touches = evt.nativeEvent.touches || {};

        if (touches.length == 2) {
          const pinchDistance = this.calculatePinchDistance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY,
          );

          this.lastScalePinchDist = pinchDistance;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        const {
          maximumZoomLevel = MAXIMUM_SCALE_VALUE,
          zoomMultiplier = ZOOM_MULTIPLIER,
        } = this.props;

        if (touches.length == 2) {
          const pinchDistance = this.calculatePinchDistance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY,
          );

          if (this.lastScalePinchDist === undefined) {
            this.lastScalePinchDist = pinchDistance;
          }

          const stepValue = pinchDistance - this.lastScalePinchDist;
          this.lastScalePinchDist = pinchDistance;

          const scaleStep = (stepValue * zoomMultiplier) / screenHeight;
          const {trackScale} = this.state;

          const newTrackScaleValue = trackScale + scaleStep;
          const newBoundedTrackScaleValue = Math.max(
            Math.min(newTrackScaleValue, maximumZoomLevel),
            1,
          );

          this.setState({trackScale: newBoundedTrackScaleValue});
        } else {
          const stepValue = gestureState.dy - this.lastScaleDy;
          this.lastScaleDy = gestureState.dy;

          const scaleStep = (stepValue * zoomMultiplier) / screenHeight;
          const {trackScale} = this.state;

          const newTrackScaleValue = trackScale + scaleStep;
          const newBoundedTrackScaleValue = Math.max(
            Math.min(newTrackScaleValue, maximumZoomLevel),
            1,
          );

          this.setState({trackScale: newBoundedTrackScaleValue});
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });

  startTrackProgressAnimation = () => {
    this.trackProgress.setValue(0);
    const {scrubberPosition,offSet} = this.state;
    let currentOrientation = screenWidth < screenHeight ? screenHeight : screenHeight;

    var offSetValue = offSet != null ? offSet :scrubberPosition;
    let percentage = screenWidth < screenHeight ? (offSetValue / (screenWidth * 2 ))*100 : (offSetValue / (screenHeight * 2 ))*100
    let startTime =((this.props.dataItem.duration / 1000)/100)*percentage
    let interval =
      screenWidth < screenHeight ? screenWidth * 2 : screenHeight * 2;
    let updatedInterval = (interval - offSetValue) > currentOrientation ? currentOrientation : (interval - offSetValue)
    let secDuration = (this.props.dataItem.duration / 1000) - 1;
    let incrementValue = (updatedInterval) / (secDuration - startTime);

    this.scrubberInterval = setInterval(() => {
      if (this.state.scrubberPosition <= interval) {
        this.setState({
          scrubberPosition: this.state.scrubberPosition + incrementValue,
        });
      } else {
        this.stopTrackProgressAnimation();
      }
    }, 1000);
  };

  stopTrackProgressAnimation = () => {
    clearInterval(this.scrubberInterval);
  };

  handleScrubbingValueChange = (newScrubPosition) => {
    const {onScrubbingComplete} = this.props;
    onScrubbingComplete && onScrubbingComplete(newScrubPosition | 0);
  };

  handleHandleSizeChange = () => {
    const {onHandleChange} = this.props;
    const {trimmingLeftHandleValue, trimmingRightHandleValue} = this.state;
    onHandleChange &&
      onHandleChange({
        leftPosition: trimmingLeftHandleValue | 0,
        rightPosition: trimmingRightHandleValue | 0,
      });
  };

  handleLeftHandlePressIn = () => {
    const {onLeftHandlePressIn} = this.props;
    onLeftHandlePressIn && onLeftHandlePressIn();
  };

  handleRightHandlePressIn = () => {
    const {onRightHandlePressIn} = this.props;
    onRightHandlePressIn && onRightHandlePressIn();
  };

  handleScrubberPressIn = () => {
    const {onScrubberPressIn} = this.props;
    onScrubberPressIn && onScrubberPressIn();
  };


  handleScrollEnd = (event) => {
    console.log('offset value',event.nativeEvent.contentOffset.x)
    this.props.onScroll(event.nativeEvent.contentOffset.x);
    this.stopTrackProgressAnimation();
    this.setState(
      {
        scrubberPosition: event.nativeEvent.contentOffset.x,
        offSet: event.nativeEvent.contentOffset.x
      },()=>{
        this.startTrackProgressAnimation();
      }
    );
  };

  render() {
    const {
      minimumTrimDuration,
      totalDuration,
      trimmerLeftHandlePosition,
      trimmerRightHandlePosition,
      trackBackgroundColor = TRACK_BACKGROUND_COLOR,
      trackBorderColor = TRACK_BORDER_COLOR,
      scrubberColor = SCRUBBER_COLOR,
      centerOnLayout = CENTER_ON_LAYOUT,
      showScrollIndicator = SHOW_SCROLL_INDICATOR,
    } = this.props;

    if (
      minimumTrimDuration >
      trimmerRightHandlePosition - trimmerLeftHandlePosition
    ) {
      return null;
    }

    const {
      trimming,
      scrubbing,
      trimmingLeftHandleValue,
      trimmingRightHandleValue,
    } = this.state;

    const trackWidth =
      screenWidth < screenHeight ? screenWidth * 2 : screenHeight * 2;

    const trackBackgroundStyles = [
      styles.trackBackground,
      {
        width: trackWidth,
        backgroundColor: trackBackgroundColor,
        borderColor: trackBorderColor,
      },
    ];

    const leftPosition = trimming
      ? trimmingLeftHandleValue
      : trimmerLeftHandlePosition;
    const rightPosition = trimming
      ? trimmingRightHandleValue
      : trimmerRightHandlePosition;

    const boundedLeftPosition = Math.max(leftPosition, 0);
    const boundedTrimTime = Math.max(rightPosition - boundedLeftPosition, 0);

    const actualTrimmerWidth = (boundedTrimTime / totalDuration) * trackWidth;
    const actualTrimmerOffset =
      (boundedLeftPosition / totalDuration) * trackWidth +
      TRACK_PADDING_OFFSET +
      HANDLE_WIDTHS;
    const onLayoutHandler = centerOnLayout
      ? {
          onLayout: () => {
            const centerOffset =
              actualTrimmerOffset + actualTrimmerWidth / 2 - screenWidth / 2;
            console.log(
              'LAYOUT OFFSET',
              actualTrimmerOffset,
              actualTrimmerWidth,
              centerOffset,
            );
            this.scrollView.scrollTo({
              x: centerOffset,
              y: 0,
              animated: false,
            });
          },
        }
      : null;

    return (
      <View style={styles.root}>
        <View
          style={[styles.scrubberContainer, {left: 0, position: 'absolute'}]}>
          <View
            style={[styles.scrubberTail, {backgroundColor: scrubberColor}]}
          />
        </View>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, width: trackWidth + 100}}
          ref={(scrollView) => (this.scrollView = scrollView)}
          scrollEnabled={!trimming && !scrubbing}
          onScroll={this.handleScrollEnd}
          onScrollEndDrag={this.handleScrollEnd}
          style={[styles.horizontalScrollView, {transform: [{scaleX: 1.0}]}]}
          horizontal
          showsHorizontalScrollIndicator={showScrollIndicator}
          {...{...this.trackPanResponder.panHandlers, ...onLayoutHandler}}>
          <View style={trackBackgroundStyles}>
            <View style={styles.markersContainer}>
              <View style={{backgroundColor: 'transparent'}}>
                <Animated.Image
                  style={{
                    height: '100%',
                    width: '100%',
                    borderLeftWidth: this.state.scrubberPosition,
                    borderLeftColor: this.props.scrubberColor
                  }}
                  source={{uri: this.props.dataItem.waveform_url}}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    height: 160,
  },
  horizontalScrollView: {
    height: 160,
    overflow: 'hidden',
    position: 'relative',
    marginLeft: -23,
  },
  trackBackground: {
    overflow: 'hidden',
    marginVertical: 20,
    backgroundColor: TRACK_BACKGROUND_COLOR,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: TRACK_BORDER_COLOR,
    height: 140,
    marginHorizontal: HANDLE_WIDTHS + TRACK_PADDING_OFFSET,
  },
  trimmer: {
    position: 'absolute',
    left: TRACK_PADDING_OFFSET,
    top: 17,
    borderColor: TINT_COLOR,
    borderWidth: 3,
    height: 106,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_WIDTHS,
    height: 106,
    backgroundColor: TINT_COLOR,
    top: 17,
  },
  leftHandle: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightHandle: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  selection: {
    opacity: 0.2,
    backgroundColor: TINT_COLOR,
    width: '100%',
    height: '100%',
  },
  markersContainer: {
    width: '100%',
    height: '100%',
  },
  marker: {
    backgroundColor: MARKER_COLOR, // marker color,
    width: 2,
    height: 8,
    borderRadius: 2,
  },
  specialMarker: {
    height: 22,
  },
  hiddenMarker: {
    opacity: 0,
  },
  scrubberContainer: {
    zIndex: 1,
    position: 'absolute',
    width: 14,
    paddingTop: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrubberHead: {
    position: 'absolute',
    backgroundColor: SCRUBBER_COLOR,
    width: 14,
    height: 14,
    borderRadius: 14,
  },
  scrubberTail: {
    marginTop: 15,
    backgroundColor: SCRUBBER_COLOR,
    height: 155,
    width: 5,
    marginLeft: -5,
    borderRadius: 3,
  },
});
