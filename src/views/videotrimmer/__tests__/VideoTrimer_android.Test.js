import React from 'react';
import renderer from 'react-test-renderer';
import VideoTrimer from '../VideoTrimer.ios';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

import CameraPreviewReducer from '../../../reducers/CameraPreviewReducer';
import * as types from '../../../lib/Types';

jest.useFakeTimers();

const mockOrientation = 'portrait';
const mockStore = configureMockStore({});

describe('Android orientationCheck reducer', () => {
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

  it('should handle android orientation action payload', () => {
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

describe('android VideoTrimerTest', () => {
  it('should render correctly with state to props', () => {
    const initialState = {
      CameraPreviewReducer: {orientationCheck: mockOrientation},
    };
    const store = mockStore(initialState);
    const tree = renderer
      .create(
        <Provider store={store}>
          <VideoTrimer navigation={{getParam: jest.fn()}} />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
