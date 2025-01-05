import { db, Context, Handler,ObjectId, DocumentModel, Filter,  PRIV, param, Types,  PERM, } from 'hydrooj';
import { AISettingsHandler } from './handler/AISettingsHandler';
import { AIConvModel } from './model/AIConvModel';
import request from 'vj/utils';

import {coachHandler, ConvHistHandler, AIMessageHandler} from './handler/coachHandler';

global.Hydro.model.blog = AIConvModel;


export async function apply(ctx: Context) {

    // Add routes
    ctx.Route('ai_coach_settings', '/domain/ai', AISettingsHandler);
    ctx.Route('ai_conv', `/ai/conv/${this.domainId}/${this.uid}/${this.problemId}`, ConvHistHandler);
    ctx.Route('ai_chat', `/ai/chat/:domainId/:uid/:problemId`, AIMessageHandler);

    // Add domain settings
    ctx.injectUI('DomainManage', 'ai_coach_settings',{family: 'Properties', icon: 'info' });

    // Add translations
    ctx.i18n.load('en', {
        'openai.apikey': 'OpenAI API Key',
        'openai.model': 'Model Name',
        'openai.temperature': 'Temperature',
        'chat.error': 'Failed to get AI response: {0}',
        'ai_coach_settings': 'AI Settings'
    });
}


