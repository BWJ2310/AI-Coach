"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AIMessageHandler = exports.ConvHistHandler = void 0;
var hydrooj_1 = require("hydrooj");
var AIConvModel_1 = require("../model/AIConvModel");
var getAISettings_1 = require("../public/getAISettings");
var coll = hydrooj_1.db.collection('ai_conv');
var collProblem = hydrooj_1.db.collection('document');
var ConvHistHandler = /** @class */ (function (_super) {
    __extends(ConvHistHandler, _super);
    function ConvHistHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConvHistHandler.prototype.get = function (domainId, uid, problemId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var aiSet, _b, _c, _d, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, getAISettings_1.getAISettings(domainId)];
                    case 1:
                        aiSet = _e.sent();
                        if (!aiSet.useAI) {
                            return [2 /*return*/, {
                                    noAI: true
                                }];
                        }
                        _b = this;
                        return [4 /*yield*/, AIConvModel_1.AIConvModel.get(uid, problemId, domainId)];
                    case 2:
                        _b.aidoc = _e.sent();
                        if (!!this.aidoc) return [3 /*break*/, 4];
                        this.checkPriv(hydrooj_1.PRIV.PRIV_USER_PROFILE);
                        _c = this;
                        return [4 /*yield*/, AIConvModel_1.AIConvModel.add(uid, problemId, domainId)];
                    case 3:
                        _c.aidoc = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!(((_a = this.aidoc) === null || _a === void 0 ? void 0 : _a.messages[this.aidoc.messages.length - 1].role) === 'user')) return [3 /*break*/, 6];
                        _d = this;
                        return [4 /*yield*/, AIConvModel_1.AIConvModel.remove(this.aidoc._id)];
                    case 5:
                        _d.aidoc = _e.sent();
                        _e.label = 6;
                    case 6: return [2 /*return*/, this.aidoc];
                    case 7:
                        error_1 = _e.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        hydrooj_1.param('uid', hydrooj_1.Types.Int),
        hydrooj_1.param('domainId', hydrooj_1.Types.string),
        hydrooj_1.param('problemId', hydrooj_1.Types.string)
    ], ConvHistHandler.prototype, "get");
    return ConvHistHandler;
}(hydrooj_1.Handler));
exports.ConvHistHandler = ConvHistHandler;
var AIMessageHandler = /** @class */ (function (_super) {
    __extends(AIMessageHandler, _super);
    function AIMessageHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AIMessageHandler.prototype.post = function (content, convId) {
        return __awaiter(this, void 0, void 0, function () {
            var domainId, code, aiResponse, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Get content from request body
                        console.log('content is', content);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        // Send user message
                        return [4 /*yield*/, this.sendMessage(convId, {
                                role: 'user',
                                content: content.message,
                                timestamp: Date.now()
                            })];
                    case 2:
                        // Send user message
                        _a.sent();
                        domainId = content.domainId;
                        code = content.code;
                        return [4 /*yield*/, this.getAiResponse(content.convId, domainId, code)];
                    case 3:
                        aiResponse = _a.sent();
                        if (!aiResponse) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendMessage(convId, aiResponse)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, AIConvModel_1.AIConvModel.inc(convId)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, AIConvModel_1.AIConvModel.remove(convId)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        // Return response
                        this.response.body = {
                            success: true,
                            content: aiResponse
                        };
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _a.sent();
                        this.response.body = {
                            success: false,
                            error: error_2.message
                        };
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    AIMessageHandler.prototype.sendMessage = function (convId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AIConvModel_1.AIConvModel.edit(convId, message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AIMessageHandler.prototype.getAiResponse = function (convId, domainId, code) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var aiSet, convHist, aiCredentials, problem, description, systemMessage, tempAiConv, requestBody, fullRequstBody, response, error, data, message, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, getAISettings_1.getAISettings(domainId)];
                    case 1:
                        aiSet = (_b.sent()) || { useAI: true, count: 10 };
                        return [4 /*yield*/, coll.findOne({ _id: new hydrooj_1.ObjectId(convId) })];
                    case 2:
                        convHist = _b.sent();
                        console.log('convHist is', convHist);
                        if (convHist.count >= aiSet.count) {
                            return [2 /*return*/, {
                                    role: "assistant", content: "Max conversation reached"
                                }];
                        }
                        return [4 /*yield*/, getAISettings_1.getAISettings("system")];
                    case 3:
                        aiCredentials = (_b.sent()) || { key: null, url: null, model: null };
                        console.log("credentials at " + domainId + " is " + aiCredentials.key + " " + aiCredentials.url + " " + aiCredentials.model);
                        if (!aiCredentials.key || !aiCredentials.url || !aiCredentials.model) {
                            return [2 /*return*/, { role: "assistant", content: "AI credentials not found", timestamp: Date.now() }];
                        }
                        return [4 /*yield*/, collProblem.findOne({ pid: convHist.problemId })];
                    case 4:
                        problem = _b.sent();
                        console.log('problem is', problem);
                        if (!problem)
                            throw new Error('Problem not found');
                        description = JSON.parse(problem.content).zh;
                        console.log('description is', description);
                        systemMessage = { role: "system", content: JSON.stringify("You are an expert assistant that helps with code analysis and debugging. Be precise and concise. Here's the problem description:" +
                                description +
                                "User's code or input:" + code) };
                        console.log("systemMessage is ", systemMessage);
                        tempAiConv = __spreadArrays([systemMessage], (convHist.messages || []).map(function (_a) {
                            var role = _a.role, content = _a.content;
                            return ({
                                role: role,
                                content: typeof content === 'string' ? content.trim() : content
                            });
                        }));
                        requestBody = JSON.stringify({
                            model: aiCredentials.model,
                            messages: tempAiConv,
                            temperature: 0.7,
                            max_tokens: 1000
                        });
                        console.log("request body is ", requestBody);
                        fullRequstBody = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + aiCredentials.key
                            },
                            body: requestBody
                        };
                        console.log('fullRequstBody is ', JSON.stringify(fullRequstBody));
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 10, , 11]);
                        return [4 /*yield*/, fetch(aiCredentials.url, fullRequstBody)];
                    case 6:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 8];
                        return [4 /*yield*/, response.json()];
                    case 7:
                        error = _b.sent();
                        throw new Error("OpenAI API Error: " + (((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error'));
                    case 8: return [4 /*yield*/, response.json()];
                    case 9:
                        data = _b.sent();
                        message = { role: "assistant", content: data.choices[0].message.content, timestamp: Date.now() };
                        console.log(message);
                        return [2 /*return*/, message];
                    case 10:
                        error_3 = _b.sent();
                        throw new Error("Failed to get AI response: " + error_3.message);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        hydrooj_1.param('convId', hydrooj_1.Types.ObjectId, true)
    ], AIMessageHandler.prototype, "post");
    return AIMessageHandler;
}(hydrooj_1.Handler));
exports.AIMessageHandler = AIMessageHandler;
