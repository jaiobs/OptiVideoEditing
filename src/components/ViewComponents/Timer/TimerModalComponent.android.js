import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  View,
} from 'react-native';
import {Colors} from '../../../res';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-modal';

export default class TimerModalComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: true,
      count: 0,
      activeTab: 0,
      videoTimerValue: 30 - props.maxTimerValue,
      initialCount: 6,
      startPressed: false,
      exitPressed: true,
      type: 'photo',
    };
    this.animatedValue = new Animated.Value(0);
  }

  componentWillMount() {
    clearInterval(this.interval);
    this.setState({count: 5, startPressed: false});
  }

  componentWillReceiveProps(props) {
    if (this.props.onTimerFinished && this.state.exitPressed == true) {
      this.setState({
        videoTimerValue: 5,
        startPressed: !this.props.onTimerFinished,
      });
    }
  }

  startTimer() {
    clearInterval(this.interval);
    this.setState({count: 6}, () => {
      this.initiateTimer();
    });
  }

  initiateTimer() {
    this.animate();
    this.interval = setInterval(() => {
      this.setState({count: this.state.count - 1});
      if (this.state.count == 0) {
        clearInterval(this.interval);
        this.props.onTimerFinished();
      }
    }, 1000);
  }

  animate() {
    this.animatedValue.setValue(0);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
    }).start(() => this.animate());
  }

  onModalDismiss() {
    this.animatedValue.setValue(0);
    this.props.onTimerFinished();
  }

  render() {
    return (
      <Modal
        backdropColor={'transparent'}
        style={{justifyContent: 'flex-end', margin: 0}}
        onRequestClose={() =>
          this.setState({exitPressed: true}, () => {
            this.props.onBackdropPress();
          })
        }
        isVisible={this.props.visibility}
        onModalWillHide={() => {
          if (!this.state.exitPressed) {
            this.props.onModalWillHide(
              this.state.type == 'photo'
                ? this.state.count
                : this.state.videoTimerValue,
              this.state.type,
            );
          }
        }}
        onBackdropPress={this.props.onBackdropPress}>
        <View
          style={
            this.props.orientation == 'portrait'
              ? styles.containerPortrait
              : styles.containerLandscape
          }>
          <Text style={styles.set_timer}>Set timer</Text>
          <View
            style={{
              flex: 1,
              maxHeight: 40,
              marginTop: 10,
              flexDirection: 'row',
            }}>
            <View style={styles.rightHeaderContainer}>
              <TouchableOpacity onPress={() => this.setState({activeTab: 0})}>
                <Text style={styles.tabTitle}>Photo</Text>
              </TouchableOpacity>
              {this.state.activeTab == 0 && (
                <View style={styles.activeUnderLiner} />
              )}
            </View>
            <View style={styles.leftHeaderContainer}>
              <TouchableOpacity onPress={() => this.setState({activeTab: 1})}>
                <Text style={styles.tabTitle}>Video</Text>
              </TouchableOpacity>
              {this.state.activeTab == 1 && (
                <View style={styles.activeUnderLiner} />
              )}
            </View>
          </View>
          {this.state.activeTab == 0 && (
            <View
              style={{
                flex: 1,
                marginTop: this.props.orientation == 'portrait' ? 40 : 20,
              }}>
              <Animated.Text
                style={{
                  alignSelf: 'center',
                  color: Colors.white,
                  fontSize: 20,
                }}>
                {this.state.count} <Text style={styles.second}>Seconds</Text>
              </Animated.Text>

              <View
                style={[
                  styles.bottomView,
                  {marginTop: this.props.orientation == 'portrait' ? 40 : 20},
                ]}>
                <TouchableOpacity
                  style={styles.sideButton}
                  onPress={() => {
                    this.setState(
                      {
                        type: 'photo',
                        startPressed: true,
                        exitPressed: false,
                      },
                      () => {
                        this.props.onBackdropPress();
                      },
                    );
                  }}>
                  <Text style={styles.button_text}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sideButton]}
                  onPress={() => {
                    this.setState({exitPressed: true}, () => {
                      this.props.onBackdropPress();
                    });
                  }}>
                  <Text style={styles.button_text}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {this.state.activeTab == 1 && (
            <View
              style={{
                flex: 1,
                alignSelf: 'center',
                width: this.props.orientation == 'portrait' ? '90%' : '50%',
                marginTop: this.props.orientation == 'portrait' ? 20 : 10,
              }}>
              <Text style={{fontSize: 14, color: '#fff', alignSelf: 'center'}}>
                Set recording time
              </Text>
              <Text
                style={{
                  alignSelf: 'center',
                  color: Colors.white,
                  fontSize: 20,
                  marginTop: this.props.orientation == 'portrait' ? 20 : 10,
                }}>
                {this.state.videoTimerValue}{' '}
                <Text
                  style={{fontSize: 13, color: Colors.white, marginLeft: 5}}>
                  Seconds
                </Text>
              </Text>

              <Slider
                style={{
                  width: 300,
                  alignSelf: 'center',
                  marginTop: 10,
                  marginBottom: 10,
                }}
                minimumValue={0}
                maximumValue={30 - this.props.maxTimerValue}
                step={1.0}
                value={this.state.videoTimerValue}
                minimumTrackTintColor={Colors.primaryAccent}
                maximumTrackTintColor={Colors.white}
                thumbTintColor={Colors.primaryAccent}
                onValueChange={(val) => {
                  this.setState({videoTimerValue: val});
                }}
              />

              <View
                style={{
                  flex: 1,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  marginTop: this.props.orientation == 'portrait' ? 10 : 5,
                }}>
                <TouchableOpacity
                  style={styles.sideButtons}
                  onPress={() =>

                    this.setState(
                      {
                        type: 'video',
                        startPressed: true,
                        exitPressed: false,
                      },
                      () => {
                        this.props.onBackdropPress();
                      },
                    )
                  }>
                  <Text style={styles.button_text}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sideButtons}
                  onPress={() => {
                    this.setState({exitPressed: true}, () => {
                      this.props.onBackdropPress();
                    });
                  }}>
                  <Text style={styles.button_text}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  containerPortrait: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    height: 270,
    width: '100%',
    alignSelf: 'center',
    // minHeight:250,
    // flexDirection:"column",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // flex:1,
    // //alignSelf: "center",
    // padding: 10,
    // alignContent: "center",
    // backgroundColor: "black",
    // //"rgba(0, 0, 0, 0.62)",
    // borderRadius: 20,
    // zIndex: 2,
  },
  containerLandscape: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    height: 250,
    width: '100%',
    alignSelf: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  button_text: {
    fontSize: 14,
    color: 'white',
  },
  set_timer: {
    fontSize: 14,
    color: '#fff',
    alignSelf: 'center',
    marginTop: 15,
  },
  second: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 5,
  },
  headerContainer: {
    backgroundColor: Colors.black,
  },
  sideButton: {
    width: 80,
    backgroundColor: Colors.primaryAccent,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 40,
  },
  sideButtons: {
    width: 80,
    backgroundColor: Colors.primaryAccent,
    height: 35,
    borderRadius: 20,
    marginLeft: 40,

    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomView: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  leftHeaderContainer: {
    flex: 1,
    width: '30%',
    alignSelf: 'flex-start',
  },
  rightHeaderContainer: {
    flex: 1,
    width: '30%',
    alignSelf: 'flex-start',
  },
  closeIcon: {
    height: 24,
    width: 24,
  },
  activeUnderLiner: {
    top: 2,
    height: 6,
    alignSelf: 'center',
    backgroundColor: Colors.primaryAccent,
    width: 100,
  },
  tabContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
  },
  tabTitle: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 4,
    alignSelf: 'center',
  },
  countdownText: {},
});
