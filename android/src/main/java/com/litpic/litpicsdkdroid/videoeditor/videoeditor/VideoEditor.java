package com.litpic.litpicsdkdroid.videoeditor.videoeditor;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.Xml;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.RelativeLayout;

import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatImageView;
import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;

import com.arthenica.mobileffmpeg.Config;
import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.resource.gif.GifDrawable;
import com.bumptech.glide.signature.ObjectKey;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.AudioTrimCompletionListener;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.ffmpeg.reactnative.FFMpegCommands;
import com.litpic.litpicsdkdroid.utils.ColorTransparentUtils;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MapUtils;
import com.litpic.litpicsdkdroid.videoeditor.model.OverlayItemData;
import com.litpic.litpicsdkdroid.videoeditor.stickeroverlay.StickerOverlay;
import com.litpic.litpicsdkdroid.videoeditor.taguser.TagUserOverlayOnVideo;
import com.litpic.litpicsdkdroid.videoeditor.textoverlay.TextOverlay;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.playerview.AdjustableVideoPlayer;
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.view.CropperView;

import java.io.File;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Objects;

import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
import static com.litpic.litpicsdkdroid.config.Constants.BACKGROUND_MODE;
import static com.litpic.litpicsdkdroid.config.Constants.CENTER;
import static com.litpic.litpicsdkdroid.config.Constants.COLOR;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_CLOSE_EDIT_MODE;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_EXPORT_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_GET_VIDEO_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_LANDSCAPE_VIDEO_CROPPING;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_UPDATE_CLICKED_TAG_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_UPDATE_VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.FONT_FACE;
import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_URL;
import static com.litpic.litpicsdkdroid.config.Constants.IS_GIF;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_EXPORT;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_PREVIEW;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_SAVE;
import static com.litpic.litpicsdkdroid.config.Constants.SCALE;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_CLICKED_POS_X;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_CLICKED_POS_Y;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_USERS;
import static com.litpic.litpicsdkdroid.config.Constants.TEXT;
import static com.litpic.litpicsdkdroid.config.Constants.TEXT_ALIGNMENT;
import static com.litpic.litpicsdkdroid.config.Constants.TEXT_COLOR;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;
import static com.litpic.litpicsdkdroid.config.Constants.X_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.X_POS_ON_IMAGE;
import static com.litpic.litpicsdkdroid.config.Constants.Y_POS_ON_IMAGE;
import static com.litpic.litpicsdkdroid.utils.CommonUtils.getBitmapFromView;
import static com.litpic.litpicsdkdroid.utils.CommonUtils.hideKeyboardFrom;

@SuppressLint("ViewConstructor")
public class VideoEditor extends RelativeLayout
        implements TextOverlay.OverLayListener, CropperView.VideoCropperInterface,
        AudioTrimCompletionListener, View.OnTouchListener {

    private final ThemedReactContext context;

    private AdjustableVideoPlayer adjustableVideoPlayer;
    private Uri videoPath;
    private ReadableMap videoDetails;

    private AppCompatImageView trash;

    private TextOverlay currentOverLay;

    private String textBackgroundMode = Constants.EMPTY;

    private CropperView cropperView;
    private boolean cropperVisibility = false;

    String destinationPath;
    FileUtils fileUtils;

    private int videoWidth = 0;
    private int videoHeight = 0;

    private boolean maxWidthSet = false;
    private float tagClickedPosX;
    private float tagClickedPosY;

    ArrayList<OverlayItemData> overlayItemDataList = new ArrayList<>();
    DisplayMetrics displayMetrics = new DisplayMetrics();
    private FFMpegCommands ffMpegCommands;
    private final String tag = getClass().getSimpleName();
    WritableArray tagUsersDataArray;
    private float prevPosX;
    private float prevPosY;

    public VideoEditor(ThemedReactContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        Objects.requireNonNull(context.getCurrentActivity()).getWindow().setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        initViews();
    }

    private void initViews() {
        adjustableVideoPlayer = new AdjustableVideoPlayer(context);
        RelativeLayout.LayoutParams layoutParams = new LayoutParams(WRAP_CONTENT,
                WRAP_CONTENT);
        layoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL, RelativeLayout.TRUE);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

        adjustableVideoPlayer.setLayoutParams(layoutParams);

        if (videoDetails != null) {
            adjustableVideoPlayer.setVideoDetails(videoDetails);
        }

        if (videoPath != null) {
            adjustableVideoPlayer.setVideoPath(videoPath);
        }


        ffMpegCommands = new FFMpegCommands(context);
        fileUtils = new FileUtils();
        displayMetrics = getResources().getDisplayMetrics();
        versionFFmpeg();

        trash = new AppCompatImageView(context);
        RelativeLayout.LayoutParams trashLayoutParams = new LayoutParams(
                WRAP_CONTENT, WRAP_CONTENT);
        trashLayoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL, RelativeLayout.TRUE);
        trashLayoutParams.setMargins(0, 30, 0, 0);
        trash.setPadding(20, 20, 20, 20);
        trash.setLayoutParams(trashLayoutParams);
        trash.setBackground(ContextCompat.getDrawable(context, R.drawable.delete));
        trash.setVisibility(INVISIBLE);

        cropperView = new CropperView(context, 300, 300);
        cropperView.setVideoWidth(videoWidth);
        cropperView.setVisibility(cropperVisibility ? VISIBLE : INVISIBLE);
        cropperView.bringToFront();

        this.addView(adjustableVideoPlayer);
        this.addView(cropperView);
        this.addView(trash);

        this.requestLayout();

        setupLayoutHack();

        post(new Runnable() {
            @Override
            public void run() {
                initCroppingPoint();
            }
        });

        this.getViewTreeObserver().addOnGlobalLayoutListener(
                new ViewTreeObserver.OnGlobalLayoutListener() {
                    @Override
                    public void onGlobalLayout() {
                        if (getWidth() > 0 && !maxWidthSet && cropperView != null) {
                            maxWidthSet = true;
                            initCroppingPoint();
                        }
                    }
                });

        this.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (currentOverLay != null) {
                    hideKeyboardFrom(context, currentOverLay);
                    currentOverLay.clearFocus();
                }
            }
        });

        cropperView.setCropperListener(this);

        adjustableVideoPlayer.setSizeChangeListener(new AdjustableVideoPlayer.PlayerListener() {
            @Override
            public void onSizeChanged(int width, int height) {
                if (cropperView != null) {
                    cropperView.getLayoutParams().height = height;
                    cropperView.setSize(300, height);
                }
            }
        });
        adjustableVideoPlayer.getTagTransView().setOnTouchListener(this);
        lockOrientation();
        loadOverlayFromCache();
    }

    private void loadOverlayFromCache() {
        sendEvent(context, null, Constants.EVENT_LOAD_OVERLAY);
    }

    private void lockOrientation() {
        // landscape videos later will un command
        if (videoHeight > videoWidth) {
            context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        }
        if (context != null && context.getCurrentActivity() != null && context.getCurrentActivity().getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            int currentOrientation = getResources().getConfiguration().orientation;
            if (currentOrientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
        }
    }

    private void versionFFmpeg() {
        FFmpeg.executeAsync(ffMpegCommands.getVersionCommands(), new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.e(tag, "JK GET_VERSION RETURN_CODE_SUCCESS: " + Config.getLastCommandOutput());

                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.e(tag, "JK GET_VERSION RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());

                } else {
                    Log.e(tag, "JK GET_VERSION RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void executeFfmpegCommand(String[] cmd, final String outPutPath, final int method) {
        FFmpeg.executeAsync(cmd, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    Log.e(tag, Config.getLastCommandOutput());
                    if (method == METHOD_SAVE) {
                        //overlay text and video
                        saveVideoInternally(outPutPath);
                        playVideo();
                    } else if (method == METHOD_EXPORT) {
                        saveVideoInternally(outPutPath);
	                    playVideo();

                        WritableMap params = Arguments.createMap();
                        params.putString(VIDEO_PATH, outPutPath);
                        if (tagUsersDataArray != null) {
                            params.putArray(TAG_USERS, tagUsersDataArray);
                        }
                        sendEvent(context, params, EVENT_EXPORT_VIDEO);
                        //-----
                    } else if (method == METHOD_PREVIEW) {
                        // apply audio to video
                        videoPath = Uri.parse(outPutPath);
                        adjustableVideoPlayer.setVideoPath(videoPath);
                        WritableMap params = Arguments.createMap();
                        params.putString(VIDEO_PATH, outPutPath);
                        sendEvent(context, params, EVENT_UPDATE_VIDEO_PATH);
                        showOrHideJsLoader(false);
                    }
                    clearOverlayMedia();
                    overlayItemDataList.clear();
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.e(tag, "JK VideoEditor RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());

                } else {
                    Log.e(tag, "JK VideoEditor RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void clearOverlayMedia() {
        for (OverlayItemData overlayItemData : overlayItemDataList) {
            removeFile(overlayItemData.getFileUrl());
        }
    }

    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(context, params, EVENT_PROGRESS);
    }

    private void removeFile(String url) {
        File file = new File(url);
        if (file.exists()) {
            context.deleteFile(file.getName());
        }
    }

    private void saveVideoInternally(String videoPath) {
        FileUtils utils = new FileUtils();
        utils.saveVideoLocal(videoPath, context);
        WritableMap dataMap = Arguments.createMap();
        dataMap.putString(VIDEO_PATH, videoPath);
        sendEvent(context, dataMap, EVENT_GET_VIDEO_DETAILS);
    }

    @Override
    protected void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        this.removeAllViews();
        initViews();
        initCroppingPoint();
    }

    public void setVideoPath(Uri videoPath) {
        this.videoPath = videoPath;
        adjustableVideoPlayer.setVideoPath(videoPath);
        adjustableVideoPlayer.isLoopVideo(true);
    }

    public void setVideoPath(ReadableArray args) {
        if (args != null) {
            setVideoPath(Uri.parse(args.getString(0)));
        }
    }

    public void setVideoDetails(WritableMap details) {
        if (details != null) {
            sendEvent(context, details.copy(), EVENT_GET_VIDEO_DETAILS);
            this.videoDetails = details.copy();
            videoWidth = Integer.parseInt(Objects.requireNonNull(this.videoDetails.getString(WIDTH)));
            videoHeight = Integer.parseInt(Objects.requireNonNull(this.videoDetails.getString(HEIGHT)));
        }
        lockOrientation();
    }

    public void toggleShowCropperView() {
        if (cropperView != null && videoWidth > videoHeight) {
            cropperVisibility = !cropperVisibility;
            cropperView.setVisibility(cropperVisibility ? VISIBLE : INVISIBLE);
        }
    }

    /**
     * this method intentionally left blank
     */
    public void toggleTiltPreview() {
        Log.d("@@@", "toggleTiltPreview");
    }

    public void addTextOverLay(ReadableMap map) {

        //add new text overlay and show soft keyboard by onfocus
        AttributeSet attributes = Xml.asAttributeSet(
                getResources().getXml(R.xml.text_overlay_attr));
        TextOverlay ed = new TextOverlay(context, attributes);

        RelativeLayout.LayoutParams layoutParams = new LayoutParams(WRAP_CONTENT,
                WRAP_CONTENT);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
        ed.setLayoutParams(layoutParams);

        ed.setGravity(Gravity.CENTER);
        ed.setBackgroundResource(R.drawable.bg_rounded_corner);
        ed.setTextAlignment(TEXT_ALIGNMENT_CENTER);
        ed.setTextColor(ContextCompat.getColor(context, R.color.white));
        ed.setTypeface(ResourcesCompat.getFont(context, R.font.verdana));
        ed.setTextAppearance(context, R.style.overlayText);

        ed.setTrashView(trash);
        ed.setParentViewWidth(adjustableVideoPlayer.getVideoViewWidth());
        ed.setParentViewHeight(adjustableVideoPlayer.getVideoViewHeight());
        ed.setParentX(adjustableVideoPlayer.getVideoViewX());
        ed.setParentY(adjustableVideoPlayer.getVideoViewY());
        ed.setRemoveOverlayViewListener(this);
        ed.setMaxWidth((adjustableVideoPlayer.getVideoViewWidth() - adjustableVideoPlayer.getVideoViewWidth() / 3));

        addView(ed);
        ed.bringToFront();
        ed.requestFocus();

        currentOverLay = ed;

        if (map != null) {
            changeFont(map);
            changeTextColor(map);
            changeTextBackgroundColor(map, ed);
            changeTextAlignment(map, ed);
            ed.setText(map.getString(TEXT));

            ed.animate().x((float) map.getDouble(Constants.X)).y((float) map.getDouble(Constants.Y))
                    .setDuration(20).start();
        } else {
            InputMethodManager imm = (InputMethodManager) context.getSystemService(
                    Context.INPUT_METHOD_SERVICE);
            imm.showSoftInput(ed, InputMethodManager.SHOW_FORCED);

            ed.animate().x((displayMetrics.widthPixels / 2f) - adjustableVideoPlayer.getVideoViewWidth() / 3f).y(
                    adjustableVideoPlayer.getVideoViewY() + (adjustableVideoPlayer.getVideoViewHeight() / 6f))
                    .setDuration(20).start();
        }

        setupLayoutHack();
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
            if (child instanceof TextOverlay || child instanceof StickerOverlay ||
                    child instanceof TagUserOverlayOnVideo || child instanceof CropperView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }

        }
    }

    public void changeFont(ReadableArray args) {
        if (args != null && args.getString(0) != null) {
            changeFont(args.getString(0));
        }
    }

    public void changeFont(ReadableMap map) {
        if (map != null && map.getString(FONT_FACE) != null && !map.getString(FONT_FACE).isEmpty()) {
            changeFont(map.getString(FONT_FACE));
        }
    }

    public void changeFont(String font) {
        Typeface typeface;
        if (currentOverLay != null && font != null) {
            switch (font) {
                case Constants.PALATINO_BOLD:
                    typeface = ResourcesCompat.getFont(context, R.font.palatino_bold);
                    break;
                case Constants.MENLO_REGULAR:
                    typeface = ResourcesCompat.getFont(context, R.font.menloregular);
                    break;
                case Constants.SNELL_ROUND_HAND:
                    typeface = ResourcesCompat.getFont(context, R.font.snell_round_hand);
                    break;
                case Constants.CHALKBOARD_SE_REGULAR:
                    typeface = ResourcesCompat.getFont(context, R.font.chalkboard_se_regular);
                    break;
                case Constants.BRADLEY_HAND_BOLD:
                    typeface = ResourcesCompat.getFont(context, R.font.bradley_hand_bold);
                    break;
                case Constants.HELVETICA:
                    typeface = ResourcesCompat.getFont(context, R.font.helvetica);
                    break;
                default:
                    typeface = ResourcesCompat.getFont(context, R.font.verdana);
                    break;
            }
            currentOverLay.setTypeface(typeface);
            currentOverLay.setFontFace(font);
        }
    }

    public void changeTextColor(ReadableArray args) {
        if (args != null && args.getString(0) != null) {
            changeTextColor(args.getString(0));
        }
    }

    public void changeTextColor(ReadableMap map) {
        if (map != null && map.getString(TEXT_COLOR) != null) {
            changeTextColor(map.getString(TEXT_COLOR));
        }
    }

    public void changeTextColor(String textColor) {
        if (currentOverLay != null && textColor != null && !textColor.isEmpty()) {
            if (textBackgroundMode.isEmpty() || textBackgroundMode.equals(Constants.EMPTY)) {
                int color = Color.parseColor(textColor);
                currentOverLay.setTextColor(color);
                currentOverLay.setTextColor(textColor);
            } else {
                int color = Color.parseColor(textColor);
                updateTextBackGround(textBackgroundMode, color, currentOverLay);
            }
        }
    }

    @Override
    public void removeOverlayView(View view) {
        hideKeyboardFrom(context, view);
        this.removeView(view);
        Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        // Vibrate for 500 milliseconds
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            v.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            //deprecated in API 26
            v.vibrate(500); // NOSONAR
        }
        sendEvent(context, null, EVENT_CLOSE_EDIT_MODE);
    }

    @Override
    public void updateActiveText(TextOverlay view) {
        currentOverLay = view;
        animateTextToEdit(view);
    }

    private void animateTextToEdit(TextOverlay overlayOnImage) {
        prevPosX = overlayOnImage.getX();
        prevPosY = overlayOnImage.getY();
        overlayOnImage.animate().x((displayMetrics.widthPixels / 2f) - adjustableVideoPlayer.getVideoViewWidth() / 3f).y(
                adjustableVideoPlayer.getVideoViewY() + (adjustableVideoPlayer.getVideoViewHeight() / 6f))
                .setDuration(20).start();

        overlayOnImage.setOnFocusChangeListener(new OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                if (!hasFocus) {
                    animateTextToOriginalPosition();
                }
            }
        });
    }

    private void animateTextToOriginalPosition() {
        if (currentOverLay != null) {
            currentOverLay.animate().x(prevPosX).y(prevPosY).setDuration(20).start();
        }
    }

    public void changeTextBackgroundColor(ReadableArray args) {
        if (currentOverLay != null && args.getString(0) != null) {
            textBackgroundMode = args.getString(0);
            if (currentOverLay.getBackground() == null) {
                updateTextBackGround(textBackgroundMode, Color.WHITE, currentOverLay);
            } else {
                int color = 0;
                color = Color.WHITE;
                updateTextBackGround(textBackgroundMode, color, currentOverLay);
            }
        }
    }

    private void changeTextBackgroundColor(ReadableMap map, TextOverlay overlay) {
        if (map.getString(BACKGROUND_MODE) != null) {
            updateTextBackGround(map.getString(BACKGROUND_MODE), map.getInt(COLOR), overlay);
        }
    }

    public void changeTextAlignment(ReadableArray args) {
        if (currentOverLay != null && args.getString(0) != null) {
            String alignment = args.getString(0);
            updateTextAlignment(Objects.requireNonNull(alignment), currentOverLay);
        }
    }

    public void changeTextAlignment(ReadableMap map, TextOverlay overlay) {
        if (map.getString(TEXT_ALIGNMENT) != null) {
            updateTextAlignment(map.getString(TEXT_ALIGNMENT), overlay);
        }
    }

    private void updateTextBackGround(String backgroundMode, int currentColor,
                                      TextOverlay overlay) {
        switch (backgroundMode) {
            case Constants.EMPTY:
                ((GradientDrawable) overlay.getBackground()).setColor(Color.TRANSPARENT);
                break;
            case Constants.FILL:
                fillTextColor(currentColor, currentOverLay);
                break;
            case Constants.TRANSPARENT:
                fillTransparentTextColor(currentColor, currentOverLay);
                break;
            default:
                break;
        }
        overlay.setBackgroundMode(backgroundMode);
        overlay.setColor(currentColor);
    }

    private void fillTextColor(int currentColor, TextOverlay overlay) {
        GradientDrawable drawable = (GradientDrawable) overlay.getBackground();
        drawable.setColor(currentColor);
    }

    private void fillTransparentTextColor(int currentColor, TextOverlay overlay) {
        GradientDrawable drawable = (GradientDrawable) overlay.getBackground();
        drawable.setColor(Color.parseColor(ColorTransparentUtils.transparentColor(currentColor, 30)));
    }

    private void updateTextAlignment(String alignment, TextOverlay text) {
        switch (alignment) {
            case Constants.LEFT:
                text.setGravity(ALIGN_LEFT);
                break;
            case Constants.RIGHT:
                text.setGravity(ALIGN_RIGHT);
                break;
            case Constants.CENTER:
                text.setGravity(Gravity.CENTER);
                break;
            default:
                break;
        }
    }

    //sticker overlay - add image view of stickers
    public void addImageStickerOverlay(ReadableArray args, ReadableMap readableMap) {
        String imagePath = "";
        if (args != null) {
            imagePath = args.getString(0);
        }

        if (readableMap != null) {
            imagePath = readableMap.getString(IMAGE_URL);
        }

        AttributeSet attributes = Xml.asAttributeSet(
                getResources().getXml(R.xml.sticker_overlay_attr));
        StickerOverlay stickerOverlay = new StickerOverlay(context, attributes);

        RelativeLayout.LayoutParams layoutParams = new LayoutParams(350, 350);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

        stickerOverlay.setLayoutParams(layoutParams);
        stickerOverlay.setTrashView(trash);
        stickerOverlay.setParentViewWidth(adjustableVideoPlayer.getVideoViewWidth());
        stickerOverlay.setParentViewHeight(adjustableVideoPlayer.getVideoViewHeight());
        stickerOverlay.setParentX(adjustableVideoPlayer.getVideoViewX());
        stickerOverlay.setParentY(adjustableVideoPlayer.getVideoViewY());
        stickerOverlay.setRemoveOverlayViewListener(this);
        stickerOverlay.isGif(false);
        stickerOverlay.setStickerUrl(imagePath);

        addView(stickerOverlay);

        stickerOverlay.bringToFront();

        Glide.with(context).load(imagePath).fitCenter().diskCacheStrategy(DiskCacheStrategy.DATA)
                .signature(new ObjectKey(Objects.requireNonNull(imagePath))).into(stickerOverlay);

        stickerOverlay.requestFocus();

        if (readableMap != null) {
            stickerOverlay.setRotation((float) readableMap.getDouble(Constants.ROTATION));
            stickerOverlay.setScaleX((float) readableMap.getDouble(SCALE));
            stickerOverlay.animate().x((float) readableMap.getDouble(Constants.X))
                    .y((float) readableMap.getDouble(Constants.Y)).setDuration(20).start();
        } else {
            stickerOverlay.animate().x(adjustableVideoPlayer.getVideoViewX() +
                    (adjustableVideoPlayer.getVideoViewWidth() / 2f) - 175).y(
                    adjustableVideoPlayer.getVideoViewY() +
                            (adjustableVideoPlayer.getVideoViewHeight() / 2f) - 175).setDuration(20)
                    .start();
        }

    }

    //add gif stickers overlay
    public void addGifStickerOverlay(ReadableArray args, ReadableMap readableMap) {
        String gifPath = "";

        if (args != null) {
            gifPath = args.getString(0);
        }

        if (readableMap != null) {
            gifPath = readableMap.getString(IMAGE_URL);
        }

        AttributeSet attributes = Xml.asAttributeSet(
                getResources().getXml(R.xml.sticker_overlay_attr));
        StickerOverlay stickerOverlay = new StickerOverlay(context, attributes);

        RelativeLayout.LayoutParams layoutParams = new LayoutParams(350, 350);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

        stickerOverlay.setLayoutParams(layoutParams);
        stickerOverlay.setTrashView(trash);
        stickerOverlay.setParentViewWidth(adjustableVideoPlayer.getVideoViewWidth());
        stickerOverlay.setParentViewHeight(adjustableVideoPlayer.getVideoViewHeight());
        stickerOverlay.setParentX(adjustableVideoPlayer.getVideoViewX());
        stickerOverlay.setParentY(adjustableVideoPlayer.getVideoViewY());
        stickerOverlay.setRemoveOverlayViewListener(this);
        stickerOverlay.isGif(true);
        stickerOverlay.setStickerUrl(gifPath);
        addView(stickerOverlay);

        stickerOverlay.bringToFront();

        Glide.with(context).asGif().load(gifPath).diskCacheStrategy(DiskCacheStrategy.DATA)
                .signature(new ObjectKey(gifPath)).into(stickerOverlay);

        stickerOverlay.requestFocus();
        if (readableMap != null) {
            stickerOverlay.setRotation((float) readableMap.getDouble(Constants.ROTATION));
            stickerOverlay.setScaleX((float) readableMap.getDouble(SCALE));
            stickerOverlay.animate().x((float) readableMap.getDouble(Constants.X))
                    .y((float) readableMap.getDouble(Constants.Y)).setDuration(20).start();
        } else {
            stickerOverlay.animate().x(adjustableVideoPlayer.getVideoViewX() +
                    (adjustableVideoPlayer.getVideoViewWidth() / 2f) - 175).y(
                    adjustableVideoPlayer.getVideoViewY() +
                            (adjustableVideoPlayer.getVideoViewHeight() / 2f) - 175).setDuration(20)
                    .start();
        }
    }

    //tag user
    public void tagUserOnVideo(ReadableArray args) {
        ReadableMap map1 = args.getMap(0);
        if (map1 != null && map1.getString(IMAGE_URL) != null) {

            String stickerUrl = map1.getString(IMAGE_URL);

            AttributeSet attributes = Xml.asAttributeSet(
                    getResources().getXml(R.xml.sticker_overlay_attr));
            TagUserOverlayOnVideo tagUserOverlayOnVideo = new TagUserOverlayOnVideo(context, attributes);
            RelativeLayout.LayoutParams layoutParams = new LayoutParams(150, 150);
            layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

            tagUserOverlayOnVideo.setLayoutParams(layoutParams);
            tagUserOverlayOnVideo.setTrashView(trash);
            tagUserOverlayOnVideo.setParentViewWidth(adjustableVideoPlayer.getVideoViewWidth());
            tagUserOverlayOnVideo.setParentViewHeight(adjustableVideoPlayer.getVideoViewHeight());
            tagUserOverlayOnVideo.setParentX(adjustableVideoPlayer.getVideoViewX());
            tagUserOverlayOnVideo.setParentY(adjustableVideoPlayer.getVideoViewY());
            tagUserOverlayOnVideo.setRemoveOverlayViewListener(this);

            addView(tagUserOverlayOnVideo);

            tagUserOverlayOnVideo.bringToFront();

            if (stickerUrl != null && !stickerUrl.isEmpty()) {
                Glide.with(context).load(stickerUrl).fitCenter().circleCrop()
                        .diskCacheStrategy(DiskCacheStrategy.DATA)
                        .signature(new ObjectKey(stickerUrl)).into(tagUserOverlayOnVideo);
            } else {
                tagUserOverlayOnVideo.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.user_placeholder));
            }

            tagUserOverlayOnVideo.requestFocus();
            if (tagClickedPosX != 0f && tagClickedPosY != 0f) {
                tagUserOverlayOnVideo.animate().x(
                        tagClickedPosX - 75).y(
                        tagClickedPosY - 75).setDuration(20)
                        .start();
            } else {
                tagUserOverlayOnVideo.animate().x(adjustableVideoPlayer.getVideoViewX() +
                        (adjustableVideoPlayer.getVideoViewWidth() / 2f) - 75).y(
                        adjustableVideoPlayer.getVideoViewY() +
                                (adjustableVideoPlayer.getVideoViewHeight() / 2f) - 75).setDuration(20)
                        .start();
            }
            tagUserOverlayOnVideo.setUserData(MapUtils.toMap(map1));
        }
    }

    public void saveVideoToLocal() {
        getOverlayItemsList(METHOD_SAVE);
        if (!overlayItemDataList.isEmpty()) {
        	pauseVideo();
            destinationPath = fileUtils.getVideoCachePath(context);
            executeFfmpegCommand(ffMpegCommands.getVideoOverlayCommands(videoPath, overlayItemDataList, destinationPath),
                    destinationPath, METHOD_SAVE);
        } else {
            saveVideoInternally(videoPath.toString());
        }
    }

    public void exportVideoWithEdits() {
        tagUsersDataArray = Arguments.createArray();
        getOverlayItemsList(METHOD_EXPORT);
        if (!overlayItemDataList.isEmpty()) {
	        pauseVideo();
            destinationPath = fileUtils.getVideoCachePath(context);
            executeFfmpegCommand(ffMpegCommands.getVideoOverlayCommands(videoPath, overlayItemDataList, destinationPath),
                    destinationPath, METHOD_EXPORT);
        } else {
            saveVideoInternally(videoPath.toString());
            WritableMap params = Arguments.createMap();
            params.putString(VIDEO_PATH, videoPath.toString());
            if (tagUsersDataArray != null) {
                params.putArray(TAG_USERS, tagUsersDataArray);
            }
            sendEvent(context, params, EVENT_EXPORT_VIDEO);
        }
    }

    public void getOverlayItemsList(int method) {
        overlayItemDataList.clear();
        int childCount = getChildCount();
        for (int i = 0; i < childCount; i++) {
            if (getChildAt(i) instanceof StickerOverlay) {
                //get sticker image and gif save it as file
                OverlayItemData overlayItemData = getStickerOverlayItem(
                        (StickerOverlay) getChildAt(i));
                overlayItemDataList.add(overlayItemData);
            } else if (getChildAt(i) instanceof TextOverlay) {
                OverlayItemData overlayItemData = getTextOverlayItem((TextOverlay) getChildAt(i));
                overlayItemDataList.add(overlayItemData);
            } else if (method == METHOD_EXPORT && getChildAt(i) instanceof TagUserOverlayOnVideo) {
                getTagUserItemData((TagUserOverlayOnVideo) getChildAt(i));
            }
        }
    }

    public String saveBitmapAsFile(Bitmap bitmap) {
        return FileUtils.getCachedBitmapFile(context, bitmap, "overlay_" + Calendar.getInstance().getTimeInMillis() + ".png").getAbsolutePath();
    }

    private String saveGifAsFile(ByteBuffer bytes) {
        return FileUtils.saveGifOverlay(context, bytes, "overlay" + Calendar.getInstance().getTimeInMillis() + ".gif").getAbsolutePath();
    }

    private void initCroppingPoint() {
        if (cropperView == null) {
            return;
        }

        Rect offsetViewBounds = new Rect();
        //returns the visible bounds
        adjustableVideoPlayer.getDrawingRect(offsetViewBounds);
        // calculates the relative coordinates to the parent
        this.offsetDescendantRectToMyCoords(adjustableVideoPlayer, offsetViewBounds);

        cropperView.setTopRegion(offsetViewBounds.left, offsetViewBounds.top);
        cropperView.setMaxWidth(this.getWidth());

        cropperView.setCropperListener(new CropperView.VideoCropperInterface() {
            @Override
            public void onVideoCropPositionChanged(int position) {
                int[] location = new int[2];
                cropperView.getLocationOnScreen(location);
                int leftX = location[0];

                float videoViewWidth = adjustableVideoPlayer.getMeasuredWidth() - 10.0f;

                float divide = (adjustableVideoPlayer.getWidth() / videoViewWidth);
                int xPosition = (int) (divide * leftX);
                WritableMap params = Arguments.createMap();
                params.putInt(X_POSITION, xPosition);
                sendEvent(context, params, EVENT_LANDSCAPE_VIDEO_CROPPING);
            }
        });

    }

    private void sendEvent(ThemedReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    @Override
    public void onVideoCropPositionChanged(int position) {
        // video crop position changed
    }

    //drawable to bitmap conversion
    public Bitmap drawableToBitmap(Drawable drawable) {
        Bitmap bitmap = null;

        if (drawable instanceof BitmapDrawable) {
            BitmapDrawable bitmapDrawable = (BitmapDrawable) drawable;
            if (bitmapDrawable.getBitmap() != null) {
                return bitmapDrawable.getBitmap();
            }
        }

        if (drawable.getIntrinsicWidth() <= 0 || drawable.getIntrinsicHeight() <= 0) {
            bitmap = Bitmap.createBitmap(1, 1,
                    Bitmap.Config.ARGB_8888); // Single color bitmap will be created of 1x1 pixel
        } else {
            bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(),
                    drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        }

        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);
        return bitmap;
    }

    /**
     * audio trimming completion listener
     *
     * @param outputPath
     */
    @Override
    public void onAudioTrimmingCompleted(String outputPath) {
        setAudioUrl(outputPath);
    }

    public void setAudioUrl(String audioUrl) {
        if (audioUrl != null && !audioUrl.isEmpty()) {
            showOrHideJsLoader(true);
            applyAudioToVideo(audioUrl);
        }
    }

    private void applyAudioToVideo(String audioUrl) {
	    pauseVideo();
        destinationPath = fileUtils.getVideoCachePath(context);
        executeFfmpegCommand(ffMpegCommands.getApplyMusicToVideo(String.valueOf(videoPath), audioUrl, destinationPath), destinationPath,
                METHOD_PREVIEW);
    }

    private OverlayItemData getStickerOverlayItem(StickerOverlay stickerOverlay) {

        float widthPercentage =
                ((float) stickerOverlay.getWidth()) / (adjustableVideoPlayer.getVideoViewWidth()) *
                        100;
        float heightPercentage = ((float) stickerOverlay.getHeight()) /
                (adjustableVideoPlayer.getVideoViewHeight()) * 100;

        float finalWidth = ((widthPercentage / 100) * adjustableVideoPlayer.getVideoWidth()) *
                stickerOverlay.getScaleX();
        float finalHeight = ((heightPercentage / 100) * adjustableVideoPlayer.getVideoHeight()) *
                stickerOverlay.getScaleY();

        if (finalWidth > adjustableVideoPlayer.getVideoWidth()) {
            finalWidth = adjustableVideoPlayer.getVideoWidth();
        }

        if (finalHeight > adjustableVideoPlayer.getVideoHeight()) {
            finalHeight = adjustableVideoPlayer.getVideoHeight();
        }

        float scaledWidth = stickerOverlay.getWidth() * stickerOverlay.getScaleX();
        float scaledHeight = stickerOverlay.getHeight() * stickerOverlay.getScaleY();

        float relativeWidth = scaledWidth - stickerOverlay.getWidth();
        float relativeHeight = scaledHeight - stickerOverlay.getHeight();

        float finalX = (stickerOverlay.getX() - (relativeWidth / 2));
        float finalY = (stickerOverlay.getY() - (relativeHeight / 2));

        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                videoHeight > videoWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        videoWidth > videoHeight)) {
            finalX -= adjustableVideoPlayer.getVideoViewX();
        } else {
            finalX -= (displayMetrics.widthPixels - adjustableVideoPlayer.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - adjustableVideoPlayer.getHeight()) / 2f;
        }

        float xPercentage = (finalX / adjustableVideoPlayer.getVideoViewWidth()) * 100;
        float yPercentage = (finalY / adjustableVideoPlayer.getVideoViewHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * adjustableVideoPlayer.getVideoWidth();
        float viewPosY = (yPercentage / 100) * adjustableVideoPlayer.getVideoHeight();

        if (viewPosX > adjustableVideoPlayer.getVideoWidth()) {
            viewPosX = adjustableVideoPlayer.getVideoWidth() - finalWidth;
        }
        if (viewPosY > adjustableVideoPlayer.getVideoWidth()) {
            viewPosY = adjustableVideoPlayer.getVideoHeight() - finalHeight;
        }

        String url;
        if (stickerOverlay.isGif()) {
            final GifDrawable gifDrawable = (GifDrawable) stickerOverlay.getDrawable();
            ByteBuffer gif = gifDrawable.getBuffer();
            url = saveGifAsFile(gif);
        } else {
            Bitmap bitmap = drawableToBitmap(stickerOverlay.getDrawable());
            url = saveBitmapAsFile(bitmap);
        }

        return new OverlayItemData(url, viewPosX, viewPosY, finalWidth, finalHeight,
                stickerOverlay.getRotation(), stickerOverlay.isGif());
    }

    private OverlayItemData getTextOverlayItem(TextOverlay textOverlay) {
        Bitmap bitmap = getBitmapFromView(textOverlay);

        float widthPercentage =
                ((float) textOverlay.getWidth()) / (adjustableVideoPlayer.getVideoViewWidth()) *
                        100;
        float heightPercentage =
                ((float) textOverlay.getHeight()) / (adjustableVideoPlayer.getVideoViewHeight()) *
                        100;

        float finalWidth = ((widthPercentage / 100) * adjustableVideoPlayer.getVideoWidth()) *
                textOverlay.getScaleX();
        float finalHeight = ((heightPercentage / 100) * adjustableVideoPlayer.getVideoHeight()) *
                textOverlay.getScaleY();

        if (finalWidth > adjustableVideoPlayer.getVideoWidth()) {
            finalWidth = adjustableVideoPlayer.getVideoWidth();
        }

        if (finalHeight > adjustableVideoPlayer.getVideoHeight()) {
            finalHeight = adjustableVideoPlayer.getVideoHeight();
        }

        float scaledWidth = textOverlay.getWidth() * textOverlay.getScaleX();
        float scaledHeight = textOverlay.getHeight() * textOverlay.getScaleY();

        float relativeWidth = scaledWidth - textOverlay.getWidth();
        float relativeHeight = scaledHeight - textOverlay.getHeight();

        float finalX = (textOverlay.getX() - (relativeWidth / 2));
        float finalY = (textOverlay.getY() - (relativeHeight / 2));

        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                videoHeight > videoWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        videoWidth > videoHeight)) {
            finalX -= adjustableVideoPlayer.getVideoViewX();
        } else {
            finalX -= (displayMetrics.widthPixels - adjustableVideoPlayer.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - adjustableVideoPlayer.getHeight()) / 2f;
        }

        float xPercentage = (finalX / adjustableVideoPlayer.getVideoViewWidth()) * 100;
        float yPercentage = (finalY / adjustableVideoPlayer.getVideoViewHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * adjustableVideoPlayer.getVideoWidth();
        float viewPosY = (yPercentage / 100) * adjustableVideoPlayer.getVideoHeight();

        if (viewPosX > adjustableVideoPlayer.getVideoWidth()) {
            viewPosX = adjustableVideoPlayer.getVideoWidth() - finalWidth;
        }
        if (viewPosY > adjustableVideoPlayer.getVideoHeight()) {
            viewPosY = adjustableVideoPlayer.getVideoHeight() - finalHeight;
        }

        String url = saveBitmapAsFile(bitmap);
        return new OverlayItemData(url, viewPosX, viewPosY, finalWidth, finalHeight,
                textOverlay.getRotation(), textOverlay.getRotation(), textOverlay.getRotation());
    }

    private void getTagUserItemData(TagUserOverlayOnVideo tagUserOverlayOnVideo) {
        float widthPercentage =
                ((float) tagUserOverlayOnVideo.getWidth()) / (adjustableVideoPlayer.getVideoViewWidth()) *
                        100;
        float heightPercentage = ((float) tagUserOverlayOnVideo.getHeight()) /
                (adjustableVideoPlayer.getVideoViewHeight()) * 100;

        float finalWidth = ((widthPercentage / 100) * adjustableVideoPlayer.getVideoWidth()) *
                tagUserOverlayOnVideo.getScaleX();
        float finalHeight = ((heightPercentage / 100) * adjustableVideoPlayer.getVideoHeight()) *
                tagUserOverlayOnVideo.getScaleY();

        if (finalWidth > adjustableVideoPlayer.getVideoWidth()) {
            finalWidth = adjustableVideoPlayer.getVideoWidth();
        }

        if (finalHeight > adjustableVideoPlayer.getVideoHeight()) {
            finalHeight = adjustableVideoPlayer.getVideoHeight();
        }

        float scaledWidth = tagUserOverlayOnVideo.getWidth() * tagUserOverlayOnVideo.getScaleX();
        float scaledHeight = tagUserOverlayOnVideo.getHeight() * tagUserOverlayOnVideo.getScaleY();

        float relativeWidth = scaledWidth - tagUserOverlayOnVideo.getWidth();
        float relativeHeight = scaledHeight - tagUserOverlayOnVideo.getHeight();

        float finalX = (tagUserOverlayOnVideo.getX() - (relativeWidth / 2));
        float finalY = (tagUserOverlayOnVideo.getY() - (relativeHeight / 2));

        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                videoHeight > videoWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        videoWidth > videoHeight)) {
            finalX -= adjustableVideoPlayer.getVideoViewX();
        } else {
            finalX -= (displayMetrics.widthPixels - adjustableVideoPlayer.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - adjustableVideoPlayer.getHeight()) / 2f;
        }

        float xPercentage = (finalX / adjustableVideoPlayer.getVideoViewWidth()) * 100;
        float yPercentage = (finalY / adjustableVideoPlayer.getVideoViewHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * adjustableVideoPlayer.getVideoWidth();
        float viewPosY = (yPercentage / 100) * adjustableVideoPlayer.getVideoHeight();

        if (viewPosX > adjustableVideoPlayer.getVideoWidth()) {
            viewPosX = adjustableVideoPlayer.getVideoWidth() - finalWidth;
        }
        if (viewPosY > adjustableVideoPlayer.getVideoHeight()) {
            viewPosY = adjustableVideoPlayer.getVideoHeight() - finalHeight;
        }

        WritableMap map = MapUtils.toWritableMap(tagUserOverlayOnVideo.getUserData());
        map.putString(X_POS_ON_IMAGE, String.valueOf(viewPosX));
        map.putString(Y_POS_ON_IMAGE, String.valueOf(viewPosY));
        tagUsersDataArray.pushMap(map);
    }

    public void nextClicked(Callback callback) {
        Log.d("@@@", "next clicked " + callback);
    }

    public void showTagTransparentView(boolean showTransView) {
        adjustableVideoPlayer.getTagTransView().setVisibility(showTransView ? VISIBLE : INVISIBLE);
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            tagClickedPosX = event.getX();
            tagClickedPosY = event.getY();
            adjustableVideoPlayer.getTagTransView().setVisibility(GONE);
            WritableMap tagPos = Arguments.createMap();
            tagPos.putDouble(TAG_CLICKED_POS_X, tagClickedPosX);
            tagPos.putDouble(TAG_CLICKED_POS_Y, tagClickedPosY);
            sendEvent(context, tagPos, EVENT_UPDATE_CLICKED_TAG_POSITION);
        }
        return true;
    }

    public void getOverlayItemsList(Callback callback) {
        WritableArray array = Arguments.createArray();

        int childCount = getChildCount();
        for (int i = 0; i < childCount; i++) {
            if (getChildAt(i) instanceof StickerOverlay) {
                array.pushMap(getOverlayStickerMap((StickerOverlay) getChildAt(i)));
            } else if (getChildAt(i) instanceof TextOverlay) {
                array.pushMap(getOverlayTextMap((TextOverlay) getChildAt(i)));
            }
        }
        callback.invoke(array);
    }

    private WritableMap getOverlayStickerMap(StickerOverlay stickerOverlay) {
        WritableMap stickerMap = Arguments.createMap();
        stickerMap.putDouble(Constants.X, stickerOverlay.getX());
        stickerMap.putDouble(Constants.Y, stickerOverlay.getY());
        stickerMap.putString(IMAGE_URL, stickerOverlay.getStickerUrl());
        stickerMap.putBoolean(IS_GIF, stickerOverlay.isGif());
        stickerMap.putDouble(SCALE, stickerOverlay.getScaleX());
        stickerMap.putDouble(Constants.ROTATION, stickerOverlay.getRotation());
        stickerMap.putString(Constants.OVERLAY_TYPE, Constants.TYPE_STICKER);
        return stickerMap;
    }

    private WritableMap getOverlayTextMap(TextOverlay textOverlay) {
        WritableMap textMap = Arguments.createMap();
        textMap.putString(Constants.TYPE_TEXT, Objects.requireNonNull(textOverlay.getText()).toString());
        textMap.putDouble(Constants.X, textOverlay.getX());
        textMap.putDouble(Constants.Y, textOverlay.getY());
        textMap.putDouble(SCALE, textOverlay.getScaleX());
        textMap.putString(TEXT_ALIGNMENT, getTextAlignment(textOverlay));
        textMap.putDouble(Constants.ROTATION, textOverlay.getRotation());
        textMap.putString(Constants.OVERLAY_TYPE, Constants.TYPE_TEXT);
        textMap.putString(BACKGROUND_MODE, textOverlay.getBackgroundMode());
        textMap.putString(TEXT_COLOR, textOverlay.getTextColor());
        textMap.putInt(COLOR, textOverlay.getColor());
        textMap.putString(FONT_FACE, textOverlay.getFontFace());
        textMap.putString(TEXT, textOverlay.getText().toString());
        return textMap;
    }

    @SuppressLint("SwitchIntDef")
    private String getTextAlignment(TextOverlay textOverlay) {
        String alignment = "";
        switch (textOverlay.getTextAlignment()) {
            case ALIGN_LEFT:
            case View.TEXT_ALIGNMENT_TEXT_START:
                alignment = Constants.LEFT;
                break;
            case ALIGN_RIGHT:
            case View.TEXT_ALIGNMENT_TEXT_END:
            case View.TEXT_ALIGNMENT_VIEW_END:
                alignment = Constants.RIGHT;
                break;
            case View.TEXT_ALIGNMENT_CENTER:
            case View.TEXT_ALIGNMENT_GRAVITY:
            case View.TEXT_ALIGNMENT_INHERIT:
            default:
                alignment = CENTER;
        }
        return alignment;
    }

    public void setPreviousOverlayData(ReadableArray readableArray) {
        if (readableArray != null && readableArray.size() > 0) {
            for (int index = 0; index < readableArray.size(); index++) {
                ReadableMap readableMap = readableArray.getMap(index);
                if (readableMap != null) {
                    addOverlayFromCache(readableMap);
                }
            }
        }
    }

    private void addOverlayFromCache(ReadableMap readableMap) {
        if (Objects.requireNonNull(readableMap.getString(Constants.OVERLAY_TYPE)).equals(Constants.TYPE_STICKER)) {
            if (readableMap.getBoolean(IS_GIF)) {
                addGifStickerOverlay(null, readableMap);
            } else {
                addImageStickerOverlay(null, readableMap);
            }
        } else if (Objects.requireNonNull(readableMap.getString(Constants.OVERLAY_TYPE)).equals(Constants.TYPE_TEXT)) {
            addTextOverLay(readableMap);
        }
    }

    public void playVideo() {
        if (adjustableVideoPlayer != null) {
            adjustableVideoPlayer.playVideo();
        }
    }

    public void pauseVideo() {
        if (adjustableVideoPlayer != null) {
            adjustableVideoPlayer.pauseVideo();
        }
    }
}
