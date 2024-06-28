// src/components/AudioRecorder.js
import React, { useState, useRef } from 'react';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null); // Store the audio blob
    const [isPlaying, setIsPlaying] = useState(false); // Track if audio is playing
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const intervalRef = useRef(null);
    const streamRef = useRef(null); // Reference to the media stream
    const audioRef = useRef(null); // Reference to the audio element

    const startRecording = async () => {
        setErrorMessage(''); // Clear any previous error messages
        setRecordingTime(0); // Reset the recording time
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream; // Save the stream to stop it later
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
                setAudioBlob(audioBlob); // Save the audio blob for later upload
                audioChunksRef.current = []; // Clear the array for the next recording
                clearInterval(intervalRef.current); // Clear the interval when recording stops
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
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

    const uploadAudioFile = async () => {
        if (!audioBlob) {
            setErrorMessage('No audio file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        try {
            const response = await fetch('https://your-api-endpoint.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload the audio file');
            }

            const data = await response.json();
            console.log('Upload successful:', data);
        } catch (error) {
            setErrorMessage('Failed to upload the audio file.');
            console.error('Error uploading audio file:', error);
        }
    };

    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
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
            <button onClick={uploadAudioFile} disabled={!audioBlob}>Upload Recording</button>
            {audioUrl && (
                <div>
                    <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} />
                    <button onClick={playAudio} disabled={isPlaying}>Play</button>
                    <button onClick={pauseAudio} disabled={!isPlaying}>Pause</button>
                    <button onClick={stopAudio}>Stop</button>
                </div>
            )}
            {isRecording && <p>Recording Time: {formatTime(recordingTime)}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AudioRecorder;
