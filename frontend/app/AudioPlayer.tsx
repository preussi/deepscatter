import React, { useEffect, useRef } from 'react';

export default function AudioPlayer({ audioSource }) {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audioSource) {
            audio.pause();
            audio.load();
        }
    }, [audioSource]); // This effect runs when audioSource changes.

    return (
        <audio controls style={{width:'100%'}} ref={audioRef}>
            <source src={audioSource} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
}
