import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
} from 'react-native-gesture-handler';

import FastImage from '@stevenmasini/react-native-fast-image';
import React from 'react';
import { createImageProgress } from 'react-native-image-progress';

const FImage = createImageProgress(FastImage);


export default class DraggableTextView extends React.PureComponent {
  panRef = React.createRef();
  rotationRef = React.createRef();
  pinchRef = React.createRef();
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

      this._scale = Animated.multiply(this._baseScale, this._pinchScale);
      this._lastScale = 1;
      this._onPinchGestureEvent = Animated.event(
          [{nativeEvent: {scale: this._pinchScale}}]
      );

      /* Rotation */
      this._rotate = new Animated.Value(0);
      this._rotateStr = this._rotate.interpolate({
          inputRange: [-100, 100],
          outputRange: ['-100rad', '100rad'],
      });
      this._lastRotate = 0;
      this._onRotateGestureEvent = Animated.event(
          [{nativeEvent: {rotation: this._rotate}}]
      );

      /* Tilt */
      this._tilt = new Animated.Value(0);
      this._tiltStr = this._tilt.interpolate({
          inputRange: [-501, -500, 0, 1],
          outputRange: ['1rad', '1rad', '0rad', '0rad'],
      });
      this._lastTilt = 0;
      this._onTiltGestureEvent = Animated.event(
          [{nativeEvent: {translationY: this._tilt}}]
      );

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
    dragITem.opacity = new Animated.Value(1)
    dragITem.shakeAnimation = new Animated.Value(0)
    this.setState({
        itemDrag:dragITem
    })
    if(this.props.rotationValue != 0){
     this._rotate.setOffset(this.props.rotationValue);
     this._rotate.setValue(0);
    }
    if(this.props.scaleValue != 0){
     this._baseScale.setValue(this.props.scaleValue);
     this._pinchScale.setValue(1);
    }
    
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

 
  _onRotateHandlerStateChange = event => {
      console.log("ROTATION HANDLER CALLED")
      console.log("yValue drag View",this.props.xCoordinate,this.props.yCoordinate, this._lastOffset.x,this._lastOffset.y, this.props.xCoordinate + this._lastOffset.x,this.props.yCoordinate + this._lastOffset.y )

      if (event.nativeEvent.oldState === State.ACTIVE) {
          this._lastRotate += event.nativeEvent.rotation;
          this.props.onRotate(this._lastRotate)
          this._rotate.setOffset(this._lastRotate);
          this._rotate.setValue(0);
      }
  };
  _onPinchHandlerStateChange = event => {
    console.log("PINCH  HANDLER CALLED")

      if (event.nativeEvent.oldState === State.ACTIVE) {
          this._lastScale *= event.nativeEvent.scale;
          console.log("SCALED VALUE",this._lastScale)
          let widddy = this._lastScale < 0.60  ? Dimensions.get('window').width + (2 * 100) : Dimensions.get('window').width
          console.log("SCALED WIDHT DEVICE",widddy)
          this.props.onScale(this._lastScale)
          this._baseScale.setValue(this._lastScale);
          this._pinchScale.setValue(1);
      }
  };
  _onTiltGestureStateChange = event => {
    console.log("TILT HANDLER CALLED")

      if (event.nativeEvent.oldState === State.ACTIVE) {
          this._lastTilt += event.nativeEvent.translationY;
          this._tilt.setOffset(this._lastTilt);
          this._tilt.setValue(0);
      }
  };

  _onHandlerStateChange = event => {
      console.log("HANDLER CALLED")
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
    //Vibration.vibrate(1000)
    Animated.timing(this.state.itemDrag.opacity, { toValue: 0, duration: 500}).start(()=>{
        this.props.onOpacityAnimateComplete()
    })
 }

  isDropArea(gesture) {
    if(this.state.itemDrag.orientation == "portrait"){
        return  gesture.absoluteY < 90 && (gesture.absoluteX > 150 && gesture.absoluteX < 250);
    }else{
        return  gesture.absoluteY < 50 && (gesture.absoluteX > 330 && gesture.absoluteX < 470);
    }
  }

  render() {
    let twoxWidth = Dimensions.get('window').width
      const { labelStyles,labelText, textWidth, textHeight} = this.props;
      return (
          // <React.Fragment>
              <PanGestureHandler
              ref={this.dragRef}
              simultaneousHandlers={[this.rotationRef, this.pinchRef]}
              onGestureEvent={this._onGestureEvent}
              minPointers={1}
              maxPointers={1}
              avgTouches
              onHandlerStateChange={(e) => {this._onHandlerStateChange(e)}}>
              <Animated.View  style={[
                  {backgroundColor:"transparent", width: twoxWidth , height: textHeight, justifyContent:"center", alignSelf:"center",position:"absolute",left:0,top: this.props.yCoordinate, zIndex:1},
                  {
                      transform: [
                          {translateX: this._translateX},
                          {translateY: this._translateY},
                      ],
                  },
              ]}>
                  <RotationGestureHandler
                      ref={this.rotationRef}
                      simultaneousHandlers={this.pinchRef}
                      onGestureEvent={this._onRotateGestureEvent}
                      onHandlerStateChange={this._onRotateHandlerStateChange}>
                      <Animated.View style={[
                              {backgroundColor:"transparent", minWidth:twoxWidth, justifyContent:"center", minHeight:textHeight ,alignSelf:"center"},
                              {
                                  transform: [
                                      {rotate: this._rotateStr},
                                      {scale: this._scale},
                                  ],
                              },
                          ]}
                      >
                          <PinchGestureHandler
                              ref={this.pinchRef}
                              simultaneousHandlers={this.rotationRef}
                              onGestureEvent={this._onPinchGestureEvent}
                              onHandlerStateChange={this._onPinchHandlerStateChange}>
                           <Animated.View style={[
                                  {backgroundColor:"transparent", minWidth:"100%", justifyContent:"center", minHeight:textHeight + 5,alignSelf:"center"},
                                  {opacity:this.state.itemDrag.opacity,
                                    //   transform: [
                                    //       {scale: this._scale},
                                    //   ],
                                  },
                              ]} collapsable={false}>
                                {this.props.isSticker ? 
                                    <FImage
                                    style={[
                                        { width:100, height: 100},
                                        {left: this.props.xCoordinate},
                                        { 
                                          // transform: [
                                          //   {scale: this._scale},
                                          //   ] 
                                        }
                                    ]}
                                    source={{
                                        uri: this.props.dataItem.stickerUrl,
                                        priority: FastImage.priority.high,
                                    }}
                                    indicator={<ActivityIndicator/>}
                                    indicatorProps={{
                                        size: 100,
                                        borderWidth: 0,
                                        color: 'white',
                                        unfilledColor: 'rgba(60,14,101, 0.2)',  
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                                : 
                                <TouchableOpacity onLongPress={this.props.onLongPress} style={{width:textWidth,borderRadius:10, height:textHeight, alignSelf:"flex-start"}}>
                                <Animated.Text
                                  numberOfLines={0}
                                  style={[
                                      labelStyles,
                                      {borderRadius:10,overflow:"hidden",alignSelf:"flex-start",left: this.props.xCoordinate},
                                      {opacity:this.state.itemDrag.opacity},
                                      { transform: [
                                          //{translateX: this.state.itemDrag.shakeAnimation},
                                          //{scale: this._scale}
                                        ] 
                                    }
                                ]}
                                  >
                                    {labelText}
                                    </Animated.Text>
                                  </TouchableOpacity>
                                }
                                
                              </Animated.View>
                          </PinchGestureHandler>
                      </Animated.View>
                  </RotationGestureHandler>
              </Animated.View>
          </PanGestureHandler>
          //     {/* { children } */}
          // </React.Fragment>
      );
  }
}

const landscapeStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf:"center",
  },
  pinchableImage: {
    width: 150,
    height: 50,
    backgroundColor:"red",
  },
  wrapper: {
    position:"absolute",
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor:"transparent",
  },
});

const portraitStyles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf:"center",
    },
    pinchableImage: {
      width: 150, 
      height: 50,
      backgroundColor:"red",
    },
    wrapper: {
      position:"absolute",
      top:0,
      left:0,
      right:0,
      bottom:0,
      backgroundColor:"transparent",
    },
  });
