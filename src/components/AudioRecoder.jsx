// src/components/AudioRecorder.js
import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const intervalRef = useRef(null);

    const startRecording = async () => {
        setErrorMessage(''); // Clear any previous error messages
        setRecordingTime(0); // Reset the recording time
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
                audioChunksRef.current = []; // Clear the array for the next recording
                clearInterval(intervalRef.current); // Clear the interval when recording stops
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsPaused(false);
            intervalRef.current = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 1);
            }, 1000); // Update the recording time every second
        } catch (error) {
            setErrorMessage('Could not access the microphone. Please check your device and browser settings.');
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            clearInterval(intervalRef.current); // Stop the timer when paused
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            intervalRef.current = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 1);
            }, 1000); // Resume the timer
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div>
            <h1>Audio Recorder</h1>
            <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
            <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
            <button onClick={pauseRecording} disabled={!isRecording || isPaused}>Pause Recording</button>
            <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>Resume Recording</button>
            {isRecording && <p>Recording Time: {formatTime(recordingTime)}</p>}
            {audioUrl && <audio src={audioUrl} controls />}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AudioRecorder;
