import React from 'react';
import renderer from 'react-test-renderer';
import AudioTrimmer from '../AudioTrimmer';
import TrimmerSlider from '../TrimmerSlider';

jest.useFakeTimers();
describe("AudioTrimmer Tests", () => {
    it("should render AudioTrimmer correctly", () => {
        const tree = renderer
            .create(
                <AudioTrimmer
                    dataItem={
                        { waveform_url: "" }
                    }
                />
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    })
    it("test scrubberPosition Value", () => {
        const tree = renderer
            .create(
                <TrimmerSlider  dataItem={
                    { waveform_url: "" }
                }/>,
            )
            .getInstance();
        expect(tree.state.scrubberPosition).toEqual(1)
        tree.startTrackProgressAnimation();
        expect(tree.state.scrubberPosition).toBeDefined()
        tree.stopTrackProgressAnimation();
    })

    it("should render TrimmerSlider correctly", () => {
        const tree = renderer
            .create(
                <TrimmerSlider
                dataItem={
                    { waveform_url: "" }
                }
                />
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    })
})