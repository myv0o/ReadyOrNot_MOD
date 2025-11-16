import React from 'react';

function Settings({
  triggerKey,
  setTriggerKey,
  threshold,
  setThreshold,
  cooldown,
  setCooldown,
  onResetDefaults,
  onSave,
  settingsSavedMessage,
  audioDevices,
  selectedDeviceId,
  setSelectedDeviceId
}) {
  const handleKeyChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setTriggerKey(value.slice(0, 1) || 'F');
  };

  const handleThresholdChange = (e) => {
    setThreshold(Number(e.target.value));
  };

  const handleCooldownChange = (e) => {
    setCooldown(Number(e.target.value));
  };

  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  return (
    <div className="view view-settings">
      <div className="settings-grid">
        <section className="card">
          <h2>Key & sensitivity</h2>
          <p>Tune how aggressive the shout detection is and which key gets fired.</p>

          <div className="field-group">
            <div className="field-label">Shout key</div>
            <div className="field-row">
              <input
                type="text"
                value={String(triggerKey || '').toUpperCase()}
                onChange={handleKeyChange}
                maxLength={1}
              />
              <div className="field-value">
                Sent globally as <strong>{String(triggerKey || '').toUpperCase() || 'F'}</strong>.
              </div>
            </div>
            <small>
              Use a single key used for the Ready Or Not shout / interaction (e.g. F, E, G).
            </small>
          </div>

          <div className="field-group">
            <div className="field-label">Threshold</div>
            <div className="field-row">
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={threshold}
                onChange={handleThresholdChange}
              />
              <div className="field-value">{Math.round(threshold)}</div>
            </div>
            <small>
              Higher = less sensitive. Start around 30–40, then adjust while watching the live bar.
            </small>
          </div>

          <div className="field-group">
            <div className="field-label">Cooldown</div>
            <div className="field-row">
              <input
                type="range"
                min={200}
                max={3000}
                step={100}
                value={cooldown}
                onChange={handleCooldownChange}
              />
              <div className="field-value">{cooldown} ms</div>
            </div>
            <small>Minimum time between two keypresses. Increase if shouts feel too spammy.</small>
          </div>

          {/* --- Microphone select --- */}
          <div className="field-group">
            <div className="field-label">Microphone</div>
            <div className="field-row">
              <select
                className="mic-select"
                value={selectedDeviceId || ''}
                onChange={handleDeviceChange}
              >
                {audioDevices && audioDevices.length > 0 ? (
                  audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.substring(0, 6)}`}
                    </option>
                  ))
                ) : (
                  <option value="">No microphones found</option>
                )}
              </select>
            </div>
            <small>Select which microphone should be used for shout detection.</small>
          </div>

          <div className="settings-buttons">
            <button className="btn btn-secondary" type="button" onClick={onResetDefaults}>
              Restore defaults
            </button>
            <button className="btn btn-primary" type="button" onClick={onSave}>
              Save
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Behaviour</h2>
          <p>
            The app always targets the <span className="meta-value">active window</span>. Make sure
            Ready Or Not is in focus when you want shouts to be sent.
          </p>
          <p>
            You can keep this window minimized or in the background; as long as the app is running
            and the mic is active, detection continues.
          </p>
          <p className="hint">
            If nothing happens in-game, double check:
            <br />
            – Microphone permissions in Windows
            <br />
            – That the shout key matches the in-game keybind
            <br />– That anti-cheat / overlays do not block simulated keypresses
          </p>

          {settingsSavedMessage && <p className="hint">Settings stored locally for next launch.</p>}
        </section>
      </div>
    </div>
  );
}

export default Settings;
