package com.litpic.litpicsdkdroid.trimming_video.view;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Handler;
import android.util.AttributeSet;
import android.util.Log;
import android.util.TypedValue;
import android.view.Choreographer;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

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
import com.litpic.litpicsdkdroid.filtertovideo.FilterUtility;
import com.litpic.litpicsdkdroid.imageeditor.customview.CustomImageView;
import com.litpic.litpicsdkdroid.trimmermodule.CustomLinearLayout;
import com.litpic.litpicsdkdroid.trimmermodule.CustomRecyclerView;
import com.litpic.litpicsdkdroid.trimmermodule.TrimmerVideoData;
import com.litpic.litpicsdkdroid.trimmermodule.VideoSwitcherAdapter;
import com.litpic.litpicsdkdroid.trimmermodule.interfaces.OnRangeSeekBarListener;
import com.litpic.litpicsdkdroid.trimmermodule.view.RangeSeekBarView;
import com.litpic.litpicsdkdroid.trimmermodule.view.Thumb;
import com.litpic.litpicsdkdroid.trimmermodule.view.TimeLineView;
import com.litpic.litpicsdkdroid.trimming_video.FilterMultiFileUpdate;
import com.litpic.litpicsdkdroid.trimming_video.FilterProcessUpdate;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.util.ArrayList;
import java.util.Locale;

import static com.litpic.litpicsdkdroid.config.Constants.CURRENT_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.DURATION;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_CHANGE_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PICK_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_SEEK_TO_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.IS_TRIMMED;
import static com.litpic.litpicsdkdroid.config.Constants.SEEK_TO;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_WIDTH;

@SuppressLint("ViewConstructor")
public class TrimmingVideoView extends FrameLayout implements VideoSwitcherAdapter.VideoThumbClickListeners {

    private static final String TAG = TrimmingVideoView.class.getSimpleName();
    private final ThemedReactContext context;
    private String videoPath;
    private float duration;
    private int startPosition;
    private int endPosition;
    private SeekBar mHolderTopView;
    private RangeSeekBarView mRangeSeekBarView;
    private int mMaxDuration = 30000;
    private int currentIndex = -1;

    private int finalVideoWidth = 0;
    private int finalVideoHeight = 0;

    private int portraitMaxVideoWidth = 0;
    private int portraitMaxVideoHeight = 0;

    private int landscapeMaxVideoWidth = 0;
    private int landscapeMaxVideoHeight = 0;
    CustomRecyclerView customRecyclerView;

    private TextView mTotalTime;
    private TimeLineView mTimeLineView;
    String destinationPath;
    FileUtils fileUtils;
    FilterUtility filterUtility;
    private FFMpegCommands ffMpegCommands;
    VideoSwitcherAdapter videoSwitcherAdapter;
    ArrayList<TrimmerVideoData> trimmerVideoDataList = new ArrayList<>();


    public TrimmingVideoView(@NonNull ThemedReactContext context) {
        this(context, null, 0);
    }

    public TrimmingVideoView(@NonNull ThemedReactContext context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TrimmingVideoView(@NonNull ThemedReactContext context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
        initViews();
    }

    private void initViews() {
        LayoutInflater.from(context).inflate(R.layout.trimming_video, this, true);

        mRangeSeekBarView = findViewById(R.id.trimeVideoBar);
        mTimeLineView = findViewById(R.id.timeLineView);
        mTotalTime = findViewById(R.id.vtTotalTime);
        customRecyclerView = findViewById(R.id.rv_video_thumb);
        mHolderTopView = findViewById(R.id.handlerTop);

        fileUtils = new FileUtils();
        ffMpegCommands = new FFMpegCommands(context);
        filterUtility = new FilterUtility(context);

        videoSwitcherAdapter = new VideoSwitcherAdapter(trimmerVideoDataList, context, this);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false);
        customRecyclerView.setLayoutManager(layoutManager);
        customRecyclerView.setAdapter(videoSwitcherAdapter);
        customRecyclerView.requestFocus();

        if (videoPath != null) {
            mTimeLineView.setVideo(Uri.parse(videoPath));
            duration = MediaUtils.getVideoDuration(context, videoPath);
            startPosition = 0;
            endPosition = (int) duration;
            updateTotalTime();
        }

        this.requestLayout();
        setUpListeners();
        setUpMargins();
        setupLayoutHack();
        lockOrientation();
    }

    private void lockOrientation() {
        if (context != null && context.getCurrentActivity() != null && context.getCurrentActivity().getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            int currentOrientation = getResources().getConfiguration().orientation;
            if (currentOrientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
        }
    }

    private void setUpListeners() {
        mRangeSeekBarView.addOnRangeSeekBarListener(new OnRangeSeekBarListener() {
            @Override
            public void onCreate(RangeSeekBarView rangeSeekBarView, int index, float value) {
                // Do nothing
            }

            @Override
            public void onSeek(RangeSeekBarView rangeSeekBarView, int index, float value) {
                onSeekThumbs(index, value);
            }

            @Override
            public void onSeekStart(RangeSeekBarView rangeSeekBarView, int index, float value) {
                // Do nothing
            }

            @Override
            public void onSeekStop(RangeSeekBarView rangeSeekBarView, int index, float value) {
                //no-op
            }
        });
    }

    private void setUpMargins() {
        int marge = mRangeSeekBarView.getThumbs().get(0).getWidthBitmap();
        int widthSeek = mHolderTopView.getThumb().getMinimumWidth() / 2;

        RelativeLayout.LayoutParams lp =
                (RelativeLayout.LayoutParams) mHolderTopView.getLayoutParams();
        lp.setMargins(marge - widthSeek, 0, marge - widthSeek, 0);
        mHolderTopView.setLayoutParams(lp);

        lp = (RelativeLayout.LayoutParams) mTimeLineView.getLayoutParams();
        lp.setMargins(marge, 0, marge, 0);
        mTimeLineView.setLayoutParams(lp);
    }

    private void updateFinalVideoWidthAndHeight(int mpVideoWidth, int mpVideoHeight) {
        if (finalVideoWidth < mpVideoWidth || finalVideoHeight < mpVideoHeight) {
            finalVideoWidth = mpVideoWidth;
            finalVideoHeight = mpVideoHeight;
        }

        if (mpVideoWidth > mpVideoHeight) {
            if (landscapeMaxVideoWidth < mpVideoWidth || landscapeMaxVideoHeight < mpVideoHeight) {
                landscapeMaxVideoWidth = mpVideoWidth;
                landscapeMaxVideoHeight = mpVideoHeight;
            }
        } else {
            if (portraitMaxVideoWidth < mpVideoWidth || portraitMaxVideoHeight < mpVideoHeight) {
                portraitMaxVideoWidth = mpVideoWidth;
                portraitMaxVideoHeight = mpVideoHeight;
            }
        }
    }

    private void setSeekBarPosition() {
        int durationLocal = getDuration();
        int totalSelectedTimeLocal = getTotalSelectedTime();
        if (getStartPosition() != -1 && getEndPosition() != -1) {

            mRangeSeekBarView.setThumbValue(0, (getStartPosition() * 100f) / durationLocal);
            mRangeSeekBarView.setThumbValue(1, (getEndPosition() * 100f) / durationLocal);

        } else if (durationLocal >= (mMaxDuration - totalSelectedTimeLocal)) {

            setStartPosition((durationLocal / 2 - (mMaxDuration - totalSelectedTimeLocal) / 2));
            setEndPosition((durationLocal / 2 + (mMaxDuration - totalSelectedTimeLocal) / 2));

            mRangeSeekBarView.setThumbValue(0, (getStartPosition() * 100f) / durationLocal);
            mRangeSeekBarView.setThumbValue(1, (getEndPosition() * 100f) / durationLocal);
        } else {
            setStartPosition(0);
            setEndPosition(durationLocal);
        }
        setProgressBarPosition(getStartPosition());
        sendSeekToEvent(getStartPosition());

        setSelectedTime(getEndPosition() - getStartPosition());
        if (totalSelectedTimeLocal > 0 && (mMaxDuration - totalSelectedTimeLocal) > 0) {
            int availableTime = Math.min((durationLocal - getSelectedTime()), (mMaxDuration - totalSelectedTimeLocal));
            mRangeSeekBarView.setMaxWidth(mRangeSeekBarView.scaleToPixel((availableTime * 100f) / durationLocal));
        } else {
            mRangeSeekBarView.initMaxWidth();
        }

        setTimeFrames();
    }

    private void setProgressBarPosition(int position) {
        if (trimmerVideoDataList.get(currentIndex).getDuration() > 0) {
            long pos = 1000L * position / trimmerVideoDataList.get(currentIndex).getDuration();
            mHolderTopView.setProgress((int) pos);
        }
    }

    private void setTimeFrames() {
        int endTime = getEndPosition() / 1000;
        int starTime = getStartPosition() / 1000;
        int time = endTime - starTime;
        String totalTime = "Total " + (time) + " Sec";
        mTotalTime.setText(totalTime);
    }

    public void setMaxDuration(int maxDuration) {
        mMaxDuration = maxDuration * 1000;
    }

    private void setVideoRecyclerView() {
        videoSwitcherAdapter.notifyDataSetChanged();
        customRecyclerView.setRequestedLayout(false);
        customRecyclerView.requestLayout();
        currentIndex = 0;
        setVideoURI(trimmerVideoDataList.get(currentIndex).getVideoUrl());
        int padding;
        if (context.getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) {
            padding = ((context.getResources().getDisplayMetrics().widthPixels / 2) - (dipToPixel(48 * (trimmerVideoDataList.size() + 1)))) / 2;
        } else {
            padding = (context.getResources().getDisplayMetrics().widthPixels - (dipToPixel(48 * (trimmerVideoDataList.size() + 1)))) / 2;
        }
        if (padding <= 0) {
            padding = 10;
        }
        customRecyclerView.setPadding(padding, 0, padding, 0);
    }

    private void setVideoURI(final String videoPath) {
        mTimeLineView.setVideo(Uri.parse(videoPath));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                setSeekBarPosition();
            }
        }, 100);
    }

    private void onSeekThumbs(int index, float value) {
        if (index == Thumb.LEFT) {
            setStartPosition((int) ((getDuration() * value) / 100L));
            int videoSeekPosition = (int) ((getDuration() * value) / 100L);
            sendSeekToEvent(videoSeekPosition);
        } else if (index == Thumb.RIGHT) {
            setEndPosition((int) ((getDuration() * value) / 100L));
        }

        sendSeekToEvent(getStartPosition());

        setProgressBarPosition(getStartPosition());

        setTimeFrames();
        setSelectedTime(getEndPosition() - getStartPosition());
    }

    private int dipToPixel(int dip) {
        return (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dip,
                context.getResources().getDisplayMetrics()
        );
    }

    private void updateTotalTime() {
        int selectedTime = ((endPosition / 1000) - (startPosition / 1000));
        String selectedTimeStr = String.format(Locale.getDefault(), "Total %ds",
                selectedTime);
        mTotalTime.setText(selectedTimeStr);
    }

    public void setVideoPath(String parse) {

        this.videoPath = parse;
        if (mTimeLineView != null) {
            mTimeLineView.setVideo(Uri.parse(parse));
        }
        duration = MediaUtils.getVideoDuration(context, parse);
        startPosition = 0;
        endPosition = (int) duration;
    }

    public void setVideoDetails(ReadableArray details) {
        addVideos(details);
    }

    //listeners from VideoSwitcherAdapter
    @Override
    public void onVideoThumbClicked(int position) {
        //change current video and trimming thumb here
        if (currentIndex != position) {
            currentIndex = position;
            changeVideo(trimmerVideoDataList.get(position).getVideoUrl());
        }
    }

    @Override
    public void getVideoFromGallery() {
        // show gallery picker
        sendEvent(context, null, EVENT_PICK_VIDEO);
    }

    private void changeVideo(String url) {
        sendChangeVideoEvent();
        mTimeLineView.setVideo(Uri.parse(url));
        mTimeLineView.resetThumbList();
        setSeekBarPosition();
    }

    public void addVideos(ReadableArray videos) {
        for (int i = 0; i < videos.size(); i++) {
            ReadableMap array = videos.getMap(i);
            if (array != null) {
                addVideos(array);
            }
        }
        setVideoRecyclerView();
    }

    private void addVideos(ReadableMap array) {                 // NOSONAR
        String videoPathString = array.getString(VIDEO_PATH);
        String height = array.getString(VIDEO_HEIGHT);
        String width = array.getString(VIDEO_WIDTH);
        String durationStr = array.getString(DURATION);
        boolean isAnamorphic = MediaUtils.isAnamorphic(context, videoPathString);

        if (videoPathString != null && !videoPathString.isEmpty()) {
            TrimmerVideoData trimmerVideoData = new TrimmerVideoData(videoPathString);
            if (width != null && !width.isEmpty() && height != null && !height.isEmpty()) {
                trimmerVideoData.setVideoWidth(isAnamorphic ? Integer.parseInt(height) : Integer.parseInt(width));
                trimmerVideoData.setVideoHeight(isAnamorphic ? Integer.parseInt(width) : Integer.parseInt(height));
            }
            if (durationStr != null && !durationStr.isEmpty()) {
                trimmerVideoData.setDuration(Integer.parseInt(durationStr));
            }
            int totalSelectedTimeLocal = getTotalSelectedTime();
            if (trimmerVideoData.getDuration() >= (mMaxDuration - totalSelectedTimeLocal)) {
                trimmerVideoData.setStartPosition((trimmerVideoData.getDuration() / 2 - (mMaxDuration - totalSelectedTimeLocal) / 2));
                trimmerVideoData.setEndPosition((trimmerVideoData.getDuration() / 2 + (mMaxDuration - totalSelectedTimeLocal) / 2));
            } else {
                trimmerVideoData.setStartPosition(0);
                trimmerVideoData.setEndPosition(trimmerVideoData.getDuration());
            }
            trimmerVideoData.setTotalSelectedTime(trimmerVideoData.getEndPosition() - trimmerVideoData.getStartPosition());
            trimmerVideoData.setHasAudioStream(MediaUtils.isVideoContainAudioStream(context, videoPathString));
            updateFinalVideoWidthAndHeight(trimmerVideoData.getVideoWidth(), trimmerVideoData.getVideoHeight());
            trimmerVideoDataList.add(trimmerVideoData);
        }
    }

    private void runFFmpeg(Callback callback) {
        if (trimmerVideoDataList.size() == 1) {
            if (trimmerVideoDataList.get(0).getVideoWidth() > trimmerVideoDataList.get(0).getVideoHeight()) {
                finalVideoWidth = Constants.PIXELS_16;
                finalVideoHeight = Constants.PIXELS_9;
            } else {
                finalVideoWidth = Constants.PIXELS_9;
                finalVideoHeight = Constants.PIXELS_16;
            }
            if (trimmerVideoDataList.get(0).getStartPosition() > 0
                    || trimmerVideoDataList.get(0).getEndPosition() < trimmerVideoDataList.get(0).getDuration()) {
                destinationPath = fileUtils.getVideoCachePath(context);
                trimVideo(ffMpegCommands.getSingleVideoScaleAndTrimmingCommand
                        (destinationPath, finalVideoWidth, finalVideoHeight, trimmerVideoDataList.get(0)), callback);
            } else {
                destinationPath = fileUtils.getVideoCachePath(context);
                trimVideo(ffMpegCommands.getVideoScaleAndBitRateCommand(trimmerVideoDataList.get(0).getVideoUrl()
                        , finalVideoWidth, finalVideoHeight, destinationPath), callback);
            }
        } else {
            // use ffmpeg to crop list of videos and concat
            multipleVideoTrimming(callback);
        }
    }

    public void trimVideo(final Callback callback) {
        checkFilterUpdates(callback);
    }

    private void checkFilterUpdates(final Callback callback) {
        if (trimmerVideoDataList.size() == 1) {
            final TrimmerVideoData trimmerVideoData = trimmerVideoDataList.get(0);
            if (trimmerVideoData.getFilterValues() != null
                    && trimmerVideoData.getFilterValues().hasKey(Constants.TYPE)
                    && !trimmerVideoData.getFilterValues().getString(Constants.TYPE).equals(Constants.NORMAL)) {
                filterUtility.applyVideoFilter(new FilterProcessUpdate() {
                    @Override
                    public void onFilterCompleted(boolean isCompleted) {
                        if (isCompleted) {
                            runFFmpeg(callback);
                        } else {
                            Log.e("JK", "Result failed");
                        }
                    }
                }, trimmerVideoData);
            } else {
                runFFmpeg(callback);
            }
        } else {
            ArrayList<TrimmerVideoData> trimmerVideoDataArrayList = getValidTrimmingVideoData();
            trimmerVideoDataList.clear();
            trimmerVideoDataList.addAll(trimmerVideoDataArrayList);
            filterUtility.multipleVideoFilterApply(trimmerVideoDataList, new FilterMultiFileUpdate() {
                @Override
                public void onFilterCompleted() {
                    runFFmpeg(callback);
                }
            });
        }
    }

    /**
     * combine multiple videos without losing aspect ratio
     */
    private void multipleVideoTrimming(Callback callback) {
        setFinalWidthAndHeight();
        if (finalVideoWidth <= 0 && finalVideoHeight <= 0) return;
        destinationPath = fileUtils.getVideoCachePath(context);
        String[] commands = ffMpegCommands.getMultiVideoTrimmingCommand(destinationPath, finalVideoWidth, finalVideoHeight, trimmerVideoDataList);
        trimVideo(commands, callback);
    }

    private ArrayList<TrimmerVideoData> getValidTrimmingVideoData() {
        ArrayList<TrimmerVideoData> trimmerVideoDataArrayList = new ArrayList<>();
        for (TrimmerVideoData trimmerVideoData : trimmerVideoDataList) {
            if (trimmerVideoData.getTotalSelectedTime() > 0) {
                trimmerVideoDataArrayList.add(trimmerVideoData);
            }
        }
        return trimmerVideoDataArrayList;
    }

    private void trimVideo(String[] commands, final Callback callback) {
        FFmpeg.executeAsync(commands, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    if (callback != null) {
                        WritableMap dataMap = Arguments.createMap();
                        dataMap.putBoolean(IS_TRIMMED, true);
                        dataMap.putString(VIDEO_PATH, destinationPath);
                        callback.invoke(dataMap);
                    }
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.e(TAG, "JK ImageEditor RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());
                } else {
                    Log.e(TAG, "JK ImageEditor RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void setFinalWidthAndHeight() {
        if (portraitMaxVideoWidth != 0 && portraitMaxVideoHeight != 0
                && landscapeMaxVideoWidth != 0 && landscapeMaxVideoHeight != 0) {
            if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT) {
                finalVideoWidth = Constants.PIXELS_9;
                finalVideoHeight = Constants.PIXELS_16;
            } else {
                finalVideoWidth = Constants.PIXELS_16;
                finalVideoHeight = Constants.PIXELS_9;
            }
        } else if (portraitMaxVideoWidth != 0 && portraitMaxVideoHeight != 0) {
            finalVideoWidth = Constants.PIXELS_9;
            finalVideoHeight = Constants.PIXELS_16;
        } else {
            finalVideoWidth = Constants.PIXELS_16;
            finalVideoHeight = Constants.PIXELS_9;
        }
    }

    private void setStartPosition(int startPosition) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setStartPosition(startPosition);
        }
    }

    private int getStartPosition() {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            return trimmerVideoDataList.get(currentIndex).getStartPosition();
        } else {
            return 0;
        }
    }

    private void setEndPosition(int endPosition) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setEndPosition(endPosition);
        }
    }

    private int getEndPosition() {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            return trimmerVideoDataList.get(currentIndex).getEndPosition();
        } else {
            return 0;
        }
    }

    public void setDuration(int duration) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setDuration(duration);
        }
    }

    private int getDuration() {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            return trimmerVideoDataList.get(currentIndex).getDuration();
        } else {
            return 1;
        }
    }

    private void setSelectedTime(int selectedTime) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setTotalSelectedTime(selectedTime);
        }
    }

    private int getSelectedTime() {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            return trimmerVideoDataList.get(currentIndex).getTotalSelectedTime();
        } else {
            return 0;
        }
    }

    private int getTotalSelectedTime() {
        int time = 0;
        if (!trimmerVideoDataList.isEmpty()) {
            for (TrimmerVideoData trimmerVideoData : trimmerVideoDataList) {
                time += trimmerVideoData.getTotalSelectedTime();
            }
        }
        return time;
    }

    public void setVideoWidthAndHeight(int width, int height) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setVideoWidth(width);
            trimmerVideoDataList.get(currentIndex).setVideoHeight(height);
        }
    }

    private void sendChangeVideoEvent() {
        WritableMap map = Arguments.createMap();
        map.putInt(CURRENT_POSITION, currentIndex);
        map.putString(VIDEO_PATH, trimmerVideoDataList.get(currentIndex).getVideoUrl());
        sendEvent(context, map, EVENT_CHANGE_VIDEO);
    }

    private void sendSeekToEvent(int seekToPosition) {
        WritableMap map = Arguments.createMap();
        map.putInt(SEEK_TO, seekToPosition);
        sendEvent(context, map, EVENT_SEEK_TO_VIDEO);
    }

    private void sendEvent(ThemedReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    void setupLayoutHack() {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren();
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child instanceof CustomImageView || child instanceof CustomRecyclerView
                    || child instanceof CustomLinearLayout) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }
        }
    }

    public void setFilter(ReadableMap readableArray) {
        if (currentIndex != -1 && currentIndex < trimmerVideoDataList.size()) {
            trimmerVideoDataList.get(currentIndex).setFilterValues(readableArray);
        }
    }
}
