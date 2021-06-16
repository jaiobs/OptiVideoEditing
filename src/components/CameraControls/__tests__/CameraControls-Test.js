import React from 'react';
import renderer from 'react-test-renderer';
import CameraControls from '../CameraControls';

describe("CameraControls snapshot test",() => {
    it("It should render CameraControls Correctly", () =>{
        const tree = renderer.create(
            <CameraControls></CameraControls>
        ).toJSON();
        expect(tree).toMatchSnapshot();
    })
});