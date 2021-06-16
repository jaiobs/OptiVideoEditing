/**
 * Touchable filter component for changing filter
 * Apply filter when tab left and right side of the screen
 * Created by vigneshwaran.n@optisolbusiness.com
 */

import React, { Component } from "react";
import FilterTypes from "../../../libs/livefilter/FilterTypes"
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";

export default class TouchableFilterChanger extends Component {
  constructor(props) {
    super(props);
    this.state = {
        currentFilter: 1,
    };
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
    this.setState({ filter: filter, currentFilter: filterPosition }, () => {
      this.updateFilterConfigValues();
    });
  }

  //store the filter configuration values in the storage
  updateFilterConfigValues() {
    this.setState(
      {
        filterConfig: {
          ...this.state.filterConfig,
          ["key" + this.props.interval]: {
            duration: this.props.interval,
            filter: this.state.filter
          }
        }
      },
      () => {
        this.props.onFilterValuesChanged({filter:this.state.filter,currentFilter:this.state.currentFilter,filterConfig:this.state.filterConfig});
      }
    );
  }

  //change next filter
  onNextFilterClicked() {
    var filterPosition = this.state.currentFilter + 1;
    if (filterPosition === 22) {
      filterPosition = 1;
    }
    var filter = this.getFilter(filterPosition);
    this.setState({ filter: filter, currentFilter: filterPosition }, () => {
      this.updateFilterConfigValues();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.onPrevFilterClicked()}
          style={styles.leftContainer}
        />

        <TouchableOpacity
          onPress={() => this.onNextFilterClicked()}
          style={styles.rightContainer}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: Platform.OS == "ios" ? "80%": "100%",
    position: "absolute",
    zIndex: 999
  },
  leftContainer: {
    flex: 1
  },
  rightContainer: {
    flex: 1
  }
});
