import {createSwitchNavigator, createAppContainer} from 'react-navigation';

import CameraPreview from '../views/CameraPreview/CameraPreview';
import VideoEditorPreview from '../views/videoeditor/VideoEditorPreview.android';
import VideoPlayerView from '../views/videoplayer/VideoPlayerView';
import VideoTrimmer from '../views/videotrimmer/VideoTrimer';
import PhotoPreview from '../views/PhotoPreview/PhotoPreview';
import PhotoEditorView from '../views/PhotoEditor/PhotoEditorView';
import ScrollablePlayer from '../views/ScrollablePlayerView/ScrollablePlayer';
import VideoSpeedEditor from '../views/VideoSpeedEditor/VideoSpeedEditor';
import ScrollableImage from '../views/scrollableImage/ScrollableImage';
import MusicTrimming from '../views/MusicTrimming/MusicTrimming.android';

const RootStack = createSwitchNavigator(
  {
    CameraPreview: {screen: CameraPreview},
    VideoEditor: {screen: VideoEditorPreview},
    VideoPlayer: {screen: VideoPlayerView},
    VideoTrimmer: {screen: VideoTrimmer},
    PhotoPreview: {screen: PhotoPreview},
    ScrollableImage: {screen: ScrollableImage},
    PhotoEditorView: {screen: PhotoEditorView},
    ScrollablePlayer: {screen: ScrollablePlayer},
    VideoSpeedEditor: {screen: VideoSpeedEditor},
    MusicTrimming: {screen: MusicTrimming},
  },
  {backBehavior: 'order', initialRouteName: 'CameraPreview'},
);

export default createAppContainer(RootStack);
