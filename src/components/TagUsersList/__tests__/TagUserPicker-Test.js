import React from 'react';
import renderer from 'react-test-renderer';
import TagUserPicker, { TagCell } from '../TagUserPicker';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

jest.useFakeTimers();

const mockStore = configureMockStore({});

const mockItem = {
    profile_pic: 'test-image.pnge',
    first_name: 'firstName',
    last_name: 'lastName',
    user_name: 'userName',
  }
  
const mockNullItem = {
    profile_pic: null,
    first_name: null,
    last_name: null,
    user_name: null,
}

describe("TagUserPicker Tests", () => {
    jest.useFakeTimers();
    it("should render TagUserPicker correctly", async() => {
        
        const tree = renderer
        .create(jsx())
        .toJSON();
      expect(tree).toMatchSnapshot();
    })
})

describe('TagUserPicker render flatlist with defined values', () => {
    jest.useFakeTimers();
    it('should match the snapshot', async() => {
      // will generate snapshot for your component
      const onSelectPress = jest.fn();
      const tree = renderer
        .create(<TagCell item={mockItem} onSelect={onSelectPress} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('TagUserPicker render flatlist with null values', () => {
    jest.useFakeTimers();
    it('should match the snapshot', async() => {
        // will generate snapshot for your component
        const onSelectPress = jest.fn();
        const tree = renderer
          .create(<TagCell item={mockNullItem} onSelect={onSelectPress} />)
          .toJSON();
        expect(tree).toMatchSnapshot();
        expect(tree).toMatchSnapshot();
      });
  });
  

const jsx = () => {
    const closePressHandler = jest.fn();
    const initialState = {
        TagUsersListReducer: {tagList: mockItem},
      };
    const store = mockStore(initialState);
    return (
        <Provider store={store}>
        <TagUserPicker
          visible={true}
          onClosePressed={closePressHandler}
        />
        </Provider>
    );
};