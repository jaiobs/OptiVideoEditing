import React from 'react';
import renderer from 'react-test-renderer';
import AddMusicToVideo from '../AddMusicToVideo';

describe("AddMusicToVideo snapshot test",() => {
    it("It should render AddMusicToVideo Correctly", () =>{
        const tree = renderer.create(
            <AddMusicToVideo></AddMusicToVideo>
        ).toJSON();
        expect(tree).toMatchSnapshot();
    })
});