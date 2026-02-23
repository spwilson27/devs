const { SecretMaskerFactory, identifySecrets, validateHits, replaceHits } = require('../packages/secret-masker/dist');
const { EntropyScanner } = require('../packages/secret-masker/dist');
const masker = SecretMaskerFactory.create();
const token = 'AKIA4EXAMPLE12345678';
const input1 = 'token=' + token;
const input2 = 'output: ' + token;
console.log('identify token=');
const raw1 = identifySecrets(input1, masker['patterns'] || [], masker['entropyScanner'] || new EntropyScanner());
console.log(raw1);
console.log('validated token=');
const val1 = validateHits(raw1);
console.log(val1);
console.log('replaced token=');
console.log(replaceHits(input1, val1));

console.log('identify output:');
const raw2 = identifySecrets(input2, masker['patterns'] || [], masker['entropyScanner'] || new EntropyScanner());
console.log(raw2);
console.log('validated output:');
const val2 = validateHits(raw2);
console.log(val2);
console.log('replaced output:');
console.log(replaceHits(input2, val2));

console.log('masker token=');
console.log(masker.mask(input1));
console.log('masker output:');
console.log(masker.mask(input2));
