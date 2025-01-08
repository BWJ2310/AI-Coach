import { db, ObjectId, Types, Filter } from 'hydrooj';

export const TYPE_AI_CONV: 80 = 80;
const coll = db.collection('ai_conv');
const settingsColl = db.collection('ai_settings');

export interface AIConvDoc {
    _id: ObjectId;  // Changed from docId to _id to match MongoDB convention
    docType: 80;
    domainId: string;
    uid: number;
    problemId: string;
    count: number;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: number;
    }>;
}

declare module 'hydrooj' {
    interface Model {
        aiConv: typeof AIConvModel;
    }
    interface DocType {
        [TYPE_AI_CONV]: AIConvDoc;
    }
}

export class AIConvModel {
    static async add(
        uid: number, 
        problemId: string, 
        domainId: string,
    ): Promise<ObjectId> {
        const payload = {
            docType: TYPE_AI_CONV,
            uid,
            problemId,
            domainId,
            count: 0,
            messages: [{ 
                role: "assistant", 
                content: "hello, how can I help you with?", 
                timestamp: Date.now() 
            }],
        };
        
        const result = await coll.insertOne(payload);
        return result._id;
    }

    static async check(domainId: string): Promise<AIConvDoc> {
        const credentials = settingsColl.findOne({ domainId });
        return credentials.useAI
    }

    static async get(uid: number, problemId: string, domainId: string): Promise<AIConvDoc> {
        return await coll.findOne({ uid, problemId, domainId });
    }

    static async edit(did: ObjectId, message: {role: string, content: string}): Promise<AIConvDoc> {
        const newMessage = {
            role: message.role,
            content: message.content,
            timestamp: Date.now()
        };
        
        const result = await coll.findOneAndUpdate(
            { _id: did },
            { $push: { messages: newMessage } },
            { returnDocument: 'after' }
        );
        
        return result.value;
    }

    static async inc(did: ObjectId, count: number): Promise<AIConvDoc> {
        const result = await coll.findOneAndUpdate(
            { _id: did },
            { $inc: { count: count } },
            { returnDocument: 'after' }
        );
        
        return result.value;
    }

    static getMulti(domainId: string, query: Filter<AIConvDoc> = {}) {
        return coll.find({ 
            domainId,
            ...query 
        }).sort({ _id: -1 });
    }
}