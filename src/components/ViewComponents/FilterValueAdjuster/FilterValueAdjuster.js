import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../res/';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-modal';

export default class FilterValueAdjuster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewKey: 0,
    };
  }

  onRequestClose() {
    this.props.onClosePressed();
  }

  changeContrast(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: Number(value.toFixed(2)),
      saturation: this.props.filter.saturation,
      brightness: this.props.filter.brightness,
    };
    this.updateFilterValues(filterVal);
  }

  changeBrightness(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: this.props.filter.contrast,
      saturation: this.props.filter.saturation,
      brightness: Number(value.toFixed(2)),
    };
    this.updateFilterValues(filterVal);
  }

  changeSaturation(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: this.props.filter.contrast,
      saturation: Number(value.toFixed(2)),
      brightness: this.props.filter.brightness,
    };
    this.updateFilterValues(filterVal);
  }

  setRangeValue(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: this.props.filter.contrast,
      saturation: this.props.filter.saturation,
      brightness: this.props.filter.brightness,
      range: parseFloat(value.toFixed(2)),
    };
    this.updateFilterValues(filterVal);
  }

  async updateFilterValues(filterVal) {
    clearTimeout(this.sliderTimeoutId);
    this.sliderTimeoutId = setTimeout(() => {
      this.props.updateFilterValues(filterVal);
    }, 100);
  }

  render() {
    const {saturation, contrast, brightness, range} = this.props.filter;

    return (
      <Modal
        backdropColor={'transparent'}
        style={{justifyContent: 'flex-end', margin: 0}}
        isVisible={
          this.props.isShowSlider && this.props.filter.type !== 'NORMAL'
        }
        onRequestClose={() => this.onRequestClose()}
        ///onModalWillHide={() => {this.props.onModalWillHide()}}
        onBackdropPress={this.props.onClosePressed}>
        <View key={this.state.viewKey} style={styles.containerPortrait}>
          {/* <TouchableOpacity
            onPress={() => this.props.onClosePressed()}
            style={{
              alignSelf: 'flex-end',
              padding: 4,
              borderRadius: 8,
            }}>
            { <Image
              style={{height: 18, width: 18, padding: 1}}
              source={Images.close_icon}
            /> }
          </TouchableOpacity> */}

          {this.props.isShowSlider && this.props.filter.type === 'CSB' && (
            <View
              style={{
                padding: 4,
              }}>
              <Text style={styles.contrast}>
                Contrast :{contrast.toFixed(2)}
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={4}
                step={0.01}
                value={contrast}
                minimumTrackTintColor={Colors.primaryAccent}
                maximumTrackTintColor={Colors.white}
                thumbTintColor={Colors.primaryAccent}
                onValueChange={(Contrast) =>
                  this.changeContrast(Contrast)
                }></Slider>
              <Text style={styles.saturation}>
                Saturation :{saturation.toFixed(2)}
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={4}
                step={0.01}
                value={saturation}
                minimumTrackTintColor={Colors.primaryAccent}
                maximumTrackTintColor={Colors.white}
                thumbTintColor={Colors.primaryAccent}
                onValueChange={(Saturation) =>
                  this.changeSaturation(Saturation)
                }></Slider>
              <Text style={styles.brightness}>
                Brightness :{brightness.toFixed(2)}
              </Text>
              <Slider
                style={{marginBottom: 8}}
                minimumValue={-1.0}
                maximumValue={1.0}
                step={0.01}
                value={brightness}
                minimumTrackTintColor={Colors.primaryAccent}
                maximumTrackTintColor={Colors.white}
                thumbTintColor={Colors.primaryAccent}
                onValueChange={(Brightness) =>
                  this.changeBrightness(Brightness)
                }></Slider>
            </View>
          )}
          {this.props.isShowSlider &&
            this.props.filter.type !== 'CSB' &&
            this.props.filter.type !== 'NORMAL' && (
              <View
                style={{
                  padding: 4,
                }}>
                <Text style={styles.range}>Range :{range.toFixed(2)}</Text>
                <Slider
                  style={{marginBottom: 8}}
                  minimumValue={0}
                  maximumValue={2}
                  step={0.1}
                  value={range}
                  minimumTrackTintColor={Colors.primaryAccent}
                  maximumTrackTintColor={Colors.white}
                  thumbTintColor={Colors.primaryAccent}
                  onValueChange={(val) => this.setRangeValue(val)}></Slider>
              </View>
            )}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  containerPortrait: {
    width: '100%',
    alignSelf: 'center',
    minHeight: 230,
    padding: 10,
    paddingBottom: 20,
    alignContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    zIndex: 2,
    top: 20,
  },
  range: {
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  brightness: {
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  saturation: {
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  contrast: {
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  containerLandscape: {
    top: 100,
    width: '50%',
    alignSelf: 'center',
    padding: 10,
    alignContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderRadius: 20,
    zIndex: 2,
  },
});
