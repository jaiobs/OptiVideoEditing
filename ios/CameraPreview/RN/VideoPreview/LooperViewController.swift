/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information
 
 Abstract:
 A view controller that shows video looping playback via an object that implements the Looper protocol.
 */

import UIKit

@objc open class LooperViewController: UIViewController {
    // MARK: Properties
    public typealias  DissmissBlock = () -> Void
    @objc open var onDismiss: DissmissBlock?
    
    var looper: Looper?
    @objc public var captureFile:URL?
    
    // MARK: UIViewController
    
    override public func viewDidLoad() {
        super.viewDidLoad()
    }
    
    open override func viewDidLayoutSubviews() {
        if #available(iOS 10.0, *) {
            looper = PlayerLooper.init(videoURL: captureFile!, loopCount: -1)
        } else {
            
        }
        
        looper?.start(in: view.layer)
        let closeButton = UIButton()
        closeButton.frame = CGRect.init(x: 10, y: 44, width: 50, height: 50)
        closeButton.setImage(UIImage.init(named: "cross"), for: .normal)
        closeButton.backgroundColor = UIColor.init(red: 0, green: 0, blue: 0, alpha: 0.3)
        closeButton.layer.cornerRadius = 25
        closeButton.addTarget(self, action:#selector(self.pressed), for: .touchUpInside)
        self.view.addSubview(closeButton)
    }
    
    @objc public func pressed(sender: UIButton!) {
        self.dismiss(animated: false, completion: {
            self.looper?.stop()
        })
    }
    
    override public func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if self.isBeingDismissed {
            self.onDismiss?()
        }
    }
}
