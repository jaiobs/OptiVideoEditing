import React, {Component} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {orientation} from '../actions/cameraPreviewAction';
import {connect} from 'react-redux';
import {log} from '../utils';

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getOrientation();
    Dimensions.addEventListener('change', () => {
      this.getOrientation();
    });
  }
  componentDidMount() {
    setTimeout(() => {
      this.getOrientation();
    }, 400);
  }

  //GET ORIENTATION OF CAMERA
  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get('window').width < Dimensions.get('window').height) {
        log('portrait');
        this.props.orientation('portrait');
      } else {
        log('landscape');
        this.props.orientation('landscape');
      }
    }
  };

  //MAIN RENDER METHOD
  render() {
    return (
      <View
        ref="rootView"
        style={[styles.container, this.props.containerStyles]}
      />
    );
  }
}

const mapStateToProps = state => {
  const {orientationCheck} = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(
  mapStateToProps,
  {
    orientation,
  },
)(MainContainer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
  },
});
