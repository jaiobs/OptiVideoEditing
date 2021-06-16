package com.litpic.litpicsdkdroid.audiotrimming;

import android.content.Context;
import android.media.MediaPlayer;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

import com.arthenica.mobileffmpeg.Config;
import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.signature.ObjectKey;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.audiotrimming.customviews.AudioRangeSeekBar;
import com.litpic.litpicsdkdroid.audiotrimming.customviews.SoundWaveView;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.AudioRangeSeekBarListener;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.MediaPreparedListener;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.ffmpeg.reactnative.FFMpegCommands;
import com.litpic.litpicsdkdroid.trimmermodule.view.Thumb;
import com.litpic.litpicsdkdroid.utils.AudioUtils;
import com.litpic.litpicsdkdroid.utils.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.Locale;
import java.util.Objects;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.annotations.NonNull;
import io.reactivex.rxjava3.core.Observable;
import io.reactivex.rxjava3.core.ObservableEmitter;
import io.reactivex.rxjava3.core.ObservableOnSubscribe;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.functions.Action;
import io.reactivex.rxjava3.functions.Consumer;
import io.reactivex.rxjava3.schedulers.Schedulers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okhttp3.internal.Util;
import okio.Buffer;
import okio.BufferedSink;
import okio.BufferedSource;
import okio.Okio;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
import static com.litpic.litpicsdkdroid.config.Constants.AUDIO_DOWNLOAD_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_AUDIO_EXIT_PRESSED;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_AUDIO_START_PRESSED;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_UPDATE_DOWNLOAD_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.IS_COMPLETED;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;

/**
 * inherited from FrameLayout
 */
public class AudioTrimmerView extends FrameLayout
        implements View.OnClickListener, AudioRangeSeekBarListener, MediaPreparedListener {

    private final Context context;
    private String fileUrl;

    private SoundWaveView soundWaveView;
    private AudioRangeSeekBar audioRangeSeekBar;
    private TextView tvStart;
    private TextView tvExit;
    private TextView tvStartTime;
    private TextView tvEndTime;
    private float duration;
    private int startPosition;
    private int endPosition;
    private int mMaxDuration = 30000;
    private boolean isPaused = false;
    private String destinationPath;
    private TextView tvAuthor;
    private TextView tvTrackTitle;
    private ImageView ivAlbumImage;

    private ReactApplicationContext reactApplicationContext;
    private FFMpegCommands ffMpegCommands;
    private final String tag = getClass().getSimpleName();
    private final CompositeDisposable compositeDisposable = new CompositeDisposable();
    LifecycleEventListener lifeCycleListener;

    public AudioTrimmerView(Context context, ReactApplicationContext reactApplicationContext) {
        this(context, null, 0);
        this.reactApplicationContext = reactApplicationContext;
        initLifeCycle();
    }

    public AudioTrimmerView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public AudioTrimmerView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
        initView();
    }

    private void initView() {

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                MATCH_PARENT, WRAP_CONTENT, Gravity.BOTTOM);
        this.setLayoutParams(params);

        LayoutInflater.from(context).inflate(R.layout.audio_trimmer_view, this, true);

        soundWaveView = findViewById(R.id.sound_wave_view);
        tvStart = findViewById(R.id.tv_start);
        tvExit = findViewById(R.id.tv_exit);
        tvStartTime = findViewById(R.id.tv_start_time);
        tvEndTime = findViewById(R.id.tv_end_time);
        audioRangeSeekBar = findViewById(R.id.audio_range_seek_bar);
        tvAuthor = findViewById(R.id.tv_track_author);
        tvTrackTitle = findViewById(R.id.tv_track_name);
        ivAlbumImage = findViewById(R.id.iv_album);

        audioRangeSeekBar.addOnRangeSeekBarListener(this);
        soundWaveView.setMediaPreparedListener(this);
        tvStart.setOnClickListener(this);
        tvExit.setOnClickListener(this);
        ffMpegCommands = new FFMpegCommands(context);
        setUpMargins();

        this.requestLayout();
        setupLayoutHack();

    }

    private void setUpMargins() {
        int marge = audioRangeSeekBar.getThumbs().get(0).getWidthBitmap();

        RelativeLayout.LayoutParams lp =
                (RelativeLayout.LayoutParams) soundWaveView.getLayoutParams();
        lp.setMargins(marge, 0, marge, 0);
        soundWaveView.setLayoutParams(lp);
    }

    private void initLifeCycle() {
        // on host resume
        lifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                // on host resume
                if (soundWaveView.getAudioPlayer() != null && isPaused) {
                    soundWaveView.getAudioPlayer().start();
                    isPaused = false;
                }
            }

            @Override
            public void onHostPause() {
                if (soundWaveView.isAudioPlaying()) {
                    soundWaveView.pauseAudioPlayer();
                    isPaused = true;
                }
            }

            @Override
            public void onHostDestroy() {
                soundWaveView.stopAudioPlayer();
                soundWaveView.removeCallbacksAndListeners();
                soundWaveView.resetAudioPlayer();
            }

        };
        reactApplicationContext.addLifecycleEventListener(lifeCycleListener);

        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    private void executeFfmpegCommand(String[] cmd) {
        showOrHideJsLoader(true);
        FFmpeg.executeAsync(cmd, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                try {
                    showOrHideJsLoader(false); //HIDE_LOADER_WHEN_GOT_A_RESPONSE

                    if (returnCode == Config.RETURN_CODE_SUCCESS) {
                        WritableMap audioResponse = Arguments.createMap();
                        audioResponse.putBoolean(Constants.IS_COMPLETED, true);
                        audioResponse.putString(Constants.AUDIO_PATH, destinationPath);
                        sendEvent(reactApplicationContext, Constants.EVENT_AUDIO_TRIMMING_COMPLETE, audioResponse);

                    } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                        Log.d(tag, "JK GET_VERSION RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());
                    } else {
                        Log.d(tag, "JK GET_VERSION RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                    }
                } catch (Exception e) {
                    Log.e("@@@", Constants.EXCEPTION, e);
                }

            }
        });
    }

    public void setAudioUrl(String url) {
        this.fileUrl = url;
        try {
            soundWaveView.addAudioFileUrl(url);
        } catch (IOException | IllegalStateException e) {
            Log.d("@@@", Constants.EXCEPTION, e);
        }
    }

    public void setmMaxDuration(int duration) {
        this.mMaxDuration = duration;
    }

    public int getmMaxDuration() {
        return mMaxDuration;
    }

    /**
     * audio prepared listener
     *
     * @param mediaPlayer is used to play/pause music
     */
    @Override
    public void onMediaPrepared(MediaPlayer mediaPlayer) {
        duration = mediaPlayer.getDuration();
        setSeekBarPosition();
    }

    private void setSeekBarPosition() {
        if (duration >= mMaxDuration) {
            startPosition = 0;
            endPosition = mMaxDuration;

            audioRangeSeekBar.setThumbValue(0, (startPosition * 100f) / duration);
            audioRangeSeekBar.setThumbValue(1, (endPosition * 100f) / duration);

        } else {
            startPosition = 0;
            endPosition = (int) duration;
        }
        audioRangeSeekBar.initMaxWidth();
    }

    @Override
    public void onClick(View view) {
        if (view.getId() == tvStart.getId()) {
            trimAudio();
            soundWaveView.stopAudioPlayer();
            soundWaveView.removeCallbacksAndListeners();
            soundWaveView.resetAudioPlayer();

            WritableMap audioResponse = Arguments.createMap();
            audioResponse.putBoolean(IS_COMPLETED, false);
            sendEvent(reactApplicationContext, EVENT_AUDIO_START_PRESSED, audioResponse);

        } else if (view.getId() == tvExit.getId()) {
            exitView();

            WritableMap audioResponse = Arguments.createMap();
            audioResponse.putBoolean(IS_COMPLETED, false);
            sendEvent(reactApplicationContext, EVENT_AUDIO_EXIT_PRESSED, audioResponse);
        }
    }

    /**
     * exit current view, exit current view and clears listeners
     */
    public void exitView() {
        if (!compositeDisposable.isDisposed()) {
            compositeDisposable.dispose();
        }
        soundWaveView.stopAudioPlayer();
        soundWaveView.removeCallbacksAndListeners();
        soundWaveView.resetAudioPlayer();
    }

    /**
     * @param reactContext: application-context
     * @param eventName:    handled event name in react-native
     * @param params:       event input params
     */
    private void sendEvent(ReactContext reactContext, String eventName,
                           @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    /**
     * trim audio with FFMpeg
     */
    private void trimAudio() {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        destinationPath = FileUtils.getAudioPath(context);
        try {
            executeFfmpegCommand(ffMpegCommands.getTrimAudioCommands(fileUrl, destinationPath, startPosition, endPosition));
        } catch (Exception e) {
            Log.d("@@@", "FFmpeg exception - ", e);
        }
    }

    /**
     * thumb selection range bar callback listeners for audio trimming
     *
     * @param audioRangeSeekBar range selection view
     * @param index             thumb index 0 for left and 1 for right
     * @param value             represents current range value
     */
    @Override
    public void onCreate(AudioRangeSeekBar audioRangeSeekBar, int index, float value) {
        // range seek bar
    }

    @Override
    public void onSeek(AudioRangeSeekBar audioRangeSeekBar, int index, float value,
                       float position) {
        float percentageSeek = value / 100;
        if (index == Thumb.LEFT) {
            startPosition = (int) (percentageSeek * soundWaveView.getDuration());
            soundWaveView.seekTo(startPosition);
            moveStartTimeView(position);
        } else if (index == Thumb.RIGHT) {
            endPosition = (int) (percentageSeek * soundWaveView.getDuration());
            moveEndTimeView(position);
        }
    }

    @Override
    public void onSeekStart(AudioRangeSeekBar audioRangeSeekBar, int index, float value) {
        tvEndTime.setVisibility(VISIBLE);
    }

    @Override
    public void onSeekStop(AudioRangeSeekBar audioRangeSeekBar, int index, float value) {
        Log.d("@@@", "onSeekStop->" + index + "->" + value);
    }

    /**
     * @param value: start position of video
     */
    private void moveStartTimeView(float value) {
        if (value + tvStartTime.getWidth() > getWidth()) {
            tvStartTime.animate().x((value - tvStartTime.getWidth())).setDuration(100).start();
        } else {
            tvStartTime.animate().x(value).setDuration(100).start();
        }
        String time = String.format(Locale.getDefault(), "Start time %.2f",
                millisecondsToDisplayTime(startPosition / 1000));
        tvStartTime.setText(time);
        tvStartTime.requestLayout();
        setupLayoutHack();
    }

    /**
     * @param value: end position of video
     */
    private void moveEndTimeView(float value) {
        if (value + tvEndTime.getWidth() > getWidth()) {
            tvEndTime.animate().x((value - tvEndTime.getWidth())).setDuration(100).start();
        } else {
            tvEndTime.animate().x(value).setDuration(100).start();
        }
        String endTimeFormat = String.format(Locale.getDefault(), "End time %.2f",
                millisecondsToDisplayTime(endPosition / 1000));
        tvEndTime.setText(endTimeFormat);
        tvEndTime.requestLayout();
        setupLayoutHack();
    }

    /**
     * @param seconds: runner-time
     * @return float
     */
    private float millisecondsToDisplayTime(int seconds) {
        float time = 0;
        if (seconds >= 60) {
            time = Math.abs(seconds / 60);
            seconds %= 60;
        }
        time += seconds / 100f;
        return time;
    }

    /**
     * apply calculation drawing after view draw
     */
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

    /**
     * adjust child views
     */
    void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child instanceof TextView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }

        }
    }

    /**
     * @param title: set Title
     */
    public void setTitle(String title) {
        tvTrackTitle.setText(title);
    }

    /**
     * @param avatar: image-name
     */
    public void setAvatar(String avatar) {
        if (avatar != null) {
            Glide.with(context).load(avatar).diskCacheStrategy(DiskCacheStrategy.DATA)
                    .signature(new ObjectKey(avatar)).into(ivAlbumImage);
        }
    }

    /**
     * @param trackPath: input-path
     */
    public void setTrackPath(String trackPath) {
        String trackPathOg = trackPath + Constants.AUDIO_CLIENT_KEY;
        String cachedFile = AudioUtils.getSoundIfCached(context, trackPath);
        if (cachedFile != null) {
            showOrHideJsLoader(false);
            setAudioUrl(cachedFile);
            return;
        }
        final String audioOutputPath = FileUtils.getDownloadedMusicCachePath(context, AudioUtils.getSoundId(trackPath));
        showOrHideJsLoader(true);

        compositeDisposable.add(okioFileDownload(trackPathOg, new File(Objects.requireNonNull(audioOutputPath)))
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Consumer<Integer>() {
                    @Override
                    public void accept(Integer integer) throws Throwable {
                        populateProgress(integer);
                    }
                }, new Consumer<Throwable>() {
                    @Override
                    public void accept(Throwable throwable) throws Throwable {
                        showToast(context, context.getString(R.string.failed_do_download));
                    }
                }, new Action() {
                    @Override
                    public void run() throws Throwable {
                        showOrHideJsLoader(false);
                        setAudioUrl(audioOutputPath);
                    }
                }));
    }

    /**
     * @param author: author of audio
     */
    public void setAuthor(String author) {
        tvAuthor.setText(author);
    }

    /**
     * @param reactContext: application-context
     * @param params:       event parameters
     * @param eventName:    handled event naame
     */
    private void sendEvent(ReactApplicationContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }


    /**
     * populate progress to React-Native
     *
     * @param progress: progress
     */
    public void populateProgress(int progress) {
        WritableMap params = Arguments.createMap();
        params.putInt(AUDIO_DOWNLOAD_PROGRESS, progress);
        sendEvent(reactApplicationContext, params, EVENT_UPDATE_DOWNLOAD_PROGRESS);
    }

    /**
     * @param showLoader: show/hide loader
     */
    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(reactApplicationContext, params, EVENT_PROGRESS);
    }

    /**
     * @param url:      donwload url
     * @param destFile: output path
     * @return Rxjava.Observable
     */
    public static Observable<Integer> okioFileDownload(@NonNull final String url, @NonNull final File destFile) {
        return Observable.create(new ObservableOnSubscribe<Integer>() {
            @Override
            public void subscribe(@NonNull ObservableEmitter<Integer> emitter) throws Throwable {
                BufferedSink sink = null;
                BufferedSource source = null;
                int lastProgress = 0;
                try {
                    Request request = new Request.Builder().url(url).build();
                    Response response = new OkHttpClient().newCall(request).execute();
                    ResponseBody body = response.body();
                    long contentLength = Objects.requireNonNull(body).contentLength();
                    source = body.source();
                    sink = Okio.buffer(Okio.sink(destFile));
                    Buffer sinkBuffer = sink.buffer();
                    long totalBytesRead = 0;
                    int bufferSize = 6 * 1024;
                    long bytesRead;
                    while ((bytesRead = source.read(sinkBuffer, bufferSize)) != -1) {
                        sink.emit();
                        totalBytesRead += bytesRead;
                        int progress = (int) ((totalBytesRead * 100) / contentLength);
                        if (lastProgress != progress) { //reduce_redundant_callback
                            emitter.onNext(progress);
                        }
                    }
                    sink.flush();
                } catch (IOException e) {
                    Log.e("@@@", "IOException --- ", e);
                    emitter.onError(e);
                } finally {
                    Util.closeQuietly(sink);
                    Util.closeQuietly(source);
                }
                emitter.onComplete();
            }
        })
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread());
    }

    /**
     * @param context: application-context
     * @param message: message
     */
    private void showToast(Context context, String message) {
        if (message != null) {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(context, Constants.NULL, Toast.LENGTH_SHORT).show();
        }
    }

    public void releaseListeners() {
        reactApplicationContext.removeLifecycleEventListener(lifeCycleListener);
    }
}
