/**
 *  component for video trimming thumbnail preview
 *  written by vigneshwaran.n@optisolbusiness.com
 */

import React, { Component } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  getThumbnailImagesFromVideo,
  addThumbnailListener
} from "../../libs/ffmpeg/";

import { Colors } from "../../res/";
import SeekBarVideo from "./SeekBarVideo";

export default class VideoTrimmerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLineImages: [],
      startPositionX: 0,
      endPositionX: 0,
      scrollViewVisibleWidth: 0,
      scrollViewActualWidth: 0,
      scrollViewFullWidth: 0,
      eachFrameValue: 0
    };
  }

  async componentDidMount() {
    /**
     * binding emitter for ffmpeg  response
     */
    this.setState({ timeLineImages: [] });
    addThumbnailListener(resp => {
      if (resp.videopath) {
        var joined = [];
        for (var i = 0; i < resp.videopath.length; i++) {
          var imageName = { img: resp.videopath[i] };
          joined.push(imageName);
        }

        this.setState({ timeLineImages: joined });
      }
    });

    setTimeout(() => {
      this.getTimelineImage();
    }, 500);
  }

  async getTimelineImage() {
    //Get images from the video as per the time
    getThumbnailImagesFromVideo(this.props.videoPath);
  }


 

  find_dimensions(layout) {
    const { x, width } = layout;
    this.setState({ startPositionX: x, endPositionX: width });
  }

  findScrollViewDimensions(layout) {
    const { width } = layout;
    if (width > 0) {
    
      this.setState({ scrollViewVisibleWidth: width });
    }
  }

  updateScrollViewDimensions(width) {
    var actualWidth = width - this.state.scrollViewVisibleWidth;
  
    this.setState({
      scrollViewActualWidth: actualWidth,
      scrollViewFullWidth: width,
      eachFrameValue: this.props.playableDuration / width
    });
  }

  render() {
    return (
      <View
        style={styles.container}
        onLayout={event => {
          this.find_dimensions(event.nativeEvent.layout);
        }}
      >
        <View
          style={{
            flex: 1
          }}
        >
          <ScrollView
            ref={ref => (this.scrollView = ref)}
            style={{
              flex: 1
            }}
            horizontal={true}
            onScroll={this.handleScroll}
            onContentSizeChange={(width, height) => {
              this.updateScrollViewDimensions(width);
            }}
            onLayout={event => {
              this.findScrollViewDimensions(event.nativeEvent.layout);
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row"
              }}
            >
              {this.state.timeLineImages &&
                this.state.timeLineImages.length > 1 &&
                this.state.timeLineImages.map(item => {
                  return (
                    <Image
                      source={{ uri: item.img, cache: "reload" }}
                      style={{
                        width: 30,
                        height: 75,
                        borderColor: Colors.primaryAccent,
                        resizeMode: "stretch"
                      }}
                    />
                  );
                })}
            </View>
          </ScrollView>

          <SeekBarVideo
            currentVideoPosition={this.props.currentVideoPosition}
            onSeekBarTouched={() => this.props.onSeekBarTouched()}
            onSeekBarReleased={() => this.props.onSeekBarReleased()}
            startPositionX={this.state.startPositionX}
            endPositionX={this.state.endPositionX}
            eachFrameValue={this.state.eachFrameValue}
            scrollViewActualWidth={this.state.scrollViewActualWidth}
            scrollViewFullWidth={this.state.scrollViewFullWidth}
            videoDuration={this.props.playableDuration}
            scrollViewVisibleWidth={this.state.scrollViewVisibleWidth}
            onMoveScrollView={positionX => {
              this.scrollView.scrollTo({ x: positionX, y: 0, animated: true });
            }}
            onStartRangeAdjusted={(timeVal)=>this.props.onStartRangeAdjusted(timeVal)}
            onStopRangeAdjusted={(timeVal)=>this.props.onStopRangeAdjusted(timeVal)}
          />
          
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "85%",
    height: 75,
    flexDirection: "row",
    alignSelf: "center",
    borderWidth: 0.5,
    borderColor: Colors.primaryAccent
  }
});
