/*
 See LICENSE folder for this sample’s licensing information.
 
 Abstract:
 The Metal preview view.
 */

import CoreMedia
import Metal
import MetalKit
import Foundation

@available(iOS 10.0, *)
//@objc (PreviewMetalView)
@objc public class PreviewMetalView: MTKView {
  
  enum Rotation: Int {
    case rotate0Degrees
    case rotate90Degrees
    case rotate180Degrees
    case rotate270Degrees
  }
  
  var cameraType:NSInteger = 2
  var checkPreview: NSString = "cameraPreview"
  public var previewVideo: Bool = false
  
  
  @objc public var mirroring = true {
    didSet {
      syncQueue.sync {
        internalMirroring = mirroring
      }
    }
  }
  
  private var internalMirroring: Bool = false
  
  var rotation: Rotation = .rotate0Degrees {
    didSet {
      syncQueue.sync {
        internalRotation = rotation
      }
    }
  }
  
  private var internalRotation: Rotation = .rotate0Degrees
  
 @objc public var pixelBuffer: CVPixelBuffer? {
    didSet {
      syncQueue.sync {
        internalPixelBuffer = pixelBuffer
      }
    }
  }
  
  var cameraId: NSInteger?{
    didSet {
      cameraType = cameraId ?? 2
    }
  }
  
 deinit {
        
    }
  
  private var internalPixelBuffer: CVPixelBuffer?
  
  private let syncQueue = DispatchQueue(label: "Preview View Sync Queue", qos: .userInitiated, attributes: [], autoreleaseFrequency: .workItem)
  
  private var textureCache: CVMetalTextureCache?
  
  private var textureWidth: Int = 0
  
  private var textureHeight: Int = 0
  
  private var textureMirroring = false
  
  private var textureRotation: Rotation = .rotate0Degrees
  
  private var sampler: MTLSamplerState!
  
  private var renderPipelineState: MTLRenderPipelineState!
  
  private var commandQueue: MTLCommandQueue?
  
  private var vertexCoordBuffer: MTLBuffer!
  
  private var textCoordBuffer: MTLBuffer!
  
  private var internalBounds: CGRect!
  
  private var textureTranform: CGAffineTransform?
  
  func texturePointForView(point: CGPoint) -> CGPoint? {
    var result: CGPoint?
    guard let transform = textureTranform else {
      return result
    }
    let transformPoint = point.applying(transform)
    if CGRect(origin: .zero, size: CGSize(width: textureWidth, height: textureHeight)).contains(transformPoint) {
      result = transformPoint
    } else {
      print("Invalid point \(point) result point \(transformPoint)")
    }
    
    return result
  }
  
  @objc public func setPixelBuffer(pixelBuffer: CVPixelBuffer){
    syncQueue.sync {
      internalPixelBuffer = pixelBuffer
    }
  }
  
  @objc public func setPreviewTo(preview: NSString){
    checkPreview = preview
    textureWidth = 0
    textureHeight = 0
    textureMirroring = false
    textureRotation = .rotate0Degrees
  }
  
  func viewPointForTexture(point: CGPoint) -> CGPoint? {
    var result: CGPoint?
    guard let transform = textureTranform?.inverted() else {
      return result
    }
    let transformPoint = point.applying(transform)
    
    if internalBounds.contains(transformPoint) {
      result = transformPoint
    } else {
      print("Invalid point \(point) result point \(transformPoint)")
    }
    return result
  }
  
  
  private func setupTransform(width: Int, height: Int, mirroring: Bool, rotation: Rotation) {
      var scaleX: Float = 1.0
      var scaleY: Float = 1.0
      var resizeAspect: Float = 1.0
      
      internalBounds = self.bounds
      textureWidth = width
      textureHeight = height
      textureMirroring = mirroring
      textureRotation = rotation
      
      if textureWidth > 0 && textureHeight > 0 {
          switch textureRotation {
          case .rotate0Degrees, .rotate180Degrees:
              scaleX = Float(internalBounds.width / CGFloat(textureWidth))
              scaleY = Float(internalBounds.height / CGFloat(textureHeight))
              
          case .rotate90Degrees, .rotate270Degrees:
              scaleX = Float(internalBounds.width / CGFloat(textureHeight))
              scaleY = Float(internalBounds.height / CGFloat(textureWidth))
          }
      }
      // Resize aspect ratio.
      resizeAspect = min(scaleX, scaleY)
    
//      if scaleX < 1 && scaleX > 0.9{
//        let variation = 1 - scaleX
//        scaleY = 1.0 + variation
//        scaleX = 1.0
//      }else{
//        scaleX = scaleY / scaleX
//        scaleY = 1.0
//      }
      
    if scaleX < scaleY {
        scaleY = scaleX / scaleY
        let variation = 1 - scaleY
        scaleX = 1.0 + variation
        scaleY = 1.0
    } else {
        scaleX = scaleY / scaleX
        scaleY = 1.0
//        let variation = 1 - scaleX
//        scaleX = 1.0
//        scaleY = 1.0 + variation
    }

    
    
      if textureMirroring {
          scaleX *= -1.0
      }
      
      // Vertex coordinate takes the gravity into account.
      let vertexData: [Float] = [
          -scaleX, -scaleY, 0.0, 1.0,
          scaleX, -scaleY, 0.0, 1.0,
          -scaleX, scaleY, 0.0, 1.0,
          scaleX, scaleY, 0.0, 1.0
      ]
    
      vertexCoordBuffer = device!.makeBuffer(bytes: vertexData, length: vertexData.count * MemoryLayout<Float>.size, options: [])
      
      // Texture coordinate takes the rotation into account.
      var textData: [Float]
      switch textureRotation {
      case .rotate0Degrees:
          textData = [
              0.0, 1.0,
              1.0, 1.0,
              0.0, 0.0,
              1.0, 0.0
          ]
          
      case .rotate180Degrees:
          textData = [
              1.0, 0.0,
              0.0, 0.0,
              1.0, 1.0,
              0.0, 1.0
          ]
          
      case .rotate90Degrees:
          textData = [
              1.0, 1.0,
              1.0, 0.0,
              0.0, 1.0,
              0.0, 0.0
          ]
          
      case .rotate270Degrees:
          textData = [
              0.0, 0.0,
              0.0, 1.0,
              1.0, 0.0,
              1.0, 1.0
          ]
      }
      textCoordBuffer = device?.makeBuffer(bytes: textData, length: textData.count * MemoryLayout<Float>.size, options: [])
      
      // Calculate the transform from texture coordinates to view coordinates
      var transform = CGAffineTransform.identity
      if textureMirroring {
          transform = transform.concatenating(CGAffineTransform(scaleX: -1, y: 1))
          transform = transform.concatenating(CGAffineTransform(translationX: CGFloat(textureWidth), y: 0))
      }
      
      switch textureRotation {
      case .rotate0Degrees:
          transform = transform.concatenating(CGAffineTransform(rotationAngle: CGFloat(0)))
          
      case .rotate180Degrees:
          transform = transform.concatenating(CGAffineTransform(rotationAngle: CGFloat(Double.pi)))
          transform = transform.concatenating(CGAffineTransform(translationX: CGFloat(textureWidth), y: CGFloat(textureHeight)))
          
      case .rotate90Degrees:
          transform = transform.concatenating(CGAffineTransform(rotationAngle: CGFloat(Double.pi) / 2))
          transform = transform.concatenating(CGAffineTransform(translationX: CGFloat(textureHeight), y: 0))
          
      case .rotate270Degrees:
          transform = transform.concatenating(CGAffineTransform(rotationAngle: 3 * CGFloat(Double.pi) / 2))
          transform = transform.concatenating(CGAffineTransform(translationX: 0, y: CGFloat(textureWidth)))
      }
      
      transform = transform.concatenating(CGAffineTransform(scaleX: CGFloat(resizeAspect), y: CGFloat(resizeAspect)))
      let tranformRect = CGRect(origin: .zero, size: CGSize(width: textureWidth, height: textureHeight)).applying(transform)
      let xShift = (internalBounds.size.width - tranformRect.size.width) / 2
      let yShift = (internalBounds.size.height - tranformRect.size.height) / 2
      transform = transform.concatenating(CGAffineTransform(translationX: xShift, y: yShift))
      textureTranform = transform.inverted()
  }
  
  
  required init(coder: NSCoder) {
    super.init(coder: coder)
    commonInit()
  }
  
  @objc public required init(preview:Bool){
    self.previewVideo = preview
    super.init(frame: CGRect.zero, device: .none)
    commonInit()
  }
  
  @objc public func flushTextureCache() {
      textureCache = nil
  }


  
    @objc public override init(frame frameRect: CGRect, device: MTLDevice?){
    super.init(frame: frameRect, device: MTLCreateSystemDefaultDevice())
    commonInit()
  }
  
    @objc public class func setFrame(mainView:MTKView, parentView:UIView){
        mainView.translatesAutoresizingMaskIntoConstraints = false
        
        let topConstraint = NSLayoutConstraint(item: mainView, attribute: .top, relatedBy: .equal, toItem: parentView, attribute: .top, multiplier: 1, constant: 0)
        let bottomConstraint = NSLayoutConstraint(item: mainView, attribute: .bottom, relatedBy: .equal, toItem: parentView, attribute: .bottom, multiplier: 1, constant: 0)
        let leadingConstraint = NSLayoutConstraint(item: mainView, attribute: .leading, relatedBy: .equal, toItem: parentView, attribute: .leading, multiplier: 1, constant: 0)
        let trailingConstraint = NSLayoutConstraint(item: mainView, attribute: .trailing, relatedBy: .equal, toItem: parentView, attribute: .trailing, multiplier: 1, constant: 0)

        
        mainView.addConstraints([topConstraint, bottomConstraint, leadingConstraint, trailingConstraint])
        mainView.layoutIfNeeded()
        
//        addConstraints([topConstraint, bottomConstraint, leadingConstraint, trailingConstraint])
//        layoutIfNeeded()

        
        
        
        
        
        
        
        
               
        
        
        
        
    }
    

  
 @objc public func getCMSampleBuffer() -> CMSampleBuffer {
      var pixelBuffer : CVPixelBuffer? = nil
  CVPixelBufferCreate(kCFAllocatorDefault, Int(UIScreen.main.bounds.width), Int(UIScreen.main.bounds.height), kCVPixelFormatType_32BGRA, nil, &pixelBuffer)

    var info = CMSampleTimingInfo()
    info.presentationTimeStamp = CMTime.zero
    info.duration = CMTime.invalid
    info.decodeTimeStamp = CMTime.invalid

      var formatDesc: CMFormatDescription? = nil
    CMVideoFormatDescriptionCreateForImageBuffer(allocator: kCFAllocatorDefault, imageBuffer: pixelBuffer!, formatDescriptionOut: &formatDesc)

      var sampleBuffer: CMSampleBuffer? = nil

    CMSampleBufferCreateReadyWithImageBuffer(allocator: kCFAllocatorDefault,
                                             imageBuffer: pixelBuffer!,
                                             formatDescription: formatDesc!,
                                             sampleTiming: &info,
                                             sampleBufferOut: &sampleBuffer);

      return sampleBuffer!
  }
  
  


  
  func commonInit(){
    device = MTLCreateSystemDefaultDevice()
    self.autoResizeDrawable = true
    self.autoresizesSubviews = true
    
    configureMetal()
    createTextureCache()
    colorPixelFormat = .bgra8Unorm
  }
  
    func configureMetal() {
    
    var libraryError: Error? = nil
    let libraryFile = Bundle.main.path(forResource: "PassThrough", ofType: "metallib")
    var myLibrary: MTLLibrary? = nil
    
    print(libraryFile)
    do {
        if #available(iOS 11.0, *) {
            myLibrary = try device?.makeLibrary(URL: URL.init(string: libraryFile!)!)
        } else {
            // Fallback on earlier versions
        }
    } catch let libraryError {
        print("Library error: \(libraryError)")
    }


    let defaultLibrary = device?.makeDefaultLibrary()
    let pipelineDescriptor = MTLRenderPipelineDescriptor()
    pipelineDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm
    pipelineDescriptor.vertexFunction = myLibrary?.makeFunction(name: "vertexPassThrough")
    pipelineDescriptor.fragmentFunction = myLibrary?.makeFunction(name: "fragmentPassThrough")
    
    // To determine how textures are sampled, create a sampler descriptor to query for a sampler state from the device.
    let samplerDescriptor = MTLSamplerDescriptor()
    samplerDescriptor.sAddressMode = .clampToEdge
    samplerDescriptor.tAddressMode = .clampToEdge
    samplerDescriptor.minFilter = .linear
    samplerDescriptor.magFilter = .linear
    sampler = device!.makeSamplerState(descriptor: samplerDescriptor)
    
    do {
      renderPipelineState = try device!.makeRenderPipelineState(descriptor: pipelineDescriptor)
    } catch {
//      fatalError("Unable to create preview Metal view pipeline state. (\(error))")
    }
    commandQueue = device!.makeCommandQueue()
  }
  
  func createTextureCache() {
    var newTextureCache: CVMetalTextureCache?
    if CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, device!, nil, &newTextureCache) == kCVReturnSuccess {
      textureCache = newTextureCache
    } else {
      assertionFailure("Unable to allocate texture cache")
    }
  }
  
  
  
  /// - Tag: DrawMetalTexture
    override public func draw(_ rect: CGRect) {
      var pixelBuffer: CVPixelBuffer?
      var mirroring = false
      var rotation: Rotation = .rotate0Degrees
      
      syncQueue.sync {
          pixelBuffer = internalPixelBuffer
          mirroring = internalMirroring
          rotation = internalRotation
      }
      
      guard let drawable = currentDrawable,
          let currentRenderPassDescriptor = currentRenderPassDescriptor,
          let previewPixelBuffer = pixelBuffer else {
              return
      }
      
      // Create a Metal texture from the image buffer.
      let width = CVPixelBufferGetWidth(previewPixelBuffer)
      let height = CVPixelBufferGetHeight(previewPixelBuffer)
      
      if textureCache == nil {
          createTextureCache()
      }
      var cvTextureOut: CVMetalTexture?
      CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault,
                                                textureCache!,
                                                previewPixelBuffer,
                                                nil,
                                                .bgra8Unorm,
                                                width,
                                                height,
                                                0,
                                                &cvTextureOut)
      guard let cvTexture = cvTextureOut, let texture = CVMetalTextureGetTexture(cvTexture) else {
          print("Failed to create preview texture")
          
          CVMetalTextureCacheFlush(textureCache!, 0)
          return
      }
      
      if texture.width != textureWidth ||
          texture.height != textureHeight ||
          self.bounds != internalBounds ||
          mirroring != textureMirroring ||
          rotation != textureRotation {
          setupTransform(width: texture.width, height: texture.height, mirroring: mirroring, rotation: rotation)
      }
      
      // Set up command buffer and encoder
      guard let commandQueue = commandQueue else {
          print("Failed to create Metal command queue")
          CVMetalTextureCacheFlush(textureCache!, 0)
          return
      }
      
      guard let commandBuffer = commandQueue.makeCommandBuffer() else {
          print("Failed to create Metal command buffer")
          CVMetalTextureCacheFlush(textureCache!, 0)
          return
      }
      
      guard let commandEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: currentRenderPassDescriptor) else {
          print("Failed to create Metal command encoder")
          CVMetalTextureCacheFlush(textureCache!, 0)
          return
      }
      
      commandEncoder.label = "Preview display"
      commandEncoder.setRenderPipelineState(renderPipelineState!)
      commandEncoder.setVertexBuffer(vertexCoordBuffer, offset: 0, index: 0)
      commandEncoder.setVertexBuffer(textCoordBuffer, offset: 0, index: 1)
      commandEncoder.setFragmentTexture(texture, index: 0)
      commandEncoder.setFragmentSamplerState(sampler, index: 0)
      commandEncoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: 4)
      commandEncoder.endEncoding()
      
      // Draw to the screen.
      commandBuffer.present(drawable)
      commandBuffer.commit()
  }
  
//  /// - Tag: DrawMetalTexture
//  override func draw(_ rect: CGRect) {
//    var pixelBuffer: CVPixelBuffer?
//    var mirroring = false
//    var rotation: Rotation = .rotate0Degrees
//
//    syncQueue.sync {
//      pixelBuffer = internalPixelBuffer
//      mirroring = internalMirroring
//      rotation = internalRotation
//    }
//
//    guard let drawable = currentDrawable,
//      let currentRenderPassDescriptor = currentRenderPassDescriptor,
//      let previewPixelBuffer = pixelBuffer else {
//        return
//    }
//
//
//    // Create a Metal texture from the image buffer.
//    var width = CVPixelBufferGetWidth(previewPixelBuffer)
//    var height = CVPixelBufferGetHeight(previewPixelBuffer)
//
//
//    let screenSize = UIScreen.main.bounds
//
//    let screenWidth = screenSize.width
//    let screenHeight = screenSize.height
//
//    print(screenWidth, screenHeight)
//
//    width = CVPixelBufferGetWidthOfPlane(previewPixelBuffer, 0)
//    height = CVPixelBufferGetHeightOfPlane(previewPixelBuffer, 0)
//
//    width = Int(screenWidth)
//    height = Int(screenHeight)
//
//    if textureCache == nil {
//      createTextureCache()
//    }
//
//
//
//
//    var cvTextureOut: CVMetalTexture?
//    CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault,
//                                              textureCache!,
//                                              previewPixelBuffer,
//                                              nil,
//                                              .bgra8Unorm,
//                                              width,
//                                              height,
//                                              0,
//                                              &cvTextureOut)
//
//    guard let cvTexture = cvTextureOut, let texture = CVMetalTextureGetTexture(cvTexture) else {
//      print("Failed to create preview texture")
//      CVMetalTextureCacheFlush(textureCache!, 0)
//      return
//    }
//
//    if texture.width != textureWidth ||
//      texture.height != textureHeight ||
//      self.bounds != internalBounds ||
//      mirroring != textureMirroring ||
//      rotation != textureRotation {
//
//      setupTransform(width: texture.width, height: texture.height, mirroring: mirroring, rotation: rotation)
//    }
//
//    // Set up command buffer and encoder
//    guard let commandQueue = commandQueue else {
//      print("Failed to create Metal command queue")
//      CVMetalTextureCacheFlush(textureCache!, 0)
//      return
//    }
//
//    guard let commandBuffer = commandQueue.makeCommandBuffer() else {
//      print("Failed to create Metal command buffer")
//      CVMetalTextureCacheFlush(textureCache!, 0)
//      return
//    }
//
//    guard let commandEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: currentRenderPassDescriptor) else {
//      print("Failed to create Metal command encoder")
//      CVMetalTextureCacheFlush(textureCache!, 0)
//      return
//    }
//
//    commandEncoder.label = "Preview display"
//    commandEncoder.setRenderPipelineState(renderPipelineState!)
//    commandEncoder.setVertexBuffer(vertexCoordBuffer, offset: 0, index: 0)
//    commandEncoder.setVertexBuffer(textCoordBuffer, offset: 0, index: 1)
//    commandEncoder.setFragmentTexture(texture, index: 0)
//    commandEncoder.setFragmentSamplerState(sampler, index: 0)
//    commandEncoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: 4)
//    commandEncoder.endEncoding()
//
//    // Draw to the screen.
//    commandBuffer.present(drawable)
//    commandBuffer.commit()
//  }
}


