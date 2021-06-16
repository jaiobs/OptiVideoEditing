//
//  RNCamerEventEmitter.h
//  litpic
//
//  Created by vignesh waran on 21/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//


#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


@interface RNCamerEventEmitter : RCTEventEmitter <RCTBridgeModule>
- (void)sendImageData:(NSMutableDictionary *)imagedata;
@end
