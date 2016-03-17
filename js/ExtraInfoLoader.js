function ExtraInfoLoader(outputNodes, steamAPI, groupCache)
{
    var uncheckedNodes = [];//{id: 1234, group: false, aliases: false, ownedGames: false, bans: false}
    var isJobActive = false;

    this.add = function (id) {
        uncheckedNodes.push({id: id, aliases: false, group: false, ownedGames: false, bans: false});

        var loadInfo = function ()
        {
            isJobActive = true;
            var current = uncheckedNodes[0];
            var processNext = function () {
                if (current.aliases && current.group && current.ownedGames)
                    uncheckedNodes.shift();

                if (uncheckedNodes.length > 0) {
                    loadInfo();
                } else {
                    isJobActive = false;
                }
            };
            //callbacks
            var aliasesLoaded = function (aliases) {
                current.aliases = true;
                outputNodes.get(current.id).data.aliases = aliases;
                processNext();
            };

            var groupLoaded = function (group) {
                current.group = true;
                processNext();
            };

            var ownedGamesLoaded = function (gameList) {
                current.ownedGames = true;
                outputNodes.get(current.id).data.ownedGames = gameList.response;
                processNext();
            };
            if (!current.aliases) {
                steamAPI.getPlayerAliases(current.id, aliasesLoaded);
            } else if (!current.group) {
                if (outputNodes.get(current.id).data.primaryclanid === undefined) {
                    current.group = true;
                    processNext();
                } else {
                    groupCache.get(outputNodes.get(current.id).data.primaryclanid, groupLoaded);
                }
            } else if (!current.ownedGames) {
                steamAPI.getOwnedGames(current.id, ownedGamesLoaded);
            } else if (!current.bans) {

            }
        };
        if (!isJobActive)
        {
            loadInfo();
        }
    };

    this.processBans = function ()
    {
        var ids = [];
        var makeIdsList = function(node)
        {
            ids.push(node.id);
        };
        uncheckedNodes.forEach(makeIdsList);    
        
        var bansLoaded = function(bans)
        {
            var markNode = function(banInfo)
            {
                var findCurrent = function(node)
                {
                    return node.id === banInfo.SteamId;
                };
                uncheckedNodes.find(findCurrent).bans = true;
                outputNodes.get(banInfo.SteamId).data.bans = banInfo;
                delete banInfo.SteamId;              
            };
            bans.forEach(markNode);
        };   
        steamAPI.getPlayerBans(ids, bansLoaded);
    };
}


