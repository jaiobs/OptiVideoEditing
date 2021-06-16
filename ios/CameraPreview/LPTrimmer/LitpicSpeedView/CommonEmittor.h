//
//  CommonEmittor.h
//  react-native-litpic-camera-module
//
//  Created by optisol on 05/08/20.
//

#import "React/RCTEventEmitter.h"

NS_ASSUME_NONNULL_BEGIN

@interface CommonEmittor : RCTEventEmitter<RCTBridgeModule>
- (void)doMyAction;
- (void)sendCommonEvent:(NSDictionary*)action;
- (void)sendResponseEvent:(NSDictionary *)action;
- (void)sendNotificationToReactNative;

@end

NS_ASSUME_NONNULL_END

