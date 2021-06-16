require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-litpic-camera-module"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-litpic-camera-module
                   DESC
  s.homepage     = "https://github.com/jaiobs/react-native-litpic-camera-module"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "mauriceyi" => "mauriceyi@gmail.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/jaiobs/react-native-litpic-camera-module.git", :tag => "#{s.version}" }


  s.source_files = "ios/**/*.{h,m,swift,metal}"
  s.requires_arc = true
  s.swift_version = "4.2"

s.private_header_files = 'ios/CameraPreview/LPCamera/CameraUtil/LiveFilter/Shaders/BBMetalShaderTypes.h'

  s.dependency "React"
  # ...
  # s.dependency "..."
end

