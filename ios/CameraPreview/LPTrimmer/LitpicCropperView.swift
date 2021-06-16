//
//  LitpicCropperView.swift
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 24/04/20.
//

import UIKit

@objc public class LitpicCropperView: UIView {
    
    var cropRect:CGRect?
    var cropView:UIView!
    var cropWidth:CGFloat?
    var playerView: UIView!
//    var cam:campusView!

    var player: AVPlayer?
    var videoAsset:AVAsset?
    var IsPortrait:Bool = false
    var IsVideoPortrait:Bool = false
    public var playlayer: AVPlayerLayer?
    @objc public var videoUrl:NSArray?
    @objc public var IsVideoPlayer:Bool = false
    public var videoSize:CGSize = .zero
    public var videoXAxis:CGFloat = 0.0
    
    deinit {
        
    }
    
    @objc public override init(frame: CGRect) {
        super.init(frame: frame)
        //        nibSetup()
    }
    
    @objc public init(videoUrl:NSArray) {
        self.videoUrl = videoUrl
        super.init(frame: .zero)
    }
    
    @objc public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    public override func layoutSubviews() {
        
        if playerView != nil{
            playerView.removeFromSuperview()
        }
        
        if (self.player != nil){
            self.player!.pause()
            self.playlayer!.removeFromSuperlayer()
        }

        if cropView != nil{
            cropView.removeFromSuperview()
        }
        
        
        if self.videoUrl == nil{
            return
        }
        
        if (IsVideoPlayer == true){
            playerView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height))
            playerView.backgroundColor = .red
            self.addSubview(playerView)
            playerView.translatesAutoresizingMaskIntoConstraints = false

            NSLayoutConstraint.activate([
                playerView.leftAnchor.constraint(equalTo: self.leftAnchor),
                playerView.rightAnchor.constraint(equalTo: self.rightAnchor),
                playerView.topAnchor.constraint(equalTo: self.topAnchor),
                playerView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
            ])

            if self.videoUrl?.count ?? 0 > 0{
                let localURL:URL = URL(string:  (self.videoUrl?.firstObject!) as! String)!
                let currentAsset =   AVAsset.init(url: localURL)
                videoAsset = currentAsset
                addVideoPlayer(with: videoAsset!, playerView: playerView)
                NotificationCenter.default.addObserver(self, selector: #selector(self.playerDidFinishPlaying), name: .AVPlayerItemDidPlayToEndTime, object: nil)
            }
        }else{
            
            self.IsPortrait = true
            portraitView()

            if (UIDevice.current.orientation == .portrait){
                self.IsPortrait = true
                portraitView()
            }else if (UIDevice.current.orientation == .landscapeLeft || UIDevice.current.orientation == .landscapeRight){
                self.IsPortrait = false
                landscapeView()
            }else{
                self.IsPortrait = true
                portraitView()
            }
        }
        
//
//            self.cam = campusView.init(frame: self.frame)
//            self.cam.startXaxis = videoXAxis
//            self.cam.videoUrl=self.videoUrl
//            self.cam.isHidden = true
//            self.cam.backgroundColor = .white
//            self.addSubview(cam)
    }
    
    
    @objc func playerDidFinishPlaying(_ notification: Notification) {
      self.player!.seek(to: CMTime.zero)
      self.player!.play()
    }

    
    func portraitView(){
        backgroundColor = .black
        playerView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height))
        playerView.backgroundColor = .black
        self.addSubview(playerView)
        playerView.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            playerView.leftAnchor.constraint(equalTo: self.leftAnchor),
            playerView.rightAnchor.constraint(equalTo: self.rightAnchor),
            playerView.topAnchor.constraint(equalTo: self.topAnchor),
            playerView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
        ])
        
        
        let temVideoUrl:URL = URL.init(string: self.videoUrl?.firstObject as! String)!
        videoSize = nativeResolutionForLocalVideo(url: temVideoUrl)!
        
        if (videoSize.width > videoSize.height){
            IsVideoPortrait = false
            cropView = UIView.init()
            cropView.backgroundColor = .clear
            self.addSubview(cropView)
            let panGesture = UIPanGestureRecognizer(target: self, action:#selector(handlePanGesture))
            cropView.addGestureRecognizer(panGesture)
        }else{
            IsVideoPortrait = true
        }
        
        pickAsset(videopath: "")
    }
    
    func landscapeView(){
        playerView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height))
        playerView.backgroundColor = .black
        self.addSubview(playerView)
        playerView.translatesAutoresizingMaskIntoConstraints = false
        
        
        let temVideoUrl = URL.init(string: (self.videoUrl?.firstObject!)! as! String)
        cropRect = resolutionForLocalVideo(url: temVideoUrl!)!
        let xValue:CGFloat = ((cropRect?.origin.x)!/2) * -1
        
        NSLayoutConstraint.activate([
            playerView.leftAnchor.constraint(equalTo: self.leftAnchor, constant: xValue),
            playerView.rightAnchor.constraint(equalTo: self.rightAnchor),
            playerView.topAnchor.constraint(equalTo: self.topAnchor),
            playerView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
        ])
        
        
         videoSize = nativeResolutionForLocalVideo(url: temVideoUrl!)!
        if (videoSize.width > videoSize.height){
            IsVideoPortrait = false
            cropView = UIView.init()
            cropView.backgroundColor = .clear
            self.addSubview(cropView)
            
            let panGesture = UIPanGestureRecognizer(target: self, action:#selector(handlePanGesture))
            cropView.addGestureRecognizer(panGesture)
        }else{
            IsVideoPortrait = true
        }
        
        
        pickAsset(videopath: "")
    }
    
    
    @objc func handlePanGesture(panGesture: UIPanGestureRecognizer) {
        let translation = panGesture.translation(in: self)
        if let viewToDrag = panGesture.view {
            if (IsPortrait == true){
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
            }else {
                
                let xValue:CGFloat = ((cropRect?.origin.x)!/2)
                
                if (viewToDrag.frame.origin.x > xValue && (viewToDrag.frame.origin.x + cropWidth!) < ((self.cropRect?.size.width)! + xValue) ){
                    viewToDrag.center = CGPoint(x: viewToDrag.center.x + translation.x, y: viewToDrag.center.y)
                    panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
                    print("xxxxxxxx", viewToDrag.frame.origin)
                }else{
                    if (viewToDrag.frame.origin.x > xValue){
                        viewToDrag.center = CGPoint(x: (self.cropRect?.size.width)! - xValue + 5 + translation.x, y: viewToDrag.center.y)
                        panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
                        print("yyyyyyy")
                    }else{
                        viewToDrag.center = CGPoint(x: viewToDrag.center.x + 2 , y: viewToDrag.center.y)
                        panGesture.setTranslation(CGPoint(x: 0, y: 0), in: viewToDrag)
                        print("zzzzzzzzz")
                    }
                }
            }

//            videoXAxis = viewToDrag.frame.origin.x * (videoSize.width/self.frame.size.width)
            print(cropView.frame)
        }
        
    }
    
    
    
    public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        if newWindow == nil {
            if (self.IsVideoPlayer == true){
                if playerView != nil{
                    self.player?.pause()
                    self.playlayer!.removeFromSuperlayer()
                    self.playerView.removeFromSuperview()
                }
            }else{
                player?.pause()
                if playerView != nil{
                    playerView.removeFromSuperview()
                    self.player!.pause()
                    self.playlayer!.removeFromSuperlayer()
                }
                
                if cropView != nil{
                    cropView.removeFromSuperview()
                }
            }
            NotificationCenter.default.removeObserver(self)
            
        } else {
            // UIView appear
        }
    }
    
    
    @objc public  func pickAsset(videopath:String) {
        if self.videoUrl!.count > 5 {
            let temVideoUrl = URL.init(string: self.videoUrl!.firstObject as! String)
            cropRect = resolutionForLocalVideo(url: temVideoUrl!)!
            
            
            
            
            if IsVideoPortrait == false{
//                cropWidth = (cropRect!.size.height/3) * 2
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
            }
            
            
            let currentAsset =   AVAsset.init(url: temVideoUrl!)
            videoAsset = currentAsset
            addVideoPlayer(with: videoAsset!, playerView: playerView)
            
            
            NotificationCenter.default.addObserver(self, selector: #selector(self.playerDidFinishPlaying), name: .AVPlayerItemDidPlayToEndTime, object: nil)

        }
    }
    
    
    private func addVideoPlayer(with asset: AVAsset, playerView: UIView) {
        let playerItem = AVPlayerItem(asset: asset)
        player = AVPlayer(playerItem: playerItem)
        playlayer = AVPlayerLayer(player: player)
        playlayer!.backgroundColor = UIColor.black.cgColor
        playlayer!.frame = CGRect(x: 0, y: 0, width: playerView.frame.width, height: playerView.frame.height)
      
        if (IsVideoPortrait == true){
            playlayer!.videoGravity = AVLayerVideoGravity.resizeAspectFill
        }
        
        playerView.layer.sublayers?.forEach({$0.removeFromSuperlayer()})
        playerView.layer.addSublayer(playlayer!)
        player?.play()
        
        //(playerView.aspectRatio(1.0/1.0) as AnyObject).isActive = true
    }
    
    
    
    
    private func resolutionForLocalVideo(url: URL) -> CGRect? {
        
        guard let track = AVURLAsset(url: url).tracks(withMediaType: AVMediaType.video).first else { return nil }
        
        let trackSize = track.naturalSize
        let videoViewSize = playerView.bounds.size
        
        let trackRatio = (trackSize.width ) / (trackSize.height )
        let videoViewRatio = playerView.frame.size.width / playerView.frame.size.height
        
        var newSize: CGSize
        
        if videoViewRatio > trackRatio {
            newSize = CGSize(width: (trackSize.width ) * playerView.frame.size.height / (trackSize.height ), height: videoViewSize.height)
        } else {
            newSize = CGSize(width: playerView.frame.size.width, height: (trackSize.height ) * videoViewSize.width / (trackSize.width ))
        }
        
        let newX = (videoViewSize.width - newSize.width) / 2
        let newY = (videoViewSize.height - newSize.height) / 2
        
        return CGRect.init(x: newX, y: newY, width: newSize.width, height: newSize.height)
    }
    
    
    func nativeResolutionForLocalVideo(url:URL) -> CGSize?
    {
        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
        let size = track.naturalSize.applying(track.preferredTransform)
        return CGSize(width: fabs(size.width), height: fabs(size.height))
    }
    
    
    private func aspectFillScale(for size: CGSize, in containerSize: CGSize) -> CGFloat {
        let widthRatio = containerSize.width  / size.width
        let heightRatio = containerSize.height / size.height
        return max(widthRatio, heightRatio)
    }
    
    
    
    
    
    private func getTransform(for videoTrack: AVAssetTrack) -> CGAffineTransform {
//        let renderSize = CGSize(width: 16 * 2 * 18,
//                                height: 16 * 3 * 18)
        
        let tempCropWidth = ((cropRect?.size.height)!/16) * 9
        let renderSize = CGSize.init(width:tempCropWidth , height: (cropRect?.size.height)!)

        let cropFrame = self.getImageCropFrame()
        let renderScale = renderSize.width / cropFrame.width
        let offset = CGPoint(x: -cropFrame.origin.x, y: -cropFrame.origin.y)
        let rotation = atan2(videoTrack.preferredTransform.b, videoTrack.preferredTransform.a)
        
        var rotationOffset = CGPoint(x: 0, y: 0)
        
        if videoTrack.preferredTransform.b == -1.0 {
            rotationOffset.y = videoTrack.naturalSize.width
        } else if videoTrack.preferredTransform.c == -1.0 {
            rotationOffset.x = videoTrack.naturalSize.height
        } else if videoTrack.preferredTransform.a == -1.0 {
            rotationOffset.x = videoTrack.naturalSize.width
            rotationOffset.y = videoTrack.naturalSize.height
        }
        
        var transform = CGAffineTransform.identity
        transform = transform.scaledBy(x: renderScale, y: renderScale)
        transform = transform.translatedBy(x: offset.x + rotationOffset.x, y: offset.y + rotationOffset.y)
        transform = transform.rotated(by: rotation)
        
        print("track size \(videoTrack.naturalSize)")
print("crop size \(cropFrame)")
print("render size \(renderSize)")
//        print("preferred Transform = \(videoTrack.preferredTransform)")
//        print("rotation angle \(rotation)")
//        print("rotation offset \(rotationOffset)")
//        print("actual Transform = \(transform)")
        return transform
    }
    
    
    public func getImageCropFrame() -> CGRect {
        let track = videoAsset!.tracks(withMediaType: AVMediaType.video).first
        let size:CGSize = track!.naturalSize.applying(track!.preferredTransform)
        
        let imageSize = size
        let contentSize = cropRect?.size
        let cropBoxFrame = cropView.frame
        
        let contentOffset = CGPoint.init(x: 0, y: 0)
        
        var edgeInsets = UIEdgeInsets.zero
        
        if (self.IsPortrait == true){
            edgeInsets = UIEdgeInsets.init(top: 0, left: cropView.frame.origin.x, bottom: 0, right: 0)
        }else{
            let xValue:CGFloat = ((cropRect?.origin.x)!/2) * -1
            edgeInsets = UIEdgeInsets.init(top: 0, left: cropView.frame.origin.x + xValue, bottom: 0, right: 0)
        }
        
        var frame = CGRect.zero
        frame.origin.x = floor((contentOffset.x + edgeInsets.left) * (imageSize.width / contentSize!.width))
        frame.origin.x = max(0, frame.origin.x)
        
        frame.origin.y = floor((contentOffset.y + edgeInsets.top) * (imageSize.height / contentSize!.height))
        frame.origin.y = max(0, frame.origin.y)
        
        frame.size.width = ceil(cropBoxFrame.size.width * (imageSize.width / contentSize!.width))
        frame.size.width = min(imageSize.width, frame.size.width)
        
        frame.size.height = ceil(cropBoxFrame.size.height * (imageSize.height / contentSize!.height))
        frame.size.height = min(imageSize.height, frame.size.height)
        return frame
    }
    
    
    
    @objc public func getVideoCropRect(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        if (self.IsVideoPlayer == true){
            var cropFrame:CGRect = self.cropView.frame
//            cropFrame.origin.x = videoXAxis
            
            
            let cropFrameObj:NSDictionary = ["x":cropFrame.origin.x, "y":cropFrame.origin.y,"width":cropFrame.size.width, "height":cropFrame.size.height]
            let response:NSDictionary = ["response" : cropFrameObj]
            completionHandler(response);
        }else{
            
        }
    }
    
    @objc public func saveVideo(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        if (self.IsVideoPlayer == true){
            let localURL:URL = URL(string:  (self.videoUrl!.firstObject) as! String)!
            UISaveVideoAtPathToSavedPhotosAlbum(localURL.path, nil, nil, nil);
            let response:NSDictionary = ["response" : "Video saved Successfully"]
            completionHandler(response);
        }else{
            
        }
    }
    
    //NOT USED
    @objc public func saveVideoWithTextOverlay(drawArrayText: [[String: Any]],completionHandler: @escaping (_ param: NSDictionary) -> Void) {
        let asset = videoAsset
        let vTrack = asset!.tracks(withMediaType: AVMediaType.video)
        // get video track
        let videoTrack:AVAssetTrack = vTrack[0] as! AVAssetTrack

        let assetComposition = AVMutableComposition()
        let duration = asset!.duration
        let durationTime = CMTimeGetSeconds(duration)
        
        
        let frame1Time = CMTime(seconds:durationTime , preferredTimescale: asset!.duration.timescale)
        let trackTimeRange = CMTimeRangeMake(start: .zero, duration: frame1Time)
        
        guard let videoCompositionTrack = assetComposition.addMutableTrack(withMediaType: .video,
                                                                           preferredTrackID: kCMPersistentTrackID_Invalid) else {
                                                                            return
        }
        
        do {
            try videoCompositionTrack.insertTimeRange(trackTimeRange, of: videoTrack , at: CMTime.zero)
            if let audioTrack = asset!.tracks(withMediaType: AVMediaType.audio).first {
                let audioCompositionTrack = assetComposition.addMutableTrack(withMediaType: AVMediaType.audio,
                                                                             preferredTrackID: kCMPersistentTrackID_Invalid)
                try audioCompositionTrack?.insertTimeRange(trackTimeRange, of: audioTrack, at: CMTime.zero)
            }            //all fine with jsonData here
        } catch {
            print(error)
        }
        
        
        
        // Watermark Effect
        let size = videoTrack.naturalSize
        let screenSize: CGRect = UIScreen.main.bounds
        var error: NSError?
        
        let assetTrack = AVAsset(url: URL(string: self.videoUrl!.firstObject as! String)!).tracks(withMediaType: AVMediaType.video).first
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
            xPos = xPos + totalTranslateX
            var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
            let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
            yPos = yPos + totalTranslateY
            let textWidth: CGFloat = drawText["width"] as! CGFloat
            let textHeight: CGFloat = drawText["height"] as! CGFloat
            var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
            scaleValue = scaleValue == 0 ? scaleValue + 1.5 : scaleValue + 0.5
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
            var textFont = UIFont(name: drawText["textFont"] as! String, size: 30.0)!
            let textFontAttributes = [
                NSAttributedString.Key.font: textFont,
                NSAttributedString.Key.foregroundColor: textColor,
            ]
            
           
            let temVideoUrl = URL.init(string: self.videoUrl!.firstObject as! String)
            print("ASPECT RATIO", resolutionForLocalVideo(url: temVideoUrl!))
            
            let labelToDisplay = MyCATextLayer()
            let ratioWidth = videolayer.frame.width/screenSize.width
            let ratioHeight = videolayer.frame.height/screenSize.height
            let ratio = videolayer.frame.width/videolayer.frame.height
            //(xPos * ratioWidth) + (textWidth) - 15
            //(videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale)) + 50)
            labelToDisplay.frame = CGRect(x:((xPos * ratioWidth) - 30), y: (videolayer.frame.height - ((yPos * ratioHeight) + (textHeight * scale) + 30)), width: (textWidth + textWidth) - 30, height: textHeight + 30)

            labelToDisplay.string = drawText["textValue"] as! String
            labelToDisplay.masksToBounds = true
            labelToDisplay.isWrapped = true
            labelToDisplay.foregroundColor = textColor.cgColor
            labelToDisplay.backgroundColor = textBackground.cgColor
    //        labelToDisplay.numberOfLines = 0
            labelToDisplay.cornerRadius = 10.0
            labelToDisplay.masksToBounds = true
            labelToDisplay.alignmentMode = textAlign
            labelToDisplay.font = textFont
            var transformm = CATransform3DMakeRotation(rotateValue, 0, 0,-1.0)
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
            scaleValue = scaleValue == 0 ? scaleValue : scaleValue + 0.5
            let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
            let ratioWidth = videolayer.frame.width/screenSize.width
            let ratioHeight = videolayer.frame.height/screenSize.height
            let xValue = (xPos * ratioWidth)
            let yValue = (videolayer.frame.height - ((yPos * ratioHeight) + (imgHeight * ratioHeight) - 30))
            let imageOverlayURL = drawText["stickerUrl"] as! String
            let lastExtension = imageOverlayURL.split(separator: ".")
            let extLast = lastExtension[lastExtension.count - 1]
            var transformm = CATransform3DMakeScale(scaleValue, scaleValue, 1.0)
            transformm = CATransform3DRotate(transformm, rotateValue, 0, 0, -1.0)
            let labelToDisplay = CALayer()
            labelToDisplay.frame = CGRect(x:xValue, y: yValue, width: imgWidth * (ratioWidth - 0.3) , height: imgHeight * (ratioWidth - 0.3))
            if(extLast == "gif"){
                let animationGif = self.animationForGif(with: URL(string:imageOverlayURL)!)
                labelToDisplay.add(animationGif!,forKey:"contents")
                if(scaleValue != 0){
                    labelToDisplay.transform = transformm
                }
                parentlayer.addSublayer(labelToDisplay)
            }else{
                let data = try! Data(contentsOf: URL(string: imageOverlayURL)!)
                labelToDisplay.contents = UIImage(data:data)?.cgImage
                if(scaleValue != 0){
                    labelToDisplay.transform = transformm
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
                        let response:NSDictionary = ["video" : url.absoluteString as Any]
                        print(response)
                        UISaveVideoAtPathToSavedPhotosAlbum(movieDestinationUrl.path, nil, nil, nil);
                        completionHandler(response)
                    } else {
                        let error = exportSession?.error
                        print("error exporting video \(String(describing: error))")
                    }
                }
            })
    }
    
    
    @objc public func cropVideoDidSelected(completionHandler: @escaping (_ param: NSDictionary) -> Void){
//        self.bringSubviewToFront(self.cam)
//        self.cam.startXaxis = videoXAxis
//        self.cam.videoUrl=self.videoUrl?.firstObject as! String
//        self.cam.isHidden = false
//
//        if IsVideoPortrait == true{
//            if playerView != nil{
//                playerView.removeFromSuperview()
//                self.player!.pause()
//                self.playlayer!.removeFromSuperlayer()
//            }
//
//            if cropView != nil{
//                cropView.removeFromSuperview()
//            }
//            let response:NSDictionary = ["video" : videoUrl as Any]
//            completionHandler(response);
//        }else{
//            let asset = videoAsset
//            let videoTrack = asset!.tracks(withMediaType: AVMediaType.video).first
//
//            let assetComposition = AVMutableComposition()
//            let duration = asset!.duration
//            let durationTime = CMTimeGetSeconds(duration)
//
//
//            let frame1Time = CMTime(seconds:durationTime , preferredTimescale: asset!.duration.timescale)
//            let trackTimeRange = CMTimeRangeMake(start: .zero, duration: frame1Time)
//
//            guard let videoCompositionTrack = assetComposition.addMutableTrack(withMediaType: .video,
//                                                                               preferredTrackID: kCMPersistentTrackID_Invalid) else {
//                                                                                return
//            }
//
//
//            do {
//                try videoCompositionTrack.insertTimeRange(trackTimeRange, of: videoTrack! , at: CMTime.zero)
//                if let audioTrack = asset!.tracks(withMediaType: AVMediaType.audio).first {
//                    let audioCompositionTrack = assetComposition.addMutableTrack(withMediaType: AVMediaType.audio,
//                                                                                 preferredTrackID: kCMPersistentTrackID_Invalid)
//                    try audioCompositionTrack?.insertTimeRange(trackTimeRange, of: audioTrack, at: CMTime.zero)
//                }            //all fine with jsonData here
//            } catch {
//                //handle error
//                print(error)
//            }
//
//
//            //1. Create the instructions
//            let mainInstructions = AVMutableVideoCompositionInstruction()
//            mainInstructions.timeRange = CMTimeRangeMake(start: .zero, duration: asset!.duration)
//
//            //2 add the layer instructions
//            let layerInstructions = AVMutableVideoCompositionLayerInstruction(assetTrack: videoCompositionTrack)
//
////            let renderSize = CGSize(width: 16 * 2 * 18,
////                                    height: 16 * 3 * 18)
//
//            let tempCropWidth = ((cropRect?.size.height)!/16) * 9
//            let renderSize = CGSize.init(width:tempCropWidth , height: (cropRect?.size.height)!)
//
//
//            let transform = getTransform(for: videoTrack!)
//
//            layerInstructions.setTransform(transform, at: CMTime.zero)
//            layerInstructions.setOpacity(1.0, at: CMTime.zero)
//            mainInstructions.layerInstructions = [layerInstructions]
//
//            //3 Create the main composition and add the instructions
//
//            let videoComposition = AVMutableVideoComposition()
//            videoComposition.renderSize = renderSize
//            videoComposition.instructions = [mainInstructions]
//            videoComposition.frameDuration = CMTimeMake(value: 1, timescale: 30)
//
//            let url = URL(fileURLWithPath: "\(NSTemporaryDirectory())CroppedMovie.mp4")
//            try? FileManager.default.removeItem(at: url)
//
//            let exportSession = AVAssetExportSession(asset: assetComposition, presetName: AVAssetExportPresetHighestQuality)
//            exportSession?.outputFileType = AVFileType.mp4
//            exportSession?.shouldOptimizeForNetworkUse = true
//            exportSession?.videoComposition = videoComposition
//            exportSession?.outputURL = url
//            exportSession?.exportAsynchronously(completionHandler: {
//                DispatchQueue.main.async {
//                    if let url = exportSession?.outputURL, exportSession?.status == .completed {
//                        let response:NSDictionary = ["video" : url.absoluteString as Any]
//                        print(response)
//                        if self.playerView != nil{
//                            self.playerView.removeFromSuperview()
//                            self.player!.pause()
//                            self.playlayer!.removeFromSuperlayer()
//                        }
//
//                        if self.cropView != nil{
//                            self.cropView.removeFromSuperview()
//                        }
//                        completionHandler(response);
//                    } else {
//                        let error = exportSession?.error
//                        print("error exporting video \(String(describing: error))")
//                    }
//                }
//            })
//        }
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
    
    func animationForGif(with url: URL?) -> CAKeyframeAnimation? {

        let animation = CAKeyframeAnimation(keyPath: "contents")

        var frames: [AnyHashable] = []
        var delayTimes: [AnyHashable] = []

        var totalTime: CGFloat = 0.0
        var gifWidth: CGFloat
        var gifHeight: CGFloat

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
            animation.repeatCount = 10

            animation.beginTime = AVCoreAnimationBeginTimeAtZero
            animation.isRemovedOnCompletion = false

            return animation
        }
    
}

class MyCATextLayer: CATextLayer {


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
    print("yDIFF",yDiff, height)
    ctx.saveGState()
    ctx.translateBy(x: 0.0, y: 10.0)
    super.draw(in: ctx)
    ctx.restoreGState()
   }
}
