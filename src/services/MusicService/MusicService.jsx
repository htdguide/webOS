// MusicService.jsx
import React, {
    createContext,
    useContext,
    useRef,
    useState,
    useEffect,
    useCallback,
  } from 'react';
  
  // Import jsmediatags from the UMD build to avoid Vite dep-scan issues
  import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
  
  // Import our config
  import musicServiceConfig from '../../configs/MusicServiceConfig/MusicServiceConfig';
  
  // Create the context
  const MusicServiceContext = createContext(null);
  
  // Custom hook
  export function useMusicService() {
    return useContext(MusicServiceContext);
  }
  
  export function MusicServiceProvider({ children }) {
    // We'll store the loaded list of MP3 "entries" from the JSON.
    const [musicList, setMusicList] = useState([]);
  
    // The <audio> element reference
    const audioRef = useRef(new Audio());
  
    // Current track index in the list
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Audio states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
  
    // ID3 / track info
    const [trackInfo, setTrackInfo] = useState({
      title: '',
      artist: '',
      albumArt: '',
    });
  
    /**
     * Volume state (0–100). We use DEFAULT_VOLUME from config
     */
    const [volume, setVolume] = useState(musicServiceConfig.DEFAULT_VOLUME);
  
    /**
     * Keep <audio> volume in sync with the volume state.
     * We apply an exponent from config (e.g. 2) so that volume changes
     * feel more uniform across the slider’s 0–100 range.
     */
    useEffect(() => {
      const fraction = volume / 100;
      audioRef.current.volume = Math.pow(fraction, musicServiceConfig.VOLUME_EXPONENT);
    }, [volume]);
  
    /**
     * 1) Fetch the JSON from the MUSIC_LIST_URL in the config
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
          // Optionally load the first track automatically:
          // loadTrackByIndex(0);
        })
        .catch((err) => {
          console.error('Error loading music list:', err);
        });
    }, []);
  
    /**
     * 2) Audio event listeners
     */
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
  
      const onLoadedMetadata = () => {
        setDuration(Math.floor(audio.duration) || 0);
      };
      const onTimeUpdate = () => {
        setCurrentTime(Math.floor(audio.currentTime) || 0);
      };
      const onEnded = () => {
        handleNext();
      };
  
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
  
      return () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
      };
    }, []);
  
    // Basic controls
    const play = useCallback(() => {
      audioRef.current.play();
      setIsPlaying(true);
    }, []);
  
    const pause = useCallback(() => {
      audioRef.current.pause();
      setIsPlaying(false);
    }, []);
  
    const stop = useCallback(() => {
      pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }, [pause]);
  
    const seek = useCallback((timeInSeconds) => {
      audioRef.current.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }, []);
  
    /**
     * 3) loadTrackByIndex – loads the MP3 from musicList[index].
     *    Then uses jsmediatags to read ID3 (album art, etc.).
     *    If no embedded art or an error occurs, fallback to JSON's "backupArt".
     */
    const loadTrackByIndex = useCallback(
      async (index) => {
        if (!musicList || musicList.length === 0) return;
        if (index < 0 || index >= musicList.length) return;
  
        const trackData = musicList[index];
        // e.g. "/WebintoshHD/Music/Jungle - Busy Earnin'.mp3"
        const mp3Url = trackData.src;
  
        // Pause & reset time
        pause();
        setCurrentTime(0);
  
        // Set the new audio source
        audioRef.current.src = mp3Url;
        audioRef.current.load();
  
        // Default track info if ID3 fails
        setTrackInfo({
          title: trackData.title || '',
          artist: trackData.artist || '',
          // We'll store the fallback image in case ID3 has none
          albumArt: trackData.backupArt || '',
        });
  
        // Try reading ID3 tags
        try {
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
  
              // If no embedded picture, fallback to backupArt
              if (!albumArtUrl && trackData.backupArt) {
                albumArtUrl = trackData.backupArt;
              }
  
              // Update track info with ID3 or fallback
              setTrackInfo({
                title: title || trackData.title || '',
                artist: artist || trackData.artist || '',
                albumArt: albumArtUrl,
              });
            },
            onError: (error) => {
              console.warn('jsmediatags error:', error.type, error.info);
              // Use fallback if we get an error
              setTrackInfo({
                title: trackData.title || '',
                artist: trackData.artist || '',
                albumArt: trackData.backupArt || '',
              });
            },
          });
        } catch (err) {
          console.warn('ID3 read error:', err);
          // Also fallback on a general try/catch error
          setTrackInfo((prev) => ({
            ...prev,
            albumArt: trackData.backupArt || '',
          }));
        }
  
        setCurrentIndex(index);
      },
      [musicList, pause]
    );
  
    // Next / Prev track
    const handleNext = useCallback(() => {
      if (!musicList || musicList.length === 0) return;
      let newIndex = currentIndex + 1;
      if (newIndex >= musicList.length) {
        newIndex = 0; // wrap around
      }
      loadTrackByIndex(newIndex);
      play();
    }, [musicList, currentIndex, loadTrackByIndex, play]);
  
    const handlePrev = useCallback(() => {
      if (!musicList || musicList.length === 0) return;
      let newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = musicList.length - 1;
      }
      loadTrackByIndex(newIndex);
      play();
    }, [musicList, currentIndex, loadTrackByIndex, play]);
  
    // Toggle play. If nothing loaded, load first
    const togglePlay = useCallback(() => {
      if (!audioRef.current.src) {
        if (musicList && musicList.length > 0) {
          loadTrackByIndex(0);
          play();
        }
        return;
      }
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }, [isPlaying, musicList, loadTrackByIndex, play, pause]);
  
    // Provide everything via context
    const contextValue = {
      // states
      isPlaying,
      currentTime,
      duration,
      trackInfo,
      currentIndex,
      musicList,
      audioRef,
      volume,
  
      // actions
      setVolume,
      play,
      pause,
      stop,
      seek,
      loadTrackByIndex,
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
  