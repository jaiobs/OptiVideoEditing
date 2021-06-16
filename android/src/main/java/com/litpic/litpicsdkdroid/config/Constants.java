package com.litpic.litpicsdkdroid.config;

import android.net.Uri;
import android.os.Environment;

import java.io.File;

public class Constants {

    public static final String STORE_IMAGE_PATH = "litpic-photos";
    public static final String STORE_VIDEO_PATH = "litpic-videos";
    public static final String MIME_IMAGE_MEDIA = "image/*";
    public static final String MIME_VIDEO_MEDIA = "video/mp4";

    public static final String VIDEO_CACHE_PATH = "sdk_videos";
    public static final String IMAGE_CACHE_PATH = "sdk_images";
    public static final String AUDIO_CACHE_PATH = "sdk-audio";
    public static final String DOWNLOADED_MUSIC_CACHE_PATH = "sdk_music";

    public static final String APP_NAME = "LITPIC";
    public static final int BYTE_ARRAY_SIZE = 16384;

    Constants() {
        //empty constructor
    }

    private static final String EXTERNAL_PATH = Environment.getExternalStorageDirectory().getPath();  // NOSONAR

    public static final String VIDEO_FILE_PATH = EXTERNAL_PATH + "/liptic/" + STORE_VIDEO_PATH + File.separator;

    public static final String PHOTOS_PATH = EXTERNAL_PATH + "/liptic/" + STORE_IMAGE_PATH + File.separator;

    public static final String CAMERA_ROLL = "Camera Roll";
    public static final String ALL_IMAGES = "All Images";
    public static final String ALL_VIDEOS = "All Videos";
    public static final String[] VIDEO_FORMAT = {"MP4", "3GP", "AVI", "FLV", "MPEG-2", "MKV", "VOB", "WEBM", "TS"}; // NOSONAR
    public static final String[] SUPPORTED_VIDEO_FORMAT = {"MP4"}; // NOSONAR

    public static Uri videoPathUri = null; // NOSONAR
    public static final String CONTENT_PREFIX = "content://";

    public static final int FIXED_VIDEO_LENGTH_IN_SECONDS = 30;
    public static final int FIXED_VIDEO_LENGTH_IN_MILLIS = 30000;
    public static final int FIXED_SELECTED_PHOTO_COUNT = 10;

    public static final String SLOW_1X = "slow1";
    public static final String SLOW_2X = "slow2";
    public static final String SPEED_1X = "fast1";
    public static final String SPEED_2X = "fast2";
    public static final String REVERSE = "reverse";
    public static final String NORMAL = "normal";

    //beautification sdk
    public static final String KEY = "w/jUJpwn+38QD+5iEk5qMDRKfEC8pkAjGbiOTzWJ9kqaslbOtx58JGPNF4GRAu1/4LcFaEfkOq4xQjzxQgm+A+J70d6ZIOuZG+smb6WNjnNGi+dsfH6usijlw0+ElLvmQgb6I59DiY8d0xyWCjETUgD41g9LdPpUh4mrlYHC9xNuRmouUDqgbk3aYAbMArI3Gvc2b7l7usnOP5mwhSbBb0M4PBjkAue7DCTRniuavQuwSuA=";
    public static final String SOUND_CLOUD_API_KEY = "3501a8ba5e28f5ef48b151bfdbdf7a49";
    public static final String AUDIO_CLIENT_KEY = "?client_id=" + SOUND_CLOUD_API_KEY;

    public static final String CACHE_DATE_FORMAT = "dd_MM_yyyy_HHmmssSSS";

    public static final int VIDEO_BIT_RATE = 6000000;
    public static final int ASPECT_RATIO_16 = 16;
    public static final int ASPECT_RATIO_9 = 9;
    public static final int PIXELS_16 = 1280;
    public static final int PIXELS_9 = 720;
    public static final int MIN_ASPECT_VALUE = 80;
    public static final float PREVIEW_FRAME_RATE = 30;

    public static final int METHOD_SAVE = 100;
    public static final int METHOD_EXPORT = 101;
    public static final int METHOD_PREVIEW = 102;
    public static final int MOVE_VIDEO_FOR_EDIT = 103;


    //string constants
    public static final String IMAGE_PATH = "imagePath";
    public static final String VIDEO_PATH = "videoPath";
    public static final String VIDEO_PATH_URI = "videoPathUri";
    public static final String IMAGE_URL = "imageUrl";
    public static final String AUDIO_PATH = "audioPath";
    public static final String CURRENT_AUDIO_PATH = "currentAudioPath";
    public static final String NAME = "name";
    public static final String TYPE = "type";
    public static final String HEIGHT = "height";
    public static final String WIDTH = "width";
    public static final String IMAGE_HEIGHT = "imageHeight";
    public static final String IMAGE_WIDTH = "imageWidth";
    public static final String VIDEO_HEIGHT = "videoHeight";
    public static final String VIDEO_WIDTH = "videoWidth";
    public static final String VIDEO_ROTATION = "videoRotation";
    public static final String SIZE = "size";
    public static final String PATH = "path";
    public static final String CREATED_AT = "created_At";
    public static final String UPDATED_AT = "updated_At";
    public static final String IS_LANDSCAPE = "isLandScape";
    public static final String DURATION = "duration";
    public static final String START_POSITION = "startPosition";
    public static final String END_POSITION = "endPosition";
    public static final String AUDIO_START_POSITION = "audioStartPosition";
    public static final String AUDIO_END_POSITION = "audioEndPosition";
    public static final String SHOW_LOADER = "showLoader";
    public static final String IS_COMPLETED = "isCompleted";
    public static final String FLASH_ENABLED = "flashEnabled";
    public static final String CONTRAST = "contrast";
    public static final String BRIGHTNESS = "brightness";
    public static final String SATURATION = "saturation";
    public static final String SUCCESS = "success";
    public static final String MESSAGE = "message";
    public static final String FILE_PREFIX_ONE = "file:///";
    public static final String FILE_PREFIX_TWO = "file://";
    public static final String FILE_PATH = "filePath";
    public static final String MEDIA_TYPE = "mediaType";
    public static final String MIME_TYPE = "mimeType";
    public static final String TITLE = "title";
    public static final String TIME_IN_MILLIS = "timeInMillSec";
    public static final String LIST = "list";
    public static final String ORIENTATION = "orientation";
    public static final String IS_EXPORT_VIDEO = "isExportVideo";
    public static final String TAG_USERS = "tagUsers";
    public static final String X_POSITION = "xPosition";
    public static final String Y_POSITION = "yPosition";
    public static final String X_POS_ON_IMAGE = "xPosOnImage";
    public static final String Y_POS_ON_IMAGE = "yPosOnImage";
    public static final String IS_TRIMMED = "isTrimmed";
    public static final String CURRENT_POSITION = "currentPosition";
    public static final String SEEK_TO = "seekTo";
    public static final String VIDEO_DETAILS = "videoDetails";
    public static final String AUTHOR = "author";
    public static final String AVATAR = "avatar";
    public static final String TRACK_URL = "trackUrl";
    public static final String AUDIO_DOWNLOAD_PROGRESS = "audio_download_progress";
    public static final String CROP_POSITION = "cropPosition";
    public static final String X = "X";
    public static final String Y = "Y";
    public static final String SWITCH_CAMERA = "switchCamera";
    public static final String CAMARA_ACTION = "cameraAction";
    public static final String FLASH_ON = "flashOn";
    public static final String IMAGE_DETAILS = "imageDetails";
    public static final String VIDEO_DURATION = "videoDuration";
    public static final String SPEED = "speed";
    public static final String SPEED_VALUE = "speedValue";
    public static final String TAG_CLICKED_POS_X = "clickedPositionX";
    public static final String TAG_CLICKED_POS_Y = "clickedPositionY";
    public static final String FRAME_RATE = "frame_rate ";
    public static final String NULL = "null";
    public static final String SHUTTER = "shutter";
    public static final String URI = "uri";
    public static final String EMPTY = "empty";
    public static final String FILL = "fill";
    public static final String TRANSPARENT = "transparent";
    public static final String IS_GIF = "isGif";
    public static final String ROTATION = "rotation";
    public static final String SCALE_X = "scaleX";
    public static final String SCALE_Y = "scaleY";
    public static final String SCALE = "scale";
    public static final String OVERLAY_TYPE = "overlayType";
    public static final String TYPE_STICKER = "sticker";
    public static final String TYPE_GIF = "gif";
    public static final String TYPE_TEXT = "text";
    public static final String TYPE_TAG = "tag";
    public static final String OVERLAY_TEXT = "overlayText";
    public static final String RESTORE_OVERLAY = "restoreOverlay";
    public static final String TEXT_ALIGNMENT = "textAlignment";
    public static final String BACKGROUND_MODE = "backgroundMode";
    public static final String COLOR = "color";
    public static final String TEXT_COLOR = "textColor";
    public static final String FONT_FACE = "fontFace";
    public static final String TEXT = "text";
    public static final String CAMERA_KEY = "camerakey";
    public static final String IS_ROTATED = "isRotated";

    //Native to react-native Event names
    public static final String EVENT_AUDIO_START_PRESSED = "onAudStartPressed";
    public static final String EVENT_AUDIO_EXIT_PRESSED = "onAudExitPressed";
    public static final String EVENT_UPDATE_DOWNLOAD_PROGRESS = "EventUpdateDownloadProgress";
    public static final String EVENT_PROGRESS = "EventShowOrHideLoader";
    public static final String EVENT_ON_PHOTO_CAPTURED = "onPhotoCaptured";
    public static final String EVENT_VIDEO_CAPTURE_START = "onVideoCaptureStart";
    public static final String EVENT_VIDEO_CAPTURE_STOP = "onVideoCaptureStop";
    public static final String EVENT_VIDEO_CAPTURE_END = "onVideoCaptureEnd";
    public static final String EVENT_EXPORT_IMAGE = "EventExportImage";
    public static final String EVENT_MOVE_VIDEO_FOR_EDIT = "EventMoveVideoForEdit";
    public static final String EVENT_LANDSCAPE_IMAGE_CROPPING = "EventLandscapeImageCropping";
    public static final String EVENT_ON_BUFFERING_UPDATE = "onBufferingUpdate";
    public static final String EVENT_PICK_VIDEO = "PickVideo";
    public static final String EVENT_CHANGE_VIDEO = "EventChangeVideo";
    public static final String EVENT_SEEK_TO_VIDEO = "EventSeekToVideo";
    public static final String EVENT_ON_IMAGE_SAVED = "onImageSaved";
    public static final String EVENT_ON_VIDEO_SAVED = "EventOnVideoSaved";
    public static final String EVENT_EXPORT_VIDEO = "EventExportVideo";
    public static final String EVENT_UPDATE_VIDEO_PATH = "EventUpdateVideoPath";
    public static final String EVENT_GET_VIDEO_DETAILS = "EventGetVideoDetails";
    public static final String EVENT_LANDSCAPE_VIDEO_CROPPING = "EventLandscapeVideoCropping";
    public static final String EVENT_VIDEO_SELECTION_RANGE_CHANGED = "EventVideoSelectionRangeChanged";
    public static final String EVENT_UPDATE_VIDEO_PREVIEW = "UpdateVideoPreview";
    public static final String EVENT_UPDATE_VIDEO_PLAYBACK = "EventUpdateVideoPlayBack";
    public static final String EVENT_NEXT_CLICKED = "EventNextClicked";
    public static final String EVENT_UPDATE_CLICKED_TAG_POSITION = "EventUpdateClickedTagPosition";
    public static final String SDK_NAME = "Litpic_Sdk";
    public static final String EXCEPTION = "Exception";
    public static final String EVENT_CLOSE_EDIT_MODE = "EventCloseEditMode";
    public static final String EVENT_AUDIO_TRIMMING_COMPLETE = "onAudioTrimmingCompleted";
    public static final String EVENT_LOAD_OVERLAY = "loadOverlayDataFromCache";
    public static final String RELEASE_LISTENERS = "releaseListeners";

    //filter types
    public static final String CSB = "CSB";
    public static final String GREY_SCALE = "GRAYSCALE";
    public static final String SEPIA = "SEPIA";
    public static final String MONOCHROME = "MONOCHROME";
    public static final String BLUR = "BLUR";
    public static final String BEAUTY = "BEAUTY";

    //native - js commands
    public static final String CAPTURE_PHOTO = "capturePhoto";
    public static final String START_VIDEO = "startVideo";
    public static final String STOP_VIDEO = "stopVideo";
    public static final String DELETE_LAST_VIDEO = "deleteLastVideo";
    public static final String UN_MOUNT_CAMERA = "unMountCamera";
    public static final String LOCK_ORIENTATION = "lockOrientation";
    public static final String SWITCH_FILTER = "switchFilter";
    public static final String TOGGLE_MUSIC = "toggleMusic";
    public static final String REMOVE_LAST_SEGMENT = "removeLastSegment";
    public static final String RELEASE_ORIENTATION = "releaseOrientation";
    public static final String SHADOW_IMAGE = "shadowImage";
    public static final String COMMAND_ON_BACK_PRESSED = "onBackPressed";
    public static final String COMMAND_ON_NEXT = "onNextClicked";
    public static final String COMMAND_ADD_TEXT_OVERLAY = "add_text_overlay";
    public static final String COMMAND_CHANGE_TEXT_FONT = "change_text_font_overlay";
    public static final String COMMAND_CHANGE_TEXT_COLOR = "change_text_color";
    public static final String COMMAND_CHANGE_TEXT_BACKGROUND = "change_text_background_color";
    public static final String COMMAND_CHANGE_TEXT_ALIGNMENT = "change_text_alignment";
    public static final String COMMAND_ADD_STICKER = "add_image_sticker_overlay";
    public static final String COMMAND_ADD_GIF = "add_gif_sticker_overlay";
    public static final String COMMAND_SAVE_IMAGE = "save_image";
    public static final String COMMAND_SAVE_VIDEO = "save_video";
    public static final String COMMAND_TOGGLE_SHOW_CROP_PREVIEW = "toggle_show_crop_preview";
    public static final String COMMAND_TOGGLE_SHOW_TILT_PREVIEW = "toggle_show_tilt_preview";
    public static final String COMMAND_EXPORT_IMAGE = "exportImage";
    public static final String COMMAND_EXPORT_VIDEO = "exportVideo";
    public static final String COMMAND_TAG_USER = "tagUser";
    public static final String COMMAND_SHOW_TRANSPARENT_VIEW = "showTagTransparentView";
    public static final String COMMAND_CLOSE_PRESSED = "onClosePressed";
    public static final String COMMAND_PLAY_VIDEO = "playVideo";
    public static final String COMMAND_PAUSE_VIDEO = "pauseVideo";

    //alignment
    public static final String LEFT = "left";
    public static final String RIGHT = "right";
    public static final String CENTER = "center";

    //file extensions
    public static final String PNG = ".png";
    public static final String GIF = ".gif";
    public static final String MP4 = ".mp4";
    public static final String JPG = ".jpg";
    public static final String MP3 = ".mp3";

    //font styles
    public static final String PALATINO_BOLD = "palatino_bold";
    public static final String MENLO_REGULAR = "menloregular";
    public static final String SNELL_ROUND_HAND = "snell_round_hand";
    public static final String CHALKBOARD_SE_REGULAR = "chalkboard_se_regular";
    public static final String BRADLEY_HAND_BOLD = "bradley_hand_bold";
    public static final String HELVETICA = "helvetica";

    //loader
    public static final String LOADER_STATE = "loaderState";

    //music-picker
	public static final String PICKER_STATE = "pickerState";
}
