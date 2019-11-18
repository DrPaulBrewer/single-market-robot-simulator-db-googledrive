'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StudyFolderForGoogleDrive = exports.arrayPrefer = exports.driveX = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extensionsForGoogleDrive = require('./extensionsForGoogleDrive');

var _arrayPrefer = require('array-prefer');

var _arrayPrefer2 = _interopRequireDefault(_arrayPrefer);

var _singleMarketRobotSimulatorDbStudyfolder = require('single-market-robot-simulator-db-studyfolder');

var _singleMarketRobotSimulatorDbStudyfolder2 = _interopRequireDefault(_singleMarketRobotSimulatorDbStudyfolder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

exports.driveX = _extensionsForGoogleDrive.driveX;
exports.arrayPrefer = _arrayPrefer2.default;

var StudyFolderForGoogleDrive = exports.StudyFolderForGoogleDrive = function (_StudyFolder) {
    _inherits(StudyFolderForGoogleDrive, _StudyFolder);

    function StudyFolderForGoogleDrive() {
        _classCallCheck(this, StudyFolderForGoogleDrive);

        return _possibleConstructorReturn(this, (StudyFolderForGoogleDrive.__proto__ || Object.getPrototypeOf(StudyFolderForGoogleDrive)).apply(this, arguments));
    }

    _createClass(StudyFolderForGoogleDrive, [{
        key: 'search',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
                var trashed, folderId, orderBy, searcher, response;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                trashed = false;
                                folderId = this.id;
                                orderBy = 'modifiedTime desc';
                                searcher = _extensionsForGoogleDrive.driveX.searcher({
                                    trashed: trashed,
                                    orderBy: orderBy
                                });
                                _context.next = 6;
                                return searcher(folderId, name);

                            case 6:
                                response = _context.sent;
                                return _context.abrupt('return', response.files);

                            case 8:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function search(_x) {
                return _ref.apply(this, arguments);
            }

            return search;
        }()
    }, {
        key: 'download',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref2) {
                var name = _ref2.name,
                    id = _ref2.id;
                var fileId, contents;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.t0 = id;

                                if (_context2.t0) {
                                    _context2.next = 5;
                                    break;
                                }

                                _context2.next = 4;
                                return this.fileId(name);

                            case 4:
                                _context2.t0 = _context2.sent;

                            case 5:
                                fileId = _context2.t0;
                                _context2.next = 8;
                                return _extensionsForGoogleDrive.driveX.contents(fileId);

                            case 8:
                                contents = _context2.sent;

                                if (!(name.endsWith('.json') && typeof contents === 'string')) {
                                    _context2.next = 13;
                                    break;
                                }

                                return _context2.abrupt('return', JSON.parse(contents));

                            case 13:
                                return _context2.abrupt('return', contents);

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function download(_x2) {
                return _ref3.apply(this, arguments);
            }

            return download;
        }()
    }, {
        key: 'update',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(metadata) {
                var folder, response;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                folder = this;
                                _context3.next = 3;
                                return _extensionsForGoogleDrive.driveX.updateMetadata(folder.id, metadata);

                            case 3:
                                response = _context3.sent;
                                return _context3.abrupt('return', response);

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function update(_x3) {
                return _ref4.apply(this, arguments);
            }

            return update;
        }()
    }, {
        key: 'upload',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref5) {
                var name = _ref5.name,
                    contents = _ref5.contents,
                    blob = _ref5.blob,
                    onProgress = _ref5.onProgress,
                    force = _ref5.force;
                var files, hasZipFiles, existingFile, existingFileId, folderId, myFile, mimeType, metadata, uploadedDriveFile;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.listFiles();

                            case 2:
                                files = _context4.sent;
                                hasZipFiles = files.some(function (f) {
                                    return f.name.endsWith(".zip");
                                });

                                if (!(!force && name === 'config.json' && hasZipFiles)) {
                                    _context4.next = 6;
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
                                _context4.next = 16;
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
                                uploadedDriveFile = _context4.sent;
                                return _context4.abrupt('return', uploadedDriveFile);

                            case 18:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function upload(_x4) {
                return _ref6.apply(this, arguments);
            }

            return upload;
        }()
    }]);

    return StudyFolderForGoogleDrive;
}(_singleMarketRobotSimulatorDbStudyfolder2.default);