package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import android.net.Uri;
import android.util.Log;

import com.arthenica.mobileffmpeg.Config;
import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.arthenica.mobileffmpeg.FFmpegExecution;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH_URI;

class FfmpegtaskScheduler {

    private final List<Long> videoSpeedTasks = new ArrayList<>();
    private final List<Long> videoMergeTasks = new ArrayList<>();
    private final List<VideoMergeTasks> videoMergeTasksCommands = new ArrayList<>();
    private final String tag = getClass().getSimpleName();

    void addVideoSpeedTask(VideoSpeedTasks videoSpeedTask) {
        executeVideoSpeedTask(videoSpeedTask);
    }

    void addVideoMergeTask(VideoMergeTasks videoMergeTask) {
        if (videoSpeedTasks.isEmpty()) {
            executeVideoMergeTasks(videoMergeTask);
        } else {
            videoMergeTasksCommands.add(videoMergeTask);
        }
    }

    void executeVideoSpeedTask(final VideoSpeedTasks videoSpeedTask) {
        long executionId = FFmpeg.executeAsync(videoSpeedTask.command, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.d(tag, Config.getLastCommandOutput());
                    onVideoSpeedTaskDone(videoSpeedTask);

                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, Config.getLastCommandOutput());
                }
            }
        });
        videoSpeedTasks.add(executionId);
    }

    void executeVideoMergeTasks(final VideoMergeTasks videoMergeTask) {
        if (videoMergeTask.isSingleVideo && !videoMergeTask.filePath.isEmpty()) {
            onVideoMergeDone(videoMergeTask);
        } else {
            long executionId = FFmpeg.executeAsync(videoMergeTask.command, new ExecuteCallback() {
                @Override
                public void apply(long executionId, int returnCode) {
                    Log.e(tag, "JK RETURN_CODE_SUCCESS " + returnCode + " \nLastCommand" + Config.getLastCommandOutput());
                    if (returnCode == Config.RETURN_CODE_SUCCESS) {
                        Log.d("FFMPEG", "onSuccess " + Config.getLastCommandOutput());
                        onVideoMergeDone(videoMergeTask);

                    } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                        Log.d("FFMPEG", "onSuccess " + Config.getLastCommandOutput());
                    }
                }
            });
            videoMergeTasks.add(executionId);
        }
    }

    private void onVideoSpeedTaskDone(VideoSpeedTasks videoSpeedTask) {
        updateScheduleTasks();
        //execute callback
        Log.i(tag, "isFileDeleted "+new File(videoSpeedTask.filePath).delete());      // NOSONAR
        rename(new File(videoSpeedTask.destinationPath), new File(videoSpeedTask.filePath));
        //check for next schedule
        checkForNextSchedule();
    }

    public void onVideoCompress(CompressVideo compressVedio) {
        returnVideoVedioCompress(compressVedio.callback, compressVedio.filePath);
    }

    private void onVideoMergeDone(VideoMergeTasks videoMergeTask) {
        videoMergeTasksCommands.remove(videoMergeTask);
        updateScheduleTasks();
        returnVideoCallback(videoMergeTask.callback, videoMergeTask.filePath);
    }

    private void updateScheduleTasks() {
        if (!videoSpeedTasks.isEmpty()) {

            for (int i = 0; i < videoSpeedTasks.size(); i++) {
                if (!isExecutionId(videoSpeedTasks.get(i))) {
                    videoSpeedTasks.remove(videoSpeedTasks.get(i));
                }
            }
        }

        if (!videoMergeTasks.isEmpty()) {

            for (int i = 0; i < videoMergeTasks.size(); i++) {
                if (!isExecutionId(videoMergeTasks.get(i))) {
                    videoMergeTasks.remove(videoMergeTasks.get(i));
                }
            }
        }
    }

    private void checkForNextSchedule() {
        if (!videoMergeTasksCommands.isEmpty()) {
            executeVideoMergeTasks(videoMergeTasksCommands.get(0));
        }
    }

    private boolean rename(File from, File to) {
        return from.getParentFile().exists() && from.exists() && from.renameTo(to);
    }

    private void returnVideoCallback(Callback callback, String filePath) {
        //send callback for js with file path
        WritableMap dataMap = Arguments.createMap();
        dataMap.putString(VIDEO_PATH, filePath);
        dataMap.putString(VIDEO_PATH_URI, Uri.fromFile(new File(filePath)).toString());
        callback.invoke(dataMap);
    }

    private void returnVideoVedioCompress(Callback callback, String filePath) {
        try {
            WritableMap dataMap = Arguments.createMap();
            dataMap.putString(VIDEO_PATH, filePath);
            dataMap.putString(VIDEO_PATH_URI, Uri.fromFile(new File(filePath)).toString());
            callback.invoke(dataMap);
        } catch (Exception e) {
            Log.d("@@@ : ", "returnVideoVedioCompress" + e);
        }
    }

    public void checkIsInProgress(VideoMergeTasks videoMergeTasks) {
        if (videoSpeedTasks.isEmpty()) {
            returnVideoCallback(videoMergeTasks.callback, videoMergeTasks.filePath);
        }
    }

    public boolean isExecutionId(Long executionId) {
        for (FFmpegExecution listExecution : FFmpeg.listExecutions()) {
            if (listExecution.getExecutionId() == executionId) {
                return true;
            }
        }
        return false;
    }
}