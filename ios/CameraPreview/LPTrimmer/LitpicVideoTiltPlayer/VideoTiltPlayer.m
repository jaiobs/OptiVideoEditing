//
//  VideoTiltPlayer.m
//  react-native-litpic-camera-module
//
//  Created by optisol on 27/07/20.
//

#import "VideoTiltPlayer.h"
#import "RNFileSystem.h"
#import "RNImageUtils.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>
#import "react_native_litpic_camera_module-Swift.h"
#import "RNCamera.h"
#import "RNSensorOrientationChecker.h"


@implementation VideoTiltPlayer

RCT_EXPORT_MODULE(VideoTiltPlayer);
campusView *CV;

- (void)dealloc
{
    
}

- (UIView *)view {
    CV = [[campusView alloc] init];
    return CV;
}

RCT_CUSTOM_VIEW_PROPERTY(videoPath, NSArray, VideoTiltPlayer){
    [CV setVideoUrl:[RCTConvert NSArray:json]];
    [CV updatePlayer];
}

RCT_CUSTOM_VIEW_PROPERTY(cropPosition, NSDictionary, VideoTiltPlayer)
{
    
    NSLog(@"%@",[RCTConvert NSDictionary:json]);
    [CV setVideoFrameDict:[RCTConvert NSDictionary:json]];
    [CV updateFrame];
//    RCT_CUSTOM_VIEW_PROPERTY(filter, NSString, VideoTrimmerSwift)
//    {
//        [LPT setFilter:[RCTConvert NSDictionary:json]];
//        [LPT applyLiveFilter];
//    }
//    [LPT setFilter:[RCTConvert NSDictionary:json]];
//    [LPT applyLiveFilter];
}

@end

