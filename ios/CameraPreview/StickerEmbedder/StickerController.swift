//
//  StickerController.swift
//  react-native-litpic-camera-module
//
//  Created by MAC-OBS-2 on 24/05/20.
//

import UIKit
import AssetsLibrary
//import SDWebImage

@objc public class StickerController: UIView {
    
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
   
    @objc public class func textToImage(drawArrayText: [[String : Any]], imagepath: String, completionHandler: @escaping (_ param: String) -> Void){
            
        
        //Getting the image from the path
        var inImage = UIImage()
        var containsGif : Bool = false
        var containsOtherStickers : Bool = true
        let fileManager = FileManager.default
        if fileManager.fileExists(atPath: imagepath){
            inImage = UIImage(contentsOfFile: imagepath)!
        }else{
            let temVideoUrl = URL.init(string: imagepath)
            let data = try? Data(contentsOf: temVideoUrl!)
            inImage = UIImage(data: data!)!
        }
        
        let screenSize: CGRect = UIScreen.main.bounds
        
        let currentView = UIView(frame: CGRect(x: 0, y: 0, width: inImage.size.width, height: inImage.size.height))
        currentView.backgroundColor = .black
        let currentImageView = UIImageView()
        // aspect ratio of image and screen
        let ratio = inImage.size.width / inImage.size.height
        if currentView.frame.width > currentView.frame.height {
            let newHeight = currentView.frame.width / ratio
            currentImageView.frame.size = CGSize(width: currentView.frame.width, height: newHeight)
        }
        else{
            let newWidth = currentView.frame.height * ratio
            currentImageView.frame.size = CGSize(width: newWidth, height: currentView.frame.height)
        }
        
        print("HEIGTH AND WIDTHS",currentView.frame.width,currentView.frame.height,currentImageView.frame.width, currentImageView.frame.height)
        print("INIMAGE HEIGTH AND WIDTHS",inImage.size.width,inImage.size.height)
        currentImageView.image = inImage

        // Setup the image context using the passed image
        let scale = UIScreen.main.scale
        let ratioWidth = inImage.size.width / screenSize.size.width
        let ratioHeight = inImage.size.height / screenSize.size.height
        UIGraphicsBeginImageContext(inImage.size)
       // UIGraphicsBeginImageContextWithOptions(inImage.size, false, scale)
        
        for i in drawArrayText {
            let drawText = i
            let isDeleted = drawText["isDeleted"] as! Bool
            let isSticker = drawText["isSticker"] as! Bool
        if(isDeleted == false && isSticker == false){ // text labels
            // Setup the font specific variables
            containsOtherStickers = true
            var textColor = UIColor.white
            let orientationPhoto = drawText["orientation"] as! String
            var xPos : CGFloat = drawText["xcoordinate"] as! CGFloat
            var totalTranslateX = drawText["totalTranslateX"] as! CGFloat
            //xPos = xPos + totalTranslateX
            var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
            let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
            yPos = yPos + totalTranslateY
            let textWidth: CGFloat = drawText["width"] as! CGFloat
            let textHeight: CGFloat = drawText["height"] as! CGFloat
            totalTranslateX = totalTranslateX == 0 ? 0 : totalTranslateX
            xPos = xPos + totalTranslateX
            var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
            //scaleValue = scaleValue == 0 ? scaleValue :  scaleValue < 1 ? scaleValue - 0.05 : (scaleValue + scaleValue) - 0.5
            let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
            var textBackground = UIColor.clear
            var textAlign : NSTextAlignment = .center
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
            if(drawText["textColor"] as! String != "transparent" && drawText["textColor"] as! String != "white" && drawText["textColor"] as! String != "black"){
                textColor = UIColor().hexStringToUIColor(hex: drawText["textColor"] as! String)
            }else if(drawText["textColor"] as! String == "black"){
                textColor = .black
            }
            
            let textFont = UIFont(name: drawText["textFont"] as! String, size: (24.0 * ratioWidth) - 7.0)!
            
            // Set a view
            //- xPos - (textWidth/scale) + scal
            //- yPos + 12 : yPos - scale
//            let calXValue = xPos - (textWidth/2)
            
            let xValue = orientationPhoto == "portrait" ? (xPos * ratioWidth) + 8 : (xPos * ratioWidth) + 15
            let yValue = orientationPhoto == "portrait" ? (yPos + 10) * ratioHeight : (yPos) * ratioHeight
            let labelToDisplay = UILabel(frame: CGRect(x: scaleValue > 0 && scaleValue < 1 ? xValue : xValue - 10, y: yValue , width: textWidth >= (screenSize.width - 150) ? textWidth * (ratioWidth - 0.5)  + 50 :textWidth * (ratioWidth - 0.5) , height: textHeight * (ratioHeight)))
            print("Labels x and y",labelToDisplay.frame.origin.x,labelToDisplay.frame.origin.y, scaleValue, totalTranslateX, totalTranslateY)
            labelToDisplay.text = drawText["textValue"] as! String
            labelToDisplay.textColor = textColor
            labelToDisplay.backgroundColor = textBackground
            labelToDisplay.numberOfLines = 0
            labelToDisplay.layer.cornerRadius = 30.0
            labelToDisplay.layer.masksToBounds = true
            labelToDisplay.textAlignment = textAlign
            labelToDisplay.font = textFont
    //        labelToDisplay.transform = CGAffineTransform(rotationAngle: rotateValue)
    //        labelToDisplay.transform = CGAffineTransform.identity
            if(scaleValue != 0 && rotateValue != 0){
                labelToDisplay.transform = CGAffineTransform.identity.rotated(by: rotateValue).scaledBy(x: scaleValue, y: scaleValue)
            }else if(scaleValue != 0){
                labelToDisplay.transform = CGAffineTransform.identity.scaledBy(x: scaleValue, y: scaleValue)
            }else{
                labelToDisplay.transform = CGAffineTransform.identity.rotated(by: rotateValue)
            }
            currentImageView.addSubview(labelToDisplay)
        }else if(isDeleted == false && isSticker){
            containsOtherStickers = true
            let orientationPhoto = drawText["orientation"] as! String
            var xPos : CGFloat = drawText["xcoordinate"] as! CGFloat
            var totalTranslateX = drawText["totalTranslateX"] as! CGFloat
            //xPos = xPos + totalTranslateX
            var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
            let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
            yPos = yPos + totalTranslateY
            let imgWidth: CGFloat = drawText["width"] as! CGFloat
            let imgHeight: CGFloat = drawText["height"] as! CGFloat
            totalTranslateX = totalTranslateX == 0 ? 0 : totalTranslateX
            xPos = xPos + totalTranslateX
            var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
            //scaleValue = scaleValue == 0 ? scaleValue : scaleValue < 1 ? scaleValue - 0.1 : (scaleValue + scaleValue) - 0.7
            let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
            let xValue = orientationPhoto == "portrait" ? (xPos * ratioWidth) : (xPos * ratioWidth) + 5
            let yValue = orientationPhoto == "portrait" ? (yPos + 15) * ratioHeight : (yPos) * ratioHeight
            let imageOverlayURL = drawText["stickerUrl"] as! String
            let lastExtension = imageOverlayURL.split(separator: ".")
            let extLast = lastExtension[lastExtension.count - 1]
            if(extLast == "gif"){
                containsGif = true
            }else{
                let imageStickerToDisplay : UIImageView = UIImageView(frame: CGRect(x: xValue, y: yValue, width: imgWidth * ratioWidth , height: imgHeight * ratioWidth ))
                let data = try! Data(contentsOf: URL(string: imageOverlayURL)!)
                imageStickerToDisplay.image = UIImage(data: data)
                imageStickerToDisplay.contentMode = .scaleAspectFit
                if(scaleValue != 0 && rotateValue != 0){
                    imageStickerToDisplay.transform = CGAffineTransform.identity.rotated(by: rotateValue).scaledBy(x: scaleValue, y: scaleValue)
                }else if(scaleValue != 0){
                    imageStickerToDisplay.transform = CGAffineTransform.identity.scaledBy(x: scaleValue, y: scaleValue)
                }else{
                    imageStickerToDisplay.transform = CGAffineTransform.identity.rotated(by: rotateValue)
                }
                currentImageView.addSubview(imageStickerToDisplay)
            }
        }
    }
        
            currentView.addSubview(currentImageView)
            guard let context = UIGraphicsGetCurrentContext() else {
             return
            }
        
            currentView.layer.render(in: context)

            // Create a new image out of the images we have created
            let newImage = UIGraphicsGetImageFromCurrentImageContext()

            // End the context now that we have the image we need
            UIGraphicsEndImageContext()
        
        //GIF Functionality
        var gifURL = [[String:Any]]()
        
        if(containsGif){
            for i in drawArrayText {
                let drawText = i
                let isDeleted = drawText["isDeleted"] as! Bool
                let isSticker = drawText["isSticker"] as! Bool
            if(isDeleted == false && isSticker){
                let imageOverlayURL = drawText["stickerUrl"] as! String
                let orientationPhoto = drawText["orientation"] as! String
                var xPos : CGFloat = drawText["xcoordinate"] as! CGFloat
                var totalTranslateX = drawText["totalTranslateX"] as! CGFloat
                //xPos = xPos + totalTranslateX
                var yPos : CGFloat = drawText["ycoordinate"] as! CGFloat
                let totalTranslateY = drawText["totalTranslateY"] as! CGFloat
                yPos = yPos + totalTranslateY
                var gifWidth: CGFloat = drawText["width"] as! CGFloat
                var gifHeight: CGFloat = drawText["height"] as! CGFloat
                totalTranslateX = totalTranslateX == 0 ? 0 : totalTranslateX
                xPos = xPos + totalTranslateX
                var scaleValue: CGFloat = (drawText["scale"] as! CGFloat)
                scaleValue = scaleValue == 0 ? scaleValue : scaleValue + 0.6
                let rotateValue: CGFloat = drawText["rotation"] as! CGFloat
                if(scaleValue != 0){
                    gifWidth = (gifWidth) * scaleValue
                    gifHeight = (gifHeight) * scaleValue
                }
                let xValue = orientationPhoto == "portrait" ? (xPos * ratioWidth) : (xPos * ratioWidth) - 30
                let imgURL = imageOverlayURL
//                let yValue = orientationPhoto == "portrait" ? currentImageView.frame.height - ycal : currentImageView.frame.height - ycal
                //(yPos + 130) * ratioHeight
                let yValue = orientationPhoto == "portrait" ? (yPos + 130) * ratioHeight : (yPos + 130) * ratioHeight
                let lastExtension = imageOverlayURL.split(separator: ".")
                let extLast = lastExtension[lastExtension.count - 1]
                if(extLast == "gif"){
                    let dictElement = [
                        "URL" : imgURL,
                        "gifCount": 0,
                        "xPos":xValue,
                        "orientation":orientationPhoto,
//                        "yPos":inImage.size.height - (yValue) - (gifWidth * ratioWidth),
                        "yPos":yValue,
                        "gifWidth":gifWidth * ratioWidth,
                        "gifHeight":gifHeight * ratioHeight,
                        "ratioWidth": ratioWidth,
                        "ratioHeight": ratioHeight,
                        "scale":scaleValue,
                        "rotate": rotateValue * (-1)
                        ] as [String : Any]
                    gifURL.append(dictElement)
                    print("GIF DICT",rotateValue,dictElement)
                }
            }
        }
            if #available(iOS 11.0, *) {
                GifToMp4().convertImageWithGifToVideo(newImage!, gifURL: gifURL, completionHandler: {resp in
                    completionHandler(resp)
                })
            } else {
                // Fallback on earlier versions
            }
        }else{
            //Pass the imagepath of saved image back up to the caller
            
                guard let data = newImage!.jpegData(compressionQuality: 1) ?? newImage!.pngData() else {
                      return
                   }
                   guard let directory = try? FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false) as NSURL else {
                       return
                   }
                   do {
                    let formatter = DateFormatter()
                    formatter.dateFormat = "ddMMMyyyyHHmmss" //yyyy
                    let dateString = formatter.string(from: Date())
                    let url = directory.appendingPathComponent("litpicimgwithSticker\(dateString).png")
                        if(FileManager.default.fileExists(atPath: url!.path)){
                           try! FileManager.default.removeItem(atPath: url!.path)
                        }
                       try data.write(to: directory.appendingPathComponent("litpicimgwithSticker\(dateString).png")!)
                       
                        ALAssetsLibrary().writeImage(toSavedPhotosAlbum: newImage!.cgImage, orientation: ALAssetOrientation(rawValue: newImage!.imageOrientation.rawValue)!) { (pathURL, error) in
                            
                        }
                        print("stored Path :\(url) \(url?.absoluteString)")
                        completionHandler(url!.absoluteString)
                   } catch {
                       print(error.localizedDescription)
                       completionHandler("")
                   }
            
        }
    }
    
    @objc public class func saveStickerGifInPhoto(drawArrayText: [[String : Any]], imagepath: String){
        for i in drawArrayText {
            let drawText = i
            let isDeleted = drawText["isDeleted"] as! Bool
            if(isDeleted == false){
                let imageOverlayURL = drawText["stickerUrl"] as! String
                var lastExtension = imageOverlayURL.split(separator: ".")
                var extLast = lastExtension[lastExtension.count - 1]
                if(extLast == "gif"){
                    StickerController().saveGIFSticker(gifURL: imageOverlayURL, stickerObject: drawText) { (resp) in
                        //completionHandler("DONE")
                        return
                    }
                    
                }
            }
        }
    }
    
        @objc public class func getPhotoDetailsFromUrl(imgUrl: String, completionHandler: @escaping (_ param: NSDictionary) -> Void){
                guard let temVideoUrl = URL(string: imgUrl) else { return }
            
                let imagePath:String = temVideoUrl.path
                var inImage = UIImage()
                var fileSize:Int = 0
                let fileManager = FileManager.default
                
                if fileManager.fileExists(atPath: temVideoUrl.path){
                    guard let tempImage = UIImage(contentsOfFile: temVideoUrl.path) else { return }
                        inImage = tempImage
                    guard let imgJpgData = inImage.jpegData(compressionQuality: 1) else { return }
                            let imgData = NSData(data: imgJpgData)
                            fileSize = imgData.count
                }else{
                    let temVideoUrl = URL.init(string: temVideoUrl.path)
                    guard let imgJpgData = inImage.jpegData(compressionQuality: 1) else { return }
                        let imgData = NSData(data: imgJpgData)
                        fileSize = imgData.count
                    guard let imgFromData = UIImage(data: imgData as Data) else { return }
                            inImage = imgFromData
                }

                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-mm-dd HH:mm:ss"
                dateFormatter.string(from: Date())
                let image_name = "litpicimg"
                let image_date = dateFormatter.string(from: Date())
                let image_size = String(format: "%.2f MB", Float(fileSize ?? 0) / 1024.0 / 1024.0)
                let image_width = "\(Int(inImage.size.width))"
                let image_height = "\(Int(inImage.size.height))"
                var photo:[String:Any?] = [
                    "fileName" : image_name,
                    "type" : "photo",
                    "size" : image_size,
                    "created_At" : image_date,
                    "height" : image_height,
                    "width" : image_width,
                    "localPath": temVideoUrl.path,
                    "path" : temVideoUrl.path,
                    "playableDuration": 0,
                    "isStored": true,
                    "isLandscape" : false,
                    "updated_At" : image_date,
                    "frame_rate" : nil,
                    "duration" : nil
                ]
                
                let photoResponse = [
                    "imageData" : photo
                ]
                
                completionHandler(photoResponse as NSDictionary)
        }
    
    //save  gif sticker
    func saveGIFSticker(gifURL: String, stickerObject:[String:Any],completionHandler: @escaping (_ param: String) -> Void){
        let lastExtension = gifURL.split(separator: "?")[0].replacingOccurrences(of: ".gif", with: "")
        
        let data = try! Data(contentsOf: URL(string: gifURL)!)
        let tempUrl = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("temp.mp4")
//        GIF2MP4(data: data)?.convertAndExport(to: tempUrl, completion: {
//            completionHandler("DONE CONVERSION")
//            print("DONE CONVERSION")
//        })
    }
}

extension UIColor {
    func hexStringToUIColor (hex:String) -> UIColor {
        var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        var alphaVal: CGFloat = 1.0
        
        if (cString.hasPrefix("#")) {
            cString.remove(at: cString.startIndex)
        }

        if ((cString.count) == 8) {
            cString = String(cString.prefix(6))
            alphaVal = 0.7
        }else if ((cString.count) != 6 && (cString.count) != 8) {
            return UIColor.gray
        }
        
        var rgbValue:UInt64 = 0
        Scanner(string: cString).scanHexInt64(&rgbValue)

        return UIColor(
            red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
            alpha: CGFloat(alphaVal)
        )
    }
}
