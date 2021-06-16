import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  NativeModules,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {Colors, Images} from '../../res';
import FastImage from '@stevenmasini/react-native-fast-image';

export default class PhotoPickerAndroid extends Component {
  GalleryManager = NativeModules.GalleryPickerModule;

  constructor(props) {
    super(props);
    this.state = {
      finishedLoading: false,
      rows: [],
      selectedFiles: [],
      selectedIndexes: [],
      width: props.width,
      imageResponse: [],
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
      this.GalleryManager.getGalleryImages((images) => {
        let imageResponse = JSON.parse(images.gallery_images);
        imageResponse &&
          this.setState(
            {
              finishedLoading: true,
            },
            () => {
              this.setState({imageResponse: imageResponse.reverse()});
            },
          );
      });
    });
  }

  onEndReached() {
    this.setState({finishedLoading: true});
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

  onSelectedItems(item, index) {
    var selectedFiles = this.state.selectedFiles;
    if (selectedFiles.includes(item)) {
      selectedFiles = selectedFiles.filter((value) => value !== item);
    } else {
      if (selectedFiles.length < 10) {
        selectedFiles.push(item);
      } else {
        ToastAndroid.show(
          'can' + "'" + 't' + ' select' + ' more than 10 media items',
          ToastAndroid.SHORT,
        );
      }
    }
    this.setState({selectedFiles}, () => {
      this.props.onItemSelected(selectedFiles);
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
            uri: item && item.imagePath,
            priority: FastImage.priority.high,
          }}
          style={styles.fastImage}
        />

        {this.isSelected(item) && (
          <View style={styles.selectedImage}>
            <Text style={styles.selectItem}>{this.getIndexNumber(item)}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  applyDimensions(layout) {
    const {width} = layout;
    this.setState({width: width});
  }

  getRenderImageRack(row, index) {
    if (row.list.length >= 1) {
      return (
        <View style={styles.imageRack}>
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

          {this.renderImageList(row && row.list, index)}
        </View>
      );
    }
  }

  renderImageList(data, index) {
    if (this.state.expandedItems.includes(index)) {
      return (
        <FlatList
          style={{
            marginTop: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          initialNumToRender={50}
          key={this.props.orientation}
          onEndReached={this.onEndReached.bind(this)}
          renderItem={({item, index}) => this.renderRow(item, index)}
          keyExtractor={(item, index) => index.toString()}
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
          <ActivityIndicator size="large" color={Colors.primaryAccent} />
        )}
        <ScrollView
          nestedScrollEnabled={true}
          initialNumToRender={1000}
          automaticallyAdjustContentInsets={false}
          style={styles.scroll_item}>
          {this.state.imageResponse.map((item, index) => {
            return this.getRenderImageRack(item, index);
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
  selectedImage: {
    position: 'absolute',
    top: 2,
    right: 4,
    borderRadius: 20,
    backgroundColor: Colors.primaryAccent,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
  },
  fastImage: {
    width: '100%',
    height: '100%',
  },
  scroll_item: {
    backgroundColor: 'black',
    flex: 1,
    marginBottom: 200,
  },
  imageRack: {
    flexDirection: 'column',
    marginLeft: 4,
    marginRight: 4,
  },
  selectItem: {
    color: 'white',
    fontSize: 10,
  },
});
