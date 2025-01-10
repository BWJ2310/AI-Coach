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
            const aiSet = await getAISettings(domainId)
            if (!aiSet.useAI){
                return {
                    noAI:true
                }
            }
            this.aidoc = await AIConvModel.get( uid, problemId, domainId);
            if (!this.aidoc) {
                this.checkPriv(PRIV.PRIV_USER_PROFILE);
                this.aidoc = await AIConvModel.add(uid, problemId, domainId);
            }
            if (this.aidoc?.messages[this.aidoc.messages.length - 1].role === 'user'){
                this.aidoc = await AIConvModel.remove(this.aidoc._id)
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
    async post(content: string, convId: ObjectId) {
        // Get content from request body
        console.log('content is', content);
        try {
            // Send user message
            await this.sendMessage(convId, {
                role: 'user', 
                content:content.message, 
                timestamp: Date.now()
            });

            // Get AI response
            const domainId = content.domainId;
            const code = content.code;  
            const aiResponse = await this.getAiResponse(content.convId, domainId, code);
            if (aiResponse){
                await this.sendMessage(convId, aiResponse);
                await AIConvModel.inc(convId);
            }else{
                await AIConvModel.remove(convId)
            }
            // Return response
            this.response.body = {
                success: true,
                content: aiResponse
            };
        } catch (error) {
            this.response.body = {
                success: false,
                error: error.message
            };
        }
    }

    async sendMessage(convId:Types.String, message: Types.Array) {
        await AIConvModel.edit(convId, message);
    }


    async getAiResponse(convId:string,  domainId: string, code: string) {
            // Get credentials from getAISettings
            const aiSet = await getAISettings(domainId) || {useAI: true, count: 10};
            const convHist = await coll.findOne({ _id: new ObjectId(convId) });
            console.log('convHist is', convHist);

            if (convHist.count>=aiSet.count){
                return{
                    role: "assistant", content: "Max conversation reached"
                };
            }
            const aiCredentials = await getAISettings("system") || {key: null, url: null, model: null};
            console.log(`credentials at ${domainId} is ${aiCredentials.key} ${aiCredentials.url} ${aiCredentials.model}`);
            if (!aiCredentials.key || !aiCredentials.url || !aiCredentials.model) {
                return {role: "assistant", content:"AI credentials not found", timestamp: Date.now()};
            }
            const problem = await collProblem.findOne({pid:convHist.problemId})
            console.log('problem is', problem);
            if (!problem) throw new Error('Problem not found');
            const description = JSON.parse(problem.content).zh;
            console.log('description is', description);     


            const systemMessage = {role:"system", content:JSON.stringify(`You are an expert assistant that helps with code analysis and debugging. Be precise and concise. Here's the problem description:`+ 
                description+
                `User's code or input:`  + code)};

            console.log("systemMessage is ", systemMessage)

            let tempAiConv = [ systemMessage,
                ...(convHist.messages || []).map(({ role, content }) => ({
                    role,
                    content: typeof content === 'string' ? content.trim() : content
                }))
            ];

            const requestBody = JSON.stringify( {
                model: aiCredentials.model,
                messages: tempAiConv,
                temperature: 0.7,
                max_tokens: 1000,
            });

            console.log("request body is ", requestBody)
            
            let fullRequstBody = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${aiCredentials.key}`
                },
                body: requestBody
            }

            console.log('fullRequstBody is ', JSON.stringify(fullRequstBody))

            try {
                const response = await fetch(aiCredentials.url, fullRequstBody);
            
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
                }
            
                const data = await response.json();
                const message = { role: "assistant", content: data.choices[0].message.content, timestamp: Date.now()};
                console.log(message)
                return message;
            
            } catch (error) {
                throw new Error(`Failed to get AI response: ${error.message}`);
            }
    }
}