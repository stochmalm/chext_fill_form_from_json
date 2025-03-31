//region: boilerplate
let button_fill_form_from_json = document.getElementById('button_fill_form_from_json');
button_fill_form_from_json.onclick = function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        fill_form_now(tabs[0]);
    });
};

// Execute the inject.js in a tab and call a method,
// passing the result to a callback function.
function injectedMethod(tab, method, callback) {
    // In MV3, use chrome.scripting.executeScript:
    chrome.scripting.executeScript(
        {
            target: {tabId: tab.id},
            files: ['inject.js']
        },
        () => {
            // Once inject.js is injected, send a message to that content script
            chrome.tabs.sendMessage(tab.id, {method: method}, callback);
        }
    );
}

//endregion boilerplate

//call the injected function fill_form_now
function fill_form_now(tab) {
    //pass json through storage
    chrome.storage.local.set(
        {fill_form_json: document.getElementById("textarea_json").value},
        function () {
            injectedMethod(tab, "fill_form_now", function (ignored) {
                return true;
            });
        }
    );
}


/* File url read */
var input_fileurl_value = document.getElementById('input_fileurl');
let button_fill_form_from_url = document.getElementById('button_fill_form_from_url');
button_fill_form_from_url.onclick = function () {
    fileurl_read();
};

// read from storage the last url and fill the input:
var localstorage_key_data_name = 'chext_fill_form_from_json_from_fileurl';
var storage_fileurl = localStorage.getItem(localstorage_key_data_name);
if (storage_fileurl) {
    input_fileurl_value.value = storage_fileurl;
}

function fileurl_read() {
    // save the url for the next time
    var storage_fileurl = input_fileurl_value.value;
    localStorage.setItem(localstorage_key_data_name, storage_fileurl);

    if (storage_fileurl && isValidHttpUrl(storage_fileurl)) {
        getJSON(storage_fileurl, function (err, data) {
            document.getElementById('textarea_json').value = err ? JSON.stringify(err) : JSON.stringify(data, null, 2);

            if (!err && data) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    fill_form_now(tabs[0]);
                });
            }
        });
    } else if (storage_fileurl) {
        alert('Invalid URL');
    }
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

const fileInput = document.getElementById('file_input');
const pickFileButton = document.getElementById('button_pick_file');

pickFileButton.addEventListener('click', () => {
    // Programmatically open the file dialog
    fileInput.click();
});

// When the user selects a file:
fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) {
        console.log(file);

        const reader = new FileReader();
        reader.onload = function () {
            let data = JSON.parse(reader.result);
            // Place JSON in your existing textarea
            document.getElementById('textarea_json').value = JSON.stringify(data, null, 2);

            // Then call your existing fill_form_now
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                fill_form_now(tabs[0]);
            });
        };
        reader.readAsText(file);

        // Reset input for cases when loading the same file multiple times.
        fileInput.onclick = function () {
            this.value = null;
        };
    }
});

const version = document.getElementById('app_version');
version.innerHTML = 'ver. ' + chrome.runtime.getManifest().version;
