'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StudyFolder = exports.arrayPrefer = exports.driveX = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

var _extensionsForGoogleDrive = require('./extensionsForGoogleDrive');

var _arrayPrefer = require('array-prefer');

var _arrayPrefer2 = _interopRequireDefault(_arrayPrefer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.driveX = _extensionsForGoogleDrive.driveX;
exports.arrayPrefer = _arrayPrefer2.default;

var StudyFolder = exports.StudyFolder = function () {
    function StudyFolder(props) {
        var _this = this;

        _classCallCheck(this, StudyFolder);

        Object.keys(props).forEach(function (k) {
            _this[k] = props[k];
        });
    }

    _createClass(StudyFolder, [{
        key: 'getConfig',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var folder, config, shouldFixName, shouldFixDescription;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                folder = this;
                                _context.next = 3;
                                return this.download({ name: 'config.json' });

                            case 3:
                                config = _context.sent;
                                shouldFixName = config.name && this.name && this.name.length && config.name !== this.name;
                                shouldFixDescription = config.description && this.description && this.description.length && config.description !== this.description;

                                if (shouldFixName) config.name = this.name;
                                if (shouldFixDescription) config.description = this.description;

                                if (!(shouldFixName || shouldFixDescription)) {
                                    _context.next = 11;
                                    break;
                                }

                                _context.next = 11;
                                return this.upload({
                                    name: 'config.json',
                                    contents: config,
                                    force: true
                                });

                            case 11:
                                return _context.abrupt('return', { config: config, folder: folder });

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getConfig() {
                return _ref.apply(this, arguments);
            }

            return getConfig;
        }()
    }, {
        key: 'setConfig',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref2) {
                var config = _ref2.config;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!(config && (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object')) {
                                    _context2.next = 9;
                                    break;
                                }

                                if (!(config.name !== this.name)) {
                                    _context2.next = 3;
                                    break;
                                }

                                throw new Error('mismatch at StudyFolder:setConfig configuration name ' + config.name + ' should equal the folder name ' + this.name);

                            case 3:
                                _context2.next = 5;
                                return this.upload({ name: 'config.json', contents: config });

                            case 5:
                                if (!(this.description !== config.description)) {
                                    _context2.next = 9;
                                    break;
                                }

                                this.description = config.description;
                                _context2.next = 9;
                                return this.update({ description: config.description });

                            case 9:
                                return _context2.abrupt('return', this);

                            case 10:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function setConfig(_x) {
                return _ref3.apply(this, arguments);
            }

            return setConfig;
        }()
    }, {
        key: 'search',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(name) {
                var trashed, folderId, orderBy, searcher, response;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                trashed = false;
                                folderId = this.id;
                                orderBy = 'modifiedTime desc';
                                searcher = _extensionsForGoogleDrive.driveX.searcher({
                                    trashed: trashed,
                                    orderBy: orderBy
                                });
                                _context3.next = 6;
                                return searcher(folderId, name);

                            case 6:
                                response = _context3.sent;
                                return _context3.abrupt('return', response.files);

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function search(_x2) {
                return _ref4.apply(this, arguments);
            }

            return search;
        }()
    }, {
        key: 'listFiles',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var _this2 = this;

                var files;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.search();

                            case 2:
                                files = _context4.sent;

                                if (this.hintFileId) {
                                    files = (0, _arrayPrefer2.default)(files, function (f) {
                                        return f.id === _this2.hintFileId;
                                    }, 1);
                                }
                                return _context4.abrupt('return', files);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function listFiles() {
                return _ref5.apply(this, arguments);
            }

            return listFiles;
        }()
    }, {
        key: 'fileId',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(name) {
                var files, fileId;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.search(name);

                            case 2:
                                files = _context5.sent;
                                fileId = files && files[0] && files[0].id;
                                return _context5.abrupt('return', fileId);

                            case 5:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function fileId(_x3) {
                return _ref6.apply(this, arguments);
            }

            return fileId;
        }()
    }, {
        key: 'download',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref7) {
                var name = _ref7.name,
                    id = _ref7.id;
                var fileId, contents;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.t0 = id;

                                if (_context6.t0) {
                                    _context6.next = 5;
                                    break;
                                }

                                _context6.next = 4;
                                return this.fileId(name);

                            case 4:
                                _context6.t0 = _context6.sent;

                            case 5:
                                fileId = _context6.t0;
                                _context6.next = 8;
                                return _extensionsForGoogleDrive.driveX.contents(fileId);

                            case 8:
                                contents = _context6.sent;

                                if (!(name.endsWith('.json') && typeof contents === 'string')) {
                                    _context6.next = 13;
                                    break;
                                }

                                return _context6.abrupt('return', JSON.parse(contents));

                            case 13:
                                return _context6.abrupt('return', contents);

                            case 14:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function download(_x4) {
                return _ref8.apply(this, arguments);
            }

            return download;
        }()
    }, {
        key: 'update',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(metadata) {
                var folder, response;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                folder = this;
                                _context7.next = 3;
                                return _extensionsForGoogleDrive.driveX.updateMetadata(folder.id, metadata);

                            case 3:
                                response = _context7.sent;
                                return _context7.abrupt('return', response);

                            case 5:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function update(_x5) {
                return _ref9.apply(this, arguments);
            }

            return update;
        }()
    }, {
        key: 'upload',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(_ref10) {
                var name = _ref10.name,
                    contents = _ref10.contents,
                    blob = _ref10.blob,
                    onProgress = _ref10.onProgress,
                    force = _ref10.force;
                var files, hasZipFiles, existingFile, existingFileId, folderId, myFile, mimeType, metadata, uploadedDriveFile;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.listFiles();

                            case 2:
                                files = _context8.sent;
                                hasZipFiles = files.some(function (f) {
                                    return f.name.endsWith(".zip");
                                });

                                if (!(!force && name === 'config.json' && hasZipFiles)) {
                                    _context8.next = 6;
                                    break;
                                }

                                throw new Error("conflict Error in upload logic: may not clobber config.json in a study folder with existing .zip file data: config.json unchanged");

                            case 6:
                                existingFile = files.filter(function (f) {
                                    return f.name === name;
                                });
                                existingFileId = Array.isArray(existingFile) && existingFile[0] && existingFile[0].id;
                                folderId = this.id;
                                myFile = null;
                                mimeType = '';

                                if (contents) {
                                    myFile = new Blob([JSON.stringify(contents, null, 2)], { type: 'application/json' });
                                    mimeType = 'application/json';
                                }
                                if (blob) {
                                    myFile = blob;
                                    if (name.endsWith(".zip")) mimeType = 'application/zip';else mimeType = blob.type || 'application/octet-stream';
                                }
                                metadata = !existingFileId && { name: name, mimeType: mimeType, parents: [folderId] };
                                _context8.next = 16;
                                return pUploaderForGoogleDrive({
                                    file: myFile,
                                    fileId: existingFileId,
                                    metadata: metadata,
                                    params: {
                                        spaces: 'drive',
                                        fields: 'id,name,mimeType,modifiedTime,size,parents,webViewLink'
                                    },
                                    onProgress: onProgress
                                });

                            case 16:
                                uploadedDriveFile = _context8.sent;
                                return _context8.abrupt('return', uploadedDriveFile);

                            case 18:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function upload(_x6) {
                return _ref11.apply(this, arguments);
            }

            return upload;
        }()
    }]);

    return StudyFolder;
}();