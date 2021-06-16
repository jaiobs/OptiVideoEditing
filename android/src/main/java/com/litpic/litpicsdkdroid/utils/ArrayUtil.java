package com.litpic.litpicsdkdroid.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.Objects;

public class ArrayUtil {

    private ArrayUtil(){

    }

    public static JSONArray toJSONArray(ReadableArray readableArray) throws JSONException {
        JSONArray jsonArray = new JSONArray();

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    jsonArray.put(i, null);
                    break;
                case Boolean:
                    jsonArray.put(i, readableArray.getBoolean(i));
                    break;
                case Number:
                    jsonArray.put(i, readableArray.getDouble(i));
                    break;
                case String:
                    jsonArray.put(i, readableArray.getString(i));
                    break;
                case Map:
                    jsonArray.put(i, MapUtils.toJSONObject(Objects.requireNonNull(readableArray.getMap(i))));
                    break;
                case Array:
                    jsonArray.put(i, ArrayUtil.toJSONArray(Objects.requireNonNull(readableArray.getArray(i))));
                    break;
            }
        }

        return jsonArray;
    }

    public static Object[] toArray(JSONArray jsonArray) throws JSONException {
        Object[] array = new Object[jsonArray.length()];

        for (int i = 0; i < jsonArray.length(); i++) {
            Object value = jsonArray.get(i);

            if (value instanceof JSONObject) {
                value = MapUtils.toMap((JSONObject) value);
            }
            if (value instanceof JSONArray) {
                value = ArrayUtil.toArray((JSONArray) value);
            }

            array[i] = value;
        }

        return array;
    }

    public static Object[] toArray(ReadableArray readableArray) {
        Object[] array = new Object[readableArray.size()];

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    array[i] = null;
                    break;
                case Boolean:
                    array[i] = readableArray.getBoolean(i);
                    break;
                case Number:
                    array[i] = readableArray.getDouble(i);
                    break;
                case String:
                    array[i] = readableArray.getString(i);
                    break;
                case Map:
                    array[i] = MapUtils.toMap(Objects.requireNonNull(readableArray.getMap(i)));
                    break;
                case Array:
                    array[i] = ArrayUtil.toArray(Objects.requireNonNull(readableArray.getArray(i)));
                    break;
            }
        }

        return array;
    }

    public static WritableArray toWritableArray(Object[] array) {       // NOSONAR
        WritableArray writableArray = Arguments.createArray();

        for (Object value : array) {
            if (value == null) {
                writableArray.pushNull();
            }
            if (value instanceof Boolean) {
                writableArray.pushBoolean((Boolean) value);
            }
            if (value instanceof Double) {
                writableArray.pushDouble((Double) value);
            }
            if (value instanceof Integer) {
                writableArray.pushInt((Integer) value);
            }
            if (value instanceof String) {
                writableArray.pushString((String) value);
            }
            if (value instanceof Map) {
                writableArray.pushMap(MapUtils.toWritableMap((Map<String, Object>) value));
            }
            if (value != null && value.getClass().isArray() && value instanceof Object[]) {
                writableArray.pushArray(ArrayUtil.toWritableArray((Object[]) value));

            }
        }

        return writableArray;
    }
}
