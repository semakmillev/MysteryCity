"use strict";
/**
 * Created by semak on 09.02.17.
 */
var debugParam = 0;
var currentGame = -1;
var gamePageUrl = '';
var Consts = (function () {
    function Consts() {
    }
    Consts.uploadFolder = "http://195.42.183.91/KenigQuest/upload/";
    Consts.const_cgi = 'http://195.42.183.91/cgi-bin/KenigQuest/';
    return Consts;
}());
exports.Consts = Consts;
