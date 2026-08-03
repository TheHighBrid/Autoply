import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import type { CandidateProfile, CanonicalJob } from "@autoply/domain";

export interface SubmissionPolicy {
  mode: "review" | "automatic";
  maxApplicationsPerDay: number;
  requireEvidence: true;
}

export interface AutoplyConfig {
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  candidate: CandidateProfile;
  policy: SubmissionPolicy;
}

export interface ProfileInput {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  region?: string;
  country: string;
  targetTitles: string[];
  locations: string[];
  remote: boolean;
  skills: string[];
  workAuthorization: string;
  requiresSponsorship: boolean;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface ValidationResult { valid: boolean; errors: string[]; }
export interface AutoplyPaths { home: string; profile: string; jobs: string; artifacts: string; sessions: string; }

const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==="object"&&value!==null&&!Array.isArray(value);
const strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(item=>typeof item==="string"&&item.trim().length>0);
const nonEmpty=(value:unknown):value is string=>typeof value==="string"&&value.trim().length>0;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function resolveAutoplyPaths(homeOverride?:string):AutoplyPaths{
 const home=resolve(homeOverride??process.env.AUTOPLY_HOME??join(homedir(),".autoply"));
 return {home,profile:join(home,"profile.json"),jobs:join(home,"jobs"),artifacts:join(home,"artifacts"),sessions:join(home,"sessions")};
}

export function createConfig(input:ProfileInput,now=new Date()):AutoplyConfig{
 const timestamp=now.toISOString();
 const id=`candidate-${createHash("sha256").update(input.email.trim().toLowerCase()).digest("hex").slice(0,12)}`;
 return {
  schemaVersion:1,createdAt:timestamp,updatedAt:timestamp,
  candidate:{
   id,
   identity:{fullName:input.fullName.trim(),email:input.email.trim().toLowerCase(),phone:input.phone?.trim()||undefined,city:input.city?.trim()||undefined,region:input.region?.trim()||undefined,country:input.country.trim(),linkedinUrl:input.linkedinUrl?.trim()||undefined,portfolioUrl:input.portfolioUrl?.trim()||undefined},
   facts:{skills:input.skills.map(v=>v.trim()).filter(Boolean),workAuthorization:input.workAuthorization.trim(),requiresSponsorship:input.requiresSponsorship},
   preferences:{titles:input.targetTitles.map(v=>v.trim()).filter(Boolean),locations:input.locations.map(v=>v.trim()).filter(Boolean),remote:input.remote},
   answerBank:{
    work_authorization:{answer:input.workAuthorization.trim(),verifiedAt:timestamp,source:"candidate"},
    requires_sponsorship:{answer:input.requiresSponsorship?"Yes":"No",verifiedAt:timestamp,source:"candidate"}
   },
   resumes:[]
  },
  policy:{mode:"review",maxApplicationsPerDay:10,requireEvidence:true}
 };
}

export function validateConfig(value:unknown):ValidationResult{
 const errors:string[]=[];
 if(!isRecord(value))return {valid:false,errors:["config must be an object"]};
 if(value.schemaVersion!==1)errors.push("schemaVersion must be 1");
 const candidate=value.candidate;
 if(!isRecord(candidate))errors.push("candidate must be an object");
 else {
  if(!nonEmpty(candidate.id))errors.push("candidate.id is required");
  const identity=candidate.identity;
  if(!isRecord(identity))errors.push("candidate.identity must be an object");
  else {
   if(!nonEmpty(identity.fullName))errors.push("candidate.identity.fullName is required");
   if(!nonEmpty(identity.email)||!emailPattern.test(identity.email))errors.push("candidate.identity.email must be valid");
   if(!nonEmpty(identity.country))errors.push("candidate.identity.country is required");
  }
  if(!isRecord(candidate.facts))errors.push("candidate.facts must be an object");
  const preferences=candidate.preferences;
  if(!isRecord(preferences))errors.push("candidate.preferences must be an object");
  else {
   if(!strings(preferences.titles)||preferences.titles.length===0)errors.push("candidate.preferences.titles must contain at least one title");
   if(!strings(preferences.locations)||preferences.locations.length===0)errors.push("candidate.preferences.locations must contain at least one location");
   if(preferences.remote!==undefined&&typeof preferences.remote!=="boolean")errors.push("candidate.preferences.remote must be boolean");
  }
  if(!isRecord(candidate.answerBank))errors.push("candidate.answerBank must be an object");
  if(!Array.isArray(candidate.resumes))errors.push("candidate.resumes must be an array");
 }
 const policy=value.policy;
 if(!isRecord(policy))errors.push("policy must be an object");
 else {
  if(policy.mode!=="review"&&policy.mode!=="automatic")errors.push("policy.mode must be review or automatic");
  if(typeof policy.maxApplicationsPerDay!=="number"||!Number.isInteger(policy.maxApplicationsPerDay)||policy.maxApplicationsPerDay<1||policy.maxApplicationsPerDay>100)errors.push("policy.maxApplicationsPerDay must be an integer from 1 to 100");
  if(policy.requireEvidence!==true)errors.push("policy.requireEvidence must remain true");
 }
 return {valid:errors.length===0,errors};
}

export async function ensureAutoplyHome(paths:AutoplyPaths):Promise<void>{
 for(const directory of [paths.home,paths.jobs,paths.artifacts,paths.sessions]){await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);}
}

export async function saveConfig(config:AutoplyConfig,paths=resolveAutoplyPaths()):Promise<void>{
 const validation=validateConfig(config);if(!validation.valid)throw new Error(`Invalid Autoply config\n- ${validation.errors.join("\n- ")}`);
 await ensureAutoplyHome(paths);
 const next={...config,updatedAt:new Date().toISOString()};
 const temp=`${paths.profile}.${process.pid}.tmp`;
 await writeFile(temp,`${JSON.stringify(next,null,2)}\n`,{encoding:"utf8",mode:0o600});
 await rename(temp,paths.profile);await chmod(paths.profile,0o600);
}

export async function loadConfig(paths=resolveAutoplyPaths()):Promise<AutoplyConfig>{
 const parsed:unknown=JSON.parse(await readFile(paths.profile,"utf8"));
 const validation=validateConfig(parsed);if(!validation.valid)throw new Error(`Invalid Autoply config\n- ${validation.errors.join("\n- ")}`);
 return parsed as unknown as AutoplyConfig;
}

export function redactConfig(config:AutoplyConfig):AutoplyConfig{
 const identity=config.candidate.identity;
 if(!identity)return config;
 const [local,domain]=identity.email.split("@");
 const email=domain?`${local.slice(0,2)}***@${domain}`:"***";
 const phone=identity.phone?`${identity.phone.slice(0,3)}***${identity.phone.slice(-2)}`:undefined;
 return {...config,candidate:{...config.candidate,identity:{...identity,email,phone}}};
}

export function validateCanonicalJob(value:unknown):ValidationResult{
 const errors:string[]=[];
 if(!isRecord(value))return {valid:false,errors:["job must be an object"]};
 for(const key of ["id","source","sourceJobId","canonicalUrl","company","title","description","fingerprint","discoveredAt"]){if(!nonEmpty(value[key]))errors.push(`job.${key} is required`);}
 return {valid:errors.length===0,errors};
}

export async function loadCanonicalJob(path:string):Promise<CanonicalJob>{
 const parsed:unknown=JSON.parse(await readFile(resolve(path),"utf8"));
 const validation=validateCanonicalJob(parsed);if(!validation.valid)throw new Error(`Invalid job file\n- ${validation.errors.join("\n- ")}`);
 return parsed as unknown as CanonicalJob;
}

export async function importCanonicalJob(path:string,paths=resolveAutoplyPaths()):Promise<string>{
 const job=await loadCanonicalJob(path);await ensureAutoplyHome(paths);
 const destination=join(paths.jobs,`${job.id.replace(/[^a-zA-Z0-9._-]/g,"-")}.json`);
 await mkdir(dirname(destination),{recursive:true});await writeFile(destination,`${JSON.stringify(job,null,2)}\n`,{encoding:"utf8",mode:0o600});await chmod(destination,0o600);return destination;
}
