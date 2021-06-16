import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Component} from 'react';

import {Colors, Images} from '../../res';
import Modal from 'react-native-modal';
import TrimmerSlider from './TrimmerSlider';
import {throttle} from 'lodash/fp';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const maxTrimDuration = 60000;
const minimumTrimDuration = 5000;

export default class AudioTrimmer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      startPosition: 0,
      startTime: 0.0,
      startedRecording: false,
      totalDuration: 140995,
      trimmerLengthOptionIndex: 1,
      startPressed: false,
      exitPressed: false,
      initialPlay: false,
    };
    this.onTrimmerValueChangedThrottles = throttle(500)(
      this.onTrimmerValueChanged,
    );
  }

  togglePlayButton = () => {
    const {playing} = this.state;

    if (playing) {
      this.trimmerRef.stopTrackProgressAnimation();
      this.setState({playing: false});
    } else {
      this.trimmerRef.startTrackProgressAnimation();
      this.setState({playing: true});
    }
  };

  onTrimmerValueChanged = (value) => {
    this.setState({startPosition: value});
  };

  changeTrimmerLength = () => {
    this.trimmerRef.stopTrackProgressAnimation();
    this.setState(
      {
        trimmerLengthOptionIndex:
          (this.state.trimmerLengthOptionIndex + 1) % TRIMMER_LENGTHS.length,
      },
      () => {
        if (this.state.playing) {
          this.trimmerRef.startTrackProgressAnimation();
        }
      },
    );
  };

  onSlidingComplete = (value) => {
    this.setState({scrubbing: false});

    if (this.trimmerRef && this.trimmerRef.scrollViewRef) {
      const {totalDuration, trimmerLengthOptionIndex} = this.state;

      const newStartingPosition =
        value *
        (totalDuration - TRIMMER_LENGTHS[trimmerLengthOptionIndex].value);

      this.setState({startPosition: newStartingPosition});
    }
    if (this.state.playing) {
      this.trimmerRef.startTrackProgressAnimation();
    }
  };

  onScrollBeginDrag = () => {
    this.trimmerRef.stopTrackProgressAnimation();
  };

  componentDidMount() {
    this.setState({
      startedRecording: false,
    });
  }

  componentWillUnMount() {
    clearInterval(this.trimmerRef.scrubberInterval);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visibility == true && this.state.initialPlay == false) {
      this.setState(
        {
          initialPlay: true,
          startTime: 0.0,
        },
        () => {
          this.trimmerRef.startTrackProgressAnimation();
          this.props.getTrimmedStartValue(0);
        },
      );
    } else if (nextProps.visibility == false && this.state.initialPlay) {
      this.setState({
        initialPlay: false,
      });
    }
  }

  render() {
    const {
      trimmerLeftHandlePosition,
      trimmerRightHandlePosition,
      scrubberPosition,
    } = this.state;
    return (
      <Modal
        backdropColor={'transparent'}
        style={{justifyContent: 'flex-end', margin: 0, zIndex: 999}}
        isVisible={this.props.visibility}
        onModalWillHide={() => {
          this.props.onModalWillHide(
            this.state.startPressed,
            this.state.exitPressed,
          );
        }}
        onBackdropPress={this.props.onBackdropPress}>
        <View
          style={
            this.props.orientation == 'portrait'
              ? styles.containerPortrait
              : styles.containerLandscape
          }>
          {/* TITLE TRACK */}

          <View
            style={{
              flexDirection: 'row',
              paddingTop: 20,
              paddingBottom: 10,
              flex: 1,
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <Image
              style={{height: 50, width: 50, resizeMode: 'contain'}}
              source={
                this.props.dataItem.artwork_url != null
                  ? {uri: this.props.dataItem.artwork_url}
                  : Images.song_placeholder
              }
            />

            <Text style={styles.trackTitle}>{this.props.dataItem.title}</Text>
          </View>

          {/* STARTING FROM LABEL */}
          <Text style={[styles.trackTitle, {fontSize: 12, marginLeft: 20}]}>
            start from {this.state.startTime}
          </Text>

          {/* AUDIO WAVEFORM AND TRIMMER */}
          <TrimmerSlider
            ref={(ref) => (this.trimmerRef = ref)}
            onHandleChange={this.onHandleChange}
            totalDuration={this.props.dataItem.duration}
            trimmerLeftHandlePosition={trimmerLeftHandlePosition}
            trimmerRightHandlePosition={trimmerRightHandlePosition}
            minimumTrimDuration={minimumTrimDuration}
            maxTrimDuration={maxTrimDuration}
            maximumZoomLevel={0}
            zoomMultiplier={20}
            initialZoomValue={2}
            scaleInOnInit={false}
            trimmerLength={this.props.dataItem.duration}
            orientation={this.props.orientation}
            tintColor="#f638dc"
            markerColor="#5a3d5c"
            dataItem={this.props.dataItem}
            trackBackgroundColor="#382039"
            trackBorderColor="#5a3d5c"
            scrubberColor={Colors.primaryAccent}
            scrubberPosition={scrubberPosition}
            onScrubbingComplete={this.onScrubbingComplete}
            onLeftHandlePressIn={() => console.log('onLeftHandlePressIn')}
            onRightHandlePressIn={() => console.log('onRightHandlePressIn')}
            onScrubberPressIn={() => console.log('onScrubberPressIn')}
            onScroll={(xOffset) => {
              let percentage = this.props.orientation == 'portrait'?(xOffset / (screenWidth * 2 ))*100 : (xOffset / (screenHeight * 2 ))*100
              let factorValue =((this.props.dataItem.duration / 1000)/100)*percentage
            this.setState(
              {
                startTime:
                  factorValue / 60 <= 0 ? 0.0 : (factorValue / 60).toFixed(2),
              },
              () => {
                this.props.getTrimmedStartValue(factorValue);
              },
            );
            }}
          />
          {/* FOOTER BUTTONS */}
          <View
            style={{
              flex: 1,
              alignSelf: 'center',
              flexDirection: 'row',
              marginTop: this.props.orientation == 'portrait' ? 40 : 10,
            }}>
            <TouchableOpacity
              style={styles.sideBtns}
              onPress={() => {
                this.setState(
                  {
                    startPressed: true,
                    exitPressed: false,
                  },
                  () => {
                    this.props.onBackdropPress();
                    this.trimmerRef.stopTrackProgressAnimation();
                  },
                );
              }}>
              <Text style={[styles.tabTitle, {fontSize: 16}]}>start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideBtns, {marginLeft: 30}]}
              onPress={() => {
                this.setState(
                  {
                    startPressed: false,
                    exitPressed: true,
                  },
                  () => {
                    this.props.onBackdropPress();
                    this.trimmerRef.stopTrackProgressAnimation();
                  },
                );
              }}>
              <Text style={[styles.tabTitle, {fontSize: 16}]}>exit</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    height: '50%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 999,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  containerLandscape: {
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    height: '70%',
    width: '100%',
    zIndex: 999,
    alignSelf: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerContainer: {
    backgroundColor: Colors.black,
  },
  sideBtns: {
    width: 80,
    backgroundColor: Colors.primaryAccent,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
  },
  trackTitle: {
    color: 'white',
    marginLeft: 5,
    width: '70%',
    textAlign: 'left',
    fontSize: 14,
  },
  tabTitle: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 4,
    alignSelf: 'center',
  },
  timesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timesInnerContainer: {
    width: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timesLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
  },
});
