import type { BrowserRunContext } from "@autoply/browser";
import type { CandidateProfile, CanonicalJob } from "@autoply/domain";
export interface AdapterCapabilities { discover:boolean; fill:boolean; upload:boolean; submit:boolean; confirmation:boolean; retainedSession:boolean; }
export interface FieldPlan { fields:Array<{key:string;selector:string;value:string;sensitive?:boolean}>; uploads:Array<{selector:string;path:string;sha256:string}>; unresolvedQuestions:string[]; }
export interface ApplyResult { status:"submitted"|"submission_unverified"|"handoff"|"failed"; confirmationText?:string; confirmationId?:string; finalUrl:string; reason?:string; }
export interface AtsAdapter {
 readonly name:string; readonly version:string; readonly capabilities:AdapterCapabilities;
 supports(url:string):boolean;
 inspect(ctx:BrowserRunContext,job:CanonicalJob,profile:CandidateProfile):Promise<FieldPlan>;
 fill(ctx:BrowserRunContext,plan:FieldPlan):Promise<void>;
 submit(ctx:BrowserRunContext):Promise<ApplyResult>;
}
export class AdapterRegistry { private items:AtsAdapter[]=[]; register(a:AtsAdapter){this.items.push(a);} resolve(url:string){const a=this.items.find(x=>x.supports(url)); if(!a) throw new Error(`No adapter for ${url}`); return a;} }
