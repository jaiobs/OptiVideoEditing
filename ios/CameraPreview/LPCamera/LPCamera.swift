//
//  LPCamera.swift
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 30/05/20.
//
import UIKit
import AVFoundation
import CoreVideo
import Photos
import MobileCoreServices
import Foundation
import AVKit
import AVFoundation
import VideoToolbox

@objc public protocol LPCameraDelegate: class {
    func videoRecorded(_ url: URL, musicDict:[String:Any]?)
    func didOutputSampleBuffer(_ sampleBuffer: CMSampleBuffer, connection: AVCaptureConnection)
}


@available(iOS 11.0, *)
@objc public class LPCamera: UIView, AVCapturePhotoCaptureDelegate, AVCaptureVideoDataOutputSampleBufferDelegate, AVCaptureDepthDataOutputDelegate, AVCaptureDataOutputSynchronizerDelegate, AVCaptureAudioDataOutputSampleBufferDelegate {
    weak var bridge: RCTBridge?
    var sensorOrientationChecker: RNSensorOrientationChecker?
    var videoRecordedResolve: RCTPromiseResolveBlock?
    var videoRecordedReject: RCTPromiseRejectBlock?
    var updateMergedURL: RCTPromiseResolveBlock?
    var textDetector: Any?
    var faceDetector: Any?
    var barcodeDetector: Any?
    var button: UIButton?
    var onCameraReady: RCTDirectEventBlock?
    var onMergeComplete: RCTDirectEventBlock?
    var onAudioInterrupted: RCTDirectEventBlock?
    var onAudioConnected: RCTDirectEventBlock?
    var onMountError: RCTDirectEventBlock?
    var onBarCodeRead: RCTDirectEventBlock?
    var onTextRecognized: RCTDirectEventBlock?
    var onFacesDetected: RCTDirectEventBlock?
    var onGoogleVisionBarcodesDetected: RCTDirectEventBlock?
    var onPictureSaved: RCTDirectEventBlock?
    var onVideoEnded: RCTDirectEventBlock?
    var finishedReadingText = false
    var finishedDetectingFace = false
    var finishedDetectingBarcodes = false
    var startText: Date?
    var startFace: Date?
    var startBarcode: Date?
    var onSubjectAreaChanged: RCTDirectEventBlock?
    var isFocusedOnPoint = false
    var isExposedOnPoint = false
    var liveFilter: LiveFilterController?
    var videoPreviewLayer: VideoPreview?
    var loadView: UIView?
    
    
    var cameraActive: Bool = true;
    
    //Music to play while recording
    @objc public var audioPlayer : AVAudioPlayer! = AVAudioPlayer()
    var isMusicMode : Bool?
    @objc public var musicURLToPlay : URL?
    var nextSegmentCheck: Bool = false
    var timer: Timer!
    var streamPlayer: AVPlayer!
    @objc public var startingSeekTime: Double = 0.0
    var previousURL: URL?
    var currentSpeedLevel: Int = 3
    var songNameSynced: String = ""
    var trackSynced: [String : Any] = [:]
    @objc public var video_frames_written = false
    
    @objc public  var previewView: MetalPreview!
    @objc public var portraitEncoder:VideoEncoder?
    @objc public var landscapeLeftEncoderFrontCamera:VideoEncoder?
    @objc public var landscapeLeftEncoderBackCamera:VideoEncoder?
    @objc public var landscapeRightEncoderFrontCamera:VideoEncoder?
    @objc public var landscapeRightEncoderBackCamera:VideoEncoder?
    
    private enum SessionSetupResult {
        case success
        case notAuthorized
        case configurationFailed
    }
    
    private var setupResult: SessionSetupResult = .success
    
    private let session = AVCaptureSession()
    
    private var isSessionRunning = false
    
    // Communicate with the session and other session objects on this queue.
    private let sessionQueue = DispatchQueue(label: "SessionQueue", attributes: [], autoreleaseFrequency: .workItem)
    
  @objc  public var videoInput: AVCaptureDeviceInput!
    private var audioInput: AVCaptureDeviceInput!
    
    private let dataOutputQueue = DispatchQueue(label: "VideoDataQueue", qos: .userInitiated, attributes: [], autoreleaseFrequency: .workItem)
    
    private let videoDataOutput = AVCaptureVideoDataOutput()
    private let audioDataOutput = AVCaptureAudioDataOutput()
    
    
    //    private let depthDataOutput = AVCaptureDepthDataOutput()
    
    private var outputSynchronizer: AVCaptureDataOutputSynchronizer?
    //    private let photoOutput = AVCapturePhotoOutput()
    //    private let videoDepthMixer = VideoMixer()
    //    private let photoDepthMixer = VideoMixer()
    
    private var filterIndex: Int = 0
    private var videoFilter: FilterRenderer?
    
    //    private var photoFilter: FilterRenderer?
    
    //    private var currentDepthPixelBuffer: CVPixelBuffer?
    
    private var renderingEnabled = true
    
    private var depthVisualizationEnabled = false
    
    //    private let processingQueue = DispatchQueue(label: "photo processing queue", attributes: [], autoreleaseFrequency: .workItem)
    
    private let videoDeviceDiscoverySession = AVCaptureDevice.DiscoverySession(deviceTypes: [.builtInDualCamera,
                                                                                             .builtInWideAngleCamera],
                                                                               mediaType: .video,
                                                                               position: .unspecified)
    
    @objc public var statusBarOrientation: UIInterfaceOrientation = .portrait
    @objc public  var delegate: LPCameraDelegate?
    @objc public var pixelBuffer: CVPixelBuffer?
    var prevFilterValues:NSDictionary = [:]
    @objc public var startRecording: Bool = false
    @objc public var currentFile: Int = 0
    @objc public var presetCamera: Int = 2
    @objc public var audioConnection: AVCaptureConnection?
    
    
    public var timeOffset: CMTime?
    public var lastVideo: CMTime?
    public var lastAudio: CMTime?
    
    public var channels: UInt32?
    public var samplerate: Float64?
    
    
    var filterDictionary:NSDictionary = [
        "NORMAL" : "CIColorControls",
        "SEPIA" : "CISepiaTone",
        "GRAYSCALE": "CIColorControls",
        "SOBEL": "CIEdges",
        "EDGE":"CIEdgeWork",
        "MONOCHROME":"CIColorMonochrome",
        "SKETCH":"CIComicEffect",
        "SOLARAISE":"CIColorInvert",
        "FALSECOLOR": "CIFalseColor",
        "CSB":"CIColorControls",
        "BLUR": "CIZoomBlur"
    ]
    
    var blurEffectView:UIVisualEffectView?
    var flashView:UIView?
    
    @objc public init?(bridge: RCTBridge?) {
        super.init(frame: .zero)
        self.bridge = bridge
        self.previewView = MetalPreview.init(rect: self.frame)
        self.flashView = UIView.init(frame: self.frame)
        self.flashView!.backgroundColor = UIColor.clear
        
        self.addSubview(self.previewView)
        self.addSubview(self.flashView!)
        
        self.sessionConfiguration()
        
        let blurEffect = UIBlurEffect(style: .dark)
        blurEffectView = UIVisualEffectView(effect: blurEffect)
        blurEffectView!.frame = self.frame
        self.addSubview(self.blurEffectView!)
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(orientationChanged(_:)),
            name: UIApplication.didChangeStatusBarOrientationNotification,
            object: nil)
    }
    
    func sessionConfiguration(){
      switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            // The user has previously granted access to the camera
            break
            
        case .notDetermined:
            /*
             The user has not yet been presented with the option to grant video access
             Suspend the SessionQueue to delay session setup until the access request has completed
             */
            sessionQueue.suspend()
            AVCaptureDevice.requestAccess(for: .video, completionHandler: { granted in
                if !granted {
                    self.setupResult = .notAuthorized
                }
                self.sessionQueue.resume()
            })
            
        default:
            // The user has previously denied access
            setupResult = .notAuthorized
        }
        
        /*
         Setup the capture session.
         In general it is not safe to mutate an AVCaptureSession or any of its
         inputs, outputs, or connections from multiple threads at the same time.
         
         Don't do this on the main queue, because AVCaptureSession.startRunning()
         is a blocking call, which can take a long time. Dispatch session setup
         to the sessionQueue so as not to block the main queue, which keeps the UI responsive.
         */
        sessionQueue.async {
            self.configureSession()
        }
    }
    
    
    @objc func orientationChanged(_ notification: Notification?) {
        self.blurEffectView?.alpha = 1
        self.bringSubviewToFront(self.blurEffectView!)

        let interfaceOrientation = UIApplication.shared.statusBarOrientation
        self.statusBarOrientation = interfaceOrientation
        self.sessionQueue.async {
            
            self.changeCamera(self.presetCamera)
            
            //            if let photoOrientation = AVCaptureVideoOrientation(interfaceOrientation: interfaceOrientation) {
            //                if let unwrappedPhotoOutputConnection = self.photoOutput.connection(with: .video) {
            //                    unwrappedPhotoOutputConnection.videoOrientation = photoOrientation
            //                }
            //            }
            //
//            if let unwrappedVideoDataOutputConnection = self.videoDataOutput.connection(with: .video) {
//                DispatchQueue.main.async {
//                    self.updateDepthUIHidden()
//
//                    if self.presetCamera == 1 {
//                        unwrappedVideoDataOutputConnection.isVideoMirrored = false
//                    }else{
//                        unwrappedVideoDataOutputConnection.isVideoMirrored = true
//                    }
//
//
//                    if UIApplication.shared.statusBarOrientation.isLandscape {
//                        unwrappedVideoDataOutputConnection.videoOrientation = .landscapeLeft
//                    } else {
//                        unwrappedVideoDataOutputConnection.videoOrientation = .portrait
//                    }
//
//
//
//                }
//
//
//                if let rotation = MetalPreview.Rotation(with: interfaceOrientation,
//                                                        videoOrientation: unwrappedVideoDataOutputConnection.videoOrientation,
//                                                        cameraPosition: self.videoInput.device.position) {
//                    self.previewView.rotation = rotation
//                }
//            }
        }
    }
    
    
    @objc public  override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    required public init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    @objc public override func layoutSubviews() {
        super.layoutSubviews()
        self.previewView.frame = self.bounds;
        self.blurEffectView?.frame = self.bounds;
        self.audioPlayer = AVAudioPlayer()
//        self.audioPlayer?.delegate = self
//        timer = Timer.scheduledTimer(timeInterval: self.nextSegmentCheck ? 1.0 : 0.9, target: self, selector: #selector(checkTime), userInfo: nil, repeats: true)
//            NSTimer.scheduledTimerWithTimeInterval(1, target: self, selector: "checkTime", userInfo: nil, repeats: true)
    }
    
    //    @objc public func setupVideoWritter(){
    //        let filename = "capture\(self.currentFile).mp4"
    //        let path = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(filename).absoluteString
    //
    //        print("--------------------------\n \(path) \n--------------------------")
    //
    //        if self.presetCamera == 2 {
    //            self.encoder = VideoEncoder(forPath: path, height: 1920, width: 1080, channels: 0, samples: Float64(0), isFrontCamera: true, recordOrientaion: self.statusBarOrientation)
    //        } else {
    //            self.encoder = VideoEncoder(forPath: path, height: 1920, width: 1080, channels: 0, samples: Float64(0), isFrontCamera: false, recordOrientaion: self.statusBarOrientation)
    //        }
    //    }
    //
    
    @objc func checkTime() {
        let END_TIME = 1.0
        if(self.musicURLToPlay != nil){
            print("AUDIO CURRENTTIME", self.audioPlayer?.currentTime)
        }
        if self.musicURLToPlay != nil && self.audioPlayer!.currentTime >= END_TIME {
            self.audioPlayer!.stop()
            timer.invalidate()
        }
    }
    
    @objc public func setCurrentSpeedLevel(level: Int) {
        self.currentSpeedLevel = level
    }
    
    @objc public func stopRunning() {
        dataOutputQueue.async {
            self.renderingEnabled = false
            self.video_frames_written = false
        }
        sessionQueue.async {
            if self.setupResult == .success {
                self.stopCaptureSession()
                self.removeObservers()
            }
        }
    }
        
    @objc public func startRecord() {
        timeOffset = CMTime.zero;
        self.startRecording = true
        if(self.musicURLToPlay == nil && isMusicMode != nil && self.isMusicMode == false){
            if session.canAddOutput(audioDataOutput) {
                self.audioConnection = self.audioDataOutput.connection(with: .audio)
                session.addOutput(audioDataOutput)
                audioDataOutput.setSampleBufferDelegate(self, queue: dataOutputQueue)
            } else {
                print("Could not add video data output to the session")
                setupResult = .configurationFailed
                session.commitConfiguration()
            }
        }
        if(isMusicMode != nil && isMusicMode == true && self.musicURLToPlay != nil){
            
            if(self.previousURL == nil || self.previousURL != self.musicURLToPlay){//update seek time for the new songs
                self.audioPlayer?.currentTime = self.startingSeekTime
                self.previousURL = self.musicURLToPlay
            }else{ // same sound continue recording without updating any seek time
                if(self.audioPlayer != nil){
                    self.startingSeekTime = self.audioPlayer!.currentTime
                }
            }
            if(currentSpeedLevel != 3 && currentSpeedLevel != 0){ // apply speed for the player
                var rate : CGFloat = 0.0
                if(currentSpeedLevel == 1){
                    rate = 1.0 * 3
                }else if(currentSpeedLevel == 2){
                    rate = 1.0 * 2
                }else if(currentSpeedLevel == 4){
                    rate = 1.0/2
                }else if(currentSpeedLevel == 5){
                    rate = 1.0/3
                }
                self.audioPlayer!.stop()
                do{
                    self.audioPlayer = try AVAudioPlayer(contentsOf: self.musicURLToPlay!)
                    self.audioPlayer?.currentTime = self.startingSeekTime
                    self.audioPlayer?.enableRate = true
                    self.audioPlayer?.prepareToPlay()
                    self.audioPlayer?.rate = Float(rate)
                    self.audioPlayer?.play()
                }catch{
                }
            }else{
                if(self.audioPlayer != nil){
                    self.audioPlayer!.stop()
                }
                    do{
                        self.audioPlayer = try AVAudioPlayer(contentsOf: self.musicURLToPlay!)
                        self.audioPlayer?.currentTime = self.startingSeekTime
                        self.audioPlayer?.enableRate = false
                        self.audioPlayer?.prepareToPlay()
                        self.audioPlayer?.rate = 1
                        self.audioPlayer?.play()
                    }catch{
                        print("ERROR NOT PLAYING MUSIC")
                    }
            }
            
        }
    }
    
    @objc public func setMusicUrl(_trackid: String){
        self.audioPlayer = AVAudioPlayer()
        do{
            let directory = try FileManager.default.url(for: FileManager.SearchPathDirectory.documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let dest: URL
            dest = directory.appendingPathComponent("\(_trackid)litpicSong").appendingPathExtension("mp3")
            if FileManager().fileExists(atPath: dest.path) {
                self.musicURLToPlay = dest
                do{
                    self.audioPlayer = try AVAudioPlayer(contentsOf: self.musicURLToPlay!)
                    self.audioPlayer?.currentTime = self.startingSeekTime
                    self.audioPlayer?.enableRate = false
                    self.audioPlayer?.prepareToPlay()
                    //self.audioPlayer?.play()
                }catch{
                    print("ERROR >>>> CANT PLAY THE AUDIO")
                }
            }
        }catch{
            print("ERROR >>>> CANT PLAY THE AUDIO")
        }
    }
    
    func clearAllWritter(url:URL,dict: [String:Any]){
        self.landscapeRightEncoderFrontCamera = nil
        self.landscapeRightEncoderBackCamera = nil
        self.landscapeLeftEncoderFrontCamera = nil
        self.landscapeLeftEncoderBackCamera = nil
        self.portraitEncoder = nil
        
        print("save completed: \(url) \(dict)")
        if(self.musicURLToPlay != nil){
            var updateCurrentSeekTime : Double = 0.0
            var startTime : Double = dict["startTime"] as! Double
            let asset = AVAsset(url: URL.init(string: url.absoluteString)!)
            let assetDuration : Double = CMTimeGetSeconds(asset.duration)
            if(self.currentSpeedLevel == 3){
                updateCurrentSeekTime = startTime  + Double(assetDuration)
            }
            print("video length stop records",self.audioPlayer!.currentTime,updateCurrentSeekTime,CMTimeGetSeconds(asset.duration),self.currentSpeedLevel)
            self.startingSeekTime = updateCurrentSeekTime
            self.audioPlayer?.currentTime = updateCurrentSeekTime
            self.currentSpeedLevel = 3
        }
        
        self.delegate?.videoRecorded(url, musicDict: dict)
        self.currentFile = self.currentFile + 1
//        UISaveVideoAtPathToSavedPhotosAlbum(url.path, self, nil, nil)
    }
    
    @objc public func currentFileIndexChange(index: Int,completionHandler: @escaping (_ param: Int) -> Void){
        if(self.currentFile < index){
            self.currentFile = index
            completionHandler(self.currentFile)
            //RNCamera().setupWritter()
        }
    }
    
    @objc public func currentFileIndexChangeAfterDelete(index: Int){
        self.currentFile = index
    }
    
    deinit {
    
    }
    
    func getDocumentsDirectory() -> URL {
        // find all possible documents directories for this user
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)

        // just send back the first one, which ought to be the only one
        return paths[0]
    }
    
    public func nativeResolutionForLocalVideo(url:URL) -> CGSize?{
        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
        let size = track.naturalSize.applying(track.preferredTransform)
        return CGSize(width: fabs(size.width), height: fabs(size.height))
    }

    
    
    @objc public func stopRecord() {
        DispatchQueue.main.async {
            self.startRecording = false
            if(self.musicURLToPlay != nil){
                //self.startingSeekTime = self.audioPlayer!.currentTime
                if(self.audioPlayer != nil){
                    self.audioPlayer!.pause()
                }
            }
            let filename = "capture\(self.currentFile).mp4"
            let path:URL = URL(fileURLWithPath: NSTemporaryDirectory(),isDirectory: true).appendingPathComponent(filename)
            let urlFile = URL.init(string: path.absoluteString)
            let urllast = self.getDocumentsDirectory().appendingPathComponent(filename)
//            let array = NSArray(contentsOfFile: urlFile!.path)
//            if let array = array {
//                array.write(toFile: url.path, atomically: true)
//            }
            var dict : [String: Any]?
            if(self.musicURLToPlay != nil){
                dict = [
                    "musicUrl": self.musicURLToPlay!.absoluteString,
                    "startTime":self.startingSeekTime,
                    "duration":self.audioPlayer?.duration,
                    "speedLevel": self.currentSpeedLevel,
                    "endTime":self.audioPlayer!.currentTime,
                    "videoUrl":urllast.absoluteString,
                    "trackSynced":self.trackSynced
                ]
                
                self.startingSeekTime = self.audioPlayer!.currentTime
                self.currentSpeedLevel = 3
                                
            }else{
                dict = [
                    "speedLevel": self.currentSpeedLevel,
                    "videoUrl":urllast.absoluteString,
                    "musicUrl":""
                ]
            }
                if (self.statusBarOrientation == .portrait) {
                    // Portrait
                    if(self.portraitEncoder != nil){
                        self.portraitEncoder!.finish(completionHandler: {
                            self.clearAllWritter(url: urllast,dict:dict!)
                        })
                    }

                }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 1){
                    // Landscapeleft Back camera
                    if(self.landscapeLeftEncoderBackCamera != nil){
                        self.landscapeLeftEncoderBackCamera!.finish(completionHandler: {
                            self.clearAllWritter(url: urllast,dict:dict!)
                        })
                    }

                }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 2){
                    // Landscapeleft Front camera
                    if(self.landscapeLeftEncoderFrontCamera != nil){
                        self.landscapeLeftEncoderFrontCamera!.finish(completionHandler: {
                            self.clearAllWritter(url: urllast,dict:dict!)
                        })
                    }

                }else if (self.statusBarOrientation == .landscapeRight && self.presetCamera == 1){
                    // LandscapeRight Back camera
                    if(self.landscapeRightEncoderBackCamera != nil){
                        self.landscapeRightEncoderBackCamera!.finish(completionHandler: {
                            self.clearAllWritter(url: urllast,dict:dict!)
                        })
                    }
                }else{
                    // LandscapeRight Front camera
                    if(self.landscapeRightEncoderFrontCamera != nil){
                        self.landscapeRightEncoderFrontCamera!.finish(completionHandler: {
                            self.clearAllWritter(url: urllast,dict:dict!)
                        })
                    }
                }
            
//            if UIApplication.shared.statusBarOrientation.isPortrait {
//                if(self.portraitEncoder != nil){
//                    self.portraitEncoder!.finish(completionHandler: {
//                        self.portraitEncoder = nil
//                        self.landscapeEncoder = nil
//
//                        print("save completed: \(url!) \(dict)")
//                        self.delegate?.videoRecorded(url!, musicDict: dict)
//                        self.currentFile = self.currentFilee + 1
//                        UISaveVideoAtPathToSavedPhotosAlbum(url!.path, self, nil, nil)
//                    })
//
//                }
//            }else{
//                if(self.landscapeEncoder != nil){
//                    self.landscapeEncoder!.finish(completionHandler: {
//                        self.portraitEncoder = nil
//                        self.landscapeEncoder = nil
//
//                        print("save completed: \(url!) \(dict)")
//                        self.delegate?.videoRecorded(url!, musicDict: dict)
//                        self.currentFile = self.currentFile + 1
//                        UISaveVideoAtPathToSavedPhotosAlbum(url!.path, self, nil, nil)
//                    })
//                }
//            }
        }
    }
    
    
    @objc public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        if newWindow == nil {
            print("view Nill - will disappear")

        }else{
            let interfaceOrientation = UIApplication.shared.statusBarOrientation
            statusBarOrientation = interfaceOrientation
            
            let initialThermalState = ProcessInfo.processInfo.thermalState
            if initialThermalState == .serious || initialThermalState == .critical {
                showThermalState(state: initialThermalState)
            }
            
            sessionQueue.async {
                switch self.setupResult {
                case .success:
                    self.addObservers()
                    
                    if let unwrappedVideoDataOutputConnection = self.videoDataOutput.connection(with: .video) {
                        
                         self.orientationupdate(unwrappedVideoDataOutputConnection)
                        
                        let videoDevicePosition = self.videoInput.device.position
                        let rotation = MetalPreview.Rotation(with: interfaceOrientation,
                                                             videoOrientation: unwrappedVideoDataOutputConnection.videoOrientation,
                                                             cameraPosition: videoDevicePosition)
                        if let rotation = rotation {
                            self.previewView.rotation = rotation
                            
                        }
                    }
                    self.dataOutputQueue.async {
                        self.renderingEnabled = true
                    }
                    
                    if(self.cameraActive) {
                        self.session.startRunning()
                        self.isSessionRunning = self.session.isRunning
                    }

                    
                    DispatchQueue.main.async {
                        self.updateDepthUIHidden()
                    }
                    
                case .notAuthorized:
                    DispatchQueue.main.async {
                        let message = NSLocalizedString("AVCamFilter doesn't have permission to use the camera, please change privacy settings",
                                                        comment: "Alert message when the user has denied access to the camera")
                        let actions = [
                            UIAlertAction(title: NSLocalizedString("OK", comment: "Alert OK button"),
                                          style: .cancel,
                                          handler: nil),
                            UIAlertAction(title: NSLocalizedString("Settings", comment: "Alert button to open Settings"),
                                          style: .`default`,
                                          handler: { _ in
                                            UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!,
                                                                      options: [:],
                                                                      completionHandler: nil)
                            })
                        ]
                        
                        self.alert(title: "AVCamFilter", message: message, actions: actions)
                    }
                    
                case .configurationFailed:
                    DispatchQueue.main.async {
                        
                        let message = NSLocalizedString("Unable to capture media",
                                                        comment: "Alert message when something goes wrong during capture session configuration")
                        
                        self.alert(title: "AVCamFilter",
                                   message: message,
                                   actions: [UIAlertAction(title: NSLocalizedString("OK", comment: "Alert OK button"),
                                                           style: .cancel,
                                                           handler: nil)])
                    }
                }
            }
        }
    }
    
    
    @objc
    func didEnterBackground(notification: NSNotification) {
        // Free up resources.
        dataOutputQueue.async {
            self.renderingEnabled = false
            if let videoFilter = self.videoFilter {
                videoFilter.reset()
            }
            //            self.videoDepthMixer.reset()
            //            self.currentDepthPixelBuffer = nil
            //                self.videoDepthConverter.reset()
            self.previewView.pixelBuffer = nil
            self.previewView.flushTextureCache()
        }
        //        processingQueue.async {
        //            if let photoFilter = self.photoFilter {
        //                photoFilter.reset()
        //            }
        //        }
    }
    
    @objc
    func willEnterForground(notification: NSNotification) {
        dataOutputQueue.async {
            self.renderingEnabled = true
        }
    }
    
    
    
    // Use this opportunity to take corrective action to help cool the system down.
    @objc
    func thermalStateChanged(notification: NSNotification) {
        if let processInfo = notification.object as? ProcessInfo {
            showThermalState(state: processInfo.thermalState)
        }
    }
    
    func showThermalState(state: ProcessInfo.ThermalState) {
        DispatchQueue.main.async {
            var thermalStateString = "UNKNOWN"
            if state == .nominal {
                thermalStateString = "NOMINAL"
            } else if state == .fair {
                thermalStateString = "FAIR"
            } else if state == .serious {
                thermalStateString = "SERIOUS"
            } else if state == .critical {
                thermalStateString = "CRITICAL"
            }
            
            let message = NSLocalizedString("Thermal state: \(thermalStateString)", comment: "Alert message when thermal state has changed")
            let actions = [
                UIAlertAction(title: NSLocalizedString("OK", comment: "Alert OK button"),
                              style: .cancel,
                              handler: nil)]
            
            self.alert(title: "AVCamFilter", message: message, actions: actions)
        }
    }
    
    
    // MARK: - KVO and Notifications
    
    private var sessionRunningContext = 0
    private var playerItemContext = 0
    
    private func addObservers() {
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(didEnterBackground),
                                               name: UIApplication.didEnterBackgroundNotification,
                                               object: nil)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(willEnterForground),
                                               name: UIApplication.willEnterForegroundNotification,
                                               object: nil)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(thermalStateChanged),
                                               name: ProcessInfo.thermalStateDidChangeNotification,
                                               object: nil)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(sessionRuntimeError),
                                               name: NSNotification.Name.AVCaptureSessionRuntimeError,
                                               object: session)
        
        session.addObserver(self, forKeyPath: "running", options: NSKeyValueObservingOptions.new, context: &sessionRunningContext)
        
        // A session can run only when the app is full screen. It will be interrupted in a multi-app layout.
        // Add observers to handle these session interruptions and inform the user.
        // See AVCaptureSessionWasInterruptedNotification for other interruption reasons.
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(sessionWasInterrupted),
                                               name: NSNotification.Name.AVCaptureSessionWasInterrupted,
                                               object: session)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(sessionInterruptionEnded),
                                               name: NSNotification.Name.AVCaptureSessionInterruptionEnded,
                                               object: session)
        
        //        NotificationCenter.default.addObserver(self,
        //                                               selector: #selector(subjectAreaDidChange),
        //                                               name: NSNotification.Name.AVCaptureDeviceSubjectAreaDidChange,
        //                                               object: videoInput.device)
    }
    
    private func removeObservers() {
        //        session.removeObserver(self, forKeyPath: "running", context: &sessionRunningContext)
        NotificationCenter.default.removeObserver(self)
    }
    
    public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey: Any]?, context: UnsafeMutableRawPointer?) {
        if context == &sessionRunningContext {
            let newValue = change?[.newKey] as AnyObject?
            guard let isSessionRunning = newValue?.boolValue else { return }
            DispatchQueue.main.async {
                //                    self.cameraButton.isEnabled = (isSessionRunning && self.videoDeviceDiscoverySession.devices.count > 1)
                //                    self.photoButton.isEnabled = isSessionRunning
                //                    self.videoFilterButton.isEnabled = isSessionRunning
            }
        } else {
            if context == &playerItemContext {
                guard context == &playerItemContext else {
                    super.observeValue(forKeyPath: keyPath,
                                       of: object,
                                       change: change,
                                       context: context)
                    return
                }

                if keyPath == #keyPath(AVPlayerItem.status) {
                    let status: AVPlayerItem.Status
                    if let statusNumber = change?[.newKey] as? NSNumber {
                        status = AVPlayerItem.Status(rawValue: statusNumber.intValue)!
                    } else {
                        status = .unknown
                    }

                    // Switch over status value
                    switch status {
                    case .readyToPlay:
                        // Player item is ready to play.
                        print("AVPLAYER READY TO PLAY")
                        break
                    case .failed:
                        // Player item failed. See error.
                        print("AVPLAYER READY TO FAILED")
                        break
                    case .unknown:
                        // Player item is not yet ready.
                        print("AVPLAYER NOT YET READY TO PLAY")
                        break
                    }
                }
            }else{
                super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
            }
        }
        
        
    }
    
    // MARK: - Session Management
    
    // Call this on the SessionQueue
    private func configureSession() {
        if setupResult != .success {
            return
        }
        
        let defaultVideoDevice: AVCaptureDevice? = videoDeviceDiscoverySession.devices.first
        
        guard let videoDevice = defaultVideoDevice else {
            print("Could not find any video device")
            setupResult = .configurationFailed
            return
        }
        
        do {
            videoInput = try AVCaptureDeviceInput(device: videoDevice)
            
        } catch {
            print("Could not create video device input: \(error)")
            setupResult = .configurationFailed
            return
        }
        
        let audioCaptureDevice = AVCaptureDevice.default(for: .audio)
        
        
        
        do {
            if let audioCaptureDevice = audioCaptureDevice {
                audioInput = try AVCaptureDeviceInput(device: audioCaptureDevice)
            }
        } catch {
            print("Could not create audio device input: \(error)")
            setupResult = .configurationFailed
            return
            
        }
        
        
        session.beginConfiguration()
        
        session.sessionPreset = AVCaptureSession.Preset.high
        session.removeInput(videoInput)
        session.removeInput(audioInput)
        
        // Add a video input.
        guard session.canAddInput(videoInput) else {
            print("Could not add video device input to the session")
            setupResult = .configurationFailed
            session.commitConfiguration()
            return
        }
        session.addInput(videoInput)
        
        
        
        guard session.canAddInput(audioInput) else {
            
            
            print("Could not add audio device input to the session")
            setupResult = .configurationFailed
            session.commitConfiguration()
            return
        }
        session.addInput(audioInput)
        
        
        // Add a video data output
        if session.canAddOutput(videoDataOutput) {
            session.addOutput(videoDataOutput)
            
            let newSettings = [
                kCVPixelBufferPixelFormatTypeKey as String: NSNumber(value: kCVPixelFormatType_32BGRA)
            ]
            
            videoDataOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)]
            videoDataOutput.setSampleBufferDelegate(self, queue: dataOutputQueue)
        } else {
            print("Could not add video data output to the session")
            setupResult = .configurationFailed
            session.commitConfiguration()
            return
        }
        
        
        if session.canAddOutput(audioDataOutput) {
            self.audioConnection = self.audioDataOutput.connection(with: .audio)
            session.addOutput(audioDataOutput)
            audioDataOutput.setSampleBufferDelegate(self, queue: dataOutputQueue)
        } else {
            print("Could not add video data output to the session")
            setupResult = .configurationFailed
            session.commitConfiguration()
            return
        }
        
        
        
        //
        //        // Add photo output
        //        if session.canAddOutput(photoOutput) {
        //            session.addOutput(photoOutput)
        //
        //            photoOutput.isHighResolutionCaptureEnabled = true
        //
        //            if depthVisualizationEnabled {
        //                if photoOutput.isDepthDataDeliverySupported {
        //                    photoOutput.isDepthDataDeliveryEnabled = true
        //                } else {
        //                    depthVisualizationEnabled = false
        //                }
        //            }
        //
        //        } else {
        //            print("Could not add photo output to the session")
        //            setupResult = .configurationFailed
        //            session.commitConfiguration()
        //            return
        //        }
        //
        //        // Add a depth data output
        //        if session.canAddOutput(depthDataOutput) {
        //            session.addOutput(depthDataOutput)
        //            depthDataOutput.setDelegate(self, callbackQueue: dataOutputQueue)
        //            depthDataOutput.isFilteringEnabled = false
        //            if let connection = depthDataOutput.connection(with: .depthData) {
        //                connection.isEnabled = depthVisualizationEnabled
        //            } else {
        //                print("No AVCaptureConnection")
        //            }
        //        } else {
        //            print("Could not add depth data output to the session")
        //            setupResult = .configurationFailed
        //            session.commitConfiguration()
        //            return
        //        }
        //
        //        if depthVisualizationEnabled {
        //            // Use an AVCaptureDataOutputSynchronizer to synchronize the video data and depth data outputs.
        //            // The first output in the dataOutputs array, in this case the AVCaptureVideoDataOutput, is the "master" output.
        //            outputSynchronizer = AVCaptureDataOutputSynchronizer(dataOutputs: [videoDataOutput, depthDataOutput])
        //            if let unwrappedOutputSynchronizer = outputSynchronizer {
        //                unwrappedOutputSynchronizer.setDelegate(self, queue: dataOutputQueue)
        //            }
        //        } else {
        //            outputSynchronizer = nil
        //        }
        //
        capFrameRate(videoDevice: videoDevice)
        
        session.commitConfiguration()
        //            DispatchQueue.main.async {
        //                self.depthDataMaxFrameRateValueLabel.text = String(format: "%.1f", self.depthDataMaxFrameRateSlider.value)
        //                self.mixFactorValueLabel.text = String(format: "%.1f", self.mixFactorSlider.value)
        //                self.depthDataMaxFrameRateSlider.minimumValue = Float(1) / Float(CMTimeGetSeconds(videoDevice.activeVideoMaxFrameDuration))
        //                self.depthDataMaxFrameRateSlider.maximumValue = Float(1) / Float(CMTimeGetSeconds(videoDevice.activeVideoMinFrameDuration))
        //                self.depthDataMaxFrameRateSlider.value = (self.depthDataMaxFrameRateSlider.minimumValue
        //                    + self.depthDataMaxFrameRateSlider.maximumValue) / 2
        //            }
    }
    
    @objc
    func sessionWasInterrupted(notification: NSNotification) {
        // In iOS 9 and later, the userInfo dictionary contains information on why the session was interrupted.
        if let userInfoValue = notification.userInfo?[AVCaptureSessionInterruptionReasonKey] as AnyObject?,
            let reasonIntegerValue = userInfoValue.integerValue,
            let reason = AVCaptureSession.InterruptionReason(rawValue: reasonIntegerValue) {
            print("Capture session was interrupted with reason \(reason)")
            
            if reason == .videoDeviceInUseByAnotherClient {
                // Simply fade-in a button to enable the user to try to resume the session running.
                //                    resumeButton.isHidden = false
                //                    resumeButton.alpha = 0.0
                //                    UIView.animate(withDuration: 0.25) {
                //                        self.resumeButton.alpha = 1.0
                //                    }
            } else if reason == .videoDeviceNotAvailableWithMultipleForegroundApps {
                // Simply fade-in a label to inform the user that the camera is unavailable.
                //                    cameraUnavailableLabel.isHidden = false
                //                    cameraUnavailableLabel.alpha = 0.0
                //                    UIView.animate(withDuration: 0.25) {
                //                        self.cameraUnavailableLabel.alpha = 1.0
                //                    }
            }
        }
    }
    
    @objc
    func sessionInterruptionEnded(notification: NSNotification) {
        //            if !resumeButton.isHidden {
        //                UIView.animate(withDuration: 0.25,
        //                               animations: {
        ////                                self.resumeButton.alpha = 0
        //                }, completion: { _ in
        ////                    self.resumeButton.isHidden = true
        //                }
        //                )
        //            }
        //            if !cameraUnavailableLabel.isHidden {
        //                UIView.animate(withDuration: 0.25,
        //                               animations: {
        ////                                self.cameraUnavailableLabel.alpha = 0
        //                }, completion: { _ in
        ////                    self.cameraUnavailableLabel.isHidden = true
        //                }
        //                )
        //            }
    }
    
    @objc
    func sessionRuntimeError(notification: NSNotification) {
        guard let errorValue = notification.userInfo?[AVCaptureSessionErrorKey] as? NSError else {
            return
        }
        
        let error = AVError(_nsError: errorValue)
        print("Capture session runtime error: \(error)")
        
        /*
         Automatically try to restart the session running if media services were
         reset and the last start running succeeded. Otherwise, enable the user
         to try to resume the session running.
         */
        if error.code == .mediaServicesWereReset {
            sessionQueue.async {
                if self.isSessionRunning && self.cameraActive {
                    self.session.startRunning()
                    self.isSessionRunning = self.session.isRunning
                } else {
                    DispatchQueue.main.async {
                        //                            self.resumeButton.isHidden = false
                    }
                }
            }
        } else {
            //                resumeButton.isHidden = false
        }
    }
    
    @IBAction private func resumeInterruptedSession(_ sender: UIButton) {
        sessionQueue.async {
            /*
             The session might fail to start running. A failure to start the session running will be communicated via
             a session runtime error notification. To avoid repeatedly failing to start the session
             running, we only try to restart the session running in the session runtime error handler
             if we aren't trying to resume the session running.
             */
            self.session.startRunning()
            self.isSessionRunning = self.session.isRunning
            if !self.session.isRunning {
                DispatchQueue.main.async {
                    let message = NSLocalizedString("Unable to resume", comment: "Alert message when unable to resume the session running")
                    let actions = [
                        UIAlertAction(title: NSLocalizedString("OK", comment: "Alert OK button"),
                                      style: .cancel,
                                      handler: nil)]
                    self.alert(title: "AVCamFilter", message: message, actions: actions)
                }
            } else {
                DispatchQueue.main.async {
                    //                        self.resumeButton.isHidden = true
                }
            }
        }
    }
    
    // MARK: - IBAction Functions
    
    /// - Tag: VaryFrameRate
    @IBAction private func changeDepthDataMaxFrameRate(_ sender: UISlider) {
        let depthDataMaxFrameRate = sender.value
        let newMinDuration = Double(1) / Double(depthDataMaxFrameRate)
        let duration = CMTimeMaximum(videoInput.device.activeVideoMinFrameDuration, CMTimeMakeWithSeconds(newMinDuration, preferredTimescale: 1000))
        
        //            self.depthDataMaxFrameRateValueLabel.text = String(format: "%.1f", depthDataMaxFrameRate)
        
        do {
            try self.videoInput.device.lockForConfiguration()
            //                self.videoInput.device.activeDepthDataMinFrameDuration = duration
            self.videoInput.device.unlockForConfiguration()
        } catch {
            print("Could not lock device for configuration: \(error)")
        }
    }
    
    /// - Tag: VaryMixFactor
    @IBAction private func changeMixFactor(_ sender: UISlider) {
        let mixFactor = sender.value
        //            self.mixFactorValueLabel.text = String(format: "%.1f", mixFactor)
        //            dataOutputQueue.async {
        //                self.videoDepthMixer.mixFactor = mixFactor
        //            }
        //            procesrsingQueue.async {
        //                self.photoDepthMixer.mixFactor = mixFactor
        //            }
    }
    
    
    @IBAction private func focusAndExposeTap(_ gesture: UITapGestureRecognizer) {
        let location = gesture.location(in: previewView)
        guard let texturePoint = previewView.texturePointForView(point: location) else {
            return
        }
        
        let textureRect = CGRect(origin: texturePoint, size: .zero)
        let deviceRect = videoDataOutput.metadataOutputRectConverted(fromOutputRect: textureRect)
        focus(with: .autoFocus, exposureMode: .autoExpose, at: deviceRect.origin, monitorSubjectAreaChange: true)
    }
    
    @objc
    func subjectAreaDidChange(notification: NSNotification) {
        let devicePoint = CGPoint(x: 0.5, y: 0.5)
        focus(with: .continuousAutoFocus, exposureMode: .continuousAutoExposure, at: devicePoint, monitorSubjectAreaChange: false)
    }
    
     public func orientationupdate(_ captureConnection:AVCaptureConnection){
        if self.presetCamera == 1 {
            captureConnection.isVideoMirrored = false
        }else{
            captureConnection.isVideoMirrored = true
        }
        
        if (captureConnection.isVideoOrientationSupported) {
            if(self.statusBarOrientation == .portrait){
                captureConnection.videoOrientation = .portrait
            }else if(self.statusBarOrientation == .landscapeRight){
                captureConnection.videoOrientation = .landscapeRight
            }else if(self.statusBarOrientation == .landscapeLeft){
                captureConnection.videoOrientation = .landscapeLeft
            }
        }
    }
    
    
    private func updatePreviewLayer(layer: AVCaptureConnection, orientation: AVCaptureVideoOrientation) {
        layer.videoOrientation = orientation
    }
    
    
    
    //MARK: Torch OnOff for VideoLongPress release brightness.
    private var BrightOnOff:Bool = true
    private let step: CGFloat = 0.9
    private let value: CGFloat = 2.5
    private let valueMinus: CGFloat = 0.0
    
    @objc public func BrightnessOnOff() {
        if BrightOnOff == true{
            guard abs(UIScreen.main.brightness - value) > step else { return }
            let delta = UIScreen.main.brightness >= value ? -0.5 : step
            self.flashView?.backgroundColor = UIColor.white
            self.flashView?.alpha = 0.9
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) {
                UIScreen.main.brightness += delta
                self.BrightOnOff = false
            }
        }
        else if BrightOnOff == false{
            guard abs(UIScreen.main.brightness - valueMinus) > step else { return }
            let delta = UIScreen.main.brightness >= valueMinus ? -0.5 : step
            self.flashView?.backgroundColor = UIColor.clear
            self.flashView?.alpha = 1
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.01) {
                UIScreen.main.brightness += delta
                self.BrightOnOff = true
            }
        }
    }
    
    
    @objc public func BackFlashActivate() {

          let currentDevice = videoInput.device

          if currentDevice.hasTorch {
              do {
                  try currentDevice.lockForConfiguration()
                  let torchOn = !currentDevice.isTorchActive
                  try currentDevice.setTorchModeOn(level:1.0)//Or whatever you want
                  currentDevice.torchMode = torchOn ? .on : .off
                  currentDevice.unlockForConfiguration()
              } catch {
                  print("error")
              }
          }
    }
    
    
 
    @objc public func tourch(_ torchLevel:Float) {
        
        guard let videoDevice = self.videoInput else {
            print("Could not find any video device")
            return
        }
        
        
        if (self.videoInput.device != nil){
            let device = self.videoInput.device
            print(device.flashMode)
            if (device.hasTorch) {
                do {
                    try device.lockForConfiguration()
                    
                    
                    if (torchLevel == 0) {
                        device.torchMode = AVCaptureDevice.TorchMode.off
                    } else {
                        do {
                            try device.setTorchModeOn(level: 1.0)
                        } catch {
                            print(error)
                        }
                    }
                     if device.flashMode.rawValue == 0 {

                        device.flashMode = .on
                        print("New device flash mode: \(device.flashMode)")
                    } else if device.flashMode.rawValue == 1 {

                        device.flashMode = .off

                        print("New device flash mode: \(device.flashMode)")
                    } else if device.flashMode.rawValue == 2 {

                        device.flashMode = .on
                    }
                    
                    device.unlockForConfiguration()
                } catch {
                    print(error)
                }
            }else{
            
            }
        }
        
        
        
    }
    
    @objc public func changeCamera(_ position:Int) {
        print(position)
//        if(self.beautificationOn){
//            if(position == 1){
//                sdkManager.input.setCameraSessionType(.BackCameraVideoSession, zoomFactor: 0.0, completion: {
//                })
//            }else{
//                sdkManager.input.setCameraSessionType(.FrontCameraVideoSession, zoomFactor: 0.0, completion: {
//                })
//            }
//        }

        dataOutputQueue.sync {
            self.presetCamera = position
            if let filter = videoFilter {
                filter.reset()
            }
            self.renderingEnabled = false
            //            videoDepthMixer.reset()
            //            currentDepthPixelBuffer = nil
            previewView.pixelBuffer = nil
        }
        
        //        processingQueue.async {
        //            if let filter = self.photoFilter {
        //                filter.reset()
        //            }
        ////            self.photoDepthMixer.reset()
        //            //                self.photoDepthConverter.reset()
        //        }
        
        let interfaceOrientation = statusBarOrientation
        //            var depthEnabled = depthVisualizationOn
        
        sessionQueue.async {
            let currentVideoDevice = self.videoInput.device
            
            let preferredPosition = self.presetCamera == 1 ? AVCaptureDevice.Position.back : AVCaptureDevice.Position.front
            
            let devices = self.videoDeviceDiscoverySession.devices
            if let videoDevice = devices.first(where: { $0.position == preferredPosition }) {
                var videoInput: AVCaptureDeviceInput
                do {
                    videoInput = try AVCaptureDeviceInput(device: videoDevice)
                } catch {
                    print("Could not create video device input: \(error)")
                    self.dataOutputQueue.async {
                        self.renderingEnabled = true
                    }
                    return
                }
                
                
                let audioCaptureDevice = AVCaptureDevice.default(for: .audio)
                var audioInput: AVCaptureDeviceInput
                do {
                    audioInput = try AVCaptureDeviceInput(device: audioCaptureDevice!)
                } catch {
                    print("Could not create video device input: \(error)")
                    return
                    
                }
                
                
                
                if(!self.session.isRunning && self.cameraActive) {
                    self.startCaptureSession()
                }
                self.session.beginConfiguration()
                self.session.removeInput(self.videoInput)
                self.session.removeInput(self.audioInput)
                
                if self.session.canAddInput(videoInput) {
                    NotificationCenter.default.removeObserver(self,
                                                              name: NSNotification.Name.AVCaptureDeviceSubjectAreaDidChange,
                                                              object: currentVideoDevice)
                    NotificationCenter.default.addObserver(self,
                                                           selector: #selector(self.subjectAreaDidChange),
                                                           name: NSNotification.Name.AVCaptureDeviceSubjectAreaDidChange,
                                                           object: videoDevice)
                    
                    self.session.addInput(videoInput)
                    self.session.addInput(audioInput)
                    self.videoInput = videoInput
                    self.audioInput = audioInput
                } else {
                    print("Could not add video device input to the session")
                    self.session.addInput(self.videoInput)
                }
                
                self.session.commitConfiguration()
            }
            
            let videoPosition = self.videoInput.device.position
            
            if let unwrappedVideoDataOutputConnection = self.videoDataOutput.connection(with: .video) {
                
                self.orientationupdate(unwrappedVideoDataOutputConnection)
                
                let rotation = MetalPreview.Rotation(with: interfaceOrientation,
                                                     videoOrientation: unwrappedVideoDataOutputConnection.videoOrientation,
                                                     cameraPosition: videoPosition)
                
                if let rotation = rotation {
                    self.previewView.rotation = rotation
                    
                }
            }
            
            self.dataOutputQueue.async {
                self.renderingEnabled = true
            }
            
        }
    }
    
     @objc public func flashSelfie(){
        let yourDelay = 0
        let yourDuration = 0.5
        self.blurEffectView?.alpha = 1
        DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + .seconds(yourDelay), execute: { () -> Void in
            UIView.animate(withDuration: yourDuration, animations: { () -> Void in
                self.renderingEnabled = true
                self.blurEffectView?.alpha = 0

            })
        })
    }
    
    // Music Background Play while recording
    @objc public func playMusicOnBackground(_ sUrl: String, _trackId: String, trackDetail:[String:Any], completionHandler: @escaping (_ param: String) -> Void) {
        self.isMusicMode = true
        self.trackSynced = trackDetail

        let url = URL(string: sUrl)
        print("the url = \(url!)")
     do {
        let directory = try FileManager.default.url(for: FileManager.SearchPathDirectory.documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let dest: URL
        dest = directory.appendingPathComponent("\(_trackId)litpicSong").appendingPathExtension("mp3")
            
    if FileManager().fileExists(atPath: dest.path) {
        print("The file already exists at path")
        self.audioPlayer = try AVAudioPlayer(contentsOf: dest)
        self.audioPlayer!.prepareToPlay()
        self.audioPlayer!.volume = 1.0
        self.musicURLToPlay = dest
        self.startingSeekTime = 0.0
        self.previousURL = nil
        self.session.removeOutput(self.audioDataOutput)
        let audioSession = AVAudioSession.sharedInstance()
        do{
            try audioSession.setCategory(AVAudioSession.Category.playback)
        }catch{
         print("CATCH Download failure")
        }
        print("Already Downloaded music url",dest.path, dest)
        completionHandler(dest.path)
    }else{
            try url!.download(destination: dest, completion: { (URL, error) in
                guard let _url = URL else {
                    return
                }
                do{
                    self.audioPlayer = try AVAudioPlayer(contentsOf: URL!)
                    self.audioPlayer!.prepareToPlay()
                    self.audioPlayer!.volume = 1.0
                    self.musicURLToPlay = URL
                    self.startingSeekTime = 0.0
                    self.previousURL = nil
                    self.session.removeOutput(self.audioDataOutput)
                    let audioSession = AVAudioSession.sharedInstance()
                    do{
                            try audioSession.setCategory(AVAudioSession.Category.playback)
                    }catch{
                         print("CATCH Download failure")
                    }
                    print("Downloaded music url",URL!.path, URL)
                    completionHandler(URL!.path)
                }catch{
                    print("Download failure")
                }
            })
        }
        } catch {
            print(error)
        }
    }
    
    
    @objc public func streamMusicPlay(_ url:URL){
        
        //let url = URL.init(string: url)
        let playerItem:AVPlayerItem = AVPlayerItem(url: url)
        playerItem.addObserver(self,
                forKeyPath: #keyPath(AVPlayerItem.status),
                options: [.old, .new],
                context: &playerItemContext)
        streamPlayer = AVPlayer(playerItem: playerItem)
        streamPlayer.volume = 1.0
        streamPlayer.play()
    }
    
    
    
    @objc public func streamMusicSeekAndPlay(_ url:URL, seconds: Double){
        if(self.musicURLToPlay != nil ){
            if(self.audioPlayer != nil){
                self.startingSeekTime = seconds
                self.audioPlayer!.currentTime = seconds
                self.audioPlayer!.play()
            }else{
                do{
                    self.audioPlayer = try AVAudioPlayer(contentsOf: self.musicURLToPlay!)
                    self.startingSeekTime = seconds
                    self.audioPlayer?.currentTime = seconds
                    self.audioPlayer?.prepareToPlay()
                    self.audioPlayer?.play()
                }catch{}
            }
        }
    }
    
    @objc public func stopMusicAfterTrimmer(seconds: Double){
        if(self.audioPlayer != nil){
            self.audioPlayer!.stop()
        }
        if((self.musicURLToPlay) != nil){
            do{
                self.audioPlayer = try AVAudioPlayer(contentsOf: self.musicURLToPlay!)
                self.audioPlayer!.prepareToPlay()
                self.audioPlayer!.volume = 1.0
                self.audioPlayer!.currentTime = 0.0
            }catch{
            }
        }
    }
    
    
    @objc public func streamMusicPause(){
        if(streamPlayer != nil){
            streamPlayer.pause()
        }
    }
    
    
    @objc public func syncCancelOrExit() {
        if(self.musicURLToPlay != nil){
            self.audioPlayer?.stop()
        }
        self.musicURLToPlay = nil
        self.isMusicMode = false
    }
    
    
    @IBAction private func toggleDepthVisualization() {
        //            depthVisualizationOn = !depthVisualizationOn
        //            var depthEnabled = depthVisualizationOn
        
        //            sessionQueue.async {
        //                self.session.beginConfiguration()
        //
        //                if self.photoOutput.isDepthDataDeliverySupported {
        //                    self.photoOutput.isDepthDataDeliveryEnabled = depthEnabled
        //                } else {
        //                    depthEnabled = false
        //                }
        //
        //                if let unwrappedDepthConnection = self.depthDataOutput.connection(with: .depthData) {
        //                    unwrappedDepthConnection.isEnabled = depthEnabled
        //                }
        //
        //                if depthEnabled {
        //                    // Use an AVCaptureDataOutputSynchronizer to synchronize the video data and depth data outputs.
        //                    // The first output in the dataOutputs array, in this case the AVCaptureVideoDataOutput, is the "master" output.
        //                    self.outputSynchronizer = AVCaptureDataOutputSynchronizer(dataOutputs: [self.videoDataOutput, self.depthDataOutput])
        //
        //                    if let unwrappedOutputSynchronizer = self.outputSynchronizer {
        //                        unwrappedOutputSynchronizer.setDelegate(self, queue: self.dataOutputQueue)
        //                    }
        //                } else {
        //                    self.outputSynchronizer = nil
        //                }
        //
        //                self.session.commitConfiguration()
        //
        //                DispatchQueue.main.async {
        //                    self.updateDepthUIHidden()
        //                }
        //
        //                self.dataOutputQueue.async {
        //                    if !depthEnabled {
        //                        self.videoDepthConverter.reset()
        //                        self.videoDepthMixer.reset()
        //                        self.currentDepthPixelBuffer = nil
        //                    }
        //                    self.depthVisualizationEnabled = depthEnabled
        //                }
        //
        //                self.processingQueue.async {
        //                    if !depthEnabled {
        //                        self.photoDepthMixer.reset()
        //                        self.photoDepthConverter.reset()
        //                    }
        //                }
        //            }
    }
    
    
    
    @objc public func reverseVideo(videoURL: URL,  fileName: String?, _ completionBlock: @escaping ((URL?, Error?)->Void)) {
          let media_queue = DispatchQueue(label: "mediaInputQueue", attributes: [])
          media_queue.async {
            let acceptableVideoExtensions = ["mp4"]

            // An interger property to store the maximum samples in a pass (100 is the optimal number)
            let numberOfSamplesInPass = 10

          if !videoURL.absoluteString.contains(".DS_Store") && acceptableVideoExtensions.contains(videoURL.pathExtension) {
              let _fileName = fileName == nil ? "reversedClip" : fileName!

              var completeMoviePath: URL?
              let videoAsset = AVURLAsset(url: videoURL)
              var videoSize = CGSize.zero
                let formatter = DateFormatter()
                formatter.dateFormat = "ddMMMyyyyHHmmss" //yyyy
                let dateString = formatter.string(from: Date())

              if let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first {
                /// create a path to the video file
                completeMoviePath = URL(fileURLWithPath: documentsPath).appendingPathComponent("\(dateString)_\(_fileName).mp4")

                if let completeMoviePath = completeMoviePath {
                  if FileManager.default.fileExists(atPath: completeMoviePath.path) {
                    do {
                      /// delete an old duplicate file
                      try FileManager.default.removeItem(at: completeMoviePath)
                    } catch {
                      DispatchQueue.main.async {
                        completionBlock(nil, error)
                      }
                    }
                  }
                }
              } else {
                DispatchQueue.main.async {
                    
                    completionBlock(nil,VideoGeneratorError(error: .kFailedToFetchDirectory))

                }
              }

              media_queue.async {
                if let completeMoviePath = completeMoviePath {
                  let videoTrack = videoAsset.tracks(withMediaType: .video).first

                  if let firstAssetTrack = videoTrack {
                    videoSize = firstAssetTrack.naturalSize
                  }

                  /// create setting for the pixel buffer
                  let sourceBufferAttributes: [String: Any] = [kCVPixelBufferPixelFormatTypeKey as String : Int(kCVPixelFormatType_420YpCbCr8BiPlanarFullRange)]
                  var writer: AVAssetWriter!

                  do {
                    let reader = try AVAssetReader(asset: videoAsset)
                    if let assetVideoTrack = videoAsset.tracks(withMediaType: .video).first {
                      let videoCompositionProps = [AVVideoAverageBitRateKey: assetVideoTrack.estimatedDataRate]

                      /// create the basic video settings
                      let videoSettings: [String : Any] = [
                        AVVideoCodecKey  : AVVideoCodecH264,
                        AVVideoWidthKey  : videoSize.width,
                        AVVideoHeightKey : videoSize.height,
                        AVVideoCompressionPropertiesKey: videoCompositionProps
                      ]

                      let readerOutput = AVAssetReaderTrackOutput(track: assetVideoTrack, outputSettings: sourceBufferAttributes)
                      readerOutput.supportsRandomAccess = true
                      reader.add(readerOutput)

                      if reader.startReading() {
                        var timesSamples = [CMTime]()

                        while let sample = readerOutput.copyNextSampleBuffer() {
                          let presentationTime = CMSampleBufferGetPresentationTimeStamp(sample)

                          timesSamples.append(presentationTime)
                        }

                        if timesSamples.count > 1 {
                          let totalPasses = Int(ceil(Double(timesSamples.count) / Double(numberOfSamplesInPass)))

                          var passDictionaries = [[String: Any]]()
                          var passStartTime = timesSamples.first!
                          var passTimeEnd = timesSamples.first!
                          let initEventTime = passStartTime
                          var initNewPass = false

                          for (index, time) in timesSamples.enumerated() {
                            passTimeEnd = time

                            if index % numberOfSamplesInPass == 0 {
                              if index > 0 {
                                let dictionary = [
                                  "passStartTime": passStartTime,
                                  "passEndTime": passTimeEnd
                                ]

                                passDictionaries.append(dictionary)
                              }

                              initNewPass = true
                            }

                            if initNewPass {
                              passStartTime = passTimeEnd
                              initNewPass = false
                            }
                          }

                          if passDictionaries.count < totalPasses || timesSamples.count % numberOfSamplesInPass == 0 {
                            let dictionary = [
                              "passStartTime": passStartTime,
                              "passEndTime": passTimeEnd
                            ]

                            passDictionaries.append(dictionary)
                          }

                          writer = try AVAssetWriter(outputURL: completeMoviePath, fileType: .m4v)
                          let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
                          writerInput.expectsMediaDataInRealTime = false
                          writerInput.transform = videoTrack?.preferredTransform ?? CGAffineTransform.identity

                          let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: writerInput, sourcePixelBufferAttributes: nil)
                          writer.add(writerInput)

                            if writer.startWriting() {
                            writer.startSession(atSourceTime: initEventTime)
                            var frameCount = 0

                            for dictionary in passDictionaries.reversed() {
                              if let passStartTime = dictionary["passStartTime"] as? CMTime, let passEndTime = dictionary["passEndTime"] as? CMTime {
                                let passDuration = CMTimeSubtract(passEndTime, passStartTime)
                                let timeRange = CMTimeRangeMake(start: passStartTime, duration: passDuration)

                                while readerOutput.copyNextSampleBuffer() != nil { }

                                readerOutput.reset(forReadingTimeRanges: [NSValue(timeRange: timeRange)])

                                var samples = [CMSampleBuffer]()

                                while let sample = readerOutput.copyNextSampleBuffer() {
                                  samples.append(sample)
                                }
                                


                                for (index, _) in samples.enumerated() {
                                  let presentationTime = timesSamples[frameCount]
                                  let imageBufferRef = CMSampleBufferGetImageBuffer(samples[samples.count - index - 1])!

                                  while (!writerInput.isReadyForMoreMediaData) {
//                                    Thread.sleep(forTimeInterval: 0.05)
                                  }

                                  pixelBufferAdaptor.append(imageBufferRef, withPresentationTime: presentationTime)
                                  frameCount += 1
                                }

                                samples.removeAll()
                              }
                            }
                            writerInput.markAsFinished()


                            writer.finishWriting(completionHandler: {
                              DispatchQueue.main.async {
                                completionBlock(completeMoviePath,nil)
                              }
                            })
                          }
                        } else {
                                      DispatchQueue.main.async {
                                        completionBlock(nil,VideoGeneratorError(error: .kFailedToReadProvidedClip))
                                      }
                                    }
                                  } else {
                                    DispatchQueue.main.async {
                                      completionBlock(nil, VideoGeneratorError(error: .kFailedToStartReader))
                                    }
                                  }
                                }
                              } catch {
                                DispatchQueue.main.async {
                                  completionBlock(nil,error)
                                }
                              }
                            } else {
                              DispatchQueue.main.async {
                                completionBlock(nil,VideoGeneratorError(error: .kFailedToFetchDirectory))
                              }
                            }
                          }
                        } else {
                          DispatchQueue.main.async {
                            completionBlock(nil,VideoGeneratorError(error: .kUnsupportedVideoType))
                          }
          }
        }
    }
    
    @objc public func resizeVideo(inputURL: URL, completion: @escaping (_ outPutURL : URL?) -> Void)  {
        let videoAsset = AVURLAsset(url: inputURL)
        let clipVideoTrack = videoAsset.tracks(withMediaType: AVMediaType.video).first!

        let composition = AVMutableComposition()
        composition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: CMPersistentTrackID())

        let videoComposition = AVMutableVideoComposition()
        videoComposition.renderSize = CGSize(width: 1080, height: 1920)
        videoComposition.frameDuration = CMTimeMake(value: 1, timescale: 30)

        let instruction = AVMutableVideoCompositionInstruction()
        instruction.timeRange = CMTimeRange(start: .zero, duration: videoAsset.duration)

        let transformer : AVMutableVideoCompositionLayerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: clipVideoTrack)
        
        let videoSize = clipVideoTrack.naturalSize
        let ratio = 1920 / videoSize.height
        let t1 = CGAffineTransform(translationX: 360, y: 0)
        let t2 = t1.rotated(by: CGFloat(Double.pi / 2))
        let t3 = t2.scaledBy(x: ratio, y: ratio)
        transformer.setTransform(t3, at: .zero)
        instruction.layerInstructions = [transformer]
        videoComposition.instructions = [instruction]
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'"
        let date = NSDate()
        
        let filename = "resizedCapture\(self.currentFile).mp4"
        let path:URL = URL(fileURLWithPath: NSTemporaryDirectory(),isDirectory: true).appendingPathComponent(filename)
        let urlFile = URL.init(string: path.absoluteString)
        let outputURL = self.getDocumentsDirectory().appendingPathComponent(filename)
        
        if(FileManager.default.fileExists(atPath: outputURL.path)){
            do{
                try FileManager.default.removeItem(at: outputURL)
            }catch{
                print("CANNOT BE REMOVED")
            }
        }

        let exporter = AVAssetExportSession(asset: videoAsset, presetName: AVAssetExportPresetHighestQuality)
        exporter!.videoComposition = videoComposition
        exporter!.outputURL = outputURL
        exporter!.outputFileType = AVFileType.mov

        exporter!.exportAsynchronously {
            DispatchQueue.main.async {
                completion(exporter!.outputURL)
            }
        }
    }
    
    @objc public func mergeVideoWithAudio(videoUrl: URL, audioUrl: URL, fileName:String, _ completionBlock: @escaping((URL?, Error?)->Void)) {
            let mixComposition: AVMutableComposition = AVMutableComposition()
            var mutableCompositionVideoTrack: [AVMutableCompositionTrack] = []
            var mutableCompositionAudioTrack: [AVMutableCompositionTrack] = []
            let totalVideoCompositionInstruction : AVMutableVideoCompositionInstruction = AVMutableVideoCompositionInstruction()
            
            let aVideoAsset: AVAsset = AVAsset(url: videoUrl)
            let aAudioAsset: AVAsset = AVAsset(url: audioUrl)
            
            if let videoTrack = mixComposition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid), let audioTrack = mixComposition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
              mutableCompositionVideoTrack.append(videoTrack)
              mutableCompositionAudioTrack.append(audioTrack)
            }
            
            if let aVideoAssetTrack: AVAssetTrack = aVideoAsset.tracks(withMediaType: .video).first, let aAudioAssetTrack: AVAssetTrack = aAudioAsset.tracks(withMediaType: .audio).first {
              do {
                try mutableCompositionVideoTrack.first?.insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: aVideoAssetTrack.timeRange.duration), of: aVideoAssetTrack, at: CMTime.zero)
                try mutableCompositionAudioTrack.first?.insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: aVideoAssetTrack.timeRange.duration), of: aAudioAssetTrack, at: CMTime.zero)
              } catch{
                print(error)
              }
              
              totalVideoCompositionInstruction.timeRange = CMTimeRangeMake(start: CMTime.zero,duration: aVideoAssetTrack.timeRange.duration)
            }
            
            let mutableVideoComposition: AVMutableVideoComposition = AVMutableVideoComposition()
            mutableVideoComposition.frameDuration = CMTimeMake(value: 1, timescale: 30)
        //    mutableVideoComposition.renderSize = CGSize(width: 1280, height: 720)
            
            if let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first {
    //          let outputURL = URL(fileURLWithPath: documentsPath).appendingPathComponent("\(sound).m4v")
                let formatter = DateFormatter()
                formatter.dateFormat = "ddMMMyyyyHHmmss" //yyyy
                let dateString = formatter.string(from: Date())
                let outputURL = URL(fileURLWithPath: documentsPath).appendingPathComponent("\(dateString)_\(fileName).mp4")

              do {
                if FileManager.default.fileExists(atPath: outputURL.path) {
                  try FileManager.default.removeItem(at: outputURL)
                }
              } catch {
                print(error.localizedDescription)
              }
              
              if let exportSession = AVAssetExportSession(asset: mixComposition, presetName: AVAssetExportPresetHighestQuality) {
                exportSession.outputURL = outputURL
                exportSession.outputFileType = AVFileType.mp4
                exportSession.shouldOptimizeForNetworkUse = true
                
                /// try to export the file and handle the status cases
                exportSession.exportAsynchronously(completionHandler: {
                  DispatchQueue.main.async {
                    switch exportSession.status {
                    case .failed:
                      if let _error = exportSession.error {
                        completionBlock(nil, exportSession.error)
    //                    completionBlock(nil,_error)
                      }
                      
                    case .cancelled:
                      if let _error = exportSession.error {
                        completionBlock(nil, _error)
                      }
                      
                    default:
                      print("finished")
                      completionBlock(outputURL, nil)
                    }
                  }
                })
              } else {
                completionBlock(nil, VideoGeneratorError(error: .kFailedToStartAssetExportSession))
              }
            }
          }
    
  
    
    /// - Tag: SmoothDepthData
    @IBAction private func toggleDepthSmoothing() {
        
        //            depthSmoothingOn = !depthSmoothingOn
        //            let smoothingEnabled = depthSmoothingOn
        
        //            let stateImage = UIImage(named: smoothingEnabled ? "DepthSmoothOn" : "DepthSmoothOff")
        //            self.depthSmoothingButton.setImage(stateImage, for: .normal)
        //
        //            sessionQueue.async {
        //                self.depthDataOutput.isFilteringEnabled = smoothingEnabled
        //            }
    }
    
    @IBAction private func toggleFiltering() {
        
        //            videoFilterOn = !videoFilterOn
        //            let filteringEnabled = videoFilterOn
        
        //            let stateImage = UIImage(named: filteringEnabled ? "ColorFilterOn" : "ColorFilterOff")
        //            self.videoFilterButton.setImage(stateImage, for: .normal)
        //
        //            let index = filterIndex
        //
        //            if filteringEnabled {
        ////                let filterDescription = filterRenderers[index].description
        //                updateFilterLabel(description: filterDescription)
        //            }
        //
        //            // Enable/disable the video filter.
        //            dataOutputQueue.async {
        //                if filteringEnabled {
        ////                    self.videoFilter = self.filterRenderers[index]
        //                } else {
        //                    if let filter = self.videoFilter {
        //                        filter.reset()
        //                    }
        //                    self.videoFilter = nil
        //                }
        //            }
        //
        //            // Enable/disable the photo filter.
        //            processingQueue.async {
        //                if filteringEnabled {
        ////                    self.photoFilter = self.photoRenderers[index]
        //                } else {
        //                    if let filter = self.photoFilter {
        //                        filter.reset()
        //                    }
        //                    self.photoFilter = nil
        //                }
        //            }
    }
    
    @IBAction private func capturePhoto(_ photoButton: UIButton) {
        //            let depthEnabled = depthVisualizationOn
        
        //            sessionQueue.async {
        //                let photoSettings = AVCapturePhotoSettings(format: [kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)])
        //                if depthEnabled && self.photoOutput.isDepthDataDeliverySupported {
        //                    photoSettings.isDepthDataDeliveryEnabled = true
        //                    photoSettings.embedsDepthDataInPhoto = false
        //                } else {
        //                    photoSettings.isDepthDataDeliveryEnabled = depthEnabled
        //                }
        //
        //                self.photoOutput.capturePhoto(with: photoSettings, delegate: self)
        //            }
    }
    
    
    
    // MARK: - CLEAR ALL DIRECTORIES
    @objc public func deleteDocumentDirectory() {
        let documentsUrl =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!

        do {
            let fileURLs = try FileManager.default.contentsOfDirectory(at: documentsUrl,
                                                                       includingPropertiesForKeys: nil,
                                                                       options: [.skipsHiddenFiles, .skipsSubdirectoryDescendants])
            for fileURL in fileURLs {
                if fileURL.pathExtension == "mp4" {
                    print("DELETED FILES ARE",fileURL.path)
                    try FileManager.default.removeItem(at: fileURL)
                }
            }
        } catch  { print(error) }
    }
    
    // MARK: - UI Utility Functions
    
    func updateDepthUIHidden() {
        //            self.depthVisualizationButton.isHidden = !self.photoOutput.isDepthDataDeliverySupported
        //            self.depthVisualizationButton.setImage(UIImage(named: depthVisualizationOn ? "DepthVisualOn" : "DepthVisualOff"),
        //                                                   for: .normal)
        //            self.depthSmoothingOn = depthVisualizationOn
        //            self.depthSmoothingButton.isHidden = !self.depthSmoothingOn
        //            self.depthSmoothingButton.setImage(UIImage(named: depthVisualizationOn ? "DepthSmoothOn" : "DepthSmoothOff"),
        //                                               for: .normal)
        //            self.mixFactorNameLabel.isHidden = !depthVisualizationOn
        //            self.mixFactorValueLabel.isHidden = !depthVisualizationOn
        //            self.mixFactorSlider.isHidden = !depthVisualizationOn
        //            self.depthDataMaxFrameRateNameLabel.isHidden = !depthVisualizationOn
        //            self.depthDataMaxFrameRateValueLabel.isHidden = !depthVisualizationOn
        //            self.depthDataMaxFrameRateSlider.isHidden = !depthVisualizationOn
    }
    
    func updateFilterLabel(description: String) {
        //            filterLabel.text = description
        //            filterLabel.alpha = 0.0
        //            filterLabel.isHidden = false
        
        UIView.animate(withDuration: 0.25, animations: {
            //                self.filterLabel.alpha = 1.0
        }) { _ in
            UIView.animate(withDuration: 0.25, delay: 1.0, options: [], animations: {
                //                    self.filterLabel.alpha = 0.0
            }, completion: { _ in })
        }
    }
    
        
    public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        if (output == self.videoDataOutput){
            
        } else {
            
            if (self.startRecording == true && video_frames_written == true){
                print("Audio")
                
                 if (self.statusBarOrientation == .portrait) {
                       // Portrait
                       self.portraitEncoder?.encodeFrame(sampleBuffer, isVideo: false)

                   }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 1){
                       // Landscapeleft Back camera
                       self.landscapeLeftEncoderBackCamera?.encodeFrame(sampleBuffer, isVideo: false)

                   }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 2){
                       // Landscapeleft Front camera
                       self.landscapeLeftEncoderFrontCamera?.encodeFrame(sampleBuffer, isVideo: false)

                   }else if (self.statusBarOrientation == .landscapeRight && self.presetCamera == 1){
                       // LandscapeRight Back camera
                    self.landscapeRightEncoderBackCamera?.encodeFrame(sampleBuffer, isVideo: false)

                   }else{
                       // LandscapeRight Front camera
                    self.landscapeRightEncoderFrontCamera?.encodeFrame(sampleBuffer, isVideo: false)

                   }
            }
        }
        
        processVideo(sampleBuffer: sampleBuffer, con: connection)
    }
    
    
    func processVideo(sampleBuffer: CMSampleBuffer, con: AVCaptureConnection) {
        
        if !renderingEnabled {
            return
        }
        
        
        guard let videoPixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer),
            let formatDescription = CMSampleBufferGetFormatDescription(sampleBuffer) else {
                return
        }
        
        var finalVideoPixelBuffer = videoPixelBuffer
        if let filter = videoFilter {
            if !filter.isPrepared {
                filter.prepare(with: formatDescription, outputRetainedBufferCountHint: 3)
            }
            
            // Send the pixel buffer through the filter
            guard let filteredBuffer = filter.render(pixelBuffer: finalVideoPixelBuffer) else {
                print("Unable to filter video buffer")
                return
            }
            
            finalVideoPixelBuffer = filteredBuffer
        }
        self.previewView.pixelBuffer = finalVideoPixelBuffer

        

        if (self.startRecording == true){
             if (self.statusBarOrientation == .portrait) {
                if self.portraitEncoder?.writer.status == AVAssetWriter.Status.unknown{
                    let mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                    self.portraitEncoder!.writer.startWriting()
                    self.portraitEncoder!.writer.startSession(atSourceTime: mediaStartTime)
                }
                
                
                if (self.portraitEncoder?.writer.status == AVAssetWriter.Status.writing){
                    print("Video")
                    var pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                    self.portraitEncoder!.adaptor.append(finalVideoPixelBuffer, withPresentationTime: pts)
                }
                
                
            }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 1){
                   // Landscapeleft Back camera
                   
                if self.landscapeLeftEncoderBackCamera?.writer.status == AVAssetWriter.Status.unknown{
                                    let mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                                    self.landscapeLeftEncoderBackCamera!.writer.startWriting()
                                    self.landscapeLeftEncoderBackCamera!.writer.startSession(atSourceTime: mediaStartTime)
                                }
                if (self.landscapeLeftEncoderBackCamera?.writer.status == AVAssetWriter.Status.writing){
                                    print("Video")
                                    var pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
//                                    let dur = CMSampleBufferGetDuration(sampleBuffer)
//                                    if dur.value > 0 {
//                                        pts = CMTimeAdd(pts, dur)
//                                    }
                                    self.landscapeLeftEncoderBackCamera!.adaptor.append(finalVideoPixelBuffer, withPresentationTime: pts)
                                }
                
               }else if (self.statusBarOrientation == .landscapeLeft && self.presetCamera == 2){
                   // Landscapeleft Front camera
                
                if self.landscapeLeftEncoderFrontCamera?.writer.status == AVAssetWriter.Status.unknown{
                                    let mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                                    self.landscapeLeftEncoderFrontCamera!.writer.startWriting()
                                    self.landscapeLeftEncoderFrontCamera!.writer.startSession(atSourceTime: mediaStartTime)
                                }
                if (self.landscapeLeftEncoderFrontCamera?.writer.status == AVAssetWriter.Status.writing){
                                    print("Video")
                                    var pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
//                                    let dur = CMSampleBufferGetDuration(sampleBuffer)
//                                    if dur.value > 0 {
//                                        pts = CMTimeAdd(pts, dur)
//                                    }
                                    self.landscapeLeftEncoderFrontCamera!.adaptor.append(finalVideoPixelBuffer, withPresentationTime: pts)
                                }
                   
               }else if (self.statusBarOrientation == .landscapeRight && self.presetCamera == 1){
                   // LandscapeRight Back camera
                
                
                if self.landscapeRightEncoderBackCamera?.writer.status == AVAssetWriter.Status.unknown{
                                    let mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                                    self.landscapeRightEncoderBackCamera!.writer.startWriting()
                                    self.landscapeRightEncoderBackCamera!.writer.startSession(atSourceTime: mediaStartTime)
                                }
                if (self.landscapeRightEncoderBackCamera?.writer.status == AVAssetWriter.Status.writing){
                                    print("Video")
                                    var pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
//                                    let dur = CMSampleBufferGetDuration(sampleBuffer)
//                                    if dur.value > 0 {
//                                        pts = CMTimeAdd(pts, dur)
//                                    }
                                    self.landscapeRightEncoderBackCamera!.adaptor.append(finalVideoPixelBuffer, withPresentationTime: pts)
                                }
               }else{
                   // LandscapeRight Front camera
                
                if self.landscapeRightEncoderFrontCamera?.writer.status == AVAssetWriter.Status.unknown{
                                    let mediaStartTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                                    self.landscapeRightEncoderFrontCamera!.writer.startWriting()
                                    self.landscapeRightEncoderFrontCamera!.writer.startSession(atSourceTime: mediaStartTime)
                                }
                if (self.landscapeRightEncoderFrontCamera?.writer.status == AVAssetWriter.Status.writing){
                                    print("Video")
                                    var pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
//                                    let dur = CMSampleBufferGetDuration(sampleBuffer)
//                                    if dur.value > 0 {
//                                        pts = CMTimeAdd(pts, dur)
//                                    }
                                    self.landscapeRightEncoderFrontCamera!.adaptor.append(finalVideoPixelBuffer, withPresentationTime: pts)
                                }
               }
            
            self.video_frames_written = true

        }
    }
    
    
    // MARK: - Depth Data Output Delegate
    
    /// - Tag: StreamDepthData
    public  func depthDataOutput(_ depthDataOutput: AVCaptureDepthDataOutput, didOutput depthData: AVDepthData, timestamp: CMTime, connection: AVCaptureConnection) {
        processDepth(depthData: depthData)
    }
    
    func processDepth(depthData: AVDepthData) {
        if !renderingEnabled {
            return
        }
        
        if !depthVisualizationEnabled {
            return
        }
        
        //            if !videoDepthConverter.isPrepared {
        //                var depthFormatDescription: CMFormatDescription?
        //                CMVideoFormatDescriptionCreateForImageBuffer(allocator: kCFAllocatorDefault,
        //                                                             imageBuffer: depthData.depthDataMap,
        //                                                             formatDescriptionOut: &depthFormatDescription)
        //                if let unwrappedDepthFormatDescription = depthFormatDescription {
        //                    videoDepthConverter.prepare(with: unwrappedDepthFormatDescription, outputRetainedBufferCountHint: 2)
        //                }
        //            }
        //
        //            guard let depthPixelBuffer = videoDepthConverter.render(pixelBuffer: depthData.depthDataMap) else {
        //                print("Unable to process depth")
        //                return
        //            }
        
        //            currentDepthPixelBuffer = depthPixelBuffer
    }
    
    // MARK: - Video + Depth Output Synchronizer Delegate
    
    public func dataOutputSynchronizer(_ synchronizer: AVCaptureDataOutputSynchronizer, didOutput synchronizedDataCollection: AVCaptureSynchronizedDataCollection) {
        
        //        if let syncedDepthData: AVCaptureSynchronizedDepthData = synchronizedDataCollection.synchronizedData(for: depthDataOutput) as? AVCaptureSynchronizedDepthData {
        //            if !syncedDepthData.depthDataWasDropped {
        //                let depthData = syncedDepthData.depthData
        //                processDepth(depthData: depthData)
        //            }
        //        }
        
        //        if let syncedVideoData: AVCaptureSynchronizedSampleBufferData = synchronizedDataCollection.synchronizedData(for: videoDataOutput) as? AVCaptureSynchronizedSampleBufferData {
        //            if !syncedVideoData.sampleBufferWasDropped {
        //                let videoSampleBuffer = syncedVideoData.sampleBuffer
        //                //                processVideo(sampleBuffer: videoSampleBuffer)
        //            }
        //        }
    }
    
    // MARK: - Photo Output Delegate
    func photoOutput(_ output: AVCapturePhotoOutput, willCapturePhotoFor resolvedSettings: AVCaptureResolvedPhotoSettings) {
        flashScreen()
    }
    
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishCaptureFor resolvedSettings: AVCaptureResolvedPhotoSettings, error: Error?) {
        if let error = error {
            print("Error capturing photo: \(error)")
        }
    }
    
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        //            guard let photoPixelBuffer = photo.pixelBuffer else {
        //                print("Error occurred while capturing photo: Missing pixel buffer (\(String(describing: error)))")
        //                return
        //            }
        //
        //            var photoFormatDescription: CMFormatDescription?
        //            CMVideoFormatDescriptionCreateForImageBuffer(allocator: kCFAllocatorDefault,
        //                                                         imageBuffer: photoPixelBuffer,
        //                                                         formatDescriptionOut: &photoFormatDescription)
        //
        //            processingQueue.async {
        //                var finalPixelBuffer = photoPixelBuffer
        //                if let filter = self.photoFilter {
        //                    if !filter.isPrepared {
        //                        if let unwrappedPhotoFormatDescription = photoFormatDescription {
        //                            filter.prepare(with: unwrappedPhotoFormatDescription, outputRetainedBufferCountHint: 2)
        //                        }
        //                    }
        //
        //                    guard let filteredPixelBuffer = filter.render(pixelBuffer: finalPixelBuffer) else {
        //                        print("Unable to filter photo buffer")
        //                        return
        //                    }
        //                    finalPixelBuffer = filteredPixelBuffer
        //                }
        //
        //                if let depthData = photo.depthData {
        //                    let depthPixelBuffer = depthData.depthDataMap
        //
        //                    if !self.photoDepthConverter.isPrepared {
        //                        var depthFormatDescription: CMFormatDescription?
        //                        CMVideoFormatDescriptionCreateForImageBuffer(allocator: kCFAllocatorDefault,
        //                                                                     imageBuffer: depthPixelBuffer,
        //                                                                     formatDescriptionOut: &depthFormatDescription)
        //
        //                        /*
        //                         outputRetainedBufferCountHint is the number of pixel buffers we expect to hold on to from the renderer.
        //                         This value informs the renderer how to size its buffer pool and how many pixel buffers to preallocate.
        //                         Allow 3 frames of latency to cover the dispatch_async call.
        //                         */
        //                        if let unwrappedDepthFormatDescription = depthFormatDescription {
        //                            self.photoDepthConverter.prepare(with: unwrappedDepthFormatDescription, outputRetainedBufferCountHint: 3)
        //                        }
        //                    }
        //
        //                    guard let convertedDepthPixelBuffer = self.photoDepthConverter.render(pixelBuffer: depthPixelBuffer) else {
        //                        print("Unable to convert depth pixel buffer")
        //                        return
        //                    }
        //
        //                    if !self.photoDepthMixer.isPrepared {
        //                        if let unwrappedPhotoFormatDescription = photoFormatDescription {
        //                            self.photoDepthMixer.prepare(with: unwrappedPhotoFormatDescription, outputRetainedBufferCountHint: 2)
        //                        }
        //                    }
        //
        //                    // Combine image and depth map
        //                    guard let mixedPixelBuffer = self.photoDepthMixer.mix(videoPixelBuffer: finalPixelBuffer,
        //                                                                          depthPixelBuffer: convertedDepthPixelBuffer)
        //                        else {
        //                            print("Unable to mix depth and photo buffers")
        //                            return
        //                    }
        //
        //                    finalPixelBuffer = mixedPixelBuffer
        //                }
        //
        //                let metadataAttachments: CFDictionary = photo.metadata as CFDictionary
        //                guard let jpegData = CameraViewController.jpegData(withPixelBuffer: finalPixelBuffer, attachments: metadataAttachments) else {
        //                    print("Unable to create JPEG photo")
        //                    return
        //                }
        //
        //                // Save JPEG to photo library
        //                PHPhotoLibrary.requestAuthorization { status in
        //                    if status == .authorized {
        //                        PHPhotoLibrary.shared().performChanges({
        //                            let creationRequest = PHAssetCreationRequest.forAsset()
        //                            creationRequest.addResource(with: .photo, data: jpegData, options: nil)
        //                        }, completionHandler: { _, error in
        //                            if let error = error {
        //                                print("Error occurred while saving photo to photo library: \(error)")
        //                            }
        //                        })
        //                    }
        //                }
        //            }
    }
    
    // MARK: - REMOVE CAMERA LAYER
    @objc public func removeCameraLayer() {
        if(self.previewView == nil){
            return
        }
        DispatchQueue.main.async {
            self.cameraActive = false;
            self.previewView.removeFromSuperview()
        }
        dataOutputQueue.async {
            self.renderingEnabled = false
            self.video_frames_written = false
        }
        sessionQueue.async {
            if self.setupResult == .success {
                self.stopCaptureSession()
                self.removeObservers()
            }
        }
        
    }
    
    func stopCaptureSession() {

        if(!self.isSessionRunning) {
            return
        }
        sessionQueue.async {
            self.session.commitConfiguration()
            self.session.stopRunning()
            self.isSessionRunning = false
        }
    }
    
    func startCaptureSession() {
        if(self.isSessionRunning) {
            return
        }
        sessionQueue.async {
            self.session.startRunning()
            self.isSessionRunning = true
        }
    }
    
    // MARK: - ADD CAMERA LAYER
    @objc public func insertCameraLayer() {
        if (self.previewView == nil) {
            return
        }
        DispatchQueue.main.async {
            self.cameraActive = true;
            self.previewView = MetalPreview.init(rect: self.frame)
            self.addSubview(self.previewView)
        }
        self.startCaptureSession()
    }
    
    // MARK: - CAMERA ACTIVE STATUS UPDATE
    @objc public func updateCameraActive(cameraStatus : Bool) {
        if(cameraStatus){
            self.insertCameraLayer()
        }else{
            self.removeCameraLayer()
        }
    }
    
    // MARK: - AVPLAYER Delegate
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        self.stopRecord()
    }
    
    // MARK: - Utilities
    private func capFrameRate(videoDevice: AVCaptureDevice) {
        //        if self.photoOutput.isDepthDataDeliverySupported {
        //            // Cap the video framerate at the max depth framerate.
        //            if let frameDuration = videoDevice.activeDepthDataFormat?.videoSupportedFrameRateRanges.first?.minFrameDuration {
        //                do {
        //                    try videoDevice.lockForConfiguration()
        //                    videoDevice.activeVideoMinFrameDuration = frameDuration
        //                    videoDevice.unlockForConfiguration()
        //                } catch {
        //                    print("Could not lock device for configuration: \(error)")
        //                }
        //            }
        //        }
    }
    
    private func focus(with focusMode: AVCaptureDevice.FocusMode, exposureMode: AVCaptureDevice.ExposureMode, at devicePoint: CGPoint, monitorSubjectAreaChange: Bool) {
        
        sessionQueue.async {
            let videoDevice = self.videoInput.device
            
            do {
                try videoDevice.lockForConfiguration()
                if videoDevice.isFocusPointOfInterestSupported && videoDevice.isFocusModeSupported(focusMode) {
                    videoDevice.focusPointOfInterest = devicePoint
                    videoDevice.focusMode = focusMode
                }
                
                if videoDevice.isExposurePointOfInterestSupported && videoDevice.isExposureModeSupported(exposureMode) {
                    videoDevice.exposurePointOfInterest = devicePoint
                    videoDevice.exposureMode = exposureMode
                }
                
                videoDevice.isSubjectAreaChangeMonitoringEnabled = monitorSubjectAreaChange
                videoDevice.unlockForConfiguration()
            } catch {
                print("Could not lock device for configuration: \(error)")
            }
        }
    }
    
    func alert(title: String, message: String, actions: [UIAlertAction]) {
        let alertController = UIAlertController(title: title,
                                                message: message,
                                                preferredStyle: .alert)
        
        actions.forEach {
            alertController.addAction($0)
        }
        
        //            self.present(alertController, animated: true, completion: nil)
    }
    
    // Flash the screen to signal that AVCamFilter took a photo.
    func flashScreen() {
        let flashView = UIView(frame: self.previewView.frame)
        self.addSubview(flashView)
        flashView.backgroundColor = .black
        flashView.layer.opacity = 1
        UIView.animate(withDuration: 0.25, animations: {
            flashView.layer.opacity = 0
        }, completion: { _ in
            flashView.removeFromSuperview()
        })
    }
    
    private class func jpegData(withPixelBuffer pixelBuffer: CVPixelBuffer, attachments: CFDictionary?) -> Data? {
        let ciContext = CIContext()
        let renderedCIImage = CIImage(cvImageBuffer: pixelBuffer)
        guard let renderedCGImage = ciContext.createCGImage(renderedCIImage, from: renderedCIImage.extent) else {
            print("Failed to create CGImage")
            return nil
        }
        
        guard let data = CFDataCreateMutable(kCFAllocatorDefault, 0) else {
            print("Create CFData error!")
            return nil
        }
        
        guard let cgImageDestination = CGImageDestinationCreateWithData(data, kUTTypeJPEG, 1, nil) else {
            print("Create CGImageDestination error!")
            return nil
        }
        
        CGImageDestinationAddImage(cgImageDestination, renderedCGImage, attachments)
        if CGImageDestinationFinalize(cgImageDestination) {
            return data as Data
        }
        print("Finalizing CGImageDestination error!")
        return nil
    }
    
    
    @objc public func mergeVideo(urls:[URL]){
        if(self.musicURLToPlay != nil){
            self.audioPlayer!.stop()
            self.nextSegmentCheck = false
        }
        DispatchQueue.main.async {
            AVMutableComposition().mergeVideo(urls) { [weak self] url, error in
                print(url)
            }
        }
        
        
    }
    
    @objc public func setFilter(filterValues: NSDictionary ) -> Void {
        
        prevFilterValues = filterValues
        
        let filterType:String = filterValues.value(forKey: "type") as! String
        
        if filterType == "BLUR" {
            self.ApplyBlurFilter(filterValues: filterValues, filterType: filterType)
        } else {
            self.ApplyOtherFilter(filterValues: filterValues, filterType: filterType)
        }
    }
    
    
    func ApplyBlurFilter(filterValues: NSDictionary, filterType: String) {
        let range:Float = Float(truncating: filterValues.value(forKey: "range") as! NSNumber)
        let currentFilter: BlurMetalRenderer!
        currentFilter = BlurMetalRenderer();
        currentFilter.blurRadius = range
        self.videoFilter = currentFilter
    }
    
    func ApplyOtherFilter(filterValues: NSDictionary, filterType: String) {
        
        let contrast:Float = filterValues.value(forKey: "contrast") != nil ? Float(truncating: filterValues.value(forKey: "contrast") as! NSNumber) : 0.0
        
        let saturation:Float = filterValues.value(forKey: "saturation") != nil ? Float(truncating: filterValues.value(forKey: "saturation") as! NSNumber) : 0.0
        
        let brightness:Float = filterValues.value(forKey: "brightness") != nil ? Float(truncating: filterValues.value(forKey: "brightness") as! NSNumber) : 0.0
        
        //    let range:Float = Float(truncating: filterValues.value(forKey: "range") as! NSNumber)
        let range:Float =  filterValues.value(forKey: "range") != nil ?  Float(truncating: filterValues.value(forKey: "range") as! NSNumber) : 0.0
        
        var adjustments : Dictionary<String, Float>=[:]
        
        let currentFilter:CommonCIFilter!
        
        //Check for changing filter
        if(self.videoFilter == nil || self.videoFilter!.description != filterType){
            currentFilter = CommonCIFilter();
            currentFilter.filterType = filterType
            currentFilter.filter = filterDictionary.value(forKey: filterType) as? String
        }else{
            currentFilter = self.videoFilter as? CommonCIFilter
        }
        
        //Change values on filter adjustments
        switch filterType {
        case "SEPIA":
            adjustments["inputIntensity"] = range
        case "GRAYSCALE":
            adjustments["inputSaturation"] = 0
            adjustments["inputContrast"] = range
        case "SOBEL":
            adjustments["inputIntensity"] = range
        case "EDGE":
            adjustments["inputRadius"] = range
        case "MONOCHROME":
            adjustments["inputIntensity"] = range
        case "CSB":
            adjustments["inputBrightness"] = brightness
            adjustments["inputSaturation"] = saturation
            adjustments["inputContrast"] = contrast
        case "BLUR":
            adjustments["inputAmount"] = range
        default:
            //do nothing
            adjustments = [:]
        }
        
        if(adjustments.count > 0){
            currentFilter.adjustments = adjustments
        }
        
        self.videoFilter = currentFilter
    }
    
    
    
    @objc public func saveImage(image: UIImage) -> URL? {
        guard let data = image.jpegData(compressionQuality: 1) ?? image.pngData() else {
            return nil
        }
        guard let directory = try? FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false) as NSURL else {
            return nil
        }
        do {
            try data.write(to: directory.appendingPathComponent("litpicimg.png")!)
            return directory.appendingPathComponent("litpicimg.png")
        } catch {
            print(error.localizedDescription)
            return nil
        }
    }
    
    //Photo Picked
    @objc public func onPickMultiplePhotos(photoArray: [String],completion: @escaping (_ url:URL?, _ error: Error?) -> Void){
//        var ImgArray : [UIImage] = []
        DispatchQueue.global(qos: .userInteractive).async {
            self.resizeUpdatedPhotos(imageArray: photoArray, completion: { (imgs) in
                DispatchQueue.main.async {
                    self.build(outputSize: self.size, imageArray: imgs) { (url, err) in
                        completion(url,err)
                    }
                }
            })
            
           
        }
    }
    
    //MARK: Setting the AspectRatio
    let size = CGSize(width: 1080, height: 1920)
    
    func makeImageFit(resizeImages:[UIImage]) -> [UIImage] {
            var newImages = [UIImage]()
            for image in resizeImages {
                    let size = CGSize(width: self.size.width, height: self.size.height)
                DispatchQueue.main.async {
                    let view = UIView(frame: CGRect(origin: .zero, size: size))
                    view.backgroundColor = UIColor.black
                    let imageView = UIImageView(image: image)
                    imageView.contentMode = .scaleAspectFill
                    imageView.backgroundColor = UIColor.black
                    imageView.frame = view.bounds
                    view.addSubview(imageView)
                    let newImage = UIImage(view: view)
                    newImages.append(newImage)
                }
            }
            return newImages
        }
    
    //MARK: Resize the photos
    func resizeUpdatedPhotos(imageArray: [String],completion: @escaping (_ imagesArray:[UIImage])  -> Void) {
        var resizedImages : [UIImage] = []
        for imagNameValue in imageArray  {
            do {
                    let fileURL = URL(string: imagNameValue)
                    if let file_url = fileURL {
                        let imagData = try Data(contentsOf: file_url)
                        if let imagName = UIImage(data: imagData){
                            resizedImages.append(imagName)
                        }
                    }
                } catch {
                    print("Error loading image : \(error)")
                }
           
        }
        var newImages : [UIImage] = []
        for image in resizedImages {
                let size = CGSize(width: self.size.width, height: self.size.height)
            DispatchQueue.main.async {
                let view = UIView(frame: CGRect(origin: .zero, size: size))
                view.backgroundColor = UIColor.black
                let imageView = UIImageView(image: image)
                imageView.contentMode = .scaleAspectFill
                imageView.backgroundColor = UIColor.black
                imageView.frame = view.bounds
                view.addSubview(imageView)
                let newImage = UIImage(view: view)
                newImages.append(newImage)
                if(newImages.count == resizedImages.count){
                    completion(newImages)
                }
            }
        }
        
    }
    
    //MARK: Video size
    func sizePerMB(url: URL?) -> Double {
        guard let filePath = url?.path else {
            return 0.0
        }
        do {
            let attribute = try FileManager.default.attributesOfItem(atPath: filePath)
            if let size = attribute[FileAttributeKey.size] as? NSNumber {
                let sizesvideo = size.doubleValue / 1000000.0
                return sizesvideo
            }
        } catch {
            print("Error: \(error)")
        }
        return 0.0
    }
    
    
    func build(outputSize: CGSize, imageArray: [UIImage],completion: @escaping (_ url:URL?, _ error: Error? ) -> Void) {
        let fileManager = FileManager.default
        let urls = fileManager.urls(for: .documentDirectory, in: .userDomainMask)
        guard let documentDirectory = urls.first else {
            fatalError("documentDir Error")
        }
        let videoOutputURL = documentDirectory.appendingPathComponent("OutputPhotosVideo.mp4")

        if FileManager.default.fileExists(atPath: videoOutputURL.path) {
            do {
                try FileManager.default.removeItem(atPath: videoOutputURL.path)
            } catch {
                fatalError("Unable to delete file: \(error) : \(#function).")
            }
        }

        guard let videoWriter = try? AVAssetWriter(outputURL: videoOutputURL, fileType: AVFileType.mp4) else {
            fatalError("AVAssetWriter error")
        }

        let outputSettings = [AVVideoCodecKey : AVVideoCodecType.h264, AVVideoWidthKey : NSNumber(value: Float(outputSize.width)), AVVideoHeightKey : NSNumber(value: Float(outputSize.height))] as [String : Any]

        guard videoWriter.canApply(outputSettings: outputSettings, forMediaType: AVMediaType.video) else {
            fatalError("Negative : Can't apply the Output settings...")
        }


        let videoWriterInput = AVAssetWriterInput(mediaType: AVMediaType.video, outputSettings: outputSettings)
        let sourcePixelBufferAttributesDictionary = [
            kCVPixelBufferPixelFormatTypeKey as String : NSNumber(value: kCVPixelFormatType_32ARGB),
            kCVPixelBufferWidthKey as String: NSNumber(value: Float(outputSize.width)),
            kCVPixelBufferHeightKey as String: NSNumber(value: Float(outputSize.height))
        ]
        let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: videoWriterInput, sourcePixelBufferAttributes: sourcePixelBufferAttributesDictionary)

        if videoWriter.canAdd(videoWriterInput) {
            videoWriter.add(videoWriterInput)
        }

        if videoWriter.startWriting() {
            videoWriter.startSession(atSourceTime: CMTime.zero)
            assert(pixelBufferAdaptor.pixelBufferPool != nil)

            let media_queue = DispatchQueue(label: "mediaInputQueue")
            videoWriterInput.requestMediaDataWhenReady(on: media_queue, using: { () -> Void in

                var appendSucceeded = true

                var frameCountt: Int64 = 0
                // 30 sec each 3 seconds 10images
                let framePerSecond: Int64 = Int64(9)
                let fps: Float64 = 3;
                let frameDuration = CMTimeMake(value: 1, timescale: Int32(fps))
                var resizeImages = imageArray
                if(resizeImages.count == 1){
                    resizeImages.append(imageArray[0])
                    resizeImages.append(imageArray[0])
                    resizeImages.append(imageArray[0])
                }
                while (resizeImages.count != 0) {
                    if (videoWriterInput.isReadyForMoreMediaData) {

                        let nextPhoto = resizeImages.remove(at: 0)
                        let lastFrameTime = CMTimeMake(value: frameCountt * framePerSecond, timescale: Int32(fps))
                        let presentationTime = frameCountt == 0 ? lastFrameTime : CMTimeAdd(lastFrameTime, frameDuration)

                        var pixelBuffer: CVPixelBuffer? = nil
                        let status: CVReturn = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, pixelBufferAdaptor.pixelBufferPool!, &pixelBuffer)

                        if let pixelBuffer = pixelBuffer, status == 0 {
                            let managedPixelBuffer = pixelBuffer
                            CVPixelBufferLockBaseAddress(managedPixelBuffer, [])

                            let data = CVPixelBufferGetBaseAddress(managedPixelBuffer)
                            let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
                            let context = CGContext(data: data, width: Int(outputSize.width), height: Int(outputSize.height), bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(managedPixelBuffer), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)

                            context?.clear(CGRect(x: 0, y: 0, width: outputSize.width, height: outputSize.height))

                            let horizontalRatio = CGFloat(outputSize.width) / nextPhoto.size.width
                            let verticalRatio = CGFloat(outputSize.height) / nextPhoto.size.height

                            let aspectRatio = min(horizontalRatio, verticalRatio) // ScaleAspectFit
                            let newSize = CGSize(width: nextPhoto.size.width * aspectRatio, height: nextPhoto.size.height * aspectRatio)

                            let x = newSize.width < outputSize.width ? (outputSize.width - newSize.width) / 2 : 0
                            let y = newSize.height < outputSize.height ? (outputSize.height - newSize.height) / 2 : 0

                            context?.draw(nextPhoto.cgImage!, in: CGRect(x: x, y: y, width: newSize.width, height: newSize.height))

                            CVPixelBufferUnlockBaseAddress(managedPixelBuffer, [])

                            appendSucceeded = pixelBufferAdaptor.append(pixelBuffer, withPresentationTime: presentationTime)
                        } else {
                            print("Failed to allocate pixel buffer")
                            appendSucceeded = false
                        }
                        
                        frameCountt = frameCountt + 1
                    }

                    if !appendSucceeded {
                        break
                    }
                }
                videoWriterInput.markAsFinished()
                videoWriter.finishWriting { () -> Void in
                    print("FINISHED!!!!!")
                    completion(videoOutputURL,nil)
                }
                _ = self.sizePerMB(url: videoOutputURL)

            })
        }
    }
    
    
    
    // MARK:Silhoutte Feature - Extract last frame from Video
    @objc public func extractLastFrameFromVideo(videoURL: URL) -> URL {
        let asset : AVURLAsset = AVURLAsset(url: videoURL, options: nil)
        let generate : AVAssetImageGenerator = AVAssetImageGenerator(asset: asset)
        generate.appliesPreferredTrackTransform = true

        var _ : NSError? = nil
        let lastFrameTime = Int64(CMTimeGetSeconds(asset.duration)*60.0)
        let time : CMTime = CMTimeMake(value: lastFrameTime, timescale: 2)
        var img = UIImage()
        do{
            let imgRef : CGImage = try generate.copyCGImage(at: time, actualTime: nil)
            img = UIImage(cgImage: imgRef)
            return img.saveImage(inDir: FileManager.SearchPathDirectory.documentDirectory, img: img)!
        }catch{
            return img.saveImage(inDir: FileManager.SearchPathDirectory.documentDirectory, img: img)!
        }
    }
    
}

extension UIImage {
    
    convenience init(view: UIView) {
            UIGraphicsBeginImageContextWithOptions(view.bounds.size, view.isOpaque, 0)
            view.drawHierarchy(in: view.bounds, afterScreenUpdates: false)
            view.layer.render(in: UIGraphicsGetCurrentContext()!)
            let image = UIGraphicsGetImageFromCurrentImageContext()
            UIGraphicsEndImageContext()
            self.init(cgImage: image!.cgImage!)
        }
    
    enum ContentMode {
        case contentFill
        case contentAspectFill
        case contentAspectFit
    }
    
    func resizeEnd(withSize size: CGSize, contentMode: ContentMode = .contentAspectFill) -> CGSize? {
        let aspectWidth = size.width / self.size.width
        let aspectHeight = size.height / self.size.height
        
        switch contentMode {
        case .contentFill:
            return size
//            return resize(withSize: size)
        case .contentAspectFit:
            let aspectRatio = min(aspectWidth, aspectHeight)
            
            return CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio)
//            return resize(withSize: CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio))
        case .contentAspectFill:
            let aspectRatio = max(aspectWidth, aspectHeight)
//            return resize(withSize: CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio))
        return CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio)
        }
    }
    
    private func resize(withSize size: CGSize) -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(size, false, self.scale)
        defer { UIGraphicsEndImageContext() }
        draw(in: CGRect(x: 0.0, y: 0.0, width: size.width, height: size.height))
        return UIGraphicsGetImageFromCurrentImageContext()
        
    }
    
    func saveImage(inDir:FileManager.SearchPathDirectory,img:UIImage) -> URL?{
        guard let documentDirectoryPath = FileManager.default.urls(for: inDir, in: .userDomainMask).first else {
            return nil
        }
        //let img : UIImage = self
        // Change extension if you want to save as PNG.
        let imgPath = URL(fileURLWithPath: documentDirectoryPath.appendingPathComponent("LastFrame.jpg").path)
        if(FileManager.default.fileExists(atPath: imgPath.path)){
            do{
                try FileManager.default.removeItem(atPath: imgPath.path)
                
            }catch{
            }
        }
        do {
            //try img.jpegData(compressionQuality: 0.5)?.write(to: imgPath, options: .atomic)
            if let data = img.jpegData(compressionQuality: 1.0){
                    do {
                        try data.write(to: imgPath)
                    } catch {
                        print("error saving", error)
                    }
                }
            return imgPath
        } catch {
            print(error.localizedDescription)
            return nil
        }
      }
    
}

extension AVCaptureVideoOrientation {
    init?(interfaceOrientation: UIInterfaceOrientation) {
        switch interfaceOrientation {
        case .portrait: self = .portrait
        case .portraitUpsideDown: self = .portraitUpsideDown
        case .landscapeLeft: self = .landscapeLeft
        case .landscapeRight: self = .landscapeRight
        default: return nil
        }
    }
}

@available(iOS 10.0, *)
extension MetalPreview.Rotation {
    init?(with interfaceOrientation: UIInterfaceOrientation, videoOrientation: AVCaptureVideoOrientation, cameraPosition: AVCaptureDevice.Position) {
        /*
         Calculate the rotation between the videoOrientation and the interfaceOrientation.
         The direction of the rotation depends upon the camera position.
         */
        switch videoOrientation {
        case .portrait:
            switch interfaceOrientation {
            case .landscapeRight:
                if cameraPosition == .front {
                    self = .rotate90Degrees
                } else {
                    self = .rotate270Degrees
                }
                
            case .landscapeLeft:
                if cameraPosition == .front {
                    self = .rotate270Degrees
                } else {
                    self = .rotate90Degrees
                }
                
            case .portrait:
                self = .rotate0Degrees
                
            case .portraitUpsideDown:
                self = .rotate180Degrees
                
            default: return nil
            }
        case .portraitUpsideDown:
            switch interfaceOrientation {
            case .landscapeRight:
                if cameraPosition == .front {
                    self = .rotate270Degrees
                } else {
                    self = .rotate90Degrees
                }
                
            case .landscapeLeft:
                if cameraPosition == .front {
                    self = .rotate90Degrees
                } else {
                    self = .rotate270Degrees
                }
                
            case .portrait:
                self = .rotate180Degrees
                
            case .portraitUpsideDown:
                self = .rotate0Degrees
                
            default: return nil
            }
            
        case .landscapeRight:
            switch interfaceOrientation {
            case .landscapeRight:
                self = .rotate0Degrees
                
            case .landscapeLeft:
                self = .rotate180Degrees
                
            case .portrait:
                if cameraPosition == .front {
                    self = .rotate270Degrees
                } else {
                    self = .rotate90Degrees
                }
                
            case .portraitUpsideDown:
                if cameraPosition == .front {
                    self = .rotate90Degrees
                } else {
                    self = .rotate270Degrees
                }
                
            default: return nil
            }
            
        case .landscapeLeft:
            switch interfaceOrientation {
            case .landscapeLeft:
                self = .rotate0Degrees
                
            case .landscapeRight:
                self = .rotate180Degrees
                
            case .portrait:
                if cameraPosition == .front {
                    self = .rotate90Degrees
                } else {
                    self = .rotate270Degrees
                }
                
            case .portraitUpsideDown:
                if cameraPosition == .front {
                    self = .rotate270Degrees
                } else {
                    self = .rotate90Degrees
                }
                
            default: return nil
            }
        @unknown default:
            fatalError("Unknown orientation.")
        }
    }
}




extension AVMutableComposition {
    
    func mergeVideo(_ urls: [URL], completion: @escaping (_ url: URL?, _ error: Error?) -> Void) {
        guard let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            completion(nil, nil)
            return
        }
        
        let outputURL = documentDirectory.appendingPathComponent("mergedVideo.mp4")
        
        do { // delete old video
            try FileManager.default.removeItem(at: outputURL)
        } catch { print(error.localizedDescription) }
        
        
        // If there is only one video, we dont to touch it to save export time.
        if let url = urls.first, urls.count == 1 {
            do {
                try FileManager().copyItem(at: url, to: outputURL)
                completion(outputURL, nil)
            } catch let error {
                completion(nil, error)
            }
            return
        }
        
        let maxRenderSize = CGSize(width: 1280.0, height: 720.0)
        var currentTime = CMTime.zero
        var renderSize = CGSize.zero
        // Create empty Layer Instructions, that we will be passing to Video Composition and finally to Exporter.
        var instructions = [AVMutableVideoCompositionInstruction]()
        
        urls.enumerated().forEach { index, url in
            let asset = AVAsset(url: url)
            let assetTrack = asset.tracks.first!
            
            // Create instruction for a video and append it to array.
            let instruction = AVMutableComposition.instruction(assetTrack, asset: asset, time: currentTime, duration: assetTrack.timeRange.duration, maxRenderSize: maxRenderSize)
            instructions.append(instruction.videoCompositionInstruction)
            
            // Set render size (orientation) according first video.
            if index == 0 {
                renderSize = instruction.isPortrait ? CGSize(width: maxRenderSize.height, height: maxRenderSize.width) : CGSize(width: maxRenderSize.width, height: maxRenderSize.height)
            }
            
            do {
                let timeRange = CMTimeRangeMake(start: .zero, duration: assetTrack.timeRange.duration)
                // Insert video to Mutable Composition at right time.
                try insertTimeRange(timeRange, of: asset, at: currentTime)
                currentTime = CMTimeAdd(currentTime, assetTrack.timeRange.duration)
            } catch let error {
                completion(nil, error)
            }
        }
        
        // Create Video Composition and pass Layer Instructions to it.
        let videoComposition = AVMutableVideoComposition()
        videoComposition.instructions = instructions
        // Do not forget to set frame duration and render size. It will crash if you dont.
        videoComposition.frameDuration = CMTimeMake(value: 1, timescale: 30)
        videoComposition.renderSize = renderSize
        
        guard let exporter = AVAssetExportSession(asset: self, presetName: AVAssetExportPreset1280x720) else {
            completion(nil, nil)
            return
        }
        exporter.outputURL = outputURL
        exporter.outputFileType = .mp4
        // Pass Video Composition to the Exporter.
        exporter.videoComposition = videoComposition
        
        exporter.exportAsynchronously {
            DispatchQueue.main.async {
                completion(exporter.outputURL, nil)
            }
        }
    }
    
    static func instruction(_ assetTrack: AVAssetTrack, asset: AVAsset, time: CMTime, duration: CMTime, maxRenderSize: CGSize)
        -> (videoCompositionInstruction: AVMutableVideoCompositionInstruction, isPortrait: Bool) {
            let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: assetTrack)
            
            // Find out orientation from preffered transform.
            let assetInfo = orientationFromTransform(assetTrack.preferredTransform)
            
            // Calculate scale ratio according orientation.
            var scaleRatio = maxRenderSize.width / assetTrack.naturalSize.width
            if assetInfo.isPortrait {
                scaleRatio = maxRenderSize.height / assetTrack.naturalSize.height
            }
            
            // Set correct transform.
            var transform = CGAffineTransform(scaleX: scaleRatio, y: scaleRatio)
            transform = assetTrack.preferredTransform.concatenating(transform)
            layerInstruction.setTransform(transform, at: .zero)
            
            // Create Composition Instruction and pass Layer Instruction to it.
            let videoCompositionInstruction = AVMutableVideoCompositionInstruction()
            videoCompositionInstruction.timeRange = CMTimeRangeMake(start: time, duration: duration)
            videoCompositionInstruction.layerInstructions = [layerInstruction]
            
            return (videoCompositionInstruction, assetInfo.isPortrait)
    }
    
    static func orientationFromTransform(_ transform: CGAffineTransform) -> (orientation: UIImage.Orientation, isPortrait: Bool) {
        var assetOrientation = UIImage.Orientation.up
        var isPortrait = false
        
        switch [transform.a, transform.b, transform.c, transform.d] {
        case [0.0, 1.0, -1.0, 0.0]:
            assetOrientation = .right
            isPortrait = true
            
        case [0.0, -1.0, 1.0, 0.0]:
            assetOrientation = .left
            isPortrait = true
            
        case [1.0, 0.0, 0.0, 1.0]:
            assetOrientation = .up
            
        case [-1.0, 0.0, 0.0, -1.0]:
            assetOrientation = .down
            
        default:
            break
        }
        
        return (assetOrientation, isPortrait)
    }
    
}

extension URL {
    func download(destination:URL, using fileName: String? = nil, overwrite: Bool = false, completion: @escaping (URL?, Error?) -> Void) throws {
        
       
//        if !overwrite, FileManager.default.fileExists(atPath: destination.path) {
//            completion(destination, nil)
//            return
//        }
        URLSession.shared.downloadTask(with: self) { location, _, error in
            guard let location = location else {
                completion(nil, error)
                return
            }
            do {
                if overwrite, FileManager.default.fileExists(atPath: destination.path) {
                    try FileManager.default.removeItem(at: destination)
                }
                try FileManager.default.moveItem(at: location, to: destination)
                completion(destination, nil)
            } catch {
                print(error)
            }
        }.resume()
    }
}

enum Exposure {
        case min, normal, max
        
         public func value(device: AVCaptureDevice) -> Float {
            switch self {
            case .min:
                return device.activeFormat.minISO
            case .normal:
                return AVCaptureDevice.currentISO
            case .max:
                return device.activeFormat.maxISO
            }
        }
    }

public class VideoGeneratorError: NSObject, LocalizedError {
  
  public enum CustomError {
    case kFailedToStartAssetWriterError
    case kFailedToAppendPixelBufferError
    case kFailedToFetchDirectory
    case kFailedToStartAssetExportSession
    case kMissingVideoURLs
    case kFailedToReadProvidedClip
    case kUnsupportedVideoType
    case kFailedToStartReader
    case kFailedToReadVideoTrack
    case kFailedToReadStartTime
  }
  
  fileprivate var desc = ""
  fileprivate var error: CustomError
  fileprivate let kErrorDomain = "VideoGenerator"
  
  init(error: CustomError) {
    self.error = error
  }
  
  override public var description: String {
    get {
      switch error {
      case .kFailedToStartAssetWriterError:
        return "\(kErrorDomain): AVAssetWriter failed to start writing"
      case .kFailedToAppendPixelBufferError:
        return "\(kErrorDomain): AVAssetWriterInputPixelBufferAdapter failed to append pixel buffer"
      case .kFailedToFetchDirectory:
        return "\(kErrorDomain): Can't find the Documents directory"
      case .kFailedToStartAssetExportSession:
        return "\(kErrorDomain): Can't begin an AVAssetExportSession"
      case .kMissingVideoURLs:
        return "\(kErrorDomain): Missing video paths"
      case .kFailedToReadProvidedClip:
        return "\(kErrorDomain): Couldn't read the supplied video's frames."
      case .kUnsupportedVideoType:
        return "\(kErrorDomain): Unsupported video type. Supported tyeps: .m4v, mp4, .mov"
      case .kFailedToStartReader:
        return "\(kErrorDomain): Failed to start reading video frames"
      case .kFailedToReadVideoTrack:
        return "\(kErrorDomain): Failed to read video track in asset"
      case .kFailedToReadStartTime:
        return "\(kErrorDomain): Start time can't be less then 0"
      }
    }
  }
  
  public var errorDescription: String? {
    get {
      return self.description
    }
  }
}
