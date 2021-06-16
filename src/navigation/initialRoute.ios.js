import {
    createSwitchNavigator,
    createAppContainer 
  } from "react-navigation";
  
  import CameraPreview from "../views/CameraPreview/CameraPreview";
  import VideoEditor from "../views/videoeditor/VideoEditor";
  import VideoPlayerView from "../views/videoplayer/VideoPlayerView";
  // import VideoPlayerEditor from "../views/videoplayer/VideoPlayerEditor";
  import VideoTrimmer from "../views/videotrimmer/VideoTrimer";

  import PhotoPreview from "../views/PhotoPreview/PhotoPreview";
  import PhotoEditorView from "../views/PhotoEditor/PhotoEditorView";
  import VideoTiltPlayerView from "../views/ScrollPlayer/ScrollPlayerView"
  // import PhotoEditorView from "../views/PhotoEditor/PhotoEditorView";
  import SpeedView from '../views/SpeedView/SpeedView'
   const RootStack = createSwitchNavigator(
    {
      CameraPreview: { 
        screen: CameraPreview 
      },
      VideoEditor: { screen: VideoEditor },
      VideoPlayer: { screen: VideoPlayerView },
      // VideoPlayerEditor: {screen: VideoPlayerEditor},
      VideoTrimmer: { screen: VideoTrimmer },
      PhotoPreview: { screen: PhotoPreview },
      PhotoEditor: { screen: PhotoEditorView },
      VideoTiltPlayerView: { screen: VideoTiltPlayerView },
      SpeedView: { screen: SpeedView }
      // PhotoEditorView: { screen: PhotoEditorView }
    },
    {
      animationEnabled: false,
      swipeEnabled: false,
      headerMode: "none",
      defaultNavigationOptions: {
      gesturesEnabled: false
      },
      resetOnBlur:false,
      backBehavior:"history",
      initialRouteName: "CameraPreview"
    }
  );

  export default createAppContainer(RootStack)

