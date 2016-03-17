function GroupCache(steamAPI)
{
    var data = {};

    this.get = function (id, onFound) {
        if ((id in data) && (onFound !== undefined)) {
            onFound(data[id]);
        } else {
            var onLoad = function (info) {
                data[id] = info;
                if (onFound !== undefined)
                    onFound(info);
            };
            steamAPI.getGroupInfo(id, onLoad);
        }
    };
}


