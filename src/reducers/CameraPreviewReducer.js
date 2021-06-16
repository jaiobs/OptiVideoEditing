import {
  ORIENTATION,
  PICTURE_TAKEN,
  VIDEO_TAKEN,
  RETAIN_VIDEO_SEGMENTS,
  BACK_PRESS_VIDEO,
  FLASH_ACTION,
  SWITCH_CAMERA_ACTION,
} from '../lib/Types';

const INITIAL_STATE = {
  orientationCheck: 'portrait',
  onPictureTaken: {},
  onVideoTaken: {},
  retainVideoSegments: [],
  backPressVideoDetails: {},
  flashDetails: false,
  switchCameraDetails: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ORIENTATION:
      return {
        ...state,
        orientationCheck: action.payload,
      };

    case PICTURE_TAKEN:
      return {
        ...state,
        onPictureTaken: action.payload,
      };

    case VIDEO_TAKEN:
      return {
        ...state,
        onVideoTaken: action.payload,
      };

    case BACK_PRESS_VIDEO:
      return {
        ...state,
        backPressVideoDetails: action.payload,
      };

    case RETAIN_VIDEO_SEGMENTS:
      return {
        ...state,
        retainVideoSegments: action.payload,
      };

    case FLASH_ACTION:
      return {
        ...state,
        flashDetails: action.payload,
      };

    case SWITCH_CAMERA_ACTION:
      return {
        ...state,
        switchCameraDetails: action.payload,
      };

    default:
      return state;
  }
};
