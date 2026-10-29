/* Native radio choices keep every default visible and keyboard accessible. */
(function(root){
const DEFAULT_SETUP={control:'type',skill:'numbers',speed:'steady',duration:0,keyboard:'auto',range:100,level:3,accent:'en-GB',personalOnly:false,progressive:true,music:true,sound:true};
const DEFAULTS_VERSION=6;
function choiceValue(name,scope=document){return scope.querySelector(`[name="${name}"]:checked`)?.value||'';}
function setChoice(name,value,scope=document){for(const input of scope.querySelectorAll(`[name="${name}"]`))input.checked=String(input.value)===String(value);}
function applySetup(values,form){for(const [name,value]of Object.entries(values)){const fields=[...form.querySelectorAll(`[name="${name}"]`)];if(fields[0]?.type==='radio'){if(fields.some(f=>f.value===String(value)))setChoice(name,value,form)}else if(fields[0]?.type==='checkbox')fields[0].checked=!!value;}}
root.InkChoices={DEFAULT_SETUP,DEFAULTS_VERSION,choiceValue,setChoice,applySetup};if(typeof module!=='undefined')module.exports=root.InkChoices;
})(typeof window!=='undefined'?window:globalThis);
