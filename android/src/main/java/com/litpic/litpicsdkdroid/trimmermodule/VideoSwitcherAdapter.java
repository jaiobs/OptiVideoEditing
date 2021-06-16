package com.litpic.litpicsdkdroid.trimmermodule;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.signature.ObjectKey;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.imageeditor.customview.CustomImageView;

import java.util.ArrayList;
import java.util.List;

public class VideoSwitcherAdapter extends RecyclerView.Adapter<VideoSwitcherAdapter.ViewHolder>
        implements View.OnClickListener {

    private final ArrayList<TrimmerVideoData> trimmerVideoDataArrayList;
    private final ThemedReactContext context;
    private final VideoThumbClickListeners videoThumbClickListeners;

    public VideoSwitcherAdapter(List<TrimmerVideoData> trimmerVideoData,
                                ThemedReactContext themedReactContext,
                                VideoThumbClickListeners videoThumbClickListeners) {
        this.trimmerVideoDataArrayList = (ArrayList<TrimmerVideoData>) trimmerVideoData;
        this.context = themedReactContext;
        this.videoThumbClickListeners = videoThumbClickListeners;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new ViewHolder(LayoutInflater.from(context)
                .inflate(R.layout.trimmer_video_indicator, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, final int position) {
        if (position == trimmerVideoDataArrayList.size()) {
            holder.videoIcon.setImageDrawable(
                    ContextCompat.getDrawable(context, R.drawable.ic_add_black_24dp));
        } else {
            // place video thumb here
            Glide.with(context).load(trimmerVideoDataArrayList.get(position).getVideoUrl()).centerCrop()
                    .diskCacheStrategy(DiskCacheStrategy.DATA)
                    .signature(new ObjectKey(trimmerVideoDataArrayList.get(position).getVideoUrl())).into(holder.videoIcon);
        }
        holder.videoIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (trimmerVideoDataArrayList.size() == position) {
                    videoThumbClickListeners.getVideoFromGallery();
                } else {
                    videoThumbClickListeners.onVideoThumbClicked(position);
                }
            }
        });
        holder.setIsRecyclable(true);
    }

    @Override
    public int getItemCount() {
        return trimmerVideoDataArrayList.size() + 1;
    }

    @Override
    public void onClick(View view) {
        // switch video
        int position = (int) view.getTag();
        if (trimmerVideoDataArrayList.size() == position) {
            videoThumbClickListeners.getVideoFromGallery();
        } else {
            videoThumbClickListeners.onVideoThumbClicked(position);
        }
    }

    static class ViewHolder extends RecyclerView.ViewHolder {

        CustomImageView videoIcon;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            this.videoIcon = itemView.findViewById(R.id.iv_video_thumb);
            this.setIsRecyclable(true);
        }
    }

    public interface VideoThumbClickListeners {

        void onVideoThumbClicked(int position);

        void getVideoFromGallery();
    }
}
