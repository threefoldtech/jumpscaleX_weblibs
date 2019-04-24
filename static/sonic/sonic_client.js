sonic_search = function (name, query)
{
    console.log("inside");
    var info = {
        "namespace": "default",
        "actor": "sonic",
        "command": "query",
        "args": {"collection":"docsites", "bucket":name, "text":query},
        "headers": {"response_type":"json"}
    }
    return GEDIS_CLIENT.execute(info)
}
sonic_search("abdo", "dev").then((res) => {console.log(res)})
