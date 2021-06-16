import React from 'react';
import renderer from 'react-test-renderer';
import TimerModalComponent from '../TimerModalComponent.android';

describe('VideoPickerTest', () => {
  it('should render the TimerModalComponent', () => {
    const tree = renderer.create(<TimerModalComponent />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
