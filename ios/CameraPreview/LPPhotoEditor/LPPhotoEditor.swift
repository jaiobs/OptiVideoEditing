//
//  LPPhotoEditor.swift
//  react-native-litpic-camera-module
//
//  Created by optisol on 18/01/21.
//

import UIKit


@objc public class LPPhotoEditor: UIView, UIGestureRecognizerDelegate {
    var videoPlayerView = UIView.init(frame: .zero)
    var videoViewContainer: UIView!
    @objc public var stickerLayerView: UIImageView!
    var imageView: UIImageView!
    var canvasView: UIView!
    var alignmentRawValue: [NSString] = ["left", "center", "right"]
    var screenWidth:CGFloat = UIScreen.main.bounds.size.width/2
    var screenHeight:CGFloat = UIScreen.main.bounds.size.height/2
    
    var looper: Looper?
    var videoPlayUrl:URL?

    var bottomSheetIsVisible = false
    var drawColor: UIColor = UIColor.black
    var textColor: UIColor = UIColor.white
    var isDrawing: Bool = false
    var lastPoint: CGPoint!
    var swiped = false
    var opacity: CGFloat = 1.0
    var lastPanPoint: CGPoint?
    var lastTextViewTransform: CGAffineTransform?
    var lastTextViewTransCenter: CGPoint?
    var lastTextViewFont:UIFont?
    var activeTextView: UITextView?
    var imageRotated: Bool = false
    var imageViewToPan: UIImageView?
    var deleteView: UIView!
    var imageTag:Int = 1000
    
    var textCursorMove: Bool = true

    public var gifCount:Int = 0
    @objc public var IsPhotoMode = true
    @objc public var imageUrlPath:NSString?
    @objc public var videoUrlPath:String?
    public var IsPhotoConvertVideoMode = false
    var backgroundPhotoEmitorCompletionHandler: ((_ param: NSDictionary) -> ())?
    public var subviewsArray:[UIView] = [UIView]()
    private var lastScale:CGFloat = 1.0
    private var lastPinchPoint:CGPoint = CGPoint(x: 0, y: 0)

    var trashString: String!
    var trashImage = UIImageView()
    var customView = UIView()
    var textPositionx:CGFloat = 0;
    var textPositiony:CGFloat = 50.0;
    var currentTextView : UITextView!
    

    @objc public override init(frame: CGRect) {
        super.init(frame: frame)
        
        deleteView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.width))
        deleteView.layer.cornerRadius = deleteView.bounds.height / 2
        deleteView.clipsToBounds = true
        deleteView.isHidden = true
        self.addSubview(deleteView)
        
        canvasView = UIView.init(frame: self.frame)
        imageView = UIImageView.init(frame: self.frame)
        stickerLayerView = UIImageView.init(frame: self.frame)
        stickerLayerView.isUserInteractionEnabled = true
        self.addSubview(canvasView!)
        canvasView.addSubview(imageView!)
        
        customView = UIView.init(frame: self.frame)
        trashImage = UIImageView.init(frame: self.frame)
        self.addSubview(customView)
        customView.addSubview(trashImage)
        deleteView.addSubview(customView)
        
        
        let edgePan = UIScreenEdgePanGestureRecognizer(target: self, action: #selector(screenEdgeSwiped))
        edgePan.edges = .bottom
        edgePan.delegate = self
        self.addGestureRecognizer(edgePan)
        
        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillShow(_:)), name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillHide(_:)), name: UIResponder.keyboardWillHideNotification, object: nil)
        self.addSubview(stickerLayerView!)
         let tapGesture = UITapGestureRecognizer(target: self, action: #selector(self.dismissKeyboard (_:)))
        self.addGestureRecognizer(tapGesture)
    }
    
    @objc public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    @objc func dismissKeyboard (_ sender: UITapGestureRecognizer) {
        activeTextView?.resignFirstResponder()
    }
    
    public override func layoutSubviews() {
        self.SetUpLayout()
    }
    
    
    private func SetUpLayout() {
      
        if (IsPhotoMode == true){
            if (imageUrlPath != nil){
                let data = try? Data(contentsOf: URL.init(string: imageUrlPath! as String)!)
                //imageView?.contentMode = .scaleAspectFill
                imageView!.image = UIImage(data: data!)!.cropToRect(rect: CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height))
                imageView?.backgroundColor = .black
                imageView.frame = self.frame
                
                let imageSize:CGSize = imageView.image!.resizeEnd(withSize: self.frame.size, contentMode: .contentAspectFit)!
                
                stickerLayerView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
                imageView.frame = CGRect(x: 0, y: 0,width: self.frame.size.width, height: self.frame.size.height)
                
                canvasView.frame = CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
                
                canvasView.addSubview(self.stickerLayerView)
                
                let widthScreen = (self.frame.size.width - 40)/2
                deleteView.frame =  CGRect.init(x: widthScreen, y: 20, width: 40, height: 40)
                self.SetUpTrashIcon()

            }
            
            
        }else if (IsPhotoConvertVideoMode == false && IsPhotoMode == false){
            
            canvasView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            stickerLayerView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            imageView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            imageView.contentMode = .scaleAspectFill
            imageView.isHidden = true
            
            videoPlayerView.frame = self.frame
            self.insertSubview(videoPlayerView, belowSubview: canvasView)
            
            

            if let videoUrl = VideoSingleton.sharedInstance.originalVideoUrl{
                let vidFrame = AVMakeRect(aspectRatio: self.getVideoSize(videoURL: videoUrl), insideRect: self.frame)
                self.stickerLayerView.frame = CGRect.init(x: 0, y: vidFrame.origin.y, width: vidFrame.size.width, height: vidFrame.size.height)
                self.bringSubviewToFront(stickerLayerView)
                
                self.looper = PlayerLooper.init(videoURL: videoUrl, loopCount: -1)
                self.looper?.start(in: self.videoPlayerView.layer)
                
                let widthScreen = (self.frame.size.width - 40)/2
                deleteView.frame =  CGRect.init(x: widthScreen, y: 20, width: 40, height: 40)
                self.SetUpTrashIcon()
            }else{
                print("NIL HANDLE ERROR LOG:- Func:SetUpLayout VideoSingleton.sharedInstance.originalVideoUrl of videoArray is nil...")
            }

            
        }else{
            canvasView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            stickerLayerView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            imageView.frame = CGRect(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
            imageView.contentMode = .scaleAspectFill
            imageView.isHidden = true

            
            if let videoUrl = VideoSingleton.sharedInstance.originalVideoUrl{
                let imageSize:CGSize =   imageView.image!.resizeEnd(withSize: self.frame.size, contentMode: .contentAspectFit)!
                let vidFrame = AVMakeRect(aspectRatio: self.getVideoSize(videoURL: videoUrl), insideRect: self.frame)
                self.stickerLayerView.frame = CGRect.init(x: 0, y: vidFrame.origin.y , width: imageSize.width, height: imageSize.height)
                self.bringSubviewToFront(stickerLayerView)
              
             videoPlayerView.frame = self.frame
             self.insertSubview(videoPlayerView, belowSubview: canvasView)

              

                self.looper = PlayerLooper.init(videoURL: videoUrl, loopCount: -1)
                self.looper?.start(in: self.videoPlayerView.layer)
                
                 let widthScreen = (self.frame.size.width - 40)/2
                 deleteView.frame =  CGRect.init(x: widthScreen, y: 20, width: 40, height: 40)
                 self.SetUpTrashIcon()

            }else{
                print("NIL HANDLE ERROR LOG:- Func:SetUpLayout VideoSingleton.sharedInstance.originalVideoUrl of videoArray is nil...")
            }
        
        }
    }
    
    func imageWithImage(image:UIImage ,scaledToSize newSize:CGSize)-> UIImage
        {
            UIGraphicsBeginImageContext( newSize )
            image.draw(in: CGRect(x: 0, y: 0, width: newSize.width, height: newSize.height))
            let newImage : UIImage = UIGraphicsGetImageFromCurrentImageContext()!;
            UIGraphicsEndImageContext();
            return newImage
        }
    
    
    
  
    private func SetUpTrashIcon() {
           customView.frame = CGRect(x: 0, y: 0, width: 40, height: 40)
           customView.center = self.deleteView.center
           let stringTrash = self.trashString.flatMap{URL.init(string: $0)}
           if let strTrashNotNil = stringTrash {
               let dataTrash = try? Data(contentsOf:strTrashNotNil)
               trashImage.contentMode = .scaleAspectFit
                if let trashImg = dataTrash {
                    trashImage.image = UIImage(data: trashImg)
                }
           }
           trashImage.frame = CGRect(x: 0 , y: 0, width: 40, height: 40)
           trashImage.center = self.customView.center
           trashImage.isHidden = true
           deleteView.addSubview(customView)
           self.addSubview(trashImage)
       }

    
    public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        if newWindow == nil {

        }else{

        }
    }
    

        @objc public func GetTrashImage(_ TrashString: String) {
              self.trashString = TrashString
        }
    
    
    
    @objc public func copyPhotoEmitor(completionHandler: @escaping (_ param: NSDictionary) -> Void){
        backgroundPhotoEmitorCompletionHandler = completionHandler
    }
    
    var _kbSize:CGSize!
    var currentTextFont: String = ""
    var textAlignString: String = "center"

    /*  UIKeyboardWillShowNotification. */
    @objc internal func keyboardWillShow(_ notification : Notification?) -> Void {
        
        
        if let info = notification?.userInfo {
            
            let frameEndUserInfoKey = UIResponder.keyboardFrameEndUserInfoKey
            
            //  Getting UIKeyboardSize.
            if let kbFrame = info[frameEndUserInfoKey] as? CGRect {
                
                let screenSize = UIScreen.main.bounds
                
                //Calculating actual keyboard displayed size, keyboard frame may be different when hardware keyboard is attached (Bug ID: #469) (Bug ID: #381)
                let intersectRect = kbFrame.intersection(screenSize)
                
                if intersectRect.isNull {
                    _kbSize = CGSize(width: screenSize.size.width, height: 0)
                } else {
                    _kbSize = intersectRect.size
                }
                
                let response:NSDictionary = ["action" : "keyboardWillShow","data":["keyboardHeight":_kbSize.height]]
                backgroundPhotoEmitorCompletionHandler!(response)
            }
        }
    }
    
    @objc internal func keyboardWillHide(_ notification : Notification?) -> Void {
        let response:NSDictionary = ["action" : "keyboardWillHide","data":["keyboardHeight":0]]
        backgroundPhotoEmitorCompletionHandler!(response)
    }
    
    
    @objc public func updateVideoLayer(){
        let vidFrame = AVMakeRect(aspectRatio: self.getVideoSize(videoURL: URL.init(string: self.videoUrlPath! as String)!), insideRect: self.frame)
        self.stickerLayerView.frame = CGRect.init(x: 0, y: vidFrame.origin.y, width: vidFrame.size.width, height: vidFrame.size.height)
    }
    
    @objc public func imageZoomCrop(imageUrl: URL){
        var imageView : UIImage
        
    }
    
    
    
    @objc public  func stopPlay(){
        self.looper?.stop()
    }
    
    
    // MARK: STICKER PROCESS
    func getData(from url: URL, completion: @escaping (Data?, URLResponse?, Error?) -> ()) {
        URLSession.shared.dataTask(with: url, completionHandler: completion).resume()
    }
    
    @objc public func addNewSticker(stickerUrl:NSString, completionHandler: @escaping (_ param: NSDictionary) -> Void){
        var stickers: String;
        let strPrivate = unsafeBitCast(stickerUrl, to: NSStringPrivate.self)
        if((strPrivate._containsEmoji() as Bool) == true ){
            let urlWithEmoji = stickerUrl
            let allowedCharacters = CharacterSet.urlPathAllowed.union(.urlHostAllowed)
            let urlWithEmojiEscaped = urlWithEmoji.addingPercentEncoding(withAllowedCharacters: allowedCharacters)
           stickers = urlWithEmojiEscaped!
        }else{
            stickers = stickerUrl as String
        }

        if let url = URL(string: stickers){
        if stickerUrl.contains(".gif"){
            if (IsPhotoMode == true && IsPhotoConvertVideoMode == false){
                imageView.isHidden = true
                var settings = RenderSettings()
                settings.size  = imageView.image!.resizeEnd(withSize: UIScreen.main.bounds.size, contentMode: .contentAspectFill)!
                let imageAnimator = ImageAnimator(renderSettings: settings)
                imageAnimator.images = [imageView.image!,imageView.image!,imageView.image!,imageView.image!,imageView.image!,imageView.image!,imageView.image!]
                
                imageAnimator.render() {
                    print("yes")
                    self.videoUrlPath = settings.outputURL.absoluteString
                    self.IsPhotoConvertVideoMode = true
                    let response:NSDictionary = ["path" : self.videoUrlPath as Any]
                    completionHandler(response);
                    self.addImageView(img: url, isGif: true)
                }
            }else{
                self.addImageView(img: url, isGif: true)
            }
            
        }else{
            self.addImageView(img: url, isGif: false)
        }
        }
    }
  
    
    func encode(_ s: String) -> String {
        let data = s.data(using: .nonLossyASCII, allowLossyConversion: true)!
        return String(data: data, encoding: .utf8)!
    }

    func decode(_ s: String) -> String? {
        let data = s.data(using: .utf8)!
        return String(data: data, encoding: .nonLossyASCII)
    }
    
    func getVideoSize (videoURL: URL) -> CGSize{
        let asset = AVURLAsset(url: videoURL as URL)
        let composition = AVMutableComposition.init()
        composition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: kCMPersistentTrackID_Invalid)
        let clipVideoTrack = asset.tracks(withMediaType: AVMediaType.video)[0]
        
        // Rotate to potrait
        let transformer = AVMutableVideoCompositionLayerInstruction(assetTrack: clipVideoTrack)
        let videoTransform:CGAffineTransform = clipVideoTrack.preferredTransform
        
        
        
        //fix orientation
        var videoAssetOrientation_  = UIImage.Orientation.up
        
        var isVideoAssetPortrait_  = false
        
        if videoTransform.a == 0 && videoTransform.b == 1.0 && videoTransform.c == -1.0 && videoTransform.d == 0 {
            videoAssetOrientation_ = UIImage.Orientation.right
            isVideoAssetPortrait_ = true
        }
        if videoTransform.a == 0 && videoTransform.b == -1.0 && videoTransform.c == 1.0 && videoTransform.d == 0 {
            videoAssetOrientation_ =  UIImage.Orientation.left
            isVideoAssetPortrait_ = true
        }
        if videoTransform.a == 1.0 && videoTransform.b == 0 && videoTransform.c == 0 && videoTransform.d == 1.0 {
            videoAssetOrientation_ =  UIImage.Orientation.up
        }
        if videoTransform.a == -1.0 && videoTransform.b == 0 && videoTransform.c == 0 && videoTransform.d == -1.0 {
            videoAssetOrientation_ = UIImage.Orientation.down;
        }
        
        transformer.setTransform(clipVideoTrack.preferredTransform, at: CMTime.zero)
        transformer.setOpacity(0.0, at: asset.duration)
        
        //adjust the render size if neccessary
        var naturalSize: CGSize
        if(isVideoAssetPortrait_){
            naturalSize = CGSize(width: clipVideoTrack.naturalSize.height, height: clipVideoTrack.naturalSize.width)
        } else {
            naturalSize = clipVideoTrack.naturalSize;
        }
        
        return naturalSize
    }
    
    
    public func addImageView(img:URL, isGif: Bool){
        let imageView = CustomImageView.init(frame: CGRect.init(x: screenWidth, y: screenHeight, width: 100, height: 100))
        imageView.downloadImageFrom(url: img, isGif: isGif)
        imageView.contentMode = .scaleAspectFit
        imageView.backgroundColor = .clear
        self.textCursorMove = false
        imageView.center = CGPoint(x: screenWidth, y: (screenHeight))
        if isGif == true{
            self.stickerLayerView.addSubview(imageView)
            imageView.tag = imageTag
            imageTag = imageTag + 1
            self.addGestures(view: imageView, IsRotationEnable: true)
        }else{
            self.stickerLayerView.addSubview(imageView)
            self.addGestures(view: imageView, IsRotationEnable: true)
        }
    }
    
    @objc public  func mediaMetadataExtract(Local: Bool, completionHandler: @escaping (_ param: NSDictionary) -> Void) {
            let outputURL = VideoSingleton.sharedInstance.originalVideoUrl

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
        }
    

    @objc public  func mediaSave(Local: Bool, completionHandler: @escaping (_ param: NSDictionary) -> Void) {
        if (IsPhotoMode == true && IsPhotoConvertVideoMode == false){
            if(Local == false){
                let image = canvasView.toImage()
                StickerController.getPhotoDetailsFromUrl(imgUrl: (CustomImageView.saveImageToDocumentDirectory(image, gifData: nil) as NSString) as String, completionHandler: {(data) -> Void in
                    completionHandler(data)
                })
            }else{
                let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
                UIImageWriteToSavedPhotosAlbum(canvasView.toImage(),self, nil, nil)
                if var topController = keyWindow?.rootViewController {
                    while let presentedViewController = topController.presentedViewController {
                        topController = presentedViewController
                    }
                    var alert = UIAlertController(title: "", message: "Image Saved Successfully", preferredStyle: UIAlertController.Style.alert)
                    alert.addAction(UIAlertAction(title: "Ok", style: UIAlertAction.Style.default, handler: nil))
                    topController.present(alert, animated: true, completion: nil)
                }
            }
        }else{
            let documentsDirectory = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
            let myDocumentPath = URL(fileURLWithPath: documentsDirectory).appendingPathComponent("temp.mp4").absoluteString
            _ = NSURL(fileURLWithPath: myDocumentPath)
            let documentsDirectory2 = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0] as URL
            var filePath = documentsDirectory2.appendingPathComponent("video.mp4")

            //Check if the file already exists then remove the previous file
            if FileManager.default.fileExists(atPath: myDocumentPath) {
                do { try FileManager.default.removeItem(atPath: myDocumentPath)
                } catch let error { print(error) }
            }
            
            // File to composit
            if let path_video = videoUrlPath as String? {
                if let path_video_url = VideoSingleton.sharedInstance.originalVideoUrl {

                    let asset = AVURLAsset.init(url: path_video_url)
                                     
                    deleteFile(filePath: filePath as NSURL)
                    
                        let composition = AVMutableComposition.init()
                        composition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: kCMPersistentTrackID_Invalid)
                        let clipVideoTrack = asset.tracks(withMediaType: AVMediaType.video)[0]
                        
                        // Rotate to potrait
                        let transformer = AVMutableVideoCompositionLayerInstruction(assetTrack: clipVideoTrack)
                        let videoTransform:CGAffineTransform = clipVideoTrack.preferredTransform
                        
                        
                        //fix orientation
                        var videoAssetOrientation_  = UIImage.Orientation.up
                        
                        var isVideoAssetPortrait_  = false
                        
                        if videoTransform.a == 0 && videoTransform.b == 1.0 && videoTransform.c == -1.0 && videoTransform.d == 0 {
                            videoAssetOrientation_ = UIImage.Orientation.right
                            isVideoAssetPortrait_ = true
                        }
                        if videoTransform.a == 0 && videoTransform.b == -1.0 && videoTransform.c == 1.0 && videoTransform.d == 0 {
                            videoAssetOrientation_ =  UIImage.Orientation.left
                            isVideoAssetPortrait_ = true
                        }
                        if videoTransform.a == 1.0 && videoTransform.b == 0 && videoTransform.c == 0 && videoTransform.d == 1.0 {
                            videoAssetOrientation_ =  UIImage.Orientation.up
                        }
                        if videoTransform.a == -1.0 && videoTransform.b == 0 && videoTransform.c == 0 && videoTransform.d == -1.0 {
                            videoAssetOrientation_ = UIImage.Orientation.down;
                        }
                        
                        
                        transformer.setTransform(clipVideoTrack.preferredTransform, at: CMTime.zero)
                        transformer.setOpacity(0.0, at: asset.duration)
                        
                        
                        
                        
                        //adjust the render size if neccessary
                        var naturalSize: CGSize
                        if(isVideoAssetPortrait_){
                            naturalSize = CGSize(width: clipVideoTrack.naturalSize.height, height: clipVideoTrack.naturalSize.width)
                        } else {
                            naturalSize = clipVideoTrack.naturalSize;
                        }
                        
                        
                        
                        
                        var renderWidth: CGFloat!
                        var renderHeight: CGFloat!
                        
                        renderWidth = naturalSize.width
                        renderHeight = naturalSize.height
                        
                        let parentlayer = CALayer()
                        let videoLayer = CALayer()
                        let watermarkLayer = CALayer()
                        
                        let videoComposition = AVMutableVideoComposition()
                        videoComposition.renderSize = CGSize(width: renderWidth, height: renderHeight)
                        videoComposition.frameDuration = CMTimeMake(value: 1, timescale: 30)
                        videoComposition.renderScale = 1.0
                        
                        
                        parentlayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                        videoLayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                        parentlayer.addSublayer(videoLayer)
                        
                        for view in self.stickerLayerView.subviews {
                            if let tf = view as? CustomImageView {
                                if tf.tag > 999{
                                    let imgView:CustomImageView = self.viewWithTag(tf.tag) as! CustomImageView
                                    let gifLayer = CALayer()
                                    
                                    let nsDocumentDirectory = FileManager.SearchPathDirectory.documentDirectory
                                    let nsUserDomainMask    = FileManager.SearchPathDomainMask.userDomainMask
                                    let paths               = NSSearchPathForDirectoriesInDomains(nsDocumentDirectory, nsUserDomainMask, true)
                                    if let dirPath = paths.first{
                                        if let gifName:String = imgView.imageName as String?{
                                            if let gifUrl = NSURL(fileURLWithPath: dirPath).appendingPathComponent("\(gifName).gif") {
                                                            print(gifUrl as Any)
                                                                                                    let animation: CAKeyframeAnimation? = animationForGif(with: gifUrl.absoluteString as String?)
                                                                                                    if let animation = animation {
                                                                                                        gifLayer.add(animation, forKey: "contents")
                                                                                                    }
                                            }else{
                                                print("NIL HANDLE ERROR LOG:- Func:mediaSaveLocal Gif path is nil...")
                                                break
                                            }
                                        }else{
                                            print("NIL HANDLE ERROR LOG:- Func:mediaSaveLocal CustomImageView's imageName is nil...")
                                            break
                                        }
                                        }else{
                                            print("NIL HANDLE ERROR LOG:- Func:mediaSaveLocal documentDirectory path is nil...")
                                            break
                                        }
                                    
                                    imgView.isHidden = true
                                    
                                    let aspectRatio = naturalSize
                                    let vidFrame = AVMakeRect(aspectRatio: aspectRatio, insideRect: self.stickerLayerView.frame)
                                    let aspectWidth: CGFloat =   naturalSize.width / self.frame.size.width
                                    let aspectHeight: CGFloat =   naturalSize.height / vidFrame.height

                                    var yaxis:CGFloat = 0.0
                                    yaxis = vidFrame.size.height - (imgView.frame.origin.y + imgView.frame.size.height)
                                    let oldFrame:CGRect =  CGRect(
                                        x:  ((imgView.frame.origin.x) * aspectWidth),
                                        y: (yaxis) * aspectWidth,
                                        width: imgView.frame.size.width * aspectWidth,
                                        height: imgView.frame.size.height * aspectHeight)

                                    gifLayer.frame = oldFrame
                                    let angle0 = imgView.transform.angleInDegrees
                                    let scaleX0 = imgView.transform.scaleX
                                    let scaleY0 = imgView.transform.scaleY
                                    let adjustedSize0 = CGSize(width: view.bounds.size.width * scaleX0, height: view.bounds.size.height * scaleY0)


                                    let radians = atan2(imgView.transform.b, imgView.transform.a)
                                    var transform = imgView.layer.transform
                                    transform = CATransform3DMakeRotation( 6.283 - radians, 0.0, 0.0, 1.0)
                                    gifLayer.transform = CATransform3DScale(transform, adjustedSize0.width/imgView.frame.size.width, adjustedSize0.height/imgView.frame.size.height, 1)
                                    gifLayer.masksToBounds = true
                                    gifLayer.contentsGravity = .resizeAspect
                                    parentlayer.addSublayer(gifLayer)
                                }
                            }
                        }
                        
                        
                        
                        if (imageTag > 1000){
                            if (IsPhotoMode == true){
                                watermarkLayer.contents = canvasView.asImage().cgImage
                                watermarkLayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                                parentlayer.addSublayer(watermarkLayer)
                            }else if (IsPhotoConvertVideoMode == false && IsPhotoMode == false){
                                watermarkLayer.contents = stickerLayerView.asImage().cgImage
                                watermarkLayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                                parentlayer.addSublayer(watermarkLayer)
                            }else{
                                watermarkLayer.contents = stickerLayerView.asImage().cgImage
                                watermarkLayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                                parentlayer.addSublayer(watermarkLayer)
                            }
                        }else{
                            if (IsPhotoMode == false){
                                watermarkLayer.contents = stickerLayerView.asImage().cgImage
                                watermarkLayer.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: naturalSize)
                                parentlayer.addSublayer(watermarkLayer)
                            }
                        }
                        
                        
                        
                        
                        for view in self.stickerLayerView.subviews {
                            if let tf = view as? CustomImageView {
                                if tf.tag > 999{
                                    let imgView:CustomImageView = self.viewWithTag(tf.tag) as! CustomImageView
                                    imgView.isHidden = false
                                }
                            }
                        }
                        
                        
                        // Add watermark to video
                        videoComposition.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayers: [videoLayer], in: parentlayer)
                        
                        let instruction = AVMutableVideoCompositionInstruction()
                        instruction.timeRange = CMTimeRangeMake(start: CMTime.zero, duration: CMTimeMakeWithSeconds(60, preferredTimescale: 30))
                        
                        
                        instruction.layerInstructions = [transformer]
                        videoComposition.instructions = [instruction]
                        
                        let exporter = AVAssetExportSession.init(asset: asset, presetName: AVAssetExportPresetHighestQuality)
                        exporter?.outputFileType = AVFileType.mov
                        exporter?.outputURL = filePath
                        exporter?.videoComposition = videoComposition
                        
                        exporter!.exportAsynchronously(completionHandler: {() -> Void in
                            if exporter?.status == .completed {
                                let outputURL: URL? = exporter?.outputURL
                                if(Local == false){
                                    self.videoPlayUrl = outputURL
                                    VideoSingleton.sharedInstance.temVideoUrl = outputURL
                                    self.videoSave(completionHandler: { (data) -> Void in
                                        completionHandler(data)
                                    })
                                }else{
                                    PHPhotoLibrary.shared().performChanges({
                                        PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: outputURL!)
                                    }) { saved, error in
                                        if saved {
                                            let fetchOptions = PHFetchOptions()
                                            fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
                                            let fetchResult = PHAsset.fetchAssets(with: .video, options: fetchOptions).lastObject
                                            PHImageManager().requestAVAsset(forVideo: fetchResult!, options: nil, resultHandler: { (avurlAsset, audioMix, dict) in
                                                let newObj = avurlAsset as! AVURLAsset
                                                print(newObj.url)
                                                DispatchQueue.main.async(execute: {
                                                    print(newObj.url.absoluteString)
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
                                                    
                                                    if var topController = keyWindow?.rootViewController {
                                                        while let presentedViewController = topController.presentedViewController {
                                                            topController = presentedViewController
                                                        }
                                                        
                                                        var alert = UIAlertController(title: "", message: "Video Saved Successfully", preferredStyle: UIAlertController.Style.alert)
                                                        alert.addAction(UIAlertAction(title: "Ok", style: UIAlertAction.Style.default, handler: nil))
                                                        topController.present(alert, animated: true, completion: nil)
                                                        
                                                        
                                                    }
                                                })
                                            })
                                            print (fetchResult!)
                                        }
                                    }
                                }
                            }
                        })
                }
            }
        }
    }
    

    
    
    
     @objc public func videoSave(completionHandler: @escaping (_ param: NSDictionary) -> Void){
         var outputURL:URL?
         
        if (VideoSingleton.sharedInstance.temVideoUrl == nil){
            outputURL = VideoSingleton.sharedInstance.originalVideoUrl
        }else{
            outputURL = videoPlayUrl
        }

        
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
    }
    
    // MARK: TEXT PROCESS
    
    @objc public  func addNewText(){
        let textView = UITextView(frame: CGRect(x: textPositionx, y: textPositiony,
                                                width: (UIScreen.main.bounds.width - 30), height: 30));
        currentTextView = textView;
        textView.textAlignment = .center
        textView.font = UIFont(name: "Verdana-Bold", size: 30)
        textView.textColor = textColor
        textView.layer.shadowColor = UIColor.clear.cgColor
        textView.layer.shadowOpacity = 0.0
        textView.backgroundColor = UIColor.white.withAlphaComponent(0.0)
        textView.layer.shadowRadius = 0.0
        textView.layer.backgroundColor = UIColor.clear.cgColor
        textView.autocorrectionType = .no
        textView.isScrollEnabled = false
        textView.isSelectable = true
        textView.delegate = self
        self.stickerLayerView.addSubview(textView)
        self.addGestures(view: textView,IsRotationEnable: true)
        textView.becomeFirstResponder()
    }
    
    
    @objc public func mutePlayer(isflag : Bool, isMusic: Bool, completionHandler: @escaping (_ param: Bool) -> Void){
        if(isflag == true){
            self.looper?.mute(flag: true)
            if(!isMusic){
                self.looper?.stop()
            }
        }else{
            self.looper?.mute(flag: true)
            if let videoUrl = VideoSingleton.sharedInstance.originalVideoUrl{
                self.looper = PlayerLooper.init(videoURL: videoUrl, loopCount: -1)
                self.looper?.start(in: self.videoPlayerView.layer)
                self.looper?.mute(flag: false)
            }else{
                print("NIL HANDLE ERROR LOG:- Func:mutePlayer VideoSingleton.sharedInstance.originalVideoUrl of videoArray is nil...")
            }
        }
        completionHandler(true)
    }

    // MARK:-  Updating the text font alignemnt value which is inside the UITextView.
      @objc public  func updateNewAlign(alignemnt:NSString){
        activeTextView?.textAlignment = NSTextAlignment(rawValue: alignmentRawValue.index(of: alignemnt)!)!
      }
    
    @objc public  func updateNew(font:NSString){
        let textFont = UIFont(name: font as String, size: 30.0)!
        activeTextView?.font = textFont
        activeTextView?.frame.origin.y = 50.0
        activeTextView?.frame.size.width = UIScreen.main.bounds.width-30
        textViewDidChange(activeTextView!)

    }
    
    @objc public  func updateNew(color:NSString){
           let colorStr: String = color as String
           let textColor:UIColor = UIColor().hexStringToUIColor(hex: colorStr )
           activeTextView?.textColor = textColor
        
       }

    @objc public  func updateNew(BackgroundColor:NSString,isTransparent:Bool){
           let colorStr: String = BackgroundColor as String
           let textBgColor:UIColor = UIColor().hexStringToUIColor(hex: colorStr )
           activeTextView?.backgroundColor = (isTransparent) ? UIColor.clear : textBgColor
           activeTextView?.layer.cornerRadius = 5
           activeTextView?.textColor = isTransparent ? textBgColor : (BackgroundColor == "#FFFFFF" || BackgroundColor == "#FFFFFF85") ? UIColor.black : UIColor.white
       }
    
    
    @objc public  func closeText(){
        self.endEditing(true)
        self.stickerLayerView.isUserInteractionEnabled = true
    }
    
    func addGestures(view: UIView, IsRotationEnable:Bool) {
        //Gestures
        view.isUserInteractionEnabled = true
        
        let panGesture = UIPanGestureRecognizer(target: self,
                                                action: #selector(LPPhotoEditor.panGesture))
        panGesture.minimumNumberOfTouches = 1
        panGesture.maximumNumberOfTouches = 1
        panGesture.delegate = self
        view.addGestureRecognizer(panGesture)
        
        let pinchGesture = UIPinchGestureRecognizer(target: self,
                                                    action: #selector(LPPhotoEditor.pinchGesture))
        pinchGesture.delegate = self
        view.addGestureRecognizer(pinchGesture)
        
        
        if IsRotationEnable {
            let rotationGestureRecognizer = UIRotationGestureRecognizer(target: self,
                                                                        action:#selector(LPPhotoEditor.rotationGesture) )
            rotationGestureRecognizer.delegate = self
            view.addGestureRecognizer(rotationGestureRecognizer)
        }
        
        if view is UIImageView {
            let tapGesture = UITapGestureRecognizer(target: self, action: #selector(LPPhotoEditor.tapGesture))
            view.addGestureRecognizer(tapGesture)
        }
        
    }
    
    func deleteFile(filePath:NSURL) {
        guard FileManager.default.fileExists(atPath: filePath.path!) else {
            return
        }
        
        do { try FileManager.default.removeItem(atPath: filePath.path!)
        } catch { fatalError("Unable to delete file: \(error)") }
    }
    
    func animationForGif(with url: String?) -> CAKeyframeAnimation? {
        //        let path = (Bundle.main.path(forResource: "mobile", ofType:"gif") ?? nil)!
        //        let gifUrl:URL = URL.init(fileURLWithPath: path)
        let gifUrl:URL = URL.init(string: url!)!
        let animation = CAKeyframeAnimation(keyPath: "contents")
        
        var frames = [CGImage]()
        var delayTimes = [NSNumber]()
        
        var totalTime: Float = 0.0
        //        var gifWidth: Float
        //        var gifHeight: Floatr
        let gifSource = CGImageSourceCreateWithURL(gifUrl as CFURL, nil)
        // get frame count
        let frameCount = CGImageSourceGetCount(gifSource!)
        for i in 0..<frameCount {
            // get each frame
            let frame = CGImageSourceCreateImageAtIndex(gifSource!, i, nil)
            if let frame = frame {
                
                frames.append(frame)
            }
            
            // get gif info with each frame
            var dict = CGImageSourceCopyPropertiesAtIndex(gifSource!, i, nil) as? [CFString: AnyObject]
            
            // get gif size
            //        gifWidth = (dict?[kCGImagePropertyPixelWidth] as? NSNumber)?.floatValue ?? 0.0
            //        gifHeight = (dict?[kCGImagePropertyPixelHeight] as? NSNumber)?.floatValue ?? 0.0
            let gifDict = dict?[kCGImagePropertyGIFDictionary]
            if let value = gifDict?[kCGImagePropertyGIFDelayTime] as? NSNumber {
                delayTimes.append(value)
            }
            
            totalTime = totalTime + (((gifDict?[kCGImagePropertyGIFDelayTime] as? NSNumber)?.floatValue)!)
            
        }
        
        var times = [AnyHashable](repeating: 0, count: 3)
        var currentTime: Float = 0
        let count: Int = delayTimes.count
        for i in 0..<count {
            times.append(NSNumber(value: Float((currentTime / totalTime))))
            currentTime += Float(delayTimes[i])
        }
        
        var images = [AnyHashable](repeating: 0, count: 3)
        for i in 0..<count {
            images.append(frames[i])
        }
        
        animation.keyTimes = times as? [NSNumber]
        animation.values = images
        animation.timingFunction = CAMediaTimingFunction(name: .linear)
        animation.duration = CFTimeInterval(totalTime)
        animation.repeatCount = Float.infinity
        animation.beginTime = AVCoreAnimationBeginTimeAtZero
        animation.isRemovedOnCompletion = false
        
        return animation
        
    }
    
    //Translation is moving object
    
    @objc func panGesture(_ recognizer: UIPanGestureRecognizer) {
        if let view = recognizer.view {
            if view is UIImageView {
                //Tap only on visible parts on the image
                if recognizer.state == .began {
                    for tempImageView in subImageViews(view: stickerLayerView) {
                        let location = recognizer.location(in: tempImageView)
                        let alpha = tempImageView.alphaAtPoint(location)
                        if alpha > 0 {
                            imageViewToPan = tempImageView
                            break
                        }
                    }
                }
                if imageViewToPan != nil {
                    moveView(view: imageViewToPan!, recognizer: recognizer)
                }
            } else {
                moveView(view: view, recognizer: recognizer)
            }
        }
    }
    
    @objc func pinchGesture(_ recognizer: UIPinchGestureRecognizer) {
        if let view = recognizer.view {
          
                       // init
                       if recognizer.state == .began {
                           lastScale = 1.0;
                           lastPinchPoint = recognizer.location(in: view)
                       }

                       // judge valid
                       if recognizer.numberOfTouches < 2 {
                           lastPinchPoint = recognizer.location(in: view)
                           return
                       }

                       // Scale
                       let scale = 1.0 - (lastScale - recognizer.scale);
                       view.transform = view.transform.scaledBy(x: scale, y: scale)
                       lastScale = recognizer.scale;

                       // Translate
                       let point = recognizer.location(in: view)
                       view.transform = view.transform.translatedBy(x: point.x - lastPinchPoint.x, y: point.y - lastPinchPoint.y)
                       lastPinchPoint = recognizer.location(in: view)
            if(view is UITextView){
                self.lastTextViewTransform = view.transform
                self.lastTextViewTransCenter = view.center
            }
        
    }
    }
    
    @objc func rotationGesture(_ recognizer: UIRotationGestureRecognizer) {
        if let view = recognizer.view {
            view.transform = view.transform.rotated(by: recognizer.rotation)
            recognizer.rotation = 0
            if(view is UITextView){
                self.lastTextViewTransform = view.transform
                self.lastTextViewTransCenter = view.center
            }
        }
    }
    
    @objc func tapGesture(_ recognizer: UITapGestureRecognizer) {
        if let view = recognizer.view {
            if view is UIImageView {
                //Tap only on visible parts on the image
                for tempImageView in subImageViews(view: stickerLayerView) {
                    let location = recognizer.location(in: tempImageView)
                    let alpha = tempImageView.alphaAtPoint(location)
                    if alpha > 0 {
                        scaleEffect(view: tempImageView)
                        break
                    }
                }
            }
        }
    }
    
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
    }
    
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return false
    }
    
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return false
    }
    
    @objc func screenEdgeSwiped(_ recognizer: UIScreenEdgePanGestureRecognizer) {
        if recognizer.state == .recognized {
            if !bottomSheetIsVisible {
                
            }
        }
    }
    
    
    @objc func scaleEffect(view: UIView) {
        view.superview?.bringSubviewToFront(view)
        
        if #available(iOS 10.0, *) {
            let generator = UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred()
        }
        let previouTransform =  view.transform
        UIView.animate(withDuration: 0.2,
                       animations: {
                        view.transform = view.transform.scaledBy(x: 1.2, y: 1.2)
                       },
                       completion: { _ in
                        UIView.animate(withDuration: 0.2) {
                            view.transform  = previouTransform
                        }
                       })
    }
    
    func moveView(view: UIView, recognizer: UIPanGestureRecognizer)  {
        if self.textCursorMove == false{
        deleteView.isHidden = false
        trashImage.isHidden = false

        view.superview?.bringSubviewToFront(view)
        let pointToSuperView = recognizer.location(in: self)
        //
        view.center = CGPoint(x: view.center.x + recognizer.translation(in: stickerLayerView).x,
                              y: view.center.y + recognizer.translation(in: stickerLayerView).y)
        
        //        let point = recognizer.location(in: tempImageView)
        //        view.center = point
        
        recognizer.setTranslation(CGPoint.zero, in: stickerLayerView)

        
        if(view is UITextView){
            self.lastTextViewTransform = view.transform
            self.lastTextViewTransCenter = view.center
        }

        if let previousPoint = lastPanPoint {
            //View is going into deleteView
            if deleteView.frame.contains(pointToSuperView) && !deleteView.frame.contains(previousPoint) {
                if #available(iOS 10.0, *) {
                    let generator = UIImpactFeedbackGenerator(style: .heavy)
                    generator.impactOccurred()
                }
                UIView.animate(withDuration: 0.3, animations: {
                    view.transform = view.transform.scaledBy(x: 0.25, y: 0.25)
                    view.center = recognizer.location(in: self.stickerLayerView)
                })
            }
            //View is going out of deleteView
            else if deleteView.frame.contains(previousPoint) && !deleteView.frame.contains(pointToSuperView) {
                //Scale to original Size
                UIView.animate(withDuration: 0.3, animations: {
                    view.transform = view.transform.scaledBy(x: 4, y: 4)
                    view.center = recognizer.location(in: self.stickerLayerView)
                })
            }
        }
        lastPanPoint = pointToSuperView
        
        if recognizer.state == .ended {
            imageViewToPan = nil
            lastPanPoint = nil
            deleteView.isHidden = true
            trashImage.isHidden = true

            let point = recognizer.location(in: self)
            
            if deleteView.frame.contains(point) { // Delete the view
                view.removeFromSuperview()
                if #available(iOS 10.0, *) {
                    let generator = UINotificationFeedbackGenerator()
                    generator.notificationOccurred(.success)
                }
            } else if !stickerLayerView.bounds.contains(view.center) { //Snap the view back to tempimageview
                UIView.animate(withDuration: 0.3, animations: {
                    view.center = self.stickerLayerView.center
                })
                
            }
        }
     }
    }
    
    @objc func subImageViews(view: UIView) -> [UIImageView] {
        var imageviews: [UIImageView] = []
        for tempImageView in view.subviews {
            if tempImageView is UIImageView {
                imageviews.append(tempImageView as! UIImageView)
            }
        }
        return imageviews
    }
    
    @objc public class func lockOrientation(orientation: String) {
        var deviceOrientation = UIInterfaceOrientation.portrait.rawValue
        if(orientation == "portrait"){
            DeviceSingleton.sharedInstance().UpdateDeviceOrienation(orientation: UIInterfaceOrientation.portrait)
        }else if(orientation == "landscape"){
            print(UIApplication.shared.statusBarOrientation)
            if UIDevice.current.orientation == UIDeviceOrientation.landscapeLeft{
                print("LANDSCAPE LEFT >>>>>>>>>>>>>")
                DeviceSingleton.sharedInstance().UpdateDeviceOrienation(orientation: UIInterfaceOrientation.landscapeRight)
            }else if UIDevice.current.orientation == UIDeviceOrientation.landscapeRight{
                print("LANDSCAPE RIGHT >>>>>>>>>>>>>")
                DeviceSingleton.sharedInstance().UpdateDeviceOrienation(orientation: UIInterfaceOrientation.landscapeLeft)
            }else if UIDevice.current.orientation == UIDeviceOrientation.portrait {
                DeviceSingleton.sharedInstance().UpdateDeviceOrienation(orientation: UIInterfaceOrientation.landscapeRight)
            }
        }
        UIDevice.current.setValue(deviceOrientation, forKey: "orientation")
    }

    @objc public class func UnlockBlockedOrientation() {
        DeviceSingleton.sharedInstance().UpdateDeviceOrienation(orientation: UIInterfaceOrientation.unknown)
        DeviceSingleton.sharedInstance().BlockOrienation(IsLock: false)
    }
}


import UIKit


extension String{
   var encodeEmoji: String? {
        let encodedStr = NSString(cString: self.cString(using: String.Encoding.nonLossyASCII)!, encoding: String.Encoding.utf8.rawValue)
        return encodedStr as? String
    }
    
    var decodeEmoji: String {
        let data = self.data(using: String.Encoding.utf8, allowLossyConversion: false)
        if data != nil {
            let valueUniCode = NSString(data: data!, encoding: String.Encoding.nonLossyASCII.rawValue) as? String
            if valueUniCode != nil {
                return valueUniCode!
            } else {
                return self
            }
        } else {
            return self
        }
    }
}

extension UIView {
    
    // Using a function since `var image` might conflict with an existing variable
    // (like on `UIImageView`)
    func asImage() -> UIImage {
        let renderer = UIGraphicsImageRenderer(bounds: bounds)
        return renderer.image { rendererContext in
            layer.render(in: rendererContext.cgContext)
        }
    }
    
    
    func toImage() -> UIImage {
        UIGraphicsBeginImageContextWithOptions(self.bounds.size, self.isOpaque, 0.0)
        self.drawHierarchy(in: self.bounds, afterScreenUpdates: false)
        let snapshotImageFromMyView = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return snapshotImageFromMyView!
    }
    
    
    
    @objc func toImageView() -> UIImageView {
        let tempImageView = UIImageView()
        tempImageView.image = toImage()
        tempImageView.frame = frame
        tempImageView.contentMode = .scaleAspectFit
        return tempImageView
    }
    
    
    
    
}

@objc protocol NSStringPrivate {
    func _containsEmoji() -> Bool
}

//extension LPPhotoEditor : UIGestureRecognizerDelegate  {
//    //Translation is moving object
//
//}



import Foundation
import UIKit

extension UIImageView {
    
    func alphaAtPoint(_ point: CGPoint) -> CGFloat {
        
        var pixel: [UInt8] = [0, 0, 0, 0]
        let colorSpace = CGColorSpaceCreateDeviceRGB();
        let alphaInfo = CGImageAlphaInfo.premultipliedLast.rawValue
        
        guard let context = CGContext(data: &pixel, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4, space: colorSpace, bitmapInfo: alphaInfo) else {
            return 0
        }
        
        context.translateBy(x: -point.x, y: -point.y);
        
        layer.render(in: context)
        
        let floatAlpha = CGFloat(pixel[3])
        
        return floatAlpha
    }
    
}


extension UIImageView {
    
    var imageSizeAfterAspectFit: CGSize {
        var newWidth: CGFloat
        var newHeight: CGFloat
        
        guard let image = image else { return frame.size }
        
        if image.size.height >= image.size.width {
            newHeight = frame.size.height
            newWidth = ((image.size.width / (image.size.height)) * newHeight)
            
            if CGFloat(newWidth) > (frame.size.width) {
                let diff = (frame.size.width) - newWidth
                newHeight = newHeight + CGFloat(diff) / newHeight * newHeight
                newWidth = frame.size.width
            }
        } else {
            newWidth = frame.size.width
            newHeight = (image.size.height / image.size.width) * newWidth
            
            if newHeight > frame.size.height {
                let diff = Float((frame.size.height) - newHeight)
                newWidth = newWidth + CGFloat(diff) / newWidth * newWidth
                newHeight = frame.size.height
            }
        }
        return .init(width: newWidth, height: newHeight)
    }
}


extension UIColor {
    
    convenience init(hex: String, alpha: CGFloat = 1.0) {
        var hexFormatted: String = hex.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).uppercased()

        if hexFormatted.hasPrefix("#") {
            hexFormatted = String(hexFormatted.dropFirst())
        }

        assert(hexFormatted.count == 6, "Invalid hex code used.")

        var rgbValue: UInt64 = 0
        Scanner(string: hexFormatted).scanHexInt64(&rgbValue)

        self.init(red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
                  green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
                  blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
                  alpha: alpha)
    }
    
    func toHexString() -> String {
        var r:CGFloat = 0
        var g:CGFloat = 0
        var b:CGFloat = 0
        var a:CGFloat = 0
        getRed(&r, green: &g, blue: &b, alpha: &a)
        let rgb:Int = (Int)(r*255)<<16 | (Int)(g*255)<<8 | (Int)(b*255)<<0
        return String(format:"#%06x", rgb)
    }
}

extension LPPhotoEditor: UITextViewDelegate {
    public func textViewDidChange(_ textView: UITextView) {
        let rotation = atan2(textView.transform.b, textView.transform.a)
        //        if rotation == 0 {
        //            let oldFrame = textView.frame
        //            let sizeToFit = textView.sizeThatFits(CGSize(width: oldFrame.width, height:CGFloat.greatestFiniteMagnitude))
        //            textView.frame.size = CGSize(width: oldFrame.width, height: sizeToFit.height)
        //        }
        
        if(textView.frame.size.width < (self.stickerLayerView.frame.size.width - 30)){
            let oldFrame = textView.frame
            let sizeToFit = textView.sizeThatFits(CGSize(width: CGFloat.greatestFiniteMagnitude, height:oldFrame.height))
            textView.frame.size = sizeToFit
            textView.frame = CGRect.init(x: (((self.stickerLayerView.frame.size.width) - textView.frame.size.width)/2), y: 50.0, width:UIScreen.main.bounds.width-30, height: textView.frame.size.height)
                //CGRect.init(x: (((self.stickerLayerView.frame.size.width) - textView.frame.size.width)/2), y: textView.frame.origin.y, width: textView.frame.size.width, height: textView.frame.size.height)
        }else{
            let oldFrame = textView.frame
            let sizeToFit = textView.sizeThatFits(CGSize(width: oldFrame.width, height:CGFloat.greatestFiniteMagnitude))
            textView.frame.size = sizeToFit
            textView.frame = CGRect.init(x:textView.frame.origin.x , y: 50.0 , width: UIScreen.main.bounds.width-30, height: textView.frame.size.height)
                //CGRect.init(x:textView.frame.origin.x , y: (((self.stickerLayerView.frame.size.height) - textView.frame.size.height)/2) , width: textView.frame.size.width, height: textView.frame.size.height)
        }
    }
    // MARK:---> Moving the cursor to another letter
      @objc func textWordTapped(_ recognizer: UITapGestureRecognizer) {
        
          let textView: UITextView = recognizer.view as! UITextView
          let layoutManager: NSLayoutManager = textView.layoutManager
          var location: CGPoint = recognizer.location(in: textView)
          location.x -= textView.textContainerInset.left
          location.y -= textView.textContainerInset.top

          var charIndex: Int
          charIndex = layoutManager.characterIndex(for: location, in: textView.textContainer, fractionOfDistanceBetweenInsertionPoints: nil)

          if charIndex < textView.textStorage.length {
              // cursor at the selected letter on the position
              if let newPosition = textView.position(from: textView.beginningOfDocument, offset: charIndex) {
                if self.textCursorMove == true{
                  textView.selectedTextRange = textView.textRange(from: newPosition, to: newPosition)
                 }
              }
          }
      }
    
    public func textViewDidBeginEditing(_ textView: UITextView) {
        self.textCursorMove = true
        lastTextViewTransform =  textView.transform
        lastTextViewTransCenter = textView.center
        //        lastTextViewFont = textView.font!
        activeTextView = textView
//        if let recognizers = textView.gestureRecognizers {
//            for recognizer in recognizers {
//                textView.removeGestureRecognizer(recognizer as! UIGestureRecognizer)
//            }
//        }
        let tap = UITapGestureRecognizer(target: self, action: #selector(textWordTapped(_:)))
              textView.isUserInteractionEnabled = true
              textView.addGestureRecognizer(tap)

        textView.superview?.bringSubviewToFront(textView)
        UIView.animate(withDuration: 0.3,
                       animations: {
                        textView.transform = CGAffineTransform.identity
                        textView.center = CGPoint(x: UIScreen.main.bounds.width / 2, y: 100)
                       }, completion: nil)
        let font = self.activeTextView?.font?.fontName
              self.currentTextFont = String(font!)
        let tempColor = activeTextView?.backgroundColor == UIColor.clear ? activeTextView?.textColor : activeTextView?.backgroundColor
            // UIColor -> Hex String
        let colorBlueHex = tempColor!.toHexString().uppercased()
        
             // TextAlignment value update to React-Native
        let alignValue = activeTextView?.textAlignment.rawValue
        self.updateAlignValue(alignRawValue: alignValue!)
        let response:NSDictionary = ["action" : "FontAction","dataFont":["fontValue":self.currentTextFont, "fontColor":colorBlueHex,"textAlign":textAlignString]]
                     backgroundPhotoEmitorCompletionHandler!(response)
    }
  

    // MARK:-  Updating the Text align value which is inside the UITextView.
      public func updateAlignValue(alignRawValue:Int){
        let alignmentStrings: [String] = ["left", "center", "right"]
        self.textAlignString = alignmentStrings[alignRawValue]
      }

    
    public func textViewDidEndEditing(_ textView: UITextView) {
        //        guard lastTextViewTransform != nil && lastTextViewTransCenter != nil && lastTextViewFont != nil
        //        else {
        //            return
        //        }
        self.textCursorMove = false
        DispatchQueue.main.async {
            textView.transform = self.lastTextViewTransform!
            textView.center = self.lastTextViewTransCenter!
        }
        
        activeTextView = nil
        
//                textView.font = self.lastTextViewFont!
        //        UIView.animate(withDuration: 0.3,
        //                       animations: {
        //                        textView.transform = self.lastTextViewTransform!
        //                        textView.center = self.lastTextViewTransCenter!
        //                       }, completion: nil)
    }
}

class CustomTextView: UITextView {
    
    var imageURLString: String?
    
}

class CustomImageView: UIImageView {
    
    // MARK: - Constants
    
    // MARK: - Properties
    
    var imageURLString: String?
    var localImgPath:NSString?
    var imageName:NSString?
    
    //    func downloadImageFrom(urlString: String) {
    //        guard let url = URL(string: urlString) else { return }
    //        if urlString.contains(".gif"){
    //            downloadImageFrom(url: url, isGif: true)
    //        }else{
    //            downloadImageFrom(url: url, isGif: false)
    //        }
    //    }
    
    func downloadImageFrom(url: URL, isGif: Bool) {
        let defaults = UserDefaults.standard
        if let cachedImage = defaults.value(forKey: url.absoluteString)  {
            self.imageName =   cachedImage as? NSString
            do {
                //                let imgData = Data(referencing: testImage as NSData)
                
                let nsDocumentDirectory = FileManager.SearchPathDirectory.documentDirectory
                let nsUserDomainMask    = FileManager.SearchPathDomainMask.userDomainMask
                let paths               = NSSearchPathForDirectoriesInDomains(nsDocumentDirectory, nsUserDomainMask, true)
                
                
                if (isGif == true){
                    if let dirPath = paths.first{
                        let myString: String = imageName! as String
                        let gifUrl = URL(fileURLWithPath: dirPath).appendingPathComponent("\(myString).gif")
                        print(gifUrl)
                        let testImage = try Data(contentsOf: URL.init(fileURLWithPath: gifUrl.path))
                        self.image = UIImage.animatedImage(withData: testImage)
                    }
                }else{
                    if let dirPath          = paths.first{
                        let myString: String = imageName! as String
                        let imageURL = URL(fileURLWithPath: dirPath).appendingPathComponent("\(myString).png")
                        print(imageURL)
                        self.image = UIImage(contentsOfFile: imageURL.path)!
                    }
                }
            } catch  {
                print("Not me error")
            }
        } else {
            URLSession.shared.dataTask(with: url) { data, response, error in
                guard let data = data, error == nil else { return }
                DispatchQueue.main.async {
                    let imageToCache = UIImage(data: data)
                    if (isGif == true){
                        self.image = UIImage.animatedImage(withData: data)
                        self.imageName =   CustomImageView.saveImageToDocumentDirectoryFileName(nil, gifData: data as NSData) as NSString
                        defaults.setValue(self.imageName, forKey: url.absoluteString)
                    }else{
                        self.image = imageToCache
                        self.imageName =   CustomImageView.saveImageToDocumentDirectoryFileName(imageToCache!, gifData: nil) as NSString
                        defaults.setValue(self.imageName, forKey: url.absoluteString)
                    }
                }
            }.resume()
        }
    }
    
    
    
    class public  func saveImageToDocumentDirectoryFileName(_ chosenImage: UIImage?, gifData:NSData?) -> String {
        let directoryPath =  NSHomeDirectory().appending("/Documents/")
        if !FileManager.default.fileExists(atPath: directoryPath) {
            do {
                try FileManager.default.createDirectory(at: NSURL.fileURL(withPath: directoryPath), withIntermediateDirectories: true, attributes: nil)
            } catch {
                print(error)
            }
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyyMMddhhmmss"
        
        let filenameOnly = (gifData == nil ? dateFormatter.string(from: Date()) : dateFormatter.string(from: Date()))
        
        let filename = (gifData == nil ? dateFormatter.string(from: Date()).appending(".png") : dateFormatter.string(from: Date()).appending(".gif"))
        
        let filepath = directoryPath.appending(filename)
        let url = NSURL.fileURL(withPath: filepath)
        do {
            
            if (gifData == nil){
                try chosenImage?.pngData()!.write(to: url)
            }else{
                try gifData!.write(to: url, atomically: true)
            }
            
            return filenameOnly
            
        } catch {
            print(error)
            print("file cant not be save at path \(filepath), with error : \(error)");
            return filenameOnly
        }
    }
    
    class public  func saveImageToDocumentDirectory(_ chosenImage: UIImage?, gifData:NSData?) -> String {
        let directoryPath =  NSHomeDirectory().appending("/Documents/")
        if !FileManager.default.fileExists(atPath: directoryPath) {
            do {
                try FileManager.default.createDirectory(at: NSURL.fileURL(withPath: directoryPath), withIntermediateDirectories: true, attributes: nil)
            } catch {
                print(error)
            }
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyyMMddhhmmss"
        
        let filename = (gifData == nil ? dateFormatter.string(from: Date()).appending(".png") : dateFormatter.string(from: Date()).appending(".gif"))
        
        let filepath = directoryPath.appending(filename)
        let url = NSURL.fileURL(withPath: filepath)
        do {
            
            if (gifData == nil){
                try chosenImage!.jpegData(compressionQuality: 1.0)?.write(to: url, options: .atomic)
            }else{
                try gifData!.write(to: url, atomically: true)
            }
            
            return url.absoluteString
            
        } catch {
            print(error)
            print("file cant not be save at path \(filepath), with error : \(error)");
            return filepath
        }
    }
}






@available(iOS 11.0, *)
struct RenderSettings {
    
    var size : CGSize = .zero
    var fps: Int32 = 6   // frames per second
    var avCodecKey = AVVideoCodecType.h264
    var videoFilename = "render"
    var videoFilenameExt = "mp4"
    
    var outputURL: URL {
        // Use the CachesDirectory so the rendered video file sticks around as long as we need it to.
        // Using the CachesDirectory ensures the file won't be included in a backup of the app.
        let fileManager = FileManager.default
        let path:URL = URL(fileURLWithPath: NSTemporaryDirectory(),isDirectory: true).appendingPathComponent(videoFilename).appendingPathExtension(videoFilenameExt)
        return path
//        if let tmpDirURL = try? fileManager.url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true) {
//            return tmpDirURL.appendingPathComponent(videoFilename).appendingPathExtension(videoFilenameExt)
//        }
        fatalError("URLForDirectory() failed")
    }
    
}

class ImageAnimator {
    
    // Apple suggests a timescale of 600 because it's a multiple of standard video rates 24, 25, 30, 60 fps etc.
    static var kTimescale: Int32 = 600
    
    let settings: RenderSettings
    let videoWriter: VideoWriter
    var images: [UIImage]!
    static var durationSeconds = 0.0
    var frameNum = 0
//    var frameNum = 3
    
    class func saveToLibrary(videoURL: URL) {
        let asset = AVURLAsset(url: videoURL as URL)
        self.durationSeconds = AVURLAsset(url: videoURL).duration.seconds
        if(self.durationSeconds<15){
            PHPhotoLibrary.requestAuthorization { status in
                guard status == .authorized else { return }
                
                PHPhotoLibrary.shared().performChanges({
                    PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: videoURL)
                }) { success, error in
                    if !success {
                        print("Could not save video to photo library:", error)
                    }
                }
            }
        }
      
    }
    
    class func removeFileAtURL(fileURL: URL) {
        do {
            try FileManager.default.removeItem(atPath: fileURL.path)
        }
        catch _ as NSError {
            // Assume file doesn't exist.
        }
    }
    
    init(renderSettings: RenderSettings) {
        settings = renderSettings
        videoWriter = VideoWriter(renderSettings: settings)
        //        images = [img, img,img, img,img, img,img, img,img, img]
    }
    
    func render(completion: (()->Void)?) {
        
        // The VideoWriter will fail if a file exists at the URL, so clear it out first.
        ImageAnimator.removeFileAtURL(fileURL: settings.outputURL)
        
        videoWriter.start()
        videoWriter.render(appendPixelBuffers: appendPixelBuffers) {
            //ImageAnimator.saveToLibrary(videoURL: self.settings.outputURL)
            let videoSingletonObj : VideoSingleton = VideoSingleton.sharedInstance
            videoSingletonObj.originalVideoUrl = self.settings.outputURL;
//            videoSingletonObj.temVideoUrl = self.settings.outputURL;
            completion?()
        }
    }
    
    // This is the callback function for VideoWriter.render()
    func appendPixelBuffers(writer: VideoWriter) -> Bool {
//        let frameDuration = CMTimeMake(value: Int64(ImageAnimator.kTimescale / settings.fps), timescale: ImageAnimator.kTimescale)
        var frameDuration = CMTimeMake(value: Int64(ImageAnimator.kTimescale / settings.fps), timescale: ImageAnimator.kTimescale)

        if(ImageAnimator.durationSeconds<15){
            ImageAnimator.kTimescale = 15000;
            frameDuration = CMTimeMake(value: Int64(ImageAnimator.kTimescale/1), timescale: ImageAnimator.kTimescale/2)
        }

        while !images.isEmpty {
            
            if writer.isReadyForData == false {
                // Inform writer we have more buffers to write.
                return false
            }
            
            let image = images.removeFirst()
            let presentationTime = CMTimeMultiply(frameDuration, multiplier: Int32(frameNum))
            let success = videoWriter.addImage(image: image, withPresentationTime: presentationTime)
            if success == false {
                fatalError("addImage() failed")
            }
            
            frameNum += 1
        }
        
        // Inform writer all buffers have been written.
        return true
    }
    
}
@available(iOS 11.0, *)
class VideoWriter {
    
    let renderSettings: RenderSettings
    
    var videoWriter: AVAssetWriter!
    var videoWriterInput: AVAssetWriterInput!
    var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    var isReadyForData: Bool {
        return videoWriterInput?.isReadyForMoreMediaData ?? false
    }
    
    class func pixelBufferFromImage(image: UIImage, pixelBufferPool: CVPixelBufferPool, size: CGSize) -> CVPixelBuffer {
        
        var pixelBufferOut: CVPixelBuffer?
        
        let status = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, pixelBufferPool, &pixelBufferOut)
        if status != kCVReturnSuccess {
            fatalError("CVPixelBufferPoolCreatePixelBuffer() failed")
        }
        
        let pixelBuffer = pixelBufferOut!
        
        CVPixelBufferLockBaseAddress(pixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
        
        let data = CVPixelBufferGetBaseAddress(pixelBuffer)
        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(data: data, width: Int(size.width), height: Int(size.height),
                                bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)
        
        context!.clear(CGRect(x:0,y: 0,width: size.width,height: size.height))
        
        let horizontalRatio = size.width / image.size.width
        let verticalRatio = size.height / image.size.height
        //aspectRatio = max(horizontalRatio, verticalRatio) // ScaleAspectFill
        let aspectRatio = min(horizontalRatio, verticalRatio) // ScaleAspectFit
        
        let newSize = CGSize(width: image.size.width * aspectRatio, height: image.size.height * aspectRatio)
        
        let x = newSize.width < size.width ? (size.width - newSize.width) / 2 : 0
        let y = newSize.height < size.height ? (size.height - newSize.height) / 2 : 0
        
        context?.draw(image.cgImage!, in: CGRect(x:x,y: y, width: newSize.width, height: newSize.height))
        CVPixelBufferUnlockBaseAddress(pixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
        
        return pixelBuffer
    }
    
    @available(iOS 11.0, *)
    init(renderSettings: RenderSettings) {
        self.renderSettings = renderSettings
    }
    
    func start() {
        
        let avOutputSettings: [String: Any] = [
            AVVideoCodecKey: renderSettings.avCodecKey,
            AVVideoWidthKey: NSNumber(value: Float(renderSettings.size.width)),
            AVVideoHeightKey: NSNumber(value: Float(renderSettings.size.height))
        ]
        
        func createPixelBufferAdaptor() {
            let sourcePixelBufferAttributesDictionary = [
                kCVPixelBufferPixelFormatTypeKey as String: NSNumber(value: kCVPixelFormatType_32ARGB),
                kCVPixelBufferWidthKey as String: NSNumber(value: Float(renderSettings.size.width)),
                kCVPixelBufferHeightKey as String: NSNumber(value: Float(renderSettings.size.height))
            ]
            pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: videoWriterInput,
                                                                      sourcePixelBufferAttributes: sourcePixelBufferAttributesDictionary)
        }
        
        func createAssetWriter(outputURL: URL) -> AVAssetWriter {
            guard let assetWriter = try? AVAssetWriter(outputURL: outputURL, fileType: AVFileType.mp4) else {
                fatalError("AVAssetWriter() failed")
            }
            
            guard assetWriter.canApply(outputSettings: avOutputSettings, forMediaType: AVMediaType.video) else {
                fatalError("canApplyOutputSettings() failed")
            }
            
            return assetWriter
        }
        
        videoWriter = createAssetWriter(outputURL: renderSettings.outputURL)
        videoWriterInput = AVAssetWriterInput(mediaType: AVMediaType.video, outputSettings: avOutputSettings)
        
        if videoWriter.canAdd(videoWriterInput) {
            videoWriter.add(videoWriterInput)
        }
        else {
            fatalError("canAddInput() returned false")
        }
        
        // The pixel buffer adaptor must be created before we start writing.
        createPixelBufferAdaptor()
        if videoWriter.startWriting() == false {
            fatalError("startWriting() failed")
        }
        
        videoWriter.startSession(atSourceTime: CMTime.zero)
        
        precondition(pixelBufferAdaptor.pixelBufferPool != nil, "nil pixelBufferPool")
    }
    
    func render(appendPixelBuffers: ((VideoWriter)->Bool)?, completion: (()->Void)?) {
        
        precondition(videoWriter != nil, "Call start() to initialze the writer")
        
        let queue = DispatchQueue(label: "mediaInputQueue")
        videoWriterInput.requestMediaDataWhenReady(on: queue) {
            let isFinished = appendPixelBuffers?(self) ?? false
            if isFinished {
                self.videoWriterInput.markAsFinished()
                self.videoWriter.finishWriting() {
                    DispatchQueue.main.async {
                        completion?()
                    }
                }
            }
            else {
                // Fall through. The closure will be called again when the writer is ready.
            }
        }
    }
    
    func addImage(image: UIImage, withPresentationTime presentationTime: CMTime) -> Bool {
        
        precondition(pixelBufferAdaptor != nil, "Call start() to initialze the writer")
        
        let pixelBuffer = VideoWriter.pixelBufferFromImage(image: image, pixelBufferPool: pixelBufferAdaptor.pixelBufferPool!, size: renderSettings.size)
        return pixelBufferAdaptor.append(pixelBuffer, withPresentationTime: presentationTime)
    }
    
}


extension UIImage{

    func imageRotated(by radian: CGFloat) -> UIImage{
        let rotatedSize = CGRect(origin: .zero, size: size)
            .applying(CGAffineTransform(rotationAngle: radian))
            .integral.size
        UIGraphicsBeginImageContext(rotatedSize)
        if let context = UIGraphicsGetCurrentContext() {
            let origin = CGPoint(x: rotatedSize.width / 2.0,
                                 y: rotatedSize.height / 2.0)
            context.translateBy(x: origin.x, y: origin.y)
            context.rotate(by: radian)
            draw(in: CGRect(x: -origin.y, y: -origin.x,
                            width: size.width, height: size.height))
            let rotatedImage = UIGraphicsGetImageFromCurrentImageContext()
            UIGraphicsEndImageContext()

            return rotatedImage ?? self
        }

        return self

    }
}


extension CGAffineTransform {
    var angle: CGFloat { return atan2(-self.c, self.a) }

    var angleInDegrees: CGFloat { return self.angle * 180 / .pi }

    var scaleX: CGFloat {
        let angle = self.angle
        return self.a * cos(angle) - self.c * sin(angle)
    }

    var scaleY: CGFloat {
        let angle = self.angle
        return self.d * cos(angle) + self.b * sin(angle)
    }
}


extension UIImage {
    var uncompressedPNGData: Data      { return self.pngData()!        }
    var highestQualityJPEGNSData: Data { return self.jpegData(compressionQuality: 1.0)!  }
    var highQualityJPEGNSData: Data    { return self.jpegData(compressionQuality: 0.75)! }
    var mediumQualityJPEGNSData: Data  { return self.jpegData(compressionQuality: 0.5)!  }
    var lowQualityJPEGNSData: Data     { return self.jpegData(compressionQuality: 0.25)! }
    var lowestQualityJPEGNSData:Data   { return self.jpegData(compressionQuality: 0.0)!  }
    
    func cropToRect(rect: CGRect) -> UIImage? {
        var scale = rect.width / self.size.width
        scale = self.size.height * scale < rect.height ? rect.height/self.size.height : scale

        let croppedImsize = CGSize(width:rect.width/scale, height:rect.height/scale)
        let croppedImrect = CGRect(origin: CGPoint(x: (self.size.width-croppedImsize.width)/2.0,
                                                   y: (self.size.height-croppedImsize.height)/2.0),
                                                   size: croppedImsize)
        UIGraphicsBeginImageContextWithOptions(croppedImsize, true, 0)
        self.draw(at: CGPoint(x:-croppedImrect.origin.x, y:-croppedImrect.origin.y))
        let croppedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return croppedImage
    }
    
    func resizeWithPercent(percentage: CGFloat) -> UIImage? {
            let imageView = UIImageView(frame: CGRect(origin: .zero, size: CGSize(width: size.width * percentage, height: size.height * percentage)))
            imageView.contentMode = .scaleAspectFit
            imageView.image = self
            UIGraphicsBeginImageContextWithOptions(imageView.bounds.size, false, scale)
            guard let context = UIGraphicsGetCurrentContext() else { return nil }
            imageView.layer.render(in: context)
            guard let result = UIGraphicsGetImageFromCurrentImageContext() else { return nil }
            UIGraphicsEndImageContext()
            return result
        }
}

