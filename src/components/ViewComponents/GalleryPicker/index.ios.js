import { Colors, Images } from "../../../res";
import {
  Image,
  Modal,
  PermissionsAndroid,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import React, { Component } from "react";

import PhotoPicker from "../../photopicker/PhotoPicker";
import VideoPicker from "../../videopicker/VideoPicker";

export default class GalleryPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      isStoragePermissionGranted: false
    };
  }

  async checkForStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "App Storage Permission",
          message: "App needs access to your storage ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({ isStoragePermissionGranted: true });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    return (
      <Modal animationType="slide" supportedOrientations={['portrait', 'landscape']} transparent={false} onRequestClose={this.props.onClosePressed} visible={this.props.visibility}>
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 1,  maxHeight: 50 }} >
              <TouchableOpacity
                style={styles.closeBtnContainer}
                onPress={() => this.props.onClosePressed()}
              >
                <Image source={Images.close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, maxHeight: 40, marginTop: this.props.orientation == "portrait" ? 0 : -40, width: this.props.orientation == "portrait" ? "100%" : "50%", alignSelf:"center"}} >
              <View style={styles.tabContainer}>
                <View style={styles.leftHeaderContainer}>
                  <TouchableOpacity onPress={() => this.setState({ activeTab: 0 })}>
                    <Text style={styles.tabTitle}>Videos</Text>
                  </TouchableOpacity>
                  {this.state.activeTab == 0 && (
                    <View style={styles.activeUnderLiner} />
                  )}
                </View>

                <View style={styles.rightHeaderContainer}>
                  <TouchableOpacity onPress={() => this.setState({ activeTab: 1 })}>
                    <Text style={styles.tabTitle}>Photos</Text>
                  </TouchableOpacity>
                  {this.state.activeTab == 1 && (
                    <View style={styles.activeUnderLiner} />
                  )}
                </View>
              </View>
            </View>
            <View style={{ flex: 1, marginTop: this.props.orientation == "portrait" ? 12 : 2}} >

              {this.state.activeTab == 0 && (
                <VideoPicker
                  width={this.props.width}
                  rowItems={this.props.rowItems}
                  orientation={this.props.orientation}
                  onItemSelected={item => {
                    this.props.onVideoSelected(item);
                  }}
                />
              )}

              {this.state.activeTab == 1 && (
                <PhotoPicker
                  width={this.props.width}
                  rowItems={this.props.rowItems}
                  orientation={this.props.orientation}
                  onItemSelected={item => { this.props.onPictureSelected(item) }}
                />
              )}


            </View>
          </View>

        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    flex: 1
  },
  headerContainer: {
    backgroundColor: Colors.black,
  },
  leftHeaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  rightHeaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  closeIcon: {
    height: 24,
    width: 24,
    resizeMode:"contain"
  },
  closeBtnContainer: {
    position: 'absolute',
    left: 15,
    top:10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10
  },
  activeUnderLiner: {
    top: 2,
    height: 6,
    backgroundColor: Colors.primaryAccent,
    width: 100
  },
  tabContainer: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row"
  },
  tabTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700"
  }
});
