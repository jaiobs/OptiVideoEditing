import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors, Images, Strings } from "../../res";
import {getGiphySearchList, getGiphyTrendingList, getStickerCategories, getStickerList} from "../../actions/StickerListAction";

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from '@stevenmasini/react-native-fast-image';
import Loader from '../ViewComponents/Loader/Loader';
import MaterialTabs from '../MaterialTabs';
import Modal from "react-native-modal";
import React from "react";
import Swiper from "./pages";
import { connect } from 'react-redux';
import { createImageProgress } from 'react-native-image-progress';

const FImage = createImageProgress(FastImage);

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp(percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;

let searchDataArray = [
  {
    title:"Giphy",
    data:[]
  },
  {
    title:"Stickers",
    data:[]
  },
]

class StickerPicker extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
       categoryList:[],
       URL_BASE:"",
       AUTH_TOKEN:"",
       stickerList:[],
       checkAlreadySaved: null,
       visibility:props.visibility,
       hitStickerCategory: false,
       hitStickerList: false,
       selectedCategoryId:0,
       slider1ActiveSlide:0,
       giphies:[],
       apiLoading:false,
       giphySearchText:"",
       keyboardOpen: false,
       isbackClickedFromGiphy: true,
       stickerTotalCount:0,
       giphyTotalCount:0,
       isDownload:false,
       load:false,
       gifLoad:false,
       refreshStickers:false,
       refreshGiphies:false,
       selectedSticker:null,
       giphiesSearch:[],
       stickerSearch:[],
       selectedTab:0,
       limit: 30
      };
      this.stickerPageIndex = 0
      this.giphyPageIndex = 0
      this.onEndReachedCalledDuringMomentum = true
      this.onEndReachedCalledDuringMomentumGif = true
    }
  
    componentDidMount() {
      console.disableYellowBox = true;
      AsyncStorage.getItem(`BASE_URL`).then((value) => {
        AsyncStorage.getItem(`AUTH_TOKEN`).then((auth_val) => {
          if (value !== null && auth_val !== null) {
            this.setState({
              URL_BASE: value,
              AUTH_TOKEN: auth_val
            })
          }
          })
        })
        this.giphyLoad()

    }

    componentWillMount() {
      this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
      this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }

    componentWillUnmount() {
      this.keyboardWillShowSub.remove();
      this.keyboardWillHideSub.remove();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if(nextProps.stickerCategoriesSuccess.length != 0 && this.state.hitStickerCategory){
        if(nextProps.stickerCategoriesSuccess.result.stickerCategories.length != 0){
          let stickerList = nextProps.stickerCategoriesSuccess.result.stickerCategories
          let categArr = []
           stickerList.forEach((element) =>{ 
            if(element.status == 1){
              categArr.push(element)
            }
           });
 
          this.setState({
            categoryList:categArr,
            selectedCategoryId:categArr[0].id,
            hitStickerCategory:false,
            slider1ActiveSlide: 0,
            hitStickerList:true
          },()=>{
            this.orderCategories()
          })
        }
      }
      if(nextProps.stickerListSuccess.length != 0 && this.state.hitStickerList){
        this.setState({ hitStickerList:false,
          apiLoading:false})
        if(nextProps.stickerListSuccess.result.rows.length != 0 && this.state.giphySearchText.trim() == ""){
          let arrayData = nextProps.stickerListSuccess.result.rows
          if(this.state.isDownload){
            this.saveStickersToAsyncStorage(this.state.selectedCategoryId, nextProps.stickerListSuccess.result);
          }else{
            if(this.state.stickerList.length == 0 && this.stickerPageIndex == 0){
              this.setState({
                stickerTotalCount:nextProps.stickerListSuccess.result.count,
                stickerList:arrayData, 
                load:false
              })
            }else if (this.state.stickerList.length != 0 && this.stickerPageIndex > 0){
              var joined = this.state.stickerList.concat(nextProps.stickerListSuccess.result.rows);
              this.setState({
                stickerTotalCount:nextProps.stickerListSuccess.result.count,
                stickerList:joined, 
                load:false
                
              })
            }
          }
        }else if(nextProps.stickerListSuccess.result.rows && this.state.giphySearchText.trim() != ""){
          let arrayData = nextProps.stickerListSuccess.result.rows
          this.setState({
            stickerList:[]
          },()=>{
            this.setState({
              stickerTotalCount:nextProps.stickerListSuccess.result.count,
              stickerList:arrayData, 
              load:false
    
            })
          })
          
        }
      }
    }

    //Keyboard listener function calls
  keyboardWillShow = (e) => {
    this.setState({
      keyboardOpen: true,
    })
  };

  keyboardWillHide = (e) => {
    setTimeout(()=> {
      this.setState({
        keyboardOpen: false,
      })
    })
  };

  // Giphy Api's
  giphyLoad = () => {
      getGiphyTrendingList(this.state.limit,this.giphyPageIndex,()=>{
        this.setState({
          apiLoading: this.giphyPageIndex == 0 ? true : false,
        })
        
      },(resp)=>{
        if(resp.status == 200){
          let pushData = []
          let arraydata = resp.data.data
          this.setState({
            giphyTotalCount:resp.data.pagination.total_count
          })
          if (this.state.giphies.length == 0 && this.giphyPageIndex == 0) {

          arraydata.forEach((element) =>{ 
              pushData.push(element.images.preview_gif)
          });
          
            searchDataArray[0].data = pushData
            this.setState({
              giphies: pushData,
              apiLoading:false,
              load:false
            },()=>{
                      this.setState({
                        hitStickerCategory:true,
                        apiLoading:true
                      },()=>{
                        this.props.getStickerCategories(this.state.URL_BASE,this.state.AUTH_TOKEN)
                      })
            })
          } else if (this.state.giphies.length > 0 && this.giphyPageIndex > 0) {
           
          arraydata.forEach((element) => {
              pushData.push(element.images.preview_gif)
          });
          
          var joinedGif = this.state.giphies.concat(pushData)
          searchDataArray[0].data = pushData
          this.setState({
            giphies: joinedGif,
            apiLoading:false,
            load:false
            
          })
        }
      }
      })
    }
    giphySearchLoad = () => {
      const { giphySearchText } = this.state;
      const searchText = this.state.giphySearchText == "" ? "Trending" : giphySearchText;

      getGiphySearchList(searchText.trim(),this.state.limit,this.giphyPageIndex,undefined, (resp)=>{
        if(resp.status == 200){
            let arraydata = resp.data.data
            this.setState({
              giphyTotalCount:resp.data.pagination.total_count,
              isbackClickedFromGiphy:false
            })
            
          if(this.giphyPageIndex == 0){
              let firstData = []
           arraydata.forEach((element) => {
              firstData.push(element.images.preview_gif)
           });
              this.setState({
                giphiesSearch:firstData
              })
             
              this.setState({
                apiLoading:false,
                load:false
                
              })
              
          } else if(this.state.giphiesSearch.length > 0 && this.giphyPageIndex > 0){
            let pushData = []
          
            arraydata.forEach((element) => {
              pushData.push(element.images.preview_gif)
            });
             
           
            var joinedGif = this.state.giphiesSearch.concat(pushData)

            this.setState({
              giphiesSearch: joinedGif,
              apiLoading:false,
              load:false
        
            })
          }
        }
        })
        this.setState({
          hitStickerList:true,
        },()=>{
          this.props.getStickerList(this.state.URL_BASE,this.state.selectedCategoryId,this.stickerPageIndex,this.state.limit,this.state.giphySearchText)
        })
   
    }

    //CATEGORIES ORDERING 
    orderCategories = () => {
      var orderArr = new Array()

      this.state.categoryList.forEach((element) => {
  
            if (element.name == "Basic") {
              orderArr.splice(0, 0, element)
            } else if (element.name == "Text") {
              orderArr.splice(1, 0, element)
            } else if (element.name == "Emojis") {
              orderArr.splice(3, 0, element)
            } else if (element.name == "Shapes") {
              orderArr.splice(4, 0, element)
            } else if (element.name == "Schools") {
              orderArr.splice(5, 0, element)
            } else if (element.name == "Effects") {
              orderArr.splice(6, 0, element)
            }
     
       });
      let dict = {
        "id": 999,
        "name": Strings.STICKER_CATEGORY_GIF,
        "image_url": "",
        "is_default": true,
        "status": 1,
        "is_availability": 1,
      }
      orderArr.splice(2,0,dict)
      this.setState({categoryList:orderArr},()=>{
        if(this.state.categoryList[0].id != 999){
          this.props.getStickerList(this.state.URL_BASE,this.state.categoryList[0].id,this.stickerPageIndex,this.state.limit,"")
        }
      })
    }


    //PAGINATION
    onEndReached = () => {
        if ((this.state.stickerList.length < this.state.stickerTotalCount) && (this.state.stickerList.length != this.state.stickerTotalCount) && (this.state.stickerTotalCount != 0) && (this.state.stickerList.length != 0) && this.state.load == false) {
          this.stickerPageIndex = this.stickerPageIndex + this.state.limit
          this.setState({
            load: true,
            hitStickerList:true
          },()=>{
            this.props.getStickerList(this.state.URL_BASE,this.state.selectedCategoryId,this.stickerPageIndex,this.state.limit,"")
          })
          this.onEndReachedCalledDuringMomentum = true;
        }
      }

      _onReset = () => {
        this.stickerPageIndex = 0;
        this.setState({
          load: false,
          apiLoading:true,
          stickerList:[],
          refreshStickers:false,
          hitStickerList:true
        },()=>{
          this.props.getStickerList(this.state.URL_BASE,this.state.selectedCategoryId,this.stickerPageIndex,this.state.limit,"")
        }) 
      }

      onEndReachedGif = () => {
        if ((this.state.giphies.length < this.state.giphyTotalCount) && (this.state.giphies.length != this.state.giphyTotalCount) && (this.state.giphyTotalCount != 0) && (this.state.giphies.length != 0) && (this.giphyPageIndex >= 0) && this.state.load == false) {
          this.giphyPageIndex = this.state.giphies.length + this.state.limit
          this.setState({
            load: true,
          },()=>{
            this.state.giphySearchText.trim() != "" ? this.giphySearchLoad() : this.giphyLoad()
          })
          this.onEndReachedCalledDuringMomentumGif = true;
        }
      }

      onEndReachedSearchGif = () => {
        if ((this.state.giphiesSearch.length < this.state.giphyTotalCount) && (this.state.giphiesSearch.length != this.state.giphyTotalCount) && (this.state.giphyTotalCount != 0) && (this.state.giphiesSearch.length != 0) && (this.giphyPageIndex >= 0) && this.state.load == false) {
          this.giphyPageIndex = this.state.giphiesSearch.length + this.state.limit
          this.setState({
            load: true,
          },()=>{
            this.state.giphySearchText.trim() != "" ? this.giphySearchLoad() : this.giphyLoad()
          })
          this.onEndReachedCalledDuringMomentumGif = true;
        }
      }

      _onResetGif = () => {
        this.giphyPageIndex = 0;
        this.setState({
          load: false,
          apiLoading:true,
          giphies:[],
          giphySearchText:"",
          isbackClickedFromGiphy:false,
          refreshGiphies:false,
        },()=>{
          this.giphyLoad()
        }) 
      }

    //RENDER Loader
    renderLoadingView = () => {
      return (
        <View style={{ position:"absolute",width:"100%",height:"100%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
            <ActivityIndicator style={{alignSelf:"center"}} size="large" color={Colors.primaryAccent}/>
        </View>
      );
    }

    //RENDER Sticker FlatList
    renderStickerList = ({item,index}) => {
      return(
        <TouchableOpacity onPress={()=>{this.setState({
          selectedSticker:item.image_url
        },()=>{this.props.onClosePressed(this.state.selectedSticker, false)})}}>
          <FastImage
            style={{  width:80, height: 80, margin:10, resizeMode:"contain" }}
            source={{
                uri: item.image_url,
                priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      );
    }

     //PAGINATION METHODS
     _renderFooter = () => {
      if (this.state.load) {
      return (
          <View style={{ justifyContent: "center", alignItems: "center", padding: 15,width:"100%" }}>
          <ActivityIndicator size="large" color={Colors.primaryAccent}/>
          </View>
      )
      } else {
         return null
      }
  }

  //RENDER GIF CATEGORIES
  renderGifCategory = (item,index) => {
    return(
        <FlatList 
              nestedScrollEnabled={true}
              horizontal={false}
              style={{margin:10,marginBottom:25}}
              contentContainerStyle={{flexDirection : "row", flexWrap: "wrap", alignSelf:"center", paddingBottom: 20, paddingLeft:15}} 
              data={this.state.giphies}
              onEndReachedThreshold={0.5}
              keyboardDismissMode={'on-drag'}
              onEndReached={()=> this.onEndReachedGif()}
              onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentumGif = false; }}
              onRefresh={() => { this.props.onClosePressed(null, true)}}
              ListFooterComponent={this._renderFooter()}
              refreshing={this.state.refreshGiphies}
              keyExtractor={(item1, index1) => index1.toString()}
              renderItem={this.renderTrendingGif}
          /> 
    )
  }

    //RENDER Sticker Categories
    
    renderStickerCategory = (item,index) => {
      const afterDownloadClickCondition = this.state.checkAlreadySaved == null && item.is_default == false && item.id == this.state.selectedCategoryId
      if(afterDownloadClickCondition){ //stores stickers in the storage and lists down...
        AsyncStorage.getItem(`stickerCategory/${item.id}`).then((value) => {
          if (value !== null) {
            let jsonValue =  JSON.parse(value)
            this.setState({
              stickerList: jsonValue.rows,
              checkAlreadySaved: JSON.parse(value)
            })
          }
        });
      }
      if(item.is_default){ // lists default stickers from admin panel
        return(
          <View style={{width:this.props.orientationValue == "portrait" ? "100%" : "85%",alignSelf:"center", marginTop:-20}}>
           {index != 2 ? <FlatList 
              nestedScrollEnabled={true}
              horizontal={false}
              style={{margin:15,marginBottom:5,alignSelf:"center"}}
              contentContainerStyle={{flexDirection : "row", flexWrap : "wrap",width: "90%",alignSelf:"center"}} 
              data={this.state.stickerList}
              onEndReachedThreshold={0.1}
              onEndReached={() => this.onEndReached()}
              onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
              onRefresh={() => { this.props.onClosePressed(null,false)}}
              keyboardDismissMode={"on-drag"}
              ListFooterComponent={this._renderFooter()}
              refreshing={this.state.refreshStickers}
              keyExtractor={(item1, index1) => index1.toString()}
              renderItem={this.renderStickerList}
            /> : this.renderGifCategory()}
           </View>
        );
      }else{ // Already downloaded  stickers lists
        const alreadySaved_conditionCheck = this.state.checkAlreadySaved != null && this.state.checkAlreadySaved.sticker_category != null && this.state.checkAlreadySaved.sticker_category.id == item.id
        if(alreadySaved_conditionCheck){
              return(
                <View style={{width:this.props.orientationValue == "portrait" ? "100%" : "85%",alignSelf:"center",marginTop:-15}}>
                <FlatList 
                  nestedScrollEnabled={true}
                  horizontal={false}
                  style={{margin:10,marginBottom:5}}
                  contentContainerStyle={{flexDirection : "row", flexWrap : "wrap",width:this.props.orientationValue == "portrait" ? "90%" : "75%",alignSelf:"center"}} 
                  data={this.state.stickerList}
                  keyExtractor={(item2, index2) => item2.id }
                  keyboardDismissMode={"on-drag"}
                  renderItem={this.renderStickerList}
                />
                </View>
              )
          }else{ // show the download button 
            return (
              <TouchableOpacity overflow="hidden" style={{height:50,padding:5,alignSelf:"center",alignItems:"center",justifyContent:"center"}} onPress={()=>{this.downloadStickers(item.id)}}>
                <FastImage
                  style={{  width:90, height: 90, margin:10 }}
                  source={{
                      uri: item.image_url,
                      priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <View style={{height:40, padding:5,width:110,backgroundColor:Colors.primaryAccent,borderRadius:25}}>
                   <Text overflow="hidden" style={{fontSize:18,fontWeight:"bold",color:"white",textAlign:"center", paddingTop:5}}> Download </Text>
                </View>
              </TouchableOpacity>
            )
          }
      }
    }

    //On Click of Arrows
    scrollPrevious() {
      if(this.state.slider1ActiveSlide != 0){
        if(this.state.selectedTab != 0){
          this.setState({
            selectedTab: this.state.selectedTab - 1
         
          })
        }
        if(this.pager != null){
          this.pager.goToPage(this.state.slider1ActiveSlide - 1)
        }
       
      }
    }

    scrollNext() {
      if(this.state.slider1ActiveSlide != (this.state.categoryList.length - 1)){
        if(this.state.selectedTab != 6){
          this.setState({
            selectedTab: this.state.selectedTab + 1
         
          })
        }
        if(this.pager != null){
          this.pager.goToPage(this.state.slider1ActiveSlide + 1)
        }
      
      }
    }

    //DOWNLOAD STICKERS AND MAINTAIN IN LOCAL STORAGE
    saveStickersToAsyncStorage = async (id, result) => {
      let stickers = result.rows
      try {
            if (stickers && stickers.length > 0) {
              const { categoryList } = this.state;
              let selectedCategory = null;

            categoryList.forEach((element) => {
             if (element.id == id) {
                      selectedCategory = element;
              }
             });

            }
            this.setState({
              isDownload: false
            })
          
      } catch (error) {
          console.log("Error ", error);
      }
    };

    downloadStickers = async (categoryId) => {
      this.setState({
        selectedCategoryId: categoryId
      })
      try {
            this.setState({ apiLoading: true, hitStickerList:true, isDownload:true },()=>{
              this.props.getStickerList(this.state.URL_BASE,categoryId,null,null,"")
            })
      } catch (error) {
          console.log("Error inside downloadStickers", error)
          this.setState({ isDownload: false, apiLoading: false });
      }
  };

 

  renderColumn = (items) => {
    if(items[0] != undefined){
      return (
        <View style={{flexDirection:"column"}}>
          {items.map((item, index) => {
            if(item.url != undefined){
              return ( 
              <TouchableOpacity  onPress={()=>{
              this.setState({
                selectedSticker: item.url,
                isbackClickedFromGiphy: true 
              },()=>{
                this.props.onClosePressed(this.state.selectedSticker,true,100,100)
                })
              }}>
              <FImage
                  style={{  width:80, height: 80, margin:10}}
                  source={{
                    uri: item.url,
                    priority: FastImage.priority.high,
                  }}
                indicatorProps={{
                  size: 100,
                  borderWidth: 0,
                  color: 'white',
                  unfilledColor: 'rgba(60,14,101, 0.2)',
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
              )}
            }
          )}
        </View>
      )
    }
  }

  renderTrendingGif = ({item,index}) => {
    return(
      <TouchableOpacity onPress={()=>{this.setState({
        selectedSticker: item.url 
      },()=>{this.props.onClosePressed(this.state.selectedSticker, true , item.width, item.height)})}}>
        <Image
            style={{  width:80, height: 80, margin:15,resizeMode:"contain"}}
            source={{
            uri: item.url,
          }}
        />
      </TouchableOpacity>
    );
    
  }

  //RENDER FLATLIST ITEM GIPHY PLUS STICKER
  renderGiphyItem = () => {
    return(
      <View style={{width: "100%",alignSelf:"center", flexDirection:"column"}}>
        <Text style={{fontWeight:"bold",fontSize:20,color:"white",margin:15}}>Giphies</Text>
         {this.state.giphiesSearch.length != 0 && <FlatList 
          nestedScrollEnabled={true}
          horizontal={true}
          style={{margin:10,marginBottom:25}}
          contentContainerStyle={{flexDirection : "row", flexWrap : "wrap",alignSelf:"center", paddingBottom: 20}} 
          data={this.state.giphiesSearch}
          removeClippedSubviews={true}
          initialNumToRender = {30}
          onEndReachedThreshold={0.5}
          keyboardDismissMode={'on-drag'}
          onEndReached={()=> this.onEndReachedSearchGif()}
          onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentumGif = false; }}
          onRefresh={() => { this.props.onClosePressed(null, true)}}
          ListFooterComponent={this._renderFooter()}
          refreshing={this.state.refreshGiphies}
          keyExtractor={(item, indexx) => item}
          renderItem={this.renderTrendingGif}
        /> }
        <Text style={{fontWeight:"bold",fontSize:20,color:"white",margin:15}}>Stickers</Text>
        {this.state.stickerList.length != 0 &&  <FlatList 
           nestedScrollEnabled={true}
           horizontal={false}
           style={{margin:10,marginBottom:25}}
           contentContainerStyle={{flexDirection : "row", flexWrap : "wrap",alignSelf:"center", paddingBottom: 20}} 
           data={this.state.stickerList}
           initialNumToRender = {30}
           keyExtractor={(item, indexx) => item}
           renderItem={this.renderStickerList}
           />  }     
       </View> 
    );
  }


  // RENDER GIPHY SEARCH WITH SECTIONLIST
  renderGiphySearch = () => {
    return(
      <ScrollView 
       keyboardDismissMode='on-drag'
       refreshControl={<RefreshControl
        refreshing={this.state.refreshGiphies}
        onRefresh={() => {
           this.props.onClosePressed(null, false)
        }}
        />}
      >
            {this.renderGiphyItem()}
      </ScrollView>
    )
  }

  //RENDER SWIPER
  renderSwipe = () => {
      return(
        this.state.categoryList.map((data,index) => {
          return (
            this.renderStickerCategory(data,index)
          )
        })
      )
  }

    //MAIN RENDER
    render(){
        return (
          <Modal 
            backdropColor={"transparent"} 
            style={{justifyContent: 'flex-end',margin: 0}} 
            isVisible={this.props.visibility} 
            onModalWillHide={() => {this.props.onModalWillHide(this.state.selectedSticker)}}
            // onBackdropPress={() => {} }
          >
            <SafeAreaView style={{flex:1}}>
           
          <KeyboardAvoidingView style={[styles.container]}>
            <View style={[styles.container]}>
            
                    <TouchableOpacity
                    style={[
                      styles.closeBtnContainer,
                      {
                        paddingLeft: 4,
                        zIndex: 999,
                      },
                    ]}
                    onPress={() => {
                      this.props.backPhotoEditor(this.state.visibility)
                    }}>
                    <Image
                      style={styles.close_icon}
                      source={Images.close_icon}
                    />
                  </TouchableOpacity>

                      
                  
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{flexDirection:"row", width:"100%", alignSelf:"center", justifyContent:"center", alignItems:"center"}}>
                {((this.state.keyboardOpen || this.state.isbackClickedFromGiphy == false) || this.state.giphySearchText.trim() != "") && 
                      <TouchableOpacity onPress={()=>{
                        setTimeout(() => {
                          Keyboard.dismiss()
                        }, 100);
                          this.setState({giphySearchText:"",isbackClickedFromGiphy:true,stickerList:[],hitStickerList:true},()=>{
                            this.props.getStickerList(this.state.URL_BASE,this.state.selectedCategoryId,this.stickerPageIndex,this.state.limit,"")
                          })
                        }}>
                          <Image style={[styles.searchIcon,{width:30,margin:3,height:30,resizeMode:"contain", alignSelf:"center"}]} source={Images.leftArrow}/>
                        </TouchableOpacity>
                      }


                
                  <View style={styles.searchView}>
                    <View style={[styles.searchIcon,{margin:0,justifyContent:"center",alignItems:"center"}]}>
                      <Image style={[styles.searchIcon,{margin:0,height:25,width:25,resizeMode:"contain"}]} source={Images.searchIcon}/>
                      </View>
                      <TextInput
                        style={[styles.textInputSearch,{width:"80%"}]}
                        placeholder="Search giphy stickers"
                        placeholderTextColor={"white"}
                        onFocus={()=>{
                          this.giphyPageIndex = 0
                          this.setState({giphySearchText:"",giphyTotalCount: 0,giphiesSearch:[], isbackClickedFromGiphy: false},()=>{this.giphySearchLoad()})}}
                        value={this.state.giphySearchText}
                        onChangeText={(text) => {
                          this.giphyPageIndex = 0
                          this.setState({giphySearchText:text,giphyTotalCount: 0,giphiesSearch:[], stickerList:[],hitStickerList:true},()=>{this.giphySearchLoad()})
                        }}
                        />
                  </View>
                </View>

                  
                  {(this.state.keyboardOpen == false && this.state.giphySearchText.trim() == "")  && this.state.isbackClickedFromGiphy == true &&
                  <View>
                    <View style={{width:"95%", alignSelf:"center", margin:10}}>
                    <MaterialTabs
                      items={[
                        <Image style={styles.tabIcon} source={Images.sticker_icon}/>, 
                        <Image style={styles.tabIcon} source={Images.text_sticker}/>, 
                        <Image style={styles.tabIcon} source={Images.gif_sticker}/>,
                        <Image style={styles.tabIcon} source={Images.emoji_sticker}/>, 
                        <Image style={styles.tabIcon} source={Images.shapes_sticker}/>,
                        <Image style={styles.tabIcon} source={Images.university_sticker}/>,
                        <Image style={styles.tabIcon} source={Images.effect_sticker}/>]}
                      content={<Image style={{backgroundColor:"transparent"}}/>}
                      selectedIndex={this.state.selectedTab}
                      onChange={(index)=>{this.setState({selectedTab:index},()=>{
                          this.setState({
                            isbackClickedFromGiphy: true,
                            slider1ActiveSlide: index
                          })
                      })}}
                      barColor="transparent"
                      indicatorColor={Colors.primaryAccent}
                      activeTextColor="white"
                    />
                  </View>
                      <View style={{flexDirection:"row", justifyContent:"space-between",width:this.props.orientationValue == "portrait" ? "100%" : "85%",alignSelf:"center"}}>
                        <TouchableOpacity onPress={()=>{this.scrollPrevious()}}>
                          <Image style={styles.searchIcon} source={Images.leftArrow}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{
                          this.setState({
                            selectedSticker: null
                          },() => {
                            this.props.onClosePressed(this.state.selectedSticker, false)
                          })
                          }}>
                          <Image style={styles.searchIcon} source={Images.downArrow}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{this.scrollNext()}}>
                          <Image style={styles.searchIcon} source={Images.rightArrow}/>
                        </TouchableOpacity>
                      </View>
                      </View>
                  } 
                  {(this.state.keyboardOpen || this.state.isbackClickedFromGiphy == false) && 
                    this.renderGiphySearch()
                  }
                  {this.state.isbackClickedFromGiphy &&
                  <Swiper 
                    ref={(ref) => { this.pager = ref; }}
                    index={this.state.slider1ActiveSlide}
                    onPageChange={(index) => {
                      this.stickerPageIndex = 0
              
                      this.setState({
                        slider1ActiveSlide:index,
                        selectedTab: index,
                        stickerList:[],
                        selectedCategoryId: this.state.categoryList[index].id,
                        hitStickerList:true,
                        apiLoading: this.state.categoryList[index].is_default
                      },()=>{
                        if(this.state.categoryList[index].is_default && this.state.categoryList[index].name != "GIF"){
                          this.props.getStickerList(this.state.URL_BASE,this.state.selectedCategoryId,this.stickerPageIndex,this.state.limit,"")
                        }else if(this.state.categoryList[index].is_default && this.state.categoryList[index].name == "GIF"){
                          this.setState({apiLoading:false})
                        }else{
                          this.setState({
                            checkAlreadySaved: null
                          })
                        }
                      })
                    }}
                    style={styles.wrapper}
                    >
                        {this.renderSwipe()}
                    </Swiper>
                  } 
                </View>
                </View>

                </KeyboardAvoidingView>
                </SafeAreaView>
                <Loader visibility={this.state.apiLoading} />

              </Modal>
        );
      }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop:0,
      width:"100%",
      height:"100%",
      backgroundColor:"#00000055"
      // zIndex: 10
    },
    wrapper: {
    },
  
    slide1: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#9DD6EB',
    },
  
    slide2: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'green',
    },
  
    slide3: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#92BBD9',
    },
  
    sliderContentContainer: {
      paddingVertical: 10 // for custom animation
    },
    searchIcon:{
        height:40,
        width:40,
        margin:10,
        alignSelf:"center",
        resizeMode:"contain"
    },
     closeBtnContainer: {
      position: 'absolute',
       left: 15,
       top:10,
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 10,
    },
    close_icon: {
      height: 24,
    width: 24,
    resizeMode:'contain'
    },
    textInputSearch:{
        height:40,
        padding:5,
        width:"90%",
        color:"white",
        fontSize:16,
        alignSelf:"center",
        //backgroundColor:"rgba(0,0,0,0.5)"
    },
    searchView:{
        width:"70%",
        alignSelf:"center",
        padding:15,
        height:40,
        marginTop:10,
        borderWidth:1,
        borderColor:"white",
        borderRadius:20,
        //marginTop:5,
        //alignSelf:"flex-start",
        justifyContent:"center",
        flexDirection:"row",
        alignItems:"center",
        backgroundColor:"transparent"
    },
    slider: {
      position:"absolute",
      top:50,
      left:10,
      right:10,
      bottom:20,
      zIndex:999,
      overflow: 'visible' // for custom animations
  },
  tabIcon:{resizeMode:"contain", height:35, width:35, alignSelf:"center"}
});

const mapStateToProps = state => {
  const { stickerCategoriesSuccess, stickerCategoriesFailure, stickerListSuccess, stickerListFailure } = state.StickerListReducer
  return {
    stickerCategoriesSuccess,
    stickerCategoriesFailure,
    stickerListSuccess,
    stickerListFailure
  }
}

export default connect(
  mapStateToProps,
  {
      getStickerCategories,
      getStickerList
  }
)(StickerPicker)
