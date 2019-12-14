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
    postEncryption.innerHTML += '<p>' + encryptInput(data.message) + '</p>';
    cypherMessage.value = encryptInput(data.message);
    // postEncryption.innerHTML += '<p>' + data.message + '</p>';
    // cypherMessage.value = data.message;
});
socket.on('decryptor-div', function(data){
    postDecryption.innerHTML += '<p>' + decryptInput(data.cypherMessage) + '</p>';
});


//Encrypt input (add generated key to plaintext characters, acceptable range is 32 - 126)
//Dr Ricks thinks it is encrypted in chunks, continue research
function encryptInput(userInput) {
    genKey();

    var publicKey = pubKey[0];
    var publicExponent = pubKey[1];

    var cypherText = '';

    for (var i = 0; i < userInput.length; i++) {
        //encrypt character
        var m = Math.pow(userInput.charCodeAt(i), publicExponent);

        m %= publicKey;
        cypherText += m.toString();
    }

    return cypherText;
}


//Generate Key: a public key is made up of 
//"n" (two prime numbers, 1024 digits each) 
//and "exp" (the public exponent)
function genKey() {
    console.log('randlargeprime a');
    var a = randLargePrime();
    console.log('randlargeprime b');
    var b = randLargePrime();

    var n = a * b; //1st part of both keys

    var phi = (a - 1) * (b - 1);
    var exp = 3; //2nd part of PUBLIC key
    while (exp < phi) {
        if(gcd(exp, phi) == 1) {
            break;
        }
        exp += 2;
    }

    //phi is already phi of n
    //(d * exp) % phi = 1
    var d = 0;
    do {
        d++;
    } while ((d * exp) % phi !== 1);

    pubKey = [n, exp];
    privKey = [n, d];
}


//generates a prime 1024 digits long.  Had to reduce the size of the prime so javascript wouldn't call it 'infinity.'
function randLargePrime() {
    var guess = 0;
    var value = 0;
    console.log('entered randlargeprime loop');

    do {
        guess = Math.pow(10, 1) + Math.floor(Math.random() * 9 * Math.pow(10, 1));
    } while (!primeTest(guess, 5)); //the '20' is how many times we want to run the miller-rabin test.
    console.log('escaped randlargeprime loop');

    return value;
}


//Prime Number Finder
function primeTest(n, k) {
	if (n % 2 === 0) {
		return false;
	}
    console.log('primetest 1');

    //We use the Fermat Primality Test to determine primality
    for (; k >= 0; k--) {
        var a = k;
    
        if (gcd(a, n) !== 1) {
            return false;
        } else {
            var power = a;
            for (var i = n - 1; i > 0; i--) {
                power *= a;
            }
            if (power % n !== 1) {
                return false;
            }
        }
    }

	return true;
}


//Greatest Common Denominator
function gcd(a, b) {
    if (b == 0) {
        return a;
    }
    console.log('found gcd');

    return gcd(b, a % b);
}


//Miller-Rabin test, which determines if a number is composit or not.
// function millerRabin(n, d) {
//     console.log('entered miller rabin');

// 	var a = Math.ceil((n - 3) * Math.random()) + 1;
// 	var testRes = Math.pow(a, d) % n; //This number is too darn big
// 	if (testRes === 1 || testRes === (n - 1)) {
// 		return true;
// 	}
//     console.log('miller rabin pt 2');

// 	while (true) {
// 		testRes = Math.pow(testRes, 2) % n;
// 		if (testRes === 1) {
// 			return false;
// 		} else if (testRes === n - 1) {
// 			return true;
// 		}
// 	}
// }


//For decrypting the user input
function decryptInput(cypherText) {
    var decryptedText = '';

    var publicKey = privKey[0];
    var privateKey = privKey[1];


    for (var i = 0; i < cypherText.length; i++) {
        //decrypt character
        var m = Math.pow(cypherText.charCodeAt(i), privateKey);

        m %= publicKey;
        decryptedText += m.toString();
    }

    return decryptedText;
}