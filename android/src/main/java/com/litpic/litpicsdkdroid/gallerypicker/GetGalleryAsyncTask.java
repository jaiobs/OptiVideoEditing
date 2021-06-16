package com.litpic.litpicsdkdroid.gallerypicker;

import android.app.Activity;
import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Log;

import com.litpic.litpicsdkdroid.config.Constants;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.TreeMap;

import static android.provider.BaseColumns._ID;
import static android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
import static android.provider.MediaStore.MediaColumns.DATA;
import static android.provider.MediaStore.MediaColumns.DATE_ADDED;
import static android.provider.MediaStore.MediaColumns.DATE_TAKEN;
import static android.provider.MediaStore.MediaColumns.HEIGHT;
import static android.provider.MediaStore.MediaColumns.MIME_TYPE;
import static android.provider.MediaStore.MediaColumns.ORIENTATION;
import static android.provider.MediaStore.MediaColumns.SIZE;
import static android.provider.MediaStore.MediaColumns.TITLE;
import static android.provider.MediaStore.MediaColumns.WIDTH;
import static android.provider.MediaStore.Video.VideoColumns.DURATION;
import static com.litpic.litpicsdkdroid.config.Constants.EXCEPTION;
import static com.litpic.litpicsdkdroid.config.Constants.FILE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.FILE_PREFIX_ONE;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_WIDTH;
import static com.litpic.litpicsdkdroid.config.Constants.LIST;
import static com.litpic.litpicsdkdroid.config.Constants.MEDIA_TYPE;
import static com.litpic.litpicsdkdroid.config.Constants.NAME;
import static com.litpic.litpicsdkdroid.config.Constants.SDK_NAME;
import static com.litpic.litpicsdkdroid.config.Constants.TIME_IN_MILLIS;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_WIDTH;

public class GetGalleryAsyncTask extends AsyncTask<Void, Void, String> {

    private final Activity context;
    private final String uploadType;
    private final GetGalleryListener getGalleryListener;
    private boolean isSmallVideo = false;

    private final HashSet<String> hashSet = new HashSet<>();
    private HashMap<String, JSONObject> hashMap = new HashMap<>();
    private final JSONArray jsonContainer = new JSONArray();

    public interface GetGalleryListener {
        void getGalleryList(String json);
    }

    /**
     * contractor to get the WS call for POST Method.
     *
     * @param context activity instance
     */
    public GetGalleryAsyncTask(Activity context, String uploadType, boolean isSmallVideo, GetGalleryListener getGalleryListener) {
        this.context = context;
        this.uploadType = uploadType;
        this.getGalleryListener = getGalleryListener;
        this.isSmallVideo = isSmallVideo;
    }

    /**
     * Call when before call the WS.
     */
    @Override
    protected void onPreExecute() {
        //onPreExecute
    }

    /**
     * action to be performed in background
     */
    @Override
    protected String doInBackground(Void... params) {                           // NOSONAR

        initDefaultFolder(uploadType.equals("image"));
        Cursor cursor;
        switch (uploadType) {
            case "image":
                String[] columns;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    columns = new String[]{DATA, _ID, DATE_TAKEN, MIME_TYPE, TITLE, SIZE, HEIGHT,
                            WIDTH, ORIENTATION};
                } else {
                    columns = new String[]{DATA, _ID, DATE_TAKEN, MIME_TYPE, TITLE, SIZE, HEIGHT,
                            WIDTH};
                }
                cursor = context.getContentResolver()
                        .query(EXTERNAL_CONTENT_URI, columns, null, null, DATE_TAKEN + " ASC");

                if (cursor != null && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        try {
                            String path = cursor.getString(cursor.getColumnIndexOrThrow(DATA));
                            File file = new File(path);
                            if (file.exists() && !file.isDirectory()) {
                                JSONObject jsonGallery = getJsonImageGallery(cursor);

                                String root = path.substring(0, path.lastIndexOf("/"));
                                String folderName = path.substring(root.lastIndexOf("/") + 1, root.length());

                                folderName = path.contains(getDefaultCameraPath()) ? Constants.CAMERA_ROLL : folderName;
                                putHashMap(folderName, jsonGallery);
                            }
                        } catch (Exception e) {
                            Log.d("@@@", "getGalleryData - exception - ", e);
                        }
                    }
                    cursor.close();
                }
                break;
            case "video":
                String[] mediaColumns;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    mediaColumns = new String[]{_ID, DATA, TITLE, MIME_TYPE, DATE_TAKEN, SIZE, DURATION, HEIGHT, WIDTH, ORIENTATION};
                } else {
                    mediaColumns = new String[]{_ID, DATA, TITLE, MIME_TYPE, DATE_TAKEN, SIZE, DURATION, HEIGHT, WIDTH};
                }
                cursor = context.getContentResolver().query(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, mediaColumns, null, null, DATE_TAKEN + " ASC");

                if (cursor != null && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        try {
                            String path = cursor.getString(cursor.getColumnIndexOrThrow(DATA));
                            String extension = path.substring(path.lastIndexOf(".") + 1);

                            double fileSize = (Double.parseDouble(cursor.getString(cursor.getColumnIndexOrThrow(SIZE))) / 1024) / 1024;
                            boolean isLimitedSize = isSmallVideo ? fileSize <= 50 : fileSize <= 1024;

                            File file = new File(path);
                            if (file.exists() && !file.isDirectory() && isSupportedVideo(extension) && isLimitedSize) {
                                JSONObject jsonGallery = getJsonVideoGallery(cursor);

                                String root = path.substring(0, path.lastIndexOf("/"));
                                String folderName = path.substring(root.lastIndexOf("/") + 1, root.length());

                                folderName = path.contains(getDefaultCameraPath()) ? Constants.CAMERA_ROLL : folderName;
                                putHashMap(folderName, jsonGallery);
                            }
                        } catch (Exception e) {
                            Log.d("@@@", "GetGalleryData - exception - ", e);
                        }
                    }
                    cursor.close();
                }
                break;
            case "both":
                String[] projection = {_ID, DATA, DATE_ADDED, MediaStore.Files.FileColumns.MEDIA_TYPE, MIME_TYPE, TITLE, SIZE};
                String selection = MediaStore.Files.FileColumns.MEDIA_TYPE + "=" + MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE + " OR " + MediaStore.Files.FileColumns.MEDIA_TYPE + "=" + MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO;

                Uri queryUri = MediaStore.Files.getContentUri("external");
                cursor = context.getContentResolver().query(queryUri, projection, selection, null, DATE_ADDED + " DESC");

                if (cursor != null && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        String mediaType = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MEDIA_TYPE));
                        try {
                            String path = cursor.getString(cursor.getColumnIndexOrThrow(DATA));
                            File file = new File(path);
                            if (file.exists() && !file.isDirectory()) {
                                JSONObject jsonGallery = null;
                                if (mediaType.equals("3")) {
                                    String extension = path.substring(path.lastIndexOf(".") + 1);
                                    double fileSize = (Double.parseDouble(cursor.getString(cursor.getColumnIndexOrThrow(SIZE))) / 1024) / 1024;
                                    boolean isLimitedSize = isSmallVideo ? fileSize <= 50 : fileSize <= 1024;

                                    if (isSupportedVideo(extension) && isLimitedSize) {
                                        jsonGallery = getJsonFileGallery(cursor, "3");
                                        putHashMap(Constants.ALL_VIDEOS, jsonGallery);
                                    }
                                } else {
                                    jsonGallery = getJsonFileGallery(cursor, "1");
                                    putHashMap(Constants.ALL_IMAGES, jsonGallery);
                                }

                                if (jsonGallery != null) {
                                    String root = path.substring(0, path.lastIndexOf("/"));
                                    String folderName = path.substring(root.lastIndexOf("/") + 1, root.length());
                                    folderName = path.contains(getDefaultCameraPath()) ? Constants.CAMERA_ROLL : folderName;
                                    putHashMap(folderName, jsonGallery);
                                }
                            }
                        } catch (Exception e) {
                            Log.d("@@@", "get gallery data - exception  -- ", e);
                        }
                    }
                    cursor.close();
                }
                break;
            default:
                break;
        }

        if (hashMap != null && hashMap.size() > 0) {
            Map<String, JSONObject> map = new TreeMap<>(hashMap);
            for (JSONObject jsonObject : map.values()) {
                if (jsonObject != null) jsonContainer.put(jsonObject);
            }
            hashMap = null;
        }

        return jsonContainer.toString();
    }

    /**
     * called after the WS return the response.
     */
    @Override
    protected void onPostExecute(String json) {
        if (!TextUtils.isEmpty(json)) getGalleryListener.getGalleryList(json);
    }

    private boolean isSupportedVideo(String extension) {
        return Arrays.asList(Constants.SUPPORTED_VIDEO_FORMAT).contains(extension.toUpperCase());
    }

    private void initDefaultFolder(boolean isImage) {
        if (isImage) {
            hashSet.add(Constants.ALL_IMAGES);
            putHashMap(Constants.ALL_IMAGES, new JSONArray());
        } else {
            hashSet.add(Constants.ALL_VIDEOS);
            putHashMap(Constants.ALL_VIDEOS, new JSONArray());
        }
    }

    private JSONObject getJsonImageGallery(Cursor cursor) {
        JSONObject jsonGallery = new JSONObject();
        try {
            if (cursor != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    jsonGallery.put(ORIENTATION, cursor.getString(cursor.getColumnIndexOrThrow(ORIENTATION)));
                    Uri contentUri = ContentUris.withAppendedId(
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                            cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)));
                    jsonGallery.put(IMAGE_PATH, contentUri);
                } else {
                    jsonGallery.put(IMAGE_PATH, FILE_PREFIX_ONE + cursor.getString(cursor.getColumnIndexOrThrow(DATA)));
                }
                jsonGallery.put(MEDIA_TYPE, "1");
                jsonGallery.put(MIME_TYPE, cursor.getString(cursor.getColumnIndexOrThrow(MIME_TYPE)));
                jsonGallery.put(TITLE, cursor.getString(cursor.getColumnIndexOrThrow(TITLE)));
                jsonGallery.put(SIZE, cursor.getString(cursor.getColumnIndexOrThrow(SIZE)));
                jsonGallery.put(IMAGE_HEIGHT, cursor.getString(cursor.getColumnIndexOrThrow(HEIGHT)));
                jsonGallery.put(IMAGE_WIDTH, cursor.getString(cursor.getColumnIndexOrThrow(WIDTH)));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && cursor.getString(cursor.getColumnIndexOrThrow(ORIENTATION)) != null) {
                    jsonGallery.put(ORIENTATION, cursor.getString(cursor.getColumnIndexOrThrow(ORIENTATION)));
                }
                if (cursor.getString(cursor.getColumnIndexOrThrow(DATE_TAKEN)) != null) {
                    jsonGallery.put(TIME_IN_MILLIS, Long.parseLong(cursor.getString(cursor.getColumnIndexOrThrow(DATE_TAKEN))));
                }
            }
        } catch (JSONException e) {
            Log.d("@@@", "json exception - ", e);
        }
        return jsonGallery;
    }

    public String getDefaultCameraPath() {
        boolean result;
        File path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM); // NOSONAR
        if (path.exists()) {
            File test1 = new File(path, "Camera/");
            if (test1.exists()) {
                path = test1;
            } else {
                File test2 = new File(path, "100MEDIA/");
                if (test2.exists()) {
                    path = test2;
                } else {
                    File test3 = new File(path, "100ANDRO/");
                    if (test3.exists()) {
                        path = test3;
                    } else {
                        result = test1.mkdirs();
                        path = test1;
                        Log.d("@@@", "result - " + result);
                    }
                }
            }
        } else {
            path = new File(path, "Camera/");
            result = path.mkdirs();
            Log.d("@@@", "result--" + result);
        }
        return path.getPath();
    }

    private JSONObject getJsonVideoGallery(Cursor cursor) {
        JSONObject jsonGallery = new JSONObject();
        try {
            if (cursor != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    Uri contentUri = ContentUris.withAppendedId(
                            MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                            cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)));
                    jsonGallery.put(VIDEO_PATH, contentUri);
                } else {
                    jsonGallery.put(VIDEO_PATH, FILE_PREFIX_ONE + cursor.getString(cursor.getColumnIndexOrThrow(DATA)));
                }

                jsonGallery.put(MEDIA_TYPE, "3");
                jsonGallery.put(MIME_TYPE, cursor.getString(cursor.getColumnIndexOrThrow(MIME_TYPE)));
                jsonGallery.put(TITLE, cursor.getString(cursor.getColumnIndexOrThrow(TITLE)));
                jsonGallery.put(SIZE, cursor.getString(cursor.getColumnIndexOrThrow(SIZE)));
                jsonGallery.put(VIDEO_HEIGHT, cursor.getString(cursor.getColumnIndexOrThrow(HEIGHT)));
                jsonGallery.put(VIDEO_WIDTH, cursor.getString(cursor.getColumnIndexOrThrow(WIDTH)));
                jsonGallery.put(DURATION, cursor.getString(cursor.getColumnIndexOrThrow(DURATION)));
                if (cursor.getString(cursor.getColumnIndexOrThrow(DATE_TAKEN)) != null) {
                    jsonGallery.put(TIME_IN_MILLIS, Long.parseLong(cursor.getString(cursor.getColumnIndexOrThrow(DATE_TAKEN))));
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && cursor.getString(cursor.getColumnIndexOrThrow(ORIENTATION)) != null) {
                    jsonGallery.put(ORIENTATION, cursor.getString(cursor.getColumnIndexOrThrow(ORIENTATION)));
                }
            }
        } catch (JSONException e) {
            Log.e(SDK_NAME, EXCEPTION, e);
        }
        return jsonGallery;
    }

    private JSONObject getJsonFileGallery(Cursor cursor, String mediaType) {
        JSONObject jsonGallery = new JSONObject();
        try {
            if (cursor != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                    if (mediaType.equals("1")) {
                        Uri contentUri = ContentUris.withAppendedId(
                                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                                cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)));
                        jsonGallery.put(IMAGE_PATH, contentUri);
                    } else {
                        Uri contentUri = ContentUris.withAppendedId(
                                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                                cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)));
                        jsonGallery.put(FILE_PATH, contentUri);
                    }
                } else {
                    jsonGallery.put(FILE_PATH, FILE_PREFIX_ONE + cursor.getString(cursor.getColumnIndexOrThrow(DATA)));
                }
                jsonGallery.put(MEDIA_TYPE, mediaType);
                jsonGallery.put(MIME_TYPE, cursor.getString(cursor.getColumnIndexOrThrow(MIME_TYPE)));
                jsonGallery.put(TITLE, cursor.getString(cursor.getColumnIndexOrThrow(TITLE)));
                jsonGallery.put(SIZE, cursor.getString(cursor.getColumnIndexOrThrow(SIZE)));
                if (cursor.getString(cursor.getColumnIndexOrThrow(DATE_ADDED)) != null) {
                    jsonGallery.put(TIME_IN_MILLIS, Long.parseLong(cursor.getString(cursor.getColumnIndexOrThrow(DATE_ADDED))));
                }
            }
        } catch (JSONException e) {
            Log.d("@@@", "json exception - e", e);
        }
        return jsonGallery;
    }

    private void putHashMap(String folderName, JSONObject jsonGallery) {
        hashSet.add(folderName);

        try {
            if (hashMap.containsKey(folderName)) {
                JSONObject jsonFolder = hashMap.get(folderName);
                if (jsonFolder != null && jsonFolder.getJSONArray(LIST) != null) {
                    JSONArray jsonArray = jsonFolder.getJSONArray(LIST);
                    jsonArray.put(jsonGallery);
                    putHashMap(folderName, jsonArray);
                }
            } else {
                putHashMap(folderName, new JSONArray().put(jsonGallery));
            }
        } catch (JSONException e) {
            Log.d("@@@", "json exception - ", e);
        }
    }

    private void putHashMap(String folderName, JSONArray jsonArray) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put(NAME, folderName);
            jsonObject.put(LIST, jsonArray);
            jsonObject.put(SIZE, jsonArray.length());
            hashMap.put(folderName, jsonObject);
        } catch (JSONException e) {
            Log.d("@@@", "json exception -- ", e);
        }
    }
}