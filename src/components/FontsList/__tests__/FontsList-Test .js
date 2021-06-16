import React from 'react';
import renderer from 'react-test-renderer';
import FontsList from '../FontsList';

jest.useFakeTimers();

const mockNullData = [];
const mockData = [
  {
    title: 'Verdana',
    value: 'Verdana-Bold',
  },
];

describe('FontsList Tests', () => {
  it('should render FontsList with data correctly', async () => {
    const tree = renderer.create(<FontsList data={mockData} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should render FontsList with null data', async () => {
    const tree = renderer.create(<FontsList data={mockNullData} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
