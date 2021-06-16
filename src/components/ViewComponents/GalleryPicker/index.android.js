/**
 * Video Editor screen
 * last edited: 16/10/2020
 */

import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  PermissionsAndroid,
  FlatList,
  Modal,
} from 'react-native';
import VideoPickerAndroid from '../../videopicker/VideoPickerAndroid';
import PhotoPickerAndroid from '../../photopicker/PhotoPickerAndroid';
import {Colors, Images} from '../../../res';
import utils from '../../../utils/utils';

export default class GalleryPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      isStoragePermissionGranted: false,
      videoFiles: [],
      imageFiles: [],
      pickerType: '',
    };
  }

  componentDidMount() {
    if (utils.isAndroid) {
      this.checkForStoragePermission();
    }
  }

  async checkForStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'App Storage Permission',
          message: 'App needs access to your storage ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({isStoragePermissionGranted: true});
      }
    } catch (err) {
      console.warn(err);
    }
  }

  onDonePressed() {
    if (this.state.pickerType === 'video') {
      this.props.onDonePressed(this.state.videoFiles);
    } else if (this.state.imageFiles.length === 1) {
      var node = {
        node: {
          image: {
            uri: this.state.imageFiles.imagePath,
            item: this.state.imageFiles[0],
          },
        },
      };
      this.props.onPictureSelected(node);
    } else {
      this.props.onMultiplePictureSelected(this.state.imageFiles);
    }
  }

  onClosePressed() {
    this.setState({activeTab: 0, videoFiles: [], imageFiles: []});
    this.props.onClosePressed();
  }

  refreshCurrentPage() {
    if (this.state.activeTab === 0) {
      this.videoPicker.refresh();
    } else {
      this.imagePicker.refresh();
    }
  }

  onPressTab(selectedTab) {
    if (selectedTab === 0) {
      this.setState({activeTab: selectedTab, imageFiles: []});
    } else {
      this.setState({activeTab: selectedTab, videoFiles: []});
    }
  }
  _renderItemImage = ({item}) => {
    if (this.state.pickerType === 'video') {
      return (
        <View style={styles.bottomScrollImage}>
          <Image source={{uri: item.videoPath}} style={styles.imageSize} />
        </View>
      );
    } else {
      return (
        <View style={styles.bottomScrollImage}>
          <Image source={{uri: item.imagePath}} style={styles.imageSize} />
        </View>
      );
    }
  };

  render() {
    return (
      <Modal
        onShow={() => {
          this.refreshCurrentPage();
        }}
        animationType="slide"
        transparent={false}
        style={styles.container}
        onRequestClose={() => this.onClosePressed()}
        visible={this.props.visibility}>
        <View style={styles.headerContainer}>
          <View style={styles.headerActionContainer}>
            <TouchableOpacity
              style={styles.headerActionTouchable}
              onPress={() => this.onClosePressed()}>
              <Image source={Images.close_icon} style={styles.closeIcon} />
            </TouchableOpacity>
            {this.state.videoFiles.length >= 1 && (
              <TouchableOpacity
                style={styles.headerActionTouchable}
                onPress={() => this.onDonePressed()}>
                <Image source={Images.done_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            )}
            {this.state.imageFiles.length >= 1 && (
              <TouchableOpacity
                style={styles.headerActionTouchable}
                onPress={() => this.onDonePressed()}>
                <Image source={Images.done_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tabContainer}>
            <View style={styles.leftHeaderContainer}>
              <TouchableOpacity onPress={() => this.onPressTab(0)}>
                <Text style={styles.tabTitle}>Videos</Text>
              </TouchableOpacity>
              {this.state.activeTab === 0 && (
                <View style={styles.activeUnderLiner} />
              )}
            </View>

            <View style={styles.rightHeaderContainer}>
              <TouchableOpacity onPress={() => this.onPressTab(1)}>
                <Text style={styles.tabTitle}>Photos</Text>
              </TouchableOpacity>
              {this.state.activeTab === 1 && (
                <View style={styles.activeUnderLiner} />
              )}
            </View>
          </View>

          <View
            style={[
              this.state.videoFiles.length >= 1 ? {paddingBottom: 80} : 'null',
            ]}>
            {this.state.activeTab === 0 && (
              <VideoPickerAndroid
                ref={(ref) => (this.videoPicker = ref)}
                width={this.props.width}
                rowItems={this.props.rowItems}
                orientation={this.props.orientation}
                onVideosSelected={(videoFiles) =>
                  this.setState({videoFiles, pickerType: 'video'})
                }
              />
            )}

            {this.state.activeTab === 1 && (
              <PhotoPickerAndroid
                ref={(ref) => (this.imagePicker = ref)}
                width={this.props.width}
                rowItems={this.props.rowItems}
                orientation={this.props.orientation}
                onItemSelected={(imageFiles) =>
                  this.setState({imageFiles, pickerType: 'image'})
                }
              />
            )}
          </View>

          <View style={styles.bottomImage}>
            <View style={styles.bottomImageView}>
              <View style={styles.imageView}>
                {this.state.pickerType === 'video' && (
                  <FlatList
                    horizontal
                    data={this.state.videoFiles}
                    renderItem={this._renderItemImage}
                    keyExtractor={(item) => item.id}
                  />
                )}
                {this.state.pickerType === 'image' && (
                  <FlatList
                    horizontal
                    data={this.state.imageFiles}
                    renderItem={this._renderItemImage}
                    keyExtractor={(item) => item.id}
                  />
                )}
              </View>
              <View style={styles.nextButton}>
                {this.state.videoFiles.length >= 1 && (
                  <TouchableOpacity
                    style={styles.headerActionTouchable}
                    onPress={() => this.onDonePressed()}>
                    <Image
                      source={Images.next_video_icon}
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                )}
                {this.state.imageFiles.length >= 1 && (
                  <TouchableOpacity
                    style={styles.headerActionTouchable}
                    onPress={() => this.onDonePressed()}>
                    <Image
                      source={Images.next_video_icon}
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: Colors.black,
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    // zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'column',
    backgroundColor: Colors.black,
  },
  leftHeaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHeaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomImage: {
    bottom: 0,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%',
    height: 100,
    marginBottom: 65,
  },
  bottomImageView: {
    flex: 1,
    flexDirection: 'row',
  },
  imageView: {flex: 1},
  nextButton: {
    width: 60,
    alignItems: 'center',
  },
  bottomScrollImage: {
    width: 70,
    paddingLeft: 10,
    paddingBottom: 40,
    height: '100%',
  },
  imageSize: {
    width: '100%',
    height: '100%',
  },
  closeIcon: {
    height: 24,
    width: 24,
  },
  activeUnderLiner: {
    top: 2,
    height: 6,
    backgroundColor: Colors.primaryAccent,
    width: 100,
  },
  tabContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
  },
  tabTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  headerActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerActionTouchable: {
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
  },
});
