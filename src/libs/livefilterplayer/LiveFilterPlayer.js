/**
 * LiveFilter component for applying filter for video player
 */

import { requireNativeComponent } from "react-native";
import React, { Component } from "react";

const LiveFilterVideoComponent = requireNativeComponent("FilterVideoPlayer");

export default class FilterVideoComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <LiveFilterVideoComponent {...this.props} />;
  }
}
