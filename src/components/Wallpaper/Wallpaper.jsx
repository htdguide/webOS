import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';
import { FocusWrapper } from '../../interactions/FocusControl/FocusControl.jsx';

const Wallpaper = forwardRef((props, ref) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const segmentTimer = useRef(null);
  // Prevent overlapping segment triggers
  const segmentInProgress = useRef(false);

  // Configurable parameters:
  const speedUpDuration = 1; // seconds: video speeds up from 0 to 1
  const normalDuration = 4;  // seconds: video plays at normal speed (1×)
  const slowDownDuration = 1; // seconds: video slows down from 1 to 0
  const segmentDuration = speedUpDuration + normalDuration + slowDownDuration; // Total segment duration (default: 10 seconds)

  // Function to trigger a segment: speed-up, normal playback, and then slow-down.
  const playSegment = () => {
    if (!videoRef.current || segmentInProgress.current) return;
    segmentInProgress.current = true;

    // Start playing from current position.
    videoRef.current.play().catch((err) => {
      console.error('Error playing video:', err);
    });

    const startTime = Date.now();

    // Clear any existing timer.
    if (segmentTimer.current) {
      clearInterval(segmentTimer.current);
    }

    segmentTimer.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed < speedUpDuration) {
        // Speed Up Phase: Increase playback rate linearly from 0 to 1.
        const t = elapsed / speedUpDuration;
        videoRef.current.playbackRate = t;
      } else if (elapsed < speedUpDuration + normalDuration) {
        // Normal Playback Phase: Maintain a playback rate of 1.
        videoRef.current.playbackRate = 1;
      } else if (elapsed < segmentDuration) {
        // Slow Down Phase: Decrease playback rate linearly from 1 to 0.
        const slowdownElapsed = elapsed - (speedUpDuration + normalDuration);
        videoRef.current.playbackRate = 1 * (1 - slowdownElapsed / slowDownDuration);
      } else {
        // End of the segment: pause the video and reset the playback rate.
        videoRef.current.playbackRate = 0;
        videoRef.current.pause();
        clearInterval(segmentTimer.current);
        segmentTimer.current = null;
        segmentInProgress.current = false;
      }
    }, 100); // update every 100ms
  };

  // Expose playSegment so that parent components can trigger the next segment.
  useImperativeHandle(ref, () => ({
    playSegment,
  }));

  // Automatically trigger the initial segment once the video is loaded.
  useEffect(() => {
    if (isVideoLoaded) {
      playSegment();
    }
    // Cleanup on unmount.
    return () => {
      if (segmentTimer.current) {
        clearInterval(segmentTimer.current);
      }
    };
  }, [isVideoLoaded]);

  return (
    <FocusWrapper name="Wallpaper">
      <div className="wallpaper">
        {/* Static image (fallback) */}
        <img
          className="wallpaper-fallback"
          src={SequoiaSunriseImage}
          alt="Wallpaper Fallback"
        />

        {/* Background video */}
        <video
          ref={videoRef}
          className="wallpaper-video"
          muted
          loop={false}
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={(e) => console.error('Video failed to load:', e)}
        >
          <source
            src="/WebintoshHD/Wallpapers/SequoiaSunrise.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </FocusWrapper>
  );
});

export default Wallpaper;
