import React from 'react';
import renderer from 'react-test-renderer';
import CameraCaptureAnimator from '../CameraCaptureAnimator';

describe('CameraCaptureAnimatorTest', () => {
  it('should render the CameraCaptureAnimator', async () => {
    jest.useFakeTimers();
    const tree = renderer.create(<CameraCaptureAnimator />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
