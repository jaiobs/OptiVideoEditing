import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors, Images, Strings } from "../../res";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from 'recyclerlistview';
import React, { Component } from "react";
import { checkAndRequestPermission } from '../../utils/PermissionUtils';
import { PERMISSIONS, openSettings } from 'react-native-permissions';

const INITIAL_LOAD_IMAGES_AHEAD = 18;
const LOAD_IMAGES_AHEAD = 6;
const screenWidth = Dimensions.get('window').width;


export class ImageCell extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { disabled, selected, onSelect, imageUrl, selectedIndex } = this.props;

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          onSelect();
        }}
        style={{
          width: "100%",//(this.state.width - 8) / this.props.rowItems,
          height: "100%", //this.state.width / this.props.rowItems,
          borderColor: Colors.primaryAccent,
          borderWidth: selected ? 3 : 0,
          margin: 2,
          padding: 1
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
        />

    {selectedIndex == -1 ? null : (
      <View style={{ position: "absolute", top: 5, right: 5, width:20, height:20, borderRadius:10, backgroundColor: Colors.primaryAccent, justifyContent:'center', alignItems:'center', alignContent:'center' }}>
        <Text style={{ color: "white", fontSize: 12 }}>
          {selectedIndex + 1}
        </Text>
      </View>
    )}
      </TouchableOpacity>
    );
  }
}

export default class PhotoPicker extends Component {
  CameraRoll = NativeModules.RNCCameraRoll;

  constructor(props) {
    super(props);
    this._layoutProvider = new LayoutProvider(
      this.getLayoutTypeForIndex,
      this.setLayoutForType
    );
    this._dataProvider = new DataProvider(this.rowHasChanged, this.getStableId);
    this.state = { 
      finishedLoading: false,
      rows: [],
      selectedFiles: [],
      selectedIndexes: [],
      lastCursor: "",
      hasNextpage: true,
      width: props.width,
      dataProvider: this._dataProvider.cloneWithRows([]),
      permissionType:'',
      permissionFlag:false
    };
  }


   permissionCheck = async () => {
    try {
      const hasPhotosAccess = await checkAndRequestPermission(
        PERMISSIONS.IOS.PHOTO_LIBRARY
      );
      this.setState({
        permissionFlag: hasPhotosAccess,
      });
      return hasPhotosAccess;
    } catch (err) {
      console.log('permission error -> ', err);
      return false;
    }
  };

  componentDidMount() {
    this.permissionCheck();
    const params = {
      first: INITIAL_LOAD_IMAGES_AHEAD,
      assetType: "Photos",
      groupTypes: 'All'
    };
    
    this.getGalleryDetails(params);
  }

  rowHasChanged = (r1,r2) => {
    return r1.isSelected !== r2.isSelected || r1.node.image.filename !== r2.node.image.filename;
  }

  getStableId = (index) => `${index}`;

  getLayoutTypeForIndex = (index) => 1;

  setLayoutForType = (type, dim) => {
    const width1 = (screenWidth) / 3;
    dim.height = width1;
    dim.width = width1;
  };

  getGalleryDetails = params => {
    this.CameraRoll.getPhotos(params)
      .then(Response => {
        const lastCursor = Response.page_info.end_cursor;
        const hasNextpage = Response.page_info.has_next_page;

        const newRows = this.state.rows.concat(Response.edges);
        if (this.state.rows.length === 0) {
          this.setState({
            rows: newRows,
            lastCursor: lastCursor,
            hasNextpage: hasNextpage,
            finishedLoading: true,
            dataProvider: this._dataProvider.cloneWithRows(newRows)
          });
        } else {    
          this.setState({
            rows: newRows,
            dataProvider: this._dataProvider.cloneWithRows(newRows),
            lastCursor: lastCursor,
            hasNextpage: hasNextpage,
            finishedLoading: true
          });
        }
      })
      .catch(err => {
        this.setState({ finishedLoading: true })
        alert(err);
      });
  };

  onEndReached() {
    if (this.state.hasNextpage) {
      const params = {
        first: LOAD_IMAGES_AHEAD,
        assetType: "Photos",
        groupTypes: 'All',
        after: this.state.lastCursor
      };
      this.getGalleryDetails(params);
    }
  }
  
  onSelectedItems(item, index) {

    const selectedIndexes = this.state.selectedIndexes.includes(index) ?
      this.state.selectedIndexes.filter(data => data !== index) :
      this.state.selectedIndexes.concat([index]);

    const selectedFiles = this.state.selectedIndexes.includes(index) ?
      this.state.selectedFiles.filter(task => task.node.image.uri !== item.node.image.uri) :
      this.state.selectedFiles.concat([item])

    const { rows } = this.state;
    const mappedRows =  rows.map((r) => {
        return {
          ...r,
          isSelected: selectedIndexes
        }

    });

    this.setState(
      {
        selectedIndexes: selectedIndexes,
        selectedFiles: selectedFiles,
        dataProvider: this._dataProvider.cloneWithRows(mappedRows),
        rows: mappedRows
      }
    );
  }

  isSelected(index) {
    return this.state.selectedIndexes.includes(index);
  }

  getTimeDurationFromSec(secs) {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map(v => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  }

  renderRow = (type, item, index) => {
    let seleIndex = this.state.selectedIndexes.findIndex(obj => obj === index)
    return <ImageCell
      disabled={this.state.selectedFiles.length == 10 && !this.isSelected(index)}
      selected={this.isSelected(index)}
      onSelect={() => this.onSelectedItems(item, index)}
      imageUrl={item.node.image.uri}
      selectedIndex={seleIndex}
      />
  };

  applyDimensions(layout) {
    const { width } = layout;
    this.setState({ width: width });
  }

  renderImageRow = (item, index) => {
    return (
      <TouchableOpacity
        style={{
          width: this.props.orientation == "portrait" ? 80 : 60,
          height: this.props.orientation == "portrait" ? 80 : 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: item.node.image.uri }}
          style={{ width: this.props.orientation == "portrait" ? 65 : 50, height: this.props.orientation == "portrait" ? 65 : 50}}
        />
      </TouchableOpacity>
    );
  };

  renderSettings() {
    return(
      <View style={styles.settingsContainer}>
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 16, textAlign: "center" }}>
            {Strings.ios_select_more_photos}
            </Text>
            <TouchableOpacity
              style={[styles.settingsBtn, { height: 35, borderRadius: 17.5 }]}
              onPress={() => {
                openSettings()
              }}>
              <Text style={{ fontSize: 15, color: "white", alignSelf: "center", margin: 5, padding: 5 }}>Settings</Text>
            </TouchableOpacity>
          </View>
    )
  }
  
  render() {
    const {dataProvider,finishedLoading,permissionFlag} = this.state;
    const cellHeight = screenWidth / 3;
    
    const renderAhead = cellHeight * LOAD_IMAGES_AHEAD * 10;
    const onEndReachedThreshold = renderAhead;
    const settingFlag = dataProvider._data.length == 0 && finishedLoading && permissionFlag
    return (
        <View style={{ flex: 1, flexDirection: this.props.orientation == "portrait" ? "column":"row"}}>
        <View style={{ width: this.props.orientation == "portrait" ? "100%": "85%",height: (this.props.orientation == "portrait" && this.state.selectedFiles.length != 0) ? "85%":"100%"}}>
          <View
          onLayout={event => {
            this.applyDimensions(event.nativeEvent.layout);
          }}
          style={styles.container}
        >
          {!finishedLoading && (
            <ActivityIndicator
              size="large"
              color={Colors.primaryAccent}
              style={{ alignSef: "center" }}
            />
            )}
            {settingFlag && this.renderSettings()}
            { this.state.dataProvider._data.length !== 0 &&
              <RecyclerListView
                style={
                  {
                    flex: 1,
                    width: 500,
                    height: 800
                  }
                }
                key={this.props.orientation}
                onEndReached={this.onEndReached.bind(this)}
                keyExtractor={(item, index) => index.toString()}
                rowRenderer={this.renderRow}
                dataProvider={this.state.dataProvider}
                extraData={this.props.orientation}
                numColumns={this.props.rowItems}
                renderAheadOffset={renderAhead}
                onEndReachedThreshold={onEndReachedThreshold}
                disableRecycling={false}
                layoutProvider={this._layoutProvider}
              /> 
          
            }
        </View>
      </View>

      {this.state.selectedFiles.length > 0 ? (
        <View 
          style={{ 
              width:this.props.orientation == "portrait" ? "100%":"40%" ,
              flexDirection:  this.props.orientation == "portrait" ? "row":"column", 
              maxHeight: this.props.orientation == "portrait" ? 80 : "100%", 
              paddingLeft: this.props.orientation == "portrait" ? 0 : 20,
              justifyContent:"space-between",
          }}>
          {this.state.selectedFiles.length != 0 && 
            <View style={{ flex: 1}}>
              <FlatList
                horizontal={this.props.orientation == "portrait" ? true : false}
                data={this.state.selectedFiles}
                extraData={this.state.selectedFiles}
                renderItem={({ item, index }) => this.renderImageRow(item, index)}
                keyExtractor={item => item.id}
              />
            </View>
          }
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}} >
            <TouchableOpacity
              onPress={() => { this.props.onItemSelected(this.state.selectedFiles) }}
              style={styles.nextIcon}>
              <Image style={[{ height: 25, width: 25 }]} source={Images.next_video_icon} />
            </TouchableOpacity>
          </View>
        </View>) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
  nextIcon:{
    height: 32,
    width: 32,
    margin: 10, 
    marginBottom:0,
    marginLeft:0,
    marginTop:35,
    marginRight:13,
    resizeMode: 'contain',
    alignSelf:"flex-end"
  },
   settingsBtn:{
    backgroundColor: Colors.primaryAccent,
    height:24,
     margin:10,
      minWidth: 50,
      borderRadius:12,
       justifyContent:"center",
       alignItems:"center"
      },
   settingsContainer:{
    width:"100%",
    height:80,
    alignSelf:"center",
    justifyContent:"center",
    flexDirection:"column",
    alignItems:"center",
    marginTop:200,
    padding:10
   }
});
