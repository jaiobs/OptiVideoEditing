package com.litpic.litpicsdkdroid.utils;


import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.ImageDecoder;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.core.util.Pair;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.config.Constants;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.CACHE_DATE_FORMAT;
import static com.litpic.litpicsdkdroid.config.Constants.CONTENT_PREFIX;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_ON_IMAGE_SAVED;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_ON_VIDEO_SAVED;
import static com.litpic.litpicsdkdroid.config.Constants.EXCEPTION;
import static com.litpic.litpicsdkdroid.config.Constants.FILE_PREFIX_TWO;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.SDK_NAME;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class FileUtils {

    public String savePhoto(byte[] data, Context context) {
        String path = getImageCachePath(context);
        try (FileOutputStream stream = new FileOutputStream(path);) {
            stream.write(data);
        } catch (Exception e) {
            Log.d("@@@", "file utils - save photo exception - ", e);
        }
        return path;
    }

    public void saveImageLocal(Callback callback, String sourceImage, ReactContext context) {
        try {
            String filePath = sourceImage.contains(FILE_PREFIX_TWO) ? sourceImage.replace(FILE_PREFIX_TWO, "") :
                    sourceImage;
            String pathInformation = null;
            File sourceFile = new File(filePath);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Pair<Boolean, String> pair = saveMedia(context,
                        sourceFile,
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        sourceFile.getName(),
                        Constants.MIME_IMAGE_MEDIA,
                        Environment.DIRECTORY_PICTURES + File.separator + Constants.STORE_IMAGE_PATH);
                if (pair.first != null && pair.first) {
                    pathInformation = pair.second;
                }

            } else {
                String newImagePath = fileMoving(new File(filePath), new File(Constants.PHOTOS_PATH));
                if (newImagePath == null) {
                    return;
                }
                notifyMediaGallery(newImagePath, context);
                pathInformation = newImagePath;
            }

            //send callback for js with file path
            WritableMap dataMap = Arguments.createMap();
            dataMap.putString(IMAGE_PATH, String.format("file://%s", pathInformation));
            if (callback != null) {
                callback.invoke(dataMap);
            } else {
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                        EVENT_ON_IMAGE_SAVED, dataMap);
            }
        } catch (Exception e) {
            Log.d("@@@", EXCEPTION, e);
        }
    }

    public void saveImageInLocalFromUri(String imageUri, ThemedReactContext context) {
        try {
            String pathInformation = null;
            File sourceFile = new File(imageUri);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Pair<Boolean, String> pair = saveMedia(context,
                        Uri.parse(imageUri),
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        sourceFile.getName(),
                        Constants.MIME_IMAGE_MEDIA,
                        Environment.DIRECTORY_PICTURES + File.separator + Constants.STORE_IMAGE_PATH);
                if (pair.first != null && pair.first) {
                    pathInformation = pair.second;
                }
            } else {
                String imagePath = Uri.parse(imageUri).getPath();
                String newImagePath = fileMoving(new File(imagePath), new File(Constants.PHOTOS_PATH));
                if (newImagePath == null) {
                    return;
                }
                notifyMediaGallery(newImagePath, context);
                pathInformation = newImagePath;
            }

            WritableMap params = Arguments.createMap();
            params.putString(IMAGE_PATH, pathInformation);
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                    EVENT_ON_IMAGE_SAVED, params);
        } catch (Exception e) {
            Log.d("@@@", EXCEPTION, e);
        }
    }

    public void saveVideoLocal(Callback callback, String videoPath, ReactContext context) {
        try {
            String filePath;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                filePath = videoPath.contains(CONTENT_PREFIX) ? videoPath.replace(CONTENT_PREFIX, "") :
                        videoPath;
            } else {
                filePath = videoPath.contains(FILE_PREFIX_TWO) ? videoPath.replace(FILE_PREFIX_TWO, "") :
                        videoPath;
            }
            String pathInformation = null;
            File sourceFile = new File(filePath);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Pair<Boolean, String> pair = saveMedia(context,
                        sourceFile,
                        MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                        sourceFile.getName(),
                        Constants.MIME_VIDEO_MEDIA,
                        Environment.DIRECTORY_MOVIES + File.separator + Constants.STORE_VIDEO_PATH);
                if (pair.first != null && pair.first) {
                    pathInformation = pair.second;
                }

            } else {
                String newVideoPath = fileMoving(new File(filePath), new File(Constants.VIDEO_FILE_PATH));
                if (newVideoPath == null) {
                    return;
                }
                notifyMediaGallery(newVideoPath, context);
                pathInformation = newVideoPath;
            }

            if (pathInformation == null) {
                Log.d("@@@", "pathInformation is null");
                pathInformation = videoPath;
            }

            if (callback != null) {
                //send callback for js with file path
                WritableMap dataMap = Arguments.createMap();
                dataMap.putString(VIDEO_PATH, String.format("file://%s", pathInformation));
                callback.invoke(dataMap);
            } else {
                //send callback for js with file path
                WritableMap params = Arguments.createMap();
                params.putString(VIDEO_PATH, String.format("file://%s", pathInformation));
                sendEvent(context, params, EVENT_ON_VIDEO_SAVED);
            }
            //return image call back with
        } catch (Exception e) {
            Log.d("@@@", EXCEPTION, e);
        }
    }

    public void saveVideoLocal(String videoPath, ThemedReactContext context) {
        saveVideoLocal(null, videoPath, context);
    }

    private void sendEvent(ReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    public String getVideoCachePath(Context context) {
        return new File(getVideoCacheDir(context), new SimpleDateFormat(CACHE_DATE_FORMAT, Locale.getDefault()).format(new Date()) + ".mp4").getAbsolutePath();
    }

    public static String getImageCachePath(Context context) {
        return new File(getImageCacheDir(context), new SimpleDateFormat(CACHE_DATE_FORMAT, Locale.getDefault()).format(new Date()) + ".jpg").getAbsolutePath();
    }

    public static String getAudioCachePath(Context context, String customName) {
        return new File(getAudioCacheDir(context), customName + ".mp3").getAbsolutePath();
    }

    public static String getDownloadedMusicCachePath(Context context, String customName) {
        return new File(getDownloadedMusicCacheDir(context), customName + ".mp3").getAbsolutePath();
    }

    public static String getAudioPath(Context context) {
        return getAudioCachePath(context, new SimpleDateFormat(CACHE_DATE_FORMAT, Locale.getDefault())
                .format(new Date()));
    }

    /*
     * copy file to specific directory
     */
    public String copyFile(File file, File dir) {
        if (!dir.exists()) {
            boolean result = dir.mkdirs();
            Log.d("@@@", "copy file - result " + result);
        }
        File targetFile = new File(dir, file.getName());
        try (FileOutputStream newFile = new FileOutputStream(targetFile);
             FileInputStream oldFile = new FileInputStream(file);) {


            // Transfer bytes from in to out
            byte[] buf = new byte[1024];
            int len;
            while ((len = oldFile.read(buf)) > 0) {
                newFile.write(buf, 0, len);
            }
            return targetFile.getAbsolutePath();
        } catch (IOException e) {
            Log.d("@@@", EXCEPTION, e);
        }
        return null;
    }

    private String fileMoving(File file, File dir) {
        if (!dir.exists()) {
            boolean result = dir.mkdirs();
            Log.i("@@@", "file - result " + result);
        }
        File targetFile = new File(dir, file.getName());
        try (InputStream in = new FileInputStream(file);
             OutputStream out = new FileOutputStream(targetFile);) {

            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            // write the output file (You have now copied the file)
            out.flush();
            return targetFile.getAbsolutePath();
        } catch (IOException e) {
            Log.d("@@@", "file utils - file moving - exception - ", e);
        }
        return null;
    }

    private void notifyMediaGallery(String filePath, Context context) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);     // NOSONAR
        File f = new File(filePath);
        Uri contentUri = Uri.fromFile(f);
        mediaScanIntent.setData(contentUri);
        context.sendBroadcast(mediaScanIntent); // NOSONAR
    }

    public void saveImageLocal(String imagePath, ThemedReactContext context) {
        saveImageLocal(null, imagePath, context);
    }

    /*
     * Android Q required
     * uses content Resolver to create and store image by output stream
     */
    @RequiresApi(api = Build.VERSION_CODES.Q)
    public static Pair<Boolean, String> saveMedia(Context context,
                                                  Object sourceFile,
                                                  Uri contentUri,
                                                  String fileName,
                                                  String mime,
                                                  String storePath) throws IOException {
        new File(storePath).mkdirs(); //create parent directory
        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, mime);
        contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, storePath);

        ContentResolver resolver = context.getContentResolver();
        Uri uri = resolver.insert(contentUri, contentValues);
        OutputStream imageOutStream = null;
        InputStream fileInputStream = null;

        try {           // NOSONAR
            if (uri == null) {
                throw new IOException("Failed to insert MediaStore row");
            }

            if (sourceFile instanceof File) {
                fileInputStream = new FileInputStream(((File) sourceFile));
            } else if (sourceFile instanceof Uri) {
                fileInputStream = resolver.openInputStream((Uri) sourceFile);
            }
            imageOutStream = resolver.openOutputStream(uri);
            outStreamWrite(fileInputStream, imageOutStream);
            return new Pair<>(true, uri.getPath());
        } catch (IOException e) {
            Log.d(SDK_NAME, EXCEPTION, e);
        } finally {
            if (imageOutStream != null) {
                imageOutStream.close();
            }
            if (fileInputStream != null) {
                fileInputStream.close();
            }
        }
        return new Pair<>(false, null);        // NOSONAR
    }

    public static File saveGifOverlay(ReactContext reactContext, ByteBuffer bytes, String fileName) {
        return saveByteBufferToFile(new File(getVideoCacheDir(reactContext), fileName), bytes);
    }

    /*
     * writes input stream data to output stream
     * handled by reading with memory allocation
     */
    public static Boolean outStreamWrite(InputStream inputStream, OutputStream outputStream) {
        try (InputStream in = inputStream;
             OutputStream out = outputStream) {

            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            // write the output file (You have now copied the file)
            out.flush();
            return true;
        } catch (IOException e) {
            Log.d("@@@", "file utils - file moving - exception - ", e);
            Log.d(SDK_NAME, EXCEPTION, e);
        }
        return false;
    }

    /*
     * write byte-buffers to file with OutputStream
     */
    public static File saveByteBufferToFile(File exportFile, ByteBuffer bytes) {
        try (FileOutputStream fileOutputStream = new FileOutputStream(exportFile);) {
            byte[] bt = new byte[bytes.capacity()];
            ((ByteBuffer) bytes.duplicate().clear()).get(bt);
            fileOutputStream.write(bt);
            fileOutputStream.getFD().sync();
        } catch (IOException e) {
            Log.d(SDK_NAME, EXCEPTION, e);
            Log.d("@@@", EXCEPTION, e);
        }
        return exportFile;
    }

    public static File getCachedBitmapFile(ReactContext reactContext,
                                           Bitmap bitmap,
                                           String fileName) {
        return getCachedBitmapFile(reactContext, Bitmap.CompressFormat.PNG, bitmap, fileName);
    }

    /*
     * generate cached file to bitmap
     * require context to access internal-cache directory
     */
    public static File getCachedBitmapFile(ReactContext reactContext,
                                           Bitmap.CompressFormat compressFormat,
                                           Bitmap bitmap,
                                           String fileName) {
        File cacheFile = null;
        FileOutputStream fileOutputStream = null;
        try {                                                                   // NOSONAR
            cacheFile = new File(getImageCacheDir(reactContext), fileName);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            bitmap.compress(compressFormat, 80, bos); // YOU can also save it in JPEG
            byte[] bimodal = bos.toByteArray();

            fileOutputStream = new FileOutputStream(cacheFile);
            fileOutputStream.write(bimodal);
            fileOutputStream.flush();
        } catch (Exception e) {
            Log.d(SDK_NAME, EXCEPTION, e);
        } finally {
            try {
                if (fileOutputStream != null) {
                    fileOutputStream.close();
                }
            } catch (IOException e) {
                Log.d(SDK_NAME, EXCEPTION, e);
            }
        }
        return cacheFile;
    }

    public static File getVideoCacheDir(Context context) {
        File file = new File(context.getCacheDir() + File.separator + Constants.VIDEO_CACHE_PATH);
        file.mkdirs();                                                      // NOSONAR
        return file;
    }

    public static File getImageCacheDir(Context context) {
        File file = new File(context.getCacheDir() + File.separator + Constants.IMAGE_CACHE_PATH);
        file.mkdirs();                                                      // NOSONAR
        return file;
    }

    public static File getDownloadedMusicCacheDir(Context context) {
        File file = new File(context.getCacheDir() + File.separator + Constants.DOWNLOADED_MUSIC_CACHE_PATH);
        file.mkdirs();                                                      // NOSONAR
        return file;
    }

    public static File getAudioCacheDir(Context context) {
        File file = new File(context.getCacheDir() + File.separator + Constants.AUDIO_CACHE_PATH);
        file.mkdirs();                                                      // NOSONAR
        return file;
    }

    public static Bitmap getBitmapFromUri(Context context, Uri imageUri) {
        Bitmap bitmap = null;
        ContentResolver contentResolver = context.getContentResolver();
        try {
            if (Build.VERSION.SDK_INT < 28) {
                bitmap = MediaStore.Images.Media.getBitmap(contentResolver, imageUri);      // NOSONAR
            } else {
                ImageDecoder.Source source = ImageDecoder.createSource(contentResolver, imageUri);
                bitmap = ImageDecoder.decodeBitmap(source);
            }
        } catch (Exception e) {
            Log.d(SDK_NAME, EXCEPTION, e);
        }
        return bitmap;
    }

    /*
     * Delete temporary media files
     * Context required to access internal-cache
     */
    public static void clearMediaCache(Context context) {
        for (File file : Objects.requireNonNull(getVideoCacheDir(context).listFiles())) {
            if (file.delete()) {                                     // NOSONAR
                Log.d("@@@", "deleted");
            }
        }
        for (File file : Objects.requireNonNull(getImageCacheDir(context).listFiles())) {
            if (file.delete()) {                                     // NOSONAR
                Log.d("@@@", "file is deleted");
            }
        }
        for (File file : Objects.requireNonNull(getAudioCacheDir(context).listFiles())) {
            if (file.delete()) {                                     // NOSONAR
                Log.d("@@@", "file is deleted");
            }
        }
    }

    public static String copyFileToCache(Context context, String inputPath) throws IOException {
        File file = new File(context.getCacheDir(), getFileNameUsingContentResolver(context, inputPath));
        ParcelFileDescriptor parcelFileDescriptor = null;
        InputStream inputStream = null;
        OutputStream outputStream = null;
        try {                                                                                          //NOSONAR
            parcelFileDescriptor = context.getContentResolver().openFileDescriptor(Uri.parse(inputPath), "r", null);
            inputStream = new FileInputStream(parcelFileDescriptor.getFileDescriptor());                    //NOSONAR
            outputStream = new FileOutputStream(file);
            android.os.FileUtils.copy(inputStream, outputStream, null, null, new android.os.FileUtils.ProgressListener() {
                @Override
                public void onProgress(long progress) {
                    Log.e("@@@", "onProgress -- " + progress);
                }
            });
            //IOUtils.copy(inputStream, outputStream);
        } catch (IOException e) {
            Log.d("@@@", EXCEPTION, e);
        } finally {
            if (parcelFileDescriptor != null) {
                parcelFileDescriptor.close();
            }
            if (inputStream != null) {
                inputStream.close();
            }
            if (outputStream != null) {
                outputStream.close();
            }
        }
        return file.getAbsolutePath();
    }

    public static String getFileNameUsingContentResolver(Context context, String inputPath) {
        String name = "";
        Cursor returnCursor = context.getContentResolver().query(Uri.parse(inputPath), null, null, null, null);
        if (returnCursor != null) {
            int index = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
            returnCursor.moveToFirst();
            name = returnCursor.getString(index);
            returnCursor.close();
        }
        return name;
    }

    public static boolean isSharedVideoFromOtherDir(Context context, String path) {
        return !path.contains(context.getCacheDir().getAbsolutePath()) && !path.contains(Constants.VIDEO_FILE_PATH);
    }

    public static boolean isCompletelyWritten(String file) {
        return isCompletelyWritten(new File(file));
    }

    public static boolean isCompletelyWritten(File file) {
       /* RandomAccessFile stream = null;
        try {
            stream = new RandomAccessFile(file, "rw");
            return true;
        } catch (Exception e) {
            Log.d("@@@", "Skipping file " + file.getName() + " for this iteration due it's not completely written");
        } finally {
            if (stream != null) {
                try {
                    stream.close();
                } catch (IOException e) {
                    Log.d("@@@", "Exception during closing file " + file.getName());
                }
            }
        }
        return false;*/
        return file.exists();
    }

    public static byte[] fileToBytes(File file) {
        int size = (int) file.length();
        if (size > Constants.BYTE_ARRAY_SIZE) {
            size = Constants.BYTE_ARRAY_SIZE;
        }
        byte[] bytes = new byte[size];
        try (BufferedInputStream buf = new BufferedInputStream(new FileInputStream(file))) {                                                                     // NOSONAR
            buf.read(bytes, 0, bytes.length);                                       //NOSONAR
        } catch (IOException e) {
            Log.d("Fileutils", EXCEPTION, e);
        }
        return bytes;
    }
}

