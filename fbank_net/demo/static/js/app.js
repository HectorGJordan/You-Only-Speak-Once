//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream;             //stream from getUserMedia()
var rec;                   //Recorder.js object
var input;                 //MediaStreamAudioSourceNode we'll be recording
var audioBlob;             // Blob for the recorded audio
var filename;              // Filename for the recorded audio

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");
var importAudio = document.getElementById("importAudio");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
importAudio.addEventListener("change", handleAudioUpload);

function startRecording() {
    console.log("recordButton clicked");

    var constraints = { audio: true, video:false }

    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false;

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        audioContext = new AudioContext();

        document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);

        rec = new Recorder(input,{numChannels:1})

        rec.record()

        console.log("Recording started");

    }).catch(function(err) {
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}

function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        rec.stop();
        pauseButton.innerHTML="Resume";
    }else{
        rec.record()
        pauseButton.innerHTML="Pause";
    }
}

function stopRecording() {
    console.log("stopButton clicked");

    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;

    pauseButton.innerHTML="Pause";

    rec.stop();

    gumStream.getAudioTracks()[0].stop();

    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');

    filename = new Date().toISOString();

    au.controls = true;
    au.src = url;

    link.href = url;
    link.download = filename + ".wav";
    link.innerHTML = "Save to disk";

    li.appendChild(au);
    li.appendChild(document.createTextNode(filename + ".wav "))
    li.appendChild(link);

    var upload = document.createElement('a');
    upload.href = "#";
    upload.innerHTML = "Upload";

    li.appendChild(document.createTextNode(" "))
    li.appendChild(upload)

    recordingsList.appendChild(li);

    audioBlob = blob;  // Store the blob for uploading
}

function handleAudioUpload(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            var blob = new Blob([data], { type: 'audio/wav' });
            createDownloadLink(blob);
        };
        reader.readAsArrayBuffer(file);
    }
}

var submitButton = document.getElementById('submitButton');
submitButton.addEventListener("click", function (event) {
    if (!audioBlob) {
        alert("Please record or import an audio before submitting.");
        return;
    }

    var username = document.getElementById('username').value;
    var action = document.getElementById("action").value;
    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target.responseText);
            var response = e.target.responseText;
            if (action === 'register') {
                document.getElementById("result").innerText = 'Hey ' + username + ', You have been registered!';
            } else {
                if (response === 'SUCCESS') {
                    document.getElementById("result").innerText = 'Hey ' + username + ', Welcome, it is you!';
                } else {
                    document.getElementById("result").innerText = 'The system does not think you are who you say you are!';
                }
            }
        }
    };
    var fd = new FormData();
    fd.append("file", audioBlob, filename);
    fd.append("username", username);
    xhr.open("POST", "/" + action + "/" + username, true);
    xhr.send(fd);
});

var loadWikiArticle = function (e) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://en.wikipedia.org/api/rest_v1/page/random/summary', true);
    xhr.onloadend = function (e) {
        var res = JSON.parse(e.target.responseText);
        document.getElementById('readingText').innerText = res['extract'];
    };
    xhr.send();
};

var actionSelect = document.getElementById('action');
actionSelect.onchange = loadWikiArticle;

document.getElementById("howTo").hidden = true

document.getElementById("expandCollapse").onclick = function () {
    let howToHidden = document.getElementById("howTo").hidden;
    document.getElementById("howTo").hidden = !howToHidden;
}
