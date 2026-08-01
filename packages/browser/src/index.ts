export interface RetainedSession { id:string; browser:"chromium"|"firefox"; profileDir:string; createdAt:string; lastValidatedAt?:string; encrypted:boolean; }
export interface BrowserRunContext { runId:string; session:RetainedSession; startedAt:string; artifactDir:string; }
export interface BrowserDriver {
 open(ctx:BrowserRunContext,url:string):Promise<void>;
 screenshot(ctx:BrowserRunContext,name:string):Promise<string>;
 content(ctx:BrowserRunContext):Promise<string>;
 currentUrl(ctx:BrowserRunContext):Promise<string>;
 close(ctx:BrowserRunContext):Promise<void>;
}
