//
//  BlurPosition.swift
//  litpic
//
//  Created by optisol on 03/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

/// Normalized position with coordinate values from 0.0 to 1.0
public struct BlurPosition {
  public var x: Float
  public var y: Float
  
  public init(x: Float, y: Float) {
    self.x = x
    self.y = y
  }
  
    
  public static let center = BlurPosition(x: 0.5, y: 0.5)
}
