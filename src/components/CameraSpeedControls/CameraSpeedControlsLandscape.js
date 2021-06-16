import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  Image,
  Animated,
  Text,
} from 'react-native';
import {Images} from '../../res/';
import BouncyView from '../widgets/BouncyView/BouncyView';

export default class CameraSpeedControlsLandscape extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speedVisible: this.props.speedVisible,
      endValue: 1,

      tapIndex: 3,
      item: 'Normal',
      fadeValue: new Animated.Value(0.9),
      speed_menu: new Animated.Value(0.9),
    };
  }

  componentDidMount() {
    this.fadeIn_menu();
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  backAction = () => {
    this.setState({speedVisible: false, tapIndex: 3});
    return true;
  };

  toggleSpeedControlView() {
    this.setState({speedVisible: !this.state.speedVisible});
    this.fadeIn_speed();
  }

  updateSelectedState(item) {
    this.toggleSpeedControlView();

    this.setState({tapIndex: item});
    if (item === 1) {
      //slow motion
      this.setState({item: 'slow 2X'});
      this.props.updatePlaybackSpeed('slow2');
    } else if (item === 2) {
      this.setState({item: 'slow 1X'});
      this.props.updatePlaybackSpeed('slow1');
    } else if (item === 3) {
      this.setState({item: 'normal'});
      this.props.updatePlaybackSpeed('normal');
    } else if (item === 4) {
      this.setState({item: 'fast 1X'});
      this.props.updatePlaybackSpeed('fast1');
    } else if (item === 5) {
      this.setState({item: 'fast 2X'});
      this.props.updatePlaybackSpeed('fast2');
    } else if (item === 6) {
      this.setState({item: 'reverse'});
      this.props.updatePlaybackSpeed('reverse');
    }
  }
  fadeIn_menu = () => {
    Animated.spring(this.state.fadeValue, {
      toValue: this.state.endValue,
      friction: 2,
      useNativeDriver: true,
    }).start(() => this.fadeIn_menu());
  };
  fadeIn_speed = () => {
    Animated.spring(this.state.speed_menu, {
      toValue: this.state.endValue,
      friction: 2,
      useNativeDriver: true,
    }).start();
  };
  render() {
    const tapIndex = this.state.tapIndex;
    return (
      <View
        style={
          this.props.orientation === 'portrait'
            ? styles.portrait_container
            : styles.landscape_container
        }>
        {!this.state.speedVisible && (
          <View style={styles.menu_view}>
            <Animated.View
              style={[
                {
                  transform: [
                    {
                      scale: this.state.fadeValue,
                    },
                  ],
                },
              ]}>
              <View style={styles.speedNameView}>
                <Text style={styles.speedName}>
                  {this.state.item === 'normal'
                    ? 'Normal'
                    : this.state.item === 'reverse'
                    ? 'Reverse'
                    : this.state.item}
                </Text>
              </View>
              <View style={styles.menus}>
                <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={this.props.toggleFlash}>
                  <Image
                    style={styles.speedIcon}
                    source={
                      this.props.flash === true
                        ? Images.flash_light_active
                        : Images.flash_light_inactive
                    }
                  />
                </BouncyView>

                <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={this.props.toggleFacing}>
                  <Image
                    style={styles.speedIcon}
                    source={Images.change_camera_face}
                  />
                </BouncyView>

                {/* <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={this.props.toggleBeautyMode}>
                  <Image style={styles.speedIcon} source={Images.beauty_icon} />
                </BouncyView> */}

                <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={() => this.toggleSpeedControlView()}>
                  <Image
                    style={styles.speedIcon}
                    source={Images.slowmotion_icon}
                  />
                </BouncyView>

                <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={this.props.showTimer}>
                  <Image style={styles.speedIcon} source={Images.timer_icon} />
                </BouncyView>

                <BouncyView
                  style={styles.portraitSpeedIconContainer}
                  onPress={this.props.toggleMusic}>
                  <Image style={styles.speedIcon} source={Images.music_icon} />
                </BouncyView>
                {this.props.canShowAdjustmentIcon && (
                  <BouncyView
                    style={styles.portraitSpeedIconContainer}
                    onPress={this.props.showAdjustments}>
                    <Image
                      style={styles.speedIcon}
                      source={Images.filter_adj_icon}
                    />
                  </BouncyView>
                )}
              </View>
            </Animated.View>
          </View>
        )}

        {this.state.speedVisible && (
          <View style={styles.speedView}>
            <TouchableOpacity
              onPress={() => this.updateSelectedState(6)}
              style={tapIndex === 6 ? styles.tapReverse : styles.unTapReverse}>
              <Image
                style={styles.loopIcon}
                source={Images.video_reverse_icon}
              />
              <Text style={styles.revTextStyle}>reverse</Text>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.rowContainerPortrait,
                {
                  // opacity: this.state.speed_menu, // Bind opacity to animated value
                  transform: [
                    {
                      scale: this.state.speed_menu,
                    },
                  ],
                },
              ]}>
              <TouchableOpacity
                onPress={() => this.updateSelectedState(1)}
                style={tapIndex === 1 ? styles.tapButton : styles.unTapButton}>
                <Text style={styles.tabTextStyle}>slow 2X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.updateSelectedState(2)}
                style={tapIndex === 2 ? styles.tapButton : styles.unTapButton}>
                <Text style={styles.tabTextStyle}>slow 1X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.updateSelectedState(3)}
                style={tapIndex === 3 ? styles.tapButton : styles.unTapButton}>
                <Text style={styles.tabTextStyle}>normal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.updateSelectedState(4)}
                style={tapIndex === 4 ? styles.tapButton : styles.unTapButton}>
                <Text style={styles.tabTextStyle}>fast 1X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.updateSelectedState(5)}
                style={tapIndex === 5 ? styles.tapButton : styles.unTapButton}>
                <Text style={styles.tabTextStyle}>fast 2X</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  portrait_container: {
    zIndex: 1,
    bottom: 0,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    marginBottom: 100,
  },
  landscape_container: {
    bottom: 0,
    zIndex: 2,
    alignSelf: 'center',
    position: 'absolute',
  },
  menu_view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menus: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  portraitSpeedIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  speedIcon: {
    height: 34,
    width: 34,
    marginLeft: 12,
  },
  tapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    marginLeft: 2,
    marginRight: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 90,
    height: 30,
    zIndex: 1,
    borderRadius: 20,
  },
  unTapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    marginLeft: 2,
    marginRight: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 75,
    height: 30,
    zIndex: 1,
    borderRadius: 20,
  },
  speedNameView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  speedName: {
    color: 'white',
    fontSize: 15,
  },
  speedView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  fadingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unTapReverse: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginBottom: 5,
    width: 90,
    minHeight: 35,
    borderRadius: 20,
  },
  tapReverse: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 5,
    width: 90,
    minHeight: 35,
    borderRadius: 20,
  },
  loopIcon: {
    height: 14,
    width: 14,
  },
  rowContainerPortrait: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  revTextStyle: {
    color: '#fff',
    fontSize: 14,
    paddingLeft: 5,
    paddingBottom: 3,
  },
  tabTextStyle: {color: '#fff', fontSize: 12},
});
