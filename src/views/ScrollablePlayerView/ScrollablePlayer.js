import React, {Component} from 'react';
import {View, StyleSheet, BackHandler} from 'react-native';
import {ScrollingVideoPlayer} from '../../libs/litpic_sdk';

export default class ScrollablePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoPath: props.navigation.getParam('videoPath', null),
      videoDetails: props.navigation.getParam('videoDetails', null),
      cropPosition: props.navigation.getParam('cropPosition', null),
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.onClosePressed();
    return true;
  }

  onClosePressed() {
    this.props.navigation.navigate('CameraPreview');
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollingVideoPlayer
          style={{flex: 1}}
          videoPath={this.state.videoPath}
          cropPosition={this.state.cropPosition}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
