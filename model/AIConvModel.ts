import { db, Context, Handler,ObjectId,  DocumentModel, Filter,  PRIV, param, Types,  PERM, } from 'hydrooj';

export const TYPE_AI_CONV: 80 = 80;


export interface AIConvDoc {
    docId: ObjectId;
    docType: 80;
    domainId: string;
    uid: number;
    problemId: string;
    count:number;
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
    // blog creation
    static async add(
        uid: number, problemId: string, domainId: string,
    ): Promise<ObjectId> {
        const payload: Partial<AIConvDoc> = {
            uid,
            problemId,
            domainId,
            count:0,
            messages:[{ role: "assistant", content: "hello, how can I help you with?", timestamp: Date.now(), }],
        };
        const res = await DocumentModel.add(
            payload.uid!, payload.problemId!, payload.domainId!, 0, payload.messages!, TYPE_AI_CONV,
             _.omit(payload, ['domainId', 'content', 'owner', 'count', 'messages']),
        );
        payload.docId = res;
        return payload.docId;
    }

    // conversation retrieval
    static async get(did: ObjectId): Promise<AIConvDoc> {
        return await DocumentModel.get(TYPE_AI_CONV, did);
    }

    // add new message
    static async edit(did: ObjectId, message: Types.Array): Promise<AIConvDoc> {
        let convHistory = await DocumentModel.get(TYPE_AI_CONV, did);
        const  payload =  {messages: convHistory.messages.push({ fole: message.role, content: message.content, timestamp: Date.now() })};
        return DocumentModel.set(TYPE_AI_CONV, did, payload);
    }

    // conversation count
    static inc(did: ObjectId, count: number): Promise<AIConvDoc> {
        return DocumentModel.inc(TYPE_AI_CONV, did, count, 1);
    }


    // get multiple conversation from a user
    static getMulti(domainId:string, query: Filter<AIConvDoc> = {}) {
        return DocumentModel.getMulti(domainId, TYPE_AI_CONV, query)
            .sort({ _id: -1 });
    }
}


