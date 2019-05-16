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

    // search elements with text content or attributes that contain "{{{" and "}}}"
    let result = document.evaluate(
        "//*[contains(text(),'{{{') and contains(text(),'}}}') or @*[contains(., '{{{') and contains(., '}}}')]]",
        document,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
    );

    let node = result.iterateNext();
    while (node) {
        if (!self.hasHandlebars(node.textContent)) {
            // one of the attributes, not the content
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
        } else {
            all.push({
                element: node,
                reference: node.textContent,
            });
        }

        node = result.iterateNext();
    }

    return all;
}
DocSite.prototype.onWindowLoaded = function () {
    var self = this;
    let handles = self.getHandlebarsWithElements();
    let references = handles.map(function (element) {
        return element.reference;
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
            if (handle.attr) {
                handle.element.setAttribute(handle.attr, value);
            } else {
                // no attribute, update inner html
                handle.element.innerHTML = value;
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
