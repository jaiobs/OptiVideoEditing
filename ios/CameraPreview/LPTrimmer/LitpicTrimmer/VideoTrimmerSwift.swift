//
//  VideoTrimmerSwift.swift
//  react-native-litpic-camera-module
//
//  Created by optisol on 14/07/20.
//

import UIKit
import Photos
import AVKit
import AVFoundation

@available(iOS 10.0, *)
@objc public class VideoTrimmerSwift: UIView, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    //changed
       @objc public var PlusImageDict: NSDictionary?
       


    var trim = TrimmerView()
    //    var playerView: UIView!
    var filterView:VideoPlayerWithFilter!
    var playbackTimeCheckerTimer: Timer?
    var trimmerPositionChangedTimer: Timer?
    var totalHours:UILabel?
    var toolView:UIView?
    var videoAsset:AVAsset?
    var videoUrl:String?
    var outputVideoUrl:String?
    public var IsDevicePortrait:Bool?
    public var playlayer: AVPlayerLayer?
    
    var leftView:UIView?
    var rightView:UIView?
    var videoTitle:UILabel?
    
    var IsPortraitVideo:Bool = false
    var videoRect:CGRect = .zero
    var collectionview: UICollectionView!
    var cellId = "Cell"
    var livefilter:LiveFilterController!
    @objc public var videoArray:[[String:Any]] = []
    public var selectedVideoKey:String = "Clip video 1"
    public var selectedVideo:[String:Any] = [String:Any]()
    public var videosInformation:[String:Any] = [String:Any]()
    public var IsSingleVideoSelected:Bool = false
    private let sessionQueue = DispatchQueue(label: "SessionQueue", attributes: [], autoreleaseFrequency: .workItem)
    public var videourl:[URL] = [URL]()
    
    var backgroundTransferCompletionHandler: ((_ param: NSDictionary) -> ())?
    @objc public var userInitiated:Bool = false
    public var IsUIUpdated:Bool = false
    
    public var videoFilterIndex:Int = 0
    public var videoAudioMergeIndex:Int = 0
    public var videoProcessingIndex:Int = 0
    public var videoSizeProcessingIndex:Int = 0
    public var IsAllVideoInPortrait:Bool = false
    public var IsAllVideoInLandScape:Bool = false
    public var IsVideoProcessingStart:Bool = false
    public var finalVideoArray:[String] = [String]()
    public var videoSegmentArray:NSMutableArray = NSMutableArray()
    public var audioSegmentArray:NSMutableArray = NSMutableArray()

    public var currentVideoSelectedIndex:Int = 0
    public var allProcessVideoUrl:[URL] = [URL]()
    
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

    
    deinit {
        
    }
    
    
    //changed
     var ScreenTotalWidth:CGFloat = CGFloat(UIScreen.main.bounds.width)
     var MoveLeftRightValue:CGFloat = 0.0
     var cellIdTwo = "CellTwo"
     var layout: UICollectionViewFlowLayout = UICollectionViewFlowLayout()
      
    @objc public var filter:NSDictionary?
    
    
    override init(frame: CGRect) {
        super.init(frame:frame)
        leftView = UIView()
        self.addSubview(leftView!)
        
        rightView = UIView()
        self.addSubview(rightView!)
        
        self.filterView = VideoPlayerWithFilter.init(frame: CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height))
        self.filterView.translatesAutoresizingMaskIntoConstraints = false
        self.leftView!.addSubview(self.filterView)
        
        
        toolView = UIView.init()
        toolView!.translatesAutoresizingMaskIntoConstraints = false
        
        // changed
        toolView?.backgroundColor = UIColor.init(red: 23/255.0, green: 26/255, blue: 37/255, alpha: 1.0)

        
        self.rightView!.addSubview(toolView!)
        
        
        videoTitle = UILabel.init()
       // videoTitle!.frame =  CGRect.init(x: 0, y: 90, width: self.frame.size.width, height: 30)
       
        // changed
        videoTitle!.frame =  CGRect.init(x: 0, y: 80, width: self.frame.size.width, height: 30)
        videoTitle!.textAlignment = .center
        videoTitle!.text = "Tap the clip to apply filter and trim"
        videoTitle!.textAlignment = .center
        videoTitle!.textColor = .white
        videoTitle!.font = UIFont.systemFont(ofSize: 14)
        toolView!.addSubview(videoTitle!)
        
        // changed
//        let layout: UICollectionViewFlowLayout = UICollectionViewFlowLayout()
//        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
//        layout.itemSize = CGSize(width: 70, height: 70)

        layout.sectionInset = UIEdgeInsets(top: 0, left: 20, bottom: 0, right: 20)
        layout.itemSize = CGSize(width: 50, height: 50)
        layout.minimumInteritemSpacing = 10.0;
        layout.minimumLineSpacing = 10.0;
        layout.scrollDirection = .horizontal
        
        // changed
       // collectionview = UICollectionView(frame: CGRect.init(x: 0, y: 125, width: self.frame.size.width - 80, height: 80), collectionViewLayout: layout)
       
        collectionview = UICollectionView(frame: CGRect.init(x: 0, y: 125, width: self.frame.size.width - 60, height: 60), collectionViewLayout: layout)
        
        collectionview.dataSource = self
        collectionview.delegate = self
        collectionview.isScrollEnabled = true
        collectionview.register(VideoCell.self, forCellWithReuseIdentifier: cellId)
        
        //changed
        collectionview.register(VideoCellTwo.self, forCellWithReuseIdentifier: cellIdTwo)
        collectionview.backgroundColor = UIColor.init(red: 23/255.0, green: 26/255, blue: 37/255, alpha: 1.0)
        
        toolView!.addSubview(collectionview)
        totalHours = UILabel.init()
        toolView?.addSubview(totalHours!)
        
        
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    private var heightValues = [Int]()
    private var widthValues = [Int]()
    static public var IsPortrait:Bool = true

    public override func layoutSubviews() {
        super.layoutSubviews()
        
        
        var index:Int = 1
        
        if userInitiated == false{
            
            var IsPortraitOccur:Bool = false
            var IsLandscapeOccur:Bool = false
            
            for candidate in videoArray{
                if let videoObj = candidate["node"] as? NSDictionary{
                    if let videoData = (videoObj["image"] as? NSDictionary){
                        let localPathString : String? = videoData["localPath"] as? String
                        if let localPathUrl = (localPathString.flatMap{ URL.init(fileURLWithPath: $0)}) {
                            print(videourl)
                            print(videoData["localPath"])
                            var videoSize:CGSize = CGSize.init(width: 1080, height: 1920)
                            if let videoUrlResolution = self.nativeResolutionForLocalVideo(url: localPathUrl){
                                videoSize = videoUrlResolution
                            }else{
                                print("NIL HANDLE ERROR LOG :- Video size resolution is nil...")
                            }
                            if let videoUrlResolution = self.nativeResolutionForLocalVideo(url: localPathUrl){
                                videoSize = videoUrlResolution
                            }else{
                                print("NIL HANDLE ERROR LOG :- Video size resolution of videoData[localPath]! is nil...")
                            }
                            if videoSize.width < videoSize.height {
                                IsPortraitOccur = true
                            }else if videoSize.width == videoSize.height{
                                IsPortraitOccur = true
                            }else{
                                IsLandscapeOccur = true
                            }
                        }else{
                            print("NIL HANDLE ERROR LOG :- URL conversion from string of videoData[localPath]! is nil...")
                        }
                        if let pathString = localPathString, let uri_video = videoData["uri"] as? String {
                            let video:[String:Any] = [
                                "originalVideopath":pathString,
                                "videopath":pathString,
                                "thumpimg":uri_video,
                                "filter":self.filter as Any,
                                "startTime":CMTime.zero,
                                "endTime":CMTime(seconds: 3, preferredTimescale: 1)]
                            videosInformation.updateValue(video, forKey:"Clip video \(index)")
                            index = index + 1
                            print(videosInformation)
                            if let width = videoData["width"] as? Int, let height = videoData["height"] as? Int {
                                self.heightValues.append(height)
                                self.widthValues.append(width)
                            }
                                    
                            let defaults = UserDefaults.standard
                            defaults.removeObject(forKey: "heightValues")
                            defaults.removeObject(forKey: "widthValues")

                            defaults.set(self.heightValues, forKey: "heightValues")
                            defaults.set(self.widthValues, forKey: "widthValues")
                            VideoTrimmerSwift.IsPortrait = false
                        }else{
                            print("NIL HANDLE ERROR LOG:- pathString, videoData[uri] is nil...")
                        }
                    }else{
                        print("NIL HANDLE ERROR LOG:- videoObj[image] of videoArray is nil...")
                    }
                }else{
                    print("NIL HANDLE ERROR LOG:- candidate[node] of videoArray is nil...")
                }
            }
            
            
            if (self.videosInformation.keys.count > 0 && IsVideoProcessingStart == false){
                self.IsVideoProcessingStart = true
                if IsPortraitOccur == true  {
                    self.IsAllVideoInPortrait = true
                }else{
                    self.IsAllVideoInLandScape = true
                    self.IsAllVideoInPortrait = false
                }
            }
        }else{
            
        }
        
//        if UIDevice.current.orientation.isLandscape {
//            // Landscape mode
//            self.landscapeView()
//        } else {
//            // Portrait mode
//            self.portraitView()
//        }
        
        
        
        //  changed
        let orientation = UIApplication.shared.statusBarOrientation
        if orientation == .portrait {
            // portrait
            print("portraitView")
            self.portraitView()
            
        } else if orientation == .landscapeRight || orientation == .landscapeLeft{
            // landscape
            print("landscapeView")
            self.landscapeView()
        }
        
    
    
    }
    
    //    public func  videoPresetSize(){
    //        if self.videoSizeProcessingIndex < self.videosInformation.keys.count {
    //            self.selectedVideoKey = "Clip video \(1 + self.videoSizeProcessingIndex)"
    //            self.selectedVideo = self.videosInformation[self.selectedVideoKey] as! [String : Any]
    //
    //            var videoSize:CGSize = CGSize.init(width: 1080, height: 1920)
    //            if (self.IsAllVideoInPortrait){
    //            }else{
    //
    //            }
    //
    //            let videoUrl:URL =  URL.init(string: selectedVideo["originalVideopath"] as! String)!
    //            DPVideoMerger().mergeVideos(withFileURLs: [videoUrl], videoResolution: videoSize, videoQuality: AVAssetExportPresetHighestQuality, completion:{(_ mergedVideoFile: URL?, _ error: Error?) -> Void in
    //
    //                print(mergedVideoFile?.path)
    //                print(error?.localizedDescription)
    //                self.selectedVideo.updateValue(mergedVideoFile?.path, forKey: "videopath")
    //                self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
    //                self.videoSizeProcessingIndex = self.videoSizeProcessingIndex + 1
    //                self.videoPresetSize()
    //            })
    //        }else{
    //            if UIDevice.current.orientation.isLandscape {
    //                // Landscape mode
    //                self.landscapeView()
    //            } else {
    //                // Portrait mode
    //                self.portraitView()
    //            }
    //
    //        }
    //    }
    
    @objc public func portraitView(){
        
       // changed
        //MARK: Move center cells based on the keyvalues of videos information and cellspacing
        let numberofCell: CGFloat = CGFloat(videosInformation.keys.count + 1)
        let PCellWidth: CGFloat = 50
        let PCellSpacing: CGFloat = 10
        
        MoveLeftRightValue =  ScreenTotalWidth - (CGFloat(numberofCell) * PCellWidth) + PCellSpacing
        if MoveLeftRightValue <= 0.0{
            layout.sectionInset = UIEdgeInsets(top: 0, left: 20, bottom: 0, right: 20)
        } else{
            layout.sectionInset = UIEdgeInsets(top: 0, left: MoveLeftRightValue/2, bottom: 0, right: MoveLeftRightValue/2)
        }
        
        
        if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                             self.selectedVideo = videoDictValue
        }
        self.selectClip(selectedVideo: self.selectedVideo)
        
        let videoUrl:URL =  URL.init(string: selectedVideo["videopath"] as! String)!
        let videoSize:CGSize = self.nativeResolutionForLocalVideo(url: videoUrl)!
        var IsPortraitVideo:Bool = false
        var metal_frame:CGRect = self.filterView.frame
        
        if videoSize.width < videoSize.height{
            IsPortraitVideo = true
            self.leftView?.frame = CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height - 200)
        }else{
            let viewHeight:CGFloat = self.frame.size.height - 200
            
            let sizeTem:CGSize = CGSize.aspectFit(aspectRatio: CGSize.init(width: 1920, height: 1080), boundingSize: CGSize.init(width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height - 200))
            self.leftView?.frame = CGRect.init(x: 0, y: ((frame.size.height - sizeTem.height) - 200)/2, width: sizeTem.width, height: sizeTem.height)
            
            
        }
        
        
        
        self.rightView?.frame = CGRect.init(x: 0, y: self.frame.size.height - 200, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: 200)
        self.filterView.filter = self.filter
        
        
        NSLayoutConstraint.activate([
            self.filterView.leftAnchor.constraint(equalTo: self.leftView!.leftAnchor),
            self.filterView.rightAnchor.constraint(equalTo: self.leftView!.rightAnchor),
            self.filterView.topAnchor.constraint(equalTo: self.leftView!.topAnchor),
            self.filterView.bottomAnchor.constraint(equalTo: self.leftView!.bottomAnchor),
        ])
        
        
        NSLayoutConstraint.activate([
            toolView!.leftAnchor.constraint(equalTo: rightView!.leftAnchor),
            toolView!.rightAnchor.constraint(equalTo: rightView!.rightAnchor),
            toolView!.topAnchor.constraint(equalTo: rightView!.topAnchor, constant: 0),
            toolView!.heightAnchor.constraint(equalToConstant: 200)
        ])
        
        
        if IsSingleVideoSelected == false{
            totalHours?.frame =  CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: 30)
            totalHours!.textAlignment = .center
            totalHours!.text = "Total: 00"
            totalHours?.textColor = .white
            totalHours?.textAlignment = .center
            totalHours!.font = UIFont.systemFont(ofSize: 14)
            
            trim.backgroundColor = UIColor.init(red: 23, green: 25, blue: 37, alpha: 1)
            trim.minDuration = 3
            trim.maxDuration = 30
            //   trim.maskColor = .white
            trim.maskColor = UIColor.init(red: 249/255, green: 8/255, blue: 155/255, alpha: 1)
            
            trim.mainColor = .magenta
            trim.handleColor = .white
            trim.positionBarColor = .white
            trim.cornerRadious = 12

            trim.assetPreview.backgroundColor = .black
            toolView!.addSubview(trim)
            
            NSLayoutConstraint.activate([
                trim.leftAnchor.constraint(equalTo: totalHours!.leftAnchor, constant: 10),
                trim.rightAnchor.constraint(equalTo: totalHours!.rightAnchor, constant: -10),
                trim.topAnchor.constraint(equalTo: totalHours!.bottomAnchor, constant: 0),
                trim.heightAnchor.constraint(equalToConstant: 50)
            ])
            
            //changed
//            videoTitle!.frame =  CGRect.init(x: 0, y: 90, width: self.rightView!.frame.size.width, height: 30)
//            collectionview.frame = CGRect.init(x: 0, y: 125, width: self.rightView!.frame.size.width, height: 80)
            
            videoTitle!.frame =  CGRect.init(x: 0, y: 80, width: self.rightView!.frame.size.width, height: 30)
            collectionview.frame = CGRect.init(x: 10, y: 125, width: (self.rightView!.frame.size.width-80), height: 60)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                     self.selectedVideo = videoDictValue
                }
                self.selectClip(selectedVideo: self.selectedVideo)
                self.filterView.videoUrl = self.selectedVideo["videopath"] as! String
                
                self.filterView.videoPreviewLayer?.player?.pause()
                self.filterView.videoPreviewLayer?.stop()
                self.filterView.videoPreviewLayer = nil
                
                self.filterView.nibSetup()
                self.filterView.videoPreviewLayer?.playerLayer!.videoGravity = AVLayerVideoGravity.resize
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.filter = (self.selectedVideo["filter"] as! NSDictionary)
                    if ((self.filterView) != nil){
                        self.filterView.filter = self.filter
                        self.filterView.applyLiveFilter()
                        print(self.filterView.videoPreviewLayer?.frame)
                        self.userInitiated = false
                    }
                }
            }
        }else{
            
        }
    }
    
    
    
    @objc public func landscapeView(){
        
        let leftwidth:CGFloat = (self.frame.size.width/100) * 65
        let rightWidth:CGFloat = (self.frame.size.width/100) * 35
        
        self.leftView?.frame = CGRect.init(x: 0, y: 0, width: leftwidth, height: self.frame.size.height)
        // changed
       // self.rightView?.frame = CGRect.init(x: leftwidth + 10, y: 0, width: rightWidth, height: 200)
        
        // changed
        //MARK:landscapeToolView topheight based on screensize
            let ToolViewHeight:CGFloat = 200.0
            let CenterToolView = self.frame.size.height - ToolViewHeight
            self.rightView?.frame = CGRect.init(x: leftwidth + 10, y: CenterToolView/2, width: rightWidth, height: 200)

        
        NSLayoutConstraint.activate([
            self.filterView.leftAnchor.constraint(equalTo: self.leftView!.leftAnchor),
            self.filterView.rightAnchor.constraint(equalTo: self.leftView!.rightAnchor),
            self.filterView.topAnchor.constraint(equalTo: self.leftView!.topAnchor),
            self.filterView.bottomAnchor.constraint(equalTo: self.leftView!.bottomAnchor),
        ])
        
        
        NSLayoutConstraint.activate([
            toolView!.leftAnchor.constraint(equalTo: rightView!.leftAnchor),
            toolView!.rightAnchor.constraint(equalTo: rightView!.rightAnchor),
            toolView!.topAnchor.constraint(equalTo: rightView!.topAnchor, constant: 0),
            toolView!.heightAnchor.constraint(equalToConstant: 200)
        ])
        
        
        // changed
        //MARK: Move center cells based on the keyvalues of videos information and cellspacing
        let numberofCell: CGFloat = CGFloat(videosInformation.keys.count + 1)
        let PCellWidth: CGFloat = 50
        let PCellSpacing: CGFloat = 10
        
        print("rightView",self.rightView?.frame.width as AnyObject)
        MoveLeftRightValue =  self.rightView!.frame.width - (CGFloat(numberofCell) * PCellWidth) + PCellSpacing
        
        if MoveLeftRightValue <= 0.0{
            layout.sectionInset = UIEdgeInsets(top: 0, left: 20, bottom: 0, right: 20)
        } else{
            layout.sectionInset = UIEdgeInsets(top: 0, left: MoveLeftRightValue/2, bottom: 0, right: MoveLeftRightValue/2)
        }
        
        
        if IsSingleVideoSelected == false{
            totalHours?.frame =  CGRect.init(x: 0, y: 0, width: self.rightView!.frame.size.width, height: 30)
            totalHours!.textAlignment = .center
            totalHours!.text = "Total: 00"
            totalHours?.textColor = .white
            totalHours?.textAlignment = .center
            totalHours!.font = UIFont.systemFont(ofSize: 14)
                        
            trim.backgroundColor = UIColor.init(red: 23, green: 25, blue: 37, alpha: 1)
            trim.minDuration = 3
            trim.maxDuration = 30
            // changed
            //  trim.maskColor = .white
            trim.maskColor = UIColor.init(red: 249/255, green: 8/255, blue: 155/255, alpha: 1)
            trim.mainColor = .magenta
            trim.handleColor = .white
            trim.positionBarColor = .white
            trim.cornerRadious = 12

            trim.assetPreview.backgroundColor = .black
            toolView!.addSubview(trim)
            
            NSLayoutConstraint.activate([
                trim.leftAnchor.constraint(equalTo: totalHours!.leftAnchor),
                trim.rightAnchor.constraint(equalTo: totalHours!.rightAnchor),
                trim.topAnchor.constraint(equalTo: totalHours!.bottomAnchor, constant: 0),
                trim.heightAnchor.constraint(equalToConstant: 50)
            ])
            
            videoTitle!.frame =  CGRect.init(x: 0, y: 90, width: self.rightView!.frame.size.width, height: 30)

            // changed
            //collectionview.frame = CGRect.init(x: 0, y: 125, width: self.rightView!.frame.size.width, height: 80)
            collectionview.frame = CGRect.init(x: 0, y: 125, width: self.rightView!.frame.size.width, height: 60)
            
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                     self.selectedVideo = videoDictValue
                }
                self.selectClip(selectedVideo: self.selectedVideo)
                if let videoPathURL = self.selectedVideo["videopath"] as? String {
                    self.filterView.videoUrl = videoPathURL
                }
                
                self.filterView.videoPreviewLayer?.player?.pause()
                self.filterView.videoPreviewLayer?.stop()
                self.filterView.videoPreviewLayer = nil
                
                self.filterView.nibSetup()
                self.filterView.videoPreviewLayer?.playerLayer!.videoGravity = AVLayerVideoGravity.resize
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.filter = (self.selectedVideo["filter"] as! NSDictionary)
                    if ((self.filterView) != nil){
                        self.filterView.filter = self.filter
                        self.filterView.applyLiveFilter()
                        print(self.filterView.videoPreviewLayer?.frame)
                        self.userInitiated = false
                    }
                }
            }
        }else{
            
        }
    }
    
    
    @objc public func stopVideo(){
        if self.filterView != nil{
            self.filterView.videoPreviewLayer?.stopTemp()
            self.livefilter = self.filterView.videoPreviewLayer?.liveFilter
            self.filterView = nil
        }
        playlayer?.player?.pause()
        stopPlaybackTimeChecker()
    }
    
    
    public func selectClip(selectedVideo:[String:Any]){
        if let videoPathString = self.selectedVideo["videopath"] as? String {
            if let videoURL = URL.init(string: videoPathString){
                let currentAsset = AVAsset.init(url: videoURL)
                videoAsset = currentAsset
                loadAsset(currentAsset)
            
                self.filterView.videoUrl = videoPathString
                self.filterView.updateUrl()
                
                let videoUrl:URL = videoURL
                if let videoSize:CGSize = self.nativeResolutionForLocalVideo(url: videoUrl) {
                    var IsPortraitVideo:Bool = false
                    var metal_frame:CGRect = self.filterView.frame
                    
                    if videoSize.width < videoSize.height{
                        IsPortraitVideo = true
                    }else{
                    }
                }
                
                
                DispatchQueue.global(qos: .userInteractive).async {
                    print("This is run on the background queue")
                    self.filterView.filter = self.filter
                    self.filterView.applyLiveFilter()

                    DispatchQueue.main.async {
                        print("This is run on the main queue, after the previous code in outer block")
                        let startTime:CMTime = selectedVideo["startTime"] as! CMTime
                        let endTime:CMTime = selectedVideo["endTime"] as! CMTime
                        
                        self.trim.moveLeftHandle(to:startTime)
                        self.trim.moveRightHandle(to: endTime)
                        self.trim.seek(to:  self.trim.startTime!)
                        self.videoRender()
                        
                        self.startPlaybackTimeChecker()
                    }
                }
            }
        }
    }
    
    
    
    @available(iOS 11.0, *)
    public func videoProcessing(){
        if self.filterView != nil{
            self.filterView.videoPreviewLayer?.stopTemp()
            self.livefilter = self.filterView.videoPreviewLayer?.liveFilter
            self.filterView = nil
        }
        
        
        //Video Trim process
        if videoProcessingIndex < self.videosInformation.keys.count{
            self.selectedVideoKey = "Clip video \(videoProcessingIndex+1)"
            if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                 self.selectedVideo = videoDictValue
            }
            let videoStartTime:CMTime = self.selectedVideo["startTime"] as! CMTime
            var videoEndTime:CMTime = self.selectedVideo["endTime"] as! CMTime
            let currentUrl:URL =  URL.init(fileURLWithPath: self.selectedVideo["videopath"] as! String)
            let currentAsset = AVAsset.init(url: URL.init(fileURLWithPath: self.selectedVideo["videopath"] as! String))
            if(CMTimeGetSeconds(currentAsset.duration) <= 3.0){
                videoEndTime = CMTime(seconds: CMTimeGetSeconds(currentAsset.duration), preferredTimescale: 1)
            }
            var duration = (videoEndTime - videoStartTime).seconds
            if(CMTimeGetSeconds(currentAsset.duration) <= 1.0){
                duration = CMTimeGetSeconds(currentAsset.duration)
            }
            
            let frame1Time = CMTime(seconds: duration, preferredTimescale: currentAsset.duration.timescale)
            let trackTimeRange = CMTimeRangeMake(start: videoStartTime, duration: frame1Time)
            
            var outputSize:CGSize = CGSize.init(width: 1080, height: 1920)
            
            if (IsAllVideoInLandScape == true){
                outputSize = CGSize.init(width: 1920, height: 1080)
            }else{
            let videoSize:CGSize =  nativeResolutionForLocalVideo(url: currentUrl)!
                if ((videoSize.width/9) * 16) == videoSize.height{
                
                }else if (videoSize.width == videoSize.height){
                    outputSize = CGSize.init(width: -1, height: -1)
                }else if (videoSize.width > videoSize.height){
                    outputSize = CGSize.init(width: 1920, height: 1080)
                }else{
                    let sizeTem:CGSize = CGSize.aspectFit(aspectRatio: CGSize.init(width: 1080, height: 1920), boundingSize: CGSize.init(width: videoSize.width , height:videoSize.height))
                    outputSize = CGSize.init(width: ceil(sizeTem.width), height: ceil(sizeTem.height))
                }
            }
  
            DPVideoMerger().mergeVideosWithTimer(withFileURLs:[currentUrl] , videoTimeRange: trackTimeRange, videoResolution: outputSize, completion:{(_ mergedVideoFile: URL?, _ error: Error?) -> Void in
                         self.allProcessVideoUrl.append(mergedVideoFile!)
                         self.selectedVideo.updateValue(mergedVideoFile?.path, forKey: "outputvideo")
                         self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
                         self.videoProcessingIndex = self.videoProcessingIndex + 1
                         self.videoProcessing()
                     })
        }else{
            // Video filter process
            
            if videoFilterIndex < self.videosInformation.keys.count{
                self.selectedVideoKey = "Clip video \(videoFilterIndex+1)"
                if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                     self.selectedVideo = videoDictValue
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.filter = (self.selectedVideo["filter"] as! NSDictionary)
                                        
                    let filterType:String = self.filter!.value(forKey: "type") as! String
                    
                    
                    if filterType == "NORMAL"{
                        let videoUrlOriginal:URL = URL.init(fileURLWithPath: self.selectedVideo["outputvideo"] as! String)
                        self.videourl.append(videoUrlOriginal)
                        self.selectedVideo.updateValue(videoUrlOriginal.path, forKey: "filtervideo")
                        self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
                        self.videoFilterIndex = self.videoFilterIndex + 1
                        self.videoProcessing()
                    }else{
//                            self.livefilter.setFilter(filterValues: self.filter!)
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                            let revfilename = "reverseVideo\(self.videoFilterIndex).mp4"
                            let revpath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(revfilename).path
                            let revurlVideo = URL(fileURLWithPath: revpath)
                            
                            print(self.selectedVideo)
                            print(self.selectedVideo["outputvideo"])
                            let videoUrl:URL = URL.init(fileURLWithPath: self.selectedVideo["outputvideo"] as! String)
                            
                            self.reverseVideo(inURL: videoUrl, outURL: revurlVideo, queue: self.sessionQueue, { completed in
                                if completed {
                                    
                                    self.allProcessVideoUrl.append(contentsOf: self.videourl)
                                    self.videourl.append(revurlVideo)
                                    self.selectedVideo.updateValue(revurlVideo.path, forKey: "filtervideo")
                                    self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
                                    self.videoFilterIndex = self.videoFilterIndex + 1
                                    self.videoProcessing()
                                } else {
                                    
                                }
                            })
                        }
                    }
                }
            }else{
                if videoAudioMergeIndex < self.videosInformation.keys.count{
                    self.selectedVideoKey = "Clip video \(videoAudioMergeIndex+1)"
                    if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                         self.selectedVideo = videoDictValue
                    }
                    let originalVideoUrl:URL = URL.init(fileURLWithPath: self.selectedVideo["outputvideo"] as! String)
                    let filterVideoUrl:URL = URL.init(fileURLWithPath: self.selectedVideo["filtervideo"] as! String)
                    
                    let videoAsset:AVAsset = AVAsset.init(url: filterVideoUrl)
                    let audioAsset:AVAsset = AVAsset.init(url: originalVideoUrl)
                    
                    let videoSize:CGSize = self.nativeResolutionForLocalVideo(url: originalVideoUrl) ?? CGSize(width: 0, height: 0)
                    
                    
                    var outputSize:CGSize = CGSize.init(width: 1080, height: 1920)
                    
                    if (IsAllVideoInLandScape == true){
                        outputSize = CGSize.init(width: 1920, height: 1080)
                    }
                    
                    DPVideoMerger().singleVideoAudioMerge(withFileURLs: filterVideoUrl, videoAsset: videoAsset,audioAsset: audioAsset, videoResolution:outputSize, completion:{[weak self] (_ mergedVideoFile: URL?, _ error: Error?) -> Void in
                        guard let self = self else { return }
                        if let mergedVideoURL = mergedVideoFile{
                            self.finalVideoArray.append(mergedVideoURL.absoluteString)
                            self.selectedVideo.updateValue(mergedVideoURL.path, forKey: "filtervideo")
                            self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
                            self.videoAudioMergeIndex = self.videoAudioMergeIndex + 1
                            self.videoProcessing()
                        }
                    })

                }else{
                    self.videoMerge(completionBlock: { (_ mergedVideoFile: URL?) -> Void in
                        var lastVideoDuration:Float = 0.0
                        for url in self.finalVideoArray {
                            if let temVideoUrl = URL.init(string: url){
                                    let aVideoAsset : AVAsset = AVAsset(url: temVideoUrl)
                                    let aVideoAssetTrack : AVAssetTrack = aVideoAsset.tracks(withMediaType: AVMediaType.video)[0]
                                    let videoLegth:Float = Float(CMTimeGetSeconds(aVideoAssetTrack.timeRange.duration))
                                    
                                    let videoInfo:[String:Any] = ["musicUrl":"", "speedLevel": 3, "videoUrl": url]
                                    self.videoSegmentArray.add(videoInfo)
                                    
                                    self.audioSegmentArray.add("")
                                    print(lastVideoDuration)
                                    lastVideoDuration = lastVideoDuration + videoLegth
                                    print(lastVideoDuration)
                            }
                        }
                        
                        let videoArray:NSMutableArray =  NSMutableArray(array: self.videoSegmentArray.reversed())

                        
                        
                        for temUrl:URL in self.allProcessVideoUrl{
                            let fileManager = FileManager.default
                            if fileManager.fileExists(atPath: temUrl.path) {
                               try! fileManager.removeItem(atPath: temUrl.path)
                            }

                        }
                        
                        let videoSingletonObj = VideoSingleton.sharedInstance
                        videoSingletonObj.VideoSegment = videoArray
                        videoSingletonObj.temVideoSegment = nil
                        videoSingletonObj.TemAudioSegment = self.audioSegmentArray
                        videoSingletonObj.originalVideoUrl = mergedVideoFile
                        videoSingletonObj.temVideoUrl = mergedVideoFile
                    
                        print(VideoSingleton.sharedInstance.temVideoUrl)
                        print(VideoSingleton.sharedInstance.VideoSegment)
                        print(videoSingletonObj.temVideoSegment)
                        print(videoSingletonObj.AudioSegment)


                        let response:NSDictionary = ["video" : self.finalVideoArray, "IsPortraitVideo":self.IsAllVideoInPortrait, "mergedVideo" : VideoSingleton.sharedInstance.temVideoUrl?.absoluteString]
                        self.backgroundTransferCompletionHandler!(response)
                    })
                }
            }
        }
    }
    
    public func videoMerge(completionBlock: ((URL)->Void)?) {
        
        trim.removeFromSuperview()
        
        let mixComposition : AVMutableComposition = AVMutableComposition()
        var mutableCompositionVideoTrack : [AVMutableCompositionTrack] = []
        var mutableCompositionAudioTrack : [AVMutableCompositionTrack] = []
        let totalVideoCompositionInstruction : AVMutableVideoCompositionInstruction = AVMutableVideoCompositionInstruction()
        
        for i in 0..<self.videosInformation.keys.count {
            self.selectedVideoKey = "Clip video \(self.videosInformation.keys.count - i)"
            if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                self.selectedVideo = videoDictValue
            }
            print(self.selectedVideo["outputvideo"] )
            print(self.selectedVideo["filtervideo"] )
            let audioUrl:URL = URL.init(fileURLWithPath: self.selectedVideo["outputvideo"] as! String)
            let videoUrl:URL = URL.init(fileURLWithPath: self.selectedVideo["filtervideo"] as! String)
            
            
            let aVideoAsset : AVAsset = AVAsset(url: videoUrl)
            let aAudioAsset : AVAsset = AVAsset(url: audioUrl)
            
            mutableCompositionVideoTrack.append(mixComposition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: kCMPersistentTrackID_Invalid)!)
            mutableCompositionAudioTrack.append( mixComposition.addMutableTrack(withMediaType: AVMediaType.audio, preferredTrackID: kCMPersistentTrackID_Invalid)!)
            
            let aVideoAssetTrack : AVAssetTrack = aVideoAsset.tracks(withMediaType: AVMediaType.video)[0]
            let aAudioAssetTrack : AVAssetTrack = aAudioAsset.tracks(withMediaType: AVMediaType.audio)[0]
            
            
            
            do{
                try mutableCompositionVideoTrack[0].insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: aVideoAssetTrack.timeRange.duration), of: aVideoAssetTrack, at: CMTime.zero)
                
                //In my case my audio file is longer then video file so i took videoAsset duration
                //instead of audioAsset duration
                
                try mutableCompositionAudioTrack[0].insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: aVideoAssetTrack.timeRange.duration), of: aAudioAssetTrack, at: CMTime.zero)
                
                //Use this instead above line if your audiofile and video file's playing durations are same
                
                //            try mutableCompositionAudioTrack[0].insertTimeRange(CMTimeRangeMake(kCMTimeZero, aVideoAssetTrack.timeRange.duration), ofTrack: aAudioAssetTrack, atTime: kCMTimeZero)
                
            }catch{
                
            }
            
            totalVideoCompositionInstruction.timeRange = CMTimeRangeMake(start: CMTime.zero,duration: aVideoAssetTrack.timeRange.duration )
        }
        
        
        
        let revfilename = "merge_video.mp4"
        let revpath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(revfilename)
        
        
        
        do { // delete old video
            try FileManager.default.removeItem(at: revpath)
        } catch { print(error.localizedDescription) }
        
        
        
        let assetExport: AVAssetExportSession = AVAssetExportSession(asset: mixComposition, presetName: AVAssetExportPresetHighestQuality)!
        assetExport.outputFileType = AVFileType.mp4
        assetExport.outputURL = revpath
        assetExport.shouldOptimizeForNetworkUse = true
        
        assetExport.exportAsynchronously { () -> Void in
            switch assetExport.status {
            case AVAssetExportSession.Status.completed:
                print("Merged video",assetExport.outputURL!)
                completionBlock!(assetExport.outputURL!)
                print("success")
            case  AVAssetExportSession.Status.failed:
                print("failed \(assetExport.error)")
            case AVAssetExportSession.Status.cancelled:
                print("cancelled \(assetExport.error)")
            default:
                print("complete")
            }
        }
    }
    
    @available(iOS 11.0, *)
    public func reverseVideo(inURL: URL, outURL: URL, queue: DispatchQueue, _ completionBlock: ((Bool)->Void)?) {
            let asset = AVAsset.init(url: inURL)
            if(FileManager.default.fileExists(atPath: outURL.path)){
                do { // delete old video
                    try FileManager.default.removeItem(at: outURL)
                } catch {
                    print(error.localizedDescription)
                    
                }
            }
            
            guard
                let temreader = try? AVAssetReader.init(asset: asset),
                let reader = try? AVAssetReader.init(asset: asset),
                let videoTrack = asset.tracks(withMediaType: .video).first
                else {
                    assert(false)
                    completionBlock?(false)
                    return
            }
            
            let width = videoTrack.naturalSize.width
            let height = videoTrack.naturalSize.height
            
            let readerSettings: [String : Any] = [
                String(kCVPixelBufferPixelFormatTypeKey) : kCVPixelFormatType_32BGRA,
            ]
            
            
            let tempreaderOutput = AVAssetReaderTrackOutput.init(track: videoTrack, outputSettings: readerSettings)
            temreader.add(tempreaderOutput)
            temreader.startReading()
            
            let readerOutput = AVAssetReaderTrackOutput.init(track: videoTrack, outputSettings: readerSettings)
            reader.add(readerOutput)
            reader.startReading()
            
            var buffers = [CMSampleBuffer]()
            
            while let nextBuffer = tempreaderOutput.copyNextSampleBuffer() {
                if(buffers.count < 3){
                    buffers.append(nextBuffer)
                }else{
                    
                }
            }
            
            
            let status = temreader.status
            temreader.cancelReading()
            guard status == .completed, let firstBuffer = buffers.first else {
                assert(false)
                completionBlock?(false)
                return
            }
            let sessionStartTime = CMSampleBufferGetPresentationTimeStamp(firstBuffer)
            
            let writerSettings: [String:Any] = [
                AVVideoCodecKey : AVVideoCodecType.h264,
                AVVideoWidthKey : width,
                AVVideoHeightKey: height,
            ]
            let writerInput: AVAssetWriterInput
            if let formatDescription = videoTrack.formatDescriptions.last {
                writerInput = AVAssetWriterInput.init(mediaType: .video, outputSettings: writerSettings, sourceFormatHint: (formatDescription as! CMFormatDescription))
            } else {
                writerInput = AVAssetWriterInput.init(mediaType: .video, outputSettings: writerSettings)
            }
            writerInput.transform = videoTrack.preferredTransform
            writerInput.expectsMediaDataInRealTime = false
            
            guard
                let writer = try? AVAssetWriter.init(url: outURL, fileType: .mp4),
                writer.canAdd(writerInput)
                else {
                    assert(false)
                    completionBlock?(false)
                    return
            }
            
            let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor.init(assetWriterInput: writerInput, sourcePixelBufferAttributes: nil)
            let group = DispatchGroup.init()
            
            group.enter()
            writer.add(writerInput)
            if(writer.status != .writing){
                writer.startWriting()
                writer.startSession(atSourceTime: sessionStartTime)
            }
            
            //        var currentSample = 0

            var videoFilter: FilterRenderer?
            
        videoFilter =  self.setFilter(filterValues: self.filter!, videofilter: videoFilter)

            
            
            writerInput.requestMediaDataWhenReady(on: queue) {
                while let nextBuffer = readerOutput.copyNextSampleBuffer() {
                    autoreleasepool(invoking: {() -> () in
                        if !writerInput.isReadyForMoreMediaData {
                            return
                        }
                        
                        guard let videoPixelBuffer = CMSampleBufferGetImageBuffer(nextBuffer),
                            let formatDescription = CMSampleBufferGetFormatDescription(nextBuffer) else {
                                return
                        }
                        
                        let presentationTime = CMSampleBufferGetPresentationTimeStamp(nextBuffer)

                        
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
                            
                            
                            
                            if !pixelBufferAdaptor.append(filteredBuffer, withPresentationTime: presentationTime) {
                                                        print("VideoWriter reverseVideo: warning, could not append imageBuffer...")
                                                    }

                        }
                    })
                }
                
                
                
                
                
                // finish
                writerInput.markAsFinished()
                group.leave()
            }
            
            group.notify(queue: queue) {
                
                reader.cancelReading()
                writer.finishWriting {
                    if writer.status != .completed {
                        print("VideoWriter reverseVideo: error - \(String(describing: writer.error))")
                        completionBlock?(false)
                    } else {
                        completionBlock?(true)
                    }
                }
            }
        }
    
    public func  videoTrimming(asset:AVAsset, startTime:CMTime, endTime:CMTime, videoName:String, videoTrimmedCompletionHandler: @escaping (_ param: String) -> Void){
        let videoComposition = AVMutableVideoComposition()
        let assetComposition = AVMutableComposition()
        
        do{
            let videoTrack = asset.tracks(withMediaType: AVMediaType.video).first
            let duration = (endTime - startTime).seconds
            let frame1Time = CMTime(seconds: duration, preferredTimescale: asset.duration.timescale)
            let trackTimeRange = CMTimeRangeMake(start: startTime, duration: frame1Time)
            
            guard let videoCompositionTrack = assetComposition.addMutableTrack(withMediaType: .video,
                                                                               preferredTrackID: kCMPersistentTrackID_Invalid) else {
                                                                                return }
            
            try videoCompositionTrack.insertTimeRange(trackTimeRange, of: videoTrack!, at: CMTime.zero)
            
            if let audioTrack = asset.tracks(withMediaType: AVMediaType.audio).first {
                let audioCompositionTrack = assetComposition.addMutableTrack(withMediaType: AVMediaType.audio,
                                                                             preferredTrackID: kCMPersistentTrackID_Invalid)
                try audioCompositionTrack?.insertTimeRange(trackTimeRange, of: audioTrack, at: CMTime.zero)
            }
            
            
            
            let url = URL(fileURLWithPath: "\(NSTemporaryDirectory())\(videoName)")
            try? FileManager.default.removeItem(at: url)
            
            let exportSession = AVAssetExportSession(asset: assetComposition, presetName: AVAssetExportPresetHighestQuality)
            exportSession?.outputFileType = AVFileType.mp4
            exportSession?.shouldOptimizeForNetworkUse = true
            exportSession?.outputURL = url
            exportSession?.exportAsynchronously(completionHandler: {
                DispatchQueue.main.async {
                    if let url = exportSession?.outputURL, exportSession?.status == .completed {
                        self.outputVideoUrl = url.absoluteString
                        let response:NSDictionary = ["video" : url.absoluteString as Any]
                        print(response)
                        videoTrimmedCompletionHandler(url.path)
                    } else {
                        let error = exportSession?.error
                        print("error exporting video \(String(describing: error))")
                        videoTrimmedCompletionHandler("error")
                    }
                }
            })
            
            
        } catch let error {
            print(error.localizedDescription)
            videoTrimmedCompletionHandler("error")
        }
        
        
    }
    
    
    
    public func nativeResolutionForLocalVideo(url:URL) -> CGSize?{
        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
        let size = track.naturalSize.applying(track.preferredTransform)
        return CGSize(width: fabs(size.width), height: fabs(size.height))
    }
    
    
    @objc public func orientaionChanged(IsPortrait:Bool){
        print("-------------------------")
        self.userInitiated = true
        self.IsDevicePortrait = IsPortrait
    }
    
    @objc public func cropDidSelected() {
        videoRender()
    }
    
    
    @objc public  func pickAsset(videopath:String) {
        if self.videoUrl!.count > 5 {
            let currentAsset =   AVAsset.init(url: URL.init(string: self.videoUrl!)!)
            videoAsset = currentAsset
            loadAsset(currentAsset)
        }
    }
    
    
    @objc public class  func getVideoInformation(videopath:String, completionHandler: @escaping (_ param: NSDictionary) -> Void) {
        if videopath.count > 5 {
            let currentAsset =   AVAsset.init(url: URL.init(string: videopath)!)
            let response:NSDictionary = ["width" : currentAsset.g_size.width, "height": currentAsset.g_size.height]
            print(response)
            completionHandler(response);
        }
    }
    
    
    //    public override func layoutSubviews() {
    //        self.updateView()
    //        if (videoUrl != ""){
    //            let videoSize:CGSize =  self.nativeResolutionForLocalVideo(url: URL.init(string: self.videoUrl!)!)!
    //            if videoSize.width < videoSize.height{
    //                IsPortraitVideo = true
    //            } else{
    //                IsPortraitVideo = false
    //            }
    //        }
    //
    //
    //        portraitView()
    //        self.pickAsset(videopath: "")
    //        if (UIDevice.current.orientation == .portrait){
    //            portraitView()
    //            self.pickAsset(videopath: "")
    //        }else if (UIDevice.current.orientation == .landscapeLeft || UIDevice.current.orientation == .landscapeRight){
    //            landscapeView()
    //            self.pickAsset(videopath: "")
    //        }else{
    //            portraitView()
    //            self.pickAsset(videopath: "")
    //        }
    //    }
    
    
    
    
//
     func setFilter(filterValues: NSDictionary, videofilter:FilterRenderer?) ->
    FilterRenderer {
        let filterType:String = filterValues.value(forKey: "type") as! String

        if filterType == "BLUR" {
           return self.ApplyBlurFilter(filterValues: filterValues, filterType: filterType)
        } else {
            return  self.ApplyOtherFilter(filterValues: filterValues, filterType: filterType, filter: videofilter)
        }
    }


    func ApplyBlurFilter(filterValues: NSDictionary, filterType: String) -> FilterRenderer {
        let range:Float = Float(truncating: filterValues.value(forKey: "range") as! NSNumber)
        let currentFilter: BlurMetalRenderer!
        currentFilter = BlurMetalRenderer();
        currentFilter.blurRadius = range
        return currentFilter
    }

    func ApplyOtherFilter(filterValues: NSDictionary, filterType: String, filter:FilterRenderer?) -> FilterRenderer {

        let contrast:Float = filterValues.value(forKey: "contrast") != nil ? Float(truncating: filterValues.value(forKey: "contrast") as! NSNumber) : 0.0

        let saturation:Float = filterValues.value(forKey: "saturation") != nil ? Float(truncating: filterValues.value(forKey: "saturation") as! NSNumber) : 0.0

        let brightness:Float = filterValues.value(forKey: "brightness") != nil ? Float(truncating: filterValues.value(forKey: "brightness") as! NSNumber) : 0.0

        //    let range:Float = Float(truncating: filterValues.value(forKey: "range") as! NSNumber)
        let range:Float =  filterValues.value(forKey: "range") != nil ?  Float(truncating: filterValues.value(forKey: "range") as! NSNumber) : 0.0

        var adjustments : Dictionary<String, Float>=[:]

        let currentFilter:CommonCIFilter!

        //Check for changing filter
        if(filter == nil || filter!.description != filterType){
            currentFilter = CommonCIFilter();
            currentFilter.filterType = filterType
            currentFilter.filter = filterDictionary.value(forKey: filterType) as? String
        }else{
            currentFilter = filter as? CommonCIFilter
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

        return currentFilter

    }

    
    
    
    
    
    func loadAsset(_ asset: AVAsset) {
        trim.asset = asset
        trim.delegate = self
        videoAsset = asset
    }
    
    private func createVideoThumbnail(from url: URL) -> UIImage? {
        let asset = AVAsset(url: url)
        let assetImgGenerate = AVAssetImageGenerator(asset: asset)
        assetImgGenerate.appliesPreferredTrackTransform = true
        assetImgGenerate.maximumSize = CGSize(width: frame.width, height: frame.height)
        
        let time = CMTimeMakeWithSeconds(0.0, preferredTimescale: 600)
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
    
    
    @objc public func applyLiveFilter(){
        if ((self.filterView) != nil){
            self.filterView.filter = self.filter
            self.filterView.applyLiveFilter()
        }
        
        if (selectedVideo.isEmpty){
            
        }else{
            self.selectedVideo.updateValue(self.filter as Any, forKey: "filter")
            self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
        }
    }
    
    func videoRender() {
        let duration = (trim.endTime! - trim.startTime!).seconds
        totalHours?.text = "Total : \( duration.rounded())"
        print(duration)
    }
    
    public func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        //return self.videosInformation.keys.count
        // changed
        return self.videosInformation.keys.count + 1
    }
    
    @objc func function() {
          print("ItisTappedhere")
          
      }
    
    public func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
 
        if indexPath.item == videosInformation.keys.count{
                  
                  // Cell 2
                  let cell = collectionview.dequeueReusableCell(withReuseIdentifier: cellIdTwo, for: indexPath as IndexPath) as! VideoCellTwo
                  
                  cell.buttonView.contentMode = .scaleAspectFill
                  cell.buttonView.clipsToBounds = true
             //     cell.buttonView.backgroundColor = UIColor.init(red: 47/255, green: 47/255, blue: 57/255, alpha: 1.0)
                  cell.AddButton?.addTarget(self, action: #selector(function), for: .touchUpInside)
                  
                  cell.AddButton?.backgroundColor = .systemGreen
            
                  let show =  cell.cellglobalImage
                  cell.AddButton?.setImage(show, for: .normal)

                  return cell
                  
              } else {
                  // Cell 1
                  let cell = collectionview.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath as IndexPath) as! VideoCell
                  
                  cell.thumbImage?.image = nil
                  //        if (indexPath.row == self.videosInformation.keys.count) {
                  //            let videoTitle = UILabel.init()
                  //            videoTitle.frame =  CGRect.init(x: 0, y: 0, width: cell.frame.size.width, height: cell.frame.size.height)
                  //            videoTitle.textAlignment = .center
                  //            videoTitle.text = "+"
                  //            videoTitle.textAlignment = .center
                  //            videoTitle.font = UIFont.systemFont(ofSize: 20)
                  //            cell.thumbImage!.addSubview(videoTitle)
                  //        }else{
                  
                  let video:[String:Any] = self.videosInformation["Clip video \(indexPath.row+1)"] as! [String : Any]
                  
                  if (URL.init(string: video["videopath"] as! String) != nil){
                      let video:URL = URL.init(string: video["videopath"] as! String)!
                      cell.thumbImage?.image = createVideoThumbnail(from: video)
                      //                cell.layer.borderColor = UIColor.blue.cgColor
                      
                      cell.thumbImage!.contentMode = .scaleAspectFill
                      cell.thumbImage!.clipsToBounds = true
                      cell.layer.borderWidth = 3
                      //changed
                      //  cell.layer.borderColor = UIColor.magenta.cgColor
                  }

        
        return cell
        }
    }
    
    public func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if indexPath.item == videosInformation.keys.count{
           print("LastCellSelected")
        
        } else{
                   userInitiated = true
                   self.selectedVideoKey = "Clip video \(indexPath.row+1)"
                  if let videoDictValue = self.videosInformation[self.selectedVideoKey] as? [String : Any] {
                                       self.selectedVideo = videoDictValue
                  }
                   //        self.filter = (self.selectedVideo["filter"] as! NSDictionary)
                   //        if ((self.filterView) != nil){
                   //            self.filterView.filter = self.filter
                   //            self.filterView.applyLiveFilter()
                   //            print(self.filterView.videoPreviewLayer?.frame)
                   //        }
                   //
            
                  self.playlayer?.player?.pause()
                   
                   DispatchQueue.global(qos: .userInitiated).async {
                       print("Run on background thread")
                       DispatchQueue.main.async {
                           print("We finished that.")
                           
                           self.layoutSubviews()
                           //                self.filterView.removeFromSuperview()
                           //                self.selectClip(selectedVideo: self.selectedVideo)
                           
                       }
                   }
                   
                   
                   //        self.selectedVideo = self.videosInformation[self.selectedVideoKey] as! [String : Any]
               }
    }
    
    }
    




extension CGSize {
    static func aspectFit(aspectRatio : CGSize,  boundingSize: CGSize) -> CGSize {
        let mW = boundingSize.width / aspectRatio.width;
        let mH = boundingSize.height / aspectRatio.height;
        var bound:CGSize = boundingSize
        if( mH < mW ) {
            bound.width = boundingSize.height / aspectRatio.height * aspectRatio.width;
        }
        else if( mW < mH ) {
            bound.height = boundingSize.width / aspectRatio.width * aspectRatio.height;
        }
        
        return bound;
    }
    
    static func aspectFill(aspectRatio :CGSize, minimumSize: CGSize) -> CGSize {
        let mW = minimumSize.width / aspectRatio.width;
        let mH = minimumSize.height / aspectRatio.height;
        var minSize:CGSize = minimumSize

        if( mH > mW ) {
            minSize.width = minimumSize.height / aspectRatio.height * aspectRatio.width;
        }
        else if( mW > mH ) {
            minSize.height = minimumSize.width / aspectRatio.width * aspectRatio.height;
        }
        
        return minSize;
    }
}


@available(iOS 10.0, *)
extension VideoTrimmerSwift: TrimmerViewDelegate {
    public func positionBarStoppedMoving(_ playerTime: CMTime) {
        print("TRIMMER TIME CHANGED",CMTimeGetSeconds(playerTime),CMTimeGetSeconds(trim.endTime!))
        self.selectedVideo.updateValue(CMTime(seconds: CMTimeGetSeconds(trim.startTime!), preferredTimescale: 1), forKey: "startTime")
        self.selectedVideo.updateValue(CMTime(seconds: CMTimeGetSeconds(trim.endTime!), preferredTimescale: 1), forKey: "endTime")
        self.videosInformation.updateValue(self.selectedVideo, forKey: self.selectedVideoKey)
        self.filterView.videoPreviewLayer?.player?.seek(to: trim.startTime!, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
        self.filterView.videoPreviewLayer?.player?.play()
        startPlaybackTimeChecker()
    }
    
    public func didChangePositionBar(_ playerTime: CMTime) {
        stopPlaybackTimeChecker()
//        self.filterView.videoPreviewLayer?.player?.pause()
        //        self.filterView.videoPreviewLayer?.player?.seek(to: playerTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
        let duration = (trim.endTime! - trim.startTime!).seconds
        print(duration)
        self.totalHours?.text = "Total : \( duration.rounded())"
    }
    
    
    @objc func itemDidFinishPlaying(_ notification: Notification) {
        if let startTime = trim.startTime {
            self.filterView.videoPreviewLayer?.player?.seek(to: startTime)
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
        
        guard let startTime = trim.startTime, let endTime = trim.endTime, let player = self.filterView.videoPreviewLayer?.player else {
            return
        }
        
        let playBackTime = player.currentTime()
        trim.seek(to: playBackTime)
        
        if playBackTime >= endTime &&  self.filterView != nil {
            self.filterView.videoPreviewLayer?.player?.seek(to: startTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
            trim.seek(to: startTime)
        }
    }
    
    
    
    @available(iOS 11.0, *)
    @objc public func cropVideoDidSelected(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        stopPlaybackTimeChecker()
        videoProcessing()
        backgroundTransferCompletionHandler = completionHandler
    }
}

extension AVAsset {
    
    var g_size: CGSize {
        return tracks(withMediaType: AVMediaType.video).first?.naturalSize ?? .zero
    }
    
    var g_orientation: UIInterfaceOrientation {
        if self.g_size.height > self.g_size.width {
            return .portrait
        }else{
            return .landscapeLeft
        }
    }
    
    var g_orientation_asset: UIInterfaceOrientation {
       guard let transform = tracks(withMediaType: AVMediaType.video).first?.preferredTransform else {
        return .portrait
       }

       switch (transform.tx, transform.ty) {
       case (0, 0):
        return .landscapeRight
       case (g_size.width, g_size.height):
        return .landscapeLeft
       case (0, g_size.width):
        return .portraitUpsideDown
       default:
        return .portrait
       }
     }
}


//changed
 class VideoCellTwo: UICollectionViewCell {
    var buttonView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    
    var AddButton:UIButton?
    
    var cellglobalImage:UIImage? = nil

    override init(frame: CGRect) {
       super.init(frame: frame)
            addViews()
   }

  
    
    required init?(coder: NSCoder) {

        fatalError("init(coder:) has not been implemented")
    }

    
     func addViews(){
        
        addSubview(buttonView)

        NSLayoutConstraint.activate([
            buttonView.leftAnchor.constraint(equalTo: self.leftAnchor,constant: 5),
            buttonView.rightAnchor.constraint(equalTo: self.rightAnchor,constant: 5),
            buttonView.topAnchor.constraint(equalTo: self.topAnchor),
            buttonView.bottomAnchor.constraint(equalTo: self.bottomAnchor),
            buttonView.widthAnchor.constraint(equalToConstant: 40),
            buttonView.heightAnchor.constraint(equalToConstant: 40)
        ])


        AddButton = UIButton.init()
        AddButton?.frame = CGRect.init(x: 0, y: 0, width: self.frame.size.width , height: self.frame.size.height)
      //  AddButton?.setImage(UIImage(named: "plus.jpg"), for: .normal)
        AddButton?.backgroundColor = .red
      //  buttonView.addSubview(AddButton!)

    }
    


    
}

class VideoCell: UICollectionViewCell {
    let videoView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    let dotView:UIView = UIView()
    
    var thumbImage:UIImageView?
    
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        addViews()
    }
    
    func addViews(){
        addSubview(videoView)
        NSLayoutConstraint.activate([
            videoView.leftAnchor.constraint(equalTo: self.leftAnchor),
            videoView.rightAnchor.constraint(equalTo: self.rightAnchor),
            videoView.topAnchor.constraint(equalTo: self.topAnchor),
            videoView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
        ])
        
        thumbImage = UIImageView.init()
       
        // changed
         thumbImage?.frame = CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
        
//        thumbImage?.frame = CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height - 20)
        
//        thumbImage?.contentMode = .scaleAspectFit
        videoView.addSubview(thumbImage!)
        
        dotView.frame = CGRect.init(x: (self.frame.size.width - 10)/2, y: self.frame.size.height - 15.0, width: 10, height: 10)
        dotView.layer.cornerRadius = 5
        dotView.backgroundColor = UIColor.clear
        videoView.addSubview(dotView)
    }
    
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

extension UIView {
    func aspectRation(_ ratio: CGFloat) -> NSLayoutConstraint {
        return NSLayoutConstraint(item: self, attribute: .height, relatedBy: .equal, toItem: self, attribute: .width, multiplier: ratio, constant: 0)
    }
}

