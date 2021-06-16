//
//  VideoEditorSwift.swift
//  react-native-litpic-camera-module
//
//  Created by optisol on 02/08/20.
//

import UIKit

@objc public class VideoEditorSwift: UIView {
    
    
    var cropRect:CGRect?
    var cropView:UIView!
    var cropWidth:CGFloat?
    
    
    public var player: AVQueuePlayer?
    public var playerLayer: AVPlayerLayer?

    public var IsVideoFromCameraRecorder:Bool = false
    @objc public var videoUrls:NSString?
    @objc public var videoUrlsArray:NSArray?
    @objc public var IsCropperView:Bool = false
    
    var looper: Looper?
    var videoPlayUrl:URL?
    var IsVideoMergeProcessStart:Bool = false
    var backgroundEmitorCompletionHandler: ((_ param: NSDictionary) -> ())?
    
    @objc public override init(frame: CGRect) {
        super.init(frame: frame)
        
        cropView = UIView.init()
        cropView.backgroundColor = .clear
        self.addSubview(cropView)

    }
    
    @objc public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
     public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        
        if newWindow == nil {
            // UIView disappear
            looper?.stop()
            
        } else {
            // UIView appear
            if player != nil{
                player?.play()
            }
        }
    }
    
    
    @objc public func copyEmitor(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        backgroundEmitorCompletionHandler = completionHandler
    }

    
    public override func layoutSubviews() {
        print(VideoSingleton.sharedInstance.temVideoUrl)
        
        
//        if self.videoUrls?.length ?? 0 > 0 && self.videoUrlsArray?.count == 0 {
            IsVideoFromCameraRecorder = true
        videoPlayUrl = VideoSingleton.sharedInstance.originalVideoUrl
            if #available(iOS 10.0, *) {
                self.looper = PlayerLooper.init(videoURL: videoPlayUrl!, loopCount: -1)
            } else {
                // Fallback on earlier versions
            }
            self.looper?.start(in: self.layer)
//            self.cropViewSetup()
//        }else if (self.videoUrls?.length == 0 && self.videoUrlsArray?.count ?? 0 > 0){
//            if (self.IsVideoMergeProcessStart == false){
//                self.IsVideoMergeProcessStart = true
//                var fileURLs:[URL] = [URL]()
//                for i in 0..<(self.videoUrlsArray?.count)!{
//                    let videoUrl:URL = URL.init(fileURLWithPath: self.videoUrlsArray![i] as! String)
//                    fileURLs.append(videoUrl)
//                }
//
//                DPVideoMerger().mergeVideos(withFileURLs: fileURLs , completion: {(_ mergedVideoFile: URL?, _ error: Error?) -> Void in
//                    if error != nil {
//
//                    }else{
//                        let response:NSDictionary = ["action" : "videoMerged", "videoPath":mergedVideoFile?.path]
//                        self.backgroundEmitorCompletionHandler!(response)
//                        self.videoPlayUrl = mergedVideoFile
//                        if #available(iOS 10.0, *) {
//                            self.looper = PlayerLooper.init(videoURL: mergedVideoFile!, loopCount: -1)
//                        } else {
//                            // Fallback on earlier versions
//                        }
//                        self.looper?.start(in: self.layer)
////                        self.cropViewSetup()
//                    }
//                })
//            }
//        }else{
//        }
        
        self.cropViewSetup()

    }
    
    @objc public func muteSoundOnMusicSync(isflag : Bool){
        self.looper?.mute(flag: isflag)
    }
    
    
    
    public func cropViewSetup(){
        if(IsCropperView == true){
            cropView.isHidden = false
            cropRect = resolutionForLocalVideo(url: self.videoPlayUrl!)!
            
            let tempCropWidth = ((cropRect?.size.height)!/16) * 7
            cropWidth = tempCropWidth
            
            cropView.frame = CGRect.init(x:(self.frame.width - tempCropWidth)/2, y: cropRect!.origin.y, width: tempCropWidth , height: cropRect!.size.height)
            let yourViewBorder = CAShapeLayer()
            yourViewBorder.strokeColor = UIColor.white.cgColor
            yourViewBorder.lineDashPattern = [2, 2]
            yourViewBorder.frame = cropView.bounds
            yourViewBorder.fillColor = nil
            yourViewBorder.path = UIBezierPath(rect: cropView.bounds).cgPath
            cropView.layer.addSublayer(yourViewBorder)
            
            let panGesture = UIPanGestureRecognizer(target: self, action:#selector(handlePanGesture))
            cropView.addGestureRecognizer(panGesture)
            
            self.bringSubviewToFront(cropView)
        }
    }

    @objc func handlePanGesture(panGesture: UIPanGestureRecognizer) {
        let translation = panGesture.translation(in: self)
        if let viewToDrag = panGesture.view {
            //            if (IsPortrait == true){
            if (viewToDrag.frame.origin.x > 0 && viewToDrag.frame.origin.x < (self.frame.size.width - cropWidth!)){
                viewToDrag.center = CGPoint(x: viewToDrag.center.x + translation.x, y: viewToDrag.center.y)
                panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
            }else{
                if (viewToDrag.frame.origin.x > 0){
                    viewToDrag.center = CGPoint(x: (self.frame.size.width - (cropWidth!/2)) + translation.x, y: viewToDrag.center.y)
                    panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
                }else{
                    viewToDrag.center = CGPoint(x: viewToDrag.center.x + 2 , y: viewToDrag.center.y)
                    panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
                }
            }
            //            }else {
            //
            //                let xValue:CGFloat = ((cropRect?.origin.x)!/2)
            //
            //                if (viewToDrag.frame.origin.x > xValue && (viewToDrag.frame.origin.x + cropWidth!) < ((self.cropRect?.size.width)! + xValue) ){
            //                    viewToDrag.center = CGPoint(x: viewToDrag.center.x + translation.x, y: viewToDrag.center.y)
            //                    panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
            //                    print("xxxxxxxx", viewToDrag.frame.origin)
            //                }else{
            //                    if (viewToDrag.frame.origin.x > xValue){
            //                        viewToDrag.center = CGPoint(x: (self.cropRect?.size.width)! - xValue + 5 + translation.x, y: viewToDrag.center.y)
            //                        panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
            //                        print("yyyyyyy")
            //                    }else{
            //                        viewToDrag.center = CGPoint(x: viewToDrag.center.x + 2 , y: viewToDrag.center.y)
            //                        panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
            //                        print("zzzzzzzzz")
            //                    }
            //                }
            //            }
            //            videoXAxis = viewToDrag.frame.origin.x * (videoSize.width/self.frame.size.width)
            print(cropView.frame)
        }
        
    }
    
    @objc public func saveVideo(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        //if(self.videoPlayUrl == nil){
        
            if(self.videoUrls != ""){
                let urlString = URL(fileURLWithPath: self.videoUrls as! String)
                UISaveVideoAtPathToSavedPhotosAlbum(urlString.path, nil, nil, nil);
            }else{
//                let urlString = URL(fileURLWithPath: self.videoUrlsArray?.firstObject as! String)
                UISaveVideoAtPathToSavedPhotosAlbum(VideoSingleton.sharedInstance.originalVideoUrl!.path, nil, nil, nil)
            }
        //}
        //UISaveVideoAtPathToSavedPhotosAlbum(self.videoPlayUrl!.path, nil, nil, nil);
        
        let response:NSDictionary = ["response" : "Video saved Successfully"]
        completionHandler(response);
    }
    
    @objc public func saveVideoWithTextOverlay(drawArrayText: [[String: Any]],completionHandler: @escaping (_ param: NSDictionary) -> Void) {
        
        //        let localURL:URL = URL.init(fileURLWithPath: (videoPlayUrl) as! String)
        let videoAsset = AVAsset.init(url: videoPlayUrl!)
        let asset = videoAsset
                let vTrack = asset.tracks(withMediaType: AVMediaType.video)
                // get video track
                let videoTrack:AVAssetTrack = vTrack[0] as! AVAssetTrack
                let assetComposition = AVMutableComposition()
                let duration = asset.duration
                let durationTime = CMTimeGetSeconds(duration)
                
                
                let frame1Time = CMTime(seconds:durationTime , preferredTimescale: asset.duration.timescale)
                let trackTimeRange = CMTimeRangeMake(start: .zero, duration: frame1Time)
                
                guard let videoCompositionTrack = assetComposition.addMutableTrack(withMediaType: .video,
                                                                                   preferredTrackID: kCMPersistentTrackID_Invalid) else {
                                                                                    return
                }
                
                do {
                    try videoCompositionTrack.insertTimeRange(trackTimeRange, of: videoTrack , at: CMTime.zero)
                    if let audioTrack = asset.tracks(withMediaType: AVMediaType.audio).first {
                        let audioCompositionTrack = assetComposition.addMutableTrack(withMediaType: AVMediaType.audio,
                                                                                     preferredTrackID: kCMPersistentTrackID_Invalid)
                        try audioCompositionTrack?.insertTimeRange(trackTimeRange, of: audioTrack, at: CMTime.zero)
                    }            //all fine with jsonData here
                } catch {
                    print(error)
                }
                
                
                
                // Watermark Effect
                let size = videoTrack.naturalSize
                //let size = UIScreen.main.bounds
                let screenSize: CGRect = UIScreen.main.bounds
                var error: NSError?
                
                let assetTrack = AVAsset(url:  videoPlayUrl!).tracks(withMediaType: AVMediaType.video).first
                let transform = assetTrack!.preferredTransform
                let assetInfo = self.orientationFromTransform(transform)
                
                //setting the video layer
                let videolayer = CALayer()
                if(assetInfo.orientation == .up){
                    videolayer.frame = CGRect(x: 0, y: 0, width: size.width, height: size.height)
                }else{
                    videolayer.frame = CGRect(x: 0, y: 0, width: size.height, height: size.width)
                }

                let parentlayer = CALayer()
                parentlayer.frame = CGRect(x: 0, y: 0, width: size.width, height: size.height)
                parentlayer.addSublayer(videolayer)
                let scale = UIScreen.main.scale

                
                for i in drawArrayText {
                    let drawText = i
                    let isDeleted = drawText["isDeleted"] as! Bool
                    let isSticker = drawText["isSticker"] as! Bool
                if(isDeleted == false && isSticker == false){
                    // create text Layer
                    // Setup the font specific variables
                    var textColor = UIColor.white
                    var xPos : CGFloat = drawText["xcoordinate"] as! CGFloat
                    let totalTranslateX = drawText["totalTranslateX"] as! CGFloat
                    xPos = abs(xPos) + totalTranslateX
                    var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
                    let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
                    yPos = yPos + totalTranslateY
                    let textWidth: CGFloat = drawText["width"] as! CGFloat
                    let textHeight: CGFloat = drawText["height"] as! CGFloat
                    var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
                    scaleValue = scaleValue == 0 ? scaleValue + 1.6 : scaleValue + 0.8
                    let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
                    var textBackground = UIColor.clear
                    var textAlign : CATextLayerAlignmentMode = .center
                           if((drawText["textAlign"] as! String) == "left"){
                               textAlign = .left
                           }else if((drawText["textAlign"] as! String) == "right"){
                               textAlign = .right
                           }else{
                               textAlign = .center
                           }
                    if(drawText["textBg"] as! String != "transparent") {
                        textBackground = UIColor().hexStringToUIColor(hex: drawText["textBg"] as! String)
                        if(drawText["textBg"] as! String == "white" || drawText["textBg"] as! String == "#FFFFFF"){
                            textColor = UIColor.black
                        }
                    }
                    if(drawText["textColor"] as! String != "transparent" && drawText["textColor"] as! String != "white"){
                        textColor = UIColor().hexStringToUIColor(hex: drawText["textColor"] as! String)
                    }else if(drawText["textColor"] as! String == "black"){
                        textColor = .black
                    }
                    var textFont = UIFont(name: drawText["textFont"] as! String, size: 27.0)!
                    let textFontAttributes = [
                        NSAttributedString.Key.font: textFont,
                        NSAttributedString.Key.foregroundColor: textColor,
                    ]
                    
                   
//                    let temVideoUrl = URL.init(string: self.videoUrls!.firstObject as! String)
                    
                    let labelToDisplay = MyCATextLayer()
                    let ratioWidth = videolayer.frame.width/screenSize.width
                    let ratioHeight = videolayer.frame.height/screenSize.height
                    print("yDIFF Ratio height",ratioHeight,ratioWidth)
                    let ratio = videolayer.frame.width/videolayer.frame.height
                    let widthText = videolayer.frame.width - ((screenSize.width - textWidth) * ratioWidth)
                    //(xPos * ratioWidth) + (textWidth) - 15
                    //(videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale)) + 50)
                    var yVal = (videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale)) - 15)
                    if(rotateValue != 0){
                        yVal = (videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale)) - 50)
                    }
                    print("x vALue",xPos, ((xPos * ratioWidth) + 45 + scale), textWidth)
                    labelToDisplay.frame = CGRect(x: textWidth >= (screenSize.width - 50) ? ((xPos * ratioWidth) + 150) : ((xPos * ratioWidth) + 45), y: yVal, width: textWidth >= (screenSize.width - 200) ? (widthText - textWidth - 100): textWidth + 25, height: textHeight + (35 * (textHeight / 100)))
                    //labelToDisplay.frame = CGRect(x: ((xPos * ratioWidth) + 55 + scale), y: (videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale)) - 45), width: textWidth >= (screenSize.width - 220) ? (widthText - textWidth - 45): textWidth + 20, height: textHeight + 40)
                    labelToDisplay.contentsGravity = .resizeAspect
                    labelToDisplay.string = drawText["textValue"] as! String
                    labelToDisplay.masksToBounds = true
                    labelToDisplay.isWrapped = true
                    labelToDisplay.foregroundColor = textColor.cgColor
                    labelToDisplay.backgroundColor = textBackground.cgColor
            //        labelToDisplay.numberOfLines = 0
                    labelToDisplay.cornerRadius = 15.0
                    labelToDisplay.masksToBounds = true
                    labelToDisplay.alignmentMode = textAlign
                    labelToDisplay.font = textFont
                    var transformm = CATransform3DMakeRotation(rotateValue, 0, 0, -1.0)
                    transformm = CATransform3DScale(transformm, scaleValue, scaleValue, 1.0)
                    labelToDisplay.transform = transformm
                    parentlayer.addSublayer(labelToDisplay)
                    
                }else if(isDeleted == false && isSticker){
                    var xPos : CGFloat = drawText["xcoordinate"] as! CGFloat
                    let totalTranslateX = drawText["totalTranslateX"] as! CGFloat
                    xPos = xPos + totalTranslateX
                    var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
                    let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
                    yPos = yPos + totalTranslateY
                    let imgWidth: CGFloat = drawText["width"] as! CGFloat
                    let imgHeight: CGFloat = drawText["height"] as! CGFloat
                    var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
                    let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
                    let ratioWidth = videolayer.frame.width/screenSize.width
                    let ratioHeight = videolayer.frame.height/screenSize.height
                    let xValue = (xPos * ratioWidth) + 10
                    let yValue = (videolayer.frame.height - ((yPos * ratioHeight) + (imgHeight * ratioHeight)) + 10)
                    let imageOverlayURL = drawText["stickerUrl"] as! String
                    let lastExtension = imageOverlayURL.split(separator: ".")
                    let extLast = lastExtension[lastExtension.count - 1]
                    
                    let labelToDisplay = CALayer()
                    labelToDisplay.frame = CGRect(x:xValue, y: yValue, width: imgWidth * (ratioWidth - 0.3) , height: imgHeight * (ratioWidth - 0.3))
                    if(extLast == "gif"){
                        scaleValue = scaleValue == 0 ? scaleValue : scaleValue + 0.5
                        var transformmgif = CATransform3DMakeScale(scaleValue, scaleValue, 1.0)
                        transformmgif = CATransform3DRotate(transformmgif, rotateValue, 0, 0, -1)
                        let repeatCount = (asset.duration.value/1000)/60
                        let animationGif = self.animationForGif(with: URL(string:imageOverlayURL)!, repeatCount: Float(repeatCount),gifToDisplay: labelToDisplay, ratioAspect: ratioWidth)
//                        let xValueRatio = (animationGif.gifWidth/ratioWidth)
//                        let yValueRatio = (animationGif.gifHeight/ratioHeight)
                        //labelToDisplay.frame = CGRect(x: labelToDisplay.frame.origin.x + 5, y: (labelToDisplay.frame.origin.y - 90) + (animationGif.gifHeight), width: (animationGif.gifWidth/1.6), height: (animationGif.gifHeight/1.6))
                        print("GIFSIZE AFTER CALC",animationGif.gifWidth,animationGif.gifHeight,labelToDisplay.frame.origin.x,labelToDisplay.frame.origin.y)
                        labelToDisplay.add(animationGif.animation!,forKey:"contents")
                        labelToDisplay.contentsGravity = .resizeAspect
                        if(scaleValue != 0 && rotateValue != 0){
                            labelToDisplay.transform = transformmgif
                        }else if(rotateValue != 0){
                            labelToDisplay.transform = CATransform3DMakeRotation(rotateValue, 0, 0, -1)
                        }else if(scaleValue != 0){
                            labelToDisplay.transform = CATransform3DMakeScale(scaleValue, scaleValue, 1)
                        }
                        parentlayer.addSublayer(labelToDisplay)
                    }else{
                        scaleValue = scaleValue == 0 ? scaleValue + 1.0: scaleValue + 0.08
                        let data = try! Data(contentsOf: URL(string: imageOverlayURL)!)
                        labelToDisplay.contents = UIImage(data:data)?.cgImage
                        var transformm = CATransform3DMakeScale(scaleValue, scaleValue, 1.0)
                        transformm = CATransform3DRotate(transformm, rotateValue, 0, 0, -1)
                        if(scaleValue != 0 && rotateValue != 0){
                            labelToDisplay.transform = transformm
                        }else if(rotateValue != 0){
                            labelToDisplay.transform = CATransform3DMakeRotation(rotateValue, 0, 0, -1)
                        }else if(scaleValue != 0){
                            labelToDisplay.transform = CATransform3DMakeScale(scaleValue, scaleValue, 1)
                        }
                        parentlayer.addSublayer(labelToDisplay)
                    }
                }
            }

                // instruction for watermark
                let instruction = AVMutableVideoCompositionInstruction()
                
                instruction.timeRange = CMTimeRange(start: .zero, duration: assetComposition.duration)
                let videotrack1 = assetComposition.tracks(withMediaType: AVMediaType.video)[0]
        //        videotrack1.preferredTransform = asset!.preferredTransform
                let layerinstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: videotrack1)
                        
                let layercomposition = AVMutableVideoComposition()
                if(assetInfo.orientation == .right){
                    let degToRotate : CGFloat = ( 90.0 / 180.0 * .pi)
                    let t1 = CGAffineTransform.identity.translatedBy(x: size.height, y: 0.0).rotated(by: degToRotate)
                    layerinstruction.setTransform(t1, at: CMTime.zero) //important piece of information let composition know you want to rotate the original video in output
                    layercomposition.renderSize = CGSize(width: size.height, height: size.width)
                }else if(assetInfo.orientation == .up){
        //            let degValue = (90.0 / 180.0 * .pi)
        //            let t1 = CGAffineTransform.identity.translatedBy(x: 0.0, y: 0.0).rotated(by: CGFloat(degValue))
        //            layerinstruction.setTransform(t1, at: CMTime.zero)
                    videolayer.frame =  CGRect(x: 0, y: 0, width: size.width, height: size.height)
                    layercomposition.renderSize = CGSize(width: size.width, height: size.height)
                }else{
                    let deg = atan2(assetTrack!.preferredTransform.b, assetTrack!.preferredTransform.a)
                    let degValue = ( -180.0 * .pi / 360.0 )
                    let t1 = CGAffineTransform.identity.translatedBy(x: 0.0, y: size.width).rotated(by: CGFloat(degValue))
                    layerinstruction.setTransform(t1, at: CMTime.zero)
                    layercomposition.renderSize = CGSize(width: size.height, height: size.width)
                }
                instruction.layerInstructions = [layerinstruction]
                        
                layercomposition.instructions = [instruction]
                layercomposition.frameDuration = CMTimeMake(value: 1, timescale: 30)
                
                layercomposition.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videolayer, in: parentlayer)

                //  create new file to receive data
                let dirPaths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
                let docsDir: String = (dirPaths[0] as? String)!
                let movieFilePath = docsDir.appending("/textOverlay.mp4")
                let movieDestinationUrl = URL(fileURLWithPath: movieFilePath)
                if(FileManager.default.fileExists(atPath: movieFilePath))
                {
                    try? FileManager.default.removeItem(atPath: movieFilePath)
                }
        //        let url = URL(fileURLWithPath: "\(NSTemporaryDirectory())textOverlayedMovie.mp4")
        //            try? FileManager.default.removeItem(at: url)
                    
                    let exportSession = AVAssetExportSession(asset: assetComposition, presetName: AVAssetExportPresetHighestQuality)
                    exportSession?.outputFileType = AVFileType.mp4
                    exportSession?.shouldOptimizeForNetworkUse = true
                    exportSession?.videoComposition = layercomposition
                    exportSession?.outputURL = movieDestinationUrl
                    exportSession?.exportAsynchronously(completionHandler: {
                        DispatchQueue.main.async {
                            if let url = exportSession?.outputURL, exportSession?.status == .completed {
                                self.videoPlayUrl = url
                                
                                let dateFormatter = DateFormatter()
                                dateFormatter.dateFormat = "yyyymmddHH:mm:ss"
                                let revfilename = "\(dateFormatter.string(from: Date()))merge_video.mp4"
                                let revpath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(revfilename)
                                
                                if FileManager().secureCopyItem(at: url, to: revpath){
                                    let response:NSDictionary = ["video" : revpath.absoluteString as Any]
                                    print(response)
                                    UISaveVideoAtPathToSavedPhotosAlbum(movieDestinationUrl.path, nil, nil, nil);
                                    completionHandler(response)
                                }
                            } else {
                                let error = exportSession?.error
                                print("error exporting video \(String(describing: error))")
                            }
                        }
                    })
    }
    
    
    func animationForGif(with url: URL?, repeatCount: Float, gifToDisplay:CALayer, ratioAspect: CGFloat) -> (animation: CAKeyframeAnimation?, gifWidth: CGFloat, gifHeight: CGFloat) {

        let animation = CAKeyframeAnimation(keyPath: "contents")

        var frames: [AnyHashable] = []
        var delayTimes: [AnyHashable] = []

        var totalTime: CGFloat = 0.0
        var gifWidth: CGFloat = 0.0
        var gifHeight: CGFloat = 0.0

        var gifSource: CGImageSource? = nil
        if let url1 = url as CFURL? {
            gifSource = CGImageSourceCreateWithURL(url1, nil)
        }

        // get frame count
        var frameCount: Int? = 0
        if let gifSource = gifSource {
            frameCount = CGImageSourceGetCount(gifSource)
        }
        for i in 0..<frameCount! {
            // get each frame
            var frame: CGImage? = nil
            if let gifSource = gifSource {
                frame = CGImageSourceCreateImageAtIndex(gifSource, i, nil)
            }
            if let frame = frame {
                frames.append(frame)
            }

            // get gif info wit!h each frame
            let dict = CGImageSourceCopyPropertiesAtIndex(gifSource!, i, nil) as? [AnyHashable : Any]
            
            if let value = dict?[kCGImagePropertyGIFDictionary as String] {
                print("kCGImagePropertyGIFDictionary \(value)")
            }

            // get gif size
            gifWidth = CGFloat((dict?[kCGImagePropertyPixelWidth as String] as? NSNumber)?.floatValue ?? 0.0)
            gifHeight = CGFloat((dict?[kCGImagePropertyPixelHeight as String] as? NSNumber)?.floatValue ?? 0.0)
            print("GIFSIZE",gifWidth,gifHeight,gifToDisplay.frame.origin.x,gifToDisplay.frame.origin.y)

            let gifDict = dict?[kCGImagePropertyGIFDictionary as String] as? [AnyHashable : Any]
            if let value = gifDict?[kCGImagePropertyGIFDelayTime as String] {
                delayTimes.append(value as! AnyHashable)
            }
            

            totalTime = totalTime + CGFloat((gifDict?[kCGImagePropertyGIFDelayTime as String] as? NSNumber)!.floatValue ?? 0.0)
        }
            
            var times = [AnyHashable](repeating: 0, count: 3)
            var currentTime: CGFloat = 0
            let count = delayTimes.count
            for i in 0..<count {
                times.append(NSNumber(value: Float((currentTime / totalTime))))
                currentTime += CGFloat((delayTimes[i] as? NSNumber)!.floatValue)
            }

            var images = [AnyHashable](repeating: 0, count: 3)
            for i in 0..<count {
                images.append(frames[i])
            }

            animation.keyTimes = times as? [NSNumber]
            animation.values = images
            animation.timingFunction = CAMediaTimingFunction(name: .linear)
            animation.duration = CFTimeInterval(totalTime)
            animation.repeatCount = 60

            animation.beginTime = AVCoreAnimationBeginTimeAtZero
            animation.isRemovedOnCompletion = false

            return (animation,gifWidth,gifHeight)
        }
    
     func orientationFromTransform(_ transform: CGAffineTransform)
        -> (orientation: UIImage.Orientation, isPortrait: Bool) {
      var assetOrientation = UIImage.Orientation.up
      var isPortrait = false
      if transform.a == 0 && transform.b == 1.0 && transform.c == -1.0 && transform.d == 0 {
        assetOrientation = .right
        isPortrait = true
      } else if transform.a == 0 && transform.b == -1.0 && transform.c == 1.0 && transform.d == 0 {
        assetOrientation = .left
        isPortrait = true
      } else if transform.a == 1.0 && transform.b == 0 && transform.c == 0 && transform.d == 1.0 {
        assetOrientation = .up
      } else if transform.a == -1.0 && transform.b == 0 && transform.c == 0 && transform.d == -1.0 {
        assetOrientation = .down
      }
      return (assetOrientation, isPortrait)
    }
    
    private func resolutionForLocalVideo(url: URL) -> CGRect? {
        
        guard let track = AVURLAsset(url: url).tracks(withMediaType: AVMediaType.video).first else { return nil }
        
        let trackSize = track.naturalSize
        let videoViewSize = self.bounds.size
        
        let trackRatio = (trackSize.width ) / (trackSize.height )
        let videoViewRatio = self.frame.size.width / self.frame.size.height
        
        var newSize: CGSize
        
        if videoViewRatio > trackRatio {
            newSize = CGSize(width: (trackSize.width ) * self.frame.size.height / (trackSize.height ), height: videoViewSize.height)
        } else {
            newSize = CGSize(width: self.frame.size.width, height: (trackSize.height ) * videoViewSize.width / (trackSize.width ))
        }
        
        let newX = (videoViewSize.width - newSize.width) / 2
        let newY = (videoViewSize.height - newSize.height) / 2
        
        return CGRect.init(x: newX, y: newY, width: newSize.width, height: newSize.height)
    }
    
    
        @objc public func getVideoCropRect(completionHandler: @escaping (_ param: NSDictionary) -> Void){
            self.cropView.isHidden = true
            let cropFrame:CGRect = self.cropView.frame
    //            cropFrame.origin.x = videoXAxis
                let cropFrameObj:NSDictionary = ["x":cropFrame.origin.x, "y":cropFrame.origin.y,"width":cropFrame.size.width, "height":cropFrame.size.height]
                let response:NSDictionary = ["response" : cropFrameObj]
                completionHandler(response);
        }
    
     @objc public func cropVideoDidSelected(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        
        var videoCollection:[URL] = [URL]()
        
                    let outputURL = videoPlayUrl
        
                    var asset: AVURLAsset? = nil
                    if let outputURL = outputURL {
                        asset = AVURLAsset(url: outputURL, options: nil)
                    }
                    let tracks = asset?.tracks(withMediaType: .video)
            if(asset != nil && tracks?.count != 0){
                    let track = tracks?[0]
        
                    var fileSize: Double? = nil
                    do {
                        fileSize = try FileManager.default.attributesOfItem(atPath: outputURL?.path ?? "")[FileAttributeKey.size] as? Double ?? 0
                    } catch {
        
                    }
                
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyymmddHH:mm:ss"
                let revfilename = "\(dateFormatter.string(from: Date()))merge_video.mp4"
                let revpath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(revfilename)


                if FileManager().secureCopyItem(at: outputURL!, to: revpath){
                    let dateFormatter = DateFormatter()
                    dateFormatter.dateFormat = "yyyy-mm-dd HH:mm:ss"
        
                    let image_date = dateFormatter.string(from: Date())
                    let image_size = String(format: "%.2f MB", fileSize! / 1024.0 / 1024.0)
        
                    let image_width = "\(Int(track!.naturalSize.width))"
                    let image_height = "\(Int(track!.naturalSize.height))"
                    
                    var videoDuration = CMTimeGetSeconds(asset!.duration)
                    videoDuration = videoDuration * 1000.0
        
                    let videoData = [
                        "fileName" : "finalVideo",
                        "type" : "video",
                        "size" : image_size,
                        "created_At" : image_date,
                        "height" : image_height,
                        "width" : image_width,
                        "path" : revpath.path as Any,
                        "isLandscape" : UIDeviceOrientation.portrait.rawValue,
                        "updated_At" : image_date,
                        "frame_rate" : track?.nominalFrameRate,
                        "duration": String(format: "%.2f", videoDuration)
                        ] as [String : Any]
        
                    let videoResponse:NSDictionary = [
                        "videoData" : videoData
                    ]
                    completionHandler(videoResponse as NSDictionary)

                }
                
                
                
                }
        //        })
    }
    
}


class LPCATextLayer: CATextLayer {


// USAGE: To fix the vertical alignment issue that currently exists within the CATextLayer class. Change made to the yDiff calculation.

override init() {
    super.init()
}

required init(coder aDecoder: NSCoder) {
    super.init(layer: aDecoder)
}

override func draw(in ctx: CGContext) {
    let height = self.bounds.size.height
    let fontSize = self.fontSize
    let yDiff = (height-fontSize)/2 - fontSize/10

    ctx.saveGState()
    ctx.translateBy(x: 0.0, y: yDiff)
    super.draw(in: ctx)
    ctx.restoreGState()
   }
}


extension FileManager {
    open func secureCopyItem(at srcURL: URL, to dstURL: URL) -> Bool {
        do {
            if FileManager.default.fileExists(atPath: dstURL.path) {
                try FileManager.default.removeItem(at: dstURL)
            }
            try FileManager.default.copyItem(at: srcURL, to: dstURL)
        } catch (let error) {
            print("Cannot copy item at \(srcURL) to \(dstURL): \(error)")
            return false
        }
        return true
    }
}
