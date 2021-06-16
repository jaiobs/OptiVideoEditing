import React from 'react';
import renderer from 'react-test-renderer';
import ImagePreivew from '../ImagePreview';

describe("ImagePreview snapshot test",() => {
    it("It should render ImagePreview Correctly", () =>{
        const tree = renderer.create(
            <ImagePreivew></ImagePreivew>
        ).toJSON();
        expect(tree).toMatchSnapshot();
    })
});