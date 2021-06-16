import React from 'react';
import renderer from 'react-test-renderer';
import AdjustableExoPlayer from '../AdjustableExoPlayer';

describe("AdjustableExoPlayer snapshot test",() => {
    it("It should render AdjustableExoPlayer Correctly", () =>{
        const tree = renderer.create(
            <AdjustableExoPlayer></AdjustableExoPlayer>
        ).toJSON();
        expect(tree).toMatchSnapshot();
    })
});