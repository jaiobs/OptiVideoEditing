//
//  RNCameraEventEmitter.m
//  litpic
//
//  Created by vignesh waran on 21/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RNCamerEventEmitter.h"

@implementation RNCamerEventEmitter

RCT_EXPORT_MODULE();

+ (id)allocWithZone:(NSZone *)zone {
  static RNCamerEventEmitter *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"CustomEvent"];
}

- (void)sendImageData:(NSMutableDictionary *)imagedata
{
//     NSDictionary *dictionary = [[NSDictionary alloc] initWithObjectsAndKeys:@"string1",@"key1", @"string2",@"key2",@"string3",@"key3",nil];
  
   NSDictionary * dic = [NSDictionary dictionaryWithObjects: @[imagedata] forKeys:@[@"data"]];
  
  [self sendEventWithName:@"CustomEvent" body:@{@"imgdata": imagedata}];
}

@end
