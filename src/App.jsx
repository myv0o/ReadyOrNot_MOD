import React, { useEffect, useRef, useState } from 'react';
import { VscHome, VscArchive, VscSettingsGear } from 'react-icons/vsc';
import Dock from './components/Dock.jsx';
import Home from './views/Home.jsx';
import Calibration from './views/Calibration.jsx';
import Settings from './views/Settings.jsx';

const SETTINGS_KEY = 'ron-shout-key-settings';

function App() {
  const [view, setView] = useState('home');

  const [triggerKey, setTriggerKey] = useState('F');
  const [threshold, setThreshold] = useState(35); // 0-100 internal scale
  const [cooldown, setCooldown] = useState(1200); // ms

  const [status, setStatus] = useState('Idle');
  const [micLevel, setMicLevel] = useState(0);
  const [lastShoutTime, setLastShoutTime] = useState(null);

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationMessage, setCalibrationMessage] = useState('');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');

  // --- nouveaux états pour les micros ---
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const thresholdRef = useRef(threshold);
  const cooldownRef = useRef(cooldown);
  const triggerKeyRef = useRef(triggerKey);
  const isCalibratingRef = useRef(isCalibrating);
  const calibrationDataRef = useRef(null);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    cooldownRef.current = cooldown;
  }, [cooldown]);

  useEffect(() => {
    triggerKeyRef.current = triggerKey;
  }, [triggerKey]);

  useEffect(() => {
    isCalibratingRef.current = isCalibrating;
  }, [isCalibrating]);

  // chargement des settings (y compris micro choisi)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.triggerKey) setTriggerKey(parsed.triggerKey);
        if (typeof parsed.threshold === 'number') setThreshold(parsed.threshold);
        if (typeof parsed.cooldown === 'number') setCooldown(parsed.cooldown);
        if (parsed.selectedDeviceId) setSelectedDeviceId(parsed.selectedDeviceId);
      }
    } catch (err) {
      console.warn('Failed to load stored settings:', err);
    }
  }, []);

  // récupération de la liste des micros dispo
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter((d) => d.kind === 'audioinput');
        setAudioDevices(audios);

        // si rien de choisi, prendre le premier
        if (!selectedDeviceId && audios[0]) {
          setSelectedDeviceId(audios[0].deviceId);
        }
      } catch (err) {
        console.warn('Failed to enumerate devices:', err);
      }
    };

    loadDevices();
  }, [selectedDeviceId]);

  // audio + détection 
  useEffect(() => {
    let audioContext;
    let analyser;
    let dataArray;
    let source;
    let animationFrameId;
    let stream;

    const initAudio = async () => {
      try {
        setStatus('Requesting mic...');

        const audioConstraint =
          selectedDeviceId && selectedDeviceId !== ''
            ? { deviceId: { exact: selectedDeviceId } }
            : true;

        stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        dataArray = new Uint8Array(analyser.fftSize);
        source.connect(analyser);

        setStatus('Listening');

        const loop = () => {
          analyser.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] - 128;
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          const level = Math.min(100, (rms / 40) * 100);

          setMicLevel(level);

          const now = performance.now();

          if (isCalibratingRef.current && calibrationDataRef.current) {
            const cd = calibrationDataRef.current;
            cd.levels.push(level);
            if (level > cd.maxLevel) {
              cd.maxLevel = level;
            }

            if (now - cd.startTime >= 4000) {
              isCalibratingRef.current = false;
              setIsCalibrating(false);

              const levels = cd.levels.slice().sort((a, b) => a - b);
              let newThreshold = thresholdRef.current;

              if (levels.length > 10) {
                const bottomCount = Math.max(1, Math.round(levels.length * 0.5));
                const topCount = Math.max(1, Math.round(levels.length * 0.15));
                const bottom = levels.slice(0, bottomCount);
                const top = levels.slice(-topCount);
                const avg = (arr) => arr.reduce((acc, v) => acc + v, 0) / arr.length;
                const avgBottom = avg(bottom);
                const avgTop = avg(top);
                if (avgTop > avgBottom + 5) {
                  newThreshold = avgBottom + (avgTop - avgBottom) * 0.7;
                } else {
                  newThreshold = cd.maxLevel * 0.7;
                }
              } else {
                newThreshold = cd.maxLevel * 0.7;
              }

              newThreshold = Math.max(5, Math.min(100, newThreshold));

              setThreshold(newThreshold);
              setCalibrationMessage(
                `Calibration complete – shout threshold set to ${newThreshold.toFixed(1)}`
              );
            }
          } else {
            const thresholdVal = thresholdRef.current;
            const cooldownVal = cooldownRef.current;

            if (level >= thresholdVal) {
              if (now - lastTriggerRef.current >= cooldownVal) {
                lastTriggerRef.current = now;
                setStatus('Triggered');
                setLastShoutTime(new Date());

                if (window.electronAPI && typeof window.electronAPI.triggerKey === 'function') {
                  window.electronAPI.triggerKey(triggerKeyRef.current || 'F');
                } else {
                  console.warn('electronAPI.triggerKey not available');
                }

                setTimeout(() => {
                  setStatus('Listening');
                }, 300);
              }
            }
          }

          animationFrameId = requestAnimationFrame(loop);
        };

        loop();
      } catch (error) {
        console.error('Error initialising microphone:', error);
        setStatus('Mic error – check permissions');
      }
    };

    initAudio();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext) audioContext.close();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setStatus('Idle');
    };
  }, [selectedDeviceId]); // <- important pour changer de micro

  const handleStartCalibration = () => {
    calibrationDataRef.current = {
      levels: [],
      maxLevel: 0,
      startTime: performance.now()
    };
    isCalibratingRef.current = true;
    setIsCalibrating(true);
    setCalibrationMessage('Calibration running… Speak normally, then shout once or twice.');
  };

  const handleSaveSettings = () => {
    try {
      const payload = {
        triggerKey: triggerKeyRef.current,
        threshold: thresholdRef.current,
        cooldown: cooldownRef.current,
        selectedDeviceId: selectedDeviceId || ''
      };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
      setSettingsSavedMessage('Settings saved');
      setTimeout(() => setSettingsSavedMessage(''), 2000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  };

  const handleResetDefaults = () => {
    const DEFAULTS = {
      triggerKey: 'F',
      threshold: 35,
      cooldown: 1200
    };
    setTriggerKey(DEFAULTS.triggerKey);
    setThreshold(DEFAULTS.threshold);
    setCooldown(DEFAULTS.cooldown);
    // on ne touche pas au micro choisi
    try {
      window.localStorage.removeItem(SETTINGS_KEY);
    } catch (err) {
      // ignore
    }
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <Home
            status={status}
            micLevel={micLevel}
            threshold={threshold}
            lastShoutTime={lastShoutTime}
            triggerKey={triggerKey}
            cooldown={cooldown}
          />
        );
      case 'calibration':
        return (
          <Calibration
            micLevel={micLevel}
            threshold={threshold}
            isCalibrating={isCalibrating}
            onStartCalibration={handleStartCalibration}
            calibrationMessage={calibrationMessage}
          />
        );
      case 'settings':
        return (
          <Settings
            triggerKey={triggerKey}
            setTriggerKey={setTriggerKey}
            threshold={threshold}
            setThreshold={setThreshold}
            cooldown={cooldown}
            setCooldown={setCooldown}
            onResetDefaults={handleResetDefaults}
            onSave={handleSaveSettings}
            settingsSavedMessage={settingsSavedMessage}
            audioDevices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            setSelectedDeviceId={setSelectedDeviceId}
          />
        );
      default:
        return null;
    }
  };

  const dockItems = [
    {
      icon: <VscHome size={20} />,
      label: 'Home',
      onClick: () => setView('home')
    },
    {
      icon: <VscArchive size={20} />,
      label: 'Calibration',
      onClick: () => setView('calibration')
    },
    {
      icon: <VscSettingsGear size={20} />,
      label: 'Settings',
      onClick: () => setView('settings')
    }
  ];

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="app-title"><p>shout &gt;0&lt;</p> </h1>
            <p className="app-subtitle">discord: @myv0_ </p>
          </div>
          <div className="status-pill">
            <span className={`status-dot status-${status.toLowerCase().split(' ')[0]}`} />
            <span className="status-text">{status}</span>
          </div>
        </header>

        <main className="app-main">{renderView()}</main>

        {settingsSavedMessage && (
          <div className="toast">
            <span>{settingsSavedMessage}</span>
          </div>
        )}
      </div>

      <Dock items={dockItems} panelHeight={68} baseItemSize={52} magnification={76} />
    </div>
  );
}

export default App;
