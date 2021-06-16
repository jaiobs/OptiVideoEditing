//
//  VideoEncoder.h
//  Encoder Demo
//
//  Created by Geraint Davies on 14/01/2013.
//  Copyright (c) 2013 GDCL http://www.gdcl.co.uk/license.htm
//

#import <Foundation/Foundation.h>
#import "AVFoundation/AVAssetWriter.h"
#import "AVFoundation/AVAssetWriterInput.h"
#import "AVFoundation/AVMediaFormat.h"
#import "AVFoundation/AVVideoSettings.h"
#import "AVFoundation/AVAudioSettings.h"
#import <AVKit/AVKit.h>

@interface VideoEncoder : NSObject
{
    AVAssetWriter* _audiowriter;
  AVAssetWriterInput* _audioInput;
  NSString* _path;
}

@property NSString* path;
@property ( nonatomic) CMTime startTime;
@property (strong, nonatomic) AVAssetWriter* writer;
@property (strong, nonatomic) AVAssetWriterInput* videoInput;
@property (strong, nonatomic) AVAssetWriterInputPixelBufferAdaptor *adaptor;

+ (VideoEncoder*) encoderForPath:(NSString*) path Height:(int) cy width:(int) cx channels: (int) ch samples:(Float64) rate  IsFrontCamera:(BOOL) IsFrontCamera recordOrientaion:(UIInterfaceOrientation) CurrentOrientaion;

- (void) initPath:(NSString*)path Height:(int) cy width:(int) cx channels: (int) ch samples:(Float64) rate IsFrontCamera:(BOOL) IsFrontCamera recordOrientaion:(UIInterfaceOrientation) CurrentOrientaion;
- (void) finishWithCompletionHandler:(void (^)(void))handler;
//- (BOOL) encodeFrame:(CMSampleBufferRef) sampleBuffer isVideo: (BOOL)bVideo fromConnection: (NSString *)connection;
- (BOOL) encodeFrame:(CMSampleBufferRef) sampleBuffer isVideo:(BOOL) bVideo;
-(void)cancelEverything;
@end
