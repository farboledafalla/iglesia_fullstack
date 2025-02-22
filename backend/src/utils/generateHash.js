const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Nuevo hash para 123456:', hash);
}

generateHash(); 