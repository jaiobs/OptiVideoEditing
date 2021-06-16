import React from 'react';
import { Animated, StyleSheet,Vibration} from 'react-native';

import {
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import FastImage from '@stevenmasini/react-native-fast-image';
import {Images} from '../../res';
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

export class DragTagView extends React.Component {
    panRef = React.createRef();
    dragRef = React.createRef();
  
  
    constructor(props) {
        super(props);

        this.state = {
            _isMounted: false,
            itemDrag: props.dataItem,
            opacity: new Animated.Value(1)
        };
  
        /* Pinching */
        this._baseScale = new Animated.Value(1);
        this._pinchScale = new Animated.Value(1);
  
        this._translateX = new Animated.Value(0);
        this._translateY = new Animated.Value(0);
        this._lastOffset = {x: 0, y: 0};
        this._onGestureEvent = Animated.event(
            [
                {
                    nativeEvent: {
                        translationX: this._translateX,
                        translationY: this._translateY,
                    },
                },
            ]
        );
    }

    componentDidMount() {
        this.setState({
          opacity: new Animated.Value(1),
        })
        let dragITem = this.state.itemDrag
        dragITem.tapped = false
        dragITem.opacity = new Animated.Value(1)
        dragITem.shakeAnimation = new Animated.Value(0)
        this.setState({
            itemDrag:dragITem
        })
    
         if(this.props.translateXVal != 0){
         this._lastOffset.x = this.props.totalTranslateX
         this._translateX.setOffset(this.props.totalTranslateX);
         this._translateX.setValue(0);
        }
         if(this.props.translateYVal != 0){
         this._lastOffset.y = this.props.totalTranslateY
         this._translateY.setOffset(this.props.totalTranslateY);
         this._translateY.setValue(0);
         }
      }
    
      _onHandlerStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            this._lastOffset.x += event.nativeEvent.translationX;
            this._lastOffset.y += event.nativeEvent.translationY;
            this.props.onDrag(event.nativeEvent,this._lastOffset)
            this._translateX.setOffset(this._lastOffset.x);
            this._translateX.setValue(0);
            this._translateY.setOffset(this._lastOffset.y);
            this._translateY.setValue(0);
            if(this.isDropArea(event.nativeEvent)){
              this.startShake()
            }
        }
         if(event.nativeEvent.oldState == 2 || event.nativeEvent.oldState == 0){
          this.props.onDragBeganState(event.nativeEvent)
        }        
    };

    startShake = () => {
        Vibration.vibrate(1000);
        Animated.timing(this.state.itemDrag.opacity, { toValue: 0, duration: 500}).start(()=>{
            this.props.onOpacityAnimateComplete()
        })
     }
    
      isDropArea(gesture) {
          console.log("drag orientation",this.state.itemDrag.orientation)
        if(this.state.itemDrag.orientation == "portrait"){
            return  gesture.absoluteY < 90 && (gesture.absoluteX > 150 && gesture.absoluteX < 250);
        }else{
            return  gesture.absoluteY < 50 && (gesture.absoluteX > 330 && gesture.absoluteX < 470);
        }
      }
    
      render() {
            return(
                 <PanGestureHandler
                 ref={this.dragRef}
                 onGestureEvent={this._onGestureEvent}
                 minPointers={1}
                 maxPointers={1}
                 avgTouches
                 onHandlerStateChange={this._onHandlerStateChange}>
                 <Animated.View  style={[
                     {backgroundColor:"transparent", width: 50 + 30 ,height: 50 + 30, justifyContent:"center", alignSelf:"center",position:"absolute",left:this.state.itemDrag.xcoordinate - 25,top: this.state.itemDrag.ycoordinate - 25,zIndex:1},
                     {
                         transform: [
                             {translateX: this._translateX},
                             {translateY: this._translateY},
                         ],
                     },
                 ]}>
                     <AnimatedFastImage
                        style={[
                            {width:50, height: 50, borderRadius:25, borderWidth:1, borderColor:"white"},
                            {opacity:this.state.itemDrag.opacity},
                            { transform: [
                                {translateX: this.state.itemDrag.shakeAnimation},
                                ] 
                            }
                        ]}
                        source={
                            this.props.dataItem.imageUrl != null && this.props.dataItem.imageUrl != "" ? 
                                {
                                    uri: this.props.dataItem.imageUrl,
                                    priority: FastImage.priority.high,
                                } : Images.user_placeholder
                        }
                        //resizeMode={FastImage.resizeMode.contain}
                     />
                     </Animated.View>
                     </PanGestureHandler>
            )
        //}
      }
    }

    export default DragTagView;

    const styles = StyleSheet.create({
        tapView:{
            height:40,
            width:"80%",
            backgroundColor:"#00000080",
            alignSelf:"center",
            justifyContent:"center",
            alignItems:"center",
            borderRadius:5
        },
        centerText:{
            color:"#FFFFFF80",
            fontSize:18,
            textAlign:"center"
        }
    })

