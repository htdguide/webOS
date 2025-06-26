// src/hooks/useDock/useDock.jsx

import { useContext, useState, useRef, useEffect } from 'react';
import { useStateManager } from '../../stores/StateManager/StateManager';

export function useDock({
  AppsContext,
  DOCK_CONFIG,
  useDeviceInfo,
  useLogger,
}) {
  // --- Logger
  const { log, enabled } = useLogger('Dock');

  // --- Device info
  const deviceInfo = useDeviceInfo();
  const isPortrait = deviceInfo.orientation === 'portrait';
  if (enabled) log('render', `Device orientation: ${deviceInfo.orientation}`);

  // --- State manager (persistent settings)
  const { state: managerState } = useStateManager();
  const dockState = managerState.groups.dock || {};

  // --- Compute config by merging static + overrides
  let config = { ...DOCK_CONFIG };

  // parse & override from state.groups.dock
  const override = {};
  if (dockState.ICON_SIZE != null) {
    const n = parseInt(dockState.ICON_SIZE, 10);
    if (!isNaN(n)) override.ICON_SIZE = n;
  }
  if (dockState.ENABLE_MAGNIFICATION != null) {
    override.ENABLE_MAGNIFICATION = dockState.ENABLE_MAGNIFICATION === 'true';
  }
  if (dockState.MAX_SCALE != null) {
    const f = parseFloat(dockState.MAX_SCALE);
    if (!isNaN(f)) override.MAX_SCALE = f;
  }
  if (dockState.DOCK_POSITION) {
    override.DOCK_POSITION = dockState.DOCK_POSITION;
  }
  // apply overrides
  config = { ...config, ...override };

  // apply portrait / left / right overrides from the config object itself
  if (isPortrait && config.vertical) {
    if (enabled) log('config', 'Applying portrait vertical overrides');
    config = { ...config, ...config.vertical };
  } else if (config.DOCK_POSITION === 'left' && config.left) {
    if (enabled) log('config', 'Applying left-position overrides');
    config = { ...config, ...config.left };
  } else if (config.DOCK_POSITION === 'right' && config.right) {
    if (enabled) log('config', 'Applying right-position overrides');
    config = { ...config, ...config.right };
  }

  // --- Destructure everything except the raw transitions
  const {
    ICON_SIZE,
    ICON_MARGIN,
    ADDITIONAL_MARGIN,
    DOCK_SPREAD,
    MAX_SCALE,
    DOCK_POSITION,
    DOCK_MARGIN,
    DOTS_MARGIN_BOTTOM,
    APP_NAME_TOOLTIP_OFFSET,
    APP_NAME_BACKGROUND_PADDING,
    APP_NAME_FONT_SIZE,
    ICONS_PER_PAGE,
    // grab the original transition strings
    INITIAL_TRANSITION: originalInitTransition,
    NO_TRANSITION,
  } = config;

  // --- Override the easing on your initial transition to be "flattened"
  const FLATTENED_EASING = 'cubic-bezier(0.645, 0.1, 0.455, 1)';
  let INITIAL_TRANSITION = originalInitTransition;
  // if original is like "transform 150ms ease-out", extract the duration
  const durMatch = originalInitTransition.match(/(\d+ms)/);
  if (durMatch) {
    INITIAL_TRANSITION = `transform ${durMatch[1]} ${FLATTENED_EASING}`;
  }

  if (enabled) {
    log(
      'config',
      `Dock config: POSITION=${DOCK_POSITION}, ICON_SIZE=${ICON_SIZE}, ENABLE_MAGNIFICATION=${config.ENABLE_MAGNIFICATION}`
    );
    log(
      'config',
      `Using flattened easing: ${INITIAL_TRANSITION.replace(
        /transform\s+\d+ms\s*/,
        ''
      )}`
    );
  }

  // --- Dock visibility
  const { state } = useStateManager();
  const isDockVisible =
    state.groups.dock &&
    state.groups.dock.dockVisible === 'true';
  if (enabled) log('config', `Dock visibility: ${isDockVisible}`);

  // --- Layout orientation
  const isVerticalDock = DOCK_POSITION === 'left' || DOCK_POSITION === 'right';

  // --- Apps context
  const { apps, openedApps, setOpenedApps } = useContext(AppsContext);
  const baseDockApps = apps.filter((app) => app.indock);
  const extraOpenApps = apps.filter(
    (app) => !app.indock && openedApps.includes(app.id)
  );
  const dockApps = [
    ...baseDockApps.sort((a, b) => a.priority - b.priority),
    ...extraOpenApps,
  ];
  if (enabled) log('render', `Total dock apps: ${dockApps.length}`);

  // --- Pagination
  const iconsPerPage = isPortrait ? ICONS_PER_PAGE || 4 : dockApps.length;
  const paginationEnabled = isPortrait && dockApps.length > iconsPerPage;
  const totalPages = paginationEnabled
    ? Math.ceil(dockApps.length / iconsPerPage)
    : 1;

  // Use an internal setter so we can wrap it
  const [currentPage, _setCurrentPage] = useState(0);

  useEffect(() => {
    if (enabled && paginationEnabled) {
      log(
        'layout',
        `Pagination: pages=${totalPages}, currentPage=${currentPage}`
      );
    }
  }, [currentPage, paginationEnabled, totalPages, enabled, log]);

  const appsToRender = paginationEnabled
    ? dockApps.slice(
        currentPage * iconsPerPage,
        (currentPage + 1) * iconsPerPage
      )
    : dockApps;

  // --- Refs & local state
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);
  const initialTransitionTimeoutRef = useRef(null);
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const [shouldTransition, setShouldTransition] = useState(true);
  const [hoveredApp, setHoveredApp] = useState(null);
  const [activeApp, setActiveApp] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  // -----------------------------------------------------
  // NEW: paged transition helper: shrink old → switch → grow new
  // -----------------------------------------------------
  const changePage = (newPage) => {
    if (!paginationEnabled || newPage === currentPage) return;
    if (enabled) log('layout', `Animating page change to ${newPage}`);

    setShouldTransition(true);

    // 1) Shrink outgoing icons to 0
    const shrinkScales = [...scales];
    const startIdx = currentPage * iconsPerPage;
    const count = Math.min(iconsPerPage, dockApps.length - startIdx);
    for (let i = 0; i < count; i++) {
      shrinkScales[startIdx + i] = 0;
    }
    setScales(shrinkScales);

    // 2) After shrink (~150ms), switch pages & prep incoming icons at 0
    setTimeout(() => {
      _setCurrentPage(newPage);

      const prepScales = [...shrinkScales];
      const newStart = newPage * iconsPerPage;
      const newCount = Math.min(iconsPerPage, dockApps.length - newStart);
      for (let i = 0; i < newCount; i++) {
        prepScales[newStart + i] = 0;
      }
      setScales(prepScales);

      // 3) After a brief pause, grow incoming icons to 1
      setTimeout(() => {
        const growScales = [...prepScales];
        for (let i = 0; i < newCount; i++) {
          growScales[newStart + i] = 1;
        }
        setScales(growScales);
      }, 50);
    }, parseInt(durMatch ? durMatch[1] : '150', 10));
  };

  // --- Touch handlers
  const handleTouchStart = (e) => {
    const x = e.touches[0].clientX;
    if (enabled) log('userInteraction', `Touch start x=${x}`);
    setTouchStartX(x);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const x2 = e.changedTouches[0].clientX;
    const delta = x2 - touchStartX;
    const threshold = 50;

    if (delta < -threshold && currentPage < totalPages - 1) {
      changePage(currentPage + 1);
    } else if (delta > threshold && currentPage > 0) {
      changePage(currentPage - 1);
    }
    setTouchStartX(null);
  };

  // --- Mouse handlers
  const handleMouseEnter = () => {
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    setShouldTransition(true);
    initialTransitionTimeoutRef.current = setTimeout(() => {
      setShouldTransition(false);
      if (enabled) log('layout', 'Initial transition end; disabling transition');
    }, parseInt(durMatch ? durMatch[1] : '150', 10));
    if (enabled) log('userInteraction', 'Mouse entered dock area');
  };
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    const rect = iconsContainerRef.current.getBoundingClientRect();
    const pos = isVerticalDock
      ? e.clientY - rect.top
      : e.clientX - rect.left;
    if (enabled) log('userInteraction', `Mouse move pos=${pos}`);

    if (!config.ENABLE_MAGNIFICATION) {
      // reset scales
      if (paginationEnabled) {
        const reset = [...scales];
        const start = currentPage * iconsPerPage;
        for (let i = 0; i < appsToRender.length; i++) {
          reset[start + i] = 1;
        }
        setScales(reset);
        if (enabled) log('layout', 'Magnification off; reset page scales');
      } else {
        setScales(dockApps.map(() => 1));
        if (enabled) log('layout', 'Magnification off; reset all scales');
      }
      return;
    }

    // magnification on …
    if (paginationEnabled) {
      const updated = [...scales];
      const start = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        const center =
          ICON_MARGIN + ICON_SIZE / 2 + i * (ICON_SIZE + 2 * ICON_MARGIN);
        const dist = Math.abs(pos - center);
        const scale =
          dist > DOCK_SPREAD
            ? 1
            : 1 + (MAX_SCALE - 1) * (1 - dist / DOCK_SPREAD);
        updated[start + i] = scale;
      }
      setScales(updated);
      if (enabled) {
        log(
          'layout',
          `Updated page scales [${updated
            .slice(start, start + appsToRender.length)
            .map((s) => s.toFixed(2))
            .join(', ')}]`
        );
      }
    } else {
      const updated = dockApps.map((_, idx) => {
        const center =
          ICON_MARGIN + ICON_SIZE / 2 + idx * (ICON_SIZE + 2 * ICON_MARGIN);
        const dist = Math.abs(pos - center);
        return dist > DOCK_SPREAD
          ? 1
          : 1 + (MAX_SCALE - 1) * (1 - dist / DOCK_SPREAD);
      });
      setScales(updated);
      if (enabled) {
        log(
          'layout',
          `Updated all scales [${updated.map((s) => s.toFixed(2)).join(', ')}]`
        );
      }
    }
  };
  const handleMouseLeave = () => {
    if (paginationEnabled) {
      const reset = [...scales];
      const start = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        reset[start + i] = 1;
      }
      setScales(reset);
      if (enabled) log('layout', `Mouse left; reset page ${currentPage} scales`);
    } else {
      setScales(dockApps.map(() => 1));
      if (enabled) log('layout', 'Mouse left; reset all scales');
    }
    setShouldTransition(true);
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    if (enabled) log('userInteraction', 'Mouse left dock area');
  };

  // --- Position & bounds helpers
  const computeIconPositions = () => {
    const centers = [];
    let pos = 0;
    const visScales = paginationEnabled
      ? scales.slice(currentPage * iconsPerPage, currentPage * iconsPerPage + appsToRender.length)
      : scales;

    for (let i = 0; i < appsToRender.length; i++) {
      const dyn = ICON_MARGIN + (visScales[i] - 1) * ADDITIONAL_MARGIN;
      if (i === 0) {
        pos = dyn;
      } else {
        const prevDyn = ICON_MARGIN + (visScales[i - 1] - 1) * ADDITIONAL_MARGIN;
        pos += ICON_SIZE + prevDyn + dyn;
      }
      centers.push(pos + ICON_SIZE / 2);
    }

    const lastDyn = appsToRender.length
      ? ICON_MARGIN + (visScales[appsToRender.length - 1] - 1) * ADDITIONAL_MARGIN
      : 0;
    const containerDimension = appsToRender.length
      ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDyn
      : 0;

    if (enabled) {
      log('layout', `Icon centers=[${centers.join(', ')}], dimension=${containerDimension}`);
    }
    return { centers, containerDimension };
  };

  const computeBackgroundBounds = () => {
    if (!appsToRender.length) {
      if (enabled) log('layout', 'No apps → empty background');
      return { start: 0, size: 0 };
    }
    const { centers } = computeIconPositions();
    let min = Infinity, max = -Infinity;
    const visScales = paginationEnabled
      ? scales.slice(currentPage * iconsPerPage, currentPage * iconsPerPage + appsToRender.length)
      : scales;

    appsToRender.forEach((_, i) => {
      const start = centers[i] - (ICON_SIZE / 2) * visScales[i];
      const end = centers[i] + (ICON_SIZE / 2) * visScales[i];
      min = Math.min(min, start);
      max = Math.max(max, end);
    });

    const size = max - min;
    if (enabled) log('layout', `Background bounds start=${min}, size=${size}`);
    return { start: min, size };
  };

  // --- openApp & hover
  const openApp = (app) => {
    setActiveApp(app.id);
    if (enabled) log('userInteraction', `Opening/focusing app: ${app.id}`);
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
      if (enabled) log('behavior', `Opened external link: ${app.id}`);
    } else {
      setOpenedApps((prev) => {
        if (!prev.includes(app.id)) {
          if (enabled) log('behavior', `Adding to openedApps: ${app.id}`);
          return [...prev, app.id];
        } else {
          if (enabled) log('behavior', `Focusing already-open: ${app.id}`);
          return prev;
        }
      });
    }
  };

  const handleIconMouseEnter = (appId) => {
    setHoveredApp(appId);
  };
  const handleIconMouseLeave = () => {
    setHoveredApp(null);
  };

  // --- Final computed values
  const { containerDimension } = computeIconPositions();
  const { start: bgStart, size: bgSize } = computeBackgroundBounds();

  return {
    outerRef,
    iconsContainerRef,
    isDockVisible,
    paginationEnabled,
    isVerticalDock,
    appsToRender,
    scales,
    shouldTransition,
    hoveredApp,
    activeApp,
    openedApps,
    currentPage,
    totalPages,
    iconsPerPage,
    containerDimension,
    bgStart,
    bgSize,
    DOCK_POSITION,
    DOCK_MARGIN,
    DOTS_MARGIN_BOTTOM,
    APP_NAME_TOOLTIP_OFFSET,
    APP_NAME_BACKGROUND_PADDING,
    APP_NAME_FONT_SIZE,
    ICON_SIZE,
    ICON_MARGIN,
    ADDITIONAL_MARGIN,
    INITIAL_TRANSITION, // now with flattened easing
    NO_TRANSITION,
    handleTouchStart,
    handleTouchEnd,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    openApp,
    handleIconMouseEnter,
    handleIconMouseLeave,
    // expose our paged transition changer
    setCurrentPage: changePage,
  };
}
