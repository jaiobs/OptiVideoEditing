import React, {Component} from 'react';
import {View, requireNativeComponent, findNodeHandle} from 'react-native';

const ScrollableVideoPlayer = requireNativeComponent('ScrollableVideoPlayer');

export default class ScrollingVideoPlayer extends Component {
  constructor(props) {
    super(props);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._trimmerRef = ref;
      this._trimmerHandle = findNodeHandle(ref);
    } else {
      this._trimmerRef = null;
      this._trimmerHandle = null;
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollableVideoPlayer ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
