sonic_search = function (name, query)
{
    var info = {
        "namespace": "default",
        "actor": "sonic",
        "command": "query",
        "args": {"collection":"docsites", "bucket":name, "text":query},
        "headers": {"response_type":"json"}
    }
    return GEDIS_CLIENT.execute(info)
}
