const { EntropyScanner } = require('../packages/secret-masker/dist');
const { shannonEntropy } = require('../packages/secret-masker/dist/entropy/shannonEntropy');
const scanner = new EntropyScanner();
const token = 'AKIA4EXAMPLE12345678';
console.log('shannonEntropy token=', shannonEntropy(token));
console.log('scanner.scan token=token:', scanner.scan('token=' + token));
console.log('scanner.scan output:token', scanner.scan('output: ' + token));
