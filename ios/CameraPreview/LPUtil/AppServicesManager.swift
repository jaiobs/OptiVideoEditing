//
//  AppServicesManager.swift
//  PluggableAppDelegate
//
//  Created by Fernando Ortiz on 2/24/17.
//  Modified by Mikhail Pchelnikov on 31/07/2018.
//  Copyright © 2018 Michael Pchelnikov. All rights reserved.
//

import UIKit
import UserNotifications

/// This is only a tagging protocol.
/// It doesn't add more functionalities yet.

@objc public protocol ApplicationService: UIApplicationDelegate, UNUserNotificationCenterDelegate {
    
}

extension ApplicationService {
    public var window: UIWindow? {
        return UIApplication.shared.delegate?.window ?? nil
    }
}

open class PluggableApplicationDelegate: UIResponder, UIApplicationDelegate {

    public var window: UIWindow?

    open var services: [ApplicationService] { return [] }

    lazy var _services: [ApplicationService] = {
        return self.services
    }()

    @discardableResult
    internal func apply<T, S>(_ work: (ApplicationService, @escaping (T) -> Void) -> S?, completionHandler: @escaping ([T]) -> Void) -> [S] {
        let dispatchGroup = DispatchGroup()
        var results: [T] = []
        var returns: [S] = []

        for service in _services {
            dispatchGroup.enter()
            let returned = work(service, { result in
                results.append(result)
                dispatchGroup.leave()
            })
            if let returned = returned {
                returns.append(returned)
            } else { // delegate doesn't impliment method
                dispatchGroup.leave()
            }
        }

        dispatchGroup.notify(queue: .main) {
            completionHandler(results)
        }
        return returns
    }
    
    open func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        var result = false
        for service in _services {
            if service.application?(application, didFinishLaunchingWithOptions: launchOptions) ?? false {
                result = true
            }
        }
        return result
    }
    
    
    @available(iOS 2.0, *)
    open func applicationDidBecomeActive(_ application: UIApplication) {
        for service in _services {
            service.applicationDidBecomeActive?(application)
        }
    }

   open func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
       switch (DeviceSingleton.sharedInstance().IsLockDirection) {
       case .portrait:
           return  .portrait;

       case .landscapeLeft:
           return .landscapeLeft ;

       case .landscapeRight:
           return  .landscapeRight;
        
       case .unknown:
        return .allButUpsideDown;

         default:
           return  .allButUpsideDown;

       }
   }
}



@objc public class DeviceSingleton: NSObject {

    @objc static let shared = DeviceSingleton()
    public var IsLockDirection:UIInterfaceOrientation = UIInterfaceOrientation.unknown
    public var blockRotation: Bool?
    
    private override init() {
        
    }
    
   @objc class public func sharedInstance() -> DeviceSingleton {
        return DeviceSingleton.shared
    }
    
    
    @objc public func getDeviceOrientation() -> UIInterfaceOrientation {
        return DeviceSingleton.sharedInstance().IsLockDirection
     }
    
   @objc public func UpdateDeviceOrienation(orientation: UIInterfaceOrientation){
        IsLockDirection = orientation
    }
    
   @objc public func BlockOrienation(IsLock:Bool){
        blockRotation = IsLock
    }
}


import UIKit

public class VideoSingleton: NSObject
{
   
    private static var instance: VideoSingleton?
  
    @objc public var VideoSegment:NSMutableArray?
    @objc public var AudioSegment:NSMutableArray?
    @objc public var TemAudioSegment:NSMutableArray?
    @objc public var originalVideoUrl:URL?
    @objc public var temVideoSegment:NSMutableArray?
    @objc public var temVideoUrl:URL?

    @objc public   class var sharedInstance: VideoSingleton
    {
        if instance == nil
        {
            instance = VideoSingleton()
        }

        return instance!
    }

    @objc public  func dispose(){
        VideoSingleton.instance = nil
        print("Disposed Singleton instance")
    }

}
