#import "RNCamera.h"
#import "RNCameraUtils.h"
#import "RNImageUtils.h"
#import "RNFileSystem.h"
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>
#import "RNSensorOrientationChecker.h"
#import <AVFoundation/AVFoundation.h>
#import "VideoEncoder.h"
#import <UIKit/UIKit.h>
#import "RNCamerEventEmitter.h"
#import "react-native-litpic-camera-module-Bridging-Header.h"
#import "react_native_litpic_camera_module-Swift.h"
#import "AssetsLibrary/ALAssetsLibrary.h"
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

#define DEGREES_TO_RADIANS(x) (M_PI * (x) / 180.0)

API_AVAILABLE(ios(10.0))
@interface RNCamera()<LPCameraDelegate>{
    AVCaptureConnection* _audioConnection;
    AVCaptureConnection* _videoConnection;
    AVCaptureVideoDataOutput* videoout;
    AVCaptureAudioDataOutput* audioout;
    CMFormatDescriptionRef * formatDesc;
    
    NSURL * mergedVideoUrl;
    NSMutableArray * recordedUrls;
    NSMutableArray * recordedMusicUrls;
    NSMutableArray * videosPlayItem;
    NSMutableDictionary * reverseVideo;
    
    BOOL _isCapturing;
    BOOL _isMergeInitiated;
    BOOL _isPaused;
    BOOL _discont;
    BOOL _isOrientationLocked;
    BOOL is_merge_started;
    
    BOOL render;
    BOOL _isVideoProcessing;
    
    int _currentFile;
    int _previousCurrentFile;
    int _currentMirroredFile;
    
    CMTime _timeOffset;
    CMTime _lastVideo;
    CMTime _lastAudio;
    
    int _cx;
    int _cy;
    int _channels;
    Float64 _samplerate;
    CMTime lastSampleTime;
    
    CALayer * aLayer;
    CALayer * parentLayer;
    CALayer * videoLayer;
    NSURL * _videoURL;
}

@property (nonatomic, weak) RCTBridge *bridge;
@property (nonatomic,strong) RNSensorOrientationChecker * sensorOrientationChecker;

@property (nonatomic, strong) RCTPromiseResolveBlock videoRecordedResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock videoRecordedReject;
@property (nonatomic, strong) RCTPromiseResolveBlock updateMergedURL;
@property (nonatomic, strong) id textDetector;
@property (nonatomic, strong) id faceDetector;
@property (nonatomic, strong) id barcodeDetector;
@property (nonatomic, strong) UIButton *button;

@property (nonatomic, copy) RCTDirectEventBlock onCameraReady;
@property (nonatomic, copy) RCTDirectEventBlock onMergeComplete;
@property (nonatomic, copy) RCTDirectEventBlock onAudioInterrupted;
@property (nonatomic, copy) RCTDirectEventBlock onAudioConnected;
@property (nonatomic, copy) RCTDirectEventBlock onMountError;
@property (nonatomic, copy) RCTDirectEventBlock onBarCodeRead;
@property (nonatomic, copy) RCTDirectEventBlock onTextRecognized;
@property (nonatomic, copy) RCTDirectEventBlock onFacesDetected;
@property (nonatomic, copy) RCTDirectEventBlock onGoogleVisionBarcodesDetected;
@property (nonatomic, copy) RCTDirectEventBlock onPictureSaved;
@property (nonatomic, copy) RCTDirectEventBlock onVideoEnded;
@property (nonatomic, assign) BOOL finishedReadingText;
@property (nonatomic, assign) BOOL finishedDetectingFace;
@property (nonatomic, assign) BOOL finishedDetectingBarcodes;
@property (nonatomic, copy) NSDate *startText;
@property (nonatomic, copy) NSDate *startFace;
@property (nonatomic, copy) NSDate *startBarcode;

@property (nonatomic, copy) RCTDirectEventBlock onSubjectAreaChanged;
@property (nonatomic, assign) BOOL isFocusedOnPoint;
@property (nonatomic, assign) BOOL isExposedOnPoint;
@property (nonatomic, strong) LiveFilterController * liveFilter;
@property (nonatomic, strong) VideoPreview * videoPreviewLayer;
@property (nonatomic, retain) UIView * loadView;
@property (nonatomic, assign) BOOL _isSilhoutte;
//@property (nonatomic, retain) VideoEncoder * encoder;


@property(nonatomic, strong) LPCamera* cameraView;
@property(nonatomic, strong) UIImageView* silhoutteView;
@property (nonatomic, strong) void(^completionHandler)(NSDictionary *);
@end


@implementation RNCamera

@synthesize isCapturing = _isCapturing;
@synthesize isMergeInitiated = _isMergeInitiated;
@synthesize isPaused = _isPaused;
@synthesize isOrientationLocked = _isOrientationLocked;
//@synthesize appDelegate = _appDelegate;



static NSDictionary * defaultFaceDetectorOptions = nil;
int reverseVideoCount = 0;
BOOL _recordRequested = NO;
BOOL _sessionInterrupted = NO;

UIImage *lastFrameImage = NULL;
UIInterfaceOrientation interfaceOrientation;
CVPixelBufferRef pixelBufferCopy = NULL;


- (id)initWithBridge:(RCTBridge *)bridge
{
    if ((self = [super init])) {
        self.bridge = bridge;
        if (@available(iOS 10.0, *)) {
            [self Initialization];
            self.cameraView = [[LPCamera alloc] initWithBridge:self.bridge];
            [self.cameraView setDelegate:self];
            [self insertReactSubview:self.cameraView atIndex:self.reactSubviews.count];
            dispatch_async(dispatch_get_main_queue(), ^{
                [self setupWritter];
            });
        } else {

        }
    }
    return  self;
}

- (void)layoutSubviews{
    [super layoutSubviews];
    [super didUpdateReactSubviews];
    self.cameraView.frame = self.frame;
    self._isSilhoutte = NO;
    self.silhoutteView = [[UIImageView alloc] initWithFrame:self.cameraView.frame];
}


-(void)Initialization{
    self.speedLevel = [NSNumber numberWithInt:3];
    recordedUrls = [[NSMutableArray alloc]init];
    recordedMusicUrls = [[NSMutableArray alloc]init];
    videosPlayItem = [[NSMutableArray alloc]init];
    reverseVideo = [[NSMutableDictionary alloc] init];
    
    self.speedLevelArrary = [[NSMutableArray alloc] init];
    self.filterConfig = [[NSMutableDictionary alloc] init];
    self.sessionQueue = dispatch_queue_create("cameraQueue", DISPATCH_QUEUE_SERIAL);
    //interfaceOrientation = [[UIApplication sharedApplication] statusBarOrientation];
}

-(void)setupWritter{
    NSString* filename = [NSString stringWithFormat:@"capture%d.mp4", _currentFile];
    //NSString* path = [NSTemporaryDirectory() stringByAppendingPathComponent:filename];
    NSString* documentsDirectory= [RNCamera applicationDocumentsDirectory];
    NSString * myDocumentPath= [documentsDirectory stringByAppendingPathComponent:filename];
    NSURL * urlVideoMain = [[NSURL alloc] initFileURLWithPath: myDocumentPath];
    NSString* path = urlVideoMain.path;
    
    NSString *myString = urlVideoMain.absoluteString;
    
    NSURL* url = [NSURL URLWithString: myString];
    
    NSLog(@"WRITER URL >>>>> %@ %d",url.path, _currentFile);
    if([[NSFileManager defaultManager] fileExistsAtPath:url.path]){
        NSLog(@"FileExists");
    }
    
    if([[NSFileManager defaultManager] fileExistsAtPath:myDocumentPath])
    {
        NSLog(@"SET UP WRITTER FILE EXISTS %d",_currentFile);
        //[[NSFileManager defaultManager] removeItemAtPath:myDocumentPath error:nil];
        _currentFile = _currentFile + 1;
        NSLog(@"SET UP WRITTER FILE EXISTS AFTER UPDATE CURRENT FILE %d",_currentFile);
        //[self setupWritter];
    }else {
        NSLog(@"RNCAMERA CURRENT FILE INDEX %d %@",_currentFile,path);
        NSLog(@"%ld", (long)self.cameraView.statusBarOrientation);
        //[self.cameraView currentFileIndexChangeWithIndex:_currentFile];
        if (self.cameraView.portraitEncoder.videoInput == nil){
            self.cameraView.portraitEncoder = [VideoEncoder encoderForPath:path Height:_cy width:_cx channels:_channels samples:_samplerate IsFrontCamera:true recordOrientaion:UIInterfaceOrientationPortrait];
        }
        
        
        if (self.cameraView.landscapeLeftEncoderFrontCamera.videoInput == nil){
            self.cameraView.landscapeLeftEncoderFrontCamera = [VideoEncoder encoderForPath:path Height:_cy width:_cx channels:_channels samples:_samplerate IsFrontCamera:true recordOrientaion:UIInterfaceOrientationLandscapeLeft];
        }
        
        
        if (self.cameraView.landscapeLeftEncoderBackCamera.videoInput == nil){
            self.cameraView.landscapeLeftEncoderBackCamera = [VideoEncoder encoderForPath:path Height:_cy width:_cx channels:_channels samples:_samplerate IsFrontCamera:false recordOrientaion:UIInterfaceOrientationLandscapeLeft];
        }
        
        
        
        
        if (self.cameraView.landscapeRightEncoderFrontCamera.videoInput == nil){
            self.cameraView.landscapeRightEncoderFrontCamera = [VideoEncoder encoderForPath:path Height:_cy width:_cx channels:_channels samples:_samplerate IsFrontCamera:true recordOrientaion:UIInterfaceOrientationLandscapeRight];
        }
        
        if (self.cameraView.landscapeRightEncoderBackCamera.videoInput == nil){
            self.cameraView.landscapeRightEncoderBackCamera = [VideoEncoder encoderForPath:path Height:_cy width:_cx channels:_channels samples:_samplerate IsFrontCamera:false recordOrientaion:UIInterfaceOrientationLandscapeRight];
        }
        _currentFile = _currentFile + 1;
    }
}

- (void)startRecording{
    //    NSLog(@"------------------Recording started-------------------------");
    self.isCapturing = YES;
    self.isPaused = NO;
    _discont = NO;
    if (self.flashMode == 3){
           self.presetCamera == 1 ? [self.cameraView BackFlashActivate] : [self.cameraView BrightnessOnOff];
    }
    if(self._isSilhoutte){
        self._isSilhoutte = NO;
        [self.silhoutteView removeFromSuperview];
    }
    _timeOffset = CMTimeMake(0, 0);
    
    //    self.IsLockDirection = interfaceOrientation;
    self.liveFilter.IsOrientationLock = YES;
    self.isOrientationLocked = YES;
    DeviceSingleton *singleton = [DeviceSingleton sharedInstance];
    [singleton UpdateDeviceOrienationWithOrientation:self.cameraView.statusBarOrientation];
    [self.cameraView startRecord];
}

-(void)stopRecording{
    _isVideoProcessing = true;
    self.isCapturing = NO;
    [self.cameraView stopRecord];
    if (self.flashMode == 3){
           self.presetCamera == 1 ? [self.cameraView BackFlashActivate] : [self.cameraView BrightnessOnOff];
    }
    //    NSString* filename = [NSString stringWithFormat:@"capture%d.mp4", _currentFile];
    //    NSString* path = [NSTemporaryDirectory() stringByAppendingPathComponent:filename];
    //    NSURL* url = [NSURL fileURLWithPath:path];
    
    //    [self.cameraView.encoder finishWithCompletionHandler:^{
    //        self.encoder = nil;
    //        [recordedUrls addObject: url];
    //        [videosPlayItem addObject:url.path];
    //
    //        NSLog(@"----", [self.speedLevel intValue]);
    //        [self.speedLevelArrary addObject:self.speedLevel];
    //
    //        ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    //        [library writeVideoAtPathToSavedPhotosAlbum:url completionBlock:^(NSURL *assetURL, NSError *error){
    //            NSLog(@"save completed");
    //        }];
    //    }];
}



- (void)MergeVideoWithSongFromPreview:(NSDictionary *)videoDict isPreview:(BOOL)isPreview isPhotoToVideo:(BOOL)isPhotoToVideo completionHandler:(void (^)(NSDictionary * _Nullable))completionHandler{
    
    NSLog(@"%@",videoDict);
    
    CGFloat totalDuration;
    totalDuration = 0;
    
    __block CMTime currentTime = kCMTimeZero;
    
    AVMutableComposition *mixComposition = [[AVMutableComposition alloc] init];
    
    AVMutableCompositionTrack *videoTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    AVMutableCompositionTrack *audioTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeAudio
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    //AVAsset *asset = [AVAsset assetWithURL:[videoDict valueForKey:@"videoUrl"]];

    NSLog(@"%@",[VideoSingleton sharedInstance].originalVideoUrl);

//    NSString* videoUrlFiles = [VideoSingleton sharedInstance].temVideoUrl;
    NSURL *outputURL;
    if(isPreview){
        outputURL = [VideoSingleton sharedInstance].originalVideoUrl;
    }else{
        if([[videoDict valueForKey:@"videoUrl"] isKindOfClass:[NSArray class]]){
            outputURL = [NSURL fileURLWithPath: [[videoDict valueForKey:@"videoUrl"] firstObject]];
        }else{
            outputURL = [NSURL URLWithString:[videoDict valueForKey:@"videoUrl"]];
        }
    }
    
    //outputURL = [VideoSingleton sharedInstance].temVideoUrl;

  
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
    
    [asset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
        NSLog(@" total tracks %@", asset.tracks);
    }];
    
    NSLog(@"%@", [asset tracksWithMediaType:AVMediaTypeVideo]);
    
    AVAssetTrack *videoAsset = [asset tracksWithMediaType:AVMediaTypeVideo].lastObject;
    
    // Grab the composition video track from AVMutableComposition you already made.
    AVMutableCompositionTrack *compositionVideoTrack = [mixComposition tracksWithMediaType:AVMediaTypeVideo].lastObject;
    
    
    AVMutableCompositionTrack *compositionAudioTrack = [mixComposition tracksWithMediaType:AVMediaTypeAudio].lastObject;
    
    NSURL *outputMusicURL = [NSURL fileURLWithPath:[videoDict valueForKey:@"musicUrl"]];
    AVURLAsset *aAudioAsset = [AVURLAsset URLAssetWithURL:outputMusicURL options:nil];
    
    if(aAudioAsset == nil){
        NSURL* silentAudioUrl = [[NSBundle mainBundle] URLForResource:@"silence" withExtension:@"mp3"];
        aAudioAsset = [AVURLAsset URLAssetWithURL:silentAudioUrl options:nil];
    }
    
    [aAudioAsset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
        NSLog(@" total tracks %@", asset.tracks);
    }];
    
    CMTime trimmingTime = CMTimeMake(lround(videoAsset.naturalTimeScale / videoAsset.nominalFrameRate), videoAsset.naturalTimeScale);
    CMTimeRange timeRange = CMTimeRangeMake(trimmingTime, CMTimeSubtract(videoAsset.timeRange.duration, trimmingTime));
    if(isPhotoToVideo){
        [videoTrack insertTimeRange:videoAsset.timeRange ofTrack:videoAsset atTime:kCMTimeZero error:nil];
    }else{
        [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:kCMTimeZero error:nil];
    }
    
    NSLog(@"%@", [aAudioAsset tracksWithMediaType:AVMediaTypeAudio]);
    AVAssetTrack *audioAsset;
    audioAsset = [[aAudioAsset tracksWithMediaType:AVMediaTypeAudio] lastObject];
    CGFloat startTime = [[videoDict valueForKey:@"startTime"] floatValue];
    // CMTime videoduration = CMTimeGetSeconds(asset.duration);
    NSLog(@" asset duration %f", CMTimeGetSeconds(asset.duration));
    CGFloat endTime = startTime + CMTimeGetSeconds(asset.duration);
    
    CMTime songTimeRange = CMTimeMake(startTime*1000, 1000);
    CMTime stopTime = CMTimeMake(endTime*1000, 1000);
    CMTimeRange exportTimeRange = CMTimeRangeFromTimeToTime(songTimeRange, stopTime);
    
    [audioTrack insertTimeRange:exportTimeRange ofTrack:audioAsset atTime:kCMTimeZero error:nil];
    
    NSString* documentsDirectory= [RNCamera applicationDocumentsDirectory];
    NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
    formatter.dateFormat = @"ddMMMyyyyHHmmss";
    NSString* dateString = [formatter stringFromDate: [NSDate date]];
    NSString* fileName = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video_song_preview.mp4"];
    //                fileName = [fileName stringByAppendingString:dateString];
    //                fileName = [fileName stringByAppendingFormat:@".mp4"];
    NSString * myDocumentPath= [documentsDirectory stringByAppendingPathComponent:fileName];
    NSURL * urlVideoMain = [[NSURL alloc] initFileURLWithPath: myDocumentPath];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:myDocumentPath])
    {
        [[NSFileManager defaultManager] removeItemAtPath:myDocumentPath error:nil];
    }
    
    AVAssetExportSession *exporter = [[AVAssetExportSession alloc] initWithAsset:mixComposition presetName:AVAssetExportPresetHighestQuality];
    exporter.outputURL = urlVideoMain;
    exporter.outputFileType = @"com.apple.quicktime-movie";
    exporter.shouldOptimizeForNetworkUse = YES;
    
    [exporter exportAsynchronouslyWithCompletionHandler:^{
        
        currentTime = kCMTimeZero;
        
        switch ([exporter status]){
            case AVAssetExportSessionStatusFailed:
                
                break;
            case AVAssetExportSessionStatusCancelled:
                
                break;
            case AVAssetExportSessionStatusCompleted:{
                NSMutableDictionary *result = [[NSMutableDictionary alloc] init];
                dispatch_async(dispatch_get_main_queue(), ^{
                    NSURL * outputURL = exporter.outputURL;
                    
                    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
                    NSArray *tracks = [asset tracksWithMediaType:AVMediaTypeVideo];
                    AVAssetTrack *track = [tracks objectAtIndex:0];
                    
                    unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:outputURL.path error:nil] fileSize];
                    
                    NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
                    [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
                    [dateFormatter stringFromDate:[NSDate date]];
                    //                        NSLog(@"%@",[dateFormatter stringFromDate:[NSDate date]]);
                    
                    BOOL IsLandscape = self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait? NO :  TRUE;
                    
                    NSString *image_name = fileName;
                    NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
                    NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
                    
                    NSString *image_width = [NSString stringWithFormat:@"%d", (int)track.naturalSize.width];
                    NSString *image_height = [NSString stringWithFormat:@"%d",(int)track.naturalSize.height];
                    NSArray *videoArr = [[NSArray alloc] initWithObjects:outputURL.path, nil];
                    
                    NSMutableDictionary *video = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"video", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", outputURL.path, @"path", @(IsLandscape), @"isLandscape", image_date, @"updated_At", nil];
                    
                    NSDictionary *videoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:video, @"Video", nil];
                    completionHandler(videoResponse);
                    
                    VideoSingleton *videoSingletonObj = [VideoSingleton sharedInstance];
                    videoSingletonObj.originalVideoUrl = outputURL;
                    videoSingletonObj.temVideoUrl = outputURL;
                });
            }
                break;
            default:
                break;
        }
    }];
}



+ (void)VideoWithSongFromPreview:(NSDictionary *)videoDict completionHandler:(void (^)(NSURL * _Nullable))completionHandler{
    
    CGFloat totalDuration;
    totalDuration = 0;
    
    __block CMTime currentTime = kCMTimeZero;
    
    AVMutableComposition *mixComposition = [[AVMutableComposition alloc] init];
    
    AVMutableCompositionTrack *videoTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    AVMutableCompositionTrack *audioTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeAudio
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    //AVAsset *asset = [AVAsset assetWithURL:[videoDict valueForKey:@"videoUrl"]];
    NSURL *outputURL = VideoSingleton.sharedInstance.temVideoUrl;
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
    
    [asset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
        NSLog(@" total tracks %@", asset.tracks);
    }];
    
    NSLog(@"%@", [asset tracksWithMediaType:AVMediaTypeVideo]);
    
    AVAssetTrack *videoAsset = [asset tracksWithMediaType:AVMediaTypeVideo].lastObject;
    
    // Grab the composition video track from AVMutableComposition you already made.
    AVMutableCompositionTrack *compositionVideoTrack = [mixComposition tracksWithMediaType:AVMediaTypeVideo].lastObject;
    
    
    AVMutableCompositionTrack *compositionAudioTrack = [mixComposition tracksWithMediaType:AVMediaTypeAudio].lastObject;
    
    NSURL *outputMusicURL = [NSURL fileURLWithPath:[videoDict valueForKey:@"musicUrl"]];
    AVURLAsset *aAudioAsset = [AVURLAsset URLAssetWithURL:outputMusicURL options:nil];
    
    [aAudioAsset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
        NSLog(@" total tracks %@", asset.tracks);
    }];
    
    CMTime trimmingTime = CMTimeMake(lround(videoAsset.naturalTimeScale / videoAsset.nominalFrameRate), videoAsset.naturalTimeScale);
    CMTimeRange timeRange = CMTimeRangeMake(trimmingTime, CMTimeSubtract(videoAsset.timeRange.duration, trimmingTime));
    [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:kCMTimeZero error:nil];
    
    NSLog(@"%@", [aAudioAsset tracksWithMediaType:AVMediaTypeAudio]);
    AVAssetTrack *audioAsset;
    audioAsset = [[aAudioAsset tracksWithMediaType:AVMediaTypeAudio] lastObject];
    CGFloat startTime = [[videoDict valueForKey:@"startTime"] floatValue];
    // CMTime videoduration = CMTimeGetSeconds(asset.duration);
    NSLog(@" asset duration %f", CMTimeGetSeconds(asset.duration));
    CGFloat endTime = startTime + CMTimeGetSeconds(asset.duration);
    
    CMTime songTimeRange = CMTimeMake(startTime*1000, 1000);
    CMTime stopTime = CMTimeMake(endTime*1000, 1000);
    CMTimeRange exportTimeRange = CMTimeRangeFromTimeToTime(songTimeRange, stopTime);
    
    [audioTrack insertTimeRange:exportTimeRange ofTrack:audioAsset atTime:kCMTimeZero error:nil];
    
    NSString* documentsDirectory= [RNCamera applicationDocumentsDirectory];
    NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
    formatter.dateFormat = @"ddMMMyyyyHHmmss";
    NSString* dateString = [formatter stringFromDate: [NSDate date]];
    NSString* fileName = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video_preview.mp4"];
    //                fileName = [fileName stringByAppendingString:dateString];
    //                fileName = [fileName stringByAppendingFormat:@".mp4"];
    NSString * myDocumentPath= [documentsDirectory stringByAppendingPathComponent:fileName];
    NSURL * urlVideoMain = [[NSURL alloc] initFileURLWithPath: myDocumentPath];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:myDocumentPath])
    {
        [[NSFileManager defaultManager] removeItemAtPath:myDocumentPath error:nil];
    }
    
    AVAssetExportSession *exporter = [[AVAssetExportSession alloc] initWithAsset:mixComposition presetName:AVAssetExportPresetHighestQuality];
    exporter.outputURL = urlVideoMain;
    exporter.outputFileType = @"com.apple.quicktime-movie";
    exporter.shouldOptimizeForNetworkUse = YES;
    
    [exporter exportAsynchronouslyWithCompletionHandler:^{
        
        currentTime = kCMTimeZero;
        
        switch ([exporter status]){
            case AVAssetExportSessionStatusFailed:
                
                break;
            case AVAssetExportSessionStatusCancelled:
                break;
                
            case AVAssetExportSessionStatusCompleted:{
                NSMutableDictionary *result = [[NSMutableDictionary alloc] init];
                dispatch_async(dispatch_get_main_queue(), ^{
                    VideoSingleton *videoSingletonObj = [VideoSingleton sharedInstance];
                    videoSingletonObj.temVideoUrl = exporter.outputURL;
                    completionHandler(exporter.outputURL);
                });
            }
                break;
            default:
                break;
        }
    }];
}


+ (void)MergeVideoWith:(NSMutableArray *)videoArray audio:(NSMutableArray *)AudioArray completionHandler:(void (^)(NSURL * _Nullable))completionHandler{
    
    NSLog(@"Video:%@ --- Audio:%@", videoArray, AudioArray);

    
    
    CGFloat totalDuration;
    totalDuration = 0;
    
    __block CMTime currentTime = kCMTimeZero;
    
    AVMutableComposition *mixComposition = [[AVMutableComposition alloc] init];
    
    AVMutableCompositionTrack *videoTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    AVMutableCompositionTrack *audioTrack = [mixComposition addMutableTrackWithMediaType:AVMediaTypeAudio
                                                                        preferredTrackID:kCMPersistentTrackID_Invalid];
    
    NSUInteger index = 0;
    
    for (id object in videoArray)
    {
        AVAsset *asset = [AVAsset assetWithURL:[NSURL URLWithString:[object valueForKey:@"videoUrl"]]];
        NSURL* url = [NSURL URLWithString:[object valueForKey:@"videoUrl"]];
        
        if([[NSFileManager defaultManager] fileExistsAtPath:url.path]){
            NSLog(@"FileExists");
        }
        
        [asset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
            NSLog(@" total tracks %@", asset.tracks);
        }];
        
        NSLog(@"VIDEO TRACKS %@ %@", [asset tracksWithMediaType:AVMediaTypeVideo], url);
        NSLog(@"AUDIO TRACKS %@", [asset tracksWithMediaType:AVMediaTypeAudio]);
        
        AVAssetTrack *videoAsset = [asset tracksWithMediaType:AVMediaTypeVideo].lastObject;
        AVAssetTrack *audioAsset;
        audioAsset = [asset tracksWithMediaType:AVMediaTypeAudio].lastObject;
        
//        CMTime trimmingTime = CMTimeMake(lround(videoAsset.naturalTimeScale / videoAsset.nominalFrameRate), videoAsset.naturalTimeScale);
//        CMTimeRange timeRange = CMTimeRangeMake(trimmingTime, CMTimeSubtract(videoAsset.timeRange.duration, trimmingTime));
//
        
        
        
        // Grab the composition video track from AVMutableComposition you already made.
        AVMutableCompositionTrack *compositionVideoTrack = [mixComposition tracksWithMediaType:AVMediaTypeVideo].lastObject;
        
        
        AVMutableCompositionTrack *compositionAudioTrack = [mixComposition tracksWithMediaType:AVMediaTypeAudio].lastObject;
        
        //                AVAssetTrack *audioAsset;
        if(![[AudioArray objectAtIndex:index] isEqual: @""]){
            AVAsset *aAudioAsset = [AVAsset assetWithURL:[NSURL URLWithString:[[AudioArray objectAtIndex:index] valueForKey:@"musicUrl"]]];
            
            
            if (aAudioAsset == nil){
                aAudioAsset =   [AVAsset assetWithURL:[NSURL URLWithString:[object valueForKey:@"musicUrl"]]];
            }
                
            [aAudioAsset loadValuesAsynchronouslyForKeys:@[@"playable",@"tracks"] completionHandler:^{
                NSLog(@" total tracks %@", asset.tracks);
            }];
            audioAsset = [[aAudioAsset tracksWithMediaType:AVMediaTypeAudio] lastObject];
            CGFloat startTime = [[[AudioArray objectAtIndex:index] valueForKey:@"startTime"] floatValue];
            CGFloat endTime = [[[AudioArray objectAtIndex:index] valueForKey:@"endTime"] floatValue];

            CMTime trimmingTime = CMTimeMake(lround(videoAsset.naturalTimeScale / videoAsset.nominalFrameRate), videoAsset.naturalTimeScale);
            //                    CMTimeRange timeRange = CMTimeRangeMake(trimmingTime, CMTimeSubtract(videoAsset.timeRange.duration, trimmingTime));
//            CMTimeRange timeRange = CMTimeRangeMake(kCMTimeZero, videoAsset.timeRange.duration);

            CMTime lastFrame = CMTimeMakeWithSeconds(0.1, NSEC_PER_SEC);
            CMTimeRange timeRange = CMTimeRangeMake(kCMTimeZero, CMTimeSubtract(videoAsset.timeRange.duration, lastFrame));

            
            
            
            NSLog(@"time range = %f %f %f", CMTimeGetSeconds(trimmingTime), CMTimeGetSeconds(CMTimeSubtract(videoAsset.timeRange.duration, trimmingTime)),CMTimeGetSeconds(videoAsset.timeRange.duration));

            //To apply speed for video only during music sync.
            [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:kCMTimeZero error:nil];
            CMTimeRange actualVideDuration = CMTimeRangeMake(kCMTimeZero, videoAsset.timeRange.duration);

            if ([[object valueForKey:@"speedLevel"] intValue] == 1){
                double videoScaleFactor = 3;
                CMTime videoDuration = timeRange.duration;

                [videoTrack scaleTimeRange:actualVideDuration toDuration:CMTimeMake(videoAsset.timeRange.duration.value*videoScaleFactor, videoAsset.timeRange.duration.timescale)];
                currentTime = CMTimeAdd(currentTime,CMTimeMultiply( timeRange.duration, 3));
                CMTime temtrimmingTime =  CMTimeMultiply(videoAsset.timeRange.duration, 3);
                endTime = startTime + CMTimeGetSeconds(temtrimmingTime);
                NSLog(@"video range = %f %f", CMTimeGetSeconds(temtrimmingTime),endTime);
            }else if ([[object valueForKey:@"speedLevel"] intValue] == 2){
                double videoScaleFactor = 2.0;
                CMTime videoDuration = timeRange.duration;

                [videoTrack scaleTimeRange:actualVideDuration toDuration:CMTimeMake(videoAsset.timeRange.duration.value*videoScaleFactor, videoAsset.timeRange.duration.timescale)];
                CMTime temtrimmingTime =  CMTimeMultiply( videoAsset.timeRange.duration, 2);
                currentTime = CMTimeAdd(currentTime,CMTimeMultiply( timeRange.duration, 2));
                endTime = startTime + CMTimeGetSeconds(temtrimmingTime);
                NSLog(@"video range = %f %f", CMTimeGetSeconds(temtrimmingTime),endTime);

            }else if([[object valueForKey:@"speedLevel"] intValue] == 4) {
                double videoScaleFactor = 2.0;
                CMTime videoDuration = timeRange.duration;

                [videoTrack scaleTimeRange:actualVideDuration
                                toDuration:CMTimeMake(videoAsset.timeRange.duration.value/videoScaleFactor, videoAsset.timeRange.duration.timescale)];
                CMTime temtrimmingTime =   CMTimeMake(videoAsset.timeRange.duration.value/videoScaleFactor, videoAsset.timeRange.duration.timescale);
                currentTime = CMTimeAdd(currentTime,temtrimmingTime);
                endTime = startTime + CMTimeGetSeconds(temtrimmingTime);
                NSLog(@"video range = %f %f", CMTimeGetSeconds(temtrimmingTime),endTime);

            }else if([[object valueForKey:@"speedLevel"] intValue] == 5) {
                double videoScaleFactor = 3.0;
                CMTime videoDuration = timeRange.duration;

                [videoTrack scaleTimeRange:actualVideDuration
                                toDuration:CMTimeMake(videoAsset.timeRange.duration.value/videoScaleFactor, videoAsset.timeRange.duration.timescale)];
                CMTime temtrimmingTime =   CMTimeMake(videoAsset.timeRange.duration.value/videoScaleFactor, videoAsset.timeRange.duration.timescale);
                currentTime = CMTimeAdd(currentTime,temtrimmingTime);
                endTime = startTime + CMTimeGetSeconds(temtrimmingTime);
                NSLog(@"video range = %f %f", CMTimeGetSeconds(temtrimmingTime),endTime);

            }else{
                currentTime = CMTimeAdd(kCMTimeZero,timeRange.duration);;
                endTime = startTime + CMTimeGetSeconds(videoAsset.timeRange.duration);
                //songTimeRange = CMTimeRangeMake(CMTimeMake(startTime, 1), videoAsset.timeRange.duration);
            }

            CMTime songTimeRange = CMTimeMake(startTime*1000, 1000);
            CMTime stopTime = CMTimeMake(endTime*1000, 1000);
            NSLog(@"video asset range = %f",CMTimeGetSeconds(videoAsset.asset.duration));
            NSLog(@"Audio range = %f and %f", CMTimeGetSeconds(songTimeRange), CMTimeGetSeconds(stopTime));
            CMTimeRange exportTimeRange = CMTimeRangeFromTimeToTime(songTimeRange, stopTime);
            [audioTrack insertTimeRange:exportTimeRange ofTrack:audioAsset atTime:kCMTimeZero error:nil];

        }else{
            //audioAsset = [[asset tracksWithMediaType:AVMediaTypeAudio] firstObject];
            currentTime = kCMTimeZero;
            CMTime trimmingTime = CMTimeMake(lround(videoAsset.naturalTimeScale / videoAsset.nominalFrameRate), videoAsset.naturalTimeScale);
        
            CMTime lastFrame = CMTimeMakeWithSeconds(0.1, NSEC_PER_SEC);

            CMTimeRange timeRange = CMTimeRangeMake(currentTime, CMTimeSubtract(videoAsset.timeRange.duration, lastFrame));
        
        
            if ([[object valueForKey:@"speedLevel"] intValue] == 1){
                NSError *videoError,*audioError;
                BOOL videoResult = [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:currentTime error:&videoError];
                BOOL audioResult = [audioTrack insertTimeRange:timeRange ofTrack:audioAsset atTime:currentTime error:&audioError];
                
                if (!audioResult || audioError){
                    DLog(@"%@", audioError);
                }
                
                double videoScaleFactor = 3;
                CMTime videoDuration = timeRange.duration;
                
                [compositionVideoTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value*videoScaleFactor, videoDuration.timescale)];
                [compositionAudioTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value*videoScaleFactor, videoDuration.timescale)];
                
                
                if(!videoResult || videoError) {
                    
                } else {
                    currentTime = CMTimeAdd(currentTime,CMTimeMultiply( timeRange.duration, 3));
                }
            }else if ([[object valueForKey:@"speedLevel"] intValue] == 2){
                NSError *videoError,*audioError;
                BOOL videoResult = [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:currentTime error:&videoError];
                BOOL audioResult = [audioTrack insertTimeRange:timeRange ofTrack:audioAsset atTime:currentTime error:&audioError];
                
                if (!audioResult || audioError){
                    DLog(@"%@", audioError);
                }
                
                double videoScaleFactor = 2.0;
                CMTime videoDuration = timeRange.duration;
                
                [compositionVideoTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value*videoScaleFactor, videoDuration.timescale)];
                [compositionAudioTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value*videoScaleFactor, videoDuration.timescale)];
                
                
                if(!videoResult || videoError) {
                    
                } else {
                    currentTime = CMTimeAdd(currentTime,CMTimeMultiply( timeRange.duration, 2));
                }
            }else if ([[object valueForKey:@"speedLevel"] intValue]== 3  ||  [[object valueForKey:@"speedLevel"] intValue] == 0){
                NSError *videoError,*audioError;
                BOOL videoResult = [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:currentTime error:&videoError];
                BOOL audioResult = [audioTrack insertTimeRange:timeRange ofTrack:audioAsset atTime:currentTime  error:&audioError];
                
                if (!audioResult || audioError){
                    DLog(@"%@", audioError);
                }
                
                if(!videoResult || videoError) {
                    NSLog(@"video Error %@", videoError);
                } else {
                    currentTime = CMTimeAdd(currentTime,timeRange.duration);
                }
                
            }else if([[object valueForKey:@"speedLevel"] intValue] == 4) {
                NSError *videoError,*audioError;
                BOOL videoResult = [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:currentTime error:&videoError];
                BOOL audioResult = [audioTrack insertTimeRange:timeRange ofTrack:audioAsset atTime:currentTime error:&audioError];
                
                if (!audioResult || audioError){
                    DLog(@"%@", audioError);
                }
                
                
                double videoScaleFactor = 2.0;
                CMTime videoDuration = timeRange.duration;
                
                [compositionVideoTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale)];
                [compositionAudioTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale)];
                
                
                
                
                if(!videoResult || videoError) {
                    
                } else {
                    CMTime temtrimmingTime =   CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale);
                    currentTime = CMTimeAdd(currentTime,temtrimmingTime);
                }
            }else{
                NSError *videoError,*audioError;
                BOOL videoResult = [videoTrack insertTimeRange:timeRange ofTrack:videoAsset atTime:currentTime error:&videoError];
                BOOL audioResult = [audioTrack insertTimeRange:timeRange ofTrack:audioAsset atTime:currentTime error:&audioError];
                
                if (!audioResult || audioError){
                    DLog(@"AUDIO ERROR %@", audioError);
                }
                
                
                double videoScaleFactor = 3.0;
                CMTime videoDuration = timeRange.duration;
                
                [compositionVideoTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale)];
                [compositionAudioTrack scaleTimeRange:CMTimeRangeMake(currentTime, videoDuration)
                                           toDuration:CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale)];
                
                
                
                
                if(!videoResult || videoError) {
                    
                } else {
                    CMTime temtrimmingTime =   CMTimeMake(videoDuration.value/videoScaleFactor, videoDuration.timescale);
                    currentTime = CMTimeAdd(currentTime,temtrimmingTime);
                }
                
            }
            NSLog(@"total = %f", CMTimeGetSeconds(currentTime));
            NSLog(@"trimming = %f", CMTimeGetSeconds(trimmingTime));
            //NSLog(@"Speed Level = %d", [[self.speedLevelArrary objectAtIndex:index] intValue]);
            NSLog(@"timeRange start = %f", CMTimeGetSeconds(timeRange.start));
            NSLog(@"timeRange end = %f", CMTimeGetSeconds(timeRange.duration));
            NSLog(@"final composite end = %f", CMTimeGetSeconds(compositionVideoTrack.timeRange.duration));
        }
        
        index++;
    }
    
    
    NSString* documentsDirectory= [self applicationDocumentsDirectory];
    

    NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
    formatter.dateFormat = @"ddMMMyyyyHHmmss";
    NSString* dateString = [formatter stringFromDate: [NSDate date]];
    NSString* fileName = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video.mp4"];

    
    
    
    
    
    
    NSString * myDocumentPath= [documentsDirectory stringByAppendingPathComponent:fileName];
    NSURL * urlVideoMain = [[NSURL alloc] initFileURLWithPath: myDocumentPath];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:myDocumentPath]){
        [[NSFileManager defaultManager] removeItemAtPath:myDocumentPath error:nil];
    }
    
    AVAssetExportSession *exporter = [[AVAssetExportSession alloc] initWithAsset:mixComposition presetName:AVAssetExportPresetHighestQuality];
    exporter.outputURL = urlVideoMain;
    exporter.outputFileType = @"com.apple.quicktime-movie";
    exporter.shouldOptimizeForNetworkUse = YES;
    
    [exporter exportAsynchronouslyWithCompletionHandler:^{
        
        currentTime = kCMTimeZero;
        
        switch ([exporter status]){
            case AVAssetExportSessionStatusFailed:
                
                break;
            case AVAssetExportSessionStatusCancelled:
                break;
                
            case AVAssetExportSessionStatusCompleted:{
                dispatch_async(dispatch_get_main_queue(), ^{
                    completionHandler(exporter.outputURL);
                });
            }
                break;
            default:
                break;
        }
    }];
}


- (void)MergeVideo:(NSString *)options completionHandler:(void (^)(NSDictionary * _Nullable))completionHandler{
    if (_isVideoProcessing == YES){
        _completionHandler = completionHandler;
        _isMergeInitiated = true;
    }else{
        [self.cameraView stopRunning];
        recordedUrls=[[[recordedUrls reverseObjectEnumerator] allObjects] mutableCopy];
        recordedMusicUrls=[[[recordedMusicUrls reverseObjectEnumerator] allObjects] mutableCopy];
        
        if (is_merge_started == false){
            is_merge_started = true;
            
            
            [RNCamera MergeVideoWith:recordedUrls audio:recordedMusicUrls completionHandler:^(NSURL *result){
                __block NSURL * outputURL = result;
                
                __block AVURLAsset *asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
                __block NSArray *tracks = [asset tracksWithMediaType:AVMediaTypeVideo];
                __block AVAssetTrack *track = [tracks objectAtIndex:0];
                
                unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:outputURL.path error:nil] fileSize];
                
                NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
                [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
                [dateFormatter stringFromDate:[NSDate date]];
                
                BOOL IsLandscape = self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait? NO :  TRUE;
                
                
                NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
                formatter.dateFormat = @"ddMMMyyyyHHmmss";
                NSString* dateString = [formatter stringFromDate: [NSDate date]];
                NSString* image_name = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video_preview.mp4"];

                
                NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
                NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
                
                NSString *image_width = [NSString stringWithFormat:@"%d", (int)track.naturalSize.width];
                NSString *image_height = [NSString stringWithFormat:@"%d",(int)track.naturalSize.height];
                NSArray *videoArr = [[NSArray alloc] initWithObjects:outputURL.path, nil];
                NSMutableArray *urlArray = [[NSMutableArray alloc] initWithArray:recordedUrls];
                NSMutableArray *urlMusicArray = [[NSMutableArray alloc] initWithArray:recordedMusicUrls];
                
                CGFloat videoDuration = CMTimeGetSeconds(asset.duration);
                videoDuration = videoDuration * 1000.0; //converting in to milliseconds
                
                //same music without glitch
//                NSOrderedSet *orderedSet = [NSOrderedSet orderedSetWithArray:recordedMusicUrls];
//                NSArray *arrayWithoutDuplicates = [orderedSet array];
                NSArray * your_array = [self groupsWithDuplicatesRemoved:(NSArray *)recordedMusicUrls myKeyParameter:@"musicUrl"];
                
                //same song no gap laps..
                if([your_array count] == 1 && ![[your_array objectAtIndex:0] isEqual:@""]){
                    NSString *videoPath = [NSString stringWithFormat: @"file://%@", outputURL.path];

                    NSMutableDictionary *videoDict = [[NSMutableDictionary alloc] initWithObjectsAndKeys: [[your_array objectAtIndex:0] valueForKey:@"musicUrl"], @"musicUrl", videoPath, @"videoUrl", [[recordedMusicUrls lastObject] valueForKey:@"startTime"], @"startTime", nil];
                    [self MergeVideoWithSongFromPreview:videoDict isPreview:NO isPhotoToVideo:NO completionHandler:^(NSDictionary * dictValue) {
                        NSLog(@"%@ dict",[dictValue valueForKey:@"Video"]);
                        outputURL = [NSURL fileURLWithPath:[[dictValue valueForKey:@"Video"] valueForKey:@"path"]];
                        asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
                        tracks = [asset tracksWithMediaType:AVMediaTypeVideo];
                        track = [tracks objectAtIndex:0];
                        CGFloat videoDuration = CMTimeGetSeconds(asset.duration);
                        videoDuration = videoDuration * 1000.0; //converting in to milliseconds

                        NSMutableDictionary *video = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"video", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", outputURL.path, @"path", @(IsLandscape), @"isLandscape", image_date, @"updated_At", urlArray, @"recordedUrls",urlMusicArray,@"recordedMusicUrls",[NSString stringWithFormat:@"%f",track.nominalFrameRate], @"frame_rate",[NSString stringWithFormat:@"%.02f",videoDuration], @"duration",nil];
                        
                        NSDictionary *videoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:video, @"videoData", nil];
                        completionHandler(videoResponse);
                        
                        self.setVideoLayer = true;
                        mergedVideoUrl = outputURL;
                        _videoURL = outputURL;
                        self.speedLevel = [NSNumber numberWithInt:3];
                        [reverseVideo removeAllObjects];
                        //                            interfaceOrientation = UIInterfaceOrientationMaskAllButUpsideDown;
                        DeviceSingleton *singleton = [DeviceSingleton sharedInstance];
                        [singleton UpdateDeviceOrienationWithOrientation:UIInterfaceOrientationMaskAllButUpsideDown];
                        
                        
                        VideoSingleton *videoSingletonObj = [VideoSingleton sharedInstance];
                        videoSingletonObj.temVideoSegment = [[NSMutableArray alloc] init];
                        videoSingletonObj.temVideoSegment = [NSMutableArray new];
                        videoSingletonObj.VideoSegment = recordedUrls;
                        videoSingletonObj.temVideoSegment = recordedUrls;
                        videoSingletonObj.AudioSegment = recordedMusicUrls;
                        videoSingletonObj.TemAudioSegment = recordedMusicUrls;
                        videoSingletonObj.originalVideoUrl = outputURL;
                        videoSingletonObj.temVideoUrl = outputURL;
                       }];
                }else{

                    NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
                    formatter.dateFormat = @"ddMMMyyyyHHmmss";
                    NSString* dateString = [formatter stringFromDate: [NSDate date]];
                    NSString* image_name = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video.mp4"];

                    NSMutableDictionary *video = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"video", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", outputURL.path, @"path", @(IsLandscape), @"isLandscape", image_date, @"updated_At", urlArray, @"recordedUrls",urlMusicArray,@"recordedMusicUrls",[NSString stringWithFormat:@"%f",track.nominalFrameRate],@"frame_rate",[NSString stringWithFormat:@"%.02f",videoDuration],@"duration",nil];
                    
                    NSDictionary *videoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:video, @"videoData", nil];
                    completionHandler(videoResponse);
                    
                    
                    
                    
                    self.setVideoLayer = true;
                    mergedVideoUrl = outputURL;
                    _videoURL = outputURL;
                    self.speedLevel = [NSNumber numberWithInt:3];
                    [reverseVideo removeAllObjects];
                    //                            interfaceOrientation = UIInterfaceOrientationMaskAllButUpsideDown;
                    DeviceSingleton *singleton = [DeviceSingleton sharedInstance];
                    [singleton UpdateDeviceOrienationWithOrientation:UIInterfaceOrientationMaskAllButUpsideDown];
                    
                    
                    VideoSingleton *videoSingletonObj = [VideoSingleton sharedInstance];
                    videoSingletonObj.VideoSegment = recordedUrls;
                    videoSingletonObj.temVideoSegment = recordedUrls;
                    videoSingletonObj.AudioSegment = recordedMusicUrls;
                    videoSingletonObj.TemAudioSegment = recordedMusicUrls;
                    videoSingletonObj.originalVideoUrl = outputURL;
                    videoSingletonObj.temVideoUrl = outputURL;
                }
            }];
        }
    }
}

- (NSMutableArray *) groupsWithDuplicatesRemoved:(NSArray *)  groups myKeyParameter:(NSString *)myKeyParameter {
    NSMutableArray * groupsFiltered = [[NSMutableArray alloc] init];    //This will be the array of groups you need
    NSMutableArray * groupNamesEncountered = [[NSMutableArray alloc] init]; //This is an array of group names seen so far

    NSString * name;        //Preallocation of group name
    for (NSDictionary * group in groups) {  //Iterate through all groups
        if([group isEqual:@""]){
            [groupsFiltered addObject:group];
        }else{
            name = [NSString stringWithFormat:@"%@", [group objectForKey:myKeyParameter]]; //Get the group name
            if ([groupNamesEncountered indexOfObject: name]==NSNotFound) {  //Check if this group name hasn't been encountered before
                [groupNamesEncountered addObject:name]; //Now you've encountered it, so add it to the list of encountered names
                [groupsFiltered addObject:group];   //And add the group to the list, as this is the first time it's encountered
            }
        }
    }
    return groupsFiltered;
}

- (void) setAudioFormat:(CMFormatDescriptionRef) fmt
{
    const AudioStreamBasicDescription *asbd = CMAudioFormatDescriptionGetStreamBasicDescription(fmt);
    if (asbd == nil) {
        return;
    }
    _samplerate = asbd->mSampleRate;
    _channels = asbd->mChannelsPerFrame;
}


- (CMSampleBufferRef) adjustTime:(CMSampleBufferRef) sample by:(CMTime) offset
{
    CMItemCount count;
    CMSampleBufferGetSampleTimingInfoArray(sample, 0, nil, &count);
    CMSampleTimingInfo* pInfo = malloc(sizeof(CMSampleTimingInfo) * count);
    CMSampleBufferGetSampleTimingInfoArray(sample, count, pInfo, &count);
    for (CMItemCount i = 0; i < count; i++)
    {
        pInfo[i].decodeTimeStamp = CMTimeSubtract(pInfo[i].decodeTimeStamp, offset);
        pInfo[i].presentationTimeStamp = CMTimeSubtract(pInfo[i].presentationTimeStamp, offset);
    }
    CMSampleBufferRef sout;
    CMSampleBufferCreateCopyWithNewTiming(nil, sample, count, pInfo, &sout);
    free(pInfo);
    return sout;
}



- (void)capturePhoto:(NSString *)options completionHandler:(void (^)(NSDictionary *))completionHandler{
    
    AudioServicesPlaySystemSound(1108);
    
    if (self.presetCamera == 1){
        if (self.flashMode == 3){
            [self.cameraView BackFlashActivate];
        }

        double delayInSeconds = 0.3;
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
       
        dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        UIImage *sampleImg = [[UIImage alloc] initWithPixelBuffer:self.cameraView.previewView.pixelBuffer];
        BOOL IsLandscape = TRUE;
        if (self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait){
            IsLandscape = NO;
        }
            
        
        if (sampleImg != nil){
            NSURL *isPhotoCaptured =  [self.cameraView saveImageWithImage:sampleImg];
            
            unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:isPhotoCaptured.path error:nil] fileSize];
            NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
            [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
            [dateFormatter stringFromDate:[NSDate date]];
            
            NSString *image_name = @"litpicimg";
            NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
            NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
            NSString *image_width = [NSString stringWithFormat:@"%d",(int)sampleImg.size.width];
            NSString *image_height = [NSString stringWithFormat:@"%d",(int)sampleImg.size.height];
            
            NSMutableDictionary *photo = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"photo", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", isPhotoCaptured.path, @"path", @(IsLandscape) , @"isLandscape", image_date, @"updated_At", nil, @"frame_rate",nil, @"duration", nil];
            
            NSDictionary *photoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:photo, @"imageData", nil];
            completionHandler(photoResponse);
        }
            
            if (self.flashMode == 3){
                [self.cameraView BackFlashActivate];
            }
         });

    }else{
        if (self.flashMode == 3){
           
            //MARK: Torch WhiteBackground for PhotoClick addView.
            UIView *newView = [[UIView alloc] initWithFrame:CGRectMake(0,0,self.cameraView.frame.size.width,self.cameraView.frame.size.height)];
            
            [UIView animateWithDuration:0.3 delay:0.0 options:UIViewAnimationOptionCurveLinear  animations:^{
                newView.backgroundColor=[UIColor whiteColor];
                [self.cameraView addSubview:newView];
                
                } completion:^(BOOL finished) {
                    //code for completion
                }];

            CGFloat bright = UIScreen.mainScreen.brightness;
            [[UIScreen mainScreen] setBrightness:1.0];
            
            double delayInSeconds = 0.3;
            dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
           
            dispatch_after(popTime, dispatch_get_main_queue(), ^(void){

                UIImage *sampleImg = [[UIImage alloc] initWithPixelBuffer:self.cameraView.previewView.pixelBuffer];
                BOOL IsLandscape = TRUE;
                if (self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait){
                    IsLandscape = NO;
                }
                
                //MARK: Torch WhiteBackground for PhotoClick release removeView.
                newView.backgroundColor=[UIColor clearColor];
                [self.cameraView removeFromSuperview];
                             
                [[UIScreen mainScreen] setBrightness:bright];
                
                
                if (sampleImg != nil){
                    NSURL *isPhotoCaptured =  [self.cameraView saveImageWithImage:sampleImg];
                    
                    unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:isPhotoCaptured.path error:nil] fileSize];
                    NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
                    [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
                    [dateFormatter stringFromDate:[NSDate date]];
                    
                    NSString *image_name = @"litpicimg";
                    NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
                    NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
                    NSString *image_width = [NSString stringWithFormat:@"%d",(int)sampleImg.size.width];
                    NSString *image_height = [NSString stringWithFormat:@"%d",(int)sampleImg.size.height];
                    
                    NSMutableDictionary *photo = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"photo", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", isPhotoCaptured.path, @"path", @(IsLandscape) , @"isLandscape", image_date, @"updated_At", nil];
                    
                    NSDictionary *photoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:photo, @"imageData", nil];
                    completionHandler(photoResponse);
                }
                
            });
        }else{
            
            UIImage *sampleImg = [[UIImage alloc] initWithPixelBuffer:self.cameraView.previewView.pixelBuffer];
            BOOL IsLandscape = TRUE;
            if (self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait){
                IsLandscape = NO;
            }
            
            
            
            if (sampleImg != nil){
                NSURL *isPhotoCaptured =  [self.cameraView saveImageWithImage:sampleImg];
                
                unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:isPhotoCaptured.path error:nil] fileSize];
                NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
                [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
                [dateFormatter stringFromDate:[NSDate date]];
                
                NSString *image_name = @"litpicimg";
                NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
                NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
                NSString *image_width = [NSString stringWithFormat:@"%d",(int)sampleImg.size.width];
                NSString *image_height = [NSString stringWithFormat:@"%d",(int)sampleImg.size.height];
                
                NSMutableDictionary *photo = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"photo", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", isPhotoCaptured.path, @"path", @(IsLandscape) , @"isLandscape", image_date, @"updated_At", nil];
                
                NSDictionary *photoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:photo, @"imageData", nil];
                completionHandler(photoResponse);
            }
        }
    }
}




static CGFloat DegreesToRadians(CGFloat degrees) {return degrees * M_PI / 180;};


- (UIImage *)rotateImage:(UIImage*)image byDegree:(CGFloat)degrees
{
    UIView *rotatedViewBox = [[UIView alloc] initWithFrame:CGRectMake(0,0,image.size.width, image.size.height)];
    CGAffineTransform t = CGAffineTransformMakeRotation(DegreesToRadians(degrees));
    rotatedViewBox.transform = t;
    CGSize rotatedSize = rotatedViewBox.frame.size;
    
    UIGraphicsBeginImageContext(rotatedSize);
    CGContextRef bitmap = UIGraphicsGetCurrentContext();
    
    
    CGContextTranslateCTM(bitmap, rotatedSize.width, rotatedSize.height);
    
    CGContextRotateCTM(bitmap, DegreesToRadians(degrees));
    
    
    CGContextScaleCTM(bitmap, 1.0, -1.0);
    CGContextDrawImage(bitmap, CGRectMake(-image.size.width, -image.size.height, image.size.width, image.size.height), [image CGImage]);
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
    
}


+ (AVAsset *)assetByReversingAsset:(AVAsset *)asset videoComposition:(AVMutableVideoComposition *)videoComposition duration:(CMTime)duration outputURL:(NSURL *)outputURL  {
    
    NSError *error;
    AVAssetTrack *videoTrack = [[asset tracksWithMediaType:AVMediaTypeVideo] lastObject];
    NSMutableArray *timeRangeArray = [NSMutableArray array];
    NSMutableArray *startTimeArray = [NSMutableArray array];
    CMTime startTime = kCMTimeZero;
    for (NSInteger i = 0; i <(CMTimeGetSeconds(duration)); i ++) {
        CMTimeRange timeRange = CMTimeRangeMake(startTime, CMTimeMakeWithSeconds(1, duration.timescale));
        if (CMTimeRangeContainsTimeRange(videoTrack.timeRange, timeRange)) {
            [timeRangeArray addObject:[NSValue valueWithCMTimeRange:timeRange]];
        } else {
            timeRange = CMTimeRangeMake(startTime, CMTimeSubtract(duration, startTime));
            [timeRangeArray addObject:[NSValue valueWithCMTimeRange:timeRange]];
        }
        [startTimeArray addObject:[NSValue valueWithCMTime:startTime]];
        startTime = CMTimeAdd(timeRange.start, timeRange.duration);
    }
    
    NSMutableArray *tracks = [NSMutableArray array];
    NSMutableArray *assets = [NSMutableArray array];
    
    
    for (NSInteger i = 0; i < timeRangeArray.count; i ++) {
        AVMutableComposition *subAsset = [[AVMutableComposition alloc]init];
        AVMutableCompositionTrack *subTrack =   [subAsset addMutableTrackWithMediaType:AVMediaTypeVideo preferredTrackID:kCMPersistentTrackID_Invalid];
        [subTrack  insertTimeRange:[timeRangeArray[i] CMTimeRangeValue] ofTrack:videoTrack atTime:[startTimeArray[i] CMTimeValue] error:nil];
        AVAsset *assetNew = [subAsset copy];
        AVAssetTrack *assetTrackNew = [[assetNew tracksWithMediaType:AVMediaTypeVideo] lastObject];
        [tracks addObject:assetTrackNew];
        [assets addObject:assetNew];
    }
    
    AVAssetReader *totalReader = nil ;;
    
    NSDictionary *totalReaderOutputSettings = [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithInt:kCVPixelFormatType_420YpCbCr8BiPlanarFullRange], kCVPixelBufferPixelFormatTypeKey, nil];
    AVAssetReaderOutput *totalReaderOutput = nil;
    if (videoComposition) {
        totalReaderOutput = [AVAssetReaderVideoCompositionOutput assetReaderVideoCompositionOutputWithVideoTracks:@[videoTrack] videoSettings:totalReaderOutputSettings];
        ((AVAssetReaderVideoCompositionOutput *)totalReaderOutput).videoComposition = videoComposition;
    } else {
        totalReaderOutput = [AVAssetReaderTrackOutput assetReaderTrackOutputWithTrack:videoTrack outputSettings:totalReaderOutputSettings];
    }
    totalReader = [[AVAssetReader alloc] initWithAsset:asset error:&error];
    if([totalReader canAddOutput:totalReaderOutput]){
        [totalReader addOutput:totalReaderOutput];
    } else {
        return nil;
    }
    [totalReader startReading];
    NSMutableArray *sampleTimes = [NSMutableArray array];
    CMSampleBufferRef totalSample;
    
    while((totalSample = [totalReaderOutput copyNextSampleBuffer])) {
        CMTime presentationTime = CMSampleBufferGetPresentationTimeStamp(totalSample);
        [sampleTimes addObject:[NSValue valueWithCMTime:presentationTime]];
        CFRelease(totalSample);
    }
    
    //ÈÖçÁΩÆWriter
    AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL
                                                      fileType:AVFileTypeMPEG4
                                                         error:&error];
    NSDictionary *videoCompressionProps = [NSDictionary dictionaryWithObjectsAndKeys:
                                           @(videoTrack.estimatedDataRate), AVVideoAverageBitRateKey,
                                           nil];
    CGFloat width = videoTrack.naturalSize.width;
    CGFloat height = videoTrack.naturalSize.height;
    if (videoComposition) {
        width = videoComposition.renderSize.width;
        width = videoComposition.renderSize.height;
    }
    NSDictionary *writerOutputSettings = [NSDictionary dictionaryWithObjectsAndKeys:
                                          AVVideoCodecH264, AVVideoCodecKey,
                                          [NSNumber numberWithInt:height], AVVideoHeightKey,
                                          [NSNumber numberWithInt:width], AVVideoWidthKey,
                                          videoCompressionProps, AVVideoCompressionPropertiesKey,
                                          nil];
    AVAssetWriterInput *writerInput = [[AVAssetWriterInput alloc] initWithMediaType:AVMediaTypeVideo
                                                                     outputSettings:writerOutputSettings
                                                                   sourceFormatHint:(__bridge CMFormatDescriptionRef)[videoTrack.formatDescriptions lastObject]];
    [writerInput setExpectsMediaDataInRealTime:NO];
    
    // Initialize an input adaptor so that we can append PixelBuffer
    AVAssetWriterInputPixelBufferAdaptor *pixelBufferAdaptor = [[AVAssetWriterInputPixelBufferAdaptor alloc] initWithAssetWriterInput:writerInput sourcePixelBufferAttributes:nil];
    
    [writer addInput:writerInput];
    
    [writer startWriting];
    [writer startSessionAtSourceTime:videoTrack.timeRange.start];
    
    NSInteger counter = 0;
    size_t countOfFrames = 0;
    size_t totalCountOfArray = 40;
    size_t arrayIncreasment = 40;
    CMSampleBufferRef *sampleBufferRefs = (CMSampleBufferRef *) malloc(totalCountOfArray * sizeof(CMSampleBufferRef *));
    memset(sampleBufferRefs, 0, sizeof(CMSampleBufferRef *) * totalCountOfArray);
    for (NSInteger i = tracks.count -1; i <= tracks.count; i --) {
        
        AVAssetReader *reader = nil;
        
        countOfFrames = 0;
        AVAssetReaderOutput *readerOutput = nil;
        if (videoComposition) {
            readerOutput = [AVAssetReaderVideoCompositionOutput assetReaderVideoCompositionOutputWithVideoTracks:@[tracks[i]] videoSettings:totalReaderOutputSettings];
            ((AVAssetReaderVideoCompositionOutput *)readerOutput).videoComposition = videoComposition;
        } else {
            readerOutput = [AVAssetReaderTrackOutput assetReaderTrackOutputWithTrack:tracks[i] outputSettings:totalReaderOutputSettings];
        }
        
        reader = [[AVAssetReader alloc] initWithAsset:assets[i] error:&error];
        if([reader canAddOutput:readerOutput]){
            [reader addOutput:readerOutput];
        } else {
            break;
        }
        [reader startReading];
        
        CMSampleBufferRef sample;
        while((sample = [readerOutput copyNextSampleBuffer])) {
            CMTime presentationTime = CMSampleBufferGetPresentationTimeStamp(sample);
            if (CMTIME_COMPARE_INLINE(presentationTime, >=, [startTimeArray[i] CMTimeValue])) {
                if (countOfFrames  + 1 > totalCountOfArray) {
                    totalCountOfArray += arrayIncreasment;
                    sampleBufferRefs = (CMSampleBufferRef *)realloc(sampleBufferRefs, totalCountOfArray);
                }
                *(sampleBufferRefs + countOfFrames) = sample;
                countOfFrames++;
            } else {
                if (sample != NULL) {
                    CFRelease(sample);
                }
            }
        }
        [reader cancelReading];
        for(NSInteger j = 0; j < countOfFrames; j++) {
            // Get the presentation time for the frame
            if (counter > sampleTimes.count - 1) {
                break;
            }
            CMTime presentationTime = [sampleTimes[counter] CMTimeValue];
            
            CMSampleBufferRef bufferRef = *(sampleBufferRefs + countOfFrames - j - 1);
            CVPixelBufferRef imageBufferRef = CMSampleBufferGetImageBuffer(bufferRef);
            
            while (!writerInput.readyForMoreMediaData) {
                [NSThread sleepForTimeInterval:0.1];
            }
            [pixelBufferAdaptor appendPixelBuffer:imageBufferRef withPresentationTime:presentationTime];
            counter++;
            CFRelease(bufferRef);
            *(sampleBufferRefs + countOfFrames - j - 1) = NULL;
        }
    }
    free(sampleBufferRefs);
    
    [writer finishWriting];
    return [AVAsset assetWithURL:outputURL];
}


+ (NSString*) applicationDocumentsDirectory{
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString* basePath = ([paths count] > 0) ? [paths objectAtIndex:0] : nil;
    return basePath;
}

- (void)videoRecorded:(NSURL *)url musicDict:(NSDictionary *)musicDict{
    reverseVideoCount = reverseVideoCount + 1;
    
    if([self.speedLevel intValue] == 0){
        
        [self.cameraView reverseVideoWithVideoURL:url fileName:[NSString stringWithFormat:@"reverseVideo%d", _currentFile] :^(NSURL *videoUrl, NSError *err){
            
            if (videoUrl != nil){
                NSLog(@"REVERSED %@", videoUrl);
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    NSURL* musicURL = [NSURL URLWithString:[musicDict valueForKey:@"musicUrl"]];
                    if (![[musicDict valueForKey:@"musicUrl"] isEqualToString:@""]){
                        
                    }else{
                        musicURL = url;
                    }
                    
                    [self.cameraView mergeVideoWithAudioWithVideoUrl:videoUrl audioUrl:musicURL fileName:[NSString stringWithFormat:@"reverseFinal%d", _currentFile]:^(NSURL *reverseVideoUrl, NSError *err){
                        NSLog(@" CURRENT FILE IN REVERSE %d",self.cameraView.currentFile);
                        self.cameraView.currentFile = self.cameraView.currentFile - 1;
                        [self deleteParticularVideo:url ind:self.cameraView.currentFile];
                        

                        reverseVideoCount = reverseVideoCount - 1;
                        
                        
                        NSMutableDictionary *reverseMusicDic = [[NSMutableDictionary alloc] initWithDictionary:musicDict];
                        
                        NSLog(@"REVERSE %@%@", musicDict, reverseVideoUrl);
                        
                        [reverseMusicDic setObject:reverseVideoUrl.absoluteString forKey:@"videoUrl"];
                        
                        [recordedUrls addObject: reverseMusicDic];
                        if(![[musicDict valueForKey:@"musicUrl"] isEqual: @""]){
                            [recordedMusicUrls addObject:reverseMusicDic];
                        }else{
                            [recordedMusicUrls addObject:@""];
                        }
                        [videosPlayItem addObject:videoUrl.path];
                        _isVideoProcessing = false;
                        
                        if (self.isMergeInitiated == YES && reverseVideoCount == 0){
                            [self MergeVideo:@"" completionHandler:_completionHandler];
                        }
                    }];
                });
            }
        }];
        
        
        
    }else{
        reverseVideoCount = reverseVideoCount - 1;
        [recordedUrls addObject: musicDict];
        if(![[musicDict valueForKey:@"musicUrl"] isEqual: @""]){
            [recordedMusicUrls addObject:musicDict];
        }else{
            [recordedMusicUrls addObject:@""];
        }
        [videosPlayItem addObject:url.path];
        _isVideoProcessing = false;
    }
    
    [self.speedLevelArrary addObject:self.speedLevel];
    
    
    
    _currentFile = self.cameraView.currentFile + 1;
    NSLog(@"CURRENT FILE ON STOP RECORDING %d,%d,%d",_currentFile,[recordedUrls count],self.cameraView.currentFile);
    dispatch_async(dispatch_get_main_queue(), ^{
        [self setupWritter];
    });
}



- (void)applyLiveFilter{
    if (self.setVideoLayer == true) {
        [self.videoPreviewLayer setFilterWithFilterValues:self.filter];
    }else{
        [self.cameraView setFilterWithFilterValues:self.filter];
    }
}

-(void)updateSpeedLevel:(nonnull NSNumber *)level{
    [self.cameraView setCurrentSpeedLevelWithLevel:[level integerValue]];
}


- (void)changeCameraMode{
    [self.cameraView changeCamera: self.presetCamera];
}


- (void)onReady:(NSDictionary *)event{
    
}

- (void)updateFlashMode{
    //[self.cameraView  tourch:self.flashMode];
}

- (void)updateCameraActiveStatus {
    [self.cameraView updateCameraActiveWithCameraStatus:self.isCameraActive];
}


- (void)BackFlashActivate{
    [self.cameraView  BackFlashActivate];
}


- (void)BrightnessOnOff{
    [self.cameraView  BrightnessOnOff];
}

// Music Audio
- (void)updateMusicMode:(NSString *)URL track_id:(NSString*)trackID trackDetail:(NSDictionary *)trackDetail completionHandler:(void (^)(NSString *))completionBlock{
    self.isMusicAdded = YES;
    [self.cameraView playMusicOnBackground:URL _trackId:trackID trackDetail:trackDetail completionHandler:^(NSString *response) {
        completionBlock(response);
    }];
}

-(void)streamPlaySong: (NSURL *)streamURL{
    [self.cameraView streamMusicPlay:streamURL];
}

-(void)streamPauseSong{
    [self.cameraView streamMusicPause];
}

-(void)streamPlayWithSeekSong: (NSURL *)streamURL toSeek:(double)toSeek {
    [self.cameraView streamMusicSeekAndPlay:streamURL seconds:toSeek];
}

-(void)stopMusicAfterTrim:(double)toSeek {
    [self.cameraView stopMusicAfterTrimmerWithSeconds:toSeek];
}

-(void)cameraRemoveFromSuperView {
    [self.cameraView removeCameraLayer];
}

-(void)cameraInsertToSuperView {
    [self.cameraView insertCameraLayer];
}

-(void)setRecordedUrls:(NSArray *)videoUrls musicUrls:(NSArray *)musicUrls {
    NSMutableArray* mutablevideoArrays = [NSMutableArray  arrayWithArray:videoUrls];
    NSMutableArray* mutableMusicArrays = [NSMutableArray  arrayWithArray:musicUrls];
    mutablevideoArrays = [[[mutablevideoArrays reverseObjectEnumerator] allObjects] mutableCopy];
    mutableMusicArrays = [[[mutableMusicArrays reverseObjectEnumerator] allObjects] mutableCopy];
    [mutablevideoArrays addObjectsFromArray:recordedUrls];
    [mutableMusicArrays addObjectsFromArray:recordedMusicUrls];
    
    recordedUrls = mutablevideoArrays;
    recordedMusicUrls = mutableMusicArrays;
    //    NSString* filename = [NSString stringWithFormat:@"capture%d.mp4", [recordedUrls count]];
    //    NSString* documentsDirectory= [self applicationDocumentsDirectory];
    //    NSString * myDocumentPath= [documentsDirectory stringByAppendingPathComponent:filename];
    //    NSURL * urlVideoMain = [[NSURL alloc] initFileURLWithPath: myDocumentPath];
    //    NSString* path = urlVideoMain.path;
    //    if([[NSFileManager defaultManager] fileExistsAtPath:myDocumentPath]){
    //        NSLog(@"REMOVED FILE OF LAST WRITER %@",myDocumentPath,[recordedUrls count]);
    //        [[NSFileManager defaultManager] removeItemAtPath:myDocumentPath error:nil];
    //    }
    //    for (int i=[mutablevideoArrays count] - 1; i>=0; i--) {
    //        [recordedUrls insertObject:[mutablevideoArrays objectAtIndex:i] atIndex:0];
    //        [recordedMusicUrls insertObject:[mutableMusicArrays objectAtIndex:i] atIndex:0];
    //    }
    //    recordedUrls = [[[recordedUrls reverseObjectEnumerator] allObjects] mutableCopy];
    //    recordedMusicUrls = [[[recordedMusicUrls reverseObjectEnumerator] allObjects] mutableCopy];
}

-(void)setCurrentFileNumber: (NSInteger*)index {
    //    if(self.cameraView.currentFile != index){
    // _currentFile = (int) index;
    [self.cameraView currentFileIndexChangeWithIndex:index completionHandler:^(NSInteger fileindex) {
        _currentFile = (int) fileindex;
        self.cameraView.portraitEncoder.videoInput = nil;
        self.cameraView.landscapeLeftEncoderBackCamera.videoInput = nil;
        self.cameraView.landscapeLeftEncoderFrontCamera.videoInput = nil;
        self.cameraView.landscapeRightEncoderBackCamera.videoInput = nil;
        self.cameraView.landscapeRightEncoderFrontCamera.videoInput = nil;
        //dispatch_async(dispatch_get_main_queue(), ^{
        [self setupWritter];
        //});
    }];
    //[self.cameraView currentFileIndexChangeWithIndex:index];
    //        dispatch_async(dispatch_get_main_queue(), ^{
    //            [self setupWritter];
    //        });
    //    }
}

-(void)deleteParticularVideo: (NSURL*) fileUrl ind:(NSInteger)fileIndex {
    _currentFile = (int) fileIndex;
    [self.cameraView currentFileIndexChangeAfterDeleteWithIndex:fileIndex];
    if([[NSFileManager defaultManager] fileExistsAtPath:fileUrl.path])
    {
        [[NSFileManager defaultManager] removeItemAtPath:fileUrl.path error:nil];
        NSLog(@"FASTLY DELETED VIDEOS %@",fileUrl);
        self.cameraView.portraitEncoder.videoInput = nil;
        self.cameraView.landscapeLeftEncoderBackCamera.videoInput = nil;
        self.cameraView.landscapeLeftEncoderFrontCamera.videoInput = nil;
        self.cameraView.landscapeRightEncoderBackCamera.videoInput = nil;
        self.cameraView.landscapeRightEncoderFrontCamera.videoInput = nil;
        //dispatch_async(dispatch_get_main_queue(), ^{
        [self setupWritter];
        //});
    }
    
}

-(void)clearDocumentsDirectory: (NSArray *)urls currentFileIndex:(NSInteger *)currentFileIndex{
    _currentFile = (int) currentFileIndex;
    [self.cameraView currentFileIndexChangeAfterDeleteWithIndex:currentFileIndex];
    NSLog(@"FILES TO CLEAR %d",[urls count]);
    for (int i = 0; i < [urls count]; i++) {
        NSString* fileDir = [[urls objectAtIndex:i] valueForKey:@"videoUrl"];
        NSURL* fileUrl = [NSURL URLWithString:fileDir];
        if([[NSFileManager defaultManager] fileExistsAtPath:fileUrl.path])
        {
            NSError *error;
            BOOL success = [[NSFileManager defaultManager] removeItemAtPath:fileUrl.path error:&error];
            if (success) {
                NSLog(@"SUCCESSFULLY REMOVED");
            }else{
                NSLog(@"Could not delete file -:%@ ",[error localizedDescription]);
            }
        }
    }
    NSLog(@"CURRENT FILE AFTER RNCAMERA %d",self.cameraView.currentFile);
    self.cameraView.portraitEncoder.videoInput = nil;
    self.cameraView.landscapeLeftEncoderBackCamera.videoInput = nil;
    self.cameraView.landscapeLeftEncoderFrontCamera.videoInput = nil;
    self.cameraView.landscapeRightEncoderBackCamera.videoInput = nil;
    self.cameraView.landscapeRightEncoderFrontCamera.videoInput = nil;
    dispatch_async(dispatch_get_main_queue(), ^{
        [self setupWritter];
    });
}

-(void)deleteAllDocumentDirectory{
    [self.cameraView deleteDocumentDirectory];
}

-(void)cancelSync{
    self.isMusicAdded = NO;
    [self.cameraView syncCancelOrExit];
}

-(void)deleteLastVideo{
    if (recordedUrls != nil && recordedUrls.count > 0){
        // NSDictionary *lastElement = [recordedUrls objectAtIndex:[recordedUrls count] - 1];
        // [self clearDocumentsDirectory:[NSArray arrayWithObject:lastElement] currentFileIndex:[recordedUrls count] - 1];
        [recordedUrls removeLastObject];
        [videosPlayItem removeLastObject];
        
        if (recordedUrls.count == 0){
            self.isOrientationLocked = NO;
            self.blockRotation = NO;
            self.liveFilter.IsOrientationLock = NO;
            self.IsLockDirection = UIInterfaceOrientationUnknown;
            
            DeviceSingleton *singleton = [DeviceSingleton sharedInstance];
            [singleton UpdateDeviceOrienationWithOrientation:UIInterfaceOrientationMaskAllButUpsideDown];
        }
        
        //music details
        if(recordedMusicUrls.count != 0){
            [recordedMusicUrls removeLastObject];
        }
    }
}

-(void)deleteURLFromDirectoryOnLive{
    NSLog(@"DELETING SEGMENTS BOTH LIVE AND RECORDED %d %d",[recordedUrls count],_currentFile);
    NSDictionary *lastElement = [recordedUrls lastObject];
    NSString* fileDir = [lastElement valueForKey:@"videoUrl"];
    NSURL* fileUrl = [NSURL URLWithString:fileDir];
    NSArray *fileListItems = [fileDir componentsSeparatedByString:@"."];
    NSString* mainFileName = [fileListItems firstObject];
    NSString* lastDigit = [mainFileName substringWithRange:NSMakeRange([mainFileName length] - 1, 1)];
    NSInteger framedIndex = [lastDigit integerValue];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:fileUrl.path])
    {
        NSError *error;
        BOOL success = [[NSFileManager defaultManager] removeItemAtPath:fileUrl.path error:&error];
        if (success) {
            NSLog(@"SUCCESSFULLY REMOVED");
            if(![[recordedMusicUrls lastObject] isEqual:@""]){
                double deletedSegmentStartTime = [[[recordedMusicUrls lastObject] valueForKey:@"startTime"] doubleValue];
                self.cameraView.startingSeekTime = deletedSegmentStartTime;
                self.cameraView.audioPlayer.currentTime = deletedSegmentStartTime;
            }
        }else{
            NSLog(@"Could not delete file -:%@ ",[error localizedDescription]);
        }
    }
    self.cameraView.currentFile = framedIndex;
    _currentFile = framedIndex;
    self.cameraView.portraitEncoder.videoInput = nil;
    self.cameraView.landscapeLeftEncoderBackCamera.videoInput = nil;
    self.cameraView.landscapeLeftEncoderFrontCamera.videoInput = nil;
    self.cameraView.landscapeRightEncoderBackCamera.videoInput = nil;
    self.cameraView.landscapeRightEncoderFrontCamera.videoInput = nil;
    dispatch_async(dispatch_get_main_queue(), ^{
        [self setupWritter];
    });
    
    //[self clearDocumentsDirectory:[NSArray arrayWithObject:lastElement] currentFileIndex:[recordedUrls count] - 1];
}

- (void)multiplePhotosToVideos:(NSArray *)photoArray completionHandler:(void (^)(NSDictionary * _Nullable))completionHandler{
    [self.cameraView onPickMultiplePhotosWithPhotoArray:photoArray completion:^(NSURL *url, NSError * error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            __block NSURL * outputURL = url;
            
            AVURLAsset *asset = [AVURLAsset URLAssetWithURL:outputURL options:nil];
            NSArray *tracks = [asset tracksWithMediaType:AVMediaTypeVideo];
            AVAssetTrack *track = [tracks objectAtIndex:0];
            
            unsigned long long fileSize = [[[NSFileManager defaultManager] attributesOfItemAtPath:outputURL.path error:nil] fileSize];
            
            NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
            [dateFormatter setDateFormat:@"yyyy-mm-dd HH:mm:ss"];
            [dateFormatter stringFromDate:[NSDate date]];
            
            BOOL IsLandscape = self.cameraView.statusBarOrientation == UIInterfaceOrientationPortrait? NO :  TRUE;
            
            
            NSDateFormatter* formatter = [[NSDateFormatter alloc]init];
            formatter.dateFormat = @"ddMMMyyyyHHmmss";
            NSString* dateString = [formatter stringFromDate: [NSDate date]];
            NSString* image_name = [NSString stringWithFormat:@"%@%@", dateString,  @"merge_video_preview.mp4"];

            
            NSString *image_date = [dateFormatter stringFromDate:[NSDate date]];
            NSString *image_size = [NSString stringWithFormat:@"%.2f MB",(float)fileSize/1024.0f/1024.0f];
            
            NSString *image_width = [NSString stringWithFormat:@"%d", (int)track.naturalSize.width];
            NSString *image_height = [NSString stringWithFormat:@"%d",(int)track.naturalSize.height];
            NSArray *videoArr = [[NSArray alloc] initWithObjects:outputURL.path, nil];
            NSMutableArray *urlArray = [[NSMutableArray alloc] init];
            NSMutableArray *urlMusicArray = [[NSMutableArray alloc] init];
            CGFloat videoDuration = CMTimeGetSeconds(asset.duration);
            videoDuration = videoDuration * 1000.0; //converting in to milliseconds
            
            
                    NSMutableDictionary *video = [[NSMutableDictionary alloc] initWithObjectsAndKeys: image_name, @"fileName", @"video", @"type", image_size , @"size", image_date, @"created_At", image_height, @"height", image_width, @"width", outputURL.path, @"path", @(IsLandscape), @"isLandscape", image_date, @"updated_At", urlArray, @"recordedUrls",urlMusicArray,@"recordedMusicUrls",[NSString stringWithFormat:@"%f",track.nominalFrameRate],@"frame_rate",[NSString stringWithFormat:@"%.02f",videoDuration],@"duration",nil];
                    
                    NSDictionary *videoResponse = [[NSDictionary alloc] initWithObjectsAndKeys:video, @"videoData", nil];
                    completionHandler(videoResponse);
                    
                    self.setVideoLayer = true;
                    mergedVideoUrl = outputURL;
                    _videoURL = outputURL;
                    self.speedLevel = [NSNumber numberWithInt:3];
                    //                            interfaceOrientation = UIInterfaceOrientationMaskAllButUpsideDown;
                    DeviceSingleton *singleton = [DeviceSingleton sharedInstance];
                    [singleton UpdateDeviceOrienationWithOrientation:UIInterfaceOrientationMaskAllButUpsideDown];
                    
                    
                    VideoSingleton *videoSingletonObj = [VideoSingleton sharedInstance];
//                    videoSingletonObj.VideoSegment = recordedUrls;
//                    videoSingletonObj.temVideoSegment = recordedUrls;
//                    videoSingletonObj.AudioSegment = recordedMusicUrls;
                    videoSingletonObj.originalVideoUrl = outputURL;
                    videoSingletonObj.temVideoUrl = outputURL;
        });
    }];
}

- (void)changeSilhoutteMode:(NSMutableArray *)videoUrlsRecorded  completionHandler:(void (^)(NSURL * _Nullable))completionHandler{
    NSString * filePath;
    if([recordedUrls count]== 0){
        filePath = [[videoUrlsRecorded objectAtIndex: 0] valueForKey:@"videoUrl"];
    }else{
        filePath = [[recordedUrls objectAtIndex: [recordedUrls count] - 1] valueForKey:@"videoUrl"];
    }
    self._isSilhoutte = !self._isSilhoutte;
    completionHandler([self.cameraView extractLastFrameFromVideoWithVideoURL:[[NSURL alloc] initWithString:filePath]]);
}

- (void)updateFilterConfig{
    [self.videoPreviewLayer setFilterConfigWithFilterConfig:self.filterConfig];
}

//- (void)applyLiveFilter{
//    if (self.setVideoLayer == true) {
//        [self.videoPreviewLayer setFilterWithFilterValues:self.filter];
//    }else{
//        [self.cameraView setFilterWithFilterValues:self.filter];
//    }
//}
//
//-(void)updateSpeedLevel:(nonnull NSNumber *)level{
//    [self.cameraView setCurrentSpeedLevelWithLevel:[level integerValue]];
//}

-(void)updateLoopValue:( BOOL *)loopValue{
    [self.videoPreviewLayer setVideoLoopWithIsLoop:loopValue];
}

-(void)updateVideoLayer {
    
}

-(void)updatePictureSize{
    
}

-(void)updateType{
    
}

- (void)updateFocusDepth{
    
}

- (void)updateWhiteBalance{
    
}

- (void)updateExposure{
    
}

- (void)updateCaptureAudio{
    
}

- (void)updateZoom {
    
}


-(void)updateSilhoutte:(BOOL)flag {
    self._isSilhoutte = flag;
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.silhoutteView removeFromSuperview];
    });
}






@end

