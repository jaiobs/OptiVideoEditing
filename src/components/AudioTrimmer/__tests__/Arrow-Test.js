import React from 'react';
import renderer from 'react-test-renderer';
import {Left, Right} from '../Arrow';

describe("Arrow Tests",() => {
    it("should render Left correctly", () => {
        const tree = renderer
        .create(<Left/>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    })

    it("should render Right correctly", () => {
      const tree = renderer
      .create(<Right/>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  })
})