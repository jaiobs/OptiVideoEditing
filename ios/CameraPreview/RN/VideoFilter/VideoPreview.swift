//
//  VideoPreview.swift
//  litpic
//
//  Created by optisol on 04/12/19.
//  Copyright ¬© 2019 Facebook. All rights reserved.
//
import UIKit
import AVKit
import AVFoundation

@available(iOS 10.0, *)

@objc public class VideoPreview: UIView, DisplayUpdateReceiver {
    
    var timeObserver:Any?
    var playerLayer: AVPlayerLayer?
    public var player: AVPlayer?
    var isLoop: Bool = true
    var urlString: URL!
    var liveFilter: LiveFilterController?
    var metalLayer: PreviewMetalView?
    var asset: AVAsset?
    var playerItem: AVPlayerItem?
    var avAsset: AVAsset?
    var currentFilter:NSDictionary = [:]
    var videoArray:Array = [AVAsset]()
    var videoFilterConfig:NSDictionary = [:]
    var updatedVideoFilterConfig:NSMutableDictionary = [:]
    public var IsVideoMode:Bool = true
    var displayLinker: DisplayUpdateNotifier?
    var temCADLink:CADisplayLink?
    
    @objc public func initWithUrl(urlStr: URL ) -> Void {
        self.liveFilter = LiveFilterController()
        metalLayer = nil
        self.metalLayer = PreviewMetalView.init(preview: true)
        self.metalLayer?.setPreviewTo(preview: "videoPreview")
        self.liveFilter?.initMetal(metalView: self.metalLayer!)
        
        self.urlString = urlStr
        metalLayer?.device = MTLCreateSystemDefaultDevice();
        
        metalLayer?.frame = self.bounds;
        metalLayer?.framebufferOnly = true;
        metalLayer?.contentMode = .scaleAspectFit

        player = AVPlayer(url: urlStr)
        
        playerLayer = AVPlayerLayer(player: player)
        playerLayer?.frame = bounds
        playerLayer?.backgroundColor = UIColor.white.cgColor
        playerLayer?.videoGravity = AVLayerVideoGravity.resizeAspectFill
        //    self.layer.addSublayer(playerLayer!)
        if((metalLayer) != nil){
            self.addSubview(metalLayer!)
        }
        
        if (IsVideoMode == true){
            play()
            displayLinker = DisplayUpdateNotifier.init(listener: self)
        }else{
            stop()
        }
    }
    
    public override func layoutSubviews() {
        self.metalLayer?.frame = self.frame
    }
    
    func displayWillUpdate(CADL: CADisplayLink) {
        temCADLink = CADL
        autoreleasepool(invoking: readBuffer)
    }
    
    
    @objc private func readBuffer() {
        
        if temCADLink == nil{
            return
        }
        
        var currentTime = CMTime.invalid
        let nextVSync = temCADLink!.timestamp + temCADLink!.duration
        currentTime = playerItemVideoOutput.itemTime(forHostTime: nextVSync)
        
//        print("BUFFER VALUE =========", playerItemVideoOutput.hasNewPixelBuffer(forItemTime: currentTime))
        
        
        
        
        if playerItemVideoOutput.hasNewPixelBuffer(forItemTime: currentTime), let pixelBuffer = playerItemVideoOutput.copyPixelBuffer(forItemTime: currentTime, itemTimeForDisplay: nil) {
            
            //      self.metalLayer = self.liveFilter!.applyFilterVideo(pixelBuffer);
            
            
            let currentSec = CMTimeGetSeconds(currentTime)
            let secs = Int(currentSec)
            
//            print("CURREENT TIME =========== ", secs)
            
            let key = "key" + String(secs);
            if( self.videoFilterConfig.count > 0 && self.videoFilterConfig[key] != nil ){
                //video has filter for current time duration
                let keyObj:NSDictionary = self.videoFilterConfig.value(forKey: key) as! NSDictionary
                let filterValue:NSDictionary = keyObj.value(forKey: "filter") as! NSDictionary
                if(self.currentFilter != filterValue){
                    self.setFilter(filterValues: filterValue)
                }else{
                    
                }
            }
            
            self.metalLayer = self.liveFilter!.applyFilterVideo(pixelBuffer);
        }
    }
    
    
    lazy var playerItemVideoOutput: AVPlayerItemVideoOutput = {
        let attributes = [kCVPixelBufferPixelFormatTypeKey as String : Int(kCVPixelFormatType_32BGRA)]
        return AVPlayerItemVideoOutput(pixelBufferAttributes: attributes)
    }()
    
    @objc public func play() {
        self.asset = AVURLAsset(url: self.urlString!)
        
        
        
        
        // Create a av player item from the asset.
        self.playerItem = AVPlayerItem(asset: self.asset!)
        
        // Add the player item video output to the player item.
        self.playerItem!.add(self.playerItemVideoOutput)
        
        //reset filter
        self.currentFilter = [:]
        
        //        print("CURRENT FILTER ========= ", self.videoFilterConfig)
        //set video time listener for applying videos
        
        NotificationCenter.default.addObserver(self, selector: #selector(self.playerDidFinishPlaying), name: .AVPlayerItemDidPlayToEndTime, object: nil)
        
        
        self.metalLayer?.frame = self.frame
        // Add the player item to the player.
        self.player?.replaceCurrentItem(with: self.playerItem)
        self.player?.play()
        self.VideoInterfaceOrientation()
    }
    
    
    func VideoInterfaceOrientation(){
           let videoTrack = self.asset?.tracks(withMediaType: .video)[0]
           let size = videoTrack?.naturalSize
           let txf = videoTrack?.preferredTransform
                   if size?.width == txf?.tx && size?.height == txf?.ty {
                      self.liveFilter?.videoOrienation = UIInterfaceOrientation.landscapeRight
                   } else if txf!.tx == 0 && txf!.ty == 0 {
                      self.liveFilter?.videoOrienation = UIInterfaceOrientation.landscapeLeft
                   } else if txf!.tx == 0 && txf?.ty == size?.width {
                      self.liveFilter?.videoOrienation = UIInterfaceOrientation.portraitUpsideDown
                   } else {
                      self.liveFilter?.videoOrienation = UIInterfaceOrientation.portrait
                   }
        
    }
    func loopVideo(_ videoPlayer: AVPlayer) {
        //    NotificationCenter.default.addObserver(forName: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: nil, queue: nil) { notification in
        //      self.videoBufferEnded()
        //    }
    }
    
    @objc func pause() {
        player?.pause()
    }
    
    @objc public func stop() {
        if let play = player {
            print("stopped")
            play.pause()
            
            displayLinker?.stopDisplayLink()
            displayLinker =  nil
            playerItem?.remove(playerItemVideoOutput)
            
            player = nil
            metalLayer?.removeFromSuperview()
            print("player deallocated")
        } else {
            print("player was already deallocated")
        }
    }
        
    @objc public func updateVideo(){
        self.playerItem?.remove(self.playerItemVideoOutput)
        NotificationCenter.default.removeObserver(self)
        self.metalLayer?.contentMode = .scaleAspectFit
        self.play()
        self.displayLinker = DisplayUpdateNotifier.init(listener: self)
    }
    
    @objc public func stopTemp() {
        if let play = player {
            print("stopped")
            play.pause()
            displayLinker?.stopDisplayLink()
        } else {

        }

    }
    
    
    
    @objc func playerDidFinishPlaying(_ notification: Notification) {
        self.videoBufferEnded()
    }
    
    @objc func videoBufferEnded(){
        if isLoop {
            player?.pause()
            player?.seek(to: CMTime.zero)
            player?.play()
        }
    }
    
    @objc public func setVideoLoop(isLoop: Bool) {
        self.isLoop = false
    }
    
    @objc public func setFilter(filterValues: NSDictionary ) {
        self.currentFilter = filterValues
        self.liveFilter?.setFilter(filterValues: filterValues)
    }
    
    @objc public func setFilterConfig(filterConfig: NSDictionary ) -> Void {
        self.videoFilterConfig = filterConfig
        print(videoFilterConfig)
    }
    
    @objc public func updateVideoFiles(videoFiles: Array<AVAsset>){
        self.videoArray = [AVAsset] ()
        self.videoArray = videoFiles
    }
    
    @objc func startMergeVideos(){
        mergeVideoFiles(arrayVideos: self.videoArray) { (AVAssetExportSession) in
            print("done")
        }
    }
    
    //Method for mergig videos together and make as single video file
    @objc func mergeVideoFiles(arrayVideos:[AVAsset], completion:@escaping (_ exporter: AVAssetExportSession) -> ()) -> Void {
        
        let mainComposition = AVMutableComposition()
        let compositionVideoTrack = mainComposition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)
        compositionVideoTrack?.preferredTransform = CGAffineTransform(rotationAngle: .pi / 2)
        
        let soundtrackTrack = mainComposition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
        
        var insertTime = CMTime.zero
        
        for videoAsset in arrayVideos {
            try! compositionVideoTrack?.insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: videoAsset.duration), of: videoAsset.tracks(withMediaType: .video)[0], at: insertTime)
            try! soundtrackTrack?.insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: videoAsset.duration), of: videoAsset.tracks(withMediaType: .audio)[0], at: insertTime)
            insertTime = CMTimeAdd(insertTime, videoAsset.duration)
        }
        
        let outputFileURL = URL(fileURLWithPath: NSTemporaryDirectory() + "merge.mp4")
        
        //Remove file if already available
        let fileManager = FileManager()
        do{
            try fileManager.removeItem(at: outputFileURL)
        }catch{
            print(error)
        }
        
        let exporter = AVAssetExportSession(asset: mainComposition, presetName: AVAssetExportPresetHighestQuality)
        
        exporter?.outputURL = outputFileURL
        exporter?.outputFileType = AVFileType.mp4
        exporter?.shouldOptimizeForNetworkUse = true
        
        exporter?.exportAsynchronously {
            DispatchQueue.main.async {
                completion(exporter!)
            }
        }
    }
    
    
    @objc public class var correctOrientation: CGFloat {
        let angle: CGFloat
        switch(UIDevice.current.orientation) {
         case .portraitUpsideDown: angle = -CGFloat.pi / 2 // Play around with these values
         case .landscapeLeft: angle = -CGFloat.pi
         case .landscapeRight: angle = 0
         case .portrait: angle = CGFloat.pi / 2
         default: angle = CGFloat.pi / 2
       }
       return angle
    }

}

