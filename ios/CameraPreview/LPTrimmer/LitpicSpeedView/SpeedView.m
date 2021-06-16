//
//  SpeedView.m
//  react-native-litpic-camera-module
//
//  Created by optisol on 03/08/20.
//

#import "SpeedView.h"
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
#import "CommonEmittor.h"


@implementation SpeedView

RCT_EXPORT_MODULE(SpeedView);

SpeedViewSwift * SVS;
RNSensorOrientationChecker * sensorOrientationCheckerK;


- (UIView *)view {
    SVS = [[SpeedViewSwift alloc] init];
    sensorOrientationCheckerK = [RNSensorOrientationChecker new];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(orientationChanged:)
                                                 name:UIApplicationDidChangeStatusBarOrientationNotification
                                               object:nil];
    
    [SVS copyEmitorWithCompletionHandler:^(NSDictionary *response) {
        [self sendData:response];
    }];

    return SVS;
}



RCT_CUSTOM_VIEW_PROPERTY(videos, NSArray, SpeedViewSwift){
    [SVS setVideoUrl:[RCTConvert NSArray:json]];
}

RCT_CUSTOM_VIEW_PROPERTY(audio, NSDictionary, SpeedViewSwift){
    [SVS setAudioInfo:[RCTConvert NSDictionary:json]];
}



- (void)sendData:(NSDictionary*)response{
    CommonEmittor *events = [[CommonEmittor alloc] init];
    [events setBridge:self.bridge];
    [events sendCommonEvent:response];
}


RCT_EXPORT_METHOD(refreshData){
    dispatch_async(dispatch_get_main_queue(), ^{
        [SVS reloadData];
    });
}


RCT_EXPORT_METHOD(updateSpeed:(NSInteger)level callback:(RCTResponseSenderBlock)callback){
    [SVS updateSpeedModeWithSpeedLevel:level completionHandler:^(NSDictionary *response){
        callback(@[response]);
    }];
}

RCT_EXPORT_METHOD(getVideo:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [SVS applySpeedModeWithCompletionHandler:^(NSDictionary *response) {
                    callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(getVideoTime:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [SVS checkVideoTimeWithCompletionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}



- (void)orientationChanged:(NSNotification *)notification{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    if (UIInterfaceOrientationIsLandscape(orientation)) {
        if (SVS != nil){
//            [SVS orientaionChangedWithIsPortrait:FALSE];
        }
        NSLog(@"Landscape");
    }else if (UIInterfaceOrientationIsPortrait(orientation)){
        NSLog(@"Portrait");
        if (SVS != nil){
//            [SVS orientaionChangedWithIsPortrait:TRUE];
        }
    }else{
        
    }
    
}

@end




