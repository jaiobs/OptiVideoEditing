#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#import "react-native-litpic-camera-module-Bridging-Header.h"

#import "CameraFocusSquare.h"

@class RCTCameraManager;

@interface RCTCamera : UIView

- (id)initWithManager:(RCTCameraManager*)manager bridge:(RCTBridge *)bridge;

@property (nonatomic, strong) RCTCameraFocusSquare *camFocus;
@end
