import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from 'react-native';
import {Images} from '../../res/';
import BouncyView from '../widgets/BouncyView/BouncyView';

export default class CameraSpeedControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tapIndex: this.props.speedMode,
      speedVisible: this.props.showSpeedView
    };
  }

  toggleSpeedControlView() {
    this.setState({speedVisible: !this.state.speedVisible});
  }

  updateSelectedState(item) {
    this.setState({tapIndex: item});
    if (Platform.OS == 'ios') {
      this.toggleSpeedControlView();
      this.props.speedDidChange(item);
    } else {
      this.toggleSpeedControlView();
      if (item === 1) {
        //slow motion
        this.props.updatePlaybackSpeed('slow2');
      } else if (item === 2) {
        this.props.updatePlaybackSpeed('slow1');
      } else if (item === 3) {
        this.props.updatePlaybackSpeed('normal');
      } else if (item === 4) {
        this.props.updatePlaybackSpeed('fast1');
      } else if (item === 5) {
        this.props.updatePlaybackSpeed('fast2');
      } else if (item === 6) {
        this.props.updatePlaybackSpeed('reverse');
      }
    }
  }

  returnSpeedType = (speed) => {
    if (speed == 1) {
      return 'Slow 2x';
    } else if (speed == 2) {
      return 'Slow 1x';
    } else if (speed == 4) {
      return 'Fast 1x';
    } else if (speed == 5) {
      return 'Fast 2x';
    } else if(speed == 6) {
      return "Reverse";
    }
  }

  renderLandscapeView() {
    const tapIndex = this.state.tapIndex;
    return (
      <View
        style={[
          styles.landscape_container,
          {marginTop: this.state.speedVisible == false ? 40 : 0},
        ]}>
        {this.state.speedVisible == false && (
          <View style={{flexDirection: 'column'}}>
            {tapIndex != 3 && (
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 12,
                  marginTop: -10,
                }}>
                {this.returnSpeedType(tapIndex)}
              </Text>
            )}
            <BouncyView
              style={stylesLandscape.portraitSpeedIconContainer}
              onPress={() => this.toggleSpeedControlView()}>
              <Image
                style={stylesLandscape.speedIcon}
                source={Images.slowmotion_icon}
              />
            </BouncyView>
          </View>
        )}
      {this.state.speedVisible && (
        <View>
        <TouchableOpacity onPress={() => this.updateSelectedState(6)} style={[tapIndex == 6 ? stylesLandscape.tapButton : stylesLandscape.unTapButton,{flexDirection:"row",width:90}]}>
          <Image style={[styles.loopIcon,{width:15,height:15,resizeMode:"contain"}]} source={Images.video_reverse_icon} />
          <Text style={{ color: "#fff", fontSize: 12, margin:3 }}>reverse</Text>
        </TouchableOpacity>
      <View style={{flexDirection:"row", marginTop:4, alignSelf:"center"}}>
      <BouncyView
          isSpeedControl={true}
          onPress={() => this.updateSelectedState(1)}
          style={tapIndex == 1 ? stylesLandscape.tapButton : stylesLandscape.unTapButton}
        >
          <Text style={styles.speedText}>slow 2x</Text>
        </BouncyView>

              <BouncyView
                isSpeedControl={true}
                onPress={() => {
                  this.updateSelectedState(2);
                }}
                style={
                  tapIndex == 2
                    ? stylesLandscape.tapButton
                    : stylesLandscape.unTapButton
                }>
                <Text style={styles.speedText}>slow 1x</Text>
              </BouncyView>

              <BouncyView
                isSpeedControl={true}
                onPress={() => this.updateSelectedState(3)}
                style={
                  tapIndex == 3
                    ? stylesLandscape.tapButton
                    : stylesLandscape.unTapButton
                }>
                <Text style={styles.speedText}>normal</Text>
              </BouncyView>

              <BouncyView
                isSpeedControl={true}
                onPress={() => this.updateSelectedState(4)}
                style={
                  tapIndex == 4
                    ? stylesLandscape.tapButton
                    : stylesLandscape.unTapButton
                }>
                <Text style={styles.speedText}>fast 1x</Text>
              </BouncyView>

              <BouncyView
                isSpeedControl={true}
                onPress={() => this.updateSelectedState(5)}
                style={
                  tapIndex == 5
                    ? stylesLandscape.tapButton
                    : stylesLandscape.unTapButton
                }>
                <Text style={styles.speedText}>fast 2x</Text>
              </BouncyView>
            </View>
          </View>
      )}
      </View>
    );
    // }
  }

  renderPortraitView() {
    const tapIndex = this.state.tapIndex;
    return (
      <View style={styles.portrait_container}>    
        <View style={{
            flexDirection: "column",
            justifyContent: "center",
            zIndex:1
          }}>
          <TouchableOpacity
            onPress={() => this.updateSelectedState(0)}
            style={[tapIndex == 6 ? styles.tapButton : styles.unTapButton,{flexDirection:"row",width:90,zIndex:0}]}>
            <Image style={[styles.loopIcon,{width:15,height:15,resizeMode:"contain"}]} source={Images.video_reverse_icon} />
            <Text style={{ color: "#fff", fontSize: 12, margin:3 }}>reverse</Text>
          </TouchableOpacity>
        </View>     
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <BouncyView
            isSpeedControl={true}
            onPress={() => this.updateSelectedState(1)}
            style={tapIndex == 1 ? styles.tapButton : styles.unTapButton}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>slow 2x</Text>
          </BouncyView>

          <BouncyView
            isSpeedControl={true}
            onPress={() => this.updateSelectedState(2)}
            style={tapIndex == 2 ? styles.tapButton : styles.unTapButton}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>slow 1x</Text>
          </BouncyView>

          <BouncyView
            isSpeedControl={true}
            onPress={() => this.updateSelectedState(3)}
            style={tapIndex == 3 ? styles.tapButton : styles.unTapButton}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>normal</Text>
          </BouncyView>

          <BouncyView
            isSpeedControl={true}
            onPress={() => this.updateSelectedState(4)}
            style={tapIndex == 4 ? styles.tapButton : styles.unTapButton}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>fast 1x</Text>
          </BouncyView>

          <BouncyView
            isSpeedControl={true}
            onPress={() => this.updateSelectedState(5)}
            style={tapIndex == 5 ? styles.tapButton : styles.unTapButton}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>fast 2x</Text>
          </BouncyView>
        </View>
      </View>
    );
  }

  renderEmptyView() {
    return <View style={{ width: 70 }} />;
  }

  render() {
    if (!this.props.visibility) {
      return this.renderEmptyView();
    } else if (
      (this.props.visibility && this.props.orientation == 'portrait') ||
      (this.props.visibility &&
        this.props.showSpeedView &&
        this.props.orientation == 'portrait')
    ) {
      return this.renderPortraitView();
    } else {
      return this.renderLandscapeView();
    }
  }
}

const styles = StyleSheet.create({
  portrait_container: {
    flexDirection: 'column',
    zIndex: 2,
  },
  landscape_container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 5,
    paddingBottom: 5,
    // zIndex: 2
  },
  loopIcon: {
    height: 28,
    width: 28,
  },
  speedText: {
    color: '#fff',
    fontSize: 12,
  },
  speedView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  reverseText: {
    color: '#fff',
    fontSize: 12,
    margin: 3,
  },
  tapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 60,
    height: 28,
    margin:3,
    borderRadius: 14,
    zIndex: 1
  },
   emptyView: {
    width: 70,
  },
  unTapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 60,
    margin:3,
    height: 28,
    borderRadius: 14,
    zIndex: 1
  }
});

const stylesLandscape = StyleSheet.create({
  portraitSpeedIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  speedIcon: {
    height: Platform.OS == 'ios' ? 40 : 34,
    width: Platform.OS == 'ios' ? 40 : 34,
    marginTop: 10,
  },
  tapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 70,
    height: 25,
    margin:3,
    borderRadius: 12.5,
    zIndex: 1
  },
  unTapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 70,
    height: 25,
    margin:3,
    borderRadius: 12.5,
    zIndex: 1
  }
});
