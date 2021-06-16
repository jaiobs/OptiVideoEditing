package com.litpic.litpicsdkdroid.utils;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageDecoder;
import android.media.ExifInterface;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.config.Constants;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;

import static com.litpic.litpicsdkdroid.config.Constants.CREATED_AT;
import static com.litpic.litpicsdkdroid.config.Constants.DURATION;
import static com.litpic.litpicsdkdroid.config.Constants.EXCEPTION;
import static com.litpic.litpicsdkdroid.config.Constants.FILE_PREFIX_TWO;
import static com.litpic.litpicsdkdroid.config.Constants.FRAME_RATE;
import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IS_LANDSCAPE;
import static com.litpic.litpicsdkdroid.config.Constants.IS_ROTATED;
import static com.litpic.litpicsdkdroid.config.Constants.NAME;
import static com.litpic.litpicsdkdroid.config.Constants.PATH;
import static com.litpic.litpicsdkdroid.config.Constants.SDK_NAME;
import static com.litpic.litpicsdkdroid.config.Constants.SIZE;
import static com.litpic.litpicsdkdroid.config.Constants.TYPE;
import static com.litpic.litpicsdkdroid.config.Constants.UPDATED_AT;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_ROTATION;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;


public class MediaUtils {

    private MediaUtils() {

    }

    // NOSONAR - added for false positive conditions

    public static boolean isAnamorphic(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return false;
        }

        if (imagePath.contains(FILE_PREFIX_TWO)) {
            imagePath = imagePath.replace(FILE_PREFIX_TWO, "");
        }
        ExifInterface exif = null;
        try {
            exif = new ExifInterface(imagePath);
        } catch (IOException e) {
            Log.e("@@@", EXCEPTION, e);
            return false;
        }
        int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_UNDEFINED);
        return orientation == ExifInterface.ORIENTATION_ROTATE_90 || orientation == ExifInterface.ORIENTATION_ROTATE_270;
    }

    public static boolean isAnamorphic(ThemedReactContext context, String videoPath) {
        boolean isRotated = false;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            String rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
            isRotated = rotation != null && (rotation.equals("90") || rotation.equals("270"));
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return isRotated;
    }

    public static boolean isAnamorphic(Context context, String videoPath) {
        boolean isRotated = false;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            String rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
            isRotated = rotation != null && (rotation.equals("90") || rotation.equals("270"));
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return isRotated;
    }

    public static boolean isVideoContainAudioStream(ThemedReactContext context, String videoPath) {
        boolean isStreamPresent = false;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            String hasAudioStream = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO);
            isStreamPresent = hasAudioStream != null && (hasAudioStream.equals("yes") || hasAudioStream.equals("isStreamPresent"));
            return isStreamPresent;
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return isStreamPresent;
    }

    public static WritableMap getImageDetails(String imagePath) {
        try {

            if (imagePath.contains(FILE_PREFIX_TWO)) {
                imagePath = imagePath.replace(FILE_PREFIX_TWO, "");
            }

            File videoFile = new File(imagePath);

            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;

            BitmapFactory.decodeFile(videoFile.getPath(), options);
            int width = options.outWidth;
            int height = options.outHeight;

            String type = options.outMimeType;
            String name = videoFile.getName();
            String path = Uri.parse(imagePath).toString();
            boolean isLandScape = false;

            int size = Integer.parseInt(String.valueOf(videoFile.length() / 1024));
            String createdAt = new Date(videoFile.lastModified()).toString();
            String updatedAt = new Date().toString();

            WritableMap dataMap = Arguments.createMap();

            dataMap.putString(NAME, name);
            dataMap.putString(TYPE, type);
            dataMap.putInt(HEIGHT, height);
            dataMap.putInt(WIDTH, width);
            dataMap.putInt(SIZE, size);
            dataMap.putString(PATH, path);
            dataMap.putString(DURATION, null);
            dataMap.putString(FRAME_RATE, null);

            dataMap.putString(CREATED_AT, createdAt);
            dataMap.putString(UPDATED_AT, updatedAt);
            dataMap.putBoolean(IS_LANDSCAPE, isLandScape);

            return dataMap;

        } catch (Exception e) {
            Log.e("@@@", "exception - get image details - ", e);
        }
        return null;
    }

    public static WritableMap getVideoDetails(ReactApplicationContext reactContext, final String videoPath) {
        WritableMap dataMap1 = null;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);

            retriever.setDataSource(reactContext, Uri.fromFile(videoFile));
            String height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
            String width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
            String type = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE);
            String rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
            int frameRate = getFrameRate(videoPath);
            String name = videoFile.getName();
            String path = Uri.parse(videoPath).toString();
            if (Integer.parseInt(width) > Integer.parseInt(height)) {
                String tempWidth = width;
                width = height;
                height = tempWidth;
            }
            boolean isLandScape = false;
            String videoDuration = retriever.extractMetadata(
                    MediaMetadataRetriever.METADATA_KEY_DURATION);
            int size = Integer.parseInt(String.valueOf(videoFile.length() / 1024));
            String createdAt = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE);
            String updatedAt = new Date().toString();
            WritableMap dataMap = Arguments.createMap();

            dataMap.putString(Constants.NAME, name);
            dataMap.putString(TYPE, type);
            dataMap.putString(HEIGHT, height);
            dataMap.putString(WIDTH, width);
            dataMap.putDouble(SIZE, size);
            dataMap.putString(PATH, path);
            dataMap.putDouble(DURATION, Double.parseDouble(videoDuration));
            dataMap.putString(CREATED_AT, createdAt);
            dataMap.putString(UPDATED_AT, updatedAt);
            dataMap.putBoolean(IS_LANDSCAPE, isLandScape);
            dataMap.putString(VIDEO_ROTATION, rotation);
            dataMap.putInt(FRAME_RATE, frameRate);
            dataMap1 = dataMap;
        } catch (Exception e) {
            Log.e("@@@", "video editor manager - get video details exception - ", e);
        } finally {
            retriever.release();
        }
        return dataMap1;
    }

    public static WritableMap getVideoDetails(ThemedReactContext reactContext, final String videoPath) {
        WritableMap dataMap1 = null;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);

            retriever.setDataSource(reactContext, Uri.fromFile(videoFile));
            String height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
            String width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
            String type = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE);
            String rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
            String name = videoFile.getName();
            String path = Uri.parse(videoPath).toString();

            if (Integer.parseInt(width) > Integer.parseInt(height)) {
                String tempWidth = width;
                width = height;
                height = tempWidth;
            }
            boolean isLandScape = false;
            String videoDuration = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
            int size = Integer.parseInt(String.valueOf(videoFile.length() / 1024));
            int frameRate = getFrameRate(videoPath);
            String createdAt = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE);
            String updatedAt = new Date().toString();
            WritableMap dataMap = Arguments.createMap();

            dataMap.putString(Constants.NAME, name);
            dataMap.putString(TYPE, type);
            dataMap.putString(HEIGHT, height);
            dataMap.putString(WIDTH, width);
            dataMap.putDouble(SIZE, size);
            dataMap.putString(PATH, path);
            dataMap.putDouble(DURATION, Double.parseDouble(videoDuration));
            dataMap.putString(CREATED_AT, createdAt);
            dataMap.putString(UPDATED_AT, updatedAt);
            dataMap.putBoolean(IS_LANDSCAPE, isLandScape);
            dataMap.putString(VIDEO_ROTATION, rotation);
            dataMap.putInt(FRAME_RATE, frameRate);
            dataMap1 = dataMap;
        } catch (Exception e) {
            Log.e("@@@", "video editor manager -get video details exception - ", e);
        } finally {
            retriever.release();
        }
        return dataMap1;
    }

    public static WritableMap getVideoDetails(final String videoPath) {
        WritableMap dataMap1 = null;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);

            retriever.setDataSource(videoPath);
            String height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
            String width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
            String type = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE);
            String name = videoFile.getName();
            String path = Uri.parse(videoPath).toString();
            if (Integer.parseInt(width) > Integer.parseInt(height)) {
                String tempWidth = width;
                width = height;
                height = tempWidth;
            }
            String rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
            boolean isRotated = rotation != null && (rotation.equals("90") || rotation.equals("270"));
            boolean isLandScape = false;
            String videoDuration = retriever.extractMetadata(
                    MediaMetadataRetriever.METADATA_KEY_DURATION);
            int size = Integer.parseInt(String.valueOf(videoFile.length() / 1024));
            int frameRate = getFrameRate(videoPath);
            String createdAt = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE);
            String updatedAt = new Date().toString();
            WritableMap dataMap = Arguments.createMap();

            dataMap.putString(Constants.NAME, name);
            dataMap.putString(TYPE, type);
            dataMap.putString(HEIGHT, height);
            dataMap.putString(WIDTH, width);
            dataMap.putDouble(SIZE, size);
            dataMap.putString(PATH, path);
            dataMap.putDouble(DURATION, Double.parseDouble(videoDuration));
            dataMap.putString(CREATED_AT, createdAt);
            dataMap.putString(UPDATED_AT, updatedAt);
            dataMap.putBoolean(IS_LANDSCAPE, isLandScape);
            dataMap.putString(VIDEO_ROTATION, rotation);
            dataMap.putBoolean(IS_ROTATED, isRotated);
            dataMap.putInt(FRAME_RATE, frameRate);
            dataMap1 = dataMap;
        } catch (Exception e) {
            Log.e("@@@", "video editor manager- get video details exception - ", e);
        } finally {
            retriever.release();
        }
        return dataMap1;
    }

    public static Bitmap getLastFrame(String videoPath) {
        Bitmap frameAtTime = null;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        File previousVideoFile = new File(videoPath);
        try {
            retriever.setDataSource(previousVideoFile.getAbsolutePath());
            long millis = Long.parseLong(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION));
            frameAtTime = retriever.getFrameAtTime(millis * 1000, MediaMetadataRetriever.OPTION_CLOSEST);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return frameAtTime;
    }

    public static Bitmap getFrameAt(long time, Context context, Uri uri) {
        Bitmap frameAtTime = null;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                               //NOSONAR
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                retriever.setDataSource(context, uri);
            } else {
                FileInputStream inputStream = new FileInputStream(new File(uri.getPath()));     //NOSONAR
                retriever.setDataSource(inputStream.getFD());
            }
            frameAtTime = retriever.getFrameAtTime(time, MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return frameAtTime;
    }

    public static int getVideoDuration(ThemedReactContext context, String videoPath) {
        int anInt = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                           // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            anInt = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION));
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return anInt;
    }

    public static int getVideoDuration(Context context, String videoPath) {
        int anInt = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                           // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            anInt = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION));
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return anInt;
    }

    public static long getVideoDurationInMillis(Context context, Uri uri) {
        long keyDuration = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                           // NOSONAR
            retriever.setDataSource(context, uri);
            keyDuration = Long.parseLong(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)) * 1000;
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return keyDuration;
    }

    public static String getVideoResolution(ReactApplicationContext context, String videoPath) {
        String s = "720x1280";
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                           // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            int width = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH));
            int height = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT));
            s = width + "x" + height;
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return s;
    }

    public static String getVideoResolution(ThemedReactContext context, String videoPath) {
        String s = "720x1280";
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            retriever.setDataSource(context, Uri.parse(videoPath));
            int width = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH));
            int height = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT));
            s = width + "x" + height;
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return s;
    }


    public static int getVideoHeight(ReactApplicationContext context, String videoPath) {
        int height = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);

            retriever.setDataSource(context, Uri.fromFile(videoFile));
            String heightStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
            height = Integer.parseInt(heightStr);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return height;
    }

    public static int getVideoHeight(ThemedReactContext context, String videoPath) {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        int height = 0;
        try {
            File videoFile = new File(videoPath);

            retriever.setDataSource(context, Uri.fromFile(videoFile));
            String heightStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
            height = Integer.parseInt(heightStr);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return height;
    }

    public static int getVideoWidth(ReactApplicationContext context, String videoPath) {
        int anInt = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);
            retriever.setDataSource(context, Uri.fromFile(videoFile));
            String widthStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
            anInt = Integer.parseInt(widthStr);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return anInt;
    }

    public static int getVideoWidth(ThemedReactContext context, String videoPath) {
        int anInt = 0;
        MediaMetadataRetriever retriever = new MediaMetadataRetriever(); // NOSONAR
        try {                                                            // NOSONAR
            File videoFile = new File(videoPath);

            retriever.setDataSource(context, Uri.fromFile(videoFile));
            String widthStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
            anInt = Integer.parseInt(widthStr);
        } catch (Exception e) {
            Log.e("@@@", EXCEPTION, e);
        } finally {
            retriever.release();
        }
        return anInt;
    }

    public static String convertMillisecondsToInputFormat(int milliseconds) {
        int seconds = milliseconds / 1000;
        String strSeconds = seconds < 10 ? "0" + seconds : String.valueOf(seconds);
        return "00:00:" + strSeconds + "." + (milliseconds % 1000);
    }

    public static String saveBitmapAsJPEGToCache(ThemedReactContext context, Bitmap bitmap) {
        return FileUtils.getCachedBitmapFile(context,
                Bitmap.CompressFormat.JPEG,
                bitmap,
                "overlay" + Calendar.getInstance().getTimeInMillis() + ".jpg").getAbsolutePath();
    }

    public static Bitmap getBitmap(ThemedReactContext context, Uri uri) {
        try {
            if (Build.VERSION.SDK_INT < 28) {
                return MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);  // NOSONAR
            } else {
                return ImageDecoder.decodeBitmap(ImageDecoder.createSource(context.getContentResolver(), uri));
            }
        } catch (IOException e) {
            Log.e(SDK_NAME, EXCEPTION, e);
            return null;
        }
    }

    public static Bitmap getBitmap(Context context, Uri uri) {
        try {
            if (Build.VERSION.SDK_INT < 28) {
                return MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);    // NOSONAR
            } else {
                return ImageDecoder.decodeBitmap(ImageDecoder.createSource(context.getContentResolver(), uri));
            }
        } catch (IOException e) {
            Log.e(SDK_NAME, EXCEPTION, e);
            return null;
        }
    }

    public static int getFrameRate(String videoPath) {
        MediaExtractor extractor = new MediaExtractor();
        int frameRate = 24; //may be default
        try {
            //Adjust data source as per the requirement if file, URI, etc.
            extractor.setDataSource(videoPath);
            int numTracks = extractor.getTrackCount();
            for (int i = 0; i < numTracks; ++i) {
                MediaFormat format = extractor.getTrackFormat(i);
                String mime = format.getString(MediaFormat.KEY_MIME);
                if (mime != null && mime.startsWith("video/") && format.containsKey(MediaFormat.KEY_FRAME_RATE)) {
                    frameRate = format.getInteger(MediaFormat.KEY_FRAME_RATE);
                }
            }
        } catch (IOException e) {
            Log.e(SDK_NAME, EXCEPTION, e);
        } finally {
            //Release stuff
            extractor.release();
        }
        return frameRate;
    }
}
