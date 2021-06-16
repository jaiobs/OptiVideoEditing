//
//  GIFConverter.swift
//  react-native-litpic-camera-module
//
//  Created by MAC-OBS-2 on 23/06/20.
//

import UIKit
import Foundation
import AssetsLibrary
import AVFoundation
import ImageIO
import MobileCoreServices
import ImageIO
import MobileCoreServices

class GIF {

    private let frameDelayThreshold = 0.02
    private(set) var duration = 0.0
    private(set) var imageSource: CGImageSource!
    private(set) var frames: [CGImage?]!
    private(set) lazy var frameDurations = [TimeInterval]()
    var size: CGSize {
        guard let f = frames.first, let cgImage = f else { return .zero }
        return CGSize(width: cgImage.width, height: cgImage.height)
    }
    private lazy var getFrameQueue: DispatchQueue = DispatchQueue(label: "gif.frame.queue", qos: .userInteractive)

    init?(data: Data) {
        guard let imgSource = CGImageSourceCreateWithData(data as CFData, nil), let imgType = CGImageSourceGetType(imgSource), UTTypeConformsTo(imgType, kUTTypeGIF) else {
            return nil
        }
        self.imageSource = imgSource
        let imgCount = CGImageSourceGetCount(imageSource)
        frames = [CGImage?](repeating: nil, count: imgCount)
        for i in 0..<imgCount {
            let delay = getGIFFrameDuration(imgSource: imageSource, index: i)
            frameDurations.append(delay)
            duration += delay

            getFrameQueue.async { [unowned self] in
                 self.frames[i] = CGImageSourceCreateImageAtIndex(self.imageSource, i, nil)
            }
        }
    }

    func getFrame(at index: Int) -> CGImage? {
        if index >= CGImageSourceGetCount(imageSource) {
            return nil
        }
        if let frame = frames[index] {
            var frameImage =  UIImage(cgImage: frame)
            frameImage = frameImage.imageScaleToFitWithImage(newSize: CGSize(width: 100.0, height: 100.0))
            let cgImageResized = frameImage.cgImage
            return cgImageResized
        } else {
            let frame = CGImageSourceCreateImageAtIndex(imageSource, index, nil)
            print("GIF FRAME",frame?.width,frame?.height)
            var frameImage =  UIImage(cgImage: frame!)
            frameImage = frameImage.imageScaleToFitWithImage(newSize: CGSize(width: 100.0, height: 100.0))
            let cgImageResized = frameImage.cgImage
            frames[index] = cgImageResized
            return cgImageResized
        }
    }

    private func getGIFFrameDuration(imgSource: CGImageSource, index: Int) -> TimeInterval {
        guard let frameProperties = CGImageSourceCopyPropertiesAtIndex(imgSource, index, nil) as? [String: Any],
            let gifProperties = frameProperties[kCGImagePropertyGIFDictionary as String] as? NSDictionary,
            let unclampedDelay = gifProperties[kCGImagePropertyGIFUnclampedDelayTime] as? TimeInterval
            else { return 0.02 }

        var frameDuration = TimeInterval(0)

        if unclampedDelay < 0 {
            frameDuration = gifProperties[kCGImagePropertyGIFDelayTime] as? TimeInterval ?? 0.0
        } else {
            frameDuration = unclampedDelay
        }

        /* Implement as Browsers do: Supports frame delays as low as 0.02 s, with anything below that being rounded up to 0.10 s.
         http://nullsleep.tumblr.com/post/16524517190/animated-gif-minimum-frame-delay-browser-compatibility */

        if frameDuration < frameDelayThreshold - Double.ulpOfOne {
            frameDuration = 0.1
        }

        return frameDuration
    }
}
