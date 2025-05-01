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
        this.translations = null;
        // Add aria-live region for screen reader announcements
        this.createAriaLiveRegion();
    }

    async loadData() {
        try {
            console.log('Loading insult data...');
            const [sentencesRes, adjectivesRes, nounsRes] = await Promise.all([
                fetch('/data/sentences.json'),
                fetch('/data/adjectives.json'),
                fetch('/data/nouns.json')
            ]);

            // Check if any of the responses failed
            if (!sentencesRes.ok) throw new Error(`Failed to load sentences.json: ${sentencesRes.status}`);
            if (!adjectivesRes.ok) throw new Error(`Failed to load adjectives.json: ${adjectivesRes.status}`);
            if (!nounsRes.ok) throw new Error(`Failed to load nouns.json: ${nounsRes.status}`);

            const sentencesData = await sentencesRes.json();
            const adjectivesData = await adjectivesRes.json();
            const nounsData = await nounsRes.json();

            // Validate that the data has the expected structure
            if (!sentencesData.sentences || !Array.isArray(sentencesData.sentences) || sentencesData.sentences.length === 0) {
                throw new Error('Invalid sentences data format');
            }
            
            if (!adjectivesData.adjectives || !Array.isArray(adjectivesData.adjectives) || adjectivesData.adjectives.length === 0) {
                throw new Error('Invalid adjectives data format');
            }
            
            if (!nounsData.nouns || !Array.isArray(nounsData.nouns) || nounsData.nouns.length === 0) {
                throw new Error('Invalid nouns data format');
            }

            this.sentences = sentencesData.sentences;
            this.adjectives = adjectivesData.adjectives;
            this.nouns = nounsData.nouns;
            this.loaded = true;
            console.log('Data loaded successfully');
            
            // Clear any error messages and initialize the first insult
            const insultsElement = document.getElementById('insults');
            insultsElement.innerHTML = `
                <span class="insult-part" id="sentence-part"></span>
                <span class="insult-part" id="adjective-part"></span>
                <span class="insult-part" id="noun-part"></span>
            `;
            this.generateInsult();
        } catch (error) {
            console.error('Error loading insult data:', error);
            
            // Add a retry button with more detailed error information
            const insultsElement = document.getElementById('insults');
            insultsElement.innerHTML = `
                <div class="error-message">
                    <p>Error loading insults: ${error.message}</p>
                    <button onclick="window.generator.loadData()" class="btn btn-sm btn-outline-primary">Retry</button>
                </div>
            `;
        }
    }

    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateRandomInsult() {
        const randomSentence = this.getRandomFromArray(this.sentences);
        const randomAdjective = this.getRandomFromArray(this.adjectives);
        const randomNoun = this.getRandomFromArray(this.nouns);

        return {
            sentence: randomSentence,
            adjective: randomAdjective,
            noun: randomNoun
        };
    }

    updateDisplay(parts, isAnimating = false) {
        const insultsContainer = document.getElementById('insults');
        if (!insultsContainer) return;

        // Get the text content for each part
        const sentenceText = typeof parts.sentence === 'object' ? parts.sentence.text : parts.sentence;
        const adjectiveText = typeof parts.adjective === 'object' ? parts.adjective.text : parts.adjective;
        const nounText = typeof parts.noun === 'object' ? parts.noun.text : parts.noun;

        // Create the complete insult text
        const insultText = `${sentenceText} ${adjectiveText} ${nounText}`;

        // Create the translation text (only for final display, not during animation)
        if (!isAnimating) {
            const sentenceTrans = typeof parts.sentence === 'object' ? parts.sentence.translation : parts.sentence;
            const adjectiveTrans = typeof parts.adjective === 'object' ? parts.adjective.translation : parts.adjective;
            const nounTrans = typeof parts.noun === 'object' ? parts.noun.translation : parts.noun;
            const translationText = `${sentenceTrans} ${adjectiveTrans} ${nounTrans}`;
            
            insultsContainer.setAttribute('data-translation', translationText);
        }

        // Update the display
        insultsContainer.innerHTML = `<span class="insult-text">${insultText}</span>`;
        
        // Store current insult
        this.currentInsult = insultText;

        // Announce to screen readers
        this.announceToScreenReader(insultText);
    }

    generateInsult() {
        if (!this.loaded || this.isAnimating) return;

        this.isAnimating = true;
        const insultsElement = document.getElementById('insults');
        insultsElement.classList.add('rotating');
        
        // Keep track of animation frames
        let frames = 0;
        const totalFrames = 30; // Total number of animation frames
        const animationDuration = 2000; // Total animation duration in ms
        const frameInterval = animationDuration / totalFrames;

        const animate = () => {
            if (frames >= totalFrames) {
                // Final state
                this.isAnimating = false;
                insultsElement.classList.remove('rotating');
                this.updateDisplay(this.finalParts);
                this.updateSocialLinks(this.currentInsult);
                return;
            }

            // Generate random parts for animation
            const randomParts = this.generateRandomInsult();
            this.updateDisplay(randomParts, true);

            frames++;
            setTimeout(animate, frameInterval);
        };

        // Store the final insult we'll end with
        this.finalParts = this.generateRandomInsult();
        
        // Start animation
        animate();
    }

    updateSocialLinks(insult) {
        const mainUrl = 'https://scottishinsults.com';
        // Encode the insult text for the URL
        const encodedInsult = encodeURIComponent(insult);
        const callbackUrl = `${mainUrl}/insult.html?text=${encodedInsult}`;
        
        // Create a display version of the insult without pipe characters
        const displayInsult = insult.replace(/\|/g, ' ');
        const shareText = `${displayInsult}\n\nView this insult at: ${callbackUrl}`;
        
        console.log('Share text:', shareText);

        // Add platform-specific classes to the buttons
        const twitterBtn = document.querySelector('button[aria-label="Share on Twitter"]');
        const mastodonBtn = document.querySelector('button[aria-label="Share on Mastodon"]');
        const blueskyBtn = document.querySelector('button[aria-label="Share on Bluesky"]');
        const facebookBtn = document.querySelector('button[aria-label="Share on Facebook"]');
        const linkedinBtn = document.querySelector('button[aria-label="Share on LinkedIn"]');
        const redditBtn = document.querySelector('button[aria-label="Share on Reddit"]');
        const whatsappBtn = document.querySelector('button[aria-label="Share on WhatsApp"]');
        const telegramBtn = document.querySelector('button[aria-label="Share on Telegram"]');
        
        if (twitterBtn) twitterBtn.classList.add('twitter');
        if (mastodonBtn) mastodonBtn.classList.add('mastodon');
        if (blueskyBtn) blueskyBtn.classList.add('bluesky');
        if (facebookBtn) facebookBtn.classList.add('facebook');
        if (linkedinBtn) linkedinBtn.classList.add('linkedin');
        if (redditBtn) redditBtn.classList.add('reddit');
        if (whatsappBtn) whatsappBtn.classList.add('whatsapp');
        if (telegramBtn) telegramBtn.classList.add('telegram');

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
        
        // LinkedIn
        window.shareOnLinkedIn = () => {
            const linkedInText = encodeURIComponent(shareText);
            const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(callbackUrl)}&summary=${linkedInText}`;
            window.open(linkedInUrl, '_blank', 'width=600,height=600');
        };
        
        // Reddit
        window.shareOnReddit = () => {
            const redditText = encodeURIComponent(shareText);
            const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(callbackUrl)}&title=${redditText}`;
            window.open(redditUrl, '_blank', 'width=600,height=600');
        };
        
        // WhatsApp
        window.shareOnWhatsApp = () => {
            const whatsappText = encodeURIComponent(shareText);
            const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
            window.open(whatsappUrl, '_blank', 'width=600,height=600');
        };
        
        // Telegram
        window.shareOnTelegram = () => {
            const telegramText = encodeURIComponent(shareText);
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(callbackUrl)}&text=${telegramText}`;
            window.open(telegramUrl, '_blank', 'width=600,height=600');
        };
        
        // Copy to Clipboard
        window.copyToClipboard = () => {
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    // Show a temporary success message
                    const copyButton = document.querySelector('button[aria-label="Copy to clipboard"]');
                    const originalHTML = copyButton.innerHTML;
                    
                    copyButton.innerHTML = '<img src="/images/check.svg" alt="Copied" class="social-icon">';
                    copyButton.classList.add('btn-success');
                    copyButton.classList.remove('btn-outline-primary');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalHTML;
                        copyButton.classList.remove('btn-success');
                        copyButton.classList.add('btn-outline-primary');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy to clipboard. Please try again.');
                });
        };
    }

    speakCurrentInsult() {
        if (!this.currentInsult) {
            console.log('No insult to speak');
            return;
        }

        // Check if speechManager exists
        if (!this.speechManager) {
            console.log('Speech manager not initialized');
            return;
        }

        try {
            // Get the current text content from the DOM elements
            const sentencePart = document.getElementById('sentence-part');
            const adjectivePart = document.getElementById('adjective-part');
            const nounPart = document.getElementById('noun-part');

            if (sentencePart && adjectivePart && nounPart) {
                const textToSpeak = `${sentencePart.textContent} ${adjectivePart.textContent} ${nounPart.textContent}`;
                this.speechManager.speak(textToSpeak);
            } else {
                console.log('Could not find insult elements');
            }
        } catch (error) {
            console.error('Error speaking insult:', error);
        }
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

    // Add this method to create the aria-live region
    createAriaLiveRegion() {
        // Remove any existing aria-live region
        const existingRegion = document.getElementById('aria-live-region');
        if (existingRegion) {
            existingRegion.remove();
        }

        // Create new aria-live region
        const ariaLiveRegion = document.createElement('div');
        ariaLiveRegion.id = 'aria-live-region';
        ariaLiveRegion.className = 'sr-only';
        ariaLiveRegion.setAttribute('aria-live', 'polite');
        ariaLiveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(ariaLiveRegion);
    }

    // Add this method for screen reader announcements
    announceToScreenReader(text) {
        const ariaLiveRegion = document.getElementById('aria-live-region');
        if (ariaLiveRegion) {
            ariaLiveRegion.textContent = text;
        }
    }

    // Add CSS for screen reader only content
    addScreenReaderCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);
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
    
    // Add window resize event listener to update display on screen size changes
    window.addEventListener('resize', () => {
        if (generator.currentInsult) {
            // Re-display the current insult with appropriate formatting for the new screen size
            const cleanText = generator.currentInsult.endsWith('!') ? generator.currentInsult.slice(0, -1) : generator.currentInsult;
            const [sentence, adjective, noun] = cleanText.split('|');
            
            const insultsElement = document.getElementById('insults');
            insultsElement.innerHTML = `
                <span class="insult-part final">${sentence}</span>
                <span class="insult-part final">${adjective}</span>
                <span class="insult-part final">${noun}</span>!
            `;
            insultsElement.classList.add('final');
        }
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
            
            // Check if we're on a mobile device
            const isMobile = window.innerWidth <= 768;
            
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

    generator.addScreenReaderCSS();
}); 