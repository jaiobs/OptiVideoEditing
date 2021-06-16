import React, {Component} from 'react';
import {
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import FontSelectionComponent from './FontSelectionComponent';
import ColorPalette from './ColorPalette';
import {Colors, Images} from '../../../res';

const defaultTextAlign = 'center';
const defaultTextBackground = 'empty';

export default class TextOverLayComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bottom: 0,
      textAlign: defaultTextAlign,
      textBackground: defaultTextBackground,
    };

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => this._keyboardDidShow(e),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      (e) => this._keyboardDidHide(e),
    );
  }

  _keyboardDidShow(e) {
    console.log('show', e);
    this.setState({bottom: e.endCoordinates.height + 31});
  }

  _keyboardDidHide(e) {
    this.setState({bottom: 0});
  }

  getTextAlign() {
    return this.state.textAlign === 'center'
      ? Images.text_align_center
      : this.state.textAlign === 'left'
      ? Images.text_align_left
      : Images.text_align_right;
  }


  getTextBackground() {
    return this.state.textBackground === 'empty'
      ? Images.text_without_background
      : this.state.textBackground === 'transparent'
      ? Images.text_invert_background
      : Images.text_active_background;
  }

  resetTextAlign() {
    this.setState({textAlign: defaultTextAlign});
  }

  resetTextBackground() {
    this.setState({textBackground: defaultTextBackground});
  }

  toggleTextAlign() {
    this.setState(
      {
        textAlign:
          this.state.textAlign === 'center'
            ? 'left'
            : this.state.textAlign === 'left'
            ? 'right'
            : 'center',
      },
      () => {
        this.props.changeTextAlignment(this.state.textAlign);
      },
    );
  }

  toggleTextBackground() {
    this.setState(
      {
        textBackground:
          this.state.textBackground === 'empty'
            ? 'fill'
            : this.state.textBackground === 'fill'
            ? 'transparent'
            : 'empty',
      },
      () => {
        this.props.changeTextBackground(this.state.textBackground);
      },
    );
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={[styles.container, {bottom: this.state.bottom}]}>
        <View style={styles.fontStyleContainer}>
          <TouchableOpacity onPress={() => this.toggleTextBackground()}>
            <Image
              style={styles.fontStyleIcon}
              source={this.getTextBackground()}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.toggleTextAlign()}>
            <Image style={styles.fontStyleIcon} source={this.getTextAlign()} />
          </TouchableOpacity>
          <FontSelectionComponent onFontSelected={this.props.onFontSelected} />
        </View>
        <ColorPalette onChange={this.props.onColorChange} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'column',
    position: 'absolute',
    backgroundColor: Colors.transparent,
    left: 2,
    right: 2,
  },
  fontStyleContainer: {flexDirection: 'row', alignItems: 'center'},
  fontStyleIcon: {
    height: 30,
    width: 30,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 10,
  },
});
