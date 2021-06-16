import React, { Component } from 'react';

import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ToastAndroid,
  ScrollView,
  Animated,
  DeviceEventEmitter,
} from 'react-native';

//redux
import { onPictureTaken } from '../../actions/cameraPreviewAction';
import { connect } from 'react-redux';
import { Colors, Images } from '../../res';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import { getImageDetails, getVideoDetails, AudioTrimmer, ScrollingImageView, PhotoEditor } from '../../libs/litpic_sdk';
import TextOverlayComponent from '../../views/videoeditor/textoverlay/TextOverLayComponent';
import StickerPicker from '../../components/StickerPicker/StickerPicker.android';
import { Loader } from '../../components/ViewComponents/Loader';
import TagUserPicker from '../../components/TagUsersList/TagUserPicker';
import MusicPicker from '../Music/MusicPicker';

class PhotoPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoPath: props.navigation.getParam('imagePath', null),
      imageDetails: props.navigation.getParam('imageDetails', null),
      imageHeight: Dimensions.get('window').height,
      imageWidth: Dimensions.get('window').width,
      finalPreview: props.navigation.getParam('finalPreview', false),
      cropPosition: props.navigation.getParam('cropPosition', null),
      editMode: 'none',
      scrollableImageVisible: false,
      toggleSickerPreview: false,
      isImageProcessing: false,
      tagArray: [],
      tagArrayList: [],
      showTagUserPicker: false,
      currentSelectedTrack: null,
      showMusicPicker: false,
      currentTrack: null,
      songSelection: {},
      showTagPicker: false,
      enableFullScreenEdit: false,
      itemDrag: {
        locx: 0,
        locy: 0,
      },
      showMenuIcons: true,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  onClosePressed() {
    if (!this.state.showMenuIcons) {
      this.showTagTransView(false);
      this.setState({ showMenuIcons: true });
    } else if (this.state.editMode === 'preview') {
      this.setState({
        editMode: 'none',
        scrollableImageVisible: !this.state.scrollableImageVisible,
      });
    } else if (this.state.editMode === 'cropping') {
      this.setState({ editMode: 'none' });
      this.PhotoPreview.toggleShowCroppingView();
    } else if (this.state.editMode !== 'none') {
      this.setState({ editMode: 'none' });
    } else if (this.state.showTagUserPicker) {
      this.setState({ showTagUserPicker: false });
    } else if (this.state.toggleSickerPreview) {
      this.setState({ toggleSickerPreview: false });
    } else if (this.state.currentTrack != null) {
      this.audioTrimmer.onBackPressed();
      this.setState({ currentTrack: null });
    } else {
      if (this.PhotoPreview) {
        this.PhotoPreview.onClosePressed();
      }
      this.props.navigation.navigate('CameraPreview');
    }
    if (this.PhotoPreview) {
      this.PhotoPreview.onClosePressed();
    }
  }

  componentDidMount() {
    this.state.tagArray = new Array();
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    if (!this.state.isImageProcessing) {
      this.onClosePressed();
    }
    return true;
  }

  getImageDetails(imagePath, tagData) {
    getImageDetails(imagePath, (imageData) => {
      var imageDetails = {
        imageData: imageData,
        tagData: tagData ? tagData : [],
        audioData:
          Object.keys(this.state.songSelection).length === 0
            ? {}
            : this.state.songSelection,
      };
      this.setState({ isImageProcessing: false });
      DeviceEventEmitter.emit('onPictureTaken', imageDetails);
    });
  }

  getVideoDetails(videoPath, tagData) {
    getVideoDetails(videoPath, (videoData) => {
      var videoDetails = {
        videoData: videoData,
        tagData: tagData ? tagData : [],
        audioData:
          Object.keys(this.state.songSelection).length === 0
            ? {}
            : this.state.songSelection,
      };
      this.setState({ isImageProcessing: false });
      DeviceEventEmitter.emit('onVideoTaken', videoDetails);
    });
  }

  isLandscapeImage() {
    return this.state.imageDetails.width > this.state.imageDetails.height;
  }

  onNext(imageDetails) {
    if (
      !this.state.finalPreview &&
      this.state.cropPosition != null &&
      !imageDetails.isExportVideo
    ) {
      this.props.navigation.navigate('ScrollableImage', {
        photoPath: imageDetails.imagePath,
        imageDetails: this.state.imageDetails,
        imageHeight: this.state.imageHeight,
        imageWidth: this.state.imageWidth,
        cropPosition: this.state.cropPosition,
      });
    } else {
      if (imageDetails.isExportVideo) {
        this.getVideoDetails(imageDetails.imagePath, imageDetails.tagUsers);
      } else {
        this.getImageDetails(imageDetails.imagePath, imageDetails.tagUsers);
      }
    }
  }

  onMoveVideoToEdit(videoDetails) {
    this.setState({ isImageProcessing: false });
    this.props.navigation.navigate('VideoEditor', {
      videoPath: videoDetails.videoPath,
      videoDetails: {},
      canMoveNext: false,
      finalPlayer: true,
    });
  }

  onStickerSelected(sticker) {
    this.setState({ toggleSickerPreview: false });
    this.PhotoPreview.addStickerOverlay(sticker.image_url);
  }

  saveImageInLocal() {
    this.setState({ isImageProcessing: true });
    this.saveImage(this.state.currentSelectedTrack);
  }

  exportImage() {
    this.setState({ isImageProcessing: true });
    this.PhotoPreview.exportImage();
  }

  onImageSaved(imgPath) {
    this.setState({ isImageProcessing: false });
    ToastAndroid.show('Image saved in storage: ' + imgPath, ToastAndroid.SHORT);
  }

  addTextOverLay() {
    this.setState({ editMode: 'Text' });
    this.PhotoPreview.addTextOverLay();
  }

  toggleStickerOverlay() {
    this.setState({ toggleSickerPreview: !this.state.toggleSickerPreview });
  }

  addGifOverlay(gifPath) {
    this.setState({ toggleSickerPreview: false });
    this.PhotoPreview.addGifOverlay(gifPath);
  }
  saveImage(selectedTrack) {
    this.PhotoPreview.saveImage(selectedTrack);
  }

  isInEditMode() {
    return this.state.editMode === 'Text';
  }

  toggleShowCropping() {
    this.setState({ editMode: 'cropping' });
    this.PhotoPreview.toggleShowCroppingView();
  }
  onCancelSyncPress() {
    this.setState({ currentSelectedTrack: null, currentTrack: null });
    this.PhotoPreview.setAudioPath('');
  }
  toggleShowPreviewMode() {
    this.setState({
      scrollableImageVisible: !this.state.scrollableImageVisible,
      editMode: 'preview',
    });
  }

  onDonePressed() {
    if (this.state.editMode === 'text') {
      this.setState({ editMode: 'none' });
    } else if (this.state.editMode === 'cropping') {
      this.toggleShowCropping();
    }

    this.setState({ editMode: 'none' });
  }

  tagUserPosClicked(tagUserPos) {
    this.setState({ showTagPicker: true, showMenuIcons: true });
  }

  onUserSelected = (user) => {
    this.setState({
      // isTagged: true,
      showTagPicker: false,
    });
    var tagDict = {
      imageUrl: user.profile_pic,
      userData: user,
      width: 50,
      height: 50,
      xcoordinate: this.state.itemDrag.locx,
      ycoordinate: this.state.itemDrag.locy,
      totalTranslateX: 0,
      orientation:
        this.state.orientationLock === false ? 'portrait' : 'landscape',
      totalTranslateY: 0,
      translateX: 0,
      translateY: 0,
      isDeleted: false,
      opacity: new Animated.Value(1),
      shakeAnimation: new Animated.Value(0),
    };
    this.PhotoPreview.tagDraggable(tagDict);
  };

  showOrHideLoader(showLoader) {
    this.setState({ isImageProcessing: showLoader });
  }

  renderPreviewAction() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => this.toggleShowCropping()}>
          <Image style={styles.imageIcon} source={Images.landscape_cropping} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.toggleShowPreviewMode()}>
          <Image
            style={styles.imageIcon}
            source={Images.scroll_image_preview}
          />
        </TouchableOpacity>
      </View>
    );
  }

  onMusicPickerOnClosePressed() {
    this.toggleMusicPlayerVisibility();
  }

  toggleMusicPlayerVisibility() {
    this.setState({ showMusicPicker: !this.state.showMusicPicker });
  }

  onSongSelected(track) {
    this.setState({
      currentSelectedTrack: track,
      currentTrack: track,
      songSelection: track,
    });
    this.toggleMusicPlayerVisibility();
  }

  onAudioTrimmingCompleted(audioPath) {
    if (this.PhotoPreview != null) {
      this.PhotoPreview.setAudioPath(audioPath);
    }
    this.setState({
      currentSelectedTrack: audioPath,
    });
  }

  showTagTransView(showTransView) {
    this.setState({ showMenuIcons: false });
    if (this.PhotoPreview != null) {
      this.PhotoPreview.showTagTransView(showTransView);
    }
  }

  emitCameraPreviewUnmountEvent() {
    DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
  }

  render() {
    const isLandscape =
      parseInt(this.state.imageDetails.imageWidth) >
      parseInt(this.state.imageDetails.imageHeight);
    return (
      <View style={styles.container}>
        {!this.state.scrollableImageVisible && (
          <PhotoEditor
            ref={(ref) => (this.PhotoPreview = ref)}
            style={styles.imagePreview}
            imageDetails={this.state.imageDetails}
            imagePath={this.state.photoPath}
            onCropping={(cropValues) =>
              this.setState({ cropPosition: cropValues.xPosition })
            }
            onImageSaved={(imgPath) => {
              this.onImageSaved(imgPath);
            }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
            onNext={(imageDetails) => this.onNext(imageDetails)}
            onMoveVideoToEdit={(videoDetails) =>
              this.onMoveVideoToEdit(videoDetails)
            }
            tagUserPosClicked={(tagUserPos) => this.tagUserPosClicked(tagUserPos)}
            closeEditMode ={() => this.setState({ editMode: 'none' })}
          />
        )}

        {this.state.scrollableImageVisible && (
          <ScrollingImageView
            style={styles.imagePreview}
            imagePath={this.state.photoPath}
            cropPosition={this.state.cropPosition}
            imageDetails={this.state.imageDetails}
          />
        )}

        {/* TEXT OVERLAY COMPONENT */}
        {this.state.editMode === 'Text' && (
          <TextOverlayComponent
            onFontSelected={(font) => this.PhotoPreview.onFontSelected(font)}
            onColorChange={(color) =>
              this.PhotoPreview.onTextColorChange(color)
            }
            changeTextBackground={(background) =>
              this.PhotoPreview.onChangeTextBackground(background)
            }
            changeTextAlignment={(alignment) =>
              this.PhotoPreview.onChangeTextAlignment(alignment)
            }
          />
        )}

        {this.state.editMode === 'none' &&
          !this.state.showTagUserPicker &&
          !this.state.toggleSickerPreview && (
            <View style={styles.actionContainerBottom}>
              <BouncyView onPress={() => this.saveImageInLocal()}>
                <Image
                  style={styles.imageIcon}
                  source={Images.savearrow_icon}
                />
              </BouncyView>

              {this.state.showMenuIcons && !this.state.enableFullScreenEdit && (
                <View style={styles.scrollItem}>
                  <ScrollView horizontal>
                    <BouncyView onPress={() => this.addTextOverLay()}>
                      <Image style={styles.imageIcon} source={Images.text_icon} />
                    </BouncyView>
                    <BouncyView onPress={() => this.toggleStickerOverlay()}>
                      <Image
                        style={styles.imageIcon}
                        source={Images.sticker_icon}
                      />
                    </BouncyView>
                    <BouncyView
                      onPress={() => {
                        this.showTagTransView(true);
                      }}>
                      <Image style={styles.imageIcon} source={Images.tag_icon} />
                    </BouncyView>
                    <BouncyView
                      onPress={() => {
                        this.toggleMusicPlayerVisibility();
                      }}>
                      <Image
                        style={styles.imageIcon}
                        source={Images.music_icon}
                      />
                    </BouncyView>
                    {isLandscape && this.renderPreviewAction()}
                  </ScrollView>
                </View>)}
                <View style={{flexDirection:"row"}}>
              <BouncyView
                onPress={() => {
                  this.setState({ enableFullScreenEdit: !this.state.enableFullScreenEdit });
                }}>
                <Image
                  style={styles.imageIcon}
                  source={this.state.enableFullScreenEdit ? Images.leftArrow : Images.rightArrow}
                />
              </BouncyView>
              <BouncyView
                onPress={() => {
                  this.exportImage();
                }}>
                <Image
                  style={styles.imageIcon}
                  source={Images.next_video_icon}
                />
              </BouncyView>
              </View>
            </View>
          )}
        <View style={styles.headerContainer}>
          {!this.state.showTagUserPicker && !this.state.toggleSickerPreview && (
            <TouchableOpacity
              style={styles.closeBtnContainer}
              onPress={() => this.onClosePressed()}>
              <Image style={styles.close_icon} source={Images.close_icon} />
            </TouchableOpacity>
          )}

          {this.state.editMode === 'text' ||
            (this.state.editMode === 'cropping' && (
              <TouchableOpacity
                style={styles.closeBtnContainer}
                onPress={() => this.onDonePressed()}>
                <Image style={styles.close_icon} source={Images.done_icon} />
              </TouchableOpacity>
            ))}
        </View>
        <Loader visibility={this.state.isImageProcessing} />

        <TagUserPicker
          visible={this.state.showTagPicker}
          onClosePressed={() => {
            this.setState({
              showTagPicker: false,
            });
            if (this.state.tagArray.length == 0) {
              this.setState({
                isTagged: false,
              });
            }
          }}
          onUserSelected={(user) => {
            this.onUserSelected(user);
          }}
        />

        <StickerPicker
          visibility={this.state.toggleSickerPreview}
          orientationValue={this.props.orientationCheck}
          onClosePressed={(sticker) => {
            this.setState({
              toggleSickerPreview: false,
            });
          }}
          onModalWillHide={(sticker) => {
            console.log('SELECTED STICKR IS>>>>>', sticker);
          }}
          onStickerSelected={(sticker) => this.onStickerSelected(sticker)}
          onGifSelected={(gif) => this.addGifOverlay(gif)}
        />

        <MusicPicker
          visible={this.state.showMusicPicker}
          onClosePressed={() => this.onMusicPickerOnClosePressed()}
          onSongSelected={(track) => this.onSongSelected(track)}
          playMusic={(track) => { }}
          pauseMusic={() => { }}
          isCancelSyncShow={this.state.currentSelectedTrack != null}
          cancelSync={() => {
            this.onCancelSyncPress();
          }}
        />

        {this.state.currentTrack != null && (
          <AudioTrimmer
            ref={(ref) => {
              this.audioTrimmer = ref;
            }}
            title={this.state.currentSelectedTrack.title}
            avatar={this.state.currentSelectedTrack.artwork_url}
            trackUrl={this.state.currentSelectedTrack.stream_url}
            author={this.state.currentSelectedTrack.user.username}
            style={styles.audioTimer}
            onStartPressed={(aud) => {
              console.log('STARTED');
              this.setState({ currentTrack: null });
              this.emitCameraPreviewUnmountEvent();
            }}
            onExitPressed={(aud) => {
              console.log('EXITPRESSED');
              this.setState({ currentTrack: null });
              this.emitCameraPreviewUnmountEvent();
            }}
            onTrimmingCompleted={(aud) => {
              console.log('COMPLETED', aud);
              this.onAudioTrimmingCompleted(aud.audioPath);
              this.emitCameraPreviewUnmountEvent();
            }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  imagePreview: {
    flex: 1,
    resizeMode: 'contain',
  },
  closeTickContainer: {
    right: 0,
    padding: 4,
    margin: 10,
  },
  closeBtnContainer: {
    padding: 4,
    margin: 10,
  },
  close_icon: {
    height: 25,
    width: 25,
  },
  video_next: {
    alignSelf: 'flex-end',
    height: 24,
    width: 24,
    margin: 10,
  },
  fixed_tag: {
    backgroundColor: 'transparent',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },
  audioTimer: {
    flex: 1,
    width: '100%',
    height: 280,
  },
  actionContainerLeft: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  actionContainerBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tapView: {
    height: 40,
    width: '80%',
    backgroundColor: '#00000080',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  scrollItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagUsePicker: {
    flex: 1,
    height: '100%',
    position: 'absolute',
    top: 10,
    left: -6,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  tapAnywhere: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  bottom_view: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingRight: 10,
    bottom: 10,
  },
  empty_view: {
    flex: 1,
  },
  centerText: {
    color: '#FFFFFF80',
    fontSize: 18,
    textAlign: 'center',
  },
  imageIcon: { height: 32, width: 32, margin: 10 },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default connect(null, {
  onPictureTaken,
})(PhotoPreview);
