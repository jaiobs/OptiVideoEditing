////
////  SpeedViewSwift.swift
////  react-native-litpic-camera-module
////
////  Created by optisol on 03/08/20.


import UIKit
import Photos
import  AVKit

enum SpeedMode {
    case Slower
    case Faster
    case Normal
}


@objc public class SpeedViewSwift: UIView, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout{
    
    var leftView:UIView?
    var rightView:UIView?
    var toolView:UIView?
    var totalHours:UILabel?
    var videoTitle:UILabel?
    var collectionview: UICollectionView!
    var playbackTimeCheckerTimer: Timer?
    
    var videoToolView:UIView?
    var videototalHours:UILabel?
    var videoProcessingIndex:Int = 0
    
    var currentSegmentUrl:URL?
//    var player: AVPlayer?
    var playlayer: AVPlayerLayer?
    var videoStartTime = CMTime.zero
    var videoLastDuration = CMTime.zero
    
    var cellId = "Cell"
    public var dataLoad:Bool = false
    public var IsVideoSelected:Bool = false
    public var completedVideoArray:[String] = [String]()
    public var videosInformation:[String:Any] = [String:Any]()
    public var selectedVideoKey:String = "Clip video 1"
    public var selectedVideo:[String:Any] = [String:Any]()
    
    var IsSpeedUpdated:Bool = false
    @objc  public var videoUrl:NSArray?
    @objc public var audioInfo:[String:Any]?
    var backgroundEmitorCompletionHandler: ((_ param: NSDictionary) -> ())?
    var backgroundSpeedApplyCompletionHandler: ((_ param: NSDictionary) -> ())?
    let trimObj = VideoInformationDetail()

    @objc public override init(frame: CGRect) {
        super.init(frame: frame)
        leftView = UIView.init(frame: self.frame)
        self.addSubview(leftView!)
        
        rightView = UIView.init(frame: self.frame)
        self.addSubview(rightView!)
        
        toolView = UIView.init()
        
        let layout: UICollectionViewFlowLayout = UICollectionViewFlowLayout()
        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
        layout.itemSize = CGSize(width: 50, height: 50)
        layout.minimumInteritemSpacing = 10.0;
        layout.minimumLineSpacing = 10.0;
        layout.scrollDirection = .horizontal
        
        collectionview = UICollectionView(frame: CGRect.init(x: 0, y: 130, width: self.frame.size.width, height: 50), collectionViewLayout: layout)
        collectionview.dataSource = self
        collectionview.delegate = self
        collectionview.register(VideoCell.self, forCellWithReuseIdentifier: cellId)
        collectionview.showsVerticalScrollIndicator = false
        rightView!.addSubview(collectionview)
    }
    
    @objc public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    public override func layoutSubviews() {
        if UIDevice.current.orientation.isLandscape {
            
        } else {
            self.portraitView()
        }
    }
    
    public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        
        if newWindow == nil {
            // UIView disappear
            if VideoInformationDetail.player != nil{
                VideoInformationDetail.player?.pause()
                VideoInformationDetail.player = nil
                VideoInformationDetail.currentVideoIndex = 0
            }
        } else {
            // UIView appear
        }
    }
    
    
    @objc public func copyEmitor(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        backgroundEmitorCompletionHandler = completionHandler
    }
    
    
    func portraitView()  {
        self.leftView?.frame = CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height - 250)
        self.rightView?.frame = CGRect.init(x: 0, y: self.frame.size.height - 250, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: 250)


//        VideoInformationDetail.trim.frame = CGRect.init(x: 10, y: (self.rightView?.frame.origin.y)! + 20, width: (self.rightView?.frame.width)!, height: 45)
        VideoInformationDetail.trim.backgroundColor = UIColor.init(red: 23, green: 25, blue: 37, alpha: 1)
        VideoInformationDetail.trim.isUserInteractionEnabled = true
        VideoInformationDetail.trim.minDuration = 1
        VideoInformationDetail.trim.maxDuration = 150
        VideoInformationDetail.trim.maskColor = .white
        VideoInformationDetail.trim.mainColor = UIColor.init(red: 232.0/255.0, green: 56.0/255.0, blue: 160.0/255.0, alpha: 1)
        VideoInformationDetail.trim.handleColor = .black
        VideoInformationDetail.trim.positionBarColor = .white
        VideoInformationDetail.trim.assetPreview.backgroundColor = .black
        rightView?.bringSubviewToFront(VideoInformationDetail.trim)
        rightView!.addSubview(VideoInformationDetail.trim)

        NSLayoutConstraint.activate([
            VideoInformationDetail.trim.leftAnchor.constraint(equalTo: self.rightView!.leftAnchor, constant: 10),
            VideoInformationDetail.trim.rightAnchor.constraint(equalTo: self.rightView!.rightAnchor, constant: -10),
            VideoInformationDetail.trim.topAnchor.constraint(equalTo: self.rightView!.topAnchor, constant: 20),
            VideoInformationDetail.trim.heightAnchor.constraint(equalToConstant: 45)
        ])
        
        
        totalHours = UILabel.init(frame:CGRect.init(x: 0, y: 75, width: self.frame.size.width, height: 20))
        totalHours!.textAlignment = .center
        totalHours!.text = "Total: 00s"
        totalHours?.textColor = .white
        totalHours?.textAlignment = .center
        totalHours?.backgroundColor = .clear
        totalHours!.font = UIFont.systemFont(ofSize: 13)
        rightView?.addSubview(totalHours!)

        collectionview.frame =  CGRect.init(x: 0, y: 155, width: self.frame.size.width, height: 90)
        initialInformationLoadToPlayer()
    }
    
    func landscapeView() {
        
    }
    
    func initialInformationLoadToPlayer(){
        stopPlaybackTimeChecker()
        
        if let videoUrl = VideoSingleton.sharedInstance.temVideoUrl{
            //Full video - All picked video convert as a single video
            let videoAsset:AVAsset = AVAsset.init(url: videoUrl)
            
            if let speedUpdatedVideoSegment = VideoSingleton.sharedInstance.temVideoSegment{
                VideoInformationDetail.videoArray = speedUpdatedVideoSegment as! [Any]
            }else{
                if let originalVideoSegment = VideoSingleton.sharedInstance.VideoSegment{
                    VideoInformationDetail.videoArray = originalVideoSegment as! [Any]
                }else{
                    print("NIL HANDLE ERROR LOG:- func/initialInformationLoadToPlayer  VideoSingleton.sharedInstance.VideoSegment and VideoSingleton.sharedInstance.temVideoSegment is nil...")
                }
            }
            
            
            
            self.collectionview.reloadData()
            videoStartTime = CMTime.zero
            videoLastDuration = CMTime.zero
            
            for (index,videoObj) in VideoInformationDetail.videoArray.enumerated() {
                let video:[String:Any] = videoObj as! [String : Any];
             
                let temVideoUrl = video["videoUrl"].flatMap{ URL.init(string: $0 as! String)}
                    
                if let videoUrl = temVideoUrl {
                    let videoAsset:AVAsset = AVAsset.init(url:videoUrl)
                    if let speedLevelString:String = video["speedLevel"] as? String{
                        if let speedLevel:Int = Int(speedLevelString){
                            if index == VideoInformationDetail.currentVideoIndex {
                                videoStartTime = CMTimeAdd(videoStartTime, videoLastDuration)
                                videoLastDuration = videoAsset.duration
                                applySpeedLevel(speed: speedLevel)
                                totalHours?.text = "Total : \( videoAsset.duration.seconds.rounded())"
                                break;
                            }else{
                                let normalSpeed = 3
                                videoStartTime = CMTimeAdd(videoStartTime, videoLastDuration)
                                videoLastDuration = videoAsset.duration
                                applySpeedLevel(speed: normalSpeed)
                            }
                        }else{
                            print("NIL HANDLE ERROR LOG:- func/initialInformationLoadToPlayer  speedLevel is nil...")
                        }
                    }else{
                        print("NIL HANDLE ERROR LOG:- func/initialInformationLoadToPlayer  speedLevel type casting error")
                        break
                    }
                    
                    
                    
                    
                    
                }else{
                    print("NIL HANDLE ERROR LOG:- func/initialInformationLoadToPlayer one video is nil...")
                }
            }
            
            
            DispatchQueue.global(qos: .userInteractive).async
            {
                // Background thread
                // Do your AVPlayer work here
              
                var temPlayitem:AVPlayerItem?
                temPlayitem = AVPlayerItem.init(url: videoUrl)
                VideoInformationDetail.player = AVPlayer(playerItem: temPlayitem)
                
     
                // When you need to update the UI, switch back out to the main thread
                DispatchQueue.main.async { [self] in
                    // Main thread
                    // Do your UI updates here
                    
                    self.leftView!.layer.sublayers?
                        .filter { $0 is AVPlayerLayer }
                        .forEach { $0.removeFromSuperlayer() }
                    self.playlayer = AVPlayerLayer(player: VideoInformationDetail.player)
                    self.playlayer!.backgroundColor = UIColor.black.cgColor
                    self.playlayer!.frame = CGRect(x: 0, y: 0, width: self.leftView!.frame.width, height: self.leftView!.frame.height)
                    self.playlayer!.videoGravity = AVLayerVideoGravity.resizeAspect
                    self.leftView!.layer.sublayers?.forEach({$0.removeFromSuperlayer()})
                    self.leftView!.layer.addSublayer(self.playlayer!)
                                        
                    VideoInformationDetail.player?.play()
                    VideoInformationDetail.trim.asset = videoAsset
                    VideoInformationDetail.trim.moveLeftHandle(to: self.videoStartTime)
                    VideoInformationDetail.trim.moveRightHandle(to: CMTimeAdd(self.videoStartTime, self.videoLastDuration))
                    VideoInformationDetail.trim.delegate = self
                    VideoInformationDetail.player?.currentItem?.seek(to: self.videoStartTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
                    VideoInformationDetail.player?.play()
                    self.startPlaybackTimeChecker()
                }
                }
        }else{
            print("NIL HANDLE ERROR LOG:- func/initialInformationLoadToPlayer VideoSingleton.sharedInstance.temVideoUrl is nil...")

        }

    }
    
    
    func applySpeedLevel(speed:Int){
        if (speed == 1){
            videoLastDuration = CMTimeMultiply(videoLastDuration, multiplier: 3)
        }else if (speed == 2){
            videoLastDuration = CMTimeMultiply(videoLastDuration, multiplier: 2)
        }else if (speed == 4){
            videoLastDuration = CMTimeMultiplyByRatio(videoLastDuration, multiplier: 1, divisor: 2)
        }else if (speed == 5){
            videoLastDuration = CMTimeMultiplyByRatio(videoLastDuration, multiplier: 1, divisor: 3)
        }
    }
    
    @objc func fileComplete() {
        if let startTime = VideoInformationDetail.trim.startTime {
            VideoInformationDetail.player?.seek(to: startTime)
            VideoInformationDetail.player?.play()
        }
    }
    
    
    func videoRender() {
        //    let duration = (trim.endTime! - trim.startTime!).seconds
        //    totalHours?.text = "Total : \( duration.rounded())"
        //    print(duration)
    }
    
    
    @objc public func checkVideoTime(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        
        if let videoUrl = VideoSingleton.sharedInstance.temVideoUrl{
            
            
            guard let startTime = VideoInformationDetail.trim.startTime, let endTime = VideoInformationDetail.trim.endTime  else {
                print("NIL HANDLE ERROR LOG:- func/checkVideoTime VideoInformationDetail.trim.startTime or VideoInformationDetail.trim.endTime  is nil...")
                return
            }
            
                let sourceAsset = AVURLAsset(url: videoUrl, options: nil)
                let duration = sourceAsset.duration.seconds

                let trimerDuration = (endTime - startTime).seconds


                if trimerDuration > 30.0 {
                    let dict:NSDictionary = ["video_limit_exit" : true]
                    completionHandler(dict)
                }else{
                    if trimerDuration <= 30.0 && duration > 30.0 {
                        let duration = (endTime - startTime).seconds
                        let frame1Time = CMTime(seconds: duration, preferredTimescale: sourceAsset.duration.timescale)
                        let trackTimeRange = CMTimeRangeMake(start: startTime, duration: frame1Time)

                        DPVideoMerger().mergeVideosWithTimer(withFileURLs:[videoUrl] , videoTimeRange: trackTimeRange, completion:{(_ mergedVideoFile: URL?, _ error: Error?) -> Void in
                            VideoSingleton.sharedInstance.temVideoUrl = mergedVideoFile
                            let dict:NSDictionary = ["video_limit_exit" : false]
                            completionHandler(dict)
                        })
                    }else{
                        let dict:NSDictionary = ["video_limit_exit" : false]
                        completionHandler(dict)
                    }
                }

        }else{
            print("NIL HANDLE ERROR LOG:- func/checkVideoTime VideoSingleton.sharedInstance.temVideoSegment is nil...")
        }
    }
    
    
    public func resetData(){
        
        
        if let videoUrl = VideoSingleton.sharedInstance.temVideoUrl{
        let asset = AVAsset(url: videoUrl)

        asset.loadValuesAsynchronously(forKeys: ["duration"], completionHandler: { [self] in
            let newItem = AVPlayerItem(asset: asset)
            VideoInformationDetail.player!.replaceCurrentItem(with: newItem)
        })
        

        if let speedUpdatedVideoSegment = VideoSingleton.sharedInstance.temVideoSegment{
            VideoInformationDetail.videoArray = speedUpdatedVideoSegment as! [Any]
        }else{
            if let originalVideoSegment = VideoSingleton.sharedInstance.VideoSegment{
                VideoInformationDetail.videoArray = originalVideoSegment as! [Any]
            }else{
                print("NIL HANDLE ERROR LOG:- func/resetData  VideoSingleton.sharedInstance.VideoSegment and VideoSingleton.sharedInstance.temVideoSegment is nil...")
            }
        }


        self.collectionview.reloadData()

        videoStartTime = CMTime.zero
        videoLastDuration = CMTime.zero
        
        for (index,videoObj) in VideoInformationDetail.videoArray.enumerated() {
            let video:[String:Any] = videoObj as! [String : Any];
            let videoAsset:AVAsset = AVAsset.init(url: URL.init(string: video["videoUrl"] as! String)!)
            let speedLevel:Int = video["speedLevel"] as! Int
            if index == VideoInformationDetail.currentVideoIndex {
                videoStartTime = CMTimeAdd(videoStartTime, videoLastDuration)
                videoLastDuration = videoAsset.duration
                applySpeedLevel(speed: speedLevel)
                totalHours?.text = "Total : \( videoAsset.duration.seconds.rounded())"
                break;
            }else{
                videoStartTime = CMTimeAdd(videoStartTime, videoLastDuration)
                videoLastDuration = videoAsset.duration
                applySpeedLevel(speed: speedLevel)
            }
        }

        
        
    
        
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    VideoInformationDetail.trim.asset = asset
                    VideoInformationDetail.trim.assetDidChange(newAsset: asset)
                    VideoInformationDetail.trim.moveLeftHandle(to: self.videoStartTime)
                    VideoInformationDetail.trim.moveRightHandle(to: CMTimeAdd(self.videoStartTime, self.videoLastDuration))
                    VideoInformationDetail.trim.delegate = self
                    VideoInformationDetail.player?.currentItem?.seek(to: self.videoStartTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
                    VideoInformationDetail.player?.play()
                }
            
        }else{
            print("NIL HANDLE ERROR LOG:- func/checkVideoTime VideoSingleton.sharedInstance.temVideoSegment is nil...")
        }
    }


    
    @objc public func updateSpeedMode(speedLevel:Int, completionHandler: @escaping (_ param: NSDictionary) -> Void){
        VideoInformationDetail.player?.pause()
        
        var videoData:NSMutableArray = NSMutableArray.init()
        var videoInformation:[String:Any] = [String:Any]()
        var temVideoArrary:NSMutableArray = NSMutableArray.init(array: VideoInformationDetail.videoArray)
        
        if (VideoSingleton.sharedInstance.temVideoSegment == nil){
            videoInformation = VideoInformationDetail.videoArray[VideoInformationDetail.currentVideoIndex] as! [String : Any]
        }else{
            temVideoArrary = VideoSingleton.sharedInstance.temVideoSegment!
            videoInformation = VideoInformationDetail.videoArray[VideoInformationDetail.currentVideoIndex] as! [String : Any]
        }
                
        if(1 == speedLevel){
            videoInformation["speedLevel"] = 5
        }else if (2 == speedLevel){
            videoInformation["speedLevel"] = 4
        }else if (3 == speedLevel){
            videoInformation["speedLevel"] = 3
        }else if (4 == speedLevel){
            videoInformation["speedLevel"] = 2
        }else if (5 == speedLevel){
            videoInformation["speedLevel"] = 1
        }
        
        
        
        var speedUpdatedArray:NSMutableArray = NSMutableArray.init()
        temVideoArrary[VideoInformationDetail.currentVideoIndex] = videoInformation
        speedUpdatedArray = temVideoArrary
        VideoSingleton.sharedInstance.temVideoSegment = speedUpdatedArray
        speedUpdatedArray = NSMutableArray.init(array: speedUpdatedArray.reversed())
        
        
        RNCamera.mergeVideo(with: speedUpdatedArray, audio: VideoSingleton.sharedInstance.TemAudioSegment, completionHandler: { [self] result in
           
            VideoSingleton.sharedInstance.temVideoUrl = result

            if (self.audioInfo == nil){
                VideoSingleton.sharedInstance.originalVideoUrl = result
                let response:NSDictionary = ["IsSpeedUpdated" : true]
                completionHandler(response)
            }else{
                RNCamera.videoWithSong(fromPreview: self.audioInfo, completionHandler: { result in
                    VideoSingleton.sharedInstance.temVideoUrl = result
                    VideoSingleton.sharedInstance.originalVideoUrl = result
                    let response:NSDictionary = ["IsSpeedUpdated" : true]
                    completionHandler(response)
                })
            }
        })
    }
    
    @objc public func reloadData(){
        VideoInformationDetail.player?.pause()
        DispatchQueue.main.async { [unowned self] in
            VideoInformationDetail.player?.pause()
            stopPlaybackTimeChecker()
            if let videoUrl = VideoSingleton.sharedInstance.temVideoUrl{
                let asset = AVAsset(url: videoUrl)
                VideoInformationDetail.trim.assetDidChange(newAsset: asset)
                self.resetData()

            }else{
                print("NIL HANDLE ERROR LOG:- func/reloadData VideoSingleton.sharedInstance.temVideoUrl is nil...")
            }
        }
    }
    
    
    
    
    @objc public func updateVideo(play:Bool){
        if (play == true){
            VideoInformationDetail.player?.play()
        }else{
            VideoInformationDetail.player?.pause()
        }
    }
    
    func stopPlayer() {
        DispatchQueue.main.async { [self] in
            if let play = VideoInformationDetail.player {
                print("stopped")
                play.pause()
                VideoInformationDetail.player = nil
                print("player deallocated")
            } else {
                print("player was already deallocated")
            }
        }
    }

    
    public func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return VideoInformationDetail.videoArray.count
    }
    
    public func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionview.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath as IndexPath) as! VideoCell
        
        let videoInformation:[String:Any] = VideoInformationDetail.videoArray[indexPath.row] as! [String : Any]
                
        let temVideoUrl = videoInformation["videoUrl"].flatMap{ URL.init(string: $0 as! String)}

        if let videoUrl = temVideoUrl{
            cell.thumbImage?.image = createVideoThumbnail(from: videoUrl)
        }else{
            cell.thumbImage?.image = UIImage.init()
        }
        
        if indexPath.row == VideoInformationDetail.currentVideoIndex{
            cell.dotView.backgroundColor = .systemPink
        }else{
            cell.dotView.backgroundColor = .white
        }
        
        cell.isUserInteractionEnabled = true
        cell.thumbImage?.contentMode = .scaleToFill
        
        return cell
    }
    
    
    public func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        VideoInformationDetail.player?.pause()
        VideoInformationDetail.currentVideoIndex = indexPath.row
        self.initialInformationLoadToPlayer()
        
        DispatchQueue.main.async { [unowned self] in
            VideoInformationDetail.player?.pause()
            stopPlaybackTimeChecker()
        }

        let videoInformation:[String:Any] = VideoInformationDetail.videoArray[indexPath.row] as! [String : Any]
        
        let response:NSDictionary = ["action" : "videoSelected","speed":videoInformation["speedLevel"]!]
        backgroundEmitorCompletionHandler!(response)
    }
    
    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        let flowLayout = collectionViewLayout as! UICollectionViewFlowLayout
        let numberOfItems = CGFloat(collectionView.numberOfItems(inSection: section))
        let combinedItemWidth = (numberOfItems * flowLayout.itemSize.width) + ((numberOfItems - 1)  * flowLayout.minimumInteritemSpacing)
        let padding = (collectionView.frame.width - combinedItemWidth) / 2
        return UIEdgeInsets(top: 0, left: padding, bottom: 0, right: padding)
    }
    
    private func createVideoThumbnail(from url: URL) -> UIImage? {
        let asset = AVAsset(url: url)
        let assetImgGenerate = AVAssetImageGenerator(asset: asset)
        assetImgGenerate.appliesPreferredTrackTransform = true
        assetImgGenerate.maximumSize = CGSize(width: frame.width, height: frame.height)
        
        let time = CMTimeMakeWithSeconds(0.1, preferredTimescale: 600)
        do {
            let img = try assetImgGenerate.copyCGImage(at: time, actualTime: nil)
            let thumbnail = UIImage(cgImage: img)
            return thumbnail
        }
        catch {
            print(error.localizedDescription)
            return nil
        }
        
    }
    
    public func speedApplyProcessing(){
        
        VideoInformationDetail.player?.pause()
        stopPlaybackTimeChecker()
        
        if videoProcessingIndex < self.videosInformation.keys.count{
            let temKey:String = "Clip video \(videoProcessingIndex+1)"
            let videoData:[String:Any] = self.videosInformation[temKey] as! [String : Any]
            
            let mediaUrl:URL = URL.init(fileURLWithPath: videoData["videopath"] as! String)
            let videoSpeedMode:SpeedMode = videoData["Speed"] as! SpeedMode
            let videoSpeedScale:Int64 = videoData["Scale"] as! Int64
            
            
            if (videoSpeedScale == Int(1)){
                completedVideoArray.append(mediaUrl.path)
                self.videoProcessingIndex = self.videoProcessingIndex + 1
                self.speedApplyProcessing()
            }else{
                self.scaleAsset(fromURL: mediaUrl, by: videoSpeedScale, withMode: videoSpeedMode, completion: { (exporter) in
                    if let exporter = exporter {
                        switch exporter.status {
                        case .failed: do {
                            print(exporter.error?.localizedDescription ?? "Error in exporting..")
                        }
                        case .completed: do {
                            self.completedVideoArray.append(exporter.outputURL!.path)
                            self.videoProcessingIndex = self.videoProcessingIndex + 1
                            self.speedApplyProcessing()
                            print("Scaled video has been generated successfully!")
                        }
                        case .unknown: break
                        case .waiting: break
                        case .exporting: break
                        case .cancelled: break
                        }
                    }
                    else {
                        /// Error
                        print("Exporter is not initialized.")
                    }
                })
            }
        }else{
            videoProcessingIndex = 0
            let response:NSDictionary = ["response" : self.completedVideoArray]
            self.backgroundSpeedApplyCompletionHandler!(response)
        }
    }
    
    @objc public func applySpeedMode(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        backgroundSpeedApplyCompletionHandler = completionHandler
        speedApplyProcessing()
    }
    
    
    func scaleAsset(fromURL url: URL,  by scale: Int64, withMode mode: SpeedMode, completion: @escaping (_ exporter: AVAssetExportSession?) -> Void) {
        /// Check the valid scale
        if scale < 1 || scale > 3 {
            completion(nil)
            return
        }
        
        /// Asset
        let asset = AVAsset(url: url)
        
        /// Video Tracks
        let videoTracks = asset.tracks(withMediaType: AVMediaType.video)
        if videoTracks.count == 0 {
            /// Can not find any video track
            completion(nil)
            return
        }
        
        /// Get the scaled video duration
        let scaledVideoDuration = (mode == .Faster) ? CMTimeMake(value: asset.duration.value / scale, timescale: asset.duration.timescale) : CMTimeMake(value: asset.duration.value * scale, timescale: asset.duration.timescale)
        let timeRange = CMTimeRangeMake(start: CMTime.zero, duration: asset.duration)
        
        /// Video track
        let videoTrack = videoTracks.first!
        
        let mixComposition = AVMutableComposition()
        let compositionVideoTrack = mixComposition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: kCMPersistentTrackID_Invalid)
        
        /// Audio Tracks
        let audioTracks = asset.tracks(withMediaType: AVMediaType.audio)
        if audioTracks.count > 0 {
            /// Use audio if video contains the audio track
            let compositionAudioTrack = mixComposition.addMutableTrack(withMediaType: AVMediaType.audio, preferredTrackID: kCMPersistentTrackID_Invalid)
            
            /// Audio track
            let audioTrack = audioTracks.first!
            do {
                try compositionAudioTrack?.insertTimeRange(timeRange, of: audioTrack, at: CMTime.zero)
                compositionAudioTrack?.scaleTimeRange(timeRange, toDuration: scaledVideoDuration)
            } catch _ {
                /// Ignore audio error
            }
        }
        
        do {
            try compositionVideoTrack?.insertTimeRange(timeRange, of: videoTrack, at: CMTime.zero)
            compositionVideoTrack?.scaleTimeRange(timeRange, toDuration: scaledVideoDuration)
            
            compositionVideoTrack?.preferredTransform = videoTrack.preferredTransform
            
            let outputFileURL = URL(fileURLWithPath: NSTemporaryDirectory() + "speedVideo\(videoProcessingIndex).mp4")
            
            
            do { // delete old video
                try FileManager.default.removeItem(at: outputFileURL)
            } catch { print(error.localizedDescription) }
            
            
            //            if FileManager.default.fileExists(atPath: outputFileURL.absoluteString) {
            //                try FileManager.default.removeItem(at: outputFileURL)
            //            }
            
            let exporter = AVAssetExportSession(asset: mixComposition, presetName: AVAssetExportPresetHighestQuality)
            exporter?.outputURL = outputFileURL
            exporter?.outputFileType = AVFileType.mov
            exporter?.shouldOptimizeForNetworkUse = true
            exporter?.exportAsynchronously(completionHandler: {
                completion(exporter)
            })
            
        } catch let error {
            print(error.localizedDescription)
            completion(nil)
            return
        }
    }
    
    
    
    
    func startPlaybackTimeChecker() {
        stopPlaybackTimeChecker()
        playbackTimeCheckerTimer = Timer.scheduledTimer(timeInterval: 0.1, target: self,
                                                        selector:
                                                            #selector(self.onPlaybackTimeChecker), userInfo: nil, repeats: true)
    }
    
    func stopPlaybackTimeChecker() {
        playbackTimeCheckerTimer?.invalidate()
        playbackTimeCheckerTimer = nil
    }
    
    @objc func onPlaybackTimeChecker() {
        guard let startTime = VideoInformationDetail.trim.startTime, let endTime = VideoInformationDetail.trim.endTime, let player = VideoInformationDetail.player else {
            return
        }
        
        let playBackTime = player.currentTime()
        VideoInformationDetail.trim.seek(to: playBackTime)
        
        if playBackTime >= endTime {
            player.seek(to: startTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
            VideoInformationDetail.trim.seek(to: startTime)
        }
    }
    
    @objc public func orientaionChanged(IsPortrait:Bool){
        
    }
    
}




extension SpeedViewSwift: TrimmerViewDelegate {
    public func positionBarStoppedMoving(_ playerTime: CMTime) {
        VideoInformationDetail.player?.play()
    }
    
    public func didChangePositionBar(_ playerTime: CMTime) {
        //        stopPlaybackTimeChecker()
        VideoInformationDetail.player?.pause()
        VideoInformationDetail.player?.seek(to: playerTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
        let duration = (VideoInformationDetail.trim.endTime! - VideoInformationDetail.trim.startTime!).seconds
        print(duration)
        //        self.totalHours?.text = "Total : \( duration.rounded())s"
    }
}


class VideoInformationDetail {
    static var videoArray:Array = Array<Any>.init()
    static var currentVideoIndex:Int = 0
    static var trim = TrimmerView()
    static var player: AVPlayer?
}
