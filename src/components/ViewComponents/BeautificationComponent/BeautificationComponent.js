import React, { Component } from "react";
import {
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../../../res";
import Slider from "@react-native-community/slider";
import Modal from "react-native-modal";

export default class BeautificationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            name: "",
            type: 1,
            videoTimerValue: 0
        };
    }

    beauty_list = [{
        name: "Beauty",
        type: 1
    }, {
        name: "Lips",
        type: 2
    }, {
        name: "Eye Shadow",
        type: 1
    }, {
        name: "Eyeliner",
        type: 2
    }, {
        name: "Lips",
        type: 1
    }, {
        name: "Eye Shadow",
        type: 2
    }, {
        name: "Lyeliner",
        type: 1
    }
    ]
    colers_list = [{
        coler: "red"
    }, {
        coler: "green"
    }, {
        coler: "yellow"
    },
    {
        coler: Colors.primaryAccent
    }, {
        coler: "green"
    }, {
        coler: "yellow"
    }, {
        coler: "green"
    }, {
        coler: "yellow"
    },
    {
        coler: Colors.primaryAccent
    }, {
        coler: "green"
    }, {
        coler: "yellow"
    }
    ]


    closePicker() {
        this.props.onBackdropPress();
    }
   
    cancel() {
        alert("cancel")
    }

    onPressColler() {
        alert("coller")
    }

    onPress(type, name, index) {
        this.setState({ type: type, name: name, index: index })
    }

    exit(){
        this.closePicker()
    }


    _renderItemBeautification = ({ item, index }) => {
        return (
            <View style={styles.beautyListitem}>
                <TouchableOpacity
                    onPress={() => this.onPress(item.type, item.name, index)}
                >
                    {this.state.index == index && this.state.name == item.name ? <Text style={{ color: Colors.primaryAccent }}>{item.name}</Text> : <Text style={{ color: "white" }}>{item.name}</Text>}
                </TouchableOpacity>
            </View>
        )
    };
    _renderItemCollers = ({ item }) => {
        return (
            <View style={styles.beautyColeritem}>
                <TouchableOpacity
                    onPress={() => this.onPressColler(item.name)}
                    style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: item.coler }}
                >
                </TouchableOpacity>

            </View>
        )
    }

    render() {
        return (
            <Modal
                backdropColor={"Transprent"}
                isVisible={this.props.visibility}
                style={{ justifyContent: 'flex-end', margin: 0 }}
                onRequestClose={() => this.closePicker()}
                onBackdropPress={this.props.onBackdropPress}>
                <View
                    style={this.props.orientation == 'portrait'
                        ? styles.containerPortrait
                        : styles.containerLandscape
                    }>
                    <View style={styles.emptyView}>
                    </View>
                    <View style={styles.beautyList}>
                        <FlatList
                            data={this.beauty_list}
                            horizontal={true}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItemBeautification}
                        />
                    </View>

                    {this.state.type == 1 ? <View style={styles.slider}>
                        <Slider
                            style={{
                                width: 300,
                                alignSelf: 'center',
                                marginTop: 10,
                                marginBottom: 10,
                            }}
                            minimumValue={0}
                            maximumValue={30 - this.props.maxTimerValue}
                            step={1.0}
                            value={this.state.videoTimerValue}
                            minimumTrackTintColor={Colors.primaryAccent}
                            maximumTrackTintColor={Colors.white}
                            thumbTintColor={Colors.primaryAccent}
                            onValueChange={val => {
                                this.setState({ videoTimerValue: val });
                            }}
                        />
                    </View> : <View style={styles.colerslide}>
                            <FlatList
                                data={this.colers_list}
                                horizontal={true}
                                extraData={this.state}
                                keyExtractor={this._keyExtractor}
                                renderItem={this._renderItemCollers}
                            />
                            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 40, marginRight: 10, marginLeft: 10, backgroundColor: "white", alignItems: "center", justifyContent: "center" }} onPress={() => this.cancel()}>
                                <Text>X</Text>
                            </TouchableOpacity>
                        </View>}
                    <View style={styles.exit}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={()=>this.exit()}
                        >
                            <Text style={{ color: "white" }}>exit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    containerPortrait: {
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        height: '25%',
        width: '100%',
        alignSelf: 'center',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    containerLandscape: {
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        height: '50%',
        width: '100%',
        alignSelf: 'center',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primaryAccent,
        height: 40,
        borderRadius: 20,
        paddingLeft: 40,
        paddingRight: 40
    },
    beautyList: {
        width: "100%",
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "center",
        justifyContent: 'center',
    },
    beautyListitem: {
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        paddingLeft: 10,
        paddingRight: 10
    },
    beautyColeritem: {
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        paddingLeft: 10,
        paddingRight: 10
    },
    emptyView: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        width: "100%",
        height: 25,
    },
    slider: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
    },
    colerslide: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        flexDirection: "row"
    },
    exit: {
        width: "100%",
        height: 70,
        paddingBottom: 10,
        alignItems: "center",
        justifyContent: 'center',
    },
    beautyCollers: {
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "red"
    }
});
