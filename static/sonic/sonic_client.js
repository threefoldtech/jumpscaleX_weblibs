sonic_search = query => {
    return localGedisClient.actors.sonic.query({ "name": NAME, "text": query })
        .then(res => res.json())
}
