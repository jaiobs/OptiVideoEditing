import React from 'react';
import renderer from 'react-test-renderer';
import GalleryPicker from '../index.android';
import {NativeModules} from 'react-native';

describe('GalleryPicker Tests', () => {
  beforeEach(() => {
    NativeModules.GalleryPickerModule = {
      getGalleryImages: (params) => {
        return Promise.resolve({
          page_info: {
            end_cursor: 0,
            has_next_page: 10,
          },
          edges: [
            {
              node: {
                image: {
                  url: 'test-image.png',
                },
              },
            },
          ],
        });
      },
      getGalleyVideos: (params) => {
        return Promise.resolve({
          page_info: {
            end_cursor: 0,
            has_next_page: 10,
          },
          edges: [
            {
              node: {
                video: {
                  url: 'test-video.mp4',
                },
              },
            },
          ],
        });
      },
    };
  });

  it('should render GalleryPicker correctly', () => {
    const tree = renderer.create(<GalleryPicker rowItems={3} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
