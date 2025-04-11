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
