import { hashSync, compareSync } from 'bcryptjs';
const hash = hashSync('mypassword', 10);
console.log('hash:', hash);
console.log('correct password matches:', compareSync('mypassword', hash));
console.log('wrong password matches:', compareSync('wrongpassword', hash));