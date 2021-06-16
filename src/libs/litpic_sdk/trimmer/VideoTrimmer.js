import React, { Component } from "react";
import{View,Text,requireNativeComponent,
    NativeModules,
    PermissionsAndroid,
    findNodeHandle} from 'react-native';

const VideoTrimmerPreview = requireNativeComponent("VideoTrimmerPreview");
const VideoTrimmerManager = NativeModules.VideoTrimmerModule;

export default class VideoTrimmer extends Component
{
    constructor(props){
        super(props)
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
            <View style={{flex:1}}>
                  <VideoTrimmerPreview ref={this._setReference} {...this.props} />
            </View>
        )
    }
}