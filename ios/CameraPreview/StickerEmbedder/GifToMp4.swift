//
//  GifToMp4.swift
//  react-native-litpic-camera-module
//
//  Created by MAC-OBS-2 on 09/07/20.
//

import UIKit
import Photos
import AssetsLibrary

@available(iOS 11.0, *)
class GifToMp4 {

   var images = [UIImage]()
    
    func convertImageWithGifToVideo(_ bgImage: UIImage, gifURL: [[String:Any]],  completionHandler: @escaping (_ param: String) -> Void){
        for _ in 1...20 {
            images.append(bgImage)
        }
        build(outputSize: bgImage.size, gifArray: gifURL, completionHandler: {response in
            completionHandler(response)
        })
    }
    
    func build(outputSize: CGSize,gifArray: [[String:Any]],completionHandler: @escaping (_ param: String) -> Void) {
        var gifDict = gifArray
        let fileManager = FileManager.default
        let urls = fileManager.urls(for: .documentDirectory, in: .userDomainMask)

//        guard let documentDirectory = urls.first else {
//            fatalError("documentDir Error")
//        }

        let videoOutputURL = URL(fileURLWithPath:NSTemporaryDirectory()).appendingPathComponent("gifOutputVideo.mp4")

        if FileManager.default.fileExists(atPath: videoOutputURL.path) {
            do {
                try FileManager.default.removeItem(atPath: videoOutputURL.path)
            } catch {
                fatalError("Unable to delete file: \(error) : \(#function).")
            }
        }

        guard let videoWriter = try? AVAssetWriter(outputURL: videoOutputURL, fileType: AVFileType.mp4) else {
            fatalError("AVAssetWriter error")
        }

        
        let  outputSettings = [AVVideoCodecKey : AVVideoCodecType.h264, AVVideoWidthKey : NSNumber(value: Float(outputSize.width)), AVVideoHeightKey : NSNumber(value: Float(outputSize.height))] as [String : Any]
        guard videoWriter.canApply(outputSettings: outputSettings, forMediaType: AVMediaType.video) else {
            fatalError("Negative : Can't apply the Output settings...")
        }
        

        let videoWriterInput = AVAssetWriterInput(mediaType: AVMediaType.video, outputSettings: outputSettings)
        let sourcePixelBufferAttributesDictionary = [
            kCVPixelBufferPixelFormatTypeKey as String : NSNumber(value: kCVPixelFormatType_32ARGB),
            kCVPixelBufferWidthKey as String: NSNumber(value: Float(outputSize.width)),
            kCVPixelBufferHeightKey as String: NSNumber(value: Float(outputSize.height))
        ]
        let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: videoWriterInput, sourcePixelBufferAttributes: sourcePixelBufferAttributesDictionary)

        if videoWriter.canAdd(videoWriterInput) {
            videoWriter.add(videoWriterInput)
        }

        if videoWriter.startWriting() {
            videoWriter.startSession(atSourceTime: CMTime.zero)
            assert(pixelBufferAdaptor.pixelBufferPool != nil)

            let media_queue = DispatchQueue(__label: "mediaInputQueue", attr: nil)

            videoWriterInput.requestMediaDataWhenReady(on: media_queue, using: { () -> Void in
                let fps: Int32 = 10
                let frameDuration = CMTimeMake(value: 1, timescale: fps)

                var frameCount: Int64 = 0
                var appendSucceeded = true
                var gifCount = 0
                
                while (!self.images.isEmpty) {
                    if (videoWriterInput.isReadyForMoreMediaData) {
                        let nextPhoto = self.images.remove(at: 0)
                        
                        let lastFrameTime = CMTimeMake(value: frameCount, timescale: fps)
                        let presentationTime = frameCount == 0 ? lastFrameTime : CMTimeAdd(lastFrameTime, frameDuration)
                        
                        var pixelBuffer: CVPixelBuffer? = nil
                        let status: CVReturn = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, pixelBufferAdaptor.pixelBufferPool!, &pixelBuffer)
                        
                        if let pixelBuffer = pixelBuffer, status == 0 {
                            let managedPixelBuffer = pixelBuffer
                            
                            CVPixelBufferLockBaseAddress(managedPixelBuffer, [])
                            
                            let data = CVPixelBufferGetBaseAddress(managedPixelBuffer)
                            let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
                            let context = CGContext(data: data, width: Int(outputSize.width), height: Int(outputSize.height), bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(managedPixelBuffer), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)
                            
                            //context?.clear(CGRect(x: 0, y: 0, width: outputSize.width, height: outputSize.height))
                            
                            let horizontalRatio = CGFloat(outputSize.width) / nextPhoto.size.width
                            let verticalRatio = CGFloat(outputSize.height) / nextPhoto.size.height
                            
                            let aspectRatio = min(horizontalRatio, verticalRatio) // ScaleAspectFit
                            
                            let newSize = CGSize(width: nextPhoto.size.width * aspectRatio, height: nextPhoto.size.height * aspectRatio)
                            
                            let x = newSize.width < outputSize.width ? (outputSize.width - newSize.width) / 2 : 0
                            let y = newSize.height < outputSize.height ? (outputSize.height - newSize.height) / 2 : 0
                            
                            context?.draw((nextPhoto.cgImage!), in: CGRect(x: x, y: y, width: newSize.width, height: newSize.height))
                            
                        for i in 0..<gifDict.count {
                            let gifElement = gifDict[i]
                            let stringURL : String = gifElement["URL"] as! String
                            let gifURL = URL(string: stringURL)
                            let CTM = context?.ctm
                            let invertedCTM = CTM?.inverted()
                            context?.concatenate(invertedCTM!)
//                            let transform = CGAffineTransform.identity
//                            context?.concatenate(transform)
                            if gifURL != nil {
                                do{
                                let data = try! Data(contentsOf: gifURL!)
                                let gif = GIF(data: data)
                                let orientation = gifElement["orientation"]
                                var gifCount = gifElement["gifCount"] as! Int
                                let xValue = Int(gifElement["xPos"] as! CGFloat)
                                var yValue = Int(gifElement["yPos"] as! CGFloat)
                                let ratioWidth = (gifElement["ratioWidth"] as! CGFloat)
                                let ratioHeight = (gifElement["ratioHeight"] as! CGFloat)
                                let gifWidth = Int(gifElement["gifWidth"] as! CGFloat)
                                let gifHeight = Int(gifElement["gifHeight"] as! CGFloat)
                                var scaleValue : CGFloat = gifElement["scale"] as! CGFloat
                                //scaleValue = scaleValue >= 2.0 && scaleValue != 0.0 ? scaleValue : scaleValue
                                let rotateValue : CGFloat = gifElement["rotate"] as! CGFloat
                                yValue = Int(outputSize.height) - yValue
                                context?.saveGState()

                                if(scaleValue != 0.0 && rotateValue != -0.0){
                                    let CTM = context?.ctm
                                    let invertedCTM = CTM?.inverted()
                                    context?.concatenate(invertedCTM!)
                                    let x =  orientation as! String == "portrait" ? CGFloat(xValue + 100) : CGFloat(xValue + 10)
                                    let y = orientation as! String == "portrait" ? CGFloat(yValue + 50) : CGFloat(yValue + 50)
                                    print("OUTPUT SIZZE",outputSize.height, yValue, scaleValue)
                                    let transform = CGAffineTransform(translationX: x, y: y)
                                        .rotated(by: rotateValue)
                                        .scaledBy(x: scaleValue, y: scaleValue)
                                        .translatedBy(x: -x, y: -y)
                                    context?.concatenate(transform)
                                }else if(rotateValue != -0.0){
                                    let CTM = context?.ctm
                                    let invertedCTM = CTM?.inverted()
                                    context?.concatenate(invertedCTM!)
                                    let x = CGFloat(xValue)
                                    let y = CGFloat(yValue)
                                    let transform = CGAffineTransform(translationX: x, y: y)
                                        .rotated(by: rotateValue)
                                    .translatedBy(x: -x, y: -y)
                                    context?.concatenate(transform)
                                    print("OUTPUT SIZZE no SCALE only ROTATE",scaleValue, rotateValue)
                                }else if(scaleValue != 0){
                                    let CTM = context?.ctm
                                    let invertedCTM = CTM?.inverted()
                                    context?.concatenate(invertedCTM!)
                                    let x = orientation as! String == "portrait" ? CGFloat(xValue + 80) : CGFloat(xValue + 50)
                                    let y = CGFloat(yValue + 10)//140
                                    let transform = CGAffineTransform(translationX: x, y: y)
                                        .scaledBy(x: scaleValue, y: scaleValue)
                                    .translatedBy(x: -x, y: -y)
                                    context?.concatenate(transform)
                                    print("OUTPUT SIZZE only SCALE No ROTATE",scaleValue)

                                }else{
                                    let CTM = context?.ctm
                                    let invertedCTM = CTM?.inverted()
                                    context?.concatenate(invertedCTM!)
                                    let x = CGFloat(xValue)
                                    let y = CGFloat(yValue - 30)
                                    let transform = CGAffineTransform(translationX: x, y: y)
                                        .scaledBy(x: 1.5, y: 1.5)
                                        .translatedBy(x: -x, y: -y)
                                    context?.concatenate(transform)
                                    print("OUTPUT SIZZE NO SCALE No ROTATE",scaleValue)
                                }
                            
                                if let cgImage = gif!.getFrame(at: Int(gifCount)) {
                                    let widthImage = CGFloat(cgImage.width)
                                    var heightImage = CGFloat(cgImage.height)

                                    let xval = CGFloat(xValue + 10)
                                    let yval = CGFloat(yValue)
                                    context?.draw(cgImage, in: CGRect(x: xval, y: yval, width: widthImage, height: heightImage))
                                    
                                    gifCount = gifCount + 1
                                    gifDict[i]["gifCount"] = gifCount
                                                                    
                                }else{
                                    gifCount =  0
                                    if let cgImage = gif!.getFrame(at: Int(gifCount)) {
                                        let widthImage = CGFloat(cgImage.width)
                                        var heightImage = CGFloat(cgImage.height)
                                        let xval = CGFloat(xValue + 10)
                                        let yval = CGFloat(yValue)
                                        context?.draw(cgImage, in: CGRect(x: xval, y: yval, width: widthImage, height: heightImage))

                                        gifCount = gifCount + 1
                                        gifDict[i]["gifCount"] = gifCount

                                    }
                                }}catch{
                                    print("gif catch", gifElement["URL"])
                                }
                            }else{
                                print("gif integration error")
                            }
                        }
                            CVPixelBufferUnlockBaseAddress(managedPixelBuffer, [])
                            appendSucceeded = pixelBufferAdaptor.append(pixelBuffer, withPresentationTime: presentationTime)
                        } else {
                            print("Failed to allocate pixel buffer")
                            appendSucceeded = false
                        }
                    }
                    if !appendSucceeded {
                        break
                    }
                    frameCount += 1
                }
                videoWriterInput.markAsFinished()
                videoWriter.finishWriting { () -> Void in
                    print("FINISHED!!!!!")
                    PHPhotoLibrary.shared().performChanges({
                        PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: videoOutputURL)
                    }) { saved, error in

                        if let error = error {
                            print("Error saving video to librayr: \(error.localizedDescription)")
                             completionHandler("ERROR")
                        }
                        if saved {
                            print("Video save to library")
                            completionHandler(videoOutputURL.path)
                        }
                    }
                }
            })
        }
    }
    
    func resizeWithImageIO(dataGif:NSData, to newSize: CGSize) -> CGImage? {
        var resultImage: CGImage?

        let imageCFData = dataGif as CFData
        let options = [
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceThumbnailMaxPixelSize: max(newSize.width, newSize.height)
            ] as CFDictionary
        guard   let source = CGImageSourceCreateWithData(imageCFData, nil),
        let imageReference = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else { return resultImage }
       // resultImage = UIImage(cgImage: imageReference)

        return imageReference
    }
    
    
    func saveVideoToLibrary(videoURL: URL) {

        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: videoURL)
        }) { saved, error in

            if let error = error {
                print("Error saving video to librayr: \(error.localizedDescription)")
            }
            if saved {
                print("Video save to library")

            }
        }
    }

}


extension UIImage {
    func imageScaleToFitWithImage(newSize:CGSize) -> UIImage{
        UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0);
        let aspect = self.size.width / self.size.height
        if(newSize.width / aspect <= newSize.height){
            self.draw(in: CGRect(x: 0, y: 0, width: newSize.width, height: newSize.width / aspect))
        }else{
            self.draw(in: CGRect(x: 0, y: 0, width: newSize.height * aspect, height: newSize.height))
        }
        let newImage:UIImage = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return newImage
    }
}
