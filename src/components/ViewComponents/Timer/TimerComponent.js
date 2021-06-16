import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  View,
} from 'react-native';
import {Colors} from '../../../res';

export default class TimerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: true,
      count: this.props.count,
      activeTab: 0,
      videoTimerValue: 5,
      initialCount: 6,
    };
    this.animatedValue = new Animated.Value(0);
  }

  componentWillMount() {
    clearInterval(this.interval);
    this.animatedValue = new Animated.Value(0);
    this.setState({count: this.props.count});
  }

  startTimer() {
    clearInterval(this.interval);
    this.setState({count: this.props.count}, () => {
      this.initiateTimer();
    });
  }

  initiateTimer() {
    this.animate();
    this.interval = setInterval(() => {
      this.setState({count: this.state.count - 1});
      if (this.state.count === 0) {
        clearInterval(this.interval);
        this.props.onTimerFinished();
      }
    }, 1000);
  }

  onCancel() {
    this.props.onCancel();
    clearInterval(this.interval);
    this.animatedValue.setValue(0);
    this.setState({count: this.props.count});
  }

  animate() {
    this.animatedValue.setValue(0);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start(() => this.animate());
  }

  onModalDismiss() {
    this.animatedValue.setValue(0);
    this.props.onTimerFinished();
  }

  render() {
    const textSize = this.animatedValue.interpolate({
      inputRange: [0, 0.0, 1],
      outputRange: [70, 90, 70],
    });
    return (
      <Modal
        onShow={() => this.startTimer()}
        onDismiss={() => this.onModalDismiss()}
        supportedOrientations={['portrait', 'landscape']}
        visible={this.props.visibility}
        transparent={true}
        animationType={'none'}
        style={styles.container}>
        {this.state.count > -1 && (
                    <View style={styles.animationView}>
        <Text style={styles.animationText}>
            <Animated.Text
              style={[
                styles.animation,
                {
                  fontSize: textSize,
                },
              ]}>
              {this.state.count === 0 ? 'Action' : this.state.count}
            </Animated.Text>
          </Text>
          <TouchableOpacity
            style={styles.sideBtns}
            onPress={() => this.onCancel()}>
            <Text style={styles.tabTitle}>Cancel</Text>
          </TouchableOpacity>
          </View>
          )}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  animation: {
    alignSelf: 'center',
    color: Colors.white,
  },
  animationView: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {},
  tabTitle: {
    color: Colors.white,
    fontSize: 14,
  },
  animationText: {
    color: Colors.primaryAccent,
    fontSize: 30,
  },
  sideBtns: {
    width: 80,
    backgroundColor: Colors.primaryAccent,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
