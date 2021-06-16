//
//  PreviewFilter.m
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 25/04/20.
//

#import "PreviewFilter.h"
#import "RNFileSystem.h"
#import "RNImageUtils.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>
#import "react_native_litpic_camera_module-Swift.h"

@implementation PreviewFilter

RCT_EXPORT_MODULE(PreviewFilter);

VideoPlayerWithFilter *VPF;

NSString *finalVideoUrl;

//RNSensorOrientationChecker * sensorOrientationChecker;


- (UIView *)view{
    VPF = [[VideoPlayerWithFilter alloc] initWithVideoUrl:finalVideoUrl];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(orientationChanged:)
                                                 name:UIApplicationDidChangeStatusBarOrientationNotification
                                               object:nil];
    return VPF;
}


- (void)orientationChanged:(NSNotification *)notification{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    
//    if (UIInterfaceOrientationIsLandscape(orientation)) {
//        if (LPT != nil){
//            [LPT orientaionChangedWithIsPortrait:FALSE];
//        }
//        NSLog(@"Landscape");
//    }else if (UIInterfaceOrientationIsPortrait(orientation)){
//        NSLog(@"Portrait");
//        if (LPT != nil){
//            [LPT orientaionChangedWithIsPortrait:TRUE];
//        }
//    }else {
//
//    }
//
}



RCT_CUSTOM_VIEW_PROPERTY(filter, NSString, VideoPlayerWithFilter)
{
    [VPF setFilter:[RCTConvert NSDictionary:json]];
    [VPF applyLiveFilter];
}


RCT_CUSTOM_VIEW_PROPERTY(ImageMode, BOOL, VideoPlayerWithFilter)
{
    [VPF setIsImageView:[RCTConvert BOOL:json]];
}


RCT_CUSTOM_VIEW_PROPERTY(sourceUrl, NSString, VideoPlayerWithFilter)
{
    [VPF setVideoUrl:[RCTConvert NSString:json]];
}



RCT_EXPORT_METHOD(updateVideoUrl:(NSString *)url){
    RCTLogInfo(@"%@ this log", url);
    finalVideoUrl = url;
}

//NSDictionary
RCT_EXPORT_METHOD(updateFilter:(NSDictionary *)filter){
    RCTLogInfo(@"%@ this log", filter);
}




RCT_EXPORT_METHOD(show : (NSString *)text){
    RCTLogInfo(@"%@ this log", text);
    
    dispatch_async(dispatch_get_main_queue(), ^{

    });


}

RCT_EXPORT_METHOD(setVideo:(NSString *)url){
    RCTLogInfo(@"%@ this log", url);
    dispatch_async(dispatch_get_main_queue(), ^{

    });}


RCT_EXPORT_METHOD(retrievePhotoDetails:(NSString *)time callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [VPF saveImageWithCompletionHandler:^(NSDictionary *response) {
                    callback(@[response]);
                }];
    });
}



RCT_EXPORT_METHOD(getPhotoDetail:(double)time callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
    [VPF saveImageWithCompletionHandler:^(NSDictionary *response) {
                callback(@[response]);
            }];
    });
}



@end





