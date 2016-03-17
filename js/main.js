$(function () {
    var steamAPI = new SteamAPI();
    var locale = new Localization();
    var groupCache = new GroupCache(steamAPI);
    var graphContainer = $('#friends-graph').get(0);

    var addUser = function () {
        var inputText = $(this).find('input[name=steamId]').val();
        var onLoad = function (userSummaries)
        {
            if (userSummaries.length > 0)
            {
                var node = userSummaries[0];
                if (!nodes.get(node.steamid))
                {
                    loader.add(node.steamid);
                    nodes.add({id: node.steamid, label: node.personaname, shape: 'circularImage', image: node.avatar, data: node});
                    loader.processBans();
                }
            }
        };
        var patterns = [
            {pattern: /^([0-9]{17})$/, callback: steamAPI.getPlayersSummaries},
            {pattern: /^([a-zA-Z0-9_\-]+)$/, callback: steamAPI.getPlayerSummariesByName},
            {pattern: /^http:\/\/steamcommunity.com\/profiles\/([0-9]{17})\/*$/, callback: steamAPI.getPlayersSummaries},
            {pattern: /^http:\/\/steamcommunity.com\/id\/([a-zA-Z0-9_\-]+)\/*$/, callback: steamAPI.getPlayerSummariesByName}];
        var checkInput = function (rule)
        {
            var result = inputText.match(rule.pattern);
            if (result)
            {
                rule.callback(result[1], onLoad);
                return true;
            }
        };
        patterns.some(checkInput);
        $(this).dialog("close");
    };
    var getFriendList = function (userId)
    {
        var onLoad = function (friendListIds)
        {
            var inEdges = function (first, second) {
                for (var key in edges._data)
                {
                    if ((first === edges.get(key).to && second === edges.get(key).from) ||
                            (first === edges.get(key).from && second === edges.get(key).to))
                        return true;
                }
                return false;
            };
            var addFriendToGraph = function (friend)
            {
                if (!nodes.get(friend.steamid))
                {
                    loader.add(friend.steamid);
                    nodes.add({id: friend.steamid, label: friend.personaname, shape: 'circularImage', image: friend.avatar, data: friend});
                }
                if (!inEdges(friend.steamid, userId))
                    edges.add({from: userId, to: friend.steamid, friendSince: friend.friendSince * 1000});
            };
            friendListIds.forEach(addFriendToGraph);
            loader.processBans();
        };
        steamAPI.getFriendList(userId, onLoad);
    };
    var addUserDialog = $('#adduser-dialog').dialog({
        autoOpen: false,
        width: 350,
        height: 155,
        modal: true,
        resizable: false,
        close: function () {
            $(this).find('form')[0].reset();
        }});
    var friendsRelationshipsPopup = $('#friendsrel-info-popup').dialog({
        autoOpen: false,
        width: 'auto',
        height: 'auto',
        modal: false,
        resizable: false
    });
    var userSummariesPopup = $('#user-info-dialog').dialog({
        autoOpen: false,
        width: 'auto',
        height: 'auto',
        modal: false,
        resizable: false
    });
    var objectAtCursor = {type: 'undefined', id: undefined};
    $.contextMenu({
        selector: '#friends-graph',
        build: function ($triggerElement, e) {
            var generateDropDownMenu = function (aliases)
            {
                var menuHTML = '<select id="aliases-info">';
                aliases.forEach(function (alias) {
                    menuHTML += '<option>' + alias.newname + ' ' + (new Date(alias.timechanged * 1000)).toLocaleString() + '</option>';
                });
                menuHTML += '</select>';
                return menuHTML;
            };
            var menu = {
                callback: function (key, options) {
                    switch (key)
                    {
                        case 'addUser':
                            addUserDialog.dialog('option', {title: locale.get('adduserdialog_title')});
                            addUserDialog.dialog('open');
                            addUserDialog.dialog('option', 'buttons', [
                                {
                                    text: locale.get('adduserdialog_add'),
                                    click: addUser
                                },
                                {text: locale.get('adduserdialog_cancel'),
                                    click: function () {
                                        $(this).dialog("close");
                                    }
                                }]);
                            break;
                        case 'getFriendList':
                            getFriendList(objectAtCursor.id);
                            break;
                        case 'showInfo':
                            var summary = nodes.get(objectAtCursor.id).data;
                            userSummariesPopup.dialog('option', {position: {my: 'top-200', at: 'top', of: mouseEvent}, title: summary.personaname});
                            userSummariesPopup.dialog('open');
                            var table = $('#user-summary');
                            table.empty();
                            var userSummariesView = {
                                loccountrycode: '<tr><td>' + locale.get('country') + '</td><td><span class="flag-icon flag-icon-' + (summary.hasOwnProperty('loccountrycode') ? summary.loccountrycode.toLowerCase() : '') + '"></span></td></tr>',
                                lastlogoff: '<tr><td>' + locale.get('lastlogoff') + '</td><td id="lastlogoff-value">' + (new Date(summary.lastlogoff * 1000)).toLocaleString() + '</td><td><input type="checkbox" id="lastlogoff-viewchange"><label for="lastlogoff-viewchange">' + locale.get('elapsedtime') + '</label></td></tr>',
                                profilestate: '<tr><td>' + locale.get('profilestate') + '</td><td>' + (summary.profilestate === 1 ? locale.get('profileconfigured') : locale.get('profilenotconfigured')) + '</td></tr>',
                                realname: '<tr><td>' + locale.get('realname') + '</td><td>' + summary.realname + '</td></tr>',
                                communityvisibilitystate: '<tr><td>' + locale.get('communityvisibilitystate') + '</td><td>' + (summary.communityvisibilitystate === 1 ? locale.get('profilevisibility_private') : locale.get('profilevisibility_public')) + '</td></tr>',
                                commentpermission: '<tr><td>' + locale.get('commentpermission') + '</td><td>' + ['undefine', locale.get('commentpermission_open'), locale.get('commentpermission_close')][summary.commentpermission] + '</td></tr>',
                                personastate: '<tr><td>' + locale.get('personastate') + '</td><td>' + [locale.get('personastate_offline'), locale.get('personastate_online'), locale.get('personastate_busy'), locale.get('personastate_away'), locale.get('personastate_snooze'), locale.get('personastate_lttrade'), locale.get('personastate_ltplay')][summary.personastate] + '</td></tr>',
                                timecreated: '<tr><td>' + locale.get('timecreated') + '</td><td id="timecreated-value">' + (new Date(summary.timecreated * 1000)).toLocaleString() + '</td><td><input type="checkbox" id="timecreated-viewchange"><label for="timecreated-viewchange">' + locale.get('elapsedtime') + '</label></td></tr>',
                                profileurl: '<tr><td>' + locale.get('profileurl') + '</td><td><a target="_blank" href="' + summary.profileurl + '">' + locale.get('profileopen') + '</a></td></tr>',
                                steamid: '<tr><td>' + locale.get('steamid') + '</td><td>' + summary.steamid + '</td></tr>',
                                locstatecode: '<tr><td>' + locale.get('locstatecode') + '</td><td>' + summary.locstatecode + '</td></tr>',
                                primaryclanid: '<tr><td>' + locale.get('primaryclanid') + '</td><td id="primaryClanId">' + summary.primaryclanid + '</td></tr>',
                                gameid: '<tr><td>' + locale.get('nowplaying') + '</td><td><a target="_blank" href="http://store.steampowered.com/app/' + summary.gameid + '">' + summary.gameextrainfo + '</a></td></tr>'
                            };
                            for (var key in summary)
                            {
                                if (userSummariesView.hasOwnProperty(key)) {
                                    table.append(userSummariesView[key]);
                                }
                            }
                            $('#user-info-avatar').attr('src', summary['avatarmedium']);
                            if (summary.hasOwnProperty('aliases') && summary.aliases.length > 0)
                            {
                                table.prepend('<tr><td>' + locale.get('aliases') + '</td><td>' + generateDropDownMenu(summary.aliases) + '</td></tr>');
                                $("#aliases-info").selectmenu();
                            }
                            var toTimeDiffString = function (milliseconds)
                            {
                                var result = '';
                                milliseconds /= 1000;
                                var days = Math.floor(milliseconds / 86400);
                                if (days >= 1)
                                    result = days + ' ' + locale.get('timediff_days') + ' ';
                                var hours = Math.floor((milliseconds - days * 86400) / 3600);
                                if (hours >= 1)
                                    result += hours + ' ' + locale.get('timediff_hours') + ' ';
                                var minutes = Math.floor((milliseconds - days * 86400 - hours * 3600) / 60);
                                if (minutes >= 1)
                                    result += minutes + ' ' + locale.get('timediff_minutes') + ' ';
                                if (!result)
                                    result = locale.get('timediff_lessthanminutes');
                                return result;
                            };
                            $('#lastlogoff-viewchange').button().focus().click(function (e) {
                                if ($(this).is(':checked'))
                                    $('#lastlogoff-value').text(toTimeDiffString((new Date()).getTime() - (new Date(summary['lastlogoff'] * 1000)).getTime()));
                                else
                                    $('#lastlogoff-value').text((new Date(summary['lastlogoff'] * 1000)).toLocaleString());
                            });
                            $('#timecreated-viewchange').button().click(function (e) {
                                if ($(this).is(':checked'))
                                    $('#timecreated-value').text(toTimeDiffString((new Date()).getTime() - (new Date(summary['timecreated'] * 1000)).getTime()));
                                else
                                    $('#timecreated-value').text((new Date(summary['timecreated'] * 1000)).toLocaleString());
                            });
                            var groupInfoLoaded = function (groupInfo) {
                                $('#primaryClanId').html('<a target="_blank" href=http://steamcommunity.com/groups/' + groupInfo.url + '>' + groupInfo.name + '</a>');
                            };
                            if (summary.hasOwnProperty('primaryclanid'))
                                groupCache.get(summary.primaryclanid, groupInfoLoaded);
                            break;
                        case 'relationshipsInfo':
                            var edge = edges.get(objectAtCursor.id);
                            friendsRelationshipsPopup.dialog('option', {position: {my: 'top-200', at: 'top', of: mouseEvent}, title: nodes.get(edge.from).data.personaname + ' <-> ' + nodes.get(edge.to).data.personaname});
                            friendsRelationshipsPopup.dialog('open');
                            $('#friendsSinceText').text(locale.get('friendssince'));
                            $('#friendsSince').text((new Date(edge.friendSince)).toLocaleString());
                            break;
                    }
                },
                items: null
            };
            var mainMenu = {'addUser': {name: locale.get('adduser'), icon: 'add'}};
            var nodeMenu = {
                'getFriendList': {name: locale.get('loadfriendlist'), icon: 'loadfriendlist'},
                'showInfo': {name: locale.get('usersummaries'), icon: 'info'}};
            var edgeMenu = {'relationshipsInfo': {name: locale.get('usersummaries'), icon: 'info'}};
            var menusByType = {'undefined': mainMenu, 'node': nodeMenu, 'edge': edgeMenu};
            menu.items = menusByType[objectAtCursor.type];
            return menu;
        }
    });
    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();
    var options = {
        interaction: {
            hover: true
        },
        layout: {
            improvedLayout: false
        },
        nodes: {
            borderWidth: 4,
            size: 30,
            color: {
                border: '#222222',
                background: '#666666'
            },
            font: {color: '#000000'}
        },
        edges: {
            color: 'lightgray'
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -30104,
                centralGravity: 0.1,
                springLength: 100,
                springConstant: 0.05,
                damping: 0.13
            },
            minVelocity: 0.64
        }
    };
    var loader = new ExtraInfoLoader(nodes, steamAPI, groupCache);
    var mouseEvent = null;
    $(graphContainer).on('mousemove', function (e) {
        mouseEvent = e;
    });
    var friendGraph = new vis.Network(graphContainer, {nodes: nodes, edges: edges}, options);
    friendGraph.on('oncontext', function (param) {
        objectAtCursor.id = friendGraph.getNodeAt(param.pointer.DOM);
        if (objectAtCursor.id === undefined)
        {
            objectAtCursor.id = friendGraph.getEdgeAt(param.pointer.DOM);
            if (objectAtCursor.id === undefined)
            {
                //no any objects at cursor
                objectAtCursor.type = 'undefined';
            } else
            {
                //edge at cursor
                objectAtCursor.type = 'edge';
            }
        } else
        {
            //node at cursor
            objectAtCursor.type = 'node';
            friendGraph.selectNodes([objectAtCursor.id]);
        }
    });
    $('#adduser-dialog form').submit(function (e) {
        e.preventDefault();
    });
});