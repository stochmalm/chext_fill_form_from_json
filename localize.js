// https://stackoverflow.com/a/39810769/7974082

function replace_i18n(obj, tag) {
    const msg = tag.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if (msg !== tag) obj.innerHTML = msg;
}

function localizeHtmlPage() {
    // Localize using __MSG_***__ data tags
    const data = document.querySelectorAll('[data-localize]');

    for (var i in data) if (data.hasOwnProperty(i)) {
        const obj = data[i];
        const tag = obj.getAttribute('data-localize').toString();

        replace_i18n(obj, tag);
    }
}

localizeHtmlPage();