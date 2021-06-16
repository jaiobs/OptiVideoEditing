import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  BackHandler,
  Dimensions,
} from 'react-native';
import { Images } from '../../res';
import { onPictureTaken, orientation } from '../../actions/cameraPreviewAction';
import { connect } from 'react-redux';
import BouncyView from '../../components/widgets/BouncyView/BouncyView';
import { ImageCropperView } from '../../libs/litpic_sdk';
import FilterTypes from '../../libs/livefilter/FilterTypes';
import TouchableFilterChanger from '../../components/ViewComponents/TouchableFilterChanger/TouchableFilterChanger';
import FilterValueAdjuster from '../../components/ViewComponents/FilterValueAdjuster/FilterValueAdjuster';
import MainView from '../../components/MainContainer';
import {Loader} from '../../components/ViewComponents/Loader';

class PhotoPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoPath: props.navigation.getParam('imagePath', null),
      imageDetails: props.navigation.getParam('imageDetails', null),
      imageHeight: Dimensions.get('window').height,
      imageWidth: Dimensions.get('window').width,
      finalPreview: props.navigation.getParam('finalPreview', false),
      currentFilter: 1,
      filter: FilterTypes.Normal,
      filterRange: 0,
      filterConfig: {},
      reset_filter: false,
      interval: 0,
      isImageProcessing: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  onClosePressed() {
    this.props.navigation.navigate('CameraPreview');
  }

  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.onClosePressed();
    return true;
  }

  onNextClicked() {
    this.showOrHideLoader(true);
    this.PhotoPreview.onNextClicked();
  }

  onNext(event) {
    this.showOrHideLoader(false);
    this.props.navigation.navigate('PhotoEditorView', {
      imagePath: event.imagePath,
      imageDetails: event.imageDetails,
      imageHeight: event.imageHeight,
      imageWidth: event.imageWidth,
      finalPreview: false,
    });
  }

  showOrHideLoader(showLoader) {
    this.setState({ isImageProcessing: showLoader });
  }

  changeFilterValues(filterValues) {
    const { currentFilter, filter, filterConfig } = filterValues;
    this.setState({ currentFilter, filter, filterConfig });
    this.changeFilter(filter);
  }

  changeFilter(filterVal) {
    this.PhotoPreview.changeFilter(filterVal);
    this.setState({ filter: filterVal });
  }

  resetFilter() {
    this.setState({
      currentFilter: 1,
      filter: FilterTypes.Normal,
      filterConfig: {},
      reset_filter: true,
    });
  }
  clearFilter = (item) => {
    this.setState({ reset_filter: item });
  };

  render() {
    return (
      <View style={styles.container}>
        <MainView />
        {this.state.photoPath != null && (
          <ImageCropperView
            ref={(ref) => (this.PhotoPreview = ref)}
            style={styles.imagePreview}
            imageDetails={this.state.imageDetails}
            imagePath={this.state.photoPath}
            onNext={(event) => { this.onNext(event); }}
            showOrHideLoader={(showLoader) => this.showOrHideLoader(showLoader)}
          />
        )}

        <View
          style={[
            styles.filter_view,
            {
              marginTop: this.props.orientationCheck === 'portrait' ? 40 : 15,
            },
          ]}>
          <Text style={styles.filter_text}>tap screen for filters</Text>
          <Text style={styles.filter_name}>{this.state.filter.name}</Text>
        </View>

        <FilterValueAdjuster
          orientation={this.props.orientationCheck}
          isShowSlider={this.state.isShowSlider}
          filter={this.state.filter}
          onClosePressed={() => this.setState({ isShowSlider: false })}
          updateFilterValues={(filterVal) => {
            this.changeFilter(filterVal);
          }}
        />
        <View style={{ backgroundColor: "transparent", position: 'absolute', width: "100%", height: "100%" }}>
          <TouchableFilterChanger
            orientation={'portrait'}
            reset_filter={this.state.reset_filter}
            interval={this.state.interval}
            clearFilter={(item) => this.clearFilter(item)}
            onFilterValuesChanged={(filterValues) =>
              this.changeFilterValues(filterValues)
            }
          />
        </View>

        <TouchableOpacity
          style={styles.closeBtnContainer}
          onPress={() => this.onClosePressed()}>
          <Image style={styles.close_icon} source={Images.close_icon} />
        </TouchableOpacity>

        <View style={styles.actionContainerBottom}>
          <BouncyView
            onPress={() => {
              this.onNextClicked();
            }}>
            <Image style={styles.imageIcon} source={Images.next_video_icon} />
          </BouncyView>
        </View>
        <Loader visibility={this.state.isImageProcessing} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imagePreview: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  closeBtnContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 10,
  },
  filter_name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 10,
  },
  filter_view: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  filter_text: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 10,
  },
  close_icon: {
    height: 24,
    width: 24,
  },
  actionContainerLeft: { position: 'absolute', right: 0, top: 14 },
  actionContainerBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  imageIcon: { height: 32, width: 32, margin: 10 },
});

const mapStateToProps = (state) => {
  const {
    orientationCheck,
  } = state.CameraPreviewReducer;
  return {
    orientationCheck,
  };
};

export default connect(mapStateToProps, {
  orientation,
  onPictureTaken,
})(PhotoPreview);
