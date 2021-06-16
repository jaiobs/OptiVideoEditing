//
//  SobelRenderer.swift
//  litpic
//
//  Created by vignesh waran on 28/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import CoreMedia
import CoreVideo
import Metal

class BlurMetalRenderer: FilterRenderer {
    
    var description: String = "Blur (Metal)"
    
    var isPrepared = false
    
    //  struct blurParameters {
    //    var blurSize: Float?
    //    /// The normalized center of the blur. (0.5, 0.5) by default
    //    var blurCenter: BlurPosition!
    //
    //  }
    
    var blurSize: Float = 3
    var blurCenter: BlurPosition = .center
    
    /// Normalized position with coordinate values from 0.0 to 1.0
    
    //  var range: blurParameters = blurParameters(blurSize: 10, blurCenter: 2 )
    
    private(set) var inputFormatDescription: CMFormatDescription?
    
    var internalAdjustments:Dictionary<String, Float> = [:]
    
    
    private(set) var outputFormatDescription: CMFormatDescription?
    
    private var outputPixelBufferPool: CVPixelBufferPool?
    
    private let metalDevice = MTLCreateSystemDefaultDevice()!
    
    private var computePipelineState: MTLComputePipelineState?
    
    private var textureCache: CVMetalTextureCache!
    
    private var filterName: String = "CIColorMatrix"
    
    var changeBlurRadius: Float = 2
    
    private var BlurFilter: BlurMetalRenderer?
    
    private lazy var commandQueue: MTLCommandQueue? = {
        return self.metalDevice.makeCommandQueue()
    }()
    
    required init() {
        
        var libraryError: Error? = nil
        let libraryFile = Bundle.main.path(forResource: "BlurEffect", ofType: "metallib")
        var myLibrary: MTLLibrary? = nil
        
        print(libraryFile)
        do {
            if #available(iOS 11.0, *) {
                myLibrary = try metalDevice.makeLibrary(URL: URL.init(string: libraryFile!)!)
            } else {
                // Fallback on earlier versions
            }
        } catch let libraryError {
            print("Library error: \(libraryError)")
        }
        
        
        
        //    let defaultLibrary = metalDevice.makeDefaultLibrary()!
        
        let kernelFunction = myLibrary!.makeFunction(name: "zoomBlurKernel")
        do {
            computePipelineState = try metalDevice.makeComputePipelineState(function: kernelFunction!)
        } catch {
            print("Could not create pipeline state: \(error)")
        }
    }
    
    var blurRadius: Float? {
        didSet {
            changeBlurRadius = blurRadius ?? 2
        }
    }
    
    func prepare(with formatDescription: CMFormatDescription, outputRetainedBufferCountHint: Int) {
        reset()
        
        (outputPixelBufferPool, _, outputFormatDescription) = allocateOutputBufferPool(with: formatDescription,
                                                                                       outputRetainedBufferCountHint: outputRetainedBufferCountHint)
        if outputPixelBufferPool == nil {
            return
        }
        inputFormatDescription = formatDescription
        
        var metalTextureCache: CVMetalTextureCache?
        if CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, metalDevice, nil, &metalTextureCache) != kCVReturnSuccess {
            assertionFailure("Unable to allocate texture cache")
        } else {
            textureCache = metalTextureCache
        }
        
        isPrepared = true
    }
    
    func reset() {
        outputPixelBufferPool = nil
        outputFormatDescription = nil
        inputFormatDescription = nil
        textureCache = nil
        isPrepared = false
    }
    
    func render(pixelBuffer: CVPixelBuffer) -> CVPixelBuffer? {
        if !isPrepared {
            assertionFailure("Invalid state: Not prepared.")
            return nil
        }
        
        var newPixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, outputPixelBufferPool!, &newPixelBuffer)
        guard let outputPixelBuffer = newPixelBuffer else {
            print("Allocation failure: Could not get pixel buffer from pool. (\(self.description))")
            return nil
        }
        guard let inputTexture = makeTextureFromCVPixelBuffer(pixelBuffer: pixelBuffer, textureFormat: .bgra8Unorm),
            let outputTexture = makeTextureFromCVPixelBuffer(pixelBuffer: outputPixelBuffer, textureFormat: .bgra8Unorm) else {
                return nil
        }
        
        // Set up command queue, buffer, and encoder.
        guard let commandQueue = commandQueue,
            let commandBuffer = commandQueue.makeCommandBuffer(),
            let commandEncoder = commandBuffer.makeComputeCommandEncoder() else {
                print("Failed to create a Metal command queue.")
                CVMetalTextureCacheFlush(textureCache!, 0)
                return nil
        }
        
        blurSize = changeBlurRadius
        blurCenter = BlurPosition(x: 0.5, y: 0.5)
        
        commandEncoder.label = "Blur Metal"
        commandEncoder.setComputePipelineState(computePipelineState!)
        commandEncoder.setTexture(inputTexture, index: 1)
        commandEncoder.setTexture(outputTexture, index: 0)
        //   commandEncoder.setBytes( UnsafeMutableRawPointer(&range), length:lengthOf , index: 1)
        //    commandEncoder.setBytes(UnsafeMutableRawPointer(&range), length: lengthOf, index: 0)
        commandEncoder.setBytes(&blurSize, length: MemoryLayout<Float>.size, index: 0)
        commandEncoder.setBytes(&blurCenter, length: MemoryLayout<BlurPosition>.size, index: 1)
        
        // Set up the thread groups.
        let width = computePipelineState!.threadExecutionWidth
        let height = computePipelineState!.maxTotalThreadsPerThreadgroup / width
        let threadsPerThreadgroup = MTLSizeMake(width, height, 1)
        let threadgroupsPerGrid = MTLSize(width: (inputTexture.width + width - 1) / width,
                                          height: (inputTexture.height + height - 1) / height,
                                          depth: 1)
        commandEncoder.dispatchThreadgroups(threadgroupsPerGrid, threadsPerThreadgroup: threadsPerThreadgroup)
        commandEncoder.endEncoding()
        commandBuffer.commit()
        return outputPixelBuffer
    }
    
    deinit {
        
    }
    
    func makeTextureFromCVPixelBuffer(pixelBuffer: CVPixelBuffer, textureFormat: MTLPixelFormat) -> MTLTexture? {
        let width = CVPixelBufferGetWidth(pixelBuffer)
        let height = CVPixelBufferGetHeight(pixelBuffer)
        
        // Create a Metal texture from the image buffer.
        var cvTextureOut: CVMetalTexture?
        CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, textureCache, pixelBuffer, nil, textureFormat, width, height, 0, &cvTextureOut)
        
        guard let cvTexture = cvTextureOut, let texture = CVMetalTextureGetTexture(cvTexture) else {
            CVMetalTextureCacheFlush(textureCache, 0)
            return nil
        }
        
        return texture
    }
}
