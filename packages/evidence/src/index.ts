import { createHash } from "node:crypto";
import type { EvidenceArtifact, SubmissionEvidence } from "@autoply/domain";
export const sha256=(value:string|Buffer)=>createHash("sha256").update(value).digest("hex");
export function certify(input:Omit<SubmissionEvidence,"manifestSha256">):SubmissionEvidence {
 const canonical=JSON.stringify({...input,artifacts:[...input.artifacts].sort((a,b)=>a.path.localeCompare(b.path))});
 return {...input,manifestSha256:sha256(canonical)};
}
export function isSubmissionEvidenceSufficient(e:SubmissionEvidence):boolean {
 const kinds=new Set(e.artifacts.map(a=>a.kind));
 return Boolean(e.finalUrl && e.submittedAt && e.adapter.name && kinds.has("screenshot") && kinds.has("field_manifest") && (e.confirmationText||e.confirmationId));
}
export function artifact(kind:EvidenceArtifact["kind"],path:string,contents:string,redacted=true):EvidenceArtifact { return {kind,path,sha256:sha256(contents),capturedAt:new Date().toISOString(),redacted}; }
