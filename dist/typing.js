/* Reset unmatched answers after idle time, without deleting a newer edit or valid prefix. */
(function(root){
class IdleAnswerReset{
constructor({getValue,isActive,shouldClear,onClear,clock=()=>Date.now(),setTimer=(fn,ms)=>root.setTimeout(fn,ms),clearTimer=id=>root.clearTimeout(id),delay=800}){Object.assign(this,{getValue,isActive,shouldClear,onClear,clock,setTimer,clearTimer,delay});this.generation=0;this.lastEdit=clock();}
cancel(){this.generation++;this.clearTimer(this.timer);this.timer=null;}
edit(){this.cancel();this.lastEdit=this.clock();}
arm(){this.clearTimer(this.timer);const value=this.getValue(),generation=this.generation;if(!value.trim())return;this.timer=this.setTimer(()=>{this.timer=null;if(generation===this.generation&&this.isActive()&&this.getValue()===value&&this.shouldClear(value)){this.onClear();this.generation++;}},Math.max(0,this.delay-(this.clock()-this.lastEdit)));}
}
function routePhysicalKey({active,composing=false,shortcut=false,nativeAnswer=false,otherEditable=false,onButton=false,key,prevented=false}){if(!active||composing||shortcut||nativeAnswer||otherEditable||prevented)return false;if(onButton&&['Enter',' '].includes(key))return false;return /^[a-z0-9]$/i.test(key)||['Backspace','Delete','Enter'].includes(key);}
root.InkTyping={IdleAnswerReset,routePhysicalKey};if(typeof module!=='undefined')module.exports=root.InkTyping;
})(typeof window!=='undefined'?window:globalThis);
