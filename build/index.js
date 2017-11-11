'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.saveStudyConfig = exports.getStudyConfig = exports.recoverFromTrash = exports.sendToTrash = exports.availableStudies = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var updateMe = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return gapi.client.drive.about.get({ fields: 'user,storageQuota' });

                    case 2:
                        response = _context.sent;

                        user = response.result.user;
                        storageQuota = response.result.storageQuota;

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function updateMe() {
        return _ref.apply(this, arguments);
    };
}();

var getOrCreateEcon1NetMainFolder = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var whoAmI, folderName, folder;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        whoAmI = (user.displayName || user.emailAddress).replace(/ /g, '-');
                        folderName = 'Econ1Net-' + whoAmI;
                        _context2.next = 4;
                        return X.folderFactory({ mimeType: folderMimeType })('root', name);

                    case 4:
                        folder = _context2.sent;

                        myEcon1NetMainFolder = folder;
                        return _context2.abrupt('return', folder);

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getOrCreateEcon1NetMainFolder() {
        return _ref2.apply(this, arguments);
    };
}();

var availableStudies = exports.availableStudies = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(options) {
        var trashed, fields, q, request, response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        trashed = !!options.trashed;
                        fields = 'files(id,name,description,parents)';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            mimeType: folderMimeType,
                            properties: {
                                role: folderRole
                            },
                            trashed: trashed
                        });
                        request = {
                            q: q,
                            orderBy: orderBy,
                            fields: fields,
                            spaces: spaces,
                            pageSize: pageSize
                        };
                        _context3.next = 6;
                        return gapi.client.drive.files.list(request);

                    case 6:
                        response = _context3.sent;
                        return _context3.abrupt('return', response.result.files);

                    case 8:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function availableStudies(_x) {
        return _ref3.apply(this, arguments);
    };
}();

var sendToTrash = exports.sendToTrash = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(study) {
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
        return _ref4.apply(this, arguments);
    };
}();

var recoverFromTrash = exports.recoverFromTrash = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(study) {
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
        return _ref5.apply(this, arguments);
    };
}();

var getStudyConfig = exports.getStudyConfig = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(study) {
        var folderId, trashed, fields, q, request, response, file, contents, config;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (!(!study || !study.id)) {
                            _context6.next = 2;
                            break;
                        }

                        throw new Error("missing study.id");

                    case 2:
                        folderId = study.id;
                        trashed = false;
                        fields = 'id,properties';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            parents: folderId,
                            name: configName,
                            trashed: false,
                            mimeType: configMimeType
                        });
                        request = { q: q, fields: fields, spaces: spaces, pageSize: pageSize, orderBy: orderBy };
                        _context6.next = 9;
                        return gapi.client.drive.files.list(request);

                    case 9:
                        response = _context6.sent;
                        file = response.result.files[0];
                        _context6.next = 13;
                        return X.contents(file.id);

                    case 13:
                        contents = _context6.sent;
                        config = _typeof(contents === 'string') ? JSON.parse(contents) : contents;
                        return _context6.abrupt('return', Object.assign({}, study, config));

                    case 16:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getStudyConfig(_x4) {
        return _ref6.apply(this, arguments);
    };
}();

var saveStudyConfig = exports.saveStudyConfig = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(study) {
        var createStudyDirectory = function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(options) {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            return function createStudyDirectory(_x6) {
                return _ref8.apply(this, arguments);
            };
        }();

        var createStudyConfigFile = function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(config) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            return function createStudyConfigFile(_x7) {
                return _ref9.apply(this, arguments);
            };
        }();

        var config, options, folderId, createdDir, uploader, upload;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        config = study.config;
                        options = {
                            id: study.folderId,
                            name: study.name,
                            description: study.description
                        };
                        folderId = void 0, createdDir = void 0;

                        if (!options.id) {
                            _context9.next = 7;
                            break;
                        }

                        folderId = options.id;
                        _context9.next = 11;
                        break;

                    case 7:
                        _context9.next = 9;
                        return createStudyDirectory(options);

                    case 9:
                        createdDir = _context9.sent;

                        folderId = createdDir.id;

                    case 11:
                        uploader = UploaderForGoogleDrive({
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
                            onProgress: dbProgressReporter('uploading')

                        });
                        _context9.next = 14;
                        return uploader.upload();

                    case 14:
                        upload = _context9.sent;
                        return _context9.abrupt('return', study);

                    case 16:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function saveStudyConfig(_x5) {
        return _ref7.apply(this, arguments);
    };
}();

exports.init = init;
exports.uploadStudyZip = uploadStudyZip;

var _searchStringForGoogleDrive = require('search-string-for-google-drive');

var _searchStringForGoogleDrive2 = _interopRequireDefault(_searchStringForGoogleDrive);

var _xForGoogleDrive = require('./xForGoogleDrive');

var _xForGoogleDrive2 = _interopRequireDefault(_xForGoogleDrive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

var X = (0, _xForGoogleDrive2.default)({
    rootFolderId: 'root',
    spaces: 'drive'
});

var spaces = 'drive';
var pageSize = 1000;
var orderBy = 'modifiedTime desc';

var folderMimeType = 'application/vnd.google-apps.folder';
var studyFolderRole = 'Econ1.Net Study Folder';

var configMimeType = 'application/json';
var configName = 'config.json';

var user = null;
var storageQuota = null;

function init() {}

function uploadStudyZip(zipBlob, options) {}
