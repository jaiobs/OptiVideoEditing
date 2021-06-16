//
//  VideoEditor.m
//  react-native-litpic-camera-module
//
//  Created by optisol on 02/08/20.
//

#import "VideoEditor.h"
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

@implementation VideoEditor

VideoEditorSwift *VEV;

//RNSensorOrientationChecker * sensorOrientationChecker;

RCT_EXPORT_MODULE(VideoEditor);

- (UIView *)view{
    VEV = [[VideoEditorSwift alloc] init];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(orientationChanged:)
                                                 name:UIApplicationDidChangeStatusBarOrientationNotification
                                               object:nil];
    
    [VEV copyEmitorWithCompletionHandler:^(NSDictionary *response) {
        [self sendData:response];
    }];

    return VEV;
}

- (void)orientationChanged:(NSNotification *)notification{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
}

- (void)sendData:(NSDictionary*)response{
    CommonEmittor *events = [[CommonEmittor alloc] init];
    [events setBridge:self.bridge];
    [events sendResponseEvent:response];
}


RCT_CUSTOM_VIEW_PROPERTY(videoUrl, NSString, VideoEditorSwift)
{
    NSLog(@" VIDEO URL %@",[RCTConvert NSString:json]);
    [VEV setVideoUrls:[RCTConvert NSString:json]];
    [VEV layoutSubviews];
}


RCT_CUSTOM_VIEW_PROPERTY(videoUrlArray, NSArray, VideoEditorSwift)
{
    [VEV setVideoUrlsArray:[RCTConvert NSArray:json]];
    [VEV layoutSubviews];
}


RCT_CUSTOM_VIEW_PROPERTY(IsTilt, BOOL, VideoEditorSwift)
{
    [VEV setIsCropperView:[RCTConvert BOOL:json]];
    [VEV layoutSubviews];
}


RCT_EXPORT_METHOD(IsTilt :(BOOL)value){
    [VEV setIsCropperView:value];
    [VEV layoutSubviews];
}

RCT_EXPORT_METHOD(saveVideo:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [VEV saveVideoWithCompletionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(saveVideoWithTextStickerOverlay:(NSArray *)textDict callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [VEV saveVideoWithTextOverlayWithDrawArrayText:textDict completionHandler:^(NSDictionary * response) {
            callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(getCropVideo:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [VEV cropVideoDidSelectedWithCompletionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}



RCT_EXPORT_METHOD(getVideoCropFrame:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [VEV getVideoCropRectWithCompletionHandler:^(NSDictionary *response) {
                    callback(@[response]);
            }];
    });
}

RCT_EXPORT_METHOD(isMusicSynced:(BOOL)isMusic){
    dispatch_async(dispatch_get_main_queue(), ^{
        [VEV muteSoundOnMusicSyncWithIsflag:isMusic];
    });
}


@end
