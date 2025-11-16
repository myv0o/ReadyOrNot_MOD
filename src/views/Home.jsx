import React from 'react';

function Home({ status, micLevel, threshold, lastShoutTime, triggerKey, cooldown }) {
  const levelPercent = Math.round(micLevel);
  const thresholdPercent = Math.round(threshold);

  return (
    <div className="view view-home">
      <div className="home-grid">
        <section className="card">
          <h2>Live microphone</h2>
          <p>Match your real-time volume. When it crosses the red marker, a shout key is fired.</p>

          <div className="level-bar">
            <div className="level-bar-track">
              <div
                className="level-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, levelPercent))}%` }}
              />
              <div
                className="level-bar-threshold"
                style={{ left: `${Math.min(100, Math.max(0, thresholdPercent))}%` }}
              />
            </div>
            <div className="level-bar-meta">
              <span>
                Level: <span className="meta-value">{levelPercent}</span>
                <span className="meta-label"> / 100</span>
              </span>
              <span>
                Threshold: <span className="meta-value">{thresholdPercent}</span>
              </span>
            </div>
          </div>

          <div className="meta-row">
            <span>
              <span className="meta-label">Engine:</span>{' '}
              <span className="meta-value">RMS amplitude (Web Audio)</span>
            </span>
            <span>
              <span className="meta-label">Mode:</span>{' '}
              <span className="meta-value">{status}</span>
            </span>
          </div>

          <p className="hint">
            Tip: do a few test shouts while Ready Or Not is focused. If it fires too often or not
            enough, tweak the threshold and cooldown in{' '}
            <span className="meta-value">Settings</span>.
          </p>
        </section>

        <section className="card">
          <h2>Session info</h2>
          <p>overview of the shout trigger parameters currently in use</p>

          <ul className="side-card-list">
            <li>
              <span className="meta-label">Shout key:</span>{' '}
              <span className="meta-value badge">
                <span className="badge-dot" />
                {String(triggerKey || '').toUpperCase() || 'F'}
              </span>
            </li>
            <li>
              <span className="meta-label">Cooldown:</span>{' '}
              <span className="meta-value">{cooldown} ms</span>
            </li>
            <li>
              <span className="meta-label">Last shout:</span>{' '}
              <span className="meta-value">
                {lastShoutTime ? lastShoutTime.toLocaleTimeString() : '—'}
              </span>
            </li>
            <li>
              <span className="meta-label">Target window:</span>{' '}
              <span className="meta-value">Active OS window</span>
            </li>
          </ul>

          <p className="hint">
            Keep this app running in the background. As long as the mic is active, shouts will be
            mapped to your key !
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
