import React from 'react';
import renderer from 'react-test-renderer';
import PhotoPickerAndroid from '../PhotoPickerAndroid';
import {NativeModules} from 'react-native';

describe('PhotoPickerAndroidTest', () => {
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
    };
  });

  it('should render the PhotoPickerAndroid', async () => {
    const tree = renderer.create(<PhotoPickerAndroid rowItems={5} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
