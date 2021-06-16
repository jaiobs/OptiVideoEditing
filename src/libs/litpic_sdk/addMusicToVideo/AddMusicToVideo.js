import React, {Component} from 'react';
import {View, requireNativeComponent, findNodeHandle} from 'react-native';

const MusicToVideo = requireNativeComponent('MusicToVideo');

export default class AddMusicToVideo extends Component {
  constructor(props) {
    super(props);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._AddMusicToVideoRef = ref;
      this._AddMusicToVideoHandle = findNodeHandle(ref);
    } else {
      this._AddMusicToVideoRef = null;
      this._AddMusicToVideoHandle = null;
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <MusicToVideo ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
