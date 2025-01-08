import {db, Handler, param, Types, ObjectId, PRIV, DiscussionNotFoundError } from 'hydrooj';
import { AIConvDoc, AIConvModel } from '../model/AIConvModel';
import { getAISettings } from '../public/getAISettings';


const coll = db.collection('ai_conv');
const collProblem = db.collection('document');



export class ConvHistHandler extends Handler {
    aidoc?: AIConvDoc;
    @param('uid', Types.Int)
    @param('domainId', Types.string)
    @param('problemId', Types.string)
    async get(domainId: string, uid: number, problemId: string) {
        try {
            this.aidoc = await AIConvModel.get( uid, problemId, domainId);
            if (!this.aidoc) {
                this.checkPriv(PRIV.PRIV_USER_PROFILE);
                this.aidoc = await AIConvModel.add(uid, problemId, domainId);
            }
            return this.aidoc;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}


export class AIMessageHandler extends Handler {
    aidoc ?: AIConvDoc

    @param('convId', Types.ObjectId, true)
    async post(convId: ObjectId) {
        // Get content from request body
        const content = this.request.json.content;
        
        try {
            // Send user message
            await this.sendMessage(convId, {
                role: 'user', 
                content, 
                timestamp: Date.now()
            });

            // Get AI response
            const aiResponse = await this.getAiResponse(convId, content);
            
            // Return response
            this.response.body = {
                success: true,
                message: aiResponse
            };
        } catch (error) {
            this.response.body = {
                success: false,
                error: error.message
            };
        }
    }

    async sendMessage(convId:Types.String, message: Types.Array) {
        const payload = {role: message.role, content: message.content, timestamp: message.timestamp};
        await AIConvModel.edit(convId, payload);
    }


    async getAiResponse(convId:string, content: string){
            // Get credentials from getAISettings
            const aiCredentials = await getAISettings(this.aidoc!.domainId) || {key: null, url: null, model: null};
            if (!aiCredentials.key || !aiCredentials.url || !aiCredentials.model) {
                return null;
            }
        
            const convHist = await coll.findOne({ did: this.aidoc!._id });
            const problem = await collProblem.finfOne({pid:convHist.problemId})
            if (!problem) throw new Error('Problem not found');
            const description = problem.content[0];
    
            let code = '';
    
            const editorCode = (window as any).editor?.getValue();
            // Method 3: If you have access to the Editor component instance
            code = editorCode.value();
    
            try {
            // Make request using fetch API
            let tempAiConv = Array['']
            tempAiConv = [{
                role: "system",
                content: `You are an expert assistant that helps with code analysis and debugging. Be precise and concise.This's the code description: /n${description}, and here's the user input: /n${code}`
            }].push(convHist.messages)
            const response = await fetch(aiCredentials.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${aiCredentials.key}`,
                    'Content-Type': 'application/json'
                },
                
                body: JSON.stringify({
                    model: aiCredentials.model,
                    messages:  tempAiConv.push({
                        role: "user",
                        content: content
                    }),
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
            }
    
            const data = await response.json();
            const message = {role:"Assistant", content:data.choices[0].message.content, timestamp: Date.now()};
            this.sendMessage(did, message);
            return message;
    
        } catch (error) {
            throw new Error(`Failed to get AI response: ${error.message}`);
        }
    }
}