'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parentStudyFolder = exports.createStudyFolder = exports.listStudyFolders = exports.myPrimaryFolder = exports.defaultWebLink = exports.getHint = exports.driveX = exports.StudyFolderForGoogleDrive = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var myPrimaryFolder = exports.myPrimaryFolder = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var emailAddress, userName, folderName, folder;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return pSignedIn();

          case 2:
            emailAddress = window.GoogleUser.getBasicProfile().getEmail();
            userName = emailAddress.split('@')[0];

            if (userName.length) {
              _context.next = 6;
              break;
            }

            throw new Error('Error: myPrimaryFolder(), bad emailAddress = ' + emailAddress);

          case 6:
            folderName = 'Econ1Net-' + userName;
            _context.next = 9;
            return _extensionsForStudyFolder.driveX.folderFactory()('root', folderName);

          case 9:
            folder = _context.sent;
            return _context.abrupt('return', folder);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function myPrimaryFolder() {
    return _ref.apply(this, arguments);
  };
}();

var listStudyFolders = exports.listStudyFolders = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(name) {
    var parent, fields, orderBy, trashed, searchTerms, searcher, response, files, studyFolders;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return pSignedIn();

          case 2:
            _context2.next = 4;
            return myPrimaryFolder();

          case 4:
            parent = _context2.sent;
            _context2.next = 7;
            return getHint();

          case 7:
            fields = 'id,name,description,properties,modifiedTime,webViewLink';
            orderBy = 'modifiedTime desc';
            trashed = false;
            // if name is undefined, it will be ignored by ssgd and match all names

            searchTerms = {
              orderBy: orderBy,
              fields: fields,
              name: name,
              trashed: trashed,
              parents: parent.id,
              mimeType: folderMimeType,
              properties: {
                role: studyFolderRole
              }
            };
            searcher = _extensionsForStudyFolder.driveX.searcher(searchTerms);
            _context2.next = 14;
            return searcher();

          case 14:
            response = _context2.sent;
            files = response.files;

            if (hint && hint.existingFolderId) {
              files = (0, _extensionsForStudyFolder.arrayPrefer)(files, function (f) {
                return f.id === hint.existingFolderId;
              }, 1);
              if (files.length > 0 && hint.file && hint.file.id && files[0].id === hint.existingFolderId) files[0].hintFileId = hint.file.id;
            }
            studyFolders = files.map(function (f) {
              return new _extensionsForStudyFolder.StudyFolderForGoogleDrive(f);
            });

            if (!name && hint && hint.includeFolder) {
              studyFolders.unshift(hint.includeFolder);
            }
            return _context2.abrupt('return', studyFolders);

          case 20:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function listStudyFolders(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var createStudyFolder = exports.createStudyFolder = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref3) {
    var name = _ref3.name;
    var parent, creator, folder;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return myPrimaryFolder();

          case 2:
            parent = _context3.sent;
            creator = _extensionsForStudyFolder.driveX.folderCreator({
              properties: {
                role: studyFolderRole
              }
            });
            _context3.next = 6;
            return creator(parent, name);

          case 6:
            folder = _context3.sent;

            if (!(!folder || !folder.id)) {
              _context3.next = 9;
              break;
            }

            throw new Error("creating Study Folder " + name + " failed");

          case 9:
            return _context3.abrupt('return', new _extensionsForStudyFolder.StudyFolderForGoogleDrive(folder));

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function createStudyFolder(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var parentStudyFolder = exports.parentStudyFolder = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref5) {
    var name = _ref5.name,
        parents = _ref5.parents;
    var primaryFolder, promises, results, parentFolder;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return myPrimaryFolder();

          case 2:
            primaryFolder = _context4.sent;

            if (Array.isArray(parents)) {
              _context4.next = 5;
              break;
            }

            throw new Error("parents is required to be an Array");

          case 5:
            if (!(parents.length === 0)) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt('return', false);

          case 7:
            if (!(parents.length > 10)) {
              _context4.next = 9;
              break;
            }

            throw new Error("too many parents for file: " + parents.length + ' ' + name);

          case 9:
            _context4.prev = 9;
            promises = parents.map(pRequireStudyFolder);
            _context4.next = 13;
            return Promise.all(promises);

          case 13:
            results = _context4.sent;
            parentFolder = results.find(function (r) {
              return (typeof r === 'undefined' ? 'undefined' : _typeof(r)) === 'object' && r.parents.includes(primaryFolder.id);
            });

            if (!parentFolder) {
              _context4.next = 19;
              break;
            }

            return _context4.abrupt('return', new _extensionsForStudyFolder.StudyFolderForGoogleDrive(parentFolder));

          case 19:
            return _context4.abrupt('return', false);

          case 20:
            _context4.next = 26;
            break;

          case 22:
            _context4.prev = 22;
            _context4.t0 = _context4['catch'](9);
            console.log(_context4.t0);return _context4.abrupt('return', false);

          case 26:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[9, 22]]);
  }));

  return function parentStudyFolder(_x3) {
    return _ref6.apply(this, arguments);
  };
}();

var getHint = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(hintStatus === 0)) {
              _context5.next = 7;
              break;
            }

            hintStatus = 1;
            _context5.next = 4;
            return getHintOnce();

          case 4:
            return _context5.abrupt('return', hint);

          case 7:
            if (!(hintStatus === 1)) {
              _context5.next = 11;
              break;
            }

            return _context5.abrupt('return', new Promise(function (resolve) {
              function loop() {
                if (hintStatus === 2) {
                  resolve(hint);
                } else {
                  setTimeout(loop, 500);
                }
              }
              setTimeout(loop, 100);
            }));

          case 11:
            return _context5.abrupt('return', hint);

          case 12:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function getHint() {
    return _ref7.apply(this, arguments);
  };
}();

var getHintOnce = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var ahint, file, existingFolder;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _extensionsForStudyFolder.driveX.appDataFolder.readBurnHint();

          case 2:
            ahint = _context6.sent;

            console.log("got hint: ", ahint);

            if (!((typeof ahint === 'undefined' ? 'undefined' : _typeof(ahint)) === 'object' && _typeof(ahint.file) === 'object')) {
              _context6.next = 11;
              break;
            }

            file = ahint.file; // also contents
            // file is an object and should have properties name, parents, etc...

            _context6.next = 8;
            return parentStudyFolder(file);

          case 8:
            existingFolder = _context6.sent;

            console.log("existing folder", existingFolder);
            if (existingFolder && existingFolder.id) {
              ahint.existingFolderId = existingFolder.id;
            } else if (file && file.mimeType === 'application/zip' && file.id) {
              ahint.includeFolder = new _singleMarketRobotSimulatorDbZip.StudyFolderForZip({
                zipPromise: _extensionsForStudyFolder.driveX.contents(file.id),
                zipName: file.name
              });
            }

          case 11:
            hint = ahint;
            hintStatus = 2;

          case 13:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function getHintOnce() {
    return _ref8.apply(this, arguments);
  };
}();

var _extensionsForStudyFolder = require('./extensionsForStudyFolder.js');

var _singleMarketRobotSimulatorDbZip = require('single-market-robot-simulator-db-zip');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

exports.StudyFolderForGoogleDrive = _extensionsForStudyFolder.StudyFolderForGoogleDrive;
exports.driveX = _extensionsForStudyFolder.driveX;
exports.getHint = getHint;
exports.defaultWebLink = defaultWebLink;


var defaultWebLink = 'https://drive.google.com';
var folderMimeType = 'application/vnd.google-apps.folder';
var studyFolderRole = 'Econ1.Net Study Folder';
var hint = {};

function isSignedIn() {
  var ok = false;
  try {
    ok = window.GoogleUser.isSignedIn();
  } catch (e) {
    console.log("smrs-db-googledrive:isSignedIn:" + e);
    ok = false;
  }
  return ok;
}

function pSignedIn() {
  return new Promise(function (resolve) {
    function loop() {
      if (isSignedIn()) return resolve(true);else setTimeout(loop, 250);
    }
    loop();
  });
}

function result(response) {
  return response && response.result;
}

function passOnlyStudyFolder(candidate) {
  if (candidate && candidate.properties && candidate.mimeType === folderMimeType && candidate.properties.role === studyFolderRole) return candidate;
  return false;
}

function pRequireStudyFolder(fileId) {
  var drive = gapi.client.drive;
  return drive.files.get({ fileId: fileId, fields: 'id,name,mimeType,modifiedTime,properties,parents,webViewLink' }).then(result).then(passOnlyStudyFolder, function (e) {
    return console.log(e);
  });
}

var hintStatus = 0;