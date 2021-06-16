import {TRACK_LIST_FETCH} from '../lib/Types';

const INITIAL_STATE = {
  trackList: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TRACK_LIST_FETCH:
      return {
        ...state,
        trackList: action.payload,
      };

    default:
      return state;
  }
};
