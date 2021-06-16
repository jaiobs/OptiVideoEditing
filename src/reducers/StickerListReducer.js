import {
  STICKER_CATEGORIES_FAILURE,
  STICKER_CATEGORIES_SUCCESS,
  STICKER_LIST_SUCCESS,
  STICKER_LIST_FAILURE,
 
} from '../lib/Types';

const INITIAL_STATE = {
  stickerListSuccess: [],
  stickerListFailure: [],
  stickerCategoriesSuccess: [],
  stickerCategoriesFailure: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case STICKER_CATEGORIES_SUCCESS:
      return {
        ...state,
        stickerCategoriesSuccess: action.payload,
        stickerCategoriesFailure: [],
        stickerListSuccess: [],
        stickerListFailure: [],
      };

    case STICKER_CATEGORIES_FAILURE:
      return {
        ...state,
        stickerCategoriesFailure: action.payload,
        stickerCategoriesSuccess: [],
        stickerListSuccess: [],
        stickerListFailure: [],
      };

    case STICKER_LIST_SUCCESS:
      return {
        ...state,
        stickerListSuccess: action.payload,
        stickerListFailure: [],
        stickerCategoriesSuccess: [],
        stickerCategoriesFailure: [],
      };

    case STICKER_LIST_FAILURE:
      return {
        ...state,
        stickerListFailure: action.payload,
        stickerListSuccess: [],
        stickerCategoriesSuccess: [],
        stickerCategoriesFailure: [],
      };

    default:
      return state;
  }
};
