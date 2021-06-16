//
//  VideoTrimmer.h
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 03/04/20.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


@class VideoTrimmer;

NS_ASSUME_NONNULL_BEGIN

@interface VideoTrimmer : RCTViewManager <RCTBridgeModule>
-(void) setVideoUrl:(NSString*) url;
@end

NS_ASSUME_NONNULL_END



