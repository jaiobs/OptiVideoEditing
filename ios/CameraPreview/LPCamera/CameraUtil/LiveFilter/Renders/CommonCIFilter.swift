//
//  SepiaCIFilter.swift
//  litpic
//
//  Created by vignesh waran on 28/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import CoreMedia
import CoreVideo
import CoreImage

class CommonCIFilter: FilterRenderer {
  
  var description: String = "CIColorMatrix"
  
  var isPrepared = false
  
  var intensity:Float = 1.0
  
  private var filterName: String = "CIColorMatrix"
  
  private var sepiaFilter: CIFilter?
  
  private var ciContext: CIContext?
  
  var internalAdjustments:Dictionary<String, Float> = [:]
  
  private var outputColorSpace: CGColorSpace?
  
  private var outputPixelBufferPool: CVPixelBufferPool?
  
  private(set) var outputFormatDescription: CMFormatDescription?
  
  private(set) var inputFormatDescription: CMFormatDescription?
  
  
  var adjustments: Dictionary<String, Float>? {
    didSet {
      internalAdjustments = adjustments ?? [:]
      if isPrepared{
        for (kind, values) in adjustments ?? [:]{
            sepiaFilter!.setValue(values, forKey: kind)
        }
      }
    }
  }
  
  var filterType: String? {
    didSet {
      description = filterType ?? "NORMAL"
    }
  }
  
  var filter: String? {
    didSet {
      filterName = filter ?? "CIColorMatrix"
      sepiaFilter = CIFilter(name: filterName)
    }
  }
  
  
  /// - Tag: FilterCoreImageRosy
  func prepare(with formatDescription: CMFormatDescription, outputRetainedBufferCountHint: Int) {
    reset()
    
    (outputPixelBufferPool,
     outputColorSpace,
     outputFormatDescription) = allocateOutputBufferPool(with: formatDescription,
                                                         outputRetainedBufferCountHint: outputRetainedBufferCountHint)
    if outputPixelBufferPool == nil {
      return
    }
    inputFormatDescription = formatDescription
    ciContext = CIContext()
    sepiaFilter = CIFilter(name: filterName)
    
    if(description.isEqual("BLUR")){
      let screenRect = UIScreen.main.bounds
      let screenWidth = screenRect.size.width
      let screenHeight = screenRect.size.height
      
      let midOrgin:CIVector = CIVector.init(x: screenWidth/2, y: screenHeight/2)
      sepiaFilter?.setValue(midOrgin, forKey: "inputCenter")
      print("Sepia filter ========== ", sepiaFilter!)
    }
    
//    if(description.isEqual("FALSECOLOR")){
//      let color1:CIColor = CIColor.init(red: 10, green: 0, blue: 0)
//      let color2:CIColor = CIColor.init(red: 0, green: 0, blue: 0)
//      sepiaFilter?.setValue(color1, forKey: "inputColor0")
//      sepiaFilter?.setValue(color2, forKey: "inputColor1")
//    }
    
    if(internalAdjustments.count > 0){
      for (kind, values) in internalAdjustments {
        sepiaFilter!.setValue(values, forKey: kind)
      }
    }
    isPrepared = true
  }
  
  func reset() {
    ciContext = nil
    sepiaFilter = nil
    outputColorSpace = nil
    outputPixelBufferPool = nil
    outputFormatDescription = nil
    inputFormatDescription = nil
    isPrepared = false
  }
  
  func render(pixelBuffer: CVPixelBuffer) -> CVPixelBuffer? {
    guard let sepiaFilter = sepiaFilter,
      let ciContext = ciContext,
      isPrepared else {
//        assertionFailure("Invalid state: Not prepared")
        return nil
    }
    
    let sourceImage = CIImage(cvImageBuffer: pixelBuffer)
    sepiaFilter.setValue(sourceImage, forKey: kCIInputImageKey)
    
    guard let filteredImage = sepiaFilter.value(forKey: kCIOutputImageKey) as? CIImage else {
      print("CIFilter failed to render image")
      return nil
    }
    
    var pbuf: CVPixelBuffer?
    if(outputPixelBufferPool != nil){
      CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, outputPixelBufferPool!, &pbuf)
    }
  
    guard let outputPixelBuffer = pbuf else {
      print("Allocation failure")
      return nil
    }
    
    let boundry = CGRect.init(x: 0, y: 0, width: filteredImage.extent.width, height: filteredImage.extent.height)
    
    // Render the filtered image out to a pixel buffer (no locking needed, as CIContext's render method will do that)
    ciContext.render(filteredImage, to: outputPixelBuffer, bounds: boundry, colorSpace: outputColorSpace)
    return outputPixelBuffer
  }
}
