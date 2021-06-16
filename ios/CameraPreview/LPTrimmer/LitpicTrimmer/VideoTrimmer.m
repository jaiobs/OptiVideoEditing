//
//  VideoTrimmer.m
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 03/04/20.
//

#import "VideoTrimmer.h"
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


@implementation VideoTrimmer

VideoTrimmerSwift * LPT;
RNSensorOrientationChecker * sensorOrientationChecker;

RCT_EXPORT_MODULE(VideoTrimmer);


- (void)dealloc
{
    
}

- (UIView *)view {
    LPT = [[VideoTrimmerSwift alloc] init];
    sensorOrientationChecker = [RNSensorOrientationChecker new];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(orientationChanged:)
                                                 name:UIApplicationDidChangeStatusBarOrientationNotification
                                               object:nil];
    return LPT;
}



RCT_CUSTOM_VIEW_PROPERTY(videos, NSArray, VideoTrimmerSwift){
    [LPT setVideoArray:[RCTConvert NSArray:json]];
    
//    [self sendEventWithName:@"EventReminder" body:@{@"name": @"welcome"}];

}

RCT_CUSTOM_VIEW_PROPERTY(filter, NSString, VideoTrimmerSwift)
{
    [LPT setFilter:[RCTConvert NSDictionary:json]];
    [LPT applyLiveFilter];
}




- (void)orientationChanged:(NSNotification *)notification{
    
    [LPT setUserInitiated:true];
    
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    if (UIInterfaceOrientationIsLandscape(orientation)) {
        if (LPT != nil){
            [LPT orientaionChangedWithIsPortrait:FALSE];
        }
        NSLog(@"Landscape");
    }else if (UIInterfaceOrientationIsPortrait(orientation)){
        NSLog(@"Portrait");
        if (LPT != nil){
            [LPT orientaionChangedWithIsPortrait:TRUE];
        }
    }else{
        
    }
}


RCT_EXPORT_METHOD(stopVideo){
    [LPT stopVideo];
}



//RCT_EXPORT_METHOD(setVideoUrl : (NSArray *)url){
//    RCTLogInfo(@"%@ this log", url);
//    videoUrl = url;
//}

//RCT_EXPORT_METHOD(setCrop :(BOOL)value){
//    RCTLogInfo(@"%d setCrop", value);
//    dispatch_async(dispatch_get_main_queue(), ^{
//        [LPT cropDidSelected];
//    });
//}

//RCT_EXPORT_METHOD(show : (NSString *)text){
//    //    onPress={CalendarManager.setVideo('Birthday Party')}
//    RCTLogInfo(@"%@ this log", text);
//}

//RCT_EXPORT_METHOD(setVideo:(NSString *)url){
//    RCTLogInfo(@"%@ this log", url);
//}


//RCT_EXPORT_METHOD(getVideo:(NSString *)url callback:(RCTResponseSenderBlock)callback){
//    dispatch_async(dispatch_get_main_queue(), ^{
////        [VideoTrimmerSwift getVideoInformationWithVideopath:url completionHandler:^(NSDictionary *response) {
////            callback(@[response]);
////        }];
//    });
//}
//
RCT_EXPORT_METHOD(getTrimVideo:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPT cropVideoDidSelectedWithCompletionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}

@end
