# Scottish Insults Generator

A fun web application that generates Scottish-style insults using a combination of sentences, adjectives, and nouns.

## Features

- Generates unique Scottish insults
- Animated insult generation
- Social media sharing integration (Twitter, Mastodon, Bluesky, Facebook)
- Text-to-speech functionality
- Responsive design
- Mobile-friendly
- Shareable insult URLs

## Origin Story

The original idea for ScottishInsults.com came when I heard Donald Trump say in Scotland, "Great day for the Scots, you got what you wanted" referring to Brexit. Sue Perkins, a Scottish comedian, responded with the brilliant retort, "We voted remain you weapons grade plum."

That phrase "weapons grade plum" struck me as something special. It perfectly captured the Scottish talent for creative, colorful, and often hilarious insults. The Scots have a unique way with words, turning everyday objects into cutting remarks with a poetic flair that's both humorous and impressive.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/joshholmes/scottishinsults.git
cd scottishinsults
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `index.html` - Main application page
- `about.html` - About page with project information
- `server.js` - Express.js server for serving static files
- `insultGenerator.js` - Core functionality for generating insults
- `speech.js` - Text-to-speech functionality
- `styles.css` & `theme.css` - Styling for the application
- `data/` - JSON files containing sentences, adjectives, and nouns
- `images/` - SVG icons for social sharing and speech

## Data Structure

The application uses three JSON files to generate insults:

- `data/sentences.json` - Contains sentence structures (e.g., "Don't be a", "Such a")
- `data/adjectives.json` - Contains adjectives (e.g., "nuclear", "wee", "weapons-grade")
- `data/nouns.json` - Contains nouns (e.g., "bampot", "doughball", "pup")

## Customization

To add more insults:

1. Edit the JSON files in the `data/` directory
2. Add new sentences, adjectives, or nouns to the respective arrays
3. Restart the server

## Deployment

For deployment instructions, see the [DEPLOYMENT.md](DEPLOYMENT.md) file.

## Development

The project uses:
- HTML5
- CSS3
- JavaScript (ES6+)
- Express.js for serving static files

## License

ISC License 