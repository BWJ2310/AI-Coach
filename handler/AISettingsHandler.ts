import {  Context, Handler,  param, Types,  PERM, system} from 'hydrooj';

import { getAISettings } from '../public/getAISettings';

export class AISettingsHandler extends Handler {
    async prepare() {
        this.checkPerm(PERM.PERM_EDIT_DOMAIN);
    }

    async get({ domainId }) {
        const credentials = await getAISettings(domainId) || {
            key: '',
            url: '',
            model: ''
        };

        this.response.template = 'ai_coach_settings.html';
        this.response.body = { credentials };
    }

    @param('key', Types.String)
    @param('url', Types.String)
    @param('model', Types.String)
    @param('useAI', Types.Boolean)
    async post(domainId: string, key: string, url: string, model: string, useAI:Boolean) {
        // Validate inputs
        if (!key) throw new Error('API key is required');
        if (!url) throw new Error('API URL is required');
        if (!model) throw new Error('Model name is required');

        try {
            // Store settings under domain ID using system model
            await system.set(`${domainId}.apikey`, key);
            await system.set(`${domainId}.url`, url);
            await system.set(`${domainId}.model`, model);
            await system.set(`${domainId}.useAI`, useAI);
            this.response.redirect = this.url('ai_coach_settings', {domainId: domainId});
        } catch (error) {
            throw new Error(`Failed to save API settings: ${error.message}`);
        }
    }
}