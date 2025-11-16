import React from 'react';

function Calibration({ micLevel, threshold, isCalibrating, onStartCalibration, calibrationMessage }) {
  const levelPercent = Math.round(micLevel);
  const thresholdPercent = Math.round(threshold);

  return (
    <div className="view view-calibration">
      <div className="calibration-layout">
        <section className="card">
          <h2>Calibration</h2>
          <p>
            Let the app automatically choose a good shout threshold based on your normal voice and
            your in-game shout.
          </p>

          <div className="calibration-steps">
            <ol>
              <li>Click <strong>Start calibration</strong>.</li>
              <li>Speak normally for a couple of seconds.</li>
              <li>Shout once or twice at the volume you use in Ready Or Not.</li>
            </ol>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-primary"
              disabled={isCalibrating}
              onClick={onStartCalibration}
            >
              {isCalibrating ? 'Calibrating…' : 'Start calibration'}
            </button>
          </div>

          {calibrationMessage && (
            <p className="calibration-message">
              {calibrationMessage}
            </p>
          )}

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
                Live level: <span className="meta-value">{levelPercent}</span>
              </span>
              <span>
                Threshold: <span className="meta-value">{thresholdPercent}</span>
              </span>
            </div>
          </div>

          <p className="hint">
            If the bar is always above the marker while you talk normally, the threshold is too low.
            If it never reaches it when you shout, it is too high.
          </p>
        </section>

        <section className="card">
          <h2>Calibration tips</h2>
          <p>
            Try to calibrate in a similar environment to your typical play session (same distance to
            mic, same room, similar background noise).
          </p>
          <p>
            You can re-run the calibration at any time or fine tune the threshold manually in the
            <span className="meta-value"> Settings</span> view.
          </p>
          <p className="hint">
            The internal level scale (0–100) is not dB, it&apos;s a relative measure based on the
            RMS of your microphone signal.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Calibration;
