import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  NativeModules,
  ScrollView,
} from 'react-native';

import {Colors, Images} from '../../res';
import FastImage from '@stevenmasini/react-native-fast-image';


export default class VideoPickerAndroid extends Component {
   GalleryManager = NativeModules.GalleryPickerModule;

  constructor(props) {
    super(props);
    this.state = {
      finishedLoading: false,
      rows: [],
      selectedFiles: [],
      width: props.width,
      videoResponse: [],
      expandedItems: [0],
    };
  }

  componentDidMount() {
    this.getGalleryDetails();
  }

  refresh() {
    this.getGalleryDetails();
  }

  getGalleryDetails() {
    this.setState({finishedLoading: false}, () => {
      this.GalleryManager.getGalleyVideos((images) => {
        let videoResponse = JSON.parse(images.gallery_videos);

        console.log('VIDEO_GALLERY', videoResponse);

        if (videoResponse) {
          this.setState({
            finishedLoading: true,
            videoResponse: videoResponse.reverse(),
          });
        }
      });
    });
  }

  getIsExpanded(index) {
    return this.state.expandedItems.includes(index);
  }

  toggleExpandAndCollapse(index) {
    if (this.state.expandedItems.includes(index)) {
      this.setState({
        expandedItems: this.state.expandedItems.filter(
          (value) => value !== index,
        ),
      });
    } else {
      var expandedItems = this.state.expandedItems;
      expandedItems.push(index);
      this.setState({
        expandedItems: expandedItems,
      });
    }
  }

  onEndReached() {
    this.setState({finishedLoading: true});
  }

  onSelectedItems(item, index) {
    var selectedFiles = this.state.selectedFiles;
    if (selectedFiles.includes(item)) {
      selectedFiles = selectedFiles.filter((value) => value !== item);
    } else {
      selectedFiles.push(item);
    }
    this.setState({selectedFiles}, () => {
      this.props.onVideosSelected(selectedFiles);
    });
  }

  isSelected(index) {
    return this.state.selectedFiles.includes(index);
  }

  getIndexNumber(videoObject) {
    return this.state.selectedFiles.indexOf(videoObject) + 1;
  }

  getTimeDurationFromSec(secs) {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? '0' + v : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  }

  renderRow = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.onSelectedItems(item, index);
        }}
        style={{
          width: this.state.width / this.props.rowItems - 10,
          height: this.state.width / this.props.rowItems - 5,
          borderColor: Colors.primaryAccent,
          borderWidth: this.isSelected(item) ? 3 : 0,
          margin: 1,
        }}>
        <FastImage
                  source={{
                    uri: item && item.videoPath,
                    priority: FastImage.priority.high,
                  }}
                  style={{width: '100%', height: '100%'}}
                />

        <View style={{position: 'absolute', bottom: 0, left: 0}}>
          <Text style={{color: 'white', fontSize: 10}}>
            {this.getTimeDurationFromSec(item.duration / 1000)}
          </Text>
        </View>

        {this.isSelected(item) && (
          <View
            style={{
              position: 'absolute',
              top: 2,
              right: 4,
              borderRadius: 20,
              backgroundColor: Colors.primaryAccent,
              paddingLeft: 6,
              paddingRight: 6,
              paddingTop: 2,
              paddingBottom: 2,
            }}>
            <Text style={{color: 'white', fontSize: 10}}>
              {this.getIndexNumber(item)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  applyDimensions(layout) {
    const {width} = layout;
    this.setState({width: width});
  }

  getRenderVideoRack(row, index) {
    if (row.list.length >= 1) {
      return (
        <View style={{flexDirection: 'column', marginLeft: 4, marginRight: 4}}>
          <TouchableOpacity
            onPress={() => {
              this.toggleExpandAndCollapse(index);
            }}
            style={styles.rowHeader}>
            <Text style={styles.rowHeaderText}>{row.name}</Text>

            <Image
              source={
                this.getIsExpanded(index)
                  ? Images.down_arrow
                  : Images.right_arrow
              }
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          {this.renderVideoList(row.list, index)}
        </View>
      );
    }
  }

  renderVideoList(data, index) {
    if (this.state.expandedItems.includes(index)) {
      return (
        <FlatList
          style={{
            marginTop: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          initialNumToRender={1000}
          key={this.props.orientation}
          onEndReached={this.onEndReached.bind(this)}
          renderItem={({item, Index}) => this.renderRow(item, Index)}
          keyExtractor={(item, Index) => item.id + '' + Index}
          data={data.slice().reverse()}
          extraData={this.props.orientation}
          numColumns={this.props.rowItems}
        />
      );
    }
  }

  render() {
    return (
      <View
        onLayout={(event) => {
          this.applyDimensions(event.nativeEvent.layout);
        }}
        style={styles.container}>
        {!this.state.finishedLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primaryAccent}
            style={{alignSef: 'center'}}
          />
        )}
        <ScrollView
          nestedScrollEnabled={true}
          style={{
            backgroundColor: 'black',
            flex: 1,
            marginBottom: 200,
          }}>
          {this.state.videoResponse.map((item, index) => {
            return this.getRenderVideoRack(item, index);
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 6,
    marginRight: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    borderColor: 'gray',
    borderWidth: 1,
    width: '98%',
    marginLeft: 2,
    marginRight: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowHeaderText: {
    color: 'white',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 4,
  },
  arrowIcon: {
    height: 16,
    width: 16,
    marginRight: 10,
  },
});
