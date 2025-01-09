import { db, ObjectId, Types, Filter } from 'hydrooj';

export const TYPE_AI_SET: 90 = 90;
const coll = db.collection('ai_coach_settings');

export interface AISetDoc {
    _id: ObjectId;  // Changed from docId to _id to match MongoDB convention
    docType: 90;
    domainId: string;
    useAI: boolean;
    count: number;
    key: string;
    url: string;
    model: string;
    uid:string;
}

declare module 'hydrooj' {
    interface Model {
        aiSet: typeof AISetModel;
    }
    interface DocType {
        [TYPE_AI_SET]: AISetDoc;
    }
}

export class AISetModel {
    static async add( 
        domainId: string
    ): Promise<ObjectId> {
        const payload = {
            docType: TYPE_AI_SET,
            domainId,
            count: 10,
            key:'',
            url:'',
            model:''
        };
        
        const result = await coll.insertOne(payload);
        return result;
    }

    static async get(domainId: string ): Promise<AISetDoc> {
        let credentials = await coll.findOne({domainId});
        if (!credentials){
            credentials = AISetModel.add(domainId )
        }
        return credentials
    }

    static async set(domainId: string, useAI:boolean, count:number, key:string, url:string, model:string ): Promise<AISetDoc> {
        const result = await coll.findOneAndUpdate(
            { domainId: domainId },
            { useAI:useAI, count:count, key:key, url:url, model:model },
            { returnDocument: 'after' }
        );
        return result.value;
    }
}