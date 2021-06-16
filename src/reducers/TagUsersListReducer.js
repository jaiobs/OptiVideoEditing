import {TAG_ALL_USERS_FETCH} from '../lib/Types';

const INITIAL_STATE = {
  tagList: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TAG_ALL_USERS_FETCH:
      return {
        ...state,
        tagList: action.payload,
      };
    default:
      return state;
  }
};
