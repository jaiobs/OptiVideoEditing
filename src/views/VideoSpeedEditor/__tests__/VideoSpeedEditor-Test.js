import React from 'react';
import renderer from 'react-test-renderer';
import VideoSpeedEditor from '../VideoSpeedEditor';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';
import CameraPreviewReducer from '../../../reducers/CameraPreviewReducer';
import * as types from '../../../lib/Types';
jest.useFakeTimers();
const mockOrientation = 'portrait';
const mockStore = configureMockStore({});

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

describe('VideoTrimmerTest', () => {
  jest.useFakeTimers();
  it('should render correctly with state to props', async () => {
    const initialState = {
      CameraPreviewReducer: {orientationCheck: mockOrientation},
    };
    const store = mockStore(initialState);
    const tree = renderer
      .create(
        <Provider store={store}>
          <VideoSpeedEditor navigation={{getParam: jest.fn()}} />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
