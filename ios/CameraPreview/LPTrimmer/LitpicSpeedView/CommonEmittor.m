//
//  CommonEmittor.m
//  react-native-litpic-camera-module
//
//  Created by optisol on 05/08/20.
//

#import "CommonEmittor.h"

@implementation CommonEmittor
RCT_EXPORT_MODULE(CommonEmittor);


+ (id)allocWithZone:(NSZone *)zone {
    static CommonEmittor *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super allocWithZone:zone];
    });
    return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"CommonEmittorEvent", @"onEvent"];
}

- (void)sendNotificationToReactNative
{
    [self sendEventWithName:@"EventReminder" body:@{@"name": @"name"}];
}


- (void)sendCommonEvent:(NSDictionary*)action {
  [self sendEventWithName:@"CommonEmittorEvent" body:action];
}

- (void)sendResponseEvent:(NSDictionary*)action {
  [self sendEventWithName:@"CommonEmittorEvent" body:action];
}

@end
