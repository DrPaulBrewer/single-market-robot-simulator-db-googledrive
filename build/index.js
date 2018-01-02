'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uploadStudyZip = exports.saveStudyConfig = exports.getStudyConfig = exports.recoverFromTrash = exports.sendToTrash = exports.availableStudies = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var whoAmI = function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(force) {
        var response, result;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        if (!(!iAm.user || force)) {
                            _context10.next = 7;
                            break;
                        }

                        _context10.next = 3;
                        return gapi.client.drive.about.get({ fields: 'user,storageQuota' });

                    case 3:
                        response = _context10.sent;
                        result = response.result;

                        iAm.user = result.user;
                        iAm.storageQuota = result.storageQuota;

                    case 7:
                        return _context10.abrupt('return', iAm.user);

                    case 8:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function whoAmI(_x18) {
        return _ref12.apply(this, arguments);
    };
}();

var econ1NetMainFolder = function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var user, userName, folderName, folder;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return whoAmI(false);

                    case 2:
                        user = _context11.sent;
                        userName = (user.displayName || user.emailAddress).replace(/ /g, '-');
                        folderName = 'Econ1Net-' + userName;
                        _context11.next = 7;
                        return X.folderFactory()('root', folderName);

                    case 7:
                        folder = _context11.sent;
                        return _context11.abrupt('return', folder);

                    case 9:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function econ1NetMainFolder() {
        return _ref13.apply(this, arguments);
    };
}();

var availableStudies = exports.availableStudies = function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(options) {
        var trashed, sharedWithMe, fields, q, request, response;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        trashed = !!options.trashed;
                        sharedWithMe = !!options.sharedWithMe;
                        fields = 'files(id,name,description,parents)';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            mimeType: folderMimeType,
                            properties: {
                                role: studyFolderRole
                            },
                            trashed: trashed,
                            sharedWithMe: sharedWithMe
                        });
                        request = {
                            q: q,
                            orderBy: orderBy,
                            fields: fields,
                            spaces: spaces,
                            pageSize: pageSize
                        };
                        _context12.next = 7;
                        return gapi.client.drive.files.list(request);

                    case 7:
                        response = _context12.sent;
                        return _context12.abrupt('return', response.result.files);

                    case 9:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    return function availableStudies(_x19) {
        return _ref14.apply(this, arguments);
    };
}();

var sendToTrash = exports.sendToTrash = function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(study) {
        var response;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return gapi.client.drive.files.update({ fileId: study.id }, { trashed: true });

                    case 2:
                        response = _context13.sent;
                        return _context13.abrupt('return', response);

                    case 4:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function sendToTrash(_x20) {
        return _ref15.apply(this, arguments);
    };
}();

var recoverFromTrash = exports.recoverFromTrash = function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(study) {
        var response;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        _context14.next = 2;
                        return gapi.client.drive.files.update({ fileId: study.id }, { trashed: false });

                    case 2:
                        response = _context14.sent;
                        return _context14.abrupt('return', response);

                    case 4:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    return function recoverFromTrash(_x21) {
        return _ref16.apply(this, arguments);
    };
}();

var getStudyConfig = exports.getStudyConfig = function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(study) {
        var folderId, fields, q, request, response, file, contents, config;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        if (!(!study || !study.id)) {
                            _context15.next = 2;
                            break;
                        }

                        throw new Error("missing study.id");

                    case 2:
                        folderId = study.id;
                        fields = 'id,properties';
                        q = (0, _searchStringForGoogleDrive2.default)({
                            parents: folderId,
                            name: configName,
                            trashed: false,
                            mimeType: configMimeType
                        });
                        request = { q: q, fields: fields, spaces: spaces, pageSize: pageSize, orderBy: orderBy };
                        _context15.next = 8;
                        return gapi.client.drive.files.list(request);

                    case 8:
                        response = _context15.sent;
                        file = response.result.files[0];
                        _context15.next = 12;
                        return X.contents(file.id);

                    case 12:
                        contents = _context15.sent;
                        config = typeof contents === 'string' ? JSON.parse(contents) : contents;
                        return _context15.abrupt('return', Object.assign({}, study, config));

                    case 15:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    return function getStudyConfig(_x22) {
        return _ref17.apply(this, arguments);
    };
}();

var saveStudyConfig = exports.saveStudyConfig = function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(study) {
        var createStudyDirectory = function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(options) {
                var parent, metaData, response;
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                _context16.next = 2;
                                return econ1NetMainFolder();

                            case 2:
                                parent = _context16.sent;
                                metaData = Object.assign({}, {
                                    mimeType: folderMimeType,
                                    properties: {
                                        role: studyFolderRole
                                    },
                                    parents: [parent]
                                }, options);
                                _context16.next = 6;
                                return gapi.client.drive.files.create({
                                    fields: 'id,name,description'
                                }, metaData);

                            case 6:
                                response = _context16.sent;
                                return _context16.abrupt('return', response.result);

                            case 8:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            return function createStudyDirectory(_x24) {
                return _ref19.apply(this, arguments);
            };
        }();

        var config, options, folderId, createdDir, upload;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        config = study.config;
                        options = {
                            id: study.folderId,
                            name: study.name,
                            description: study.description
                        };
                        folderId = void 0, createdDir = void 0;

                        if (!options.id) {
                            _context17.next = 7;
                            break;
                        }

                        folderId = options.id;
                        _context17.next = 11;
                        break;

                    case 7:
                        _context17.next = 9;
                        return createStudyDirectory(options);

                    case 9:
                        createdDir = _context17.sent;

                        folderId = createdDir.id;

                    case 11:
                        _context17.next = 13;
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

                    case 13:
                        upload = _context17.sent;

                        upload.z = undefined;
                        return _context17.abrupt('return', study);

                    case 16:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    return function saveStudyConfig(_x23) {
        return _ref18.apply(this, arguments);
    };
}();

var uploadStudyZip = exports.uploadStudyZip = function () {
    var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(zipBlob, options) {
        var uploader;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
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
                        uploader = _context18.sent;
                        return _context18.abrupt('return', uploader);

                    case 4:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function uploadStudyZip(_x25, _x26) {
        return _ref20.apply(this, arguments);
    };
}();

exports.init = init;

var _searchStringForGoogleDrive = require('search-string-for-google-drive');

var _searchStringForGoogleDrive2 = _interopRequireDefault(_searchStringForGoogleDrive);

var _pReduce = require('p-reduce');

var _pReduce2 = _interopRequireDefault(_pReduce);

var _singleMarketRobotSimulatorStudy = require('single-market-robot-simulator-study');

var Study = _interopRequireWildcard(_singleMarketRobotSimulatorStudy);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, pUploaderForGoogleDrive:false, Promise:false */

/* eslint-disable no-console */

function extensionsForGoogleDrive(_ref) {
    var driveFindPath = function () {
        var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(path, fields) {
            var parts, stepper, metadata;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            parts = path.split('/').filter(function (s) {
                                return s.length > 0;
                            });
                            stepper = driveStepRight({ fields: fields });
                            _context6.next = 4;
                            return (0, _pReduce2.default)(parts, stepper, rootFolderId);

                        case 4:
                            metadata = _context6.sent;
                            return _context6.abrupt('return', metadata);

                        case 6:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        return function driveFindPath(_x10, _x11) {
            return _ref7.apply(this, arguments);
        };
    }();

    var driveContents = function () {
        var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(fileId, mimeType) {
            var response;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            response = void 0;
                            _context7.prev = 1;
                            _context7.next = 4;
                            return gapi.client.drive.files.get({ fileId: fileId, spaces: spaces, alt: 'media' });

                        case 4:
                            response = _context7.sent;
                            _context7.next = 15;
                            break;

                        case 7:
                            _context7.prev = 7;
                            _context7.t0 = _context7['catch'](1);

                            if (mimeType) {
                                _context7.next = 11;
                                break;
                            }

                            throw _context7.t0;

                        case 11:
                            if (!_context7.t0.toString().includes("Use Export")) {
                                _context7.next = 15;
                                break;
                            }

                            _context7.next = 14;
                            return gapi.client.drive.files.export({ fileId: fileId, spaces: spaces, mimeType: mimeType });

                        case 14:
                            response = _context7.sent;

                        case 15:
                            return _context7.abrupt('return', response && response.body);

                        case 16:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[1, 7]]);
        }));

        return function driveContents(_x12, _x13) {
            return _ref8.apply(this, arguments);
        };
    }();

    var driveDownload = function () {
        var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(path, mimeType) {
            var file, contents;
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return driveFindPath(path);

                        case 2:
                            file = _context8.sent;
                            _context8.next = 5;
                            return driveContents(file.id, mimeType);

                        case 5:
                            contents = _context8.sent;
                            return _context8.abrupt('return', contents);

                        case 7:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        return function driveDownload(_x14, _x15) {
            return _ref9.apply(this, arguments);
        };
    }();

    var driveCreatePath = function () {
        var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(path, meta) {
            var parts, last, dff, parentFolder, lastFolder;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            parts = path.split('/').filter(function (s) {
                                return s.length > 0;
                            });
                            last = parts.pop();
                            dff = driveFolderFactory();
                            _context9.next = 5;
                            return (0, _pReduce2.default)(parts, dff, rootFolderId);

                        case 5:
                            parentFolder = _context9.sent;
                            _context9.next = 8;
                            return driveFolderFactory(meta)(parentFolder, last);

                        case 8:
                            lastFolder = _context9.sent;
                            return _context9.abrupt('return', lastFolder);

                        case 10:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        return function driveCreatePath(_x16, _x17) {
            return _ref10.apply(this, arguments);
        };
    }();

    var rootFolderId = _ref.rootFolderId,
        spaces = _ref.spaces;

    // inspired by v2.0.0 decorated-google-drive, modified to use gapi.client.drive
    // and modified for browser environment

    var folderMimeType = 'application/vnd.google-apps.folder';

    var x = {};

    function driveSearcher(options) {
        var limit = options.limit || 1000;
        var unique = options.unique;
        if (unique) limit = 2;
        var allowMatchAllFiles = options && options.allowMatchAllFiles;
        var fields = options.fields || 'id,name,mimeType,modifiedTime,size';
        var searchTerms = _searchStringForGoogleDrive2.default.extract(options);

        return function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, name) {
                var search, searchString, params, response;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                search = Object.assign({}, searchTerms, { parent: parent, name: name });
                                searchString = (0, _searchStringForGoogleDrive2.default)(search, allowMatchAllFiles);
                                params = {
                                    spaces: spaces,
                                    q: searchString,
                                    pageSize: limit,
                                    maxResults: limit,
                                    orderBy: "folder,name,modifiedTime desc",
                                    fields: 'files(' + fields + ')'
                                };
                                _context.next = 5;
                                return gapi.client.drive.files.list(params);

                            case 5:
                                response = _context.sent;
                                return _context.abrupt('return', {
                                    parent: parent,
                                    name: name,
                                    searchTerms: searchTerms,
                                    limit: limit,
                                    unique: unique,
                                    isSearchResult: true,
                                    files: response.result.files
                                });

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            return function (_x, _x2) {
                return _ref2.apply(this, arguments);
            };
        }();
    }

    x.searcher = driveSearcher;

    var BadRequest = "checkSearch: bad request";
    var FileNotFound = "checkSearch: file not found";
    var ExpectedUniqueFile = "checkSearch: expected unique file";
    var TooManyFiles = "checkSearch: increase limit or too many files found";

    function checkSearch(searchResult) {
        if (!Array.isArray(searchResult.files)) throw new Error(BadRequest);
        if (searchResult.files.length === 0) throw new Error(FileNotFound);
        if (searchResult.unique && searchResult.files.length > 1) throw new Error(ExpectedUniqueFile);
        if (searchResult.files.length === searchResult.files.limit) throw new Error(TooManyFiles);
        searchResult.ok = true;
        return searchResult;
    }

    x.checkSearch = checkSearch;

    function driveJanitor(fileListProperty, successProperty) {
        function deleteFile(file) {
            return gapi.client.drive.files.delete({ fileId: file.id });
        }
        return function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(info) {
                var files;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (successProperty) info[successProperty] = false;
                                files = fileListProperty ? info[fileListProperty] : info;

                                if (files && files.id) files = [files];

                                if (!(Array.isArray(files) && files.length > 0)) {
                                    _context2.next = 5;
                                    break;
                                }

                                return _context2.abrupt('return', Promise.all(files.map(deleteFile)).then(function () {
                                    info[successProperty] = true;
                                    return info;
                                }, function () {
                                    return info;
                                }));

                            case 5:
                                return _context2.abrupt('return', Promise.resolve(info));

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            return function (_x3) {
                return _ref3.apply(this, arguments);
            };
        }();
    }

    x.janitor = driveJanitor;

    function getFolderId(folderIdOrObject) {
        if ((typeof folderIdOrObject === 'undefined' ? 'undefined' : _typeof(folderIdOrObject)) === 'object') {
            if (folderIdOrObject.id) {
                if (folderIdOrObject.mimeType === folderMimeType) return folderIdOrObject.id;
            }
        }
        if (typeof folderIdOrObject === 'string') {
            return folderIdOrObject;
        }
        throw new Error("bad request, not a folder or folder id");
    }

    function driveStepRight(options) {
        var searcherOptions = {
            unique: true,
            mimeType: folderMimeType
        };
        if (options.fields) searcherOptions.fields = options.fields;
        var search = driveSearcher(searcherOptions);
        return function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(folderIdOrObject, name) {
                var parentId, searchResult;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                parentId = getFolderId(folderIdOrObject);
                                _context3.t0 = checkSearch;
                                _context3.next = 4;
                                return search(parentId, name);

                            case 4:
                                _context3.t1 = _context3.sent;
                                searchResult = (0, _context3.t0)(_context3.t1);
                                return _context3.abrupt('return', searchResult.files[0]);

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            return function (_x4, _x5) {
                return _ref4.apply(this, arguments);
            };
        }();
    }

    x.stepRight = driveStepRight;

    // see https://developers.google.com/drive/v3/web/folder

    function driveFolderCreator(meta) {
        return function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(f, name) {
                var parentFolderId, metaData;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                parentFolderId = getFolderId(f);
                                metaData = Object.assign({}, meta, {
                                    mimeType: folderMimeType,
                                    name: name,
                                    parents: [parentFolderId]
                                });
                                _context4.next = 4;
                                return gapi.client.drive.files.create({
                                    fields: 'id, mimeType, name'
                                }, metaData);

                            case 4:
                                return _context4.abrupt('return', _context4.sent);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            return function (_x6, _x7) {
                return _ref5.apply(this, arguments);
            };
        }();
    }

    x.folderCreator = driveFolderCreator;

    function driveFolderFactory(meta) {
        var stepper = driveStepRight({ fields: meta && meta.fields });
        var creator = driveFolderCreator(meta);
        return function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(f, name) {
                var folder;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                folder = void 0;
                                _context5.prev = 1;
                                _context5.next = 4;
                                return stepper(f, name);

                            case 4:
                                folder = _context5.sent;
                                _context5.next = 16;
                                break;

                            case 7:
                                _context5.prev = 7;
                                _context5.t0 = _context5['catch'](1);

                                if (!_context5.t0.toString().includes(FileNotFound)) {
                                    _context5.next = 15;
                                    break;
                                }

                                _context5.next = 12;
                                return creator(f, name);

                            case 12:
                                folder = _context5.sent;
                                _context5.next = 16;
                                break;

                            case 15:
                                throw _context5.t0;

                            case 16:
                                return _context5.abrupt('return', folder);

                            case 17:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[1, 7]]);
            }));

            return function (_x8, _x9) {
                return _ref6.apply(this, arguments);
            };
        }();
    }

    x.folderFactory = driveFolderFactory;

    x.findPath = driveFindPath;

    x.contents = driveContents;

    x.download = driveDownload;

    x.createPath = driveCreatePath;

    return x;
}

var X = extensionsForGoogleDrive({
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
var iAm = {};

var DB = {};

function init(_ref11) {
    var onSignIn = _ref11.onSignIn,
        onSignOut = _ref11.onSignOut,
        onProgress = _ref11.onProgress;

    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onProgress = onProgress;
}

function onUploadProgress(e) {
    console.log(e);
}
