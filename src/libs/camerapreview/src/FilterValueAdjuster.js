import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Colors, Images} from '../../../res/';
import Slider from '@react-native-community/slider';

export default class FilterValueAdjuster extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  changeContrast(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: Number(value.toFixed(2)),
      saturation: this.props.filter.saturation,
      brightness: this.props.filter.brightness,
    };
    this.props.updateFilterValues(filterVal);
  }

  changeBrightness(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: this.props.filter.contrast,
      saturation: this.props.filter.saturation,
      brightness: Number(value.toFixed(2)),
    };
    this.props.updateFilterValues(filterVal);
  }

  changeSaturation(value) {
    var filterVal = {
      type: this.props.filter.type,
      name: this.props.filter.name,
      contrast: this.props.filter.contrast,
      saturation: Number(value.toFixed(2)),
      brightness: this.props.filter.brightness,
    };
    this.props.updateFilterValues(filterVal);
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
    this.props.updateFilterValues(filterVal);
  }

  render() {
    if (this.props.isShowSlider) {
      const {
        saturation,
        contrast,
        brightness,
        range,
      } = this.props.filter;

      return (
        <View
          style={{
            width: '90%',
            alignSelf: 'center',
            padding: 10,
            marginBottom: 20,
            alignContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.62)',
            borderRadius: 20,
          }}>
          <TouchableOpacity
            onPress={() => this.props.onClosePressed()}
            style={{
              alignSelf: 'flex-end',
              backgroundColor: Colors.primaryAccent,
              padding: 2,
              borderRadius: 8,
            }}>
            <Image
              style={{height: 14, width: 14, padding: 1}}
              source={Images.close_icon}
            />
          </TouchableOpacity>

          {this.props.isShowSlider && this.props.filter.type === 'CSB' && (
            <View
              style={{
                padding: 4,
              }}>
              <Text style={{marginTop: 4, marginBottom: 8, color: 'white'}}>
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
                onValueChange={(contrast) =>
                  this.changeContrast(contrast)
                }></Slider>
              <Text style={{marginTop: 8, marginBottom: 8, color: 'white'}}>
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
                onValueChange={(saturation) =>
                  this.changeSaturation(saturation)
                }></Slider>
              <Text style={{marginTop: 8, marginBottom: 8, color: 'white'}}>
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
                onValueChange={(brightness) =>
                  this.changeBrightness(brightness)
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
                <Text style={{marginTop: 8, marginBottom: 8, color: 'white'}}>
                  Range :{range.toFixed(2)}
                </Text>
                <Slider
                  style={{marginBottom: 8}}
                  minimumValue={0}
                  maximumValue={10}
                  step={0.1}
                  value={range}
                  minimumTrackTintColor={Colors.primaryAccent}
                  maximumTrackTintColor={Colors.white}
                  thumbTintColor={Colors.primaryAccent}
                  onValueChange={(val) => this.setRangeValue(val)}></Slider>
              </View>
            )}
        </View>
      );
    } else {
      return null;
    }
  }
}
