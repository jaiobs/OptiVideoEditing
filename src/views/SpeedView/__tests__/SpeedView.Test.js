import React from 'react';
import renderer from 'react-test-renderer';
import SpeedView from '../SpeedView'
import {
  NativeModules,
  NativeEventEmitter
} from "react-native";
import { shallow } from 'enzyme';
import Enzyme from 'enzyme';

describe("SpeedView-Test", () => {

  beforeEach(() => {
    SpeedView.componentDidMount = jest.fn();
  });

  NativeModules.SpeedView = {
    updateSpeed: (params) => {
      return Promise.resolve({
        IsSpeedUpdated: true 
      });
    }
  }
    
  it("should render the SpeedView", async () => {
    const tree = renderer
      .create(<SpeedView/>)
      .toJSON();
    ;
    expect(tree).toMatchSnapshot();
  })
})