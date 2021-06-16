/*
    Copyright (C) 2016 Apple Inc. All Rights Reserved.
    See LICENSE.txt for this sample‚Äôs licensing information
    
    Abstract:
    An object that uses AVPlayerLooper to loop a video.
*/

import UIKit
import AVFoundation
 
@available(iOS 10.0, *)
@objc class PlayerLooper: NSObject, Looper {
    // MARK: Types

    private struct ObserverContexts {
        static var isLooping = 0
        
        static var isLoopingKey = "isLooping"
        
        static var loopCount = 0
        
        static var loopCountKey = "loopCount"
        
        static var playerItemDurationKey = "duration"
    }

    // MARK: Properties

    private var player: AVQueuePlayer?

    private var playerLayer: AVPlayerLayer?

    private var playerLooper: AVPlayerLooper?

    private var isObserving = false

    private let numberOfTimesToPlay: Int

    private let videoURL: URL

    // MARK: Looper

   @objc required init(videoURL: URL, loopCount: Int) {
        self.videoURL = videoURL
        self.numberOfTimesToPlay = loopCount
        super.init()
    }
    
    public func nativeResolutionForLocalVideo(url:URL) -> CGSize?{
        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
        let size = track.naturalSize.applying(track.preferredTransform)
        return CGSize(width: abs(size.width), height: fabs(size.height))
    }


    func start(in parentLayer: CALayer) {
        player = AVQueuePlayer()
        playerLayer = AVPlayerLayer(player: player)

        guard let playerLayer = playerLayer else { fatalError("Error creating player layer") }
        playerLayer.frame = parentLayer.bounds
        parentLayer.addSublayer(playerLayer)
        
        
//        let videoSize:CGSize = self.nativeResolutionForLocalVideo(url: self.videoURL) ?? CGSize.zero
//        if videoSize.width < videoSize.height{
//            let portraitSize:CGSize = CGSize.aspectFill(aspectRatio: CGSize.init(width: 1080, height: 1920), minimumSize: CGSize.init(width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: (UIApplication.shared.keyWindow?.bounds.size.height)!-64))
//            playerLayer.frame = CGRect.init(x: 0, y: 0, width: portraitSize.width, height: portraitSize.height )
//        }else{
//            playerLayer.videoGravity = .resizeAspect
//        }
        

        let playerItem = AVPlayerItem(url: videoURL)
        playerItem.asset.loadValuesAsynchronously(forKeys: [ObserverContexts.playerItemDurationKey], completionHandler: {()->Void in
            /*
                The asset invokes its completion handler on an arbitrary queue when
                loading is complete. Because we want to access our AVPlayerLooper
                in our ensuing set-up, we must dispatch our handler to the main queue.
            */
            DispatchQueue.main.async(execute: {
                guard let player = self.player else { return }

                var durationError: NSError? = nil
                let durationStatus = playerItem.asset.statusOfValue(forKey: ObserverContexts.playerItemDurationKey, error: &durationError)
                guard durationStatus == .loaded else { fatalError("Failed to load duration property with error: \(durationError)") }

                
//                player.externalPlaybackVideoGravity = .resizeAspectFill
                
                self.playerLooper = AVPlayerLooper(player: player, templateItem: playerItem)
                self.startObserving()
                player.play()
            })
        })
    }

    func stop() {
        player?.pause()
        stopObserving()

        playerLooper?.disableLooping()
        playerLooper = nil

        playerLayer?.removeFromSuperlayer()
        playerLayer = nil

        player = nil
    }
    
    // MARK: - Mute Player
    func mute(flag: Bool){
        if(self.player != nil){
            if(flag){
                self.player?.isMuted = true
            }else{
                self.player?.isMuted = false
            }
        }
    }

    // MARK: Convenience

    private func startObserving() {
        guard let playerLooper = playerLooper, !isObserving else { return }
        playerLooper.addObserver(self, forKeyPath: ObserverContexts.isLoopingKey, options: .new, context: &ObserverContexts.isLooping)
        playerLooper.addObserver(self, forKeyPath: ObserverContexts.loopCountKey, options: .new, context: &ObserverContexts.loopCount)
        isObserving = true
    }

    private func stopObserving() {
        guard let playerLooper = playerLooper, isObserving else { return }
        playerLooper.removeObserver(self, forKeyPath: ObserverContexts.isLoopingKey, context: &ObserverContexts.isLooping)
        playerLooper.removeObserver(self, forKeyPath: ObserverContexts.loopCountKey, context: &ObserverContexts.loopCount)

        isObserving = false
    }

    // MARK: KVO

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if context == &ObserverContexts.isLooping {
            if let loopingStatus = change?[.newKey] as? Bool, !loopingStatus {
                print("Looping ended due to an error")
            }
        }
        else if context == &ObserverContexts.loopCount {
            guard let playerLooper = playerLooper else { return }
            if numberOfTimesToPlay > 0 && playerLooper.loopCount >= numberOfTimesToPlay - 1 {
                print("Exceeded loop limit of \(numberOfTimesToPlay) and disabling looping");
                stopObserving()
                playerLooper.disableLooping()
            }
        }
        else {
            super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
        }
    }
}
