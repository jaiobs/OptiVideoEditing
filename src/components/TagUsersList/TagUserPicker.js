import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform
} from 'react-native';
import {getTagUsers} from '../../actions/TagUsersListAction';
import Modal from 'react-native-modal';
import {Images} from '../../res';
import FastImage from '@stevenmasini/react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class TagCell extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { item, onSelect } = this.props;

    return (
      <TouchableOpacity
        style={[styles.trackItemContainer]}
        onPress={() => {onSelect()}}>
        <View style={{flexDirection: 'row', paddingTop: 5, paddingBottom: 5, paddingLeft:10, flex: 1}}>
          <FastImage
            style={{height: 50, width: 50, borderRadius: 25}}
            source={item.profile_pic != null && item.profile_pic != "" ? {uri: item.profile_pic} : Images.user_placeholder}
            //resizeMode={FastImage.resizeMode.contain}
          />
          
        <View style={{flexDirection: 'column', paddingLeft:5, justifyContent:"center",flex:1, width:"100%"}}>
            <Text style={styles.title}>{item.first_name} {item.last_name}</Text>
            <Text style={[styles.title,{fontSize:14}]}>@{item.user_name}</Text>
            <View style={{backgroundColor: 'rgba(255,255,255,0.6)', height: 1, width: '100%',marginTop:10}} />
        </View>
        </View>
      </TouchableOpacity>
    );
  }
}

class TagUserPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tagUsers: [],
      URL_BASE:"",
      AUTH_TOKEN:"",
    };
  }

  componentDidMount() {
    //get the tag users
    AsyncStorage.getItem(`BASE_URL`).then((value) => {
        AsyncStorage.getItem(`AUTH_TOKEN`).then((auth_val) => {
          if (value !== null && auth_val !== null) {
                this.setState({
                URL_BASE: value,
                AUTH_TOKEN: auth_val
                },()=>{
                    console.log("TAG USER LIST HIT",value,auth_val)
                    this.props.getTagUsers(value,auth_val,"");
                })
            }
        })
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    //getting tag users
    if (
      nextProps.tagList.rows !== undefined &&
      nextProps.tagList.rows.length > 0 &&
      nextProps.tagList.rows !== this.props.tagList.rows
    ) {
      console.log("TAG PROPS INSIDE")
      this.setState({tagUsers: nextProps.tagList.rows});
    }
  }
  onSelectedItems(item, index) {
    this.props.onUserSelected(item)
  }

  renderTagItem(item,index) {
    return (
      <TagCell item={item} onSelect={() => this.onSelectedItems(item, index)} />
    );
  }

  //search songs
  searchUsers(query) {
      if(query.length > 2){
        this.props.getTagUsers(this.state.URL_BASE,this.state.AUTH_TOKEN,query);
      }    
  }

  render() {
    return (
      <Modal
        //backdropColor={"transparent"} 
        isVisible={this.props.visible}
        onRequestClose={() => {
          this.props.onClosePressed();
        }}
        style={[styles.container]}>

        {/* SEARCH INPUT */}
        <View style={[styles.searchContainer]}>
            {/* CLOSE BUTTON */}
            <TouchableOpacity
                style={{alignSelf:"flex-start",margin:10,marginTop:15}}
                onPress={() => {
                  this.props.onClosePressed();
                }}>
                    <Image style={styles.closeIcon} source={Images.close_icon} />
            </TouchableOpacity>
          <View style={[
            styles.searchInputBox,
            ]}>
                <Image style={styles.searchIcon} source={Images.search_icon}/>
                <TextInput
                placeholder={"Search users"}
                placeholderTextColor={"white"}
                style={[styles.searchInput]}
                onChangeText={query => {
                    this.searchUsers(query);
                }}
                />
          </View>
        </View>

        {/* SEARCH LIST */}
        <FlatList
          style={[styles.trackListStyle]}
          data={this.state.tagUsers}
          bounces={false}
          renderItem={({item,index}) => this.renderTagItem(item,index)}
          contentContainerStyle={{alignSelf:"center",width:"100%"}}
          keyExtractor={item => item.id.toString()}
        />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    margin: 0,
    backgroundColor:"#00000060",
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 15,
    top:Platform.OS=='ios'?20:0
  },
  title: {color: 'white', marginTop: 5, fontSize:16, flex:1, width:"100%"},
  searchInputBox: {
    flex: 1,
    flexDirection:"row",
    backgroundColor:"#00000090",
    marginLeft: 5,
    marginRight: 5,
  },
  trackListStyle: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 16,
    marginRight: 30,
  },
  searchIcon: {height:25,width:25,resizeMode:"contain",alignSelf:"center",margin:5},
  searchInput: {color: 'white', height: 40,flex:1},
  trackTitle: {color: 'white', marginLeft: 8, width: '60%'},
  closeIcon: {height: 24, width: 24,resizeMode:'contain'},
  trackItemContainer: {flexDirection: 'column', justifyContent:"center", margin:10},
});

const mapStateToProps = state => {
  const {tagList} = state.TagUsersListReducer;
  return {
    tagList,
  };
};

export default connect(
  mapStateToProps,
  {getTagUsers},
)(TagUserPicker);