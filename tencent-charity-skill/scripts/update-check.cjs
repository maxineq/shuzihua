/**
 * Skill 远端更新检查器（轻量级）
 *
 * 两种模式：
 *   - SessionStart / 低频：updateCheckIntervalDays 缓存
 *   - 每日 Hook：options.forceNetwork=true，每次 HEAD；无变更返回 hasUpdate:false
 *
 * checkRemoteUpdate(projectDir, options?) → { hasUpdate, message? } | null
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const CACHE_FILE_NAME = '.update-check-cache.json';

function getCacheDir(projectDir) {
  if (process.env.WORKBUDDY_PROJECT_DIR) {
    return path.join(projectDir, '.workbuddy');
  }
  if (process.env.CLAUDE_PROJECT_DIR) {
    return path.join(projectDir, '.claude');
  }
  if (fs.existsSync(path.join(projectDir, '.workbuddy'))) {
    return path.join(projectDir, '.workbuddy');
  }
  if (fs.existsSync(path.join(projectDir, '.codebuddy'))) {
    return path.join(projectDir, '.codebuddy');
  }
  if (fs.existsSync(path.join(projectDir, '.cursor'))) {
    return path.join(projectDir, '.cursor');
  }
  return path.join(projectDir, '.codebuddy');
}

function loadCache(projectDir) {
  try {
    const cachePath = path.join(getCacheDir(projectDir), CACHE_FILE_NAME);
    if (!fs.existsSync(cachePath)) return null;
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch {
    return null;
  }
}

function saveCache(projectDir, data) {
  try {
    const cacheDir = getCacheDir(projectDir);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, CACHE_FILE_NAME), JSON.stringify(data, null, 2));
  } catch {
    /* swallow */
  }
}

function readLocalVersion(projectDir) {
  const candidates = [
    path.join(projectDir, '.agents', 'CHANGELOG.md'),
    path.join(projectDir, 'CHANGELOG.md'),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, 'utf-8');
      const match = content.match(/^## \[(\d+\.\d+\.\d+)\]/m);
      if (match) return { version: match[1], path: p };
    } catch {
      /* continue */
    }
  }
  return { version: null, path: null };
}

function headRequest(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (err) {
      reject(err);
      return;
    }

    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        method: 'HEAD',
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        timeout: timeoutMs,
      },
      (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          headRequest(res.headers.location, timeoutMs).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        resolve({
          lastModified: res.headers['last-modified'] || null,
          etag: res.headers['etag'] || null,
          contentLength: res.headers['content-length'] || null,
        });
      }
    );

    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
    req.end();
  });
}

function getUpdateCommand(config) {
  const skillName = config.skillName || 'Skill';
  return String(config.updateCommand || '').trim() || `更新 ${skillName}`;
}

function getUpdateCommandAliases(config) {
  const primary = getUpdateCommand(config);
  const aliases = Array.isArray(config.updateCommandAliases) ? config.updateCommandAliases : [];
  return aliases
    .map((item) => String(item || '').trim())
    .filter((item, index, arr) => item && item !== primary && arr.indexOf(item) === index);
}

function buildUpdateMessage(config, localInfo) {
  const skillName = config.skillName || 'Skill';
  const versionTag = localInfo.version ? `（本地 v${localInfo.version}）` : '';
  const updateCommand = getUpdateCommand(config);
  const aliases = getUpdateCommandAliases(config);
  const aliasText = aliases.length ? `；也可回复：${aliases.map((item) => `"${item}"`).join('、')}` : '';
  return `⬆️ 检测到远端 ${skillName} 有更新${versionTag}，回复"${updateCommand}"即可同步${aliasText}`;
}

/**
 * @param {string} projectDir
 * @param {{ forceNetwork?: boolean, config?: object }} [options]
 */
async function checkRemoteUpdate(projectDir, options = {}) {
  let config = options.config;
  if (!config) {
    try {
      config = require('../skill.config.cjs');
    } catch {
      return null;
    }
  }

  const forceNetwork = Boolean(options.forceNetwork);
  const intervalDays = forceNetwork
    ? Number(config.dailyUpdateHeadIntervalDays ?? 1)
    : Number(config.updateCheckIntervalDays || 0);

  if (!forceNetwork && intervalDays <= 0) return null;

  const timeoutMs = Number(
    (forceNetwork ? config.dailyUpdateHeadTimeoutMs : null) ||
      config.updateCheckTimeoutMs ||
      1500
  );
  const backoffHours = Number(config.updateCheckFailBackoffHours || 24);
  const now = Date.now();
  const cache = loadCache(projectDir) || {};

  if (!forceNetwork && cache.failedAt && now - cache.failedAt < backoffHours * 3600 * 1000) {
    if (cache.hasUpdate && cache.message) {
      return { hasUpdate: true, message: cache.message };
    }
    return null;
  }

  const intervalMs = intervalDays * 86400 * 1000;
  if (!forceNetwork && cache.checkedAt && now - cache.checkedAt < intervalMs) {
    if (cache.hasUpdate && cache.message) {
      return { hasUpdate: true, message: cache.message };
    }
    if (cache.fingerprint && cache.hasUpdate === false) {
      return { hasUpdate: false };
    }
    return null;
  }

  const url = config.cdnBaseUrl;
  if (!url) return null;

  let head;
  try {
    head = await headRequest(url, timeoutMs);
  } catch {
    saveCache(projectDir, { ...cache, failedAt: now });
    return null;
  }

  const fingerprint = head.etag || head.lastModified || head.contentLength;
  const localInfo = readLocalVersion(projectDir);

  if (!cache.fingerprint) {
    saveCache(projectDir, {
      checkedAt: now,
      fingerprint,
      lastModified: head.lastModified,
      localVersionAtCheck: localInfo.version,
      hasUpdate: false,
      message: null,
      failedAt: null,
    });
    return forceNetwork ? { hasUpdate: false } : null;
  }

  if (cache.fingerprint === fingerprint) {
    saveCache(projectDir, {
      ...cache,
      checkedAt: now,
      failedAt: null,
      hasUpdate: false,
      message: null,
    });
    return { hasUpdate: false };
  }

  const message = buildUpdateMessage(config, localInfo);
  saveCache(projectDir, {
    checkedAt: now,
    fingerprint,
    lastModified: head.lastModified,
    localVersionAtCheck: localInfo.version,
    hasUpdate: true,
    message,
    failedAt: null,
  });

  return { hasUpdate: true, message };
}

module.exports = { checkRemoteUpdate, getCacheDir };
