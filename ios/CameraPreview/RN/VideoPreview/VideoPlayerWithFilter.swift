//
//  VideoPlayerWithFilter.swift
//  react-native-litpic-camera-module
//
//  Created by Suresh kumar on 25/04/20.
//

import UIKit
import VideoToolbox

@available(iOS 10.0, *)
@objc public class VideoPlayerWithFilter: UIView {
    public var videoPreviewLayer:VideoPreview?
    @objc public var videoUrl:String?
    @objc public var filter:NSDictionary?
    @objc public var IsImageView:ObjCBool = false
    var imagePixelBuffer:CVPixelBuffer?
    var imageView:UIImageView?
    /*
     // Only override draw() if you perform custom drawing.
     // An empty implementation adversely affects performance during animation.
     override func draw(_ rect: CGRect) {
     // Drawing code
     }
     */


    deinit {
        self.videoPreviewLayer = nil
        self.imagePixelBuffer = nil
    }
    
    @objc public override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    @objc public init(videoUrl:String) {
        self.videoUrl = videoUrl
        super.init(frame: .zero)
    }
    
    @objc public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    public override func layoutSubviews() {
        self.videoPreviewLayer?.removeFromSuperview()
        if (self.videoUrl != nil){
            nibSetup()
        }
    }
    
    public override func willMove(toWindow newWindow: UIWindow?) {
        super.willMove(toWindow: newWindow)
        if newWindow == nil {
            self.videoPreviewLayer?.player?.pause()
            self.videoPreviewLayer?.stop()
            self.videoPreviewLayer = nil
        } else {
            // UIView appear
        }
    }
    
    
    public func deallocObj(){
        self.videoPreviewLayer?.player?.pause()
        self.videoPreviewLayer?.stopTemp()
    }
    
    public func updateUrl(){
            let temVideoUrl = self.videoUrl.flatMap{ URL.init(string: $0)}
            self.videoPreviewLayer?.urlString = temVideoUrl
            self.videoPreviewLayer?.updateVideo()
    }
    
    func nibSetup(){
        let fileManager = FileManager.default
        if let video_url = self.videoUrl {
            if fileManager.fileExists(atPath: video_url){
                print("contains image >>>>>>>")
            }else{
                print("No Image")
            }
        }
        let temVideoUrl = self.videoUrl.flatMap{ URL.init(string: $0)}

        if (IsImageView.boolValue == true){
            self.videoPreviewLayer = VideoPreview.init(frame: self.bounds)
            self.videoPreviewLayer?.IsVideoMode = false
            if let tem_videoUrl = temVideoUrl {
                self.videoPreviewLayer?.initWithUrl(urlStr: tem_videoUrl)
                //            self.addSubview(self.videoPreviewLayer!)
                self.videoPreviewLayer?.frame = self.bounds
                
                imageView = UIImageView.init(frame: self.bounds)
                imageView?.backgroundColor = .black
                //imageView?.contentMode = .scaleAspectFit
                imageView?.contentMode = .scaleAspectFill
                
                let data = try? Data(contentsOf: tem_videoUrl)
                    imageView!.image = UIImage(data: data!)
                    imagePixelBuffer = buffered(from: (imageView?.image)!)
                    self.addSubview(imageView!)
            }
        }else{
            self.videoPreviewLayer = VideoPreview.init(frame: self.bounds)
            self.addSubview(self.videoPreviewLayer!)
            self.videoPreviewLayer?.frame = self.bounds
            if let tem_videoUrl = temVideoUrl {
                self.videoPreviewLayer?.initWithUrl(urlStr: tem_videoUrl)
            }
        }
        self.applyLiveFilter()
    }
    
    
    func buffered(from image: UIImage) -> CVPixelBuffer? {
        let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue, kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue,
            ] as CFDictionary
        var pixelBuffer : CVPixelBuffer?
        let status = CVPixelBufferCreate(kCFAllocatorDefault, Int(image.size.width), Int(image.size.height), kCVPixelFormatType_32ARGB, [
            String(kCVPixelBufferIOSurfacePropertiesKey): [
                "IOSurfaceOpenGLESFBOCompatibility": true,
                "IOSurfaceOpenGLESTextureCompatibility": true,
                "IOSurfaceCoreAnimationCompatibility": true,
            ]
            ] as CFDictionary, &pixelBuffer)
        guard (status == kCVReturnSuccess) else {
            return nil
        }
                
        CVPixelBufferLockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
        let pixelData = CVPixelBufferGetBaseAddress(pixelBuffer!)
        
        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(data: pixelData, width: Int(image.size.width), height: Int(image.size.height), bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer!), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
        
        context?.translateBy(x: 0, y: image.size.height)
        context?.scaleBy(x: 1.0, y: -1.0)
        
        UIGraphicsPushContext(context!)
        image.draw(in: CGRect(x: 0, y: 0, width: image.size.width, height: image.size.height))
        UIGraphicsPopContext()
        CVPixelBufferUnlockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
        return pixelBuffer
    }
    
    @objc public func saveImage(completionHandler: @escaping (_ param: NSDictionary) -> Void){
            if #available(iOS 11.0, *) {
                let saveImg:LPCamera = LPCamera()
                let imgUrl:URL =   saveImg.saveImage(image: (imageView?.image)!)!
                
                var IsPortrait:Bool = false
                
                if CGFloat( (imageView?.image?.size.width)! ) > CGFloat( (imageView?.image?.size.height)!) {
                    IsPortrait = false
                }else{
                   IsPortrait = true
                }
                
    //            responseData: this.state.imageDetails,
    //            imagePath: this.state.videoPath,
    //            orientationLockValue: this.state.imageDetails.width > this.state.imageDetails.height
                let imageInfo:[String:Any] = ["imagePath": imgUrl.absoluteString, "IsPortrait" : IsPortrait]
                let response:NSDictionary = imageInfo as NSDictionary;
                completionHandler(response)
            } else {
                // Fallback on earlier versions
            }    }
    
    @objc public func applyLiveFilter(){
        DispatchQueue.main.async {
            self.videoPreviewLayer?.setFilter(filterValues: self.filter!)
            if self.IsImageView.boolValue == true{
                if((self.imagePixelBuffer) != nil){
                    
                    let temVideoUrl = self.videoUrl.flatMap{ URL.init(string: $0)}
                    if let tem_videoUrl = temVideoUrl {
                        let data = try? Data(contentsOf: tem_videoUrl)
                        
                        if let img = (UIImage(data: data!))?.fixOrientation(){
                            let pixelBuffer = self.buffered(from: img)
                            self.videoPreviewLayer?.metalLayer = self.videoPreviewLayer?.liveFilter?.applyFilterVideo(pixelBuffer!)
                            let originalimage = UIImage(ciImage: CIImage(cvPixelBuffer: (self.videoPreviewLayer?.liveFilter?.pixelBuffer)!))
                            
                            
                            let compresedImage:UIImage = LightCompressors.compressImage(originalimage, compressRatio: 1.0, maxCompressRatio: 1.0)!

                            self.imageView?.image = originalimage.resizeWithPercent(percentage:0.80)
                            
                            if self.imageView?.image?.size.width ?? 0 < self.imageView?.image?.size.height ?? 0{
                                self.imageView?.contentMode = .scaleAspectFill
                                //self.imageView?.contentMode = .scaleAspectFit
                            }else{
                                //self.imageView?.contentMode = .scaleAspectFit
                                self.imageView?.contentMode = .scaleAspectFill
                            }
                        }
                    }
                }
            }else{
                
            }
        }
    }
    
}




extension UIImage{
     func fixOrientation() -> UIImage? {

        guard let cgImage = self.cgImage else {
            return nil
        }

        if self.imageOrientation == UIImage.Orientation.up {
            return self
        }

        let width  = self.size.width
        let height = self.size.height

        var transform = CGAffineTransform.identity

        switch self.imageOrientation {
        case .down, .downMirrored:
            transform = transform.translatedBy(x: width, y: height)
            transform = transform.rotated(by: CGFloat.pi)

        case .left, .leftMirrored:
            transform = transform.translatedBy(x: width, y: 0)
            transform = transform.rotated(by: 0.5*CGFloat.pi)

        case .right, .rightMirrored:
            transform = transform.translatedBy(x: 0, y: height)
            transform = transform.rotated(by: -0.5*CGFloat.pi)

        case .up, .upMirrored:
            break
        }

        switch self.imageOrientation {
        case .upMirrored, .downMirrored:
            transform = transform.translatedBy(x: width, y: 0)
            transform = transform.scaledBy(x: -1, y: 1)

        case .leftMirrored, .rightMirrored:
            transform = transform.translatedBy(x: height, y: 0)
            transform = transform.scaledBy(x: -1, y: 1)

        default:
            break;
        }

        // Now we draw the underlying CGImage into a new context, applying the transform
        // calculated above.
        guard let colorSpace = cgImage.colorSpace else {
            return nil
        }

        guard let context = CGContext(
            data: nil,
            width: Int(width),
            height: Int(height),
            bitsPerComponent: cgImage.bitsPerComponent,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: UInt32(cgImage.bitmapInfo.rawValue)
            ) else {
                return nil
        }

        context.concatenate(transform);

        switch self.imageOrientation {

        case .left, .leftMirrored, .right, .rightMirrored:
            // Grr...
            context.draw(cgImage, in: CGRect(x: 0, y: 0, width: height, height: width))

        default:
            context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        }

        // And now we just create a new UIImage from the drawing context
        guard let newCGImg = context.makeImage() else {
            return nil
        }

        let img = UIImage(cgImage: newCGImg)
        return img;
    }


}
