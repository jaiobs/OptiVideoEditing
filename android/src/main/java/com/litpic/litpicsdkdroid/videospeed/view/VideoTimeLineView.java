package com.litpic.litpicsdkdroid.videospeed.view;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.arthenica.mobileffmpeg.Config;
import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.ffmpeg.reactnative.FFMpegCommands;
import com.litpic.litpicsdkdroid.trimmermodule.interfaces.OnRangeSeekBarListener;
import com.litpic.litpicsdkdroid.trimmermodule.view.RangeSeekBarView;
import com.litpic.litpicsdkdroid.trimmermodule.view.Thumb;
import com.litpic.litpicsdkdroid.trimmermodule.view.TimeLineView;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.util.Locale;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
import static com.litpic.litpicsdkdroid.config.Constants.END_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_EXPORT_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_UPDATE_VIDEO_PLAYBACK;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_VIDEO_SELECTION_RANGE_CHANGED;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_EXPORT;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;
import static com.litpic.litpicsdkdroid.config.Constants.SLOW_1X;
import static com.litpic.litpicsdkdroid.config.Constants.SLOW_2X;
import static com.litpic.litpicsdkdroid.config.Constants.SPEED;
import static com.litpic.litpicsdkdroid.config.Constants.SPEED_1X;
import static com.litpic.litpicsdkdroid.config.Constants.SPEED_2X;
import static com.litpic.litpicsdkdroid.config.Constants.SPEED_VALUE;
import static com.litpic.litpicsdkdroid.config.Constants.START_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

@SuppressLint("ViewConstructor")
public class VideoTimeLineView extends FrameLayout implements OnRangeSeekBarListener, View.OnClickListener {

    private String videoPath;
    private final ThemedReactContext context;
    private TimeLineView speedApplyTimeLineView;
    private RangeSeekBarView speedRangeSeekBar;

    private TextView slowOne;
    private TextView slowTwo;
    private TextView speedOne;
    private TextView speedTwo;

    private TextView totalTime;

    private float duration;
    private int startPosition;
    private int endPosition;

    private String speedValue = "";
    private float speedValueInt = 1.0f;

    FileUtils fileUtils;

    private static final int SAVE_VIDEO = 0;
    private FFMpegCommands ffMpegCommands;
    private final String tag = getClass().getSimpleName();

    public VideoTimeLineView(@NonNull ThemedReactContext context) {
        this(context, null, 0);
    }

    public VideoTimeLineView(@NonNull ThemedReactContext context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public VideoTimeLineView(@NonNull ThemedReactContext context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
        init();
    }

    private void init() {
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                MATCH_PARENT, WRAP_CONTENT,
                Gravity.BOTTOM);
        this.setLayoutParams(params);

        LayoutInflater.from(context).inflate(R.layout.video_range_selection, this, true);

        speedApplyTimeLineView = findViewById(R.id.speed_time_line);
        speedRangeSeekBar = findViewById(R.id.speed_range_seek_bar);

        slowOne = findViewById(R.id.tv_slow_one);
        slowTwo = findViewById(R.id.tv_slow_two);
        speedOne = findViewById(R.id.tv_speed_one);
        speedTwo = findViewById(R.id.tv_speed_two);
        totalTime = findViewById(R.id.vs_tv_total_time);

        speedRangeSeekBar.addOnRangeSeekBarListener(this);

        slowOne.setOnClickListener(this);
        slowTwo.setOnClickListener(this);
        speedOne.setOnClickListener(this);
        speedTwo.setOnClickListener(this);

        ffMpegCommands = new FFMpegCommands(context);
        fileUtils = new FileUtils();

        versionFFmpeg();

        if (videoPath != null) {
            speedApplyTimeLineView.setVideo(Uri.parse(videoPath));
            duration = MediaUtils.getVideoDuration(context, videoPath);
            startPosition = 0;
            endPosition = (int) duration;
            updateTotalTime();
            checkSlowMoAvailability();
        }

        setUpMargins();
        setSeekBarPosition();
        requestLayout();
    }

    private void versionFFmpeg() {
        FFmpeg.executeAsync(ffMpegCommands.getVersionCommands(), new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.d(tag, "JK GET_VERSION RETURN_CODE_SUCCESS: " + Config.getLastCommandOutput());

                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, "JK GET_VERSION RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());

                } else {
                    Log.d(tag, "JK GET_VERSION RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void setUpMargins() {
        int marge = speedRangeSeekBar.getThumbs().get(0).getWidthBitmap();

        RelativeLayout.LayoutParams lp = (RelativeLayout.LayoutParams) speedApplyTimeLineView.getLayoutParams();
        lp.setMargins(marge, 0, marge, 0);
        speedApplyTimeLineView.setLayoutParams(lp);
    }

    private void setSeekBarPosition() {
        startPosition = 0;
        endPosition = (int) duration;
        speedRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
        speedRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);
        speedRangeSeekBar.initMaxWidth();
        updateTotalTime();
    }

    private void updateTotalTime() {
        int selectedTime = ((endPosition / 1000) - (startPosition / 1000));
        String selectedTimeStr = String.format(Locale.getDefault(), "Total %ds",
                selectedTime);
        totalTime.setText(selectedTimeStr);
    }

    private void checkSlowMoAvailability(){
        int availableTime = (int) (Constants.FIXED_VIDEO_LENGTH_IN_MILLIS - duration);
        if (availableTime > 2000){
            slowOne.setEnabled(true);
            slowTwo.setEnabled(true);
            slowOne.setAlpha(1.0f);
            slowTwo.setAlpha(1.0f);
        }else{
            slowOne.setEnabled(false);
            slowTwo.setEnabled(false);
            slowOne.setAlpha(0.5f);
            slowTwo.setAlpha(0.5f);
        }
    }

    public void setVideoPath(String path) {
        this.videoPath = path;
        if (speedApplyTimeLineView != null) {
            speedApplyTimeLineView.setVideo(Uri.parse(path));
        }
        duration = MediaUtils.getVideoDuration(context, path);
        startPosition = 0;
        endPosition = (int) duration;
        updateTotalTime();
        checkSlowMoAvailability();
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    /**
     * video range seek bar callback listeners
     *
     * @param speedRangeSeekBar - range seek bar view
     * @param index             - index of thumb
     * @param value             - current position of thumb
     */
    @Override
    public void onCreate(RangeSeekBarView speedRangeSeekBar, int index, float value) {
        Log.d("@@@@", "onCreate->index->" + index + "value ->" + value);
    }

    @Override
    public void onSeek(RangeSeekBarView speedRangeSeekBar, int index, float value) {
        float percentageSeek = value / 100;
        if (index == Thumb.LEFT) {
            startPosition = (int) (percentageSeek * duration);
            // seek video to start position here
        } else if (index == Thumb.RIGHT) {
            endPosition = (int) (percentageSeek * duration);
        }
        WritableMap params = Arguments.createMap();
        params.putInt(START_POSITION, startPosition);
        params.putInt(END_POSITION, endPosition);
        sendEvent(context, params, EVENT_VIDEO_SELECTION_RANGE_CHANGED);
        updateTotalTime();
    }

    @Override
    public void onSeekStart(RangeSeekBarView speedRangeSeekBar, int index, float value) {
        Log.d("@@@@", "onSeekStart--- index->" + index + "value->" + value);
    }

    @Override
    public void onSeekStop(RangeSeekBarView speedRangeSeekBar, int index, float value) {
        Log.d("@@@@", "onSeekStop--- index->" + index + "value->" + value);
        if (!speedValue.isEmpty() || speedValueInt != 1.0f) {
            updatePreviewVideo();
        }
    }

    /*
    on click listener for speed options
     */
    @Override
    public void onClick(View view) {
        if (view.getId() == slowOne.getId()) {
            speedValue = SLOW_1X;
            speedValueInt = 1.5f;
            slowOne.setTextColor(ContextCompat.getColor(context, R.color.white));
            slowOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_audio_button));

            slowTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        } else if (view.getId() == slowTwo.getId()) {
            speedValue = SLOW_2X;
            speedValueInt = 2.0f;
            slowTwo.setTextColor(ContextCompat.getColor(context, R.color.white));
            slowTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_audio_button));

            slowOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        } else if (view.getId() == speedOne.getId()) {
            speedValue = SPEED_1X;
            speedValueInt = 0.75f;
            speedOne.setTextColor(ContextCompat.getColor(context, R.color.white));
            speedOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_audio_button));

            slowTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            slowOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        } else if (view.getId() == speedTwo.getId()) {
            speedValue = SPEED_2X;
            speedValueInt = 0.5f;
            speedTwo.setTextColor(ContextCompat.getColor(context, R.color.white));
            speedTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_audio_button));

            slowTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
            speedOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowOne.setTextColor(ContextCompat.getColor(context, R.color.black));
            slowTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            speedOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
            slowOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        }
        updateSelectedRange();
    }

    private void updateSelectedRange() {                                                        // NOSONAR
        int selectedTime = (endPosition - startPosition);
        int availableTime = (int) (Constants.FIXED_VIDEO_LENGTH_IN_MILLIS - duration);

        if ((availableTime / 1000) > 0) {
            if (speedValue.equals(SLOW_1X)) {
                int diffTime = (int) ((selectedTime * 1.5) - selectedTime);

                if (diffTime > availableTime || (selectedTime / 1000) == 0) {
                    int balTime = (int) ((diffTime - availableTime) / 1.5f) * 2;
                    if (selectedTime == 0 && startPosition == endPosition) {
                        startPosition -= (balTime / 2);
                        endPosition += (balTime / 2);
                    } else {
                        startPosition += (balTime / 2);
                        endPosition -= (balTime / 2);
                    }
                    speedRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
                    speedRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);
                    speedRangeSeekBar.initMaxWidth();
                    updateTotalTime();
                } else {
                    if (diffTime == availableTime) {
                        speedRangeSeekBar.initMaxWidth();
                    } else {
                        int balTime = (int) ((availableTime - diffTime) / 1.5f);
                        speedRangeSeekBar.setMaxWidth(balTime);
                    }
                }
            } else if (speedValue.equals(SLOW_2X)) {
                int diffTime = (int) ((selectedTime * 2.0) - selectedTime);
                if (diffTime > availableTime || (selectedTime / 1000) == 0) {
                    int balTime = (int) ((diffTime - availableTime) / 2.0f) * 2;
                    if (selectedTime == 0 && startPosition == endPosition) {
                        startPosition -= (balTime / 2);
                        endPosition += (balTime / 2);
                    } else {
                        startPosition += (balTime / 2);
                        endPosition -= (balTime / 2);
                    }
                    speedRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
                    speedRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);
                    speedRangeSeekBar.initMaxWidth();
                    updateTotalTime();
                } else {
                    if (diffTime == availableTime) {
                        speedRangeSeekBar.initMaxWidth();
                    } else {
                        int balTime = (int) ((availableTime - diffTime) / 2.0f);
                        speedRangeSeekBar.setMaxWidth(balTime);
                    }
                }
            } else {
                speedRangeSeekBar.setMaxWidth((int) (duration - selectedTime));
            }
        } else {
            if (speedValue.equals(SLOW_1X) || speedValue.equals(SLOW_2X)) {
                startPosition = (int) (duration / 2);
                endPosition = (int) (duration / 2);
                speedRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
                speedRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);
                speedRangeSeekBar.initMaxWidth();
                updateTotalTime();
            } else {
                speedRangeSeekBar.setMaxWidth((int) (duration - selectedTime));
            }
        }
        updatePreviewVideo();
    }

    public void clearSpeedSelection() {
        slowOne.setTextColor(ContextCompat.getColor(context, R.color.black));
        slowTwo.setTextColor(ContextCompat.getColor(context, R.color.black));
        speedOne.setTextColor(ContextCompat.getColor(context, R.color.black));
        speedTwo.setTextColor(ContextCompat.getColor(context, R.color.black));

        slowOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        slowTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        speedOne.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));
        speedTwo.setBackground(ContextCompat.getDrawable(context, R.drawable.bg_white_corners));

        speedValue = "";
        speedValueInt = 1.0f;
    }


    private void updatePreviewVideo() {
        if (!speedValue.isEmpty() && startPosition != endPosition) {
            WritableMap params = Arguments.createMap();
            params.putInt(START_POSITION, startPosition);
            params.putInt(END_POSITION, endPosition);
            params.putDouble(SPEED, speedValueInt);
            params.putString(SPEED_VALUE, speedValue);
            params.putString(VIDEO_PATH, videoPath);
            sendEvent(context, params, EVENT_UPDATE_VIDEO_PLAYBACK);
        }
    }

    //react commands
    public void saveVideo() {
        if (!speedValue.isEmpty()) {
            if (startPosition == endPosition) {
                saveVideoInternally(videoPath);
            } else {
                applySpeedToVideo(videoPath, startPosition / 1000, endPosition / 1000, speedValue, SAVE_VIDEO);
            }
        } else {
            saveVideoInternally(videoPath);
        }
    }

    public void onNextClicked(ReadableArray array) {
        ReadableMap eventMap = array.getMap(0);
        applySpeedToVideo(eventMap.getString(VIDEO_PATH), eventMap.getInt(START_POSITION), eventMap.getInt(END_POSITION),
                eventMap.getString(SPEED_VALUE), METHOD_EXPORT);
    }

    /*
    ----optimization --
    change start and end time values to float to increase accuracy
    whole process can be optimized to milli seconds accuracy
     */
    //ffmpeg command for speed apply to existing video
    private void applySpeedToVideo(String videoPath, int startTime, int endTime, String speed, int type) {
        showOrHideJsLoader(true);
        String destinationPath = fileUtils.getVideoCachePath(context);
        String speedValueStr = "";
        String tempo = "";
        switch (speed) {
            case SLOW_1X:
                speedValueStr = "1.5";
                tempo = "0.75";
                break;
            case SLOW_2X:
                speedValueStr = "2.0";
                tempo = "0.5";
                break;
            case SPEED_1X:
                speedValueStr = "0.75";
                tempo = "1.5";
                break;
            case SPEED_2X:
                speedValueStr = "0.5";
                tempo = "2.0";
                break;
            default:
                speedValueStr = "1.0";
                tempo = "1.0";
                break;
        }

        executeFfmpegCommand(
                ffMpegCommands.getVideoRegionSpeedCommands(
                        videoPath, duration, startTime, endTime, speedValueStr, tempo, destinationPath, MediaUtils.isVideoContainAudioStream(context, videoPath)),
                destinationPath, type, null);
    }

    private void executeFfmpegCommand(String[] cmd, final String outPutPath, final int type,
                                      final Callback callback) {
        Log.i(tag,"type "+type);
        Log.i(tag,"callback "+callback);
        FFmpeg.executeAsync(cmd, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.e(tag, "JK VIDEO_TIMELINE_VIEW RETURN_CODE_SUCCESS: " + Config.getLastCommandOutput());

                    WritableMap dataMap = Arguments.createMap();
                    dataMap.putString(VIDEO_PATH, outPutPath);
                    sendEvent(context, dataMap, EVENT_EXPORT_VIDEO);
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.e(tag, "JK VIDEO_TIMELINE_VIEW RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());

                } else {
                    Log.e(tag, "JK VIDEO_TIMELINE_VIEW RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void saveVideoInternally(String videoPath) {
        FileUtils utils = new FileUtils();
        utils.saveVideoLocal(videoPath, context);
    }

    private void sendEvent(ThemedReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(context, params, EVENT_PROGRESS);
    }
}
