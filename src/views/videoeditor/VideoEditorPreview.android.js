/**
 * Video Editor screen
 * created by vigneshwaran.n@optisolbusiness.com
 * last edited: 15/06/2020
 */

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
  Animated,
  DeviceEventEmitter,
  ScrollView,
} from 'react-native';
import { Images, Colors } from '../../res';
import {VideoEditor, getVideoDetails, ScrollingVideoPlayer, AudioTrimmer } from '../../libs/litpic_sdk';
import { connect } from 'react-redux';
import {
  onVideoTaken,
  orientation,
  backPressVideo,
} from '../../actions/cameraPreviewAction';
import{
  overlayDataArray
} from '../../actions/OverlayListAction';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import { Loader } from '../../components/ViewComponents/Loader';
import TextOverlayComponent from './textoverlay/TextOverLayComponent';
import StickerPicker from '../../components/StickerPicker/StickerPicker.android';

import TagUserPicker from '../../components/TagUsersList/TagUserPicker';
import MusicPicker from '../Music/MusicPicker';

class VideoEditorPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: props.navigation.getParam('filter', {}),
      videoPath: props.navigation.getParam('videoPath', null),
      isCanMoveNext: props.navigation.getParam('canMoveNext', true),
      finalPlayer: props.navigation.getParam('finalPlayer', false),
      videoDetails: {},
      showCropperView: false,
      bottomMargin: 0,
      editMode: 'none',
      scrollablePlayerVisible: false,
      cropPosition: 0,
      isLandscape: false,
      toggleSickerPreview: false,
      isVideoProcessing: false,
      tagArray: [],
      currentSelectedTrack: null,
      showMusicPicker: false,
      currentTrack: null,
      songSelection: {},
      next: true,
      showTagPicker: false,
      enableFullScreenEdit: false,
      itemDrag: {
        locx: 0,
        locy: 0,
      },
      isfixTags: false,
      updatedVideoPath: null,
      showMenuIcons: true,
    };
  }
  componentWillUpdate() {
    //get video details and update value in one time
    if (Object.keys(this.state.videoDetails).length === 0) {
      getVideoDetails(this.state.videoPath, (videoDetails) => {
        this.setState({
          videoDetails: videoDetails,
        });
        // }
      });
    }
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', () =>
      this.handleBackButtonClick(),
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () =>
      this.handleBackButtonClick(),
    );
  }

  handleBackButtonClick() {
    if (!this.state.isVideoProcessing) {
      this.onClosePressed();
    }
    return true;
  }

  restoreOverlayData(){
    if(this.props.overlayDataList && Object.keys(this.props.overlayDataList.length !== 0)){
      this.videoEditor.setPreviousOverlayData(this.props.overlayDataList);
    }
  }

  //on pressing next
  onNext(videoPath) {
    this.getVideoDetails(videoPath);
    this.props.backPressVideo({});
    this.props.overlayDataArray([]);
  }

  getOverlayDataArray(){
    this.videoEditor.getOverlayDataArray((array) =>{
      if(array){
        this.props.overlayDataArray(array);
      }
      this.showVideoSpeedEditor();
    });
  }

  //toggle cropper view for cropping landscape video
  getVideoDetails(videoPath) {
    getVideoDetails(videoPath.videoPath, (videoData) => {
      var videoDetails = {
        videoData: videoData,
        tagData: videoPath.tagUsers ? videoPath.tagUsers : [],
        audioData:
          Object.keys(this.state.songSelection).length === 0
            ? {}
            : this.state.songSelection,
      };
      this.setState({ isVideoProcessing: false });
      DeviceEventEmitter.emit('onVideoTaken', videoDetails);
    });
  }

  onClosePressed() {
    if (!this.state.showMenuIcons) {
      this.showTagTransView(false);
      this.setState({ showMenuIcons: true });
    } else if (this.state.editMode === 'preview') {
      this.setState({
        editMode: 'none',
        scrollablePlayerVisible: !this.state.scrollablePlayerVisible,
      });
    } else if (this.state.editMode === 'cropping') {
      this.setState({ editMode: 'none' });
      this.videoEditor.toggleShowCroppingView();
    } else if (this.state.editMode !== 'none') {
      this.setState({ editMode: 'none' });
    } else if (this.state.toggleSickerPreview) {
      this.setState({ toggleSickerPreview: false });
    } else if (this.state.currentTrack != null) {
      this.audioTrimmer.onBackPressed();
      this.setState({ currentTrack: null });
    } else {
      this.props.overlayDataArray([]);
      this.props.navigation.navigate('CameraPreview');
    }
  }

  onDonePressed() {
    if (this.state.editMode === 'text') {
      this.setState({ editMode: 'none' });
    } else if (this.state.editMode === 'cropping') {
      this.toggleShowCropping();
    }

    this.setState({ editMode: 'none' });
  }

  //show video speed editor
  showVideoSpeedEditor() {
    this.setState({ next: false });
    this.props.navigation.navigate('VideoSpeedEditor', {
      videoPath: this.state.updatedVideoPath ? this.state.updatedVideoPath : this.state.videoPath,
      videoDetails: this.state.videoDetails,
    });
  }

  onVideoSavedLocally(videoPath) {
    this.setState({ isVideoProcessing: false });
    ToastAndroid.show(
      'Video saved in storage: ' + videoPath,
      ToastAndroid.SHORT,
    );
  }

  addTextOverLay() {
    this.setState({ editMode: 'text' });
    this.videoEditor.addTextOverLay();
  }

  onStickerSelected(sticker) {
    this.setState({ toggleSickerPreview: false });
    this.videoEditor.addStickerOverlay(sticker.image_url);
  }

  toggleStickerOverLay() {
    this.setState({ toggleSickerPreview: !this.state.toggleSickerPreview });
  }

  addGifOverlay(gifPath) {
    this.setState({ toggleSickerPreview: false });
    this.videoEditor.addGifOverlay(gifPath);
  }
  saveVideo() {
    this.setState({ isVideoProcessing: true });
    this.videoEditor.saveVideo();
  }

  exportVideo() {
    this.setState({ isVideoProcessing: true });
    this.videoEditor.exportVideo();
  }

  toggleShowCropping() {
    this.setState({ editMode: 'cropping' });
    this.videoEditor.toggleShowCroppingView();
  }

  toggleShowPreviewMode() {
    this.setState({
      scrollablePlayerVisible: !this.state.scrollablePlayerVisible,
      editMode: 'preview',
    });
  }

  onMusicPickerOnClosePressed() {
    this.toggleMusicPlayerVisibility();
  }

  toggleMusicPlayerVisibility() {
    this.setState({ showMusicPicker: !this.state.showMusicPicker });
  }

  showTagTransView(showTransView) {
    this.setState({ showMenuIcons: false });
    if (this.videoEditor != null) {
      this.videoEditor.showTagTransView(showTransView);
    }
  }

  tagUserPosClicked(tagUserPos) {
    this.setState({ showTagPicker: true, showMenuIcons: true });
  }

  playVideo(){
    if (this.videoEditor != null) {
      this.videoEditor.playVideo();
    }
  }

  pauseVideo(){
    if (this.videoEditor != null) {
      this.videoEditor.pauseVideo();
    }
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
    this.videoEditor.tagDraggable(tagDict);
  };

  onSongSelected(track) {
    this.setState({
      currentTrack: track,
      currentSelectedTrack: track,
      songSelection: track,
    });
    this.toggleMusicPlayerVisibility();
  }

  onAudioTrimmingCompleted(audioPath) {
    this.setState({ isVideoProcessing: false });
    if (this.videoEditor != null && audioPath != null) {
      this.videoEditor.setAudioPath(audioPath);
      this.setState({
        currentSelectedTrack: audioPath,
      });
    }
  }

  showOrHideLoader(showLoader) {
    this.setState({ isVideoProcessing: showLoader });
  }

  setUpdatedVideoPath(updatedVideoPath) {
    this.setState({ updatedVideoPath: updatedVideoPath });
  }

  onCancelSyncPress() {
    this.setState({ currentSelectedTrack: null, currentTrack: null });
    this.videoEditor.setAudioPath('');
    if (this.state.updatedVideoPath != null) {
      this.setState({ updatedVideoPath: null });
      this.videoEditor.setVideoPath(this.state.videoPath);
    }
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

  emitCameraPreviewUnmountEvent() {
    DeviceEventEmitter.emit('onCameraPreviewUnMount', {});
  }

  render() {
    const isLandscape =
      parseInt(this.state.videoDetails && this.state.videoDetails.width) >
      parseInt(this.state.videoDetails && this.state.videoDetails.height);

    return (
      <View style={[styles.container]}>
        {/* VIDEO EDITOR COMPONENT */}
        {!this.state.scrollablePlayerVisible && this.state.next && (
          <VideoEditor
            ref={(ref) => {
              this.videoEditor = ref;
            }}
            style={styles.playerStyle}
            videoPath={this.state.videoPath}
            onCropping={(cropValues) =>
              this.setState({ cropPosition: cropValues.xPosition })
            }
            videoDetails={(details) =>
              this.setState({ isLandscape: details.isLandscape })
            }
            onVideoSaved={(videoPath) => this.onVideoSavedLocally(videoPath)}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
            updateVideoPath={(updatedVideoPath) =>
              this.setUpdatedVideoPath(updatedVideoPath)
            }
            onNext={(videoPath) => this.onNext(videoPath)}
            tagUserPosClicked={(tagUserPos) => this.tagUserPosClicked(tagUserPos)}
            closeEditMode ={() => this.setState({ editMode: 'none' })}
            restoreOverlay = {() => this.restoreOverlayData()}
          />
        )}

        {this.state.scrollablePlayerVisible && (
          <ScrollingVideoPlayer
            style={styles.playerStyle}
            videoPath={this.state.videoPath}
            videoDetails={this.state.videoDetails}
            cropPosition={this.state.cropPosition}
          />
        )}

        {/* TEXT OVERLAY COMPONENT */}
        {this.state.editMode === 'text' && (
          <TextOverlayComponent
            onFontSelected={(font) => this.videoEditor.onFontSelected(font)}
            onColorChange={(color) => this.videoEditor.onTextColorChange(color)}
            changeTextBackground={(background) =>
              this.videoEditor.onChangeTextBackground(background)
            }
            changeTextAlignment={(alignment) =>
              this.videoEditor.onChangeTextAlignment(alignment)
            }
          />
        )}

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

        {this.state.editMode === 'none' && !this.state.toggleSickerPreview && (
          <View style={styles.actionContainerSave}>
            <View>
              <TouchableOpacity onPress={() => this.saveVideo()}>
                <Image
                  style={styles.imageIcon}
                  source={Images.savearrow_icon}
                />
              </TouchableOpacity>
            </View>
            {!this.state.enableFullScreenEdit && (
              <View style={styles.menus}>
                <ScrollView horizontal>
                  <TouchableOpacity onPress={() => this.addTextOverLay()}>
                    <Image style={styles.imageIcon} source={Images.text_icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.toggleStickerOverLay()}>
                    <Image
                      style={styles.imageIcon}
                      source={Images.sticker_icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.showTagTransView(true);
                    }}>
                    <Image style={styles.imageIcon} source={Images.tag_icon} />
                  </TouchableOpacity>
                  <BouncyView onPress={() => this.getOverlayDataArray()}>
                    <Image
                      style={styles.imageIcon}
                      source={Images.slowmotion_icon}
                    />
                  </BouncyView>
                  <TouchableOpacity
                    onPress={() => {
                      this.pauseVideo();
                      this.toggleMusicPlayerVisibility();
                    }}>
                    <Image
                      style={styles.imageIcon}
                      source={Images.music_icon}
                    />
                  </TouchableOpacity>
                  {isLandscape && this.renderPreviewAction()}
                </ScrollView>
              </View>)}
            <View style={{flexDirection:"row"}} >
              <TouchableOpacity 
              onPress={() => {
                this.setState({ enableFullScreenEdit: !this.state.enableFullScreenEdit });
              }}>
                <Image
                  style={styles.imageIcon}
                  source={this.state.enableFullScreenEdit ? Images.leftArrow : Images.rightArrow}
                />
              </TouchableOpacity>
           
              <TouchableOpacity onPress={() => this.exportVideo()}>
                <Image
                  style={styles.imageIcon}
                  source={Images.next_video_icon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!this.state.toggleSickerPreview && (
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.closeBtnContainer}
              onPress={() => this.onClosePressed()}>
              <Image style={styles.video_next} source={Images.close_icon} />
            </TouchableOpacity>

            {this.state.editMode === 'text' ||
              (this.state.editMode === 'cropping' && (
                <TouchableOpacity
                  style={styles.closeBtnContainer}
                  onPress={() => this.onDonePressed()}>
                  <Image style={styles.video_next} source={Images.done_icon} />
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* TAG USER PICKER */}
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

        <MusicPicker
          visible={this.state.showMusicPicker}
          onClosePressed={() => {
            this.playVideo();
            this.onMusicPickerOnClosePressed()
          }}
          onSongSelected={(track) => this.onSongSelected(track)}
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
            style={styles.audio_trimer}
            onStartPressed={(aud) => {
              //this.playVideo();
              this.setState({ currentTrack: null });
              this.emitCameraPreviewUnmountEvent();
            }}
            onExitPressed={(aud) => {
              this.playVideo();
              this.setState({ currentTrack: null });
              this.emitCameraPreviewUnmountEvent();
            }}
            onTrimmingCompleted={(aud) => {
              this.onAudioTrimmingCompleted(aud.audioPath);
              this.emitCameraPreviewUnmountEvent();
            }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
          />
        )}

        <Loader visibility={this.state.isVideoProcessing} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    height: '90%',
    backgroundColor: Colors.black,
  },
  playerStyle: {
    flex: 1,
    // marginLeft: 8,
    // marginRight: 8,
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerContainer: {},
  closeBtnContainer: {
    padding: 4,
    margin: 10,
  },
  tapAnywhere: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  nextBtnContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  video_next: {
    height: 24,
    width: 24,
  },
  actionContainerBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 60,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  close_icon: {
    height: 25,
    width: 25,
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
  menus: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    color: '#FFFFFF80',
    fontSize: 18,
    textAlign: 'center',
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
  fast_image_view: {
    backgroundColor: 'transparent',
    width: 50 + 30,
    height: 50 + 30,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },
  audio_trimer: {
    flex: 1,
    width: '100%',
    height: 280,
  },
  fast_image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  actionContainerSave: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageIcon: { height: 32, width: 32, margin: 10 },
});

const mapStateToProps = (state) => {
  const { orientationCheck } = state.CameraPreviewReducer;
  const { overlayDataList } = state.OverlayDataReducer;
  return {
    orientationCheck,
    overlayDataList,
  };
};
export default connect(mapStateToProps, {
  orientation,
  onVideoTaken,
  backPressVideo,
  overlayDataArray,
})(VideoEditorPreview);
