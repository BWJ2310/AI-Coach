import { db, Handler, param, Types, ObjectId, PRIV, DiscussionNotFoundError } from 'hydrooj';
import { AIConvDoc, AIConvModel } from '../model/AIConvModel';
import { getAISettings } from '../public/getAISettings';

const coll = db.collection('ai_coach_settings');

export class coachHandler extends Handler {
    ddoc?: AIConvDoc;

    @param('did', Types.ObjectId, true)
    async _prepare(domainId: string, did: ObjectId) {
        if (did) {
            this.ddoc = await AIConvModel.get(did);
            if (!this.ddoc) throw new DiscussionNotFoundError(domainId, did);
        }
    }
}


export class ConvHistHandler extends coachHandler {
    @param('uid', Types.Int)
    @param('domainId', Types.string)
    @param('problemId', Types.string)
    async get(domainId: string, uid: number, problemId: string) {
        try {
            if (!this.ddoc) {
                this.checkPriv(PRIV.PRIV_USER_PROFILE);
                this.ddoc = await AIConvModel.add(uid, problemId, domainId);
            }
            return this.response.body = this.ddoc;
        } catch (error) {
            return this.response.body = {
                success: false,
                error: error.message
            };
        }
    }
}

export class AIMessageHandler extends ConvHistHandler {
    async post(){
        this.checkPriv(PRIV.PRIV_USER_PROFILE);
    }

    @param('content', Types.Content)
    async userMessage(content: string) {
        this.sendMessage({role: 'user', content: content});
        this.getAiResponse(content);
    }

    async sendMessage(message: Types.Array) {
        const did = this.ddoc!.docId;
        const payload = {role: message.role, content: message.content, timestamp: Date.now()};
        await AIConvModel.edit(did, payload);
        this.response.body = payload;
    }


    async getAiResponse(content: string){
            // Get credentials from getAISettings
            const aiCredentials = await getAISettings(this.ddoc!.domainId) || {key: null, url: null, model: null};
            if (!aiCredentials.key || !aiCredentials.url || !aiCredentials.model) {
                return null;
            }
        
            const problem = await coll.findOne({ problemId: this.ddoc!.problemId });
            if (!problem) throw new Error('Problem not found');
            const description = problem.content[0];
    
            let code = '';
    
            const editorCode = (window as any).editor?.getValue();
            // Method 3: If you have access to the Editor component instance
            code = editorCode.value();
    
            try {
            // Make request using fetch API
            const response = await fetch(aiCredentials.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${aiCredentials.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: aiCredentials.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert assistant that helps with code analysis and debugging. Be precise and concise."
                        },
                        {
                            role: "user",
                            content: `'this's the code description: /n${description}, and here's the user input: /n${code}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
            }
    
            const data = await response.json();
            const message = {role:"Assistant", content:data.choices[0].message.content};
            this.sendMessage(message);
            return message;
    
        } catch (error) {
            throw new Error(`Failed to get AI response: ${error.message}`);
        }
    }
}