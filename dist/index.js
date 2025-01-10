"use strict";
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
exports.apply = void 0;
var hydrooj_1 = require("hydrooj");
var AISettingsHandler_1 = require("./handler/AISettingsHandler");
var coachHandler_1 = require("./handler/coachHandler");
var problem_1 = require("hydrooj/src/handler/problem");
var AIConvModel_1 = require("./model/AIConvModel");
var getAISettings_1 = require("./public/getAISettings");
function getConversation(uid, problemId, domainId) {
    return __awaiter(this, void 0, void 0, function () {
        var aiConvHist, maxCount, aiSet, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('geting  Ai Conversation for', uid, problemId, domainId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    maxCount = 10;
                    return [4 /*yield*/, getAISettings_1.getAISettings(domainId)];
                case 2:
                    aiSet = _a.sent();
                    if (!aiSet.useAI) {
                        return [2 /*return*/, {
                                noAI: true
                            }];
                    }
                    else {
                        maxCount = Number(aiSet.count);
                    }
                    return [4 /*yield*/, AIConvModel_1.AIConvModel.get(uid, problemId, domainId)];
                case 3:
                    aiConvHist = _a.sent();
                    if (!!aiConvHist) return [3 /*break*/, 5];
                    return [4 /*yield*/, AIConvModel_1.AIConvModel.add(uid, problemId, domainId)];
                case 4:
                    aiConvHist = _a.sent();
                    _a.label = 5;
                case 5:
                    aiConvHist.maxCount = maxCount;
                    return [2 /*return*/, aiConvHist];
                case 6:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
export async function apply(ctx: Context) {

    // Add routes only for settings
    ctx.Route('ai_coach_settings', '/ai_settings', AISettingsHandler);



    ctx.on('handler/after/ProblemDetialhandler#get', async (that) => {
        // Create instances of handlers
       const convHandler = new ConvHistHandler;
       const messageHandler = new AIMessageHandler;

        // Get required parameters from the context
        const domainId = that.args.domainId;
        const uid = that.user._id;
        const problemId = that.args.pid;
        that.args.UiContext.aiConversation = await convHandler.get(domainId, uid, problemId);

        that.args.UiContext.userMessage = async (did:string, content: string) => {
            return await messageHandler.userMessage(did, content);
        };

        try {
            // Set up message handler for the page
            that.response.body.aiMessageHandler = {
                sendMessage: async (did,content) => {
                    return await messageHandler.userMessage(did,content);
                }
            };
           
        } catch (error) {
            console.error('Error loading AI conversation:', error);
            that.response.template.args.aiConversation = { messages: [] };
        }
    });

    // Add domain settings
    ctx.injectUI('DomainManage', 'ai_coach_settings', {
        family: 'Properties',
        icon: 'info'
    });

    // Add translations
    ctx.i18n.load('en', {
        'openai.apikey': 'OpenAI API Key',
        'openai.model': 'Model Name',
        'openai.temperature': 'Temperature',
        'chat.error': 'Failed to get AI response: {0}',
        'ai_coach_settings': 'AI Settings'
    });


    ProblemDetailHandler.prototype.get = async function(...args) {
        this.response.body.conversation = await getConversation(this.args.domainId, this.args.uid, this.args.problemId);
    }
}
 */
function apply(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var originalGet;
        return __generator(this, function (_a) {
            originalGet = problem_1.ProblemDetailHandler.prototype.get;
            problem_1.ProblemDetailHandler.prototype.get = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(this, void 0, void 0, function () {
                    var uid, domainId, pid, aiConvHist, retries, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // Call the original get method first
                            return [4 /*yield*/, originalGet.apply(this, args)];
                            case 1:
                                // Call the original get method first
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 8, , 9]);
                                uid = this.user._id;
                                domainId = this.args.domainId;
                                pid = this.pdoc.pid;
                                // Add a loading flag to response
                                this.response.body.isLoadingConversation = true;
                                return [4 /*yield*/, getConversation(uid, pid, domainId)];
                            case 3:
                                aiConvHist = _a.sent();
                                retries = 3;
                                _a.label = 4;
                            case 4:
                                if (!(!aiConvHist && retries > 0)) return [3 /*break*/, 7];
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                            case 5:
                                _a.sent(); // Wait 1 second
                                return [4 /*yield*/, getConversation(uid, pid, domainId)];
                            case 6:
                                aiConvHist = _a.sent();
                                retries--;
                                return [3 /*break*/, 4];
                            case 7:
                                // Update response with conversation data
                                this.response.body.isLoadingConversation = false;
                                this.response.body.aiConvHist = aiConvHist;
                                return [3 /*break*/, 9];
                            case 8:
                                error_2 = _a.sent();
                                console.error("Error fetching conversation:", error_2);
                                this.response.body.isLoadingConversation = false;
                                this.response.body.aiConvHist = null;
                                return [3 /*break*/, 9];
                            case 9: return [2 /*return*/];
                        }
                    });
                });
            };
            // Add routes only for settings
            ctx.Route('ai_coach_settings', '/ai_settings', AISettingsHandler_1.AISettingsHandler);
            ctx.Route('ai_chat', "/ai_coach/:convId", coachHandler_1.AIMessageHandler, hydrooj_1.PRIV.PRIV_USER_PROFILE);
            // Add domain settings
            ctx.injectUI('DomainManage', 'ai_coach_settings', {
                family: 'Properties',
                icon: 'info'
            });
            // Add translations
            ctx.i18n.load('en', {
                'ai.count': 'Max conversation count',
                'ai.useAI': 'turn on AI?',
                'ai.apikey': 'AI API Key',
                'ai.url': 'AI Base URL',
                'ai.model': 'Model Name',
                'ai.temperature': 'Temperature',
                'chat.error': 'Failed to get AI response: {0}',
                'ai_coach_settings': 'AI Settings',
                'count.left': 'Number of message left: '
            });
            ctx.i18n.load('zh', {
                'ai.count': '  最大对话次数',
                'ai.useAI': '是否启用AI?',
                'ai.apikey': 'OpenAI API密钥',
                'ai.url': 'AI服务链接',
                'ai.model': '模型名称',
                'ai.temperature': '随机性',
                'chat.error': 'AI获取失败: {0}',
                'ai_coach_settings': 'AI设置',
                'count.left': '剩余对话次数：'
            });
            return [2 /*return*/];
        });
    });
}
exports.apply = apply;
