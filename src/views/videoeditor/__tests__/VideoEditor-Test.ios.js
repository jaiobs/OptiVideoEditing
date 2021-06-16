import React from 'react';
import renderer from 'react-test-renderer';
import VideoEditor from '../VideoEditor.ios';
import {NativeModules} from 'react-native';

describe('VideoEditorTest', () => {
    beforeEach(() => {
        NativeModules.TextEmbedder = { 
            lockOrientationInPhotoView: (params) => {
                return Promise.resolve("locked");
            } 
        }
        NativeModules.PreviewFilter = { 
            updateVideoUrl: jest.fn()
        } 
      });

    it('should render correctly with state to props',()=> {
        const tree = renderer.create(
         <VideoEditor navigation={{ getParam: jest.fn()}}/>
      )
      .toJSON();
      expect(tree).toMatchSnapshot();
    })
  });