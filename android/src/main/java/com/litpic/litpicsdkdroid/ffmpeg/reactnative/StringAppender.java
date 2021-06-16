package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import android.text.TextUtils;

import java.util.ArrayList;
import java.util.List;

public class StringAppender {
    private String vDelimiter = " ";
    private final List<String> vStringList = new ArrayList<>();

    public StringAppender() {
    }

    public StringAppender(String delimiter) {
        this.vDelimiter = delimiter;
    }

    public StringAppender add(String text) {
        vStringList.add(text);
        return this;
    }

    public String getString() {
        return TextUtils.join(vDelimiter, vStringList);
    }

    public String[] getArray() {
        return vStringList.toArray(new String[vStringList.size()]);
    }
}
