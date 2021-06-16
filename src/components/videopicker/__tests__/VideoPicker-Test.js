import React from 'react';
import renderer from 'react-test-renderer';
import PhotoPicker, { ImageCell } from '../VideoPicker';
import {
  NativeModules
} from "react-native";

describe("VideoPickerTest",() => {
  beforeEach(() => {
    NativeModules.RNCCameraRoll = { getPhotos: (params) => {
      return Promise.resolve({
        page_info: {
          end_cursor: 0,
          has_next_page: 10
        },
        edges:[{
          node: {
            image: {
              url: "test-image.png"
            }
          }
        }]
      });
    } 
  } 
  });
  it("should render the VideoPicker", async () => {
      const tree = renderer
      .create(<PhotoPicker
        rowItems={5}
        />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  })

  it("should render the  ImageCell", () => {
    const tree = renderer
    .create(<ImageCell/>)
    .toJSON();
  expect(tree).toMatchSnapshot();
})
})
