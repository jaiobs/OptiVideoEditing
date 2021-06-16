import React, {Component} from 'react';
import {Animated, PanResponder, View, Easing, Platform} from 'react-native';
import PropTypes from 'prop-types';

const truty = () => true;
const noop = () => {};

let opacity = new Animated.Value(0);

const animate = (easing) => {
  opacity.setValue(0);
  Animated.timing(opacity, {
    toValue: 1,
    duration: 1200,
    easing,
  }).start();
};

const size = opacity.interpolate({
  inputRange: [0, 1],
  outputRange: [45, 50],
});

const speedControlSize = opacity.interpolate({
  inputRange: [0, 1],
  outputRange: [55, 60],
});

const animatedStyles = [
  // styles.box,
  {
    opacity,
    width: size,
    //height: size,
    marginBottom: Platform.OS == 'ios' ? 10 : 0,
  },
];

class BouncyView extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    isSpeedControl: PropTypes.bool,
    scale: PropTypes.number,
    moveSlop: PropTypes.number,
    delay: PropTypes.number,
  };

  static defaultProps = {
    onPress: noop,
    isSpeedControl: false,
    scale: 1.1, // Max scale of animation
    moveSlop: 15, // Slop area for press
    delay: 10, // Animation delay in miliseconds
  };

  state = {
    scale: new Animated.Value(1),
  };

  callOnPressEvent() {
    Animated.timing(this.state.scale, {
      toValue: this.props.scale,
      friction: 1,
      duration: 200,
    }).start();
  }

  componentWillMount() {
    animate(Easing.in(Easing.bounce));
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: truty,
      onStartShouldSetPanResponderCapture: truty,
      onMoveShouldSetPanResponder: truty,
      onMoveShouldSetPanResponderCapture: truty,
      onPanResponderTerminationRequest: truty,
      onPanResponderTerminate: noop,
      onPanResponderGrant: () => {
        Animated.timing(this.state.scale, {
          toValue: this.props.scale,
          friction: 1,
          duration: 200,
        }).start();
      },

      onPanResponderRelease: (evt, gestureState) => {
        const {moveSlop, delay, onPress} = this.props;

        const isOutOfRange =
          gestureState.dy > moveSlop ||
          gestureState.dy < -moveSlop ||
          gestureState.dx > moveSlop ||
          gestureState.dx < -moveSlop;

        if (!isOutOfRange) {
          setTimeout(() => {
            Animated.spring(this.state.scale, {
              toValue: 1,
              friction: 1,
              duration: 200,
            }).start();

            onPress(evt);
          }, delay);
        }
      },
    });
  }

  render() {
    const {scale} = this.state;
    const {children, style, ...rest} = this.props;

    return (
      <Animated.View
        style={[
          {
            transform: [
              {
                scale,
              },
            ],
          },
          style,
          animatedStyles,
          {width: this.props.isSpeedControl ? speedControlSize : size},
        ]}
        {...rest}>
        <View {...this.panResponder.panHandlers}>{children}</View>
      </Animated.View>
    );
  }
}

export default BouncyView;
