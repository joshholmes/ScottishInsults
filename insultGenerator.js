class InsultGenerator {
    constructor() {
        this.sentences = [];
        this.adjectives = [];
        this.nouns = [];
        this.loaded = false;
        this.currentInsult = '';
        this.isAnimating = false;
        this.animationSpeed = {
            sentence: 200,    // Fastest
            adjective: 300,   // Medium
            noun: 200        // Slowest
        };
        this.totalRotations = {
            sentence: 25,     // Most rotations
            adjective: 20,    // Medium
            noun: 25         // Least rotations
        };
        this.currentRotation = {
            sentence: 0,
            adjective: 0,
            noun: 0
        };
        this.finalParts = {
            sentence: '',
            adjective: '',
            noun: ''
        };
        // Initialize speech manager
        this.speechManager = new SpeechManager();
        // Make the generator available globally for the voice button
        window.generator = this;
    }

    async loadData() {
        try {
            console.log('Loading insult data...');
            const [sentencesRes, adjectivesRes, nounsRes] = await Promise.all([
                fetch('/data/sentences.json'),
                fetch('/data/adjectives.json'),
                fetch('/data/nouns.json')
            ]);

            if (!sentencesRes.ok || !adjectivesRes.ok || !nounsRes.ok) {
                throw new Error('Failed to load data files');
            }

            const sentencesData = await sentencesRes.json();
            const adjectivesData = await adjectivesRes.json();
            const nounsData = await nounsRes.json();

            this.sentences = sentencesData.sentences;
            this.adjectives = adjectivesData.adjectives;
            this.nouns = nounsData.nouns;
            this.loaded = true;
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading insult data:', error);
            document.getElementById('insults').textContent = 'Error loading insults. Please try again.';
        }
    }

    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateRandomInsult() {
        return {
            sentence: this.getRandomFromArray(this.sentences),
            adjective: this.getRandomFromArray(this.adjectives),
            noun: this.getRandomFromArray(this.nouns)
        };
    }

    updateDisplay(parts) {
        const insultsElement = document.getElementById('insults');
        const isAllFinal = this.currentRotation.sentence >= this.totalRotations.sentence &&
                          this.currentRotation.adjective >= this.totalRotations.adjective &&
                          this.currentRotation.noun >= this.totalRotations.noun;

        // Remove any trailing spaces from the sentence part
        const sentence = parts.sentence.trim();
        
        // Update the current insult to match what's being displayed
        // Store with pipe characters for the callback URL
        this.currentInsult = `${sentence}|${parts.adjective}|${parts.noun}!`;
        
        // Display without pipe characters in the HTML
        insultsElement.innerHTML = `
            <span class="insult-part ${this.currentRotation.sentence < this.totalRotations.sentence ? 'rotating' : 'final'}">${sentence}</span>
            <span class="insult-part ${this.currentRotation.adjective < this.totalRotations.adjective ? 'rotating' : 'final'}">${parts.adjective}</span>
            <span class="insult-part ${this.currentRotation.noun < this.totalRotations.noun ? 'rotating' : 'final'}">${parts.noun}</span>!
        `;

        if (isAllFinal) {
            insultsElement.classList.add('final');
        } else {
            insultsElement.classList.remove('final');
        }
    }

    generateInsult() {
        if (!this.loaded) {
            console.log('Data not loaded yet');
            return "Loading insults...";
        }

        if (this.isAnimating) {
            console.log('Already animating');
            return;
        }

        console.log('Generating new insult');
        this.isAnimating = true;
        this.currentRotation = { sentence: 0, adjective: 0, noun: 0 };
        const insultsElement = document.getElementById('insults');
        insultsElement.classList.add('rotating');
        insultsElement.classList.remove('final');
        insultsElement.style.display = 'flex';

        // Generate the final insult that we'll settle on
        this.finalParts = this.generateRandomInsult();

        // Start the rotation animation for each part
        const animatePart = (part, speed, totalRotations) => {
            if (this.currentRotation[part] >= totalRotations) {
                return;
            }

            const randomParts = this.generateRandomInsult();
            const displayParts = {
                sentence: part === 'sentence' ? randomParts.sentence : this.finalParts.sentence,
                adjective: part === 'adjective' ? randomParts.adjective : this.finalParts.adjective,
                noun: part === 'noun' ? randomParts.noun : this.finalParts.noun
            };

            this.updateDisplay(displayParts);
            this.currentRotation[part]++;
            setTimeout(() => animatePart(part, speed, totalRotations), speed);
        };

        // Start all animations
        animatePart('sentence', this.animationSpeed.sentence, this.totalRotations.sentence);
        animatePart('adjective', this.animationSpeed.adjective, this.totalRotations.adjective);
        animatePart('noun', this.animationSpeed.noun, this.totalRotations.noun);

        // Set a timeout to update social links when all animations are complete
        const maxDuration = Math.max(
            this.animationSpeed.sentence * this.totalRotations.sentence,
            this.animationSpeed.adjective * this.totalRotations.adjective,
            this.animationSpeed.noun * this.totalRotations.noun
        );

        setTimeout(() => {
            this.isAnimating = false;
            insultsElement.classList.remove('rotating');
            // Update display one final time to ensure currentInsult matches
            this.updateDisplay(this.finalParts);
            this.updateSocialLinks(this.currentInsult);
            console.log('Animation complete, final insult:', this.currentInsult);
        }, maxDuration + 500); // Add 500ms buffer
    }

    updateSocialLinks(insult) {
        // Use a hardcoded URL instead of process.env
        const mainUrl = 'https://scottishinsults.com';
        // Encode the insult text for the URL
        const encodedInsult = encodeURIComponent(insult);
        const callbackUrl = `${mainUrl}/insult?text=${encodedInsult}`;
        
        // Create a display version of the insult without pipe characters
        const displayInsult = insult.replace(/\|/g, ' ');
        const shareText = `${displayInsult}\n\nView this insult at: ${callbackUrl}`;
        
        console.log('Share text:', shareText);

        // Define the sharing functions directly on the window object
        window.shareOnTwitter = () => {
            const tweetText = encodeURIComponent(shareText + ' from @scottishinsults');
            const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&hashtags=scottishinsults`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
        };

        // Mastodon
        window.shareOnMastodon = () => {
            const mastodonText = encodeURIComponent(shareText + ' #scottishinsults');
            const mastodonUrl = `https://mastodon.social/share?text=${mastodonText}`;
            window.open(mastodonUrl, '_blank', 'width=600,height=400');
        };

        // Bluesky
        window.shareOnBluesky = () => {
            const blueskyText = encodeURIComponent(shareText + ' #scottishinsults');
            const blueskyUrl = `https://bsky.app/intent/compose?text=${blueskyText}`;
            window.open(blueskyUrl, '_blank', 'width=600,height=400');
        };

        // Facebook
        window.shareOnFacebook = () => {
            const shareUrl = callbackUrl;
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
            window.open(fbUrl, '_blank', 'width=626,height=436');
        };
    }

    speakCurrentInsult() {
        if (this.isAnimating) {
            console.log('Cannot speak while generating new insult');
            return;
        }
        
        if (!this.currentInsult) {
            console.log('No insult to speak');
            return;
        }

        // Format the text properly for speech
        const formattedText = this.currentInsult
            .replace(/\|/g, ' ')  // Replace pipe characters with spaces
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .trim();              // Remove leading/trailing spaces

        console.log('Speaking current insult:', formattedText);
        this.speechManager.speak(formattedText);
    }

    // Add this new method to validate if an insult could be generated from our data
    isValidInsultFormat(insultText) {
        // Remove the exclamation mark if present
        const cleanText = insultText.endsWith('!') ? insultText.slice(0, -1) : insultText;
        
        // Split by the pipe character
        const parts = cleanText.split('|');
        
        // Check if we have exactly three parts
        if (parts.length !== 3) return false;
        
        // Check if each part exists in our data
        const [sentence, adjective, noun] = parts;
        
        return (
            this.sentences.includes(sentence) &&
            this.adjectives.includes(adjective) &&
            this.nouns.includes(noun)
        );
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    const generator = new InsultGenerator();
    
    const generateButton = document.getElementById('generateBtn');

    if (!generateButton) {
        console.error('Generate button not found');
        return;
    }

    console.log('Setting up event listeners');
    generateButton.addEventListener('click', () => {
        console.log('Generate button clicked');
        generator.generateInsult();
    });

    // Load the data and generate initial insult
    await generator.loadData();
    
    // Check if there's an insult text in the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const insultText = urlParams.get('text');
    
    if (insultText) {
        console.log('Found insult text in URL:', insultText);
        
        // Decode the insult text
        const decodedInsult = decodeURIComponent(insultText);
        
        // Validate if this could be a real insult from our data
        if (generator.isValidInsultFormat(decodedInsult)) {
            console.log('Valid insult format found, displaying from URL');
            
            // Parse the insult parts
            const cleanText = decodedInsult.endsWith('!') ? decodedInsult.slice(0, -1) : decodedInsult;
            const [sentence, adjective, noun] = cleanText.split('|');
            
            // Display the specific insult with proper formatting
            const insultsElement = document.getElementById('insults');
            insultsElement.innerHTML = `
                <span class="insult-part final">${sentence}</span>
                <span class="insult-part final">${adjective}</span>
                <span class="insult-part final">${noun}</span>!
            `;
            insultsElement.classList.add('final');
            
            // Set the current insult for sharing
            generator.currentInsult = decodedInsult;
            
            // Update social links for this specific insult
            generator.updateSocialLinks(decodedInsult);
        } else {
            console.log('Invalid insult format in URL, generating new insult');
            // Generate a new insult if the URL text is invalid
            generator.generateInsult();
        }
    } else {
        // No specific insult requested, generate a random one
        generator.generateInsult();
    }

    // Initialize AdSense
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('Error initializing AdSense:', e);
    }
}); 