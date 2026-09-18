export function code(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="BLACK-";for(let i=0;i<4;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
export function token(){return crypto.randomUUID()+"-"+crypto.randomUUID()}
