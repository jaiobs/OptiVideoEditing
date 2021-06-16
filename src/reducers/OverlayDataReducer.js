import {
    OVERLAY_DATA_LIST,
  } from '../lib/Types';

  const INITIAL_STATE = {
    overlayDataList : [],
  };
  
  export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case OVERLAY_DATA_LIST:
        return{
          ...state,
          overlayDataList: action.payload,
        }
  
      default:
        return state;
    }
  };