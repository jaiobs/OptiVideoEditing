import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    BackHandler,
  } from 'react-native';
import {ScrollingImageView} from '../../libs/litpic_sdk';

export default class ScrollableImage extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
        photoPath: props.navigation.getParam('photoPath', null),
        imageDetails: props.navigation.getParam('imageDetails', null),
        imageHeight: props.navigation.getParam('imageHeight',0),
        imageWidth: props.navigation.getParam('imageWidth',0),
        cropPosition: props.navigation.getParam('cropPosition', null)
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
        <ScrollingImageView
          style={styles.imagePreview}
          //ref={ref => (this.ScrollableImage = ref)}
          ref = {this.inputRef}
          imagePath={this.state.imagePath}
          imageDetails={this.state.imageDetails}
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
  imagePreview: {
    flex: 1,
    resizeMode: 'contain',
  }
});
