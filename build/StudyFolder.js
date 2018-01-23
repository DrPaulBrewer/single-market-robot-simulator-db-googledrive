'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global driveX: true, pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

var StudyFolder = exports.StudyFolder = function () {
    function StudyFolder(props) {
        var _this = this;

        _classCallCheck(this, StudyFolder);

        Object.keys(props).forEach(function (k) {
            _this[k] = props[k];
        });
    }

    _createClass(StudyFolder, [{
        key: 'trash',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.trashed = true;
                                _context.next = 3;
                                return this.update({ trashed: true });

                            case 3:
                                return _context.abrupt('return', this);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function trash() {
                return _ref.apply(this, arguments);
            }

            return trash;
        }()
    }, {
        key: 'untrash',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                this.trashed = false;
                                _context2.next = 3;
                                return this.update({ trashed: false });

                            case 3:
                                return _context2.abrupt('return', this);

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function untrash() {
                return _ref2.apply(this, arguments);
            }

            return untrash;
        }()
    }, {
        key: 'getConfig',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var folder, config, shouldFixName, shouldFixDescription;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                folder = this;
                                _context3.next = 3;
                                return this.download({ name: 'config.json' });

                            case 3:
                                config = _context3.sent;
                                shouldFixName = config.name && this.name && this.name.length && config.name !== this.name;
                                shouldFixDescription = config.description && this.description && this.description.length && config.description !== this.description;

                                if (shouldFixName) config.name = this.name;
                                if (shouldFixDescription) config.description = this.description;

                                if (!(shouldFixName || shouldFixDescription)) {
                                    _context3.next = 11;
                                    break;
                                }

                                _context3.next = 11;
                                return this.upload({
                                    name: 'config.json',
                                    contents: config,
                                    force: true
                                });

                            case 11:
                                return _context3.abrupt('return', { config: config, folder: folder });

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getConfig() {
                return _ref3.apply(this, arguments);
            }

            return getConfig;
        }()
    }, {
        key: 'setConfig',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref4) {
                var config = _ref4.config;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!(config && (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object')) {
                                    _context4.next = 9;
                                    break;
                                }

                                if (!(config.name !== this.name)) {
                                    _context4.next = 3;
                                    break;
                                }

                                throw new Error('mismatch at StudyFolder:setConfig configuration name ' + config.name + ' should equal the folder name ' + this.name);

                            case 3:
                                if (!(this.description !== config.description)) {
                                    _context4.next = 7;
                                    break;
                                }

                                this.description = config.description;
                                _context4.next = 7;
                                return this.update({ description: config.description });

                            case 7:
                                _context4.next = 9;
                                return this.upload({ name: 'config.json', contents: config });

                            case 9:
                                return _context4.abrupt('return', this);

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function setConfig(_x) {
                return _ref5.apply(this, arguments);
            }

            return setConfig;
        }()
    }, {
        key: 'listFiles',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var trashed, folderId, orderBy, searcher, response;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                trashed = this.trashed;
                                folderId = this.id;
                                orderBy = 'modifiedTime desc';
                                searcher = driveX.searcher({
                                    trashed: trashed,
                                    orderBy: orderBy
                                });
                                _context5.next = 6;
                                return searcher(folderId);

                            case 6:
                                response = _context5.sent;
                                return _context5.abrupt('return', response.files);

                            case 8:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function listFiles() {
                return _ref6.apply(this, arguments);
            }

            return listFiles;
        }()
    }, {
        key: 'fileId',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(name) {
                var trashed, orderBy, fileFinder, folderId, response, fileId;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                trashed = this.trashed;
                                orderBy = 'modifiedTime desc';
                                fileFinder = driveX.searcher({ trashed: trashed, orderBy: orderBy });
                                folderId = this.id;
                                _context6.next = 6;
                                return fileFinder(folderId, name);

                            case 6:
                                response = _context6.sent;
                                fileId = response && response.files && response.files[0] && response.files[0].id;
                                return _context6.abrupt('return', fileId);

                            case 9:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function fileId(_x2) {
                return _ref7.apply(this, arguments);
            }

            return fileId;
        }()
    }, {
        key: 'download',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_ref8) {
                var name = _ref8.name,
                    id = _ref8.id;
                var fileId, contents;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.t0 = id;

                                if (_context7.t0) {
                                    _context7.next = 5;
                                    break;
                                }

                                _context7.next = 4;
                                return this.fileId(name);

                            case 4:
                                _context7.t0 = _context7.sent;

                            case 5:
                                fileId = _context7.t0;
                                _context7.next = 8;
                                return driveX.contents(fileId);

                            case 8:
                                contents = _context7.sent;

                                if (!name.endsWith('.json')) {
                                    _context7.next = 13;
                                    break;
                                }

                                return _context7.abrupt('return', JSON.parse(contents));

                            case 13:
                                return _context7.abrupt('return', contents);

                            case 14:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function download(_x3) {
                return _ref9.apply(this, arguments);
            }

            return download;
        }()
    }, {
        key: 'update',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(metadata) {
                var folder, response;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                folder = this;
                                _context8.next = 3;
                                return driveX.updateMetadata(folder.id, metadata);

                            case 3:
                                response = _context8.sent;
                                return _context8.abrupt('return', response);

                            case 5:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function update(_x4) {
                return _ref10.apply(this, arguments);
            }

            return update;
        }()
    }, {
        key: 'upload',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(_ref11) {
                var name = _ref11.name,
                    contents = _ref11.contents,
                    blob = _ref11.blob,
                    onProgress = _ref11.onProgress,
                    force = _ref11.force;
                var files, hasZipFiles, existingFile, existingFileId, folderId, myFile, mimeType;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.listFiles();

                            case 2:
                                files = _context9.sent;
                                hasZipFiles = files.some(function (f) {
                                    return f.name.endsWith(".zip");
                                });

                                if (!(!force && name === 'config.json' && hasZipFiles)) {
                                    _context9.next = 6;
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
                                _context9.next = 15;
                                return pUploaderForGoogleDrive({
                                    file: myFile,
                                    fileId: existingFileId,
                                    metadata: {
                                        name: name,
                                        mimeType: mimeType,
                                        parents: [folderId]
                                    },
                                    params: {
                                        spaces: 'drive',
                                        fields: 'id,name,mimeType,parents'
                                    },
                                    onProgress: onProgress
                                });

                            case 15:
                                return _context9.abrupt('return', this);

                            case 16:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function upload(_x5) {
                return _ref12.apply(this, arguments);
            }

            return upload;
        }()
    }]);

    return StudyFolder;
}();