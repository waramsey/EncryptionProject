//Make Connection
var socket = io.connect('http://localhost:4000');

//Query DOM
var message = document.getElementById('message');
var submit = document.getElementById('encrypt');
var postEncryption = document.getElementById('postEncryption');
var cypherMessage = document.getElementById('cypher-message');
var decrypt = document.getElementById('decrypt');
var postDecryption = document.getElementById('postDecryption');

//Keys
var pubKey;
var privKey;


//listens for the user's click on the encrypt button
submit.addEventListener('click', function(){
    socket.emit('encryptor-div', {
        message: message.value
    });
});
decrypt.addEventListener('click', function(){
    socket.emit('decryptor-div', {
        cypherMessage: cypherMessage.value
    });
});

//when user clicks on encrypt, encrypts the message
socket.on('encryptor-div', function(data){
    genKey();
    var encrypted = encryptInput(data.message);
    postEncryption.innerHTML = '<p>' + encrypted + '</p>';
    cypherMessage.value = encrypted;
});
socket.on('decryptor-div', function(data){
    postDecryption.innerHTML = '<p>' + decryptInput(data.cypherMessage) + '</p>';
});


//Encrypt input (add generated key to plaintext characters, acceptable range is 32 - 126)
//Dr Ricks thinks it is encrypted in chunks, continue research
function encryptInput(userInput) {
    var publicKey = pubKey[0];
    var publicExponent = pubKey[1];

    var cypherText = '';

    for (var i = 0; i < userInput.length; i++) {
        //encrypt character
        var m = modulo(userInput.charCodeAt(i), publicExponent, publicKey);
        cypherText += m + " ";
    }

    return cypherText;
} //restrict cyphering into a range of valid chars 33-126


//Generate Private and Public Keys
function genKey() {
    //generate 2 random primes
    var a = randLargePrime();
    var b;
    do {
        b = randLargePrime();
    } while (a === b);

    //multiply primes to get n, the public key
    var n = a * b;

    //calculate phi(n)
    var phi = (a - 1) * (b - 1);

    //calculate public exponent
    var exp = 3;
    while (exp < phi) {
        if(gcd(exp, phi) == 1) {
            break;
        }
        exp += 2;
    }

    //calculate private key (d)
    var d = 0;
    var count = 1;
    do {
        d = (count * phi + 1) / exp;
        count++;
    } while (!Number.isInteger(d));

    //store keys and public exponent
    pubKey = [n, exp];
    privKey = [n, d];
}


//generates a prime 1024 bis long.  Had to reduce the size of the prime so the calculations would cause issues.
function randLargePrime() {
    var guess = 0;

    do {
        guess = Math.pow(10, 2) + Math.floor(Math.random() * 9 * Math.pow(10, 2));
    } while (!primeTest(guess, 40)); //the '40' is how many times we want to run the miller-rabin test.

    return guess;
}


//Prime Number Finder
function primeTest(n, k) {
	if (n % 2 === 0) {
		return false;
	}

    //We use the Fermat Primality Test to determine primality
    for (; k > 0; k--) {
        var a = Math.ceil(Math.random() * (n - 1));

        if (gcd(a, n) !== 1) {
            return false;
        } else if (modulo(a, (n - 1), n) !== 1) {
            return false;
        }
    }

	return true;
}


//Greatest Common Denominator
function gcd(a, b) {
    if (b == 0) {
        return a;
    }

    return gcd(b, a % b);
}


//calculates a^b % c, adapted for javascript from the method presented at:
//https://www.topcoder.com/community/competitive-programming/tutorials/primality-testing-non-deterministic-algorithms/
//This is called modular exponentiation, and it's purpose is to perform
//the calculation without producing a number so large it would cause issues.
function modulo(a, b, c) {
    var temp = 1;
    for (var i = 0; i < b; i++) {
        temp *= a;
        temp %= c;
    }
    return temp % c;
}


//For decrypting cyphertext
function decryptInput(cypherText) {
    var decryptedText = '';

    var publicKey = privKey[0];
    var privateKey = privKey[1];
    var letter = "";

    for (var i = 0; i < cypherText.length; i++) {
        if (cypherText[i] >= '0' && cypherText[i] <= '9') {
            letter += cypherText[i];
        } else {
            var m = modulo(parseInt(letter, 10), privateKey, publicKey);
            decryptedText += String.fromCharCode(m % 128);
            letter = "";
        }
    }

    return decryptedText;
}

