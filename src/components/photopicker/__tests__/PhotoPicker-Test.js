import React from 'react';
import renderer from 'react-test-renderer';
import PhotoPicker, { ImageCell } from '../PhotoPicker';
import {
  NativeModules,
} from "react-native";

const mockSelectedPhotos = jest.fn();

jest.mock('../PhotoPicker', () => {
  return jest.fn().mockImplementation(() => {
    return {onSelectedItems: mockSelectedPhotos};
  });
});

describe("PhotoPicker-Test",() => {
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

  afterEach(() => {
    NativeModules.RNCameraManager = { converPHAssetIdentifierAsURLPath: (params) => {
      return Promise.resolve([ {
          node : {
              group_name : "All Photos",
               image : {
                  filename : "sideways_made_iphone11pro.mov",
                  height : 3482,
                  isStored : 1,
                  localPath : "file:///var/mobile/Media/DCIM/111APPLE/IMG_1740.MOV",
                  playableDuration : "2.771666666666667",
                  uri : "ph://A9C616F0-3000-429D-8E1D-A96DDC99DCA5/L0/001",
                  width : 2160,
              },
              location :{
              },
              timestamp : 1613877055,
              type : "video",
          }
        }
        ]);
    } 
  } 
  });

  it("should render the PhotoPicker", async () => {
      const tree = renderer
      .create(<PhotoPicker
        rowItems={5}
        orientation={'portrait'}
        />)
      .toJSON();
      
    expect(tree).toMatchSnapshot();
  })

  it("should render the initial ImageCell", () => {
    const tree = renderer
    .create(<ImageCell imageUrl={"test-image.png"} selected={false}/>)
    .toJSON();
    expect(tree).toMatchSnapshot();
})

  it("should render the selected ImageCell", () => {
    const tree = renderer
    .create(<ImageCell imageUrl={"test-image.png"} selected={true} selectedIndex={0}/>)
    expect(tree).toMatchSnapshot();
  })

 
  
})
