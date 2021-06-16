//
//  TextEmbedder.m
//  react-native-litpic-camera-module
//
//  Created by MAC-OBS-2 on 24/05/20.
//

#import "TextEmbedder.h"
#import "react_native_litpic_camera_module-Swift.h"

@implementation TextEmbedder

StickerController *SVC;

RCT_EXPORT_MODULE(TextEmbedder)

RCT_EXPORT_METHOD(getTextStickerWithImage:(NSString *)imagePath dict:(NSArray *)textDict callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [StickerController textToImageWithDrawArrayText:textDict imagepath:imagePath completionHandler:^(NSString *response) {
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


RCT_EXPORT_METHOD(getPhotoDetails:(NSString *)value callback:(RCTResponseSenderBlock)callback){
    dispatch_async(dispatch_get_main_queue(), ^{
        [StickerController getPhotoDetailsFromUrlWithImgUrl:value completionHandler:^(NSDictionary *response) {
            callback(@[response]);
        }];
    });
}




@end
