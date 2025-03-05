// MusicService.jsx
import React, {
    createContext,
    useContext,
    useRef,
    useState,
    useEffect,
    useCallback,
  } from 'react';
  
  // 1) Import jsmediatags
  import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

  // Our context
  const MusicServiceContext = createContext(null);
  
  // Custom hook
  export function useMusicService() {
    return useContext(MusicServiceContext);
  }
  
  export function MusicServiceProvider({ children }) {
    // We'll store the loaded list of MP3 "entries" from a JSON. 
    // Example JSON structure below (see "musicList.json" example).
    const [musicList, setMusicList] = useState([]);
  
    // The <audio> element reference
    const audioRef = useRef(new Audio());
  
    // Current track index in the list
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Global states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
  
    // Info extracted from the track (via ID3 or fallback)
    const [trackInfo, setTrackInfo] = useState({
      title: '',
      artist: '',
      albumArt: '',
    });
  
    /**
     * 1) Fetch musicList.json on mount
     *    Put "musicList.json" in "public/Music/musicList.json" for example
     */
    useEffect(() => {
      fetch('WebintoshHD/Music/musicList.json')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch musicList.json');
          }
          return res.json();
        })
        .then((data) => {
          setMusicList(data);
          // Optionally, load the first track right away:
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
  
    // Basic playback control
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
     * 3) loadTrackByIndex – loads the mp3 from musicList[index].
     *    Then we read ID3 tags with jsmediatags to extract album art.
     */
    const loadTrackByIndex = useCallback(
      async (index) => {
        if (!musicList || musicList.length === 0) return;
        if (index < 0 || index >= musicList.length) return;
  
        const trackData = musicList[index];
        const mp3Url = trackData.src;  // e.g. "/Music/Jungle - Busy Earnin'.mp3"
  
        // Stop/pause the current track, reset current time
        pause();
        setCurrentTime(0);
  
        // Set new audio src
        audioRef.current.src = mp3Url;
        audioRef.current.load();
  
        // We'll set a default trackInfo in case ID3 fails or has no data
        setTrackInfo({
          title: trackData.title || '',
          artist: trackData.artist || '',
          albumArt: '',
        });
  
        // Attempt to parse ID3 tags from the URL using jsmediatags
        // This might fail if there's no ID3, or if there's a CORS issue
        try {
          jsmediatags.read(mp3Url, {
            onSuccess: (tag) => {
              const { title, artist } = tag.tags;
              let albumArtUrl = '';
  
              // If there's embedded picture data, convert it to base64
              if (tag.tags.picture) {
                const { data, format } = tag.tags.picture;
                let base64String = '';
                // data is an array of bytes
                for (let i = 0; i < data.length; i++) {
                  base64String += String.fromCharCode(data[i]);
                }
                albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
              }
  
              // Update our trackInfo with ID3 data
              setTrackInfo({
                title: title || trackData.title || '',
                artist: artist || trackData.artist || '',
                albumArt: albumArtUrl,
              });
            },
            onError: (error) => {
              console.warn('jsmediatags error:', error.type, error.info);
            },
          });
        } catch (err) {
          console.warn('ID3 read error:', err);
        }
  
        setCurrentIndex(index);
      },
      [musicList, pause]
    );
  
    // Next / Prev
    const handleNext = useCallback(() => {
      if (!musicList || musicList.length === 0) return;
      let newIndex = currentIndex + 1;
      if (newIndex >= musicList.length) {
        newIndex = 0; // wrap to first
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
  
    // Toggle play – if none loaded yet, load the first track
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
  
    // Provide everything in context
    const contextValue = {
      // states
      isPlaying,
      currentTime,
      duration,
      trackInfo,
      currentIndex,
      musicList,
      audioRef,
  
      // actions
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
  