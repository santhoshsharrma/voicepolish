const PR={
 professional:'Rewrite for workplace communication: clear, courteous, professional.',
 casual:'Rewrite so it sounds natural and conversational.',
 concise:'Remove repetition and filler; keep every important fact. Be brief.',
 email:'Turn it into a well-structured email with a subject line, greeting, body and sign-off (use a placeholder name only if none is given).'
};
const hits=new Map();
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const key=process.env.GROQ_API_KEY;
 if(!key)return res.status(500).json({error:'Server is not configured (missing GROQ_API_KEY).'});
 const ip=(req.headers['x-forwarded-for']||'').split(',')[0]||'x',now=Date.now();
 const h=(hits.get(ip)||[]).filter(t=>now-t<60000);
 if(h.length>=10)return res.status(429).json({error:'Too many requests. Wait a minute.'});
 h.push(now);hits.set(ip,h);
 const{text,style}=req.body||{};
 if(typeof text!=='string'||!text.trim()||text.length>8000||!PR[style])return res.status(400).json({error:'Invalid request.'});
 const prompt='You are a careful editor. '+PR[style]+'\nRules: keep the speaker’s meaning and every factual detail; apply self-corrections (use the final version); remove filler; never invent facts, names, dates or commitments. Output only the rewritten text, no commentary.\n\nTranscript:\n'+text;
 try{
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'authorization':'Bearer '+key,'content-type':'application/json'},
   body:JSON.stringify({model:process.env.MODEL||'llama-3.3-70b-versatile',max_tokens:1200,temperature:0.3,messages:[{role:'user',content:prompt}]})});
  const d=await r.json();
  if(!r.ok)return res.status(502).json({error:'AI provider error: '+(d.error&&d.error.message||r.status)});
  res.status(200).json({text:(d.choices[0].message.content||'').trim()});
 }catch(e){res.status(502).json({error:'Could not reach AI provider.'})}
};
