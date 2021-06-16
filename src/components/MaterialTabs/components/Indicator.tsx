import React from 'react';
import { Animated,View } from 'react-native';

import constants from '../lib/constants';

interface BarProps {
  tabWidth: number;
  color: string;
}

interface IndicatorProps {
  color: string;
  tabWidth: number;
  value: Animated.Value;
}

const Indicator = (props: IndicatorProps) => (
  <Animated.View
    //color={props.color}
    style={[{
      transform: [
          {translateX: props.value},
      ]},
      {height:constants.indicatorHeight, width: props.tabWidth - 20, left:10, position: "absolute", bottom: 0, backgroundColor: props.color, alignSelf:"center"}]}
  />
);

export default Indicator;
