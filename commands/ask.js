"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var discord_js_1 = require("discord.js");
var CollectorAuthors = (function (_super) {
    __extends(CollectorAuthors, _super);
    function CollectorAuthors() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CollectorAuthors;
}(discord_js_1.MessageCollector));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ask')
        .setDescription('Starts a AskOuija Question')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(function (option) { return option
        .setName('question')
        .setDescription('What to ask?')
        .setRequired(true); })
        .addBooleanOption(function (option) { return option
        .setName('editable')
        .setDescription('Allow users to edit their message')
        .setRequired(false); })
        .addIntegerOption(function (option) { return option
        .setName('amount')
        .setDescription('The amount of characters users are allowed')
        .setRequired(false); }),
    execute: function (interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var question, editable, amountChars, channel, thread, collector;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if ((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.isThread())
                            return [2];
                        question = interaction.options.getString('question');
                        editable = (_b = interaction.options.getBoolean('editable')) !== null && _b !== void 0 ? _b : false;
                        amountChars = (_c = interaction.options.getInteger('amount')) !== null && _c !== void 0 ? _c : 1;
                        channel = interaction.channel;
                        return [4, interaction.deferReply()];
                    case 1:
                        _d.sent();
                        return [4, (channel === null || channel === void 0 ? void 0 : channel.threads.create({
                                name: question,
                                reason: 'A new AskOuija question',
                                autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.OneWeek
                            }))];
                    case 2:
                        thread = _d.sent();
                        if (!thread.joinable) return [3, 4];
                        return [4, thread.join()];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        collector = thread.createMessageCollector({ dispose: true });
                        collector.authors = new Map();
                        thread.client.on(discord_js_1.Events.MessageUpdate, function (oldMessage, newMessage) {
                            var _a;
                            if (!editable && !((_a = newMessage.member) === null || _a === void 0 ? void 0 : _a.permissions.has(discord_js_1.PermissionFlagsBits.Administrator))) {
                                collector.collected.set(newMessage.id, oldMessage);
                            }
                        });
                        thread.client.on(discord_js_1.Events.MessageDelete, function (message) {
                            if (message.author) {
                                collector.authors["delete"](message.author.id);
                            }
                        });
                        collector.on('collect', function (message) {
                            var _a, _b, _c;
                            if (((_a = collector.authors.get(message.author.id)) !== null && _a !== void 0 ? _a : 0) > amountChars && !((_b = message.member) === null || _b === void 0 ? void 0 : _b.permissions.has(discord_js_1.PermissionFlagsBits.Administrator))) {
                                collector.collected["delete"](message.id);
                                message["delete"]();
                            }
                            else if (message.content.toUpperCase() === 'GOODBYE') {
                                collector.collected["delete"](message.id);
                                collector.stop();
                            }
                            else if (message.content.length != 1) {
                                collector.collected["delete"](message.id);
                                message["delete"]();
                            }
                            else {
                                var chars = (_c = collector.authors.get(message.author.id)) !== null && _c !== void 0 ? _c : 0;
                                collector.authors.set(message.author.id, chars + 1);
                            }
                        });
                        collector.on('end', function (collected) { return __awaiter(_this, void 0, void 0, function () {
                            var answer, response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        answer = collected.map(function (value) { return value.content; }).join('').toUpperCase();
                                        response = "```yaml\nQuestion: ".concat(question, " \nAnswer: ").concat(answer, " \n```");
                                        if (!question.includes('_')) return [3, 2];
                                        response = "```yaml\n".concat(question.replace(/_*/i, answer), "\n```");
                                        return [4, thread.setName(response)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [4, thread.send(response)];
                                    case 3:
                                        _a.sent();
                                        return [4, thread.setLocked(true)];
                                    case 4:
                                        _a.sent();
                                        return [4, interaction.editReply(response)];
                                    case 5:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        return [2];
                }
            });
        });
    }
};
