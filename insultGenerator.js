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
        this.currentInsult = `${this.finalParts.sentence.trim()} ${this.finalParts.adjective} ${this.finalParts.noun}!`;

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
            this.updateSocialLinks(this.currentInsult);
        }, maxDuration + 500); // Add 500ms buffer
    }

    updateSocialLinks(insult) {
        // Twitter/X
        window.shareOnTwitter = () => {
            const tweetText = encodeURIComponent(insult + ' from @scottishinsults');
            const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&hashtags=scottishinsults`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
        };

        // Mastodon
        window.shareOnMastodon = () => {
            const mastodonText = encodeURIComponent(insult + ' #scottishinsults');
            const mastodonUrl = `https://mastodon.social/share?text=${mastodonText}`;
            window.open(mastodonUrl, '_blank', 'width=600,height=400');
        };

        // Bluesky
        window.shareOnBluesky = () => {
            const blueskyText = encodeURIComponent(insult + ' #scottishinsults');
            const blueskyUrl = `https://bsky.app/intent/compose?text=${blueskyText}`;
            window.open(blueskyUrl, '_blank', 'width=600,height=400');
        };

        // Facebook
        window.shareOnFacebook = () => {
            const shareUrl = window.location.href;
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(insult)}`;
            window.open(fbUrl, '_blank', 'width=626,height=436');
        };
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
    generator.generateInsult(); // Auto-generate first insult

    // Initialize AdSense
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('Error initializing AdSense:', e);
    }
}); 