const BASE_URL = "/docsites"
var converter = new showdown.Converter();

function DocSite(onLoaded) {
    this.docsiteLoaded = onLoaded || function () { };
}

DocSite.prototype.makeRequest = function (url, varsObj) {
    var self = this;
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {
            if (request.readyState !== 4) return;
            if (request.status >= 200 && request.status < 300) {
                self.parseResponse(request.responseText, varsObj);
                resolve()
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        request.open('GET', url, true);
        request.send();
    });
};
DocSite.prototype.parseResponse = function (contents, varsObj) {
    var matches = contents.match(/\++([^\+]+)\++([^]*)/i);
    var variablesLines = matches[1].trim().split("\n");
    for (let i in variablesLines) {
        let lineParts = variablesLines[i].split("=")
        if (lineParts.length === 2) {
            varsObj[lineParts[0].trim()] = lineParts[1].trim().replace(/'/g, "").replace(/"/g, "");
        }
    }
    varsObj.content = converter.makeHtml(matches[2].trim());
};
DocSite.prototype.removeLoadingDiv = function () {
    var el = document.getElementById('loading-div');
    if (el) {
        el.remove();
    }
}
DocSite.prototype.hasHandlebars = function (s) {
    if (!s) {
        return;
    }
    return s.includes('{{{') && s.includes('}}}');
}
DocSite.prototype.getHandlebarsWithElements = function () {
    var self = this;
    let all = [];

    let iter = document.createNodeIterator(
        document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    let node = iter.nextNode();

    while (node) {
        if (node.nodeType == Node.TEXT_NODE) {
            if (self.hasHandlebars(node.textContent)) {
                all.push({
                    element: node,
                    reference: node.textContent,
                });
            }
        }

        // maybe any attribute too
        for (let i in node.attributes) {
            let attr = node.attributes[i];
            if (self.hasHandlebars(attr.value)) {
                all.push({
                    element: node,
                    reference: attr.value,
                    attr: attr.name,
                });
            }
        }

        node = iter.nextNode();
    }

    return all;
}
DocSite.prototype.onWindowLoaded = function () {
    var self = this;
    let handles = self.getHandlebarsWithElements();
    let references = handles.map(function (handle) {
        return handle.reference;
    });
    let tokenizer = Handlebars.parse(references.join("\n"));
    let tokens = {}

    for (let i in tokenizer.body) {
        const token = tokenizer.body[i];
        if (token.type == 'MustacheStatement') {
            // token.path.original will be like `githubAccount.githubRepo.path.to.file.md.variableName`
            const parts = token.path.original.split(".");
            const variableName = parts.pop();
            const docSite = parts.shift();
            const mdPath = parts.join(".");

            // Build tokens object that we will loop on it to get variables
            tokens[docSite] = tokens[docSite] || {};
            tokens[docSite][mdPath] = tokens[docSite][mdPath] || {};
            tokens[docSite][mdPath][variableName] = "";
        }
    }

    // Get md pages
    promises = [];
    for (let docSite in tokens) {
        for (let mdPath in tokens[docSite]) {
            let url = `${BASE_URL}/${docSite}/${mdPath.replace(/\./g, "/")}.md`;
            promises.push(self.makeRequest(url, tokens[docSite][mdPath]));
        }
    }

    // Wait for all promises till complete
    const reflect = p => p.then(v => ({ v, status: "fulfilled" }),
        e => ({ e, status: "rejected" }));

    Promise.all(promises.map(reflect)).then(() => {
        // update element by element
        for (let i in handles) {
            let handle = handles[i];
            let value = Handlebars.compile(handle.reference)(tokens);
            // value can be only text content or an html string
            if (handle.attr) {
                handle.element.setAttribute(handle.attr, value);
            } else {
                // if not an attribute, replace the element itself with a new fragment
                // that contains one or more elements (or even a single text element)
                let frag = document.createRange().createContextualFragment(value);
                handle.element.replaceWith(frag);
            }
        }
        // remove loading div
        self.removeLoadingDiv();
        self.docsiteLoaded();
    });
};
DocSite.prototype.init = function () {
    window.addEventListener("load", this.onWindowLoaded.bind(this));
}
