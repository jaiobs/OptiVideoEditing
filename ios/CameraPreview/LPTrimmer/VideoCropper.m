//
//  VideoCropper.m
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 24/04/20.
//

#import "VideoCropper.h"
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



@implementation VideoCropper

LitpicCropperView *LPC;

NSArray *cropVideoUrl;

//RNSensorOrientationChecker * sensorOrientationChecker;

RCT_EXPORT_MODULE(VideoCropper);

- (UIView *)view{
    LPC = [[LitpicCropperView alloc] initWithVideoUrl:cropVideoUrl];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(orientationChanged:)
                                                 name:UIApplicationDidChangeStatusBarOrientationNotification
                                               object:nil];
    return LPC;
}


- (void)orientationChanged:(NSNotification *)notification{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
}


RCT_EXPORT_METHOD(setCrop :(BOOL)value){
    RCTLogInfo(@"%d setCrop", value);
    dispatch_async(dispatch_get_main_queue(), ^{

    });
}

//RCT_EXPORT_METHOD(updateVideoUrl:(NSString *)url){
//    RCTLogInfo(@"%@ this log", url);
//    cropVideoUrl = url;
//}

RCT_EXPORT_METHOD(show : (NSString *)text){
    RCTLogInfo(@"%@ this log", text);
    
    dispatch_async(dispatch_get_main_queue(), ^{

    });
}


//
//
//RCT_EXPORT_METHOD(setVideo:(NSString *)url){
//    RCTLogInfo(@"%@ this log", url);
//    dispatch_async(dispatch_get_main_queue(), ^{
//    });}
//
//
//
//
//RCT_CUSTOM_VIEW_PROPERTY(IsVideoPlayer, BOOL, LitpicCropperView)
//{
//    [LPC setIsVideoPlayer:[RCTConvert BOOL:json]];
//    [LPC layoutSubviews];
//}
//
//
//
//RCT_CUSTOM_VIEW_PROPERTY(videoUrl, NSArray, LitpicCropperView)
//{
//    cropVideoUrl = [RCTConvert NSArray:json];
//    [LPC setVideoUrl:[RCTConvert NSArray:json]];
//    [LPC layoutSubviews];
//}
//
//
//
//RCT_EXPORT_METHOD(getCropVideo:(double)time callback:(RCTResponseSenderBlock)callback){
//    dispatch_async(dispatch_get_main_queue(), ^{
//        [LPC cropVideoDidSelectedWithCompletionHandler:^(NSDictionary *response) {
//            callback(@[response]);
//        }];
//    });
//}
//
//
//RCT_EXPORT_METHOD(saveVideo:(double)time callback:(RCTResponseSenderBlock)callback){
//    dispatch_async(dispatch_get_main_queue(), ^{
//
//        [LPC setIsVideoPlayer:YES];
//
//        [LPC saveVideoWithCompletionHandler:^(NSDictionary *response) {
//            callback(@[response]);
//        }];
//    });
//}
//
//
//
//RCT_EXPORT_METHOD(getVideoCropFrame:(double)time callback:(RCTResponseSenderBlock)callback){
//    dispatch_async(dispatch_get_main_queue(), ^{
//
//        [LPC setIsVideoPlayer:YES];
//
//
//        [LPC getVideoCropRectWithCompletionHandler:^(NSDictionary *response) {
//                    callback(@[response]);
//            }];
//
//
////        [LPC getVideoCropRect:^(NSDictionary *response) {
////            callback(@[response]);
////        }];
//    });
//}
//
//
//RCT_EXPORT_METHOD(saveVideoWithTextStickerOverlay:(NSArray *)textDict callback:(RCTResponseSenderBlock)callback){
//    dispatch_async(dispatch_get_main_queue(), ^{
//        [LPC setIsVideoPlayer:YES];
//        [LPC saveVideoWithTextOverlayWithDrawArrayText:textDict completionHandler:^(NSDictionary * response) {
//            callback(@[response]);
//        }];
//    });
//}

@end
