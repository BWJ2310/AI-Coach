import {db, Handler, param, Types, ObjectId, PRIV, DiscussionNotFoundError } from 'hydrooj';
import { AIConvDoc, AIConvModel } from '../model/AIConvModel';
import { getAISettings } from '../public/getAISettings';


const coll = db.collection('ai_conv');
const collProblem = db.collection('document');


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
            const codeLang = content.codeLang;
            const aiResponse = await this.getAiResponse(content.convId, domainId, code, codeLang);
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


    async getAiResponse(convId:string,  domainId: string, code: string, codeLang:string) {
            // Get credentials from getAISettings
            const aiSet = await getAISettings(domainId) || {useAI: true, count: 10};
            const convHist = await coll.findOne({ _id: new ObjectId(convId) });
            //log('convHist is', convHist);

            if (convHist.count>=aiSet.count){
                return{
                    role: "assistant", content: "Max conversation reached"
                };
            }
            const aiCredentials = await getAISettings("system") || {key: null, url: null, model: null};
            //console.log(`credentials at ${domainId} is ${aiCredentials.key} ${aiCredentials.url} ${aiCredentials.model}`);
            if (!aiCredentials.key || !aiCredentials.url || !aiCredentials.model) {
                return {role: "assistant", content:"AI credentials not found", timestamp: Date.now()};
            }
            const problem = await collProblem.findOne({pid:convHist.problemId})
            //console.log('problem is', problem);
            if (!problem) throw new Error('Problem not found');
            const description = JSON.parse(problem.content).zh;
            //console.log('description is', description);     


            const systemMessage = {role:"system", content:JSON.stringify(`You are an expert assistant that helps with code analysis and debugging. Be precise and concise. Here's the problem description:`+ 
                description+
                `User's code or input:`  + code + `User's current selected code language is: ` + codeLang +`, so please use the selected code language to provide assistance. 你的回答语言和用户使用的语言相同`)};

            //console.log("systemMessage is ", systemMessage)

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

            //console.log("request body is ", requestBody)
            
            let fullRequstBody = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${aiCredentials.key}`
                },
                body: requestBody
            }

           //console.log('fullRequstBody is ', JSON.stringify(fullRequstBody))

            try {
                const response = await fetch(aiCredentials.url, fullRequstBody);
            
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
                }
            
                const data = await response.json();
                const message = { role: "assistant", content: data.choices[0].message.content, timestamp: Date.now()};
                //log(message)
                return message;
            
            } catch (error) {
                throw new Error(`Failed to get AI response: ${error.message}`);
            }
    }
}