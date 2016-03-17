function Localization(localeName)
{
    var localeStr = localeName || navigator.language;
    var currentLocale = null;

    var localeList = null;
    var dictionary = [];


    var onLoadSettings = function (data)
    {
        localeList = data;
        currentLocale = $.grep(localeList.languages, function (item) {
            return localeStr.indexOf(item.code) !== -1;
        })[0] || localeList.languages[0];
        var onLoadDictionary = function (dict) {
            dictionary = dict;
        }
        $.getJSON('language/' + currentLocale.file, onLoadDictionary);
    }
    $.getJSON('language/settings.json', onLoadSettings);


    this.setLocale = function (newLocaleName) {
        localeStr = newLocaleName;
    }
    this.get = function (name)
    {
        if (dictionary.hasOwnProperty(name))
            return dictionary[name];
        else
        {
            console.warn('Parameter \'' + name + '\' not defined in ' + currentLocale.file);
            return '[' + name + ']';
        }
    }
}
