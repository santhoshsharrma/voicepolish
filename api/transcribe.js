const hits=new Map();
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const key=process.env.GROQ_API_KEY;
 if(!key)return res.status(500).json({error:'Server is not configured (missing GROQ_API_KEY).'});
 const ip=(req.headers['x-forwarded-for']||'').split(',')[0]||'x',now=Date.now();
 const h=(hits.get(ip)||[]).filter(t=>now-t<60000);
 if(h.length>=10)return res.status(429).json({error:'Too many requests. Wait a minute.'});
 h.push(now);hits.set(ip,h);
 let buf=Buffer.isBuffer(req.body)?req.body:null;
 if(!buf){const c=[];let n=0;for await(const x of req){n+=x.length;if(n>4.4e6)return res.status(413).json({error:'Recording too large.'});c.push(x)}buf=Buffer.concat(c)}
 if(buf.length<500||buf.length>4.4e6)return res.status(400).json({error:'Invalid recording.'});
 const ct=String(req.headers['x-audio-type']||'audio/webm').toLowerCase();
 const ext=ct.includes('mp4')?'mp4':ct.includes('ogg')?'ogg':'webm';
 const fd=new FormData();
 fd.append('file',new Blob([buf],{type:ct.split(';')[0]}),'audio.'+ext);
 fd.append('model',process.env.STT_MODEL||'whisper-large-v3-turbo');
 fd.append('response_format','json');fd.append('temperature','0');
 try{
  const r=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{authorization:'Bearer '+key},body:fd});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return res.status(502).json({error:'Transcription provider error: '+((d.error&&d.error.message)||r.status)});
  res.status(200).json({text:d.text||''});
 }catch(e){res.status(502).json({error:'Could not reach transcription provider.'})}
};
