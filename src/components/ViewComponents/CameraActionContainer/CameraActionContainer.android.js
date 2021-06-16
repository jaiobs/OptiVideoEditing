import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import CameraCaptureAnimator from '../../../components/ViewComponents/CameraCaptureAnimator/CameraCaptureAnimator';
import {Images} from '../../../res';

export default class CameraActionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSpeed: 'Normal',
      width: 0,
    };
  }
  componentDidUpdate() {
    if (this.state.width !== Dimensions.get('window').width) {
      this.updateState();
    }
  }
  updateState() {
    this.setState({width: Dimensions.get('window').width});
  }

  renderPortraitContainer() {
    return (
      <View style={[portraitStyles.container]}>
        <View style={portraitStyles.captureLayoutPortrait}>
          <View
            style={[
              portraitStyles.gallery_icon,
              {
                width: this.state.width / 2 + 45,
              },
            ]}>
            <View style={portraitStyles.empty_view} />
            <View style={portraitStyles.shadowImage}>
              {!this.props.isRecording && !this.props.hideSilhouteIcon && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onShadowImagePressed();
                  }}
                  style={portraitStyles.gallery_button}>
                  <Image
                    style={portraitStyles.pickFromGallery}
                    source={Images.shadow_icon}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={{width: this.state.width / 4}}>
              {this.props.HidesCameraButton && (
                <CameraCaptureAnimator
                  ref={(refs) => (this.cameraCaptureAnimator = refs)}
                  orientation={this.props.orientationCheck}
                  capturePressed={() => {
                    this.props.capturePressed();
                  }}
                  captureReleased={() => {
                    this.props.captureReleased();
                  }}
                  capturePhoto={() => {
                    this.props.capturePhoto();
                  }}
                />
              )}
            </View>
          </View>
          {!this.props.isRecording && (
            <View
              style={[
                portraitStyles.icon_view,
                {
                  width: this.state.width / 2,
                },
              ]}>
              {this.props.galleryPickerVisibility && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onGalleryPickerPressed();
                  }}
                  style={portraitStyles.gallery_button}>
                  <Image
                    style={portraitStyles.pickFromGallery}
                    source={Images.pick_gallery}
                  />
                </TouchableOpacity>
              )}

              {!this.props.galleryPickerVisibility && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onDeleteLastVideoPressed();
                  }}
                  style={portraitStyles.delete_button}>
                  <Image
                    style={portraitStyles.deleteLastIcon}
                    source={Images.delete_last}
                  />
                </TouchableOpacity>
              )}

              {!this.props.galleryPickerVisibility &&
                this.props.doneCaptureVisibility && (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onVideoFinishPressed();
                    }}
                    style={portraitStyles.video_view}>
                    <Image
                      style={portraitStyles.nextVideoIcon}
                      source={Images.next_video_icon}
                    />
                  </TouchableOpacity>
                )}
            </View>
          )}
        </View>
      </View>
    );
  }

  renderLandscapeContainer() {
    return (
      <View style={landscapeStyles.container}>
        <View style={landscapeStyles.empty_view} />
        <View style={landscapeStyles.shadow_image}>
          {!this.props.isRecording && !this.props.hideSilhouteIcon && (
            <TouchableOpacity
              onPress={() => {
                this.props.onShadowImagePressed();
              }}
              style={portraitStyles.gallery_button}>
              <Image
                style={portraitStyles.pickFromGallery}
                source={Images.shadow_icon}
              />
            </TouchableOpacity>
          )}
        </View>
        <View>
          <CameraCaptureAnimator
            ref={(refs) => (this.cameraCaptureAnimator = refs)}
            orientation={this.props.orientationCheck}
            capturePressed={() => {
              this.props.capturePressed();
            }}
            captureReleased={() => {
              this.props.captureReleased();
            }}
            capturePhoto={() => {
              this.props.capturePhoto();
            }}
          />
        </View>
        <View style={landscapeStyles.empty_view}>
          {!this.props.isRecording && (
            <View style={landscapeStyles.camera_menus}>
              {this.props.galleryPickerVisibility && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onGalleryPickerPressed();
                  }}>
                  <Image
                    style={portraitStyles.pickFromGallery}
                    source={Images.pick_gallery}
                  />
                </TouchableOpacity>
              )}

              {!this.props.galleryPickerVisibility && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onDeleteLastVideoPressed();
                  }}>
                  <Image
                    style={portraitStyles.deleteLastIcon}
                    source={Images.delete_last}
                  />
                </TouchableOpacity>
              )}

              {!this.props.galleryPickerVisibility &&
                this.props.doneCaptureVisibility && (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onVideoFinishPressed();
                    }}>
                    <Image
                      style={portraitStyles.nextVideoIcon}
                      source={Images.next_video_icon}
                    />
                  </TouchableOpacity>
                )}
            </View>
          )}
        </View>
      </View>
    );
  }

  render() {
    if (this.props.orientation === 'portrait') {
      return this.renderPortraitContainer();
    } else {
      return this.renderLandscapeContainer();
    }
  }
}

const landscapeStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-end',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'transparent',
    marginTop: 10,
    zIndex: 2,
  },
  captureLayoutLandscape: {
    flex: 1,
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  pickFromGallery: {
    height: 24,
    width: 24,
  },
  empty_view: {
    flex: 1,
  },
  nextVideoIcon: {
    height: 28,
    width: 28,
  },
  shadow_image: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera_menus: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    paddingTop: 8,
    paddingBottom: 26,
  },
  deleteLastIcon: {
    height: 32,
    width: 32,
  },
});

const portraitStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    bottom: 0,
    position: 'absolute',
    paddingTop: 10,
    paddingBottom: 10,
  },
  captureLayoutPortrait: {
    marginTop: 8,
    marginBottom: 8,
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  },
  pickFromGallery: {
    height: 24,
    width: 24,
  },
  empty_view: {
    flex: 1,
  },
  shadowImage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingRight: 5,
  },
  gallery_button: {
    marginLeft: 4,
  },
  delete_button: {
    marginLeft: 4,
  },
  video_view: {
    marginRight: 10,
  },
  icon_view: {
    flex: 1,
    height: '100%',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextVideoIcon: {
    height: 28,
    width: 28,
  },
  deleteLastIcon: {
    height: 32,
    width: 32,
  },
  gallery_icon: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  speedIndicatorText: {
    color: 'white',
    padding: 10,
    fontSize: 14,
  },
});
