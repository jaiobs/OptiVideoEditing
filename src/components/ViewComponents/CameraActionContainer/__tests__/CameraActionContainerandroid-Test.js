import React from 'react';
import renderer from 'react-test-renderer';
import CameraActionContainer from '../CameraActionContainer.android';

describe('CameraActionContainerTest', () => {
  it('should render the CameraActionContainer', async () => {
    jest.useFakeTimers();
    const tree = renderer.create(<CameraActionContainer />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
