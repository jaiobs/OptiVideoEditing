import React from 'react';
import {Platform, StyleSheet, Text, View, Animated, Easing} from 'react-native';
import PropTypes from 'prop-types';
import {Colors} from '../../res';
import {utils} from '../../utils';

class VideoTimeLineBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: props.value,
      widthAnimation: 0,
    };

    this.widthAnimation = new Animated.Value(0);
    this.backgroundAnimation = new Animated.Value(0);
    this.backgroundInterpolationValue = null;
  }

  componentDidMount() {
    if (this.state.progress > 0) {
      this.animateWidth();
    }
  }

  componentWillReceiveProps(props) {
    if (
      props.value !== this.state.progress ||
      props.width != this.props.width
    ) {
      if (props.value >= 0 && props.value <= this.props.maxValue) {
        this.setState({progress: props.value}, () => {
          this.animateWidth();
          if (this.state.progress === this.props.maxValue) {
            // Callback after complete the progress
            const callback = this.props.onComplete;
            if (callback) {
              setTimeout(callback, this.props.barAnimationDuration);
            }
          }
        });
      }
    }
  }

  animateWidth() {
    const toValue =
      (this.props.width * this.state.progress) / this.props.maxValue;
    // console.log("ANIMATE TIMELINE BAR",toValue)
    this.setState({
      widthAnimation: toValue,
    });
    Animated.timing(this.widthAnimation, {
      easing: Easing[this.props.barEasing],
      toValue: toValue > 0 ? toValue : 0,
      duration: this.props.barAnimationDuration,
    }).start();
  }

  animateBackground() {
    Animated.timing(this.backgroundAnimation, {
      toValue: 1,
      duration: this.props.backgroundAnimationDuration,
    }).start();
  }

  renderIntervals(intervalValues) {
    return intervalValues.map((item, index) => {
      var leftValue = (this.props.width * item.width) / this.props.maxValue;
      return (
        <View
          key={index}
          style={{
            backgroundColor: Colors.white,
            width: 2,
            left: Number(leftValue.toFixed(1)) - 2,
            // height: this.props.height,
          }}
        />
      );
    });
  }

  render() {
    if (this.props.backgroundColorOnComplete) {
      this.backgroundInterpolationValue = this.backgroundAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [
          this.props.backgroundColor,
          this.props.backgroundColorOnComplete,
        ],
      });
    }

    return (
      <View
        style={[
          {
            width: this.props.width,
            height: this.props.height,
            borderWidth: this.props.borderWidth,
            borderColor: this.props.borderColor,
            backgroundColor: Colors.white,
          },
          this.props.orientation == 'portrait'
            ? styles.container_portrait
            : styles.container_landscape,
        ]}>
        <Animated.View
          style={{
            flexDirection: 'row',
            height: this.props.height - this.props.borderWidth * 2,
            width: this.state.widthAnimation,
            backgroundColor:
              this.backgroundInterpolationValue || this.props.backgroundColor,
          }}>
          {this.renderIntervals(this.props.interval)}
        </Animated.View>
        {Platform.OS == "ios" && 
          <View style={{top:0,position:"absolute"}}>
          <View style={{backgroundColor:Colors.primaryAccent,position:"absolute",top:0,left: (this.props.width/2) - 5, width:5, height: this.props.height}}>
          </View>
          <Text style={{color:"white",fontSize:this.props.orientation == 'portrait' ? 9 : 7,fontWeight:'500',position:"absolute",top:this.props.orientation == 'portrait' ? (this.props.height + 5) : (this.props.height + 2),left: (this.props.width/2) - 7, zIndex:999}}>15s</Text>
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container_portrait: {
    top: utils.isIos ? 0 : 23,
  },
  container_landscape: {
    marginTop: 0,
  },
});

VideoTimeLineBar.propTypes = {
  /**
   * Bar values
   */
  value: PropTypes.number,
  maxValue: PropTypes.number,

  /**
   * Animations
   */
  barEasing: PropTypes.oneOf([
    'bounce',
    'cubic',
    'ease',
    'sin',
    'linear',
    'quad',
  ]),
  barAnimationDuration: PropTypes.number,
  backgroundAnimationDuration: PropTypes.number,

  /**
   * StyleSheet props
   */
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  backgroundColor: PropTypes.string,
  backgroundColorOnComplete: PropTypes.string,
  borderWidth: PropTypes.number,
  borderColor: PropTypes.string,
  borderRadius: PropTypes.number,

  /**
   * Callbacks
   */
  onComplete: PropTypes.func,
};

VideoTimeLineBar.defaultProps = {
  value: 0,
  maxValue: 30,

  barEasing: 'ease',
  barAnimationDuration: 200,
  backgroundAnimationDuration: 500,

  height: 3,

  backgroundColor: Colors.primaryAccent,
  backgroundColorOnComplete: null,

  borderWidth: 0,
  borderColor: Colors.white,
  borderRadius: 0,

  onComplete: null,
};

export default VideoTimeLineBar;
