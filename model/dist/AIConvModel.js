"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AIConvModel = exports.TYPE_AI_CONV = void 0;
var hydrooj_1 = require("hydrooj");
exports.TYPE_AI_CONV = 80;
var coll = hydrooj_1.db.collection('ai_conv');
var settingsColl = hydrooj_1.db.collection('ai_coach_settings');
var AIConvModel = /** @class */ (function () {
    function AIConvModel() {
    }
    AIConvModel.add = function (uid, problemId, domainId) {
        return __awaiter(this, void 0, Promise, function () {
            var payload, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            docType: exports.TYPE_AI_CONV,
                            uid: uid,
                            problemId: problemId,
                            domainId: domainId,
                            count: 0,
                            messages: [{
                                    role: "assistant",
                                    content: "hello, how can I help you with?",
                                    timestamp: Date.now()
                                }]
                        };
                        return [4 /*yield*/, coll.insertOne(payload)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result._id];
                }
            });
        });
    };
    AIConvModel.remove = function (domainId, uid, problemId) {
        return __awaiter(this, void 0, Promise, function () {
            var doc, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, coll.findOne({ domainId: domainId, uid: uid, problemId: problemId })];
                    case 1:
                        doc = _a.sent();
                        if (!(doc && doc.messages.length > 0)) return [3 /*break*/, 3];
                        // Remove the last message from the array
                        doc.messages.pop();
                        // Update the document in the database using _id
                        return [4 /*yield*/, coll.updateOne({ domainId: domainId, uid: uid, problemId: problemId }, {
                                $set: {
                                    messages: doc.messages
                                }
                            })];
                    case 2:
                        // Update the document in the database using _id
                        _a.sent();
                        console.log("message deleted for ", doc._id);
                        return [2 /*return*/, doc];
                    case 3: return [2 /*return*/, null];
                    case 4:
                        err_1 = _a.sent();
                        // Handle invalid ObjectId format
                        console.error('Invalid ObjectId format:', err_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AIConvModel.check = function (domainId) {
        return __awaiter(this, void 0, Promise, function () {
            var credentials;
            return __generator(this, function (_a) {
                credentials = settingsColl.findOne({ domainId: domainId });
                return [2 /*return*/, credentials.useAI];
            });
        });
    };
    AIConvModel.get = function (uid, problemId, domainId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, coll.findOne({ uid: uid, problemId: problemId, domainId: domainId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AIConvModel.edit = function (did, message) {
        return __awaiter(this, void 0, Promise, function () {
            var newMessage, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newMessage = {
                            role: message.role,
                            content: message.content,
                            timestamp: Date.now()
                        };
                        return [4 /*yield*/, coll.findOneAndUpdate({ _id: did }, { $push: { messages: newMessage } }, { returnDocument: 'after' })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    AIConvModel.inc = function (did) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, coll.findOneAndUpdate({ _id: did }, { $inc: { count: 1 } }, { returnDocument: 'after' })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    AIConvModel.getMulti = function (domainId, query) {
        if (query === void 0) { query = {}; }
        return coll.find(__assign({ domainId: domainId }, query)).sort({ _id: -1 });
    };
    return AIConvModel;
}());
exports.AIConvModel = AIConvModel;
