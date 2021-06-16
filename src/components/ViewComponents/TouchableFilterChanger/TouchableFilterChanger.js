/**
 * Touchable filter component for changing filter
 * Apply filter when tab left and right side of the screen
 * Created by vigneshwaran.n@optisolbusiness.com
 */

import React, {Component} from 'react';
import FilterTypes from '../../../libs/livefilter/FilterTypes';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
export default class TouchableFilterChanger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFilter: 1,
      pan: new Animated.ValueXY(),
      width: 0,
    };
  }

  componentWillMount() {
    this._val = {x: 0, y: 0};
    this.state.pan.addListener((value) => (this._val = value));
    this.panResponder = PanResponder.create({
      onPanResponderRelease: (evt, gesture) => true,
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderEnd: (evt, gesture) => {
        if (
          this.state.width <
          parseFloat(JSON.stringify(this.state.pan.x)) + 170
        ) {
          this.state.pan.setValue({
            x: this.state.width - 170,
            y: 0,
          });
        }
      },

      onPanResponderMove: (_val, gestureState) => {
        let current_possition = this.state.pan.x;
        let boundry = this.state.width - 170;
        if (current_possition <= boundry) {
          this.state.pan.setValue({
            x: this.state.width - 170,
            y: 0,
          });
        }
        return Animated.event([null, {moveX: this.state.pan.x}])(
          _val,
          gestureState,
        );
      },
    });
  }

  componentDidUpdate() {
    if (this.state.width !== Dimensions.get('window').width) {
      this.updateState();
    }
  }

  updateState() {
    this.setState({width: Dimensions.get('window').width});
  }

  //get filter based on values
  getFilter(val) {
    switch (val) {
      case 1:
        return FilterTypes.Normal;
      case 2:
        return FilterTypes.L1;
      case 3:
        return FilterTypes.L2;
      case 4:
        return FilterTypes.L3;
      case 5:
        return FilterTypes.L4;
      case 6:
        return FilterTypes.L5;
      case 7:
        return FilterTypes.L6;
      case 8:
        return FilterTypes.L7;
      case 9:
        return FilterTypes.GRAYSCALE;
      case 10:
        return FilterTypes.SEPIA;
      case 11:
        return FilterTypes.MONOCHROME;
      case 12:
        return FilterTypes.L11;
      case 13:
        return FilterTypes.L12;
      case 14:
        return FilterTypes.L13;
      case 15:
        return FilterTypes.L14;
      case 16:
        return FilterTypes.L15;
      case 17:
        return FilterTypes.L16;
      case 18:
        return FilterTypes.L17;
      case 19:
        return FilterTypes.L18;
      case 20:
        return FilterTypes.L19;
      case 21:
        return FilterTypes.blur;
    }
  }

  //change prev filter
  onPrevFilterClicked() {
    var filterPosition;
    filterPosition = this.state.currentFilter - 1;
    if (filterPosition === 0) {
      filterPosition = 21;
    }
    var filter = this.getFilter(filterPosition);
    this.setState({filter: filter, currentFilter: filterPosition}, () => {
      this.updateFilterConfigValues();
    });
  }

  //store the filter configuration values in the storage
  updateFilterConfigValues() {
    this.setState(
      {
        filterConfig: {
          ...this.state.filterConfig,
          ['key' + this.props.interval]: {
            duration: this.props.interval,
            filter: this.state.filter,
          },
        },
      },
      () => {
        this.props.onFilterValuesChanged({
          filter: this.state.filter,
          currentFilter: this.state.currentFilter,
          filterConfig: this.state.filterConfig,
        });
      },
    );
  }

  //change next filter
  onNextFilterClicked() {
    var filterPosition = this.state.currentFilter + 1;
    if (filterPosition === 22) {
      filterPosition = 1;
    }
    var filter = this.getFilter(filterPosition);
    this.setState({filter: filter, currentFilter: filterPosition}, () => {
      this.updateFilterConfigValues();
    });
  }

  render() {
    console.log("orientation",this.props.orientation);
    if (this.props.reset_filter) {
      if (this.state.currentFilter !== 1) {
        this.props.clearFilter(false);
        this.setState({currentFilter: 1});
      }
    }

    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
    };

    return (
      <View style={styles.container}>
        {this.props.orientation === 'landscape' && (
          <Animated.View
            {...this.panResponder.panHandlers}
            style={
              this.props.orientation === 'landscape' && [
                panStyle,
                styles.rectangle_area,
              ]
            }
          />
        )}
        <View
          style={
            this.props.orientation === 'portrait'
              ? styles.container_portrait
              : styles.container_landscape
          }>
          <TouchableOpacity
            onPress={() => this.onPrevFilterClicked()}
            style={styles.leftContainer}
          />

          <TouchableOpacity
            onPress={() => this.onNextFilterClicked()}
            style={styles.rightContainer}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container_portrait: {
    flex: 1,
    flexDirection: 'row',
  },
  rectangle_area: {
    flexDirection: 'row',
    width: 170,
    height: '97%',
    marginTop: 5,
    borderRadius: 2,
    zIndex: 1,
    position: 'absolute',
    borderStyle: 'dashed',
    borderColor: 'white',
    borderWidth: 3,
  },
  container: {
    height: '100%',
    width: '100%',
  },

  container_landscape: {
    flex: 1,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
  },
  rightContainer: {
    flex: 1,
  },
});
