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
- Blog section with Scottish language and culture articles

## Origin Story

The original idea for ScottishInsults.com came when I heard Donald Trump say in Scotland, "Great day for the Scots, you got what you wanted" referring to Brexit. Sue Perkins, a Scottish comedian, responded with the brilliant retort, "We voted remain you weapons grade plum."

That phrase "weapons grade plum" struck me as something special. It perfectly captured the Scottish talent for creative, colorful, and often hilarious insults. The Scots have a unique way with words, turning everyday objects into cutting remarks with a poetic flair that's both humorous and impressive.

## Project Structure

```
/
├── public_html/           # Static files
│   ├── .htaccess         # Main .htaccess for static files
│   ├── *.html            # HTML pages
│   ├── robots.txt        # Search engine directives
│   ├── sitemap.xml       # Site map for search engines
│   └── public/           # Public assets
│       ├── scripts/      # Client-side JavaScript
│       ├── images/       # Static images
│       ├── styles.css    # Main styles
│       └── theme.css     # Theme styles
└── blognodeapp/          # Node.js application
    ├── .htaccess         # Node.js specific .htaccess
    ├── app.js            # Main application file
    ├── blog-engine.js    # Blog functionality
    ├── package.json      # Node.js dependencies
    ├── .env              # Environment variables
    ├── views/            # EJS templates
    ├── private/          # Private data
    └── data/             # JSON data files
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/joshholmes/scottishinsults.git
cd scottishinsults
```

2. Install dependencies:
```bash
cd blognodeapp
npm install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Data Structure

The application uses three JSON files to generate insults:

- `blognodeapp/data/sentences.json` - Contains sentence structures
- `blognodeapp/data/adjectives.json` - Contains adjectives
- `blognodeapp/data/nouns.json` - Contains nouns

## Blog Features

- Admin interface for managing blog posts
- Clean URLs for blog posts
- SEO-friendly structure
- Mobile-responsive design
- Social sharing integration

## Development

The project uses:
- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js with Express
- EJS templating
- MySQL database
- PM2 for process management

## Deployment

For deployment instructions, see the [DEPLOYMENT.md](DEPLOYMENT.md) file.

## License

ISC License 