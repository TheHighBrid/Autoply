import type { ApplicationState } from "@autoply/domain";
const allowed: Record<ApplicationState, ApplicationState[]> = {
 discovered:["scored","withdrawn"], scored:["queued","withdrawn"], queued:["materials_ready","withdrawn"],
 materials_ready:["ready_to_apply","withdrawn"], ready_to_apply:["in_progress","withdrawn"],
 in_progress:["human_handoff","submission_unverified","submitted","failed"], human_handoff:["in_progress","failed","withdrawn"],
 submission_unverified:["submitted","failed","human_handoff"], submitted:["interview","rejected","withdrawn"],
 failed:["queued","withdrawn"], withdrawn:[], rejected:[], interview:["offer","rejected","withdrawn"], offer:["withdrawn"]
};
export function assertTransition(from: ApplicationState,to: ApplicationState): void { if(!allowed[from].includes(to)) throw new Error(`Illegal application transition: ${from} -> ${to}`); }
export function canTransition(from: ApplicationState,to: ApplicationState): boolean { return allowed[from].includes(to); }
