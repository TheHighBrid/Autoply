export type GateDecision = { decision:"allow"|"handoff"|"deny"; reasons:string[] };
export interface ApplyIntent { autoSubmit:boolean; answers:Array<{question:string;answer:string;source?:"candidate"|"document"|"generated"}>; hasCaptcha:boolean; hasMfa:boolean; termsAccepted:boolean; }
export function evaluateApplyIntent(i:ApplyIntent):GateDecision {
 const reasons:string[]=[];
 if(i.answers.some(a=>a.source==="generated")) reasons.push("unverified_answer");
 if(i.hasCaptcha) reasons.push("captcha_present");
 if(i.hasMfa) reasons.push("mfa_required");
 if(!i.termsAccepted) return {decision:"deny",reasons:["terms_not_accepted"]};
 if(reasons.length) return {decision:"handoff",reasons};
 return {decision:"allow",reasons:[]};
}
