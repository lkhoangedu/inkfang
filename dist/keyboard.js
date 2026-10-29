/* Compact game keys share the normal typing / auto-fire path. */
(function(root){
function usesGameKeys(config,{touch=false}={}){return config.control==='type'&&(config.keyboard==='game'||(config.keyboard!=='device'&&touch));}
function rowsFor(skill){const digits=[...'1234567890'];if(skill==='numbers')return[[...digits.slice(0,5),'Backspace'],[...digits.slice(5),'Clear']];const letters=[[...'QWERTYUIOP'],[...'ASDFGHJKL'],[...'ZXCVBNM','Backspace','Clear']];return skill==='mixed'?[digits,...letters]:letters;}
function editValue(value,key,skill){if(key==='Backspace')return value.slice(0,-1);if(key==='Clear'||key==='Delete')return'';if(key.length!==1)return value;const char=key.toUpperCase(),allowed=skill==='numbers'?/^[0-9]$/:skill==='mixed'?/^[A-Z0-9]$/:/^[A-Z]$/;return allowed.test(char)?(value+char).slice(0,24):value;}
class GameKeyboard{
constructor(container,onKey,{clock=()=>Date.now()}={}){this.container=container;this.onKey=onKey;this.clock=clock;this.disabled=true;this.firedAt=0;this.firedKey='';
// Keys fire on touch-down so an answer is not delayed by the release half of a tap; the paired click is skipped.
container.onpointerdown=e=>{const b=e.target.closest?.('button[data-key]');if(e.target.closest?.('button'))e.preventDefault();if(b&&!this.disabled&&(e.button===undefined||e.button===0)){this.firedKey=b.dataset.key;this.firedAt=this.clock();this.onKey(b.dataset.key)}};container.onclick=e=>{const b=e.target.closest('button[data-key]');if(!b||this.disabled)return;if(b.dataset.key===this.firedKey&&this.clock()-this.firedAt<600){this.firedKey='';return}this.onKey(b.dataset.key)};}
configure({enabled,skill}){this.container.hidden=!enabled;this.container.replaceChildren();if(!enabled)return;this.container.dataset.layout=skill==='numbers'?'numbers':skill==='mixed'?'mixed':'letters';for(const keys of rowsFor(skill)){const row=document.createElement('div');row.className='game-key-row';for(const key of keys){const b=document.createElement('button');b.type='button';b.dataset.key=key;b.textContent=key==='Backspace'?'⌫':key==='Clear'?'Clear':key;b.setAttribute('aria-label',key==='Backspace'?'Delete last character':key==='Clear'?'Clear answer':`Type ${key}`);b.className='game-key'+(key.length>1?' action-key':'');b.disabled=this.disabled;row.append(b)}this.container.append(row)}}
setDisabled(value){this.disabled=value;this.container.querySelectorAll('button').forEach(b=>b.disabled=value)}
}
root.InkKeyboard={usesGameKeys,rowsFor,editValue,GameKeyboard};if(typeof module!=='undefined')module.exports=root.InkKeyboard;
})(typeof window!=='undefined'?window:globalThis);
