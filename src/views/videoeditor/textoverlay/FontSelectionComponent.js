import React, {Component} from 'react';
import {Text, TouchableOpacity, FlatList} from 'react-native';

const fontsList = [
  {
    title: 'Verdana',
    value: 'verdana',
  },
  {
    title: 'Palatino',
    value: 'palatino_bold',
  },
  {
    title: 'Menlo',
    value: 'menloregular',
  },
  {
    title: 'Snell Roundhand',
    value: 'snell_round_hand',
  },
  {
    title: 'ChalkboardSE',
    value: 'chalkboard_se_regular',
  },
  {
    title: 'Bradley Hand',
    value: 'bradley_hand_bold',
  },
  {
    title: 'Helvetica',
    value: 'helvetica',
  },
];

export default class FontSelectionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: fontsList[0].value,
    };
  }

  chooseFont(selectedFont) {
    this.setState({isSelected: selectedFont.value});
    this.props.onFontSelected(selectedFont.value);
  }

  render() {
    return (
      <FlatList
        data={fontsList}
        keyboardShouldPersistTaps={'always'}
        horizontal={true}
        renderItem={({item}) => (
          <TouchableOpacity
            style={{
              height: 35,
              padding: 3,
              marginTop: 8,
              justifyContent: 'center',
              flex: 1,
              minWidth: 40,
              borderColor: '#fff',
              borderRadius: 5,
              borderWidth: this.state.isSelected == item.value ? 0.7 : 0,
              backgroundColor: 'transparent',
              margin: 2,
            }}
            onPress={() => {
              this.chooseFont(item);
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#fff',
                marginTop: -3,
                fontFamily: item.value,
                fontSize: 18,
              }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    );
  }
}
