//
//  LiveFilterController.swift
//  litpic
//
//  Created by vignesh waran on 26/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//
import Foundation
import AVFoundation
import CoreVideo
import Accelerate
import VideoToolbox



@available(iOS 10.0, *)
//@objc (LiveFilterController)
@objc public class LiveFilterController : NSObject {
  
  var IsPreview:Bool = false
  private var videoFilterOn: Bool = false
  private var filterName:NSString?
  
  public var videoFilter: FilterRenderer!
  private var depthVisualizationEnabled = false
  private let videoDepthMixer = VideoMixer()
  private var currentDepthPixelBuffer: CVPixelBuffer?
  private var previewView: PreviewMetalView?
  private let filterRenderers: [FilterRenderer] = [CommonCIFilter(), BlurMetalRenderer()]
  private let dataOutputQueue = DispatchQueue(label: "VideoDataQueue", qos: .userInitiated, attributes: [], autoreleaseFrequency: .workItem)
  private var filterInd: Int = 0
  
  private var cameraIdentifier = 2
  
  var orienationLocked:Bool = false
  var prevFilterValues:NSDictionary = [:]
  var lastDeviceOrientation:UIDeviceOrientation?

  public var filterOrientation:UIInterfaceOrientation?
  @objc public var pixelBuffer: CVPixelBuffer?
  @objc public var mixedCMSampleBuffer: CMSampleBuffer?

  public var videoOrienation:UIInterfaceOrientation?
  
  @objc public var IsOrientationLock:Bool = false

  
  //var appDelegate:AppDelegate?
    
    

  
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
  
  @objc public func setFilter(filterValues: NSDictionary ) -> Void {
    
    prevFilterValues = filterValues
    
    let filterType:String = filterValues.value(forKey: "type") as! String
    
    if filterType == "BLUR" {
      self.ApplyBlurFilter(filterValues: filterValues, filterType: filterType)
    } else {
      self.ApplyOtherFilter(filterValues: filterValues, filterType: filterType)
    }
  }
    
    @objc public func setFilterConvert(filterDic:NSDictionary){
        let keyObj:NSDictionary = filterDic.value(forKey:"key0") as! NSDictionary
        let filterValue:NSDictionary = keyObj.value(forKey: "filter") as! NSDictionary
//        if(self.currentFilter != filterValue){
            self.setFilter(filterValues: filterValue)
//        }else{
//
//        }

    }
    
     deinit {
        
    }
    
      
   public func getFilterObj()->FilterRenderer{
        return self.videoFilter
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
    if(self.videoFilter == nil || self.videoFilter.description != filterType){
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
  
  @objc public func updateCamera(cameraId:NSInteger) {
    print("CAMERA====",cameraId)
    self.cameraIdentifier = cameraId
    if(self.videoFilter != nil){
      self.videoFilter.reset()
//      self.previewView!.cameraId = cameraId
      self.setFilter(filterValues: self.prevFilterValues)
    }
  }
  
  
 @objc public func rotate90PixelBuffer(_ srcPixelBuffer: CVPixelBuffer, factor: UInt8) -> CVPixelBuffer? {
    let flags = CVPixelBufferLockFlags(rawValue: 0)
    guard kCVReturnSuccess == CVPixelBufferLockBaseAddress(srcPixelBuffer, flags) else {
      return nil
    }
    defer { CVPixelBufferUnlockBaseAddress(srcPixelBuffer, flags) }

    guard let srcData = CVPixelBufferGetBaseAddress(srcPixelBuffer) else {
      print("Error: could not get pixel buffer base address")
      return nil
    }
    let sourceWidth = CVPixelBufferGetWidth(srcPixelBuffer)
    let sourceHeight = CVPixelBufferGetHeight(srcPixelBuffer)
    var destWidth = sourceHeight
    var destHeight = sourceWidth
    var color = UInt8(0)

    if factor % 2 == 0 {
      destWidth = sourceWidth
      destHeight = sourceHeight
    }

    let srcBytesPerRow = CVPixelBufferGetBytesPerRow(srcPixelBuffer)
    var srcBuffer = vImage_Buffer(data: srcData,
                                  height: vImagePixelCount(sourceHeight),
                                  width: vImagePixelCount(sourceWidth),
                                  rowBytes: srcBytesPerRow)

    let destBytesPerRow = destWidth*4
    guard let destData = malloc(destHeight*destBytesPerRow) else {
      print("Error: out of memory")
      return nil
    }
    var destBuffer = vImage_Buffer(data: destData,
                                   height: vImagePixelCount(destHeight),
                                   width: vImagePixelCount(destWidth),
                                   rowBytes: destBytesPerRow)

    let error = vImageRotate90_ARGB8888(&srcBuffer, &destBuffer, factor, &color, vImage_Flags(0))
    
    if error != kvImageNoError {
      print("Error:", error)
      free(destData)
      return nil
    }

    let releaseCallback: CVPixelBufferReleaseBytesCallback = { _, ptr in
      if let ptr = ptr {
        free(UnsafeMutableRawPointer(mutating: ptr))
      }
    }

    let pixelFormat = CVPixelBufferGetPixelFormatType(srcPixelBuffer)
    var dstPixelBuffer: CVPixelBuffer?
    let status = CVPixelBufferCreateWithBytes(nil, destWidth, destHeight,
                                              pixelFormat, destData,
                                              destBytesPerRow, releaseCallback,
                                              nil, nil, &dstPixelBuffer)
    if status != kCVReturnSuccess {
      print("Error: could not create new pixel buffer")
      free(destData)
      return nil
    }
    return dstPixelBuffer
  }

  
  
  
  @objc public func initMetal(metalView:PreviewMetalView) {
    self.previewView?.removeFromSuperview()
    self.previewView = metalView
    //appDelegate = UIApplication.shared.delegate as! AppDelegate
    if VideoTrimmerSwift.IsPortrait == true {
     if self.previewView != nil{
          self.changeOrientation()
      }
    }
  }
  
  
  @objc public func changeLockedOrientation(){
    switch DeviceSingleton.sharedInstance().IsLockDirection.videoOrientation{
      case .portrait:
//        print("------------------portrait-------------------------");
        self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees

      case .portraitUpsideDown:
//        print("------------------portraitUpsideDown-------------------------");
          self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees
        
      case .landscapeLeft:
//        print("------------------landscapeLeft-------------------------");
        self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate180Degrees : PreviewMetalView.Rotation.rotate0Degrees
      
      case .landscapeRight:
//        print("------------------landscapeRight-------------------------");

        self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate0Degrees  : PreviewMetalView.Rotation.rotate180Degrees
      default:
//        print("------------------default-------------------------");
        self.previewView!.rotation = self.cameraIdentifier == 2 ?  PreviewMetalView.Rotation.rotate270Degrees : PreviewMetalView.Rotation.rotate90Degrees
      }
  }
  
  
  
  @objc public func configureCameraForHighestFrameRate(device: AVCaptureDevice) {
      
      var bestFormat: AVCaptureDevice.Format?
      var bestFrameRateRange: AVFrameRateRange?

    let format = device.formats.last
    
//    for format in device.formats.last {
      
    let fdesc = format!.formatDescription
        let dims = CMVideoFormatDescriptionGetDimensions(fdesc)
        NSLog("%d x %d", dims.width, dims.height)

        
        
    for range in format!.videoSupportedFrameRateRanges {
              if range.maxFrameRate > bestFrameRateRange?.maxFrameRate ?? 0 {
                  bestFormat = format
                  bestFrameRateRange = range
              }
          }
//      }
      
      if let bestFormat = bestFormat,
         let bestFrameRateRange = bestFrameRateRange {
          do {
              try device.lockForConfiguration()
              
              // Set the device's active format.
              device.activeFormat = bestFormat
              
              // Set the device's min/max frame duration.
              let duration = bestFrameRateRange.minFrameDuration
              device.activeVideoMinFrameDuration = duration
              device.activeVideoMaxFrameDuration = duration
              
              device.unlockForConfiguration()
          } catch {
              // Handle error.
          }
      }
  }

  
  
  @objc public func changeOrientation(){
    if self.previewView != nil{
      if  UIDevice.current.orientation == UIDeviceOrientation.portraitUpsideDown  {
        switch lastDeviceOrientation{
        case .portrait:
          self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees

        case .portraitUpsideDown:
            self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees
          
        case .landscapeLeft:
          self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate180Degrees : PreviewMetalView.Rotation.rotate0Degrees
        case .landscapeRight:
          self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate0Degrees  : PreviewMetalView.Rotation.rotate180Degrees
        default:
          self.previewView!.rotation = self.cameraIdentifier == 2 ?  PreviewMetalView.Rotation.rotate270Degrees : PreviewMetalView.Rotation.rotate90Degrees
        }
      }else{
          switch UIDevice.current.orientation{
          case .portrait:
            self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees

          case .portraitUpsideDown:
              self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate270Degrees   :PreviewMetalView.Rotation.rotate90Degrees
            
          case .landscapeLeft:
            self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate180Degrees : PreviewMetalView.Rotation.rotate0Degrees
          case .landscapeRight:
            self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate0Degrees  : PreviewMetalView.Rotation.rotate180Degrees
            
            case .faceUp:
                break;
//              self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate0Degrees  : PreviewMetalView.Rotation.rotate180Degrees
            
            case .faceDown:
            break
//              self.previewView!.rotation = self.cameraIdentifier == 2 ? PreviewMetalView.Rotation.rotate0Degrees  : PreviewMetalView.Rotation.rotate180Degrees


          default:
            self.previewView!.rotation = self.cameraIdentifier == 2 ?  PreviewMetalView.Rotation.rotate270Degrees : PreviewMetalView.Rotation.rotate90Degrees

            break;
//            self.previewView!.rotation = self.cameraIdentifier == 2 ?  PreviewMetalView.Rotation.rotate270Degrees : PreviewMetalView.Rotation.rotate90Degrees
          }
        lastDeviceOrientation =  UIDevice.current.orientation
        }
      }
  }
  
  

  
  @objc public func applyFilter(_ sampleBuffer: CMSampleBuffer) -> PreviewMetalView? {
    
    if VideoTrimmerSwift.IsPortrait == true{
        IsOrientationLock ? self.changeLockedOrientation() : self.changeOrientation()
    }
    
    if (self.videoFilter == nil) {
      return nil
    }
    
    
    
    guard let videoPixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer),
      let formatDescription = CMSampleBufferGetFormatDescription(sampleBuffer) else {
        return nil
    }
    
    var finalVideoPixelBuffer = videoPixelBuffer
    if let filter = videoFilter {
      if !filter.isPrepared {
        /*
         outputRetainedBufferCountHint is the number of pixel buffers the renderer retains. This value informs the renderer
         how to size its buffer pool and how many pixel buffers to preallocate. Allow 3 frames of latency to cover the dispatch_async call.
         */
        filter.prepare(with: formatDescription, outputRetainedBufferCountHint: 3)
      }
      // Send the pixel buffer through the filter
      guard let filteredBuffer = filter.render(pixelBuffer: finalVideoPixelBuffer) else {
        print("Unable to filter video buffer")
        return nil
      }
      finalVideoPixelBuffer = filteredBuffer
    }
    
    if depthVisualizationEnabled {
      if !videoDepthMixer.isPrepared {
        videoDepthMixer.prepare(with: formatDescription, outputRetainedBufferCountHint: 3)
      }
      
      if let depthBuffer = currentDepthPixelBuffer {
        // Mix the video buffer with the last depth data received.
        guard let mixedBuffer = videoDepthMixer.mix(videoPixelBuffer: finalVideoPixelBuffer, depthPixelBuffer: depthBuffer) else {
          print("Unable to combine video and depth")
          return nil
        }
        finalVideoPixelBuffer = mixedBuffer
      }
    }
    
    self.previewView!.pixelBuffer = finalVideoPixelBuffer
    self.pixelBuffer = finalVideoPixelBuffer
    return self.previewView
  }
  
      private var widthCheck = UserDefaults.standard.integer(forKey: "width")
      private var heightCheck = UserDefaults.standard.integer(forKey: "height")
     
  @objc public func changeVideoOrientation(){
   if VideoTrimmerSwift.IsPortrait == false{
        
        switch self.videoOrienation{
        case .portrait:
            self.previewView!.rotation = PreviewMetalView.Rotation.rotate90Degrees
        case .portraitUpsideDown:
            self.previewView!.rotation = PreviewMetalView.Rotation.rotate270Degrees
        case .landscapeLeft:
            self.previewView!.rotation = PreviewMetalView.Rotation.rotate0Degrees
        case .landscapeRight:
            self.previewView!.rotation = PreviewMetalView.Rotation.rotate180Degrees
        default:
            self.previewView!.rotation = PreviewMetalView.Rotation.rotate90Degrees
        }

      }
  }

@objc func applyFilterVideo(_ pixelBuffer: CVPixelBuffer?) -> PreviewMetalView? {
    self.changeVideoOrientation()
    if (self.videoFilter == nil) {
      return nil
    }
    
    //    guard let videoPixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer),
    //      let formatDescription = CMSampleBufferGetFormatDescription(sampleBuffer) else {
    //        return nil
    //    }
    
    //    let videoPixelBuffer = pixelBuffer
    
    
    guard let videoPixelBuffer:CVPixelBuffer = pixelBuffer else {
      print("pixelBuffer is nil!")
      return nil
    }
    
    
    let formatDescription = CMFormatDescription.make(from: videoPixelBuffer)
    
    var finalVideoPixelBuffer = videoPixelBuffer
    if let filter = videoFilter {
      if !filter.isPrepared {
        /*
         outputRetainedBufferCountHint is the number of pixel buffers the renderer retains. This value informs the renderer
         how to size its buffer pool and how many pixel buffers to preallocate. Allow 3 frames of latency to cover the dispatch_async call.
         */
        filter.prepare(with: formatDescription!, outputRetainedBufferCountHint: 3)
      }
      
      // Send the pixel buffer through the filter
      guard let filteredBuffer = filter.render(pixelBuffer: finalVideoPixelBuffer) else {
        print("Unable to filter video buffer")
        return nil
      }
      //      print("FORMAT DESCRIPTIO========",formatDescription!)
      finalVideoPixelBuffer = filteredBuffer
    }
    
    if depthVisualizationEnabled {
      if !videoDepthMixer.isPrepared {
        print("videoDepthMixer.isPrepared ======", videoDepthMixer.isPrepared)
        videoDepthMixer.prepare(with: formatDescription!, outputRetainedBufferCountHint: 3)
      }
      
      if let depthBuffer = currentDepthPixelBuffer {
        // Mix the video buffer with the last depth data received.
        guard let mixedBuffer = videoDepthMixer.mix(videoPixelBuffer: finalVideoPixelBuffer, depthPixelBuffer: depthBuffer) else {
          print("Unable to combine video and depth")
          return nil
        }
        finalVideoPixelBuffer = mixedBuffer
      }
    }
    self.pixelBuffer = finalVideoPixelBuffer
    self.previewView!.pixelBuffer = finalVideoPixelBuffer
    return self.previewView
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
}

extension CMFormatDescription {
  static func make(from pixelBuffer: CVPixelBuffer) -> CMFormatDescription? {
    var formatDescription: CMFormatDescription?
    CMVideoFormatDescriptionCreateForImageBuffer(allocator: kCFAllocatorDefault, imageBuffer: pixelBuffer, formatDescriptionOut: &formatDescription)
    return formatDescription
  }
}


@objc public extension UIImage {
    public convenience init?(pixelBuffer: CVPixelBuffer) {
      
//      if #available(iOS 9.0, *) {
//          AudioServicesPlaySystemSoundWithCompletion(SystemSoundID(1108), nil)
//      } else {
//          AudioServicesPlaySystemSound(1108)
//      }

        var cgImage: CGImage?
      VTCreateCGImageFromCVPixelBuffer(pixelBuffer, options: nil, imageOut: &cgImage)

        guard let cgImageObj = cgImage else {
            return nil
        }
        self.init(cgImage: cgImageObj)
    }
  
  func imageRotated(on degrees: CGFloat) -> UIImage {
    // Following code can only rotate images on 90, 180, 270.. degrees.
    
    
    let degrees = round(degrees / 90) * 90
    let sameOrientationType = Int(degrees) % 180 == 0
    let radians = CGFloat.pi * degrees / CGFloat(180)
    let newSize = sameOrientationType ? size : CGSize(width: size.height, height: size.width)

    UIGraphicsBeginImageContext(newSize)
    defer {
      UIGraphicsEndImageContext()
    }

    guard let ctx = UIGraphicsGetCurrentContext(), let cgImage = cgImage else {
      return self
    }

    ctx.translateBy(x: newSize.width / 2, y: newSize.height / 2)
    ctx.rotate(by: radians)
    ctx.scaleBy(x: 1, y: -1)
    let origin = CGPoint(x: -(size.width / 2), y: -(size.height / 2))
    let rect = CGRect(origin: origin, size: size)
    ctx.draw(cgImage, in: rect)
    let image = UIGraphicsGetImageFromCurrentImageContext()
    return image ?? self
  }
}





 extension UIInterfaceOrientation {
    var videoOrientation: UIInterfaceOrientation? {
        // Unlike UIInterfaceOrientation, the UIDeviceOrientation has reversed landscape left/right. Doh!
        switch self {
        case .portraitUpsideDown: return .portraitUpsideDown
        case .landscapeRight: return .landscapeLeft
        case .landscapeLeft: return .landscapeRight
        case .portrait: return .portrait
        default: return nil
        }
    }
}

