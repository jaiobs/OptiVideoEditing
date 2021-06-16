import PropTypes from 'prop-types';
import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';

import ColorOption from './color-option';

const ColorPalette = (props) => {
  const {colors, icon, onChange, paletteStyles, scaleToWindow} = props;

  const [value, setColor] = useState(value);

  const onColorChange = useCallback(
    (color) => {
      setColor(color);
      onChange(color);
    },
    [onChange],
  );

  return (
    <View style={[styles.colorContainer, {...paletteStyles}]}>
      <FlatList
        data={colors}
        horizontal={true}
        keyboardShouldPersistTaps={'always'}
        renderItem={({item}) => (
          <ColorOption
            key={item}
            color={item}
            icon={icon}
            onColorChange={onColorChange}
            scaleToWindow={scaleToWindow}
            value={props.value}
            itemVal={item}
            isSelected={value == item}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleStyles: {
    color: 'black',
  },
  colorContainer: {},
});

ColorPalette.defaultProps = {
  colors: [
    '#FFFFFF',
    '#000000',
    '#CC0000',
    '#1155CC',
    '#FF5269',
    '#D141D6',
    '#D5A6BD',
    '#FF37BA',
    '#30ACF1',
    '#52DA87',
    '#FFD246',
    '#FFA25C',
    '#84D0B6',
    '#2ECC71',
    '#F1C40F',
    '#F39C12',
    '#E67E22',
    '#D35400',
    '#BDC3C7',
    '#95A5A6',
    '#7F8C8D',
    '#34495E',
    '#2C3E50',
  ],
  defaultColor: null,
  onChange: () => {},
  paletteStyles: {},
  scaleToWindow: false,
  title: 'Color Palette:',
  titleStyles: {},
  value: null,
};

ColorPalette.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  onChange: PropTypes.func,
  defaultColor: PropTypes.string,
  value: PropTypes.string,
  paletteStyles: PropTypes.shape({}),
};

export default ColorPalette;
