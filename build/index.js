'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parentStudyFolder = exports.createStudyFolder = exports.listStudyFolders = exports.myPrimaryFolder = exports.StudyFolder = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */

var updateSigninStatus = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(isSignedIn) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            window.isSignedIn = isSignedIn;
            if (authorizeButton) authorizeButton.style.display = isSignedIn ? 'none' : 'block';
            if (signoutButton) signoutButton.style.display = isSignedIn ? 'block' : 'none';

            if (!isSignedIn) {
              _context.next = 13;
              break;
            }

            $('.hideOnSignin').hide();
            $('.showOnSignin').show();
            $('.clickOnSignin').click();
            showUserInfo();
            _context.next = 10;
            return getHint();

          case 10:
            dbdo('onSignIn');
            _context.next = 18;
            break;

          case 13:
            $('.hideOnSignout').hide();
            $('.showOnSignout').show();
            $('.clickOnSignout').click();
            removeUserInfo();
            dbdo('onSignOut');

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function updateSigninStatus(_x) {
    return _ref.apply(this, arguments);
  };
}();

var showUserInfo = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var user;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return whoAmI();

          case 2:
            user = _context2.sent;

            $('.userEmailAddress').text(user.emailAddress);
            $('.userDisplayName').text(user.displayName);

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function showUserInfo() {
    return _ref2.apply(this, arguments);
  };
}();

var whoAmI = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(force) {
    var response, _result;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(!iAm.user || force)) {
              _context3.next = 7;
              break;
            }

            _context3.next = 3;
            return gapi.client.drive.about.get({ fields: 'user,storageQuota' });

          case 3:
            response = _context3.sent;
            _result = response.result;

            iAm.user = _result.user;
            iAm.storageQuota = _result.storageQuota;

          case 7:
            return _context3.abrupt('return', iAm.user);

          case 8:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function whoAmI(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var pGatekeeper = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var user, go;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(typeof DB.gatekeeper === 'function')) {
              _context4.next = 15;
              break;
            }

            _context4.next = 3;
            return whoAmI();

          case 3:
            user = _context4.sent;
            _context4.prev = 4;
            _context4.next = 7;
            return DB.gatekeeper(_StudyFolder.driveX, user);

          case 7:
            go = _context4.sent;
            return _context4.abrupt('return', go);

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4['catch'](4);

            window.alert(_context4.t0.toString());
            throw _context4.t0;

          case 15:
            return _context4.abrupt('return', false);

          case 16:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[4, 11]]);
  }));

  return function pGatekeeper() {
    return _ref5.apply(this, arguments);
  };
}();

var myPrimaryFolder = exports.myPrimaryFolder = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var user, userName, folderName, folder;
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
            _context5.next = 6;
            return whoAmI(false);

          case 6:
            user = _context5.sent;
            userName = user.emailAddress.split('@')[0];

            if (userName.length) {
              _context5.next = 10;
              break;
            }

            throw new Error("Error: myPrimaryFolder(), user.emailAddress is blank");

          case 10:
            folderName = 'Econ1Net-' + userName;
            _context5.next = 13;
            return _StudyFolder.driveX.folderFactory()('root', folderName);

          case 13:
            folder = _context5.sent;
            return _context5.abrupt('return', folder);

          case 15:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function myPrimaryFolder() {
    return _ref6.apply(this, arguments);
  };
}();

var listStudyFolders = exports.listStudyFolders = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref7) {
    var trashed = _ref7.trashed;
    var fields, orderBy, searcher, response, files, studyFolders;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return pSignedIn();

          case 2:
            _context6.next = 4;
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
            _context6.next = 9;
            return searcher();

          case 9:
            response = _context6.sent;
            files = response.files;

            if (hint.existingFolderId) {
              files = (0, _StudyFolder.arrayPrefer)(files, function (f) {
                return f.id === hint.existingFolderId;
              }, 1);
              if (files.length > 0 && hint.file && hint.file.id && files[0].id === hint.existingFolderId) files[0].hintFileId = hint.file.id;
            }
            studyFolders = files.map(function (f) {
              return new _StudyFolder.StudyFolder(f);
            });
            return _context6.abrupt('return', studyFolders);

          case 14:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function listStudyFolders(_x3) {
    return _ref8.apply(this, arguments);
  };
}();

var createStudyFolder = exports.createStudyFolder = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_ref9) {
    var name = _ref9.name;
    var creator, parent, folder;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (window.isSignedIn) {
              _context7.next = 2;
              break;
            }

            throw new Error("not signed into Google Drive");

          case 2:
            creator = _StudyFolder.driveX.folderCreator({
              properties: {
                role: studyFolderRole
              }
            });
            _context7.next = 5;
            return myPrimaryFolder();

          case 5:
            parent = _context7.sent;
            _context7.next = 8;
            return creator(parent, name);

          case 8:
            folder = _context7.sent;

            if (!(!folder || !folder.id)) {
              _context7.next = 11;
              break;
            }

            throw new Error("creating Study Folder " + name + " failed");

          case 11:
            return _context7.abrupt('return', new _StudyFolder.StudyFolder(folder));

          case 12:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function createStudyFolder(_x4) {
    return _ref10.apply(this, arguments);
  };
}();

var requireStudyFolder = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(fileId) {
    var drive, candidate;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            drive = gapi.client.drive;
            _context8.t0 = result;
            _context8.next = 4;
            return drive.files.get({ fileId: fileId, fields: 'id,name,mimeType,modifiedTime,properties' });

          case 4:
            _context8.t1 = _context8.sent;
            candidate = (0, _context8.t0)(_context8.t1);

            console.log(candidate);
            console.log(!!candidate.properties);
            console.log(candidate.mimeType, folderMimeType, candidate.mimeType === folderMimeType);
            console.log(candidate.properties.role, studyFolderRole, candidate.properties.role === studyFolderRole);

            if (!(candidate && candidate.properties && candidate.mimeType === folderMimeType && candidate.properties.role === studyFolderRole)) {
              _context8.next = 12;
              break;
            }

            return _context8.abrupt('return', candidate);

          case 12:
            throw new Error("not a study folder");

          case 13:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function requireStudyFolder(_x5) {
    return _ref11.apply(this, arguments);
  };
}();

var parentStudyFolder = exports.parentStudyFolder = function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(_ref12) {
    var id = _ref12.id,
        name = _ref12.name,
        parents = _ref12.parents;
    var drive, fileParents, file, parentFolder;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            drive = gapi.client.drive;
            fileParents = parents;

            if (!(name.endsWith(".zip") || name.endsWith(".json"))) {
              _context9.next = 26;
              break;
            }

            _context9.prev = 3;

            if (!(!fileParents || !fileParents.length)) {
              _context9.next = 11;
              break;
            }

            _context9.t0 = result;
            _context9.next = 8;
            return drive.files.get({ fileId: id, fields: 'id,name,parents' });

          case 8:
            _context9.t1 = _context9.sent;
            file = (0, _context9.t0)(_context9.t1);

            fileParents = file.parents;

          case 11:
            if (Array.isArray(fileParents)) {
              _context9.next = 13;
              break;
            }

            return _context9.abrupt('return', false);

          case 13:
            if (!(fileParents.length === 0)) {
              _context9.next = 15;
              break;
            }

            return _context9.abrupt('return', false);

          case 15:
            if (!(fileParents.length > 10)) {
              _context9.next = 17;
              break;
            }

            throw new Error("too many parents for file: " + fileParents.length + ' ' + name);

          case 17:
            _context9.next = 19;
            return pAny(fileParents.map(requireStudyFolder));

          case 19:
            parentFolder = _context9.sent;
            return _context9.abrupt('return', new _StudyFolder.StudyFolder(parentFolder));

          case 23:
            _context9.prev = 23;
            _context9.t2 = _context9['catch'](3);
            return _context9.abrupt('return', false);

          case 26:
            return _context9.abrupt('return', false);

          case 27:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[3, 23]]);
  }));

  return function parentStudyFolder(_x6) {
    return _ref13.apply(this, arguments);
  };
}();

var getHint = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var _hint, file, existingFolder;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return _StudyFolder.driveX.appDataFolder.readBurnHint();

          case 2:
            hint = _context10.sent;

            console.log("got hint: ", hint);

            if (!((typeof hint === 'undefined' ? 'undefined' : _typeof(hint)) === 'object')) {
              _context10.next = 12;
              break;
            }

            _hint = hint, file = _hint.file; // also contents

            _context10.next = 8;
            return parentStudyFolder(file);

          case 8:
            existingFolder = _context10.sent;

            if (existingFolder && existingFolder.id) {
              hint.existingFolderId = existingFolder.id;
            }
            console.log("sending hint:", hint);
            dbdo('onHint', { hint: hint, drive: gapi.client.drive, driveX: _StudyFolder.driveX });

          case 12:
            return _context10.abrupt('return', hint);

          case 13:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function getHint() {
    return _ref14.apply(this, arguments);
  };
}();

exports.handleGoogleClientLoad = handleGoogleClientLoad;
exports.init = init;

var _StudyFolder = require('./StudyFolder.js');

var _pAny = require('p-any');

var pAny = _interopRequireWildcard(_pAny);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

exports.StudyFolder = _StudyFolder.StudyFolder;


var DB = {};
var folderMimeType = 'application/vnd.google-apps.folder';
var studyFolderRole = 'Econ1.Net Study Folder';
var iAm = {};
var hint = {};

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

// dbdo -- safely run an optional function if it exists in DB.init configuration

function dbdo(method, params) {
  if (typeof DB[method] === 'function') try {
    DB[method](params);
  } catch (e) {
    console.log("Error from externally supplied DB." + method);
    console.log(e);
  }
}

/**
 *  On load, called to load the auth2 library and API client library.
 */

function handleGoogleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */

function initClient() {
  gapi.client.init({
    apiKey: DB.apiKey,
    clientId: DB.clientId,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
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

function removeUserInfo() {
  delete iAm.user;
  $('.userEmailAddress').text('');
  $('.userDisplayName').text('');
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
  setTimeout(function () {
    window.location.reload();
  }, 800);
}

function init(_ref3) {
  var apiKey = _ref3.apiKey,
      clientId = _ref3.clientId,
      onSignIn = _ref3.onSignIn,
      onSignOut = _ref3.onSignOut,
      onHint = _ref3.onHint,
      gatekeeper = _ref3.gatekeeper;

  DB.apiKey = apiKey;
  DB.clientId = clientId;
  DB.onSignIn = onSignIn;
  DB.onSignOut = onSignOut;
  DB.onHint = onHint;
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

function result(response) {
  return response && response.result;
}