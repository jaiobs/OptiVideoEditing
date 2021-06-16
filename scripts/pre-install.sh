# !/bin/sh
# this script post install dependency libs
FIRE_SYM="\xF0\x9F\x94\xA5"
npm i --save react-native-animatable@^1.3.3 react-native-double-tap@^1.0.1 react-native-gesture-handler@^1.5.0 react-native-image-crop-picker@^0.26.1 react-native-modal@^11.5.3 react-native-reanimated@^1.4.0 react-native-screens@^1.0.0-alpha.23 react-navigation@^4.0.10 react-navigation-stack@^1.10.3 react-redux@^7.1.3 redux@^4.0.4 redux-thunk@^2.3.0 && echo "\n$FIRE_SYM $FIRE_SYM Litpic dependency libs installed successfully $FIRE_SYM $FIRE_SYM\n" || echo "\nFailed to install Litpic dependency libs !"
