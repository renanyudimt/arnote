import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { ArrowLeft, AlertTriangle, VolumeX, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ipc } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTranscriptionStore } from '@/stores/transcriptionStore'

import {
  TranscriptView,
  MeetingControls,
  StopConfirmDialog,
  AudioSourceSelector
} from './components'
import { useAudioDeviceHandlers } from './hooks/useAudioDeviceHandlers'
import { useSessionCompletion } from './hooks/useSessionCompletion'
import { useTranscription } from './hooks/useTranscription'

export function SessionPage(): React.JSX.Element {
  const navigate = useNavigate()
  const {
    isRecording,
    entries,
    error,
    isMicMuted,
    isPaused,
    systemAudioSilent,
    audioLevel,
    micLevel,
    isNativeCapture,
    start,
    stop,
    toggleMicMute,
    togglePause
  } = useTranscription()
  const reset = useTranscriptionStore((s) => s.reset)
  const [silenceWarningDismissed, setSilenceWarningDismissed] = useState(false)
  const [nativeAudioSupported, setNativeAudioSupported] = useState(false)

  const { hasApiKey: hasKey, isLoaded, load } = useSettingsStore()
  const { showStopDialog, setShowStopDialog, handleStop, handleConfirmStop } =
    useSessionCompletion({ stop })
  const {
    selectedMicDeviceId,
    currentSystemAudioSource,
    outputDevices,
    selectedOutputDeviceId,
    isOutputLoading,
    handleMicDeviceChange,
    handleSystemAudioSourceChange,
    handleOutputDeviceChange
  } = useAudioDeviceHandlers()

  useEffect(() => {
    if (!isLoaded) void load()
  }, [isLoaded, load])

  useEffect(() => {
    void ipc.audio.isNativeSupported().then(setNativeAudioSupported)
  }, [])

  const hasApiKey = isLoaded && hasKey

  const handleBack = (): void => {
    if (isRecording || isPaused) {
      handleStop()
      return
    }
    reset()
    void navigate('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-semibold">
          {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'New Session'}
        </h1>
      </div>

      {!hasApiKey && !isRecording && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            API key not configured.{' '}
            <button
              className="cursor-pointer font-medium underline"
              onClick={() => navigate('/settings')}
            >
              Go to Settings
            </button>{' '}
            to add your OpenAI key.
          </span>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {systemAudioSilent && isRecording && !silenceWarningDismissed && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-400">
          <VolumeX className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">System audio appears silent. This could be because:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>No audio is currently playing on the system</li>
              {!isNativeCapture && (
                <>
                  <li>Screen &amp; System Audio Recording permission is not granted</li>
                  <li>
                    Bluetooth audio device is active — try selecting a matching input device or a
                    virtual audio device (e.g., BlackHole) in the audio source selector
                  </li>
                </>
              )}
            </ul>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={() => setSilenceWarningDismissed(true)}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TranscriptView entries={entries} />
      </div>

      {!isRecording && (
        <AudioSourceSelector
          micDeviceId={selectedMicDeviceId}
          systemAudioSource={currentSystemAudioSource}
          isNativeCapture={nativeAudioSupported}
          outputDevices={outputDevices}
          outputDeviceId={selectedOutputDeviceId}
          isOutputLoading={isOutputLoading}
          onMicDeviceChange={handleMicDeviceChange}
          onSystemAudioSourceChange={handleSystemAudioSourceChange}
          onOutputDeviceChange={handleOutputDeviceChange}
        />
      )}

      <MeetingControls
        isRecording={isRecording}
        isMicMuted={isMicMuted}
        isPaused={isPaused}
        audioLevel={audioLevel}
        micLevel={micLevel}
        onStart={() => {
          setSilenceWarningDismissed(false)
          void start({
            micDeviceId: selectedMicDeviceId || undefined,
            systemAudioSource: currentSystemAudioSource
          })
        }}
        onStop={handleStop}
        onToggleMicMute={toggleMicMute}
        onTogglePause={() => void togglePause()}
      />

      <StopConfirmDialog
        open={showStopDialog}
        onOpenChange={setShowStopDialog}
        onConfirm={handleConfirmStop}
      />
    </div>
  )
}
