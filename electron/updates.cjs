'use strict';

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

function createUpdateService({enabled, updater}) {
  let state = {status: enabled ? 'idle' : 'disabled'};
  if (!enabled) return {getState: () => state, start() {}};

  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;
  updater.allowPrerelease = false;
  updater.allowDowngrade = false;

  updater.on('checking-for-update', () => { state = {status: 'checking'}; });
  updater.on('update-not-available', () => { state = {status: 'current'}; });
  updater.on('update-available', ({version}) => {
    state = {status: 'downloading', version, percent: 0};
  });
  updater.on('download-progress', ({percent}) => {
    if (state.status === 'downloading') {
      state = {...state, percent: Math.min(100, Math.max(0, Math.round(percent)))};
    }
  });
  updater.on('update-downloaded', ({version}) => {
    state = {status: 'ready', version};
  });
  updater.on('error', () => { state = {status: 'error'}; });

  async function check() {
    if (['checking', 'downloading', 'ready'].includes(state.status)) return;
    state = {status: 'checking'};
    try {
      await updater.checkForUpdates();
    } catch {
      state = {status: 'error'};
    }
  }

  return {
    getState: () => state,
    start() {
      void check();
      setInterval(check, CHECK_INTERVAL_MS).unref();
    }
  };
}

module.exports = {createUpdateService};
