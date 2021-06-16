//
//  VideoEncoder.m
//  Encoder Demo
//
//  Created by Geraint Davies on 14/01/2013.
//  Copyright (c) 2013 GDCL http://www.gdcl.co.uk/license.htm
//

#import "VideoEncoder.h"
#import <AVFoundation/AVFoundation.h>
#import "react_native_litpic_camera_module-Swift.h"

#define DEGREES_TO_RADIANS(x) (M_PI * (x) / 180.0)

@implementation VideoEncoder

@synthesize path = _path;

+ (VideoEncoder*) encoderForPath:(NSString*) path Height:(int) cy width:(int) cx channels: (int) ch samples:(Float64) rate IsFrontCamera:(BOOL)IsFrontCamera recordOrientaion:(UIInterfaceOrientation)CurrentOrientaion;
{
  VideoEncoder* enc = [VideoEncoder alloc];
  [enc initPath:path Height:cy width:cx channels:ch samples:rate IsFrontCamera:IsFrontCamera recordOrientaion:CurrentOrientaion];
  return enc;
}

- (void) initPath:(NSString*)path Height:(int) cy width:(int) cx channels: (int) ch samples:(Float64) rate IsFrontCamera:(BOOL)IsFrontCamera recordOrientaion:(UIInterfaceOrientation)CurrentOrientaion;
{
  self.path = path;
  
  [[NSFileManager defaultManager] removeItemAtPath:self.path error:nil];
  NSURL* url = [NSURL fileURLWithPath:self.path];
  
  
  NSError *error = nil;
  _writer = [[AVAssetWriter alloc] initWithURL:url fileType:AVFileTypeQuickTimeMovie
                                         error:&error];
  NSParameterAssert(_writer);
  

  
  if (CurrentOrientaion == AVCaptureVideoOrientationPortrait){
    
    NSDictionary *videoSettings = [NSDictionary dictionaryWithObjectsAndKeys:
                                   AVVideoCodecH264, AVVideoCodecKey,
                                   [NSNumber numberWithInt:1080], AVVideoWidthKey,
                                   [NSNumber numberWithInt:1920], AVVideoHeightKey,
                                   nil];
    

    self.videoInput = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                            outputSettings:videoSettings] ;
  }else{
    NSDictionary *videoSettings = [NSDictionary dictionaryWithObjectsAndKeys:
                                   AVVideoCodecH264, AVVideoCodecKey,
                                   [NSNumber numberWithInt:1920], AVVideoWidthKey,
                                   [NSNumber numberWithInt:1080], AVVideoHeightKey,
                                   AVVideoScalingModeResizeAspectFill,AVVideoScalingModeKey,
                                   nil];
    self.videoInput = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                            outputSettings:videoSettings] ;
      
  }
  

  NSParameterAssert(self.videoInput);
  self.videoInput.expectsMediaDataInRealTime = YES;
  


  NSDictionary *sourcePixelBufferAttributesDictionary = [NSDictionary dictionaryWithObjectsAndKeys:
                                                         [NSNumber numberWithInt:kCVPixelFormatType_32BGRA],
                                                         kCVPixelBufferPixelFormatTypeKey, nil];
    
    
//    [LPCamera updateWritterWithWritter:self.videoInput];


  self.adaptor = [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:_videoInput
                                                                                                                   sourcePixelBufferAttributes:sourcePixelBufferAttributesDictionary];
  
  
  
  
  
  
  
  
  
//
//  // Add the audio input
  AudioChannelLayout acl;
  bzero( &acl, sizeof(acl));
  acl.mChannelLayoutTag = kAudioChannelLayoutTag_Mono;


  NSDictionary* audioOutputSettings = nil;
  // Both type of audio inputs causes output video file to be corrupted.
  if( /* DISABLES CODE */ (NO) ) {
    // should work from iphone 3GS on and from ipod 3rd generation
    audioOutputSettings = [NSDictionary dictionaryWithObjectsAndKeys:
                           [ NSNumber numberWithInt: kAudioFormatMPEG4AAC ], AVFormatIDKey,
                           [ NSNumber numberWithInt: 1 ], AVNumberOfChannelsKey,
                           [ NSNumber numberWithFloat: 44100.0 ], AVSampleRateKey,
                           [ NSNumber numberWithInt: 64000 ], AVEncoderBitRateKey,
                           [ NSData dataWithBytes: &acl length: sizeof( acl ) ], AVChannelLayoutKey,
                           nil];
  } else {
    // should work on any device requires more space
    audioOutputSettings = [ NSDictionary dictionaryWithObjectsAndKeys:
                           [ NSNumber numberWithInt: kAudioFormatAppleLossless ], AVFormatIDKey,
                           [ NSNumber numberWithInt: 16 ], AVEncoderBitDepthHintKey,
                           [ NSNumber numberWithFloat: 44100.0 ], AVSampleRateKey,
                           [ NSNumber numberWithInt: 1 ], AVNumberOfChannelsKey,
                           [ NSData dataWithBytes: &acl length: sizeof( acl ) ], AVChannelLayoutKey,
                           nil ];
  }

  _audioInput = [AVAssetWriterInput
                 assetWriterInputWithMediaType: AVMediaTypeAudio
                 outputSettings: audioOutputSettings ] ;

  _audioInput.expectsMediaDataInRealTime = YES;
  
  // add input
  [_writer addInput:self.videoInput];
  [_writer addInput:_audioInput];
    
}

-(void)cancelEverything{
    [self.writer cancelWriting];
    self.videoInput = nil;
    _audioInput = nil;
}


- (void) finishWithCompletionHandler:(void (^)(void))handler
{
  [_writer finishWritingWithCompletionHandler: handler];
}

- (BOOL) encodeFrame:(CMSampleBufferRef) sampleBuffer isVideo: (BOOL)bVideo {
  
  if (CMSampleBufferDataIsReady(sampleBuffer))
  {
    if (_writer.status == AVAssetWriterStatusUnknown)
{
      CMTime mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
        if(_writer.status != AVAssetWriterStatusWriting){
          [_writer startWriting];
          [_writer startSessionAtSourceTime:mediaStartTime];
        }
    }
    if (_writer.status == AVAssetWriterStatusFailed)
    {
      NSLog(@"writer error %@", _writer.error.localizedDescription);
      return NO;
    }
    if (bVideo)
    {
      if (self.videoInput.readyForMoreMediaData == YES)
      {
        [self.videoInput appendSampleBuffer:sampleBuffer];
        return YES;
      }
    }
    else
    {
      if (_audioInput.readyForMoreMediaData == YES)
      {
        [_audioInput appendSampleBuffer:sampleBuffer];
        return YES;
      }
    }
  }
  return NO;
}

@end
