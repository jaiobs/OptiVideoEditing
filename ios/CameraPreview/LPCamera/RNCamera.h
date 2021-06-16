#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>
//#import "litpic-Bridging-Header.h"
//#import "litpic-Swift.h"
#import "react-native-litpic-camera-module-Bridging-Header.h"
#import "BarcodeDetectorManagerMlkit.h"
//#import "AppDelegate.h"

#ifdef DEBUG
#define DLog(s, ...) NSLog(s, ##__VA_ARGS__)
#else
#define DLog(s, ...)
#endif



@class RNCamera;

@interface RNCamera : UIView

//AVCaptureMetadataOutputObjectsDelegate,
//AVCaptureFileOutputRecordingDelegate,
//AVCaptureVideoDataOutputSampleBufferDelegate, AVCaptureAudioDataOutputSampleBufferDelegate

@property(nonatomic, strong) dispatch_queue_t _Nonnull sessionQueue;
@property(nonatomic, strong) AVCaptureDeviceInput * _Nonnull videoCaptureDeviceInput;
@property(nonatomic, strong) AVCaptureDeviceInput * _Nonnull audioCaptureDeviceInput;
//@property(nonatomic, strong) AVCaptureStillImageOutput * _Nonnull stillImageOutput;

@property(nonatomic, strong) AVCaptureMovieFileOutput * _Nonnull movieFileOutput;
@property(nonatomic, strong) AVCaptureVideoDataOutput * _Nonnull videoDataOutput;
@property(nonatomic, strong) AVAssetWriter  * _Nonnull videoWriter;
@property(nonatomic, strong)  AVAssetWriterInput * _Nonnull videoWriterInput;
@property(nonatomic, strong)  AVAssetWriterInput * _Nonnull audioWriterInput;

@property(nonatomic, strong) AVCaptureMetadataOutput * _Nonnull metadataOutput;
@property(nonatomic, strong) AVCaptureAudioDataOutput * _Nonnull audioDataOutput;
@property(nonatomic, strong) AVCaptureVideoPreviewLayer * _Nonnull previewLayer;
@property(nonatomic, strong) id _Nonnull runtimeErrorHandlingObserver;
@property(nonatomic, strong) NSArray * _Nonnull barCodeTypes;
@property(nonatomic, strong) NSArray * _Nonnull googleVisionBarcodeTypes;

@property(nonatomic, assign) NSInteger presetCamera;
@property(nonatomic, assign) NSInteger startPresetCamera;
@property(nonatomic, copy) NSString *cameraId; // copy required for strings/pointers
@property(assign, nonatomic) NSInteger flashMode;
@property(assign, nonatomic) CGFloat zoom;
@property(assign, nonatomic) CGFloat maxZoom;
@property(assign, nonatomic) NSInteger autoFocus;
@property(copy, nonatomic) NSDictionary *autoFocusPointOfInterest;
@property(assign, nonatomic) float focusDepth;
@property(assign, nonatomic) NSInteger whiteBalance;
@property(assign, nonatomic) float exposure;
@property(assign, nonatomic) float exposureIsoMin;
@property(assign, nonatomic) float exposureIsoMax;
@property(assign, nonatomic) AVCaptureSessionPreset pictureSize;
@property(nonatomic, assign) BOOL isReadingBarCodes;
@property(nonatomic, assign) BOOL isRecordingInterrupted;
@property(nonatomic, assign) BOOL isDetectingFaces;
@property(nonatomic, assign) BOOL canReadText;
@property(nonatomic, assign) BOOL canDetectFaces;
@property(nonatomic, assign) BOOL canDetectBarcodes;
@property(nonatomic, assign) BOOL captureAudio;
@property(nonatomic, assign) CGRect rectOfInterest;
@property(nonatomic, assign) BOOL isCameraActive;
@property(assign, nonatomic) AVVideoCodecType videoCodecType;
@property(assign, nonatomic) AVCaptureVideoStabilizationMode videoStabilizationMode;
@property(assign, nonatomic, nullable) NSNumber *defaultVideoQuality;
@property(assign, nonatomic, nullable) NSNumber *deviceOrientation;
@property(assign, nonatomic, nullable) NSNumber *orientation;
@property(assign, nonatomic, nullable) NSString *base64String;
@property(nonatomic, assign) NSDictionary * _Nonnull filter;
@property(nonatomic, strong) NSDictionary * _Nullable filterConfig;
@property(nonatomic, assign) NSDictionary * _Nullable videoFilesEntity;
@property(assign, nonatomic) BOOL isMusicAdded;
@property(assign, nonatomic, nullable) NSString *musicURL;
@property(assign, nonatomic) BOOL isEditMode;

@property (nonatomic , assign) UIInterfaceOrientation IsLockDirection;
@property (nonatomic , assign) BOOL blockRotation;

- (id)initWithBridge:(RCTBridge *)bridge;

- (void)changeCameraMode;

- (void)BackFlashActivate;

- (void)updateType;
- (void)updateFlashMode;
- (void)updateFocusMode;
- (void)updateFocusDepth;
- (void)updateAutoFocusPointOfInterest;
- (void)updateZoom;
- (void)updateWhiteBalance;
- (void)updateExposure;
- (void)updatePictureSize;
- (void)updateCaptureAudio;
- (void)applyLiveFilter;
- (void)updateVideoLayer;
- (void)updateFilterConfig;
- (void)updateVideoFilesEntity;
- (void)pauseResumeVideoPlay;

-(void)BrightnessOnOff;


// MUSIC SYNC PART
- (void)updateMusicMode:(NSString *)URL track_id:(NSString*)trackID trackDetail:(NSDictionary *)trackDetail completionHandler:(void (^)(NSString *))completionBlock;
- (void)streamPlaySong:(NSURL *)streamURL;
- (void)streamPauseSong;
- (void)streamPlayWithSeekSong:(NSURL *)streamURL toSeek:(double)toSeek;
-(void)stopMusicAfterTrim:(double)toSeek;
- (void)cancelSync;
-(void)updateLoopValue:( BOOL *)loopValue;

- (void)takePicture:(NSDictionary *_Nullable)options
            resolve:(RCTPromiseResolveBlock _Nullable )resolve
             reject:(RCTPromiseRejectBlock _Nullable )reject;
- (void)takePictureWithOrientation:(NSDictionary *_Nullable)options
                           resolve:(RCTPromiseResolveBlock _Nullable )resolve
                            reject:(RCTPromiseRejectBlock _Nullable )reject;
- (void)record:(NSDictionary *_Nullable)options
       resolve:(RCTPromiseResolveBlock _Nullable )resolve
        reject:(RCTPromiseRejectBlock _Nullable )reject;
- (void)recordWithOrientation:(NSDictionary *_Nullable)options
                      resolve:(RCTPromiseResolveBlock _Nullable)resolve
                       reject:(RCTPromiseRejectBlock _Nullable )reject;
- (void)stopRecording;
- (void)resumePreview;
- (void)pausePreview;
- (void)onReady:(NSDictionary *_Nullable)event;
- (void)onMountingError:(NSDictionary *_Nullable)event;
- (void)onPictureSaved:(NSDictionary *)event;
- (bool)isRecording;
- (void)onSubjectAreaChanged:(NSDictionary *_Nullable)event;
-(void)deleteLastVideo;
- (void) startRecording;
- (void) pauseRecording;
- (void) stopRecording;
- (void) resumeRecording;
-(void)updateSpeedLevel:(nonnull NSNumber *)level;
-(void)MergeVideo;
//-(void)setupWritter;
-(void)setRecordedUrls:(NSArray *)videoUrls musicUrls:(NSArray *)musicUrls;
-(void)setCurrentFileNumber: (NSInteger*)index;
-(void)clearDocumentsDirectory: (NSArray *)urls currentFileIndex:(NSInteger *)currentFileIndex;
-(id)getMergedUrl;
-(void)deleteURLFromDirectoryOnLive;
+ (CMSampleBufferRef) adjustTime:(CMSampleBufferRef) sample by:(CMTime) offset;
-(void)deleteAllDocumentDirectory;
-(void)deleteParticularVideo: (NSURL*) url ind:(NSInteger)fileIndex;

//Beautification Part
- (void)applyBeautyLayer:(BOOL)isBeautyOn;
- (void)updateBeautyEffects:(NSString *)type value:(NSString *)value;
- (void)photoCaptureWithBeautification:(void (^)(NSDictionary *))completionHandler;

//- (void)MergeVideo:(NSString *)options completionHandler:(void (^)(NSDictionary * result))completionHandler;


- (void) capturePhoto:(NSString *_Nullable)options completionHandler:(void (^_Nonnull)(NSDictionary * _Nullable result))completionHandler;
- (void) MergeVideo:(NSString *_Nullable)options completionHandler:(void (^_Nonnull)(NSDictionary * _Nullable result))completionHandler;
- (void)MergeVideoWithSongFromPreview:(NSDictionary *)videoDict isPreview:(BOOL)isPreview isPhotoToVideo:(BOOL)isPhotoToVideo completionHandler:(void (^)(NSDictionary * _Nullable))completionHandler;
+(void)VideoWithSongFromPreview:(NSDictionary *)videoDict completionHandler:(void (^)(NSURL * _Nullable))completionHandler;
+ (void)MergeVideoWith:(NSMutableArray *)videoArray audio:(NSMutableArray *)AudioArray completionHandler:(void (^)(NSURL * _Nullable))completionHandler;
- (void)multiplePhotosToVideos:(NSArray *)photoArray completionHandler:(void (^)(NSDictionary * _Nullable))completionHandler;
- (void)changeSilhoutteMode:(NSMutableArray *)videoUrlsRecorded  completionHandler:(void (^)(NSURL * _Nullable))completionHandler;
-(void)updateSilhoutte:(BOOL)flag;
- (void)updateCameraActiveStatus;
-(void)cameraRemoveFromSuperView;
-(void)cameraInsertToSuperView;

- (id _Nullable )videoUrl;
@property(nonatomic, strong) NSMutableArray* speedLevelArrary;
@property (atomic, readwrite) BOOL isCapturing;
@property (atomic, readwrite) BOOL isMergeInitiated;
@property (atomic, readwrite) BOOL isOrientationLocked;
@property (atomic, readwrite) BOOL isPaused;
@property (atomic, readwrite) BOOL setVideoLayer;
@property (atomic, readwrite) NSNumber *speedLevel;
@property (atomic, readwrite) BOOL isBeautyAdded;

//+ (void)mergeVideosWithFileURLs:(NSArray *)videoFileURLs
//             completion:(void(^)(NSURL *mergedVideoURL, NSError *error))completion;

@end

