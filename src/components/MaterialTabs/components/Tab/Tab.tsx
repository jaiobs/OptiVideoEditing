import React from 'react';
import { StyleProp, TextStyle, TouchableOpacity, View, Text } from 'react-native';
export type ContentType = string | React.ReactElement;

interface TabProps {
  allowFontScaling: boolean;
  content: ContentType;
  tabWidth: number;
  tabHeight: number;
  activeTextColor: string;
  inActiveTextColor: string;
  active?: boolean;
  textStyle: StyleProp<TextStyle>;
  uppercase: boolean;
  activeTextStyle?: StyleProp<TextStyle>;
  onPress(): void;
}

const Tab = ({
  allowFontScaling,
  activeTextColor,
  active,
  onPress,
  content,
  inActiveTextColor,
  tabWidth,
  tabHeight,
  textStyle,
  uppercase,
  activeTextStyle,
}: TabProps) => {
  const color = active ? activeTextColor : inActiveTextColor;

  return (
    <TouchableOpacity style={{
    "width":tabWidth,
    }} onPress={onPress}>
      <View style={{
        "height": tabHeight,
        "alignItems": "center",
    "justifyContent": "center",
    "paddingLeft": 12,
    "paddingRight": 12
      }} >
        {typeof content === 'string' ? (
          <Text>
            {uppercase ? content.toUpperCase() : content}
          </Text>
        ) : (
          React.cloneElement(content, {
            style: [content.props.style, { color }],
          })
        )}
      </View>
    </TouchableOpacity>
  );
};

Tab.defaultProps = {
  active: false,
};

export default Tab;
