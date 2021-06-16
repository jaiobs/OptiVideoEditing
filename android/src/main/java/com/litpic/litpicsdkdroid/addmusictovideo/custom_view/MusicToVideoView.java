package com.litpic.litpicsdkdroid.addmusictovideo.custom_view;


import android.annotation.SuppressLint;
import android.net.Uri;
import android.util.Log;
import android.view.LayoutInflater;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.trimmermodule.CustomRecyclerView;
import com.litpic.litpicsdkdroid.trimmermodule.interfaces.OnRangeSeekBarListener;
import com.litpic.litpicsdkdroid.trimmermodule.view.RangeSeekBarView;
import com.litpic.litpicsdkdroid.trimmermodule.view.Thumb;
import com.litpic.litpicsdkdroid.trimmermodule.view.TimeLineView;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.util.Locale;

import static com.litpic.litpicsdkdroid.config.Constants.END_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_VIDEO_SELECTION_RANGE_CHANGED;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;
import static com.litpic.litpicsdkdroid.config.Constants.START_POSITION;

/**
 * View inherited and using FrameLayout
 */
@SuppressLint("ViewConstructor")
public class MusicToVideoView extends FrameLayout implements OnRangeSeekBarListener {

    private RangeSeekBarView speedRangeSeekBar;
    private final ThemedReactContext context;

    private String videoPath;
    private TextView mTotalTime;
    private TimeLineView mTimeLineView;
    CustomRecyclerView customRecyclerView;
    FileUtils fileUtils;

    private float duration;
    private int startPosition;
    private int endPosition;


    public MusicToVideoView(ThemedReactContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        initViews();
    }

    /**
     * initialize views
     */
    public void initViews() {
        LayoutInflater.from(context).inflate(R.layout.music_to_video_range, this, true);
        speedRangeSeekBar = findViewById(R.id.speed_range_seek_bar);
        mTimeLineView = findViewById(R.id.timeLineView);
        mTotalTime = findViewById(R.id.mv_tv_total_time);
        customRecyclerView = findViewById(R.id.rv_video_thumb);

        speedRangeSeekBar.addOnRangeSeekBarListener(this);

        fileUtils = new FileUtils();

        if (videoPath != null) {
            mTimeLineView.setVideo(Uri.parse(videoPath));
            duration = MediaUtils.getVideoDuration(context, videoPath);
            startPosition = 0;
            endPosition = (int) duration;
            updateTotalTime();
        }

        this.requestLayout();
        setUpMargins();
        setSeekBarPosition();
    }

    /**
     * set margin to custom layouts
     */
    private void setUpMargins() {
        int marge = speedRangeSeekBar.getThumbs().get(0).getWidthBitmap();

        RelativeLayout.LayoutParams lp = (RelativeLayout.LayoutParams) mTimeLineView.getLayoutParams();
        lp.setMargins(marge, 0, marge, 0);
        mTimeLineView.setLayoutParams(lp);
    }

    /**
     * React-Native bridging
     * set video path to load on TrimmerView
     *
     * @param videoPath: input video path
     */
    public void setVideoPath(String videoPath) {
        this.videoPath = videoPath;
        if (mTimeLineView != null) {
            mTimeLineView.setVideo(Uri.parse(videoPath));
        }
        duration = MediaUtils.getVideoDuration(context, videoPath);
        startPosition = 0;
        endPosition = (int) duration;
        updateTotalTime();
    }

    /**
     * update position of seekbar
     */
    private void setSeekBarPosition() {
        startPosition = 0;
        endPosition = (int) duration;
        speedRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
        speedRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);
        speedRangeSeekBar.initMaxWidth();
        updateTotalTime();
    }

    /**
     * update total time
     */
    private void updateTotalTime() {
        int selectedTime = ((endPosition / 1000) - (startPosition / 1000));
        String selectedTimeStr = String.format(Locale.getDefault(), "Total %ds",
                selectedTime);
        if (mTotalTime != null) {
            mTotalTime.setText(selectedTimeStr);
        }
    }

    /**
     * React-Native bridging
     *
     * @param duration: input to set total duration
     */
    public void setDuration(int duration) {
        this.duration = duration;
    }

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
    }

    /**
     * React-Native bridging
     * @param audioPath: input audio path
     */
    public void setAudioPath(String audioPath) {
        Log.e("@@@", "audio path " + audioPath);
    }

    /**
     * React-Native bridging
     *
     * @param reactContext: context of react-native
     * @param params: params to attach with callback
     * @param eventName: evert name to push react-native event
     */
    private void sendEvent(ThemedReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    /**
     * React-Native bridging
     *
     * @param showLoader: show/hide loader
     */
    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(context, params, EVENT_PROGRESS);
    }
}
