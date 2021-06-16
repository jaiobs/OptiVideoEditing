/**
 * Video editor component
 */

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules,
} from "react-native";
import React, { Component } from "react";

const LitPicVideoEditorComponent = requireNativeComponent("LitPicVideoEditor");
const editorManager = NativeModules.LitPicVideoEditorModule;

export default class LitPicVideoEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  unMountVideoEditor() {
    if(editorManager){
      editorManager.unMountVideoEditor(this._editorHandle);
    }
  }

  componentWillUnmount() {
    this.unMountVideoEditor();
  }

  _setReference = (ref: ?Object) => {
    if (ref) {
      this._editorRef = ref;
      this._editorHandle = findNodeHandle(ref);
    } else {
      this._editorRef = null;
      this._editorHandle = null;
    }
  };

  render() {
    return (
      <LitPicVideoEditorComponent ref={this._setReference} {...this.props} />
    );
  }
}
