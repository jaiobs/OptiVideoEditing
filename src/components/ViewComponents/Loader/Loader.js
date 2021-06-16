import React, { Component } from "react";
import { View, Text, ActivityIndicator, StyleSheet,SafeAreaView } from "react-native";
import { Colors } from "../../../res";

export default class Loader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.visibility) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={"small"} color={Colors.primaryAccent} />
            <Text style={styles.textStyle}>Processing</Text>
          </View>
        </SafeAreaView>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    height: "110%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex:999,
    elevation:10
  },
  loaderContainer: {
    backgroundColor: "black",
    padding: 13,
    borderRadius: 6,
    elevation: 2
  },
  textStyle: {
    marginTop: 10,
    textAlign: "center",
    color: "white",
    fontSize: 11
  }
});
