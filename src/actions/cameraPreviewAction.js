import {
  ORIENTATION,
  PICTURE_TAKEN,
  VIDEO_TAKEN,
  RETAIN_VIDEO_SEGMENTS,
  BACK_PRESS_VIDEO,
  FLASH_ACTION,
  SWITCH_CAMERA_ACTION,
} from '../lib/Types';

export const orientation = (data) => {
  return (dispatch) => {
    dispatch({
      type: ORIENTATION,
      payload: data,
    });
  };
};

export const onPictureTaken = (data) => {
  return (dispatch) => {
    dispatch({
      type: PICTURE_TAKEN,
      payload: data,
    });
  };
};

export const onVideoTaken = (data) => {
  return (dispatch) => {
    dispatch({
      type: VIDEO_TAKEN,
      payload: data,
    });
  };
};

export const saveVideoSegments = (data) => {
  return (dispatch) => {
    dispatch({
      type: RETAIN_VIDEO_SEGMENTS,
      payload: data,
    });
  };
};

export const backPressVideo = (data) => {
  return (dispatch) => {
    dispatch({
      type: BACK_PRESS_VIDEO,
      payload: data,
    });
  };
};
export const flashAction = (data) => {
  return (dispatch) => {
    dispatch({
      type: FLASH_ACTION,
      payload: data,
    });
  };
};

export const switchCameraAction = (data) => {
  return (dispatch) => {
    dispatch({
      type: SWITCH_CAMERA_ACTION,
      payload: data,
    });
  };
};
