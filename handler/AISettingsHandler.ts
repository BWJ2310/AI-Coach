import {  Context, Handler,  param, Types, PRIV, PERM, system} from 'hydrooj';
import {getAISettings, setAICredential } from '../public/getAISettings'

export class AISettingsHandler extends Handler {
    async prepare() {
        this.checkPerm(PERM.PERM_EDIT_DOMAIN);
    }

    async get({domainId}) {
        const credentials = await getAISettings(domainId )
        this.response.template = 'ai_coach_settings.html';
        this.response.body = { credentials };
    }

    
    @param('useAI',  Types.Boolean)
    @param('count', Types.Number)
    @param('key', Types.String)
    @param('url', Types.String)
    @param('model', Types.String)
    async post( domainId: string, useAI: Boolean, count: number, key: string, url: string, model: string ) {
        // Validate inputs
        if (useAI==null) {
            useAI = false;
        };
        if (!count) {
            count = 10;
        };
        if (!key) throw new Error('API key is required');
        if (!url) throw new Error('API URL is required');
        if (!model) throw new Error('API model is required');

        try {
            // Store settings under domain ID using system model
            await setAICredential(domainId, useAI, count, key, url, model);
            this.response.redirect = this.url('ai_coach_settings', {domainId: domainId});
        } catch (error) {
            throw new Error(`Failed to save API settings: ${error.message}`);
        }
    }
}