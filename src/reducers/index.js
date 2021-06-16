import {combineReducers} from 'redux';
import CameraPreviewReducer from './CameraPreviewReducer';
import StickerListReducer from './StickerListReducer';
import MusicReducers from './MusicReducers';
import TagUsersListReducer from './TagUsersListReducer';
import OverlayDataReducer from './OverlayDataReducer';

export const rootReducer = combineReducers({
  CameraPreviewReducer,
  StickerListReducer,
  TagUsersListReducer,
  MusicReducers,
  OverlayDataReducer,
});
