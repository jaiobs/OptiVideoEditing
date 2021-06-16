import React, { Component } from "react";
import {
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";

export default class FontsList extends Component {
  constructor(props) {
    super(props)
      this.state = {
      }
    }

    render() {
        const {fontsList,isSelected} = this.props
        return(
          <ScrollView keyboardShouldPersistTaps={'always'} keyboardDismissMode='on-drag' style={{flex: 1, zIndex:999}}>
            <FlatList
            data={fontsList}
            keyboardShouldPersistTaps={'always'}
            horizontal={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{height: 35, padding:3,marginTop:8, justifyContent:"center", flex:1, minWidth: 40, borderColor:"#fff", borderRadius:5,borderWidth: isSelected == item.value ? 0.7 : 0 , backgroundColor:"transparent", margin:2}}
                onPress={() => {this.props.onSelectFont(item)}}
              >
                  <Text style={{textAlign:"center",color:"#fff", marginTop: -3,fontFamily:item.value, fontSize: 18}}>{item.title}</Text>
                  </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            />
            </ScrollView>
        )
    }
}