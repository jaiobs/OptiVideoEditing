import {
    OVERLAY_DATA_LIST,
  } from '../lib/Types';

  export const overlayDataArray = (data) => {
    return (dispatch) => {
      dispatch({
        type: OVERLAY_DATA_LIST,
        payload: data,
      });
    };
  };