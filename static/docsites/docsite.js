const BASE_URL = "/docsites"
var converter = new showdown.Converter();

var makeRequest = function(url, varsObj) {
	var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) return;
			if (request.status >= 200 && request.status < 300) {
				parseResponse(request.responseText, varsObj);
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

var parseResponse = function(contents, varsObj) {
    var matches = contents.match(/\++([^\+]+)\++([^]*)/i);
    var variablesLines = matches[1].trim().split("\n");
    for (let i in variablesLines){
        let lineParts = variablesLines[i].split("=")
        if(lineParts.length === 2){
            varsObj[lineParts[0].trim()] = lineParts[1].trim().replace(/'/g, "").replace(/"/g, "");
        }
    }
    varsObj.content = converter.makeHtml(matches[2].trim());
};

var removeLoadingDiv = function() {
    var el = document.getElementById('loading-div');
    if (el) {
        el.remove();
    }
}

document.addEventListener("DOMContentLoaded", function(){
    let pageSrc = document.body.innerHTML;
    let template = Handlebars.compile(pageSrc);
    let tokenizer = Handlebars.parse(pageSrc);
    let tokens = {}

    for(let i in tokenizer.body) {
        const token = tokenizer.body[i];
        if(token.type == 'MustacheStatement') {
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
            promises.push(makeRequest(url, tokens[docSite][mdPath]));
        }
    }
    // Wait for all promises till complete
    const reflect = p => p.then(v => ({v, status: "fulfilled" }),
                                e => ({e, status: "rejected" }));
    Promise.all(promises.map(reflect)).then(() => {
        document.body.innerHTML = template(tokens);
        // remove loading div
        removeLoadingDiv();
    });
});
