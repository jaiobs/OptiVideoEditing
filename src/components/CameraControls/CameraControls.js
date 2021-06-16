import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Images} from '../../res';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';

export default class CameraControls extends Component {
  render() {
    if (this.props.preVideo == true) {
      return (
        <View
          style={
            this.props.orientation == 'portrait'
              ? styles.control_right_container
              : styles.control_left_container
          }>
          {this.props.showCross && (
            <TouchableOpacity
              style={{zIndex: 1}}
              onPress={this.props.toggleFlash}>
              <Image style={styles.crossIcon} source={Images.close_icon} />
            </TouchableOpacity>
          )}

          <BouncyView onPress={this.props.showAdjustments}>
            <Image style={styles.flashIcon} source={Images.filter_adj_icon} />
          </BouncyView>
        </View>
      );
    } else {
      if (
        this.props.isShowSpeedView == false ||
        this.props.orientation == 'landscape'
      ) {
        return (
          <View
            style={
              this.props.orientation == 'portrait'
                ? styles.control_right_container
                : styles.control_left_container
            }>
            {this.props.showCross && (
              <TouchableOpacity
                style={{zIndex: 1}}
                onPress={this.props.toggleFlash}>
                <Image style={styles.crossIcon} source={Images.close_icon} />
              </TouchableOpacity>
            )}

            <BouncyView onPress={this.props.toggleFlash}>
              <Image
                style={[styles.flashIcon]}
                source={
                  this.props.flash == true
                    ? Images.flash_light_active
                    : Images.flash_light_inactive
                }
              />
            </BouncyView>

            <BouncyView onPress={this.props.toggleFacing}>
              <Image
                style={[styles.flashIcon]}
                source={Images.change_camera_face}
              />
            </BouncyView>

            {/* {this.props.enableBeautyOption && ( */}
            {Platform.OS == 'android' && (
              <BouncyView onPress={this.props.toggleBeautyMode}>
                <Image
                  style={[
                    styles.flashIcon,
                    {
                      width:
                        this.props.orientation == 'portrait' &&
                        Platform.OS == 'ios'
                          ? 35
                          : 38,
                      height:
                        this.props.orientation == 'portrait' &&
                        Platform.OS == 'ios'
                          ? 35
                          : 38,
                    },
                  ]}
                  source={
                    this.props.isBeautyApplied
                      ? Images.beauty_on_icon
                      : Images.beauty_off_icon
                  }
                />
              </BouncyView>
            )}
            {/* )} */}
            {this.props.orientation == 'portrait' && (
              <BouncyView onPress={this.props.toggleSpeedView}>
                <Image
                  style={[styles.flashIcon]}
                  source={Images.slowmotion_icon}
                />
              </BouncyView>
            )}

            <BouncyView onPress={this.props.showTimer}>
              <Image style={[styles.flashIcon]} source={Images.timer_icon} />
            </BouncyView>
            <BouncyView onPress={this.props.toggleMusicPicker}>
              <Image style={[styles.flashIcon]} source={Images.music_icon} />
            </BouncyView>
            {this.props.canShowAdjustmentIcon && (
              <BouncyView onPress={this.props.showAdjustments}>
                <Image
                  style={[styles.flashIcon]}
                  source={Images.filter_adj_icon}
                />
              </BouncyView>
            )}
          </View>
        );
      } else {
        return null;
      }
    }
  }
}

const styles = StyleSheet.create({
  flashIcon: {
    height: Platform.OS == 'ios' ? 38 : 32,
    width: Platform.OS == 'ios' ? 38 : 32,
    margin: Platform.OS == 'ios' ? 8 : 6,
    padding: 10,
    marginTop: 15,
    zIndex: 1,
  },
  control_right_container: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: Platform.OS == 'ios' ? 90 : 115,
    marginTop: 25,
    marginRight: 10,
    flexDirection: 'row',
    zIndex: 1,
  },
  control_left_container: {
    left: 0,
    alignSelf: 'flex-start',
    position: 'absolute',
    backgroundColor: 'black',
    height: '100%',
    width: 90,
    zIndex: 1,
    paddingLeft: 20,
    paddingRight: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  crossIcon: {
    height: 28,
    width: 28,
    padding: 10,
  },
  android_control_right_container: {
    right: 0,
    alignSelf: 'flex-end',
    marginTop: 25,
    marginRight: 10,
    justifyContent: 'center',
    zIndex: 1,
  },
  android_control_left_container: {
    left: 4,
    alignSelf: 'flex-start',
    position: 'absolute',
    height: '100%',
    zIndex: 1,
    paddingLeft: 4,
    paddingRight: 4,
    marginTop: 10,
  },
});
