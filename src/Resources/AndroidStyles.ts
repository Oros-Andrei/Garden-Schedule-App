// Keep touch and safe-area adjustments exclusive to the Android app shell.
export const androidStyles = `
  .android-app { min-height: 100dvh !important; padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
  /* Suppress the WebView's blue tap flash across Android controls and calendar cells. */
  .android-app, .android-app * { -webkit-tap-highlight-color: transparent; }
  .android-app button { touch-action: manipulation; }
  @media (max-width: 799px) {
    .android-app .garden-header { padding: 18px 12px 12px !important; }
    .android-app .garden-layout { padding: 0 10px max(104px, calc(env(safe-area-inset-bottom) + 96px)) !important; max-width: none !important; }
    .android-app .garden-plant-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; }
    /* Separate the Garden app menu from the first category on the Android home screen. */
    .android-app .garden-menu-row { position: sticky; top: 0; z-index: 5; padding-bottom: 16px; background: #EDF6E8; }
    .android-app .garden-layout.has-selection .garden-sidebar { display: none !important; }
    .android-app .garden-layout.has-selection .garden-detail { width: auto; margin: 12px 10px 24px !important; }
    .android-app .garden-detail { margin: 12px 10px 24px !important; }
    /* Let the active Android tab scroll above the safe-area-aware arch dock. */
    .android-app .garden-layout.android-calendar-active .garden-sidebar,
    .android-app .garden-layout.android-calendar-active .garden-detail { display: none !important; }
    .android-app .android-bottom-tabs {
      position: fixed; left: 0; right: 0; bottom: env(safe-area-inset-bottom); z-index: 100;
      box-sizing: border-box; height: 76px;
      display: flex; align-items: flex-start; justify-content: center; gap: 24px; padding: 16px 16px 10px;
      pointer-events: none;
    }
    /* Keep the arch short and flat so the tab buttons can overlap its upper edge. */
    .android-app .android-bottom-tabs::before {
      content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
      background: rgba(250, 253, 248, 0.96);
      clip-path: ellipse(85% 75% at 50% 100%);
      filter: drop-shadow(0 -4px 8px rgba(35, 65, 25, 0.22));
    }
    /* Lift the round buttons slightly above the arch while keeping them tappable. */
    .android-app .android-bottom-tabs > button { position: relative; z-index: 1; pointer-events: auto; transform: translateY(-16px); }
    /* Replace the blue WebView tap flash with garden-colored keyboard focus. */
    .android-app .android-bottom-tabs button { -webkit-tap-highlight-color: transparent; }
    .android-app .android-bottom-tabs button:focus:not(:focus-visible) { outline: none; }
    .android-app .android-bottom-tabs button:focus-visible { outline: 2px solid #4A8C3A; outline-offset: 2px; }
    /* Reserve a right-side stack for the close control and plant actions. */
    .android-app .plant-profile-header { padding-right: 112px !important; }
    .android-app .plant-profile-close {
      width: 28px !important; height: 28px !important; top: 6px !important; right: 6px !important;
      font-size: 16px !important;
    }
    .android-app .plant-profile-actions { position: absolute !important; top: 40px; right: 6px; z-index: 10; }
    /* Fit seven calendar columns on phones and replace clipped event labels with markers. */
    .android-app .garden-calendar { padding: 12px !important; border-radius: 18px !important; box-shadow: 0 4px 16px rgba(35,65,25,0.1); }
    .android-app .garden-calendar-grid { --garden-calendar-row-height: 64px; gap: 4px !important; }
    .android-app .garden-calendar-weekday { padding: 5px 0 !important; font-size: 10px !important; background: #EAF2E5 !important; }
    .android-app .garden-calendar-cell { padding: 3px !important; border-radius: 10px !important; }
    .android-app .garden-calendar-event-label,
    .android-app .garden-calendar-event-overflow { display: none !important; }
    .android-app .garden-calendar-event-markers { display: flex !important; align-items: center; gap: 4px; min-height: 11px; margin-top: 5px; }
    .android-app .garden-calendar-event-dot-grid { display: grid; grid-template-columns: repeat(3, 5px); grid-template-rows: repeat(2, 5px); gap: 1px 2px; }
    .android-app .garden-calendar-event-dot { width: 5px; height: 5px; flex: 0 0 5px; border-radius: 50%; }
    .android-app .garden-calendar-event-count { color: #53684B; font-size: 9px; line-height: 1; }
    .android-app .calendar-cell-actions { display: none !important; }
    .android-app .calendar-selected-actions {
      display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 8px;
      margin-top: 9px; padding: 9px 10px; border: 1px solid #DCE9D3; border-radius: 12px; background: #EEF5E9;
    }
    /* Stack each profile tab icon above its label to prevent narrow labels from wrapping. */
    .android-app .plant-profile-tabs { min-height: 58px; }
    .android-app .plant-profile-tabs .plant-profile-tab {
      display: flex !important; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; padding: 6px 1px !important; font-size: 11px !important;
    }
    .android-app .plant-profile-tab-icon { font-size: 16px; line-height: 1; }
    .android-app .plant-profile-tab-label { font-size: 10px; line-height: 1.1; white-space: nowrap; }
  }
`;
