import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { Component } from "react";

import CameraCaptureAnimator from "@litpic/react-native-litpic-camera-module/src/components/ViewComponents/CameraCaptureAnimator/CameraCaptureAnimator";
import CameraSpeedControls from "@litpic/react-native-litpic-camera-module/src/components/CameraSpeedControls/CameraSpeedControls";
import { Images } from "@litpic/react-native-litpic-camera-module/src/res";
import { utils } from "../../../utils";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default class CameraActionContainer extends Component {
  constructor(props) {
    super(props);
    this.cameraCaptureAnimator = React.createRef();
  }

  timerToRecordVideo() {
    this.cameraCaptureAnimator.current.onPressIn();
  }

  stopToRecordVideo() {
    this.cameraCaptureAnimator.current.onPressOut();
  }

  renderPortraitOptions() {
    if (this.props.galleryPickerVisibility) {
      return (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onGalleryPickerPressed();
              }}
            >
              <Image
                style={portraitStyles.pickFromGallery}
                source={Images.pick_gallery}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          ></View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onDeleteLastVideoPressed();
              }}
            >
              <Image
                style={portraitStyles.deleteLastIcon}
                source={Images.delete_last}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onVideoFinishPressed();
              }}
            >
              <Image
                style={portraitStyles.nextVideoIcon}
                source={Images.next_video_icon}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  renderIOSPortraitContainer() {
    return (
      <View style={portraitStyles.container}>
        {this.props.showSpeedView && (
          <CameraSpeedControls
            speedIndex={this.props.speedIndex}
            speedMode={this.props.speedMode}
            showSpeedView={this.props.showSpeedView}
            visibility={this.props.controlVisibility}
            orientation={this.props.orientation}
            speedDidChange={(speed) => {
              this.props.onVideoModeChanged(speed);
            }}
          />
        )}
        <View
          style={[
            portraitStyles.captureLayoutPortrait,
            { flexDirection: "row" },
          ]}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {!this.props.isRecording && !this.props.galleryPickerVisibility && (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => {
                  this.props.onPressSilhoutteMode();
                }}
              >
                <Image
                  style={[
                    portraitStyles.pickFromGallery,
                    { height: 35, width: 35, resizeMode: "contain" },
                  ]}
                  source={
                    this.props.silhoutteSelected
                      ? Images.shadow_icon_selected
                      : Images.shadow_icon
                  }
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <CameraCaptureAnimator
              ref={this.cameraCaptureAnimator}
              flash={this.props.flash}
              type={this.props.type}
              isVisible={!this.props.isVisible}
              orientation={this.props.orientationCheck}
              disableButton={this.props.disableButton}
              capturePressed={() => {
                this.props.capturePressed();
              }}
              captureReleased={() => {
                this.props.captureReleased();
              }}
              capturePhoto={() => {
                this.props.capturePhoto();
              }}
            />
          </View>
          {!this.props.isRecording ? (
            this.renderPortraitOptions()
          ) : (
            <View style={{ flex: 1, flexDirection: "row" }} />
          )}
        </View>
      </View>
    );
  }

  renderLandscapeOptions() {
    if (this.props.galleryPickerVisibility) {
      return (
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onGalleryPickerPressed();
              }}
            >
              <Image
                style={portraitStyles.pickFromGallery}
                source={Images.pick_gallery}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          ></View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onDeleteLastVideoPressed();
              }}
            >
              <Image
                style={portraitStyles.deleteLastIcon}
                source={Images.delete_last}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {!this.props.isRecording ? (
              <TouchableOpacity
                onPress={() => {
                  this.props.onVideoFinishPressed();
                }}
              >
                <Image
                  style={portraitStyles.nextVideoIcon}
                  source={Images.next_video_icon}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={{ flex: 1, alignItems: "center" }} />
        </View>
      );
    }
  }

  renderIOSLandscapeContainer() {
    return (
      <View
        style={{
          flex: 1,
          width: 90,
          marginTop: 10,
          position: "absolute",
          alignItems: "center",
          alignSelf: "flex-end",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#000",
          marginRight: 75,
        }}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {!this.props.isRecording && !this.props.galleryPickerVisibility && (
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => {
                this.props.onPressSilhoutteMode();
              }}
            >
              <Image
                style={[
                  portraitStyles.pickFromGallery,
                  { height: 35, width: 35, resizeMode: "contain" },
                ]}
                source={
                  this.props.silhoutteSelected
                    ? Images.shadow_icon_selected
                    : Images.shadow_icon
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* {this.props.hideCamera && ( */}
          <CameraCaptureAnimator
            ref={this.cameraCaptureAnimator}
            flash={this.props.flash}
            type={this.props.type}
            isVisible={!this.props.isVisible}
            orientation={this.props.orientationCheck}
            disableButton={this.props.disableButton}
            capturePressed={() => {
              this.props.capturePressed();
            }}
            captureReleased={() => {
              this.props.captureReleased();
            }}
            capturePhoto={() => {
              this.props.capturePhoto();
            }}
          />
          {/* )} */}
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {!this.props.isRecording ? (
            this.renderLandscapeOptions()
          ) : (
            <View style={{ flex: 1, flexDirection: "row" }} />
          )}          
        </View>
      </View>
    );
  }

  render() {
    if (this.props.orientation == "portrait") {
      return this.renderIOSPortraitContainer();
    } else {
      return this.renderIOSLandscapeContainer();
    }
  }
}

const landscapeStyles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    paddingLeft: utils.isIos ? 0 : 15,
    paddingRight: utils.isIos ? 0 : 15,
    position: "absolute",
    // zIndex:1,
    // right:0,
    // top:0,
    flex: 1,
    marginTop: utils.isIos ? 0 : 10,
  },
  captureLayoutLandscape: {
    flex: 1,
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  pickFromGallery: {
    height: 24,
    width: 24,
  },
  nextVideoIcon: {
    height: 28,
    width: 28,
  },
  deleteLastIcon: {
    height: 32,
    width: 32,
  },
});

const portraitStyles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    bottom: 0,
    position: "absolute",
    paddingTop: 10,
    zIndex: 1,
  },
  captureLayoutPortrait: {
    marginTop: 10,
    flex: 1,
    width: "100%",
    minHeight: 80,
  },
  pickFromGallery: {
    height: 24,
    width: 24,
  },
  nextVideoIcon: {
    height: 32,
    width: 32,
    resizeMode:"contain",
    marginLeft:5
  },
  deleteLastIcon: {
    height: 32,
    width: 32,
  },
});
