package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;
import android.util.Log;

import androidx.annotation.NonNull;

import com.arthenica.mobileffmpeg.Config;
import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.io.File;
import java.io.IOException;
import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.EXCEPTION;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH_URI;

/**
 * Inherited by ReactContextBaseJava to implement ffmpeg process
 * react-native bridging
 */
public class FfmpegProcessModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext context;

    private final FfmpegtaskScheduler ffmpegtaskScheduler;
    private final FFMpegCommands ffMpegCommands;


    FileUtils fileUtils;
    private final String tag = getClass().getSimpleName();

    public FfmpegProcessModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);

        fileUtils = new FileUtils();

        ffmpegtaskScheduler = new FfmpegtaskScheduler();
        this.context = reactContext;
        ffMpegCommands = new FFMpegCommands(context);
    }

    /**
     * get name of module
     */
    @NonNull
    @Override
    public String getName() {
        return "FfmpegProcessor";
    }

    /**
     * process the FFMpeg commands with arthenica ffmpeg
     *
     * @param commands:   string commands
     * @param outPutPath: output path
     * @param callback:   react-native callback object
     */
    private void executeFfmpegCommand(String[] commands, final String outPutPath,
                                      final Callback callback) {

        FFmpeg.executeAsync(commands, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                Log.d(tag, "excecuteFfmpegCommand " + returnCode + " \ncommand" + Config.getLastCommandOutput());
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    if (callback != null) {
                        returnVideoCallback(callback, outPutPath);
                    }

                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, Config.getLastCommandOutput());
                }
            }
        });
    }

    /**
     * return videopath to react-native end
     *
     * @param callback: task callback
     * @param filePath: output video path
     */
    private void returnVideoCallback(Callback callback, String filePath) {
        //send callback for js with file path
        WritableMap dataMap = Arguments.createMap();
        dataMap.putString(VIDEO_PATH, filePath);
        callback.invoke(dataMap);
    }

    /**
     * get trimmed video from path
     *
     * @param path:         video path
     * @param startingTime: starting time of the video
     * @param endingTime:   ending time of the video
     */
    @ReactMethod
    private void trimVideo(final String path, final Double startingTime, final Double endingTime,
                           final Callback cb) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                final String filePath = fileUtils.getVideoCachePath(context);
                executeFfmpegCommand(
                        ffMpegCommands.getTrimVideoCommands(path, filePath, startingTime, endingTime),
                        filePath, cb);
            }
        });
    }

    /**
     * get trimmed video from path
     */
    @ReactMethod
    public void setVideoSpeed(final String speed, final String filePath, String audioPath,
                              int audioStartPosition, int audioEndPosition) {
        //check is have reverse option

        if (speed.equals(Constants.REVERSE)) {
            reverseVideo(filePath, audioPath, audioStartPosition, audioEndPosition);
        } else if (speed.equals(Constants.NORMAL)) {
            normalVideo(filePath, audioPath, audioStartPosition, audioEndPosition);
        } else {
            if (audioPath != null && !audioPath.isEmpty() && audioStartPosition >= 0) {
                setVideoSpeedWithAudio(speed, filePath, audioPath, audioStartPosition, audioEndPosition);
            } else {
                setSpeedToVideo(speed, filePath);
            }
        }
    }

    /**
     * merge audio with video
     *
     * @param audioPath:          input audio
     * @param filePath:           input video
     * @param audioStartPosition: append audio start position
     * @param audioEndPosition:   append audio end position
     */
    private void normalVideo(final String filePath, final String audioPath,
                             final int audioStartPosition, final int audioEndPosition) {
        if (audioPath != null && !audioPath.isEmpty() && audioStartPosition >= 0) {
            final String destinationPath = fileUtils.getVideoCachePath(context);
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    ffmpegtaskScheduler.addVideoSpeedTask(
                            new VideoSpeedTasks(ffMpegCommands.getNormalVideoCommands(filePath,
                                    destinationPath,
                                    audioPath,
                                    audioStartPosition,
                                    audioEndPosition), filePath, destinationPath));
                }
            }, 200);
        } else {
            // normal video without audio selected
            Log.e("@@@", "normal video without music->" + filePath);
        }
    }

    /**
     * reverse the video
     *
     * @param videoPath:          input video
     * @param audioPath:          input audio
     * @param audioStartPosition: starting position to append audio
     * @param audioEndPosition:   ending position to append audio
     */
    private void reverseVideo(final String videoPath, final String audioPath, final int audioStartPosition, final int audioEndPosition) {
        final String destinationPath = fileUtils.getVideoCachePath(context);
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                ffmpegtaskScheduler.addVideoSpeedTask(
                        new VideoSpeedTasks(ffMpegCommands.getReverseVideoCommands(videoPath, destinationPath, audioPath, audioStartPosition, audioEndPosition), videoPath, destinationPath));
            }
        }, 200);
    }

    /**
     * increase speed of the video
     *
     * @param speed:    set video speed
     * @param filePath: output path
     */
    private void setSpeedToVideo(final String speed, final String filePath) {
        final String destinationPath = fileUtils.getVideoCachePath(context);
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                ffmpegtaskScheduler.addVideoSpeedTask(
                        new VideoSpeedTasks(ffMpegCommands.getSpeedVideoCommands(speed, filePath, destinationPath),
                                filePath,
                                destinationPath));
            }
        }, 200);
    }

    /**
     * get trimmed video from path
     */
    private void setVideoSpeedWithAudio(final String speed, final String filePath,
                                        final String audioFilePath, final int startPosition, final int audioEndPosition) {
        final String destinationPath = fileUtils.getVideoCachePath(context);

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                ffmpegtaskScheduler.addVideoSpeedTask(
                        new VideoSpeedTasks(ffMpegCommands.getVideoSpeedWithAudioCommands(speed, filePath, destinationPath, audioFilePath, startPosition, audioEndPosition), filePath, destinationPath));
            }
        }, 200);
    }

    /**
     * get concat video file from multiple videos
     *
     * @param videos:  array of video files
     * @param callback : callback which send to js after completion
     */
    @ReactMethod
    public void concatVideos(final ReadableArray videos, final Callback callback) {
        // Create a media file name
        final String destinationPath = fileUtils.getVideoCachePath(context);

         int height = MediaUtils.getVideoHeight(context, Objects.requireNonNull(videos.getMap(0)).getString(Constants.URI));
         int width = MediaUtils.getVideoWidth(context, Objects.requireNonNull(videos.getMap(0)).getString(Constants.URI));
         boolean isAnamorphic = MediaUtils.isAnamorphic(context, Objects.requireNonNull(videos.getMap(0)).getString(Constants.URI));
        if (isAnamorphic){
            int tempWidth = width;
            width = height ;
            height = tempWidth;
        }
        String[] cmd;
        if (videos.size() == 1) {
            ReadableMap obj = videos.getMap(0);
            String videoUrl = "";
            if (obj != null) {
                videoUrl = obj.getString(Constants.URI);
            }
            cmd = ffMpegCommands.getCodecAndProfileUpdateCommand(videoUrl, destinationPath);
            ffmpegtaskScheduler.addVideoMergeTask(new VideoMergeTasks(cmd, callback, destinationPath));
        } else {
            cmd = ffMpegCommands.getConcatMultiVideoWithCRFCommands(videos, width, height, destinationPath);
            ffmpegtaskScheduler.addVideoMergeTask(new VideoMergeTasks(cmd, callback, destinationPath));
        }
    }




    /**
     * get compress video file from sumal size
     *
     * @param video    :  uri
     * @param callback : callback which send to js after completion
     */
    @ReactMethod
    public void compressVideo(final String video, final Callback callback) {


        final String destinationPath = fileUtils.getVideoCachePath(context);
        FFmpeg.executeAsync(ffMpegCommands.getCRFCompressVideoCommands(video, destinationPath), new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                Log.d(tag, "compressVideo" + returnCode + " \ncommand" + Config.getLastCommandOutput());
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.d(tag, Config.getLastCommandOutput());
                    try {
                        ffmpegtaskScheduler.onVideoCompress(new CompressVideo(callback, destinationPath));
                    } catch (Exception e) {
                        Log.d("@@@", e.getMessage());
                    }
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, Config.getLastCommandOutput());
                }
            }
        });
    }

    @ReactMethod
    public void addMovAtomToVideo(final String videoPath, final Callback callback) {
        final String destinationPath = fileUtils.getVideoCachePath(context);
        FFmpeg.executeAsync(ffMpegCommands.getAddMovAtomToVideoCommand(videoPath, destinationPath), new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                Log.d(tag, "JK RETURN_CODE_SUCCESS " + returnCode + " \nLastCommand" + Config.getLastCommandOutput());
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.d(tag, Config.getLastCommandOutput());
                    try {
                        returnVideoData(callback, destinationPath);
                    } catch (Exception e) {
                        Log.d("error", "CompressVedio_Exception error");
                    }
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, Config.getLastCommandOutput());
                }
            }
        });
    }

    /**
     * generates video from images
     *
     * @param callback: task callback
     * @param images:   array of images
     */
    @ReactMethod
    public void convertImagesToVideo(final ReadableArray images, final Callback callback) {
        final String destinationPath = fileUtils.getVideoCachePath(context);
        int finalWidth = Constants.PIXELS_9;
        int finalHeight = Constants.PIXELS_16;
        FFmpeg.executeAsync(ffMpegCommands.getConvertImagesToVideoCommand(images, finalWidth, finalHeight, destinationPath), new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                Log.d(tag, "JK RETURN_CODE_SUCCESS " + returnCode + " \nLastCommand" + Config.getLastCommandOutput());
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.d("FFMPEG", "onSuccess " + Config.getLastCommandOutput());

                    Log.d("FFmpeg", "onFinish");
                    try {
                        returnVideoData(callback, destinationPath);
                    } catch (Exception e) {
                        Log.d("error", "convertImagesToVideo error");
                    }
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d("FFMPEG", "onSuccess " + Config.getLastCommandOutput());
                }
            }
        });
    }

    /**
     * return videopath to react-native end
     *
     * @param callback: task callback
     * @param filePath: output video path
     */
    private void returnVideoData(Callback callback, String filePath) {
        try {
            WritableMap dataMap = Arguments.createMap();
            dataMap.putString(VIDEO_PATH, filePath);
            dataMap.putString(VIDEO_PATH_URI, Uri.fromFile(new File(filePath)).toString());
            callback.invoke(dataMap);
        } catch (Exception e) {
            Log.d("@@@ : ", "returnVideoVedioCompress" + e);
        }
    }

    @ReactMethod
    public void copyFilesToCache(final ReadableArray videos, final Callback callback) {
        final WritableArray array = Arguments.createArray();
        for (int index = 0; index < videos.size(); index++) {
            WritableMap map = Arguments.createMap();
            map.merge(videos.getMap(index));
            if (FileUtils.isSharedVideoFromOtherDir(context, map.getString(VIDEO_PATH))) {
                String cacheUrl = "";
                try {
                    cacheUrl = FileUtils.copyFileToCache(context, map.getString(VIDEO_PATH));
                } catch (IOException e) {
                    Log.d("@@@", EXCEPTION, e);
                }
                if (!cacheUrl.isEmpty()) {
                    map.putString(VIDEO_PATH, cacheUrl);
                }
            }
            array.pushMap(map);
        }
        if (callback != null) {
            callback.invoke(array);
        }
    }

    @ReactMethod
    public void copyImagesToCache(final ReadableArray videos, final Callback callback) {
        final WritableArray array = Arguments.createArray();
        for (int index = 0; index < videos.size(); index++) {
            WritableMap map = Arguments.createMap();
            map.merge(videos.getMap(index));
            if (FileUtils.isSharedVideoFromOtherDir(context, map.getString(IMAGE_PATH))) {
                String cacheUrl = "";
                try {
                    cacheUrl = FileUtils.copyFileToCache(context, map.getString(IMAGE_PATH));
                } catch (IOException e) {
                    Log.d("@@@", EXCEPTION, e);
                }
                if (!cacheUrl.isEmpty()) {
                    map.putString(IMAGE_PATH, cacheUrl);
                }
            }
            array.pushMap(map);
        }
        if (callback != null) {
            callback.invoke(array);
        }
    }
}
