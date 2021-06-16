import React from 'react';
import renderer from 'react-test-renderer';
import CameraSpeedControlsLandscape from '../CameraSpeedControlsLandscape';

jest.useFakeTimers();
const updatePlaybackSpeed = jest.fn();

describe('android CameraSpeedAndroid', () => {
    it('should render correctly update state value speed', async () => {
      const tree = renderer
        .create(
          <CameraSpeedControlsLandscape
            updatePlaybackSpeed={updatePlaybackSpeed}
          />,
        )
        .getInstance();
      tree.updateSelectedState(1);
      expect(tree.state.item).toEqual('slow 2X');
      tree.updateSelectedState(2);
      expect(tree.state.item).toEqual('slow 1X');
      tree.updateSelectedState(3);
      expect(tree.state.item).toEqual('normal');
      tree.updateSelectedState(4);
      expect(tree.state.item).toEqual('fast 1X');
      tree.updateSelectedState(5);
      expect(tree.state.item).toEqual('fast 2X');
      tree.updateSelectedState(6);
      expect(tree.state.item).toEqual('reverse');
    });
    it('should render correctly photoPicker with state to props', async () => {
      const tree = renderer
        .create(<CameraSpeedControlsLandscape rowItems={5} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });