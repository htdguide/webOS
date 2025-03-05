// MusicService.jsx
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';

// We can still use jsmediatags for ID3. The UMD build is used to avoid Vite dep-scan issues.
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

// Import your config
import musicServiceConfig from '../../configs/MusicServiceConfig/MusicServiceConfig';

/**
 * Create the Context
 */
const MusicServiceContext = createContext(null);

/**
 * Custom hook to consume context
 */
export function useMusicService() {
  return useContext(MusicServiceContext);
}

/**
 * MusicServiceProvider that wraps the entire music service logic with Web Audio
 */
export function MusicServiceProvider({ children }) {
  /**
   * 1) States for the track list, current index, etc.
   */
  const [musicList, setMusicList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ID3 / track info
  const [trackInfo, setTrackInfo] = useState({
    title: '',
    artist: '',
    albumArt: '',
  });

  /**
   * 2) Web Audio references:
   *    - audioContext: must be created lazily, or iOS will block it until user gesture
   *    - gainNode: used to set volume
   *    - sourceNode: the currently playing AudioBufferSourceNode
   */
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  /**
   * 3) Playback state: isPlaying, currentTime, duration
   *    We’ll have to track these manually, since we no longer have <audio> events.
   */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /**
   * 4) We'll track a “startTimestamp” and “pausedAt” to simulate “currentTime”:
   *    - When we “play” from pausedAt=10s, we note the current clock time in startTimestamp
   *    - Each frame, currentTime = pausedAt + (performance.now() - startTimestamp)
   */
  const startTimestampRef = useRef(0);
  const pausedAtRef = useRef(0);

  /**
   * 5) Volume state (0-100). We’ll map it to gainNode.gain, applying an exponent if desired.
   */
  const [volume, setVolume] = useState(musicServiceConfig.DEFAULT_VOLUME);

  // This effect syncs volume → gain node
  useEffect(() => {
    if (gainNodeRef.current) {
      const fraction = volume / 100;
      const exponented = Math.pow(fraction, musicServiceConfig.VOLUME_EXPONENT); // e.g. fraction^2
      gainNodeRef.current.gain.setValueAtTime(exponented, 0);
    }
  }, [volume]);

  /**
   * 6) On mount, fetch the JSON music list from the config URL
   */
  useEffect(() => {
    fetch(musicServiceConfig.MUSIC_LIST_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch musicList.json');
        }
        return res.json();
      })
      .then((data) => {
        setMusicList(data);
        // Optionally auto-load first track
        // loadTrackByIndex(0);
      })
      .catch((err) => {
        console.error('Error loading music list:', err);
      });
  }, []);

  /**
   * 7) A function to “ensureAudioContext” which we call on the first user gesture
   *    iOS Safari typically requires audio context to be created/resumed in a user gesture.
   */
  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    // If context is suspended, try to resume (iOS might require it in a gesture)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch((err) => {
        console.warn('AudioContext resume error:', err);
      });
    }
  }, []);

  /**
   * 8) loadTrackByIndex: fetch/ decode the MP3 into an AudioBuffer, set ID3 tags, etc.
   */
  const loadTrackByIndex = useCallback(
    async (index) => {
      if (!musicList || !musicList.length) return;
      if (index < 0 || index >= musicList.length) return;

      // Make sure we have an AudioContext
      ensureAudioContext();

      const trackData = musicList[index];
      const mp3Url = trackData.src;

      // First, read ID3 tags from the URL:
      setTrackInfo({
        title: trackData.title || '',
        artist: trackData.artist || '',
        albumArt: trackData.backupArt || '',
      });

      try {
        // Attempt reading ID3 tags asynchronously:
        jsmediatags.read(mp3Url, {
          onSuccess: (tag) => {
            const { title, artist, picture } = tag.tags;
            let albumArtUrl = '';

            // If there's embedded picture data, convert to base64
            if (picture) {
              const { data, format } = picture;
              let base64String = '';
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
            }
            // Fallback to trackData.backupArt
            if (!albumArtUrl && trackData.backupArt) {
              albumArtUrl = trackData.backupArt;
            }

            setTrackInfo({
              title: title || trackData.title || '',
              artist: artist || trackData.artist || '',
              albumArt: albumArtUrl,
            });
          },
          onError: (error) => {
            console.warn('jsmediatags error:', error.type, error.info);
            // fallback to trackData data
            setTrackInfo({
              title: trackData.title || '',
              artist: trackData.artist || '',
              albumArt: trackData.backupArt || '',
            });
          },
        });
      } catch (err) {
        console.warn('ID3 read error:', err);
      }

      // Next, fetch the MP3 as an ArrayBuffer for decoding
      const response = await fetch(mp3Url);
      if (!response.ok) {
        console.error('Failed to fetch MP3:', mp3Url);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();

      // Decode using the AudioContext
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Once we have an AudioBuffer, set duration in seconds
      setDuration(audioBuffer.duration);

      // Reset any playback so it’s not playing old track
      stop();

      // We store the newly loaded AudioBuffer in a ref so that play() can use it
      sourceNodeRef.current = { audioBuffer };

      // Update currentIndex
      setCurrentIndex(index);
    },
    [musicList, ensureAudioContext]
  );

  /**
   * 9) Basic playback functions with Web Audio
   */
  const play = useCallback(() => {
    ensureAudioContext(); // make sure we have an AudioContext resumed

    // If we don’t have a loaded AudioBuffer, either do nothing or load the first
    if (!sourceNodeRef.current || !sourceNodeRef.current.audioBuffer) {
      // Optionally auto-load first:
      if (musicList.length > 0) {
        loadTrackByIndex(0).then(() => {
          // Then call play again
          play();
        });
      }
      return;
    }

    // If we’re already playing, ignore
    if (isPlaying) return;

    // Create a new BufferSource for each play
    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = sourceNodeRef.current.audioBuffer;
    newSource.connect(gainNodeRef.current);

    // Start at the pausedAtRef offset
    const offset = pausedAtRef.current;
    newSource.start(0, offset);

    // Keep reference so we can stop it
    sourceNodeRef.current.bufferSource = newSource;

    // On ended, move to next track (like <audio> “ended”)
    newSource.onended = () => {
      // If we intentionally stopped or paused, we might not want to “handleNext”
      // So only call handleNext if “currentTime” is at the end
      const total = sourceNodeRef.current?.audioBuffer?.duration || 0;
      const diff = Math.abs(currentTime - total);
      // If it truly ended, go next
      if (diff < 0.5) {
        handleNext();
      }
    };

    // Mark the startTimestamp so we can track currentTime
    startTimestampRef.current = performance.now();

    // Switch state
    setIsPlaying(true);
  }, [isPlaying, loadTrackByIndex, musicList.length, ensureAudioContext]);

  const pause = useCallback(() => {
    if (!sourceNodeRef.current?.bufferSource) return;
    if (!isPlaying) return;

    // We figure out how long we've played so far
    const playedSoFar = pausedAtRef.current + (performance.now() - startTimestampRef.current) / 1000;
    pausedAtRef.current = playedSoFar;

    // Stop the current source node
    sourceNodeRef.current.bufferSource.stop();
    sourceNodeRef.current.bufferSource = null;

    setIsPlaying(false);
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current?.bufferSource) {
      sourceNodeRef.current.bufferSource.stop();
      sourceNodeRef.current.bufferSource = null;
    }
    setIsPlaying(false);
    pausedAtRef.current = 0;
    setCurrentTime(0);
  }, []);

  /**
   * 10) Seek function
   *     - Stop the current source
   *     - Set pausedAt to new time
   *     - If was playing, call play() again
   */
  const seek = useCallback(
    (timeInSeconds) => {
      const wasPlaying = isPlaying;
      // Pause (which sets pausedAt correctly) if needed
      pause();
      // Then override pausedAt with our desired new time
      pausedAtRef.current = timeInSeconds;
      setCurrentTime(timeInSeconds);
      // If we were playing, resume
      if (wasPlaying) {
        play();
      }
    },
    [isPlaying, pause, play]
  );

  /**
   * 11) Next / Prev
   *     - Just load next index, then call play
   */
  const handleNext = useCallback(() => {
    if (!musicList.length) return;
    let newIndex = currentIndex + 1;
    if (newIndex >= musicList.length) {
      newIndex = 0; // wrap
    }
    loadTrackByIndex(newIndex).then(() => {
      play();
    });
  }, [currentIndex, musicList, loadTrackByIndex, play]);

  const handlePrev = useCallback(() => {
    if (!musicList.length) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = musicList.length - 1;
    }
    loadTrackByIndex(newIndex).then(() => {
      play();
    });
  }, [currentIndex, musicList, loadTrackByIndex, play]);

  /**
   * 12) Toggle Play/Pause
   */
  const togglePlay = useCallback(() => {
    // If no track is loaded yet, load the first
    if (!sourceNodeRef.current?.audioBuffer) {
      if (musicList.length > 0) {
        loadTrackByIndex(0).then(() => play());
      }
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, musicList, loadTrackByIndex, play, pause]);

  /**
   * 13) We must track “currentTime” in a requestAnimationFrame (like a “timeupdate”).
   *     Because with Web Audio, we manage playback logic ourselves.
   */
  useEffect(() => {
    let animationFrameId;

    const updateTime = () => {
      if (isPlaying) {
        // Calculate how much time has elapsed since we started
        const playedSoFar =
          pausedAtRef.current + (performance.now() - startTimestampRef.current) / 1000;
        setCurrentTime(playedSoFar);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    // Kick off
    updateTime();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  /**
   * 14) Expose everything via Context
   */
  const contextValue = {
    // states
    isPlaying,
    currentTime,
    duration,
    trackInfo,
    currentIndex,
    musicList,
    volume,

    // actions
    setVolume,
    loadTrackByIndex,
    play,
    pause,
    stop,
    seek,
    handleNext,
    handlePrev,
    togglePlay,
  };

  return (
    <MusicServiceContext.Provider value={contextValue}>
      {children}
    </MusicServiceContext.Provider>
  );
}
