import React from 'react';
import renderer from 'react-test-renderer';
import StickerPicker from '../StickerPicker.android';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';
import CameraPreviewReducer from '../../../reducers/CameraPreviewReducer';
import StickerListReducer from '../../../reducers/StickerListReducer';
import * as types from '../../../lib/Types';
jest.useFakeTimers();
const mockOrientation = 'portrait';
const mockStore = configureMockStore({});

const mockNullItem = {
  url: null,
};

const mockItem = {
  url: 'test-image.pnge',
};
describe('sticker reducer', () => {
  it('should return the initial state', async () => {
    jest.useFakeTimers();
    expect(StickerListReducer(undefined, {})).toEqual({
      stickerListSuccess: [],
      stickerListFailure: [],
      stickerCategoriesSuccess: [],
      stickerCategoriesFailure: [],
    });
  });
});

describe('orientationCheck reducer', () => {
  jest.useFakeTimers();
  it('should return the initial state', () => {
    expect(CameraPreviewReducer(undefined, {})).toEqual({
      orientationCheck: mockOrientation,
      backPressVideoDetails: {},
      flashDetails: false,
      onPictureTaken: {},
      onVideoTaken: {},
      retainVideoSegments: [],
      switchCameraDetails: false,
    });
  });

  it('should handle orientation action payload', async () => {
    jest.useFakeTimers();
    expect(
      CameraPreviewReducer('', {
        type: types.ORIENTATION,
        payload: mockOrientation,
      }),
    ).toEqual({
      orientationCheck: mockOrientation,
    });
  });
});

describe('VideoTrimmer render flatList with defined values ', () => {
  jest.useFakeTimers();
  it('should match the snapshot', async () => {
    const initialState = {
      CameraPreviewReducer: {orientationCheck: mockOrientation},
      StickerListReducer: {
        stickerListSuccess: [],
        stickerListFailure: [],
        stickerCategoriesSuccess: [],
        stickerCategoriesFailure: [],
      },
    };
    const store = mockStore(initialState);
    const tree = renderer
      .create(
        <Provider store={store}>
          <StickerPicker item={mockItem} />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('VideoTrimmer render flatList with null value ', () => {
  jest.useFakeTimers();
  it('should match the snapshot', async () => {
    const initialState = {
      CameraPreviewReducer: {orientationCheck: mockOrientation},
      StickerListReducer: {
        stickerListSuccess: [],
        stickerListFailure: [],
        stickerCategoriesSuccess: [],
        stickerCategoriesFailure: [],
      },
    };
    const store = mockStore(initialState);
    const tree = renderer
      .create(
        <Provider store={store}>
          <StickerPicker item={mockNullItem} />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('VideoTrimmerTest', () => {
  jest.useFakeTimers();
  it('should render correctly with state to props', async () => {
    const initialState = {
      CameraPreviewReducer: {orientationCheck: mockOrientation},
      StickerListReducer: {
        stickerListSuccess: [],
        stickerListFailure: [],
        stickerCategoriesSuccess: [],
        stickerCategoriesFailure: [],
      },
    };
    const store = mockStore(initialState);
    const tree = renderer
      .create(
        <Provider store={store}>
          <StickerPicker />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
