//
//  LPPhotoEditorManager.m
//  react-native-litpic-camera-module
//
//  Created by optisol on 18/01/21.
//

#import "LPPhotoEditorManager.h"
#import "RNFileSystem.h"
#import "RNImageUtils.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>
#import "CommonEmittor.h"
#import "react_native_litpic_camera_module-Swift.h"

@implementation LPPhotoEditorManager
RCT_EXPORT_MODULE(LPPhotoEdit);

LPPhotoEditor *LPPE;


//RNSensorOrientationChecker * sensorOrientationChecker;


- (UIView *)view{
    LPPE = [[LPPhotoEditor alloc] init];
    [LPPE copyPhotoEmitorWithCompletionHandler:^(NSDictionary *response) {
        [self sendPhotoData:response];
    }];
    

    return LPPE;
}

RCT_CUSTOM_VIEW_PROPERTY(imageUrl, NSString, LPPhotoEditor){
    if (![[RCTConvert NSString:json]  isEqual: @""]){
        [LPPE setIsPhotoMode:TRUE];
        [LPPE setImageUrlPath: [RCTConvert NSString:json]];
    }
}

RCT_CUSTOM_VIEW_PROPERTY(videoUrl, NSString, LPPhotoEditor){
    if (![[RCTConvert NSString:json]  isEqual: @""]){
        [LPPE setIsPhotoMode:FALSE];
        [LPPE setVideoUrlPath: [RCTConvert NSString:json]];
        [LPPE layoutSubviews];
    }
}

RCT_EXPORT_METHOD(construct:(NSString *)TrashString){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE GetTrashImage:TrashString];
    });
}


RCT_EXPORT_METHOD(addText){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE addNewText];
    });
}

RCT_EXPORT_METHOD(updateFont:(NSString *)font){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE updateNewWithFont:font];
    });
}


RCT_EXPORT_METHOD(updateColor:(NSString *)hexColor bgLevel: (int)bgLevel){
    dispatch_async(dispatch_get_main_queue(), ^{
        if(bgLevel == 0){
            [LPPE updateNewWithColor:hexColor];
        }else{
            NSString *hexColorWithAlpha = hexColor;
            hexColorWithAlpha = bgLevel == 1 ? hexColorWithAlpha : [hexColorWithAlpha stringByAppendingString:@"85"];
            [LPPE updateNewWithBackgroundColor:hexColorWithAlpha isTransparent:false];
        }
    });
}


RCT_EXPORT_METHOD(updateBackgroundColor:(NSString *)hexColor isTransparent:(BOOL)isTransparent){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE updateNewWithBackgroundColor:hexColor isTransparent:isTransparent];
    });
}

// MARK:-  Exporting Alignment Method from Swift Side.
RCT_EXPORT_METHOD(updateAlign:(NSString *)alignemnt){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE updateNewAlignWithAlignemnt:alignemnt];
    });
}

RCT_EXPORT_METHOD(closeText){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE closeText];
    });
}



- (void)sendPhotoData:(NSDictionary*)response{
    CommonEmittor *events = [[CommonEmittor alloc] init];
    [events setBridge:self.bridge];
    [events sendCommonEvent:response];
}


RCT_EXPORT_METHOD(playVideo){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE updateVideoLayer];
    });
}


RCT_EXPORT_METHOD(SaveInPhotoView:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE mediaSaveWithLocal:YES completionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}



RCT_EXPORT_METHOD(getMediaDetails:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE mediaMetadataExtractWithLocal:NO completionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(getMediaResponse:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE mediaSaveWithLocal:NO completionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(addStickerWithImagePath:(NSString *)url callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE addNewStickerWithStickerUrl:url completionHandler:^(NSDictionary *response) {
                        callback(@[response]);
        }];
    });
}

RCT_EXPORT_METHOD(lockOrientationInPhotoView:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [StickerController lockOrientationWithOrientation: value];
        callback(@[@"DONE ORIENTATION LOCK"]);
    });
}

RCT_EXPORT_METHOD(UnLockOrientationInPhotoView:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [StickerController UnlockBlockedOrientation];
        callback(@[@"DONE ORIENTATION UNLOCK"]);
    });
}

RCT_EXPORT_METHOD(changeMuteStatus:(BOOL)isMute isMusicAdded:(BOOL)isMusicAdded callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE mutePlayerWithIsflag:isMute isMusic:isMusicAdded completionHandler:^(BOOL resp) {
            callback(@[@"DONE MUTING"]);
        }];
    });
}


RCT_EXPORT_METHOD(playVideo:(BOOL)stop){
    dispatch_async(dispatch_get_main_queue(), ^{
        [LPPE stopPlay];
    });
}


RCT_EXPORT_METHOD(IsOverlayerAvailable:(BOOL)isMusicAdded callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"%lu", (unsigned long)LPPE.stickerLayerView.subviews.count);
        if(LPPE.stickerLayerView.subviews.count>0){
            callback(@[@YES]);
        }else{
            callback(@[@NO]);
        }
    });
}



@end
