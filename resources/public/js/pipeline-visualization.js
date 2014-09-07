var triggerManualStep = function(triggerId){
  $.ajax({url:"/api/dynamic/"+triggerId, type:"POST"}).done(function(data) {
    alert("triggered");
  });
}

var updateServerState = function() {
  $.ajax({url:"/api/pipeline-state"}).done(function(data) {
    $("li").removeClass("status-running");
    $("li").removeClass("status-finished");
    // TODO: clear all status
    data.running.forEach(function(stepid) {
      findByStepId(stepid).data("status","running");
    })

    data.finished.forEach(function(stepid) {
      var stepResult = data.results[idToBrittleStringRepresentation(stepid)]
      var stepElem = findByStepId(stepid);
      stepElem.data("status",stepResult.status);
      stepElem.data("output",stepResult.out);
      var triggerId = stepResult["trigger-id"];
      if (triggerId) {
        stepElem.off();
        stepElem.on("click",function() {
          triggerManualStep(triggerId);
        })
      }


    })


    setTimeout(updateServerState,500);
  })
}

var idToBrittleStringRepresentation = function(id) {
  // this takes a proper array-like id like [0,1,0] and converts it into a string like this: "(0 1 0)"
  // because this is what my hacked-together pipeline-state-representation currently outputs as json-keys for results
  return "("+id.join(" ")+")";
}

var findByStepId = (function() {
  return function(stepid) {
    var curPos = $("#pipeline");
    do {
      var idx = stepid.pop()-1;
      curPos = $(curPos.children("ol, ul").children("li").get(idx))
    } while (stepid.length > 0)
    return curPos;
  }
})()

var pipelineHtml = (function(){

  var renderStep = function(step) {
    var stepResult = "";
    if (step.type === "parallel") {
      stepResult = step.name+"<ul>"+step.children.map(renderStep).join("")+"</ul>";
    } else if (step.type === "container") {
      stepResult = step.name+"<ol>"+step.children.map(renderStep).join("")+"</ol>";
    } else {
      stepResult = step.name
    }

    return "<li>"+stepResult+"</li>";
  }

  return function(pipeline) {
    var result = "<ol>";

    result += pipeline.map(renderStep).join("");

    result+="</ol>";
    return result;
  }
})()