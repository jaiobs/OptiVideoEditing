import React, {Component} from 'react';
import {View, requireNativeComponent, findNodeHandle} from 'react-native';

const ImagePreviewComponent = requireNativeComponent('imagePreviewAndroid');

export default class ImagePreivew extends Component {
  constructor(props) {
    super(props);
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._ImagePreviewRef = ref;
      this._imagePreviewHandle = findNodeHandle(ref);
    } else {
      this._ImagePreviewRef = null;
      this._imagePreviewHandle = null;
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <ImagePreviewComponent ref={this._setReference} {...this.props} />
      </View>
    );
  }
}
