package com.litpic.litpicsdkdroid.camerapreview.rn;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.PointF;
import android.media.AudioManager;
import android.media.MediaActionSound;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.AudioTrimCompletionListener;
import com.litpic.litpicsdkdroid.camerapreview.audioplayer.BackgroundAudioPlayer;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraException;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraListener;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraLogger;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraOptions;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraView;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.PictureResult;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.VideoResult;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Engine;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Facing;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Flash;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Mode;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Preview;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.VideoCodec;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.Filter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.NoFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.AutoFixFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.BlurFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.CSBFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.GrayscaleFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.MonochromeFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.SepiaFilter;
import com.litpic.litpicsdkdroid.camerapreview.model.VideoSegmentData;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.util.Stack;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static com.litpic.litpicsdkdroid.config.Constants.AUDIO_END_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.AUDIO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.AUDIO_START_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.BRIGHTNESS;
import static com.litpic.litpicsdkdroid.config.Constants.CONTRAST;
import static com.litpic.litpicsdkdroid.config.Constants.DURATION;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_ON_PHOTO_CAPTURED;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_VIDEO_CAPTURE_END;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_VIDEO_CAPTURE_START;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_VIDEO_CAPTURE_STOP;
import static com.litpic.litpicsdkdroid.config.Constants.EXCEPTION;
import static com.litpic.litpicsdkdroid.config.Constants.FLASH_ENABLED;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_WIDTH;
import static com.litpic.litpicsdkdroid.config.Constants.SATURATION;
import static com.litpic.litpicsdkdroid.config.Constants.SDK_NAME;
import static com.litpic.litpicsdkdroid.config.Constants.TYPE;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH_URI;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_ROTATION;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_WIDTH;
import static com.litpic.litpicsdkdroid.utils.Logger.message;

@SuppressLint("ViewConstructor")
public class CameraPreviewView extends FrameLayout implements AudioTrimCompletionListener {

    private final ReactApplicationContext reactAppContext;
    private CameraView cameraView;
    private RelativeLayout container;
    private FileUtils fileUtils;
    private File videoFile;
    Filter currentFilter = null;
    private BackgroundAudioPlayer audioPlayer;
    private String audioFileUrl = "";
    private int audioStartPosition;
    private int audioEndPosition;
    private int numberOfSegments;

    private final Stack<VideoSegmentData> segmentData = new Stack<>();
    private final ThemedReactContext context;
    private Flash currentFlash = Flash.OFF;
    private ImageView silhouetteImageView;
    private boolean isImageShadowed;
    private int currentOrientation;
    LifecycleEventListener lifeCycleListener;

    public CameraPreviewView(@NonNull ThemedReactContext context,
                             ReactApplicationContext reactAppContext) {
        super(context);
        this.reactAppContext = reactAppContext;
        this.context = context;
        initUi(context);
    }

    private void initUi(ThemedReactContext context) {
        addRootContainer();
        initLifeCycle();
        initializeCamera(context);
        releaseOrientation();
    }

    public void releaseOrientation() {
        if (reactAppContext != null && reactAppContext.getCurrentActivity() != null) {
            reactAppContext.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
        if (cameraView != null) {
            cameraView.setLockOrientation(false);
        }
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        if (cameraView != null) {
            cameraView.setSnapshotMaxHeight(this.getHeight());
            cameraView.setSnapshotMaxWidth(this.getWidth());
        }
    }

    public void shadowImage(String previousVideoPath) {
        if (isImageShadowed) {
            silhouetteImageView.setVisibility(GONE);
            isImageShadowed = false;
            return;
        }
        if (previousVideoPath != null && !previousVideoPath.isEmpty()) {
            isImageShadowed = true;
            silhouetteImageView.setVisibility(VISIBLE);
            silhouetteImageView.setImageBitmap(MediaUtils.getLastFrame(previousVideoPath));
            silhouetteImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        }
    }

    public void lockOrientation() {
        if (Objects.requireNonNull(context.getCurrentActivity()).getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
            cameraView.setLockOrientation(true);
        }
    }

    private void initLifeCycle() {
        fileUtils = new FileUtils();
        lifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                if (cameraView != null) {
                    cameraView.open();
                }
            }

            @Override
            public void onHostPause() {
                if (cameraView != null) {
                    cameraView.close();
                }
            }

            @Override
            public void onHostDestroy() {
                if (cameraView != null) {
                    cameraView.destroy();
                }
            }
        };
        reactAppContext.addLifecycleEventListener(lifeCycleListener);

        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });

        audioPlayer = new BackgroundAudioPlayer();
    }

    private void addRootContainer() {
        //add root container
        container = new RelativeLayout(getContext());
        container.setGravity(Gravity.CENTER);
        addView(container, MATCH_PARENT, MATCH_PARENT);
    }

    private void initializeCamera(Context context) {

        currentOrientation = getResources().getConfiguration().orientation;

        CameraLogger.setLogLevel(CameraLogger.LEVEL_INFO);

        //add camera view in root layout
        cameraView = new CameraView(context);
        cameraView.setLayoutParams(
                new LayoutParams(MATCH_PARENT, MATCH_PARENT));
        cameraView.setPreview(Preview.GL_SURFACE);
        cameraView.setPlaySounds(true);
        cameraView.setKeepScreenOn(true);
        cameraView.setPreviewFrameRate(Constants.PREVIEW_FRAME_RATE);
        cameraView.setMode(Mode.VIDEO);

        //newly added
        cameraView.setVideoCodec(VideoCodec.H_264);

        //update bitrate
        cameraView.setPreviewFrameRate(30);
        cameraView.setExperimental(true);
        cameraView.setEngine(Engine.CAMERA2);


        if (currentFilter != null) {
            post(new Runnable() {
                @Override
                public void run() {
                    cameraView.setFilter(currentFilter);
                }
            });
        }
        cameraView.setUseDeviceOrientation(false);

        container.addView(cameraView);
        initCameraListener();
        initSilhouette();
        requestLayout();
    }

    private void initSilhouette() {
        silhouetteImageView = new ImageView(context);
        silhouetteImageView.setLayoutParams(cameraView.getLayoutParams());
        silhouetteImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        cameraView.addView(silhouetteImageView);
        silhouetteImageView.bringToFront();
        silhouetteImageView.setAlpha(0.4f);
        isImageShadowed = false;
    }

    private void restartCamera() {
        releaseCamera();
        initializeCamera(context);
        if (cameraView != null) {
            cameraView.open();
        }
    }

    private void releaseCamera() {
        cameraView.clearCameraListeners();
        cameraView.clearFrameProcessors();
        cameraView.close();
        cameraView.destroy();
        cameraView = null;
        container.removeAllViews();
    }

    @Override
    protected void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (currentOrientation != newConfig.orientation) {
            currentOrientation = newConfig.orientation;
            restartCamera();
        }
    }


    public boolean isCameraOpened() {
        return cameraView.isOpened();
    }

    public void switchFlashMode(Callback callback) {
        boolean isFlashIsOn = cameraView.getFlash() == Flash.TORCH;
        cameraView.setFlash(isFlashIsOn ? Flash.OFF : Flash.TORCH);

        WritableMap dataMap = Arguments.createMap();
        dataMap.putBoolean(FLASH_ENABLED, cameraView.getFlash() == Flash.TORCH);
        callback.invoke(dataMap);
    }


    public void flashOnOff(boolean flash) {
        if (flash) {
            currentFlash = Flash.ON;
        } else {
            currentFlash = Flash.OFF;
        }
        setFlash();
    }

    public void setCameraFacing(boolean cameraFacing) {
        if (cameraFacing) {
            cameraView.setFacing(Facing.BACK);
        } else {
            cameraView.setFacing(Facing.FRONT);
        }
        setFlash();
    }

    public void setFlash() {
        if (cameraView != null) {
            cameraView.setFlash(currentFlash);
            WindowManager.LayoutParams lp = Objects.requireNonNull(context.getCurrentActivity()).getWindow().getAttributes();
            if (cameraView.getFacing() == Facing.FRONT) {
                if (cameraView.getFlash() == Flash.ON) {
                    lp.screenBrightness = 1F;
                } else {
                    lp.screenBrightness = 100;
                }
                context.getCurrentActivity().getWindow().setAttributes(lp);
            }
        }
    }

    public void takePhoto() {
	    if (cameraView.isOpened() && !cameraView.isTakingPicture()) {
		    if (cameraView.getFacing() == Facing.FRONT && currentFlash != Flash.OFF) {
			    UiThreadUtil.runOnUiThread(new Runnable() {
				    @Override
				    public void run() {
					    playCaptureSound("shutter");
					    cameraView.takePictureSnapshot();
				    }
			    }, 1000);
		    }else{
			    playCaptureSound("shutter");
			    cameraView.takePictureSnapshot();
		    }
	    }
    }

    public void startVideo() {
        silhouetteImageView.setVisibility(View.GONE);
        if (cameraView.isOpened() && !cameraView.isTakingVideo()) {
            videoFile = new File(fileUtils.getVideoCachePath(reactAppContext));
            if (cameraView.getFlash() != Flash.OFF) {
                cameraView.setFlash(Flash.TORCH);
            }
            videoShootSound(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mediaPlayer) {
                    if (currentFilter == null || currentFilter instanceof NoFilter) {
                        cameraView.takeVideo(videoFile);
                    } else {
                        cameraView.takeVideoSnapshot(videoFile);
                    }
                    if (audioPlayer != null && !audioFileUrl.isEmpty()) {
                        audioStartPosition = audioPlayer.getCurrentPosition();
                        audioPlayer.startAudio();
                    }
                }
            }, 1);
        }
    }

    public void stopVideo() {
        if (cameraView.isOpened() && cameraView.isTakingVideo()) {
            cameraView.stopVideo();
            if (audioPlayer != null && !audioFileUrl.isEmpty()) {
                audioPlayer.pauseAudio();
            }
            if (cameraView.getFlash() != Flash.OFF) {
                cameraView.setFlash(Flash.ON);
            }
            videoShootSound(null, 2);
        }
    }

    @Nullable
    public File getVideoFile() {
        return videoFile;
    }


    public void speedValue(String speedValue) {
        if (audioPlayer != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            audioPlayer.setSpeed(speedValue);
            audioPlayer.pauseAudio();
        }

    }

    public void switchFilter(final ReadableArray args) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {

                if (cameraView.getPreview() != Preview.GL_SURFACE) {
                    message("Filters are supported only when preview is Preview.GL_SURFACE.", true);
                    return;
                }

                if (args == null) {
                    return;
                }

                ReadableMap filter = args.getMap(0);

                float contrast = 0.0f;
                float brightness = 0.0f;
                float saturation = 0.0f;

                String filterType = Objects.requireNonNull(filter).getString(TYPE);

                if (filter.hasKey(CONTRAST) && filter.hasKey(BRIGHTNESS) && filter.hasKey(
                        SATURATION)) {
                    contrast = (float) filter.getDouble(CONTRAST);
                    brightness = (float) filter.getDouble(BRIGHTNESS);
                    saturation = (float) filter.getDouble(SATURATION);
                }

                switch (Objects.requireNonNull(filterType)) {
                    case Constants.CSB:
                        //Contrast Saturation Brightness - Basic Filter
                        CSBFilter csbFilter = new CSBFilter();
                        csbFilter.setParameter1(saturation);
                        csbFilter.setParameter2(contrast);
                        csbFilter.setParameter3(brightness);
                        currentFilter = csbFilter;
                        break;
                    case Constants.GREY_SCALE:
                        currentFilter = new GrayscaleFilter();
                        break;
                    case Constants.SEPIA:
                        currentFilter = new SepiaFilter();
                        break;
                    case Constants.MONOCHROME:
                        currentFilter = new MonochromeFilter();
                        break;
                    case Constants.BLUR:
                        currentFilter = new BlurFilter();
                        break;
                    case Constants.BEAUTY:
                        currentFilter = new AutoFixFilter();
                        break;
                    default:
                        currentFilter = new NoFilter();
                        break;
                }
                cameraView.setFilter(currentFilter);
            }
        });
    }

    private void initCameraListener() {
        cameraView.addCameraListener(new CameraListener() {
            @Override
            public void onCameraOpened(@NonNull CameraOptions options) {
                super.onCameraOpened(options);
                setFlash();
            }

            @Override
            public void onCameraClosed() {
                super.onCameraClosed();
                Log.d("@@@", "onCamerClosed");
            }

            @Override
            public void onCameraError(@NonNull CameraException exception) {
                super.onCameraError(exception);
                cameraView.restart();
            }

            @Override
            public void onPictureTaken(@NonNull PictureResult result) {
                super.onPictureTaken(result);
                String filePath = fileUtils.savePhoto(result.getData(), reactAppContext);
                WritableMap imageResponse = Arguments.createMap();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    Log.e("Content Uri", "-" + Uri.parse(filePath).getPath());
                    imageResponse.putString(IMAGE_PATH, Uri.parse(filePath).getPath());
                } else {
                    imageResponse.putString(IMAGE_PATH, Uri.fromFile(new File(filePath)).toString());
                }
                imageResponse.putInt(IMAGE_HEIGHT, result.getSize().getHeight());
                imageResponse.putInt(IMAGE_WIDTH, result.getSize().getWidth());
                sendEvent(reactAppContext, EVENT_ON_PHOTO_CAPTURED, imageResponse);
            }

            @Override
            public void onVideoTaken(@NonNull VideoResult result) {
                super.onVideoTaken(result);
                WritableMap imageResponse = Arguments.createMap();
                imageResponse.putString(VIDEO_PATH, result.getFile().getPath());
                imageResponse.putString(VIDEO_PATH_URI, Uri.fromFile(result.getFile()).toString());
                imageResponse.putInt(VIDEO_HEIGHT, result.getSize().getHeight());
                imageResponse.putInt(VIDEO_WIDTH, result.getSize().getWidth());
                imageResponse.putInt(VIDEO_ROTATION, result.getRotation());

                if (audioPlayer != null && !audioFileUrl.isEmpty()) {
                    audioEndPosition = audioPlayer.getCurrentPosition();
                    segmentData.push(new VideoSegmentData(audioFileUrl, audioStartPosition,
                            audioEndPosition));
                    int duration = MediaUtils.getVideoDuration(context, result.getFile().getPath());
                    imageResponse.putInt(AUDIO_START_POSITION, (audioStartPosition));
                    imageResponse.putInt(AUDIO_END_POSITION, (audioEndPosition));
                    imageResponse.putString(AUDIO_PATH, audioFileUrl);
                    imageResponse.putInt(DURATION, duration);
                    if (audioPlayer.isCompleted()) {
                        audioFileUrl = "";
                        audioStartPosition = -1;
                        audioEndPosition = -1;
                    } else if (duration > 0 && (audioEndPosition - audioStartPosition) > duration) {
                        //result get max duration returns zero
                        audioPlayer.seekTo(audioStartPosition + duration);
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        audioPlayer.clearSpeed();
                    }
                } else {
                    //update start position and end position as -1
                    imageResponse.putInt(AUDIO_START_POSITION, -1);
                    imageResponse.putInt(AUDIO_END_POSITION, -1);
                    imageResponse.putString(AUDIO_PATH, "");
                    segmentData.push(new VideoSegmentData("", -1, -1));
                }
                numberOfSegments++;
                sendVideoEndEvent(imageResponse);
            }

            @Override
            public void onOrientationChanged(int orientation) {
                super.onOrientationChanged(orientation);
                Log.d("@@@@", "on orientation changed----" + orientation);
            }

            @Override
            public void onAutoFocusStart(@NonNull PointF point) {
                super.onAutoFocusStart(point);
                Log.d("@@@", "onAutoFocusStart -------- point ->" + point);
            }

            @Override
            public void onAutoFocusEnd(boolean successful, @NonNull PointF point) {
                super.onAutoFocusEnd(successful, point);
                Log.d("@@@", "onAutoFocusEnd -------- point ->" + point);
            }

            @Override
            public void onZoomChanged(float newValue, @NonNull float[] bounds,
                                      @Nullable PointF[] fingers) {
                super.onZoomChanged(newValue, bounds, fingers);
                Log.d("@@@", "onZoomChanged --------- ");
            }

            @Override
            public void onExposureCorrectionChanged(float newValue, @NonNull float[] bounds,
                                                    @Nullable PointF[] fingers) {
                super.onExposureCorrectionChanged(newValue, bounds, fingers);
                Log.d("@@@", "onExposureCorrectionChanged ------");
            }

            @Override
            public void onVideoRecordingStart() {
                super.onVideoRecordingStart();
                sendVideoStartEvent();
            }

            @Override
            public void onVideoRecordingEnd() {
                super.onVideoRecordingEnd();
                sendVideoStopEvent();
                Log.d("@@@", "onVideoRecordingEnd");
            }
        });
    }

    private void sendEvent(ReactContext reactContext, String eventName,
                           @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    private void sendVideoStartEvent() {
        WritableMap imageResponse = Arguments.createMap();
        imageResponse.putString(VIDEO_PATH_URI, Uri.fromFile(videoFile).toString());
        imageResponse.putString(VIDEO_PATH, videoFile.getAbsolutePath());
        sendEvent(reactAppContext, EVENT_VIDEO_CAPTURE_START, imageResponse);
    }

    private void sendVideoStopEvent() {
        WritableMap imageResponse = Arguments.createMap();
        imageResponse.putString(VIDEO_PATH_URI, Uri.fromFile(videoFile).toString());
        imageResponse.putString(VIDEO_PATH, videoFile.getAbsolutePath());
        sendEvent(reactAppContext, EVENT_VIDEO_CAPTURE_STOP, imageResponse);
    }

    private void sendVideoEndEvent(WritableMap imageResponse) {
        sendEvent(reactAppContext, EVENT_VIDEO_CAPTURE_END, imageResponse);
    }

    public void unMountCamera() {
        cameraView.close();
    }

    public void setAudioFileToPlayer(String path) {
        if (path != null && !path.isEmpty()) {
            this.audioFileUrl = path;
            audioPlayer.setAudio(path);
        } else {
            this.audioFileUrl = "";
            audioPlayer.stopAudio();
        }
    }

    public void removeLastSegment() {
        silhouetteImageView.setVisibility(GONE);
        isImageShadowed = false;

        if (!segmentData.isEmpty()) {
            VideoSegmentData videoSegmentData = segmentData.lastElement();
            if (!videoSegmentData.getAudioUrl().isEmpty() &&
                    videoSegmentData.getStartPosition() != -1 &&
                    videoSegmentData.getEndPosition() != -1) {
                if (videoSegmentData.getAudioUrl().equals(audioFileUrl)) {
                    audioStartPosition = videoSegmentData.getStartPosition();
                    audioPlayer.seekTo(audioStartPosition);
                } else {
                    setAudioFileToPlayer(videoSegmentData.getAudioUrl());
                    audioStartPosition = videoSegmentData.getStartPosition();
                    audioPlayer.seekTo(audioStartPosition);
                }
                segmentData.pop();
            } else {
                segmentData.pop();
            }
        }
        numberOfSegments--;
    }

    @Override
    public void onAudioTrimmingCompleted(String outputPath) {
        audioFileUrl = outputPath;
        setAudioFileToPlayer(outputPath);
    }

    //play sound on capturing image
    public void playCaptureSound(String soundValue) {
        AudioManager audio = (AudioManager) reactAppContext.getSystemService(Context.AUDIO_SERVICE);
        if (audio.getRingerMode() == AudioManager.RINGER_MODE_NORMAL) {
            MediaActionSound sound = new MediaActionSound();
            if (Constants.SHUTTER.equals(soundValue)) {
                sound.play(MediaActionSound.SHUTTER_CLICK);
            }
        }
    }

    /*
     *1 Record Start
     *2 Record Stop
     */
    public void videoShootSound(MediaPlayer.OnCompletionListener mediaPlayerCompletionListener, int mode) {
        String audioFile = "";
        if (mode == 1) {
            audioFile = "VideoRecord.ogg";
        } else if (mode == 2) {
            audioFile = "VideoStop.ogg";
        }
        startSound(audioFile, mediaPlayerCompletionListener);
    }

    private void startSound(String filename, final MediaPlayer.OnCompletionListener mediaPlayerCompletionListener) {
        MediaPlayer videoCaptureMediaPlayer = new MediaPlayer();
        try {
            if (Build.VERSION.SDK_INT <= 28) {
                videoCaptureMediaPlayer.setDataSource(new File("/system/media/audio/ui/" + filename).getAbsolutePath());
            } else {
                videoCaptureMediaPlayer.setDataSource(new File("/product/media/audio/ui/" + filename).getAbsolutePath());
            }
            videoCaptureMediaPlayer.prepare();
        } catch (IOException e) {
            Log.e(SDK_NAME, EXCEPTION, e);
        }
        videoCaptureMediaPlayer.start();
        videoCaptureMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mediaPlayer) {
                if (mediaPlayerCompletionListener != null) {
                    mediaPlayerCompletionListener.onCompletion(mediaPlayer);
                    mediaPlayer.reset();
                    mediaPlayer.release();
                }
            }
        });
    }

    public void openCamera(boolean args) {
        if (args) {
            if (cameraView != null) {
                cameraView.open();
            }
        } else {
            if (cameraView != null) {
                cameraView.close();
            }
        }
    }

    public void releaseListeners() {
        reactAppContext.removeLifecycleEventListener(lifeCycleListener);
    }

	/**
	 * @param loaderStatus set camera preview pause/resume
	 */
    public void setLoaderStatus(boolean loaderStatus) {
        if (loaderStatus) {
            if (cameraView.isOpened()) {
                cameraView.close();
            }
        } else {
            if (!cameraView.isOpened()) {
                cameraView.open();
            }
        }
    }

	/**
	 * @param isVideoProcessing true when video processed with ffmpeg
	 */
    public void setMusicPickerState(boolean isVideoProcessing) {
    	setLoaderStatus(isVideoProcessing);
	}
}