'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const {createUpdateService} = require('../electron/updates.cjs');

test('checks automatically and tracks a background update through download', () => {
  const updater = new EventEmitter();
  let checks = 0;
  updater.checkForUpdates = async () => { checks++; };
  const service = createUpdateService({enabled: true, updater});

  service.start();
  assert.equal(checks, 1);
  assert.equal(updater.autoDownload, true);
  assert.equal(updater.autoInstallOnAppQuit, true);
  assert.equal(updater.allowPrerelease, false);
  assert.equal(updater.allowDowngrade, false);
  assert.deepEqual(service.getState(), {status: 'checking'});

  updater.emit('update-available', {version: '0.1.2'});
  updater.emit('download-progress', {percent: 36.6});
  assert.deepEqual(service.getState(), {status: 'downloading', version: '0.1.2', percent: 37});
  updater.emit('update-downloaded', {version: '0.1.2'});
  assert.deepEqual(service.getState(), {status: 'ready', version: '0.1.2'});
});

test('reports update failures without exiting the app', async () => {
  const updater = new EventEmitter();
  updater.checkForUpdates = async () => { throw new Error('offline'); };
  const service = createUpdateService({enabled: true, updater});

  service.start();
  await Promise.resolve();
  assert.deepEqual(service.getState(), {status: 'error'});
});

test('skips the updater in development', () => {
  const service = createUpdateService({enabled: false, updater: null});
  service.start();
  assert.deepEqual(service.getState(), {status: 'disabled'});
});
