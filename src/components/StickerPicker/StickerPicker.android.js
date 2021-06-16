import React, {Component} from 'react';
import Modal from 'react-native-modal';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {Colors, Images} from '../../res';
import Swiper from './pages';
import FastImage from '@stevenmasini/react-native-fast-image';
import {createImageProgress} from 'react-native-image-progress';
import {Loader} from '../../components/ViewComponents/Loader';

import {connect} from 'react-redux';
import {
  getStickerCategories,
  getStickerList,
  getGiphySearchList,
} from '../../actions/StickerListAction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_HEIGHT = 30;

const FImage = createImageProgress(FastImage);
const pageLimit = 30;

const gif = {
  id: 0,
  name: 'Gif',
};

const data = [
  {
    id: 0,
    url: Images.sticker_icon,
    sticker_id: 1,
  },
  {
    id: 1,
    url: Images.text_sticker,
    sticker_id: 3,
  },
  {
    id: 2,
    url: Images.gif_sticker,
    sticker_id: 3,
  },
  {
    id: 3,
    url: Images.emoji_sticker,
    sticker_id: 2,
  },
  {
    id: 4,
    url: Images.shapes_sticker,
    sticker_id: 7,
  },
  {
    id: 5,
    url: Images.university_sticker,
    sticker_id: 8,
  },
  {
    id: 6,
    url: Images.effect_sticker,
    sticker_id: 9,
  },
];

class StickerPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      swiperActiveIndex: 6,
      categoryList: [],
      stickerList: {},
      selectedCategoryId: 0,
      giphySearchText: '',
      giphyList: [],
      URL_BASE: '',
      AUTH_TOKEN: '',
      stickerTotalCount: 0,
      isProcessing: false,
      selectedTab: 0,
      load: false,
      gifData: [],
    };

    this.stickerPageStart = 0;
    this.stickerPageEnd = 0;
    this.stickerPageIndex = 0;
  }

  componentDidMount() {
    AsyncStorage.getItem(`BASE_URL`).then((value) => {
      AsyncStorage.getItem(`AUTH_TOKEN`).then((auth_val) => {
        if (value !== null && auth_val !== null) {
          this.setState(
            {
              isProcessing: true,
              URL_BASE: value,
              AUTH_TOKEN: auth_val,
            },
            () => {
              this.props.getStickerCategories(
                this.state.URL_BASE,
                this.state.AUTH_TOKEN,
              );
            },
          );
        }
      });
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.stickerCategoriesSuccess.length !== 0 &&
      nextProps.stickerCategoriesSuccess.result.stickerCategories.length !== 0
    ) {
      const stickerResult = nextProps.stickerCategoriesSuccess.result;
      const selectCategory = stickerResult.stickerCategories[0].id;

      this.setState(
        {
          isProcessing: true,
          categoryList: stickerResult.stickerCategories,
          selectedCategoryId: selectCategory,
        },
        () => {
          if (this.state.categoryList.indexOf(gif) === -1) {
            this.state.categoryList.push(gif);
          }
          //fetch first item
          this.stickerPageEnd += pageLimit;
          this.getStickerListFromApi(
            selectCategory,
            this.stickerPageStart,
            this.stickerPageEnd,
          );
          this.setState({swiperActiveIndex: 0});
        },
      );
    }

    if (
      nextProps.stickerListSuccess.length !== 0 &&
      nextProps.stickerListSuccess.result.rows.length > 0
      // nextProps.stickerListSuccess !== this.props.stickerListSuccess
    ) {
      var existingStickerList = this.state.stickerList;
      existingStickerList[
        nextProps.stickerListSuccess.result.sticker_category.name
      ] = nextProps.stickerListSuccess.result.rows;

      this.setState({
        stickerList: existingStickerList,
        load: false,
        isProcessing: false,
      });
    }
  }

  //get sticker list
  getStickerListFromApi(category, start, end, query = '') {
    this.props.getStickerList(this.state.URL_BASE, category, null, end, query);
  }

  onLeftArrowClicked() {
    if (this.state.giphySearchText !== '') {
      this.setState({giphySearchText: ''});
    } else if (this.state.swiperActiveIndex !== 0) {
      var index = this.state.swiperActiveIndex - 1;
      this.swiperPager.goToPage(index);
    }
  }

  onDownArrowClicked() {
    this.setState({
      swiperActiveIndex: 0,
      selectedTab: 0,
      gifData: [],
      giphyList: [],
      giphySearchText: '',
    });
    this.props.onClosePressed();
  }

  onRightArrowClicked() {
    if (this.state.giphySearchText !== '') {
      this.setState({giphySearchText: ''});
    } else if (
      this.state.swiperActiveIndex !==
      this.state.categoryList.length - 1
    ) {
      this.swiperPager.goToPage(this.state.swiperActiveIndex + 1);
    }
  }

  onStickerPicked(sticker) {
    this.onDownArrowClicked();
    this.setState({swiperActiveIndex: 0, isProcessing: true}, () => {
      this.props.onStickerSelected(sticker);
    });
    this.setState({isProcessing: false});
  }

  onGifStickerPicked(item) {
    this.onDownArrowClicked();
    this.setState(
      {
        isProcessing: true,
        swiperActiveIndex: 0,
        giphySearchText: '',
      },
      () => {
        this.props.onGifSelected(item.images.downsized.url);
      },
    );
    this.setState({isProcessing: false});
  }

  onEndReached() {
    this.setState({load: true}, () => {
      var startPage = pageLimit;
      var endPage = pageLimit;
      this.stickerPageIndex = this.stickerPageIndex + startPage;
      this.getStickerListFromApi(
        this.state.selectedCategoryId,
        this.stickerPageIndex,
        endPage,
      );
    });
  }

  renderStickerItem(item) {
    return (
      <TouchableOpacity
        onPress={() =>
          item &&
          item.images &&
          item.images.preview_gif &&
          item.images.preview_gif.url !== ''
            ? this.onGifStickerPicked(item)
            : this.onStickerPicked(item)
        }>
        <FImage
          style={styles.imageSize}
          source={{
            uri:
              item &&
              item.images &&
              item.images.preview_gif &&
              item.images.preview_gif.url !== ''
                ? item.images.preview_gif.url
                : item.image_url,
            priority: FastImage.priority.high,
          }}
          indicator={<ActivityIndicator />}
          indicatorProps={{
            size: 50,
            borderWidth: 0,
            color: 'white',
            unfilledColor: 'rgba(60,14,101, 0.2)',
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    );
  }

  renderGiphyStickerItem(item) {
    return (
      <TouchableOpacity onPress={() => this.onGifStickerPicked(item)}>
        <FImage
          style={styles.imageSize}
          source={{
            uri: item.images.preview_gif.url,
            priority: FastImage.priority.high,
          }}
          indicator={<ActivityIndicator />}
          indicatorProps={{
            size: 100,
            borderWidth: 0,
            // color: 'white',
            unfilledColor: 'rgba(60,14,101, 0.2)',
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    );
  }

  gifSearch(text) {
    getGiphySearchList(
      text,
      this.stickerPageEnd,
      this.stickerPageStart,
      () => {},
      (resp) => {
        if (resp.status === 200) {
          this.setState({
            gifData: resp.data.data,
            isProcessing: false,
          });
        }
      },
    );
  }

  onPageChange(index) {
    console.log('Getting API', index);
    if (index === 2) {
      data.forEach((element) => {
        if (element.id === index) {
          this.setState({
            swiperActiveIndex: element.id,
            selectedTab: element.id,
            isProcessing: true,
          });
          this.gifSearch('Trending');
        }
      });
    } else {
      data.forEach((element) => {
        if (element.id === index) {
          let categoryItem = this.state.categoryList.find(function (item) {
            return item.id === element.sticker_id;
          });
          this.setState({
            gifData: [],
            swiperActiveIndex: element.id,
            selectedTab: element.id,
            isProcessing: true,
          });
          this.getStickerListFromApi(
            categoryItem ? categoryItem.id : -1,
            this.stickerPageStart,
            this.stickerPageEnd,
          );
        }
      });
    }
  }

  /**
   * render slider pages
   * @param {*} data
   * @param {*} index
   */
  renderSwiper(datas, index) {
    let stickersArray;
    if (index === this.state.swiperActiveIndex) {
      data.forEach((element) => {
        if (index !== 2) {
          if (element.id === index) {
            let categoryItem = this.state.categoryList.find(function (item) {
              return item.id === element.sticker_id;
            });
            var exactData = categoryItem ? categoryItem.name : '';
            stickersArray = this.state.stickerList[exactData];
          }
        }
      });
      return (
        <View style={styles.list_item}>
          <FlatList
            nestedScrollEnabled={true}
            horizontal={false}
            data={
              this.state.gifData.length > 0 ? this.state.gifData : stickersArray
            }
            numColumns={this.props.orientationCheck === 'landscape' ? 8 : 3}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            onEndReached={() => this.onEndReached()}
            ListFooterComponent={this._renderFooter()}
            initialNumToRender={10}
            renderItem={({item}) => this.renderStickerItem(item)}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      );
    }

    return <View />;
  }

  searchGiphy(text) {
    this.setState(
      {
        giphySearchText: text,
        isProcessing: true,
        swiperActiveIndex: 3,
        selectedTab: 2,
      },
      () => {
        if (this.state.giphySearchText !== '') {
          getGiphySearchList(
            text,
            this.stickerPageEnd,
            this.stickerPageStart,
            () => {},
            (resp) => {
              if (resp.status === 200) {
                this.setState({giphyList: resp.data.data, isProcessing: false});
              }
            },
          );
        }
      },
    );
  }

  tapIcon(item) {
    if (this.state.giphyList.length > 0) {
      this.setState({giphyList: [], giphySearchText: ''});
      Keyboard.dismiss();
    }
    this.setState(
      {
        selectedTab: item.id,
        isProcessing: true,
      },
      () => {
        let categoryItem = this.state.categoryList.find(function (categery) {
          return categery.id === item.sticker_id;
        });
        if (categoryItem) {
          this.setState({swiperActiveIndex: item.id});
          this.getStickerListFromApi(
            categoryItem.id,
            this.stickerPageStart,
            this.stickerPageEnd,
          );
        } else {
          this.setState(
            {
              selectedTab: item.id,
              isProcessing: false,
              stickerList: {},
            },
            () => {
              alert('Item not found');
            },
          );
        }
      },
    );
  }

  //PAGINATION METHODS
  _renderFooter = () => {
    if (this.state.load) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color={Colors.primaryAccent} />
        </View>
      );
    } else {
      return null;
    }
  };

  renderIcons = (item) => {
    return (
      <TouchableOpacity
        style={[
          styles.tapIcon,
          {
            borderBottomWidth: this.state.selectedTab == item.id ? 4 : 0,
            borderColor:
              this.state.selectedTab == item.id
                ? Colors.primaryAccent
                : 'transparent',
          },
        ]}
        onPress={() => this.tapIcon(item)}>
        <Image style={styles.searchIcon} source={item.url} />
        {/* <FImage
          style={styles.iconSize}
          source={{
            uri: item.url,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.contain}
        /> */}
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <Modal
        animationType="slide"
        style={styles.container}
        onRequestClose={() => {
          this.onDownArrowClicked();
        }}
        visible={this.props.visibility}>
        {/* SEARCH INPUT CONTAINER */}
        <View style={styles.down_arrow_view}>
          {/* Invalid authorization */}
          {this.props.visibility &&
            this.props.stickerCategoriesFailure.status === 401 &&
            ToastAndroid.show(
              this.props.stickerCategoriesFailure.data.error.msg,
              ToastAndroid.SHORT,
            )}
          <KeyboardAvoidingView style={styles.searchContainer}>
            <Image style={styles.searchIcon} source={Images.searchIcon} />
            <TextInput
              placeholder="Search giphy stickers"
              placeholderTextColor={'white'}
              style={styles.searchInput}
              value={this.state.giphySearchText}
              onChangeText={(text) => this.searchGiphy(text)}
            />
          </KeyboardAvoidingView>
        </View>

        <View style={styles.tapIcons}>
          <FlatList
            nestedScrollEnabled={true}
            horizontal={true}
            data={data}
            // data={this.state.categoryList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => this.renderIcons(item)}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {/* ARROW BUTTON CONTAINER */}
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => this.onLeftArrowClicked()}>
            <Image source={Images.leftArrow} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onDownArrowClicked()}>
            <Image source={Images.downArrow} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onRightArrowClicked()}>
            <Image source={Images.rightArrow} />
          </TouchableOpacity>
        </View>

        {/* SWIPER WITH ICONS LIST CONTAINER */}
        {this.state.giphySearchText === '' && (
          <Swiper
            ref={(ref) => {
              this.swiperPager = ref;
            }}
            style={styles.swiperContainer}
            index={this.state.swiperActiveIndex}
            stickerPageIndex={1}
            onPageChange={(index) => {
              this.onPageChange(index);
            }}>
            {this.state.categoryList.map((item, index) => {
              return this.renderSwiper(item, index);
            })}
          </Swiper>
        )}

        {/* RENDER GIPHY */}
        {this.state.giphySearchText !== '' && (
          <View style={styles.searchList}>
            <FlatList
              nestedScrollEnabled={true}
              horizontal={false}
              data={this.state.giphyList}
              initialNumToRender={10}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({item}) => this.renderGiphyStickerItem(item)}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
        <Loader visibility={this.state.isProcessing} />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    backgroundColor: Colors.stickerPickerBackground,
    margin: 0,
  },
  searchContainer: {
    margin: 10,
    paddingLeft: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    alignSelf: 'center',
    height: 40,
    width: '70%',
  },
  searchList: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  searchIcon: {
    // margin: 2,
    resizeMode: 'contain',
    height: 30,
    width: 30,
    alignSelf: 'center',
  },
  tapIcons: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapIcon: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    width: '100%',
    color: 'white',
  },
  arrowContainer: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  swiperContainer: {
    flex: 1,
    alignSelf: 'center',
  },
  down_arrow_button: {
    paddingLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  down_arrow_view: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerFlatList: {
    width: '100%',
    marginBottom: 25,
  },
  closeIcon: {height: 25, width: 25},
  list_item: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  flatListContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    margin: 12,
  },
  imageSize: {
    width: 100,
    height: 80,
    margin: 3,
  },
  iconSize: {
    width: 30,
    height: 30,
    margin: 3,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  const {
    stickerCategoriesSuccess,
    stickerCategoriesFailure,
    stickerListSuccess,
    stickerListFailure,
  } = state.StickerListReducer;
  const {orientationCheck} = state.CameraPreviewReducer;

  return {
    stickerCategoriesSuccess,
    stickerCategoriesFailure,
    stickerListSuccess,
    stickerListFailure,
    orientationCheck,
  };
};

export default connect(mapStateToProps, {
  getStickerCategories,
  getStickerList,
})(StickerPicker);
