sonic_search = function (query)
{
    var info = {
        "namespace": "default",
        "actor": "sonic",
        "command": "query",
        "args": {"collection":"docsites", "bucket":NAME, "text":query},
        "headers": {"response_type":"json"}
    }
    console.log(info);
    return GEDIS_CLIENT.execute(info)
}
