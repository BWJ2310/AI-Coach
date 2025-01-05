import { db, Context, Handler, PRIV, param, Types,  PERM, } from 'hydrooj';
const coll = db.collection('ai_coach_settings');

// Helper functions similar to swiper addon
export async function getAISettings(domainId: string) {
    const data = await coll.findOne({ domainId });
    if (!data) return null;
    return {
        key: data.key,
        url: data.url,
        model: data.model
    };
}