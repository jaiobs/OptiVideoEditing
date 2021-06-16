package com.litpic.litpicsdkdroid.trimmermodule;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.AttributeSet;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

public class CustomRecyclerView extends RecyclerView {
    private boolean mRequestedLayout = true;

    public CustomRecyclerView(@NonNull Context context) {
        super(context);
    }


    public CustomRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public CustomRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }


    @Override
    public void requestLayout() {
        super.requestLayout();
        if (!mRequestedLayout) {
            mRequestedLayout = true;
            this.post(new Runnable() {
                @SuppressLint("WrongCall")
                @Override
                public void run() {
                    mRequestedLayout = false;
                    layout(getLeft(), getTop(), getRight(), getBottom());
                    onLayout(false, getLeft(), getTop(), getRight(), getBottom());
                }
            });
        }
    }

    public boolean isRequestedLayout() {
        return mRequestedLayout;
    }

    public void setRequestedLayout(boolean requestedLayout) {
        this.mRequestedLayout = requestedLayout;
    }
}
