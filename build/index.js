'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parentStudyFolder = exports.createStudyFolder = exports.listStudyFolders = exports.myPrimaryFolder = exports.defaultWebLink = exports.getHint = exports.driveX = exports.StudyFolder = undefined;

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
            return _StudyFolder.driveX.folderFactory()('root', folderName);

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
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref2) {
    var trashed = _ref2.trashed;
    var fields, orderBy, searcher, response, files, studyFolders;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return pSignedIn();

          case 2:
            fields = 'id,name,description,properties,modifiedTime,webViewLink';
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
            _context2.next = 7;
            return searcher();

          case 7:
            response = _context2.sent;
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
            return _context2.abrupt('return', studyFolders);

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function listStudyFolders(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var createStudyFolder = exports.createStudyFolder = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
    var name = _ref4.name;
    var parent, creator, folder;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return myPrimaryFolder();

          case 2:
            parent = _context3.sent;
            creator = _StudyFolder.driveX.folderCreator({
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
            return _context3.abrupt('return', new _StudyFolder.StudyFolder(folder));

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function createStudyFolder(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

var parentStudyFolder = exports.parentStudyFolder = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref6) {
    var name = _ref6.name,
        parents = _ref6.parents;
    var promises, results, parentFolder;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (Array.isArray(parents)) {
              _context4.next = 2;
              break;
            }

            throw new Error("parents is required to be an Array");

          case 2:
            if (!(parents.length === 0)) {
              _context4.next = 4;
              break;
            }

            return _context4.abrupt('return', false);

          case 4:
            if (!(parents.length > 10)) {
              _context4.next = 6;
              break;
            }

            throw new Error("too many parents for file: " + parents.length + ' ' + name);

          case 6:
            _context4.prev = 6;
            promises = parents.map(pRequireStudyFolder);
            _context4.next = 10;
            return Promise.all(promises);

          case 10:
            results = _context4.sent;
            parentFolder = results.find(function (r) {
              return (typeof r === 'undefined' ? 'undefined' : _typeof(r)) === 'object';
            });

            if (!parentFolder) {
              _context4.next = 16;
              break;
            }

            return _context4.abrupt('return', new _StudyFolder.StudyFolder(parentFolder));

          case 16:
            return _context4.abrupt('return', false);

          case 17:
            _context4.next = 23;
            break;

          case 19:
            _context4.prev = 19;
            _context4.t0 = _context4['catch'](6);
            console.log(_context4.t0);return _context4.abrupt('return', false);

          case 23:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[6, 19]]);
  }));

  return function parentStudyFolder(_x3) {
    return _ref7.apply(this, arguments);
  };
}();

var getHint = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var _hint, file, existingFolder;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _StudyFolder.driveX.appDataFolder.readBurnHint();

          case 2:
            hint = _context5.sent;

            console.log("got hint: ", hint);

            if (!((typeof hint === 'undefined' ? 'undefined' : _typeof(hint)) === 'object' && _typeof(hint.file) === 'object')) {
              _context5.next = 11;
              break;
            }

            _hint = hint, file = _hint.file; // also contents

            _context5.next = 8;
            return parentStudyFolder(file);

          case 8:
            existingFolder = _context5.sent;

            console.log("existing folder", existingFolder);
            if (existingFolder && existingFolder.id) {
              hint.existingFolderId = existingFolder.id;
            }

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
    return _ref8.apply(this, arguments);
  };
}();

var _StudyFolder = require('./StudyFolder.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

exports.StudyFolder = _StudyFolder.StudyFolder;
exports.driveX = _StudyFolder.driveX;
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
  console.log(candidate);
  console.log(!!candidate.properties);
  console.log(candidate.mimeType, folderMimeType, candidate.mimeType === folderMimeType);
  console.log(candidate.properties.role, studyFolderRole, candidate.properties.role === studyFolderRole);
  if (candidate && candidate.properties && candidate.mimeType === folderMimeType && candidate.properties.role === studyFolderRole) return candidate;
  return false;
}

function pRequireStudyFolder(fileId) {
  var drive = gapi.client.drive;
  return drive.files.get({ fileId: fileId, fields: 'id,name,mimeType,modifiedTime,properties,webViewLink' }).then(result).then(passOnlyStudyFolder, function (e) {
    return console.log(e);
  });
}