#import "LitpicCameraModule.h"

#import "react-native-litpic-camera-module-Bridging-Header.h"
#import "react_native_litpic_camera_module-Swift.h"

@implementation LitpicCameraModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(sampleMethod:(NSString *)stringArgument numberParameter:(nonnull NSNumber *)numberArgument callback:(RCTResponseSenderBlock)callback){
    // TODO: Implement some actually useful functionality
    
    callback(@[[NSString stringWithFormat: @"numberArgument: %@ stringArgument: %@", numberArgument, stringArgument]]);
}

@end
