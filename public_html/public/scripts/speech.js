class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.isSpeaking = false;
        this.loadVoices();
    }

    loadVoices() {
        // Load available voices
        this.voices = this.synth.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
                console.log('Voices loaded:', this.voices.length);
                // Log available voices for debugging
                this.voices.forEach(voice => {
                    console.log(`Voice: ${voice.name}, Lang: ${voice.lang}, Gender: ${voice.gender || 'unknown'}`);
                });
            };
        }
    }

    findBestVoice() {
        // Try to find a male Scottish voice first
        const maleScottishVoice = this.voices.find(voice => 
            voice.lang.includes('en-GB') && 
            voice.name.includes('Scottish') && 
            voice.name.toLowerCase().includes('male')
        );

        if (maleScottishVoice) {
            console.log('Using male Scottish voice:', maleScottishVoice.name);
            return maleScottishVoice;
        }

        // Try any Scottish voice
        const scottishVoice = this.voices.find(voice => 
            voice.lang.includes('en-GB') && voice.name.includes('Scottish')
        );

        if (scottishVoice) {
            console.log('Using Scottish voice:', scottishVoice.name);
            return scottishVoice;
        }

        // Try any British English male voice
        const britishMaleVoice = this.voices.find(voice => 
            voice.lang.includes('en-GB') && 
            voice.name.toLowerCase().includes('male')
        );

        if (britishMaleVoice) {
            console.log('Using British male voice:', britishMaleVoice.name);
            return britishMaleVoice;
        }

        // Fallback to any British English voice
        const britishVoice = this.voices.find(voice => 
            voice.lang.includes('en-GB')
        );

        if (britishVoice) {
            console.log('Using British voice:', britishVoice.name);
            return britishVoice;
        }

        // Final fallback to first available voice
        console.log('Using default voice:', this.voices[0]?.name);
        return this.voices[0];
    }

    speak(text) {
        // Cancel any ongoing speech
        this.synth.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Find the best available voice
        utterance.voice = this.findBestVoice();

        // Configure speech parameters
        utterance.rate = 0.9;  // Slightly slower for better clarity
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Full volume

        // Add event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('Speech started');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            console.log('Speech finished');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.synth.cancel();
            this.isSpeaking = false;
        };

        // Speak the text
        this.synth.speak(utterance);
    }

    stop() {
        if (this.isSpeaking) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
    }

    toggle() {
        if (this.isSpeaking) {
            this.stop();
        } else {
            this.synth.resume();
        }
    }

    setVolume(volume) {
        // Volume should be between 0 and 1
        const utterance = new SpeechSynthesisUtterance();
        utterance.volume = Math.max(0, Math.min(1, volume));
    }

    setRate(rate) {
        // Rate should be between 0.1 and 10
        const utterance = new SpeechSynthesisUtterance();
        utterance.rate = Math.max(0.1, Math.min(10, rate));
    }

    setPitch(pitch) {
        // Pitch should be between 0 and 2
        const utterance = new SpeechSynthesisUtterance();
        utterance.pitch = Math.max(0, Math.min(2, pitch));
    }
}

// Export the SpeechManager class
window.SpeechManager = SpeechManager;

// Update any file paths to use the new structure
const SPEECH_CONFIG = {
    voice: 'en-GB',
    rate: 0.9,
    pitch: 1.0,
    // ... existing code ...
};

// Update any asset paths
const ASSET_PATHS = {
    sounds: '/public/sounds/',
    // ... existing code ...
}; 