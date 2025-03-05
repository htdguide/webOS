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

  // This effect syncs volume → gain node whenever volume changes
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
        // Optionally auto-load first track: loadTrackByIndex(0);
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

      // Immediately set the gain to the default volume so there's no mismatch
      const fraction = volume / 100;
      const exponented = Math.pow(fraction, musicServiceConfig.VOLUME_EXPONENT);
      gainNodeRef.current.gain.setValueAtTime(exponented, 0);
    }
    // If context is suspended, try to resume
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch((err) => {
        console.warn('AudioContext resume error:', err);
      });
    }
  }, [volume]);

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

      // Next, fetch the MP3 as an ArrayBuffer
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

      // Reset playback so we’re not playing the old track
      stop();

      // Store the newly loaded AudioBuffer
      sourceNodeRef.current = { audioBuffer };

      // Update currentIndex
      setCurrentIndex(index);
    },
    [musicList, ensureAudioContext]
  );

  /**
   * 9) Next / Prev must be declared before referencing them inside "play()"
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
  }, [currentIndex, musicList, loadTrackByIndex]);

  const handlePrev = useCallback(() => {
    if (!musicList.length) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = musicList.length - 1;
    }
    loadTrackByIndex(newIndex).then(() => {
      play();
    });
  }, [currentIndex, musicList, loadTrackByIndex]);

  /**
   * 10) Basic playback functions
   */
  const play = useCallback(() => {
    ensureAudioContext(); // make sure we have an AudioContext

    // If we don’t have a loaded AudioBuffer, load the first track
    if (!sourceNodeRef.current || !sourceNodeRef.current.audioBuffer) {
      if (musicList.length > 0) {
        loadTrackByIndex(0).then(() => {
          play();
        });
      }
      return;
    }

    // If we’re already playing, ignore
    if (isPlaying) return;

    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = sourceNodeRef.current.audioBuffer;
    newSource.connect(gainNodeRef.current);

    // Start at the pausedAtRef offset
    const offset = pausedAtRef.current;
    newSource.start(0, offset);

    // Keep reference so we can stop it
    sourceNodeRef.current.bufferSource = newSource;

    // On ended, move to next track
    newSource.onended = () => {
      const total = sourceNodeRef.current?.audioBuffer?.duration || 0;
      const diff = Math.abs(currentTime - total);
      if (diff < 0.5) {
        handleNext();
      }
    };

    // Mark the startTimestamp
    startTimestampRef.current = performance.now();
    setIsPlaying(true);
  }, [isPlaying, loadTrackByIndex, musicList.length, ensureAudioContext, currentTime, handleNext]);

  const pause = useCallback(() => {
    if (!sourceNodeRef.current?.bufferSource) return;
    if (!isPlaying) return;

    // How long we’ve played so far
    const playedSoFar =
      pausedAtRef.current + (performance.now() - startTimestampRef.current) / 1000;
    pausedAtRef.current = playedSoFar;

    // Stop the current source
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
   * 11) Seek function that doesn't explicitly pause
   */
  const seek = useCallback(
    (timeInSeconds) => {
      if (!sourceNodeRef.current?.audioBuffer) {
        pausedAtRef.current = timeInSeconds;
        setCurrentTime(timeInSeconds);
        return;
      }

      // Stop old source if it exists
      if (sourceNodeRef.current.bufferSource) {
        sourceNodeRef.current.bufferSource.stop();
        sourceNodeRef.current.bufferSource = null;
      }

      pausedAtRef.current = timeInSeconds;
      setCurrentTime(timeInSeconds);

      // If we’re still playing, create a new source at the new offset
      if (isPlaying) {
        const newSource = audioContextRef.current.createBufferSource();
        newSource.buffer = sourceNodeRef.current.audioBuffer;
        newSource.connect(gainNodeRef.current);
        newSource.start(0, timeInSeconds);

        sourceNodeRef.current.bufferSource = newSource;

        // Handle end of track
        newSource.onended = () => {
          const total = sourceNodeRef.current?.audioBuffer?.duration || 0;
          const diff = Math.abs(currentTime - total);
          if (diff < 0.5) {
            handleNext();
          }
        };

        // Reset startTimestamp for time tracking
        startTimestampRef.current = performance.now();
      }
    },
    [isPlaying, currentTime, handleNext]
  );

  /**
   * 12) Toggle Play/Pause
   */
  const togglePlay = useCallback(() => {
    // If no track is loaded, load the first
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
   * 13) Track currentTime in a requestAnimationFrame
   */
  useEffect(() => {
    let animationFrameId;

    const updateTime = () => {
      if (isPlaying) {
        const playedSoFar =
          pausedAtRef.current + (performance.now() - startTimestampRef.current) / 1000;
        setCurrentTime(playedSoFar);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

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
