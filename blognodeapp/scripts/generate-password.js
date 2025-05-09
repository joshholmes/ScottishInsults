const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
    console.error('Please provide a password as an argument');
    process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
    console.log('Password hash:', hash);
    console.log('\nAdd this hash to the ADMIN_PASSWORD constant in blog-server.js');
}); 