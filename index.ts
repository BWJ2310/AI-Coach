import { db, Context, Handler, ObjectId, DocumentModel, Filter, PRIV, param, Types, PERM } from 'hydrooj';
import { AISettingsHandler } from './handler/AISettingsHandler';
import { ConvHistHandler, AIMessageHandler } from './handler/coachHandler';
import {ProblemDetailHandler} from 'hydrooj/src/handler/problem';
import {AIConvModel} from './model/AIConvModel';
import {AIConvDoc} from './model/AIConvModel';



async function getConversation(uid, problemId, doaminId) {
    var aiConvHist
    console.log('geting  Ai Conversation for',  uid, problemId, doaminId);
     try {
        
                aiConvHist = await AIConvModel.get(uid, problemId, doaminId);
                if (!aiConvHist) {
                    aiConvHist = await AIConvModel.add(uid, problemId, doaminId);
                }
                return aiConvHist;
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
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



export async function apply(ctx: Context) {
    const originalGet = ProblemDetailHandler.prototype.get;
    
    ProblemDetailHandler.prototype.get = async function (...args) {
        // Call the original get method first
        await originalGet.apply(this, args);

        try {
            const uid = this.user._id;
            const domainId = this.args.domainId;
            const pid = this.pdoc.pid;
            
            // Add a loading flag to response
            this.response.body.isLoadingConversation = true;
            
            // Wait for conversation data
            var aiConvHist = await getConversation(uid, pid, domainId);
            
            // Add retry logic if data is not ready
            let retries = 3;
            while (!aiConvHist && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                aiConvHist = await getConversation(uid, pid, domainId);
                retries--;
            }
            
            // Update response with conversation data
            this.response.body.isLoadingConversation = false;
            this.response.body.aiConvHist = aiConvHist;
            
        } catch (error) {
            console.error("Error fetching conversation:", error);
            this.response.body.isLoadingConversation = false;
            this.response.body.aiConvHist = null;
        }
    
    };

    ProblemDetailHandler.prototype.getAiResponse = async function(...args){
    }

    // Add routes only for settings
    ctx.Route('ai_coach_settings', '/ai_settings', AISettingsHandler);
    ctx.Route('ai_chat', `/ai_coach/:convId`,  AIMessageHandler, PRIV.PRIV_USER_PROFILE);

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


}