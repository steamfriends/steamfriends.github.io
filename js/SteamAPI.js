function SteamAPI() {
    var apiURI = 'http://steamfriends.herokuapp.com/api/';//http://api.steamfriends.home/api/
    this.getPlayersSummaries = function (ids, onLoad)
    {
        $.getJSON(apiURI + 'getPlayersSummaries.php?ids=' + (Array.isArray(ids) ? ids.join(',') : ids), onLoad);
    }
    this.getPlayerSummariesByName = function (name, onLoad)
    {
        $.getJSON(apiURI + 'getPlayersSummaries.php?name=' + name, onLoad);
    }
    this.getFriendList = function (id, onLoad)
    {
        $.getJSON(apiURI + 'getFriendList.php?id=' + id, onLoad);
    }
    this.getPlayerAliases = function (id, onLoad)
    {
        $.getJSON(apiURI + 'getPlayerAliases.php?id=' + id, onLoad);
    }
    this.getGroupInfo = function (id, onLoad)
    {
        $.getJSON(apiURI + 'getGroupInfo.php?id=' + id, onLoad);
    }
    this.getOwnedGames = function (id, onLoad)
    {
        $.getJSON(apiURI + 'getOwnedGames.php?id=' + id, onLoad);
    }
    this.getPlayerBans = function (ids, onLoad)
    {
        $.getJSON(apiURI + 'getPlayerBans.php?ids=' + (Array.isArray(ids) ? ids.join(',') : ids), onLoad);
    }
}

