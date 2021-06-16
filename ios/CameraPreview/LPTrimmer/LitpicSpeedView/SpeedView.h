//
//  SpeedView.h
//  react-native-litpic-camera-module
//
//  Created by optisol on 03/08/20.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>



@class SpeedView;


NS_ASSUME_NONNULL_BEGIN

@interface SpeedView : RCTViewManager <RCTBridgeModule>
- (void)sendData;
@end

NS_ASSUME_NONNULL_END

