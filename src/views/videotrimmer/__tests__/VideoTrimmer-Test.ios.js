import * as types from '../../../lib/Types'

import { fireEvent, render } from '@testing-library/react-native';

import CameraPreviewReducer from '../../../reducers/CameraPreviewReducer';
import { NativeModules } from 'react-native';
import { Provider } from "react-redux";
import React from 'react';
import VideoTrimmer from '../VideoTrimer.ios';
import configureMockStore from "redux-mock-store";
import renderer from 'react-test-renderer';

jest.useFakeTimers()

const mockOrientation = "portrait"
const mockStore = configureMockStore({});

describe('orientationCheck reducer', () => {
   beforeEach(() => {
    NativeModules.VideoTrimmer = { getTrimVideo: (params) => {
      return Promise.resolve({
        videos: [],
        mergedVideo: '',
        IsPortraitVideo:true
      });
    } 
  }
  });
    it('should return the initial state', () => {
      expect(CameraPreviewReducer(undefined, {})).toEqual(
        {
          orientationCheck: mockOrientation,
          backPressVideoDetails: {}, 
          flashDetails: false, 
          onPictureTaken: {}, 
          onVideoTaken: {}, 
          retainVideoSegments: [], 
          switchCameraDetails: false
        }
      )
    })
  
    it('should handle orientation action payload', () => {
      expect(
        CameraPreviewReducer('', {
          type: types.ORIENTATION,
          payload: mockOrientation
        })
      ).toEqual(
        {
            orientationCheck: mockOrientation,
        }
      )
    })
  });


 
describe('VideoTrimmerTest', () => {
    it('should render correctly with state to props',()=> {
      const initialState = {
        CameraPreviewReducer: {orientationCheck: mockOrientation},
      };
      const store = mockStore(initialState);
      const tree = renderer
        .create(
          <Provider store={store}>
            <VideoTrimmer navigation={{getParam: jest.fn()}} />
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    })

    it('should render function call correctly',()=> {
      const initialState = { CameraPreviewReducer: { orientationCheck: mockOrientation } }
      const store = mockStore(initialState)
      const pressedCallback = jest.fn()
      const { getByTestId } = render(<Provider store={store}>
        <VideoTrimmer navigation={{ getParam: jest.fn()}}/>
     </Provider>)
      fireEvent.press(getByTestId('nextBtn_on_Trimmer'))
      expect(pressedCallback).not.toBeCalled() 
      expect(getByTestId).toMatchSnapshot();
    })

});