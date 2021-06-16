# OptiVideoEditing
### react-native-OptiVideoEditing-camera-module

## Status
![Status](https://github.com/OptiVideoEditing-live/CameraSDK/workflows/Release%20Workflow/badge.svg)
## Usage

### Getting started

```
$ npm install @OptiVideoEditing/react-native-OptiVideoEditing-camera-module --save
```

### Link Native Libraries

```
$ react-native link @OptiVideoEditing/react-native-OptiVideoEditing-camera-module
```

### Use the module
```javascript
import { OptiVideoEditingCameraModule } from "@OptiVideoEditing/react-native-OptiVideoEditing-camera-module";

<OptiVideoEditingCameraModule
  ref={(ref) => (this.OptiVideoEditingCam = ref)}
  OnPictureComplete={(imageData) => {}}
  OnVideoComplete={(videoData) => {}}
  onCameraPreviewMount={() => {}}
  onCameraPreviewUnMount={() => {}}
  baseURL={""}
  authToken={""}
  hideCameraButton={true}
/>;
```

### **Dev-dependencies:**

add these dependencies in package.json file

```javascript
"dependencies": {
    "@react-native-community/cameraroll": "^1.3.0",
    "@react-native-community/slider": "^2.0.7",
    "react-native-animatable": "^1.3.3",
    "react-native-gesture-handler": "^1.6.0",
    "react-native-image-crop-picker": "^0.26.2",
    "react-native-modal": "^11.5.4",
    "react-native-reanimated": "^1.7.0",
    "react-native-screens": "^1.0.0-alpha.23",
    "react-navigation": "^4.2.1",
    "react-navigation-stack": "^1.10.3",
    "react-redux": "^7.2.0",
    "redux": "^4.0.5",
    "redux-thunk": "^2.3.0"
}

```

## Callbacks

### `OnPictureComplete`
This callback method will trigger when click on next icon which is in right bottom of camera preview. This button will be enabled once picture has taken or preview editing is completed by user. It will be thrown below values as response from the component

#### Response:
```
Image: {
    fileName:
    type:
    size:
    height:
    width:
    path:
    isLandscape:
    created_At:
    updated_At:
}
```
### `onVideoComplete`
This callback method will trigger when click on next icon which is in right bottom of camera preview. This button will be enabled once video has taken or preview editing is completed by user. It will be thrown below values as response from the component.

#### Response:
```
Video: {
    fileName:
    type:
    size:
    duration:
    created_At:
    height:
    width:
    path:
    isLandscape:
    duration:
    frame_rate:
    cropPosition:{x:0,y:0}
    updated_At:
}
```
## Keys and definitions

* `fileName`: which refers the name of the file. It will be auto generated as unique name by dynamically.
* `type`: which refers the type of the file.
* `size`: which refers the size of the file.
* `created_At`: which refers creation time of the file.
* `height`: which refers height pixel for the file.
* `width`: which refers width pixel for the file.
* `path`: which refers the file path which is file stored in device memory locally.
* `isLandscape`: which is return true if landscape otherwise false.
* `cropPosition`: when the video is landscape will share the top left corner X,Y pixel positions for showing cropped video section in portrait.
* `updated_At`: which refers updated time of the file.

## API

* `getLastImage`: returns last image object in response
* `getLastVideo`: returns last video object in response
* `resetCameraPreview`: for returning to camera screen and refresh the camera view
* `startCapture`: for start/resume video capture
* `stopCapture`: for stop video capture
* `doneCapture`: for finish video capture
* `takePhoto`: for taking photo

## Usage

```javascript
this.OptiVideoEditingCam.getLastImage((imageData) => console.log(imageData));
```

### Integration:

#### iOS:

Permissions need to be added to the `Info.plist` file:

* `NSAppleMusicUsageDescription`
* `NSCameraUsageDescription`
* `NSLocationWhenInUseUsageDescription`
* `NSMicrophoneUsageDescription`
* `NSPhotoLibraryAddUsageDescription`
* `NSPhotoLibraryUsageDescription`
