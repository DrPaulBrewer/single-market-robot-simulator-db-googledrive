'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uploadStudyZip = exports.saveStudyConfig = exports.getStudyConfig = exports.recoverFromTrash = exports.sendToTrash = exports.availableStudies = undefined;

var whoAmI = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(force) {
        var response, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(!iAm.user || force)) {
                            _context.next = 7;
                            break;
                        }

                        _context.next = 3;
                        return gapi.client.drive.about.get({ fields: 'user,storageQuota' });

                    case 3:
                        response = _context.sent;
                        result = response.result;

                        iAm.user = result.user;
                        iAm.storageQuota = result.storageQuota;

                    case 7:
                        return _context.abrupt('return', iAm.user);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function whoAmI(_x) {
        return _ref2.apply(this, arguments);
    };
}();

var econ1NetMainFolder = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var user, userName, folderName, folder;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return whoAmI(false);

                    case 2:
                        user = _context2.sent;
                        userName = (user.displayName || user.emailAddress).replace(/ /g, '-');
                        folderName = 'Econ1Net-' + userName;
                        _context2.next = 7;
                        return X.folderFactory()('root', folderName);

                    case 7:
                        folder = _context2.sent;
                        return _context2.abrupt('return', folder);

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function econ1NetMainFolder() {
        return _ref3.apply(this, arguments);
    };
}();

var availableStudies = exports.availableStudies = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var fields, q, request, ok, response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        console.log("TODO: fix smrs-db-googledrive availableStudies, should take options, be supplied with options upstream");
                        fields = 'files(id,name,description,properties,parents)';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            trashed: false,
                            mimeType: folderMimeType,
                            properties: {
                                role: studyFolderRole
                            }
                        });
                        request = {
                            q: q,
                            orderBy: orderNewestFirst,
                            fields: fields,
                            spaces: spaces,
                            pageSize: pageSize
                        };
                        _context3.next = 6;
                        return pSignedIn();

                    case 6:
                        ok = _context3.sent;
                        _context3.next = 9;
                        return gapi.client.drive.files.list(request);

                    case 9:
                        response = _context3.sent;
                        return _context3.abrupt('return', response.result.files);

                    case 11:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function availableStudies() {
        return _ref4.apply(this, arguments);
    };
}();

var sendToTrash = exports.sendToTrash = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(study) {
        var response;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return gapi.client.drive.files.update({ fileId: study.id }, { trashed: true });

                    case 2:
                        response = _context4.sent;
                        return _context4.abrupt('return', response);

                    case 4:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function sendToTrash(_x2) {
        return _ref5.apply(this, arguments);
    };
}();

var recoverFromTrash = exports.recoverFromTrash = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(study) {
        var response;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return gapi.client.drive.files.update({ fileId: study.id }, { trashed: false });

                    case 2:
                        response = _context5.sent;
                        return _context5.abrupt('return', response);

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function recoverFromTrash(_x3) {
        return _ref6.apply(this, arguments);
    };
}();

var getStudyConfig = exports.getStudyConfig = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(studyFolder) {
        var folderId, fields, q, request, response, file, contents, config;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (!(!studyFolder || !studyFolder.id)) {
                            _context6.next = 2;
                            break;
                        }

                        throw new Error("missing studyFolder.id");

                    case 2:
                        folderId = studyFolder.id;
                        fields = 'files(id,properties)';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            trashed: false,
                            parents: folderId,
                            name: configName,
                            mimeType: configMimeType
                        });
                        request = { q: q, fields: fields, spaces: spaces, pageSize: pageSize, orderBy: orderNewestFirst };
                        _context6.next = 8;
                        return gapi.client.drive.files.list(request);

                    case 8:
                        response = _context6.sent;
                        file = response.result.files[0];
                        _context6.next = 12;
                        return X.contents(file.id);

                    case 12:
                        contents = _context6.sent;
                        config = typeof contents === 'string' ? JSON.parse(contents) : contents;

                        console.log(config);
                        return _context6.abrupt('return', Object.assign({}, { folder: studyFolder }, config));

                    case 16:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getStudyConfig(_x4) {
        return _ref7.apply(this, arguments);
    };
}();

var saveStudyConfig = exports.saveStudyConfig = function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(study) {
        var createStudyDirectory = function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(options) {
                var parent, metaData, response;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return econ1NetMainFolder();

                            case 2:
                                parent = _context7.sent;
                                metaData = Object.assign({}, {
                                    mimeType: folderMimeType,
                                    properties: {
                                        role: studyFolderRole
                                    },
                                    parents: [parent]
                                }, options);
                                _context7.next = 6;
                                return gapi.client.drive.files.create({
                                    fields: 'id,name,description'
                                }, metaData);

                            case 6:
                                response = _context7.sent;
                                return _context7.abrupt('return', response.result);

                            case 8:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            return function createStudyDirectory(_x6) {
                return _ref9.apply(this, arguments);
            };
        }();

        var config, options, folderId, createdDir, upload;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        console.log("saveStudyConfig");
                        console.log(study);
                        config = study.config;
                        options = {
                            id: study.folderId,
                            name: study.name,
                            description: study.description
                        };
                        folderId = void 0, createdDir = void 0;

                        if (!options.id) {
                            _context8.next = 9;
                            break;
                        }

                        folderId = options.id;
                        _context8.next = 13;
                        break;

                    case 9:
                        _context8.next = 11;
                        return createStudyDirectory(options);

                    case 11:
                        createdDir = _context8.sent;

                        folderId = createdDir.id;

                    case 13:
                        _context8.next = 15;
                        return pUploaderForGoogleDrive({
                            file: new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }),
                            metadata: {
                                name: configName,
                                mimeType: 'application/json',
                                parents: [folderId]
                            },
                            params: {
                                spaces: spaces,
                                fields: 'id,name,mimeType'
                            },
                            onProgress: onUploadProgress
                        });

                    case 15:
                        upload = _context8.sent;

                        upload.z = undefined;
                        return _context8.abrupt('return', study);

                    case 18:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function saveStudyConfig(_x5) {
        return _ref8.apply(this, arguments);
    };
}();

var uploadStudyZip = exports.uploadStudyZip = function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(zipBlob, options) {
        var uploader;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.next = 2;
                        return pUploaderForGoogleDrive({
                            file: zipBlob,
                            metadata: {
                                name: Study.myDateStamp(),
                                mimeType: 'application/zip',
                                description: options.description || '',
                                parents: [options.id]
                            },
                            params: {
                                spaces: spaces,
                                fields: 'id,name,mimeType'
                            },
                            onProgress: onUploadProgress
                        });

                    case 2:
                        uploader = _context9.sent;
                        return _context9.abrupt('return', uploader);

                    case 4:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function uploadStudyZip(_x7, _x8) {
        return _ref10.apply(this, arguments);
    };
}();

exports.init = init;

var _extensionsForGoogleDrive = require('./extensionsForGoogleDrive.js');

var _searchStringForGoogleDrive = require('search-string-for-google-drive');

var _searchStringForGoogleDrive2 = _interopRequireDefault(_searchStringForGoogleDrive);

var _singleMarketRobotSimulatorStudy = require('single-market-robot-simulator-study');

var Study = _interopRequireWildcard(_singleMarketRobotSimulatorStudy);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, pUploaderForGoogleDrive:false, Promise:false */

/* eslint-disable no-console */

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
}

var X = (0, _extensionsForGoogleDrive.extensionsForGoogleDrive)({
    rootFolderId: 'root',
    spaces: 'drive'
});

var spaces = 'drive';
var pageSize = 1000;
var orderNewestFirst = 'modifiedTime desc';

var folderMimeType = 'application/vnd.google-apps.folder';
var studyFolderRole = 'Econ1.Net Study Folder';

var configMimeType = 'application/json';
var configName = 'config.json';
var iAm = {};

var DB = {};

function init(_ref) {
    var onSignIn = _ref.onSignIn,
        onSignOut = _ref.onSignOut,
        onProgress = _ref.onProgress;

    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onProgress = onProgress;
}

function pSignedIn() {
    return new Promise(function (resolve) {
        function loop() {
            if (window.isSignedIn) return resolve(true);else setTimeout(loop, 250);
        }
        loop();
    });
}

function onUploadProgress(e) {
    console.log(e);
}