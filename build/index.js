'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createStudyFolder = exports.listStudyFolders = exports.myPrimaryFolder = exports.StudyFolder = undefined;

var showUserInfo = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var user;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return whoAmI();

                    case 2:
                        user = _context.sent;

                        $('.userEmailAddress').text(user.emailAddress);
                        $('.userDisplayName').text(user.displayName);

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function showUserInfo() {
        return _ref.apply(this, arguments);
    };
}();

var whoAmI = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(force) {
        var response, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!(!iAm.user || force)) {
                            _context2.next = 7;
                            break;
                        }

                        _context2.next = 3;
                        return gapi.client.drive.about.get({ fields: 'user,storageQuota' });

                    case 3:
                        response = _context2.sent;
                        result = response.result;

                        iAm.user = result.user;
                        iAm.storageQuota = result.storageQuota;

                    case 7:
                        return _context2.abrupt('return', iAm.user);

                    case 8:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function whoAmI(_x) {
        return _ref3.apply(this, arguments);
    };
}();

var pGatekeeper = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var user, go;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!(typeof DB.gatekeeper === 'function')) {
                            _context3.next = 15;
                            break;
                        }

                        _context3.next = 3;
                        return whoAmI(false);

                    case 3:
                        user = _context3.sent;
                        _context3.prev = 4;
                        _context3.next = 7;
                        return DB.gatekeeper(window.driveX, user);

                    case 7:
                        go = _context3.sent;
                        return _context3.abrupt('return', go);

                    case 11:
                        _context3.prev = 11;
                        _context3.t0 = _context3['catch'](4);

                        window.alert(_context3.t0.toString());
                        throw _context3.t0;

                    case 15:
                        return _context3.abrupt('return', false);

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[4, 11]]);
    }));

    return function pGatekeeper() {
        return _ref4.apply(this, arguments);
    };
}();

var myPrimaryFolder = exports.myPrimaryFolder = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var user, userName, folderName, folder;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return pSignedIn();

                    case 2:
                        _context4.next = 4;
                        return pGatekeeper();

                    case 4:
                        _context4.next = 6;
                        return whoAmI(false);

                    case 6:
                        user = _context4.sent;
                        userName = user.emailAddress.split('@')[0];

                        if (userName.length) {
                            _context4.next = 10;
                            break;
                        }

                        throw new Error("Error: myPrimaryFolder(), user.emailAddress is blank");

                    case 10:
                        folderName = 'Econ1Net-' + userName;
                        _context4.next = 13;
                        return _StudyFolder.driveX.folderFactory()('root', folderName);

                    case 13:
                        folder = _context4.sent;
                        return _context4.abrupt('return', folder);

                    case 15:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function myPrimaryFolder() {
        return _ref5.apply(this, arguments);
    };
}();

var listStudyFolders = exports.listStudyFolders = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref6) {
        var trashed = _ref6.trashed;
        var fields, orderBy, searcher, response;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return pSignedIn();

                    case 2:
                        _context5.next = 4;
                        return pGatekeeper();

                    case 4:
                        fields = 'id,name,description,properties,modifiedTime';
                        orderBy = 'modifiedTime desc';
                        searcher = _StudyFolder.driveX.searcher({
                            orderBy: orderBy,
                            fields: fields,
                            trashed: trashed,
                            mimeType: folderMimeType,
                            properties: {
                                role: studyFolderRole
                            }
                        });
                        _context5.next = 9;
                        return searcher();

                    case 9:
                        response = _context5.sent;
                        return _context5.abrupt('return', response.files.map(function (f) {
                            return new _StudyFolder.StudyFolder(f);
                        }));

                    case 11:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function listStudyFolders(_x2) {
        return _ref7.apply(this, arguments);
    };
}();

var createStudyFolder = exports.createStudyFolder = function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref8) {
        var name = _ref8.name;
        var creator, parent, folder;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (window.isSignedIn) {
                            _context6.next = 2;
                            break;
                        }

                        throw new Error("not signed into Google Drive");

                    case 2:
                        creator = _StudyFolder.driveX.folderCreator({
                            properties: {
                                role: studyFolderRole
                            }
                        });
                        _context6.next = 5;
                        return myPrimaryFolder();

                    case 5:
                        parent = _context6.sent;
                        _context6.next = 8;
                        return creator(parent, name);

                    case 8:
                        folder = _context6.sent;

                        if (!(!folder || !folder.id)) {
                            _context6.next = 11;
                            break;
                        }

                        throw new Error("creating Study Folder " + name + " failed");

                    case 11:
                        return _context6.abrupt('return', new _StudyFolder.StudyFolder(folder));

                    case 12:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function createStudyFolder(_x3) {
        return _ref9.apply(this, arguments);
    };
}();

exports.init = init;

var _StudyFolder = require('./StudyFolder.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

exports.StudyFolder = _StudyFolder.StudyFolder;


var CLIENT_ID = window.GCID;
var API_KEY = window.GK;

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com\
/auth/drive.appdata';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

/**
 *  On load, called to load the auth2 library and API client library.
 */

window.handleGoogleClientLoad = function () {
    'use strict';

    gapi.load('client:auth2', initClient);
    $('#welcomeModal').modal('show');
};

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */

function initClient() {
    'use strict';

    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        if (authorizeButton) authorizeButton.onclick = handleAuthClick;
        if (signoutButton) signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */

function updateSigninStatus(isSignedIn) {
    'use strict';

    console.log("got call of updateSigninStatus: " + isSignedIn);
    window.isSignedIn = isSignedIn;
    if (authorizeButton) authorizeButton.style.display = isSignedIn ? 'none' : 'block';
    if (signoutButton) signoutButton.style.display = isSignedIn ? 'block' : 'none';
    if (isSignedIn) {
        $('.hideOnSignin').hide();
        $('.showOnSignin').show();
        $('.clickOnSignin').click();
        showUserInfo();
    } else {
        $('.hideOnSignout').hide();
        $('.showOnSignout').show();
        $('.clickOnSignout').click();
        removeUserInfo();
    }
}

function removeUserInfo() {
    $('.userEmailAddress').text('');
    $('.userDisplayName').text('');
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    'use strict';

    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    'use strict';

    gapi.auth2.getAuthInstance().signOut();
    setTimeout(function () {
        window.location.reload();
    }, 800);
}

var folderMimeType = 'application/vnd.google-apps.folder';
var studyFolderRole = 'Econ1.Net Study Folder';

var iAm = {};

var DB = {};

function init(_ref2) {
    var onSignIn = _ref2.onSignIn,
        onSignOut = _ref2.onSignOut,
        onProgress = _ref2.onProgress,
        gatekeeper = _ref2.gatekeeper;

    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onProgress = onProgress;
    DB.gatekeeper = gatekeeper;
}

function pSignedIn() {
    return new Promise(function (resolve) {
        function loop() {
            if (window.isSignedIn) return resolve(true);else setTimeout(loop, 250);
        }
        loop();
    });
}