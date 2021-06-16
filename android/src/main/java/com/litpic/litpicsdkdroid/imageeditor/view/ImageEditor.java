package com.litpic.litpicsdkdroid.imageeditor.view;

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
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.Xml;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;
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
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.camerapreview.audioplayer.BackgroundAudioPlayer;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.ffmpeg.reactnative.FFMpegCommands;
import com.litpic.litpicsdkdroid.imageeditor.customview.CustomImageView;
import com.litpic.litpicsdkdroid.imageeditor.model.OverlayOnImageData;
import com.litpic.litpicsdkdroid.imageeditor.stickeroverlay.StickerOverlayOnImage;
import com.litpic.litpicsdkdroid.imageeditor.taguser.TagUserOverlayOnImage;
import com.litpic.litpicsdkdroid.imageeditor.textoverlay.TextOverlayOnImage;
import com.litpic.litpicsdkdroid.trimmermodule.view.VideoViewPreview;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MapUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.view.CropperView;

import java.io.File;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Objects;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
import static android.widget.RelativeLayout.ALIGN_LEFT;
import static android.widget.RelativeLayout.ALIGN_RIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_CLOSE_EDIT_MODE;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_EXPORT_IMAGE;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_LANDSCAPE_IMAGE_CROPPING;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_MOVE_VIDEO_FOR_EDIT;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_UPDATE_CLICKED_TAG_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_URL;
import static com.litpic.litpicsdkdroid.config.Constants.IS_EXPORT_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_EXPORT;
import static com.litpic.litpicsdkdroid.config.Constants.METHOD_SAVE;
import static com.litpic.litpicsdkdroid.config.Constants.MOVE_VIDEO_FOR_EDIT;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_CLICKED_POS_X;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_CLICKED_POS_Y;
import static com.litpic.litpicsdkdroid.config.Constants.TAG_USERS;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;
import static com.litpic.litpicsdkdroid.config.Constants.X_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.X_POS_ON_IMAGE;
import static com.litpic.litpicsdkdroid.config.Constants.Y_POS_ON_IMAGE;
import static com.litpic.litpicsdkdroid.utils.CommonUtils.getBitmapFromView;
import static com.litpic.litpicsdkdroid.utils.CommonUtils.hideKeyboardFrom;

@SuppressLint("ViewConstructor")
public class ImageEditor extends FrameLayout

        implements VideoViewPreview.SizeListener, TextOverlayOnImage.OverLayListener,
        CropperView.VideoCropperInterface, View.OnTouchListener {

    private final ThemedReactContext context;
    private CustomImageView imageView;
    private FrameLayout tagTransViewParent;
    private String imagePath = "";

    private int imageHeight;
    private int imageWidth;
    private boolean maxWidthSet = false;

    private AppCompatImageView trash;
    private TextOverlayOnImage currentOverLay;

    private String textBackgroundMode = Constants.EMPTY;
    String destinationPath;
    FileUtils fileUtils;
    private boolean isExportVideo = false;
    private FFMpegCommands ffMpegCommands;

    private CropperView cropperView;
    private boolean cropperVisibility = false;
    private String audioUrl;

    ArrayList<OverlayOnImageData> overlayOnImageDataList = new ArrayList<>();
    WritableArray tagUsersDataArray;
    DisplayMetrics displayMetrics = new DisplayMetrics();
    private final String tag = getClass().getSimpleName();
    private float tagClickedPosX;
    private float tagClickedPosY;
    private BackgroundAudioPlayer audioPlayer;
    private float prevPosX;
    private float prevPosY;
    LifecycleEventListener lifeCycleListener;

    public ImageEditor(@NonNull ThemedReactContext context) {
        this(context, null, 0);
    }

    public ImageEditor(ThemedReactContext context, AttributeSet attributes, int i) {
        super(context, attributes, i);
        this.context = context;
        Objects.requireNonNull(context.getCurrentActivity()).getWindow().setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        initViews();
    }

    private void initViews() {
        LayoutParams params = new LayoutParams(
                MATCH_PARENT, MATCH_PARENT,
                Gravity.CENTER);
        this.setLayoutParams(params);

        LayoutInflater.from(context).inflate(R.layout.cropping_image_view, this, true);

        RelativeLayout croppingImageContainer = findViewById(R.id.croppingImageContainer);
        imageView = findViewById(R.id.cropping_image_view);
        imageView.setSizeListener(this);
        tagTransViewParent = findViewById(R.id.tag_tans_view);
        tagTransViewParent.setOnTouchListener(this);

        fileUtils = new FileUtils();
        displayMetrics = getResources().getDisplayMetrics();

        if (!TextUtils.isEmpty(imagePath)) {
            imageView.setImageURI(Uri.parse(imagePath));
        }

        trash = new AppCompatImageView(context);
        RelativeLayout.LayoutParams trashLayoutParams = new RelativeLayout.LayoutParams(
                WRAP_CONTENT, WRAP_CONTENT);
        trashLayoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL, RelativeLayout.TRUE);
        trashLayoutParams.setMargins(0, 30, 0, 0);
        trash.setPadding(20, 20, 20, 20);
        trash.setLayoutParams(trashLayoutParams);
        trash.setBackground(ContextCompat.getDrawable(context, R.drawable.delete));
        trash.bringToFront();
        trash.setVisibility(INVISIBLE);


        cropperView = new CropperView(context, 300, 300);
        cropperView.setVideoWidth(imageWidth);
        cropperView.setVisibility(cropperVisibility ? VISIBLE : INVISIBLE);
        cropperView.bringToFront();

        croppingImageContainer.addView(trash);
        croppingImageContainer.addView(cropperView);
        ffMpegCommands = new FFMpegCommands(context);

        this.requestLayout();

        setupLayoutHack();

        post(new Runnable() {
            @Override
            public void run() {
                initCroppingPoint();
            }
        });

        cropperView.setCropperListener(this);

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

        imageView.setSizeListener(new VideoViewPreview.SizeListener() {
            @Override
            public void onSizeChanged(int width, int height) {
                if (cropperView != null) {
                    cropperView.getLayoutParams().height = height;
                    cropperView.setSize(300, height);
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

        lockOrientation();
        audioPlayer = new BackgroundAudioPlayer();
        audioPlayer.setLooping(true);
        lifeCycleEvent();
    }

    private void lifeCycleEvent() {
        lifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                if (audioPlayer != null && audioUrl != null && !audioUrl.isEmpty()) {
                    audioPlayer.setAudio(audioUrl);
                }
            }

            @Override
            public void onHostPause() {
                if (audioPlayer != null && audioUrl != null && !audioUrl.isEmpty()) {
                    audioPlayer.stopAudio();
                }
            }

            @Override
            public void onHostDestroy() {
                clearAudioPlayer();
            }
        };
        context.addLifecycleEventListener(lifeCycleListener);
    }

    private void lockOrientation() {
        //landscape image later will un command
        if (context.getCurrentActivity() != null) {
            context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        }
    }

    private void excecuteFfmpegCommand(String[] commands, final String outPutPath, final int method) {
        FFmpeg.executeAsync(commands, new ExecuteCallback() {
            @Override
            public void apply(long executionId, int returnCode) {
                if (returnCode == Config.RETURN_CODE_SUCCESS) {
                    //for debugging purpose this code added
                    if (method == METHOD_SAVE) {
                        methodSave(outPutPath);
                    } else if (method == METHOD_EXPORT) {
                        methodExport(outPutPath);
                    } else if (method == MOVE_VIDEO_FOR_EDIT) {
                        WritableMap params = Arguments.createMap();
                        params.putString(IMAGE_PATH, outPutPath);
                        params.putString(VIDEO_PATH, outPutPath);
                        params.putBoolean(IS_EXPORT_VIDEO, true);
                        if (tagUsersDataArray != null && tagUsersDataArray.size() > 0) {
                            params.putArray(TAG_USERS, tagUsersDataArray);
                        }
                        sendEvent(context, params, EVENT_MOVE_VIDEO_FOR_EDIT);
                    }
                    clearOverlayList();
                } else if (returnCode == Config.RETURN_CODE_CANCEL) {
                    Log.d(tag, "JK ImageEditor RETURN_CODE_CANCEL: " + Config.getLastCommandOutput());

                } else {
                    Log.d(tag, "JK ImageEditor RETURN_CODE_ERROR: " + Config.getLastCommandOutput());
                }
            }
        });
    }

    private void methodSave(String outPutPath) {
        if (!isExportVideo) {
            saveImageInLocal(outPutPath);
        } else {
            saveVideoInLocalPath(outPutPath);
        }
    }

    private void methodExport(String outPutPath) {
        //save video or image
        saveMedia(outPutPath, isExportVideo);

        WritableMap params = Arguments.createMap();
        params.putString(IMAGE_PATH, outPutPath);
        params.putBoolean(IS_EXPORT_VIDEO, isExportVideo);
        if (tagUsersDataArray != null) {
            params.putArray(TAG_USERS, tagUsersDataArray);
        }
        sendEvent(context, params, EVENT_EXPORT_IMAGE);
    }

    private void saveMedia(String mediaPath, boolean isExportVideo) {
        if (!isExportVideo) {
            saveImageInLocal(mediaPath);
        } else {
            saveVideoInLocalPath(mediaPath);
        }
    }

    private void clearOverlayList() {
        for (OverlayOnImageData overlayItemData : overlayOnImageDataList) {
            removeFile(overlayItemData.getFileUrl());
        }
        overlayOnImageDataList.clear();
    }

    private void saveImageInLocal(String imagePath) {
        fileUtils.saveImageLocal(imagePath, context);
    }

    private void saveVideoInLocalPath(String videoPath) {
        fileUtils.saveVideoLocal(videoPath, context);
    }

    private void removeFile(String url) {
        File file = new File(url);
        if (file.exists()) {
            context.deleteFile(file.getName());
        }
    }

    @Override
    protected void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Log.d("@@@", "onConfigurationChanged");
    }

    @Override
    public void onSizeChanged(int width, int height) {
        Log.d("@@@", "onSizeChanged - ");
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
        imageView.setImageURI(Uri.parse(imagePath));
    }

    public void setImageDetails(WritableMap details) {
        ReadableMap imageDetails = details.copy();
        if (MediaUtils.isAnamorphic(imagePath)) {
            imageWidth = imageDetails.getInt(HEIGHT);
            imageHeight = imageDetails.getInt(WIDTH);
        } else {
            imageWidth = imageDetails.getInt(WIDTH);
            imageHeight = imageDetails.getInt(HEIGHT);
        }
        imageView.setImageHeightAndWidth(imageWidth, imageHeight);
        lockOrientation();
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
            if (child instanceof TextOverlayOnImage || child instanceof StickerOverlayOnImage ||
                    child instanceof TagUserOverlayOnImage || child instanceof CustomImageView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
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
            v.vibrate(500);                                 // NOSONAR
        }
        sendEvent(context, null, EVENT_CLOSE_EDIT_MODE);
    }

    public void showTagTransparentView(boolean showTransView) {
        tagTransViewParent.setVisibility(showTransView ? VISIBLE : INVISIBLE);
    }

    //text overlay -----
    public void addTextOverLay() {

        //add new text overlay and show soft keyboard by onfocus
        AttributeSet attributes = Xml.asAttributeSet(
                getResources().getXml(R.xml.text_overlay_attr));
        TextOverlayOnImage ed = new TextOverlayOnImage(context, attributes);

        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                WRAP_CONTENT, WRAP_CONTENT);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
        ed.setLayoutParams(layoutParams);

        ed.setGravity(Gravity.CENTER);
        ed.setBackgroundResource(R.drawable.bg_rounded_corner);
        ed.setTextAlignment(TEXT_ALIGNMENT_CENTER);
        ed.setTextColor(ContextCompat.getColor(context, R.color.white));
        ed.setTypeface(ResourcesCompat.getFont(context, R.font.verdana));
        ed.setTextAppearance(context, R.style.overlayText);

        ed.setTrashView(trash);
        ed.setParentViewWidth(imageView.getWidth());
        ed.setParentViewHeight(imageView.getHeight());
        ed.setParentX(imageView.getImageX());
        ed.setParentY(imageView.getImageY());
        ed.setRemoveOverlayViewListener(this);
        ed.setMaxWidth((imageView.getWidth() - imageView.getWidth() / 3));

        addView(ed);
        ed.bringToFront();
        ed.requestFocus();

        currentOverLay = ed;

        InputMethodManager imm = (InputMethodManager) context.getSystemService(
                Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(ed, InputMethodManager.SHOW_FORCED);

        ed.animate().x((displayMetrics.widthPixels / 2f) - imageView.getWidth() / 3f).y(
                imageView.getImageY() + (imageView.getHeight() / 6f)).setDuration(20).start();

        setupLayoutHack();
    }

    public void changeFont(ReadableArray args) {
        Typeface typeface;
        if (currentOverLay != null && args.getString(0) != null) {
            switch (Objects.requireNonNull(args.getString(0))) {
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
        }
    }

    public void changeTextColor(ReadableArray args) {
        if (currentOverLay != null && args.getString(0) != null) {
            int color = Color.parseColor(args.getString(0));
            if (textBackgroundMode.equals(Constants.EMPTY)) {
                currentOverLay.setTextColor(color);
            } else {
                updateTextBackGround(textBackgroundMode, color, currentOverLay);
            }
        }
    }

    @Override
    public void updateActiveText(TextOverlayOnImage view) {
        currentOverLay = view;
        animateTextToEdit(currentOverLay);
    }

    private void animateTextToEdit(TextOverlayOnImage overlayOnImage) {
        prevPosX = overlayOnImage.getX();
        prevPosY = overlayOnImage.getY();
        overlayOnImage.animate().x((displayMetrics.widthPixels / 2f) - imageView.getWidth() / 3f).y(
                imageView.getImageY() + (imageView.getHeight() / 6f)).setDuration(20).start();

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

    public void changeTextAlignment(ReadableArray args) {
        if (currentOverLay != null && args.getString(0) != null) {
            String alignment = args.getString(0);
            updateTextAlignment(Objects.requireNonNull(alignment), currentOverLay);
        }
    }

    private void updateTextBackGround(String backgroundMode, int currentColor,
                                      TextOverlayOnImage overlay) {
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
    }

    private void fillTextColor(int currentColor, TextOverlayOnImage overlay) {
        GradientDrawable drawable = (GradientDrawable) overlay.getBackground();
        drawable.setColor(currentColor);
    }

    private void fillTransparentTextColor(int currentColor, TextOverlayOnImage overlay) {
        GradientDrawable drawable = (GradientDrawable) overlay.getBackground();
        drawable.setColor(Color.argb(50, Color.red(currentColor), Color.green(currentColor), Color.blue(currentColor))); //50% transparent
//      drawable.setColor(Color.parseColor(ColorTransparentUtils.transparentColor(currentColor, 90)));
    }

    private void updateTextAlignment(String alignment, TextOverlayOnImage text) {
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
    public void addImageStickerOverlay(ReadableArray args) {
        //check is sticker url is valid
        if (args != null && args.getString(0) != null && !TextUtils.isEmpty(args.getString(0))) {

            String stickerUrl = args.getString(0);

            AttributeSet attributes = Xml.asAttributeSet(
                    getResources().getXml(R.xml.sticker_overlay_attr));
            StickerOverlayOnImage stickerOverlayOnImage = new StickerOverlayOnImage(context,
                    attributes);

            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(350, 350);
            layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

            stickerOverlayOnImage.setLayoutParams(layoutParams);
            stickerOverlayOnImage.setTrashView(trash);
            stickerOverlayOnImage.setParentViewWidth(imageView.getWidth());
            stickerOverlayOnImage.setParentViewHeight(imageView.getHeight());
            stickerOverlayOnImage.setParentX(imageView.getImageX());
            stickerOverlayOnImage.setParentY(imageView.getImageY());
            stickerOverlayOnImage.setRemoveOverlayViewListener(this);
            stickerOverlayOnImage.isGif(false);

            addView(stickerOverlayOnImage);

            stickerOverlayOnImage.bringToFront();

            Glide.with(context).load(stickerUrl).fitCenter().diskCacheStrategy(DiskCacheStrategy.DATA)
                    .signature(new ObjectKey(stickerUrl)).into(stickerOverlayOnImage);

            stickerOverlayOnImage.requestFocus();
            stickerOverlayOnImage.animate().x(
                    imageView.getImageX() + (imageView.getWidth() / 2f) - 175).y(
                    imageView.getImageY() + (imageView.getHeight() / 2f) - 175).setDuration(20)
                    .start();
        }
    }

    //add gif stickers overlay
    public void addGifStickerOverlay(ReadableArray args) {

        String gifImagePath = args.getString(0);

        AttributeSet attributes = Xml.asAttributeSet(
                getResources().getXml(R.xml.sticker_overlay_attr));
        StickerOverlayOnImage stickerOverlayOnImage = new StickerOverlayOnImage(context,
                attributes);

        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(350, 350);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

        stickerOverlayOnImage.setLayoutParams(layoutParams);
        stickerOverlayOnImage.setTrashView(trash);
        stickerOverlayOnImage.setParentViewWidth(imageView.getWidth());
        stickerOverlayOnImage.setParentViewHeight(imageView.getHeight());
        stickerOverlayOnImage.setParentX(imageView.getImageX());
        stickerOverlayOnImage.setParentY(imageView.getImageY());
        stickerOverlayOnImage.setRemoveOverlayViewListener(this);
        stickerOverlayOnImage.isGif(true);
        addView(stickerOverlayOnImage);

        stickerOverlayOnImage.bringToFront();

        Glide.with(context).asGif().load(gifImagePath).diskCacheStrategy(DiskCacheStrategy.DATA)
                .signature(new ObjectKey(gifImagePath)).into(stickerOverlayOnImage);

        stickerOverlayOnImage.requestFocus();
        stickerOverlayOnImage.animate().x(imageView.getImageX() + (imageView.getWidth() / 2f) - 175)
                .y(imageView.getImageY() + (imageView.getHeight() / 2f) - 175).setDuration(20)
                .start();
    }

    public void addTagView(ReadableArray args) {
        ReadableMap map1 = args.getMap(0);
        if (map1 != null && map1.getString(IMAGE_URL) != null) {

            String stickerUrl = map1.getString(IMAGE_URL);


            AttributeSet attributes = Xml.asAttributeSet(
                    getResources().getXml(R.xml.sticker_overlay_attr));
            TagUserOverlayOnImage tagUserOverlayOnImage = new TagUserOverlayOnImage(context,
                    attributes);

            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(150, 150);
            layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);

            tagUserOverlayOnImage.setLayoutParams(layoutParams);
            tagUserOverlayOnImage.setTrashView(trash);
            tagUserOverlayOnImage.setParentViewWidth(imageView.getWidth());
            tagUserOverlayOnImage.setParentViewHeight(imageView.getHeight());
            tagUserOverlayOnImage.setParentX(imageView.getImageX());
            tagUserOverlayOnImage.setParentY(imageView.getImageY());
            tagUserOverlayOnImage.setRemoveOverlayViewListener(this);

            addView(tagUserOverlayOnImage);

            tagUserOverlayOnImage.bringToFront();

            if (stickerUrl != null && !stickerUrl.isEmpty()) {
                Glide.with(context).load(stickerUrl).fitCenter().circleCrop()
                        .diskCacheStrategy(DiskCacheStrategy.DATA)
                        .signature(new ObjectKey(stickerUrl)).into(tagUserOverlayOnImage);
            } else {
                tagUserOverlayOnImage.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.user_placeholder));
            }

            tagUserOverlayOnImage.requestFocus();
            if (tagClickedPosX != 0f && tagClickedPosY != 0f) {
                tagUserOverlayOnImage.animate().x(
                        tagClickedPosX - 75).y(
                        tagClickedPosY - 75).setDuration(20)
                        .start();
            } else {
                tagUserOverlayOnImage.animate().x(
                        imageView.getImageX() + (imageView.getWidth() / 2f) - 75).y(
                        imageView.getImageY() + (imageView.getHeight() / 2f) - 75).setDuration(20)
                        .start();
            }
            tagUserOverlayOnImage.setUserData(MapUtils.toMap(map1));
        }
    }

    public void saveImageToLocal() {
        isExportVideo = false;
        getOverlayItemsList(METHOD_SAVE); //KEEP
        if (isExportVideo) {
            destinationPath = fileUtils.getVideoCachePath(context);
        } else {
            destinationPath = FileUtils.getImageCachePath(context);
        }
        if (!overlayOnImageDataList.isEmpty()) {
            if (audioUrl != null && !audioUrl.isEmpty()) {
                isExportVideo = true;
                destinationPath = fileUtils.getVideoCachePath(context);
                excecuteFfmpegCommand(ffMpegCommands.getImageOverlayWithMusicCommands(destinationPath,
                        overlayOnImageDataList, imagePath, audioUrl, imageWidth, imageHeight, MediaUtils.isAnamorphic(imagePath)),
                        destinationPath, METHOD_SAVE);
            } else {
                excecuteFfmpegCommand(ffMpegCommands.getImageOverlayCommands(
                        destinationPath,
                        overlayOnImageDataList,
                        imagePath,
                        imageWidth,
                        imageHeight, MediaUtils.isAnamorphic(imagePath)), destinationPath, METHOD_SAVE);
            }
        } else {
            if (audioUrl != null && !audioUrl.isEmpty()) {
                isExportVideo = true;
                destinationPath = fileUtils.getVideoCachePath(context);
                excecuteFfmpegCommand(ffMpegCommands.getApplyMusicToImage(imagePath, audioUrl, destinationPath)
                        , destinationPath, METHOD_SAVE);
            } else {
                saveImageInLocal(imagePath);
            }
        }
    }

    public void exportImageWithEdits() {
        tagUsersDataArray = Arguments.createArray();
        isExportVideo = false;
        getOverlayItemsList(METHOD_EXPORT); //KEEP
        if (isExportVideo) {
            destinationPath = fileUtils.getVideoCachePath(context);
        } else {
            destinationPath = FileUtils.getImageCachePath(context);
        }
        if (!overlayOnImageDataList.isEmpty()) {
            if (audioUrl != null && !audioUrl.isEmpty()) {
                isExportVideo = true;
                destinationPath = fileUtils.getVideoCachePath(context);
                excecuteFfmpegCommand(ffMpegCommands.getImageOverlayWithMusicCommands(destinationPath,
                        overlayOnImageDataList, imagePath, audioUrl, imageWidth, imageHeight, MediaUtils.isAnamorphic(imagePath)),
                        destinationPath, METHOD_EXPORT);
            } else {
                excecuteFfmpegCommand(ffMpegCommands.getImageOverlayCommands(
                        destinationPath,
                        overlayOnImageDataList,
                        imagePath,
                        imageWidth,
                        imageHeight, MediaUtils.isAnamorphic(imagePath)), destinationPath, METHOD_EXPORT);
            }
        } else {
            if (audioUrl != null && !audioUrl.isEmpty()) {
                isExportVideo = true;
                destinationPath = fileUtils.getVideoCachePath(context);
                excecuteFfmpegCommand(ffMpegCommands.getApplyMusicToImage(imagePath, audioUrl, destinationPath)
                        , destinationPath, METHOD_EXPORT);
            } else {
                saveImageInLocal(imagePath);
                WritableMap params = Arguments.createMap();
                params.putString(IMAGE_PATH, imagePath);
                params.putBoolean(IS_EXPORT_VIDEO, false);
                if (tagUsersDataArray != null) {
                    params.putArray(TAG_USERS, tagUsersDataArray);
                }
                sendEvent(context, params, EVENT_EXPORT_IMAGE);
            }
        }
    }

    public void getOverlayItemsList(int method) {
        overlayOnImageDataList.clear();
        int count = getChildCount();
        for (int i = 0; i < count; i++) {
            if (getChildAt(i) instanceof StickerOverlayOnImage) {
                //get sticker image and gif save it as file
                OverlayOnImageData overlayItemData = getStickerOverlayItem(
                        (StickerOverlayOnImage) getChildAt(i));
                overlayOnImageDataList.add(overlayItemData);
            } else if (getChildAt(i) instanceof TextOverlayOnImage) {
                OverlayOnImageData overlayItemData = getTextOverlayItem(
                        (TextOverlayOnImage) getChildAt(i));
                overlayOnImageDataList.add(overlayItemData);
            } else if (method == METHOD_EXPORT && getChildAt(i) instanceof TagUserOverlayOnImage) {
                getTagUserItemData((TagUserOverlayOnImage) getChildAt(i));
            }
        }
    }

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

    public String saveBitmapAsFile(Bitmap bitmap) {
        return FileUtils.getCachedBitmapFile(context, bitmap, "overlay_" + Calendar.getInstance().getTimeInMillis() + ".png").getAbsolutePath();
    }

    private String saveGifAsFile(ByteBuffer bytes) {
        return FileUtils.saveGifOverlay(context, bytes, "overlay" + Calendar.getInstance().getTimeInMillis() + ".gif").getAbsolutePath();
    }

    //tilt preview methods
    public void toggleShowCropperView() {
        if (cropperView != null && imageWidth > imageHeight) {
            cropperVisibility = !cropperVisibility;
            cropperView.setVisibility(cropperVisibility ? VISIBLE : INVISIBLE);
        }
    }

    public void toggleTiltPreview() {
        Log.d("@@@", "toggleTiltPreview");
    }

    public void setAudioUrl(String audioUrl) {
        if (audioUrl != null && !audioUrl.isEmpty()) {
            this.audioUrl = audioUrl;
            setUpAudioPlayer();
        }
    }

    private void setUpAudioPlayer() {
        if (audioPlayer != null) {
            audioPlayer.setAudio(audioUrl);
            audioPlayer.setLooping(true);
            audioPlayer.setStartWhenPrepared(true);
        }
    }

    public void onClosePressed() {
        clearAudioPlayer();
    }

    private void clearAudioPlayer() {
        if (audioPlayer != null) {
            audioPlayer.stopAudio();
            audioPlayer.resetPlayer();
        }
    }

    private void initCroppingPoint() {
        if (cropperView == null) {
            return;
        }

        Rect offsetViewBounds = new Rect();
        //returns the visible bounds
        imageView.getDrawingRect(offsetViewBounds);
        // calculates the relative coordinates to the parent
        this.offsetDescendantRectToMyCoords(imageView, offsetViewBounds);

        cropperView.setTopRegion(offsetViewBounds.left, offsetViewBounds.top);
        cropperView.setMaxWidth(this.getWidth());

        cropperView.setCropperListener(new CropperView.VideoCropperInterface() {
            @Override
            public void onVideoCropPositionChanged(int position) {
                int[] location = new int[2];
                cropperView.getLocationOnScreen(location);
                int leftX = location[0];

                float videoViewWidth = imageView.getMeasuredWidth() - 10.0f;

                float divide = (imageView.getWidth() / videoViewWidth);
                int xPosition = (int) (divide * leftX);
                WritableMap params = Arguments.createMap();
                params.putInt(X_POSITION, xPosition);
                sendEvent(context, params, EVENT_LANDSCAPE_IMAGE_CROPPING);
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
        Log.d("@@@", "onVideoCropPositionChanged->" + position);
    }

    private OverlayOnImageData getStickerOverlayItem(StickerOverlayOnImage stickerOverlayOnImage) {

        float widthPercentage =
                ((float) (stickerOverlayOnImage.getWidth()) / (imageView.getWidth())) * 100;
        float heightPercentage =
                ((float) (stickerOverlayOnImage.getHeight()) / (imageView.getHeight())) * 100;

        float finalWidth =
                ((widthPercentage / 100) * imageWidth) * stickerOverlayOnImage.getScaleX();
        float finalHeight =
                ((heightPercentage / 100) * imageHeight) * stickerOverlayOnImage.getScaleY();

        if (finalWidth > imageWidth) {
            finalWidth = imageWidth;
        }

        if (finalHeight > imageHeight) {
            finalHeight = imageHeight;
        }

        float scaledWidth = stickerOverlayOnImage.getWidth() * stickerOverlayOnImage.getScaleX();
        float scaledHeight = stickerOverlayOnImage.getHeight() * stickerOverlayOnImage.getScaleY();

        float relativeWidth = scaledWidth - stickerOverlayOnImage.getWidth();
        float relativeHeight = scaledHeight - stickerOverlayOnImage.getHeight();

        float finalX;
        float finalY;
        finalX = (stickerOverlayOnImage.getX() - (relativeWidth / 2));
        finalY = (stickerOverlayOnImage.getY() - (relativeHeight / 2));


        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                imageHeight > imageWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        imageWidth > imageHeight)) {
            finalX -= imageView.getImageX();
        } else {
            finalX -= (displayMetrics.widthPixels - imageView.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - imageView.getHeight()) / 2f;
        }

        float xPercentage = (finalX / imageView.getWidth()) * 100;
        float yPercentage = (finalY / imageView.getHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * imageWidth;
        float viewPosY = (yPercentage / 100) * imageHeight;

        if (viewPosX > imageWidth) {
            viewPosX = imageWidth - finalWidth;
        }
        if (viewPosY > imageHeight) {
            viewPosY = imageHeight - finalHeight;
        }

        String url;
        if (stickerOverlayOnImage.isGif()) {
            isExportVideo = true;
            final GifDrawable gifDrawable = (GifDrawable) stickerOverlayOnImage.getDrawable();
            url = saveGifAsFile(gifDrawable.getBuffer());

            return new OverlayOnImageData(url, viewPosX, viewPosY, finalWidth, finalHeight,
                    stickerOverlayOnImage.getRotation(), (gifDrawable.getFrameCount() / 30));
        } else {
            Bitmap bitmap = drawableToBitmap(stickerOverlayOnImage.getDrawable());
            url = saveBitmapAsFile(bitmap);

            return new OverlayOnImageData(url, viewPosX, viewPosY, finalWidth, finalHeight,
                    stickerOverlayOnImage.getRotation(), stickerOverlayOnImage.isGif());
        }
    }

    private OverlayOnImageData getTextOverlayItem(TextOverlayOnImage textOverlayOnImage) {
        Bitmap bitmap = getBitmapFromView(textOverlayOnImage);

        float widthPercentage =
                ((float) (textOverlayOnImage.getWidth()) / (imageView.getWidth())) * 100;
        float heightPercentage =
                ((float) (textOverlayOnImage.getHeight()) / (imageView.getHeight())) * 100;

        float finalWidth = ((widthPercentage / 100) * imageWidth) * textOverlayOnImage.getScaleX();
        float finalHeight =
                ((heightPercentage / 100) * imageHeight) * textOverlayOnImage.getScaleY();

        if (finalWidth > imageWidth) {
            finalWidth = imageWidth;
        }

        if (finalHeight > imageHeight) {
            finalHeight = imageHeight;
        }

        float scaledWidth = textOverlayOnImage.getWidth() * textOverlayOnImage.getScaleX();
        float scaledHeight = textOverlayOnImage.getHeight() * textOverlayOnImage.getScaleY();

        float relativeWidth = scaledWidth - textOverlayOnImage.getWidth();
        float relativeHeight = scaledHeight - textOverlayOnImage.getHeight();

        float finalX;
        float finalY;
        finalX = (textOverlayOnImage.getX() - (relativeWidth / 2));
        finalY = (textOverlayOnImage.getY() - (relativeHeight / 2));

        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                imageHeight > imageWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        imageWidth > imageHeight)) {
            finalX -= imageView.getImageX();
        } else {
            finalX -= (displayMetrics.widthPixels - imageView.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - imageView.getHeight()) / 2f;
        }

        float xPercentage = (finalX / imageView.getWidth()) * 100;
        float yPercentage = (finalY / imageView.getHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * imageWidth;
        float viewPosY = (yPercentage / 100) * imageHeight;

        if (viewPosX > imageWidth) {
            viewPosX = imageWidth - finalWidth;
        }
        if (viewPosY > imageHeight) {
            viewPosY = imageHeight - finalHeight;
        }

        String url = saveBitmapAsFile(bitmap);
        return new OverlayOnImageData(url, viewPosX, viewPosY, finalWidth, finalHeight,
                textOverlayOnImage.getRotation(), textOverlayOnImage.getRotation(), textOverlayOnImage.getRotation());
    }

    private void getTagUserItemData(TagUserOverlayOnImage tagUserOverlayOnImage) {

        float widthPercentage =
                ((float) (tagUserOverlayOnImage.getWidth()) / (imageView.getWidth())) * 100;
        float heightPercentage =
                ((float) (tagUserOverlayOnImage.getHeight()) / (imageView.getHeight())) * 100;

        float finalWidth =
                ((widthPercentage / 100) * imageWidth) * tagUserOverlayOnImage.getScaleX();
        float finalHeight =
                ((heightPercentage / 100) * imageHeight) * tagUserOverlayOnImage.getScaleY();

        if (finalWidth > imageWidth) {
            finalWidth = imageWidth;
        }

        if (finalHeight > imageHeight) {
            finalHeight = imageHeight;
        }

        float scaledWidth = tagUserOverlayOnImage.getWidth() * tagUserOverlayOnImage.getScaleX();
        float scaledHeight = tagUserOverlayOnImage.getHeight() * tagUserOverlayOnImage.getScaleY();

        float relativeWidth = scaledWidth - tagUserOverlayOnImage.getWidth();
        float relativeHeight = scaledHeight - tagUserOverlayOnImage.getHeight();

        float finalX = (tagUserOverlayOnImage.getX() - (relativeWidth / 2));
        float finalY = (tagUserOverlayOnImage.getY() - (relativeHeight / 2));

        if ((getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT &&
                imageHeight > imageWidth) ||
                (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE &&
                        imageWidth > imageHeight)) {
            finalX -= imageView.getImageX();
        } else {
            finalX -= (displayMetrics.widthPixels - imageView.getWidth()) / 2f;
            finalY -= (displayMetrics.heightPixels - imageView.getHeight()) / 2f;
        }

        float xPercentage = (finalX / imageView.getWidth()) * 100;
        float yPercentage = (finalY / imageView.getHeight()) * 100;
        //exact x and y position on video
        float viewPosX = (xPercentage / 100) * imageWidth;
        float viewPosY = (yPercentage / 100) * imageHeight;

        if (viewPosX > imageWidth) {
            viewPosX = imageWidth - finalWidth;
        }
        if (viewPosY > imageHeight) {
            viewPosY = imageHeight - finalHeight;
        }

        WritableMap map = MapUtils.toWritableMap(tagUserOverlayOnImage.getUserData());
        map.putString(X_POS_ON_IMAGE, String.valueOf(viewPosX));
        map.putString(Y_POS_ON_IMAGE, String.valueOf(viewPosY));
        tagUsersDataArray.pushMap(map);
    }

    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(context, params, EVENT_PROGRESS);
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            tagClickedPosX = event.getX();
            tagClickedPosY = event.getY();
            tagTransViewParent.setVisibility(GONE);
            WritableMap tagPos = Arguments.createMap();
            tagPos.putDouble(TAG_CLICKED_POS_X, tagClickedPosX);
            tagPos.putDouble(TAG_CLICKED_POS_Y, tagClickedPosY);
            sendEvent(context, tagPos, EVENT_UPDATE_CLICKED_TAG_POSITION);
        }
        return true;
    }

    public void releaseListeners() {
        context.removeLifecycleEventListener(lifeCycleListener);
    }
}
