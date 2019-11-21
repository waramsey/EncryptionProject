import { createRequireFromPath } from "module";

//Make Connection
var socket = io.connect('http://localhost:4000');

//Query DOM
var message = document.getElementById('message');
var submit = document.getElementById('encrypt');

//Prime Number Finder
function primeTest(n, k) {
	if (n % 2 === 0) {
		return false;
	}
	
	var d = 1;
    var temp = n - 1;
    var r = 0;
    do {
        temp = temp / 2;
        r++;
    } while (Number.isInteger(temp));
    r--;
    
    while (n - 1 !== d * Math.pow(2, r)) {
		d++;
	}

	for (; k >= 0; k--) {
		if (!millerRabin(n, d)) {
			return false;
		}
	}
	return true;
}


//Miller-Rabin test, which determines if a number is composit or not.
function millerRabin(n, d) {
	var a = Math.ceil((n - 3) * Math.random()) + 1;
	var testRes = Math.pow(a, d) % n;
	if (testRes === 1 || testRes === (n - 1)) {
		return true;
	}
	
	while (true) {
		testRes = Math.pow(testRes, 2) % n;
		if (testRes === 1) {
			return false;
		} else if (testRes === n - 1) {
			return true;
		}
	}
}

//User input
socket.on('encryptor-div', function(data){
    
    data.message.value = '';
});

//Greatest Common Denominator
function gcd(a, b) {
    if (b == 0) {
        return a;
    }

    return gcd(b, a % b);
}

//Generate Key
function genKey() {
    var a = prime();
    var b = prime();

    var n = a * b;

    var phi = (a - 1) * (b - 1);
    var exp = 2; //starting at 1 could make it easy to crack
    while (exp < phi) {
        if(gcd(exp, phi) == 1) {
            break;
        }
        exp++;
    }
}

//Encrypt input (add generated key to plaintext characters, acceptable range is 32 - 126)
function encryptInput(plainChar, publicExponent, publicKey) {
    var m = plainChar;
    for(var i = 0; i < publicExponent; i++) {
        m *= plainChar;
    }

    m %= publicKey;

    while (m < 32) {
        m += 94;
    }
    while (m > 126) {
        m -= 94;
    }

    return m;
}
