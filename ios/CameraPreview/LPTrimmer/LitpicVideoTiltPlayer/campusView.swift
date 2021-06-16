////
////  campusView.swift
////  react-native-litpic-camera-module
////
////  Created by optisol on 13/07/20.
////
//
//import UIKit
//import AVFoundation
//import CoreMotion
//
//@objc public class campusView: UIView {
//    let manager = CMMotionManager()
//    let arrowView = UIView()
//    var scrollView: UIScrollView!
//    var startXaxis:CGFloat = 0.0
//    var variationWidth:CGFloat = 0.0
//    var videoWorkspaceRatio:CGFloat = 0.0
//    var videoSizeOriginal:CGSize = .zero
//    @objc public var videoUrl:NSArray?
//    @objc public var videoFrame:CGRect = CGRect.zero
//    @objc public var videoFrameDict:NSDictionary?
//
//    public var  player:AVPlayer = AVPlayer.init()
//
//    @objc public  override init(frame: CGRect) {
//        super.init(frame: frame)
//        commonInit()
//    }
//
//
//    required init?(coder: NSCoder) {
//        super.init(coder: coder)
//        //        commonInit()
//    }
//
//    override public  func layoutSubviews() {
//        commonInit()
//        playDidSelected()
//    }
//
//    @objc public func updatePlayer(){
//        self.layoutSubviews()
//    }
//
//
//    @objc public func updateFrame(){
//        print(videoFrameDict as Any)
//        let videoResponse:NSDictionary = videoFrameDict!["response"] as! NSDictionary
//        videoFrame = CGRect.init(x: videoResponse["x"] as! CGFloat, y: videoResponse["y"] as! CGFloat, width: videoResponse["width"] as! CGFloat, height: videoResponse["height"] as! CGFloat)
//        print(videoFrame)
//    }
//
//    @objc public func deallocPlayer(){
//        self.manager.stopDeviceMotionUpdates()
//        self.manager.stopAccelerometerUpdates()
//        self.player.pause()
//    }
//
//
//    func commonInit(){
//        scrollView = UIScrollView.init(frame: self.frame)
//        //        guard let path = Bundle.main.path(forResource: "temp", ofType:"mp4") else {
//        //                   debugPrint("video.m4v not found")
//        //                   return
//        //               }
//
//
//        if self.videoUrl != nil{
//            let temVideoUrl:URL = URL.init(fileURLWithPath:(self.videoUrl?.firstObject) as! String)
//            videoSizeOriginal = nativeResolutionForLocalVideo(url: temVideoUrl)!
//        }
//
//
//        videoWorkspaceRatio = videoSizeOriginal.width/self.frame.size.width
//        variationWidth = videoSizeOriginal.width/10
//
//        arrowView.frame = CGRect(x: 0, y: 0, width: videoSizeOriginal.width , height: self.frame.size.height)
//        scrollView.addSubview(arrowView)
//        self.addSubview(scrollView)
//
////        print(CGSize.init(width: videoHeightRation*16, height: videoHeightRation))
//        //        videoWorkspaceRatio = videoSize!.width / (videoHeightRation*16)
//
//        guard manager.isAccelerometerAvailable else {
//            return
//        }
//        manager.startAccelerometerUpdates()
//
//
//        if manager.isDeviceMotionAvailable {
//            manager.startDeviceMotionUpdates(to: .main) {
//                [weak self] (data, error) in
//                var rect = self!.scrollView.frame
//                //                switch (UIDevice.current.orientation) {
//                //                case .portrait:
//                guard let data = data, error == nil else {
//                    return
//                }
//
//
//                let pitch = self!.radiansToDegrees(data.attitude.pitch)
//                let roll = self!.radiansToDegrees(data.attitude.roll)
//                let roundedRoll:Int = Int(roll)
//
//                //print("x = \(data.userAcceleration.x), y = \(data.userAcceleration.y), z = \(data.userAcceleration.z)")
//
//
//                if (roundedRoll >= -30 && roundedRoll <= 30){
//                    DispatchQueue.main.async {
//                        //print(roundedRoll)
//
//                        var correctPoint:CGFloat = 0.0
//
////                        if (roundedRoll >= 0){
////                            correctPoint = CGFloat(Double(roundedRoll) * 0.5)
////                            correctPoint = correctPoint + 5
////                        }else{
////                            correctPoint = CGFloat((Double(roundedRoll) * -0.5))
////                            correctPoint = (correctPoint - 5) * -1
////                        }
//
//                        correctPoint = CGFloat((Double(roundedRoll) * 0.5))
//
//
//                        if (correctPoint == -0.0){
//                            correctPoint = 0.0
//                        }
//
//
//
//                        //                            var addXPixel = (self?.scrollView.contentSize.width)! / self!.arrowView.frame.size.width
//                        //                            var addYPixel = (self?.scrollView.contentSize.height)! / self!.arrowView.frame.size.height
//                        //
//                        //                            if UIDevice.current.orientation == .landscapeRight {
//                        //                                addXPixel *= -1
//                        //                            } else {
//                        //                                addYPixel *= -1
//                        //                            }
//
//
//                        //                            let contentWidth = (self?.scrollView.contentSize.width)
//                        //                            var content = contentWidth! - (contentWidth!/2)
//                        //                            content = content/15
//                        //                            rect.origin.x =  CGFloat(roundedRoll * 10)  + 999
//                        //                            print(rect.origin.x)
//                        //                            if (roundedRoll == 0){
//                        //                                rect.origin.x = self!.arrowView.center.x
//                        //                            }else{
//                        //                                rect.origin.x =  CGFloat(roundedRoll) * (convertXAxis/30)
//                        //                                print(rect.origin.x)
//                        //                            }
//
//
////                        let areaWidth = ((self?.videoSizeOriginal.width)!/10)
////                        rect.origin.x =  (CGFloat(correctPoint) * areaWidth) + self!.startXaxis
////                        print(rect.origin.x)
////
//
//                        print(correctPoint)
////                        print(correctPoint * self!.videoWorkspaceRatio)
//                        let properValue = (correctPoint * self!.variationWidth)
////                        print(properValue)
//
//                        OperationQueue.main.addOperation {
//                            if self?.videoFrame != CGRect.zero{
//
//                                var convertFrame:CGRect = self!.videoFrame
//
//
//
//                                let total:CGFloat = ((self?.videoFrame.origin.x)! + (((self?.videoFrame.size.width)!/self!.videoWorkspaceRatio))) as! CGFloat
//                                convertFrame.origin.x = total * CGFloat(self!.videoWorkspaceRatio)
//                                convertFrame.origin.x = convertFrame.origin.x + properValue
//
////                                let videoWidth:CGFloat =  convertFrame.size.width - (self?.frame.size.width)!
////
////                                print(videoWidth)
////                                if (videoWidth > 0){
////                                    convertFrame.origin.x = convertFrame.origin.x + (videoWidth/2)
////                                }else{
////                                    convertFrame.origin.x = convertFrame.origin.x + ((videoWidth * -1)/2)
////                                }
////
////                                convertFrame.size.width = self?.frame.size.width as! CGFloat
//
////                                let fullpoint:CGFloat = (total * 2.0)/10.0
////                                print(CGFloat(correctPoint) * fullpoint)
////                                let conPoint:CGFloat = CGFloat(correctPoint) * fullpoint
////                                convertFrame.origin.x = conPoint * CGFloat(Int(self!.videoWorkspaceRatio))
////                                print(self?.frame.size.width)
////                                print(self?.videoFrame.origin.x)
////                                print(self?.videoWorkspaceRatio)
////                                print(convertFrame)
//
////                               let conPoint:CGFloat = total * (correctPoint/5)
////                                conPoint * CGFloat(Int(self!.videoWorkspaceRatio))
////                                print(conPoint)
////                                print(convertFrame.origin.x)
//                                convertFrame.origin.x = convertFrame.origin.x + properValue
//                                convertFrame.size.width = self?.frame.size.width as! CGFloat
//                                self!.scrollView.scrollRectToVisible(convertFrame, animated: false)
//                            }
//                        }
//                    }
//                }
//
//
//
//                //                    break;
//                //
//                //                case .unknown: break
//                //
//                //                case .portraitUpsideDown: break
//                //
//                //                case .landscapeLeft: break
//                //
//                //                case .landscapeRight: break
//                //
//                //                case .faceUp: break
//                //
//                //                case .faceDown: break
//                //
//                //                }
//            }
//        }
//    }
//
//
//    func nativeResolutionForLocalVideo(url:URL) -> CGSize?
//    {
//        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
//        let size = track.naturalSize.applying(track.preferredTransform)
//        return CGSize(width: fabs(size.width), height: fabs(size.height))
//    }
//
//    deinit {
//
//    }
//
//    func playDidSelected()  {
//
//
//        //        guard let path = Bundle.main.path(forResource: "temp", ofType:"mp4") else {
//        //            debugPrint("video.m4v not found")
//        //            return
//        //        }
//
//
//
//        if self.videoUrl != nil{
//            let temVideoUrl:URL = URL.init(fileURLWithPath: self.videoUrl!.firstObject as! String)
//             player = AVPlayer(url: temVideoUrl)
//            let playerLayer = AVPlayerLayer(player: player)
//            playerLayer.frame = self.arrowView.bounds
//            playerLayer.videoGravity = AVLayerVideoGravity.resizeAspectFill
//            self.arrowView.layer.addSublayer(playerLayer)
//            player.play()
//
//            NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: player.currentItem, queue: .main) { [weak self] _ in
//                self!.player.seek(to: CMTime.zero)
//                self!.player.play()
//            }
//
//            self.scrollView.contentSize = self.arrowView.bounds.size
//        }
//
//    }
//
//
//    func radiansToDegrees(_ radian: Double) -> Float {
//        return Float(radian * 180.0/Double.pi)
//    }
//}


//
//  campusView.swift
//  react-native-litpic-camera-module
//
//  Created by optisol on 13/07/20.
//

import UIKit
import AVFoundation
import CoreMotion

@objc public class campusView: UIView {
    let manager = CMMotionManager()
    let arrowView = UIView()
    var scrollView: UIScrollView!
    var startXaxis:CGFloat = 0.0
    var variationWidth:CGFloat = 0.0
    var videoWorkspaceRatio:CGFloat = 0.0
    var videoSizeOriginal:CGSize = .zero
    @objc public var videoUrl:NSArray?
    @objc public var videoFrame:CGRect = CGRect.zero
    @objc public var videoFrameDict:NSDictionary?

    public var  player:AVPlayer = AVPlayer.init()
  
    @objc public  override init(frame: CGRect) {
        super.init(frame: frame)
        commonInit()
    }
    
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        //        commonInit()
    }
    
    override public  func layoutSubviews() {
        commonInit()
        playDidSelected()
    }
    
    @objc public func updatePlayer(){
        self.layoutSubviews()
    }
    
    
    @objc public func updateFrame(){
        print(videoFrameDict as Any)
        let videoResponse:NSDictionary = videoFrameDict!["response"] as! NSDictionary
        videoFrame = CGRect.init(x: videoResponse["x"] as! CGFloat, y: videoResponse["y"] as! CGFloat, width: videoResponse["width"] as! CGFloat, height: videoResponse["height"] as! CGFloat)
        print(videoFrame)
    }
    
    @objc public func deallocPlayer(){
        self.manager.stopDeviceMotionUpdates()
        self.manager.stopAccelerometerUpdates()
        self.player.pause()
    }

    
    func commonInit(){
        scrollView = UIScrollView.init(frame: self.frame)
        
        if self.videoUrl != nil{
            let temVideoUrl:URL = URL.init(fileURLWithPath:(self.videoUrl?.firstObject) as! String)
            videoSizeOriginal = nativeResolutionForLocalVideo(url: temVideoUrl)!
        }
        
        arrowView.frame = CGRect(x: 0, y: 0, width: (self.frame.size.height/9) * 16 , height: self.frame.size.height)
        scrollView.addSubview(arrowView)
        self.addSubview(scrollView)


//        guard manager.isAccelerometerAvailable else {
//            return
//        }
//        manager.startAccelerometerUpdates()
//
//
//        if manager.isDeviceMotionAvailable {
//            manager.startDeviceMotionUpdates(to: .main) {
//                [weak self] (data, error) in
//                var rect = self!.scrollView.frame
//                //                switch (UIDevice.current.orientation) {
//                //                case .portrait:
//                guard let data = data, error == nil else {
//                    return
//                }
//
//
//                let pitch = self!.radiansToDegrees(data.attitude.pitch)
//                let roll = self!.radiansToDegrees(data.attitude.roll)
//                let roundedRoll:Int = Int(roll)
//
//                //print("x = \(data.userAcceleration.x), y = \(data.userAcceleration.y), z = \(data.userAcceleration.z)")
//
//
//                if (roundedRoll >= -30 && roundedRoll <= 30){
//                    DispatchQueue.main.async {
//                        //print(roundedRoll)
//
//                        var correctPoint:CGFloat = 0.0
//
////                        if (roundedRoll >= 0){
////                            correctPoint = CGFloat(Double(roundedRoll) * 0.5)
////                            correctPoint = correctPoint + 5
////                        }else{
////                            correctPoint = CGFloat((Double(roundedRoll) * -0.5))
////                            correctPoint = (correctPoint - 5) * -1
////                        }
//
//                        correctPoint = CGFloat((Double(roundedRoll) * 0.5))
//
//
//                        if (correctPoint == -0.0){
//                            correctPoint = 0.0
//                        }
//
//
//
//                        //                            var addXPixel = (self?.scrollView.contentSize.width)! / self!.arrowView.frame.size.width
//                        //                            var addYPixel = (self?.scrollView.contentSize.height)! / self!.arrowView.frame.size.height
//                        //
//                        //                            if UIDevice.current.orientation == .landscapeRight {
//                        //                                addXPixel *= -1
//                        //                            } else {
//                        //                                addYPixel *= -1
//                        //                            }
//
//
//                        //                            let contentWidth = (self?.scrollView.contentSize.width)
//                        //                            var content = contentWidth! - (contentWidth!/2)
//                        //                            content = content/15
//                        //                            rect.origin.x =  CGFloat(roundedRoll * 10)  + 999
//                        //                            print(rect.origin.x)
//                        //                            if (roundedRoll == 0){
//                        //                                rect.origin.x = self!.arrowView.center.x
//                        //                            }else{
//                        //                                rect.origin.x =  CGFloat(roundedRoll) * (convertXAxis/30)
//                        //                                print(rect.origin.x)
//                        //                            }
//
//
////                        let areaWidth = ((self?.videoSizeOriginal.width)!/10)
////                        rect.origin.x =  (CGFloat(correctPoint) * areaWidth) + self!.startXaxis
////                        print(rect.origin.x)
////
//
//                        print(correctPoint)
////                        print(correctPoint * self!.videoWorkspaceRatio)
//                        let properValue = (correctPoint * self!.variationWidth)
////                        print(properValue)
//
//                        OperationQueue.main.addOperation {
//                            if self?.videoFrame != CGRect.zero{
//
//                                var convertFrame:CGRect = self!.videoFrame
//
//
//
//                                let total:CGFloat = ((self?.videoFrame.origin.x)! + (((self?.videoFrame.size.width)!/self!.videoWorkspaceRatio))) as! CGFloat
//                                convertFrame.origin.x = total * CGFloat(self!.videoWorkspaceRatio)
//                                convertFrame.origin.x = convertFrame.origin.x + properValue
//
////                                let videoWidth:CGFloat =  convertFrame.size.width - (self?.frame.size.width)!
////
////                                print(videoWidth)
////                                if (videoWidth > 0){
////                                    convertFrame.origin.x = convertFrame.origin.x + (videoWidth/2)
////                                }else{
////                                    convertFrame.origin.x = convertFrame.origin.x + ((videoWidth * -1)/2)
////                                }
////
////                                convertFrame.size.width = self?.frame.size.width as! CGFloat
//
////                                let fullpoint:CGFloat = (total * 2.0)/10.0
////                                print(CGFloat(correctPoint) * fullpoint)
////                                let conPoint:CGFloat = CGFloat(correctPoint) * fullpoint
////                                convertFrame.origin.x = conPoint * CGFloat(Int(self!.videoWorkspaceRatio))
////                                print(self?.frame.size.width)
////                                print(self?.videoFrame.origin.x)
////                                print(self?.videoWorkspaceRatio)
////                                print(convertFrame)
//
////                               let conPoint:CGFloat = total * (correctPoint/5)
////                                conPoint * CGFloat(Int(self!.videoWorkspaceRatio))
////                                print(conPoint)
////                                print(convertFrame.origin.x)
//                                convertFrame.origin.x = convertFrame.origin.x + properValue
//                                convertFrame.size.width = self?.frame.size.width as! CGFloat
//                                self!.scrollView.scrollRectToVisible(convertFrame, animated: false)
//                            }
//                        }
//                    }
//                }
//
//
//
//                //                    break;
//                //
//                //                case .unknown: break
//                //
//                //                case .portraitUpsideDown: break
//                //
//                //                case .landscapeLeft: break
//                //
//                //                case .landscapeRight: break
//                //
//                //                case .faceUp: break
//                //
//                //                case .faceDown: break
//                //
//                //                }
//            }
//        }
    }
    
    
    func nativeResolutionForLocalVideo(url:URL) -> CGSize?
    {
        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
        let size = track.naturalSize.applying(track.preferredTransform)
        return CGSize(width: fabs(size.width), height: fabs(size.height))
    }
    
    deinit {
        
    }
    
    func playDidSelected()  {
        
        
        //        guard let path = Bundle.main.path(forResource: "temp", ofType:"mp4") else {
        //            debugPrint("video.m4v not found")
        //            return
        //        }
        
        
        
        if self.videoUrl != nil{
            let temVideoUrl:URL = URL.init(fileURLWithPath: self.videoUrl!.firstObject as! String)
             player = AVPlayer(url: temVideoUrl)
            let playerLayer = AVPlayerLayer(player: player)
            playerLayer.frame = self.arrowView.bounds
            playerLayer.videoGravity = AVLayerVideoGravity.resizeAspectFill
            self.arrowView.layer.addSublayer(playerLayer)
            player.play()
            
            NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: player.currentItem, queue: .main) { [weak self] _ in
                self!.player.seek(to: CMTime.zero)
                self!.player.play()
            }
            
            self.scrollView.contentSize = self.arrowView.bounds.size
        }
        
    }
    
    
    func radiansToDegrees(_ radian: Double) -> Float {
        return Float(radian * 180.0/Double.pi)
    }
}

