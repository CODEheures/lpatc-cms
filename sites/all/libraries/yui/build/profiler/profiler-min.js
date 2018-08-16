/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.8.1r2
*/
YAHOO.namespace("tool");YAHOO.tool.Profiler=function(){var container={},report={},stopwatches={},WATCH_STARTED=0,WATCH_STOPPED=1,WATCH_PAUSED=2,lang=YAHOO.lang;function createReport(name){report[name]={calls:0,max:0,min:0,avg:0,points:[]};}function saveDataPoint(name,duration){var functionData=report[name];if(!functionData){functionData=createReport(name);}functionData.calls++;functionData.points.push(duration);if(functionData.calls>1){functionData.avg=((functionData.avg*(functionData.calls-1))+duration)/functionData.calls;functionData.min=Math.min(functionData.min,duration);functionData.max=Math.max(functionData.max,duration);}else{functionData.avg=duration;functionData.min=duration;functionData.max=duration;}}return{clear:function(name){if(lang.isString(name)){delete report[name];delete stopwatches[name];}else{report={};stopwatches={};}},getOriginal:function(name){return container[name];},instrument:function(name,method){var newMethod=function(){var start=new Date(),retval=method.apply(this,arguments),stop=new Date();saveDataPoint(name,stop-start);return retval;};lang.augmentObject(newMethod,method);newMethod.__yuiProfiled=true;newMethod.prototype=method.prototype;container[name]=method;container[name].__yuiFuncName=name;createReport(name);return newMethod;},pause:function(name){var now=new Date(),stopwatch=stopwatches[name];if(stopwatch&&stopwatch.state==WATCH_STARTED){stopwatch.total+=(now-stopwatch.start);stopwatch.start=0;stopwatch.state=WATCH_PAUSED;}},start:function(name){if(container[name]){throw new Error("Cannot use '"+name+"' for profiling through start(), name is already in use.");}else{if(!report[name]){createReport(name);}if(!stopwatches[name]){stopwatches[name]={state:WATCH_STOPPED,start:0,total:0};}if(stopwatches[name].state==WATCH_STOPPED){stopwatches[name].state=WATCH_STARTED;stopwatches[name].start=new Date();}}},stop:function(name){var now=new Date(),stopwatch=stopwatches[name];if(stopwatch){if(stopwatch.state==WATCH_STARTED){saveDataPoint(name,stopwatch.total+(now-stopwatch.start));}else{if(stopwatch.state==WATCH_PAUSED){saveDataPoint(name,stopwatch.total);}}stopwatch.start=0;stopwatch.total=0;stopwatch.state=WATCH_STOPPED;}},getAverage:function(name){return report[name].avg;},getCallCount:function(name){return report[name].calls;},getMax:function(name){return report[name].max;},getMin:function(name){return report[name].min;},getFunctionReport:function(name){return report[name];},getReport:function(name){return report[name];},getFullReport:function(filter){filter=filter||function(){return true;};if(lang.isFunction(filter)){var fullReport={};for(var name in report){if(filter(report[name])){fullReport[name]=report[name];}}return fullReport;}},registerConstructor:function(name,owner){this.registerFunction(name,owner,true);},registerFunction:function(name,owner,registerPrototype){var funcName=(name.indexOf(".")>-1?name.substring(name.lastIndexOf(".")+1):name),method,prototype;if(!lang.isObject(owner)){owner=eval(name.substring(0,name.lastIndexOf(".")));}method=owner[funcName];prototype=method.prototype;if(lang.isFunction(method)&&!method.__yuiProfiled){owner[funcName]=this.instrument(name,method);container[name].__yuiOwner=owner;container[name].__yuiFuncName=funcName;if(registerPrototype){this.registerObject(name+".prototype",prototype);}}},registerObject:function(name,object,recurse){object=(lang.isObject(object)?object:eval(name));container[name]=object;for(var prop in object){if(typeof object[prop]=="function"){if(prop!="constructor"&&prop!="superclass"){this.registerFunction(name+"."+prop,object);}}else{if(typeof object[prop]=="object"&&recurse){this.registerObject(name+"."+prop,object[prop],recurse);}}}},unregisterConstructor:function(name){if(lang.isFunction(container[name])){this.unregisterFunction(name,true);}},unregisterFunction:function(name,unregisterPrototype){if(lang.isFunction(container[name])){if(unregisterPrototype){this.unregisterObject(name+".prototype",container[name].prototype);}var owner=container[name].__yuiOwner,funcName=container[name].__yuiFuncName;delete container[name].__yuiOwner;delete container[name].__yuiFuncName;owner[funcName]=container[name];delete container[name];}},unregisterObject:function(name,recurse){if(lang.isObject(container[name])){var object=container[name];for(var prop in object){if(typeof object[prop]=="function"){this.unregisterFunction(name+"."+prop);}else{if(typeof object[prop]=="object"&&recurse){this.unregisterObject(name+"."+prop,recurse);}}}delete container[name];}}};}();YAHOO.register("profiler",YAHOO.tool.Profiler,{version:"2.8.1r2",build:"19"});