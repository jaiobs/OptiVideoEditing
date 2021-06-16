////
////  LitpicEditorView.swift
////  react-native-litpic-camera-module
////
////  Created by Suresh kumar on 21/04/20.
////
//
//import UIKit
//import Photos
//import  AVKit
//
//@objc public class LitpicEditorView: UIView, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
//
//    let trim = TrimmerView()
//    var playerView: UIView!
//    var player: AVPlayer?
//    var playbackTimeCheckerTimer: Timer?
//    var trimmerPositionChangedTimer: Timer?
//    var totalHours:UILabel?
//    var toolView:UIView?
//    var videoAsset:AVAsset?
//    var videoUrl:String?
//    var outputVideoUrl:String?
//    public var IsDevicePortrait:Bool?
//    public var playlayer: AVPlayerLayer?
//
//    var leftView:UIView?
//    var rightView:UIView?
//    var IsPortraitVideo:Bool = false
//    var videoRect:CGRect = .zero
//    var collectionview: UICollectionView!
//    var cellId = "Cell"
//
//
//    @objc public override init(frame: CGRect) {
//        super.init(frame: frame)
//        //        nibSetup()
//    }
//
//    @objc public init(videoUrl:String) {
//        super.init(frame: .zero)
//
//        self.videoUrl = videoUrl
//
//
//    }
//
//    @objc public required init?(coder aDecoder: NSCoder) {
//        super.init(coder: aDecoder)
//    }
//
//    public func nativeResolutionForLocalVideo(url:URL) -> CGSize?
//    {
//        guard let track = AVAsset(url: url as URL).tracks(withMediaType: AVMediaType.video).first else { return nil }
//        let size = track.naturalSize.applying(track.preferredTransform)
//        return CGSize(width: fabs(size.width), height: fabs(size.height))
//    }
//
//
//    private func resolutionForLocalVideo(url: URL) -> CGRect? {
//        guard let track = AVURLAsset(url: url).tracks(withMediaType: AVMediaType.video).first else { return nil }
//
//        let trackSize = track.naturalSize
//        let videoViewSize = playerView.bounds.size
//
//        let trackRatio = (trackSize.width ) / (trackSize.height )
//        let videoViewRatio = playerView.frame.size.width / playerView.frame.size.height
//
//        var newSize: CGSize
//
//        if videoViewRatio > trackRatio {
//            newSize = CGSize(width: (trackSize.width ) * playerView.frame.size.height / (trackSize.height ), height: videoViewSize.height)
//        } else {
//            newSize = CGSize(width: playerView.frame.size.width, height: (trackSize.height ) * videoViewSize.width / (trackSize.width ))
//        }
//
//        let newX = (videoViewSize.width - newSize.width) / 2
//        let newY = (videoViewSize.height - newSize.height) / 2
//
//        return CGRect.init(x: newX, y: newY, width: newSize.width, height: newSize.height)
//    }
//
//
//
//
//    @objc public func portraitView() {
//        backgroundColor = .black
//        playerView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: (UIApplication.shared.keyWindow?.bounds.size.width)!, height: self.frame.size.height - 100))
//        playerView.backgroundColor = .black
//        playerView.isHidden = false
//        self.addSubview(playerView)
//        playerView.translatesAutoresizingMaskIntoConstraints = false
//
//        NSLayoutConstraint.activate([
//            playerView.leftAnchor.constraint(equalTo: self.leftAnchor),
//            playerView.rightAnchor.constraint(equalTo: self.rightAnchor),
//            playerView.topAnchor.constraint(equalTo: self.topAnchor),
//            playerView.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -200)
//        ])
//
//        playerView.aspectRation(1.0/1.0).isActive = true
//
//
//
//        toolView = UIView.init()
//        toolView?.backgroundColor = .black
//        toolView!.translatesAutoresizingMaskIntoConstraints = false
//        self.addSubview(toolView!)
//
//        NSLayoutConstraint.activate([
//            toolView!.leftAnchor.constraint(equalTo: playerView!.leftAnchor),
//            toolView!.rightAnchor.constraint(equalTo: playerView!.rightAnchor),
//            toolView!.topAnchor.constraint(equalTo: playerView!.bottomAnchor, constant: 0),
//            toolView!.heightAnchor.constraint(equalToConstant: 200)
//        ])
//
//        totalHours = UILabel.init()
//        totalHours?.frame =  CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: 30)
//        totalHours!.textAlignment = .center
//        totalHours!.text = "Total: 00"
//        totalHours?.textColor = .white
//        totalHours?.textAlignment = .center
//        totalHours?.backgroundColor = .clear
//        totalHours!.font = UIFont.systemFont(ofSize: 14)
//        toolView?.addSubview(totalHours!)
//
//        trim.backgroundColor = UIColor.init(red: 23, green: 25, blue: 37, alpha: 1)
//        trim.minDuration = 3
//        trim.maxDuration = 30
//        trim.maskColor = .white
//        trim.mainColor = .magenta
//        trim.handleColor = .white
//        trim.positionBarColor = .white
//        trim.assetPreview.backgroundColor = .black
//        toolView!.addSubview(trim)
//
//        NSLayoutConstraint.activate([
//            trim.leftAnchor.constraint(equalTo: totalHours!.leftAnchor),
//            trim.rightAnchor.constraint(equalTo: totalHours!.rightAnchor),
//            trim.topAnchor.constraint(equalTo: totalHours!.bottomAnchor, constant: 0),
//            trim.heightAnchor.constraint(equalToConstant: 50)
//        ])
//
//
//
//        if ((URL.init(string: self.videoUrl!)) != nil){
//            videoRect = self.resolutionForLocalVideo(url: URL.init(string: self.videoUrl!)!)!
//        }
//
//        pickAsset(videopath: "")
//
//
//
//
//
//        let videoTitle = UILabel.init()
//        videoTitle.frame =  CGRect.init(x: 0, y: 90, width: self.frame.size.width, height: 30)
//        videoTitle.textAlignment = .center
//        videoTitle.text = "Tab the clip to crop"
//        videoTitle.textAlignment = .center
//        videoTitle.textColor = .white
//        videoTitle.font = UIFont.systemFont(ofSize: 14)
//        toolView!.addSubview(videoTitle)
//
//        let layout: UICollectionViewFlowLayout = UICollectionViewFlowLayout()
//        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
//        layout.itemSize = CGSize(width: 40, height: 40)
//        layout.minimumInteritemSpacing = 10.0;
//        layout.minimumLineSpacing = 10.0;
//        layout.scrollDirection = .horizontal
//
//        collectionview = UICollectionView(frame: CGRect.init(x: 0, y: 130, width: self.frame.size.width, height: 50), collectionViewLayout: layout)
//        collectionview.dataSource = self
//        collectionview.delegate = self
//        collectionview.register(VideoCell.self, forCellWithReuseIdentifier: cellId)
//        collectionview.showsVerticalScrollIndicator = false
//        toolView!.addSubview(collectionview)
//
//    }
//
//
//    @objc public func landscapeView() {
//        let leftwidth:CGFloat = (self.frame.size.width/100) * 65
//        let rightWidth:CGFloat = (self.frame.size.width/100) * 35
//
//        backgroundColor = .black
//        leftView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: leftwidth , height: self.bounds.size.height))
//        leftView?.backgroundColor = .black
//        self.addSubview(leftView!)
//
//        playerView = UIView.init(frame: CGRect.init(x: 0, y: 0, width: leftwidth - 10 , height: self.frame.size.height))
//        playerView.backgroundColor = .black
//        playerView.isHidden = false
//        leftView!.addSubview(playerView)
//        playerView.translatesAutoresizingMaskIntoConstraints = false
//
//        NSLayoutConstraint.activate([
//            playerView.leftAnchor.constraint(equalTo: self.leftAnchor),
//            playerView.rightAnchor.constraint(equalTo: self.rightAnchor, constant: 10),
//            playerView.topAnchor.constraint(equalTo: self.topAnchor),
//            playerView.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant:0)
//        ])
//
//
//        rightView = UIView.init(frame: CGRect.init(x: leftwidth, y: 0, width: rightWidth, height: self.bounds.size.height))
//        rightView?.backgroundColor = .black
//        self.addSubview(rightView!)
//
//        totalHours = UILabel.init()
//        totalHours?.frame =  CGRect.init(x: 3, y: 10, width: rightWidth, height: 30)
//        totalHours!.textAlignment = .center
//        totalHours!.text = "Total: 00"
//        totalHours?.textColor = .white
//        totalHours?.textAlignment = .center
//        totalHours!.font = UIFont.systemFont(ofSize: 14)
//        totalHours!.translatesAutoresizingMaskIntoConstraints = false
//        rightView!.addSubview(totalHours!)
//
//        trim.backgroundColor = UIColor.init(red: 23, green: 25, blue: 37, alpha: 1)
//        trim.mainColor = .magenta
//        trim.handleColor = .white
//        trim.minDuration = 3
//        trim.maxDuration = 30
//        trim.positionBarColor = .white
//        trim.maskColor = .clear
//        rightView!.addSubview(trim)
//
//
//        NSLayoutConstraint.activate([
//            trim.leftAnchor.constraint(equalTo: rightView!.leftAnchor),
//            trim.rightAnchor.constraint(equalTo: rightView!.rightAnchor),
//            trim.topAnchor.constraint(equalTo: rightView!.topAnchor, constant: 30),
//            trim.heightAnchor.constraint(equalToConstant: 60)
//        ])
//        pickAsset(videopath: "")
//
//        let videosCollectionView:UIView = UIView.init()
//        videosCollectionView.frame = CGRect.init(x: 0, y: 100, width: rightWidth, height: 100)
//        rightView!.addSubview(videosCollectionView)
//
//        let videoTitle = UILabel.init()
//        videoTitle.frame =  CGRect.init(x: 0, y: 0, width: rightWidth, height: 30)
//        videoTitle.textAlignment = .center
//        videoTitle.text = "Tab the clip to crop"
//        videoTitle.textAlignment = .center
//        videoTitle.font = UIFont.systemFont(ofSize: 14)
//        videosCollectionView.addSubview(videoTitle)
//
//
//        let layout: UICollectionViewFlowLayout = UICollectionViewFlowLayout()
//        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
//        layout.itemSize = CGSize(width: 40, height: 40)
//        layout.minimumInteritemSpacing = 10.0;
//        layout.minimumLineSpacing = 10.0;
//        layout.scrollDirection = .horizontal
//
//        collectionview = UICollectionView(frame: CGRect.init(x: 0, y: 40, width: rightWidth, height: 50), collectionViewLayout: layout)
//        collectionview.dataSource = self
//        collectionview.delegate = self
//        collectionview.register(VideoCell.self, forCellWithReuseIdentifier: cellId)
//        collectionview.showsVerticalScrollIndicator = false
//        videosCollectionView.addSubview(collectionview)
//    }
//
//
//
//    @objc public func orientaionChanged(IsPortrait:Bool){
//        self.IsDevicePortrait = IsPortrait
//    }
//
//    func updateView() {
//        if playerView != nil{
//            playerView.removeFromSuperview()
//            trim.removeFromSuperview()
//            toolView?.removeFromSuperview()
//            self.collectionview.removeFromSuperview()
//
//            self.player!.pause()
//            self.playlayer!.removeFromSuperlayer()
//        }
//
//        if leftView != nil{
//            leftView?.removeFromSuperview()
//            rightView?.removeFromSuperview()
//        }
//
//
//
//
//        //        if self.IsDevicePortrait == false{
//        //            self.landscapeView()
//        //        }else{
//        //            self.portraitView()
//        //        }
//    }
//
//
//    @objc public func cropDidSelected() {
//        //        cropView.player?.pause()
//        player?.pause()
//
//        playerView.isHidden = !playerView.isHidden
//        //        cropView.isHidden = !cropView.isHidden
//        videoRender()
//    }
//
//
//    @objc public  func pickAsset(videopath:String) {
//        if self.videoUrl!.count > 5 {
//            let currentAsset =   AVAsset.init(url: URL.init(string: self.videoUrl!)!)
//            videoAsset = currentAsset
//            loadAsset(currentAsset)
//        }
//    }
//
//
//    @objc public class  func getVideoInformation(videopath:String, completionHandler: @escaping (_ param: NSDictionary) -> Void) {
//        if videopath.count > 5 {
//            let currentAsset =   AVAsset.init(url: URL.init(string: videopath)!)
//            let response:NSDictionary = ["width" : currentAsset.g_size.width, "height": currentAsset.g_size.height]
//            print(response)
//            completionHandler(response);
//        }
//    }
//
//
//    public override func layoutSubviews() {
//        self.updateView()
//        if (videoUrl != ""){
//            let videoSize:CGSize =  self.nativeResolutionForLocalVideo(url: URL.init(string: self.videoUrl!)!)!
//            if videoSize.width < videoSize.height{
//                IsPortraitVideo = true
//            } else{
//                IsPortraitVideo = false
//            }
//        }
//
//
//        portraitView()
//        self.pickAsset(videopath: "")
//
//
////        if (UIDevice.current.orientation == .portrait){
////            portraitView()
////            self.pickAsset(videopath: "")
////        }else if (UIDevice.current.orientation == .landscapeLeft || UIDevice.current.orientation == .landscapeRight){
////            landscapeView()
////            self.pickAsset(videopath: "")
////        }else{
////            portraitView()
////            self.pickAsset(videopath: "")
////        }
//
//    }
//
//    func loadAsset(_ asset: AVAsset) {
//        trim.asset = asset
//        trim.delegate = self
//        videoAsset = asset
//        videoRender()
//    }
//
//    private func createVideoThumbnail(from url: URL) -> UIImage? {
//        let asset = AVAsset(url: url)
//        let assetImgGenerate = AVAssetImageGenerator(asset: asset)
//        assetImgGenerate.appliesPreferredTrackTransform = true
//        assetImgGenerate.maximumSize = CGSize(width: frame.width, height: frame.height)
//
//        let time = CMTimeMakeWithSeconds(0.0, preferredTimescale: 600)
//        do {
//            let img = try assetImgGenerate.copyCGImage(at: time, actualTime: nil)
//            let thumbnail = UIImage(cgImage: img)
//            return thumbnail
//        }
//        catch {
//            print(error.localizedDescription)
//            return nil
//        }
//
//    }
//
//
//    func videoRender() {
//
//        addVideoPlayer(with: videoAsset!, playerView: playerView)
//        let duration = (trim.endTime! - trim.startTime!).seconds
//        totalHours?.text = "Total : \( duration.rounded())"
//        print(duration)
//    }
//
//    public func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        return 2
//    }
//
//    public func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//        let cell = collectionview.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath as IndexPath) as! VideoCell
//
//        if (indexPath.row == 1) {
//            let videoTitle = UILabel.init()
//            videoTitle.frame =  CGRect.init(x: 0, y: 0, width: cell.frame.size.width, height: cell.frame.size.height)
//            videoTitle.textAlignment = .center
//            videoTitle.text = "+"
//            videoTitle.textAlignment = .center
//            videoTitle.font = UIFont.systemFont(ofSize: 20)
//            cell.thumbImage!.addSubview(videoTitle)
//        }else{
//            if (URL.init(string: self.videoUrl!) != nil){
//                let video:URL = URL.init(string: self.videoUrl!)!
//                cell.thumbImage?.image = createVideoThumbnail(from: video)
//            }
//        }
//
//        return cell
//    }
//
//    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
//        let flowLayout = collectionViewLayout as! UICollectionViewFlowLayout
//        let numberOfItems = CGFloat(collectionView.numberOfItems(inSection: section))
//        let combinedItemWidth = (numberOfItems * flowLayout.itemSize.width) + ((numberOfItems - 1)  * flowLayout.minimumInteritemSpacing)
//        let padding = (collectionView.frame.width - combinedItemWidth) / 2
//        return UIEdgeInsets(top: 0, left: padding, bottom: 0, right: padding)
//    }
//
//
//    private func addVideoPlayer(with asset: AVAsset, playerView: UIView) {
//        let playerItem = AVPlayerItem(asset: asset)
//        player = AVPlayer(playerItem: playerItem)
//        playlayer = AVPlayerLayer(player: player)
//        playlayer!.backgroundColor = UIColor.black.cgColor
//        playlayer!.frame = CGRect(x: 0, y: 0, width: playerView.frame.width, height: playerView.frame.height)
//
//        if (UIDevice.current.orientation.isPortrait){
//            if (IsPortraitVideo == true){
//                playlayer!.videoGravity = AVLayerVideoGravity.resizeAspect
//            }else{
////                playlayer!.videoGravity = AVLayerVideoGravity.resize
//            }
//        }else{
//
//            if (IsPortraitVideo == true){
//                playlayer!.videoGravity = AVLayerVideoGravity.resizeAspect
//            }else{
////                playlayer!.videoGravity = AVLayerVideoGravity.resize
//            }
//        }
//
//
//        playerView.layer.sublayers?.forEach({$0.removeFromSuperlayer()})
//        playerView.layer.addSublayer(playlayer!)
//        player?.play()
//    }
//
//    public override func willMove(toWindow newWindow: UIWindow?) {
//        super.willMove(toWindow: newWindow)
//        if newWindow == nil {
//            player?.pause()
//            updateView()
//        } else {
//            // UIView appear
//        }
//    }
//
//
//    @objc func itemDidFinishPlaying(_ notification: Notification) {
//        if trim.startTime != nil {
//            //player?.seek(to: startTime)
//        }
//    }
//
//    func startPlaybackTimeChecker() {
//        stopPlaybackTimeChecker()
//        playbackTimeCheckerTimer = Timer.scheduledTimer(timeInterval: 0.1, target: self,
//                                                        selector:
//            #selector(self.onPlaybackTimeChecker), userInfo: nil, repeats: true)
//    }
//
//    func stopPlaybackTimeChecker() {
//        playbackTimeCheckerTimer?.invalidate()
//        playbackTimeCheckerTimer = nil
//    }
//
//    @objc func onPlaybackTimeChecker() {
//
//        guard let startTime = trim.startTime, let endTime = trim.endTime else {
//            return
//        }
//
//        let playBackTime = player!.currentTime()
//        trim.seek(to: playBackTime)
//
//        if playBackTime >= endTime {
//            player!.seek(to: startTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
//            trim.seek(to: startTime)
//        }
//    }
//}
//
//
//
//
//extension LitpicEditorView: TrimmerViewDelegate {
//    public func positionBarStoppedMoving(_ playerTime: CMTime) {
//        player?.seek(to: playerTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
//        player?.play()
//        startPlaybackTimeChecker()
//    }
//
//    public func didChangePositionBar(_ playerTime: CMTime) {
//        stopPlaybackTimeChecker()
//        player?.pause()
//        player?.seek(to: playerTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
//        let duration = (trim.endTime! - trim.startTime!).seconds
//        print(duration)
//        self.totalHours?.text = "Total : \( duration.rounded())"
//    }
//
//

//
//extension AVAsset {
//    var g_size: CGSize {
//        return tracks(withMediaType: AVMediaType.video).first?.naturalSize ?? .zero
//    }
//
//    var g_orientation: UIInterfaceOrientation {
//        if self.g_size.height > self.g_size.width {
//            return .portrait
//        }else{
//            return .landscapeLeft
//        }
//    }
//}
//
//
//class VideoCell: UICollectionViewCell {
//
//    let videoView: UIView = {
//        let view = UIView()
//        view.translatesAutoresizingMaskIntoConstraints = false
//        return view
//    }()
//
//    var thumbImage:UIImageView?
//
//
//    override init(frame: CGRect) {
//        super.init(frame: frame)
//        addViews()
//    }
//
//    func addViews(){
//        addSubview(videoView)
//        NSLayoutConstraint.activate([
//            videoView.leftAnchor.constraint(equalTo: self.leftAnchor),
//            videoView.rightAnchor.constraint(equalTo: self.rightAnchor),
//            videoView.topAnchor.constraint(equalTo: self.topAnchor),
//            videoView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
//        ])
//
//        thumbImage = UIImageView.init()
//        thumbImage?.frame = CGRect.init(x: 0, y: 0, width: self.frame.size.width, height: self.frame.size.height)
//        videoView.addSubview(thumbImage!)
//    }
//
//    required init?(coder aDecoder: NSCoder) {
//        fatalError("init(coder:) has not been implemented")
//
//    }
//
//
//}
//
//extension UIView {
//
//    func aspectRation(_ ratio: CGFloat) -> NSLayoutConstraint {
//
//        return NSLayoutConstraint(item: self, attribute: .height, relatedBy: .equal, toItem: self, attribute: .width, multiplier: ratio, constant: 0)
//    }
//}
